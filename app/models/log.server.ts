import { prisma } from "./prisma.server";

export const AddLog = async (
  data: Parameters<typeof prisma.log.create>[0]["data"]
) => {
  return prisma.log.create({
    data: data,
  });
};

export const getAllLogs = async () => {
  let logs = await prisma.log.findMany({
    orderBy: { createdAt: "desc" },
  });
  return logs;
};
