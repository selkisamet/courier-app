import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { LabelType, OrderStatus, PaymentType, PayerType } from "@prisma/client";
import { TokenPayload } from "../../common/types/token-payload.type";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(input: CreateOrderDto, user: TokenPayload) {
    if (input.paymentType === "corporate" && user.role !== "SENDER_CORPORATE") {
      throw new BadRequestException("Corporate payment is allowed only for corporate senders");
    }

    const basePrice = 100;
    const boostFee = input.boost ? 40 : 0;
    const totalPrice = basePrice + boostFee;
    const platformCommission = Math.round(totalPrice * 0.3 * 100) / 100;
    const courierNetEarning = Math.round((totalPrice - platformCommission) * 100) / 100;

    const labelValues = this.mapLabels(input.package.labels ?? []);

    const order = await this.prisma.order.create({
      data: {
        orderCode: this.buildOrderCode(),
        senderId: user.sub,
        payerId: input.payerType === "sender" ? user.sub : null,
        status: OrderStatus.PUBLISHED,
        payerType: input.payerType === "sender" ? PayerType.SENDER : PayerType.RECEIVER,
        paymentType: this.mapPaymentType(input.paymentType),
        boost: input.boost,
        pickupAddress: input.pickupAddress,
        dropoffAddress: input.dropoffAddress,
        basePrice,
        boostFee,
        totalPrice,
        platformCommission,
        courierNetEarning,
        courierNote: input.package.note,
        package: {
          create: {
            photoKey: input.package.photoKey,
            weightKg: input.package.weightKg,
            sizeClass: input.package.sizeClass,
            volumeCm3: input.package.volumeCm3,
          },
        },
        labels: {
          create: labelValues.map((label) => ({ label })),
        },
        events: {
          createMany: {
            data: [
              {
                actorUserId: user.sub,
                eventType: "ORDER_CREATED",
                payload: {
                  payerType: input.payerType,
                  paymentType: input.paymentType,
                  boost: input.boost,
                },
              },
              {
                actorUserId: user.sub,
                eventType: "ORDER_PUBLISHED",
                payload: {
                  boosted: input.boost,
                },
              },
            ],
          },
        },
        payment: {
          create: {
            payerType: input.payerType === "sender" ? PayerType.SENDER : PayerType.RECEIVER,
            paymentType: this.mapPaymentType(input.paymentType),
            grossAmount: totalPrice,
            commissionAmount: platformCommission,
            courierNetAmount: courierNetEarning,
            collectedByCourier: input.paymentType === "cash",
          },
        },
      },
      include: {
        package: true,
        labels: true,
        payment: true,
      },
    });

    return order;
  }

  async listOrders(user: TokenPayload) {
    if (user.role === "ADMIN") {
      return this.prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { package: true, labels: true, payment: true },
      });
    }

    if (user.role === "COURIER") {
      const courierProfile = await this.prisma.courierProfile.findUnique({
        where: { userId: user.sub },
      });

      if (!courierProfile) {
        return [];
      }

      return this.prisma.order.findMany({
        where: { assignedCourierId: courierProfile.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { package: true, labels: true, payment: true },
      });
    }

    return this.prisma.order.findMany({
      where: { senderId: user.sub },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { package: true, labels: true, payment: true },
    });
  }

  async getOrder(orderId: string, user: TokenPayload) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        package: true,
        labels: true,
        payment: true,
        events: {
          orderBy: { createdAt: "asc" },
          take: 20,
        },
      },
    });

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    if (user.role === "ADMIN") {
      return order;
    }

    if (user.role === "COURIER") {
      const courierProfile = await this.prisma.courierProfile.findUnique({
        where: { userId: user.sub },
      });

      if (!courierProfile || order.assignedCourierId !== courierProfile.id) {
        throw new ForbiddenException("Order access denied");
      }

      return order;
    }

    if (order.senderId !== user.sub) {
      throw new ForbiddenException("Order access denied");
    }

    return order;
  }

  private mapPaymentType(paymentType: "cash" | "online" | "corporate"): PaymentType {
    switch (paymentType) {
      case "cash":
        return PaymentType.CASH;
      case "online":
        return PaymentType.ONLINE;
      case "corporate":
        return PaymentType.CORPORATE;
      default:
        return PaymentType.CASH;
    }
  }

  private mapLabels(labels: string[]): LabelType[] {
    const mapped = labels
      .map((label) => label.toLowerCase().trim())
      .map((label): LabelType | null => {
        switch (label) {
          case "fragile":
            return LabelType.FRAGILE;
          case "upright":
            return LabelType.UPRIGHT;
          case "liquid":
            return LabelType.LIQUID;
          case "electronic":
            return LabelType.ELECTRONIC;
          case "no_wet":
            return LabelType.NO_WET;
          default:
            return null;
        }
      })
      .filter((label): label is LabelType => label !== null);

    return [...new Set(mapped)];
  }

  private buildOrderCode() {
    const time = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `ORD-${time}-${random}`;
  }
}
