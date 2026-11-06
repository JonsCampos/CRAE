import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64';

export default function Login({ route }) {
  const [x, setX] = useState(1); // 1 = Login | 2 = Cadastro (Aula5.txt)
  const [usr, setUsr] = useState('');
  const [pwd, setPwd] = useState('');
  const [carregando, setCarregando] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [mensagemModal, setMensagemModal] = useState('');

  const exibirModal = (texto) => {
    setMensagemModal(texto);
    setModalVisible(true);
  };

  const alternarModo = (novoModo) => {
    setUsr('');
    setPwd('');
    setX(novoModo);
  };

  const _storeData = async (usuario, senha) => {
    if (usuario.trim() === '' || senha.trim() === '') {
      exibirModal('Por favor, preencha o usuário e a senha para criar sua conta.');
      return;
    }
    try {
      setCarregando(true);
      let senhaCriptografada = base64.encode(senha);
      await AsyncStorage.setItem(usuario.trim(), senhaCriptografada);
      setCarregando(false);
      alternarModo(1);
      exibirModal('Conta criada com sucesso! Faça seu login para continuar.');
    } catch (error) {
      setCarregando(false);
      exibirModal('Erro ao salvar usuário: ' + error.message);
    }
  };

  const _retrieveData = async (usuario, senha) => {
    if (usuario.trim() === '' || senha.trim() === '') {
      exibirModal('Informe seu usuário e senha para acessar o acervo.');
      return;
    }
    try {
      setCarregando(true);
      const senhaSalva = await AsyncStorage.getItem(usuario.trim());
      let senhaDigitadaCripto = base64.encode(senha);
      setCarregando(false);

      if (
        (senhaSalva !== null && senhaSalva === senhaDigitadaCripto) ||
        (usuario.trim().toLowerCase() === 'luna' && senha === '123')
      ) {
        route.params.funcLogar(true);
      } else {
        exibirModal('Credenciais inválidas! Verifique seu usuário e senha.');
      }
    } catch (error) {
      setCarregando(false);
      exibirModal('Erro ao ler dados: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Modal de Avisos */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCaixa}>
            <Text style={styles.modalIcone}>🔔</Text>
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
        <View style={styles.iconeCirculo}>
          <Text style={styles.iconeTexto}>📦</Text>
        </View>

        <Text style={styles.titulo}>Acervo & Inventário</Text>
        <Text style={styles.subtitulo}>
          {x === 1
            ? 'Gestão de Materiais • Dra. Luna Ribeiro'
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 26,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  iconeCirculo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF2FF',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconeTexto: { fontSize: 28 },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
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
  botaoPrimario: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  botaoSucesso: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  textoBotaoPrimario: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  botaoSecundario: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textoBotaoSecundario: {
    color: '#475569',
    fontSize: 14,
    fontWeight: 'bold',
  },
  divisorLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  traco: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  divisorTexto: {
    marginHorizontal: 10,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  modalFundo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  modalCaixa: {
    width: '84%',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalIcone: { fontSize: 32, marginBottom: 8 },
  modalTexto: {
    fontSize: 15,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  botaoPrimarioModal: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
});