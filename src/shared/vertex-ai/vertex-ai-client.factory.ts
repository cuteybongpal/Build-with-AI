import "server-only";

import { GoogleGenAI } from "@google/genai";
import { getVertexAiConfig } from "./vertex-ai-config.model";

let vertexAiClient: GoogleGenAI | null = null;

export const createVertexAiClient = () => {
  const config = getVertexAiConfig();

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
