import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AppRequest } from '../app.types';

export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: AppRequest = context.switchToHttp().getRequest();

    if (!request.session?.userId) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
