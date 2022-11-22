import { prisma } from "./prisma.server";

export const addTask = async (data: {
  videoUrl: string;
  question: string;
  example: string;
  imageUrl: string;
  initial: string[];
  alternative: string[];
  assignmentId: number;
}) => {
  const result = await prisma.task.create({
    data,
  });
  return result;
};

export const updateTask = async (
  id: number,
  data: {
    videoUrl: string;
    imageUrl: string;
    question: string;
    example: string;
    initial: string[];
    alternative: string[];
  }
) => {
  return prisma.task.update({
    where: {
      id,
    },
    data: data,
  });
};

export const deleteTask = async (id: number) => {
  return prisma.task.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });
};

export const getAssignmentWithTasks = async (assignmentId: number) => {
  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
    },
    select: {
      id: true,
      name: true,
      tasks: {
        where: {
          isDeleted: false,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return assignment;
};
