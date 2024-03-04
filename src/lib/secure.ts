import * as crypto from 'crypto';


const aes256gcm = (password: string) => {
  const ALGO = 'aes-256-gcm';
  const separator = '$'
  const key = crypto.pbkdf2Sync(password, "minichat", 65536, 32, "sha256");
  // encrypt returns base64-encoded ciphertext
  const encrypt = (str: string) => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGO, key, iv);
    cipher.setAutoPadding(true)
    let enc = cipher.update(str, 'utf8', 'base64');
    enc += cipher.final('base64');
    return [iv.toString("base64"), cipher.getAuthTag().toString('base64'), enc].join(separator);
  };

  // decrypt decodes base64-encoded cipher text into a utf8-encoded string
  const decrypt = (enc: string) => {
    const parts = enc.split(separator);
    if (parts.length !== 3) {
      return
    }
    try {
      const iv = Buffer.from(parts[0], 'base64');
      const tag = Buffer.from(parts[1], 'base64');
      const payload = parts[2];
      const decipher = crypto.createDecipheriv(ALGO, key, iv);
      decipher.setAutoPadding(true)
      decipher.setAuthTag(tag);
      let str = decipher.update(payload, 'base64', 'utf8');
      str += decipher.final('utf8');
      return str;
    } catch (e) {
      return
    }
  };

  return {
    encrypt,
    decrypt,
  };
};

const defaultCrypto = aes256gcm(process.env.SECRET || 'secret');

export { aes256gcm, defaultCrypto }
