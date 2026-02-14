import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { OrdersController } from "./orders.controller";

@Module({
  imports: [JwtModule.register({})],
  controllers: [OrdersController],
  providers: [JwtAuthGuard, RolesGuard],
})
export class OrdersModule {}
