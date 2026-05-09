import "server-only";

import { getVertexAiClient } from "./vertex-ai-client.factory";
import { getVertexAiConfig } from "./vertex-ai-config.model";

type GetVertexAiTextParams = {
  prompt: string;
};

export const getVertexAiText = async ({ prompt }: GetVertexAiTextParams) => {
  const config = getVertexAiConfig();
  const vertexAiClient = getVertexAiClient();

  const response = await vertexAiClient.models.generateContent({
    model: config.model,
    contents: prompt,
  });

  return response.text ?? "";
};
