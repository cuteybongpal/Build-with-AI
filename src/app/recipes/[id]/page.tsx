import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import appLogo from "@/assets/app-logo.png";
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
      <div className="recipe-page-shell">
        <header className="recipe-detail-header">
          <div className="recipe-detail-nav">
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
            <Link href="/recipes" className="recipe-detail-history">
              기록
            </Link>
          </div>

          <div className="recipe-page-heading">
            <p className="recipe-page-kicker">추천 레시피</p>
            <h1 className="recipe-detail-title">{recipe.title}</h1>
            <div className="recipe-detail-meta">
              <span>{formatRecipeDate(recipe.createdAt)}</span>
              <span>{recipe.servings}인분</span>
              {recipe.preference ? (
                <span>요청: {recipe.preference}</span>
              ) : null}
            </div>
          </div>
        </header>

        <section className="recipe-detail-body">
          <div className="recipe-detail-paper-mark" aria-hidden="true">
            남기미
          </div>
          <MarkdownView content={recipe.content} />
        </section>
      </div>
    </main>
  );
}
