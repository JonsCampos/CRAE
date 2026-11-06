import React, { useState } from 'react';
import { Pressable, Text } from 'react-native';
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

const COR_PRIMARIA = '#4F46E5';

export default function App() {
  const [usuarioAtual, setUsuarioAtual] = useState(null);

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
      <Tab.Screen name="Material" component={Home} options={{ tabBarLabel: 'Material' }} />
      <Tab.Screen name="Categorias" component={Categorias} options={{ tabBarLabel: 'Categorias' }} />
      <Tab.Screen name="Locais" component={Localizacoes} options={{ tabBarLabel: 'Locais' }} />

      {usuarioAtual?.nivel === 0 ? (
        <Tab.Screen name="Usuarios" options={{ tabBarLabel: 'Usuários' }}>
          {(props) => (
            <Usuarios
              {...props}
              usuarioAtual={usuarioAtual}
              atualizarUsuarioLogado={setUsuarioAtual}
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
            component={Cadastro}
            options={{ title: 'Ficha do Material' }}
          />
          <Stack.Screen
            name="CategoriasStack"
            component={Categorias}
            options={{ title: 'Gerenciar Categorias' }}
          />
          <Stack.Screen
            name="LocalizacoesStack"
            component={Localizacoes}
            options={{ title: 'Gerenciar Locais Físicos' }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login">
            {(props) => (
              <Login
                {...props}
                aoLogar={(usr) => setUsuarioAtual(usr)}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}