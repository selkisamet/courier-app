import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  AssignmentState,
  EntryDirection,
  HoldStatus,
  OrderStatus,
  WalletEntryType,
} from "@prisma/client";
import { TokenPayload } from "../../common/types/token-payload.type";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CourierOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailableOrders(user: TokenPayload) {
    const courier = await this.prisma.courierProfile.findUnique({ where: { userId: user.sub } });

    if (!courier) {
      throw new NotFoundException("Courier profile not found");
    }

    return this.prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.CREATED, OrderStatus.PUBLISHED] },
        assignedCourierId: null,
      },
      orderBy: [{ boost: "desc" }, { createdAt: "asc" }],
      take: 50,
      include: {
        package: true,
        labels: true,
        payment: true,
      },
    });
  }

  async acceptOrder(orderId: string, user: TokenPayload) {
    const courier = await this.prisma.courierProfile.findUnique({ where: { userId: user.sub } });

    if (!courier) {
      throw new NotFoundException("Courier profile not found");
    }

    const wallet = await this.prisma.wallet.findUnique({ where: { courierId: courier.id } });

    if (!wallet) {
      throw new NotFoundException("Courier wallet not found");
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });

      if (!order) {
        throw new NotFoundException("Order not found");
      }

      if (order.status !== OrderStatus.CREATED && order.status !== OrderStatus.PUBLISHED) {
        throw new BadRequestException("Order is not available for acceptance");
      }

      if (order.assignedCourierId) {
        throw new BadRequestException("Order already assigned");
      }

      const commission = Number(order.platformCommission);
      const walletBalance = Number(wallet.balance);

      if (walletBalance < commission) {
        throw new BadRequestException("Insufficient wallet balance for commission hold");
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: commission,
          },
        },
      });

      await tx.walletHold.upsert({
        where: {
          walletId_orderId: {
            walletId: wallet.id,
            orderId: order.id,
          },
        },
        update: {
          amount: commission,
          status: HoldStatus.ACTIVE,
        },
        create: {
          walletId: wallet.id,
          orderId: order.id,
          amount: commission,
          status: HoldStatus.ACTIVE,
        },
      });

      await tx.walletLedger.create({
        data: {
          walletId: wallet.id,
          orderId: order.id,
          entryType: WalletEntryType.COMMISSION_HOLD,
          direction: EntryDirection.DEBIT,
          amount: commission,
          description: "Commission pre-hold on order acceptance",
        },
      });

      await tx.orderAssignment.create({
        data: {
          orderId: order.id,
          courierId: courier.id,
          state: AssignmentState.ACCEPTED,
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          assignedCourierId: courier.id,
          status: OrderStatus.ACCEPTED,
          events: {
            create: {
              actorUserId: user.sub,
              eventType: "ORDER_ACCEPTED",
              payload: {
                courierId: courier.id,
                commissionHold: commission,
              },
            },
          },
        },
        include: {
          package: true,
          labels: true,
          payment: true,
        },
      });

      return updatedOrder;
    });
  }

  async rejectOrder(orderId: string, user: TokenPayload) {
    const courier = await this.prisma.courierProfile.findUnique({ where: { userId: user.sub } });

    if (!courier) {
      throw new NotFoundException("Courier profile not found");
    }

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    const assignment = await this.prisma.orderAssignment.findFirst({
      where: { orderId, courierId: courier.id },
    });

    if (assignment) {
      return this.prisma.orderAssignment.update({
        where: { id: assignment.id },
        data: { state: AssignmentState.REJECTED },
      });
    }

    return this.prisma.orderAssignment.create({
      data: {
        orderId,
        courierId: courier.id,
        state: AssignmentState.REJECTED,
      },
    });
  }

  async markPickedUp(orderId: string, user: TokenPayload) {
    return this.transitionOrder(orderId, user, OrderStatus.ACCEPTED, OrderStatus.PICKED_UP, "ORDER_PICKED_UP");
  }

  async markOnRoute(orderId: string, user: TokenPayload) {
    return this.transitionOrder(orderId, user, OrderStatus.PICKED_UP, OrderStatus.ON_ROUTE, "ORDER_ON_ROUTE");
  }

  async markArrived(orderId: string, user: TokenPayload) {
    return this.transitionOrder(orderId, user, OrderStatus.ON_ROUTE, OrderStatus.ARRIVED, "ORDER_ARRIVED");
  }

  private async transitionOrder(
    orderId: string,
    user: TokenPayload,
    expectedStatus: OrderStatus,
    nextStatus: OrderStatus,
    eventType: string,
  ) {
    const courier = await this.prisma.courierProfile.findUnique({ where: { userId: user.sub } });

    if (!courier) {
      throw new NotFoundException("Courier profile not found");
    }

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.assignedCourierId !== courier.id) {
      throw new BadRequestException("Order is not assigned to current courier");
    }

    if (order.status !== expectedStatus) {
      throw new BadRequestException(`Order status must be ${expectedStatus}`);
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
        events: {
          create: {
            actorUserId: user.sub,
            eventType,
            payload: {
              previousStatus: expectedStatus,
              nextStatus,
            },
          },
        },
      },
    });
  }
}
