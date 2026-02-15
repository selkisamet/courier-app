import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { EntryDirection, WalletEntryType } from "@prisma/client";
import { TokenPayload } from "../../common/types/token-payload.type";
import { PrismaService } from "../prisma/prisma.service";

type UploadTaxCertificateInput = {
  fileKey: string;
};

type UpdateVehicleInput = {
  vehicleType: string;
};

type TopupWalletInput = {
  amount: number;
};

@Injectable()
export class CouriersService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadTaxCertificate(user: TokenPayload, input: UploadTaxCertificateInput) {
    const profile = await this.prisma.courierProfile.findUnique({ where: { userId: user.sub } });

    if (!profile) {
      throw new NotFoundException("Courier profile not found");
    }

    return this.prisma.courierDocument.create({
      data: {
        courierId: profile.id,
        type: "tax_certificate",
        fileKey: input.fileKey,
      },
    });
  }

  async getMyStatus(user: TokenPayload) {
    const profile = await this.prisma.courierProfile.findUnique({
      where: { userId: user.sub },
      include: {
        wallet: true,
        documents: true,
      },
    });

    if (!profile) {
      throw new NotFoundException("Courier profile not found");
    }

    return {
      id: profile.id,
      status: profile.status,
      cityCode: profile.cityCode,
      vehicleType: profile.vehicleType,
      walletBalance: profile.wallet?.balance ?? 0,
      documents: profile.documents.map((doc) => ({
        id: doc.id,
        type: doc.type,
        status: doc.status,
      })),
    };
  }

  async updateMyVehicle(user: TokenPayload, input: UpdateVehicleInput) {
    const profile = await this.prisma.courierProfile.findUnique({ where: { userId: user.sub } });

    if (!profile) {
      throw new NotFoundException("Courier profile not found");
    }

    return this.prisma.courierProfile.update({
      where: { id: profile.id },
      data: { vehicleType: input.vehicleType },
    });
  }

  async getMyWallet(user: TokenPayload) {
    const profile = await this.prisma.courierProfile.findUnique({ where: { userId: user.sub } });

    if (!profile) {
      throw new NotFoundException("Courier profile not found");
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { courierId: profile.id },
      include: {
        holds: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!wallet) {
      throw new NotFoundException("Wallet not found");
    }

    return wallet;
  }

  async getMyWalletLedger(user: TokenPayload) {
    const profile = await this.prisma.courierProfile.findUnique({ where: { userId: user.sub } });

    if (!profile) {
      throw new NotFoundException("Courier profile not found");
    }

    const wallet = await this.prisma.wallet.findUnique({ where: { courierId: profile.id } });

    if (!wallet) {
      throw new NotFoundException("Wallet not found");
    }

    return this.prisma.walletLedger.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async topupMyWallet(user: TokenPayload, input: TopupWalletInput) {
    const profile = await this.prisma.courierProfile.findUnique({ where: { userId: user.sub } });

    if (!profile) {
      throw new NotFoundException("Courier profile not found");
    }

    const wallet = await this.prisma.wallet.findUnique({ where: { courierId: profile.id } });

    if (!wallet) {
      throw new NotFoundException("Wallet not found");
    }

    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new BadRequestException("Topup amount must be greater than zero");
    }

    const updatedWallet = await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: input.amount,
        },
      },
    });

    await this.prisma.walletLedger.create({
      data: {
        walletId: wallet.id,
        entryType: WalletEntryType.TOPUP,
        direction: EntryDirection.CREDIT,
        amount: input.amount,
        description: "Wallet topup",
      },
    });

    return updatedWallet;
  }

  async getMyWalletHolds(user: TokenPayload) {
    const profile = await this.prisma.courierProfile.findUnique({ where: { userId: user.sub } });

    if (!profile) {
      throw new NotFoundException("Courier profile not found");
    }

    const wallet = await this.prisma.wallet.findUnique({ where: { courierId: profile.id } });

    if (!wallet) {
      throw new NotFoundException("Wallet not found");
    }

    return this.prisma.walletHold.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }
}
