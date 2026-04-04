export interface ContentGenerationInput {
  campaignGoal: string;
  audiencePersona: string;
  tone: "educational" | "inspirational" | "promotional" | "institutional";
  channels: Array<"instagram" | "linkedin" | "tiktok" | "email" | "blog">;
  brief: string;
  callToAction: string;
}

export interface GeneratedContent {
  channel: string;
  headline: string;
  body: string;
  hashtags: string[];
  callToAction: string;
}

export interface ContentGenerationOutput {
  contents: GeneratedContent[];
  generatedAt: string;
}

export interface ContentGenerationDeps {
  generateWithLLM?: (input: ContentGenerationInput) => Promise<GeneratedContent[]>;
}

function log(event: string, payload?: Record<string, unknown>): void {
  console.info(JSON.stringify({ skill: "content_generation", event, payload, at: new Date().toISOString() }));
}

export async function contentGeneration(
  input: ContentGenerationInput,
  deps: ContentGenerationDeps = {},
): Promise<ContentGenerationOutput> {
  log("start", { channels: input.channels, tone: input.tone });

  const contents = deps.generateWithLLM
    ? await deps.generateWithLLM(input)
    : input.channels.map((channel) => ({
        channel,
        headline: `${input.campaignGoal} for ${channel}`,
        body: `${input.brief} Persona: ${input.audiencePersona}. Tone: ${input.tone}.`,
        hashtags: ["#marketing", "#growth", "#conteudo"],
        callToAction: input.callToAction,
      }));

  const output: ContentGenerationOutput = {
    contents,
    generatedAt: new Date().toISOString(),
  };

  log("success", { contentCount: output.contents.length });
  return output;
}

export async function exampleUsage(): Promise<ContentGenerationOutput> {
  return contentGeneration({
    campaignGoal: "Increase webinar signups",
    audiencePersona: "Speech therapists with private clinics",
    tone: "educational",
    channels: ["instagram", "linkedin", "email"],
    brief: "Explain practical growth strategies for patient retention.",
    callToAction: "Register now",
  });
}