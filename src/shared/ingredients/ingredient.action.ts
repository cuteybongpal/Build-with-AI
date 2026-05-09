"use server";

import { auth } from "@/auth";
import { prismaClient } from "@/shared/database/prisma-client";
import type { Ingredient } from "@/shared/types/ingredient";

type AddIngredientInputType = {
  amount: number;
  imageUrl?: string;
  name: string;
};

const getCurrentUserId = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
};

const convertIngredient = (ingredient: {
  amount: number;
  imageUrl: string | null;
  name: string;
}): Ingredient => ({
  name: ingredient.name,
  amount: ingredient.amount,
  imageUrl: ingredient.imageUrl ?? "",
  imageFile: null,
});

export const getUserIngredientList = async (): Promise<Ingredient[]> => {
  const userId = await getCurrentUserId();
  const ingredientList = await prismaClient.ingredient.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      name: true,
      amount: true,
      imageUrl: true,
    },
  });

  return ingredientList.map(convertIngredient);
};

export const addUserIngredient = async ({
  amount,
  imageUrl,
  name,
}: AddIngredientInputType): Promise<Ingredient> => {
  const userId = await getCurrentUserId();
  const trimmedName = name.trim();

  if (!trimmedName || amount <= 0) {
    throw new Error("Invalid ingredient");
  }

  const ingredient = await prismaClient.ingredient.upsert({
    where: {
      userId_name: {
        userId,
        name: trimmedName,
      },
    },
    create: {
      userId,
      name: trimmedName,
      amount,
      imageUrl,
    },
    update: {
      amount: {
        increment: amount,
      },
      ...(imageUrl ? { imageUrl } : {}),
    },
    select: {
      name: true,
      amount: true,
      imageUrl: true,
    },
  });

  return convertIngredient(ingredient);
};

export const removeUserIngredient = async (name: string) => {
  const userId = await getCurrentUserId();

  await prismaClient.ingredient.deleteMany({
    where: {
      userId,
      name,
    },
  });
};
