import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  Min,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class GetEstimateDto {
  @IsString()
  @IsNotEmpty()
  make: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsNumber()
  @IsPositive()
  @Min(1930)
  @Max(2050)
  @Type(() => Number)
  year: number;

  @IsLongitude()
  @Type(() => Number)
  lng: number;

  @IsLatitude()
  @Type(() => Number)
  lat: number;

  @IsNumber()
  @IsPositive()
  @Max(1e6)
  @Type(() => Number)
  mileage: number;
}
