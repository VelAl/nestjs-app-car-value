import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

export const getHashedPassword = async (password: string) => {
  // generate a salt
  const salt = randomBytes(8).toString('hex');

  // hash the password with the salt
  const hash = (await scrypt(password, salt, 32)) as Buffer;

  // join the salt and the hash
  return salt + '.' + hash.toString('hex');
};
