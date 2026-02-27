import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersAuthService } from './users.auth.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersAuthService],
  imports: [TypeOrmModule.forFeature([User])],
})
export class UsersModule {}
