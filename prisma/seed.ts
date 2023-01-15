import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.plan.createMany({
    data: [{ name: "Free", enhancementsLimit: 5 }, { name: "Pay as you go" }],
  });

  const gabriel = await prisma.user.upsert({
    where: { email: "yo@gabrielmendezc.com" },
    update: {},
    create: {
      email: "yo@gabrielmendezc.com",
      plan: { connect: { name: "Free" } },
    },
  });

  console.log({ gabriel, plans });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
