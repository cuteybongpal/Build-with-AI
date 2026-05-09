"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/auth";
import { prismaClient } from "@/shared/database/prisma-client";
import { getOpenaiClient } from "@/shared/openai/openai-client.factory";
import { getOpenaiConfig } from "@/shared/openai/openai-config.model";

type GenerateRecipeInput = {
  preference?: string | null;
  servings?: number;
};

export type RecipeListItemType = {
  id: string;
  title: string;
  preference: string | null;
  createdAt: Date;
};

export type RecipeDetailType = {
  id: string;
  title: string;
  content: string;
  preference: string | null;
  servings: number;
  createdAt: Date;
};

type PromptTemplateType = {
  system: string;
  user: string;
};

const TOOL_LABEL_MAP = {
  fryingPan: "후라이팬",
  microwave: "전자레인지",
  pot: "냄비",
  riceCooker: "밥솥",
  blender: "믹서기",
  knife: "칼",
} as const;

type RecipeToolNameType = keyof typeof TOOL_LABEL_MAP;

const DEFAULT_RECIPE_TITLE = "이름 없는 레시피";

const getCurrentUserId = async (): Promise<string> => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
};

const splitPromptTemplate = (raw: string): PromptTemplateType => {
  const systemMatch = raw.match(/## SYSTEM\s+([\s\S]*?)\n---\n\n## USER/);
  const userMatch = raw.match(/## USER\s+([\s\S]*?)\n---\n\n## 변수 정의/);

  if (!systemMatch || !userMatch) {
    throw new Error("프롬프트 템플릿 파싱 실패");
  }

  return { system: systemMatch[1].trim(), user: userMatch[1].trim() };
};

const convertIngredientListToMarkdown = (
  ingredientList: { amount: number; name: string; unit: string }[],
): string => {
  if (ingredientList.length === 0) {
    return "(보유 식재료 없음)";
  }

  return ingredientList
    .map((ingredient) => {
      return `- ${ingredient.name}: ${ingredient.amount}${ingredient.unit}`;
    })
    .join("\n");
};

const convertToolNameListToMarkdown = (
  toolNameList: RecipeToolNameType[],
): string => {
  if (toolNameList.length === 0) {
    return "(보유 도구 없음, 가스레인지만 사용 가능)";
  }

  return toolNameList
    .map((toolName) => `- ${TOOL_LABEL_MAP[toolName]}`)
    .join("\n");
};

const getServings = (servings: number | undefined): number => {
  return Math.max(1, servings ?? 1);
};

const getNormalizedPreference = (
  preference: string | null | undefined,
): string | null => {
  const trimmedPreference = preference?.trim() ?? "";

  return trimmedPreference.length > 0 ? trimmedPreference : null;
};

const getPreferencePromptText = (preference: string | null): string => {
  return preference ?? "(특별한 선호 없음)";
};

const extractRecipeTitle = (content: string): string => {
  const firstH1Match = content.match(/^#\s+(.+)$/m);

  if (firstH1Match) {
    return firstH1Match[1].trim().slice(0, 80);
  }

  const firstNonEmptyLine = content
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  return firstNonEmptyLine?.slice(0, 80) ?? DEFAULT_RECIPE_TITLE;
};

export const generateRecipe = async ({
  preference,
  servings = 1,
}: GenerateRecipeInput): Promise<{ id: string }> => {
  const userId = await getCurrentUserId();
  const normalizedServings = getServings(servings);
  const normalizedPreference = getNormalizedPreference(preference);

  const [ingredientList, toolList] = await Promise.all([
    prismaClient.ingredient.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        name: true,
        amount: true,
        unit: true,
      },
    }),
    prismaClient.userTool.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { name: true },
    }),
  ]);

  const promptPath = path.join(
    process.cwd(),
    "src/shared/recipes/recipe-recommendation.prompt.md",
  );
  const raw = await readFile(promptPath, "utf8");
  const { system, user } = splitPromptTemplate(raw);
  const filledUser = user
    .replace("{{ingredients}}", convertIngredientListToMarkdown(ingredientList))
    .replace(
      "{{tools}}",
      convertToolNameListToMarkdown(
        toolList.map((tool) => tool.name as RecipeToolNameType),
      ),
    )
    .replace("{{servings}}", String(normalizedServings))
    .replace("{{preference}}", getPreferencePromptText(normalizedPreference));

  let recipeContent: string;

  try {
    const config = getOpenaiConfig();
    const client = getOpenaiClient();
    const completion = await client.chat.completions.create({
      model: config.model,
      reasoning_effort: "minimal",
      max_completion_tokens: 6000,
      messages: [
        { role: "system", content: system },
        { role: "user", content: filledUser },
      ],
    });

    recipeContent = completion.choices[0]?.message?.content ?? "";

    const finishReason = completion.choices[0]?.finish_reason;
    const reasoningTokens =
      completion.usage?.completion_tokens_details?.reasoning_tokens ?? 0;
    const completionTokens = completion.usage?.completion_tokens ?? 0;

    console.info(
      `[recipe] finish=${finishReason} content=${recipeContent.length}자 ` +
        `reasoning=${reasoningTokens} completion=${completionTokens}`,
    );
  } catch (error) {
    console.error("레시피 생성 실패:", error);
    throw new Error("Recipe generation failed");
  }

  if (!recipeContent.trim()) {
    throw new Error(
      "Recipe generation returned empty content (max_completion_tokens 부족 가능성)",
    );
  }

  const recipe = await prismaClient.recipe.create({
    data: {
      userId,
      title: extractRecipeTitle(recipeContent),
      content: recipeContent,
      preference: normalizedPreference,
      servings: normalizedServings,
      ingredientSnapshot: JSON.stringify(ingredientList),
      toolSnapshot: JSON.stringify(toolList.map((tool) => tool.name)),
    },
    select: { id: true },
  });

  return { id: recipe.id };
};

export const getUserRecipeList = async (): Promise<RecipeListItemType[]> => {
  const userId = await getCurrentUserId();

  const recipeList = await prismaClient.recipe.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      preference: true,
      createdAt: true,
    },
  });

  return recipeList;
};

export const getUserRecipe = async (
  recipeId: string,
): Promise<RecipeDetailType | null> => {
  const userId = await getCurrentUserId();

  const recipe = await prismaClient.recipe.findFirst({
    where: { id: recipeId, userId },
    select: {
      id: true,
      title: true,
      content: true,
      preference: true,
      servings: true,
      createdAt: true,
    },
  });

  return recipe;
};
