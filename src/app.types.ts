import type { Request } from 'express';
import { User } from './users/user.entity';

export type SessionUser = {
  userId?: number;
};

/** Request with session and currentUser set by auth flow (Express Request extended). */
export interface AppRequest extends Request {
  session?: SessionUser;
  currentUser?: User;
}
