import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);

// ../daemon/dist/plugins/snapshot-diff.js
function diffSnapshots(input) {
  const { a, b } = input;
  const entries = [];
  diffScalar(entries, "snapshotId", a.snapshotId, b.snapshotId);
  diffScalar(entries, "pluginId", a.pluginId, b.pluginId);
  diffScalar(entries, "pluginSpecVersion", a.pluginSpecVersion, b.pluginSpecVersion);
  diffScalar(entries, "pluginVersion", a.pluginVersion, b.pluginVersion);
  diffScalar(entries, "manifestSourceDigest", a.manifestSourceDigest, b.manifestSourceDigest);
  diffScalar(entries, "sourceMarketplaceId", a.sourceMarketplaceId, b.sourceMarketplaceId);
  diffScalar(entries, "pinnedRef", a.pinnedRef, b.pinnedRef);
  diffScalar(entries, "taskKind", a.taskKind, b.taskKind);
  diffScalar(entries, "status", a.status, b.status);
  diffScalar(entries, "pluginTitle", a.pluginTitle, b.pluginTitle);
  diffScalar(entries, "pluginDescription", a.pluginDescription, b.pluginDescription);
  diffScalar(entries, "query", a.query, b.query);
  diffMap(entries, "inputs", recordToStringMap(a.inputs), recordToStringMap(b.inputs));
  diffArray(entries, "capabilitiesRequired", a.capabilitiesRequired, b.capabilitiesRequired);
  diffArray(entries, "capabilitiesGranted", a.capabilitiesGranted, b.capabilitiesGranted);
  diffArray(entries, "resolvedContext.items", contextRefs(a.resolvedContext?.items), contextRefs(b.resolvedContext?.items));
  diffArray(entries, "connectorsRequired", nonEmptyStrings((a.connectorsRequired ?? []).map((c) => safeString(c?.id))), nonEmptyStrings((b.connectorsRequired ?? []).map((c) => safeString(c?.id))));
  diffArray(entries, "connectorsResolved", nonEmptyStrings((a.connectorsResolved ?? []).map((c) => `${safeString(c?.id)}:${safeString(c?.status)}`)), nonEmptyStrings((b.connectorsResolved ?? []).map((c) => `${safeString(c?.id)}:${safeString(c?.status)}`)));
  diffArray(entries, "mcpServers", nonEmptyStrings((a.mcpServers ?? []).map((m) => safeString(m?.id))), nonEmptyStrings((b.mcpServers ?? []).map((m) => safeString(m?.id))));
  diffArray(entries, "genuiSurfaces", nonEmptyStrings((a.genuiSurfaces ?? []).map((s) => safeString(s?.id))), nonEmptyStrings((b.genuiSurfaces ?? []).map((s) => safeString(s?.id))));
  diffPipeline(entries, a.pipeline, b.pipeline);
  diffArray(entries, "assetsStaged", nonEmptyStrings((a.assetsStaged ?? []).map((x) => safeString(x?.path))), nonEmptyStrings((b.assetsStaged ?? []).map((x) => safeString(x?.path))));
  entries.sort((x, y) => x.field.localeCompare(y.field));
  let added = 0;
  let removed = 0;
  let changed = 0;
  for (const e of entries) {
    if (e.kind === "added")
      added++;
    if (e.kind === "removed")
      removed++;
    if (e.kind === "changed")
      changed++;
  }
  const report = {
    digestEqual: a.manifestSourceDigest === b.manifestSourceDigest,
    entries,
    added,
    removed,
    changed
  };
  if (a.pluginId === b.pluginId)
    report.pluginId = a.pluginId;
  return report;
}
function nonEmptyStrings(values) {
  return values.filter((s) => typeof s === "string" && s.length > 0);
}
function safeString(value) {
  return typeof value === "string" ? value : "";
}
function recordToStringMap(input) {
  const out = {};
  if (!input)
    return out;
  for (const [k, v] of Object.entries(input))
    out[k] = String(v);
  return out;
}
function contextRefs(items) {
  if (!Array.isArray(items))
    return [];
  return items.map((i) => {
    if (!i)
      return "";
    const anyItem = i;
    const ref = anyItem.id ?? anyItem.path ?? anyItem.label ?? "";
    return `${anyItem.kind ?? ""}:${ref}`;
  }).filter((s) => s.length > 1);
}
function diffPipeline(out, a, b) {
  if (!a && !b)
    return;
  if (!a && b) {
    out.push({ field: "pipeline", kind: "added", after: b.stages?.map((s) => s.id).join(" \u2192 ") ?? "" });
    return;
  }
  if (a && !b) {
    out.push({ field: "pipeline", kind: "removed", before: a.stages?.map((s) => s.id).join(" \u2192 ") ?? "" });
    return;
  }
  diffArray(out, "pipeline.stages", (a.stages ?? []).map((s) => s.id), (b.stages ?? []).map((s) => s.id));
  const aBy = new Map((a.stages ?? []).map((s) => [s.id, s]));
  const bBy = new Map((b.stages ?? []).map((s) => [s.id, s]));
  for (const id of /* @__PURE__ */ new Set([...aBy.keys(), ...bBy.keys()])) {
    const sa = aBy.get(id);
    const sb = bBy.get(id);
    if (!sa || !sb)
      continue;
    diffArray(out, `pipeline.stages[${id}].atoms`, sa.atoms ?? [], sb.atoms ?? []);
    diffScalar(out, `pipeline.stages[${id}].until`, sa.until, sb.until);
  }
}
function diffScalar(out, field, a, b) {
  const aPresent = a !== void 0 && a !== null;
  const bPresent = b !== void 0 && b !== null;
  if (!aPresent && !bPresent)
    return;
  if (!aPresent) {
    out.push({ field, kind: "added", after: String(b) });
    return;
  }
  if (!bPresent) {
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
    out.push({ field, kind: "changed", before: a.join(","), after: b.join(","), summary: `reordered (${a.length} entries)` });
    return;
  }
  out.push({ field, kind: "changed", summary: `${added.length} added, ${removed.length} removed`, before: removed.join(","), after: added.join(",") });
}
function diffMap(out, field, a, b) {
  const keys = /* @__PURE__ */ new Set([...Object.keys(a), ...Object.keys(b)]);
  const added = [];
  const removed = [];
  const changed = [];
  for (const k of keys) {
    const av = a[k];
    const bv = b[k];
    if (av === void 0 && bv !== void 0) {
      added.push(`${k}=${bv}`);
      continue;
    }
    if (av !== void 0 && bv === void 0) {
      removed.push(`${k}=${av}`);
      continue;
    }
    if (av !== bv)
      changed.push(`${k}: ${av} \u2192 ${bv}`);
  }
  if (added.length === 0 && removed.length === 0 && changed.length === 0)
    return;
  out.push({
    field,
    kind: "changed",
    summary: `${added.length} added, ${removed.length} removed, ${changed.length} changed`,
    before: removed.join(", "),
    after: [...added, ...changed].join(", ")
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
  diffSnapshots
};
