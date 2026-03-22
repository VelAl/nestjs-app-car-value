import { Expose } from 'class-transformer';
import { UserRole } from 'src/app.types';

export class SanitizedUserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  role: UserRole;
}
