import { Admin } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma.server";

export async function verifyLogin(
  username: Admin["username"],
  password: Admin["password"]
) {
  const userWithPassword = await prisma.admin.findUnique({
    where: { username },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password);

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
