import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './users.dtos';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  create(userDto: CreateUserDto) {
    const user = this.usersRepo.create(userDto);
    return this.usersRepo.save(user);
  }

  async getUserById(id: User['id']) {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    return user;
  }

  getUserByEmail(email: User['email']) {
    return this.usersRepo.findOne({ where: { email } });
  }

  async update(id: User['id'], attrs: UpdateUserDto) {
    const user = await this.getUserById(id);

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    Object.assign(user, attrs);

    return this.usersRepo.save(user); // method "save" triggers the @AfterUpdate hook
  }

  async remove(id: User['id']) {
    const user = await this.getUserById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return this.usersRepo.remove(user); // method "remove" triggers the @AfterRemove hook
  }
}
