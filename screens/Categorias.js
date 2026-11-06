import React, { useState, useEffect } from 'react';
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
import { crudListaStyles as styles } from '../styles';
import { supabase } from '../App'; // Ou import { supabase } from '../App' dependendo da sua estrutura

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [busca, setBusca] = useState('');

  const [modalCriarVisible, setModalCriarVisible] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [erroCriar, setErroCriar] = useState('');

  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [novoNomeEdicao, setNovoNomeEdicao] = useState('');
  const [erroEditar, setErroEditar] = useState('');

  const [modalAvisoVisible, setModalAvisoVisible] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState('');

  const [modalExcluirVisible, setModalExcluirVisible] = useState(false);

  // --- BUSCAR DADOS DO SUPABASE ---
  const carregarDadosDoBanco = async () => {
    try {
      // 1. Busca as categorias da tabela GM_Categorias
      const { data: catData, error: erroCat } = await supabase
        .from('GM_Categorias')
        .select('*');

      if (erroCat) {
        console.log('Erro ao buscar categorias:', erroCat.message);
      } else {
        // Mapeia respeitando as letras maiúsculas/minúsculas do banco (IdCategoria e NmCategoria)
        const categoriasFormatadas = catData.map((cat) => ({
          id: String(cat.IdCategoria),
          nome: cat.NmCategoria,
        }));
        console.log(categoriasFormatadas)
        setCategorias(categoriasFormatadas);
      }

      // 2. Busca os materiais para calcular o contador de itens vinculados
      const { data: matsData, error: erroMats } = await supabase
        .from('GM_Materiais')
        .select(`
          IdMaterial,
          NmMaterial,
          GM_Categorias ( NmCategoria )
        `);

      if (!erroMats) {
        const matsFormatados = matsData.map((m) => ({
          id: String(m.IdMaterial),
          nome: m.NmMaterial,
          categoria: m.GM_Categorias?.NmCategoria || 'Geral',
        }));
        setMateriais(matsFormatados);
      }
    } catch (err) {
      console.log('Erro na conexão com o Supabase:', err);
    }
  };

  useEffect(() => {
    carregarDadosDoBanco();
  }, []);

  const mostrarAvisoErro = (msg) => {
    Vibration.vibrate(400);
    setMensagemAviso(msg);
    setModalAvisoVisible(true);
  };

  const abrirModalCriar = () => {
    setNovaCategoria('');
    setErroCriar('');
    setModalCriarVisible(true);
  };

  // --- CRIAR CATEGORIA NO SUPABASE ---
  const confirmarCriacaoCategoria = async () => {
    const nomeLimpo = novaCategoria.trim();
    if (nomeLimpo === '') {
      Vibration.vibrate(400);
      setErroCriar('Digite o nome da categoria.');
      return;
    }

    const jaExiste = categorias.some(
      (cat) => cat.nome.toLowerCase() === nomeLimpo.toLowerCase()
    );
    if (jaExiste) {
      Vibration.vibrate(400);
      setErroCriar('Já existe uma categoria com este nome.');
      return;
    }

    const { error } = await supabase
      .from('GM_Categorias')
      .insert([{ NmCategoria: nomeLimpo }]);

    if (error) {
      mostrarAvisoErro('Erro ao salvar categoria: ' + error.message);
      return;
    }

    setModalCriarVisible(false);
    setNovaCategoria('');
    carregarDadosDoBanco();
  };

  const abrirModalEdicao = (cat) => {
    setCategoriaSelecionada(cat);
    setNovoNomeEdicao(cat.nome);
    setErroEditar('');
    setModalEditarVisible(true);
  };

  // --- EDITAR CATEGORIA NO SUPABASE ---
  const salvarEdicaoCategoria = async () => {
    const nomeLimpo = novoNomeEdicao.trim();
    if (nomeLimpo === '') {
      Vibration.vibrate(400);
      setErroEditar('O nome da categoria não pode ficar vazio.');
      return;
    }

    const jaExiste = categorias.some(
      (cat) =>
        cat.id !== categoriaSelecionada.id &&
        cat.nome.toLowerCase() === nomeLimpo.toLowerCase()
    );
    if (jaExiste) {
      Vibration.vibrate(400);
      setErroEditar('Já existe outra categoria com este nome.');
      return;
    }

    const { error } = await supabase
      .from('GM_Categorias')
      .update({ NmCategoria: nomeLimpo })
      .eq('IdCategoria', categoriaSelecionada.id);

    if (error) {
      mostrarAvisoErro('Erro ao atualizar categoria: ' + error.message);
      return;
    }

    setModalEditarVisible(false);
    setCategoriaSelecionada(null);
    carregarDadosDoBanco();
  };

  const tentarExcluirCategoria = (cat) => {
    const qtdItensVinculados = materiais.filter(
      (item) => item.categoria === cat.nome
    ).length;

    if (qtdItensVinculados > 0) {
      mostrarAvisoErro(
        `Não é possível excluir "${cat.nome}" pois existem ${qtdItensVinculados} material(is) vinculados a ela.`
      );
      return;
    }

    setCategoriaSelecionada(cat);
    setModalExcluirVisible(true);
  };

  // --- EXCLUIR CATEGORIA NO SUPABASE ---
  const confirmarExclusao = async () => {
    if (categoriaSelecionada) {
      const { error } = await supabase
        .from('GM_Categorias')
        .delete()
        .eq('IdCategoria', categoriaSelecionada.id);

      if (error) {
        mostrarAvisoErro('Erro ao excluir categoria: ' + error.message);
      } else {
        carregarDadosDoBanco();
      }
    }
    setModalExcluirVisible(false);
    setCategoriaSelecionada(null);
  };

  const categoriasFiltradas = (categorias || []).filter((cat) =>
    cat.nome.toLowerCase().includes(busca.toLowerCase())
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
            <Text style={styles.modalTitulo}>Nova Categoria</Text>
            <TextInput
              style={styles.inputModal}
              placeholder="Ex: Medicamentos"
              placeholderTextColor="#94A3B8"
              value={novaCategoria}
              onChangeText={(texto) => {
                setNovaCategoria(texto);
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
                onPress={confirmarCriacaoCategoria}
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
            <Text style={styles.modalTitulo}>Renomear Categoria</Text>
            <TextInput
              style={styles.inputModal}
              value={novoNomeEdicao}
              onChangeText={(texto) => {
                setNovoNomeEdicao(texto);
                setErroEditar('');
              }}
              placeholder="Novo nome da categoria"
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
                onPress={salvarEdicaoCategoria}
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
            <Text style={styles.modalTitulo}>Excluir Categoria</Text>
            <Text style={styles.modalTexto}>
              Deseja realmente excluir "{categoriaSelecionada?.nome}"?
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

      <Pressable style={styles.botaoNovaCategoria} onPress={abrirModalCriar}>
        <Text style={styles.textoBotaoNovo}>+ Nova Categoria</Text>
      </Pressable>

      <TextInput
        style={styles.inputBusca}
        placeholder="Buscar categoria pelo nome..."
        placeholderTextColor="#64748B"
        value={busca}
        onChangeText={setBusca}
      />

      <Text style={styles.subtituloLista}>
        CATEGORIAS ATIVAS ({categoriasFiltradas.length})
      </Text>

      <FlatList
        data={categoriasFiltradas}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#94A3B8', marginTop: 20 }}>
            Nenhuma categoria encontrada.
          </Text>
        }
        renderItem={({ item }) => {
          const totalItens = materiais.filter(
            (m) => m.categoria === item.nome
          ).length;

          return (
            <View style={styles.cardItem}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.nomeItem}>{item.nome}</Text>
                <Text style={styles.contadorItens}>
                  {totalItens} {totalItens === 1 ? 'item vinculado' : 'itens vinculados'}
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
                  onPress={() => tentarExcluirCategoria(item)}
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