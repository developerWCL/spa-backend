import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // recommended for GCM
const TAG_LENGTH = 16;

function getKey() {
  const key = process.env.API_KEY_ENC_KEY;
  if (!key) throw new Error('API_KEY_ENC_KEY environment variable is required');
  const buf = Buffer.from(key, 'hex');
  if (buf.length !== 32)
    throw new Error('API_KEY_ENC_KEY must be 32 bytes (hex)');
  return buf;
}

export function encryptApiKey(plain: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH,
  });
  const encrypted = Buffer.concat([
    cipher.update(plain, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  // store as base64: iv|tag|cipher
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decryptApiKey(encrypted: string): string {
  const key = getKey();
  const data = Buffer.from(encrypted, 'base64');
  if (data.length < IV_LENGTH + TAG_LENGTH)
    throw new Error('Invalid encrypted data');
  const iv = data.slice(0, IV_LENGTH);
  const tag = data.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = data.slice(IV_LENGTH + TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH,
  });
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
