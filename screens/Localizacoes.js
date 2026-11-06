import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Vibration,
} from 'react-native';

export default function Localizacoes({
  localizacoes,
  materiais,
  adicionarLocalizacao,
  editarLocalizacao,
  removerLocalizacao,
}) {
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

  const mostrarAviso = (msg) => {
    setMensagemAviso(msg);
    setModalAvisoVisible(true);
  };

  const abrirModalCriar = () => {
    setNovaLocalizacao('');
    setErroCriar('');
    setModalCriarVisible(true);
  };

  const confirmarCriacaoLocal = () => {
    const nomeLimpo = novaLocalizacao.trim();
    if (nomeLimpo === '') {
      setErroCriar('Digite o nome da localização física.');
      return;
    }

    const jaExiste = localizacoes.some(
      (loc) => loc.nome.toLowerCase() === nomeLimpo.toLowerCase()
    );
    if (jaExiste) {
      setErroCriar('Já existe uma localização cadastrada com este nome.');
      return;
    }

    adicionarLocalizacao(nomeLimpo);
    Vibration.vibrate(200);
    setModalCriarVisible(false);
    setNovaLocalizacao('');
  };

  const abrirModalEdicao = (loc) => {
    setLocalSelecionado(loc);
    setNovoNomeEdicao(loc.nome);
    setErroEditar('');
    setModalEditarVisible(true);
  };

  const salvarEdicaoLocal = () => {
    const nomeLimpo = novoNomeEdicao.trim();
    if (nomeLimpo === '') {
      setErroEditar('O nome da localização não pode ficar vazio.');
      return;
    }

    const jaExiste = localizacoes.some(
      (loc) =>
        loc.id !== localSelecionado.id &&
        loc.nome.toLowerCase() === nomeLimpo.toLowerCase()
    );
    if (jaExiste) {
      setErroEditar('Já existe outra localização com este nome.');
      return;
    }

    editarLocalizacao(
      localSelecionado.id,
      localSelecionado.nome,
      nomeLimpo
    );
    Vibration.vibrate(200);
    setModalEditarVisible(false);
    setLocalSelecionado(null);
  };

  const tentarExcluirLocal = (loc) => {
    const qtdItensVinculados = materiais.filter(
      (item) => item.localizacao === loc.nome
    ).length;

    if (qtdItensVinculados > 0) {
      Vibration.vibrate(400);
      mostrarAviso(
        `Não é possível excluir "${loc.nome}" pois existem ${qtdItensVinculados} material(is) guardados neste local.`
      );
      return;
    }

    setLocalSelecionado(loc);
    setModalExcluirVisible(true);
  };

  const confirmarExclusao = () => {
    if (localSelecionado) {
      removerLocalizacao(localSelecionado.id);
      Vibration.vibrate(200);
    }
    setModalExcluirVisible(false);
    setLocalSelecionado(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* MODAL 1: Criar Nova Localização */}
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

      {/* MODAL 2: Editar Nome da Localização */}
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
        <Text style={styles.textoBotaoNovo}>+ Criar Nova Localização Física</Text>
      </Pressable>

      <Text style={styles.subtituloLista}>
        LOCALIZAÇÕES CADASTRADAS ({localizacoes.length})
      </Text>

      <FlatList
        data={localizacoes}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const totalItens = materiais.filter(
            (m) => m.localizacao === item.nome
          ).length;

          return (
            <View style={styles.cardLocal}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.nomeLocal}>📍 {item.nome}</Text>
                <Text style={styles.contadorItens}>
                  {totalItens} {totalItens === 1 ? 'item guardado aqui' : 'itens guardados aqui'}
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
                  onPress={() => tentarExcluirLocal(item)}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  botaoNovoLocal: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  textoBotaoNovo: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  subtituloLista: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#64748B',
    letterSpacing: 0.5,
  },
  cardLocal: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nomeLocal: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  contadorItens: { fontSize: 12, color: '#64748B', marginTop: 4 },
  botoesAcao: { flexDirection: 'row', alignItems: 'center' },
  botaoCardEditar: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  textoCardEditar: { color: '#B45309', fontWeight: 'bold', fontSize: 12 },
  botaoCardExcluir: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  textoCardExcluir: { fontSize: 13 },
  modalFundo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  modalCaixa: {
    width: '86%',
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 14,
  },
  modalTexto: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputModal: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    fontSize: 14,
    color: '#0F172A',
  },
  textoErro: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  botoesLinhaModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  botaoVerde: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  botaoAzul: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  botaoAzulUnico: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  botaoVermelho: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  botaoCinza: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  textoBotaoModal: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  textoBotaoCinza: { color: '#475569', fontWeight: 'bold', fontSize: 14 },
});