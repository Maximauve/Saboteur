import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import { type RequestWithUser } from '@/domain/request/RequestUser';


export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);