import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { CouriersController } from "./couriers.controller";
import { CouriersService } from "./couriers.service";

@Module({
  imports: [JwtModule.register({})],
  controllers: [CouriersController],
  providers: [CouriersService, JwtAuthGuard, RolesGuard],
})
export class CouriersModule {}
