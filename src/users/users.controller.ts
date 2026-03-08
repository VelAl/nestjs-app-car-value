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
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { CreateUserDto, SanitizedUserDto, UpdateUserDto } from './users.dtos';
import { UsersService, AuthService } from './services';
import { Serialize } from 'src/interceptors';
import { CurrentUser } from './decorators';
import { type SessionUser } from 'src/app.types';
import { User } from './user.entity';
import { AuthGuard } from 'src/guards';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('signup')
  @Serialize(SanitizedUserDto)
  async createUser(
    @Body() body: CreateUserDto,
    @Session() session: SessionUser,
  ) {
    const user = await this.authService.signUp(body);

    session.userId = user.id;

    return user;
  }

  @Post('signin')
  @Serialize(SanitizedUserDto)
  async signInUser(
    @Body() body: CreateUserDto,
    @Session() session: SessionUser,
  ) {
    const user = await this.authService.signIn(body.email, body.password);
    session.userId = user.id;

    return this.authService.signIn(body.email, body.password);
  }

  @Post('signout')
  signOutUser(@Session() session: SessionUser) {
    session.userId = undefined;

    return { message: 'User has been logged out.' };
  }

  @Get('email')
  @Serialize(SanitizedUserDto)
  @UseGuards(AuthGuard)
  getUserByEmail(@Query('email') email: string) {
    return this.usersService.getUserByEmail(email);
  }

  @Get(':id')
  @Serialize(SanitizedUserDto)
  @UseGuards(AuthGuard)
  getUserById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ) {
    if (currentUser.id !== id) {
      throw new ForbiddenException();
    }

    return this.usersService.getUserById(id);
  }

  @Delete(':id')
  @Serialize(SanitizedUserDto)
  @UseGuards(AuthGuard)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Patch(':id')
  @Serialize(SanitizedUserDto)
  @UseGuards(AuthGuard)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.update(id, body);
  }
}
