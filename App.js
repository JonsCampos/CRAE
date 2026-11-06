import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './screens/Login';
import Home from './screens/Home';
import Cadastro from './screens/Cadastro';
import Categorias from './screens/Categorias';

const Stack = createNativeStackNavigator();

const CATEGORIAS_INICIAIS = [
  { id: 'c1', nome: 'Equipamentos de Áudio/Vídeo' },
  { id: 'c2', nome: 'Bibliografia e Documentos' },
  { id: 'c3', nome: 'Material de Campo / Escritório' },
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

export default function App() {
  const [EstaLogado, setLogado] = useState(false);
  const [materiais, setMateriais] = useState(DADOS_INICIAIS);
  const [categorias, setCategorias] = useState(CATEGORIAS_INICIAIS);

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

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#4F46E5' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          headerShadowVisible: false,
        }}
      >
        {EstaLogado ? (
          <>
            <Stack.Screen name="Home" options={{ title: 'Inventário • Dra. Luna' }}>
              {(props) => (
                <Home
                  {...props}
                  materiais={materiais}
                  atualizarEstoque={atualizarEstoque}
                  removerMaterial={removerMaterial}
                  funcLogar={setLogado}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Cadastro" options={{ title: 'Ficha do Material' }}>
              {(props) => (
                <Cadastro
                  {...props}
                  categorias={categorias}
                  adicionarMaterial={adicionarMaterial}
                  editarMaterial={editarMaterial}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Categorias" options={{ title: 'Gerenciar Categorias' }}>
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
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
            initialParams={{ funcLogar: setLogado }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}