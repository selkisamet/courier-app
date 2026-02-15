import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { TokenPayload } from "../../common/types/token-payload.type";
import { SupportService } from "./support.service";

@Controller("support")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post("tickets")
  @Roles("SENDER_INDIVIDUAL", "SENDER_CORPORATE", "COURIER", "ADMIN")
  createTicket(
    @Body()
    body: {
      orderId?: string;
      channel: "in_app" | "whatsapp";
      subject: string;
      message: string;
    },
    @CurrentUser() user: TokenPayload,
  ) {
    return this.supportService.createTicket(body, user);
  }

  @Get("tickets/:ticketId")
  @Roles("SENDER_INDIVIDUAL", "SENDER_CORPORATE", "COURIER", "ADMIN")
  getTicket(@Param("ticketId") ticketId: string, @CurrentUser() user: TokenPayload) {
    return this.supportService.getTicket(ticketId, user);
  }

  @Get("channels")
  @Roles("SENDER_INDIVIDUAL", "SENDER_CORPORATE", "COURIER", "ADMIN")
  getChannels() {
    return this.supportService.getChannels();
  }
}
