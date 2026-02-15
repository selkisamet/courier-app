import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SupportController } from "./support.controller";
import { SupportService } from "./support.service";

@Module({
  imports: [JwtModule.register({})],
  controllers: [SupportController],
  providers: [SupportService, JwtAuthGuard, RolesGuard],
})
export class SupportModule {}
