import { describe, expect, it } from "vitest";
import {
  getMissingVertexAiConfigKeyList,
  getVertexAiAuthMode,
  getVertexAiConfig,
} from "./vertex-ai-config.model";

describe("getVertexAiConfig", () => {
  it("returns adc config from google cloud env values", () => {
    const config = getVertexAiConfig({
      GOOGLE_CLOUD_PROJECT: " build-with-ai ",
      GOOGLE_CLOUD_LOCATION: "us-central1",
      VERTEX_AI_MODEL: "gemini-2.5-flash",
    });

    expect(config).toEqual({
      authMode: "adc",
      project: "build-with-ai",
      location: "us-central1",
      model: "gemini-2.5-flash",
    });
  });

  it("returns api key config when GOOGLE_API_KEY is present", () => {
    const config = getVertexAiConfig({
      GOOGLE_API_KEY: " AQ.test-key ",
      VERTEX_AI_MODEL: "gemini-2.5-flash",
    });

    expect(config).toEqual({
      authMode: "api-key",
      apiKey: "AQ.test-key",
      model: "gemini-2.5-flash",
    });
  });

  it("prefers api key mode when both api key and adc env values are set", () => {
    const config = getVertexAiConfig({
      GOOGLE_API_KEY: "AQ.test-key",
      GOOGLE_CLOUD_PROJECT: "build-with-ai",
      GOOGLE_CLOUD_LOCATION: "us-central1",
      VERTEX_AI_MODEL: "gemini-2.5-flash",
    });

    expect(config).toEqual({
      authMode: "api-key",
      apiKey: "AQ.test-key",
      model: "gemini-2.5-flash",
    });
  });

  it("throws with missing adc env keys", () => {
    expect(() =>
      getVertexAiConfig({
        GOOGLE_CLOUD_PROJECT: "build-with-ai",
      }),
    ).toThrow(
      "Missing Vertex AI environment variables: GOOGLE_CLOUD_LOCATION, VERTEX_AI_MODEL",
    );
  });

  it("throws with missing api key env keys", () => {
    expect(() =>
      getVertexAiConfig({
        GOOGLE_API_KEY: "AQ.test-key",
      }),
    ).toThrow("Missing Vertex AI environment variables: VERTEX_AI_MODEL");
  });
});

describe("getMissingVertexAiConfigKeyList", () => {
  it("returns adc keys when api key absent and adc values are missing", () => {
    const missingKeyList = getMissingVertexAiConfigKeyList({
      GOOGLE_CLOUD_PROJECT: "",
      GOOGLE_CLOUD_LOCATION: "  ",
      VERTEX_AI_MODEL: "gemini-2.5-flash",
    });

    expect(missingKeyList).toEqual([
      "GOOGLE_CLOUD_PROJECT",
      "GOOGLE_CLOUD_LOCATION",
    ]);
  });

  it("returns api key list keys when api key is set but model is missing", () => {
    const missingKeyList = getMissingVertexAiConfigKeyList({
      GOOGLE_API_KEY: "AQ.test-key",
      VERTEX_AI_MODEL: "  ",
    });

    expect(missingKeyList).toEqual(["VERTEX_AI_MODEL"]);
  });
});

describe("getVertexAiAuthMode", () => {
  it("returns api-key when GOOGLE_API_KEY is present", () => {
    expect(getVertexAiAuthMode({ GOOGLE_API_KEY: "AQ.test-key" })).toBe(
      "api-key",
    );
  });

  it("returns adc when GOOGLE_API_KEY is empty or missing", () => {
    expect(getVertexAiAuthMode({})).toBe("adc");
    expect(getVertexAiAuthMode({ GOOGLE_API_KEY: "  " })).toBe("adc");
  });
});
