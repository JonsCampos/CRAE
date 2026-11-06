import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Modal,
  Pressable,
  Vibration,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64';
import { loginStyles as styles } from '../styles';

export default function Login({ route }) {
  const [x, setX] = useState(1);
  const [usr, setUsr] = useState('');
  const [pwd, setPwd] = useState('');
  const [carregando, setCarregando] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [mensagemModal, setMensagemModal] = useState('');

  const exibirModal = (texto, isErro = true) => {
    if (isErro) {
      Vibration.vibrate(400);
    }
    setMensagemModal(texto);
    setModalVisible(true);
  };

  const alternarModo = (novoModo) => {
    setUsr('');
    setPwd('');
    setX(novoModo);
  };

  const regexUsuario = /^\w{3,}$/;

  const _storeData = async (usuario, senha) => {
    const userLimpo = usuario.trim();
    if (userLimpo === '' || senha.trim() === '') {
      exibirModal('Por favor, preencha o usuário e a senha para criar sua conta.', true);
      return;
    }
    if (!regexUsuario.test(userLimpo)) {
      exibirModal('O usuário deve ter pelo menos 3 caracteres alfanuméricos (sem espaços).', true);
      return;
    }

    try {
      setCarregando(true);
      let senhaCriptografada = base64.encode(senha);
      await AsyncStorage.setItem(`@user_${userLimpo.toLowerCase()}`, senhaCriptografada);
      setCarregando(false);
      alternarModo(1);
      exibirModal('Conta criada com sucesso! Faça seu login para continuar.', false);
    } catch (error) {
      setCarregando(false);
      exibirModal('Erro ao salvar usuário: ' + error.message, true);
    }
  };

  const _retrieveData = async (usuario, senha) => {
    const userLimpo = usuario.trim();
    if (userLimpo === '' || senha.trim() === '') {
      exibirModal('Informe seu usuário e senha para acessar o acervo.', true);
      return;
    }
    try {
      setCarregando(true);
      const senhaSalva = await AsyncStorage.getItem(`@user_${userLimpo.toLowerCase()}`);
      let senhaDigitadaCripto = base64.encode(senha);
      setCarregando(false);

      if (
        (senhaSalva !== null && senhaSalva === senhaDigitadaCripto) ||
        (userLimpo.toLowerCase() === 'luna' && senha === '123')
      ) {
        route.params.funcLogar(true);
      } else {
        exibirModal('Credenciais inválidas! Verifique seu usuário e senha.', true);
      }
    } catch (error) {
      setCarregando(false);
      exibirModal('Erro ao ler dados: ' + error.message, true);
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
              style={styles.botaoPrimarioModal}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textoBotaoPrimario}>Entendi</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.card}>
        <Text style={styles.titulo}>Acervo e Inventário</Text>
        <Text style={styles.subtitulo}>
          {x === 1
            ? 'Gestão de Materiais - Dra. Luna Ribeiro'
            : 'Criar Nova Credencial de Acesso'}
        </Text>

        <Text style={styles.label}>USUÁRIO / MATRÍCULA</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: luna"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          value={usr}
          onChangeText={setUsr}
        />

        <Text style={styles.label}>SENHA DE ACESSO</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha (padrão: 123)"
          placeholderTextColor="#94A3B8"
          secureTextEntry={true}
          value={pwd}
          onChangeText={setPwd}
        />

        {carregando ? (
          <ActivityIndicator size="large" color="#4F46E5" animating={true} />
        ) : x === 1 ? (
          <>
            <Pressable
              style={styles.botaoPrimario}
              onPress={() => _retrieveData(usr, pwd)}
            >
              <Text style={styles.textoBotaoPrimario}>Entrar no Sistema</Text>
            </Pressable>

            <View style={styles.divisorLinha}>
              <View style={styles.traco} />
              <Text style={styles.divisorTexto}>ou</Text>
              <View style={styles.traco} />
            </View>

            <Pressable
              style={styles.botaoSecundario}
              onPress={() => alternarModo(2)}
            >
              <Text style={styles.textoBotaoSecundario}>Criar nova conta</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              style={styles.botaoSucesso}
              onPress={() => _storeData(usr, pwd)}
            >
              <Text style={styles.textoBotaoPrimario}>Confirmar Cadastro</Text>
            </Pressable>

            <View style={styles.divisorLinha}>
              <View style={styles.traco} />
              <Text style={styles.divisorTexto}>ou</Text>
              <View style={styles.traco} />
            </View>

            <Pressable
              style={styles.botaoSecundario}
              onPress={() => alternarModo(1)}
            >
              <Text style={styles.textoBotaoSecundario}>Voltar para o Login</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}