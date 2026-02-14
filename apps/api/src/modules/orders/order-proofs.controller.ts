import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { TokenPayload } from "../../common/types/token-payload.type";
import { OrderProofsService } from "./order-proofs.service";

@Controller("orders")
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderProofsController {
  constructor(private readonly orderProofsService: OrderProofsService) {}

  @Post(":orderId/proofs/photo")
  @Roles("COURIER")
  uploadPhoto(
    @Param("orderId") orderId: string,
    @CurrentUser() user: TokenPayload,
    @Body() body: { fileKey: string; kind: "pickup" | "delivery" },
  ) {
    return this.orderProofsService.uploadPhoto(orderId, user, body);
  }

  @Post(":orderId/proofs/gps")
  @Roles("COURIER")
  uploadGps(
    @Param("orderId") orderId: string,
    @CurrentUser() user: TokenPayload,
    @Body() body: { lat: number; lng: number },
  ) {
    return this.orderProofsService.uploadGps(orderId, user, body);
  }

  @Post(":orderId/proofs/otp/send")
  @Roles("COURIER")
  sendOtp(@Param("orderId") orderId: string, @CurrentUser() user: TokenPayload) {
    return this.orderProofsService.sendOtp(orderId, user);
  }

  @Post(":orderId/proofs/otp/verify")
  @Roles("COURIER")
  verifyOtp(
    @Param("orderId") orderId: string,
    @CurrentUser() user: TokenPayload,
    @Body() body: { otp: string },
  ) {
    return this.orderProofsService.verifyOtp(orderId, user, body);
  }

  @Post(":orderId/complete")
  @Roles("COURIER")
  completeOrder(@Param("orderId") orderId: string, @CurrentUser() user: TokenPayload) {
    return this.orderProofsService.completeOrder(orderId, user);
  }
}
