import { prisma } from "./prisma.server";

export const addAssignment = async (data: {name: string, prologue: string, isShowTip: boolean}) => {
  return prisma.assignment.create({
    data,
  });
};

export const updateAssignment = async (id: number, data: {name: string, isShowTip: boolean, prologue: string}) => {
  return prisma.assignment.update({
    where: {
      id,
    },
    data,
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
