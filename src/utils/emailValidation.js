// Coincide con dominios que terminan en ".edu" o ".edu.<algo>" (.edu.mx,
// .edu.co, .edu.ar, etc.), igual que EmailValidationUtil en el backend.
// Se valida también aquí para dar feedback inmediato antes de mandar el
// código de verificación; el backend es la fuente de verdad real.
const EDU_DOMAIN_PATTERN = /\.edu(\.[a-z]{2,4})?$/i;

export function isEducationalEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const at = email.lastIndexOf('@');
  if (at < 0 || at === email.length - 1) return false;
  const domain = email.slice(at + 1).trim();
  return EDU_DOMAIN_PATTERN.test(domain);
}

export const EDU_EMAIL_MESSAGE = 'No se permite registrar cuentas con correos institucionales/educativos (.edu), ya que dejan de ser válidos cuando el alumno egresa de la escuela. Usa un correo personal.';
