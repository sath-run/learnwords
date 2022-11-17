import { prisma } from './prisma.server';

export const addTask = async (assignmentId: string, data: {
  videoUrl: string;
  question: string;
  example: string;
  initial: string[];
  alternative: string[];
}) => {
  const assignment = await prisma.assignment.findFirst({where: {id: assignmentId}});
  if (!assignment) {
    return false;
  }
  const result = await prisma.task.create({
    data,
  });
  await prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      taskIds: assignment.taskIds.concat(result.id)
    }
  });
  return result;
};

export const updateTask = async (
  id: string,
  data: {
    videoUrl: string;
    question: string;
    example: string;
    initial: string[];
    alternative: string[];
  }
) => {
  return prisma.task.update({
    where: {
      id
    },
    data: data
  });
};

export const deleteTask = async (
  assignmentId: string,
  id: string
) => {
  return prisma.task.update({
    where: {
      id
    },
    data: {
      isDeleted: true
    }
  });
};

export const getAllTasks = async (assignmentId: string | undefined) => {
  if (!assignmentId) {
    return [];
  }
  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
    }
  })
  if (!assignment) {
    return [];
  }
  return await prisma.task.findMany({
    where: {
      id: {
        in: assignment.taskIds
      },
      isDeleted: false
    },
    orderBy: { createdAt: 'asc' },
  });
};
