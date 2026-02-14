import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { CourierOrdersController } from "./courier-orders.controller";
import { CourierOrdersService } from "./courier-orders.service";

@Module({
  imports: [JwtModule.register({})],
  controllers: [CourierOrdersController],
  providers: [CourierOrdersService, JwtAuthGuard, RolesGuard],
})
export class CourierOrdersModule {}
