import { Admin } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma.server';

export async function verifyLogin(
  username: Admin['username'],
  password: Admin['password']
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

export async function getAdminById(id: Admin['id']) {
  return prisma.admin.findFirst({
    where: { id },
    select: {
      id: true,
      name: true,
      username: true,
    },
  });
}

export async function updatePassword(id: Admin['id'], currentPassword: Admin['password'], password: Admin['password']) {
  const userWithPassword = await prisma.admin.findUnique({
    where: { id },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(currentPassword, userWithPassword.password);
  if (!isValid) {
    return null;
  }
  const newPassword = await bcrypt.hash(password, 10);
  return prisma.admin.update({
    where: { id },
    data: {
      password: newPassword
    }
  });
}
