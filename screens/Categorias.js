import React, { useState } from 'react';
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

export default function Categorias({
  categorias,
  materiais,
  adicionarCategoria,
  editarCategoria,
  removerCategoria,
}) {
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

  const mostrarAviso = (msg) => {
    setMensagemAviso(msg);
    setModalAvisoVisible(true);
  };

  const abrirModalCriar = () => {
    setNovaCategoria('');
    setErroCriar('');
    setModalCriarVisible(true);
  };

  const confirmarCriacaoCategoria = () => {
    const nomeLimpo = novaCategoria.trim();
    if (nomeLimpo === '') {
      setErroCriar('Digite o nome da categoria.');
      return;
    }

    const jaExiste = categorias.some(
      (cat) => cat.nome.toLowerCase() === nomeLimpo.toLowerCase()
    );
    if (jaExiste) {
      setErroCriar('Já existe uma categoria com este nome.');
      return;
    }

    adicionarCategoria(nomeLimpo);
    Vibration.vibrate(200);
    setModalCriarVisible(false);
    setNovaCategoria('');
  };

  const abrirModalEdicao = (cat) => {
    setCategoriaSelecionada(cat);
    setNovoNomeEdicao(cat.nome);
    setErroEditar('');
    setModalEditarVisible(true);
  };

  const salvarEdicaoCategoria = () => {
    const nomeLimpo = novoNomeEdicao.trim();
    if (nomeLimpo === '') {
      setErroEditar('O nome da categoria não pode ficar vazio.');
      return;
    }

    const jaExiste = categorias.some(
      (cat) =>
        cat.id !== categoriaSelecionada.id &&
        cat.nome.toLowerCase() === nomeLimpo.toLowerCase()
    );
    if (jaExiste) {
      setErroEditar('Já existe outra categoria com este nome.');
      return;
    }

    editarCategoria(
      categoriaSelecionada.id,
      categoriaSelecionada.nome,
      nomeLimpo
    );
    Vibration.vibrate(200);
    setModalEditarVisible(false);
    setCategoriaSelecionada(null);
  };

  const tentarExcluirCategoria = (cat) => {
    const qtdItensVinculados = materiais.filter(
      (item) => item.categoria === cat.nome
    ).length;

    if (qtdItensVinculados > 0) {
      Vibration.vibrate(400);
      mostrarAviso(
        `Não é possível excluir "${cat.nome}" pois existem ${qtdItensVinculados} material(is) vinculados a ela.`
      );
      return;
    }

    setCategoriaSelecionada(cat);
    setModalExcluirVisible(true);
  };

  const confirmarExclusao = () => {
    if (categoriaSelecionada) {
      removerCategoria(categoriaSelecionada.id);
      Vibration.vibrate(200);
    }
    setModalExcluirVisible(false);
    setCategoriaSelecionada(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* MODAL 1: Criar Nova Categoria */}
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
              placeholder="Ex: Mapas e Cartografia"
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

      {/* MODAL 2: Editar Nome da Categoria */}
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

      {/* MODAL 3: Avisos e Bloqueios */}
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

      {/* MODAL 4: Confirmar Exclusão */}
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
        <Text style={styles.textoBotaoNovo}>+ Criar Nova Categoria</Text>
      </Pressable>

      <Text style={styles.subtituloLista}>
        CATEGORIAS ATIVAS ({categorias.length})
      </Text>

      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const totalItens = materiais.filter(
            (m) => m.categoria === item.nome
          ).length;

          return (
            <View style={styles.cardItem}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.nomeItem}>📂 {item.nome}</Text>
                <Text style={styles.contadorItens}>
                  {totalItens} {totalItens === 1 ? 'item vinculado' : 'itens vinculados'}
                </Text>
              </View>

              <View style={styles.botoesAcao}>
                <Pressable
                  style={styles.botaoCardEditar}
                  onPress={() => abrirModalEdicao(item)}
                >
                  <Text style={styles.textoCardEditar}>✏️ Editar</Text>
                </Pressable>

                <Pressable
                  style={styles.botaoCardExcluir}
                  onPress={() => tentarExcluirCategoria(item)}
                >
                  <Text style={styles.textoCardExcluir}>🗑️</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}