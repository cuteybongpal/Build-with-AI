"use client";

import type { Ingredient } from "@/shared/types/ingredient";

interface IngredientListProps {
  ingredients: Ingredient[];
  onRemove: (name: string) => void;
}

export default function IngredientList({
  ingredients,
  onRemove,
}: IngredientListProps) {
  if (ingredients.length === 0) {
    return (
      <div className="ingredient-list-empty">
        <span className="empty-icon">🫙</span>
        <p className="empty-text">냉장고가 비어있어요</p>
        <p className="empty-hint">식재료를 추가해 보세요!</p>
      </div>
    );
  }

  return (
    <div className="ingredient-list">
      {ingredients.map((item) => (
        <div key={item.name} className="ingredient-card">
          <div className="ingredient-card-image-wrapper">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="ingredient-card-image"
              />
            ) : (
              <div className="ingredient-card-no-image">🥗</div>
            )}
          </div>
          <div className="ingredient-card-info">
            <span className="ingredient-card-name">{item.name}</span>
            <span className="ingredient-card-amount">{item.amount}g</span>
          </div>
          <button
            type="button"
            className="ingredient-card-remove"
            onClick={() => onRemove(item.name)}
            aria-label={`${item.name} 제거`}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
