const VERTEX_AI_ENV_KEY_LIST = [
  "GOOGLE_CLOUD_PROJECT",
  "GOOGLE_CLOUD_LOCATION",
  "VERTEX_AI_MODEL",
] as const;

type VertexAiEnvKeyType = (typeof VERTEX_AI_ENV_KEY_LIST)[number];

type VertexAiEnvironmentType = Partial<
  Record<VertexAiEnvKeyType, string | undefined>
> &
  Record<string, string | undefined>;

export type VertexAiConfigType = {
  project: string;
  location: string;
  model: string;
};

const getEnvValue = (
  environment: VertexAiEnvironmentType,
  key: VertexAiEnvKeyType,
) => environment[key]?.trim() ?? "";

export const getMissingVertexAiConfigKeyList = (
  environment: VertexAiEnvironmentType = process.env,
) => {
  return VERTEX_AI_ENV_KEY_LIST.filter((key) => !getEnvValue(environment, key));
};

export const getVertexAiConfig = (
  environment: VertexAiEnvironmentType = process.env,
): VertexAiConfigType => {
  const missingKeyList = getMissingVertexAiConfigKeyList(environment);

  if (missingKeyList.length > 0) {
    throw new Error(
      `Missing Vertex AI environment variables: ${missingKeyList.join(", ")}`,
    );
  }

  return {
    project: getEnvValue(environment, "GOOGLE_CLOUD_PROJECT"),
    location: getEnvValue(environment, "GOOGLE_CLOUD_LOCATION"),
    model: getEnvValue(environment, "VERTEX_AI_MODEL"),
  };
};
