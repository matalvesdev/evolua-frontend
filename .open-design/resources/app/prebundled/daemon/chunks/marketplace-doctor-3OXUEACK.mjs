import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);
import {
  parsePluginSpecifier,
  resolveMarketplaceEntryVersion
} from "./chunk-PYKOKXOQ.mjs";
import {
  external_exports
} from "./chunk-KRZ3KSO3.mjs";
import "./chunk-WRAIAC3Y.mjs";

// ../../packages/registry-protocol/dist/index.mjs
var RegistryBackendKindSchema = external_exports.enum(["github", "http", "local", "db"]);
var RegistryTrustSchema = external_exports.enum(["official", "trusted", "restricted"]);
var RegistryDistSchema = external_exports.object({
  type: external_exports.enum(["github-release", "https-archive", "local-archive", "database"]).optional(),
  archive: external_exports.string().min(1).optional(),
  integrity: external_exports.string().min(1).optional(),
  manifestDigest: external_exports.string().min(1).optional()
}).passthrough();
var RegistryPublisherSchema = external_exports.object({
  id: external_exports.string().min(1).optional(),
  name: external_exports.string().min(1).optional(),
  github: external_exports.string().min(1).optional(),
  url: external_exports.string().min(1).optional(),
  verified: external_exports.boolean().optional()
}).passthrough();
var RegistryMetricsSchema = external_exports.object({
  downloads: external_exports.number().int().nonnegative().optional(),
  installs: external_exports.number().int().nonnegative().optional(),
  stars: external_exports.number().int().nonnegative().optional(),
  updatedAt: external_exports.string().optional(),
  lastPublishedAt: external_exports.string().optional()
}).passthrough();
var RegistrySignatureSchema = external_exports.object({
  kind: external_exports.enum(["github-oidc", "cosign", "minisign", "custom"]),
  issuer: external_exports.string().min(1).optional(),
  subject: external_exports.string().min(1).optional(),
  signature: external_exports.string().min(1),
  certificate: external_exports.string().min(1).optional(),
  signedAt: external_exports.string().optional()
}).passthrough();
var RegistryVersionSchema = external_exports.object({
  version: external_exports.string().min(1),
  source: external_exports.string().min(1).optional(),
  ref: external_exports.string().min(1).optional(),
  dist: RegistryDistSchema.optional(),
  integrity: external_exports.string().min(1).optional(),
  manifestDigest: external_exports.string().min(1).optional(),
  deprecated: external_exports.union([external_exports.boolean(), external_exports.string()]).optional(),
  yanked: external_exports.boolean().optional(),
  yankedAt: external_exports.string().optional(),
  yankReason: external_exports.string().optional()
}).passthrough();
var RegistryEntrySchema = external_exports.object({
  name: external_exports.string().regex(/^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/),
  version: external_exports.string().min(1),
  source: external_exports.string().min(1),
  ref: external_exports.string().min(1).optional(),
  title: external_exports.string().optional(),
  description: external_exports.string().optional(),
  tags: external_exports.array(external_exports.string()).optional(),
  capabilitiesSummary: external_exports.array(external_exports.string()).optional(),
  dist: RegistryDistSchema.optional(),
  versions: external_exports.array(RegistryVersionSchema).optional(),
  distTags: external_exports.record(external_exports.string()).optional(),
  integrity: external_exports.string().min(1).optional(),
  manifestDigest: external_exports.string().min(1).optional(),
  publisher: RegistryPublisherSchema.optional(),
  homepage: external_exports.string().optional(),
  license: external_exports.string().optional(),
  deprecated: external_exports.union([external_exports.boolean(), external_exports.string()]).optional(),
  yanked: external_exports.boolean().optional(),
  yankedAt: external_exports.string().optional(),
  yankReason: external_exports.string().optional(),
  metrics: RegistryMetricsSchema.optional(),
  signatures: external_exports.array(RegistrySignatureSchema).optional()
}).passthrough();
var RegistryListFilterSchema = external_exports.object({
  query: external_exports.string().optional(),
  tags: external_exports.array(external_exports.string()).optional(),
  publisher: external_exports.string().optional(),
  includeYanked: external_exports.boolean().optional()
}).optional();
var RegistrySearchQuerySchema = external_exports.object({
  query: external_exports.string().default(""),
  tags: external_exports.array(external_exports.string()).optional(),
  limit: external_exports.number().int().positive().max(500).optional(),
  includeYanked: external_exports.boolean().optional()
});
var RegistrySearchResultSchema = external_exports.object({
  entry: RegistryEntrySchema,
  score: external_exports.number().nonnegative(),
  matched: external_exports.array(external_exports.string())
});
var ResolvedRegistryEntrySchema = external_exports.object({
  backendId: external_exports.string().min(1),
  backendKind: RegistryBackendKindSchema,
  trust: RegistryTrustSchema,
  entry: RegistryEntrySchema,
  version: RegistryVersionSchema,
  source: external_exports.string().min(1),
  ref: external_exports.string().optional(),
  integrity: external_exports.string().optional(),
  manifestDigest: external_exports.string().optional()
});
var RegistryPublishRequestSchema = external_exports.object({
  entry: RegistryEntrySchema,
  packagePath: external_exports.string().optional(),
  dryRun: external_exports.boolean().optional(),
  tag: external_exports.string().optional(),
  changelog: external_exports.string().optional()
});
var RegistryPublishOutcomeSchema = external_exports.object({
  ok: external_exports.boolean(),
  dryRun: external_exports.boolean().optional(),
  pullRequestUrl: external_exports.string().optional(),
  changedFiles: external_exports.array(external_exports.string()).default([]),
  warnings: external_exports.array(external_exports.string()).default([])
});
var RegistryDoctorIssueSchema = external_exports.object({
  severity: external_exports.enum(["error", "warning", "info"]),
  code: external_exports.string().min(1),
  message: external_exports.string().min(1),
  pluginName: external_exports.string().optional()
});
var RegistryDoctorReportSchema = external_exports.object({
  ok: external_exports.boolean(),
  backendId: external_exports.string().min(1),
  checkedAt: external_exports.number(),
  entriesChecked: external_exports.number().int().nonnegative(),
  issues: external_exports.array(RegistryDoctorIssueSchema)
});
var RegistryYankOutcomeSchema = external_exports.object({
  ok: external_exports.boolean(),
  name: external_exports.string().min(1),
  version: external_exports.string().min(1),
  reason: external_exports.string().min(1),
  pullRequestUrl: external_exports.string().optional(),
  warnings: external_exports.array(external_exports.string()).default([])
});

// ../daemon/dist/registry/static-backend.js
var StaticRegistryBackend = class {
  id;
  kind;
  trust;
  manifestData;
  constructor(options) {
    this.id = options.id;
    this.kind = options.kind ?? "http";
    this.trust = options.trust;
    this.manifestData = options.manifest;
  }
  async list() {
    return (this.getManifest().plugins ?? []).filter((entry) => !entry.yanked).flatMap((entry) => {
      const parsed = toRegistryEntry(entry);
      return parsed ? [parsed] : [];
    });
  }
  async search(input) {
    const query = RegistrySearchQuerySchema.parse(input);
    const terms = query.query.toLowerCase().split(/\s+/g).filter(Boolean);
    const tags = new Set((query.tags ?? []).map((tag) => tag.toLowerCase()));
    const entries = await this.list();
    const results = [];
    for (const entry of entries) {
      if (tags.size > 0) {
        const entryTags = new Set((entry.tags ?? []).map((tag) => tag.toLowerCase()));
        if (![...tags].every((tag) => entryTags.has(tag)))
          continue;
      }
      const haystack = [
        entry.name,
        entry.title ?? "",
        entry.description ?? "",
        ...entry.tags ?? [],
        ...entry.capabilitiesSummary ?? [],
        entry.publisher?.id ?? "",
        entry.publisher?.github ?? ""
      ].join(" ").toLowerCase();
      const matched = terms.filter((term) => haystack.includes(term));
      if (terms.length > 0 && matched.length === 0)
        continue;
      results.push({
        entry,
        score: terms.length === 0 ? 0 : matched.length / terms.length,
        matched
      });
    }
    return results.sort((left, right) => right.score - left.score || left.entry.name.localeCompare(right.entry.name)).slice(0, query.limit ?? 100);
  }
  async resolve(name, range) {
    const parsed = parsePluginSpecifier(range ? `${name}@${range}` : name);
    const entry = (this.getManifest().plugins ?? []).find((plugin) => plugin.name.toLowerCase() === parsed.name.toLowerCase());
    if (!entry)
      return null;
    const resolvedVersion = resolveMarketplaceEntryVersion(entry, parsed.range);
    if (!resolvedVersion)
      return null;
    const registryEntry = toRegistryEntry(entry);
    if (!registryEntry)
      return null;
    return {
      backendId: this.id,
      backendKind: this.kind,
      trust: this.trust,
      entry: registryEntry,
      version: {
        version: resolvedVersion.version,
        source: resolvedVersion.source,
        ref: resolvedVersion.ref,
        integrity: resolvedVersion.archiveIntegrity,
        manifestDigest: resolvedVersion.manifestDigest,
        deprecated: resolvedVersion.deprecated
      },
      source: resolvedVersion.source,
      ref: resolvedVersion.ref,
      integrity: resolvedVersion.archiveIntegrity,
      manifestDigest: resolvedVersion.manifestDigest
    };
  }
  async manifest(name, version) {
    const resolved = await this.resolve(name, version);
    return resolved?.entry ?? null;
  }
  async doctor() {
    const issues = [];
    const plugins = this.getManifest().plugins ?? [];
    for (const entry of plugins) {
      if (!/^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/.test(entry.name)) {
        issues.push({
          severity: "error",
          code: "invalid-name",
          message: "Registry plugin name must be vendor/plugin-name.",
          pluginName: entry.name
        });
      }
      if (!entry.source && !entry.dist?.archive) {
        issues.push({
          severity: "error",
          code: "missing-source",
          message: "Registry entry must provide source or dist.archive.",
          pluginName: entry.name
        });
      }
      if (!entry.license) {
        issues.push({
          severity: "warning",
          code: "missing-license",
          message: "Registry entry should declare a license.",
          pluginName: entry.name
        });
      }
      if (!entry.capabilitiesSummary || entry.capabilitiesSummary.length === 0) {
        issues.push({
          severity: "warning",
          code: "missing-capabilities",
          message: "Registry entry should summarize plugin capabilities.",
          pluginName: entry.name
        });
      }
      if (entry.yanked && !entry.yankReason) {
        issues.push({
          severity: "error",
          code: "missing-yank-reason",
          message: "Yanked entries must keep a human-readable reason.",
          pluginName: entry.name
        });
      }
    }
    return {
      ok: !issues.some((issue) => issue.severity === "error"),
      backendId: this.id,
      checkedAt: Date.now(),
      entriesChecked: plugins.length,
      issues
    };
  }
  getManifest() {
    return this.manifestData;
  }
};
function toRegistryEntry(entry) {
  const parsed = RegistryEntrySchema.safeParse({
    ...entry,
    publisher: normalizePublisher(entry.publisher)
  });
  return parsed.success ? parsed.data : null;
}
function normalizePublisher(publisher) {
  if (!publisher)
    return void 0;
  return {
    id: publisher.id,
    github: publisher.github,
    url: publisher.url
  };
}

// ../daemon/dist/plugins/marketplace-doctor.js
async function doctorMarketplace(input) {
  const backend = new StaticRegistryBackend({
    id: input.id,
    trust: input.trust,
    manifest: input.manifest
  });
  const base = await backend.doctor();
  const issues = [...base.issues];
  const names = /* @__PURE__ */ new Set();
  for (const entry of input.manifest.plugins ?? []) {
    const lower = entry.name.toLowerCase();
    if (names.has(lower)) {
      issues.push({
        severity: "error",
        code: "duplicate-name",
        message: "Registry entries must have stable unique plugin ids.",
        pluginName: entry.name
      });
    }
    names.add(lower);
    if (entry.dist?.archive && !entry.dist.integrity && !entry.integrity) {
      issues.push({
        severity: "error",
        code: "archive-integrity-required",
        message: "Archive distribution entries must include sha256 integrity.",
        pluginName: entry.name
      });
    }
    if (entry.distTags?.latest) {
      const hasLatest = (entry.versions ?? []).some((version) => version.version === entry.distTags?.latest && !version.yanked) || entry.version === entry.distTags.latest;
      if (!hasLatest) {
        issues.push({
          severity: "error",
          code: "bad-latest-tag",
          message: "distTags.latest must point at a non-yanked version.",
          pluginName: entry.name
        });
      }
    }
    const publisherId = entry.publisher?.id ?? entry.publisher?.github;
    if (!publisherId) {
      issues.push({
        severity: "warning",
        code: "missing-publisher",
        message: "Registry entry should declare publisher identity.",
        pluginName: entry.name
      });
    }
  }
  const strict = input.strict === true;
  return {
    ok: !issues.some((issue) => issue.severity === "error") && (!strict || !issues.some((issue) => issue.severity === "warning")),
    backendId: base.backendId,
    checkedAt: input.checkedAt ?? base.checkedAt,
    entriesChecked: base.entriesChecked,
    issues,
    warningsAsErrors: strict
  };
}
export {
  doctorMarketplace
};
