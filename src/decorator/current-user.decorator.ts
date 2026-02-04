import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  sub: string; // staff ID
  email: string;
  roles?: string[]; // multiple role names
  branchIds?: string[]; // multiple branch IDs
  spaIds?: string[]; // multiple spa IDs
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.staff as CurrentUserPayload;
  },
);
