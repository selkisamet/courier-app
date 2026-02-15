import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { PricingService } from "./pricing.service";

@Controller("pricing")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post("quote")
  @Roles("SENDER_INDIVIDUAL", "SENDER_CORPORATE", "COURIER", "ADMIN")
  quote(@Body() body: { cityCode: string; boost?: boolean; distanceKm?: number }) {
    return this.pricingService.quote(body);
  }

  @Get("city-coefficients")
  @Roles("SENDER_INDIVIDUAL", "SENDER_CORPORATE", "COURIER", "ADMIN")
  getCityCoefficients() {
    return this.pricingService.getCityCoefficients();
  }
}
