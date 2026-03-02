import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import { AppRequest } from 'src/app.types';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private usersService: UsersService) {}

  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request: AppRequest = context.switchToHttp().getRequest();

    const { userId } = request.session ?? {};

    if (userId) {
      const user = await this.usersService.getUserById(userId);

      if (!user) {
        return handler.handle();
      }

      request.currentUser = user;
    }

    return handler.handle();
  }
}
