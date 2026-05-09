import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserRecipe } from "@/shared/recipes/recipe.action";
import MarkdownView from "@/app/components/MarkdownView";

const formatRecipeDate = (date: Date): string => {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

type RecipeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RecipeDetailPage({
  params,
}: RecipeDetailPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const recipe = await getUserRecipe(id);

  if (!recipe) {
    notFound();
  }

  return (
    <main className="recipe-detail-page">
      <header className="recipe-detail-header">
        <div className="recipe-detail-nav">
          <Link href="/" className="recipe-detail-back">
            ← 홈으로
          </Link>
          <Link href="/recipes" className="recipe-detail-history">
            기록
          </Link>
        </div>
        <h1 className="recipe-detail-title">{recipe.title}</h1>
        <div className="recipe-detail-meta">
          <span>{formatRecipeDate(recipe.createdAt)}</span>
          <span>·</span>
          <span>{recipe.servings}인분</span>
          {recipe.preference ? (
            <>
              <span>·</span>
              <span>요청: {recipe.preference}</span>
            </>
          ) : null}
        </div>
      </header>

      <section className="recipe-detail-body">
        <MarkdownView content={recipe.content} />
      </section>
    </main>
  );
}
