import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);
import {
  validateConnectorRefs
} from "./chunk-MA3L3OFF.mjs";
import {
  isParseableUntil
} from "./chunk-HG26ZUVM.mjs";
import {
  resolvePluginFolder
} from "./chunk-ABQBL4YO.mjs";
import {
  manifestSourceDigest,
  resolveContext,
  validateSafe
} from "./chunk-4TAOG76C.mjs";

// ../daemon/dist/plugins/validate.js
import path from "node:path";

// ../daemon/dist/plugins/atoms.js
var FIRST_PARTY_ATOMS = [
  { id: "discovery-question-form", label: "Discovery question form", description: "Turn-1 question form for ambiguous briefs.", status: "implemented", taskKinds: ["new-generation", "tune-collab"] },
  { id: "direction-picker", label: "Direction picker", description: "3-5 direction picker before final.", status: "implemented", taskKinds: ["new-generation", "tune-collab"] },
  { id: "todo-write", label: "Todo write", description: "TodoWrite-driven plan.", status: "implemented", taskKinds: ["new-generation", "code-migration", "figma-migration", "tune-collab"] },
  { id: "file-read", label: "File read", description: "Read project files.", status: "implemented", taskKinds: ["new-generation", "code-migration", "figma-migration", "tune-collab"] },
  { id: "file-write", label: "File write", description: "Write project files.", status: "implemented", taskKinds: ["new-generation", "code-migration", "figma-migration", "tune-collab"] },
  { id: "file-edit", label: "File edit", description: "Edit project files.", status: "implemented", taskKinds: ["new-generation", "code-migration", "figma-migration", "tune-collab"] },
  { id: "research-search", label: "Research search", description: "Tavily-backed shallow research.", status: "implemented", taskKinds: ["new-generation"] },
  { id: "media-image", label: "Media image", description: "Image generation through media providers.", status: "implemented", taskKinds: ["new-generation", "tune-collab"] },
  { id: "media-video", label: "Media video", description: "Video generation through media providers.", status: "implemented", taskKinds: ["new-generation", "tune-collab"] },
  { id: "media-audio", label: "Media audio", description: "Audio generation through media providers.", status: "implemented", taskKinds: ["new-generation", "tune-collab"] },
  { id: "live-artifact", label: "Live artifact", description: "Create/refresh live artifacts.", status: "implemented", taskKinds: ["new-generation", "tune-collab"] },
  { id: "connector", label: "Connector", description: "Composio connector tool calls.", status: "implemented", taskKinds: ["new-generation", "tune-collab"] },
  { id: "critique-theater", label: "Critique theater", description: "5-dim panel critique; devloop signal.", status: "implemented", taskKinds: ["new-generation", "code-migration", "figma-migration", "tune-collab"] },
  // Phase 6/7/8 atoms — promoted from 'planned' to 'implemented'
  // by the §3.N1-N4 / §3.O2-O5 / §3.P1-P2 / §3.Q2 / §3.S1 slices.
  { id: "code-import", label: "Code import", description: "Walk an existing repo into <cwd>/code/index.json.", status: "implemented", taskKinds: ["code-migration"] },
  { id: "design-extract", label: "Design extract", description: "Extract design tokens into <cwd>/code/tokens.json.", status: "implemented", taskKinds: ["code-migration", "figma-migration"] },
  { id: "figma-extract", label: "Figma extract", description: "Pull Figma file tree + assets via REST.", status: "implemented", taskKinds: ["figma-migration"] },
  { id: "token-map", label: "Token map", description: "Crosswalk source token bag onto active design system.", status: "implemented", taskKinds: ["code-migration", "figma-migration"] },
  { id: "rewrite-plan", label: "Rewrite plan", description: "Heuristic ownership classifier + per-leaf step list.", status: "implemented", taskKinds: ["code-migration", "tune-collab"] },
  { id: "patch-edit", label: "Patch edit", description: "Atomic unified-diff applier with shell-tier safety gate.", status: "implemented", taskKinds: ["code-migration", "tune-collab"] },
  { id: "build-test", label: "Build / test", description: "Shell-out to typecheck + tests; emits build/tests.passing signals.", status: "implemented", taskKinds: ["code-migration"] },
  { id: "diff-review", label: "Diff review", description: "Render rewrite as review/{diff.patch,summary.md,decision.json}.", status: "implemented", taskKinds: ["code-migration", "tune-collab"] },
  { id: "handoff", label: "Handoff", description: "Update ArtifactManifest provenance + handoffKind ladder.", status: "implemented", taskKinds: ["code-migration", "tune-collab"] }
];
var ATOMS_BY_ID = new Map(FIRST_PARTY_ATOMS.map((a) => [a.id, a]));
function findAtom(id) {
  return ATOMS_BY_ID.get(id);
}
function isKnownAtom(id) {
  return ATOMS_BY_ID.has(id);
}
function isImplementedAtom(id) {
  return ATOMS_BY_ID.get(id)?.status === "implemented";
}

// ../daemon/dist/plugins/doctor.js
function doctorPlugin(plugin, registry, options) {
  const issues = [];
  const manifest = plugin.manifest;
  const validation = validateSafe(manifest);
  for (const err of validation.errors) {
    issues.push({ severity: "error", code: "manifest.invalid", message: err });
  }
  for (const warn of validation.warnings) {
    issues.push({ severity: "warning", code: "manifest.warning", message: warn });
  }
  for (const atomId of manifest.od?.context?.atoms ?? []) {
    if (!isKnownAtom(atomId)) {
      issues.push({
        severity: "error",
        code: "atom.unknown",
        message: `Unknown atom id: '${atomId}'.`,
        field: "od.context.atoms"
      });
    } else if (!isImplementedAtom(atomId)) {
      const atom = findAtom(atomId);
      issues.push({
        severity: "warning",
        code: "atom.planned",
        message: `Atom '${atomId}'${atom ? ` (${atom.label})` : ""} is planned but not yet implemented; runs will skip this atom.`,
        field: "od.context.atoms"
      });
    }
  }
  for (const stage of manifest.od?.pipeline?.stages ?? []) {
    for (const atomId of stage.atoms ?? []) {
      if (!isKnownAtom(atomId)) {
        issues.push({
          severity: "error",
          code: "atom.unknown",
          message: `Pipeline stage '${stage.id}' references unknown atom '${atomId}'.`,
          field: `od.pipeline.stages.${stage.id}`
        });
      }
    }
    if (stage.repeat === true && !stage.until) {
      issues.push({
        severity: "error",
        code: "pipeline.until-missing",
        message: `Pipeline stage '${stage.id}' sets repeat:true but no until expression.`,
        field: `od.pipeline.stages.${stage.id}`
      });
    }
    if (stage.until && !isParseableUntil(stage.until)) {
      issues.push({
        severity: "error",
        code: "pipeline.until-invalid",
        message: `Pipeline stage '${stage.id}' has an unparseable until expression: '${stage.until}'.`,
        field: `od.pipeline.stages.${stage.id}`
      });
    }
  }
  if (options?.connectorProbe) {
    for (const issue of validateConnectorRefs(manifest, options.connectorProbe)) {
      issues.push({
        severity: issue.code === "unknown-connector" ? "error" : "warning",
        code: `connector.${issue.code}`,
        message: issue.message,
        field: "od.connectors"
      });
    }
  }
  for (const surface of manifest.od?.genui?.surfaces ?? []) {
    if (!surface.component)
      continue;
    const declared = new Set(manifest.od?.capabilities ?? []);
    if (!declared.has("genui:custom-component")) {
      issues.push({
        severity: "error",
        code: "genui.component-capability",
        message: `Surface '${surface.id}' ships a component but the manifest does not declare the 'genui:custom-component' capability.`,
        field: "od.genui.surfaces"
      });
    }
    if (surface.component.path.includes("..")) {
      issues.push({
        severity: "error",
        code: "genui.component-traversal",
        message: `Surface '${surface.id}' component path must be relative without traversal segments.`,
        field: "od.genui.surfaces"
      });
    }
  }
  const resolved = resolveContext(manifest, {
    registry,
    warnOnMissing: options?.warnOnMissingRefs ?? true
  });
  for (const warn of resolved.warnings) {
    issues.push({ severity: "warning", code: "context.unresolved", message: warn });
  }
  const freshDigest = manifestSourceDigest({
    manifest,
    inputs: {},
    resolvedContextRefs: resolved.digestRefs
  });
  if (plugin.sourceDigest && plugin.sourceDigest !== freshDigest) {
    issues.push({
      severity: "warning",
      code: "digest.drift",
      message: `Cached source digest '${plugin.sourceDigest.slice(0, 12)}\u2026' differs from fresh '${freshDigest.slice(0, 12)}\u2026'. Existing snapshots may be marked stale.`
    });
  }
  const ok = issues.every((d) => d.severity !== "error");
  return { pluginId: plugin.id, ok, issues, freshDigest };
}

// ../daemon/dist/plugins/validate.js
var EMPTY_REGISTRY = {
  skills: [],
  designSystems: [],
  craft: [],
  atoms: []
};
async function validatePluginFolder(input) {
  const folder = path.resolve(input.folder);
  const folderId = path.basename(folder).toLowerCase();
  const probe = await resolvePluginFolder({
    folder,
    folderId,
    sourceKind: "local",
    source: folder,
    trust: "restricted"
  });
  if (!probe.ok) {
    return {
      ok: false,
      resolveErrors: probe.errors,
      resolveWarnings: probe.warnings,
      folder
    };
  }
  const doctor = doctorPlugin(probe.record, input.registry ?? EMPTY_REGISTRY, {
    warnOnMissingRefs: !!input.registry,
    ...input.connectorProbe ? { connectorProbe: input.connectorProbe } : {}
  });
  return {
    ok: probe.warnings.length > 0 ? doctor.ok : doctor.ok,
    resolveErrors: [],
    resolveWarnings: probe.warnings,
    doctor,
    folder
  };
}
function flattenValidationDiagnostics(result) {
  const out = [];
  for (const err of result.resolveErrors) {
    out.push({ severity: "error", code: "manifest.resolve", message: err });
  }
  for (const warn of result.resolveWarnings) {
    out.push({ severity: "warning", code: "manifest.resolve", message: warn });
  }
  if (result.doctor) {
    for (const issue of result.doctor.issues)
      out.push(issue);
  }
  return out;
}

export {
  FIRST_PARTY_ATOMS,
  doctorPlugin,
  validatePluginFolder,
  flattenValidationDiagnostics
};
