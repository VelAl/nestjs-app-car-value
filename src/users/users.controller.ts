import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Session,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto, SanitizedUserDto, UpdateUserDto } from './users.dtos';
import { UsersService } from './users.service';
import { Serialize } from 'src/interceptors';
import { UsersAuthService } from './users.auth.service';

@Controller('users')
@Serialize(SanitizedUserDto)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private usersAuthService: UsersAuthService,
  ) {}

  @Post('signup')
  async createUser(
    @Body() body: CreateUserDto,
    @Session() session: { userId?: number },
  ) {
    const user = await this.usersAuthService.signUp(body);

    session.userId = user.id;

    return user;
  }

  @Post('signin')
  async signInUser(
    @Body() body: CreateUserDto,
    @Session() session: { userId?: number },
  ) {
    const user = await this.usersAuthService.signIn(body.email, body.password);
    session.userId = user.id;

    return this.usersAuthService.signIn(body.email, body.password);
  }

  @Post('signout')
  signOutUser(@Session() session: { userId?: number }) {
    session.userId = undefined;

    return { message: 'User has been logged out.' };
  }

  @Get('email')
  getUserByEmail(@Query('email') email: string) {
    return this.usersService.getUserByEmail(email);
  }

  @Get(':id')
  getUserById(
    @Param('id', ParseIntPipe) id: number,
    @Session() session: { userId: number },
  ) {
    if (session.userId !== id) {
      throw new UnauthorizedException(
        'You are not authorized to access this resource.',
      );
    }

    return this.usersService.getUserById(id);
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.update(id, body);
  }
}
