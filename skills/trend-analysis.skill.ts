export interface TrendAnalysisInput {
  keywords: string[];
  platforms: Array<"instagram" | "tiktok" | "youtube" | "linkedin" | "x">;
  periodDays: number;
  locale: string;
}

export interface TrendTopic {
  topic: string;
  momentumScore: number;
  sentiment: "positive" | "neutral" | "negative";
  sampleMentions: number;
}

export interface TrendAnalysisOutput {
  trends: TrendTopic[];
  recommendations: string[];
  generatedAt: string;
}

export interface TrendAnalysisDeps {
  fetchTrends?: (input: TrendAnalysisInput) => Promise<TrendTopic[]>;
}

function log(event: string, payload?: Record<string, unknown>): void {
  console.info(JSON.stringify({ skill: "trend_analysis", event, payload, at: new Date().toISOString() }));
}

export async function trendAnalysis(
  input: TrendAnalysisInput,
  deps: TrendAnalysisDeps = {},
): Promise<TrendAnalysisOutput> {
  log("start", { keywords: input.keywords, periodDays: input.periodDays });

  const trends = deps.fetchTrends
    ? await deps.fetchTrends(input)
    : input.keywords.slice(0, 5).map((keyword, index) => ({
        topic: `${keyword} trend`,
        momentumScore: Math.max(10, 95 - index * 11),
        sentiment: index % 3 === 0 ? "positive" : index % 3 === 1 ? "neutral" : "negative",
        sampleMentions: 1200 - index * 180,
      }));

  const recommendations = trends
    .filter((item) => item.momentumScore >= 60 && item.sentiment !== "negative")
    .map((item) => `Create short-form content around "${item.topic}" in the next 48 hours.`);

  const output: TrendAnalysisOutput = {
    trends,
    recommendations,
    generatedAt: new Date().toISOString(),
  };

  log("success", { trendCount: output.trends.length });
  return output;
}

export async function exampleUsage(): Promise<TrendAnalysisOutput> {
  return trendAnalysis({
    keywords: ["fonoaudiologia", "saude vocal", "reabilitacao"],
    platforms: ["instagram", "tiktok"],
    periodDays: 14,
    locale: "pt-BR",
  });
}