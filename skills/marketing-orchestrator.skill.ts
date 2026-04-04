import {
  analytics,
  type AnalyticsDeps,
  type AnalyticsInput,
  type AnalyticsOutput,
} from "./analytics.skill";
import {
  contentGeneration,
  type ContentGenerationDeps,
  type ContentGenerationInput,
  type ContentGenerationOutput,
} from "./content-generation.skill";
import {
  leadCapture,
  type LeadCaptureDeps,
  type LeadCaptureInput,
  type LeadCaptureOutput,
} from "./lead-capture.skill";
import {
  leadScoring,
  type LeadScoringDeps,
  type LeadScoringInput,
  type LeadScoringOutput,
} from "./lead-scoring.skill";
import {
  mediaGeneration,
  type MediaGenerationDeps,
  type MediaGenerationInput,
  type MediaGenerationOutput,
} from "./media-generation.skill";
import {
  optimization,
  type OptimizationDeps,
  type OptimizationInput,
  type OptimizationOutput,
} from "./optimization.skill";
import {
  outreach,
  type OutreachDeps,
  type OutreachInput,
  type OutreachOutput,
} from "./outreach.skill";
import {
  socialPublish,
  type SocialPublishDeps,
  type SocialPublishInput,
  type SocialPublishOutput,
} from "./social-publish.skill";
import {
  trendAnalysis,
  type TrendAnalysisDeps,
  type TrendAnalysisInput,
  type TrendAnalysisOutput,
} from "./trend-analysis.skill";

type StepName =
  | "trend_analysis"
  | "content_generation"
  | "media_generation"
  | "social_publish"
  | "lead_capture"
  | "lead_scoring"
  | "outreach"
  | "analytics"
  | "optimization";

export interface MarketingOrchestratorInput {
  campaignId: string;
  trendAnalysis: TrendAnalysisInput;
  contentGeneration: ContentGenerationInput;
  mediaGeneration: MediaGenerationInput;
  socialPublish?: {
    posts?: SocialPublishInput["posts"];
  };
  leadCapture: LeadCaptureInput;
  leadScoring: Omit<LeadScoringInput, "leadId">;
  outreach: Omit<OutreachInput, "campaignId" | "contacts"> & {
    contacts?: OutreachInput["contacts"];
  };
  analytics: AnalyticsInput;
  optimization: OptimizationInput;
}

export interface MarketingOrchestratorDeps {
  trendAnalysis?: TrendAnalysisDeps;
  contentGeneration?: ContentGenerationDeps;
  mediaGeneration?: MediaGenerationDeps;
  socialPublish?: SocialPublishDeps;
  leadCapture?: LeadCaptureDeps;
  leadScoring?: LeadScoringDeps;
  outreach?: OutreachDeps;
  analytics?: AnalyticsDeps;
  optimization?: OptimizationDeps;
}

export interface StepStatus {
  step: StepName;
  ok: boolean;
  at: string;
  error?: string;
}

export interface MarketingOrchestratorOutput {
  campaignId: string;
  status: "completed" | "failed";
  steps: StepStatus[];
  outputs?: {
    trendAnalysis: TrendAnalysisOutput;
    contentGeneration: ContentGenerationOutput;
    mediaGeneration: MediaGenerationOutput;
    socialPublish: SocialPublishOutput;
    leadCapture: LeadCaptureOutput;
    leadScoring: LeadScoringOutput;
    outreach: OutreachOutput;
    analytics: AnalyticsOutput;
    optimization: OptimizationOutput;
  };
  failedStep?: StepName;
  generatedAt: string;
}

function log(event: string, payload?: Record<string, unknown>): void {
  console.info(JSON.stringify({ skill: "marketing_orchestrator", event, payload, at: new Date().toISOString() }));
}

function mapToSocialChannel(channel: string): "instagram" | "facebook" | "linkedin" | "tiktok" | "x" {
  if (channel === "instagram" || channel === "linkedin" || channel === "tiktok") {
    return channel;
  }

  if (channel === "blog") {
    return "linkedin";
  }

  if (channel === "email") {
    return "x";
  }

  return "instagram";
}

export async function marketingOrchestrator(
  input: MarketingOrchestratorInput,
  deps: MarketingOrchestratorDeps = {},
): Promise<MarketingOrchestratorOutput> {
  const steps: StepStatus[] = [];

  log("start", { campaignId: input.campaignId });

  try {
    const trendOutput = await trendAnalysis(input.trendAnalysis, deps.trendAnalysis);
    steps.push({ step: "trend_analysis", ok: true, at: new Date().toISOString() });

    const enrichedBrief = `${input.contentGeneration.brief}\nTrend recommendations: ${trendOutput.recommendations.join(" | ")}`;
    const contentOutput = await contentGeneration(
      { ...input.contentGeneration, brief: enrichedBrief },
      deps.contentGeneration,
    );
    steps.push({ step: "content_generation", ok: true, at: new Date().toISOString() });

    const mediaOutput = await mediaGeneration(input.mediaGeneration, deps.mediaGeneration);
    steps.push({ step: "media_generation", ok: true, at: new Date().toISOString() });

    const socialInput: SocialPublishInput = {
      campaignId: input.campaignId,
      posts:
        input.socialPublish?.posts ??
        contentOutput.contents.map((item, index) => ({
          channel: mapToSocialChannel(item.channel),
          content: `${item.headline}. ${item.body} ${item.callToAction}`,
          mediaUrls: mediaOutput.providerJobIds[index] ? [`media://${mediaOutput.providerJobIds[index]}`] : undefined,
          scheduledAt: new Date(Date.now() + 15 * 60 * 1000 + index * 60 * 1000).toISOString(),
        })),
    };

    const socialOutput = await socialPublish(socialInput, deps.socialPublish);
    steps.push({ step: "social_publish", ok: true, at: new Date().toISOString() });

    const leadCaptureOutput = await leadCapture(input.leadCapture, deps.leadCapture);
    steps.push({ step: "lead_capture", ok: true, at: new Date().toISOString() });

    const leadScoringOutput = await leadScoring(
      {
        ...input.leadScoring,
        leadId: leadCaptureOutput.leadId,
      },
      deps.leadScoring,
    );
    steps.push({ step: "lead_scoring", ok: true, at: new Date().toISOString() });

    const outreachInput: OutreachInput = {
      campaignId: input.campaignId,
      template: input.outreach.template,
      senderName: input.outreach.senderName,
      contacts:
        input.outreach.contacts ??
        [
          {
            leadId: leadCaptureOutput.leadId,
            name: leadCaptureOutput.normalizedContact.fullName,
            email: leadCaptureOutput.normalizedContact.email,
            phone: leadCaptureOutput.normalizedContact.phone,
            preferredChannel: "email",
          },
        ],
    };

    const outreachOutput = await outreach(outreachInput, deps.outreach);
    steps.push({ step: "outreach", ok: true, at: new Date().toISOString() });

    const analyticsOutput = await analytics(input.analytics, deps.analytics);
    steps.push({ step: "analytics", ok: true, at: new Date().toISOString() });

    const optimizationOutput = await optimization(input.optimization, deps.optimization);
    steps.push({ step: "optimization", ok: true, at: new Date().toISOString() });

    const output: MarketingOrchestratorOutput = {
      campaignId: input.campaignId,
      status: "completed",
      steps,
      outputs: {
        trendAnalysis: trendOutput,
        contentGeneration: contentOutput,
        mediaGeneration: mediaOutput,
        socialPublish: socialOutput,
        leadCapture: leadCaptureOutput,
        leadScoring: leadScoringOutput,
        outreach: outreachOutput,
        analytics: analyticsOutput,
        optimization: optimizationOutput,
      },
      generatedAt: new Date().toISOString(),
    };

    log("success", { campaignId: input.campaignId, completedSteps: steps.length });
    return output;
  } catch (error) {
    const failedStep = steps.length
      ? ([
          "trend_analysis",
          "content_generation",
          "media_generation",
          "social_publish",
          "lead_capture",
          "lead_scoring",
          "outreach",
          "analytics",
          "optimization",
        ][steps.length] as StepName)
      : "trend_analysis";

    const message = error instanceof Error ? error.message : "Unknown orchestrator error";
    steps.push({ step: failedStep, ok: false, error: message, at: new Date().toISOString() });

    log("failed", { campaignId: input.campaignId, failedStep, error: message });

    return {
      campaignId: input.campaignId,
      status: "failed",
      steps,
      failedStep,
      generatedAt: new Date().toISOString(),
    };
  }
}

export async function exampleUsage(): Promise<MarketingOrchestratorOutput> {
  return marketingOrchestrator({
    campaignId: "cmp_pipeline_2026",
    trendAnalysis: {
      keywords: ["fonoaudiologia", "terapia da fala", "saude vocal"],
      platforms: ["instagram", "tiktok", "linkedin"],
      periodDays: 14,
      locale: "pt-BR",
    },
    contentGeneration: {
      campaignGoal: "Increase demo requests",
      audiencePersona: "Clinic owners",
      tone: "educational",
      channels: ["instagram", "linkedin", "email"],
      brief: "Show measurable clinic growth with efficient operations.",
      callToAction: "Book a demo",
    },
    mediaGeneration: {
      campaignId: "cmp_pipeline_2026",
      assets: ["image", "carousel"],
      dimensions: ["1080x1350", "1080x1080"],
      visualDirection: "Modern clinic visuals and optimistic mood",
      brandGuidelines: "Respect brand colors and readable typography",
    },
    leadCapture: {
      source: "landing_page",
      contact: {
        fullName: "Ana Souza",
        email: "ana@example.com",
      },
      consent: true,
      tags: ["pipeline"],
    },
    leadScoring: {
      profile: {
        role: "Clinic owner",
        companySize: 6,
        region: "SP",
      },
      behavior: {
        openedEmails: 3,
        clickedLinks: 2,
        visitedPricingPage: true,
        requestedDemo: false,
      },
    },
    outreach: {
      senderName: "Equipe Evolua",
      template: "Oi {{name}}, aqui e {{sender}}. Quer uma demo guiada?",
    },
    analytics: {
      dateFrom: "2026-03-01",
      dateTo: "2026-03-31",
      channels: ["instagram", "linkedin", "email"],
      goals: ["leads", "demos"],
    },
    optimization: {
      objective: "Increase conversion rate",
      currentMetrics: {
        ctr: 2.4,
        cpl: 42,
        conversionRate: 3.2,
      },
      experimentsBacklog: [
        {
          id: "exp_offer_position",
          hypothesis: "Showing CTA earlier improves conversion",
          expectedImpact: 24,
          effort: 4,
        },
        {
          id: "exp_video_hook",
          hypothesis: "A stronger first 3 seconds increases retention",
          expectedImpact: 18,
          effort: 3,
        },
      ],
    },
  });
}