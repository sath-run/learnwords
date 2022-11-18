import { User } from '@prisma/client';
import { prisma } from './prisma.server';
import bcrypt from 'bcryptjs';

export async function verifyLogin(
  email: User['email'],
  password: User['password']
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
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