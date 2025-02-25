// import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
// import { FastifyRequest } from 'fastify';
// import { Observable } from 'rxjs';
// import { tap } from 'rxjs/operators';

// import { LoggerService } from '@/infrastructure/logger/logger.service';

// @Injectable()
// export class LoggingInterceptor implements NestInterceptor {
//   constructor(private readonly logger: LoggerService) {}

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     const now = Date.now();
//     const httpContext = context.switchToHttp();
//     const request = httpContext.getRequest<FastifyRequest>();

//     const ip = this.getIP(request);

//     this.logger.log(`Incoming Request on ${request.url}`, `method=${request.method} ip=${ip}`);

//     return next.handle().pipe(
//       tap(() => {
//         this.logger.log(`End Request for ${request.url}`, `method=${request.method} ip=${ip} duration=${Date.now() - now}ms`);
//       }),
//     );
//   }

//   private getIP(request: FastifyRequest): string {
//     const ipAddr = request.headers['x-forwarded-for'];
//     const ip: string = ipAddr ? ipAddr.at(-1) : request.socket.remoteAddress;
//     return ip.replace('::ffff:', '');
//   }
// }
