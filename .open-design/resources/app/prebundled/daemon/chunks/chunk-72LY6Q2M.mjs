import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);

// ../daemon/dist/plugins/verify.js
var DEFAULT_CHECKS = ["doctor", "simulate", "canon"];
function verifyPlugin(input) {
  const enabled = new Set((input.config.enabled ?? DEFAULT_CHECKS).filter((c) => c === "doctor" || c === "simulate" || c === "canon"));
  const outcomes = [];
  if (!enabled.has("doctor")) {
    outcomes.push({ check: "doctor", status: "skipped", summary: "doctor: skipped (not in enabled set)" });
  } else if (!input.doctor) {
    outcomes.push({ check: "doctor", status: "unsupported", summary: "doctor: report missing (CLI did not fetch)" });
  } else {
    const errors = input.doctor.issues.filter((i) => i.severity === "error").length;
    const warnings = input.doctor.issues.filter((i) => i.severity === "warning").length;
    const strict = input.config.strict === true;
    const failed = errors > 0 || strict && warnings > 0;
    const status = failed ? "failed" : "passed";
    const summary = strict && warnings > 0 && errors === 0 ? `doctor: 0 errors, ${warnings} warning${warnings === 1 ? "" : "s"} (strict mode \u2014 warnings fail the check)` : `doctor: ${errors} error${errors === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"}`;
    outcomes.push({
      check: "doctor",
      status,
      summary,
      details: { errors, warnings, ok: input.doctor.ok, freshDigest: input.doctor.freshDigest, strict }
    });
  }
  if (!enabled.has("simulate")) {
    outcomes.push({ check: "simulate", status: "skipped", summary: "simulate: skipped (not in enabled set)" });
  } else if (!input.simulate) {
    outcomes.push({ check: "simulate", status: "unsupported", summary: "simulate: report missing (CLI did not run pipeline simulator)" });
  } else {
    const failing = input.simulate.outcome === "cap-hit" || input.simulate.outcome === "unparsable";
    const status = failing ? "failed" : "passed";
    outcomes.push({
      check: "simulate",
      status,
      summary: `simulate: ${input.simulate.outcome}, ${input.simulate.totalIterations} iteration${input.simulate.totalIterations === 1 ? "" : "s"} across ${input.simulate.stages.length} stage${input.simulate.stages.length === 1 ? "" : "s"}`,
      details: {
        outcome: input.simulate.outcome,
        totalIterations: input.simulate.totalIterations,
        stages: input.simulate.stages.map((s) => ({ stageId: s.stageId, outcome: s.outcome, iterations: s.iterations }))
      }
    });
  }
  if (!enabled.has("canon")) {
    outcomes.push({ check: "canon", status: "skipped", summary: "canon: skipped (not in enabled set)" });
  } else if (typeof input.canon !== "string" || typeof input.canonExpected !== "string") {
    outcomes.push({
      check: "canon",
      status: "skipped",
      summary: "canon: skipped (no fixture supplied; declare config.canon.fixturePath)"
    });
  } else if (input.canon === input.canonExpected) {
    outcomes.push({
      check: "canon",
      status: "passed",
      summary: `canon: byte-equal (${input.canon.length} bytes)`
    });
  } else {
    outcomes.push({
      check: "canon",
      status: "failed",
      summary: `canon: mismatch (expected ${input.canonExpected.length} bytes, got ${input.canon.length} bytes)`,
      details: { expectedLength: input.canonExpected.length, actualLength: input.canon.length }
    });
  }
  const passed = outcomes.every((o) => o.status === "passed" || o.status === "skipped");
  return { passed, outcomes };
}

export {
  verifyPlugin
};
