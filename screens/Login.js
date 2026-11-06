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
import { loginStyles as styles } from '../styles/styles';
import { supabase } from '../database/supabase';

export default function Login({ aoLogar }) {
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

  const realizarLogin = async () => {
    const usrLimpo = usr.trim();
    if (usrLimpo === '' || pwd === '') {
      exibirModalErro('Informe seu usuário e senha para acessar o acervo.');
      return;
    }

    setCarregando(true);
    const senhaDigitadaCripto = base64.encode(pwd);

    try {
      const { data, error } = await supabase
        .from('GM_Usuarios')
        .select('*')
        .ilike('NmUsuario', usrLimpo)
        .maybeSingle();

      setCarregando(false);

      if (error || !data) {
        exibirModalErro('Credenciais inválidas! Verifique seu usuário e senha.');
        return;
      }

      // Compara a senha criptografada armazenada no banco (PswUsuario) com a digitada
      if (data.PswUsuario === senhaDigitadaCripto) {
        // Formata o objeto do usuário logado padronizando com os atributos do app
        const usuarioLogado = {
          id: String(data.IdUsuario),
          login: data.NmUsuario,
          senha: data.PswUsuario,
          nivel: data.NvlUsuario !== undefined && data.NvlUsuario !== null ? Number(data.NvlUsuario) : 1, // 0 = Admin, 1 = Comum
        };

        aoLogar(usuarioLogado);
      } else {
        exibirModalErro('Credenciais inválidas! Verifique seu usuário e senha.');
      }
    } catch (err) {
      setCarregando(false);
      console.log('Erro ao tentar realizar login:', err);
      exibirModalErro('Ocorreu um erro de conexão. Tente novamente.');
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
        <Text style={styles.titulo}>CRAE</Text>
        <Text style={styles.subtitulo}>
          Gestão de Ativos de Estoque
        </Text>

        <Text style={styles.label}>USUÁRIO</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu usuário"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          value={usr}
          onChangeText={setUsr}
        />

        <Text style={styles.label}>SENHA DE ACESSO</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
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