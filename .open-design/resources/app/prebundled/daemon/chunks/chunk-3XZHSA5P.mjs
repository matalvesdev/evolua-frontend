import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);

// ../daemon/dist/plugins/diff.js
function diffPlugins(input) {
  const out = [];
  diffScalar(out, "id", input.a.id, input.b.id);
  diffScalar(out, "title", input.a.title, input.b.title);
  diffScalar(out, "version", input.a.version, input.b.version);
  diffScalar(out, "sourceKind", input.a.sourceKind, input.b.sourceKind);
  diffScalar(out, "source", input.a.source, input.b.source);
  diffScalar(out, "trust", input.a.trust, input.b.trust);
  diffArray(out, "capabilitiesGranted", input.a.capabilitiesGranted, input.b.capabilitiesGranted);
  diffManifest(out, input.a.manifest, input.b.manifest);
  out.sort((a, b) => a.field.localeCompare(b.field));
  let added = 0;
  let removed = 0;
  let changed = 0;
  for (const e of out) {
    if (e.kind === "added")
      added++;
    if (e.kind === "removed")
      removed++;
    if (e.kind === "changed")
      changed++;
  }
  const report = { entries: out, added, removed, changed };
  if (input.a.id === input.b.id)
    report.pluginId = input.a.id;
  return report;
}
function diffManifest(out, a, b) {
  diffScalar(out, "manifest.title", a.title, b.title);
  diffScalar(out, "manifest.version", a.version, b.version);
  diffScalar(out, "manifest.description", a.description, b.description);
  diffScalar(out, "manifest.license", a.license, b.license);
  diffArray(out, "manifest.tags", a.tags ?? [], b.tags ?? []);
  diffScalar(out, "od.kind", a.od?.kind, b.od?.kind);
  diffScalar(out, "od.taskKind", a.od?.taskKind, b.od?.taskKind);
  diffScalar(out, "od.mode", a.od?.mode, b.od?.mode);
  diffArray(out, "od.capabilities", a.od?.capabilities ?? [], b.od?.capabilities ?? []);
  diffArray(out, "od.inputs[]", (a.od?.inputs ?? []).map((i) => i?.name).filter(Boolean), (b.od?.inputs ?? []).map((i) => i?.name).filter(Boolean));
  diffArray(out, "od.context.skills", (a.od?.context?.skills ?? []).map((s) => s?.ref ?? s?.path ?? "").filter(Boolean), (b.od?.context?.skills ?? []).map((s) => s?.ref ?? s?.path ?? "").filter(Boolean));
  diffArray(out, "od.context.craft", (a.od?.context?.craft ?? []).slice(), (b.od?.context?.craft ?? []).slice());
  diffArray(out, "od.context.assets", (a.od?.context?.assets ?? []).slice(), (b.od?.context?.assets ?? []).slice());
  diffPipeline(out, a.od?.pipeline, b.od?.pipeline);
  diffArray(out, "od.connectors.required", (a.od?.connectors?.required ?? []).map((c) => c?.id ?? "").filter(Boolean), (b.od?.connectors?.required ?? []).map((c) => c?.id ?? "").filter(Boolean));
  diffArray(out, "od.genui.surfaces", (a.od?.genui?.surfaces ?? []).map((s) => s?.id ?? "").filter(Boolean), (b.od?.genui?.surfaces ?? []).map((s) => s?.id ?? "").filter(Boolean));
}
function diffPipeline(out, a, b) {
  if (!a && !b)
    return;
  if (!a && b) {
    out.push({
      field: "od.pipeline",
      kind: "added",
      after: stagesSummary(b.stages)
    });
    return;
  }
  if (a && !b) {
    out.push({
      field: "od.pipeline",
      kind: "removed",
      before: stagesSummary(a.stages)
    });
    return;
  }
  diffArray(out, "od.pipeline.stages", (a.stages ?? []).map((s) => s.id), (b.stages ?? []).map((s) => s.id));
  const aById = new Map((a.stages ?? []).map((s) => [s.id, s]));
  const bById = new Map((b.stages ?? []).map((s) => [s.id, s]));
  for (const id of /* @__PURE__ */ new Set([...aById.keys(), ...bById.keys()])) {
    const sa = aById.get(id);
    const sb = bById.get(id);
    if (!sa || !sb)
      continue;
    diffArray(out, `od.pipeline.stages[${id}].atoms`, sa.atoms ?? [], sb.atoms ?? []);
    diffScalar(out, `od.pipeline.stages[${id}].until`, sa.until, sb.until);
    diffScalar(out, `od.pipeline.stages[${id}].repeat`, sa.repeat === void 0 ? void 0 : String(sa.repeat), sb.repeat === void 0 ? void 0 : String(sb.repeat));
  }
}
function stagesSummary(stages) {
  if (!stages || stages.length === 0)
    return "<empty>";
  return stages.map((s) => s.id).join(" \u2192 ");
}
function diffScalar(out, field, a, b) {
  const aPresent = a !== void 0 && a !== null;
  const bPresent = b !== void 0 && b !== null;
  if (!aPresent && !bPresent)
    return;
  if (!aPresent && bPresent) {
    out.push({ field, kind: "added", after: String(b) });
    return;
  }
  if (aPresent && !bPresent) {
    out.push({ field, kind: "removed", before: String(a) });
    return;
  }
  if (toComparable(a) === toComparable(b))
    return;
  out.push({ field, kind: "changed", before: String(a), after: String(b) });
}
function diffArray(out, field, a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  const added = [...setB].filter((x) => !setA.has(x));
  const removed = [...setA].filter((x) => !setB.has(x));
  if (added.length === 0 && removed.length === 0) {
    if (a.length === b.length && a.every((v, i) => v === b[i]))
      return;
    out.push({
      field,
      kind: "changed",
      before: a.join(","),
      after: b.join(","),
      summary: `reordered (${a.length} entries)`
    });
    return;
  }
  out.push({
    field,
    kind: "changed",
    summary: `${added.length} added, ${removed.length} removed`,
    before: removed.join(","),
    after: added.join(",")
  });
}
function toComparable(value) {
  if (value === void 0 || value === null)
    return "";
  if (typeof value === "string")
    return value;
  if (typeof value === "number")
    return String(value);
  if (typeof value === "boolean")
    return value ? "1" : "0";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export {
  diffPlugins
};
