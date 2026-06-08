import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);
import {
  requiredCapabilities,
  resolveCapabilitiesGranted
} from "./chunk-6QGA3KRC.mjs";
import {
  deriveAutoOAuthPrompts,
  mergeAutoOAuthPrompts,
  resolveConnectorBindings
} from "./chunk-MA3L3OFF.mjs";
import {
  manifestSourceDigest,
  resolveAppliedPipeline,
  resolveContext
} from "./chunk-4TAOG76C.mjs";
import {
  renderPluginBlock,
  resolveLocalizedText
} from "./chunk-KZ5KHCCG.mjs";

// ../daemon/dist/plugins/atoms/auto-surfaces.js
function deriveAutoAtomSurfaces(ctx) {
  const out = [];
  if (!ctx.pipeline)
    return out;
  for (const stage of ctx.pipeline.stages) {
    const atoms = stage.atoms ?? [];
    if (atoms.includes("diff-review")) {
      out.push(buildDiffReviewSurface(stage.id));
    }
  }
  return out;
}
function buildDiffReviewSurface(stageId) {
  return {
    id: `__auto_diff_review_${stageId}`,
    kind: "choice",
    persist: "run",
    trigger: { stageId, atom: "diff-review" },
    prompt: "Review the diff and choose how to proceed.",
    schema: {
      type: "object",
      title: "Diff review",
      description: "Accept the patch, reject it, or pick which files to keep.",
      properties: {
        decision: {
          type: "string",
          enum: ["accept", "reject", "partial"],
          title: "Decision"
        },
        accepted_files: {
          type: "array",
          items: { type: "string" },
          title: "Files to accept (only required when decision=partial)"
        },
        rejected_files: {
          type: "array",
          items: { type: "string" },
          title: "Files to reject (only required when decision=partial)"
        },
        reason: {
          type: "string",
          title: "Notes for the patch author"
        }
      },
      required: ["decision"]
    },
    timeout: 24 * 60 * 60 * 1e3,
    // 24h — diff review may sit overnight
    onTimeout: "abort",
    capabilitiesRequired: []
  };
}

// ../daemon/dist/plugins/apply.js
var MissingInputError = class extends Error {
  fields;
  constructor(fields) {
    super(`Missing required plugin inputs: ${fields.join(", ")}`);
    this.fields = fields;
    this.name = "MissingInputError";
  }
};
function applyPlugin(input) {
  const manifest = input.plugin.manifest;
  const rawTrust = input.trust ?? input.plugin.trust;
  const trust = rawTrust === "restricted" ? "restricted" : "trusted";
  const validated = validateInputs(manifest, input.inputs);
  if (validated.missing.length > 0) {
    throw new MissingInputError(validated.missing);
  }
  const resolved = resolveContext(manifest, {
    registry: {
      ...input.registry,
      activeProjectDesignSystem: input.activeProjectDesignSystem
    },
    warnOnMissing: true
  });
  const digest = manifestSourceDigest({
    manifest,
    inputs: validated.coerced,
    resolvedContextRefs: resolved.digestRefs
  });
  const assets = buildAssetRefs(manifest);
  const mcpServers = manifest.od?.context?.mcp?.slice() ?? [];
  const { resolved: connectorsResolved, required: connectorsRequired } = resolveConnectorBindings(manifest, input.connectorProbe);
  const required = requiredCapabilities(manifest);
  const granted = resolveCapabilitiesGranted({ manifest, trust });
  const taskKind = manifest.od?.taskKind ?? "new-generation";
  const pipelineResolution = resolveAppliedPipeline({
    manifest,
    scenarios: input.registry.scenarios
  });
  const appliedPipeline = pipelineResolution.pipeline;
  const declaredSurfaces = manifest.od?.genui?.surfaces ?? [];
  const autoOAuth = input.connectorProbe ? deriveAutoOAuthPrompts(connectorsResolved) : [];
  const autoAtom = deriveAutoAtomSurfaces({ pipeline: appliedPipeline });
  const genuiSurfaces = mergeAutoOAuthPrompts(mergeAutoOAuthPrompts(declaredSurfaces, autoOAuth), autoAtom);
  const pluginTitle = resolveLocalizedText(manifest.title_i18n, input.locale) || (manifest.title ?? manifest.name);
  const pluginDescription = resolveLocalizedText(manifest.description_i18n, input.locale) || manifest.description;
  const projectMetadata = {
    name: pluginTitle,
    taskKind
  };
  const skillRef = pickFirstSkillId(manifest);
  if (skillRef)
    projectMetadata.skillId = skillRef;
  const dsId = pickDesignSystemId(manifest, input.activeProjectDesignSystem);
  if (dsId)
    projectMetadata.designSystemId = dsId;
  if (Array.isArray(manifest.od?.context?.craft) && manifest.od.context.craft.length > 0) {
    projectMetadata.craftRequires = manifest.od.context.craft.slice();
  }
  const queryText = resolveLocalizedText(manifest.od?.useCase?.query, input.locale);
  const appliedAt = Date.now();
  const snapshot = {
    snapshotId: "",
    pluginId: input.plugin.id,
    pluginSpecVersion: manifest.specVersion,
    pluginVersion: input.plugin.version,
    manifestSourceDigest: digest,
    sourceMarketplaceId: input.plugin.sourceMarketplaceId,
    sourceMarketplaceEntryName: input.plugin.sourceMarketplaceEntryName,
    sourceMarketplaceEntryVersion: input.plugin.sourceMarketplaceEntryVersion,
    marketplaceTrust: input.plugin.marketplaceTrust,
    resolvedSource: input.plugin.resolvedSource,
    resolvedRef: input.plugin.resolvedRef,
    archiveIntegrity: input.plugin.archiveIntegrity,
    pinnedRef: input.plugin.pinnedRef,
    inputs: validated.coerced,
    resolvedContext: resolved.context,
    capabilitiesGranted: granted,
    capabilitiesRequired: required,
    assetsStaged: assets,
    taskKind,
    appliedAt,
    connectorsRequired,
    connectorsResolved,
    mcpServers,
    pipeline: appliedPipeline,
    genuiSurfaces,
    pluginTitle,
    pluginDescription,
    query: queryText || void 0,
    status: "fresh"
  };
  const result = {
    query: queryText,
    contextItems: resolved.context.items,
    inputs: manifest.od?.inputs ?? [],
    assets,
    mcpServers,
    pipeline: appliedPipeline,
    genuiSurfaces,
    projectMetadata,
    trust,
    capabilitiesGranted: granted,
    capabilitiesRequired: required,
    appliedPlugin: snapshot
  };
  return { result, manifestSourceDigest: digest, warnings: resolved.warnings };
}
function validateInputs(manifest, raw) {
  const fields = manifest.od?.inputs ?? [];
  const coerced = {};
  const missing = [];
  for (const field of fields) {
    const name = field.name;
    if (!name)
      continue;
    const provided = raw[name];
    if (provided === void 0 || provided === null || provided === "") {
      const fallback = field.default;
      if (fallback !== void 0 && fallback !== null && fallback !== "") {
        coerced[name] = coerceScalar(fallback);
      } else if (field.required === true) {
        missing.push(name);
      }
      continue;
    }
    coerced[name] = coerceScalar(provided);
  }
  for (const [key, value] of Object.entries(raw)) {
    if (key in coerced)
      continue;
    if (value === void 0 || value === null)
      continue;
    coerced[key] = coerceScalar(value);
  }
  return { coerced, missing };
}
function coerceScalar(value) {
  if (typeof value === "string")
    return value;
  if (typeof value === "number")
    return value;
  if (typeof value === "boolean")
    return value;
  if (Array.isArray(value))
    return value.join(", ");
  return JSON.stringify(value);
}
function buildAssetRefs(manifest) {
  const out = [];
  for (const raw of manifest.od?.context?.assets ?? []) {
    if (typeof raw !== "string" || raw.length === 0)
      continue;
    const path = raw;
    out.push({ path, src: path, stageAt: "run-start" });
  }
  return out;
}
function pickFirstSkillId(manifest) {
  for (const ref of manifest.od?.context?.skills ?? []) {
    if (typeof ref?.ref === "string" && ref.ref.trim().length > 0) {
      return ref.ref.trim();
    }
    const rawPath = typeof ref?.path === "string" ? ref.path.trim() : "";
    if (!rawPath)
      continue;
    if (isPluginLocalPath(rawPath))
      continue;
    return rawPath;
  }
  return void 0;
}
function isPluginLocalPath(value) {
  return value.startsWith("./") || value.startsWith("../") || value.includes("/");
}
function pickFirstLocalSkillPath(manifest) {
  for (const ref of manifest.od?.context?.skills ?? []) {
    if (typeof ref?.ref === "string" && ref.ref.trim().length > 0)
      continue;
    const rawPath = typeof ref?.path === "string" ? ref.path.trim() : "";
    if (!rawPath)
      continue;
    if (!isPluginLocalPath(rawPath))
      continue;
    return rawPath;
  }
  return void 0;
}
function pickDesignSystemId(manifest, active) {
  const ds = manifest.od?.context?.designSystem;
  if (ds && typeof ds.ref === "string" && ds.ref.trim())
    return ds.ref.trim();
  if (ds && active?.id)
    return active.id;
  return void 0;
}
var pluginPromptBlock = renderPluginBlock;

export {
  MissingInputError,
  applyPlugin,
  pickFirstLocalSkillPath,
  pluginPromptBlock
};
