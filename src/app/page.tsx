import Image from "next/image";
import addIngredientButtonOffHover from "@/assets/add-ingredient-button-off-hover.png";
import addIngredientButtonOnHover from "@/assets/add-ingredient-button-on-hover.png";
import appLogo from "@/assets/app-logo.png";
import refrigeratorClosed from "@/assets/refrigerator-closed.png";
import refrigeratorOpen from "@/assets/refrigerator-open.png";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-white px-6 py-8">
      <div className="relative aspect-[1536/520] w-[min(72vw,520px)] select-none overflow-hidden">
        <Image
          src={appLogo}
          alt=""
          fill
          priority
          draggable={false}
          sizes="(max-width: 722px) 72vw, 520px"
          className="asset-image object-cover"
        />
      </div>

      <input
        id="refrigerator-open"
        name="refrigerator-state"
        type="checkbox"
        tabIndex={-1}
        aria-hidden="true"
        className="refrigerator-control hidden"
      />
      <label
        htmlFor="refrigerator-open"
        role="button"
        aria-label="냉장고 열고 닫기"
        className="refrigerator-image-button relative aspect-[629/905] w-[min(54vw,340px)] cursor-pointer select-none"
      >
        <Image
          src={refrigeratorOpen}
          alt=""
          fill
          priority
          draggable={false}
          sizes="(max-width: 630px) 54vw, 340px"
          className="asset-image refrigerator-image refrigerator-image-open pointer-events-none object-contain"
        />
        <Image
          src={refrigeratorClosed}
          alt=""
          fill
          draggable={false}
          sizes="(max-width: 630px) 54vw, 340px"
          className="asset-image refrigerator-image refrigerator-image-closed pointer-events-none object-contain"
        />
      </label>

      <button
        type="button"
        aria-label="식재료 추가"
        className="group relative aspect-[788/312] w-[min(58vw,320px)] cursor-pointer select-none border-0 bg-transparent p-0"
      >
        <Image
          src={addIngredientButtonOffHover}
          alt=""
          fill
          draggable={false}
          sizes="(max-width: 552px) 58vw, 320px"
          className="asset-image pointer-events-none object-contain opacity-100 transition-opacity duration-300 ease-out group-hover:opacity-0"
        />
        <Image
          src={addIngredientButtonOnHover}
          alt=""
          fill
          draggable={false}
          sizes="(max-width: 552px) 58vw, 320px"
          className="asset-image pointer-events-none object-contain opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
        />
      </button>
    </main>
  );
}
