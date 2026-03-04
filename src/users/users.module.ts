import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService, AuthService } from './services';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrentUserInterceptor } from './interceptors';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    {
      // globally applied interceptor for all routes
      provide: APP_INTERCEPTOR,
      useClass: CurrentUserInterceptor,
    },
  ],
  imports: [TypeOrmModule.forFeature([User])],
})
export class UsersModule {}
