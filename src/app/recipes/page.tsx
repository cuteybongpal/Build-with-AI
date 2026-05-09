import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
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
      <header className="recipe-history-header">
        <Link href="/" className="recipe-detail-back">
          ← 홈으로
        </Link>
        <h1 className="recipe-history-title">레시피 기록</h1>
        <p className="recipe-history-subtitle">
          지금까지 추천받은 레시피 {recipeList.length}건
        </p>
      </header>

      {recipeList.length === 0 ? (
        <section className="recipe-history-empty">
          <p className="recipe-history-empty-text">
            아직 기록된 레시피가 없어요
          </p>
          <p className="recipe-history-empty-hint">
            홈에서 조리하기 버튼을 눌러 첫 레시피를 추천받아 보세요
          </p>
        </section>
      ) : (
        <ul className="recipe-history-list">
          {recipeList.map((recipe) => (
            <li key={recipe.id} className="recipe-history-item">
              <Link
                href={`/recipes/${recipe.id}`}
                className="recipe-history-link"
              >
                <span className="recipe-history-item-title">
                  {recipe.title}
                </span>
                <span className="recipe-history-item-meta">
                  <span>{formatRecipeDate(recipe.createdAt)}</span>
                  {recipe.preference ? (
                    <>
                      <span>·</span>
                      <span>{recipe.preference}</span>
                    </>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
