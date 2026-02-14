import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { TokenPayload } from "../types/token-payload.type";
import { AuthenticatedRequest } from "../types/authenticated-request.type";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TokenPayload => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
