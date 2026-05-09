const VERTEX_AI_API_KEY_ENV_KEY_LIST = [
  "GOOGLE_API_KEY",
  "VERTEX_AI_MODEL",
] as const;

const VERTEX_AI_ADC_ENV_KEY_LIST = [
  "GOOGLE_CLOUD_PROJECT",
  "GOOGLE_CLOUD_LOCATION",
  "VERTEX_AI_MODEL",
] as const;

type VertexAiEnvKeyType =
  | (typeof VERTEX_AI_API_KEY_ENV_KEY_LIST)[number]
  | (typeof VERTEX_AI_ADC_ENV_KEY_LIST)[number];

type VertexAiEnvironmentType = Partial<
  Record<VertexAiEnvKeyType, string | undefined>
> &
  Record<string, string | undefined>;

export type VertexAiAuthModeType = "api-key" | "adc";

export type VertexAiConfigType =
  | {
      authMode: "api-key";
      apiKey: string;
      model: string;
    }
  | {
      authMode: "adc";
      project: string;
      location: string;
      model: string;
    };

const getEnvValue = (
  environment: VertexAiEnvironmentType,
  key: VertexAiEnvKeyType,
) => environment[key]?.trim() ?? "";

const hasApiKey = (environment: VertexAiEnvironmentType) =>
  getEnvValue(environment, "GOOGLE_API_KEY") !== "";

export const getVertexAiAuthMode = (
  environment: VertexAiEnvironmentType = process.env,
): VertexAiAuthModeType => (hasApiKey(environment) ? "api-key" : "adc");

export const getMissingVertexAiConfigKeyList = (
  environment: VertexAiEnvironmentType = process.env,
) => {
  const targetKeyList = hasApiKey(environment)
    ? VERTEX_AI_API_KEY_ENV_KEY_LIST
    : VERTEX_AI_ADC_ENV_KEY_LIST;

  return targetKeyList.filter((key) => !getEnvValue(environment, key));
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

  if (hasApiKey(environment)) {
    return {
      authMode: "api-key",
      apiKey: getEnvValue(environment, "GOOGLE_API_KEY"),
      model: getEnvValue(environment, "VERTEX_AI_MODEL"),
    };
  }

  return {
    authMode: "adc",
    project: getEnvValue(environment, "GOOGLE_CLOUD_PROJECT"),
    location: getEnvValue(environment, "GOOGLE_CLOUD_LOCATION"),
    model: getEnvValue(environment, "VERTEX_AI_MODEL"),
  };
};
