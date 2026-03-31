import Anthropic from "@anthropic-ai/sdk";

export function createAIClient() {
  return new Anthropic();
}
