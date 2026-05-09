import type { IngredientUnitType } from "@/shared/types/ingredient";

const INGREDIENT_UNIT_WEIGHT_IN_MILLIGRAM: Record<IngredientUnitType, number> = {
  mg: 1,
  g: 1000,
  kg: 1000000,
  t: 1000000000,
};

export const convertIngredientAmount = (
  amount: number,
  fromUnit: IngredientUnitType,
  toUnit: IngredientUnitType,
) => {
  const amountInMilligram =
    amount * INGREDIENT_UNIT_WEIGHT_IN_MILLIGRAM[fromUnit];

  return amountInMilligram / INGREDIENT_UNIT_WEIGHT_IN_MILLIGRAM[toUnit];
};
