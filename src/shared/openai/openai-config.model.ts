const OPENAI_REQUIRED_ENV_KEY_LIST = [
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
] as const;

type OpenaiRequiredEnvKeyType =
  (typeof OPENAI_REQUIRED_ENV_KEY_LIST)[number];

type OpenaiEnvKeyType = OpenaiRequiredEnvKeyType | "OPENAI_BASE_URL";

type OpenaiEnvironmentType = Partial<
  Record<OpenaiEnvKeyType, string | undefined>
> &
  Record<string, string | undefined>;

export type OpenaiConfigType = {
  apiKey: string;
  model: string;
  baseUrl?: string;
};

const getEnvValue = (
  environment: OpenaiEnvironmentType,
  key: OpenaiEnvKeyType,
) => environment[key]?.trim() ?? "";

export const getMissingOpenaiConfigKeyList = (
  environment: OpenaiEnvironmentType = process.env,
) =>
  OPENAI_REQUIRED_ENV_KEY_LIST.filter(
    (key) => !getEnvValue(environment, key),
  );

export const getOpenaiConfig = (
  environment: OpenaiEnvironmentType = process.env,
): OpenaiConfigType => {
  const missingKeyList = getMissingOpenaiConfigKeyList(environment);

  if (missingKeyList.length > 0) {
    throw new Error(
      `Missing OpenAI environment variables: ${missingKeyList.join(", ")}`,
    );
  }

  const baseUrl = getEnvValue(environment, "OPENAI_BASE_URL");

  return {
    apiKey: getEnvValue(environment, "OPENAI_API_KEY"),
    model: getEnvValue(environment, "OPENAI_MODEL"),
    ...(baseUrl ? { baseUrl } : {}),
  };
};
