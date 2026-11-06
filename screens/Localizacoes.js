import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  Modal,
  Pressable,
  Vibration,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { crudListaStyles as styles } from '../styles';
import { supabase } from '../supabase';

export default function Localizacoes() {
  const [localizacoes, setLocalizacoes] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [busca, setBusca] = useState('');

  const [modalCriarVisible, setModalCriarVisible] = useState(false);
  const [novaLocalizacao, setNovaLocalizacao] = useState('');
  const [erroCriar, setErroCriar] = useState('');

  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [localSelecionado, setLocalSelecionado] = useState(null);
  const [novoNomeEdicao, setNovoNomeEdicao] = useState('');
  const [erroEditar, setErroEditar] = useState('');

  const [modalAvisoVisible, setModalAvisoVisible] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState('');

  const [modalExcluirVisible, setModalExcluirVisible] = useState(false);

  // --- BUSCAR DADOS DO SUPABASE ---
  const carregarDados = async () => {
    try {
      // 1. Busca os locais da tabela GM_LOCAIS
      const { data: locaisData, error: erroLocais } = await supabase
        .from('GM_LOCAIS')
        .select('*');

      if (erroLocais) {
        console.log('Erro ao buscar locais:', erroLocais.message);
      } else if (locaisData) {
        const locaisFormatados = locaisData.map((loc) => ({
          id: String(loc.IdLocal),
          nome: loc.NmLocal,
        }));
        setLocalizacoes(locaisFormatados);
      }

      // 2. Busca os materiais para calcular a contagem de itens por local (Corrigido para 'IdMaterial' maiúsculo)
      const { data: matsData, error: erroMats } = await supabase
        .from('GM_Materiais')
        .select(`
          IdMaterial,
          NmMaterial,
          GM_LOCAIS ( NmLocal )
        `);

      if (!erroMats && matsData) {
        const matsFormatados = matsData.map((m) => ({
          id: String(m.IdMaterial),
          nome: m.NmMaterial,
          localizacao: m.GM_LOCAIS?.NmLocal || 'Sem Local',
        }));
        setMateriais(matsFormatados);
      }
    } catch (err) {
      console.log('Erro na conexão com o Supabase:', err);
    }
  };

  // useFocusEffect garante que os dados recarreguem sempre que a aba ganhar foco
  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const mostrarAvisoErro = (msg) => {
    Vibration.vibrate(400);
    setMensagemAviso(msg);
    setModalAvisoVisible(true);
  };

  const abrirModalCriar = () => {
    setNovaLocalizacao('');
    setErroCriar('');
    setModalCriarVisible(true);
  };

  // --- CRIAR LOCAL NO SUPABASE ---
  const confirmarCriacaoLocal = async () => {
    const nomeLimpo = novaLocalizacao.trim();
    if (nomeLimpo === '') {
      Vibration.vibrate(400);
      setErroCriar('Digite o nome da localização física.');
      return;
    }

    const jaExiste = localizacoes.some(
      (loc) => loc.nome.toLowerCase() === nomeLimpo.toLowerCase()
    );
    if (jaExiste) {
      Vibration.vibrate(400);
      setErroCriar('Já existe uma localização cadastrada com este nome.');
      return;
    }

    const { error } = await supabase
      .from('GM_LOCAIS')
      .insert([{ NmLocal: nomeLimpo }]);

    if (error) {
      mostrarAvisoErro('Erro ao salvar local no banco: ' + error.message);
      return;
    }

    setModalCriarVisible(false);
    setNovaLocalizacao('');
    carregarDados();
  };

  const abrirModalEdicao = (loc) => {
    setLocalSelecionado(loc);
    setNovoNomeEdicao(loc.nome);
    setErroEditar('');
    setModalEditarVisible(true);
  };

  // --- EDITAR LOCAL NO SUPABASE ---
  const salvarEdicaoLocal = async () => {
    const nomeLimpo = novoNomeEdicao.trim();
    if (nomeLimpo === '') {
      Vibration.vibrate(400);
      setErroEditar('O nome da localização não pode ficar vazio.');
      return;
    }

    const jaExiste = localizacoes.some(
      (loc) =>
        loc.id !== localSelecionado.id &&
        loc.nome.toLowerCase() === nomeLimpo.toLowerCase()
    );
    if (jaExiste) {
      Vibration.vibrate(400);
      setErroEditar('Já existe outra localização com este nome.');
      return;
    }

    const { error } = await supabase
      .from('GM_LOCAIS')
      .update({ NmLocal: nomeLimpo })
      .eq('IdLocal', localSelecionado.id);

    if (error) {
      mostrarAvisoErro('Erro ao atualizar local: ' + error.message);
      return;
    }

    setModalEditarVisible(false);
    setLocalSelecionado(null);
    carregarDados();
  };

  const tentarExcluirLocal = (loc) => {
    const qtdItensVinculados = materiais.filter(
      (item) => item.localizacao === loc.nome
    ).length;

    if (qtdItensVinculados > 0) {
      mostrarAvisoErro(
        `Não é possível excluir "${loc.nome}" pois existem ${qtdItensVinculados} material(is) guardados neste local.`
      );
      return;
    }

    setLocalSelecionado(loc);
    setModalExcluirVisible(true);
  };

  // --- EXCLUIR LOCAL NO SUPABASE ---
  const confirmarExclusao = async () => {
    if (localSelecionado) {
      const { error } = await supabase
        .from('GM_LOCAIS')
        .delete()
        .eq('IdLocal', localSelecionado.id);

      if (error) {
        mostrarAvisoErro('Erro ao excluir local: ' + error.message);
      } else {
        carregarDados();
      }
    }
    setModalExcluirVisible(false);
    setLocalSelecionado(null);
  };

  const localizacoesFiltradas = (localizacoes || []).filter((loc) =>
    loc.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalCriarVisible}
        onRequestClose={() => setModalCriarVisible(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCaixa}>
            <Text style={styles.modalTitulo}>Nova Localização Física</Text>
            <TextInput
              style={styles.inputModal}
              placeholder="Ex: Armário 3 - Gaveta A"
              placeholderTextColor="#94A3B8"
              value={novaLocalizacao}
              onChangeText={(texto) => {
                setNovaLocalizacao(texto);
                setErroCriar('');
              }}
            />

            {erroCriar !== '' ? (
              <Text style={styles.textoErro}>{erroCriar}</Text>
            ) : null}

            <View style={styles.botoesLinhaModal}>
              <Pressable
                style={styles.botaoCinza}
                onPress={() => setModalCriarVisible(false)}
              >
                <Text style={styles.textoBotaoCinza}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.botaoVerde}
                onPress={confirmarCriacaoLocal}
              >
                <Text style={styles.textoBotaoModal}>Adicionar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalEditarVisible}
        onRequestClose={() => setModalEditarVisible(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCaixa}>
            <Text style={styles.modalTitulo}>Renomear Localização</Text>
            <TextInput
              style={styles.inputModal}
              value={novoNomeEdicao}
              onChangeText={(texto) => {
                setNovoNomeEdicao(texto);
                setErroEditar('');
              }}
              placeholder="Novo nome da localização"
              placeholderTextColor="#94A3B8"
            />

            {erroEditar !== '' ? (
              <Text style={styles.textoErro}>{erroEditar}</Text>
            ) : null}

            <View style={styles.botoesLinhaModal}>
              <Pressable
                style={styles.botaoCinza}
                onPress={() => setModalEditarVisible(false)}
              >
                <Text style={styles.textoBotaoCinza}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.botaoAzul}
                onPress={salvarEdicaoLocal}
              >
                <Text style={styles.textoBotaoModal}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalAvisoVisible}
        onRequestClose={() => setModalAvisoVisible(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCaixa}>
            <Text style={styles.modalTexto}>{mensagemAviso}</Text>
            <Pressable
              style={styles.botaoAzulUnico}
              onPress={() => setModalAvisoVisible(false)}
            >
              <Text style={styles.textoBotaoModal}>Entendi</Text>
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
            <Text style={styles.modalTitulo}>Excluir Localização</Text>
            <Text style={styles.modalTexto}>
              Deseja realmente excluir "{localSelecionado?.nome}"?
            </Text>
            <View style={styles.botoesLinhaModal}>
              <Pressable
                style={styles.botaoCinza}
                onPress={() => setModalExcluirVisible(false)}
              >
                <Text style={styles.textoBotaoCinza}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.botaoVermelho}
                onPress={confirmarExclusao}
              >
                <Text style={styles.textoBotaoModal}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Pressable style={styles.botaoNovoLocal} onPress={abrirModalCriar}>
        <Text style={styles.textoBotaoNovo}>+ Novo Local</Text>
      </Pressable>

      <TextInput
        style={styles.inputBusca}
        placeholder="Buscar localização pelo nome..."
        placeholderTextColor="#64748B"
        value={busca}
        onChangeText={setBusca}
      />

      <Text style={styles.subtituloLista}>
        LOCALIZAÇÕES CADASTRADAS ({localizacoesFiltradas.length})
      </Text>

      <FlatList
        data={localizacoesFiltradas}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#94A3B8', marginTop: 20 }}>
            Nenhuma localização encontrada.
          </Text>
        }
        renderItem={({ item }) => {
          const totalItens = materiais.filter(
            (m) => m.localizacao === item.nome
          ).length;

          return (
            <View style={styles.cardItem}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.nomeItem}>{item.nome}</Text>
                <Text style={styles.contadorItens}>
                  {totalItens} {totalItens === 1 ? 'item guardado aqui' : 'itens guardados aqui'}
                </Text>
              </View>

              <View style={styles.botoesAcao}>
                <Pressable
                  style={styles.botaoCardEditar}
                  onPress={() => abrirModalEdicao(item)}
                >
                  <Text style={styles.textoCardEditar}>Editar</Text>
                </Pressable>

                <Pressable
                  style={styles.botaoCardExcluir}
                  onPress={() => tentarExcluirLocal(item)}
                >
                  <Text style={{ color: '#DC2626', fontWeight: 'bold', fontSize: 12 }}>
                    Excluir
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}