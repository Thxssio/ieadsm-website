
/**
 * Valida um número de CPF.
 * @param {string} cpf - O CPF a ser validado (pode conter máscara).
 * @returns {boolean} - Retorna true se o CPF for válido, false caso contrário.
 */


export function validateCPF(cpf) {
  cpf = String(cpf).replace(/[^\d]+/g, '');
  if (cpf === '') return false;
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let add = 0;
  for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(9))) return false;
  add = 0;
  for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(10))) return false;
  return true;
}

/**
 * Aplica a máscara de CPF (###.###.###-##) a uma string.
 * @param {string} value - A string de CPF a ser mascarada.
 * @returns {string} - O CPF com a máscara aplicada.
 */
export function maskCPF(value) {
  return value
    .replace(/\D/g, '') // Remove tudo o que não é dígito
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos de novo (para o segundo bloco)
    .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca um hífen entre o terceiro e o quarto dígitos
    .slice(0, 14); // Limita o tamanho
}
