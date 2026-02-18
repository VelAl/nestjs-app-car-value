import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance, ClassConstructor } from 'class-transformer';

export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private dto: ClassConstructor<T>) {}

  intercept(
    context: ExecutionContext,
    handler: CallHandler,
  ): Observable<T | T[]> {
    // Runs before the controller method is executed.

    return handler.handle().pipe(
      map((data: unknown): T | T[] => {
        // Transforms the data returned by the controller
        // before sending response to the client.

        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        }) as T | T[];
      }),
    );
  }
}

export function Serialize<T>(
  dto: ClassConstructor<T>,
): ReturnType<typeof UseInterceptors> {
  return UseInterceptors(new SerializeInterceptor(dto));
}
