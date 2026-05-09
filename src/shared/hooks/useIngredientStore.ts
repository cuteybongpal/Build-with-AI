"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addUserIngredient,
  getUserIngredientList,
  removeUserIngredient,
} from "@/shared/ingredients/ingredient.action";
import type { Ingredient } from "@/shared/types/ingredient";

/**
 * 디지털 식재료 저장소 훅
 *
 * - 인메모리 상태로 식재료를 관리합니다 (서버/DB 미사용).
 * - 이름이 같은 식재료가 추가되면 총량만 합산하고 새 항목을 만들지 않습니다.
 * - 사진이 새로 제공되면 기존 사진을 교체합니다.
 */
export function useIngredientStore() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  // Object URL을 추적하여 메모리 누수 방지
  const objectUrlsRef = useRef<Map<string, string>>(new Map());

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

  /**
   * 식재료 추가
   * - 이름이 같은 식재료가 이미 있으면 총량만 합산합니다.
   * - 새로운 사진이 제공되면 기존 사진을 교체합니다.
   */
  const addIngredient = useCallback(
    (name: string, amount: number, imageFile: File | null) => {
      const trimmedName = name.trim();

      setIngredients((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.name === trimmedName,
        );

        if (existingIndex !== -1) {
          // 이름이 같은 식재료가 이미 존재 → 총량 합산
          return prev.map((item, index) => {
            if (index !== existingIndex) return item;

            let newImageUrl = item.imageUrl;
            let newImageFile = item.imageFile;

            if (imageFile) {
              // 기존 Object URL 해제
              if (item.imageUrl) {
                URL.revokeObjectURL(item.imageUrl);
                objectUrlsRef.current.delete(trimmedName);
              }
              newImageUrl = URL.createObjectURL(imageFile);
              newImageFile = imageFile;
              objectUrlsRef.current.set(trimmedName, newImageUrl);
            }

            return {
              ...item,
              amount: item.amount + amount,
              imageUrl: newImageUrl,
              imageFile: newImageFile,
            };
          });
        }

        // 새로운 식재료 추가
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
            imageUrl,
            imageFile,
          },
        ];
      });

      void addUserIngredient({
        name: trimmedName,
        amount,
      });
    },
    [],
  );

  /**
   * 식재료 제거
   */
  const removeIngredient = useCallback((name: string) => {
    setIngredients((prev) => {
      const target = prev.find((item) => item.name === name);
      if (target?.imageUrl) {
        URL.revokeObjectURL(target.imageUrl);
        objectUrlsRef.current.delete(name);
      }
      return prev.filter((item) => item.name !== name);
    });

    void removeUserIngredient(name);
  }, []);

  /**
   * 식재료 총량 수정
   */
  const updateAmount = useCallback((name: string, newAmount: number) => {
    setIngredients((prev) =>
      prev.map((item) =>
        item.name === name ? { ...item, amount: newAmount } : item,
      ),
    );
  }, []);

  /**
   * 모든 식재료 제거
   */
  const clearAll = useCallback(() => {
    setIngredients((prev) => {
      for (const item of prev) {
        if (item.imageUrl) {
          URL.revokeObjectURL(item.imageUrl);
        }
      }
      objectUrlsRef.current.clear();
      return [];
    });
  }, []);

  return {
    ingredients,
    addIngredient,
    removeIngredient,
    updateAmount,
    clearAll,
  };
}
