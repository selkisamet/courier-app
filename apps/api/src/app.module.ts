import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { CouriersModule } from "./modules/couriers/couriers.module";
import { HealthModule } from "./modules/health/health.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { PrismaModule } from "./modules/prisma/prisma.module";

@Module({
  imports: [PrismaModule, AuthModule, HealthModule, OrdersModule, CouriersModule],
})
export class AppModule {}
