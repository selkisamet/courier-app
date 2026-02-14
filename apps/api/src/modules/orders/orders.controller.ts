import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { TokenPayload } from "../../common/types/token-payload.type";

type CreateOrderRequest = {
  pickupAddress: string;
  dropoffAddress: string;
  payerType: "sender" | "receiver";
  paymentType: "cash" | "online" | "corporate";
  boost: boolean;
};

@Controller("orders")
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  @Post()
  @Roles("SENDER_INDIVIDUAL", "SENDER_CORPORATE", "ADMIN")
  createOrder(@Body() body: CreateOrderRequest, @CurrentUser() user: TokenPayload) {
    return {
      id: "ord_demo_1",
      status: "created",
      senderId: user.sub,
      ...body,
      createdAt: new Date().toISOString(),
    };
  }

  @Get()
  @Roles("SENDER_INDIVIDUAL", "SENDER_CORPORATE", "COURIER", "ADMIN")
  listOrders(@CurrentUser() user: TokenPayload) {
    return {
      items: [],
      total: 0,
      requestedBy: user.sub,
      requestedByRole: user.role,
    };
  }

  @Get(":orderId")
  @Roles("SENDER_INDIVIDUAL", "SENDER_CORPORATE", "COURIER", "ADMIN")
  getOrder(@Param("orderId") orderId: string, @CurrentUser() user: TokenPayload) {
    return {
      id: orderId,
      status: "created",
      requestedBy: user.sub,
      requestedByRole: user.role,
    };
  }
}
