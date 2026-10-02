import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import type { Response } from 'express';

// Anything the guards, services and ValidationPipe raise is an
// HttpException and is serialised exactly as Nest's default
// filter would, so the documented 400/401/403/404/409 bodies are
// unchanged. Anything else is an unexpected failure: it is
// logged with its stack and answered with a single 500 shape
// instead of leaking driver internals to the client.
@Catch()
export class AllExceptionsFilter
  implements ExceptionFilter
{
  private readonly logger =
    new Logger(AllExceptionsFilter.name);

  catch(
    exception: unknown,
    host: ArgumentsHost,
  ): void {
    const http = host.switchToHttp();

    const response = http.getResponse<Response>();

    const request = http.getRequest();

    if (
      exception instanceof HttpException
    ) {
      const status =
        exception.getStatus();

      const body =
        exception.getResponse();

      response
        .status(status)
        .json(
          typeof body === 'string'
            ? {
                statusCode: status,
                message: body,
              }
            : body,
        );

      return;
    }

    this.logger.error(
      `Unhandled exception on ${request?.method} ${request?.url}`,
      exception instanceof Error
        ? exception.stack
        : String(exception),
    );

    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({
        statusCode:
          HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
  }
}