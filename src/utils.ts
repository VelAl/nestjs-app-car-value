import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { SanitizedUserDto } from './users/users.dtos';
import { User } from './users/user.entity';
import { UserRole } from './app.types';

const scrypt = promisify(_scrypt);

export const getHashedPassword = async (password: string) => {
  const salt = randomBytes(8).toString('hex');

  const hash = (await scrypt(password, salt, 32)) as Buffer;

  return salt + '.' + hash.toString('hex');
};

export const isPasswordMatching = async (
  suppliedPassword: string,
  storedPassword: string,
) => {
  const [salt, storedHash] = storedPassword.split('.');
  const hash = (await scrypt(suppliedPassword, salt, 32)) as Buffer;

  return storedHash === hash.toString('hex');
};

export function isSanitizedUserDto(value: unknown): value is SanitizedUserDto {
  if (!value || typeof value !== 'object') return false;

  return (
    'id' in value &&
    typeof value.id === 'number' &&
    'email' in value &&
    typeof value.email === 'string'
  );
}

export const isAdmin = (user: User) => user.role === UserRole.ADMIN;
