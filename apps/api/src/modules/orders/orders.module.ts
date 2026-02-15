import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { OrderProofsController } from "./order-proofs.controller";
import { OrderProofsService } from "./order-proofs.service";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [JwtModule.register({})],
  controllers: [OrdersController, OrderProofsController],
  providers: [OrdersService, OrderProofsService, JwtAuthGuard, RolesGuard],
})
export class OrdersModule {}
