import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const gabriel = await prisma.user.upsert({
    where: { email: "yo@gabrielmendezc.com" },
    update: {},
    create: {
      email: "yo@gabrielmendezc.com",
    },
  });

  console.log({ gabriel });
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
