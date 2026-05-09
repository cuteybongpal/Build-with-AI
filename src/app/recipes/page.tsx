import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import appLogo from "@/assets/app-logo.png";
import { getUserRecipeList } from "@/shared/recipes/recipe.action";

const formatRecipeDate = (date: Date): string => {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default async function RecipeHistoryPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const recipeList = await getUserRecipeList();

  return (
    <main className="recipe-history-page">
      <div className="recipe-page-shell">
        <header className="recipe-history-header">
          <div className="recipe-page-topline">
            <Link href="/" className="recipe-detail-back" aria-label="홈으로">
              ←
            </Link>
            <div className="recipe-page-logo">
              <Image
                src={appLogo}
                alt="남기미"
                fill
                priority
                sizes="180px"
                className="asset-image object-contain"
              />
            </div>
          </div>

          <div className="recipe-page-heading">
            <p className="recipe-page-kicker">남기미 기록장</p>
            <h1 className="recipe-history-title">레시피 기록</h1>
            <p className="recipe-history-subtitle">
              지금까지 추천받은 레시피 <strong>{recipeList.length}건</strong>
            </p>
          </div>
        </header>

        {recipeList.length === 0 ? (
          <section className="recipe-history-empty">
            <p className="recipe-history-empty-text">
              아직 기록된 레시피가 없어요
            </p>
            <p className="recipe-history-empty-hint">
              홈에서 조리하기 버튼을 눌러 첫 레시피를 추천받아 보세요
            </p>
            <Link href="/" className="recipe-history-empty-link">
              홈으로 돌아가기
            </Link>
          </section>
        ) : (
          <ul className="recipe-history-list">
            {recipeList.map((recipe, index) => (
              <li key={recipe.id} className="recipe-history-item">
                <Link
                  href={`/recipes/${recipe.id}`}
                  className="recipe-history-link"
                >
                  <span className="recipe-history-item-index">
                    {String(recipeList.length - index).padStart(2, "0")}
                  </span>
                  <span className="recipe-history-item-content">
                    <span className="recipe-history-item-title">
                      {recipe.title}
                    </span>
                    <span className="recipe-history-item-meta">
                      <span>{formatRecipeDate(recipe.createdAt)}</span>
                      {recipe.preference ? (
                        <span>{recipe.preference}</span>
                      ) : null}
                    </span>
                  </span>
                  <span className="recipe-history-item-arrow">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
