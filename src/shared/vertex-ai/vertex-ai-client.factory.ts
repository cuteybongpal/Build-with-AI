import "server-only";

import { GoogleGenAI } from "@google/genai";
import { getVertexAiConfig } from "./vertex-ai-config.model";

let vertexAiClient: GoogleGenAI | null = null;

export const createVertexAiClient = () => {
  const config = getVertexAiConfig();

  if (config.authMode === "api-key") {
    return new GoogleGenAI({
      vertexai: true,
      apiKey: config.apiKey,
    });
  }

  return new GoogleGenAI({
    vertexai: true,
    project: config.project,
    location: config.location,
  });
};

export const getVertexAiClient = () => {
  if (!vertexAiClient) {
    vertexAiClient = createVertexAiClient();
  }

  return vertexAiClient;
};
