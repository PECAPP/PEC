import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

const ENCRYPTED_PREFIX = 'enc:v1:';

const getEncryptionKey = (): Buffer | null => {
  const raw = process.env.FIELD_ENCRYPTION_KEY;
  if (!raw) {
    return null;
  }
  return createHash('sha256').update(raw).digest();
};

export const encryptField = (value?: string | null): string | null => {
  if (!value) return null;
  if (value.startsWith(ENCRYPTED_PREFIX)) return value;

  const key = getEncryptionKey();
  if (!key) return value;

  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${ENCRYPTED_PREFIX}${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
};

export const decryptField = (value?: string | null): string | null => {
  if (!value) return null;
  if (!value.startsWith(ENCRYPTED_PREFIX)) return value;

  const key = getEncryptionKey();
  if (!key) return value;

  try {
    const encoded = value.slice(ENCRYPTED_PREFIX.length);
    const [ivB64, tagB64, dataB64] = encoded.split(':');
    if (!ivB64 || !tagB64 || !dataB64) return null;

    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const encrypted = Buffer.from(dataB64, 'base64');

    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch {
    return null;
  }
};
