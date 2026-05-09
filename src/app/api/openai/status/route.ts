import { NextResponse } from "next/server";
import {
  getMissingOpenaiConfigKeyList,
  getOpenaiConfig,
} from "@/shared/openai/openai-config.model";

export const runtime = "nodejs";

export const GET = () => {
  const missingKeyList = getMissingOpenaiConfigKeyList();

  if (missingKeyList.length > 0) {
    return NextResponse.json({
      isConfigured: false,
      missingKeyList,
    });
  }

  const config = getOpenaiConfig();

  return NextResponse.json({
    isConfigured: true,
    model: config.model,
    hasBaseUrl: Boolean(config.baseUrl),
  });
};
