import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  SectionList,
  Modal,
  Pressable,
  StyleSheet,
  Linking,
  Vibration,
} from 'react-native';

export default function Home({
  navigation,
  materiais,
  atualizarEstoque,
  removerMaterial,
}) {
  const [busca, setBusca] = useState('');
  const [agruparPorCategoria, setAgruparPorCategoria] = useState(true);

  const [modalExcluirVisible, setModalExcluirVisible] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);

  const [modalEstoqueVisible, setModalEstoqueVisible] = useState(false);
  const [qtdMovimentacao, setQtdMovimentacao] = useState('');
  const [erroEstoque, setErroEstoque] = useState('');

  const compartilharWhatsApp = (item) => {
    const categoriaTexto = item.categoria ? item.categoria : 'Geral';
    const mensagem = `📦 *Inventário Dra. Luna*\nCategoria: ${categoriaTexto}\nMaterial: ${item.nome}\nLocal: ${item.localizacao}\nEstoque atual: ${item.quantidade} un.`;
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(mensagem)}`);
  };

  const abrirModalEstoque = (item) => {
    setItemSelecionado(item);
    setQtdMovimentacao('');
    setErroEstoque('');
    setModalEstoqueVisible(true);
  };

  const confirmarMovimentacao = (tipo) => {
    const valor = parseInt(qtdMovimentacao, 10);

    if (isNaN(valor) || valor <= 0) {
      setErroEstoque('Digite uma quantidade válida maior que zero.');
      return;
    }

    if (tipo === 'entrada') {
      const novoSaldo = itemSelecionado.quantidade + valor;
      atualizarEstoque(itemSelecionado.id, novoSaldo);
      Vibration.vibrate(200);
      setModalEstoqueVisible(false);
    } else if (tipo === 'saida') {
      if (valor > itemSelecionado.quantidade) {
        Vibration.vibrate(400);
        setErroEstoque(
          `Saldo insuficiente! Tentou retirar ${valor}, mas só há ${itemSelecionado.quantidade} em estoque.`
        );
        return;
      }
      const novoSaldo = itemSelecionado.quantidade - valor;
      atualizarEstoque(itemSelecionado.id, novoSaldo);
      Vibration.vibrate(200);
      setModalEstoqueVisible(false);
    }
  };

  const pedirConfirmacaoExclusao = (item) => {
    setItemSelecionado(item);
    setModalExcluirVisible(true);
  };

  const confirmarExclusao = () => {
    if (itemSelecionado) {
      removerMaterial(itemSelecionado.id);
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

  const secoesCategorias = [];
  materiaisFiltrados.forEach((item) => {
    const nomeCategoria = item.categoria || 'Geral';
    let secaoExistente = secoesCategorias.find((s) => s.title === nomeCategoria);
    if (!secaoExistente) {
      secaoExistente = { title: nomeCategoria, data: [] };
      secoesCategorias.push(secaoExistente);
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

        {!agruparPorCategoria ? (
          <Text style={styles.textoCategoria}>
            🗂️ {item.categoria || 'Geral'}
          </Text>
        ) : null}

        <Text style={styles.textoDetalhe}>
          {item.descricao ? item.descricao : 'Sem descrição cadastrada'}
        </Text>

        <View style={styles.caixaLocal}>
          <Text style={styles.textoLocal}>📍 {item.localizacao}</Text>
        </View>

        {/* Botão Principal do Card: Entrada e Saída */}
        <Pressable
          style={styles.botaoMovimentar}
          onPress={() => abrirModalEstoque(item)}
        >
          <Text style={styles.textoBotaoMovimentar}>
            📦 Movimentar Entrada / Saída
          </Text>
        </Pressable>

        {/* Linha de Ações Secundárias */}
        <View style={styles.botoesLinha}>
          <Pressable
            style={styles.botaoWhats}
            onPress={() => compartilharWhatsApp(item)}
          >
            <Text style={styles.textoBotaoSecundarioCard}>💬 WhatsApp</Text>
          </Pressable>

          <Pressable
            style={styles.botaoEditar}
            onPress={() =>
              navigation.navigate('Cadastro', { itemParaEditar: item })
            }
          >
            <Text style={styles.textoBotaoEditarCard}>✏️ Editar</Text>
          </Pressable>

          <Pressable
            style={styles.botaoExcluir}
            onPress={() => pedirConfirmacaoExclusao(item)}
          >
            <Text style={styles.textoBotaoExcluirCard}>🗑️ Excluir</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* MODAL 1: Movimentação de Estoque */}
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
              {itemSelecionado?.nome} • Saldo atual:{' '}
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

      {/* MODAL 2: Confirmação de Exclusão */}
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

      {/* Botão + Novo Material de volta ao topo da Home */}
      <Pressable
        style={styles.botaoNovoMaterialTopo}
        onPress={() => navigation.navigate('Cadastro')}
      >
        <Text style={styles.textoBotaoNovoTopo}>+ Novo Material</Text>
      </Pressable>

      {/* Barra de Pesquisa */}
      <TextInput
        style={styles.inputBusca}
        placeholder="🔍 Buscar por nome, categoria ou localização..."
        placeholderTextColor="#64748B"
        value={busca}
        onChangeText={setBusca}
      />

      {/* Seletor de Abas: SectionList vs FlatList */}
      <View style={styles.abasContainer}>
        <Pressable
          style={agruparPorCategoria ? styles.abaAtiva : styles.abaInativa}
          onPress={() => setAgruparPorCategoria(true)}
        >
          <Text
            style={
              agruparPorCategoria ? styles.textoAbaAtiva : styles.textoAbaInativa
            }
          >
            📂 Por Categoria
          </Text>
        </Pressable>

        <Pressable
          style={!agruparPorCategoria ? styles.abaAtiva : styles.abaInativa}
          onPress={() => setAgruparPorCategoria(false)}
        >
          <Text
            style={
              !agruparPorCategoria
                ? styles.textoAbaAtiva
                : styles.textoAbaInativa
            }
          >
            📋 Lista Geral
          </Text>
        </Pressable>
      </View>

      {agruparPorCategoria ? (
        <SectionList
          sections={secoesCategorias}
          keyExtractor={(item, index) => item.id || String(index)}
          renderItem={renderizarCardMaterial}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section: { title, data } }) => (
            <View style={styles.headerCategoriaBox}>
              <Text style={styles.headerCategoriaTexto}>📂 {title}</Text>
              <Text style={styles.headerCategoriaCount}>{data.length}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.listaVazia}>Nenhum material encontrado.</Text>
          }
        />
      ) : (
        <FlatList
          data={materiaisFiltrados}
          keyExtractor={(item, index) => item.id || String(index)}
          renderItem={renderizarCardMaterial}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.listaVazia}>Nenhum material encontrado.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  botaoNovoMaterialTopo: {
    backgroundColor: '#4F46E5',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  textoBotaoNovoTopo: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  inputBusca: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  abasContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
  },
  abaAtiva: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  abaInativa: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  textoAbaAtiva: { fontSize: 13, fontWeight: 'bold', color: '#4F46E5' },
  textoAbaInativa: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  headerCategoriaBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  headerCategoriaTexto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3730A3',
  },
  headerCategoriaCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4F46E5',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  cardItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 5,
    borderLeftColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardAlertaBorda: {
    borderLeftColor: '#EF4444',
    backgroundColor: '#FFFBFB',
  },
  cabecalhoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nomeItem: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  pillEstoque: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  textoPillEstoque: { fontSize: 12, fontWeight: 'bold', color: '#065F46' },
  pillEsgotado: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  textoPillEsgotado: { fontSize: 11, fontWeight: 'bold', color: '#991B1B' },
  textoCategoria: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4,
  },
  textoDetalhe: { fontSize: 13, color: '#64748B', marginBottom: 8 },
  caixaLocal: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  textoLocal: { fontSize: 13, fontWeight: '600', color: '#334155' },
  botaoMovimentar: {
    backgroundColor: '#4F46E5',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  textoBotaoMovimentar: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  botoesLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botaoWhats: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 6,
  },
  textoBotaoSecundarioCard: {
    color: '#047857',
    fontWeight: 'bold',
    fontSize: 12,
  },
  botaoEditar: {
    flex: 1,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 6,
  },
  textoBotaoEditarCard: { color: '#B45309', fontWeight: 'bold', fontSize: 12 },
  botaoExcluir: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotaoExcluirCard: { color: '#DC2626', fontWeight: 'bold', fontSize: 12 },
  listaVazia: { textAlign: 'center', color: '#94A3B8', marginTop: 30, fontSize: 14 },
  modalFundo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  modalCaixa: {
    width: '88%',
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  modalSubtitulo: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputModal: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  textoErro: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalTexto: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  botoesLinhaModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  botaoModalEntrada: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  botaoModalSaida: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  botaoModalCancelar: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  textoBotaoModalBranco: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  textoBotaoCancelar: { color: '#475569', fontWeight: 'bold', fontSize: 14 },
  botaoFecharModal: { marginTop: 14, padding: 6 },
  textoFechar: { color: '#64748B', fontWeight: 'bold', fontSize: 13 },
});

const cardEsgotadoStyle = StyleSheet.compose(
  styles.cardItem,
  styles.cardAlertaBorda
);