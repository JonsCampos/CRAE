import React, { useState, useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Login from './screens/Login';
import Home from './screens/Home';
import Cadastro from './screens/Cadastro';
import Categorias from './screens/Categorias';
import Localizacoes from './screens/Localizacoes';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CHAVE_MATERIAIS = '@inventario_materiais';
const CHAVE_CATEGORIAS = '@inventario_categorias';
const CHAVE_LOCALIZACOES = '@inventario_localizacoes';

const COR_PRIMARIA = '#4F46E5';

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

  // Telas de Categorias e Locais reutilizadas (abas e rotas do Stack)
  const renderCategorias = (props) => (
    <Categorias
      {...props}
      categorias={categorias}
      materiais={materiais}
      adicionarCategoria={adicionarCategoria}
      editarCategoria={editarCategoria}
      removerCategoria={removerCategoria}
    />
  );

  const renderLocalizacoes = (props) => (
    <Localizacoes
      {...props}
      localizacoes={localizacoes}
      materiais={materiais}
      adicionarLocalizacao={adicionarLocalizacao}
      editarLocalizacao={editarLocalizacao}
      removerLocalizacao={removerLocalizacao}
    />
  );

  // Abas principais (Material, Categorias, Locais)
  const AbasPrincipais = () => (
    <Tab.Navigator
      initialRouteName="Material"
      screenOptions={({ route }) => ({
        title: 'Inventário - Dra. Luna',
        headerStyle: { backgroundColor: COR_PRIMARIA },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
        headerShadowVisible: false,
        headerRight: () => (
          <Pressable
            onPress={() => setLogado(false)}
            style={{ marginRight: 16, padding: 4 }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>
              Sair
            </Text>
          </Pressable>
        ),
        tabBarActiveTintColor: COR_PRIMARIA,
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: { fontWeight: 'bold', fontSize: 12 },
        tabBarIcon: ({ color, size }) => {
          const icones = {
            Material: 'cube-outline',
            Categorias: 'pricetags-outline',
            Locais: 'location-outline',
          };
          return <Ionicons name={icones[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Material" options={{ tabBarLabel: 'Material' }}>
        {(props) => (
          <Home
            {...props}
            materiais={materiais}
            atualizarEstoque={atualizarEstoque}
            removerMaterial={removerMaterial}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Categorias" options={{ tabBarLabel: 'Categorias' }}>
        {renderCategorias}
      </Tab.Screen>

      <Tab.Screen name="Locais" options={{ tabBarLabel: 'Locais' }}>
        {renderLocalizacoes}
      </Tab.Screen>
    </Tab.Navigator>
  );

  return (
    <NavigationContainer>
      {EstaLogado ? (
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: COR_PRIMARIA },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen
            name="Abas"
            component={AbasPrincipais}
            options={{ headerShown: false }}
          />

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

          {/* Usadas pelos botões "Gerenciar / Criar" dentro do Cadastro */}
          <Stack.Screen
            name="CategoriasStack"
            options={{ title: 'Gerenciar Categorias' }}
          >
            {renderCategorias}
          </Stack.Screen>

          <Stack.Screen
            name="LocalizacoesStack"
            options={{ title: 'Gerenciar Locais Físicos' }}
          >
            {renderLocalizacoes}
          </Stack.Screen>
        </Stack.Navigator>
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