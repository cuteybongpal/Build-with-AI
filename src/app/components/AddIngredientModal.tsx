"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  INGREDIENT_UNIT_LIST,
  type IngredientUnitType,
} from "@/shared/types/ingredient";

const ingredientUnitLabelMap: Record<IngredientUnitType, string> = {
  mg: "밀리그램 (mg)",
  g: "그램 (g)",
  kg: "킬로그램 (kg)",
  t: "톤 (t)",
};

const ingredientUnitNameMap: Record<IngredientUnitType, string> = {
  mg: "밀리그램",
  g: "그램",
  kg: "킬로그램",
  t: "톤",
};

interface AddIngredientModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (
    name: string,
    amount: number,
    unit: IngredientUnitType,
    imageFile: File | null,
  ) => void;
}

export default function AddIngredientModal({
  open,
  onClose,
  onAdd,
}: AddIngredientModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState<IngredientUnitType>("g");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const unitDropdownRef = useRef<HTMLDivElement>(null);

  const resetForm = useCallback(() => {
    setName("");
    setAmount("");
    setUnit("g");
    setImageFile(null);
    setIsUnitDropdownOpen(false);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setIsDragging(false);
  }, [imagePreview]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleImageSelect = useCallback(
    (file: File) => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    },
    [imagePreview],
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleImageSelect(file);
    },
    [handleImageSelect],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) setIsDragging(true);
    },
    [isDragging],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleImageSelect(file);
    },
    [handleImageSelect],
  );

  const handleUnitSelectClick = useCallback((nextUnit: IngredientUnitType) => {
    setUnit(nextUnit);
    setIsUnitDropdownOpen(false);
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmedName = name.trim();
      const parsedAmount = parseFloat(amount);

      if (!trimmedName) return;
      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return;

      onAdd(trimmedName, parsedAmount, unit, imageFile);
      resetForm();
      onClose();
    },
    [name, amount, unit, imageFile, onAdd, resetForm, onClose],
  );

  useEffect(() => {
    if (!isUnitDropdownOpen) {
      return;
    }

    const handleDocumentPointerDown = (event: PointerEvent) => {
      if (!unitDropdownRef.current?.contains(event.target as Node)) {
        setIsUnitDropdownOpen(false);
      }
    };

    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsUnitDropdownOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [isUnitDropdownOpen]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="식재료 추가"
      >
        <div className="modal-header">
          <h2 className="modal-title">식재료 추가</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div
            className={`image-drop-zone ${isDragging ? "dragging" : ""} ${imagePreview ? "has-image" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            aria-label="사진 업로드"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="식재료 미리보기"
                className="image-preview"
              />
            ) : (
              <div className="drop-zone-placeholder">
                <span className="drop-zone-mark" aria-hidden="true">
                  +
                </span>
                <span className="drop-zone-text">식재료 사진</span>
                <span className="drop-zone-hint">드래그하거나 클릭해서 추가</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden-file-input"
              tabIndex={-1}
            />
          </div>

          <div className="form-field">
            <label htmlFor="ingredient-name" className="form-label">
              식재료 이름
            </label>
            <input
              id="ingredient-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 당근, 양파, 소고기..."
              className="form-input"
              required
              autoFocus
            />
          </div>

          <div className="form-field">
            <label htmlFor="ingredient-amount" className="form-label">
              양
            </label>
            <div className="amount-input-wrapper">
              <input
                id="ingredient-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="form-input amount-input"
                min={0}
                step="any"
                required
              />
              <div
                ref={unitDropdownRef}
                className={`amount-unit-dropdown ${
                  isUnitDropdownOpen ? "open" : ""
                }`}
              >
                <button
                  type="button"
                  id="ingredient-unit-button"
                  className="amount-unit-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={isUnitDropdownOpen}
                  onClick={() =>
                    setIsUnitDropdownOpen(
                      (currentIsOpen) => !currentIsOpen,
                    )
                  }
                >
                  <span className="amount-unit-current">{unit}</span>
                  <span className="amount-unit-name">
                    {ingredientUnitNameMap[unit]}
                  </span>
                  <span className="amount-unit-chevron" aria-hidden="true" />
                </button>

                {isUnitDropdownOpen ? (
                  <div
                    className="amount-unit-menu"
                    role="listbox"
                    aria-labelledby="ingredient-unit-button"
                  >
                    {INGREDIENT_UNIT_LIST.map((ingredientUnit) => {
                      const isSelected = unit === ingredientUnit;

                      return (
                        <button
                          key={ingredientUnit}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          className={`amount-unit-option ${
                            isSelected ? "selected" : ""
                          }`}
                          onClick={() => handleUnitSelectClick(ingredientUnit)}
                        >
                          <span className="amount-unit-option-symbol">
                            {ingredientUnit}
                          </span>
                          <span className="amount-unit-option-name">
                            {ingredientUnitLabelMap[ingredientUnit]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <p className="merge-hint">
            같은 이름의 식재료는 기존 양에 합산됩니다
          </p>

          <button type="submit" className="submit-btn">
            추가하기
          </button>
        </form>
      </div>
    </div>
  );
}
