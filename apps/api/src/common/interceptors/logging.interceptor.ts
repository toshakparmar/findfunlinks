import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const requestId = (request.headers['x-request-id'] as string) || randomUUID();
    (request as unknown as { requestId: string }).requestId = requestId;
    response.setHeader('x-request-id', requestId);

    const { method, originalUrl, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          const { statusCode } = response;
          this.logger.log(
            `[${requestId}] ${method} ${originalUrl} ${statusCode} - ${duration}ms | IP: ${ip} | UA: ${userAgent}`,
          );
        },
        error: (err) => {
          const duration = Date.now() - start;
          const status = err.status || 500;
          this.logger.warn(
            `[${requestId}] ${method} ${originalUrl} ${status} - ${duration}ms | Error: ${err.message}`,
          );
        },
      }),
    );
  }
}
