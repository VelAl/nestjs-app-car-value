import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from '../user.entity';
import { UsersService } from './users.service';
import { CreateUserDto } from '../users.dtos';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      getUserByEmail: (email: string) =>
        Promise.resolve(users.find((user) => user.email === email) || null),

      create: ({ email, password }: CreateUserDto) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signUp({
      email: 'asdf@asdf.com',
      password: 'asdf',
    });

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    fakeUsersService.getUserByEmail = () =>
      Promise.resolve({ id: 1, email: 'asdf@asdf.com', password: '1' } as User);

    await expect(
      service.signUp({ email: 'asdf@asdf.com', password: 'asdf' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws if signin is called with an unused email', async () => {
    await expect(
      service.signIn('asdflkj@asdlfkj.com', 'passdflkj'),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws if an invalid password is provided', async () => {
    fakeUsersService.getUserByEmail = () =>
      Promise.resolve({ id: 1, email: 'asdf@asdf.com', password: '1' } as User);

    await expect(service.signIn('asdf@asdf.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('returns a user if correct password is provided', async () => {
    await service.signUp({ email: 'asdf@asdf.com', password: 'asdf' });

    const user = await service.signIn('asdf@asdf.com', 'asdf');
    expect(user).toBeDefined();
  });
});
