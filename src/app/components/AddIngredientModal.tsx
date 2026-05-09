"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useRef,
  useState,
} from "react";

interface AddIngredientModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, amount: number, imageFile: File | null) => void;
}

export default function AddIngredientModal({
  open,
  onClose,
  onAdd,
}: AddIngredientModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setName("");
    setAmount("");
    setImageFile(null);
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

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmedName = name.trim();
      const parsedAmount = parseInt(amount, 10);

      if (!trimmedName) return;
      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return;

      onAdd(trimmedName, parsedAmount, imageFile);
      resetForm();
      onClose();
    },
    [name, amount, imageFile, onAdd, resetForm, onClose],
  );

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
          <h2 className="modal-title">🥬 식재료 추가</h2>
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
          {/* 이미지 업로드 영역 */}
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
                <span className="drop-zone-icon">📷</span>
                <span className="drop-zone-text">
                  사진을 드래그하거나 클릭하세요
                </span>
                <span className="drop-zone-hint">
                  모든 이미지 형식을 지원합니다
                </span>
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

          {/* 이름 입력 */}
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

          {/* 총량 입력 */}
          <div className="form-field">
            <label htmlFor="ingredient-amount" className="form-label">
              총량 (g)
            </label>
            <div className="amount-input-wrapper">
              <input
                id="ingredient-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="form-input amount-input"
                min={1}
                required
              />
              <span className="amount-unit">g</span>
            </div>
          </div>

          {/* 동일 이름 안내 */}
          <p className="merge-hint">
            💡 이미 같은 이름의 식재료가 있으면 총량이 합산됩니다
          </p>

          {/* 제출 버튼 */}
          <button type="submit" className="submit-btn">
            냉장고에 넣기
          </button>
        </form>
      </div>
    </div>
  );
}
