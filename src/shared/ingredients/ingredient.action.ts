"use server";

import { auth } from "@/auth";
import { prismaClient } from "@/shared/database/prisma-client";
import { convertIngredientAmount } from "@/shared/ingredients/ingredient-unit.util";
import {
  INGREDIENT_UNIT_LIST,
  type Ingredient,
  type IngredientUnitType,
} from "@/shared/types/ingredient";

type AddIngredientInputType = {
  amount: number;
  imageUrl?: string;
  name: string;
  unit: IngredientUnitType;
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
  unit: IngredientUnitType;
}): Ingredient => ({
  name: ingredient.name,
  amount: ingredient.amount,
  unit: ingredient.unit,
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
      unit: true,
      imageUrl: true,
    },
  });

  return ingredientList.map(convertIngredient);
};

export const addUserIngredient = async ({
  amount,
  imageUrl,
  name,
  unit,
}: AddIngredientInputType): Promise<Ingredient> => {
  const userId = await getCurrentUserId();
  const trimmedName = name.trim();

  if (!trimmedName || amount <= 0 || !INGREDIENT_UNIT_LIST.includes(unit)) {
    throw new Error("Invalid ingredient");
  }

  const existingIngredient = await prismaClient.ingredient.findUnique({
    where: {
      userId_name: {
        userId,
        name: trimmedName,
      },
    },
    select: {
      amount: true,
      unit: true,
    },
  });

  const ingredient = existingIngredient
    ? await prismaClient.ingredient.update({
        where: {
          userId_name: {
            userId,
            name: trimmedName,
          },
        },
        data: {
          amount:
            existingIngredient.amount +
            convertIngredientAmount(amount, unit, existingIngredient.unit),
          ...(imageUrl ? { imageUrl } : {}),
        },
        select: {
          name: true,
          amount: true,
          unit: true,
          imageUrl: true,
        },
      })
    : await prismaClient.ingredient.create({
        data: {
          userId,
          name: trimmedName,
          amount,
          unit,
          imageUrl,
        },
        select: {
          name: true,
          amount: true,
          unit: true,
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
