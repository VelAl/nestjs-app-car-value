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
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto, SanitizedUserDto, UpdateUserDto } from './users.dtos';
import { UsersService } from './users.service';
import { Serialize } from 'src/interceptors';
import { UsersAuthService } from './users.auth.service';
import { CurrentUser } from './decorators';
import { type SessionUser } from 'src/app.types';
import { User } from './user.entity';
import { CurrentUserInterceptor } from './interceptors';

@Controller('users')
@UseInterceptors(CurrentUserInterceptor)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private usersAuthService: UsersAuthService,
  ) {}

  @Post('signup')
  @Serialize(SanitizedUserDto)
  async createUser(
    @Body() body: CreateUserDto,
    @Session() session: SessionUser,
  ) {
    const user = await this.usersAuthService.signUp(body);

    session.userId = user.id;

    return user;
  }

  @Post('signin')
  @Serialize(SanitizedUserDto)
  async signInUser(
    @Body() body: CreateUserDto,
    @Session() session: SessionUser,
  ) {
    const user = await this.usersAuthService.signIn(body.email, body.password);
    session.userId = user.id;

    return this.usersAuthService.signIn(body.email, body.password);
  }

  @Post('signout')
  signOutUser(@Session() session: SessionUser) {
    session.userId = undefined;

    return { message: 'User has been logged out.' };
  }

  @Get('email')
  @Serialize(SanitizedUserDto)
  getUserByEmail(
    @Query('email') email: string,
    @CurrentUser() currentUser: User,
  ) {
    if (!currentUser) {
      throw new UnauthorizedException();
    }

    return this.usersService.getUserByEmail(email);
  }

  @Get(':id')
  @Serialize(SanitizedUserDto)
  getUserById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ) {
    if (currentUser.id !== id) {
      throw new UnauthorizedException();
    }

    return this.usersService.getUserById(id);
  }

  @Delete(':id')
  @Serialize(SanitizedUserDto)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Patch(':id')
  @Serialize(SanitizedUserDto)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.update(id, body);
  }
}
