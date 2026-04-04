export interface OptimizationInput {
  objective: string;
  currentMetrics: {
    ctr: number;
    cpl: number;
    conversionRate: number;
  };
  experimentsBacklog: Array<{
    id: string;
    hypothesis: string;
    expectedImpact: number;
    effort: number;
  }>;
}

export interface OptimizationOutput {
  priorityPlan: Array<{
    experimentId: string;
    priorityScore: number;
    recommendation: string;
  }>;
  quickWins: string[];
  nextReviewDate: string;
}

export interface OptimizationDeps {
  rankExperiments?: (input: OptimizationInput) => Promise<OptimizationOutput["priorityPlan"]>;
}

function log(event: string, payload?: Record<string, unknown>): void {
  console.info(JSON.stringify({ skill: "optimization", event, payload, at: new Date().toISOString() }));
}

export async function optimization(
  input: OptimizationInput,
  deps: OptimizationDeps = {},
): Promise<OptimizationOutput> {
  log("start", { objective: input.objective, backlogSize: input.experimentsBacklog.length });

  const priorityPlan = deps.rankExperiments
    ? await deps.rankExperiments(input)
    : input.experimentsBacklog
        .map((experiment) => {
          const priorityScore = Number((experiment.expectedImpact / Math.max(1, experiment.effort)).toFixed(2));
          return {
            experimentId: experiment.id,
            priorityScore,
            recommendation: `Test hypothesis: ${experiment.hypothesis}`,
          };
        })
        .sort((a, b) => b.priorityScore - a.priorityScore);

  const quickWins = priorityPlan.slice(0, 3).map((item) => `Run ${item.experimentId} this sprint`);
  const nextReviewDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const output: OptimizationOutput = {
    priorityPlan,
    quickWins,
    nextReviewDate,
  };

  log("success", { prioritized: output.priorityPlan.length });
  return output;
}

export async function exampleUsage(): Promise<OptimizationOutput> {
  return optimization({
    objective: "Reduce cost per lead",
    currentMetrics: {
      ctr: 2.8,
      cpl: 36.5,
      conversionRate: 3.1,
    },
    experimentsBacklog: [
      {
        id: "exp_new_hook",
        hypothesis: "Pain-point-focused hooks improve CTR",
        expectedImpact: 30,
        effort: 8,
      },
      {
        id: "exp_short_form",
        hypothesis: "Shorter forms increase conversion",
        expectedImpact: 20,
        effort: 3,
      },
    ],
  });
}