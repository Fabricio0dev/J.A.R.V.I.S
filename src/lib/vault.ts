import type { EncryptedSecret } from '../types';
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const toBase64 = (bytes: Uint8Array) => btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''));
const fromBase64 = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
async function derive(password: string, salt: Uint8Array) {
  if (password.length < 10) throw new Error('Use uma senha mestra com pelo menos 10 caracteres.');
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export async function encryptSecret(password: string, plaintext: string): Promise<EncryptedSecret> {
  const salt = crypto.getRandomValues(new Uint8Array(16)); const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await derive(password, salt);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(plaintext));
  return { version: 1, salt: toBase64(salt), iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(encrypted)) };
}
export async function decryptSecret(password: string, record: EncryptedSecret): Promise<string> {
  if (record.version !== 1) throw new Error('Versão do cofre não reconhecida.');
  const key = await derive(password, fromBase64(record.salt));
  try { return decoder.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(record.iv) }, key, fromBase64(record.ciphertext))); }
  catch { throw new Error('Senha mestra incorreta ou registro criptografado inválido.'); }
}