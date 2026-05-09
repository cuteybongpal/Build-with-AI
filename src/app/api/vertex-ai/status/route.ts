import { NextResponse } from "next/server";
import {
  getMissingVertexAiConfigKeyList,
  getVertexAiAuthMode,
  getVertexAiConfig,
} from "@/shared/vertex-ai/vertex-ai-config.model";

export const runtime = "nodejs";

export const GET = () => {
  const missingKeyList = getMissingVertexAiConfigKeyList();

  if (missingKeyList.length > 0) {
    return NextResponse.json({
      isConfigured: false,
      authMode: getVertexAiAuthMode(),
      missingKeyList,
    });
  }

  const config = getVertexAiConfig();

  if (config.authMode === "api-key") {
    return NextResponse.json({
      isConfigured: true,
      authMode: config.authMode,
      model: config.model,
    });
  }

  return NextResponse.json({
    isConfigured: true,
    authMode: config.authMode,
    project: config.project,
    location: config.location,
    model: config.model,
  });
};
