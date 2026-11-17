import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseEnvelope<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, ResponseEnvelope<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ResponseEnvelope<T>> {
    return next.handle().pipe(
      map((res) => {
        // If response is already an envelope or null/undefined
        if (res && typeof res === 'object' && 'success' in res && res.success === true) {
          return res;
        }

        // Check if response contains { data, meta }
        if (res && typeof res === 'object' && 'data' in res && 'meta' in res) {
          return {
            success: true,
            data: res.data,
            meta: res.meta,
          };
        }

        return {
          success: true,
          data: res,
        };
      }),
    );
  }
}
