import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';
import { UsersService } from '../services';
import { AppRequest } from '../../app.types';

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  async use(req: AppRequest, _: Response, next: NextFunction) {
    const { userId } = req.session ?? {};

    if (userId) {
      const user = await this.usersService.getUserById(userId);
      if (!user) {
        return next();
      }

      req.currentUser = user;
    }

    next();
  }
}
