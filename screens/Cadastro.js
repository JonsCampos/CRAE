import React, { useState, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { cadastroStyles as styles, inputBloqueadoStyle } from '../styles';
import { supabase } from '../App';

export default function Cadastro({ route, navigation }) {
  const itemExistente = route.params?.itemParaEditar;

  const [categorias, setCategorias] = useState([]);
  const [localizacoes, setLocalizacoes] = useState([]);

  const [nome, setNome] = useState(itemExistente ? itemExistente.nome : '');
  const [categoria, setCategoria] = useState(itemExistente ? itemExistente.categoria : '');
  const [localizacao, setLocalizacao] = useState(itemExistente ? itemExistente.localizacao : '');
  const [descricao, setDescricao] = useState(itemExistente ? itemExistente.descricao : '');
  const [quantidade, setQuantidade] = useState(itemExistente ? String(itemExistente.quantidade) : '0');

  const [modalVisible, setModalVisible] = useState(false);
  const [mensagemModal, setMensagemModal] = useState('');

  const [dropdownCatAberto, setDropdownCatAberto] = useState(false);
  const [dropdownLocAberto, setDropdownLocAberto] = useState(false);

  // --- BUSCAR CATEGORIAS E LOCAIS DO SUPABASE ---
  const carregarDados = async () => {
    try {
      const { data: catData, error: catError } = await supabase
        .from('GM_Categorias')
        .select('*');

      if (!catError && catData) {
        const catsFormatadas = catData.map((cat) => ({
          id: String(cat.IdCategoria),
          nome: cat.NmCategoria,
        }));
        setCategorias(catsFormatadas);

        if (!itemExistente && !categoria && catsFormatadas.length > 0) {
          setCategoria(catsFormatadas[0].nome);
        }
      }

      const { data: locData, error: locError } = await supabase
        .from('GM_LOCAIS')
        .select('*');

      if (!locError && locData) {
        const locsFormatadas = locData.map((loc) => ({
          id: String(loc.IdLocal),
          nome: loc.NmLocal,
        }));
        setLocalizacoes(locsFormatadas);

        if (!itemExistente && !localizacao && locsFormatadas.length > 0) {
          setLocalizacao(locsFormatadas[0].nome);
        }
      }
    } catch (err) {
      console.log('Erro ao carregar dados auxiliares:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const regexDigitos = /^\d+$/;

  const salvarFormulario = async () => {
    if (
      nome.trim() === '' ||
      categoria.trim() === '' ||
      localizacao.trim() === '' ||
      (!itemExistente && quantidade.trim() === '')
    ) {
      Vibration.vibrate(400);
      setMensagemModal(
        'Preencha todos os campos obrigatórios (*). Se não houver Categoria ou Localização, crie uma clicando no menu suspenso.'
      );
      setModalVisible(true);
      return;
    }

    const categoriaObj = categorias.find((cat) => cat.nome === categoria);
    const idCategoriaSelecionada = categoriaObj ? Number(categoriaObj.id) : null;

    const localObj = localizacoes.find((loc) => loc.nome === localizacao);
    const idLocalSelecionado = localObj ? Number(localObj.id) : null;

    console.log('IDs mapeados -> IdCategoria:', idCategoriaSelecionada, '| IdLocal:', idLocalSelecionado);

    if (itemExistente) {
      console.log('Executando rotina de UPDATE no Supabase para o ID:', itemExistente.id);

      const materialAtualizadoSupabase = {
        NmMaterial: nome.trim(),
        IdCategoria: idCategoriaSelecionada,
        IdLocal: idLocalSelecionado,
        DscMaterial: descricao.trim(),
      };

      const { error } = await supabase
        .from('GM_Materiais')
        .update(materialAtualizadoSupabase)
        .eq('IdMaterial', itemExistente.id); 

      if (error) {
        console.log('ERRO DO SUPABASE NO UPDATE:', error.message);
        Vibration.vibrate(400);
        setMensagemModal('Erro ao atualizar no banco: ' + error.message);
        setModalVisible(true);
        return;
      }

      console.log('Update realizado com sucesso! Retornando...');
      navigation.goBack();
      return;
    } else {
      console.log('Executando rotina de INSERT no Supabase...');
      if (!regexDigitos.test(quantidade.trim())) {
        Vibration.vibrate(400);
        setMensagemModal('A quantidade inicial deve conter apenas dígitos numéricos (>= 0).');
        setModalVisible(true);
        return;
      }

      const qtdMaterial = parseInt(quantidade.trim(), 10);

      const addMaterial = {
        NmMaterial: nome.trim(),
        IdCategoria: idCategoriaSelecionada,
        IdLocal: idLocalSelecionado,
        DscMaterial: descricao.trim(),
        QtdMaterial: qtdMaterial,
      };

      const { error } = await supabase
        .from('GM_Materiais')
        .insert([addMaterial]);

      if (error) {
        console.log('ERRO DO SUPABASE NO INSERT:', error.message);
        Vibration.vibrate(400);
        setMensagemModal('Erro ao salvar no banco: ' + error.message);
        setModalVisible(true);
        return;
      }

      console.log('Insert realizado com sucesso! Retornando...');
      navigation.goBack();
      return;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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

      {/* Modal Dropdown Categorias */}
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
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: '#64748B', marginVertical: 15 }}>
                  Nenhuma categoria cadastrada ainda.
                </Text>
              }
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

      {/* Modal Dropdown Localizações */}
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
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: '#64748B', marginVertical: 15 }}>
                  Nenhuma localização cadastrada ainda.
                </Text>
              }
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
              ? 'Editar Dados do Material'
              : 'Novo Material no Acervo'}
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
              {categoria !== '' ? categoria : 'Toque para criar/selecionar categoria...'}
            </Text>
            <Text style={styles.dropdownSeta}>▼</Text>
          </Pressable>

          <Text style={styles.label}>LOCALIZAÇÃO FÍSICA *</Text>
          <Pressable
            style={styles.dropdownCaixaLocal}
            onPress={() => setDropdownLocAberto(true)}
          >
            <Text style={styles.dropdownTextoLocal}>
              {localizacao !== '' ? localizacao : 'Toque para criar/selecionar local...'}
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
              Para alterar o saldo, use o botão "Movimentar Entrada / Saída" na
              tela principal.
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