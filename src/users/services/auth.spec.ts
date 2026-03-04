import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from '../user.entity';
import { UsersService } from './users.service';
import { CreateUserDto } from '../users.dtos';

it('can create an instance of auth service', async () => {
  //  create a fake copy of user service__________________
  const fakeUsersService: Partial<UsersService> = {
    getUserByEmail: (_: string) => Promise.resolve(null),
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

  const service = module.get(AuthService);
  expect(service).toBeDefined();
});
