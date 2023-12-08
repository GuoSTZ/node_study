import mysql from 'mysql';
import forge from 'node-forge';
import bcrypt from 'bcryptjs';

export const queryAsync = (pool: mysql.Pool) => (sql: string, queryParams: string | number[] = []) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, queryParams, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

function genRSAKeyPaire() {
  // 生成RSA密钥对
  const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
  const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
  const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

  return { publicKey: publicKeyPem, privateKey };
}
export const { publicKey, privateKey } = genRSAKeyPaire();

// 加密后的密码解密处理
export function decryptPwd(pwd: string) {
  const encryptedBytes = forge.util.decode64(pwd);
  const decryptedBytes = privateKey.decrypt(encryptedBytes);
  return forge.util.decodeUtf8(decryptedBytes); 
}

// bcrypt哈希加密
export function hashPwd(pwd: string) {
  return bcrypt.hash(pwd, 12);
}