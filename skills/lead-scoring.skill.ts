export interface LeadScoringInput {
  leadId: string;
  profile: {
    role: string;
    companySize: number;
    region: string;
  };
  behavior: {
    openedEmails: number;
    clickedLinks: number;
    visitedPricingPage: boolean;
    requestedDemo: boolean;
  };
}

export interface LeadScoringOutput {
  leadId: string;
  score: number;
  tier: "cold" | "warm" | "hot";
  reasons: string[];
  suggestedAction: string;
  scoredAt: string;
}

export interface LeadScoringDeps {
  customScorer?: (input: LeadScoringInput) => Promise<number>;
}

function log(event: string, payload?: Record<string, unknown>): void {
  console.info(JSON.stringify({ skill: "lead_scoring", event, payload, at: new Date().toISOString() }));
}

export async function leadScoring(
  input: LeadScoringInput,
  deps: LeadScoringDeps = {},
): Promise<LeadScoringOutput> {
  log("start", { leadId: input.leadId });

  const score = deps.customScorer
    ? await deps.customScorer(input)
    : Math.min(
        100,
        input.behavior.openedEmails * 5 +
          input.behavior.clickedLinks * 10 +
          (input.behavior.visitedPricingPage ? 20 : 0) +
          (input.behavior.requestedDemo ? 35 : 0) +
          (input.profile.companySize > 5 ? 10 : 0),
      );

  const tier: LeadScoringOutput["tier"] = score >= 75 ? "hot" : score >= 45 ? "warm" : "cold";
  const reasons = [
    `Email opens: ${input.behavior.openedEmails}`,
    `Link clicks: ${input.behavior.clickedLinks}`,
    `Visited pricing page: ${input.behavior.visitedPricingPage}`,
    `Requested demo: ${input.behavior.requestedDemo}`,
  ];

  const suggestedAction =
    tier === "hot"
      ? "Route to sales within 1 hour"
      : tier === "warm"
        ? "Enroll in nurture sequence"
        : "Send educational content only";

  const output: LeadScoringOutput = {
    leadId: input.leadId,
    score,
    tier,
    reasons,
    suggestedAction,
    scoredAt: new Date().toISOString(),
  };

  log("success", { leadId: output.leadId, score: output.score, tier: output.tier });
  return output;
}

export async function exampleUsage(): Promise<LeadScoringOutput> {
  return leadScoring({
    leadId: "lead_123",
    profile: { role: "Clinic owner", companySize: 8, region: "SP" },
    behavior: {
      openedEmails: 4,
      clickedLinks: 3,
      visitedPricingPage: true,
      requestedDemo: false,
    },
  });
}