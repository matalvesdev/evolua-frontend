import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);
import {
  evaluateUntil,
  parseUntil
} from "./chunk-HG26ZUVM.mjs";

// ../daemon/dist/plugins/simulate.js
var DEFAULT_ITERATION_CAP = 10;
function simulatePipeline(input) {
  const cap = input.iterationCap ?? DEFAULT_ITERATION_CAP;
  const provider = typeof input.signals === "function" ? input.signals : () => input.signals;
  const stages = [];
  for (const stage of input.pipeline.stages) {
    const stageOutcome = simulateStage(stage, provider, cap);
    stages.push(stageOutcome);
  }
  const totalIterations = stages.reduce((acc, s) => acc + s.iterations, 0);
  const outcome = aggregateOutcome(stages);
  return { stages, totalIterations, outcome };
}
function simulateStage(stage, provider, cap) {
  const stageId = stage.id;
  const repeat = stage.repeat === true;
  const untilSource = stage.until;
  if (!repeat || !untilSource) {
    const finalSignals = provider(stageId, 0);
    const out = {
      stageId,
      iterations: 1,
      outcome: "single",
      finalSignals
    };
    return out;
  }
  let parsed;
  try {
    parsed = parseUntil(untilSource);
  } catch (err) {
    const finalSignals = provider(stageId, 0);
    return {
      stageId,
      iterations: 1,
      outcome: "unparsable",
      finalSignals,
      reason: err.message
    };
  }
  let lastSignals = {};
  for (let i = 0; i < cap; i++) {
    const signals = provider(stageId, i);
    lastSignals = signals;
    const eval_ = evaluateUntil(parsed, signals);
    if (eval_.satisfied) {
      const out = {
        stageId,
        iterations: i + 1,
        outcome: "converged",
        finalSignals: signals
      };
      if (eval_.matched.length > 0)
        out.matched = eval_.matched;
      return out;
    }
  }
  return {
    stageId,
    iterations: cap,
    outcome: "cap",
    finalSignals: lastSignals,
    reason: `until expression never satisfied within iterationCap=${cap}`
  };
}
function aggregateOutcome(stages) {
  if (stages.length === 0)
    return "all-single";
  if (stages.some((s) => s.outcome === "unparsable"))
    return "unparsable";
  if (stages.some((s) => s.outcome === "cap"))
    return "cap-hit";
  if (stages.every((s) => s.outcome === "single"))
    return "all-single";
  if (stages.every((s) => s.outcome === "converged" || s.outcome === "single")) {
    return stages.every((s) => s.outcome === "converged") ? "all-converged" : "mixed";
  }
  return "mixed";
}
function parseSignalKv(args) {
  const out = {};
  const warnings = [];
  const knownNumeric = ["critique.score", "iterations"];
  const knownBoolean = ["user.confirmed", "preview.ok", "build.passing", "tests.passing"];
  for (const arg of args) {
    const eq = arg.indexOf("=");
    if (eq <= 0) {
      warnings.push(`signal must be 'key=value', got '${arg}'`);
      continue;
    }
    const key = arg.slice(0, eq).trim();
    const raw = arg.slice(eq + 1).trim();
    if (knownNumeric.includes(key)) {
      const num = Number(raw);
      if (Number.isFinite(num)) {
        out[key] = num;
      } else {
        warnings.push(`signal ${key} expected number; got '${raw}'`);
      }
      continue;
    }
    if (knownBoolean.includes(key)) {
      if (raw === "true" || raw === "1")
        out[key] = true;
      else if (raw === "false" || raw === "0")
        out[key] = false;
      else
        warnings.push(`signal ${key} expected boolean; got '${raw}'`);
      continue;
    }
    warnings.push(`unknown signal '${key}' (allowed: critique.score / iterations / user.confirmed / preview.ok / build.passing / tests.passing)`);
  }
  return { signals: out, warnings };
}

export {
  simulatePipeline,
  parseSignalKv
};
