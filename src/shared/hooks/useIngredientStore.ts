"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addUserIngredient,
  getUserIngredientList,
  removeUserIngredient,
} from "@/shared/ingredients/ingredient.action";
import { convertIngredientAmount } from "@/shared/ingredients/ingredient-unit.util";
import type { Ingredient, IngredientUnitType } from "@/shared/types/ingredient";

export function useIngredientStore() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const objectUrlsRef = useRef<Map<string, string>>(new Map());

  const removeObjectUrl = useCallback((name: string) => {
    const imageUrl = objectUrlsRef.current.get(name);

    if (!imageUrl) {
      return;
    }

    URL.revokeObjectURL(imageUrl);
    objectUrlsRef.current.delete(name);
  }, []);

  const replaceIngredientListFromServer = useCallback(() => {
    getUserIngredientList()
      .then((savedIngredientList) => {
        setIngredients((currentIngredientList) => {
          currentIngredientList.forEach((ingredient) => {
            removeObjectUrl(ingredient.name);
          });

          return savedIngredientList;
        });
      })
      .catch(() => {
        setIngredients([]);
      });
  }, [removeObjectUrl]);

  useEffect(() => {
    let canUpdate = true;

    getUserIngredientList()
      .then((savedIngredientList) => {
        if (canUpdate) {
          setIngredients(savedIngredientList);
        }
      })
      .catch(() => {
        if (canUpdate) {
          setIngredients([]);
        }
      });

    return () => {
      canUpdate = false;
    };
  }, []);

  const addIngredient = useCallback(
    (
      name: string,
      amount: number,
      unit: IngredientUnitType,
      imageFile: File | null,
    ) => {
      const trimmedName = name.trim();

      setIngredients((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.name === trimmedName,
        );

        if (existingIndex !== -1) {
          return prev.map((item, index) => {
            if (index !== existingIndex) return item;

            let newImageUrl = item.imageUrl;
            let newImageFile = item.imageFile;

            if (imageFile) {
              removeObjectUrl(trimmedName);
              newImageUrl = URL.createObjectURL(imageFile);
              newImageFile = imageFile;
              objectUrlsRef.current.set(trimmedName, newImageUrl);
            }

            return {
              ...item,
              amount:
                item.amount + convertIngredientAmount(amount, unit, item.unit),
              imageUrl: newImageUrl,
              imageFile: newImageFile,
            };
          });
        }

        let imageUrl = "";
        if (imageFile) {
          imageUrl = URL.createObjectURL(imageFile);
          objectUrlsRef.current.set(trimmedName, imageUrl);
        }

        return [
          ...prev,
          {
            name: trimmedName,
            amount,
            unit,
            imageUrl,
            imageFile,
          },
        ];
      });

      addUserIngredient({
        name: trimmedName,
        amount,
        unit,
      })
        .then((savedIngredient) => {
          setIngredients((currentIngredientList) =>
            currentIngredientList.map((ingredient) =>
              ingredient.name === savedIngredient.name
                ? {
                    ...savedIngredient,
                    imageUrl: ingredient.imageUrl,
                    imageFile: ingredient.imageFile,
                  }
                : ingredient,
            ),
          );
        })
        .catch(() => {
          replaceIngredientListFromServer();
        });
    },
    [removeObjectUrl, replaceIngredientListFromServer],
  );

  const removeIngredient = useCallback(
    (name: string) => {
      setIngredients((prev) => {
        removeObjectUrl(name);
        return prev.filter((item) => item.name !== name);
      });

      removeUserIngredient(name).catch(() => {
        replaceIngredientListFromServer();
      });
    },
    [removeObjectUrl, replaceIngredientListFromServer],
  );

  return {
    ingredients,
    addIngredient,
    removeIngredient,
  };
}
