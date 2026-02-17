import { Expose } from 'class-transformer';

export class SanitizedUserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;
}
