import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 10);

  await prisma.user.upsert({
    where: { phone: "+905000000001" },
    update: {
      fullName: "Platform Admin",
      passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      fullName: "Platform Admin",
      phone: "+905000000001",
      email: "admin@courier.local",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const cityCoefficients = [
    { cityCode: "34", coefficient: 1.2 },
    { cityCode: "06", coefficient: 1.1 },
    { cityCode: "35", coefficient: 1.15 },
  ];

  for (const item of cityCoefficients) {
    await prisma.cityCoefficient.upsert({
      where: { cityCode: item.cityCode },
      update: { coefficient: item.coefficient, isActive: true },
      create: { cityCode: item.cityCode, coefficient: item.coefficient, isActive: true },
    });
  }

  await prisma.pricingRule.createMany({
    data: [
      {
        cityCode: "34",
        name: "Istanbul Standard",
        isBoost: false,
        baseFee: 75,
        perKmRate: 12,
        minFee: 95,
        isActive: true,
        effectiveFrom: new Date(),
      },
      {
        cityCode: "34",
        name: "Istanbul Boost",
        isBoost: true,
        baseFee: 110,
        perKmRate: 16,
        minFee: 140,
        isActive: true,
        effectiveFrom: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
