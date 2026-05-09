import "server-only";

import { getOpenaiClient } from "./openai-client.factory";
import { getOpenaiConfig } from "./openai-config.model";

type GetOpenaiTextParams = {
  prompt: string;
};

export const getOpenaiText = async ({ prompt }: GetOpenaiTextParams) => {
  const config = getOpenaiConfig();
  const client = getOpenaiClient();

  const completion = await client.chat.completions.create({
    model: config.model,
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0]?.message?.content ?? "";
};
