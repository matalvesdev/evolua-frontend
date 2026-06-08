import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);

// ../daemon/dist/plugins/connector-gate.js
function resolveConnectorBindings(manifest, probe) {
  const required = [
    ...(manifest.od?.connectors?.required ?? []).map((r) => ({ ...r, required: true })),
    ...(manifest.od?.connectors?.optional ?? []).map((r) => ({ ...r, required: false }))
  ];
  const resolved = required.map((c) => {
    const tools = Array.isArray(c.tools) ? c.tools : [];
    if (!probe) {
      return { id: c.id, tools, required: c.required, status: "pending" };
    }
    const entry = probe.get(c.id);
    if (!entry) {
      return { id: c.id, tools, required: c.required, status: "unavailable" };
    }
    const binding = {
      id: entry.id,
      tools,
      required: c.required,
      status: entry.status
    };
    if (entry.accountLabel)
      binding.accountLabel = entry.accountLabel;
    return binding;
  });
  return { resolved, required };
}
function deriveAutoOAuthPrompts(bindings) {
  const out = [];
  for (const b of bindings) {
    if (!b.required)
      continue;
    if (b.status === "connected")
      continue;
    out.push({
      id: `__auto_connector_${b.id}`,
      kind: "oauth-prompt",
      persist: "project",
      capabilitiesRequired: [`connector:${b.id}`],
      prompt: `This plugin needs the ${b.id} connector. Authorize it to continue.`,
      oauth: { route: "connector", connectorId: b.id }
    });
  }
  return out;
}
function mergeAutoOAuthPrompts(declared, auto) {
  const ids = new Set(declared.map((s) => s.id.toLowerCase()));
  const merged = [...declared];
  for (const surface of auto) {
    if (ids.has(surface.id.toLowerCase()))
      continue;
    merged.push(surface);
    ids.add(surface.id.toLowerCase());
  }
  return merged;
}
function validateConnectorRefs(manifest, probe) {
  const issues = [];
  const all = [
    ...manifest.od?.connectors?.required ?? [],
    ...manifest.od?.connectors?.optional ?? []
  ];
  const required = manifest.od?.connectors?.required ?? [];
  const declaredCaps = new Set(manifest.od?.capabilities ?? []);
  for (const ref of all) {
    const entry = probe.get(ref.id);
    if (!entry) {
      issues.push({
        connectorId: ref.id,
        code: "unknown-connector",
        message: `Unknown connector "${ref.id}" \u2014 no entry in connectorService.listAll()`
      });
      continue;
    }
    const tools = Array.isArray(ref.tools) ? ref.tools : [];
    const allowed = new Set(entry.allowedToolNames);
    const unknown = tools.filter((t) => !allowed.has(t));
    if (unknown.length > 0) {
      issues.push({
        connectorId: ref.id,
        code: "unknown-tool",
        message: `Connector "${ref.id}" tools not in allowedToolNames: ${unknown.join(", ")}`,
        tools: unknown
      });
    }
  }
  for (const ref of required) {
    const cap = `connector:${ref.id}`;
    if (!declaredCaps.has(cap)) {
      issues.push({
        connectorId: ref.id,
        code: "missing-capability",
        message: `Required connector "${ref.id}" is missing the "${cap}" capability declaration`
      });
    }
  }
  return issues;
}

export {
  resolveConnectorBindings,
  deriveAutoOAuthPrompts,
  mergeAutoOAuthPrompts,
  validateConnectorRefs
};
