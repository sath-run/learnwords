import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  let prisma = new PrismaClient();
  prisma.$connect();

  let password = "abcd1234";
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.admin.create({
    data: {
      name: "系统管理员",
      username: "admin",
      password: hashedPassword,
    },
  });
}

main().then(() => console.log("Done seeding"));
