import "server-only";

import OpenAI from "openai";
import { getOpenaiConfig } from "./openai-config.model";

let openaiClient: OpenAI | null = null;

export const createOpenaiClient = () => {
  const config = getOpenaiConfig();

  return new OpenAI({
    apiKey: config.apiKey,
    ...(config.baseUrl ? { baseURL: config.baseUrl } : {}),
  });
};

export const getOpenaiClient = () => {
  if (!openaiClient) {
    openaiClient = createOpenaiClient();
  }

  return openaiClient;
};
