import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);

// ../daemon/dist/plugins/trust.js
var TRUSTED_DEFAULT_CAPABILITIES = [
  "prompt:inject",
  "mcp:*",
  "connector:*",
  "genui:*",
  "pipeline:*"
];
var RESTRICTED_DEFAULT_CAPABILITIES = ["prompt:inject"];
function defaultTrustForRecord(record) {
  return record.sourceKind === "local" ? "trusted" : "restricted";
}
function defaultCapabilities(trust) {
  return trust === "trusted" ? Array.from(TRUSTED_DEFAULT_CAPABILITIES) : Array.from(RESTRICTED_DEFAULT_CAPABILITIES);
}
function requiredCapabilities(manifest) {
  const required = /* @__PURE__ */ new Set(["prompt:inject"]);
  const od = manifest.od;
  for (const mcp of od?.context?.mcp ?? []) {
    if (mcp?.name)
      required.add(`mcp:${mcp.name}`);
  }
  for (const ref of od?.connectors?.required ?? []) {
    if (ref?.id)
      required.add(`connector:${ref.id}`);
  }
  for (const ref of od?.connectors?.optional ?? []) {
    if (ref?.id)
      required.add(`connector:${ref.id}?`);
  }
  for (const surface of od?.genui?.surfaces ?? []) {
    if (surface?.kind)
      required.add(`genui:${surface.kind}`);
  }
  if ((od?.pipeline?.stages?.length ?? 0) > 0) {
    required.add("pipeline:*");
  }
  for (const cap of od?.capabilities ?? []) {
    if (typeof cap === "string" && cap.length > 0)
      required.add(cap);
  }
  return Array.from(required.values()).sort();
}
function resolveCapabilitiesGranted(args) {
  const out = new Set(defaultCapabilities(args.trust));
  if (args.trust === "trusted") {
    for (const cap of requiredCapabilities(args.manifest)) {
      out.add(stripOptionalSuffix(cap));
    }
  }
  return Array.from(out.values()).sort();
}
function stripOptionalSuffix(cap) {
  return cap.endsWith("?") ? cap.slice(0, -1) : cap;
}
var KNOWN_TOP_LEVEL_CAPABILITIES = /* @__PURE__ */ new Set([
  "prompt:inject",
  "fs:read",
  "fs:write",
  "mcp",
  "subprocess",
  "bash",
  "network",
  "connector",
  // Plan §3.K3 / spec §10.3.5 — plugin-bundled React component
  // surfaces require an explicit capability so a restricted plugin
  // cannot smuggle arbitrary UI through the GenUI layer.
  "genui:custom-component"
]);
var SCOPED_CONNECTOR_RE = /^connector:[a-z0-9][a-z0-9_-]*$/;
var SCOPED_MCP_RE = /^mcp:[A-Za-z0-9][A-Za-z0-9._-]*$/;
function validateCapabilityList(raw) {
  const accepted = [];
  const rejected = [];
  const seen = /* @__PURE__ */ new Set();
  if (!Array.isArray(raw)) {
    return { accepted, rejected };
  }
  for (const item of raw) {
    if (typeof item !== "string") {
      rejected.push({ capability: String(item), reason: "malformed" });
      continue;
    }
    const trimmed = item.trim();
    if (!trimmed)
      continue;
    if (seen.has(trimmed))
      continue;
    if (KNOWN_TOP_LEVEL_CAPABILITIES.has(trimmed)) {
      seen.add(trimmed);
      accepted.push(trimmed);
      continue;
    }
    if (SCOPED_CONNECTOR_RE.test(trimmed) || SCOPED_MCP_RE.test(trimmed)) {
      seen.add(trimmed);
      accepted.push(trimmed);
      continue;
    }
    rejected.push({ capability: trimmed, reason: "unknown" });
  }
  return { accepted, rejected };
}
function grantCapabilities(args) {
  const row = args.db.prepare(`SELECT capabilities_granted FROM installed_plugins WHERE id = ?`).get(args.pluginId);
  if (!row) {
    throw new Error(`plugin not found: ${args.pluginId}`);
  }
  let existing = [];
  try {
    const parsed = JSON.parse(row.capabilities_granted ?? "[]");
    if (Array.isArray(parsed)) {
      existing = parsed.filter((c) => typeof c === "string");
    }
  } catch {
    existing = [];
  }
  const merged = Array.from(/* @__PURE__ */ new Set([...existing, ...args.capabilities])).sort();
  const now = Date.now();
  args.db.prepare(`UPDATE installed_plugins
          SET capabilities_granted = ?, updated_at = ?
        WHERE id = ?`).run(JSON.stringify(merged), now, args.pluginId);
  return merged;
}
function revokeCapabilities(args) {
  const row = args.db.prepare(`SELECT capabilities_granted FROM installed_plugins WHERE id = ?`).get(args.pluginId);
  if (!row) {
    throw new Error(`plugin not found: ${args.pluginId}`);
  }
  let existing = [];
  try {
    const parsed = JSON.parse(row.capabilities_granted ?? "[]");
    if (Array.isArray(parsed)) {
      existing = parsed.filter((c) => typeof c === "string");
    }
  } catch {
    existing = [];
  }
  const drop = new Set(args.capabilities);
  drop.delete("prompt:inject");
  const next = existing.filter((c) => !drop.has(c));
  if (!next.includes("prompt:inject"))
    next.push("prompt:inject");
  next.sort();
  const now = Date.now();
  args.db.prepare(`UPDATE installed_plugins
          SET capabilities_granted = ?, updated_at = ?
        WHERE id = ?`).run(JSON.stringify(next), now, args.pluginId);
  return next;
}

export {
  TRUSTED_DEFAULT_CAPABILITIES,
  RESTRICTED_DEFAULT_CAPABILITIES,
  defaultTrustForRecord,
  defaultCapabilities,
  requiredCapabilities,
  resolveCapabilitiesGranted,
  validateCapabilityList,
  grantCapabilities,
  revokeCapabilities
};
