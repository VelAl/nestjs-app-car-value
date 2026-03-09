import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService, AuthService } from './services';
import { User } from './user.entity';
import { ForbiddenException } from '@nestjs/common';
import type { SessionUser } from 'src/app.types';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  const mockUser = (overrides: Partial<User> = {}) =>
    ({
      id: 1,
      email: 'test@example.com',
      password: 'hashed',
      ...overrides,
    }) as User;

  beforeEach(async () => {
    fakeUsersService = {
      getUserById: jest.fn((id) => Promise.resolve(mockUser({ id }))),
      getUserByEmail: jest.fn((email) => Promise.resolve(mockUser({ email }))),
      create: jest.fn((dto) =>
        Promise.resolve(mockUser({ email: dto.email, password: dto.password })),
      ),
      update: jest.fn((id, attrs) =>
        Promise.resolve(mockUser({ id, ...attrs })),
      ),
      remove: jest.fn((id) => Promise.resolve(mockUser({ id }))),
    };

    fakeAuthService = {
      signUp: jest.fn((dto) => Promise.resolve(mockUser({ email: dto.email }))),
      signIn: jest.fn((email, _) => Promise.resolve(mockUser({ email }))),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: fakeUsersService },
        { provide: AuthService, useValue: fakeAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('getUserByEmail', () => {
    it('returns user from service', async () => {
      const email = 'user@example.com';
      const result = await controller.getUserByEmail(email);
      expect(result).toEqual(mockUser({ email }));
      expect(fakeUsersService.getUserByEmail).toHaveBeenCalledWith(email);
    });

    it('returns null when service returns null', async () => {
      (fakeUsersService.getUserByEmail as jest.Mock).mockResolvedValue(null);
      const result = await controller.getUserByEmail('unknown@example.com');
      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('returns user when id matches current user', async () => {
      const currentUser = mockUser({ id: 1 });
      const result = await controller.getUserById(1, currentUser);
      expect(result).toEqual(mockUser({ id: 1 }));
      expect(fakeUsersService.getUserById).toHaveBeenCalledWith(1);
    });

    it('returns null when service returns null', async () => {
      (fakeUsersService.getUserById as jest.Mock).mockResolvedValue(null);
      const result = await controller.getUserById(1, mockUser({ id: 1 }));
      expect(result).toBeNull();
    });

    it('throws ForbiddenException when id does not match current user', () => {
      const currentUser = mockUser({ id: 2 });
      expect(() => controller.getUserById(1, currentUser)).toThrow(
        ForbiddenException,
      );
      expect(fakeUsersService.getUserById).not.toHaveBeenCalled();
    });
  });

  describe('createUser (signup)', () => {
    it('creates user, sets session.userId and returns user', async () => {
      const body = { email: 'new@example.com', password: 'secret' };
      const created = mockUser({ id: 5, email: body.email });
      (fakeAuthService.signUp as jest.Mock).mockResolvedValue(created);

      const session: SessionUser = { userId: undefined };
      const result = await controller.createUser(body, session);

      expect(result).toEqual(created);
      expect(session.userId).toBe(5);
      expect(fakeAuthService.signUp).toHaveBeenCalledWith(body);
    });
  });

  describe('signInUser', () => {
    it('signs in, sets session.userId and returns user', async () => {
      const body = { email: 'user@example.com', password: 'secret' };
      const user = mockUser({ id: 3, email: body.email });
      (fakeAuthService.signIn as jest.Mock).mockResolvedValue(user);

      const session: SessionUser = { userId: undefined };
      const result = await controller.signInUser(body, session);

      expect(result).toEqual(user);
      expect(session.userId).toBe(3);
      expect(fakeAuthService.signIn).toHaveBeenCalledWith(
        body.email,
        body.password,
      );
    });
  });

  describe('signOutUser', () => {
    it('clears session.userId and returns message', () => {
      const session: SessionUser = { userId: 1 };
      const result = controller.signOutUser(session);
      expect(session.userId).toBeUndefined();
      expect(result).toEqual({ message: 'User has been logged out.' });
    });
  });

  describe('updateUser', () => {
    it('delegates to service and returns updated user', async () => {
      const id = 1;
      const body = { email: 'updated@example.com', password: 'newpass' };
      const result = await controller.updateUser(id, body);
      expect(result).toEqual(mockUser({ id, ...body }));
      expect(fakeUsersService.update).toHaveBeenCalledWith(id, body);
    });
  });

  describe('deleteUser', () => {
    it('delegates to service and returns removed user', async () => {
      const id = 1;
      const result = await controller.deleteUser(id);
      expect(result).toEqual(mockUser({ id }));
      expect(fakeUsersService.remove).toHaveBeenCalledWith(id);
    });
  });
});
