import { describe, expect, it } from "vitest";
import {
  getMissingOpenaiConfigKeyList,
  getOpenaiConfig,
} from "./openai-config.model";

describe("getOpenaiConfig", () => {
  it("returns config from required env values", () => {
    const config = getOpenaiConfig({
      OPENAI_API_KEY: " sk-test-key ",
      OPENAI_MODEL: "gpt-4o-mini",
    });

    expect(config).toEqual({
      apiKey: "sk-test-key",
      model: "gpt-4o-mini",
    });
  });

  it("includes baseUrl when OPENAI_BASE_URL is provided", () => {
    const config = getOpenaiConfig({
      OPENAI_API_KEY: "sk-test-key",
      OPENAI_MODEL: "gpt-4o-mini",
      OPENAI_BASE_URL: "https://api.example.com/v1",
    });

    expect(config).toEqual({
      apiKey: "sk-test-key",
      model: "gpt-4o-mini",
      baseUrl: "https://api.example.com/v1",
    });
  });

  it("omits baseUrl when OPENAI_BASE_URL is empty or whitespace", () => {
    const config = getOpenaiConfig({
      OPENAI_API_KEY: "sk-test-key",
      OPENAI_MODEL: "gpt-4o-mini",
      OPENAI_BASE_URL: "  ",
    });

    expect(config).toEqual({
      apiKey: "sk-test-key",
      model: "gpt-4o-mini",
    });
  });

  it("throws with missing required env keys", () => {
    expect(() =>
      getOpenaiConfig({ OPENAI_API_KEY: "sk-test-key" }),
    ).toThrow("Missing OpenAI environment variables: OPENAI_MODEL");
  });

  it("throws when both required env keys are missing", () => {
    expect(() => getOpenaiConfig({})).toThrow(
      "Missing OpenAI environment variables: OPENAI_API_KEY, OPENAI_MODEL",
    );
  });
});

describe("getMissingOpenaiConfigKeyList", () => {
  it("returns required keys when env values are empty or whitespace", () => {
    const missingKeyList = getMissingOpenaiConfigKeyList({
      OPENAI_API_KEY: "",
      OPENAI_MODEL: "  ",
    });

    expect(missingKeyList).toEqual(["OPENAI_API_KEY", "OPENAI_MODEL"]);
  });

  it("returns empty list when all required values are set", () => {
    const missingKeyList = getMissingOpenaiConfigKeyList({
      OPENAI_API_KEY: "sk-test-key",
      OPENAI_MODEL: "gpt-4o-mini",
    });

    expect(missingKeyList).toEqual([]);
  });
});
