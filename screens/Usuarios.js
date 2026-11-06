import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  SectionList,
  Modal,
  Pressable,
  Vibration,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import base64 from 'react-native-base64';
import { crudListaStyles as styles } from '../styles';
import { supabase } from '../App';

export default function Usuarios({ usuarioAtual }) {
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState('');

  // Estados do Modal de Criar Usuário (1 = Comum por padrão)
  const [modalCriarVisible, setModalCriarVisible] = useState(false);
  const [novoLogin, setNovoLogin] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [novoNivel, setNovoNivel] = useState(1);
  const [erroCriar, setErroCriar] = useState('');

  // Estados do Modal de Editar Usuário
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [loginEdicao, setLoginEdicao] = useState('');
  const [senhaEdicao, setSenhaEdicao] = useState('');
  const [nivelEdicao, setNivelEdicao] = useState(1);
  const [erroEditar, setErroEditar] = useState('');

  // Estados de Aviso e Exclusão
  const [modalAvisoVisible, setModalAvisoVisible] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState('');
  const [modalExcluirVisible, setModalExcluirVisible] = useState(false);

  const regexUsuario = /^\w{3,}$/;

  // --- BUSCAR DADOS DO SUPABASE ---
  const carregarUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('GM_Usuarios')
        .select('*');

      if (error) {
        console.log('Erro ao buscar usuários:', error.message);
      } else if (data) {
        const usuariosFormatados = data.map((u) => ({
          id: String(u.IdUsuario || u.id),
          login: u.NmUsuario || u.login,
          senha: u.PswUsuario || u.senha,
          nivel: u.NvlUsuario !== undefined && u.NvlUsuario !== null ? Number(u.NvlUsuario) : 1,
        }));
        setUsuarios(usuariosFormatados);
      }
    } catch (err) {
      console.log('Erro na conexão com o Supabase:', err);
    }
  };

  // useFocusEffect garante que a lista recarregue sempre que a aba ganha foco
  useFocusEffect(
    useCallback(() => {
      carregarUsuarios();
    }, [])
  );

  const mostrarAvisoErro = (msg) => {
    Vibration.vibrate(400);
    setMensagemAviso(msg);
    setModalAvisoVisible(true);
  };

  // CREATE
  const abrirModalCriar = () => {
    setNovoLogin('');
    setNovaSenha('');
    setNovoNivel(1); // 1 = Usuário Comum
    setErroCriar('');
    setModalCriarVisible(true);
  };

  const confirmarCriacaoUsuario = async () => {
    if (novoLogin === '' || novaSenha === '') {
      Vibration.vibrate(400);
      setErroCriar('Preencha o login e a senha.');
      return;
    }

    if (!regexUsuario.test(novoLogin)) {
      Vibration.vibrate(400);
      setErroCriar('O login deve ter pelo menos 3 caracteres alfanuméricos (sem espaços).');
      return;
    }

    const jaExiste = usuarios.some(
      (u) => u.login === novoLogin
    );
    if (jaExiste) {
      Vibration.vibrate(400);
      setErroCriar('Já existe um usuário cadastrado com este login.');
      return;
    }

    const { error } = await supabase
      .from('GM_Usuarios')
      .insert([
        {
          NmUsuario: novoLogin,
          PswUsuario: base64.encode(novaSenha),
          NvlUsuario: Number(novoNivel), // Salva 0 (Admin) ou 1 (Comum)
        },
      ]);

    if (error) {
      mostrarAvisoErro('Erro ao cadastrar usuário: ' + error.message);
      return;
    }

    setModalCriarVisible(false);
    carregarUsuarios();
  };

  // UPDATE
  const abrirModalEdicao = (usr) => {
    setUsuarioSelecionado(usr);
    setLoginEdicao(usr.login);
    setSenhaEdicao('');
    setNivelEdicao(usr.nivel);
    setErroEditar('');
    setModalEditarVisible(true);
  };

  const salvarEdicaoUsuario = async () => {
    if (loginEdicao === '') {
      Vibration.vibrate(400);
      setErroEditar('O login não pode ficar vazio.');
      return;
    }

    if (!regexUsuario.test(loginEdicao)) {
      Vibration.vibrate(400);
      setErroEditar('O login deve ter pelo menos 3 caracteres alfanuméricos.');
      return;
    }

    const jaExiste = usuarios.some(
      (u) =>
        u.id !== usuarioSelecionado.id &&
        u.login === loginEdicao
    );
    if (jaExiste) {
      Vibration.vibrate(400);
      setErroEditar('Já existe outro usuário com este login.');
      return;
    }

    // Impede o usuário logado de remover o próprio privilégio de Admin (Nível 0)
    if (
      usuarioAtual &&
      usuarioSelecionado.id === usuarioAtual.id &&
      Number(nivelEdicao) !== 0
    ) {
      Vibration.vibrate(400);
      setErroEditar('Você não pode remover seu próprio nível de Administrador.');
      return;
    }

    const senhaFinal =
      senhaEdicao !== '' ? base64.encode(senhaEdicao) : usuarioSelecionado.senha;

    const { error } = await supabase
      .from('GM_Usuarios')
      .update({
        NmUsuario: loginEdicao,
        PswUsuario: senhaFinal,
        NvlUsuario: Number(nivelEdicao),
      })
      .eq('IdUsuario', usuarioSelecionado.id);

    if (error) {
      mostrarAvisoErro('Erro ao atualizar usuário: ' + error.message);
      return;
    }

    setModalEditarVisible(false);
    setUsuarioSelecionado(null);
    carregarUsuarios();
  };

  // DELETE
  const tentarExcluirUsuario = (usr) => {
    if (
      usuarioAtual &&
      (usr.id === usuarioAtual.id ||
        usr.login === usuarioAtual.login)
    ) {
      mostrarAvisoErro(
        'Operação bloqueada: Você não pode excluir o seu próprio usuário enquanto estiver logado.'
      );
      return;
    }

    setUsuarioSelecionado(usr);
    setModalExcluirVisible(true);
  };

  const confirmarExclusao = async () => {
    if (usuarioSelecionado) {
      const { error } = await supabase
        .from('GM_Usuarios')
        .delete()
        .eq('IdUsuario', usuarioSelecionado.id);

      if (error) {
        mostrarAvisoErro('Erro ao excluir usuário: ' + error.message);
      } else {
        carregarUsuarios();
      }
    }
    setModalExcluirVisible(false);
    setUsuarioSelecionado(null);
  };

  // Filtros e Listagem por Seção
  const termo = (busca || '');
  const usuariosFiltrados = (usuarios || []).filter((u) => {
    const login = (u.login || '');
    const nivelTexto = u.nivel === 0 ? 'administrador admin' : 'normal comum';
    return login.includes(termo) || nivelTexto.includes(termo);
  });

  const listaAdmins = usuariosFiltrados.filter((u) => u.nivel === 0);
  const listaNormais = usuariosFiltrados.filter((u) => u.nivel !== 0);

  const secoesUsuarios = [];
  if (listaAdmins.length > 0) {
    secoesUsuarios.push({ title: 'Administradores', data: listaAdmins });
  }
  if (listaNormais.length > 0) {
    secoesUsuarios.push({ title: 'Usuários Normais', data: listaNormais });
  }

  const SeletorNivel = ({ valorAtual, aoSelecionar }) => (
    <View style={{ flexDirection: 'row', width: '100%', marginBottom: 14 }}>
      <Pressable
        style={{
          flex: 1,
          paddingVertical: 10,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: valorAtual === 1 ? '#4F46E5' : '#CBD5E1',
          backgroundColor: valorAtual === 1 ? '#EEF2FF' : '#F8FAFC',
          alignItems: 'center',
          marginRight: 6,
        }}
        onPress={() => aoSelecionar(1)}
      >
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 13,
            color: valorAtual === 1 ? '#4F46E5' : '#64748B',
          }}
        >
          Normal
        </Text>
      </Pressable>

      <Pressable
        style={{
          flex: 1,
          paddingVertical: 10,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: valorAtual === 0 ? '#4F46E5' : '#CBD5E1',
          backgroundColor: valorAtual === 0 ? '#EEF2FF' : '#F8FAFC',
          alignItems: 'center',
        }}
        onPress={() => aoSelecionar(0)}
      >
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 13,
            color: valorAtual === 0 ? '#4F46E5' : '#64748B',
          }}
        >
          Admin
        </Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* MODAL 1: Criar Novo Usuário */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalCriarVisible}
        onRequestClose={() => setModalCriarVisible(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCaixa}>
            <Text style={styles.modalTitulo}>Novo Usuário</Text>

            <TextInput
              style={styles.inputModal}
              placeholder="Login / Matrícula (ex: carlos)"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              value={novoLogin}
              onChangeText={(t) => {
                setNovoLogin(t);
                setErroCriar('');
              }}
            />

            <TextInput
              style={styles.inputModal}
              placeholder="Senha de acesso"
              placeholderTextColor="#94A3B8"
              secureTextEntry={true}
              value={novaSenha}
              onChangeText={(t) => {
                setNovaSenha(t);
                setErroCriar('');
              }}
            />

            <Text
              style={{
                fontSize: 11,
                fontWeight: 'bold',
                color: '#475569',
                alignSelf: 'flex-start',
                marginBottom: 6,
              }}
            >
              NÍVEL DE ACESSO:
            </Text>
            <SeletorNivel valorAtual={novoNivel} aoSelecionar={setNovoNivel} />

            {erroCriar !== '' ? (
              <Text style={styles.textoErro}>{erroCriar}</Text>
            ) : null}

            <View style={styles.botoesLinhaModal}>
              <Pressable
                style={styles.botaoCinza}
                onPress={() => setModalCriarVisible(false)}
              >
                <Text style={styles.textoBotaoCinza}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.botaoVerde}
                onPress={confirmarCriacaoUsuario}
              >
                <Text style={styles.textoBotaoModal}>Cadastrar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Editar Usuário */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalEditarVisible}
        onRequestClose={() => setModalEditarVisible(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCaixa}>
            <Text style={styles.modalTitulo}>Editar Usuário</Text>

            <TextInput
              style={styles.inputModal}
              placeholder="Login / Matrícula"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              value={loginEdicao}
              onChangeText={(t) => {
                setLoginEdicao(t);
                setErroEditar('');
              }}
            />

            <TextInput
              style={styles.inputModal}
              placeholder="Nova senha (deixe vazio p/ manter)"
              placeholderTextColor="#94A3B8"
              secureTextEntry={true}
              value={senhaEdicao}
              onChangeText={(t) => {
                setSenhaEdicao(t);
                setErroEditar('');
              }}
            />

            <Text
              style={{
                fontSize: 11,
                fontWeight: 'bold',
                color: '#475569',
                alignSelf: 'flex-start',
                marginBottom: 6,
              }}
            >
              NÍVEL DE ACESSO:
            </Text>
            <SeletorNivel
              valorAtual={nivelEdicao}
              aoSelecionar={(n) => {
                setNivelEdicao(n);
                setErroEditar('');
              }}
            />

            {erroEditar !== '' ? (
              <Text style={styles.textoErro}>{erroEditar}</Text>
            ) : null}

            <View style={styles.botoesLinhaModal}>
              <Pressable
                style={styles.botaoCinza}
                onPress={() => setModalEditarVisible(false)}
              >
                <Text style={styles.textoBotaoCinza}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.botaoAzul}
                onPress={salvarEdicaoUsuario}
              >
                <Text style={styles.textoBotaoModal}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: Avisos e Bloqueios */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalAvisoVisible}
        onRequestClose={() => setModalAvisoVisible(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCaixa}>
            <Text style={styles.modalTexto}>{mensagemAviso}</Text>
            <Pressable
              style={styles.botaoAzulUnico}
              onPress={() => setModalAvisoVisible(false)}
            >
              <Text style={styles.textoBotaoModal}>Entendi</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: Confirmar Exclusão */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalExcluirVisible}
        onRequestClose={() => setModalExcluirVisible(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCaixa}>
            <Text style={styles.modalTitulo}>Excluir Usuário</Text>
            <Text style={styles.modalTexto}>
              Deseja realmente excluir o usuário "{usuarioSelecionado?.login}"?
            </Text>
            <View style={styles.botoesLinhaModal}>
              <Pressable
                style={styles.botaoCinza}
                onPress={() => setModalExcluirVisible(false)}
              >
                <Text style={styles.textoBotaoCinza}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.botaoVermelho}
                onPress={confirmarExclusao}
              >
                <Text style={styles.textoBotaoModal}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Pressable style={styles.botaoNovaCategoria} onPress={abrirModalCriar}>
        <Text style={styles.textoBotaoNovo}>+ Novo Usuário</Text>
      </Pressable>

      <TextInput
        style={styles.inputBusca}
        placeholder="Buscar usuário por login ou nível..."
        placeholderTextColor="#64748B"
        value={busca}
        onChangeText={setBusca}
      />

      <SectionList
        sections={secoesUsuarios}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section: { title, data } }) => (
          <View style={styles.headerSecaoBox}>
            <Text style={styles.headerSecaoTexto}>{title}</Text>
            <Text style={styles.headerSecaoCount}>{data.length}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#94A3B8', marginTop: 20 }}>
            Nenhum usuário encontrado.
          </Text>
        }
        renderItem={({ item }) => {
          const isProprioUsuario =
            usuarioAtual &&
            (item.id === usuarioAtual.id ||
              item.login === usuarioAtual.login);

          return (
            <View style={styles.cardItem}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.nomeItem}>
                  {item.login} {isProprioUsuario ? '(Você)' : ''}
                </Text>
                <Text style={styles.contadorItens}>
                  Nível: {item.nivel === 0 ? 'Administrador' : 'Normal'}
                </Text>
              </View>

              <View style={styles.botoesAcao}>
                <Pressable
                  style={styles.botaoCardEditar}
                  onPress={() => abrirModalEdicao(item)}
                >
                  <Text style={styles.textoCardEditar}>Editar</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.botaoCardExcluir,
                    isProprioUsuario ? { opacity: 0.4 } : null,
                  ]}
                  onPress={() => tentarExcluirUsuario(item)}
                >
                  <Text
                    style={{
                      color: '#DC2626',
                      fontWeight: 'bold',
                      fontSize: 12,
                    }}
                  >
                    Excluir
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}