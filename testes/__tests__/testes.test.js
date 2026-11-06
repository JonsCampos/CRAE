import { calcularMovimentacaoEstoque } from '../../screens/Home';
import { regexUsuario, criptografarSenha } from '../../screens/Usuarios';

// =========================================================================
// CASO DE TESTE 1: Valida a regra real de estoque importada de Home.js
// =========================================================================
test('Entrada de Estoque com Sucesso (Home.js)', () => {
  const resultado = calcularMovimentacaoEstoque(10, 5, 'entrada');
  expect(resultado).toEqual(15);
});

test('Bloqueio de Saida Maior que o Estoque (Home.js)', () => {
  const resultado = calcularMovimentacaoEstoque(10, 15, 'saida');
  expect(resultado).toEqual(-1);
});

// =========================================================================
// CASO DE TESTE 2: Valida o Regex e a criptografia reais importados de Usuarios.js
// =========================================================================
test('Validacao de Regex de Usuario e Criptografia Base64 (Usuarios.js)', () => {
  const loginExemplo = 'luna';
  const senhaCriptografada = criptografarSenha('123');

  // Testa se o login atende à restrição de no mínimo 3 caracteres alfanuméricos
  expect(loginExemplo).toMatch(regexUsuario);

  // Testa se a senha "123" é convertida corretamente para o hash base64 "MTIz"
  expect(senhaCriptografada).toBe('MTIz');
});