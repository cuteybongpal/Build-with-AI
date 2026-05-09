import { NextResponse } from "next/server";
import {
  getMissingVertexAiConfigKeyList,
  getVertexAiConfig,
} from "@/shared/vertex-ai/vertex-ai-config.model";

export const runtime = "nodejs";

export const GET = () => {
  const missingKeyList = getMissingVertexAiConfigKeyList();

  if (missingKeyList.length > 0) {
    return NextResponse.json({
      isConfigured: false,
      missingKeyList,
    });
  }

  const config = getVertexAiConfig();

  return NextResponse.json({
    isConfigured: true,
    project: config.project,
    location: config.location,
    model: config.model,
  });
};
