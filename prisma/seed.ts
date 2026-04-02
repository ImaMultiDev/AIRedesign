import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email =
    process.env.ADMIN_SEED_EMAIL?.trim() || "admin@demo.local";
  const password =
    process.env.ADMIN_SEED_PASSWORD || "admin123";

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { password: passwordHash },
    create: {
      email,
      password: passwordHash,
      name: "Administrador",
    },
  });

  console.info(`Usuario admin listo: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
