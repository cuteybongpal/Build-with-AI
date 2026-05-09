"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import addIngredientButton from "@/assets/add-ingredient-button.png";
import appLogo from "@/assets/app-logo.png";
import blender from "@/assets/blender.png";
import cookButton from "@/assets/cook-button.png";
import cookingPot from "@/assets/cooking-pot.png";
import fryingPan from "@/assets/frying-pan.png";
import knife from "@/assets/knife.png";
import microwave from "@/assets/microwave.png";
import pot from "@/assets/pot.png";
import refrigeratorClosed from "@/assets/refrigerator-closed.png";
import refrigeratorOpen from "@/assets/refrigerator-open.png";
import riceCooker from "@/assets/rice-cooker.png";
import toolAdd from "@/assets/tool-add.png";
import { useIngredientStore } from "@/shared/hooks/useIngredientStore";
import { generateRecipe } from "@/shared/recipes/recipe.action";
import {
  getUserToolNameList,
  updateUserToolNameList,
  type ToolNameType,
} from "@/shared/tools/user-tool.action";
import AddIngredientModal from "./AddIngredientModal";
import IngredientList from "./IngredientList";

const toolImageList = [
  {
    name: "fryingPan",
    label: "후라이팬",
    src: fryingPan,
    className: "tool-item tool-item-frying-pan",
  },
  {
    name: "microwave",
    label: "전자레인지",
    src: microwave,
    className: "tool-item tool-item-microwave",
  },
  { name: "pot", label: "냄비", src: pot, className: "tool-item tool-item-pot" },
  {
    name: "riceCooker",
    label: "밥솥",
    src: riceCooker,
    className: "tool-item tool-item-rice-cooker",
  },
  {
    name: "blender",
    label: "믹서기",
    src: blender,
    className: "tool-item tool-item-blender",
  },
  { name: "knife", label: "칼", src: knife, className: "tool-item tool-item-knife" },
] as const;

type PanelType = "cooking" | "refrigerator" | "tools";

const getToolLabel = (toolName: ToolNameType) => {
  return (
    toolImageList.find((toolImage) => toolImage.name === toolName)?.label ??
    toolName
  );
};

const formatIngredientAmount = (amount: number) => {
  return amount.toLocaleString("ko-KR", {
    maximumFractionDigits: 9,
  });
};

export default function HomeClient() {
  const router = useRouter();
  const showcaseTrackRef = useRef<HTMLDivElement>(null);
  const { ingredients, addIngredient, removeIngredient } = useIngredientStore();
  const [activePanel, setActivePanel] = useState<PanelType>("refrigerator");
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [isCookingModalOpen, setIsCookingModalOpen] = useState(false);
  const [recipeRequest, setRecipeRequest] = useState("");
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [recipeErrorMessage, setRecipeErrorMessage] = useState("");
  const [isRefrigeratorOpen, setIsRefrigeratorOpen] = useState(false);
  const [selectedToolNameList, setSelectedToolNameList] = useState<
    ToolNameType[]
  >([]);

  useEffect(() => {
    const showcaseTrack = showcaseTrackRef.current;
    const refrigeratorPanel = showcaseTrack?.querySelector<HTMLElement>(
      '[data-panel="refrigerator"]',
    );

    if (!showcaseTrack || !refrigeratorPanel) {
      return;
    }

    requestAnimationFrame(() => {
      showcaseTrack.scrollLeft =
        refrigeratorPanel.offsetLeft -
        (showcaseTrack.clientWidth - refrigeratorPanel.offsetWidth) / 2;
    });
  }, []);

  useEffect(() => {
    let canUpdate = true;

    getUserToolNameList()
      .then((savedToolNameList) => {
        if (canUpdate) {
          setSelectedToolNameList(savedToolNameList);
        }
      })
      .catch((error) => {
        console.error("도구 목록 로드 실패:", error);
        if (canUpdate) {
          setSelectedToolNameList([]);
        }
      });

    return () => {
      canUpdate = false;
    };
  }, []);

  const reloadToolNameListFromServer = () => {
    getUserToolNameList()
      .then(setSelectedToolNameList)
      .catch((error) => {
        console.error("도구 재동기화 실패:", error);
      });
  };

  const handleShowcaseScroll = () => {
    const showcaseTrack = showcaseTrackRef.current;

    if (!showcaseTrack) {
      return;
    }

    const panelList = Array.from(
      showcaseTrack.querySelectorAll<HTMLElement>("[data-panel]"),
    );
    const showcaseCenter =
      showcaseTrack.scrollLeft + showcaseTrack.clientWidth / 2;
    let closestPanel: PanelType = "refrigerator";
    let closestDistance = Number.POSITIVE_INFINITY;

    panelList.forEach((panel) => {
      const panelCenter = panel.offsetLeft + panel.offsetWidth / 2;
      const distance = Math.abs(showcaseCenter - panelCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestPanel = panel.dataset.panel as PanelType;
      }
    });

    setActivePanel((currentPanel) =>
      currentPanel === closestPanel ? currentPanel : closestPanel,
    );
  };

  const handleToolSelectClick = (toolName: ToolNameType) => {
    const nextToolNameList = selectedToolNameList.includes(toolName)
      ? selectedToolNameList.filter(
        (currentToolName) => currentToolName !== toolName,
      )
      : [...selectedToolNameList, toolName];

    setSelectedToolNameList(nextToolNameList);

    updateUserToolNameList(nextToolNameList).catch((error) => {
      console.error("도구 저장 실패:", error);
      reloadToolNameListFromServer();
    });
  };

  const handleCookingModalOpenClick = () => {
    setRecipeErrorMessage("");
    setIsCookingModalOpen(true);
  };

  const handleRecipeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (ingredients.length === 0) {
      setRecipeErrorMessage("냉장고에 재료를 먼저 추가하세요.");
      return;
    }

    setIsRecipeLoading(true);
    setRecipeErrorMessage("");

    try {
      const { id } = await generateRecipe({
        preference: recipeRequest,
        servings: 1,
      });

      setIsCookingModalOpen(false);
      setRecipeRequest("");
      router.push(`/recipes/${id}`);
    } catch {
      setRecipeErrorMessage(
        "일시적 오류가 발생했습니다. 잠시 후 다시 시도하세요.",
      );
      setIsRecipeLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden bg-[#FEFDF9] py-8">
      <input
        id="refrigerator-open"
        name="refrigerator-state"
        type="checkbox"
        tabIndex={-1}
        aria-hidden="true"
        checked={isRefrigeratorOpen}
        onChange={(event) => setIsRefrigeratorOpen(event.target.checked)}
        className="refrigerator-control hidden"
      />

      <div className="relative z-10 aspect-[1536/520] w-[min(72vw,520px)] shrink-0 select-none overflow-hidden">
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

      <div className="showcase-shell flex w-full flex-1 items-center">
        <div
          ref={showcaseTrackRef}
          onScroll={handleShowcaseScroll}
          className="screen-track showcase-track flex w-full snap-x snap-mandatory overflow-x-auto"
        >
          <section
            data-panel="cooking"
            className={`showcase-panel cooking-panel flex snap-center flex-col items-center justify-center gap-5 ${
              activePanel === "cooking"
                ? "showcase-panel-active"
                : "showcase-panel-preview"
            }`}
          >
            <div className="cooking-pot-stage relative aspect-[1536/1024] w-full select-none">
              <Image
                src={cookingPot}
                alt=""
                fill
                priority
                draggable={false}
                sizes="(max-width: 720px) 72vw, 380px"
                className="asset-image pointer-events-none object-contain"
              />
            </div>

            <button
              type="button"
              aria-label="조리하기"
              onClick={handleCookingModalOpenClick}
              className="cook-button relative aspect-[1536/1024] w-[min(58vw,300px)] cursor-pointer select-none border-0 bg-transparent p-0 transition-transform duration-300 ease-out hover:scale-105 active:scale-100"
            >
              <Image
                src={cookButton}
                alt=""
                fill
                draggable={false}
                sizes="(max-width: 517px) 58vw, 300px"
                className="asset-image pointer-events-none object-contain"
              />
            </button>
          </section>

          <section
            data-panel="refrigerator"
            className={`showcase-panel refrigerator-panel flex snap-center flex-col items-center justify-center gap-5 ${
              activePanel === "refrigerator"
                ? "showcase-panel-active"
                : "showcase-panel-preview"
            }`}
          >
            <div className="refrigerator-stage relative aspect-[629/905] w-full select-none">
              <label
                htmlFor="refrigerator-open"
                role="button"
                aria-label="냉장고 열고 닫기"
                className="refrigerator-image-button absolute inset-0 cursor-pointer select-none"
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

              <div
                className={`ingredient-section ${isRefrigeratorOpen ? "open" : ""}`}
              >
                <IngredientList
                  ingredients={ingredients}
                  onRemove={removeIngredient}
                />
              </div>
            </div>

            <button
              type="button"
              aria-label="식재료 추가"
              onClick={() => setIsIngredientModalOpen(true)}
              className="relative aspect-[788/312] w-[min(58vw,320px)] cursor-pointer select-none border-0 bg-transparent p-0 transition-transform duration-300 ease-out hover:scale-105 active:scale-100"
            >
              <Image
                src={addIngredientButton}
                alt=""
                fill
                draggable={false}
                sizes="(max-width: 552px) 58vw, 320px"
                className="asset-image pointer-events-none object-contain"
              />
            </button>
          </section>

          <section
            data-panel="tools"
            className={`showcase-panel tools-panel flex snap-center flex-col items-center justify-center gap-6 ${
              activePanel === "tools"
                ? "showcase-panel-active"
                : "showcase-panel-preview"
            }`}
          >
            <div
              className="tool-orbit relative aspect-square w-full select-none"
              aria-hidden="true"
            >
              {toolImageList.map(({ name, src, className }) => (
                <div
                  key={name}
                  className={`${className} ${
                    selectedToolNameList.includes(name)
                      ? "tool-item-selected"
                      : ""
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    draggable={false}
                    sizes="(max-width: 500px) 18vw, 96px"
                    className="asset-image pointer-events-none object-contain"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              aria-label="도구 추가"
              onClick={() => setIsToolModalOpen(true)}
              className={`tool-add-button relative aspect-[722/273] w-[min(58vw,300px)] cursor-pointer select-none border-0 bg-transparent p-0 transition-transform duration-300 ease-out hover:scale-105 active:scale-100 ${
                selectedToolNameList.length > 0 ? "tool-add-button-active" : ""
              }`}
            >
              <Image
                src={toolAdd}
                alt=""
                fill
                draggable={false}
                sizes="(max-width: 517px) 58vw, 300px"
                className="asset-image pointer-events-none object-contain"
              />
            </button>
          </section>
        </div>
      </div>

      <AddIngredientModal
        open={isIngredientModalOpen}
        onClose={() => setIsIngredientModalOpen(false)}
        onAdd={addIngredient}
      />

      {isCookingModalOpen ? (
        <div
          className="recipe-modal-backdrop"
          role="presentation"
          onClick={() => setIsCookingModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="조리 요청"
            className="recipe-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="조리 요청 닫기"
              className="recipe-modal-close"
              onClick={() => setIsCookingModalOpen(false)}
            />

            <form
              onSubmit={handleRecipeSubmit}
              className="recipe-modal-content"
            >
              <div className="recipe-current-section">
                <span className="recipe-section-label">현재 식재료</span>
                <div className="recipe-chip-list">
                  {ingredients.length > 0 ? (
                    ingredients.map((ingredient) => (
                      <span key={ingredient.name} className="recipe-chip">
                        {ingredient.name}{" "}
                        {formatIngredientAmount(ingredient.amount)}
                        {ingredient.unit}
                      </span>
                    ))
                  ) : (
                    <span className="recipe-empty-text">없음</span>
                  )}
                </div>
                {ingredients.length === 0 ? (
                  <p className="recipe-empty-guide">
                    냉장고에 재료를 먼저 추가하세요.
                  </p>
                ) : null}
              </div>

              <div className="recipe-current-section">
                <span className="recipe-section-label">선택한 도구</span>
                <div className="recipe-chip-list">
                  {selectedToolNameList.length > 0 ? (
                    selectedToolNameList.map((toolName) => (
                      <span key={toolName} className="recipe-chip">
                        {getToolLabel(toolName)}
                      </span>
                    ))
                  ) : (
                    <span className="recipe-empty-text">없음</span>
                  )}
                </div>
              </div>

              <label htmlFor="recipe-request" className="recipe-request-label">
                현재 무슨 음식을 드시고 싶으신가요?
              </label>
              <textarea
                id="recipe-request"
                value={recipeRequest}
                onChange={(event) => setRecipeRequest(event.target.value)}
                className="recipe-request-input"
                placeholder="예: 따뜻한 국물 요리, 매콤한 볶음, 빨리 만들 수 있는 음식"
              />

              {isRecipeLoading ? (
                <p className="recipe-status-text">조리법 생성 중...</p>
              ) : null}

              {recipeErrorMessage ? (
                <p className="recipe-error-text">{recipeErrorMessage}</p>
              ) : null}

              <button
                type="submit"
                className="recipe-ready-button"
                disabled={isRecipeLoading || ingredients.length === 0}
              >
                {isRecipeLoading ? "생성 중" : "추천 받기"}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {isToolModalOpen ? (
        <div
          className="tool-modal-backdrop"
          role="presentation"
          onClick={() => setIsToolModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="보유 도구 선택"
            className="tool-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="도구 선택 닫기"
              className="tool-modal-close"
              onClick={() => setIsToolModalOpen(false)}
            />

            <div className="tool-modal-list">
              {toolImageList.map(({ name, label, src }) => {
                const isSelected = selectedToolNameList.includes(name);

                return (
                  <button
                    key={name}
                    type="button"
                    aria-label={`${label} ${isSelected ? "선택 해제" : "선택"}`}
                    aria-pressed={isSelected}
                    onClick={() => handleToolSelectClick(name)}
                    className={`tool-modal-item ${
                      isSelected ? "tool-modal-item-selected" : ""
                    }`}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      draggable={false}
                      sizes="(max-width: 520px) 26vw, 96px"
                      className="asset-image pointer-events-none object-contain"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
