import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    const isProduction = process.env.NODE_ENV === 'production';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const resolvedMessage =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any)?.message || exception.message;
      message =
        status >= 500
          ? 'Internal server error'
          : Array.isArray(resolvedMessage)
            ? resolvedMessage.join(', ')
            : resolvedMessage;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = this.mapPrismaErrorToStatus(exception.code);
      message = this.mapPrismaErrorToMessage(exception.code);
    }

    const requestId = request?.requestId || request?.headers?.['x-request-id'];

    const payload = {
      success: false,
      error: {
        message: Array.isArray(message) ? message.join(', ') : message,
        statusCode: status,
      },
      requestId,
      timestamp: new Date().toISOString(),
      path: request?.url,
      method: request?.method,
    };

    if (status >= 500) {
      this.logger.error(
        JSON.stringify({
          event: 'request:error',
          requestId,
          method: request?.method,
          path: request?.url,
          statusCode: status,
          message:
            exception instanceof Error ? exception.message : 'Unknown exception',
          stack:
            !isProduction && exception instanceof Error
              ? exception.stack
              : undefined,
        }),
      );
    }

    response.status(status).json(payload);
  }

  private mapPrismaErrorToStatus(code: string): number {
    switch (code) {
      case 'P2002':
        return HttpStatus.CONFLICT;
      case 'P2025':
        return HttpStatus.NOT_FOUND;
      default:
        return HttpStatus.BAD_REQUEST;
    }
  }

  private mapPrismaErrorToMessage(code: string): string {
    switch (code) {
      case 'P2002':
        return 'Unique constraint violation';
      case 'P2025':
        return 'Record not found';
      default:
        return 'Database operation failed';
    }
  }
}
