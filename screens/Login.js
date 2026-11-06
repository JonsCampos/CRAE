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
import base64 from 'react-native-base64';
import { loginStyles as styles } from '../styles';

export default function Login({ usuarios, aoLogar }) {
  const [usr, setUsr] = useState('');
  const [pwd, setPwd] = useState('');
  const [carregando, setCarregando] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [mensagemModal, setMensagemModal] = useState('');

  const exibirModalErro = (texto) => {
    Vibration.vibrate(400); // Garante a vibração no erro de login
    setMensagemModal(texto);
    setModalVisible(true);
  };

  const realizarLogin = () => {
    const userLimpo = usr.trim().toLowerCase();
    if (userLimpo === '' || pwd.trim() === '') {
      exibirModalErro('Informe seu usuário e senha para acessar o acervo.');
      return;
    }

    setCarregando(true);
    const senhaDigitadaCripto = base64.encode(pwd);

    const usuarioEncontrado = (usuarios || []).find(
      (u) =>
        u.login.toLowerCase() === userLimpo &&
        u.senha === senhaDigitadaCripto
    );

    setCarregando(false);

    if (usuarioEncontrado) {
      aoLogar(usuarioEncontrado);
    } else {
      exibirModalErro('Credenciais inválidas! Verifique seu usuário e senha.');
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
          Gestão de Materiais - Dra. Luna Ribeiro
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
        ) : (
          <Pressable style={styles.botaoPrimario} onPress={realizarLogin}>
            <Text style={styles.textoBotaoPrimario}>Entrar no Sistema</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}