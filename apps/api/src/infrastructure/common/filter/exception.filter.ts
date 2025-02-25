import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

import { LoggerService } from '@/infrastructure/logger/logger.service';

interface IError {
  codeError: string;
  message: string;
}

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<FastifyReply>();
    const request = context.getRequest<FastifyRequest>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as IError)
        : { message: (exception as Error).message, codeError: '' };

    const responseData = {
      
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url
      ,
      ...message,
    };

    this.logMessage(request, message, status, exception);

    response.status(status).send(responseData);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private logMessage(request: FastifyRequest, message: IError, status: number, exception: any) {
    if (status === 500) {
      this.logger.error(
        `End Request for ${request.url}`,
        `method=${request.method} status=${status} codeError=${
          message.codeError ?? null
        } message=${message.message ?? null}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        status >= 500 ? exception.stack : '',
      );
    } else {
      this.logger.warn(
        `End Request for ${request.url}`,
        `method=${request.method} status=${status} codeError=${
          message.codeError ?? null
        } message=${message.message ?? null}`,
      );
    }
  }
}
