import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './users.dtos/create-user.dto';

@Controller('auth')
export class UsersController {
  @Post('signup')
  createUser(@Body() body: CreateUserDto) {}

  @Post('signin')
  signinUser() {
    return 'I have signed in';
  }
}
