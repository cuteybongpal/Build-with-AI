import { describe, expect, it } from "vitest";
import {
  getMissingVertexAiConfigKeyList,
  getVertexAiConfig,
} from "./vertex-ai-config.model";

describe("getVertexAiConfig", () => {
  it("returns vertex ai config from environment values", () => {
    const config = getVertexAiConfig({
      GOOGLE_CLOUD_PROJECT: " build-with-ai ",
      GOOGLE_CLOUD_LOCATION: "us-central1",
      VERTEX_AI_MODEL: "gemini-2.5-flash",
    });

    expect(config).toEqual({
      project: "build-with-ai",
      location: "us-central1",
      model: "gemini-2.5-flash",
    });
  });

  it("throws with missing environment keys", () => {
    expect(() =>
      getVertexAiConfig({
        GOOGLE_CLOUD_PROJECT: "build-with-ai",
      }),
    ).toThrow(
      "Missing Vertex AI environment variables: GOOGLE_CLOUD_LOCATION, VERTEX_AI_MODEL",
    );
  });
});

describe("getMissingVertexAiConfigKeyList", () => {
  it("returns keys for empty environment values", () => {
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
});
