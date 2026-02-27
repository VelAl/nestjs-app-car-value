import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './users.dtos';
import { getHashedPassword } from 'src/utils';

@Injectable()
export class UsersAuthService {
  constructor(private usersService: UsersService) {}

  async signUp({ email, password }: CreateUserDto) {
    // check if email is already in use______
    const alreadyExists = await this.usersService.getUsersByEmail(email);
    if (alreadyExists.length) {
      throw new BadRequestException('Email is already in use.');
    }

    const hashedPassword = await getHashedPassword(password);

    // create and save the user______________
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
    });

    return user;
  }

  async signIn() {}
}
