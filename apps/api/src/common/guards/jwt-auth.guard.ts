import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthenticatedRequest } from "../types/authenticated-request.type";
import { TokenPayload } from "../types/token-payload.type";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }

    const token = authHeader.slice(7).trim();

    try {
      const payload = this.jwtService.verify<TokenPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET || "dev-access-secret",
      });

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
