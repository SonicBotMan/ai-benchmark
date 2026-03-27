import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;

function deriveKey(encryptionKey: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(encryptionKey, salt, 100000, 32, 'sha256');
}

export interface EncryptedBlob {
  iv: string;
  salt: string;
  tag: string;
  data: string;
}

export function encrypt(data: string, encryptionKey: string): EncryptedBlob {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(encryptionKey, salt);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    salt: salt.toString('hex'),
    tag: tag.toString('hex'),
    data: encrypted,
  };
}

export function decrypt(blob: EncryptedBlob, encryptionKey: string): string {
  const salt = Buffer.from(blob.salt, 'hex');
  const key = deriveKey(encryptionKey, salt);
  const iv = Buffer.from(blob.iv, 'hex');
  const tag = Buffer.from(blob.tag, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(blob.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function signData(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

export function verifySignature(data: string, signature: string, secret: string): boolean {
  const expected = signData(data, secret);
  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
}
