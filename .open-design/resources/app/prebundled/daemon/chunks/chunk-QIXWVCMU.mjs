import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);

// ../daemon/dist/artifact-manifest.js
import path from "node:path";
var MANIFEST_VERSION = 1;
var MAX_TITLE_LENGTH = 200;
var MAX_ENTRY_LENGTH = 260;
var MAX_SOURCE_SKILL_ID_LENGTH = 128;
var MAX_DESIGN_SYSTEM_ID_LENGTH = 128;
var MAX_SUPPORTING_FILE_LENGTH = 260;
var MAX_SUPPORTING_FILES = 128;
var MAX_METADATA_BYTES = 16 * 1024;
var ALLOWED_KINDS = /* @__PURE__ */ new Set([
  "html",
  "deck",
  "react-component",
  "markdown-document",
  "svg",
  "diagram",
  "code-snippet",
  "mini-app",
  "design-system"
]);
var ALLOWED_RENDERERS = /* @__PURE__ */ new Set([
  "html",
  "deck-html",
  "react-component",
  "markdown",
  "svg",
  "diagram",
  "code",
  "mini-app",
  "design-system"
]);
var ALLOWED_EXPORTS = /* @__PURE__ */ new Set(["html", "pdf", "zip", "pptx", "jsx", "md", "svg", "txt"]);
var ALLOWED_STATUS = /* @__PURE__ */ new Set(["streaming", "complete", "error"]);
function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
function validateBoundedString(value, field, maxLen, { allowEmpty = false } = {}) {
  if (typeof value !== "string")
    return `${field} must be a string`;
  if (!allowEmpty && value.length === 0)
    return `${field} is required`;
  if (value.length > maxLen)
    return `${field} exceeds max length (${maxLen})`;
  return null;
}
function validateSupportingPath(value) {
  if (typeof value !== "string")
    return "supportingFiles entries must be strings";
  if (value.length === 0)
    return "supportingFiles entries cannot be empty";
  if (value.length > MAX_SUPPORTING_FILE_LENGTH) {
    return `supportingFiles entries exceed max length (${MAX_SUPPORTING_FILE_LENGTH})`;
  }
  if (/^[A-Za-z]:/.test(value) || value.startsWith("/")) {
    return "supportingFiles cannot contain absolute paths";
  }
  if (value.includes("\0"))
    return "supportingFiles cannot contain null bytes";
  const normalized = value.replace(/\\/g, "/");
  if (normalized.includes(".."))
    return "supportingFiles cannot contain traversal segments";
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length === 0 || parts.some((p) => p === "." || p === "..")) {
    return "supportingFiles cannot contain traversal segments";
  }
  return null;
}
function validateArtifactManifestInput(manifest, entry, options = {}) {
  if (manifest == null)
    return { ok: true, value: null };
  if (!isPlainObject(manifest)) {
    return { ok: false, error: "artifactManifest must be an object" };
  }
  const kindErr = validateBoundedString(manifest.kind, "artifactManifest.kind", 64);
  if (kindErr)
    return { ok: false, error: kindErr };
  if (typeof manifest.kind !== "string") {
    return { ok: false, error: "artifactManifest.kind must be a string" };
  }
  if (!ALLOWED_KINDS.has(manifest.kind)) {
    return { ok: false, error: "artifactManifest.kind is not allowed" };
  }
  const rendererErr = validateBoundedString(manifest.renderer, "artifactManifest.renderer", 64);
  if (rendererErr)
    return { ok: false, error: rendererErr };
  if (typeof manifest.renderer !== "string") {
    return { ok: false, error: "artifactManifest.renderer must be a string" };
  }
  if (!ALLOWED_RENDERERS.has(manifest.renderer)) {
    return { ok: false, error: "artifactManifest.renderer is not allowed" };
  }
  if (!Array.isArray(manifest.exports) || manifest.exports.length === 0) {
    return { ok: false, error: "artifactManifest.exports must be a non-empty array" };
  }
  for (const exp of manifest.exports) {
    if (typeof exp !== "string") {
      return { ok: false, error: "artifactManifest.exports must contain strings" };
    }
    if (!ALLOWED_EXPORTS.has(exp)) {
      return { ok: false, error: `artifactManifest.exports contains unsupported value: ${exp}` };
    }
  }
  if (manifest.status !== void 0) {
    if (typeof manifest.status !== "string") {
      return { ok: false, error: "artifactManifest.status must be a string" };
    }
    if (!ALLOWED_STATUS.has(manifest.status)) {
      return { ok: false, error: "artifactManifest.status is not allowed" };
    }
  }
  if (manifest.primary !== void 0) {
    if (manifest.primary !== true) {
      const primaryErr = validateSupportingPath(manifest.primary);
      if (primaryErr)
        return { ok: false, error: `artifactManifest.primary ${primaryErr}` };
    }
  }
  if (manifest.supportingFiles !== void 0) {
    if (!Array.isArray(manifest.supportingFiles)) {
      return { ok: false, error: "artifactManifest.supportingFiles must be an array" };
    }
    if (manifest.supportingFiles.length > MAX_SUPPORTING_FILES) {
      return {
        ok: false,
        error: `artifactManifest.supportingFiles exceeds max items (${MAX_SUPPORTING_FILES})`
      };
    }
    for (const rel of manifest.supportingFiles) {
      const relErr = validateSupportingPath(rel);
      if (relErr)
        return { ok: false, error: relErr };
    }
  }
  if (manifest.title !== void 0) {
    const titleErr = validateBoundedString(manifest.title, "artifactManifest.title", MAX_TITLE_LENGTH, { allowEmpty: false });
    if (titleErr)
      return { ok: false, error: titleErr };
  }
  if (manifest.sourceSkillId !== void 0) {
    const skillErr = validateBoundedString(manifest.sourceSkillId, "artifactManifest.sourceSkillId", MAX_SOURCE_SKILL_ID_LENGTH, { allowEmpty: true });
    if (skillErr)
      return { ok: false, error: skillErr };
  }
  if (manifest.designSystemId !== void 0 && manifest.designSystemId !== null) {
    const dsErr = validateBoundedString(manifest.designSystemId, "artifactManifest.designSystemId", MAX_DESIGN_SYSTEM_ID_LENGTH, { allowEmpty: true });
    if (dsErr)
      return { ok: false, error: dsErr };
  }
  if (manifest.metadata !== void 0) {
    if (!isPlainObject(manifest.metadata)) {
      return { ok: false, error: "artifactManifest.metadata must be a plain object" };
    }
    const serialized = JSON.stringify(manifest.metadata);
    if (typeof serialized !== "string") {
      return { ok: false, error: "artifactManifest.metadata must be JSON-serializable" };
    }
    if (Buffer.byteLength(serialized, "utf8") > MAX_METADATA_BYTES) {
      return {
        ok: false,
        error: `artifactManifest.metadata exceeds max size (${MAX_METADATA_BYTES} bytes)`
      };
    }
  }
  const safeEntry = typeof entry === "string" ? entry : "";
  if (!safeEntry || safeEntry.length > MAX_ENTRY_LENGTH) {
    return { ok: false, error: `artifact entry exceeds max length (${MAX_ENTRY_LENGTH})` };
  }
  return { ok: true, value: sanitizeManifest(manifest, safeEntry, options) };
}
function sanitizeManifest(manifest, entry, options = {}) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    version: MANIFEST_VERSION,
    kind: manifest.kind,
    title: manifest.title || entry,
    entry,
    renderer: manifest.renderer,
    status: typeof manifest.status === "string" && ALLOWED_STATUS.has(manifest.status) ? manifest.status : "complete",
    exports: manifest.exports,
    primary: manifest.primary === true ? true : typeof manifest.primary === "string" ? manifest.primary.replace(/\\/g, "/") : void 0,
    supportingFiles: Array.isArray(manifest.supportingFiles) ? manifest.supportingFiles.map((x) => String(x).replace(/\\/g, "/")) : void 0,
    createdAt: typeof manifest.createdAt === "string" ? manifest.createdAt : now,
    updatedAt: options.preserveUpdatedAt && typeof manifest.updatedAt === "string" ? manifest.updatedAt : now,
    sourceSkillId: manifest.sourceSkillId,
    designSystemId: manifest.designSystemId ?? void 0,
    metadata: manifest.metadata
  };
}
function parsePersistedManifest(raw, fallbackEntry) {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== MANIFEST_VERSION)
      return null;
    const entry = typeof parsed.entry === "string" && parsed.entry ? parsed.entry : fallbackEntry;
    const result = validateArtifactManifestInput(parsed, entry, { preserveUpdatedAt: true });
    return result.ok ? result.value : null;
  } catch {
    return null;
  }
}
function inferLegacyManifest(entry) {
  const lower = entry.toLowerCase();
  const ext = path.extname(lower);
  const isDeck = ext === ".html" && (lower.includes("deck") || lower.includes("slides") || lower.includes("pitch"));
  if (ext === ".html" || ext === ".htm") {
    return {
      version: MANIFEST_VERSION,
      kind: isDeck ? "deck" : "html",
      title: entry,
      entry,
      renderer: isDeck ? "deck-html" : "html",
      status: "complete",
      exports: isDeck ? ["html", "pdf", "pptx", "zip"] : ["html", "pdf", "zip"],
      metadata: { inferred: true }
    };
  }
  if (ext === ".md") {
    return {
      version: MANIFEST_VERSION,
      kind: "markdown-document",
      title: entry,
      entry,
      renderer: "markdown",
      status: "complete",
      exports: ["md", "html", "pdf", "zip"],
      metadata: { inferred: true }
    };
  }
  if (ext === ".svg") {
    return {
      version: MANIFEST_VERSION,
      kind: "svg",
      title: entry,
      entry,
      renderer: "svg",
      status: "complete",
      exports: ["svg", "zip"],
      metadata: { inferred: true }
    };
  }
  return null;
}

// ../daemon/dist/artifact-create.js
import { Buffer as Buffer2 } from "node:buffer";
var ArtifactManifestRequiredError = class extends Error {
  code = "ARTIFACT_MANIFEST_REQUIRED";
  constructor(name) {
    super(`artifactManifest is required for ${name}; no safe default manifest can be inferred`);
  }
};
var ArtifactManifestInvalidError = class extends Error {
  code = "ARTIFACT_MANIFEST_INVALID";
  constructor(message) {
    super(`invalid artifactManifest: ${message}`);
  }
};
function buildCreateArtifactRequestBody(input) {
  return {
    name: input.name,
    content: input.content,
    encoding: input.encoding === "base64" ? "base64" : "utf8",
    artifact: true,
    overwrite: false,
    ...input.artifactManifest === void 0 ? {} : { artifactManifest: input.artifactManifest }
  };
}
function resolveCreateArtifactManifest(input) {
  const manifest = input.artifactManifest !== void 0 && input.artifactManifest !== null ? input.artifactManifest : inferLegacyManifest(input.name);
  if (manifest) {
    const validated = validateArtifactManifestInput(manifest, input.name);
    if (!validated.ok) {
      throw new ArtifactManifestInvalidError(validated.error);
    }
    return validated.value;
  }
  throw new ArtifactManifestRequiredError(input.name);
}
async function createProjectArtifactFile(options) {
  const { input } = options;
  const body = input.encoding === "base64" ? Buffer2.from(input.content, "base64") : Buffer2.from(input.content, "utf8");
  return await options.writeProjectFile(options.projectsRoot, options.projectId, input.name, body, {
    overwrite: false,
    artifactManifest: resolveCreateArtifactManifest(input)
  }, options.metadata);
}
async function postCreateArtifactRequest(args) {
  const response = await fetch(`${args.baseUrl.replace(/\/$/, "")}/api/projects/${encodeURIComponent(args.projectId)}/files`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json"
    },
    body: JSON.stringify(buildCreateArtifactRequestBody(args.input))
  });
  const text = await response.text();
  let body = text;
  if (text.length > 0) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text };
    }
  }
  if (!response.ok) {
    const error = new Error(`daemon artifact endpoint failed with ${response.status}`);
    error.details = body;
    error.status = response.status;
    throw error;
  }
  return body;
}

export {
  validateArtifactManifestInput,
  parsePersistedManifest,
  inferLegacyManifest,
  createProjectArtifactFile,
  postCreateArtifactRequest
};
