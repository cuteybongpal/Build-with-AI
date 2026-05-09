"use server";

import { auth } from "@/auth";
import { prismaClient } from "@/shared/database/prisma-client";

const TOOL_NAME_LIST = [
  "fryingPan",
  "microwave",
  "pot",
  "riceCooker",
  "blender",
  "knife",
] as const;

export type ToolNameType = (typeof TOOL_NAME_LIST)[number];

const isToolName = (value: string): value is ToolNameType =>
  TOOL_NAME_LIST.some((toolName) => toolName === value);

const getCurrentUserId = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
};

const filterToolNameList = (toolNameList: ToolNameType[]) =>
  Array.from(new Set(toolNameList.filter(isToolName)));

export const getUserToolNameList = async (): Promise<ToolNameType[]> => {
  const userId = await getCurrentUserId();
  const toolList = await prismaClient.userTool.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { name: true },
  });

  return toolList.map((tool) => tool.name);
};

export const updateUserToolNameList = async (
  toolNameList: ToolNameType[],
): Promise<ToolNameType[]> => {
  const userId = await getCurrentUserId();
  const nextToolNameList = filterToolNameList(toolNameList);

  await prismaClient.$transaction([
    prismaClient.userTool.deleteMany({
      where: {
        userId,
        name: {
          notIn: nextToolNameList,
        },
      },
    }),
    ...nextToolNameList.map((name) =>
      prismaClient.userTool.upsert({
        where: {
          userId_name: {
            userId,
            name,
          },
        },
        create: {
          userId,
          name,
        },
        update: {},
      }),
    ),
  ]);

  return nextToolNameList;
};
