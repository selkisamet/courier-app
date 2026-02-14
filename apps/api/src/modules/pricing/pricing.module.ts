import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { PricingController } from "./pricing.controller";
import { PricingService } from "./pricing.service";

@Module({
  imports: [JwtModule.register({})],
  controllers: [PricingController],
  providers: [PricingService, JwtAuthGuard, RolesGuard],
})
export class PricingModule {}
