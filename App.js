import React, { useState, useEffect } from 'react';
import { Pressable, Text } from 'react-native';
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

const CATEGORIAS_INICIAIS = [
  { id: 'c1', nome: 'Equipamentos de Áudio/Vídeo' },
  { id: 'c2', nome: 'Bibliografia e Documentos' },
  { id: 'c3', nome: 'Material de Campo / Escritório' },
];

const LOCALIZACOES_INICIAIS = [
  { id: 'l1', nome: 'Armário 2 - Gaveta B' },
  { id: 'l2', nome: 'Estante Principal - Prateleira 1' },
  { id: 'l3', nome: 'Sala de Pesquisa - Caixa Azul' },
];

const DADOS_INICIAIS = [
  {
    id: '1',
    nome: 'Gravador Digital Sony',
    categoria: 'Equipamentos de Áudio/Vídeo',
    descricao: 'Usado nas entrevistas de campo',
    localizacao: 'Armário 2 - Gaveta B',
    quantidade: 10,
  },
  {
    id: '2',
    nome: 'Microfone de Lapela',
    categoria: 'Equipamentos de Áudio/Vídeo',
    descricao: 'Cabo P2 de 2 metros com espuma',
    localizacao: 'Armário 2 - Gaveta B',
    quantidade: 4,
  },
  {
    id: '3',
    nome: 'Livros: Censo IBGE',
    categoria: 'Bibliografia e Documentos',
    descricao: 'Material de referência demográfica',
    localizacao: 'Estante Principal - Prateleira 1',
    quantidade: 12,
  },
  {
    id: '4',
    nome: 'Pranchetas de Acrílico',
    categoria: 'Material de Campo / Escritório',
    descricao: 'Apoio para aplicação de questionários',
    localizacao: 'Sala de Pesquisa - Caixa Azul',
    quantidade: 0,
  },
];

function TelaSair({ funcLogar }) {
  useEffect(() => {
    funcLogar(false);
  }, []);
  return null;
}

export default function App() {
  const [EstaLogado, setLogado] = useState(false);
  const [materiais, setMateriais] = useState(DADOS_INICIAIS);
  const [categorias, setCategorias] = useState(CATEGORIAS_INICIAIS);
  const [localizacoes, setLocalizacoes] = useState(LOCALIZACOES_INICIAIS);

  // --- CRUD DE MATERIAIS ---
  const adicionarMaterial = (novoItem) => {
    setMateriais((listaAtual) => [...listaAtual, novoItem]);
  };

  const editarMaterial = (itemEditado) => {
    setMateriais((listaAtual) =>
      listaAtual.map((item) =>
        item.id === itemEditado.id
          ? { ...itemEditado, quantidade: item.quantidade }
          : item
      )
    );
  };

  const atualizarEstoque = (id, novaQuantidade) => {
    setMateriais((listaAtual) =>
      listaAtual.map((item) =>
        item.id === id ? { ...item, quantidade: novaQuantidade } : item
      )
    );
  };

  const removerMaterial = (id) => {
    setMateriais((listaAtual) => listaAtual.filter((item) => item.id !== id));
  };

  // --- CRUD DE CATEGORIAS ---
  const adicionarCategoria = (nomeNovaCategoria) => {
    const nova = {
      id: Date.now().toString(),
      nome: nomeNovaCategoria,
    };
    setCategorias((listaAtual) => [...listaAtual, nova]);
  };

  const editarCategoria = (idCategoria, nomeAntigo, nomeNovo) => {
    setCategorias((listaAtual) =>
      listaAtual.map((cat) =>
        cat.id === idCategoria ? { ...cat, nome: nomeNovo } : cat
      )
    );
    setMateriais((listaAtual) =>
      listaAtual.map((item) =>
        item.categoria === nomeAntigo ? { ...item, categoria: nomeNovo } : item
      )
    );
  };

  const removerCategoria = (idCategoria) => {
    setCategorias((listaAtual) =>
      listaAtual.filter((cat) => cat.id !== idCategoria)
    );
  };

  // --- CRUD DE LOCALIZAÇÕES FÍSICAS ---
  const adicionarLocalizacao = (nomeNovaLocalizacao) => {
    const nova = {
      id: Date.now().toString(),
      nome: nomeNovaLocalizacao,
    };
    setLocalizacoes((listaAtual) => [...listaAtual, nova]);
  };

  const editarLocalizacao = (idLocal, nomeAntigo, nomeNovo) => {
    setLocalizacoes((listaAtual) =>
      listaAtual.map((loc) =>
        loc.id === idLocal ? { ...loc, nome: nomeNovo } : loc
      )
    );
    setMateriais((listaAtual) =>
      listaAtual.map((item) =>
        item.localizacao === nomeAntigo
          ? { ...item, localizacao: nomeNovo }
          : item
      )
    );
  };

  const removerLocalizacao = (idLocal) => {
    setLocalizacoes((listaAtual) =>
      listaAtual.filter((loc) => loc.id !== idLocal)
    );
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
          {/* Opção 1 do Drawer: O Acervo Principal (com Stack próprio que exibe a seta de voltar) */}
          <Drawer.Screen
            name="AcervoStack"
            options={{
              title: '📦 Acervo • Dra. Luna',
              headerShown: false, // O Stack interno controla o cabeçalho para ter o botão "Voltar"
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
                    title: 'Inventário • Dra. Luna',
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

                {/* Categorias dentro do Stack para abrir com seta de "Voltar" a partir do Novo Material */}
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

                {/* Localizações dentro do Stack para abrir com seta de "Voltar" a partir do Novo Material */}
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

          {/* Opção 2 do Drawer: Acesso direto a Categorias pelo menu lateral */}
          <Drawer.Screen
            name="CategoriasDrawer"
            options={{ title: '🗂️ Categorias' }}
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

          {/* Opção 3 do Drawer: Acesso direto a Locais Físicos pelo menu lateral */}
          <Drawer.Screen
            name="LocalizacoesDrawer"
            options={{ title: '📍 Locais Físicos' }}
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

          {/* Opção 4 do Drawer: Sair / Deslogar */}
          <Drawer.Screen
            name="Sair"
            options={{ title: '🚪 Sair do Sistema' }}
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