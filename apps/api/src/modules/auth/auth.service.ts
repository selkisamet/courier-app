import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "../../common/types/user-role.type";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto, RefreshDto } from "./dto/login.dto";
import { RegisterBaseDto, RegisterCorporateDto, RegisterCourierDto } from "./dto/register.dto";
import * as bcrypt from "bcryptjs";
import { User } from "@prisma/client";
import { TokenPayload } from "../../common/types/token-payload.type";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerSenderIndividual(dto: RegisterBaseDto) {
    return this.createUserWithRole(dto, "SENDER_INDIVIDUAL");
  }

  async registerSenderCorporate(dto: RegisterCorporateDto) {
    const { organizationName, organizationTaxNumber, ...base } = dto;

    const organization = await this.prisma.organization.upsert({
      where: { taxNumber: organizationTaxNumber },
      update: { name: organizationName, isActive: true },
      create: { name: organizationName, taxNumber: organizationTaxNumber },
    });

    return this.createUserWithRole(base, "SENDER_CORPORATE", organization.id);
  }

  async registerCourier(dto: RegisterCourierDto) {
    const { taxNumber, cityCode, vehicleType, ...base } = dto;

    const authResult = await this.createUserWithRole(base, "COURIER");

    await this.prisma.courierProfile.create({
      data: {
        userId: authResult.user.id,
        taxNumber,
        cityCode,
        vehicleType,
      },
    });

    await this.prisma.wallet.create({
      data: {
        courier: {
          connect: {
            userId: authResult.user.id,
          },
        },
      },
    });

    return authResult;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.buildAuthResponse(user);
  }

  async refresh(dto: RefreshDto) {
    try {
      const payload = this.jwtService.verify<TokenPayload>(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
      });

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      return this.buildAuthResponse(user);
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  private async createUserWithRole(dto: RegisterBaseDto, role: UserRole, organizationId?: string) {
    const existingByPhone = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existingByPhone) {
      throw new BadRequestException("Phone already in use");
    }

    if (dto.email) {
      const existingByEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existingByEmail) {
        throw new BadRequestException("Email already in use");
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        email: dto.email,
        passwordHash,
        role,
        organizationId,
      },
    });

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User) {
    const payload: TokenPayload = {
      sub: user.id,
      role: user.role as UserRole,
      phone: user.phone,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || "dev-access-secret",
      expiresIn: "15m",
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
      expiresIn: "30d",
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }
}
