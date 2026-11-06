import React, { useState, useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import Login from './screens/Login';
import Home from './screens/Home';
import Cadastro from './screens/Cadastro';
import Categorias from './screens/Categorias';
import Localizacoes from './screens/Localizacoes';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const CHAVE_MATERIAIS = '@inventario_materiais';
const CHAVE_CATEGORIAS = '@inventario_categorias';
const CHAVE_LOCALIZACOES = '@inventario_localizacoes';

function TelaSair({ funcLogar }) {
  useEffect(() => {
    funcLogar(false);
  }, []);
  return null;
}

export default function App() {
  const [EstaLogado, setLogado] = useState(false);

  const [materiais, setMateriais] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [localizacoes, setLocalizacoes] = useState([]);

  useEffect(() => {
    const carregarDadosLocais = async () => {
      try {
        const matStr = await AsyncStorage.getItem(CHAVE_MATERIAIS);
        const catStr = await AsyncStorage.getItem(CHAVE_CATEGORIAS);
        const locStr = await AsyncStorage.getItem(CHAVE_LOCALIZACOES);

        if (matStr !== null) setMateriais(JSON.parse(matStr));
        if (catStr !== null) setCategorias(JSON.parse(catStr));
        if (locStr !== null) setLocalizacoes(JSON.parse(locStr));
      } catch (error) {
        console.log('Erro ao carregar dados do AsyncStorage:', error);
      }
    };

    carregarDadosLocais();
  }, []);

  const salvarMateriaisStorage = async (novaLista) => {
    setMateriais(novaLista);
    try {
      await AsyncStorage.setItem(CHAVE_MATERIAIS, JSON.stringify(novaLista));
    } catch (error) {
      console.log('Erro ao salvar materiais:', error);
    }
  };

  const salvarCategoriasStorage = async (novaLista) => {
    setCategorias(novaLista);
    try {
      await AsyncStorage.setItem(CHAVE_CATEGORIAS, JSON.stringify(novaLista));
    } catch (error) {
      console.log('Erro ao salvar categorias:', error);
    }
  };

  const salvarLocalizacoesStorage = async (novaLista) => {
    setLocalizacoes(novaLista);
    try {
      await AsyncStorage.setItem(CHAVE_LOCALIZACOES, JSON.stringify(novaLista));
    } catch (error) {
      console.log('Erro ao salvar localizacoes:', error);
    }
  };

  // --- CRUD DE MATERIAIS ---
  const adicionarMaterial = (novoItem) => {
    const novaLista = [...materiais, novoItem];
    salvarMateriaisStorage(novaLista);
  };

  const editarMaterial = (itemEditado) => {
    const novaLista = materiais.map((item) =>
      item.id === itemEditado.id
        ? { ...itemEditado, quantidade: item.quantidade }
        : item
    );
    salvarMateriaisStorage(novaLista);
  };

  const atualizarEstoque = (id, novaQuantidade) => {
    const novaLista = materiais.map((item) =>
      item.id === id ? { ...item, quantidade: novaQuantidade } : item
    );
    salvarMateriaisStorage(novaLista);
  };

  const removerMaterial = (id) => {
    const novaLista = materiais.filter((item) => item.id !== id);
    salvarMateriaisStorage(novaLista);
  };

  // --- CRUD DE CATEGORIAS ---
  const adicionarCategoria = (nomeNovaCategoria) => {
    const nova = {
      id: Date.now().toString(),
      nome: nomeNovaCategoria,
    };
    salvarCategoriasStorage([...categorias, nova]);
  };

  const editarCategoria = (idCategoria, nomeAntigo, nomeNovo) => {
    const novasCategorias = categorias.map((cat) =>
      cat.id === idCategoria ? { ...cat, nome: nomeNovo } : cat
    );
    salvarCategoriasStorage(novasCategorias);

    const novosMateriais = materiais.map((item) =>
      item.categoria === nomeAntigo ? { ...item, categoria: nomeNovo } : item
    );
    salvarMateriaisStorage(novosMateriais);
  };

  const removerCategoria = (idCategoria) => {
    const novasCategorias = categorias.filter((cat) => cat.id !== idCategoria);
    salvarCategoriasStorage(novasCategorias);
  };

  // --- CRUD DE LOCALIZAÇÕES FÍSICAS ---
  const adicionarLocalizacao = (nomeNovaLocalizacao) => {
    const nova = {
      id: Date.now().toString(),
      nome: nomeNovaLocalizacao,
    };
    salvarLocalizacoesStorage([...localizacoes, nova]);
  };

  const editarLocalizacao = (idLocal, nomeAntigo, nomeNovo) => {
    const novasLocalizacoes = localizacoes.map((loc) =>
      loc.id === idLocal ? { ...loc, nome: nomeNovo } : loc
    );
    salvarLocalizacoesStorage(novasLocalizacoes);

    const novosMateriais = materiais.map((item) =>
      item.localizacao === nomeAntigo
        ? { ...item, localizacao: nomeNovo }
        : item
    );
    salvarMateriaisStorage(novosMateriais);
  };

  const removerLocalizacao = (idLocal) => {
    const novasLocalizacoes = localizacoes.filter((loc) => loc.id !== idLocal);
    salvarLocalizacoesStorage(novasLocalizacoes);
  };

  return (
    <NavigationContainer>
      {EstaLogado ? (
        <Drawer.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#4F46E5' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
            drawerActiveBackgroundColor: '#EEF2FF',
            drawerActiveTintColor: '#4F46E5',
            drawerInactiveTintColor: '#334155',
            drawerLabelStyle: { fontWeight: 'bold', fontSize: 14 },
          }}
        >
          <Drawer.Screen
            name="AcervoStack"
            options={{
              title: 'Acervo Principal',
              headerShown: false,
            }}
          >
            {({ navigation: drawerNav }) => (
              <Stack.Navigator
                screenOptions={{
                  headerStyle: { backgroundColor: '#4F46E5' },
                  headerTintColor: '#FFFFFF',
                  headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
                  headerShadowVisible: false,
                }}
              >
                <Stack.Screen
                  name="Home"
                  options={{
                    title: 'Inventário - Dra. Luna',
                    headerLeft: () => (
                      <Pressable
                        onPress={() => drawerNav.openDrawer()}
                        style={{ marginRight: 16, padding: 4 }}
                      >
                        <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' }}>
                          ☰
                        </Text>
                      </Pressable>
                    ),
                  }}
                >
                  {(props) => (
                    <Home
                      {...props}
                      materiais={materiais}
                      atualizarEstoque={atualizarEstoque}
                      removerMaterial={removerMaterial}
                    />
                  )}
                </Stack.Screen>

                <Stack.Screen
                  name="Cadastro"
                  options={{ title: 'Ficha do Material' }}
                >
                  {(props) => (
                    <Cadastro
                      {...props}
                      categorias={categorias}
                      localizacoes={localizacoes}
                      adicionarMaterial={adicionarMaterial}
                      editarMaterial={editarMaterial}
                    />
                  )}
                </Stack.Screen>

                <Stack.Screen
                  name="CategoriasStack"
                  options={{ title: 'Gerenciar Categorias' }}
                >
                  {(props) => (
                    <Categorias
                      {...props}
                      categorias={categorias}
                      materiais={materiais}
                      adicionarCategoria={adicionarCategoria}
                      editarCategoria={editarCategoria}
                      removerCategoria={removerCategoria}
                    />
                  )}
                </Stack.Screen>

                <Stack.Screen
                  name="LocalizacoesStack"
                  options={{ title: 'Gerenciar Locais Físicos' }}
                >
                  {(props) => (
                    <Localizacoes
                      {...props}
                      localizacoes={localizacoes}
                      materiais={materiais}
                      adicionarLocalizacao={adicionarLocalizacao}
                      editarLocalizacao={editarLocalizacao}
                      removerLocalizacao={removerLocalizacao}
                    />
                  )}
                </Stack.Screen>
              </Stack.Navigator>
            )}
          </Drawer.Screen>

          <Drawer.Screen
            name="CategoriasDrawer"
            options={{ title: 'Categorias' }}
          >
            {(props) => (
              <Categorias
                {...props}
                categorias={categorias}
                materiais={materiais}
                adicionarCategoria={adicionarCategoria}
                editarCategoria={editarCategoria}
                removerCategoria={removerCategoria}
              />
            )}
          </Drawer.Screen>

          <Drawer.Screen
            name="LocalizacoesDrawer"
            options={{ title: 'Locais Físicos' }}
          >
            {(props) => (
              <Localizacoes
                {...props}
                localizacoes={localizacoes}
                materiais={materiais}
                adicionarLocalizacao={adicionarLocalizacao}
                editarLocalizacao={editarLocalizacao}
                removerLocalizacao={removerLocalizacao}
              />
            )}
          </Drawer.Screen>

          <Drawer.Screen
            name="Sair"
            options={{ title: 'Sair do Sistema' }}
          >
            {() => <TelaSair funcLogar={setLogado} />}
          </Drawer.Screen>
        </Drawer.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="Login"
            component={Login}
            initialParams={{ funcLogar: setLogado }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}