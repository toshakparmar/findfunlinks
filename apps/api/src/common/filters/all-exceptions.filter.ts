import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId =
      (request.headers['x-request-id'] as string) ||
      (request as unknown as { requestId?: string }).requestId ||
      randomUUID();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details: unknown[] | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        code = this.getErrorCodeFromStatus(status);
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        message = (resObj.message as string) || exception.message;
        const rawCode = (resObj.error as string) || this.getErrorCodeFromStatus(status);
        code = rawCode
          ? rawCode.toUpperCase().replace(/\s+/g, '_')
          : this.getErrorCodeFromStatus(status);

        if (Array.isArray(resObj.message)) {
          details = resObj.message;
          message = 'Validation failed';
          code = 'VALIDATION_ERROR';
        }
      }
    } else if (
      (exception as Error)?.name === 'ZodError' ||
      ((exception as any)?.issues && Array.isArray((exception as any).issues))
    ) {
      status = HttpStatus.BAD_REQUEST;
      code = 'VALIDATION_ERROR';
      message = 'Validation failed';
      details = (exception as any).issues;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          status = HttpStatus.CONFLICT;
          code = 'CONFLICT';
          const target = (exception.meta?.target as string[]) || [];
          message = `Resource with specified ${target.join(', ')} already exists`;
          details = [{ fields: target }];
          break;
        }
        case 'P2025': {
          status = HttpStatus.NOT_FOUND;
          code = 'NOT_FOUND';
          message = 'The requested resource was not found';
          break;
        }
        case 'P2003': {
          status = HttpStatus.BAD_REQUEST;
          code = 'FOREIGN_KEY_VIOLATION';
          message = 'Invalid reference to a related resource';
          break;
        }
        default: {
          status = HttpStatus.BAD_REQUEST;
          code = `DATABASE_ERROR_${exception.code}`;
          message = 'Database operation failed';
          break;
        }
      }
    } else if (exception instanceof Error) {
      message = process.env.NODE_ENV === 'production' ? 'Internal server error' : exception.message;
      this.logger.error(`Unhandled error [${requestId}]: ${exception.message}`, exception.stack);
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
      requestId,
    });
  }

  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
