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
  Vibration,
} from 'react-native';
import { cadastroStyles as styles, inputBloqueadoStyle } from '../styles';

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

  const [dropdownCatAberto, setDropdownCatAberto] = useState(false);
  const [dropdownLocAberto, setDropdownLocAberto] = useState(false);

  // Regex do slide regex.pptx: valida se contém apenas dígitos (\d+)
  const regexDigitos = /^\d+$/;

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
      if (!regexDigitos.test(quantidade.trim())) {
        setMensagemModal(
          'A quantidade inicial deve conter apenas dígitos numéricos (>= 0).'
        );
        setModalVisible(true);
        return;
      }

      const qtdNumerica = parseInt(quantidade.trim(), 10);
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

      {/* MODAL 2: Lista Suspensa de Categorias */}
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

      {/* MODAL 3: Lista Suspensa de Localizações Físicas */}
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