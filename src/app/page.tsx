import Image from "next/image";
import addIngredientButtonOffHover from "@/assets/add-ingredient-button-off-hover.png";
import addIngredientButtonOnHover from "@/assets/add-ingredient-button-on-hover.png";
import refrigeratorClosed from "@/assets/refrigerator-closed.png";
import refrigeratorOpen from "@/assets/refrigerator-open.png";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-white px-6 py-10">
      <input
        id="refrigerator-closed"
        name="refrigerator-state"
        type="radio"
        tabIndex={-1}
        aria-hidden="true"
        className="refrigerator-control hidden"
      />
      <label
        htmlFor="refrigerator-closed"
        role="button"
        aria-label="냉장고 닫기"
        className="refrigerator-image-button relative aspect-[629/905] w-[min(54vw,360px)] cursor-pointer"
      >
        <Image
          src={refrigeratorOpen}
          alt=""
          fill
          priority
          sizes="(max-width: 667px) 54vw, 360px"
          className="refrigerator-image refrigerator-image-open pointer-events-none object-contain"
        />
        <Image
          src={refrigeratorClosed}
          alt=""
          fill
          sizes="(max-width: 667px) 54vw, 360px"
          className="refrigerator-image refrigerator-image-closed pointer-events-none object-contain"
        />
      </label>

      <button
        type="button"
        aria-label="식재료 추가"
        className="group relative aspect-[788/312] w-[min(70vw,420px)] cursor-pointer border-0 bg-transparent p-0"
      >
        <Image
          src={addIngredientButtonOffHover}
          alt=""
          fill
          sizes="(max-width: 600px) 70vw, 420px"
          className="pointer-events-none object-contain opacity-100 transition-opacity duration-300 ease-out group-hover:opacity-0"
        />
        <Image
          src={addIngredientButtonOnHover}
          alt=""
          fill
          sizes="(max-width: 600px) 70vw, 420px"
          className="pointer-events-none object-contain opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
        />
      </button>
    </main>
  );
}
