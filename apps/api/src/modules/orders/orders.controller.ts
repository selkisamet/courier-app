import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { TokenPayload } from "../../common/types/token-payload.type";
import { CreateOrderInput, OrdersService } from "./orders.service";

@Controller("orders")
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles("SENDER_INDIVIDUAL", "SENDER_CORPORATE", "ADMIN")
  createOrder(@Body() body: CreateOrderInput, @CurrentUser() user: TokenPayload) {
    return this.ordersService.createOrder(body, user);
  }

  @Get()
  @Roles("SENDER_INDIVIDUAL", "SENDER_CORPORATE", "COURIER", "ADMIN")
  listOrders(@CurrentUser() user: TokenPayload) {
    return this.ordersService.listOrders(user);
  }

  @Get(":orderId")
  @Roles("SENDER_INDIVIDUAL", "SENDER_CORPORATE", "COURIER", "ADMIN")
  getOrder(@Param("orderId") orderId: string, @CurrentUser() user: TokenPayload) {
    return this.ordersService.getOrder(orderId, user);
  }
}
