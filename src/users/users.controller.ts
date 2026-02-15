import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './users.dtos/create-user.dto';
import { UsersService } from './users.service';

@Controller('auth')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('signup')
  async createUser(@Body() body: CreateUserDto) {
    const user = await this.usersService.create(body);
    return user.id;
  }

  @Post('signin')
  signinUser() {
    return 'I have signed in';
  }
}
