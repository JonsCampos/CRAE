import React, { useState, useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Login from './screens/Login';
import Home from './screens/Home';
import Cadastro from './screens/Cadastro';
import Categorias from './screens/Categorias';
import Localizacoes from './screens/Localizacoes';
import Usuarios from './screens/Usuarios';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CHAVE_MATERIAIS = '@inventario_materiais';
const CHAVE_CATEGORIAS = '@inventario_categorias';
const CHAVE_LOCALIZACOES = '@inventario_localizacoes';
const CHAVE_USUARIOS = '@inventario_usuarios';

const COR_PRIMARIA = '#4F46E5';

const USUARIO_PADRAO_LUNA = {
  id: 'u_luna_admin',
  login: 'luna',
  senha: base64.encode('123'),
  nivel: 'admin',
};

export default function App() {
  const [usuarioAtual, setUsuarioAtual] = useState(null);

  const [materiais, setMateriais] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [localizacoes, setLocalizacoes] = useState([]);
  const [usuarios, setUsuarios] = useState([USUARIO_PADRAO_LUNA]);

  useEffect(() => {
    const carregarDadosLocais = async () => {
      try {
        const matStr = await AsyncStorage.getItem(CHAVE_MATERIAIS);
        const catStr = await AsyncStorage.getItem(CHAVE_CATEGORIAS);
        const locStr = await AsyncStorage.getItem(CHAVE_LOCALIZACOES);
        const usrStr = await AsyncStorage.getItem(CHAVE_USUARIOS);

        if (matStr !== null) setMateriais(JSON.parse(matStr));
        if (catStr !== null) setCategorias(JSON.parse(catStr));
        if (locStr !== null) setLocalizacoes(JSON.parse(locStr));

        if (usrStr !== null) {
          const listaUsr = JSON.parse(usrStr);
          if (listaUsr.length > 0) {
            setUsuarios(listaUsr);
          } else {
            await AsyncStorage.setItem(
              CHAVE_USUARIOS,
              JSON.stringify([USUARIO_PADRAO_LUNA])
            );
          }
        } else {
          await AsyncStorage.setItem(
            CHAVE_USUARIOS,
            JSON.stringify([USUARIO_PADRAO_LUNA])
          );
        }
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

  const salvarUsuariosStorage = async (novaLista) => {
    setUsuarios(novaLista);
    try {
      await AsyncStorage.setItem(CHAVE_USUARIOS, JSON.stringify(novaLista));
    } catch (error) {
      console.log('Erro ao salvar usuarios:', error);
    }
  };

  // --- CRUD DE MATERIAIS ---
  const adicionarMaterial = (novoItem) => {
    salvarMateriaisStorage([...materiais, novoItem]);
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
    salvarMateriaisStorage(materiais.filter((item) => item.id !== id));
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
    salvarCategoriasStorage(categorias.filter((cat) => cat.id !== idCategoria));
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
    salvarLocalizacoesStorage(localizacoes.filter((loc) => loc.id !== idLocal));
  };

  // --- CRUD DE USUÁRIOS ---
  const adicionarUsuario = (dadosNovoUsuario) => {
    const novo = {
      id: Date.now().toString(),
      login: dadosNovoUsuario.login,
      senha: dadosNovoUsuario.senha,
      nivel: dadosNovoUsuario.nivel,
    };
    salvarUsuariosStorage([...usuarios, novo]);
  };

  const editarUsuario = (usuarioEditado) => {
    const novaLista = usuarios.map((u) =>
      u.id === usuarioEditado.id ? usuarioEditado : u
    );
    salvarUsuariosStorage(novaLista);

    if (usuarioAtual && usuarioAtual.id === usuarioEditado.id) {
      setUsuarioAtual(usuarioEditado);
    }
  };

  const removerUsuario = (idUsuario) => {
    salvarUsuariosStorage(usuarios.filter((u) => u.id !== idUsuario));
  };

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

  const AbasPrincipais = () => (
    <Tab.Navigator
      initialRouteName="Material"
      screenOptions={({ route }) => ({
        title: usuarioAtual?.login || '',
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: COR_PRIMARIA },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 16 },
        headerShadowVisible: false,
        headerLeft: () => (
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: 'bold',
              marginLeft: 16,
            }}
          >
            Inventário
          </Text>
        ),
        headerRight: () => (
          <Pressable
            onPress={() => setUsuarioAtual(null)}
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
            Usuarios: 'people-outline',
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

      {usuarioAtual?.nivel === 'admin' ? (
        <Tab.Screen name="Usuarios" options={{ tabBarLabel: 'Usuários' }}>
          {(props) => (
            <Usuarios
              {...props}
              usuarios={usuarios}
              usuarioAtual={usuarioAtual}
              adicionarUsuario={adicionarUsuario}
              editarUsuario={editarUsuario}
              removerUsuario={removerUsuario}
            />
          )}
        </Tab.Screen>
      ) : null}
    </Tab.Navigator>
  );

  return (
    <NavigationContainer>
      {usuarioAtual ? (
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
          <Stack.Screen name="Login">
            {(props) => (
              <Login
                {...props}
                usuarios={usuarios}
                aoLogar={(usr) => setUsuarioAtual(usr)}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}