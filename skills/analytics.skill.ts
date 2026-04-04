export interface AnalyticsInput {
  dateFrom: string;
  dateTo: string;
  channels: string[];
  goals: string[];
}

export interface ChannelMetric {
  channel: string;
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
}

export interface AnalyticsOutput {
  metrics: ChannelMetric[];
  summary: {
    totalImpressions: number;
    totalClicks: number;
    totalLeads: number;
    totalConversions: number;
    conversionRate: number;
  };
  insights: string[];
  generatedAt: string;
}

export interface AnalyticsDeps {
  fetchChannelMetrics?: (input: AnalyticsInput) => Promise<ChannelMetric[]>;
}

function log(event: string, payload?: Record<string, unknown>): void {
  console.info(JSON.stringify({ skill: "analytics", event, payload, at: new Date().toISOString() }));
}

export async function analytics(input: AnalyticsInput, deps: AnalyticsDeps = {}): Promise<AnalyticsOutput> {
  log("start", { channels: input.channels, period: `${input.dateFrom}..${input.dateTo}` });

  const metrics = deps.fetchChannelMetrics
    ? await deps.fetchChannelMetrics(input)
    : input.channels.map((channel, index) => ({
        channel,
        impressions: 15000 - index * 1000,
        clicks: 1700 - index * 150,
        leads: 220 - index * 20,
        conversions: 46 - index * 4,
      }));

  const summary = metrics.reduce(
    (acc, item) => {
      acc.totalImpressions += item.impressions;
      acc.totalClicks += item.clicks;
      acc.totalLeads += item.leads;
      acc.totalConversions += item.conversions;
      return acc;
    },
    {
      totalImpressions: 0,
      totalClicks: 0,
      totalLeads: 0,
      totalConversions: 0,
      conversionRate: 0,
    },
  );

  summary.conversionRate = summary.totalClicks
    ? Number(((summary.totalConversions / summary.totalClicks) * 100).toFixed(2))
    : 0;

  const insights = [
    `Top goal coverage: ${input.goals.join(", ")}`,
    `Overall conversion rate: ${summary.conversionRate}%`,
    "Prioritize channels with highest leads-to-conversion ratio.",
  ];

  const output: AnalyticsOutput = {
    metrics,
    summary,
    insights,
    generatedAt: new Date().toISOString(),
  };

  log("success", { conversions: output.summary.totalConversions });
  return output;
}

export async function exampleUsage(): Promise<AnalyticsOutput> {
  return analytics({
    dateFrom: "2026-03-01",
    dateTo: "2026-03-31",
    channels: ["instagram", "linkedin", "email"],
    goals: ["leads", "webinar_signups"],
  });
}