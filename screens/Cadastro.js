import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Vibration,
} from 'react-native';

export default function Cadastro({
  route,
  navigation,
  categorias,
  localizacoes,
  adicionarMaterial,
  editarMaterial,
}) {
  const itemExistente = route.params?.itemParaEditar;

  const [nome, setNome] = useState(itemExistente ? itemExistente.nome : '');
  const [categoria, setCategoria] = useState(
    itemExistente && itemExistente.categoria
      ? itemExistente.categoria
      : categorias.length > 0
      ? categorias[0].nome
      : ''
  );
  const [localizacao, setLocalizacao] = useState(
    itemExistente && itemExistente.localizacao
      ? itemExistente.localizacao
      : localizacoes.length > 0
      ? localizacoes[0].nome
      : ''
  );
  const [descricao, setDescricao] = useState(
    itemExistente ? itemExistente.descricao : ''
  );
  const [quantidade, setQuantidade] = useState(
    itemExistente ? String(itemExistente.quantidade) : '0'
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [mensagemModal, setMensagemModal] = useState('');

  // Estados dos Menus Suspensos (Dropdowns)
  const [dropdownCatAberto, setDropdownCatAberto] = useState(false);
  const [dropdownLocAberto, setDropdownLocAberto] = useState(false);

  const salvarFormulario = () => {
    if (
      nome.trim() === '' ||
      categoria.trim() === '' ||
      localizacao.trim() === '' ||
      (!itemExistente && quantidade.trim() === '')
    ) {
      setMensagemModal('Por favor, preencha todos os campos obrigatórios (*).');
      setModalVisible(true);
      return;
    }

    if (itemExistente) {
      const itemAtualizado = {
        id: itemExistente.id,
        nome: nome.trim(),
        categoria: categoria,
        descricao: descricao.trim(),
        localizacao: localizacao,
        quantidade: itemExistente.quantidade,
      };
      Vibration.vibrate(300);
      editarMaterial(itemAtualizado);
    } else {
      const qtdNumerica = parseInt(quantidade, 10);
      if (isNaN(qtdNumerica) || qtdNumerica < 0) {
        setMensagemModal(
          'A quantidade inicial não pode ser negativa ou inválida.'
        );
        setModalVisible(true);
        return;
      }

      const novoItem = {
        id: Date.now().toString(),
        nome: nome.trim(),
        categoria: categoria,
        descricao: descricao.trim(),
        localizacao: localizacao,
        quantidade: qtdNumerica,
      };
      Vibration.vibrate(300);
      adicionarMaterial(novoItem);
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* MODAL 1: Avisos de Validação */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCaixa}>
            <Text style={styles.modalTexto}>{mensagemModal}</Text>
            <Pressable
              style={styles.botaoModal}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textoBotaoModal}>Entendi</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Lista Suspensa (Dropdown) de Categorias */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={dropdownCatAberto}
        onRequestClose={() => setDropdownCatAberto(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.dropdownModalCaixa}>
            <Text style={styles.dropdownTitulo}>Selecione uma Categoria</Text>

            <FlatList
              data={categorias}
              keyExtractor={(item) => item.id}
              style={{ width: '100%', maxHeight: 240 }}
              renderItem={({ item }) => {
                const selecionado = item.nome === categoria;
                return (
                  <Pressable
                    style={
                      selecionado
                        ? styles.itemDropdownSelecionado
                        : styles.itemDropdown
                    }
                    onPress={() => {
                      setCategoria(item.nome);
                      setDropdownCatAberto(false);
                    }}
                  >
                    <Text
                      style={
                        selecionado
                          ? styles.textoItemSelecionado
                          : styles.textoItemDropdown
                      }
                    >
                      {selecionado ? '✔  ' : '📂  '}
                      {item.nome}
                    </Text>
                  </Pressable>
                );
              }}
            />

            <View style={styles.rodapeDropdown}>
              <Pressable
                style={styles.botaoGerenciarCategorias}
                onPress={() => {
                  setDropdownCatAberto(false);
                  // Abre empilhado via Stack para poder voltar ao formulário!
                  navigation.navigate('CategoriasStack');
                }}
              >
                <Text style={styles.textoBotaoModal}>
                  + Gerenciar / Criar Categorias
                </Text>
              </Pressable>

              <Pressable
                style={styles.botaoFecharDropdown}
                onPress={() => setDropdownCatAberto(false)}
              >
                <Text style={styles.textoFecharDropdown}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: Lista Suspensa (Dropdown) de Localizações Físicas */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={dropdownLocAberto}
        onRequestClose={() => setDropdownLocAberto(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.dropdownModalCaixa}>
            <Text style={styles.dropdownTitulo}>Selecione a Localização Física</Text>

            <FlatList
              data={localizacoes}
              keyExtractor={(item) => item.id}
              style={{ width: '100%', maxHeight: 240 }}
              renderItem={({ item }) => {
                const selecionado = item.nome === localizacao;
                return (
                  <Pressable
                    style={
                      selecionado
                        ? styles.itemDropdownSelecionado
                        : styles.itemDropdown
                    }
                    onPress={() => {
                      setLocalizacao(item.nome);
                      setDropdownLocAberto(false);
                    }}
                  >
                    <Text
                      style={
                        selecionado
                          ? styles.textoItemSelecionado
                          : styles.textoItemDropdown
                      }
                    >
                      {selecionado ? '✔  ' : '📍  '}
                      {item.nome}
                    </Text>
                  </Pressable>
                );
              }}
            />

            <View style={styles.rodapeDropdown}>
              <Pressable
                style={styles.botaoGerenciarLocais}
                onPress={() => {
                  setDropdownLocAberto(false);
                  // Abre empilhado via Stack para poder voltar ao formulário!
                  navigation.navigate('LocalizacoesStack');
                }}
              >
                <Text style={styles.textoBotaoModal}>
                  + Gerenciar / Criar Localizações
                </Text>
              </Pressable>

              <Pressable
                style={styles.botaoFecharDropdown}
                onPress={() => setDropdownLocAberto(false)}
              >
                <Text style={styles.textoFecharDropdown}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.tituloForm}>
            {itemExistente
              ? '✏️ Editar Dados do Material'
              : '➕ Novo Material no Acervo'}
          </Text>

          <Text style={styles.label}>NOME DO OBJETO *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Gravador Digital Sony"
            placeholderTextColor="#94A3B8"
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>CATEGORIA *</Text>
          <Pressable
            style={styles.dropdownCaixa}
            onPress={() => setDropdownCatAberto(true)}
          >
            <Text style={styles.dropdownTextoSelecionado}>
              📂  {categoria !== '' ? categoria : 'Selecione uma categoria...'}
            </Text>
            <Text style={styles.dropdownSeta}>▼</Text>
          </Pressable>

          <Text style={styles.label}>LOCALIZAÇÃO FÍSICA *</Text>
          <Pressable
            style={styles.dropdownCaixaLocal}
            onPress={() => setDropdownLocAberto(true)}
          >
            <Text style={styles.dropdownTextoLocal}>
              📍  {localizacao !== '' ? localizacao : 'Selecione uma localização...'}
            </Text>
            <Text style={styles.dropdownSetaLocal}>▼</Text>
          </Pressable>

          <Text style={styles.label}>DESCRIÇÃO / OBSERVAÇÕES</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Caixa azul com etiquetas brancas (opcional)"
            placeholderTextColor="#94A3B8"
            value={descricao}
            onChangeText={setDescricao}
          />

          <Text style={styles.label}>
            {itemExistente
              ? 'QUANTIDADE EM ESTOQUE (BLOQUEADO)'
              : 'ESTOQUE INICIAL *'}
          </Text>
          <TextInput
            style={itemExistente ? inputBloqueadoStyle : styles.input}
            placeholder="Digite a quantidade inicial (>= 0)"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={quantidade}
            onChangeText={setQuantidade}
            editable={!itemExistente}
            selectTextOnFocus={!itemExistente}
          />

          {itemExistente ? (
            <Text style={styles.textoAviso}>
              ℹ️ Para alterar o saldo, use o botão "Movimentar Entrada / Saída"
              na tela principal.
            </Text>
          ) : null}

          <Pressable style={styles.botaoSalvar} onPress={salvarFormulario}>
            <Text style={styles.textoBotaoSalvar}>
              {itemExistente ? 'Salvar Alterações' : 'Cadastrar Material'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tituloForm: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderRadius: 10,
    color: '#0F172A',
  },
  dropdownCaixa: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderRadius: 10,
  },
  dropdownTextoSelecionado: {
    fontSize: 14,
    color: '#3730A3',
    fontWeight: 'bold',
  },
  dropdownSeta: { fontSize: 12, color: '#4F46E5' },
  dropdownCaixaLocal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderRadius: 10,
  },
  dropdownTextoLocal: {
    fontSize: 14,
    color: '#0369A1',
    fontWeight: 'bold',
  },
  dropdownSetaLocal: { fontSize: 12, color: '#0284C7' },
  inputDesativado: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E1',
    color: '#64748B',
    marginBottom: 8,
  },
  textoAviso: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 18,
    lineHeight: 18,
  },
  botaoSalvar: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  textoBotaoSalvar: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  modalFundo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  modalCaixa: {
    width: '84%',
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 16,
    alignItems: 'center',
  },
  dropdownModalCaixa: {
    width: '88%',
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 16,
    alignItems: 'center',
  },
  dropdownTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 14,
  },
  itemDropdown: {
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    borderRadius: 8,
  },
  itemDropdownSelecionado: {
    paddingVertical: 13,
    paddingHorizontal: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    marginBottom: 2,
  },
  textoItemDropdown: { fontSize: 14, color: '#334155' },
  textoItemSelecionado: { fontSize: 14, color: '#4F46E5', fontWeight: 'bold' },
  rodapeDropdown: { width: '100%', marginTop: 16, alignItems: 'center' },
  botaoGerenciarCategorias: {
    backgroundColor: '#10B981',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  botaoGerenciarLocais: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  botaoFecharDropdown: { padding: 6 },
  textoFecharDropdown: { color: '#64748B', fontWeight: 'bold', fontSize: 13 },
  modalTexto: {
    fontSize: 15,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 18,
  },
  botaoModal: {
    backgroundColor: '#4F46E5',
    paddingVertical: 11,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  textoBotaoModal: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
});

const inputBloqueadoStyle = StyleSheet.compose(
  styles.input,
  styles.inputDesativado
);