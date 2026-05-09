export const INGREDIENT_UNIT_LIST = ["mg", "g", "kg", "t"] as const;

export type IngredientUnitType = (typeof INGREDIENT_UNIT_LIST)[number];

export interface Ingredient {
  name: string;
  amount: number;
  unit: IngredientUnitType;
  imageUrl: string;
  imageFile: File | null;
}
