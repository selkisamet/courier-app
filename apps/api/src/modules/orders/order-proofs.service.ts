import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { EntryDirection, HoldStatus, OrderStatus, PaymentStatus, PaymentType, ProofType, WalletEntryType } from "@prisma/client";
import { createHash, randomInt } from "crypto";
import { TokenPayload } from "../../common/types/token-payload.type";
import { PrismaService } from "../prisma/prisma.service";

type UploadPhotoInput = {
  fileKey: string;
  kind: "pickup" | "delivery";
};

type UploadGpsInput = {
  lat: number;
  lng: number;
};

type VerifyOtpInput = {
  otp: string;
};

@Injectable()
export class OrderProofsService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadPhoto(orderId: string, user: TokenPayload, input: UploadPhotoInput) {
    const order = await this.assertCourierOrder(orderId, user);

    if (![OrderStatus.ACCEPTED, OrderStatus.PICKED_UP, OrderStatus.ON_ROUTE, OrderStatus.ARRIVED].includes(order.status)) {
      throw new BadRequestException("Order state does not allow proof upload");
    }

    const proofType = input.kind === "pickup" ? ProofType.PICKUP_PHOTO : ProofType.DELIVERY_PHOTO;

    return this.prisma.orderProof.create({
      data: {
        orderId,
        proofType,
        fileKey: input.fileKey,
      },
    });
  }

  async uploadGps(orderId: string, user: TokenPayload, input: UploadGpsInput) {
    const order = await this.assertCourierOrder(orderId, user);

    if (![OrderStatus.ON_ROUTE, OrderStatus.ARRIVED].includes(order.status)) {
      throw new BadRequestException("Order must be on-route or arrived to save GPS proof");
    }

    return this.prisma.orderProof.create({
      data: {
        orderId,
        proofType: ProofType.GPS,
        lat: input.lat,
        lng: input.lng,
      },
    });
  }

  async sendOtp(orderId: string, user: TokenPayload) {
    await this.assertCourierOrder(orderId, user);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { sender: true },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    const otp = this.generateOtp();
    const otpHash = this.hashOtp(otp);

    await this.prisma.orderProof.create({
      data: {
        orderId,
        proofType: ProofType.OTP,
        otpHash,
        metadata: {
          sentTo: order.sender.phone,
          via: "sms",
        },
      },
    });

    return {
      success: true,
      sentTo: order.sender.phone,
      ...(process.env.NODE_ENV !== "production" ? { devOtp: otp } : {}),
    };
  }

  async verifyOtp(orderId: string, user: TokenPayload, input: VerifyOtpInput) {
    await this.assertCourierOrder(orderId, user);

    const latestOtpProof = await this.prisma.orderProof.findFirst({
      where: {
        orderId,
        proofType: ProofType.OTP,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!latestOtpProof || !latestOtpProof.otpHash) {
      throw new BadRequestException("OTP has not been sent");
    }

    const isMatch = latestOtpProof.otpHash === this.hashOtp(input.otp);

    if (!isMatch) {
      throw new BadRequestException("Invalid OTP code");
    }

    await this.prisma.orderProof.update({
      where: { id: latestOtpProof.id },
      data: { otpVerifiedAt: new Date() },
    });

    await this.prisma.orderEvent.create({
      data: {
        orderId,
        actorUserId: user.sub,
        eventType: "OTP_VERIFIED",
      },
    });

    return { verified: true };
  }

  async completeOrder(orderId: string, user: TokenPayload) {
    const order = await this.assertCourierOrder(orderId, user);

    if (order.status !== OrderStatus.ARRIVED) {
      throw new BadRequestException("Order must be in ARRIVED status");
    }

    const proofs = await this.prisma.orderProof.findMany({ where: { orderId } });

    const hasDeliveryPhoto = proofs.some((item) => item.proofType === ProofType.DELIVERY_PHOTO && !!item.fileKey);
    const hasGps = proofs.some((item) => item.proofType === ProofType.GPS && item.lat !== null && item.lng !== null);
    const hasOtpVerified = proofs.some((item) => item.proofType === ProofType.OTP && !!item.otpVerifiedAt);

    if (!hasDeliveryPhoto || !hasGps || !hasOtpVerified) {
      throw new BadRequestException("Delivery proof is incomplete");
    }

    return this.prisma.$transaction(async (tx) => {
      const deliveredOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.DELIVERED,
          events: {
            create: {
              actorUserId: user.sub,
              eventType: "ORDER_DELIVERED",
            },
          },
        },
        include: {
          payment: true,
        },
      });

      const courierProfile = await tx.courierProfile.findUnique({ where: { userId: user.sub } });
      if (!courierProfile) {
        throw new NotFoundException("Courier profile not found");
      }

      const wallet = await tx.wallet.findUnique({ where: { courierId: courierProfile.id } });
      if (!wallet) {
        throw new NotFoundException("Wallet not found");
      }

      const hold = await tx.walletHold.findFirst({
        where: {
          walletId: wallet.id,
          orderId,
          status: HoldStatus.ACTIVE,
        },
      });

      if (hold) {
        await tx.walletHold.update({
          where: { id: hold.id },
          data: {
            status: HoldStatus.CAPTURED,
            capturedAt: new Date(),
          },
        });
      }

      if (deliveredOrder.payment) {
        await tx.payment.update({
          where: { id: deliveredOrder.payment.id },
          data: { status: PaymentStatus.CAPTURED },
        });

        if (deliveredOrder.payment.paymentType !== PaymentType.CASH) {
          const earningAmount = Number(deliveredOrder.payment.courierNetAmount);

          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              balance: {
                increment: earningAmount,
              },
            },
          });

          await tx.walletLedger.create({
            data: {
              walletId: wallet.id,
              orderId,
              entryType: WalletEntryType.EARNING,
              direction: EntryDirection.CREDIT,
              amount: earningAmount,
              description: "Courier earning after completed delivery",
            },
          });
        }
      }

      return {
        id: deliveredOrder.id,
        status: deliveredOrder.status,
      };
    });
  }

  private async assertCourierOrder(orderId: string, user: TokenPayload) {
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

    return order;
  }

  private generateOtp() {
    return randomInt(1000, 10000).toString();
  }

  private hashOtp(otp: string) {
    return createHash("sha256").update(otp).digest("hex");
  }
}

