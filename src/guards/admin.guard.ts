import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AppRequest, UserRole } from 'src/app.types';

export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request: AppRequest = context.switchToHttp().getRequest();

    return request.currentUser?.role === UserRole.ADMIN;
  }
}
