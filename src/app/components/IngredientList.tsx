"use client";

import {
  type CSSProperties,
  type PointerEvent,
  useRef,
  useState,
} from "react";
import type { Ingredient } from "@/shared/types/ingredient";

interface IngredientListProps {
  ingredients: Ingredient[];
  onRemove: (name: string) => void;
}

type IngredientPositionType = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type IngredientDragType = {
  name: string;
  offsetX: number;
  offsetY: number;
  pointerId: number;
} | null;

const INGREDIENT_GAP = 3;

const createIngredientSeed = (value: string) => {
  return Array.from(value).reduce((seed, character) => {
    return (seed * 31 + character.charCodeAt(0)) >>> 0;
  }, 2166136261);
};

const createSeededRandom = (initialSeed: number) => {
  let seed = initialSeed;

  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
};

const getIngredientSize = (ingredient: Ingredient) => {
  if (ingredient.imageUrl) {
    return {
      width: 26,
      height: 11,
    };
  }

  return {
    width: Math.min(58, Math.max(34, ingredient.name.length * 10 + 18)),
    height: 8.5,
  };
};

const getClampedPosition = (position: IngredientPositionType) => {
  return {
    ...position,
    x: Math.min(Math.max(position.x, 0), 100 - position.width),
    y: Math.min(Math.max(position.y, 0), 100 - position.height),
  };
};

const hasIngredientOverlap = (
  position: IngredientPositionType,
  positionList: IngredientPositionType[],
) => {
  return positionList.some((targetPosition) => {
    return (
      position.x < targetPosition.x + targetPosition.width + INGREDIENT_GAP &&
      position.x + position.width + INGREDIENT_GAP > targetPosition.x &&
      position.y < targetPosition.y + targetPosition.height + INGREDIENT_GAP &&
      position.y + position.height + INGREDIENT_GAP > targetPosition.y
    );
  });
};

const createIngredientPosition = (
  size: Pick<IngredientPositionType, "height" | "width">,
  positionList: IngredientPositionType[],
  seed: number,
) => {
  const random = createSeededRandom(seed);

  for (let count = 0; count < 80; count += 1) {
    const position = {
      ...size,
      x: random() * (100 - size.width),
      y: random() * (100 - size.height),
    };

    if (!hasIngredientOverlap(position, positionList)) {
      return position;
    }
  }

  for (let y = 0; y <= 100 - size.height; y += size.height + INGREDIENT_GAP) {
    for (let x = 0; x <= 100 - size.width; x += size.width + INGREDIENT_GAP) {
      const position = { ...size, x, y };

      if (!hasIngredientOverlap(position, positionList)) {
        return position;
      }
    }
  }

  return {
    ...size,
    x: 0,
    y: 0,
  };
};

const getIngredientPositionMap = (
  ingredients: Ingredient[],
  manualPositionMap: Record<string, IngredientPositionType>,
) => {
  const nextPositionMap: Record<string, IngredientPositionType> = {};
  const nextPositionList: IngredientPositionType[] = [];

  ingredients.forEach((ingredient, index) => {
    const size = getIngredientSize(ingredient);
    const manualPosition = manualPositionMap[ingredient.name];
    const seed = createIngredientSeed(`${ingredient.name}-${index}`);
    const position = manualPosition
      ? getClampedPosition({ ...manualPosition, ...size })
      : createIngredientPosition(size, nextPositionList, seed);
    const nextPosition = hasIngredientOverlap(position, nextPositionList)
      ? createIngredientPosition(size, nextPositionList, seed + 97)
      : position;

    nextPositionMap[ingredient.name] = nextPosition;
    nextPositionList.push(nextPosition);
  });

  return nextPositionMap;
};

export default function IngredientList({
  ingredients,
  onRemove,
}: IngredientListProps) {
  const ingredientListRef = useRef<HTMLDivElement>(null);
  const [manualPositionMap, setManualPositionMap] = useState<
    Record<string, IngredientPositionType>
  >({});
  const [draggingIngredient, setDraggingIngredient] =
    useState<IngredientDragType>(null);
  const ingredientPositionMap = getIngredientPositionMap(
    ingredients,
    manualPositionMap,
  );

  const handleIngredientPointerDown = (
    event: PointerEvent<HTMLDivElement>,
    name: string,
  ) => {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }

    const containerRect = ingredientListRef.current?.getBoundingClientRect();
    const position = ingredientPositionMap[name];

    if (!containerRect || !position) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    setDraggingIngredient({
      name,
      pointerId: event.pointerId,
      offsetX:
        ((event.clientX - containerRect.left) / containerRect.width) * 100 -
        position.x,
      offsetY:
        ((event.clientY - containerRect.top) / containerRect.height) * 100 -
        position.y,
    });
  };

  const handleIngredientPointerMove = (
    event: PointerEvent<HTMLDivElement>,
    name: string,
  ) => {
    if (
      !draggingIngredient ||
      draggingIngredient.name !== name ||
      draggingIngredient.pointerId !== event.pointerId
    ) {
      return;
    }

    const containerRect = ingredientListRef.current?.getBoundingClientRect();

    if (!containerRect) {
      return;
    }

    setManualPositionMap((currentManualPositionMap) => {
      const currentPositionMap = getIngredientPositionMap(
        ingredients,
        currentManualPositionMap,
      );
      const currentPosition = currentPositionMap[name];

      if (!currentPosition) {
        return currentManualPositionMap;
      }

      const nextPosition = getClampedPosition({
        ...currentPosition,
        x:
          ((event.clientX - containerRect.left) / containerRect.width) * 100 -
          draggingIngredient.offsetX,
        y:
          ((event.clientY - containerRect.top) / containerRect.height) * 100 -
          draggingIngredient.offsetY,
      });
      const otherPositionList = Object.entries(currentPositionMap)
        .filter(([ingredientName]) => ingredientName !== name)
        .map(([, position]) => position);

      if (hasIngredientOverlap(nextPosition, otherPositionList)) {
        return currentManualPositionMap;
      }

      return {
        ...currentManualPositionMap,
        [name]: nextPosition,
      };
    });
  };

  const handleIngredientPointerUp = (
    event: PointerEvent<HTMLDivElement>,
    name: string,
  ) => {
    if (
      draggingIngredient?.name !== name ||
      draggingIngredient.pointerId !== event.pointerId
    ) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setDraggingIngredient(null);
  };

  if (ingredients.length === 0) {
    return null;
  }

  return (
    <div
      ref={ingredientListRef}
      className="ingredient-list"
      aria-label="냉장고 속 식재료"
    >
      {ingredients.map((item) => {
        const position = ingredientPositionMap[item.name];
        const style = position
          ? ({
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: `${position.width}%`,
              height: `${position.height}%`,
            } satisfies CSSProperties)
          : undefined;

        return (
          <div
            key={item.name}
            className={`ingredient-card ${
              item.imageUrl
                ? "ingredient-card-image-item"
                : "ingredient-card-text-item"
            } ${
              draggingIngredient?.name === item.name
                ? "ingredient-card-dragging"
                : ""
            }`}
            style={style}
            onPointerDown={(event) =>
              handleIngredientPointerDown(event, item.name)
            }
            onPointerMove={(event) =>
              handleIngredientPointerMove(event, item.name)
            }
            onPointerUp={(event) => handleIngredientPointerUp(event, item.name)}
            onPointerCancel={(event) =>
              handleIngredientPointerUp(event, item.name)
            }
          >
            {item.imageUrl ? (
              <div className="ingredient-card-image-wrapper">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="ingredient-card-image"
                />
              </div>
            ) : (
              <span className="ingredient-card-name">{item.name}</span>
            )}
            <button
              type="button"
              className="ingredient-card-remove"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onRemove(item.name)}
              aria-label={`${item.name} 제거`}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
