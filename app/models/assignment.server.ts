import { prisma } from "./prisma.server";

export const addAssignment = async (name: string) => {
  return prisma.assignment.create({
    data: {
      name,
    },
  });
};

export const updateAssignment = async (id: number, name: string) => {
  return prisma.assignment.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });
};

export const deleteAssignment = async (id: number) => {
  return prisma.assignment.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });
};

export const getAllAssignment = async () => {
  return await prisma.assignment.findMany({
    where: {
      isDeleted: false,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getAssignmentById = async (id: number) => {
  return await prisma.assignment.findFirst({
    where: {
      id: id,
    },
  });
};
