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
  async createUser(@Body() body: CreateUserDto) {
    const user = await this.usersAuthService.signUp(body);

    return user;
  }

  @Get('email')
  getUsersByEmail(@Query('email') email: string) {
    return this.usersService.getUsersByEmail(email);
  }

  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
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
