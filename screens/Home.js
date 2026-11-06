import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  SectionList,
  Modal,
  Pressable,
  Linking,
  Vibration,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { homeStyles as styles, cardEsgotadoStyle } from '../styles';
import { supabase } from '../supabase';

export default function Home({ navigation }) {
  const [busca, setBusca] = useState('');
  const [modoVisao, setModoVisao] = useState('categoria');

  const [materiais, setMateriais] = useState([]);

  const [modalExcluirVisible, setModalExcluirVisible] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);

  const [modalEstoqueVisible, setModalEstoqueVisible] = useState(false);
  const [qtdMovimentacao, setQtdMovimentacao] = useState('');
  const [erroEstoque, setErroEstoque] = useState('');

  const regexApenasNumeros = /^\d+$/;

  // --- BUSCAR DADOS DO SUPABASE COM JOIN ---
  const carregarMateriais = async () => {
    try {
      const { data, error } = await supabase
        .from('GM_Materiais')
        .select(`
          IdMaterial,
          NmMaterial,
          DscMaterial,
          QtdMaterial,
          GM_Categorias ( NmCategoria ),
          GM_LOCAIS ( NmLocal )
        `);

      if (error) {
        console.log('Erro ao buscar do Supabase:', error.message);
        return;
      }

      if (data) {
        const dadosFormatados = data.map((item) => ({
          id: String(item.IdMaterial),
          nome: item.NmMaterial,
          descricao: item.DscMaterial,
          quantidade: item.QtdMaterial !== null ? Number(item.QtdMaterial) : 0,
          categoria: item.GM_Categorias?.NmCategoria || 'Geral',
          localizacao: item.GM_LOCAIS?.NmLocal || 'Sem Local',
        }));

        setMateriais(dadosFormatados);
      }
    } catch (err) {
      console.log('Erro de conexão:', err);
    }
  };

  // useFocusEffect garante que os dados recarreguem sempre que a tela ganha foco (volta do cadastro/edição)
  useFocusEffect(
    useCallback(() => {
      carregarMateriais();
    }, [])
  );

  const compartilharWhatsApp = (item) => {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    const dataAtual = `${dia}/${mes}/${ano}`;

    const categoriaTexto = item.categoria ? item.categoria : 'Geral';
    const mensagem = `*Inventário Dra. Luna*\n\nData: ${dataAtual}\n\nCategoria: ${categoriaTexto}\nMaterial: ${item.nome}\n\nEstoque atual: ${item.quantidade} unidades\nLocal: ${item.localizacao}`;
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(mensagem)}`);
  };

  const abrirModalEstoque = (item) => {
    setItemSelecionado(item);
    setQtdMovimentacao('');
    setErroEstoque('');
    setModalEstoqueVisible(true);
  };

  const confirmarMovimentacao = async (tipo) => {
    if (!regexApenasNumeros.test(qtdMovimentacao.trim())) {
      Vibration.vibrate(400);
      setErroEstoque('Digite apenas números inteiros válidos.');
      return;
    }

    const valor = parseInt(qtdMovimentacao.trim(), 10);
    if (valor <= 0) {
      Vibration.vibrate(400);
      setErroEstoque('A quantidade deve ser maior que zero.');
      return;
    }

    let novoSaldo = itemSelecionado.quantidade;
    if (tipo === 'entrada') {
      novoSaldo += valor;
    } else if (tipo === 'saida') {
      if (valor > itemSelecionado.quantidade) {
        Vibration.vibrate(400);
        setErroEstoque(
          `Saldo insuficiente! Tentou retirar ${valor}, mas só há ${itemSelecionado.quantidade} em estoque.`
        );
        return;
      }
      novoSaldo -= valor;
    }

    const { error } = await supabase
      .from('GM_Materiais')
      .update({ QtdMaterial: novoSaldo })
      .eq('IdMaterial', itemSelecionado.id);

    if (error) {
      console.log('Erro ao atualizar estoque:', error.message);
      return;
    }

    setModalEstoqueVisible(false);
    carregarMateriais();
  };

  const pedirConfirmacaoExclusao = (item) => {
    setItemSelecionado(item);
    setModalExcluirVisible(true);
  };

  const confirmarExclusao = async () => {
    if (itemSelecionado) {
      const { error } = await supabase
        .from('GM_Materiais')
        .delete()
        .eq('IdMaterial', itemSelecionado.id);

      if (!error) {
        carregarMateriais();
      }
    }
    setModalExcluirVisible(false);
    setItemSelecionado(null);
  };

  const listaSegura = materiais || [];
  const termo = busca.toLowerCase();

  const materiaisFiltrados = listaSegura.filter((item) => {
    const nome = (item.nome || '').toLowerCase();
    const local = (item.localizacao || '').toLowerCase();
    const cat = (item.categoria || 'Geral').toLowerCase();
    return nome.includes(termo) || local.includes(termo) || cat.includes(termo);
  });

  const secoesAgrupadas = [];
  materiaisFiltrados.forEach((item) => {
    const chaveGrupo =
      modoVisao === 'local'
        ? item.localizacao || 'Sem Local'
        : item.categoria || 'Geral';

    let secaoExistente = secoesAgrupadas.find((s) => s.title === chaveGrupo);
    if (!secaoExistente) {
      secaoExistente = { title: chaveGrupo, data: [] };
      secoesAgrupadas.push(secaoExistente);
    }
    secaoExistente.data.push(item);
  });

  const renderizarCardMaterial = ({ item }) => {
    const esgotado = item.quantidade === 0;

    return (
      <View style={esgotado ? cardEsgotadoStyle : styles.cardItem}>
        <View style={styles.cabecalhoCard}>
          <Text style={styles.nomeItem}>{item.nome}</Text>
          <View style={esgotado ? styles.pillEsgotado : styles.pillEstoque}>
            <Text
              style={
                esgotado ? styles.textoPillEsgotado : styles.textoPillEstoque
              }
            >
              {esgotado ? 'ESGOTADO (0)' : `${item.quantidade} un.`}
            </Text>
          </View>
        </View>

        {modoVisao !== 'categoria' ? (
          <Text style={styles.textoCategoria}>
            Categoria: {item.categoria || 'Geral'}
          </Text>
        ) : null}

        <Text style={styles.textoDetalhe}>
          {item.descricao ? item.descricao : 'Sem descrição cadastrada'}
        </Text>

        {modoVisao !== 'local' ? (
          <View style={styles.caixaLocal}>
            <Text style={styles.textoLocal}>Local: {item.localizacao}</Text>
          </View>
        ) : null}

        <Pressable
          style={styles.botaoMovimentar}
          onPress={() => abrirModalEstoque(item)}
        >
          <Text style={styles.textoBotaoMovimentar}>
            Movimentar Entrada / Saída
          </Text>
        </Pressable>

        <View style={styles.botoesLinha}>
          <Pressable
            style={styles.botaoWhats}
            onPress={() => compartilharWhatsApp(item)}
          >
            <Text style={styles.textoBotaoSecundarioCard}>WhatsApp</Text>
          </Pressable>

          <Pressable
            style={styles.botaoEditar}
            onPress={() =>
              navigation.navigate('Cadastro', { itemParaEditar: item })
            }
          >
            <Text style={styles.textoBotaoEditarCard}>Editar</Text>
          </Pressable>

          <Pressable
            style={styles.botaoExcluir}
            onPress={() => pedirConfirmacaoExclusao(item)}
          >
            <Text style={styles.textoBotaoExcluirCard}>Excluir</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalEstoqueVisible}
        onRequestClose={() => setModalEstoqueVisible(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCaixa}>
            <Text style={styles.modalTitulo}>Movimentar Estoque</Text>
            <Text style={styles.modalSubtitulo}>
              {itemSelecionado?.nome} - Saldo atual:{' '}
              <Text style={{ fontWeight: 'bold', color: '#0F172A' }}>
                {itemSelecionado?.quantidade} un.
              </Text>
            </Text>

            <TextInput
              style={styles.inputModal}
              placeholder="Digite a quantidade (ex: 10)"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={qtdMovimentacao}
              onChangeText={(texto) => {
                setQtdMovimentacao(texto);
                setErroEstoque('');
              }}
            />

            {erroEstoque !== '' ? (
              <Text style={styles.textoErro}>{erroEstoque}</Text>
            ) : null}

            <View style={styles.botoesLinhaModal}>
              <Pressable
                style={styles.botaoModalEntrada}
                onPress={() => confirmarMovimentacao('entrada')}
              >
                <Text style={styles.textoBotaoModalBranco}>+ Entrada</Text>
              </Pressable>

              <Pressable
                style={styles.botaoModalSaida}
                onPress={() => confirmarMovimentacao('saida')}
              >
                <Text style={styles.textoBotaoModalBranco}>- Saída</Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.botaoFecharModal}
              onPress={() => setModalEstoqueVisible(false)}
            >
              <Text style={styles.textoFechar}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalExcluirVisible}
        onRequestClose={() => setModalExcluirVisible(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCaixa}>
            <Text style={styles.modalTitulo}>Excluir Material</Text>
            <Text style={styles.modalTexto}>
              Tem certeza que deseja remover "{itemSelecionado?.nome}" do
              inventário?
            </Text>
            <View style={styles.botoesLinhaModal}>
              <Pressable
                style={styles.botaoModalCancelar}
                onPress={() => setModalExcluirVisible(false)}
              >
                <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.botaoModalSaida}
                onPress={confirmarExclusao}
              >
                <Text style={styles.textoBotaoModalBranco}>Sim, Excluir</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Pressable
        style={styles.botaoNovoMaterialTopo}
        onPress={() => navigation.navigate('Cadastro')}
      >
        <Text style={styles.textoBotaoNovoTopo}>+ Novo Material</Text>
      </Pressable>

      <TextInput
        style={styles.inputBusca}
        placeholder="Buscar por nome, categoria ou localização..."
        placeholderTextColor="#64748B"
        value={busca}
        onChangeText={setBusca}
      />

      <View style={styles.abasContainer}>
        <Pressable
          style={modoVisao === 'categoria' ? styles.abaAtiva : styles.abaInativa}
          onPress={() => setModoVisao('categoria')}
        >
          <Text
            style={
              modoVisao === 'categoria'
                ? styles.textoAbaAtiva
                : styles.textoAbaInativa
            }
          >
            Categorias
          </Text>
        </Pressable>

        <Pressable
          style={modoVisao === 'local' ? styles.abaAtiva : styles.abaInativa}
          onPress={() => setModoVisao('local')}
        >
          <Text
            style={
              modoVisao === 'local'
                ? styles.textoAbaAtiva
                : styles.textoAbaInativa
            }
          >
            Por Local
          </Text>
        </Pressable>

        <Pressable
          style={modoVisao === 'geral' ? styles.abaAtiva : styles.abaInativa}
          onPress={() => setModoVisao('geral')}
        >
          <Text
            style={
              modoVisao === 'geral'
                ? styles.textoAbaAtiva
                : styles.textoAbaInativa
            }
          >
            Geral
          </Text>
        </Pressable>
      </View>

      {modoVisao !== 'geral' ? (
        <SectionList
          sections={secoesAgrupadas}
          keyExtractor={(item, index) => item.id || String(index)}
          renderItem={renderizarCardMaterial}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section: { title, data } }) => (
            <View style={styles.headerCategoriaBox}>
              <Text style={styles.headerCategoriaTexto}>{title}</Text>
              <Text style={styles.headerCategoriaCount}>{data.length}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.listaVazia}>
              Seu inventário está vazio. Clique em "+ Novo Material" para começar.
            </Text>
          }
        />
      ) : (
        <FlatList
          data={materiaisFiltrados}
          keyExtractor={(item, index) => item.id || String(index)}
          renderItem={renderizarCardMaterial}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.listaVazia}>
              Seu inventário está vazio. Clique em "+ Novo Material" para começar.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}