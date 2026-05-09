/**
 * 디지털 식재료 타입 정의
 *
 * - name: 식재료 이름 (PK 역할, 유니크)
 * - amount: 총량 (g 단위, 정수)
 * - imageUrl: 사진의 Object URL (모든 확장자 가능)
 * - imageFile: 원본 File 객체 (나중에 서버 업로드 시 사용 가능)
 */
export interface Ingredient {
  name: string;
  amount: number;
  imageUrl: string;
  imageFile: File | null;
}
