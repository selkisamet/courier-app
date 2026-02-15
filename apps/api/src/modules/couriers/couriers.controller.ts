import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { TokenPayload } from "../../common/types/token-payload.type";
import { CouriersService } from "./couriers.service";

@Controller("couriers")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("COURIER")
export class CouriersController {
  constructor(private readonly couriersService: CouriersService) {}

  @Post("documents/tax-certificate")
  uploadTaxCertificate(@CurrentUser() user: TokenPayload, @Body() body: { fileKey: string }) {
    return this.couriersService.uploadTaxCertificate(user, body);
  }

  @Get("me/status")
  getMyStatus(@CurrentUser() user: TokenPayload) {
    return this.couriersService.getMyStatus(user);
  }

  @Patch("me/vehicle")
  updateMyVehicle(@CurrentUser() user: TokenPayload, @Body() body: { vehicleType: string }) {
    return this.couriersService.updateMyVehicle(user, body);
  }

  @Get("me/wallet")
  getMyWallet(@CurrentUser() user: TokenPayload) {
    return this.couriersService.getMyWallet(user);
  }

  @Get("me/wallet/ledger")
  getMyWalletLedger(@CurrentUser() user: TokenPayload) {
    return this.couriersService.getMyWalletLedger(user);
  }

  @Post("me/wallet/topup-intent")
  topupMyWallet(@CurrentUser() user: TokenPayload, @Body() body: { amount: number }) {
    return this.couriersService.topupMyWallet(user, body);
  }

  @Get("me/wallet/holds")
  getMyWalletHolds(@CurrentUser() user: TokenPayload) {
    return this.couriersService.getMyWalletHolds(user);
  }
}

