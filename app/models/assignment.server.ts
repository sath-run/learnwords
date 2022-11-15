import { prisma } from "./prisma.server";

export const addAssignment = async (
  name: string
) => {
  return prisma.assignment.create({
    data: {
      name,
    },
  });
};

export const updateAssignment = async (
  id: string,
  name: string
) => {
  return prisma.assignment.update({
    where: {
      id
    },
    data: {
      name
    }
  });
};


export const deleteAssignment = async (
  id: string
) => {
  return prisma.assignment.update({
    where: {
      id
    },
    data: {
      isDeleted: true
    }
  });
};


export const getAllAssignment = async () => {
  return await prisma.assignment.findMany({
    where: {
      isDeleted: false
    },
    orderBy: { createdAt: "desc" },
  });
};
