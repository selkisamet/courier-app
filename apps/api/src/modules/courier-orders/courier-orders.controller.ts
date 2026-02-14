import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { TokenPayload } from "../../common/types/token-payload.type";
import { CourierOrdersService } from "./courier-orders.service";

@Controller("courier/orders")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("COURIER")
export class CourierOrdersController {
  constructor(private readonly courierOrdersService: CourierOrdersService) {}

  @Get("available")
  getAvailableOrders(@CurrentUser() user: TokenPayload) {
    return this.courierOrdersService.getAvailableOrders(user);
  }

  @Post(":orderId/accept")
  acceptOrder(@Param("orderId") orderId: string, @CurrentUser() user: TokenPayload) {
    return this.courierOrdersService.acceptOrder(orderId, user);
  }

  @Post(":orderId/reject")
  rejectOrder(@Param("orderId") orderId: string, @CurrentUser() user: TokenPayload) {
    return this.courierOrdersService.rejectOrder(orderId, user);
  }

  @Post(":orderId/picked-up")
  markPickedUp(@Param("orderId") orderId: string, @CurrentUser() user: TokenPayload) {
    return this.courierOrdersService.markPickedUp(orderId, user);
  }

  @Post(":orderId/on-route")
  markOnRoute(@Param("orderId") orderId: string, @CurrentUser() user: TokenPayload) {
    return this.courierOrdersService.markOnRoute(orderId, user);
  }

  @Post(":orderId/arrived")
  markArrived(@Param("orderId") orderId: string, @CurrentUser() user: TokenPayload) {
    return this.courierOrdersService.markArrived(orderId, user);
  }
}

