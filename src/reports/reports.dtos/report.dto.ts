import { Expose, Transform, TransformFnParams } from 'class-transformer';
import { Report } from '../reports.entity';

export class ReportDto {
  @Expose()
  id: number;

  @Expose()
  price: number;

  @Expose()
  make: string;

  @Expose()
  model: string;

  @Expose()
  year: number;

  @Expose()
  lng: number;

  @Expose()
  lat: number;

  @Expose()
  mileage: number;

  @Transform(({ obj }: TransformFnParams) => {
    return (obj as Report).user.id;
  })
  @Expose()
  userId: number;
}
