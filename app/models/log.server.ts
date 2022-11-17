import { prisma } from "./prisma.server";

export const AddLog = async (
  data: Parameters<typeof prisma.log.create>[0]["data"]
) => {
  return prisma.log.create({
    data: data,
  });
};

export const getAllLogs = async (assignmentId: number) => {
  let logs = await prisma.log.findMany({
    where: {
      assignmentId,
    },
    orderBy: { createdAt: "desc" },
  });
  return logs;
};
