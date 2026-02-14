import { Injectable, NotFoundException } from "@nestjs/common";
import { SupportChannel, SupportStatus } from "@prisma/client";
import { TokenPayload } from "../../common/types/token-payload.type";
import { PrismaService } from "../prisma/prisma.service";

type CreateSupportTicketInput = {
  orderId?: string;
  channel: "in_app" | "whatsapp";
  subject: string;
  message: string;
};

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async createTicket(input: CreateSupportTicketInput, user: TokenPayload) {
    return this.prisma.supportTicket.create({
      data: {
        orderId: input.orderId,
        userId: user.sub,
        channel: input.channel === "whatsapp" ? SupportChannel.WHATSAPP : SupportChannel.IN_APP,
        subject: input.subject,
        message: input.message,
        status: SupportStatus.OPEN,
      },
    });
  }

  async getTicket(ticketId: string, user: TokenPayload) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException("Support ticket not found");
    }

    if (user.role !== "ADMIN" && ticket.userId !== user.sub) {
      throw new NotFoundException("Support ticket not found");
    }

    return ticket;
  }

  getChannels() {
    return [
      {
        key: "in_app",
        title: "In-App Support",
      },
      {
        key: "whatsapp",
        title: "WhatsApp Business",
      },
    ];
  }
}
