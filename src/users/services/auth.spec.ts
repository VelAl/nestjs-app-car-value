import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from '../user.entity';
import { UsersService } from './users.service';
import { CreateUserDto } from '../users.dtos';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    //  create a fake copy of user service__________________
    const fakeUsersService: Partial<UsersService> = {
      getUserByEmail: () => Promise.resolve(null),
      create: ({ email, password }: CreateUserDto) =>
        Promise.resolve({ id: 1, email, password } as User),
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
});
