import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

type QuoteInput = {
  cityCode: string;
  boost?: boolean;
  distanceKm?: number;
};

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async quote(input: QuoteInput) {
    const distanceKm = input.distanceKm && input.distanceKm > 0 ? input.distanceKm : 3;
    const now = new Date();

    const rule = await this.prisma.pricingRule.findFirst({
      where: {
        cityCode: input.cityCode,
        isBoost: input.boost ?? false,
        isActive: true,
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
      },
      orderBy: { effectiveFrom: "desc" },
    });

    if (!rule) {
      throw new BadRequestException("No active pricing rule found for city");
    }

    const coefficientEntity = await this.prisma.cityCoefficient.findUnique({
      where: { cityCode: input.cityCode },
    });

    const coefficient = coefficientEntity?.isActive ? Number(coefficientEntity.coefficient) : 1;
    const baseFee = Number(rule.baseFee);
    const perKmRate = Number(rule.perKmRate);
    const minFee = Number(rule.minFee);

    const rawPrice = (baseFee + distanceKm * perKmRate) * coefficient;
    const total = Math.max(rawPrice, minFee);

    return {
      cityCode: input.cityCode,
      ruleId: rule.id,
      ruleName: rule.name,
      boost: rule.isBoost,
      distanceKm,
      coefficient,
      baseFee,
      perKmRate,
      minFee,
      total: Number(total.toFixed(2)),
      currency: "TRY",
    };
  }

  async getCityCoefficients() {
    return this.prisma.cityCoefficient.findMany({
      where: { isActive: true },
      orderBy: { cityCode: "asc" },
    });
  }
}
