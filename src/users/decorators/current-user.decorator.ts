import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppRequest } from '../../app.types';
import { User } from '../user.entity';

export const CurrentUser = createParamDecorator(
  (_: never, context: ExecutionContext): User | undefined => {
    const request: AppRequest = context.switchToHttp().getRequest();
    return request.currentUser;
  },
);
