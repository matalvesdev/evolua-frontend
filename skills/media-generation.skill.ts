export interface MediaGenerationInput {
  campaignId: string;
  assets: Array<"image" | "video" | "carousel">;
  dimensions: string[];
  visualDirection: string;
  brandGuidelines: string;
}

export interface MediaAssetPlan {
  assetType: "image" | "video" | "carousel";
  prompt: string;
  dimension: string;
  altText: string;
}

export interface MediaGenerationOutput {
  plan: MediaAssetPlan[];
  providerJobIds: string[];
  generatedAt: string;
}

export interface MediaGenerationDeps {
  requestMediaProvider?: (input: MediaGenerationInput) => Promise<MediaAssetPlan[]>;
}

function log(event: string, payload?: Record<string, unknown>): void {
  console.info(JSON.stringify({ skill: "media_generation", event, payload, at: new Date().toISOString() }));
}

export async function mediaGeneration(
  input: MediaGenerationInput,
  deps: MediaGenerationDeps = {},
): Promise<MediaGenerationOutput> {
  log("start", { campaignId: input.campaignId, assets: input.assets });

  const plan = deps.requestMediaProvider
    ? await deps.requestMediaProvider(input)
    : input.assets.map((assetType, index) => ({
        assetType,
        dimension: input.dimensions[index % input.dimensions.length] ?? "1080x1080",
        prompt: `${input.visualDirection}. Follow brand rules: ${input.brandGuidelines}`,
        altText: `${assetType} for campaign ${input.campaignId}`,
      }));

  const output: MediaGenerationOutput = {
    plan,
    providerJobIds: plan.map((_, index) => `job_${input.campaignId}_${index + 1}`),
    generatedAt: new Date().toISOString(),
  };

  log("success", { plannedAssets: output.plan.length });
  return output;
}

export async function exampleUsage(): Promise<MediaGenerationOutput> {
  return mediaGeneration({
    campaignId: "cmp_2026_q2_launch",
    assets: ["image", "video", "carousel"],
    dimensions: ["1080x1350", "1080x1920"],
    visualDirection: "Clean clinic scenes with confident professionals",
    brandGuidelines: "Use primary palette and accessible contrast",
  });
}