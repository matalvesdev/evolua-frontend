import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);
import {
  DEFAULT_MODEL_OPTION,
  antigravityAgentDef,
  clampCodexReasoning,
  detectAcpModels,
  execAgentFile,
  parseLineSeparatedModels,
  parsePiModels,
  rememberLiveModels,
  sanitizeCustomModel
} from "./chunk-VVFZL5TO.mjs";
import {
  createCommandInvocation,
  mergeProxyAwareEnv,
  resolveSystemProxyEnv,
  wellKnownUserToolchainBins
} from "./chunk-FBHBYNIK.mjs";
import {
  agentCliEnvForAgent,
  readAppConfig
} from "./chunk-2BSQKLPO.mjs";

// ../daemon/dist/memory.js
import { promises as fsp } from "node:fs";
import path from "node:path";
import { EventEmitter } from "node:events";

// ../daemon/dist/frontmatter.js
function parseFrontmatter(src) {
  const text = src.replace(/^﻿/, "");
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!match)
    return { data: {}, body: text };
  const yaml = match[1] ?? "";
  const body = match[2] ?? "";
  return { data: parseYamlSubset(yaml), body };
}
function parseYamlSubset(src) {
  const lines = src.split(/\r?\n/);
  const root = {};
  const stack = [{ indent: -1, container: root, key: null }];
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i] ?? "";
    if (/^\s*(#.*)?$/.test(raw)) {
      i++;
      continue;
    }
    const indent = raw.match(/^\s*/)?.[0].length ?? 0;
    while (stack.length > 1 && indent <= (stack[stack.length - 1]?.indent ?? -1)) {
      stack.pop();
    }
    const top = stack[stack.length - 1];
    if (!top)
      throw new Error("frontmatter parser stack invariant violated");
    const line = raw.slice(indent);
    if (line.startsWith("- ")) {
      const value = line.slice(2).trim();
      let container = top.container;
      if (!Array.isArray(container)) {
        const parent = stack[stack.length - 2];
        if (parent && top.key) {
          if (Array.isArray(parent.container)) {
            throw new Error("invalid frontmatter array nesting");
          }
          parent.container[top.key] = [];
          container = parent.container[top.key];
          top.container = container;
        } else {
          i++;
          continue;
        }
      }
      if (value.includes(":")) {
        const obj = {};
        const colonIdx = value.indexOf(":");
        const key2 = value.slice(0, colonIdx).trim();
        const valRaw = value.slice(colonIdx + 1).trim();
        if (valRaw)
          obj[key2] = coerce(valRaw);
        if (!Array.isArray(container))
          throw new Error("frontmatter array container expected");
        container.push(obj);
        stack.push({ indent, container: obj, key: null });
      } else {
        if (!Array.isArray(container))
          throw new Error("frontmatter array container expected");
        container.push(coerce(value));
      }
      i++;
      continue;
    }
    const kv = /^([^:]+):\s*(.*)$/.exec(line);
    if (!kv) {
      i++;
      continue;
    }
    const key = (kv[1] ?? "").trim();
    const val = kv[2];
    if (val === "" || val === void 0) {
      if (Array.isArray(top.container))
        throw new Error("frontmatter object container expected");
      top.container[key] = {};
      stack.push({ indent, container: top.container[key], key });
      i++;
      continue;
    }
    if (val === "|" || val === "|-" || val === ">" || val === ">-") {
      const collected = [];
      const childIndent = indent + 2;
      i++;
      while (i < lines.length) {
        const next = lines[i] ?? "";
        if (/^\s*$/.test(next)) {
          collected.push("");
          i++;
          continue;
        }
        const nIndent = next.match(/^\s*/)?.[0].length ?? 0;
        if (nIndent < childIndent)
          break;
        collected.push(next.slice(childIndent));
        i++;
      }
      if (Array.isArray(top.container))
        throw new Error("frontmatter object container expected");
      top.container[key] = collected.join("\n").trimEnd();
      continue;
    }
    if (val === "[]") {
      if (Array.isArray(top.container))
        throw new Error("frontmatter object container expected");
      top.container[key] = [];
      i++;
      continue;
    }
    if (val.startsWith("[") && val.endsWith("]")) {
      if (Array.isArray(top.container))
        throw new Error("frontmatter object container expected");
      top.container[key] = val.slice(1, -1).split(",").map((s) => coerce(s.trim())).filter((v) => v !== "");
      i++;
      continue;
    }
    if (Array.isArray(top.container))
      throw new Error("frontmatter object container expected");
    top.container[key] = coerce(val);
    i++;
  }
  return root;
}
function coerce(raw) {
  if (raw === void 0)
    return "";
  let v = raw.trim();
  if (v.startsWith('"') && v.endsWith('"') || v.startsWith("'") && v.endsWith("'")) {
    return v.slice(1, -1);
  }
  if (v === "true")
    return true;
  if (v === "false")
    return false;
  if (v === "null" || v === "~")
    return null;
  if (/^-?\d+$/.test(v))
    return Number(v);
  if (/^-?\d*\.\d+$/.test(v))
    return Number(v);
  return v;
}

// ../daemon/dist/memory-extractions.js
import { randomUUID } from "node:crypto";
var MAX_RECORDS = 20;
var PREVIEW_CAP = 120;
var ERROR_CAP = 240;
var records = [];
function trimPreview(s) {
  const text = String(s ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= PREVIEW_CAP)
    return text;
  return `${text.slice(0, PREVIEW_CAP - 1).trim()}\u2026`;
}
function trimError(s) {
  const text = String(s ?? "").replace(/\r?\n/g, " ").trim();
  if (text.length <= ERROR_CAP)
    return text;
  return `${text.slice(0, ERROR_CAP - 1).trim()}\u2026`;
}
function emit(record) {
  setImmediate(() => {
    try {
      memoryEvents.emit("extraction", { ...record });
    } catch {
    }
  });
}
function clone(record) {
  return JSON.parse(JSON.stringify(record));
}
function pushNewest(record) {
  records.unshift(record);
  if (records.length > MAX_RECORDS)
    records.length = MAX_RECORDS;
}
function startExtraction({ userMessage, kind = "llm" }) {
  const record = {
    id: randomUUID(),
    kind,
    startedAt: Date.now(),
    phase: "running",
    userMessagePreview: trimPreview(userMessage)
  };
  pushNewest(record);
  emit(record);
  return record.id;
}
function findById(id) {
  return records.find((r) => r.id === id) ?? null;
}
function markProvider(id, provider) {
  const rec = findById(id);
  if (!rec)
    return;
  rec.provider = {
    kind: provider.kind,
    model: provider.model,
    credentialSource: provider.credentialSource
  };
  emit(rec);
}
function recordSkip({ userMessage, reason, kind = "llm" }) {
  const record = {
    id: randomUUID(),
    kind,
    startedAt: Date.now(),
    finishedAt: Date.now(),
    phase: "skipped",
    reason,
    userMessagePreview: trimPreview(userMessage)
  };
  pushNewest(record);
  emit(record);
  return record.id;
}
function recordHeuristic({ userMessage, writtenCount, writtenIds }) {
  const written = Number.isFinite(writtenCount) ? Math.max(0, Math.floor(writtenCount)) : 0;
  const ids2 = Array.isArray(writtenIds) ? writtenIds.slice(0, 12) : [];
  const now = Date.now();
  const record = {
    id: randomUUID(),
    kind: "heuristic",
    startedAt: now,
    finishedAt: now,
    phase: written > 0 ? "success" : "skipped",
    userMessagePreview: trimPreview(userMessage),
    writtenCount: written,
    writtenIds: ids2,
    ...written === 0 ? { reason: "no-match" } : {}
  };
  pushNewest(record);
  emit(record);
  return record.id;
}
function markProposed(id, proposedCount) {
  const rec = findById(id);
  if (!rec)
    return;
  rec.proposedCount = proposedCount;
  emit(rec);
}
function markSuccess(id, { writtenCount, writtenIds }) {
  const rec = findById(id);
  if (!rec)
    return;
  rec.phase = "success";
  rec.writtenCount = writtenCount;
  rec.writtenIds = Array.isArray(writtenIds) ? writtenIds.slice(0, 12) : [];
  rec.finishedAt = Date.now();
  emit(rec);
}
function markFailed(id, error) {
  const rec = findById(id);
  if (!rec)
    return;
  rec.phase = "failed";
  rec.error = trimError(error?.message ?? error ?? "unknown error");
  rec.finishedAt = Date.now();
  emit(rec);
}
function listExtractions() {
  return records.map(clone);
}
function removeExtraction(id) {
  const idx = records.findIndex((r) => r.id === id);
  if (idx < 0)
    return 0;
  const [removed] = records.splice(idx, 1);
  setImmediate(() => {
    try {
      memoryEvents.emit("extraction", { ...removed, phase: "deleted" });
    } catch {
    }
  });
  return 1;
}
function clearExtractions() {
  const removed = records.length;
  records.length = 0;
  if (removed > 0) {
    setImmediate(() => {
      try {
        memoryEvents.emit("extraction", {
          id: "all",
          phase: "cleared",
          startedAt: Date.now(),
          finishedAt: Date.now()
        });
      } catch {
      }
    });
  }
  return removed;
}

// ../daemon/dist/memory.js
var memoryEvents = new EventEmitter();
memoryEvents.setMaxListeners(64);
function emitChange(event) {
  memoryEvents.emit("change", { ...event, at: Date.now() });
}
var INDEX_FILE = "MEMORY.md";
var CONFIG_FILE = ".config.json";
var VALID_TYPES = /* @__PURE__ */ new Set(["user", "feedback", "project", "reference"]);
var DEFAULT_INDEX = `# Memory

This is your auto-memory index. Each line points to a per-fact \`.md\`
file in the same folder. Lines you delete here stop being injected into
new chats; the underlying fact file stays on disk so you can paste it
back if you change your mind.

`;
function memoryDir(dataDir) {
  return path.join(dataDir, "memory");
}
async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}
function isValidType(t) {
  return typeof t === "string" && VALID_TYPES.has(t);
}
function deriveMemoryId(type, name) {
  const safeType = isValidType(type) ? type : "user";
  const raw = String(name || "");
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 48);
  if (cleaned.length > 0)
    return `${safeType}_${cleaned}`;
  let h = 2166136261 >>> 0;
  for (let i = 0; i < raw.length; i++) {
    h = (h ^ raw.charCodeAt(i)) >>> 0;
    h = Math.imul(h, 16777619) >>> 0;
  }
  return `${safeType}_n${h.toString(36)}`;
}
function entryPath(dataDir, id) {
  if (typeof id !== "string" || !/^[a-z0-9_]+$/.test(id) || id.length > 96) {
    throw new Error("invalid memory id");
  }
  return path.join(memoryDir(dataDir), `${id}.md`);
}
function indexPath(dataDir) {
  return path.join(memoryDir(dataDir), INDEX_FILE);
}
function configPath(dataDir) {
  return path.join(memoryDir(dataDir), CONFIG_FILE);
}
var VALID_EXTRACTION_PROVIDERS = /* @__PURE__ */ new Set([
  "anthropic",
  "openai",
  "azure",
  "google",
  "ollama"
]);
function normalizeExtractionPatch(input) {
  if (!input || typeof input !== "object")
    return null;
  const provider = input.provider;
  if (!VALID_EXTRACTION_PROVIDERS.has(provider))
    return null;
  const out = { provider };
  if (typeof input.model === "string" && input.model.trim()) {
    out.model = input.model.trim();
  }
  if (typeof input.baseUrl === "string" && input.baseUrl.trim()) {
    out.baseUrl = input.baseUrl.trim();
  }
  if (typeof input.apiKey === "string" && input.apiKey.trim()) {
    out.apiKey = input.apiKey.trim();
  }
  if (typeof input.apiVersion === "string" && input.apiVersion.trim()) {
    out.apiVersion = input.apiVersion.trim();
  }
  return out;
}
async function readMemoryConfig(dataDir) {
  try {
    const raw = await fsp.readFile(configPath(dataDir), "utf8");
    const parsed = JSON.parse(raw);
    return {
      enabled: parsed?.enabled !== false,
      chatExtractionEnabled: parsed?.chatExtractionEnabled !== false,
      extraction: normalizeExtractionPatch(parsed?.extraction)
    };
  } catch {
    return { enabled: true, chatExtractionEnabled: true, extraction: null };
  }
}
async function writeMemoryConfig(dataDir, patch) {
  const current = await readMemoryConfig(dataDir);
  const next = {
    enabled: typeof patch?.enabled === "boolean" ? patch.enabled : current.enabled,
    chatExtractionEnabled: typeof patch?.chatExtractionEnabled === "boolean" ? patch.chatExtractionEnabled : current.chatExtractionEnabled,
    extraction: current.extraction
  };
  if (Object.prototype.hasOwnProperty.call(patch || {}, "extraction")) {
    next.extraction = patch.extraction === null ? null : normalizeExtractionPatch(patch.extraction);
  }
  if (typeof next.enabled !== "boolean")
    next.enabled = true;
  if (typeof next.chatExtractionEnabled !== "boolean") {
    next.chatExtractionEnabled = true;
  }
  await ensureDir(memoryDir(dataDir));
  await fsp.writeFile(configPath(dataDir), JSON.stringify(next, null, 2));
  if (current.enabled !== next.enabled || current.chatExtractionEnabled !== next.chatExtractionEnabled) {
    emitChange({ kind: "config", enabled: next.enabled });
  }
  return next;
}
function maskMemoryExtractionConfig(extraction) {
  if (!extraction)
    return null;
  const apiKey = typeof extraction.apiKey === "string" ? extraction.apiKey : "";
  return {
    provider: extraction.provider,
    model: typeof extraction.model === "string" ? extraction.model : "",
    baseUrl: typeof extraction.baseUrl === "string" ? extraction.baseUrl : "",
    apiVersion: typeof extraction.apiVersion === "string" ? extraction.apiVersion : "",
    apiKeyTail: apiKey ? apiKey.slice(-4) : "",
    apiKeyConfigured: Boolean(apiKey)
  };
}
async function readMemoryIndex(dataDir) {
  try {
    return await fsp.readFile(indexPath(dataDir), "utf8");
  } catch {
    return DEFAULT_INDEX;
  }
}
async function writeMemoryIndex(dataDir, body, options) {
  await ensureDir(memoryDir(dataDir));
  await fsp.writeFile(indexPath(dataDir), String(body ?? ""));
  if (!options?.silent)
    emitChange({ kind: "index" });
}
function summarize(id, raw, mtime) {
  const { data, body } = parseFrontmatter(raw);
  const type = isValidType(data?.type) ? data.type : "user";
  return {
    summary: {
      id,
      name: typeof data?.name === "string" && data.name ? data.name : id,
      description: typeof data?.description === "string" ? data.description : "",
      type,
      updatedAt: mtime
    },
    body: typeof body === "string" ? body.trimStart() : ""
  };
}
async function listMemoryEntries(dataDir) {
  const dir = memoryDir(dataDir);
  let names = [];
  try {
    names = await fsp.readdir(dir);
  } catch {
    return [];
  }
  const out = [];
  for (const name of names) {
    if (!name.endsWith(".md"))
      continue;
    if (name === INDEX_FILE)
      continue;
    const id = name.slice(0, -3);
    if (!/^[a-z0-9_]+$/.test(id))
      continue;
    try {
      const filePath = path.join(dir, name);
      const [raw, stat] = await Promise.all([
        fsp.readFile(filePath, "utf8"),
        fsp.stat(filePath)
      ]);
      const { summary } = summarize(id, raw, stat.mtimeMs);
      out.push(summary);
    } catch {
      continue;
    }
  }
  out.sort((a, b) => b.updatedAt - a.updatedAt);
  return out;
}
var MEMORY_TREE_TYPES = ["user", "feedback", "project", "reference"];
function memoryTreeFolderId(type) {
  return `folder:${type}`;
}
function memoryTreeScopeForType(type) {
  return type === "project" ? "project" : "global";
}
function toIsoTime(ms) {
  return new Date(Number.isFinite(ms) ? ms : 0).toISOString();
}
function extractAutomationRefs(body, label) {
  const refs = /* @__PURE__ */ new Set();
  const re = new RegExp(`^${label}:\\s*([A-Za-z0-9_-]+)\\s*$`, "gim");
  let match;
  while ((match = re.exec(String(body || ""))) !== null) {
    if (match[1])
      refs.add(match[1]);
  }
  return Array.from(refs);
}
async function buildMemoryTree(dataDir) {
  const entries = await listMemoryEntries(dataDir);
  const byType = /* @__PURE__ */ new Map();
  for (const type of MEMORY_TREE_TYPES)
    byType.set(type, []);
  for (const entry of entries) {
    const list = byType.get(entry.type) ?? [];
    list.push(entry);
    byType.set(entry.type, list);
  }
  const nodes = [];
  for (const type of MEMORY_TREE_TYPES) {
    const children = byType.get(type) ?? [];
    const folderUpdatedAt = children.reduce((latest, entry) => Math.max(latest, entry.updatedAt ?? 0), 0);
    const folderId = memoryTreeFolderId(type);
    nodes.push({
      id: folderId,
      parentId: null,
      path: `/${type}`,
      name: capitalize(type),
      description: `${capitalize(type)} memory`,
      kind: "folder",
      type,
      scope: memoryTreeScopeForType(type),
      sourcePacketIds: [],
      proposalIds: [],
      createdAt: toIsoTime(folderUpdatedAt),
      updatedAt: toIsoTime(folderUpdatedAt),
      childrenCount: children.length
    });
    for (const entry of children) {
      const detail = await readMemoryEntry(dataDir, entry.id);
      const detailBody = detail?.body ?? "";
      nodes.push({
        id: entry.id,
        parentId: folderId,
        path: `/${type}/${entry.id}`,
        name: entry.name,
        description: entry.description,
        kind: "entry",
        type: entry.type,
        scope: memoryTreeScopeForType(entry.type),
        sourcePacketIds: extractAutomationRefs(detailBody, "Source packet"),
        proposalIds: extractAutomationRefs(detailBody, "Proposal"),
        createdAt: toIsoTime(entry.updatedAt),
        updatedAt: toIsoTime(entry.updatedAt),
        childrenCount: 0
      });
    }
  }
  return nodes;
}
async function readMemoryEntry(dataDir, id) {
  let raw;
  let stat;
  try {
    const filePath = entryPath(dataDir, id);
    [raw, stat] = await Promise.all([
      fsp.readFile(filePath, "utf8"),
      fsp.stat(filePath)
    ]);
  } catch {
    return null;
  }
  const { summary, body } = summarize(id, raw, stat.mtimeMs);
  return { ...summary, body };
}
function renderEntryFile(name, description, type, body) {
  const safeName = String(name || "Untitled").replace(/\r?\n/g, " ").trim();
  const safeDesc = String(description || "").replace(/\r?\n/g, " ").trim();
  const safeType = isValidType(type) ? type : "user";
  const trimmedBody = String(body || "").replace(/^\s+/, "");
  return `---
name: ${safeName}
description: ${safeDesc}
type: ${safeType}
---

${trimmedBody}
`;
}
async function updateMemoryTreeNode(dataDir, id, patch) {
  if (typeof id !== "string" || id.startsWith("folder:")) {
    throw new Error("memory tree folders are derived and cannot be edited");
  }
  const current = await readMemoryEntry(dataDir, id);
  if (!current)
    throw new Error("memory not found");
  const nextType = isValidType(patch?.type) ? patch.type : current.type;
  return upsertMemoryEntry(dataDir, {
    id,
    name: typeof patch?.name === "string" && patch.name.trim() ? patch.name : current.name,
    description: typeof patch?.description === "string" ? patch.description : current.description,
    type: nextType,
    body: typeof patch?.body === "string" ? patch.body : current.body
  });
}
async function upsertMemoryEntry(dataDir, input, options) {
  const { name, description, type, body } = input || {};
  if (!name || !isValidType(type)) {
    throw new Error("memory entry requires `name` and a valid `type`");
  }
  const id = input?.id && /^[a-z0-9_]+$/.test(input.id) ? input.id : deriveMemoryId(type, name);
  await ensureDir(memoryDir(dataDir));
  await fsp.writeFile(entryPath(dataDir, id), renderEntryFile(name, description, type, body));
  await ensureIndexHasEntry(dataDir, id, name, description);
  const entry = await readMemoryEntry(dataDir, id);
  if (!entry)
    throw new Error("failed to read memory entry after write");
  if (!options?.silent) {
    emitChange({
      kind: "upsert",
      id: entry.id,
      name: entry.name,
      description: entry.description,
      type: entry.type,
      source: options?.source ?? "manual"
    });
  }
  return entry;
}
async function deleteMemoryEntry(dataDir, id) {
  try {
    await fsp.unlink(entryPath(dataDir, id));
  } catch {
  }
  await removeIndexLine(dataDir, id);
  emitChange({ kind: "delete", id });
}
var INDEX_LINK_RE = /^\s*-\s+\[([^\]]+)\]\(([^)]+)\)(\s+—\s+(.*))?$/;
function parseIndexLinkIds(indexBody) {
  const ids2 = /* @__PURE__ */ new Set();
  for (const line of String(indexBody ?? "").split(/\r?\n/)) {
    const m = INDEX_LINK_RE.exec(line);
    if (!m)
      continue;
    const target = typeof m[2] === "string" ? m[2] : "";
    if (!target.endsWith(".md"))
      continue;
    if (target === INDEX_FILE)
      continue;
    const id = target.slice(0, -3);
    if (/^[a-z0-9_]+$/.test(id))
      ids2.add(id);
  }
  return ids2;
}
async function ensureIndexHasEntry(dataDir, id, name, description) {
  const current = await readMemoryIndex(dataDir);
  const lines = current.split(/\r?\n/);
  const link = `${id}.md`;
  const desc = String(description || "").replace(/\r?\n/g, " ").trim();
  const newLine = desc ? `- [${name}](${link}) \u2014 ${desc}` : `- [${name}](${link})`;
  let replaced = false;
  for (let i = 0; i < lines.length; i++) {
    const m = INDEX_LINK_RE.exec(lines[i] ?? "");
    if (m && m[2] === link) {
      lines[i] = newLine;
      replaced = true;
      break;
    }
  }
  if (!replaced) {
    if (lines.length > 0 && lines[lines.length - 1] !== "")
      lines.push("");
    lines.push(newLine);
  }
  await writeMemoryIndex(dataDir, lines.join("\n"), { silent: true });
}
async function removeIndexLine(dataDir, id) {
  const current = await readMemoryIndex(dataDir);
  const link = `${id}.md`;
  const lines = current.split(/\r?\n/).filter((line) => {
    const m = INDEX_LINK_RE.exec(line);
    return !m || m[2] !== link;
  });
  await writeMemoryIndex(dataDir, lines.join("\n"), { silent: true });
}
async function composeMemoryBody(dataDir) {
  const cfg = await readMemoryConfig(dataDir);
  if (!cfg.enabled)
    return "";
  const allEntries = await listMemoryEntries(dataDir);
  if (allEntries.length === 0)
    return "";
  const indexBody = await readMemoryIndex(dataDir);
  const linkedIds = parseIndexLinkIds(indexBody);
  const entries = allEntries.filter((e) => linkedIds.has(e.id));
  if (entries.length === 0)
    return "";
  const grouped = /* @__PURE__ */ new Map();
  for (const e of entries) {
    const list = grouped.get(e.type) ?? [];
    list.push(e);
    grouped.set(e.type, list);
  }
  const ordered = ["user", "feedback", "project", "reference"].filter((t) => grouped.has(t));
  const parts = [];
  for (const type of ordered) {
    parts.push(`### ${capitalize(type)}`);
    for (const e of grouped.get(type) ?? []) {
      const body = await readEntryBodyById(dataDir, e.id);
      if (!body)
        continue;
      parts.push(`- **${e.name}** \u2014 ${e.description || "(no description)"}`);
      const indented = body.trim().split(/\r?\n/).map((l) => `  ${l}`).join("\n");
      if (indented.length > 0)
        parts.push(indented);
    }
    parts.push("");
  }
  return parts.join("\n").trim();
}
async function readEntryBodyById(dataDir, id) {
  const entry = await readMemoryEntry(dataDir, id);
  return entry?.body ?? "";
}
function capitalize(s) {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}
var REMEMBER_PATTERNS = [
  // English
  {
    re: /(?:^|\b)(?:please\s+)?remember(?:\s+that)?[:\s]+([^\n]{4,400})/i,
    type: "feedback",
    name: "Remembered note",
    descriptionTemplate: "User asked to remember: $1",
    bodyTemplate: "- Remembered: $1\n\nWhen to apply: keep this in mind for future replies."
  },
  {
    re: /(?:^|\b)note\s+to\s+self[:\s]+([^\n]{4,400})/i,
    type: "feedback",
    name: "Note to self",
    descriptionTemplate: "Note: $1",
    bodyTemplate: "- Note: $1"
  },
  {
    re: /(?:^|\b)i(?:'m|\s+am)\s+(?:a|an|the)\s+([^.\n]{3,200})/i,
    type: "user",
    name: "User role",
    descriptionTemplate: "User is a $1",
    bodyTemplate: "- Role / identity: $1\n\nWhen to apply: any chat \u2014 frame examples and recommendations around this background."
  },
  {
    re: /(?:^|\b)i\s+prefer\s+([^.\n]{3,200})/i,
    type: "feedback",
    name: "User preference",
    descriptionTemplate: "User prefers $1",
    bodyTemplate: "- Preference: $1\n\nWhen to apply: factor this in whenever a relevant choice comes up."
  },
  // "I'm in Berlin", "I live in Amsterdam", "I'm based in Lisbon" — pin
  // the user's location so future replies can localise time/currency/
  // tone without re-asking. We deliberately exclude the role pattern
  // ("I am a/an/the …") so this doesn't double-fire on the same line.
  {
    re: /(?:^|\b)i(?:'m|\s+am)\s+(?:in|based\s+in|located\s+in|living\s+in)\s+([^.\n,]{2,80})/i,
    type: "user",
    name: "User location",
    descriptionTemplate: "User is based in $1",
    bodyTemplate: "- Location: $1\n\nWhen to apply: localise time-of-day phrasing, currency, and cultural references."
  },
  {
    re: /(?:^|\b)i\s+live\s+in\s+([^.\n,]{2,80})/i,
    type: "user",
    name: "User location",
    descriptionTemplate: "User lives in $1",
    bodyTemplate: "- Location: $1\n\nWhen to apply: localise time-of-day phrasing, currency, and cultural references."
  },
  // "I want to ship a course", "I'd like to redesign the dashboard" —
  // long-running goals that change how the assistant frames every
  // related ask. Capped at 200 chars so a runaway sentence doesn't blow
  // up the body.
  {
    re: /(?:^|\b)i(?:'d\s+like|\s+would\s+like|\s+want|\s+wanna|\s+hope)\s+to\s+([^.\n]{4,200})/i,
    type: "project",
    name: "User goal",
    descriptionTemplate: "User wants to $1",
    bodyTemplate: "- Goal: $1\n\nWhen to apply: surface relevance to this goal whenever the conversation drifts close to it."
  },
  // Chinese
  {
    re: /记住[:：\s]+([^\n。]{2,200})/,
    type: "feedback",
    name: "\u91CD\u8981\u5907\u5FD8",
    descriptionTemplate: "\u7528\u6237\u8981\u6C42\u8BB0\u4F4F\uFF1A$1",
    bodyTemplate: "- \u5907\u5FD8\uFF1A$1\n\n\u4F55\u65F6\u9002\u7528\uFF1A\u5728\u540E\u7EED\u5BF9\u8BDD\u91CC\u59CB\u7EC8\u4FDD\u6301\u8FD9\u4E00\u524D\u63D0\u3002"
  },
  {
    re: /我是\s*([^\n。，]{2,80})/,
    type: "user",
    name: "\u7528\u6237\u8EAB\u4EFD",
    descriptionTemplate: "\u7528\u6237\u7684\u8EAB\u4EFD/\u804C\u4E1A\uFF1A$1",
    bodyTemplate: "- \u8EAB\u4EFD / \u89D2\u8272\uFF1A$1\n\n\u4F55\u65F6\u9002\u7528\uFF1A\u5728\u6240\u6709\u5BF9\u8BDD\u91CC\u628A\u7528\u6237\u7684\u80CC\u666F\u7EB3\u5165\u8003\u8651\uFF08\u4E3E\u4F8B\u3001\u63AA\u8F9E\u3001\u6DF1\u5EA6\uFF09\u3002"
  },
  {
    re: /我喜欢\s*([^\n。，]{2,200})/,
    type: "feedback",
    name: "\u7528\u6237\u504F\u597D",
    descriptionTemplate: "\u7528\u6237\u559C\u6B22\uFF1A$1",
    bodyTemplate: "- \u504F\u597D\uFF1A$1\n\n\u4F55\u65F6\u9002\u7528\uFF1A\u5728\u6D89\u53CA\u8BE5\u9009\u62E9\u65F6\u4F18\u5148\u91C7\u7528\u8FD9\u4E00\u503E\u5411\u3002"
  },
  {
    re: /我偏好\s*([^\n。，]{2,200})/,
    type: "feedback",
    name: "\u7528\u6237\u504F\u597D",
    descriptionTemplate: "\u7528\u6237\u504F\u597D\uFF1A$1",
    bodyTemplate: "- \u504F\u597D\uFF1A$1\n\n\u4F55\u65F6\u9002\u7528\uFF1A\u5728\u6D89\u53CA\u8BE5\u9009\u62E9\u65F6\u4F18\u5148\u91C7\u7528\u8FD9\u4E00\u503E\u5411\u3002"
  },
  // 我在 / 我住在 — 用户所在地。用 [在再] 同时容忍输入法常见的把
  // "在" 错按成 "再" 的拼写：用户原文 "我再德国，我希望基于…" 在过去
  // 的 pattern 表里没有任何匹配，于是只能等 LLM 兜底；现在两条都直接
  // 命中所在地与目标。
  {
    re: /我[在再]\s*([^\n。，！？!?,]{2,80})/,
    type: "user",
    name: "\u7528\u6237\u6240\u5728\u5730",
    descriptionTemplate: "\u7528\u6237\u6240\u5728\u5730\uFF1A$1",
    bodyTemplate: "- \u6240\u5728\u5730\uFF1A$1\n\n\u4F55\u65F6\u9002\u7528\uFF1A\u5728\u65F6\u533A\u3001\u8D27\u5E01\u3001\u6587\u5316\u8BED\u5883\u76F8\u5173\u7684\u56DE\u7B54\u91CC\u628A\u8FD9\u4E00\u70B9\u7EB3\u5165\u8003\u8651\u3002"
  },
  {
    re: /我住在\s*([^\n。，！？!?,]{2,80})/,
    type: "user",
    name: "\u7528\u6237\u6240\u5728\u5730",
    descriptionTemplate: "\u7528\u6237\u5C45\u4F4F\u5728\uFF1A$1",
    bodyTemplate: "- \u6240\u5728\u5730\uFF1A$1\n\n\u4F55\u65F6\u9002\u7528\uFF1A\u5728\u65F6\u533A\u3001\u8D27\u5E01\u3001\u6587\u5316\u8BED\u5883\u76F8\u5173\u7684\u56DE\u7B54\u91CC\u628A\u8FD9\u4E00\u70B9\u7EB3\u5165\u8003\u8651\u3002"
  },
  // 我想 / 我希望 / 我打算 — 长期目标，常常贯穿多次对话。和"记住"
  // 这种命令式不同，这些表述往往伴随项目本身，所以归到 project 类。
  {
    re: /我(?:想|希望|打算|计划)\s*([^\n。！？!?]{4,200})/,
    type: "project",
    name: "\u7528\u6237\u76EE\u6807",
    descriptionTemplate: "\u7528\u6237\u5E0C\u671B\uFF1A$1",
    bodyTemplate: "- \u76EE\u6807\uFF1A$1\n\n\u4F55\u65F6\u9002\u7528\uFF1A\u5F53\u5BF9\u8BDD\u9760\u8FD1\u8FD9\u4E00\u76EE\u6807\u65F6\u4E3B\u52A8\u547C\u5E94\u5B83\uFF0C\u5E76\u628A\u5EFA\u8BAE\u4E0E\u76EE\u6807\u5BF9\u9F50\u3002"
  },
  {
    re: /备忘[:：\s]+([^\n]{2,200})/,
    type: "reference",
    name: "\u901F\u8BB0\u5907\u5FD8",
    descriptionTemplate: "$1",
    bodyTemplate: "- $1"
  }
];
function applyTemplate(template, captured) {
  return String(template || "").replace(/\$1/g, String(captured));
}
async function extractFromMessage(dataDir, userMessage) {
  if (typeof userMessage !== "string" || userMessage.trim().length === 0) {
    recordSkip({ userMessage: userMessage ?? "", reason: "empty-message", kind: "heuristic" });
    return [];
  }
  const cfg = await readMemoryConfig(dataDir);
  if (!cfg.enabled) {
    recordSkip({ userMessage, reason: "memory-disabled", kind: "heuristic" });
    return [];
  }
  if (!cfg.chatExtractionEnabled) {
    return [];
  }
  const seen = /* @__PURE__ */ new Set();
  const changed = [];
  for (const pattern of REMEMBER_PATTERNS) {
    const m = pattern.re.exec(userMessage);
    if (!m)
      continue;
    const captured = (m[1] || "").trim();
    if (captured.length < 3)
      continue;
    const trimmedCaptured = truncate(captured, 200);
    const dedupeKey = `${pattern.type}::${pattern.name}::${trimmedCaptured.toLowerCase()}`;
    if (seen.has(dedupeKey))
      continue;
    seen.add(dedupeKey);
    const description = truncate(applyTemplate(pattern.descriptionTemplate, trimmedCaptured), 200);
    const body = applyTemplate(pattern.bodyTemplate, trimmedCaptured);
    const id = deriveMemoryId(pattern.type, trimmedCaptured);
    try {
      const entry = await upsertMemoryEntry(
        dataDir,
        {
          id,
          type: pattern.type,
          name: pattern.name,
          description,
          body
        },
        // Silence the per-entry upsert event so the batched 'extract'
        // emit below produces exactly one frontend toast.
        { silent: true, source: "heuristic" }
      );
      changed.push({
        id: entry.id,
        name: entry.name,
        description: entry.description,
        type: entry.type,
        updatedAt: entry.updatedAt
      });
    } catch (err) {
      console.warn("[memory] auto-extract write failed", err);
    }
  }
  if (changed.length > 0) {
    emitChange({
      kind: "extract",
      count: changed.length,
      source: "heuristic"
    });
  }
  recordHeuristic({
    userMessage,
    writtenCount: changed.length,
    writtenIds: changed.map((c) => c.id)
  });
  return changed;
}
function truncate(s, max) {
  if (s.length <= max)
    return s;
  return `${s.slice(0, max - 1).trim()}\u2026`;
}

// ../daemon/dist/media-config.js
import { mkdir as mkdir3, readFile as readFile3, writeFile as writeFile3 } from "node:fs/promises";
import os2 from "node:os";
import path5 from "node:path";

// ../daemon/dist/media-models.js
var MEDIA_PROVIDERS = [
  { id: "openai", label: "OpenAI", hint: "gpt-image-2 / dall-e-3", integrated: true, defaultBaseUrl: "https://api.openai.com/v1" },
  { id: "volcengine", label: "Volcengine Ark (Doubao)", hint: "Seedance 2.0 / Seedream", integrated: true, defaultBaseUrl: "https://ark.cn-beijing.volces.com/api/v3" },
  { id: "grok", label: "xAI Grok Imagine", hint: "grok-imagine \u2014 image + video with native audio", integrated: true, defaultBaseUrl: "https://api.x.ai/v1" },
  { id: "hyperframes", label: "HyperFrames", hint: "Local HTML -> MP4 renderer", integrated: true, credentialsRequired: false, settingsVisible: false },
  { id: "nanobanana", label: "Nano Banana", hint: "Google official by default; custom gateway configurable", integrated: true, defaultBaseUrl: "https://generativelanguage.googleapis.com", supportsCustomModel: true },
  { id: "imagerouter", label: "ImageRouter", hint: "OpenAI-compatible image + video routing", integrated: true, defaultBaseUrl: "https://api.imagerouter.io/v1/openai", docsUrl: "https://docs.imagerouter.io/api-reference/image-generation/", supportsCustomModel: true, customModelPlaceholder: "openai/gpt-image-2 or xAI/grok-imagine-video" },
  { id: "custom-image", label: "Custom Image API", hint: "OpenAI-compatible images/generations + images/edits (local or cloud)", integrated: true, docsUrl: "https://platform.openai.com/docs/api-reference/images", supportsCustomModel: true, customModelPlaceholder: "my-image-model" },
  { id: "comfyui", label: "ComfyUI", hint: "Local JSON workflow server (planned adapter)", integrated: false, defaultBaseUrl: "http://127.0.0.1:8188", docsUrl: "https://docs.comfy.org/development/core-concepts/workflow" },
  { id: "bfl", label: "Black Forest Labs", hint: "FLUX 1.1 Pro / FLUX Pro / Dev", integrated: false, defaultBaseUrl: "https://api.bfl.ai" },
  { id: "fal", label: "Fal.ai", hint: "Sora / Seedance / Veo / FLUX", integrated: false, defaultBaseUrl: "https://fal.run" },
  { id: "leonardo", label: "Leonardo.ai", hint: "Phoenix / Kino XL / FLUX", integrated: true, credentialsRequired: true, settingsVisible: true, defaultBaseUrl: "https://cloud.leonardo.ai/api/rest/v1" },
  { id: "replicate", label: "Replicate", hint: "FLUX / SDXL / Ideogram", integrated: false, defaultBaseUrl: "https://api.replicate.com" },
  { id: "google", label: "Google AI / Vertex", hint: "Imagen 4 / Veo 3 / Lyria", integrated: false },
  { id: "kling", label: "Kuaishou Kling", hint: "Kling 1.6 / 2.0 video", integrated: false },
  { id: "midjourney", label: "Midjourney (proxy)", hint: "midjourney-v7", integrated: false },
  { id: "minimax", label: "MiniMax", hint: "TTS / video-01", integrated: true, defaultBaseUrl: "https://api.minimaxi.chat/v1" },
  { id: "suno", label: "Suno", hint: "Music generation", integrated: false },
  { id: "udio", label: "Udio", hint: "Music generation", integrated: false },
  {
    id: "elevenlabs",
    label: "ElevenLabs",
    hint: "Voice / SFX",
    integrated: true,
    defaultBaseUrl: "https://api.elevenlabs.io",
    docsUrl: "https://elevenlabs.io/app/settings/api-keys"
  },
  { id: "fishaudio", label: "FishAudio", hint: "Speech / voice clone", integrated: true, defaultBaseUrl: "https://api.fish.audio" },
  {
    id: "senseaudio",
    label: "SenseAudio",
    hint: "",
    integrated: true,
    defaultBaseUrl: "https://api.senseaudio.cn",
    docsUrl: "https://docs.senseaudio.cn"
  },
  { id: "tavily", label: "Tavily Search", hint: "Agent-callable web research", integrated: true, defaultBaseUrl: "https://api.tavily.com" },
  { id: "stub", label: "Stub (placeholder)", hint: "Deterministic local placeholder bytes", integrated: true }
];
var IMAGE_MODELS = [
  { id: "gpt-image-2", label: "gpt-image-2", hint: "OpenAI \xB7 4K, native multimodal", provider: "openai", caps: ["t2i", "i2i", "inpaint"], default: true },
  { id: "gpt-image-1.5", label: "gpt-image-1.5", hint: "OpenAI \xB7 4\xD7 faster than gpt-image-1", provider: "openai", caps: ["t2i", "i2i", "inpaint"] },
  { id: "gpt-image-1", label: "gpt-image-1", hint: "OpenAI \xB7 ChatGPT native", provider: "openai", caps: ["t2i", "i2i", "inpaint"] },
  { id: "gpt-image-1-mini", label: "gpt-image-1-mini", hint: "OpenAI \xB7 low-cost variant", provider: "openai", caps: ["t2i", "i2i"] },
  { id: "dall-e-3", label: "dall-e-3", hint: "OpenAI \xB7 classic", provider: "openai", caps: ["t2i"] },
  { id: "dall-e-2", label: "dall-e-2", hint: "OpenAI \xB7 legacy", provider: "openai", caps: ["t2i"] },
  { id: "doubao-seedream-3-0-t2i-250415", label: "seedream-3.0", hint: "ByteDance \xB7 Doubao image", provider: "volcengine", caps: ["t2i"] },
  { id: "doubao-seededit-3-0-i2i-250628", label: "seededit-3.0", hint: "ByteDance \xB7 image edit", provider: "volcengine", caps: ["i2i"] },
  { id: "senseaudio-image-2.0-260319", label: "senseaudio-image-2.0", hint: "SenseAudio \xB7 multi-aspect, latest", provider: "senseaudio", caps: ["t2i", "i2i"] },
  { id: "senseaudio-image-1.0-260319", label: "senseaudio-image-1.0", hint: "SenseAudio \xB7 standard", provider: "senseaudio", caps: ["t2i", "i2i"] },
  { id: "doubao-seedream-5-0-260128", label: "seedream-5.0", hint: "SenseAudio \xB7 ByteDance Seedream 5.0 hi-res", provider: "senseaudio", caps: ["t2i", "i2i"] },
  { id: "grok-imagine-image", label: "grok-imagine-image", hint: "xAI \xB7 2K text-to-image", provider: "grok", caps: ["t2i"] },
  { id: "gemini-3.1-flash-image-preview", label: "nano-banana-2", hint: "Nano Banana \xB7 text-to-image", provider: "nanobanana", caps: ["t2i"] },
  { id: "openai/gpt-image-2", label: "openai/gpt-image-2", hint: "ImageRouter \xB7 routed GPT Image", provider: "imagerouter", caps: ["t2i"] },
  { id: "openai/gpt-image-1.5", label: "openai/gpt-image-1.5", hint: "ImageRouter \xB7 routed GPT Image", provider: "imagerouter", caps: ["t2i"] },
  { id: "black-forest-labs/FLUX-1.1-pro", label: "FLUX-1.1-pro", hint: "ImageRouter \xB7 Black Forest Labs", provider: "imagerouter", caps: ["t2i"] },
  { id: "custom-image", label: "custom-image", hint: "Custom \xB7 OpenAI-compatible endpoint", provider: "custom-image", caps: ["t2i", "i2i"] },
  { id: "flux-1.1-pro", label: "flux-1.1-pro", hint: "BFL \xB7 flagship", provider: "bfl", caps: ["t2i", "i2i"] },
  { id: "flux-pro", label: "flux-pro", hint: "BFL", provider: "bfl", caps: ["t2i"] },
  { id: "flux-dev", label: "flux-dev", hint: "BFL \xB7 open weights", provider: "bfl", caps: ["t2i"] },
  { id: "flux-schnell", label: "flux-schnell", hint: "BFL \xB7 fast", provider: "bfl", caps: ["t2i"] },
  { id: "flux-kontext-pro", label: "flux-kontext-pro", hint: "BFL \xB7 in-context edits", provider: "bfl", caps: ["t2i", "i2i"] },
  { id: "imagen-4", label: "imagen-4", hint: "Google \xB7 latest", provider: "google", caps: ["t2i"] },
  { id: "imagen-3", label: "imagen-3", hint: "Google", provider: "google", caps: ["t2i"] },
  { id: "gemini-3-pro-image-preview", label: "gemini-3-pro-image", hint: "Google \xB7 Nano Banana Pro", provider: "google", caps: ["t2i", "i2i"] },
  { id: "ideogram-v2", label: "ideogram-v2", hint: "Replicate \xB7 typography", provider: "replicate", caps: ["t2i"] },
  { id: "sdxl", label: "stable-diffusion-xl", hint: "Replicate \xB7 SDXL", provider: "replicate", caps: ["t2i"] },
  { id: "sd-3.5", label: "stable-diffusion-3.5", hint: "Fal \xB7 SD 3.5", provider: "fal", caps: ["t2i"] },
  { id: "leonardo-phoenix", label: "Phoenix", hint: "Leonardo \xB7 versatile", provider: "leonardo", caps: ["t2i"] },
  { id: "leonardo-kino-xl", label: "Kino XL", hint: "Leonardo \xB7 cinematic", provider: "leonardo", caps: ["t2i"] },
  { id: "leonardo-flux-dev", label: "FLUX Dev", hint: "Leonardo \xB7 FLUX", provider: "leonardo", caps: ["t2i"] },
  { id: "leonardo-flux-schnell", label: "FLUX Schnell", hint: "Leonardo \xB7 fast", provider: "leonardo", caps: ["t2i"] },
  { id: "leonardo-anime-pastel", label: "Anime Pastel Dream", hint: "Leonardo \xB7 anime", provider: "leonardo", caps: ["t2i"] },
  { id: "midjourney-v7", label: "midjourney-v7", hint: "Midjourney \xB7 via proxy", provider: "midjourney", caps: ["t2i"] }
];
var VIDEO_MODELS = [
  { id: "doubao-seedance-2-0-260128", label: "seedance-2.0", hint: "ByteDance \xB7 t2v + i2v + audio", provider: "volcengine", caps: ["t2v", "i2v", "audio"], default: true },
  { id: "doubao-seedance-2-0-fast-260128", label: "seedance-2.0-fast", hint: "ByteDance \xB7 faster, cheaper", provider: "volcengine", caps: ["t2v", "i2v", "audio"] },
  { id: "doubao-seedance-1-0-pro-250528", label: "seedance-1.0-pro", hint: "ByteDance \xB7 1.0", provider: "volcengine", caps: ["t2v", "i2v"] },
  { id: "doubao-seedance-1-0-lite-i2v-250428", label: "seedance-1.0-lite-i2v", hint: "ByteDance \xB7 image-to-video", provider: "volcengine", caps: ["i2v"] },
  { id: "doubao-seedance-1-0-lite-t2v-250428", label: "seedance-1.0-lite-t2v", hint: "ByteDance \xB7 text-to-video", provider: "volcengine", caps: ["t2v"] },
  { id: "grok-imagine-video", label: "grok-imagine-video", hint: "xAI \xB7 720p t2v + i2v + native audio", provider: "grok", caps: ["t2v", "i2v", "audio"] },
  { id: "xAI/grok-imagine-video", label: "xAI/grok-imagine-video", hint: "ImageRouter \xB7 routed video", provider: "imagerouter", caps: ["t2v", "audio"] },
  { id: "bytedance/seedance-1.5-pro", label: "seedance-1.5-pro", hint: "ImageRouter \xB7 Bytedance", provider: "imagerouter", caps: ["t2v"] },
  { id: "google/veo-3.1-lite", label: "veo-3.1-lite", hint: "ImageRouter \xB7 Google", provider: "imagerouter", caps: ["t2v"] },
  { id: "kling-2.0", label: "kling-2.0", hint: "Kuaishou \xB7 latest", provider: "kling", caps: ["t2v", "i2v"] },
  { id: "kling-1.6", label: "kling-1.6", hint: "Kuaishou", provider: "kling", caps: ["t2v", "i2v"] },
  { id: "kling-1.5", label: "kling-1.5", hint: "Kuaishou", provider: "kling", caps: ["t2v", "i2v"] },
  { id: "veo-3", label: "veo-3", hint: "Google \xB7 sound-on", provider: "google", caps: ["t2v", "audio"] },
  { id: "veo-2", label: "veo-2", hint: "Google", provider: "google", caps: ["t2v"] },
  { id: "sora-2", label: "sora-2", hint: "OpenAI \xB7 via Fal", provider: "fal", caps: ["t2v"] },
  { id: "sora-2-pro", label: "sora-2-pro", hint: "OpenAI \xB7 via Fal", provider: "fal", caps: ["t2v"] },
  { id: "minimax-video-01", label: "video-01", hint: "MiniMax \xB7 Hailuo", provider: "minimax", caps: ["t2v", "i2v"] },
  { id: "hyperframes-html", label: "hyperframes-html", hint: "HyperFrames \xB7 local HTML renderer", provider: "hyperframes", caps: ["t2v"] }
];
var AUDIO_MODELS_BY_KIND = {
  music: [
    { id: "suno-v5", label: "suno-v5", hint: "Suno \xB7 default", provider: "suno", caps: ["music"], default: true },
    { id: "suno-v4-5", label: "suno-v4.5", hint: "Suno", provider: "suno", caps: ["music"] },
    { id: "udio-v2", label: "udio-v2", hint: "Udio", provider: "udio", caps: ["music"] },
    { id: "lyria-2", label: "lyria-2", hint: "Google", provider: "google", caps: ["music"] }
  ],
  speech: [
    { id: "minimax-tts", label: "minimax-tts", hint: "MiniMax", provider: "minimax", caps: ["tts"], default: true },
    { id: "fish-speech-2", label: "fish-speech-2", hint: "FishAudio", provider: "fishaudio", caps: ["tts", "voice-clone"] },
    { id: "elevenlabs-v3", label: "elevenlabs-v3", hint: "ElevenLabs", provider: "elevenlabs", caps: ["tts", "voice-clone"] },
    { id: "senseaudio-tts", label: "senseaudio-tts", hint: "SenseAudio", provider: "senseaudio", caps: ["tts", "voice-clone"] },
    { id: "doubao-tts", label: "doubao-tts", hint: "Volcengine", provider: "volcengine", caps: ["tts"] },
    { id: "gpt-4o-mini-tts", label: "gpt-4o-mini-tts", hint: "OpenAI", provider: "openai", caps: ["tts"] },
    // xAI TTS — multilingual; uses the same SuperGrok OAuth as image / video.
    { id: "grok-tts", label: "grok-tts", hint: "xAI \xB7 multilingual \xB7 uses Grok subscription", provider: "grok", caps: ["tts"] }
  ],
  sfx: [
    { id: "elevenlabs-sfx", label: "elevenlabs-sfx", hint: "ElevenLabs SFX", provider: "elevenlabs", caps: ["sfx"], default: true },
    { id: "audiocraft", label: "audiocraft", hint: "Meta \xB7 open", provider: "replicate", caps: ["sfx", "music"] }
  ]
};
var MEDIA_ASPECTS = ["1:1", "16:9", "9:16", "4:3", "3:4"];
var VIDEO_LENGTHS_SEC = [3, 5, 8, 10, 15, 30];
var AUDIO_DURATIONS_SEC = [5, 10, 15, 30, 60, 120];
function findMediaModel(id) {
  const all = [
    ...IMAGE_MODELS,
    ...VIDEO_MODELS,
    ...AUDIO_MODELS_BY_KIND.music,
    ...AUDIO_MODELS_BY_KIND.speech,
    ...AUDIO_MODELS_BY_KIND.sfx
  ];
  return all.find((m) => m.id === id) || null;
}
function findProvider(id) {
  return MEDIA_PROVIDERS.find((p) => p.id === id) || null;
}
function modelsForSurface(surface, audioKind) {
  if (surface === "image")
    return IMAGE_MODELS;
  if (surface === "video")
    return VIDEO_MODELS;
  if (surface === "audio") {
    const k = audioKind || "music";
    return AUDIO_MODELS_BY_KIND[k] || AUDIO_MODELS_BY_KIND.music;
  }
  return [];
}

// ../daemon/dist/home-expansion.js
import os from "node:os";
import path2 from "node:path";
var HOME_BARE_TOKENS = /* @__PURE__ */ new Set(["~", "$HOME", "${HOME}"]);
var HOME_PREFIX_RE = /^(~|\$\{HOME\}|\$HOME)[/\\](.*)$/;
function expandHomePrefix(raw) {
  const home = os.homedir();
  if (HOME_BARE_TOKENS.has(raw))
    return home;
  const match = HOME_PREFIX_RE.exec(raw);
  if (match)
    return path2.join(home, match[2] ?? "");
  return raw;
}
function resolveProjectRelativePath(raw, projectRoot) {
  const expanded = expandHomePrefix(raw);
  return path2.isAbsolute(expanded) ? expanded : path2.resolve(projectRoot, expanded);
}

// ../daemon/dist/mcp-oauth.js
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { createHash, randomBytes } from "node:crypto";
import path3 from "node:path";
var VERIFIER_LEN = 64;
function base64url(buf) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function generateCodeVerifier() {
  return base64url(randomBytes(VERIFIER_LEN));
}
function deriveCodeChallenge(verifier) {
  return base64url(createHash("sha256").update(verifier).digest());
}
function generateState() {
  return base64url(randomBytes(32));
}
async function discoverProtectedResource(resourceUrl, fetchImpl = fetch) {
  let parsed;
  try {
    parsed = new URL(resourceUrl);
  } catch {
    return null;
  }
  const candidates = [
    new URL(`/.well-known/oauth-protected-resource${parsed.pathname.replace(/\/+$/u, "")}`, `${parsed.protocol}//${parsed.host}`).toString(),
    new URL("/.well-known/oauth-protected-resource", `${parsed.protocol}//${parsed.host}`).toString()
  ];
  for (const url of candidates) {
    const json = await fetchJson(url, fetchImpl);
    if (json)
      return json;
  }
  return null;
}
async function discoverAuthServer(issuer, fetchImpl = fetch) {
  let parsed;
  try {
    parsed = new URL(issuer);
  } catch {
    return null;
  }
  const trimmed = parsed.pathname.replace(/\/+$/u, "");
  const base = `${parsed.protocol}//${parsed.host}`;
  const candidates = [
    `${base}/.well-known/oauth-authorization-server${trimmed}`,
    `${base}/.well-known/openid-configuration${trimmed}`,
    `${base}/.well-known/oauth-authorization-server`,
    `${base}/.well-known/openid-configuration`
  ];
  for (const url of candidates) {
    const json = await fetchJson(url, fetchImpl);
    if (json && typeof json.authorization_endpoint === "string" && typeof json.token_endpoint === "string") {
      return { ...json, issuer: json.issuer ?? issuer };
    }
  }
  return null;
}
async function fetchJson(url, fetchImpl) {
  try {
    const res = await fetchImpl(url, {
      headers: { accept: "application/json" }
    });
    if (!res.ok)
      return null;
    return await res.json();
  } catch {
    return null;
  }
}
function clientsFile(dataDir) {
  return path3.join(dataDir, "mcp-oauth-clients.json");
}
async function readClientCache(dataDir) {
  try {
    const raw = await readFile(clientsFile(dataDir), "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.clients))
      return { clients: [] };
    return { clients: parsed.clients.filter(isRegisteredClient) };
  } catch (err) {
    const e = err;
    if (e.code === "ENOENT")
      return { clients: [] };
    throw err;
  }
}
function isRegisteredClient(v) {
  if (!v || typeof v !== "object")
    return false;
  const r = v;
  return typeof r.authServerIssuer === "string" && typeof r.redirectUri === "string" && typeof r.clientId === "string";
}
async function writeClientCache(dataDir, next) {
  const file = clientsFile(dataDir);
  await mkdir(path3.dirname(file), { recursive: true });
  const tmp = file + "." + randomBytes(4).toString("hex") + ".tmp";
  await writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
  await rename(tmp, file);
}
async function registerClient(registrationEndpoint, redirectUri, fetchImpl = fetch) {
  const body = {
    redirect_uris: [redirectUri],
    token_endpoint_auth_method: "none",
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    client_name: "Open Design",
    application_type: "web"
  };
  const res = await fetchImpl(registrationEndpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const txt = await safeText(res);
    throw new Error(`dynamic client registration failed: HTTP ${res.status} ${res.statusText} ${txt}`);
  }
  const json = await res.json();
  if (!json.client_id) {
    throw new Error("dynamic client registration response missing client_id");
  }
  const out = { clientId: json.client_id };
  if (json.client_secret)
    out.clientSecret = json.client_secret;
  return out;
}
async function getOrRegisterClient(dataDir, authServer, redirectUri, fetchImpl = fetch) {
  const cache = await readClientCache(dataDir);
  const cached = cache.clients.find((c) => c.authServerIssuer === authServer.issuer && c.redirectUri === redirectUri);
  if (cached)
    return cached;
  if (!authServer.registration_endpoint) {
    throw new Error(`auth server ${authServer.issuer} does not advertise a registration_endpoint and no client is pre-registered`);
  }
  const reg = await registerClient(authServer.registration_endpoint, redirectUri, fetchImpl);
  const next = {
    authServerIssuer: authServer.issuer,
    redirectUri,
    clientId: reg.clientId,
    registeredAt: Date.now()
  };
  if (reg.clientSecret)
    next.clientSecret = reg.clientSecret;
  cache.clients.push(next);
  await writeClientCache(dataDir, cache);
  return next;
}
function buildAuthorizeUrl(input) {
  const u = new URL(input.authServer.authorization_endpoint);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("client_id", input.clientId);
  u.searchParams.set("redirect_uri", input.redirectUri);
  u.searchParams.set("state", input.state);
  u.searchParams.set("code_challenge", input.codeChallenge);
  u.searchParams.set("code_challenge_method", "S256");
  if (input.scope)
    u.searchParams.set("scope", input.scope);
  if (input.resource)
    u.searchParams.set("resource", input.resource);
  return u.toString();
}
async function exchangeCodeForToken(input, fetchImpl = fetch) {
  const form = new URLSearchParams();
  form.set("grant_type", "authorization_code");
  form.set("code", input.code);
  form.set("redirect_uri", input.redirectUri);
  form.set("client_id", input.clientId);
  form.set("code_verifier", input.codeVerifier);
  if (input.resource)
    form.set("resource", input.resource);
  return tokenRequest(input.tokenEndpoint, form, input.clientSecret, fetchImpl);
}
async function refreshAccessToken(input, fetchImpl = fetch) {
  const form = new URLSearchParams();
  form.set("grant_type", "refresh_token");
  form.set("refresh_token", input.refreshToken);
  form.set("client_id", input.clientId);
  if (input.scope)
    form.set("scope", input.scope);
  if (input.resource)
    form.set("resource", input.resource);
  return tokenRequest(input.tokenEndpoint, form, input.clientSecret, fetchImpl);
}
async function tokenRequest(tokenEndpoint, form, clientSecret, fetchImpl) {
  const headers = {
    "content-type": "application/x-www-form-urlencoded",
    accept: "application/json"
  };
  if (clientSecret) {
    const basic = Buffer.from(`${form.get("client_id")}:${clientSecret}`).toString("base64");
    headers["authorization"] = `Basic ${basic}`;
  }
  const res = await fetchImpl(tokenEndpoint, {
    method: "POST",
    headers,
    body: form.toString()
  });
  if (!res.ok) {
    const txt = await safeText(res);
    throw new Error(`token endpoint rejected request: HTTP ${res.status} ${res.statusText} ${txt}`);
  }
  const json = await res.json();
  if (!json.access_token) {
    throw new Error("token endpoint response missing access_token");
  }
  return json;
}
async function safeText(res) {
  try {
    const t = await res.text();
    return t.slice(0, 500);
  } catch {
    return "";
  }
}
var PendingAuthCache = class {
  ttlMs;
  store = /* @__PURE__ */ new Map();
  timer = null;
  constructor(ttlMs = 10 * 60 * 1e3) {
    this.ttlMs = ttlMs;
  }
  put(state, value) {
    this.store.set(state, value);
    this.startSweeper();
  }
  /** One-shot consume — any successful callback removes the state so a
   * replay can't reuse it. */
  consume(state) {
    const v = this.store.get(state);
    if (!v)
      return null;
    this.store.delete(state);
    if (Date.now() - v.createdAt > this.ttlMs)
      return null;
    return v;
  }
  size() {
    return this.store.size;
  }
  /** Stop the background sweeper. Used by tests; production lets the
   * timer ride on the daemon process lifetime. */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  startSweeper() {
    if (this.timer)
      return;
    this.timer = setInterval(() => this.sweep(), Math.min(this.ttlMs, 6e4));
    if (typeof this.timer === "object" && this.timer && typeof this.timer.unref === "function") {
      this.timer.unref();
    }
  }
  sweep() {
    const now = Date.now();
    for (const [k, v] of this.store) {
      if (now - v.createdAt > this.ttlMs)
        this.store.delete(k);
    }
    if (this.store.size === 0 && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
};
async function beginAuth(input) {
  const fetchImpl = input.fetchImpl ?? fetch;
  const prm = await discoverProtectedResource(input.serverUrl, fetchImpl);
  const issuerHint = prm?.authorization_servers?.[0];
  const issuer = issuerHint ?? new URL(input.serverUrl).origin;
  const authServer = await discoverAuthServer(issuer, fetchImpl);
  if (!authServer) {
    throw new Error(`could not discover OAuth metadata for ${issuer}`);
  }
  const client = await getOrRegisterClient(input.dataDir, authServer, input.redirectUri, fetchImpl);
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = deriveCodeChallenge(codeVerifier);
  const state = generateState();
  const scope = input.scope ?? (Array.isArray(prm?.scopes_supported) && prm.scopes_supported.length > 0 ? prm.scopes_supported.join(" ") : authServer.scopes_supported?.join(" "));
  const resource = prm?.resource ?? input.serverUrl;
  const authUrlInput = {
    authServer,
    clientId: client.clientId,
    redirectUri: input.redirectUri,
    state,
    codeChallenge,
    resource
  };
  if (scope)
    authUrlInput.scope = scope;
  const authorizeUrl = buildAuthorizeUrl(authUrlInput);
  const pending = {
    serverId: input.serverId,
    authServerIssuer: authServer.issuer,
    tokenEndpoint: authServer.token_endpoint,
    clientId: client.clientId,
    redirectUri: input.redirectUri,
    codeVerifier,
    resourceUrl: resource,
    createdAt: Date.now()
  };
  if (client.clientSecret)
    pending.clientSecret = client.clientSecret;
  if (scope)
    pending.scope = scope;
  return { authorizeUrl, state, pending };
}

// ../daemon/dist/xai-oauth.js
var XAI_OAUTH_ISSUER = "https://auth.x.ai";
var XAI_OAUTH_AUTHORIZATION_ENDPOINT = "https://auth.x.ai/oauth2/authorize";
var XAI_OAUTH_TOKEN_ENDPOINT = "https://auth.x.ai/oauth2/token";
var XAI_OAUTH_SCOPE = "openid profile email offline_access grok-cli:access api:access";
var XAI_OAUTH_REDIRECT_HOST = "127.0.0.1";
var XAI_OAUTH_REDIRECT_PORT = 56121;
var XAI_OAUTH_REDIRECT_PATH = "/callback";
var XAI_OAUTH_CLIENT_ID = "b1a00492-073a-47ea-816f-4c329264a828";
var XAI_PROVIDER_ID = "xai";
var XAI_AUTH_SERVER = {
  issuer: XAI_OAUTH_ISSUER,
  authorization_endpoint: XAI_OAUTH_AUTHORIZATION_ENDPOINT,
  token_endpoint: XAI_OAUTH_TOKEN_ENDPOINT
};
function xaiRedirectUri() {
  return `http://${XAI_OAUTH_REDIRECT_HOST}:${XAI_OAUTH_REDIRECT_PORT}${XAI_OAUTH_REDIRECT_PATH}`;
}
function beginXAIAuth(input) {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = deriveCodeChallenge(codeVerifier);
  const state = generateState();
  const redirectUri = xaiRedirectUri();
  const authorizeUrl = buildAuthorizeUrl({
    authServer: XAI_AUTH_SERVER,
    clientId: XAI_OAUTH_CLIENT_ID,
    redirectUri,
    state,
    codeChallenge,
    scope: XAI_OAUTH_SCOPE
  });
  const pendingState = {
    serverId: XAI_PROVIDER_ID,
    authServerIssuer: XAI_OAUTH_ISSUER,
    tokenEndpoint: XAI_OAUTH_TOKEN_ENDPOINT,
    clientId: XAI_OAUTH_CLIENT_ID,
    redirectUri,
    codeVerifier,
    scope: XAI_OAUTH_SCOPE,
    createdAt: Date.now()
  };
  input.pending.put(state, pendingState);
  return { authorizeUrl, state };
}
async function completeXAIAuth(input) {
  const consumed = input.pending.consume(input.state);
  if (!consumed) {
    throw new Error("xAI OAuth state not found or expired");
  }
  if (consumed.serverId !== XAI_PROVIDER_ID) {
    throw new Error(`xAI OAuth state mismatch: expected serverId=${XAI_PROVIDER_ID}, got ${consumed.serverId}`);
  }
  return exchangeCodeForToken({
    tokenEndpoint: consumed.tokenEndpoint,
    clientId: consumed.clientId,
    redirectUri: consumed.redirectUri,
    code: input.code,
    codeVerifier: consumed.codeVerifier
  }, input.fetchImpl ?? fetch);
}
async function refreshXAIToken(input) {
  return refreshAccessToken({
    tokenEndpoint: XAI_OAUTH_TOKEN_ENDPOINT,
    clientId: XAI_OAUTH_CLIENT_ID,
    refreshToken: input.refreshToken
  }, input.fetchImpl ?? fetch);
}

// ../daemon/dist/xai-tokens.js
import { chmod, mkdir as mkdir2, readFile as readFile2, rename as rename2, writeFile as writeFile2 } from "node:fs/promises";
import { randomBytes as randomBytes2 } from "node:crypto";
import path4 from "node:path";
var EMPTY = {};
function tokensFile(dataDir) {
  return path4.join(dataDir, "xai-tokens.json");
}
function isPlainObject(v) {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}
function sanitizeTokensFile(raw) {
  if (!isPlainObject(raw))
    return {};
  const tok = sanitizeToken(raw.token);
  return tok ? { token: tok } : {};
}
function sanitizeToken(raw) {
  if (!isPlainObject(raw))
    return null;
  const accessToken = typeof raw.accessToken === "string" ? raw.accessToken.trim() : "";
  if (!accessToken)
    return null;
  const tokenType = typeof raw.tokenType === "string" && raw.tokenType.trim() ? raw.tokenType.trim() : "Bearer";
  const refreshToken = typeof raw.refreshToken === "string" && raw.refreshToken.trim() ? raw.refreshToken.trim() : void 0;
  const scope = typeof raw.scope === "string" && raw.scope.trim() ? raw.scope.trim() : void 0;
  const expiresAt = typeof raw.expiresAt === "number" && Number.isFinite(raw.expiresAt) ? raw.expiresAt : void 0;
  const savedAt = typeof raw.savedAt === "number" && Number.isFinite(raw.savedAt) ? raw.savedAt : Date.now();
  const out = { accessToken, tokenType, savedAt };
  if (refreshToken)
    out.refreshToken = refreshToken;
  if (scope)
    out.scope = scope;
  if (expiresAt !== void 0)
    out.expiresAt = expiresAt;
  return out;
}
async function readTokensFile(dataDir) {
  try {
    const raw = await readFile2(tokensFile(dataDir), "utf8");
    return sanitizeTokensFile(JSON.parse(raw));
  } catch (err) {
    const e = err;
    if (e.code === "ENOENT")
      return { ...EMPTY };
    if (e.name === "SyntaxError") {
      console.error("[xai-tokens] Corrupted JSON, returning empty:", e.message);
      return { ...EMPTY };
    }
    throw err;
  }
}
var writeLocks = /* @__PURE__ */ new Map();
async function withLock(dataDir, fn) {
  const prev = writeLocks.get(dataDir) ?? Promise.resolve();
  const task = prev.catch(() => {
  }).then(fn);
  writeLocks.set(dataDir, task);
  try {
    return await task;
  } finally {
    if (writeLocks.get(dataDir) === task)
      writeLocks.delete(dataDir);
  }
}
async function writeTokensFile(dataDir, next) {
  const file = tokensFile(dataDir);
  await mkdir2(path4.dirname(file), { recursive: true });
  const tmp = file + "." + randomBytes2(4).toString("hex") + ".tmp";
  await writeFile2(tmp, JSON.stringify(next, null, 2), "utf8");
  await rename2(tmp, file);
  try {
    await chmod(file, 384);
  } catch (err) {
    const e = err;
    if (e.code !== "ENOTSUP" && e.code !== "EPERM") {
      console.warn("[xai-tokens] could not chmod 0600", file, e.message ?? err);
    }
  }
  return next;
}
async function getXAIToken(dataDir) {
  const file = await readTokensFile(dataDir);
  return file.token ?? null;
}
async function setXAIToken(dataDir, token) {
  await withLock(dataDir, async () => {
    await writeTokensFile(dataDir, { token });
  });
}
async function clearXAIToken(dataDir) {
  await withLock(dataDir, async () => {
    const file = await readTokensFile(dataDir);
    if (!file.token)
      return;
    await writeTokensFile(dataDir, {});
  });
}
function isXAITokenExpired(token, now = Date.now(), skew = 12e4) {
  if (typeof token.expiresAt !== "number")
    return false;
  return token.expiresAt - skew <= now;
}

// ../daemon/dist/xai-credentials.js
async function resolveXAIBearer(dataDir, fetchImpl) {
  const stored = await getXAIToken(dataDir);
  if (!stored)
    return null;
  if (!isXAITokenExpired(stored)) {
    return { accessToken: stored.accessToken, source: "stored" };
  }
  if (!stored.refreshToken)
    return null;
  try {
    const fresh = await refreshXAIToken({
      refreshToken: stored.refreshToken,
      ...fetchImpl ? { fetchImpl } : {}
    });
    const next = {
      accessToken: fresh.access_token,
      tokenType: fresh.token_type ?? "Bearer",
      savedAt: Date.now()
    };
    const carriedRefresh = fresh.refresh_token ?? stored.refreshToken;
    if (carriedRefresh)
      next.refreshToken = carriedRefresh;
    if (typeof fresh.expires_in === "number") {
      next.expiresAt = Date.now() + fresh.expires_in * 1e3;
    }
    if (fresh.scope)
      next.scope = fresh.scope;
    await setXAIToken(dataDir, next);
    return { accessToken: next.accessToken, source: "refreshed" };
  } catch {
    return null;
  }
}

// ../daemon/dist/media-config.js
var PROVIDER_IDS = MEDIA_PROVIDERS.map((p) => p.id);
var ENV_MODEL_ALIASES = "OD_MEDIA_MODEL_ALIASES";
function isRecord(value) {
  return value !== null && typeof value === "object";
}
function errorCode(err) {
  return isRecord(err) && typeof err.code === "string" ? err.code : void 0;
}
var ENV_KEYS = {
  // OPENAI_API_KEY is the canonical env for the standard OpenAI API.
  // AZURE_API_KEY / AZURE_OPENAI_API_KEY are the canonical envs Azure
  // OpenAI examples use — we share the openai provider slot so a user
  // who pastes an Azure deployment URL into the OpenAI Base URL field
  // gets the credential picked up automatically.
  openai: [
    "OD_OPENAI_API_KEY",
    "OPENAI_API_KEY",
    "AZURE_API_KEY",
    "AZURE_OPENAI_API_KEY"
  ],
  volcengine: ["OD_VOLCENGINE_API_KEY", "ARK_API_KEY", "VOLCENGINE_API_KEY"],
  // OD_GROK_API_KEY first (the project-reserved override, same shape as
  // every other provider above), then XAI_API_KEY as the canonical
  // upstream env per docs.x.ai quickstart — so users who already export
  // it for the official SDK don't have to re-paste into Settings.
  grok: ["OD_GROK_API_KEY", "XAI_API_KEY"],
  nanobanana: ["OD_NANOBANANA_API_KEY", "GOOGLE_API_KEY", "GEMINI_API_KEY"],
  imagerouter: ["OD_IMAGEROUTER_API_KEY", "IMAGEROUTER_API_KEY"],
  "custom-image": ["OD_CUSTOM_IMAGE_API_KEY", "CUSTOM_IMAGE_API_KEY"],
  bfl: ["OD_BFL_API_KEY", "BFL_API_KEY"],
  fal: ["OD_FAL_KEY", "FAL_KEY"],
  replicate: ["OD_REPLICATE_API_TOKEN", "REPLICATE_API_TOKEN"],
  google: ["OD_GOOGLE_API_KEY", "GOOGLE_API_KEY", "GEMINI_API_KEY"],
  kling: ["OD_KLING_API_KEY", "KLING_API_KEY"],
  midjourney: ["OD_MIDJOURNEY_API_KEY"],
  minimax: ["OD_MINIMAX_API_KEY", "MINIMAX_API_KEY"],
  suno: ["OD_SUNO_API_KEY"],
  udio: ["OD_UDIO_API_KEY"],
  elevenlabs: ["OD_ELEVENLABS_API_KEY", "ELEVENLABS_API_KEY"],
  fishaudio: ["OD_FISHAUDIO_API_KEY", "FISH_AUDIO_API_KEY"],
  senseaudio: ["OD_SENSEAUDIO_API_KEY", "SENSEAUDIO_API_KEY"],
  tavily: ["OD_TAVILY_API_KEY", "TAVILY_API_KEY"],
  leonardo: ["OD_LEONARDO_API_KEY", "LEONARDO_API_KEY"]
};
function resolveOverrideDir(raw, projectRoot) {
  const expanded = expandHomePrefix(raw);
  return path5.isAbsolute(expanded) ? expanded : path5.resolve(projectRoot, expanded);
}
function envOverrideDir(envName, projectRoot) {
  const raw = process.env[envName];
  if (typeof raw !== "string")
    return null;
  const trimmed = raw.trim();
  return trimmed ? resolveOverrideDir(trimmed, projectRoot) : null;
}
function mediaConfigDir(projectRoot) {
  return envOverrideDir("OD_MEDIA_CONFIG_DIR", projectRoot) ?? envOverrideDir("OD_DATA_DIR", projectRoot) ?? path5.join(projectRoot, ".od");
}
function configFile(projectRoot) {
  return path5.join(mediaConfigDir(projectRoot), "media-config.json");
}
function coerceAliasMap(raw) {
  if (!isRecord(raw))
    return {};
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof k !== "string" || !k.trim())
      continue;
    if (typeof v !== "string" || !v.trim())
      continue;
    out[k.trim()] = v.trim();
  }
  return out;
}
async function readStoredFile(projectRoot) {
  try {
    const raw = await readFile3(configFile(projectRoot), "utf8");
    const parsed = JSON.parse(raw);
    return isRecord(parsed) ? parsed : {};
  } catch (err) {
    if (errorCode(err) === "ENOENT")
      return {};
    throw err;
  }
}
async function readStored(projectRoot) {
  const parsed = await readStoredFile(projectRoot);
  return isRecord(parsed.providers) ? parsed.providers : {};
}
async function readStoredAliases(projectRoot) {
  const parsed = await readStoredFile(projectRoot);
  return coerceAliasMap(parsed.aliases);
}
async function writeStored(projectRoot, providers, aliases) {
  const file = configFile(projectRoot);
  await mkdir3(path5.dirname(file), { recursive: true });
  const resolvedAliases = aliases ?? await readStoredAliases(projectRoot);
  const body = { providers };
  if (Object.keys(resolvedAliases).length > 0) {
    body.aliases = resolvedAliases;
  }
  await writeFile3(file, JSON.stringify(body, null, 2), "utf8");
}
function readEnvAliases() {
  const raw = process.env[ENV_MODEL_ALIASES];
  if (typeof raw !== "string" || !raw.trim())
    return {};
  try {
    return coerceAliasMap(JSON.parse(raw));
  } catch {
    return {};
  }
}
async function resolveModelAlias(projectRoot, modelId) {
  const envAliases = readEnvAliases();
  if (envAliases[modelId])
    return envAliases[modelId];
  const stored = await readStoredAliases(projectRoot);
  return stored[modelId] ?? modelId;
}
async function readAliasMap(projectRoot) {
  const env = readEnvAliases();
  const stored = await readStoredAliases(projectRoot);
  const effective = { ...stored, ...env };
  return { effective, env, stored };
}
function readEnvKey(providerId) {
  const keys = ENV_KEYS[providerId];
  if (!keys)
    return null;
  for (const k of keys) {
    const v = process.env[k];
    if (typeof v === "string" && v.trim())
      return v.trim();
  }
  return null;
}
function readNestedString(obj, keys) {
  let cur = obj;
  for (const key of keys) {
    if (!isRecord(cur))
      return "";
    cur = cur[key];
  }
  return typeof cur === "string" && cur.trim() ? cur.trim() : "";
}
async function readJsonIfPresent(file) {
  try {
    const raw = await readFile3(file, "utf8");
    const parsed = JSON.parse(raw);
    return isRecord(parsed) ? parsed : null;
  } catch (err) {
    if (errorCode(err) === "ENOENT")
      return null;
    return null;
  }
}
function tokenFromHermesAuth(data) {
  const providerToken = readNestedString(data, [
    "providers",
    "openai-codex",
    "tokens",
    "access_token"
  ]);
  if (providerToken)
    return providerToken;
  const pool = isRecord(data) && isRecord(data.credential_pool) ? data.credential_pool["openai-codex"] : null;
  if (Array.isArray(pool)) {
    for (const item of pool) {
      const token = readNestedString(item, ["access_token"]);
      if (token)
        return token;
    }
  }
  return "";
}
function tokenFromCodexAuth(data) {
  const oauthToken = readNestedString(data, ["tokens", "access_token"]);
  if (oauthToken)
    return { token: oauthToken, source: "oauth-codex" };
  const apiKey = readNestedString(data, ["OPENAI_API_KEY"]);
  if (apiKey)
    return { token: apiKey, source: "codex-auth" };
  return null;
}
async function resolveOpenAIOAuthCredential() {
  const home = os2.homedir();
  const hermesAuth = await readJsonIfPresent(path5.join(home, ".hermes", "auth.json"));
  const hermesToken = tokenFromHermesAuth(hermesAuth);
  if (hermesToken) {
    return { apiKey: hermesToken, source: "oauth-hermes" };
  }
  const codexAuth = await readJsonIfPresent(path5.join(home, ".codex", "auth.json"));
  const codexToken = tokenFromCodexAuth(codexAuth);
  if (codexToken) {
    return { apiKey: codexToken.token, source: codexToken.source };
  }
  return null;
}
async function resolveXAIOAuthCredential(projectRoot) {
  const odBearer = await resolveXAIBearer(mediaConfigDir(projectRoot)).catch(() => null);
  if (odBearer) {
    return {
      apiKey: odBearer.accessToken,
      source: `oauth-xai-${odBearer.source}`
    };
  }
  const home = os2.homedir();
  const hermesAuth = await readJsonIfPresent(path5.join(home, ".hermes", "auth.json"));
  const hermesXaiToken = readNestedString(hermesAuth, [
    "providers",
    "xai-oauth",
    "tokens",
    "access_token"
  ]);
  if (hermesXaiToken) {
    return { apiKey: hermesXaiToken, source: "oauth-hermes-xai" };
  }
  return null;
}
async function resolveProviderConfig(projectRoot, providerId) {
  const stored = await readStored(projectRoot);
  const entry = stored[providerId] || {};
  const envKey = readEnvKey(providerId);
  const needsOAuthFallback = !envKey && !entry.apiKey;
  const oauth = needsOAuthFallback ? providerId === "openai" ? await resolveOpenAIOAuthCredential() : providerId === "grok" ? await resolveXAIOAuthCredential(projectRoot) : null : null;
  return {
    apiKey: envKey || entry.apiKey || oauth?.apiKey || "",
    baseUrl: entry.baseUrl || "",
    ...typeof entry.model === "string" && entry.model.trim() ? { model: entry.model.trim() } : {}
  };
}
async function readMaskedConfig(projectRoot) {
  const stored = await readStored(projectRoot);
  const providers = {};
  for (const id of PROVIDER_IDS) {
    const entry = stored[id] || {};
    const envKey = readEnvKey(id);
    const hasStoredKey = typeof entry.apiKey === "string" && entry.apiKey.length > 0;
    const needsOAuthFallback = !envKey && !hasStoredKey;
    const oauth = needsOAuthFallback ? id === "openai" ? await resolveOpenAIOAuthCredential() : id === "grok" ? await resolveXAIOAuthCredential(projectRoot) : null : null;
    providers[id] = {
      configured: Boolean(envKey || hasStoredKey || oauth?.apiKey),
      source: envKey ? "env" : hasStoredKey ? "stored" : oauth?.source || "unset",
      // Show last 4 chars only when stored locally; never echo env-var
      // or OAuth secrets so power users don't accidentally see them in
      // the DOM.
      apiKeyTail: hasStoredKey && entry.apiKey ? entry.apiKey.slice(-4) : "",
      baseUrl: entry.baseUrl || "",
      ...typeof entry.model === "string" && entry.model.trim() ? { model: entry.model.trim() } : {}
    };
  }
  const aliases = await readAliasMap(projectRoot);
  return { providers, aliases };
}
async function writeConfig(projectRoot, body) {
  const incoming = isRecord(body) && isRecord(body.providers) ? body.providers : {};
  const force = Boolean(isRecord(body) && body.force === true);
  const prior = await readStored(projectRoot);
  const next = {};
  for (const id of PROVIDER_IDS) {
    const entry = incoming[id];
    if (!isRecord(entry))
      continue;
    const incomingApiKey = typeof entry.apiKey === "string" && entry.apiKey.trim() ? entry.apiKey.trim() : "";
    const preserveApiKey = entry.preserveApiKey === true;
    const priorApiKey = typeof prior[id]?.apiKey === "string" && prior[id].apiKey.trim() ? prior[id].apiKey.trim() : "";
    const apiKey = incomingApiKey || (preserveApiKey ? priorApiKey : "");
    const baseUrl = typeof entry.baseUrl === "string" && entry.baseUrl.trim() ? entry.baseUrl.trim() : "";
    const model = typeof entry.model === "string" && entry.model.trim() ? entry.model.trim() : "";
    if (!apiKey && !baseUrl && !model)
      continue;
    next[id] = {
      apiKey,
      baseUrl,
      ...model ? { model } : {}
    };
  }
  if (Object.keys(next).length === 0) {
    const priorIds = Object.keys(prior).filter((id) => prior[id] && (prior[id].apiKey || prior[id].baseUrl));
    if (priorIds.length > 0) {
      if (!force) {
        const err = new Error(`refusing to wipe ${priorIds.length} configured provider(s) without force=true: ${priorIds.join(", ")}`);
        err.status = 409;
        throw err;
      }
      try {
        console.error(`[media-config] WARN: incoming PUT empty, would wipe ${priorIds.length} configured provider(s): ${priorIds.join(", ")}`);
      } catch {
      }
    }
  }
  await writeStored(projectRoot, next);
  return readMaskedConfig(projectRoot);
}
async function seedProviderIfMissing(projectRoot, providerId, entry) {
  if (!PROVIDER_IDS.includes(providerId))
    return false;
  const apiKey = entry.apiKey?.trim() ?? "";
  if (!apiKey)
    return false;
  if (readEnvKey(providerId))
    return false;
  const prior = await readStored(projectRoot);
  const priorApiKey = typeof prior[providerId]?.apiKey === "string" && prior[providerId].apiKey.trim() ? prior[providerId].apiKey.trim() : "";
  if (priorApiKey)
    return false;
  const baseUrl = entry.baseUrl?.trim() ?? "";
  const model = entry.model?.trim() ?? "";
  const next = { ...prior };
  next[providerId] = {
    apiKey,
    ...baseUrl ? { baseUrl } : {},
    ...model ? { model } : {}
  };
  await writeStored(projectRoot, next);
  return true;
}

// ../daemon/dist/memory-llm.js
import { spawn } from "node:child_process";
import { promises as fsp2 } from "node:fs";
import os3 from "node:os";
import path13 from "node:path";

// ../daemon/dist/runtimes/defs/amr.js
var AMR_MODELS_TIMEOUT_MS = 1e4;
var AMR_MODELS_RETRY_DELAYS_MS = [250, 750];
var PREFERRED_AMR_CHAT_MODEL_ORDER = [
  "deepseek-v4-flash",
  "deepseek-v3.2",
  "glm-5.1",
  "gemini-2.5-flash"
];
var PREFERRED_AMR_CHAT_MODEL_RANK = new Map(PREFERRED_AMR_CHAT_MODEL_ORDER.map((id, index) => [id, index]));
function isVelaChatModelId(modelId) {
  const id = modelId.toLowerCase();
  if (id.startsWith("gpt-image-"))
    return false;
  if (id.startsWith("seedance-"))
    return false;
  if (id.startsWith("doubao-seedance-"))
    return false;
  if (id.startsWith("veo-"))
    return false;
  if (id.startsWith("imagen-"))
    return false;
  return true;
}
function parseVelaModelJson(stdout, expectedSource) {
  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch (error) {
    throw new Error(`Invalid vela model JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid vela model JSON: expected object");
  }
  const source = parsed.source;
  if (source !== expectedSource) {
    throw new Error(`Invalid vela model JSON source: expected ${expectedSource}, got ${String(source)}`);
  }
  const data = parsed.data;
  if (!Array.isArray(data)) {
    throw new Error("Invalid vela model JSON: expected data array");
  }
  const seen = /* @__PURE__ */ new Set();
  const models = [];
  for (const item of data) {
    const rawId = item && typeof item === "object" ? item.id : null;
    const id = typeof rawId === "string" ? rawId.trim() : "";
    if (!id || seen.has(id) || !isVelaChatModelId(id))
      continue;
    seen.add(id);
    models.push({ id, label: id });
  }
  return orderAmrChatModels(models);
}
function orderAmrChatModels(models) {
  return models.map((model, index) => ({ model, index })).sort((a, b) => {
    const aRank = PREFERRED_AMR_CHAT_MODEL_RANK.get(a.model.id) ?? Number.MAX_SAFE_INTEGER;
    const bRank = PREFERRED_AMR_CHAT_MODEL_RANK.get(b.model.id) ?? Number.MAX_SAFE_INTEGER;
    return aRank - bRank || a.index - b.index;
  }).map(({ model }) => model);
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function velaModelsErrorMessage(error) {
  if (error instanceof Error)
    return error.message;
  return String(error ?? "");
}
function isRetriableVelaModelsError(error) {
  const message = velaModelsErrorMessage(error).toLowerCase();
  return [
    "deadline exceeded",
    "timed out",
    "timeout",
    "temporarily unavailable",
    "temporary failure",
    "econnreset",
    "econnrefused",
    "enotfound",
    "502",
    "503",
    "504"
  ].some((pattern) => message.includes(pattern));
}
async function fetchVelaPresetModels(resolvedBin, env) {
  const { stdout } = await execAgentFile(resolvedBin, ["model", "preset", "--format", "json"], {
    env,
    timeout: AMR_MODELS_TIMEOUT_MS,
    maxBuffer: 1024 * 1024
  });
  return parseVelaModelJson(String(stdout), "preset");
}
async function fetchVelaRemoteModelsWithRetry(resolvedBin, env) {
  let lastError = null;
  for (let attempt = 0; attempt <= AMR_MODELS_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const { stdout } = await execAgentFile(resolvedBin, ["model", "list", "--format", "json"], {
        env,
        timeout: AMR_MODELS_TIMEOUT_MS,
        maxBuffer: 1024 * 1024
      });
      return parseVelaModelJson(String(stdout), "remote");
    } catch (error) {
      lastError = error;
      if (attempt === AMR_MODELS_RETRY_DELAYS_MS.length || !isRetriableVelaModelsError(error)) {
        throw error;
      }
      await sleep(AMR_MODELS_RETRY_DELAYS_MS[attempt] ?? 0);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(velaModelsErrorMessage(lastError));
}
var amrAgentDef = {
  id: "amr",
  name: "AMR",
  bin: "vela",
  versionArgs: ["--version"],
  fetchModels: fetchVelaRemoteModelsWithRetry,
  // Fail closed when Vela's live catalog is unavailable. Stale static
  // fallbacks let users select models that link/opencode no longer accepts.
  fallbackModels: [],
  buildArgs: () => ["agent", "run", "--runtime", "opencode"],
  streamFormat: "acp-json-rpc",
  // Vela routes model selection through ACP's `session/set_model` and only
  // accepts ids that survived the `vela models` preflight check, so a
  // free-text "Custom" id silently fails at spawn. The model picker
  // surfaces the live Vela catalog instead.
  supportsCustomModel: false,
  supportsImagePaths: true,
  // Daemon-process env override for emergency operator pinning. Normal UI
  // selection comes from the live `vela models` catalog and is preflighted
  // before spawn.
  defaultModelEnvVar: "VELA_DEFAULT_MODEL"
};

// ../daemon/dist/runtimes/capabilities.js
var agentCapabilities = /* @__PURE__ */ new Map();

// ../daemon/dist/runtimes/defs/claude.js
var claudeAgentDef = {
  id: "claude",
  name: "Claude Code",
  bin: "claude",
  // Drop-in forks that ship a CLI argv-compatible with `claude`. Tried in
  // order if `claude` itself isn't on PATH, so users on a single-binary
  // install (e.g. only OpenClaude — https://github.com/Gitlawb/openclaude
  // — issue #235) get auto-detected without writing wrapper scripts.
  fallbackBins: ["openclaude"],
  versionArgs: ["--version"],
  helpArgs: ["-p", "--help"],
  capabilityFlags: {
    // Flag string -> capability key. After probing `--help`, we set
    // `agentCapabilities[id][key] = true` for each substring that matches.
    // `--add-dir` and `--include-partial-messages` live under `claude -p`
    // subcommand, so we probe `claude -p --help` instead of `claude --help`.
    // Fixes issue #430: --add-dir never detected because it wasn't in global help.
    "--include-partial-messages": "partialMessages",
    "--add-dir": "addDir"
  },
  // `claude` has no list-models subcommand; the CLI accepts both short
  // aliases (sonnet/opus/haiku) and the full ids, so we ship both as
  // hints. Users who want a non-shipped model can paste it via the
  // Settings dialog's custom-model input.
  fallbackModels: [
    DEFAULT_MODEL_OPTION,
    { id: "sonnet", label: "Sonnet (alias)" },
    { id: "opus", label: "Opus (alias)" },
    { id: "haiku", label: "Haiku (alias)" },
    { id: "claude-opus-4-5", label: "claude-opus-4-5" },
    { id: "claude-sonnet-4-5", label: "claude-sonnet-4-5" },
    { id: "claude-haiku-4-5", label: "claude-haiku-4-5" }
  ],
  // Prompt delivered via stdin to avoid both Linux `spawn E2BIG`
  // (MAX_ARG_STRLEN caps a single argv entry at ~128 KB) and Windows
  // `spawn ENAMETOOLONG` (CreateProcess caps the full command line at
  // ~32 KB direct, ~8 KB via .cmd shim). `claude -p` with no positional
  // prompt reads the prompt from stdin under `--input-format text` (the
  // default), which has no length cap. Mirrors the codex/gemini/opencode/
  // cursor/qwen entries below.
  buildArgs: (_prompt, _imagePaths, extraAllowedDirs = [], options = {}) => {
    const caps = agentCapabilities.get("claude") || {};
    const args = ["-p", "--input-format", "stream-json", "--output-format", "stream-json", "--verbose"];
    if (caps.partialMessages) {
      args.push("--include-partial-messages");
    }
    if (options.model && options.model !== "default") {
      args.push("--model", options.model);
    }
    const dirs = (extraAllowedDirs || []).filter((d) => typeof d === "string" && d.length > 0);
    if (dirs.length > 0 && caps.addDir !== false) {
      args.push("--add-dir", ...dirs);
    }
    args.push("--permission-mode", "bypassPermissions");
    return args;
  },
  promptViaStdin: true,
  promptInputFormat: "stream-json",
  streamFormat: "claude-stream-json",
  // Claude Code auto-loads `.mcp.json` from the project cwd at spawn,
  // so the daemon writes the user's external MCP servers there before
  // launching (server.ts handles the cwd guard).
  externalMcpInjection: "claude-mcp-json"
};

// ../daemon/dist/runtimes/defs/codex.js
function parseCodexDebugModels(stdout) {
  let parsed;
  try {
    parsed = JSON.parse(String(stdout || ""));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object")
    return null;
  const models = parsed.models;
  if (!Array.isArray(models))
    return null;
  const out = [DEFAULT_MODEL_OPTION];
  const seen = /* @__PURE__ */ new Set([DEFAULT_MODEL_OPTION.id]);
  for (const raw of models) {
    if (!raw || typeof raw !== "object")
      continue;
    const entry = raw;
    if (entry.visibility === "hidden")
      continue;
    const id = typeof entry.slug === "string" ? entry.slug.trim() : typeof entry.id === "string" ? entry.id.trim() : "";
    if (!id || seen.has(id))
      continue;
    seen.add(id);
    const label = typeof entry.display_name === "string" && entry.display_name.trim() ? entry.display_name.trim() : typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : id;
    out.push({ id, label });
  }
  return out.length > 1 ? out : null;
}
function codexNeedsDangerFullAccessSandbox(platform = process.platform, env = process.env) {
  if (platform === "win32")
    return true;
  return Boolean(env.WSL_DISTRO_NAME?.trim());
}
var codexAgentDef = {
  id: "codex",
  name: "Codex CLI",
  bin: "codex",
  versionArgs: ["--version"],
  // Codex exposes its installed model catalog through `debug models` on
  // recent CLIs. Older builds fall back to these static hints.
  listModels: {
    args: ["debug", "models"],
    parse: parseCodexDebugModels,
    timeoutMs: 5e3
  },
  fallbackModels: [
    DEFAULT_MODEL_OPTION,
    { id: "gpt-5.5", label: "gpt-5.5" },
    { id: "gpt-5.4", label: "gpt-5.4" },
    { id: "gpt-5.4-mini", label: "gpt-5.4-mini" },
    { id: "gpt-5.3-codex", label: "gpt-5.3-codex" },
    { id: "gpt-5.1", label: "gpt-5.1" },
    { id: "gpt-5.1-codex-mini", label: "gpt-5.1-codex-mini" },
    { id: "gpt-5-codex", label: "gpt-5-codex" },
    { id: "gpt-5", label: "gpt-5" },
    { id: "o3", label: "o3" },
    { id: "o4-mini", label: "o4-mini" }
  ],
  reasoningOptions: [
    { id: "default", label: "Default" },
    { id: "none", label: "None" },
    { id: "minimal", label: "Minimal" },
    { id: "low", label: "Low" },
    { id: "medium", label: "Medium" },
    { id: "high", label: "High" },
    { id: "xhigh", label: "XHigh" }
  ],
  // Prompt is delivered via stdin pipe (gated by `promptViaStdin: true`
  // below) to avoid Windows `spawn ENAMETOOLONG` while keeping Codex on
  // its structured JSON stream. Recent Codex CLI versions reject a bare
  // `-` argv sentinel — passing both the pipe and `-` produces
  // `error: unexpected argument '-' found` and the agent exits with
  // code 2 before any prompt is read (see issue #237). The pipe alone
  // is sufficient for stdin delivery.
  buildArgs: (_prompt, _imagePaths, extraAllowedDirs = [], options = {}, runtimeContext = {}) => {
    const needsDangerFullAccess = codexNeedsDangerFullAccessSandbox();
    const args = needsDangerFullAccess ? ["exec", "--json", "--skip-git-repo-check", "--sandbox", "danger-full-access"] : [
      "exec",
      "--json",
      "--skip-git-repo-check",
      "--sandbox",
      "workspace-write",
      "-c",
      "sandbox_workspace_write.network_access=true"
    ];
    args.push("-c", 'default_permissions=":workspace"');
    if (process.env.OD_CODEX_DISABLE_PLUGINS === "1") {
      args.push("--disable", "plugins");
    }
    if (runtimeContext.cwd) {
      args.push("-C", runtimeContext.cwd);
    }
    const dirs = (extraAllowedDirs || []).filter((d) => typeof d === "string" && d.length > 0);
    for (const d of dirs) {
      args.push("--add-dir", d);
    }
    if (options.model && options.model !== "default") {
      args.push("--model", options.model);
    }
    if (options.reasoning && options.reasoning !== "default") {
      const effort = clampCodexReasoning(options.model, options.reasoning);
      args.push("-c", `model_reasoning_effort="${effort}"`);
    }
    return args;
  },
  promptViaStdin: true,
  streamFormat: "json-event-stream",
  eventParser: "codex"
};

// ../daemon/dist/runtimes/defs/devin.js
var devinAgentDef = {
  id: "devin",
  name: "Devin for Terminal",
  bin: "devin",
  versionArgs: ["--version"],
  fetchModels: async (resolvedBin, env) => detectAcpModels({
    bin: resolvedBin,
    args: [
      "--permission-mode",
      "dangerous",
      "--respect-workspace-trust",
      "false",
      "acp"
    ],
    env,
    timeoutMs: 15e3,
    defaultModelOption: DEFAULT_MODEL_OPTION
  }),
  // Fallback aliases from Devin for Terminal docs
  // (https://cli.devin.ai/docs/models): `adaptive` appears in the config example;
  // `opus`, `sonnet`, `swe`, `codex`, `gemini`, and `gpt` are documented
  // as short model-family names / recommended picks.
  fallbackModels: [
    DEFAULT_MODEL_OPTION,
    { id: "adaptive", label: "adaptive" },
    { id: "swe", label: "swe" },
    { id: "opus", label: "opus" },
    { id: "sonnet", label: "sonnet" },
    { id: "codex", label: "codex" },
    { id: "gpt", label: "gpt" },
    { id: "gemini", label: "gemini" }
  ],
  buildArgs: () => [
    "--permission-mode",
    "dangerous",
    "--respect-workspace-trust",
    "false",
    "acp"
  ],
  streamFormat: "acp-json-rpc",
  externalMcpInjection: "acp-merge"
};

// ../daemon/dist/runtimes/defs/gemini.js
var geminiAgentDef = {
  id: "gemini",
  name: "Gemini CLI",
  bin: "gemini",
  versionArgs: ["--version"],
  fallbackModels: [
    DEFAULT_MODEL_OPTION,
    // Gemini 3 (May 2026): top-tier reasoning + fast frontier-class.
    // Both currently ship as previews via the Gemini CLI. Issue #981.
    { id: "gemini-3-pro-preview", label: "gemini-3-pro-preview" },
    { id: "gemini-3-flash-preview", label: "gemini-3-flash-preview" },
    { id: "gemini-2.5-pro", label: "gemini-2.5-pro" },
    { id: "gemini-2.5-flash", label: "gemini-2.5-flash" },
    // Cheapest 2.5 multimodal variant; useful for high-volume / low-latency work.
    { id: "gemini-2.5-flash-lite", label: "gemini-2.5-flash-lite" }
  ],
  // Gemini reads from stdin when `-p` is omitted and stdin is a pipe.
  // Passing the full composed prompt as a CLI arg causes ENAMETOOLONG on
  // Windows (CreateProcess limit ~32 KB) for any non-trivial prompt.
  // `--yolo` skips interactive approval prompts in the no-TTY web UI.
  // Workspace trust is provided via `GEMINI_CLI_TRUST_WORKSPACE` below
  // instead of `--skip-trust`; several Gemini CLI builds hide or reject the
  // flag even though they accept the documented environment variable.
  env: { GEMINI_CLI_TRUST_WORKSPACE: "true" },
  buildArgs: (_prompt, _imagePaths, _extra, options = {}) => {
    const args = ["--output-format", "stream-json", "--yolo"];
    if (options.model && options.model !== "default") {
      args.push("--model", options.model);
    }
    return args;
  },
  promptViaStdin: true,
  streamFormat: "json-event-stream",
  eventParser: "gemini"
};

// ../daemon/dist/runtimes/defs/opencode.js
var opencodeAgentDef = {
  id: "opencode",
  name: "OpenCode",
  bin: "opencode-cli",
  fallbackBins: ["opencode"],
  versionArgs: ["--version"],
  // `opencode models` prints `provider/model` per line.
  listModels: {
    args: ["models"],
    parse: parseLineSeparatedModels,
    timeoutMs: 8e3
  },
  fallbackModels: [
    DEFAULT_MODEL_OPTION,
    {
      id: "anthropic/claude-sonnet-4-5",
      label: "anthropic/claude-sonnet-4-5"
    },
    { id: "openai/gpt-5", label: "openai/gpt-5" },
    { id: "google/gemini-2.5-pro", label: "google/gemini-2.5-pro" }
  ],
  // Prompt delivered via stdin (`opencode run` with no message argv) to
  // avoid Windows `spawn ENAMETOOLONG` while preserving OpenCode's
  // structured stream. A literal `-` is parsed as a positional message by
  // OpenCode 1.14.x and can surface as "Session not found".
  buildArgs: (_prompt, _imagePaths, _extra, options = {}) => {
    const args = [
      "run",
      "--format",
      "json"
    ];
    if (options.model && options.model !== "default") {
      args.push("-m", options.model);
    }
    return args;
  },
  promptViaStdin: true,
  streamFormat: "json-event-stream",
  eventParser: "opencode",
  // OpenCode reads MCP servers from its layered config (global ~/.config
  // /opencode/opencode.json + project opencode.json + OPENCODE_CONFIG
  // + OPENCODE_CONFIG_CONTENT). The env-var form lets the daemon hand
  // user-configured external MCP servers to a single `opencode run`
  // invocation without polluting the user's saved config files. See
  // <https://opencode.ai/docs/config> and issue #2142.
  externalMcpInjection: "opencode-env-content"
};

// ../daemon/dist/runtimes/defs/hermes.js
var hermesAgentDef = {
  id: "hermes",
  name: "Hermes",
  bin: "hermes",
  versionArgs: ["--version"],
  fetchModels: async (resolvedBin, env) => detectAcpModels({
    bin: resolvedBin,
    args: ["acp", "--accept-hooks"],
    env,
    timeoutMs: 15e3,
    defaultModelOption: DEFAULT_MODEL_OPTION
  }),
  // Used only when `fetchModels` (which calls `hermes acp` to enumerate
  // the user's actually-installed providers) fails — e.g. Hermes isn't on
  // PATH yet. The list doubles as discovery hints in the model picker so a
  // user who hasn't installed Hermes still sees what becomes available
  // after `hermes auth add xai-oauth` (xAI · SuperGrok subscription) or
  // `hermes auth add openai` (Codex). Reference: https://x.ai/news/grok-hermes.
  fallbackModels: [
    DEFAULT_MODEL_OPTION,
    // xAI Grok — available via SuperGrok OAuth (`hermes auth add xai-oauth`)
    // or XAI_API_KEY in `~/.hermes/.env`.
    { id: "grok-4.3", label: "grok-4.3 (xAI \xB7 default)" },
    {
      id: "grok-4.20-reasoning",
      label: "grok-4.20-reasoning (xAI \xB7 deep)"
    },
    {
      id: "grok-4.20-0309-non-reasoning",
      label: "grok-4.20-non-reasoning (xAI \xB7 fast)"
    },
    {
      id: "grok-4.20-multi-agent-0309",
      label: "grok-4.20-multi-agent (xAI \xB7 orchestration)"
    },
    // OpenAI Codex.
    { id: "openai-codex:gpt-5.5", label: "gpt-5.5 (openai-codex:gpt-5.5)" },
    { id: "openai-codex:gpt-5.4", label: "gpt-5.4 (openai-codex:gpt-5.4)" },
    {
      id: "openai-codex:gpt-5.4-mini",
      label: "gpt-5.4-mini (openai-codex:gpt-5.4-mini)"
    }
  ],
  buildArgs: () => ["acp", "--accept-hooks"],
  streamFormat: "acp-json-rpc",
  mcpDiscovery: "mature-acp",
  externalMcpInjection: "acp-merge"
};

// ../daemon/dist/runtimes/defs/trae-cli.js
var traeCliAgentDef = {
  id: "trae-cli",
  name: "Trae CLI",
  bin: "traecli",
  versionArgs: ["--version"],
  versionProbeTimeoutMs: 1e4,
  fetchModels: async (resolvedBin, env) => detectAcpModels({
    bin: resolvedBin,
    args: ["acp", "serve"],
    env,
    timeoutMs: 15e3,
    defaultModelOption: DEFAULT_MODEL_OPTION
  }),
  fallbackModels: [DEFAULT_MODEL_OPTION],
  buildArgs: () => ["acp", "serve", "--yolo"],
  streamFormat: "acp-json-rpc",
  mcpDiscovery: "mature-acp",
  externalMcpInjection: "acp-merge"
};

// ../daemon/dist/runtimes/defs/grok-build.js
var grokBuildAgentDef = {
  id: "grok-build",
  name: "Grok Build",
  bin: "grok",
  versionArgs: ["--version"],
  helpArgs: ["-p", "--help"],
  // `grok models` prints one model id per line, plus a `Default model:`
  // header line that parseLineSeparatedModels strips because it isn't
  // an id token. Falls back to the static list below when probing fails
  // (no SuperGrok Heavy entitlement on this machine, network blip, etc.).
  listModels: {
    args: ["models"],
    timeoutMs: 1e4,
    parse: parseLineSeparatedModels
  },
  fallbackModels: [
    DEFAULT_MODEL_OPTION,
    { id: "grok-build", label: "grok-build (xAI \xB7 default)" },
    { id: "grok-4.3", label: "grok-4.3 (xAI)" },
    { id: "grok-4.20-reasoning", label: "grok-4.20-reasoning (xAI \xB7 deep)" },
    {
      id: "grok-4.20-non-reasoning",
      label: "grok-4.20-non-reasoning (xAI \xB7 fast)"
    },
    {
      id: "grok-4.20-multi-agent",
      label: "grok-4.20-multi-agent (xAI \xB7 orchestration)"
    }
  ],
  // Grok Build CLI v0.1.212 enforces `-p, --single <PROMPT>` as value-
  // required — stdin piping no longer satisfies it. Inline the prompt.
  buildArgs: (prompt, _imagePaths, _extra = [], options = {}) => {
    const args = ["-p", prompt];
    if (options.model && options.model !== DEFAULT_MODEL_OPTION.id) {
      args.push("--model", options.model);
    }
    if (options.reasoning) {
      args.push("--effort", options.reasoning);
    }
    return args;
  },
  reasoningOptions: [
    { id: "low", label: "low" },
    { id: "medium", label: "medium" },
    { id: "high", label: "high" },
    { id: "xhigh", label: "xhigh" },
    { id: "max", label: "max" }
  ],
  promptViaStdin: false,
  // Guard against prompts that would blow Windows' ~32 KB CreateProcess
  // limit (or Linux MAX_ARG_STRLEN on extreme edges) before spawn. Same
  // shape as the DeepSeek adapter — the previous stdin path is gone (CLI
  // 0.1.212 enforces `-p <value>`), so the composed prompt now rides
  // argv and a sufficiently large one — system text + history + skills/
  // design-system content + user message — could surface as a generic
  // spawn ENAMETOOLONG / E2BIG instead of a Grok-specific, user-
  // actionable message. The /api/chat spawn path checks this byte
  // budget against the composed prompt and emits AGENT_PROMPT_TOO_LARGE
  // ("reduce skills/design-system context, or pick an adapter with
  // stdin support") before calling `spawn`. 30_000 bytes leaves ~2.7 KB
  // of argv headroom under the Windows command-line limit for `-p
  // --model <id> --effort <level>` and internal quoting.
  maxPromptArgBytes: 3e4,
  streamFormat: "plain",
  installUrl: "https://x.ai/cli",
  docsUrl: "https://x.ai/cli"
};

// ../daemon/dist/runtimes/defs/kimi.js
var kimiAgentDef = {
  id: "kimi",
  name: "Kimi CLI",
  bin: "kimi",
  versionArgs: ["--version"],
  fetchModels: async (resolvedBin, env) => detectAcpModels({
    bin: resolvedBin,
    args: ["acp"],
    env,
    timeoutMs: 15e3,
    defaultModelOption: DEFAULT_MODEL_OPTION
  }),
  fallbackModels: [
    DEFAULT_MODEL_OPTION,
    { id: "kimi-k2-turbo-preview", label: "kimi-k2-turbo-preview" },
    { id: "moonshot-v1-8k", label: "moonshot-v1-8k" },
    { id: "moonshot-v1-32k", label: "moonshot-v1-32k" }
  ],
  buildArgs: () => ["acp"],
  streamFormat: "acp-json-rpc",
  mcpDiscovery: "mature-acp",
  externalMcpInjection: "acp-merge"
};

// ../daemon/dist/runtimes/defs/cursor-agent.js
function parseCursorAgentModels(stdout) {
  const lines = String(stdout || "").split("\n").map((line) => line.trim()).filter((line) => line.length > 0 && !line.startsWith("#"));
  if (lines.length === 0)
    return null;
  const out = [DEFAULT_MODEL_OPTION];
  const seen = /* @__PURE__ */ new Set([DEFAULT_MODEL_OPTION.id]);
  for (const line of lines) {
    if (/^(available models|models)$/i.test(line))
      continue;
    const match = line.match(/^([A-Za-z0-9][A-Za-z0-9._/:@-]*)(?:\s+-\s+(.+))?$/);
    if (!match)
      continue;
    const id = match[1];
    if (!id || seen.has(id))
      continue;
    seen.add(id);
    const label = match[2]?.trim() || id;
    out.push({ id, label });
  }
  return out.length > 1 ? out : null;
}
var cursorAgentDef = {
  id: "cursor-agent",
  name: "Cursor Agent",
  bin: "cursor-agent",
  versionArgs: ["--version"],
  // `cursor-agent models` prints account-bound model ids per line. When
  // the user isn't authed it prints "No models available for this
  // account." — that's not a model list, so we detect it and fall back.
  listModels: {
    args: ["models"],
    timeoutMs: 5e3,
    parse: (stdout) => {
      const trimmed = String(stdout || "").trim();
      if (!trimmed || /no models available/i.test(trimmed))
        return null;
      return parseCursorAgentModels(trimmed);
    }
  },
  fallbackModels: [
    DEFAULT_MODEL_OPTION,
    { id: "auto", label: "auto" },
    { id: "sonnet-4", label: "sonnet-4" },
    { id: "sonnet-4-thinking", label: "sonnet-4-thinking" },
    { id: "gpt-5", label: "gpt-5" }
  ],
  // Cursor Agent does not use `-` as a "read prompt from stdin" sentinel.
  // Passing it makes the CLI treat the dash as the literal user prompt,
  // which then surfaces as "your message only contains '-'". Keep stdin
  // piped for prompt delivery, but do not append a fake prompt arg.
  buildArgs: (_prompt, _imagePaths, _extra, options = {}, runtimeContext = {}) => {
    const args = [];
    args.push("--print", "--output-format", "stream-json", "--stream-partial-output", "--force", "--trust");
    if (runtimeContext.cwd) {
      args.push("--workspace", runtimeContext.cwd);
    }
    if (options.model && options.model !== "default") {
      args.push("--model", options.model);
    }
    return args;
  },
  promptViaStdin: true,
  streamFormat: "json-event-stream",
  eventParser: "cursor-agent"
};

// ../daemon/dist/runtimes/defs/qwen.js
var qwenAgentDef = {
  id: "qwen",
  name: "Qwen Code",
  bin: "qwen",
  versionArgs: ["--version"],
  fallbackModels: [
    DEFAULT_MODEL_OPTION,
    { id: "qwen3-coder-plus", label: "qwen3-coder-plus" },
    { id: "qwen3-coder-flash", label: "qwen3-coder-flash" }
  ],
  // Prompt delivered via stdin (gated by `promptViaStdin: true`) to avoid Windows
  // `spawn ENAMETOOLONG` for large composed prompts. Qwen Code is a
  // Gemini-CLI fork and supports the same `--yolo` non-interactive mode.
  // Qwen Code reads from piped stdin when no positional prompt is supplied.
  // Current Qwen treats/rejects a bare `-` rather than needing it as a stdin sentinel.
  buildArgs: (_prompt, _imagePaths, _extra, options = {}) => {
    const args = ["--yolo"];
    if (options.model && options.model !== "default") {
      args.push("--model", options.model);
    }
    return args;
  },
  promptViaStdin: true,
  streamFormat: "plain"
};

// ../daemon/dist/runtimes/defs/qoder.js
import path6 from "node:path";
var qoderAgentDef = {
  id: "qoder",
  name: "Qoder CLI",
  bin: "qodercli",
  versionArgs: ["--version"],
  fallbackModels: [
    DEFAULT_MODEL_OPTION,
    { id: "lite", label: "Lite" },
    { id: "efficient", label: "Efficient" },
    { id: "auto", label: "Auto" },
    { id: "performance", label: "Performance" },
    { id: "ultimate", label: "Ultimate" }
  ],
  // Qoder print mode exits after the turn. Deliver the composed prompt via
  // stdin to avoid argv length limits, while using stream-json so the daemon
  // can surface text and usage incrementally. `--yolo` is Qoder's documented
  // non-interactive approval flag, and `-w` selects the workspace.
  // Authentication remains Qoder CLI-owned: users can rely on persisted
  // `qodercli login` state, or launch the daemon with
  // QODER_PERSONAL_ACCESS_TOKEN for automation. Do not add that token to
  // static adapter env; unlike Gemini's workspace trust flag it is a user
  // secret and already flows through the inherited process environment.
  buildArgs: (_prompt, imagePaths, extraAllowedDirs = [], options = {}, runtimeContext = {}) => {
    const args = [
      "-p",
      "--output-format",
      "stream-json",
      "--yolo"
    ];
    if (runtimeContext.cwd) {
      args.push("-w", runtimeContext.cwd);
    }
    if (options.model && options.model !== "default") {
      args.push("--model", options.model);
    }
    const dirs = (extraAllowedDirs || []).filter((d) => typeof d === "string" && path6.isAbsolute(d));
    const attachments = (imagePaths || []).filter((p) => typeof p === "string" && path6.isAbsolute(p));
    for (const d of dirs)
      args.push("--add-dir", d);
    for (const p of attachments)
      args.push("--attachment", p);
    return args;
  },
  promptViaStdin: true,
  streamFormat: "qoder-stream-json"
};

// ../daemon/dist/runtimes/defs/copilot.js
var copilotAgentDef = {
  id: "copilot",
  name: "GitHub Copilot CLI",
  bin: "copilot",
  versionArgs: ["--version"],
  // Prompt is delivered via stdin (gated by `promptViaStdin: true`
  // below) to avoid Windows `spawn ENAMETOOLONG` (issue #705):
  // `copilot -p <body>` ships the full composed prompt as a single
  // argv entry, and CreateProcess caps `lpCommandLine` at ~32 KB
  // direct or ~8 KB through a `.cmd` shim. Any non-trivial Open
  // Design prompt blows past that — even a "Hi" expands to several
  // thousand chars after skills + design-system context are composed
  // in.
  //
  // The transport is "omit `-p` entirely, pipe the prompt to stdin"
  // per upstream copilot-cli issue #1046 (closed as already supported,
  // confirmed working on Copilot CLI for `echo "..." | copilot
  // --model <id>` and `cat prompt.txt | copilot --model <id>`). The
  // earlier `-p -` attempt (PR #351) and the argv-bound revert
  // (PR #466) both pre-dated that confirmation: `-p -` made Copilot
  // interpret `-` as a literal one-character prompt, but omitting
  // `-p` entirely is a separate code path that does delegate to
  // stdin under a non-TTY pipe — which is exactly how the daemon
  // spawns the child (`stdio: ['pipe', 'pipe', 'pipe']`).
  //
  // `--allow-all-tools` is still required for non-interactive runs:
  // without it the CLI blocks waiting for human approval on every
  // tool call. Unlike Codex (where `exec` is a dedicated headless
  // subcommand with auto-approve baked in) or Claude Code (which
  // inherits its permission policy from the user's settings.json),
  // Copilot always prompts unless this flag is passed explicitly.
  //
  // `--output-format json` produces JSONL that copilot-stream.js
  // parses into the same typed events as claude-stream.js.
  //
  // `--add-dir` (repeatable, same flag as Claude Code's) widens
  // Copilot's path-level sandbox to skill seeds + design-system
  // specs outside the project cwd.
  //
  // No `models` subcommand; the CLI accepts whatever the user's
  // Copilot subscription exposes. Ship a small evidence-based hint
  // list — the default we observed in the JSON stream and the
  // example from `copilot --help`. Users can paste any other id via
  // Settings.
  fallbackModels: [
    DEFAULT_MODEL_OPTION,
    { id: "claude-sonnet-4.6", label: "Claude Sonnet 4.6" },
    { id: "gpt-5.2", label: "GPT-5.2" }
  ],
  buildArgs: (_prompt, _imagePaths, extraAllowedDirs = [], options = {}) => {
    const args = [
      "--allow-all-tools",
      "--output-format",
      "json"
    ];
    if (options.model && options.model !== "default") {
      args.push("--model", options.model);
    }
    const dirs = (extraAllowedDirs || []).filter((d) => typeof d === "string" && d.length > 0);
    for (const d of dirs)
      args.push("--add-dir", d);
    return args;
  },
  promptViaStdin: true,
  streamFormat: "copilot-stream-json"
};

// ../daemon/dist/runtimes/defs/pi.js
import path7 from "node:path";
var piAgentDef = {
  id: "pi",
  name: "Pi",
  bin: "pi",
  versionArgs: ["--version"],
  // `pi --list-models` prints a TSV table to stderr (not stdout),
  // so we use a custom fetchModels that reads stderr.
  fetchModels: async (resolvedBin, env) => {
    try {
      const { stderr } = await execAgentFile(resolvedBin, ["--list-models"], {
        env,
        timeout: 2e4,
        maxBuffer: 8 * 1024 * 1024
      });
      const parsed = parsePiModels(stderr);
      if (!parsed || parsed.length === 0)
        return null;
      return parsed;
    } catch {
      return null;
    }
  },
  // Fallback models — the most commonly used providers/models when
  // `pi --list-models` fails or times out.
  fallbackModels: [
    DEFAULT_MODEL_OPTION,
    {
      id: "anthropic/claude-sonnet-4-5",
      label: "Claude Sonnet 4.5 (anthropic)"
    },
    { id: "anthropic/claude-opus-4-5", label: "Claude Opus 4.5 (anthropic)" },
    { id: "openai/gpt-5", label: "GPT-5 (openai)" },
    { id: "openai/o4-mini", label: "o4-mini (openai)" },
    { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro (google)" },
    { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash (google)" }
  ],
  // Thinking level presets mapped to pi's --thinking flag.
  reasoningOptions: [
    { id: "default", label: "Default" },
    { id: "off", label: "Off" },
    { id: "minimal", label: "Minimal" },
    { id: "low", label: "Low" },
    { id: "medium", label: "Medium" },
    { id: "high", label: "High" },
    { id: "xhigh", label: "XHigh" }
  ],
  // pi's RPC mode drives the entire conversation over stdio JSON-RPC.
  // The daemon sends a `prompt` command and pi streams back typed events.
  // No prompt in argv — avoids ENAMETOOLONG and keeps the protocol clean.
  buildArgs: (_prompt, _imagePaths, extraAllowedDirs = [], options = {}, runtimeContext = {}) => {
    const args = ["--mode", "rpc"];
    if (options.model && options.model !== "default") {
      args.push("--model", options.model);
    }
    if (options.reasoning && options.reasoning !== "default") {
      args.push("--thinking", options.reasoning);
    }
    const dirs = (extraAllowedDirs || []).filter((d) => typeof d === "string" && path7.isAbsolute(d));
    for (const d of dirs) {
      args.push("--append-system-prompt", d);
    }
    return args;
  },
  // Prompt is sent via RPC `prompt` command on stdin, not as a CLI arg.
  promptViaStdin: true,
  streamFormat: "pi-rpc",
  // pi's RPC `prompt` command supports an `images` field for multimodal
  // input (base64-encoded). The daemon attaches image paths to the
  // session so attachPiRpcSession can read and forward them.
  supportsImagePaths: true
};

// ../daemon/dist/runtimes/defs/kiro.js
var kiroAgentDef = {
  id: "kiro",
  name: "Kiro CLI",
  bin: "kiro-cli",
  versionArgs: ["--version"],
  fetchModels: async (resolvedBin, env) => detectAcpModels({
    bin: resolvedBin,
    args: ["acp"],
    env,
    timeoutMs: 15e3,
    defaultModelOption: DEFAULT_MODEL_OPTION
  }),
  fallbackModels: [DEFAULT_MODEL_OPTION],
  buildArgs: () => ["acp"],
  streamFormat: "acp-json-rpc",
  externalMcpInjection: "acp-merge"
};

// ../daemon/dist/runtimes/defs/kilo.js
var kiloAgentDef = {
  id: "kilo",
  name: "Kilo",
  bin: "kilo",
  versionArgs: ["--version"],
  fetchModels: async (resolvedBin, env) => detectAcpModels({
    bin: resolvedBin,
    args: ["acp"],
    env,
    timeoutMs: 15e3,
    defaultModelOption: DEFAULT_MODEL_OPTION
  }),
  fallbackModels: [DEFAULT_MODEL_OPTION],
  buildArgs: () => ["acp"],
  streamFormat: "acp-json-rpc",
  externalMcpInjection: "acp-merge"
};

// ../daemon/dist/runtimes/defs/vibe.js
var vibeAgentDef = {
  id: "vibe",
  name: "Mistral Vibe CLI",
  bin: "vibe-acp",
  versionArgs: ["--version"],
  fetchModels: async (resolvedBin, env) => detectAcpModels({
    bin: resolvedBin,
    args: [],
    env,
    timeoutMs: 15e3,
    defaultModelOption: DEFAULT_MODEL_OPTION
  }),
  fallbackModels: [DEFAULT_MODEL_OPTION],
  buildArgs: () => [],
  streamFormat: "acp-json-rpc",
  externalMcpInjection: "acp-merge"
};

// ../daemon/dist/runtimes/defs/deepseek.js
var deepseekAgentDef = {
  id: "deepseek",
  name: "DeepSeek TUI",
  // The `deepseek` dispatcher owns the `exec` / `--auto` subcommands and
  // delegates to a sibling TUI runtime binary at exec time. Upstream also
  // ships the same dispatcher as `codewhale` after the CodeWhale rename
  // (issue #2983). The companion `deepseek-tui` / `codewhale-tui` runtime
  // is not probed here — it does not accept the argv shape `buildArgs`
  // produces (`exec --auto <prompt>`).
  bin: "deepseek",
  fallbackBins: ["codewhale"],
  versionArgs: ["--version"],
  // No `models` subcommand that prints a clean id-per-line list; the
  // canonical model ids for DeepSeek V4 are documented in the README,
  // and the CLI accepts arbitrary provider/model strings via `--model`,
  // so users can paste anything else through the custom-model input.
  fallbackModels: [
    DEFAULT_MODEL_OPTION,
    { id: "deepseek-v4-pro", label: "deepseek-v4-pro" },
    { id: "deepseek-v4-flash", label: "deepseek-v4-flash" }
  ],
  // DeepSeek's exec mode requires the prompt as a positional argument
  // (no `-` stdin sentinel; `prompt: String` is a required clap field).
  // `--auto` enables agentic mode with auto-approval — the daemon runs
  // every CLI without a TTY, so the interactive approval prompt would
  // hang the run. Streaming is plain text on stdout (tool calls go to
  // stderr); skipping `--json` keeps deltas streaming live instead of
  // batched into one trailing summary object at end-of-turn.
  buildArgs: (prompt, _imagePaths, _extra, options = {}) => {
    const args = ["exec", "--auto"];
    if (options.model && options.model !== "default") {
      args.push("--model", options.model);
    }
    args.push(prompt);
    return args;
  },
  // Guard against prompts that would blow Windows' ~32 KB CreateProcess
  // limit (or Linux MAX_ARG_STRLEN on extreme edges) before spawn. Every
  // other argv-sensitive adapter sets `promptViaStdin: true` to dodge
  // this; DeepSeek's CLI doesn't accept `-` as a stdin sentinel yet, so
  // we have to ship the prompt as argv. The /api/chat spawn path checks
  // this byte budget against the composed prompt and emits an actionable
  // SSE error ("reduce skills/design-system context, or use an adapter
  // with stdin support") instead of letting the spawn fail with a
  // generic ENAMETOOLONG/E2BIG message. 30_000 bytes leaves ~2.7 KB of
  // argv headroom under the Windows command-line limit for `exec
  // --auto --model <id>` and any internal quoting.
  maxPromptArgBytes: 3e4,
  streamFormat: "plain"
};

// ../daemon/dist/runtimes/defs/aider.js
var aiderAgentDef = {
  id: "aider",
  name: "Aider",
  bin: "aider",
  versionArgs: ["--version"],
  // Aider proxies to whatever LLM the user configures via `--model` and
  // routes through LiteLLM, so any concrete fallback list is necessarily
  // partial. These are the commonly recommended starting points from
  // aider.chat/docs; users can paste anything else through the custom-
  // model input. The id strings follow LiteLLM provider/model spelling
  // so Aider parses them without an extra `--provider` flag.
  fallbackModels: [
    DEFAULT_MODEL_OPTION,
    { id: "sonnet", label: "sonnet" },
    { id: "gpt-4o", label: "gpt-4o" },
    { id: "deepseek/deepseek-chat", label: "deepseek/deepseek-chat" },
    { id: "gemini/gemini-2.0-flash", label: "gemini/gemini-2.0-flash" }
  ],
  // Aider's one-shot mode requires the prompt as `--message <text>` on
  // argv; neither `--message` nor `--message-file` accept `-` as a stdin
  // sentinel (it is treated as a literal filename), so we cannot pipe
  // the prompt in the way qwen/gemini do. Mirror the DeepSeek TUI
  // pattern: ship the prompt as argv with a conservative byte budget so
  // the /api/chat spawn path emits an actionable error before hitting
  // Windows' ~32 KB CreateProcess limit or Linux MAX_ARG_STRLEN.
  //
  // The suppression flags are all there to keep aider runnable without
  // a TTY:
  //   --yes-always                       — skip per-action confirmation
  //   --no-pretty                        — strip ANSI so stdout parses as plain text
  //   --no-stream                        — left as default (streaming on)
  //   --no-git / --no-auto-commits       — the daemon spawns aider inside
  //                                        an OD project workspace that is
  //                                        not the user's git repo, so the
  //                                        commit machinery has nothing
  //                                        useful to do here
  //   --no-suggest-shell-commands        — avoids a follow-up interactive prompt
  //   --no-show-model-warnings           — suppresses model-compat banners
  //                                        that would otherwise prefix every
  //                                        run with noise
  buildArgs: (prompt, _imagePaths, _extra, options = {}) => {
    const args = [
      "--yes-always",
      "--no-pretty",
      "--no-git",
      "--no-auto-commits",
      "--no-suggest-shell-commands",
      "--no-show-model-warnings"
    ];
    if (options.model && options.model !== "default") {
      args.push("--model", options.model);
    }
    args.push("--message", prompt);
    return args;
  },
  maxPromptArgBytes: 3e4,
  streamFormat: "plain",
  installUrl: "https://aider.chat/docs/install.html",
  docsUrl: "https://aider.chat"
};

// ../daemon/dist/runtimes/defs/reasonix.js
var DESIGN_INSTRUCTIONS = `# Open Design integration \u2014 MUST follow

You are running inside Open Design, a design tool. The user message contains
design context (system prompt, skill instructions, design system tokens).
Follow these rules:

1. **Output format**: Wrap your HTML output in <artifact> tags:
   <artifact>
   <!DOCTYPE html>
   <html>...</html>
   </artifact>

2. **Design system**: The user message includes a design system with colors,
   typography, spacing, and component patterns. Apply them consistently.

3. **Skill workflow**: The user message includes a skill (SKILL.md) with
   specific workflow instructions. Follow the skill's steps in order.

4. **No code fences**: Do NOT wrap HTML in \`\`\`html code fences.
   Output raw HTML inside <artifact> tags only.

5. **Single file**: Output a complete, self-contained HTML file with all
   CSS and JS inline. No external dependencies.

6. **Language**: Match the language of the user's prompt.`;
var reasonixAgentDef = {
  id: "reasonix",
  name: "DeepSeek Reasonix",
  bin: "reasonix",
  fallbackBins: ["dsnix"],
  versionArgs: ["--version"],
  fetchModels: async (resolvedBin, env) => detectAcpModels({
    bin: resolvedBin,
    args: ["acp"],
    env,
    timeoutMs: 15e3,
    defaultModelOption: DEFAULT_MODEL_OPTION
  }),
  // Reasonix ships an ACP (Agent Client Protocol) mode via `reasonix acp`
  // that speaks NDJSON JSON-RPC over stdio — the same wire format Hermes,
  // Kimi, Kilo, Kiro, and Vibe use. This avoids the Windows CreateProcess
  // ~32 KB command-line limit entirely: the prompt travels as a JSON-RPC
  // message body through stdin, not as a positional argv entry.
  buildArgs: () => ["acp"],
  streamFormat: "acp-json-rpc",
  mcpDiscovery: "mature-acp",
  externalMcpInjection: "acp-merge",
  // Inject design instructions into Reasonix's system prompt via env var.
  // Reasonix's ACP code reads REASONIX_ACP_SYSTEM_APPEND and appends it
  // to the code system prompt, so the model sees both coding + design rules.
  env: {
    REASONIX_ACP_SYSTEM_APPEND: DESIGN_INSTRUCTIONS
  },
  fallbackModels: [
    DEFAULT_MODEL_OPTION,
    { id: "deepseek-v4-pro", label: "deepseek-v4-pro" },
    { id: "deepseek-v4-flash", label: "deepseek-v4-flash" }
  ],
  installUrl: "https://github.com/esengine/DeepSeek-Reasonix",
  docsUrl: "https://esengine.github.io/DeepSeek-Reasonix/"
};

// ../daemon/dist/runtimes/local-profiles.js
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import path8 from "node:path";
function localAgentProfilesFile() {
  const explicit = process.env.OD_AGENT_PROFILES_CONFIG;
  if (typeof explicit === "string" && explicit.trim()) {
    return explicit.trim();
  }
  return path8.join(homedir(), ".open-design", "agents.local.json");
}
function normalizeStringList(value) {
  if (!Array.isArray(value))
    return [];
  return value.filter((item) => typeof item === "string" && item.length > 0 && !item.includes("\0"));
}
function normalizeEnvMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return {};
  const out = {};
  for (const [key, raw] of Object.entries(value)) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key))
      continue;
    if (typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean") {
      out[key] = String(raw);
    }
  }
  return out;
}
function normalizeModelOptions(value) {
  if (!Array.isArray(value))
    return null;
  const out = [DEFAULT_MODEL_OPTION];
  const seen = /* @__PURE__ */ new Set(["default"]);
  for (const item of value) {
    const id = typeof item === "string" ? item.trim() : item && typeof item === "object" && typeof item.id === "string" ? item.id.trim() : "";
    if (!sanitizeCustomModel(id) || seen.has(id))
      continue;
    seen.add(id);
    const label = item && typeof item === "object" && typeof item.label === "string" ? item.label.trim() : "";
    out.push({ id, label: label || id });
  }
  return out.length > 1 ? out : null;
}
function normalizeDefaultModel(value) {
  return typeof value === "string" ? sanitizeCustomModel(value) : null;
}
function optionsWithDefaultModel(options, defaultModel) {
  if (defaultModel == null || options?.model != null && options.model !== "default") {
    return options;
  }
  return { ...options, model: defaultModel };
}
function createLocalAgentDef(raw, baseDefs) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    return null;
  const profile = raw;
  const id = typeof profile.id === "string" ? profile.id.trim() : "";
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(id))
    return null;
  if (baseDefs.some((def) => def.id === id))
    return null;
  const hasExplicitBaseAgent = typeof profile.baseAgent === "string" && profile.baseAgent.trim().length > 0;
  const baseId = hasExplicitBaseAgent ? profile.baseAgent.trim() : "claude";
  const base = baseDefs.find((def) => def.id === baseId);
  if (!base) {
    if (hasExplicitBaseAgent) {
      console.warn(`[agents] skipping local profile "${id}": unknown baseAgent "${baseId}"`);
    }
    return null;
  }
  const bin = typeof profile.bin === "string" && profile.bin.trim() && !profile.bin.includes("\0") ? profile.bin.trim() : base.bin;
  const name = typeof profile.name === "string" && profile.name.trim() ? profile.name.trim() : id;
  const prefixArgs = normalizeStringList(profile.args ?? profile.prefixArgs);
  const env = normalizeEnvMap(profile.env);
  const fallbackModels = normalizeModelOptions(profile.models ?? profile.fallbackModels) ?? base.fallbackModels;
  const versionArgs = normalizeStringList(profile.versionArgs);
  const helpArgs = normalizeStringList(profile.helpArgs);
  const defaultModel = normalizeDefaultModel(profile.defaultModel);
  return {
    ...base,
    id,
    name,
    bin,
    versionArgs: versionArgs.length > 0 ? versionArgs : base.versionArgs,
    ...helpArgs.length > 0 ? { helpArgs } : {},
    fallbackModels,
    env,
    buildArgs: (prompt, imagePaths, extraAllowedDirs, options, runtimeContext) => [
      ...prefixArgs,
      ...base.buildArgs(prompt, imagePaths, extraAllowedDirs, optionsWithDefaultModel(options, defaultModel), runtimeContext)
    ]
  };
}
function readLocalAgentProfileDefs(baseDefs) {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(localAgentProfilesFile(), "utf8"));
  } catch {
    return [];
  }
  const profiles = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" && Array.isArray(parsed.agents) ? parsed.agents : [];
  const defs = [];
  const seen = new Set(baseDefs.map((def) => def.id));
  for (const profile of profiles) {
    const def = createLocalAgentDef(profile, baseDefs);
    if (!def || seen.has(def.id))
      continue;
    seen.add(def.id);
    defs.push(def);
  }
  return defs;
}

// ../daemon/dist/runtimes/registry.js
var BASE_AGENT_DEFS = [
  amrAgentDef,
  claudeAgentDef,
  codexAgentDef,
  devinAgentDef,
  geminiAgentDef,
  opencodeAgentDef,
  hermesAgentDef,
  traeCliAgentDef,
  grokBuildAgentDef,
  kimiAgentDef,
  cursorAgentDef,
  qwenAgentDef,
  qoderAgentDef,
  copilotAgentDef,
  piAgentDef,
  kiroAgentDef,
  kiloAgentDef,
  vibeAgentDef,
  deepseekAgentDef,
  aiderAgentDef,
  antigravityAgentDef,
  reasonixAgentDef
];
function readLocalAgentProfileDefs2(baseDefs = BASE_AGENT_DEFS) {
  return readLocalAgentProfileDefs(baseDefs);
}
var AGENT_DEFS = [
  ...BASE_AGENT_DEFS,
  ...readLocalAgentProfileDefs2(BASE_AGENT_DEFS)
];
var ids = /* @__PURE__ */ new Set();
for (const def of AGENT_DEFS) {
  if (ids.has(def.id)) {
    throw new Error(`Duplicate agent definition id: ${def.id}`);
  }
  ids.add(def.id);
}
function getAgentDef(id) {
  return AGENT_DEFS.find((a) => a.id === id) || null;
}

// ../daemon/dist/runtimes/launch.js
import { accessSync as accessSync2, constants as constants2, readdirSync, readFileSync as readFileSync2, realpathSync, statSync as statSync2 } from "node:fs";
import path11, { delimiter as delimiter2 } from "node:path";

// ../daemon/dist/runtimes/executables.js
import { accessSync, constants, existsSync, statSync } from "node:fs";
import { delimiter } from "node:path";
import path10 from "node:path";
import { homedir as homedir3 } from "node:os";

// ../daemon/dist/runtimes/paths.js
import path9 from "node:path";
import { homedir as homedir2 } from "node:os";
function expandConfiguredEnv(configuredEnv) {
  const out = {};
  if (!configuredEnv || typeof configuredEnv !== "object")
    return out;
  for (const [key, value] of Object.entries(configuredEnv)) {
    if (typeof value !== "string")
      continue;
    out[key] = expandHomePath(value);
  }
  return out;
}
function expandHomePath(value) {
  if (value === "~")
    return homedir2();
  if (value.startsWith("~/") || value.startsWith("~\\")) {
    return path9.join(homedir2(), value.slice(2));
  }
  return value;
}

// ../daemon/dist/runtimes/executables.js
var AGENT_BIN_ENV_KEYS = /* @__PURE__ */ new Map([
  ["amr", "VELA_BIN"],
  ["aider", "AIDER_BIN"],
  ["claude", "CLAUDE_BIN"],
  ["codex", "CODEX_BIN"],
  ["copilot", "COPILOT_BIN"],
  ["cursor-agent", "CURSOR_AGENT_BIN"],
  ["deepseek", "DEEPSEEK_BIN"],
  ["devin", "DEVIN_BIN"],
  ["gemini", "GEMINI_BIN"],
  ["hermes", "HERMES_BIN"],
  ["kimi", "KIMI_BIN"],
  ["kiro", "KIRO_BIN"],
  ["kilo", "KILO_BIN"],
  ["opencode", "OPENCODE_BIN"],
  ["pi", "PI_BIN"],
  ["qoder", "QODER_BIN"],
  ["qwen", "QWEN_BIN"],
  ["reasonix", "REASONIX_BIN"],
  ["trae-cli", "TRAE_CLI_BIN"],
  ["vibe", "VIBE_BIN"]
]);
var TOOLCHAIN_DIR_CACHE_TTL_MS = 5e3;
var cachedToolchainHome = null;
var cachedToolchainDirs = null;
var cachedToolchainDirsAt = 0;
function userToolchainDirs() {
  const homeOverride = process.env.OD_AGENT_HOME;
  const home = homeOverride || homedir3();
  const now = Date.now();
  if (cachedToolchainHome === home && cachedToolchainDirs && now - cachedToolchainDirsAt < TOOLCHAIN_DIR_CACHE_TTL_MS) {
    return cachedToolchainDirs;
  }
  cachedToolchainHome = home;
  cachedToolchainDirsAt = now;
  cachedToolchainDirs = wellKnownUserToolchainBins({
    home,
    includeSystemBins: process.platform !== "win32" && !homeOverride,
    env: homeOverride ? {} : process.env
  });
  return cachedToolchainDirs;
}
function resolvePathDirs() {
  const seen = /* @__PURE__ */ new Set();
  const dirs = [
    ...(process.env.PATH || "").split(delimiter),
    // GUI launchers (macOS .app bundles, Linux .desktop files) often start
    // with a minimal PATH. Include common user-level CLI install locations
    // so agent detection matches the user's shell-installed tools,
    // especially Node version managers.
    ...userToolchainDirs()
  ];
  return dirs.filter((dir) => {
    if (!dir || seen.has(dir))
      return false;
    seen.add(dir);
    return true;
  });
}
function resolveOnPath(bin) {
  const exts = process.platform === "win32" ? (process.env.PATHEXT || ".EXE;.CMD;.BAT").split(";") : [""];
  const dirs = resolvePathDirs();
  for (const dir of dirs) {
    for (const ext of exts) {
      const full = path10.join(dir, bin + ext);
      if (full && existsSync(full))
        return full;
    }
  }
  return null;
}
function looksExecutableOnWindows(filePath) {
  const ext = path10.extname(filePath).trim().toUpperCase();
  if (!ext)
    return false;
  const executableExts = (process.env.PATHEXT || ".EXE;.CMD;.BAT").split(";").map((value) => value.trim().toUpperCase()).filter(Boolean);
  return executableExts.includes(ext);
}
function executableFilePath(raw) {
  if (typeof raw !== "string" || raw.trim().length === 0)
    return null;
  const expanded = expandHomePath(raw.trim());
  if (!path10.isAbsolute(expanded))
    return null;
  try {
    if (!statSync(expanded).isFile())
      return null;
    if (process.platform === "win32") {
      if (!looksExecutableOnWindows(expanded))
        return null;
    } else {
      accessSync(expanded, constants.X_OK);
    }
    return expanded;
  } catch {
    return null;
  }
}
function configuredExecutableOverride(def, configuredEnv = {}) {
  const envKey = AGENT_BIN_ENV_KEYS.get(def?.id);
  if (!envKey)
    return null;
  return executableFilePath(configuredEnv?.[envKey]);
}
function resolveAmrOpenCodeExecutable(env = process.env) {
  const configured = executableFilePath(env.VELA_OPENCODE_BIN);
  if (configured)
    return configured;
  const resourceRoot = (env.OD_RESOURCE_ROOT ?? process.env.OD_RESOURCE_ROOT)?.trim();
  if (resourceRoot) {
    const bundledDir = packagedVelaOpenCodeCompanionTree(resourceRoot);
    if (bundledDir) {
      const bundled = executableFilePath(path10.join(bundledDir, process.platform === "win32" ? "opencode.exe" : "opencode"));
      if (bundled)
        return bundled;
    }
  }
  return resolveOnPath("opencode-cli") ?? resolveOnPath("opencode");
}
function packagedVelaOpenCodeCompanionTree(resourceRoot) {
  const candidate = path10.join(resourceRoot, "bin", "libexec", "opencode");
  const exe = path10.join(candidate, process.platform === "win32" ? "opencode.exe" : "opencode");
  try {
    if (!statSync(candidate).isDirectory())
      return null;
    if (!statSync(exe).isFile())
      return null;
    if (process.platform === "win32") {
      if (!looksExecutableOnWindows(exe))
        return null;
    } else {
      accessSync(exe, constants.X_OK);
    }
    return candidate;
  } catch {
    return null;
  }
}
function packagedBuiltInExecutable(def, configuredEnv = {}) {
  if (def.id !== "amr")
    return null;
  const resourceRoot = process.env.OD_RESOURCE_ROOT?.trim();
  if (!resourceRoot)
    return null;
  if (!resolveAmrOpenCodeExecutable({ ...process.env, ...configuredEnv }) && !packagedVelaOpenCodeCompanionTree(resourceRoot)) {
    return null;
  }
  const candidate = path10.join(resourceRoot, "bin", process.platform === "win32" ? "vela.exe" : "vela");
  try {
    if (!statSync(candidate).isFile())
      return null;
    if (process.platform === "win32") {
      if (!looksExecutableOnWindows(candidate))
        return null;
    } else {
      accessSync(candidate, constants.X_OK);
    }
    return candidate;
  } catch {
    return null;
  }
}
function inspectAgentExecutableResolution(def, configuredEnv = {}) {
  if (!def?.bin) {
    return {
      configuredOverridePath: null,
      pathResolvedPath: null,
      selectedPath: null
    };
  }
  const configuredOverridePath = configuredExecutableOverride(def, configuredEnv);
  const candidates = [
    def.bin,
    ...Array.isArray(def.fallbackBins) ? def.fallbackBins : []
  ];
  let pathResolvedPath = null;
  for (const bin of candidates) {
    const resolved = resolveOnPath(bin);
    if (resolved) {
      pathResolvedPath = resolved;
      break;
    }
  }
  const builtInPath = packagedBuiltInExecutable(def, configuredEnv);
  return {
    configuredOverridePath,
    pathResolvedPath,
    selectedPath: configuredOverridePath || builtInPath || pathResolvedPath
  };
}

// ../daemon/dist/runtimes/launch.js
function resolveAgentLaunch(def, configuredEnv = {}) {
  const resolution = inspectAgentExecutableResolution(def, configuredEnv);
  if (!resolution.selectedPath) {
    return { ...resolution, launchPath: null, launchKind: "selected", childPathPrepend: [], diagnostic: null };
  }
  const childPathPrepend = path11.isAbsolute(resolution.selectedPath) ? [path11.dirname(resolution.selectedPath)] : [];
  if (def.id !== "codex") {
    return { ...resolution, launchPath: resolution.selectedPath, launchKind: "selected", childPathPrepend, diagnostic: null };
  }
  const native = tryResolveCodexNativeBinary(resolution.selectedPath);
  return {
    ...resolution,
    launchPath: native.path ?? resolution.selectedPath,
    launchKind: native.path ? "codex-native" : "selected",
    childPathPrepend: [...childPathPrepend, ...native.childPathPrepend],
    diagnostic: native.diagnostic
  };
}
function applyAgentLaunchEnv(env, launch, nodeBinDir = path11.dirname(process.execPath)) {
  const toPrepend = [...nodeBinDir ? [nodeBinDir] : [], ...launch.childPathPrepend];
  if (toPrepend.length === 0)
    return env;
  const pathKey = Object.keys(env).find((k) => k.toLowerCase() === "path") ?? "PATH";
  const existing = typeof env[pathKey] === "string" ? env[pathKey] : "";
  const normalize = (p) => {
    const trimmed = p.replace(/[/\\]+$/, "");
    return process.platform === "win32" ? trimmed.toLowerCase() : trimmed;
  };
  const existingParts = existing.split(delimiter2).filter((e) => e.length > 0);
  const seen = /* @__PURE__ */ new Set();
  const merged = [];
  for (const entry of [...toPrepend, ...existingParts]) {
    const n = normalize(entry);
    if (!seen.has(n)) {
      seen.add(n);
      merged.push(entry);
    }
  }
  return { ...env, [pathKey]: merged.join(delimiter2) };
}
function tryResolveCodexNativeBinary(wrapperPath) {
  const packageSuffix = codexNativePackageSuffix();
  const targetTriple = codexNativeTargetTriple();
  for (const root of codexSearchRoots(wrapperPath)) {
    for (const candidate of codexNativeCandidates(root, packageSuffix, targetTriple)) {
      if (isExecutableFile(candidate.path)) {
        return { path: candidate.path, childPathPrepend: existingDirectories(candidate.childPathPrepend), diagnostic: null };
      }
    }
  }
  if (!looksLikeCodexNodeWrapper(wrapperPath))
    return { path: null, childPathPrepend: [], diagnostic: null };
  return {
    path: null,
    childPathPrepend: [],
    diagnostic: `Codex native binary was not found for ${packageSuffix}/${targetTriple}; falling back to wrapper ${wrapperPath}. Set CODEX_BIN to a native Codex binary if this wrapper cannot launch from a GUI environment.`
  };
}
function codexSearchRoots(wrapperPath) {
  const roots = /* @__PURE__ */ new Set();
  for (const seed of [wrapperPath, safeRealpath(wrapperPath)]) {
    if (!seed)
      continue;
    let current = path11.dirname(seed);
    while (current !== path11.dirname(current)) {
      roots.add(current);
      current = path11.dirname(current);
    }
  }
  return [...roots];
}
function codexNativeCandidates(root, packageSuffix, targetTriple) {
  const scoped = path11.join(root, "node_modules", "@openai");
  const packageDirs = [path11.join(scoped, `codex-${packageSuffix}`)];
  try {
    for (const entry of readdirSync(scoped, { encoding: "utf8", withFileTypes: true })) {
      if (entry.isDirectory() && entry.name.startsWith("codex-"))
        packageDirs.push(path11.join(scoped, entry.name));
    }
  } catch {
  }
  return [...new Set(packageDirs)].flatMap((dir) => {
    const vendorPathDir = path11.join(dir, "vendor", targetTriple, "path");
    const childPathPrepend = [vendorPathDir];
    return [
      { path: path11.join(dir, "vendor", targetTriple, "codex", "codex"), childPathPrepend },
      { path: path11.join(dir, "vendor", targetTriple, "codex", "codex.exe"), childPathPrepend },
      { path: path11.join(dir, "codex"), childPathPrepend },
      { path: path11.join(dir, "bin", "codex"), childPathPrepend },
      { path: path11.join(dir, "vendor", "codex"), childPathPrepend },
      { path: path11.join(dir, "codex.exe"), childPathPrepend },
      { path: path11.join(dir, "bin", "codex.exe"), childPathPrepend }
    ];
  });
}
function codexNativePackageSuffix() {
  return `${process.platform}-${process.arch}`;
}
function codexNativeTargetTriple() {
  if (process.platform === "darwin" && process.arch === "arm64")
    return "aarch64-apple-darwin";
  if (process.platform === "darwin" && process.arch === "x64")
    return "x86_64-apple-darwin";
  if (process.platform === "linux" && process.arch === "arm64")
    return "aarch64-unknown-linux-musl";
  if (process.platform === "linux" && process.arch === "x64")
    return "x86_64-unknown-linux-musl";
  if (process.platform === "win32" && process.arch === "arm64")
    return "aarch64-pc-windows-msvc";
  if (process.platform === "win32" && process.arch === "x64")
    return "x86_64-pc-windows-msvc";
  return `${process.platform}-${process.arch}`;
}
function looksLikeCodexNodeWrapper(filePath) {
  try {
    const body = readFileSync2(filePath, { encoding: "utf8" }).slice(0, 64e3);
    return /node|@openai\/codex|codex-/i.test(body);
  } catch {
    return false;
  }
}
function safeRealpath(filePath) {
  try {
    return realpathSync(filePath);
  } catch {
    return null;
  }
}
function existingDirectories(dirs) {
  return dirs.filter((dir) => {
    try {
      return statSync2(dir).isDirectory();
    } catch {
      return false;
    }
  });
}
function isExecutableFile(filePath) {
  try {
    if (!statSync2(filePath).isFile())
      return false;
    if (process.platform !== "win32")
      accessSync2(filePath, constants2.X_OK);
    return true;
  } catch {
    return false;
  }
}

// ../daemon/dist/runtimes/env.js
import path12 from "node:path";

// ../daemon/dist/integrations/vela-profile.js
var AMR_PROFILE_ENV = "OPEN_DESIGN_AMR_PROFILE";
var DEFAULT_PROFILE = "prod";
var ALLOWED_PROFILES = /* @__PURE__ */ new Set(["prod", "test", "local"]);
function resolveAmrProfile(env = process.env) {
  const raw = (env[AMR_PROFILE_ENV] || "").trim();
  if (!raw)
    return DEFAULT_PROFILE;
  if (ALLOWED_PROFILES.has(raw))
    return raw;
  console.warn(`[amr] invalid ${AMR_PROFILE_ENV}="${raw}"; falling back to ${DEFAULT_PROFILE}`);
  return DEFAULT_PROFILE;
}
function amrVelaProfileEnv(env = process.env) {
  return { VELA_PROFILE: resolveAmrProfile(env) };
}

// ../daemon/dist/runtimes/env.js
function spawnEnvForAgent(agentId, baseEnv, configuredEnv = {}, systemProxyEnv = resolveSystemProxyEnv()) {
  const env = mergeProxyAwareEnv(process.platform, systemProxyEnv, baseEnv, expandConfiguredEnv(configuredEnv));
  if (agentId === "amr") {
    Object.assign(env, amrVelaProfileEnv(env));
    if (!env.OPENCODE_TEST_HOME?.trim() && env.OD_DATA_DIR?.trim()) {
      env.OPENCODE_TEST_HOME = path12.join(env.OD_DATA_DIR.trim(), "amr", "opencode-home");
    }
    if (!env.VELA_OPENCODE_BIN?.trim()) {
      const opencodeBin = resolveAmrOpenCodeExecutable(env);
      if (opencodeBin)
        env.VELA_OPENCODE_BIN = opencodeBin;
    }
    return env;
  }
  if (agentId === "claude") {
    stripUnlessCustomBaseUrl(env, "ANTHROPIC_BASE_URL", ["ANTHROPIC_API_KEY"]);
    return env;
  }
  if (agentId === "codex") {
    stripUnlessCustomBaseUrl(env, "OPENAI_BASE_URL", [
      "OPENAI_API_KEY",
      "CODEX_API_KEY"
    ]);
    return env;
  }
  return env;
}
function stripUnlessCustomBaseUrl(env, baseUrlKey, secretKeys) {
  const baseUrlKeyUpper = baseUrlKey.toUpperCase();
  const hasCustomBaseUrl = Object.keys(env).some((k) => k.toUpperCase() === baseUrlKeyUpper && typeof env[k] === "string" && env[k].trim() !== "");
  if (hasCustomBaseUrl)
    return;
  const secretKeysUpper = new Set(secretKeys.map((k) => k.toUpperCase()));
  for (const key of Object.keys(env)) {
    if (secretKeysUpper.has(key.toUpperCase()))
      delete env[key];
  }
}

// ../daemon/dist/runtimes/auth.js
var CURSOR_AUTH_GUIDANCE = "Cursor Agent is not authenticated. Run `cursor-agent login`, then `cursor-agent status`, and retry. For automation, ensure CURSOR_API_KEY is set in the Open Design process environment.";
var DEEPSEEK_AUTH_GUIDANCE = 'DeepSeek TUI is installed but is not authenticated. Add or verify your API key in `~/.deepseek/config.toml` as `api_key = "..."`, or expose DEEPSEEK_API_KEY to the Open Design daemon process, then retry. If Open Design is launched outside an interactive shell, shell rc files such as ~/.zshrc may not be loaded.';
var ANTIGRAVITY_AUTH_GUIDANCE = "Antigravity needs to sign in. The agy CLI's keyring entry has expired or been cleared, and `-p` print mode cannot complete OAuth on its own (it has no field to paste the auth code into).\n\nFix: open a terminal and run `agy` once \u2014 it will open Google sign-in in your browser, accept the redirect, and store the token in your system keyring. After you finish, return here and retry this chat. You only need to do this once; the keyring entry persists across both terminal and Open Design runs.";
var ANTIGRAVITY_QUOTA_GUIDANCE = 'Antigravity returned "RESOURCE_EXHAUSTED: Individual quota reached" for the current model. Each Antigravity model (Gemini 3 Pro / Flash, Claude 4.6, GPT-OSS) has its own quota.\n\nFix: open `agy` in a terminal and use its Switch Model picker (the menu at the bottom of the TUI) to pick a model with available quota, then retry here. Open Design uses whatever model you pick in agy\'s TUI when the Settings model picker is left on "Default". Quotas reset automatically on Antigravity\'s schedule.';
var REASONIX_AUTH_GUIDANCE = "DeepSeek Reasonix is installed but is not authenticated. Add your API key in `~/.reasonix/config.json` under `apiKey`, or expose DEEPSEEK_API_KEY to the Open Design daemon process, then retry. If Open Design is launched outside an interactive shell, shell rc files such as ~/.zshrc may not be loaded.";
function cursorAuthGuidance() {
  return CURSOR_AUTH_GUIDANCE;
}
function deepseekAuthGuidance() {
  return DEEPSEEK_AUTH_GUIDANCE;
}
function antigravityAuthGuidance() {
  return ANTIGRAVITY_AUTH_GUIDANCE;
}
function antigravityQuotaGuidance() {
  return ANTIGRAVITY_QUOTA_GUIDANCE;
}
function reasonixAuthGuidance() {
  return REASONIX_AUTH_GUIDANCE;
}
function isCursorAuthFailureText(text) {
  const value = String(text || "");
  if (!value.trim())
    return false;
  return /authentication required/i.test(value) || /not authenticated/i.test(value) || /not logged in/i.test(value) || /unauthenticated/i.test(value) || /agent login/i.test(value) || /cursor_api_key/i.test(value);
}
function isAntigravityAuthFailureText(text) {
  const value = String(text || "");
  if (!value.trim())
    return false;
  return /authentication required.*please visit/i.test(value) || /authentication timed out/i.test(value) || /not logged into antigravity/i.test(value) || /accounts\.google\.com\/o\/oauth2\/auth.*antigravity/i.test(value);
}
function isDeepSeekAuthFailureText(text) {
  const value = String(text || "");
  if (!value.trim())
    return false;
  return /KEY=<your-key>/i.test(value) || /api_key\s*=\s*["']<your-key>["']/i.test(value) || /~\/\.deepseek\/config\.toml/i.test(value) && /api[_ -]?key|KEY=/i.test(value) || /DEEPSEEK_API_KEY/i.test(value) && /auth|api[_ -]?key|missing|not set|required|unauthorized/i.test(value);
}
function isReasonixAuthFailureText(text) {
  const value = String(text || "");
  if (!value.trim())
    return false;
  return /~\/\.reasonix\/config\.json/i.test(value) && /api[_ -]?key|missing|not set|required|unauthorized|invalid/i.test(value) || /DEEPSEEK_API_KEY/i.test(value) && /auth|missing|not set|required|unauthorized|invalid/i.test(value);
}
function classifyAgentAuthFailure(agentId, text) {
  if (agentId === "cursor-agent") {
    if (!isCursorAuthFailureText(text))
      return null;
    return {
      status: "missing",
      message: cursorAuthGuidance()
    };
  }
  if (agentId === "deepseek") {
    if (!isDeepSeekAuthFailureText(text))
      return null;
    return {
      status: "missing",
      message: deepseekAuthGuidance()
    };
  }
  if (agentId === "antigravity") {
    if (!isAntigravityAuthFailureText(text))
      return null;
    return {
      status: "missing",
      message: antigravityAuthGuidance()
    };
  }
  if (agentId === "reasonix") {
    if (!isReasonixAuthFailureText(text))
      return null;
    return {
      status: "missing",
      message: reasonixAuthGuidance()
    };
  }
  return null;
}
var STATUS_CTX = "(?:\\bhttp(?:[ /]?\\d(?:\\.\\d)?)?\\b|\\b(?:status|error|response)(?:[ _-]?code)?\\b|\\bcode(?=\\s*[:=#])|\\b(?:server|http)[ _-]?error\\b)[\\s:=#-]*";
var AGENT_AUTH_FAILURE_RE = new RegExp(`(\\b(unauthor(?:ized|ised)|authenticat(?:e|ed|ion)|invalid[ _-]?(?:api[ _-]?)?key|incorrect api key|x-api-key|not (?:authenticated|logged[ _-]?in)|please (?:sign|log)[ _-]?in|oauth token (?:has )?expired|session expired|credentials? (?:are )?(?:missing|invalid|required))\\b|\\/login\\b|${STATUS_CTX}401\\b)`, "i");
var AGENT_RATE_FAILURE_RE = new RegExp(`(\\b(rate[ _-]?limit|too many requests|quota|insufficient[ _-]?(?:quota|balance|credit|funds)|credit balance is too low|exceeded your current quota|usage limit|billing (?:hard )?limit)\\b|${STATUS_CTX}429\\b)`, "i");
var AGENT_UPSTREAM_FAILURE_RE = new RegExp(`(\\b(overloaded(?:_error)?|service (?:is )?(?:temporarily )?unavailable|bad gateway|gateway timeout|internal server error|upstream (?:error|unavailable)|provider (?:error|unavailable)|temporarily unavailable|model is currently overloaded|5xx)\\b|${STATUS_CTX}5\\d\\d\\b|\\b5\\d\\d\\s+(?:bad gateway|service unavailable|internal server error|gateway timeout))`, "i");
function classifyAgentServiceFailure(text) {
  const value = String(text || "");
  if (!value.trim())
    return null;
  if (AGENT_AUTH_FAILURE_RE.test(value))
    return "AGENT_AUTH_REQUIRED";
  if (AGENT_RATE_FAILURE_RE.test(value))
    return "RATE_LIMITED";
  if (AGENT_UPSTREAM_FAILURE_RE.test(value))
    return "UPSTREAM_UNAVAILABLE";
  return null;
}
var PROBE_TAIL_BYTES = 400;
function tailString(value) {
  if (typeof value !== "string")
    return void 0;
  const trimmed = value.trim();
  if (!trimmed)
    return void 0;
  return trimmed.length > PROBE_TAIL_BYTES ? trimmed.slice(-PROBE_TAIL_BYTES) : trimmed;
}
function withProbeTails(base, stdoutText, stderrText) {
  const result = { ...base };
  const stdoutTail = tailString(stdoutText);
  const stderrTail = tailString(stderrText);
  if (stdoutTail)
    result.stdoutTail = stdoutTail;
  if (stderrTail)
    result.stderrTail = stderrTail;
  return result;
}
async function probeAgentAuthStatus(agentId, resolvedBin, env) {
  if (agentId !== "cursor-agent")
    return null;
  try {
    const { stdout, stderr } = await execAgentFile(resolvedBin, ["status"], {
      env,
      timeout: 5e3,
      maxBuffer: 1024 * 1024
    });
    const stdoutText = typeof stdout === "string" ? stdout : "";
    const stderrText = typeof stderr === "string" ? stderr : "";
    const output = `${stdoutText}
${stderrText}`;
    if (isCursorAuthFailureText(output)) {
      return withProbeTails({ status: "missing", message: cursorAuthGuidance(), exitCode: 0, signal: null }, stdoutText, stderrText);
    }
    return { status: "ok" };
  } catch (error) {
    const err = error;
    const stdoutText = typeof err.stdout === "string" ? err.stdout : "";
    const stderrText = typeof err.stderr === "string" ? err.stderr : "";
    const output = [err.message, stdoutText, stderrText].join("\n");
    const numericExit = typeof err.code === "number" ? err.code : null;
    const childSignal = typeof err.signal === "string" ? err.signal : null;
    if (isCursorAuthFailureText(output)) {
      return withProbeTails({
        status: "missing",
        message: cursorAuthGuidance(),
        exitCode: numericExit,
        signal: childSignal
      }, stdoutText, stderrText);
    }
    return withProbeTails({
      status: "unknown",
      message: "Cursor Agent authentication status could not be verified with `cursor-agent status`.",
      exitCode: numericExit,
      signal: childSignal
    }, stdoutText, stderrText);
  }
}

// ../daemon/dist/runtimes/metadata.js
var AGENT_INSTALL_LINKS = {
  amr: {
    installUrl: "https://github.com/nexu-io/vela",
    docsUrl: "https://github.com/nexu-io/open-design/blob/main/docs/new-agent-runtime-acp.md"
  },
  claude: {
    installUrl: "https://docs.anthropic.com/en/docs/claude-code/setup",
    docsUrl: "https://docs.anthropic.com/en/docs/claude-code"
  },
  codex: {
    installUrl: "https://github.com/openai/codex",
    docsUrl: "https://developers.openai.com/codex"
  },
  devin: {
    installUrl: "https://cli.devin.ai/docs",
    docsUrl: "https://docs.devin.ai"
  },
  gemini: {
    installUrl: "https://github.com/google-gemini/gemini-cli",
    docsUrl: "https://github.com/google-gemini/gemini-cli/blob/main/README.md"
  },
  opencode: {
    installUrl: "https://opencode.ai/docs",
    docsUrl: "https://github.com/sst/opencode"
  },
  hermes: {
    installUrl: "https://github.com/nexu-io/open-design/blob/main/docs/agent-adapters.md",
    docsUrl: "https://hermes-agent.nousresearch.com/docs/"
  },
  "trae-cli": {
    installUrl: "https://www.volcengine.com/docs/86677/2227861?lang=zh",
    docsUrl: "https://www.volcengine.com/docs/86677/2227861?lang=zh"
  },
  kimi: {
    installUrl: "https://github.com/MoonshotAI/kimi-cli",
    docsUrl: "https://www.kimi.com/code/docs/en/kimi-cli/guides/getting-started.html"
  },
  "cursor-agent": {
    installUrl: "https://cursor.com/docs/cli/overview",
    docsUrl: "https://docs.cursor.com/en/cli/overview"
  },
  qwen: {
    installUrl: "https://github.com/QwenLM/qwen-code",
    docsUrl: "https://qwenlm.github.io/qwen-code-docs/en/index"
  },
  qoder: {
    installUrl: "https://qoder.com/download",
    docsUrl: "https://docs.qoder.com"
  },
  copilot: {
    installUrl: "https://github.com/github/copilot-cli",
    docsUrl: "https://docs.github.com/en/copilot/how-tos/use-copilot-extensions/use-in-cli"
  },
  pi: {
    installUrl: "https://github.com/nexu-io/open-design/blob/main/docs/agent-adapters.md",
    docsUrl: "https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/README.md"
  },
  kiro: {
    installUrl: "https://kiro.dev",
    docsUrl: "https://kiro.dev/docs/cli/"
  },
  kilo: {
    installUrl: "https://kilo.ai",
    docsUrl: "https://kilo.ai/docs/cli"
  },
  vibe: {
    installUrl: "https://docs.mistral.ai",
    docsUrl: "https://github.com/mistralai/vibe-acp"
  },
  deepseek: {
    installUrl: "https://github.com/Hmbown/CodeWhale",
    docsUrl: "https://github.com/Hmbown/CodeWhale/blob/main/README.md"
  }
};
function sanitizeHttpsUrl(value) {
  if (!value)
    return void 0;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" ? parsed.toString() : void 0;
  } catch {
    return void 0;
  }
}
function installMetaForAgent(agentId) {
  const meta = AGENT_INSTALL_LINKS[agentId];
  if (!meta)
    return {};
  const installUrl = sanitizeHttpsUrl(meta.installUrl);
  const docsUrl = sanitizeHttpsUrl(meta.docsUrl);
  return {
    ...installUrl ? { installUrl } : {},
    ...docsUrl ? { docsUrl } : {}
  };
}

// ../daemon/dist/runtimes/detection.js
async function fetchModels(def, resolvedBin, env) {
  if (typeof def.fetchModels === "function") {
    try {
      const parsed = await def.fetchModels(resolvedBin, env);
      if (!parsed || parsed.length === 0) {
        return { models: def.fallbackModels, source: "fallback" };
      }
      return { models: parsed, source: "live" };
    } catch {
      return { models: def.fallbackModels, source: "fallback" };
    }
  }
  if (!def.listModels) {
    return { models: def.fallbackModels, source: "fallback" };
  }
  try {
    const { stdout } = await execAgentFile(resolvedBin, def.listModels.args, {
      env,
      timeout: def.listModels.timeoutMs ?? 5e3,
      // Models lists from popular CLIs (e.g. opencode) easily exceed the
      // default 1MB buffer once you include every openrouter model. Bump
      // it so we don't truncate the listing.
      maxBuffer: 8 * 1024 * 1024
    });
    const parsed = def.listModels.parse(String(stdout));
    if (!parsed || parsed.length === 0) {
      return { models: def.fallbackModels, source: "fallback" };
    }
    return { models: parsed, source: "live" };
  } catch {
    return { models: def.fallbackModels, source: "fallback" };
  }
}
async function probeVersionAtPath(def, resolved, env) {
  try {
    const { stdout } = await execAgentFile(resolved, def.versionArgs, {
      env,
      timeout: def.versionProbeTimeoutMs ?? 3e3
    });
    const version = String(stdout).trim().split("\n")[0] ?? null;
    return { kind: "spawned", version };
  } catch (err) {
    const code = err?.code;
    if (typeof code === "string") {
      if (code === "ENOENT" || code === "EACCES" || code === "ENOTDIR") {
        return { kind: "not-invocable" };
      }
    } else if (typeof code === "number" && (code === 126 || code === 127)) {
      return { kind: "not-invocable" };
    }
    return { kind: "spawned", version: null };
  }
}
function unavailableAgent(def) {
  return {
    ...stripFns(def),
    models: def.fallbackModels ?? [DEFAULT_MODEL_OPTION],
    modelsSource: "fallback",
    available: false,
    ...installMetaForAgent(def.id)
  };
}
async function probe(def, configuredEnv = {}) {
  const launch = resolveAgentLaunch(def, configuredEnv);
  if (!launch.selectedPath || !launch.launchPath) {
    return unavailableAgent(def);
  }
  const probeEnv = applyAgentLaunchEnv(spawnEnvForAgent(def.id, {
    ...process.env,
    ...def.env || {}
  }, configuredEnv), launch);
  const outcome = await probeVersionAtPath(def, launch.launchPath, probeEnv);
  if (outcome.kind === "not-invocable") {
    return unavailableAgent(def);
  }
  if (def.helpArgs && def.capabilityFlags) {
    const caps = {};
    try {
      const { stdout } = await execAgentFile(launch.launchPath, def.helpArgs, {
        env: probeEnv,
        timeout: 5e3,
        maxBuffer: 4 * 1024 * 1024
      });
      for (const [flag, key] of Object.entries(def.capabilityFlags)) {
        caps[key] = String(stdout).includes(flag);
      }
    } catch {
    }
    agentCapabilities.set(def.id, caps);
  }
  const modelResult = await fetchModels(def, launch.launchPath, probeEnv);
  const auth = await probeAgentAuthStatus(def.id, launch.launchPath, probeEnv);
  return {
    ...stripFns(def),
    models: modelResult.models,
    modelsSource: modelResult.source,
    available: true,
    path: launch.selectedPath,
    version: outcome.version,
    ...auth ? {
      authStatus: auth.status,
      ...auth.message ? { authMessage: auth.message } : {}
    } : {},
    ...installMetaForAgent(def.id)
  };
}
function stripFns(def) {
  const { buildArgs, listModels, fetchModels: fetchModels2, fallbackModels, helpArgs, capabilityFlags, fallbackBins, versionProbeTimeoutMs, maxPromptArgBytes, env, ...rest } = def;
  return rest;
}
async function safeProbe(def, configuredEnv = {}) {
  try {
    return await probe(def, configuredEnv);
  } catch {
    return unavailableAgent(def);
  }
}
async function detectAgents(configuredEnvByAgent = {}) {
  const results = await Promise.all(AGENT_DEFS.map((def) => safeProbe(def, configuredEnvByAgent?.[def.id] ?? {})));
  for (const agent of results) {
    rememberLiveModels(agent.id, agent.models);
  }
  return results;
}

// ../daemon/dist/runtimes/mcp.js
function buildLiveArtifactsMcpServersForAgent(def, { enabled = true, command = "od", argsPrefix = [] } = {}) {
  if (!enabled || def?.mcpDiscovery !== "mature-acp")
    return [];
  return [
    {
      name: "open-design-live-artifacts",
      command,
      args: [...argsPrefix, "mcp", "live-artifacts"],
      env: [{ name: "ELECTRON_RUN_AS_NODE", value: "1" }]
    }
  ];
}

// ../daemon/dist/runtimes/prompt-budget.js
function promptArgvBudgetMessage(def, bytes) {
  if (def.id === "deepseek") {
    return `${def.name} currently accepts prompts only as a command-line argument, and this run's composed prompt exceeds the safe size (${bytes} > ${def.maxPromptArgBytes} bytes). Reduce the selected skills/design-system context or conversation length, or use DeepSeek through an API/provider model connection for large contexts. Pick a stdin-capable adapter when the prompt must include large local context.`;
  }
  if (def.id === "grok-build") {
    return `${def.name} requires the prompt as the value of -p / --single (xAI CLI 0.1.212+ no longer reads piped stdin), and this run's composed prompt exceeds the safe size (${bytes} > ${def.maxPromptArgBytes} bytes). Reduce the selected skills/design-system context or conversation length, or pick an adapter with stdin support (e.g. claude, codex, hermes) when the prompt must include large local context.`;
  }
  return `${def.name} requires the prompt as a command-line argument and this run's composed prompt exceeds the safe size (${bytes} > ${def.maxPromptArgBytes} bytes). Reduce the selected skills/design-system context, shorten the conversation, or pick an adapter with stdin support.`;
}
function checkPromptArgvBudget(def, composed) {
  if (!def || typeof def.maxPromptArgBytes !== "number")
    return null;
  const bytes = Buffer.byteLength(typeof composed === "string" ? composed : "", "utf8");
  if (bytes <= def.maxPromptArgBytes)
    return null;
  return {
    code: "AGENT_PROMPT_TOO_LARGE",
    message: promptArgvBudgetMessage(def, bytes),
    bytes,
    limit: def.maxPromptArgBytes
  };
}
function quoteForWindowsCmdShim(value) {
  const str = String(value ?? "");
  if (!/[\s"&<>|^%]/.test(str))
    return str;
  const escaped = str.replace(/"/g, '""').replace(/%/g, '"^%"');
  return `"${escaped}"`;
}
function quoteForWindowsDirectExe(value) {
  const str = String(value ?? "");
  if (str.length === 0)
    return '""';
  if (!/[\s"]/.test(str))
    return str;
  if (!/[\\"]/.test(str))
    return `"${str}"`;
  let result = '"';
  let backslashes = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === "\\") {
      backslashes++;
    } else if (ch === '"') {
      result += "\\".repeat(2 * backslashes + 1) + '"';
      backslashes = 0;
    } else {
      result += "\\".repeat(backslashes) + ch;
      backslashes = 0;
    }
  }
  result += "\\".repeat(2 * backslashes) + '"';
  return result;
}
var WINDOWS_CREATE_PROCESS_LIMIT = 32767;
var WINDOWS_CREATE_PROCESS_HEADROOM = 256;
function checkWindowsCmdShimCommandLineBudget(def, resolvedBin, args) {
  if (!def || typeof def.maxPromptArgBytes !== "number")
    return null;
  if (typeof resolvedBin !== "string" || !/\.(bat|cmd)$/i.test(resolvedBin))
    return null;
  const argList = Array.isArray(args) ? args : [];
  const inner = [resolvedBin, ...argList].map(quoteForWindowsCmdShim).join(" ");
  const commandLineLength = "cmd.exe /d /s /c ".length + inner.length + 2;
  const safeLimit = WINDOWS_CREATE_PROCESS_LIMIT - WINDOWS_CREATE_PROCESS_HEADROOM;
  if (commandLineLength <= safeLimit)
    return null;
  return {
    code: "AGENT_PROMPT_TOO_LARGE",
    message: `${def.name} on Windows runs through a .cmd shim and this run's prompt would expand past the CreateProcess command-line limit after cmd.exe quote-doubling (${commandLineLength} > ${safeLimit} chars). Reduce quote-heavy content in the selected skills/design-system context, shorten the conversation, or pick an adapter with stdin support.`,
    commandLineLength,
    limit: safeLimit
  };
}
function looksLikeWindowsPath(p) {
  if (typeof p !== "string" || p.length === 0)
    return false;
  return /^[a-zA-Z]:[\\/]/.test(p) || p.startsWith("\\\\");
}
function checkWindowsDirectExeCommandLineBudget(def, resolvedBin, args) {
  if (!def || typeof def.maxPromptArgBytes !== "number")
    return null;
  if (typeof resolvedBin !== "string" || resolvedBin.length === 0)
    return null;
  if (/\.(bat|cmd)$/i.test(resolvedBin))
    return null;
  if (!looksLikeWindowsPath(resolvedBin))
    return null;
  const argList = Array.isArray(args) ? args : [];
  const commandLineLength = [resolvedBin, ...argList].map(quoteForWindowsDirectExe).join(" ").length;
  const safeLimit = WINDOWS_CREATE_PROCESS_LIMIT - WINDOWS_CREATE_PROCESS_HEADROOM;
  if (commandLineLength <= safeLimit)
    return null;
  return {
    code: "AGENT_PROMPT_TOO_LARGE",
    message: `${def.name} on Windows builds a CreateProcess command line and this run's prompt would expand past the limit after libuv quote-escaping (${commandLineLength} > ${safeLimit} chars). Reduce quote-heavy content in the selected skills/design-system context, shorten the conversation, or pick an adapter with stdin support.`,
    commandLineLength,
    limit: safeLimit
  };
}

// ../daemon/dist/json-event-stream.js
function isRecord2(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}
function safeParseJson(value) {
  if (value == null)
    return null;
  if (typeof value === "object")
    return value;
  if (typeof value !== "string")
    return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
function stringifyContent(value) {
  if (typeof value === "string")
    return value;
  if (value == null)
    return "";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
function parseJsonObjectsFromContent(value) {
  const trimmed = value.trim();
  if (!trimmed)
    return [];
  const direct = safeParseJson(trimmed);
  if (isRecord2(direct))
    return [direct];
  const objects = [];
  for (const line of trimmed.split(/\r?\n/u)) {
    const parsedLine = safeParseJson(line.trim());
    if (isRecord2(parsedLine))
      objects.push(parsedLine);
  }
  return objects;
}
function extractConnectorApiError(value) {
  if (isRecord2(value.error)) {
    if (typeof value.error.code === "string")
      return value.error;
    if (isRecord2(value.error.data) && isRecord2(value.error.data.error)) {
      const wrappedError = value.error.data.error;
      if (typeof wrappedError.code === "string")
        return wrappedError;
    }
  }
  return null;
}
function connectorToolSelectionErrorMessage(content) {
  if (!content.includes("CONNECTOR_TOOL_NOT_FOUND"))
    return null;
  let error = null;
  for (const parsed of parseJsonObjectsFromContent(content)) {
    const parsedError = extractConnectorApiError(parsed);
    if (parsedError?.code === "CONNECTOR_TOOL_NOT_FOUND") {
      error = parsedError;
      break;
    }
  }
  if (!error)
    return null;
  const details = isRecord2(error.details) ? error.details : {};
  const connectorId = typeof details.connectorId === "string" && details.connectorId ? details.connectorId : void 0;
  const toolName = typeof details.toolName === "string" && details.toolName ? details.toolName : "the requested connector tool";
  const target = connectorId ? `Connector tool ${toolName} is not allowed for connector ${connectorId}.` : `Connector tool ${toolName} is not allowed.`;
  return `${target} Re-list the connector catalog and choose one of the currently allowed read-only tools.`;
}
function extractErrorMessage(value, fallback) {
  if (typeof value === "string") {
    const parsed = safeParseJson(value);
    if (parsed && typeof parsed === "object") {
      return extractErrorMessage(parsed, value);
    }
    return value;
  }
  if (isRecord2(value)) {
    if (typeof value.detail === "string" && value.detail)
      return value.detail;
    if (typeof value.message === "string" && value.message) {
      return extractErrorMessage(value.message, value.message);
    }
    if (typeof value.error === "string" && value.error)
      return value.error;
    if (value.error && typeof value.error === "object") {
      return extractErrorMessage(value.error, fallback);
    }
    if (value.data && typeof value.data === "object") {
      const dataMessage = extractErrorMessage(value.data, "");
      if (dataMessage)
        return dataMessage;
    }
    if (typeof value.name === "string" && value.name)
      return value.name;
  }
  return fallback;
}
function isRecoverableCodexReconnect(message) {
  return message.startsWith("Reconnecting...") && (message.includes("timeout waiting for child process to exit") || message.includes("stream disconnected before completion"));
}
function formatOpenCodeUsage(tokens) {
  if (!isRecord2(tokens))
    return null;
  const usage = {};
  if (typeof tokens.input === "number")
    usage.input_tokens = tokens.input;
  if (typeof tokens.output === "number")
    usage.output_tokens = tokens.output;
  if (typeof tokens.reasoning === "number")
    usage.thought_tokens = tokens.reasoning;
  if (isRecord2(tokens.cache)) {
    if (typeof tokens.cache.read === "number")
      usage.cached_read_tokens = tokens.cache.read;
    if (typeof tokens.cache.write === "number")
      usage.cached_write_tokens = tokens.cache.write;
  }
  return Object.keys(usage).length > 0 ? usage : null;
}
function handleOpenCodeEvent(obj, onEvent, state) {
  if (!isRecord2(obj))
    return false;
  const part = isRecord2(obj.part) ? obj.part : {};
  if (obj.type === "step_start") {
    onEvent({ type: "status", label: "running" });
    return true;
  }
  if (obj.type === "text" && typeof part.text === "string" && part.text.length > 0) {
    onEvent({ type: "text_delta", delta: part.text });
    return true;
  }
  if (obj.type === "tool_use" && typeof part.tool === "string" && typeof part.callID === "string") {
    const statePart = isRecord2(part.state) ? part.state : null;
    const key = `${obj.sessionID || "session"}:${part.callID}`;
    if (!state.openCodeToolUses.has(key)) {
      state.openCodeToolUses.add(key);
      onEvent({
        type: "tool_use",
        id: part.callID,
        name: part.tool,
        input: safeParseJson(statePart?.input) ?? statePart?.input ?? null
      });
    }
    if (statePart?.status === "completed") {
      onEvent({
        type: "tool_result",
        toolUseId: part.callID,
        content: stringifyContent(statePart.output),
        isError: false
      });
    }
    return true;
  }
  if (obj.type === "step_finish") {
    const usage = formatOpenCodeUsage(part.tokens);
    if (usage) {
      onEvent({
        type: "usage",
        usage,
        costUsd: typeof part.cost === "number" ? part.cost : void 0
      });
    }
    return true;
  }
  if (obj.type === "error") {
    const message = extractErrorMessage(obj.error ?? obj.message, "OpenCode error");
    onEvent({ type: "error", message, raw: stringifyContent(obj) });
    return true;
  }
  return false;
}
function handleGeminiEvent(obj, onEvent) {
  if (!isRecord2(obj))
    return false;
  if (obj.type === "init") {
    onEvent({
      type: "status",
      label: "initializing",
      model: typeof obj.model === "string" ? obj.model : void 0
    });
    return true;
  }
  if (obj.type === "message" && obj.role === "assistant" && typeof obj.content === "string" && obj.content.length > 0) {
    onEvent({ type: "text_delta", delta: obj.content });
    return true;
  }
  if (obj.type === "result" && isRecord2(obj.stats)) {
    const usage = {};
    if (typeof obj.stats.input_tokens === "number")
      usage.input_tokens = obj.stats.input_tokens;
    if (typeof obj.stats.output_tokens === "number")
      usage.output_tokens = obj.stats.output_tokens;
    if (typeof obj.stats.cached === "number")
      usage.cached_read_tokens = obj.stats.cached;
    onEvent({
      type: "usage",
      usage,
      durationMs: typeof obj.stats.duration_ms === "number" ? obj.stats.duration_ms : void 0
    });
    return true;
  }
  return false;
}
function extractCursorText(message) {
  const content = isRecord2(message) ? message.content : void 0;
  const blocks = Array.isArray(content) ? content : [];
  return blocks.filter((block) => isRecord2(block) && block.type === "text" && typeof block.text === "string").map((block) => block.text).join("");
}
function emitCursorTextDelta(text, onEvent, state) {
  if (!state.cursorTextSoFar) {
    state.cursorTextSoFar = text;
    onEvent({ type: "text_delta", delta: text });
    return;
  }
  if (text === state.cursorTextSoFar) {
    return;
  }
  if (text.startsWith(state.cursorTextSoFar)) {
    const delta = text.slice(state.cursorTextSoFar.length);
    if (delta)
      onEvent({ type: "text_delta", delta });
    state.cursorTextSoFar = text;
    return;
  }
  state.cursorTextSoFar += text;
  onEvent({ type: "text_delta", delta: text });
}
function handleCursorEvent(obj, onEvent, state) {
  if (!isRecord2(obj))
    return false;
  if (obj.type === "system" && obj.subtype === "init") {
    onEvent({
      type: "status",
      label: "initializing",
      model: typeof obj.model === "string" ? obj.model : void 0
    });
    return true;
  }
  if (obj.type === "assistant" && obj.message) {
    const text = extractCursorText(obj.message);
    if (!text)
      return false;
    if (typeof obj.timestamp_ms === "number") {
      emitCursorTextDelta(text, onEvent, state);
      return true;
    }
    emitCursorTextDelta(text, onEvent, state);
    return true;
  }
  if (obj.type === "result" && isRecord2(obj.usage)) {
    const usage = {};
    if (typeof obj.usage.inputTokens === "number")
      usage.input_tokens = obj.usage.inputTokens;
    if (typeof obj.usage.outputTokens === "number")
      usage.output_tokens = obj.usage.outputTokens;
    if (typeof obj.usage.cacheReadTokens === "number") {
      usage.cached_read_tokens = obj.usage.cacheReadTokens;
    }
    if (typeof obj.usage.cacheWriteTokens === "number") {
      usage.cached_write_tokens = obj.usage.cacheWriteTokens;
    }
    onEvent({
      type: "usage",
      usage,
      durationMs: typeof obj.duration_ms === "number" ? obj.duration_ms : void 0
    });
    return true;
  }
  return false;
}
function handleCodexEvent(obj, onEvent, state) {
  if (!isRecord2(obj))
    return false;
  if (obj.type === "error") {
    const message = extractErrorMessage(obj.message ?? obj.error, "Codex error");
    if (isRecoverableCodexReconnect(message)) {
      onEvent({ type: "status", label: message });
      return true;
    }
    if (!state.codexErrorEmitted) {
      state.codexErrorEmitted = true;
      onEvent({ type: "error", message });
    }
    return true;
  }
  if (obj.type === "turn.failed") {
    if (!state.codexErrorEmitted) {
      state.codexErrorEmitted = true;
      onEvent({
        type: "error",
        message: extractErrorMessage(obj.error ?? obj.message, "Codex turn failed")
      });
    }
    return true;
  }
  if (obj.type === "thread.started") {
    onEvent({ type: "status", label: "initializing" });
    return true;
  }
  if (obj.type === "turn.started") {
    state.codexPreviousEventWasAgentMessage = false;
    state.codexLastAgentMessageEndedWithNewline = false;
    onEvent({ type: "status", label: "running" });
    return true;
  }
  if (obj.type === "item.started" && isRecord2(obj.item)) {
    const item = obj.item;
    if (item.type === "command_execution" && typeof item.id === "string") {
      state.codexPreviousEventWasAgentMessage = false;
      state.codexLastAgentMessageEndedWithNewline = false;
      if (!state.codexToolUses.has(item.id)) {
        state.codexToolUses.add(item.id);
        onEvent({
          type: "tool_use",
          id: item.id,
          name: "Bash",
          input: {
            command: typeof item.command === "string" ? item.command : ""
          }
        });
      }
      return true;
    }
  }
  if (obj.type === "item.completed" && isRecord2(obj.item)) {
    const item = obj.item;
    if (item.type === "command_execution" && typeof item.id === "string") {
      state.codexPreviousEventWasAgentMessage = false;
      state.codexLastAgentMessageEndedWithNewline = false;
      if (!state.codexToolUses.has(item.id)) {
        state.codexToolUses.add(item.id);
        onEvent({
          type: "tool_use",
          id: item.id,
          name: "Bash",
          input: {
            command: typeof item.command === "string" ? item.command : ""
          }
        });
      }
      const content = stringifyContent(item.aggregated_output ?? "");
      onEvent({
        type: "tool_result",
        toolUseId: item.id,
        content,
        isError: typeof item.exit_code === "number" ? item.exit_code !== 0 : item.status === "failed"
      });
      const connectorToolError = connectorToolSelectionErrorMessage(content);
      if (connectorToolError && !state.codexErrorEmitted) {
        state.codexErrorEmitted = true;
        onEvent({ type: "error", message: connectorToolError });
      }
      return true;
    }
  }
  if (obj.type === "item.completed" && isRecord2(obj.item) && obj.item.type === "agent_message" && typeof obj.item.text === "string" && obj.item.text.length > 0) {
    const text = obj.item.text;
    const needsBoundary = state.codexPreviousEventWasAgentMessage && !state.codexLastAgentMessageEndedWithNewline && !text.startsWith("\n");
    const delta = needsBoundary ? `
${text}` : text;
    onEvent({ type: "text_delta", delta });
    state.codexPreviousEventWasAgentMessage = true;
    state.codexLastAgentMessageEndedWithNewline = text.endsWith("\n");
    return true;
  }
  if (obj.type === "turn.completed" && isRecord2(obj.usage)) {
    const usage = {};
    if (typeof obj.usage.input_tokens === "number")
      usage.input_tokens = obj.usage.input_tokens;
    if (typeof obj.usage.output_tokens === "number")
      usage.output_tokens = obj.usage.output_tokens;
    if (typeof obj.usage.cached_input_tokens === "number") {
      usage.cached_read_tokens = obj.usage.cached_input_tokens;
    }
    onEvent({ type: "usage", usage });
    return true;
  }
  return false;
}
function createJsonEventStreamHandler(kind, onEvent) {
  let buffer = "";
  const state = {
    cursorTextSoFar: "",
    openCodeToolUses: /* @__PURE__ */ new Set(),
    codexToolUses: /* @__PURE__ */ new Set(),
    codexErrorEmitted: false,
    codexPreviousEventWasAgentMessage: false,
    codexLastAgentMessageEndedWithNewline: false
  };
  function handleLine(line) {
    let obj;
    try {
      obj = JSON.parse(line);
    } catch {
      onEvent({ type: "raw", line });
      return;
    }
    if (kind === "opencode" && handleOpenCodeEvent(obj, onEvent, state))
      return;
    if (kind === "gemini" && handleGeminiEvent(obj, onEvent))
      return;
    if (kind === "cursor-agent" && handleCursorEvent(obj, onEvent, state))
      return;
    if (kind === "codex" && handleCodexEvent(obj, onEvent, state))
      return;
    onEvent({ type: "raw", line });
  }
  function feed(chunk) {
    buffer += chunk;
    let nl;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line)
        continue;
      handleLine(line);
    }
  }
  function flush() {
    const rem = buffer.trim();
    buffer = "";
    if (!rem)
      return;
    handleLine(rem);
  }
  return { feed, flush };
}

// ../daemon/dist/memory-llm.js
var SYSTEM_PROMPT = `You are a memory extractor for a personal AI design assistant.

Given the user's most recent message (and optionally the assistant's reply), plus a snapshot of the existing memory store, decide whether ANYTHING in this turn is worth remembering across future conversations.

A fact is worth remembering when ALL of these are true:
- It's about the user, their preferences, their tools, their ongoing work, OR a stable reference (a Linear board id, a Slack channel, a teammate name).
- It will plausibly still be true in a week.
- It would change how an assistant responds in a later, unrelated chat.

A fact is NOT worth remembering when ANY of these is true:
- It's a transient state (current task, what file they're editing right now).
- It's already captured in the existing memory.
- It's just the user asking a question or describing a one-off bug.
- It's something the assistant said about itself.
- It's a code snippet, an output, or a paste.

Output STRICT JSON in this exact shape \u2014 nothing else, no prose, no markdown fences:
{
  "entries": [
    { "type": "user|feedback|project|reference", "name": "short title (\u2264 60 chars)", "description": "one-line summary (\u2264 140 chars)", "body": "the actual remembered fact, 1-3 sentences" }
  ]
}

If there's nothing worth remembering, return: {"entries": []}

Type rules:
- user: who they are, role, expertise, long-term goals
- feedback: corrections / preferences about how to work ("don't add comments unless asked")
- project: ongoing initiatives, deadlines, why-decisions; usually time-bounded
- reference: pointers to external systems (Linear projects, Slack channels, dashboards)`;
var PROVIDER_DEFAULTS = {
  anthropic: {
    model: "claude-haiku-4-5",
    baseUrl: "https://api.anthropic.com"
  },
  openai: {
    model: "gpt-4o-mini",
    baseUrl: "https://api.openai.com"
  },
  azure: {
    model: "gpt-4o-mini",
    baseUrl: "",
    apiVersion: "2024-10-21"
  },
  google: {
    model: "gemini-2.0-flash",
    baseUrl: "https://generativelanguage.googleapis.com"
  },
  // Ollama Cloud speaks OpenAI-compatible chat-completions, so the
  // extractor just routes through callOpenAI with the ollama base URL
  // and the user's Ollama Cloud API key. The default model is a small
  // open-weight model so the auto-pick produces a deterministic answer
  // for users who haven't customised the picker; users who care can
  // pick anything off the picker's `Custom...` list.
  ollama: {
    model: "gemma3:4b",
    baseUrl: "https://ollama.com"
  },
  // SenseAudio's chat API is OpenAI-compatible (POST /v1/chat/completions,
  // Bearer auth), so the extractor falls through to callOpenAI with this
  // base URL and the user's SenseAudio API key. The default model is the
  // small/fast variant so auto-pick stays cheap; users can swap in
  // senseaudio-s2 or any gateway model via the picker.
  senseaudio: {
    model: "senseaudio-s2-flash",
    baseUrl: "https://api.senseaudio.cn"
  }
};
function envKeyFor(provider) {
  if (provider === "anthropic")
    return process.env.ANTHROPIC_API_KEY?.trim() || "";
  if (provider === "openai")
    return process.env.OPENAI_API_KEY?.trim() || "";
  if (provider === "azure") {
    return process.env.AZURE_OPENAI_API_KEY?.trim() || process.env.AZURE_API_KEY?.trim() || "";
  }
  if (provider === "google") {
    return process.env.GOOGLE_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim() || "";
  }
  if (provider === "ollama") {
    return process.env.OLLAMA_API_KEY?.trim() || "";
  }
  if (provider === "senseaudio") {
    return process.env.OD_SENSEAUDIO_API_KEY?.trim() || process.env.SENSEAUDIO_API_KEY?.trim() || "";
  }
  return "";
}
function chatProtocolFromAgentId(agentId) {
  if (!agentId || typeof agentId !== "string")
    return null;
  const id = agentId.trim().toLowerCase();
  if (id === "claude")
    return "anthropic";
  if (id === "gemini")
    return "google";
  if (id === "codex" || id === "opencode" || id === "qwen" || id === "deepseek" || id === "kimi" || id === "copilot" || id === "pi" || id === "kiro" || id === "kilo" || id === "vibe" || id === "devin" || id === "hermes" || id === "cursor-agent" || id === "qoder") {
    return "openai";
  }
  return null;
}
function canUseLocalCliForMemory(agentId, provider) {
  if (agentId === "claude" && provider === "anthropic")
    return true;
  if (agentId === "codex" && provider === "openai")
    return true;
  if (agentId === "opencode" && provider === "openai")
    return true;
  return false;
}
function localCliProviderFor(agentId, provider, model) {
  if (!canUseLocalCliForMemory(agentId, provider))
    return null;
  return {
    kind: provider,
    model: typeof model === "string" && model.trim() || "default",
    baseUrl: "local-cli",
    apiVersion: "",
    credentialSource: "chat-cli",
    transport: "chat-cli",
    agentId
  };
}
async function pickProvider(projectRoot, dataDir, chatAgentId, chatProvider, chatModel) {
  const chatProtocol = chatProtocolFromAgentId(chatAgentId);
  const normalizedChatAgentId = typeof chatAgentId === "string" ? chatAgentId.trim().toLowerCase() : "";
  let override = null;
  if (dataDir) {
    try {
      const cfg = await readMemoryConfig(dataDir);
      if (cfg?.extraction?.provider)
        override = cfg.extraction;
    } catch (err) {
      console.warn("[memory-llm] failed to read memory config override", err?.message ?? err);
    }
  }
  if (override) {
    const defaults = PROVIDER_DEFAULTS[override.provider];
    const explicitKey = typeof override.apiKey === "string" && override.apiKey.trim() ? override.apiKey.trim() : "";
    const envKey = envKeyFor(override.provider);
    let resolvedKey = explicitKey || envKey;
    let credentialSource = explicitKey ? "memory-config" : envKey ? "env" : null;
    if (!resolvedKey && (override.provider === "openai" || override.provider === "azure") && projectRoot) {
      try {
        const cred = await resolveProviderConfig(projectRoot, "openai");
        if (cred?.apiKey?.trim()) {
          resolvedKey = cred.apiKey.trim();
          credentialSource = "media-config";
        }
      } catch {
      }
    }
    if (!resolvedKey) {
      const localCliProvider = localCliProviderFor(normalizedChatAgentId, override.provider, override.model);
      if (localCliProvider)
        return localCliProvider;
      return null;
    }
    const baseUrl = typeof override.baseUrl === "string" && override.baseUrl.trim() || defaults.baseUrl;
    if (override.provider === "azure" && !baseUrl) {
      return null;
    }
    return {
      kind: override.provider,
      apiKey: resolvedKey,
      model: typeof override.model === "string" && override.model.trim() || defaults.model,
      baseUrl,
      apiVersion: override.provider === "azure" ? typeof override.apiVersion === "string" && override.apiVersion.trim() || PROVIDER_DEFAULTS.azure.apiVersion : "",
      credentialSource
    };
  }
  const envOverrideModel = (process.env.OD_MEMORY_MODEL || "").trim();
  if (chatProtocol) {
    const localCliProvider = localCliProviderFor(normalizedChatAgentId, chatProtocol, process.env.OD_MEMORY_MODEL || chatModel);
    if (localCliProvider)
      return localCliProvider;
    const envKey = envKeyFor(chatProtocol);
    if (envKey) {
      const defaults = PROVIDER_DEFAULTS[chatProtocol];
      return {
        kind: chatProtocol,
        apiKey: envKey,
        model: envOverrideModel || defaults.model,
        baseUrl: chatProtocol === "anthropic" && process.env.ANTHROPIC_BASE_URL || chatProtocol === "openai" && process.env.OPENAI_BASE_URL || defaults.baseUrl,
        apiVersion: chatProtocol === "azure" ? defaults.apiVersion : "",
        credentialSource: "env"
      };
    }
    if (chatProtocol === "openai" && projectRoot) {
      try {
        const cred = await resolveProviderConfig(projectRoot, "openai");
        if (cred && typeof cred.apiKey === "string" && cred.apiKey.trim()) {
          return {
            kind: "openai",
            apiKey: cred.apiKey.trim(),
            model: envOverrideModel || cred.model || PROVIDER_DEFAULTS.openai.model,
            baseUrl: cred.baseUrl && String(cred.baseUrl).trim() || PROVIDER_DEFAULTS.openai.baseUrl,
            apiVersion: "",
            credentialSource: "media-config"
          };
        }
      } catch (err) {
        console.warn("[memory-llm] media-config lookup failed (chat-constrained)", err?.message ?? err);
      }
    }
    return null;
  }
  if (chatProvider && chatProvider.provider && PROVIDER_DEFAULTS[chatProvider.provider]) {
    const apiKey = typeof chatProvider.apiKey === "string" ? chatProvider.apiKey.trim() : "";
    if (apiKey) {
      const defaults = PROVIDER_DEFAULTS[chatProvider.provider];
      const baseUrl = typeof chatProvider.baseUrl === "string" && chatProvider.baseUrl.trim() || defaults.baseUrl;
      if (chatProvider.provider !== "azure" || baseUrl) {
        const explicitModel = typeof chatProvider.model === "string" && chatProvider.model.trim() ? chatProvider.model.trim() : "";
        return {
          kind: chatProvider.provider,
          apiKey,
          model: envOverrideModel || explicitModel || defaults.model,
          baseUrl,
          apiVersion: chatProvider.provider === "azure" ? typeof chatProvider.apiVersion === "string" && chatProvider.apiVersion.trim() || PROVIDER_DEFAULTS.azure.apiVersion : "",
          credentialSource: "chat-byok"
        };
      }
    }
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      kind: "anthropic",
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: envOverrideModel || PROVIDER_DEFAULTS.anthropic.model,
      baseUrl: process.env.ANTHROPIC_BASE_URL || PROVIDER_DEFAULTS.anthropic.baseUrl,
      credentialSource: "env"
    };
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      kind: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      model: envOverrideModel || PROVIDER_DEFAULTS.openai.model,
      baseUrl: process.env.OPENAI_BASE_URL || PROVIDER_DEFAULTS.openai.baseUrl,
      credentialSource: "env"
    };
  }
  if (projectRoot) {
    try {
      const cred = await resolveProviderConfig(projectRoot, "openai");
      if (cred && typeof cred.apiKey === "string" && cred.apiKey.trim()) {
        return {
          kind: "openai",
          apiKey: cred.apiKey.trim(),
          model: envOverrideModel || cred.model || PROVIDER_DEFAULTS.openai.model,
          baseUrl: cred.baseUrl && String(cred.baseUrl).trim() || PROVIDER_DEFAULTS.openai.baseUrl,
          credentialSource: "media-config"
        };
      }
    } catch (err) {
      console.warn("[memory-llm] failed to read media-config for fallback", err?.message ?? err);
    }
  }
  return null;
}
function renderUserPayload({ userMessage, assistantMessage, currentMemory }) {
  const parts = [];
  parts.push("## Existing memory");
  parts.push(currentMemory && currentMemory.trim().length > 0 ? currentMemory : "(empty)");
  parts.push("");
  parts.push("## User message");
  parts.push(String(userMessage || "").slice(0, 4e3));
  if (assistantMessage && assistantMessage.trim().length > 0) {
    parts.push("");
    parts.push("## Assistant reply");
    parts.push(String(assistantMessage).slice(0, 4e3));
  }
  parts.push("");
  parts.push("Return ONLY the JSON object described in the system prompt \u2014 no prose, no fences.");
  return parts.join("\n");
}
var FETCH_TIMEOUT_MS = 3e4;
function appendVersionedApiPath(baseUrl, suffix) {
  const url = new URL(baseUrl);
  const pathname = url.pathname.replace(/\/+$/, "");
  url.pathname = /\/v\d+(\/|$)/.test(pathname) ? `${pathname}${suffix}` : `${pathname}/v1${suffix}`;
  return url.toString();
}
function withTimeout(ms) {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(new Error(`timeout ${ms}ms`)), ms);
  return controller.signal;
}
function describeFetchError(err) {
  const head = err?.message || String(err);
  const cause = err?.cause;
  if (!cause)
    return head;
  const codeRaw = cause.code ? String(cause.code) : "";
  const msgRaw = cause.message && cause.message !== head ? String(cause.message) : "";
  let detail = "";
  if (codeRaw && msgRaw) {
    const m = msgRaw.toLowerCase();
    detail = m.includes(codeRaw.toLowerCase()) ? codeRaw : `${codeRaw}: ${msgRaw}`;
  } else {
    detail = codeRaw || msgRaw;
  }
  if (!detail && Array.isArray(cause.errors)) {
    for (const inner of cause.errors) {
      const innerCode = inner?.code ? String(inner.code) : "";
      const innerMsg = inner?.message ? String(inner.message) : "";
      const candidate = innerCode || innerMsg;
      if (candidate) {
        detail = candidate;
        break;
      }
    }
  }
  return detail ? `${head} (${detail})` : head;
}
async function callAnthropic(provider, system, user) {
  let resp;
  try {
    resp = await fetch(appendVersionedApiPath(provider.baseUrl, "/messages"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": provider.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: 1024,
        system,
        messages: [{ role: "user", content: user }]
      }),
      signal: withTimeout(FETCH_TIMEOUT_MS)
    });
  } catch (err) {
    throw new Error(describeFetchError(err));
  }
  if (!resp.ok) {
    throw new Error(`anthropic ${resp.status}: ${await resp.text().catch(() => "")}`);
  }
  const json = await resp.json();
  const block = (json?.content || []).find((b) => b?.type === "text");
  return block?.text ?? "";
}
async function callOpenAI(provider, system, user) {
  let resp;
  try {
    resp = await fetch(appendVersionedApiPath(provider.baseUrl, "/chat/completions"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: provider.model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ]
      }),
      signal: withTimeout(FETCH_TIMEOUT_MS)
    });
  } catch (err) {
    throw new Error(describeFetchError(err));
  }
  if (!resp.ok) {
    throw new Error(`openai ${resp.status}: ${await resp.text().catch(() => "")}`);
  }
  const json = await resp.json();
  return json?.choices?.[0]?.message?.content ?? "";
}
async function callAzure(provider, system, user) {
  const base = String(provider.baseUrl || "").replace(/\/+$/, "");
  const deployment = encodeURIComponent(provider.model);
  const apiVersion = encodeURIComponent(provider.apiVersion || PROVIDER_DEFAULTS.azure.apiVersion);
  const url = `${base}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
  let resp;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "api-key": provider.apiKey
      },
      body: JSON.stringify({
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ]
      }),
      signal: withTimeout(FETCH_TIMEOUT_MS)
    });
  } catch (err) {
    throw new Error(describeFetchError(err));
  }
  if (!resp.ok) {
    throw new Error(`azure ${resp.status}: ${await resp.text().catch(() => "")}`);
  }
  const json = await resp.json();
  return json?.choices?.[0]?.message?.content ?? "";
}
async function callGoogle(provider, system, user) {
  const base = String(provider.baseUrl || "").replace(/\/+$/, "");
  const model = encodeURIComponent(provider.model);
  const url = `${base}/v1beta/models/${model}:generateContent?key=${encodeURIComponent(provider.apiKey)}`;
  let resp;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { role: "system", parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { responseMimeType: "application/json" }
      }),
      signal: withTimeout(FETCH_TIMEOUT_MS)
    });
  } catch (err) {
    throw new Error(describeFetchError(err));
  }
  if (!resp.ok) {
    throw new Error(`google ${resp.status}: ${await resp.text().catch(() => "")}`);
  }
  const json = await resp.json();
  const parts = json?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    return parts.map((p) => p && typeof p.text === "string" ? p.text : "").join("");
  }
  return "";
}
var LOCAL_CLI_TIMEOUT_MS = 6e4;
function extractJsonEventText(kind, raw, agentName) {
  const events = [];
  const handler = createJsonEventStreamHandler(kind, (event) => events.push(event));
  handler.feed(raw);
  handler.flush();
  const errorEvent = events.find((event) => event?.type === "error");
  if (errorEvent) {
    const message = typeof errorEvent.message === "string" && errorEvent.message.trim() ? errorEvent.message.trim() : "unknown error";
    throw new Error(`${agentName} CLI error: ${message}`);
  }
  return events.filter((event) => event?.type === "text_delta" && typeof event.delta === "string").map((event) => event.delta).join("").trim();
}
async function writeLocalCliPromptAttachment(agentId, prompt) {
  const dir = await fsp2.mkdtemp(path13.join(os3.tmpdir(), `od-memory-${agentId}-`));
  const file = path13.join(dir, "prompt.md");
  await fsp2.writeFile(file, prompt, "utf8");
  return {
    file,
    cleanup: () => fsp2.rm(dir, { recursive: true, force: true }).catch(() => {
    })
  };
}
async function callLocalCli(provider, system, user, options) {
  if (typeof options?.localCliRunner === "function") {
    return options.localCliRunner({
      agentId: provider.agentId,
      model: provider.model,
      system,
      user,
      projectRoot: options?.projectRoot ?? null,
      dataDir: options?.dataDir ?? null
    });
  }
  const def = getAgentDef(provider.agentId);
  if (!def) {
    throw new Error(`Local CLI agent "${provider.agentId}" is not installed`);
  }
  let configuredAgentEnv = {};
  try {
    const appConfig = options?.dataDir ? await readAppConfig(options.dataDir) : {};
    configuredAgentEnv = agentCliEnvForAgent(appConfig.agentCliEnv, def.id);
  } catch {
    configuredAgentEnv = {};
  }
  const launch = resolveAgentLaunch(def, configuredAgentEnv);
  if (!launch?.launchPath) {
    throw new Error(`${def.name} CLI is not installed or not on PATH`);
  }
  const cwd = typeof options?.projectRoot === "string" && options.projectRoot.trim() ? options.projectRoot : process.cwd();
  const prompt = [
    system,
    "",
    "You are running as a background memory extractor. Do not use tools. Return strict JSON only.",
    "",
    user
  ].join("\n");
  let args;
  let stdinText = prompt;
  let cleanupPromptAttachment = () => Promise.resolve();
  let parseStdout = (raw) => raw.trim();
  if (provider.agentId === "claude") {
    args = ["-p", "--input-format", "text", "--output-format", "text"];
    if (provider.model && provider.model !== "default") {
      args.push("--model", provider.model);
    }
  } else if (provider.agentId === "codex") {
    args = def.buildArgs("", [], [], { model: provider.model }, { cwd });
    parseStdout = (raw) => extractJsonEventText(def.eventParser || def.id, raw, def.name);
  } else if (provider.agentId === "opencode") {
    const attachment = await writeLocalCliPromptAttachment(provider.agentId, prompt);
    cleanupPromptAttachment = attachment.cleanup;
    args = def.buildArgs("", [], [], { model: provider.model }, { cwd });
    args.push("--file", attachment.file, "Read the attached OpenDesign memory extraction prompt and return strict JSON only.");
    stdinText = "";
    parseStdout = (raw) => extractJsonEventText(def.eventParser || def.id, raw, def.name);
  } else {
    throw new Error(`Local CLI memory extraction is not supported for ${provider.agentId}`);
  }
  const env = applyAgentLaunchEnv(spawnEnvForAgent(def.id, { ...process.env, ...def.env || {} }, configuredAgentEnv), launch);
  const invocation = createCommandInvocation({
    command: launch.launchPath,
    args,
    env
  });
  return await new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let settled = false;
    let closed = false;
    const child = spawn(invocation.command, invocation.args, {
      env,
      stdio: ["pipe", "pipe", "pipe"],
      cwd,
      shell: false,
      windowsVerbatimArguments: invocation.windowsVerbatimArguments
    });
    const finish = (err, text) => {
      if (settled)
        return;
      settled = true;
      clearTimeout(timeout);
      void cleanupPromptAttachment().finally(() => {
        if (err)
          reject(err);
        else
          resolve(text);
      });
    };
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      setTimeout(() => {
        if (!closed)
          child.kill("SIGKILL");
      }, 2e3).unref?.();
      finish(new Error(`${def.name} CLI timed out after ${Math.round(LOCAL_CLI_TIMEOUT_MS / 1e3)}s`));
    }, LOCAL_CLI_TIMEOUT_MS);
    timeout.unref?.();
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout = `${stdout}${chunk}`.slice(-64e3);
    });
    child.stderr.on("data", (chunk) => {
      stderr = `${stderr}${chunk}`.slice(-8e3);
    });
    child.once("error", (err) => finish(err));
    child.once("close", (code, signal) => {
      closed = true;
      if (code === 0) {
        let text = "";
        try {
          text = parseStdout(stdout);
        } catch (err) {
          finish(err);
          return;
        }
        if (text) {
          finish(null, text);
          return;
        }
      }
      const detail = (stderr.trim() || stdout.trim() || "no output").slice(0, 1e3);
      const status = signal ? `signal ${signal}` : `exit ${code}`;
      finish(new Error(`${def.name} CLI ${status}: ${detail}`));
    });
    child.stdin.on("error", (err) => {
      if (err.code !== "EPIPE")
        finish(err);
    });
    child.stdin.end(stdinText);
  });
}
function parseEntries(rawText) {
  if (typeof rawText !== "string")
    return [];
  let text = rawText.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = /\{[\s\S]*\}/.exec(text);
    if (!match)
      return [];
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return [];
    }
  }
  const list = Array.isArray(parsed?.entries) ? parsed.entries : [];
  const validTypes = /* @__PURE__ */ new Set(["user", "feedback", "project", "reference"]);
  return list.filter((e) => e && typeof e === "object" && validTypes.has(e.type) && typeof e.name === "string" && e.name.trim().length > 0 && typeof e.body === "string" && e.body.trim().length > 0).slice(0, 6);
}
function alreadyKnown(existing, candidate) {
  const candKey = `${candidate.type}::${candidate.name.toLowerCase().trim()}`;
  for (const e of existing) {
    if (`${e.type}::${e.name.toLowerCase().trim()}` === candKey)
      return true;
  }
  return false;
}
function toMemoryDraft(candidate) {
  return {
    type: candidate.type,
    name: String(candidate.name).trim().slice(0, 80),
    description: String(candidate.description || "").trim().slice(0, 200),
    body: String(candidate.body).trim()
  };
}
async function collectProposedEntries(dataDir, input, options) {
  const projectRoot = options?.projectRoot ?? null;
  const chatAgentId = options?.chatAgentId ?? null;
  const chatModel = options?.chatModel ?? null;
  const extractionKind = options?.kind ?? "llm";
  const systemPrompt = typeof options?.systemPrompt === "string" && options.systemPrompt.trim() ? options.systemPrompt.trim() : SYSTEM_PROMPT;
  const chatProvider = options?.chatProvider ?? null;
  const userMessage = String(input?.userMessage || "").trim();
  const cfg = await readMemoryConfig(dataDir);
  if (!cfg.enabled) {
    recordSkip({ userMessage, reason: "memory-disabled", kind: extractionKind });
    return { status: "skipped", attemptId: null, proposed: [], existingEntries: [] };
  }
  if (extractionKind !== "connector" && !cfg.chatExtractionEnabled) {
    return { status: "skipped", attemptId: null, proposed: [], existingEntries: [] };
  }
  if (userMessage.length === 0) {
    recordSkip({ userMessage, reason: "empty-message", kind: extractionKind });
    return { status: "skipped", attemptId: null, proposed: [], existingEntries: [] };
  }
  const provider = await pickProvider(projectRoot, dataDir, chatAgentId, chatProvider, chatModel);
  if (!provider) {
    recordSkip({ userMessage, reason: "no-provider", kind: extractionKind });
    return { status: "skipped", attemptId: null, proposed: [], existingEntries: [] };
  }
  const attemptId = startExtraction({ userMessage, kind: extractionKind });
  markProvider(attemptId, {
    kind: provider.kind,
    model: provider.model,
    credentialSource: provider.credentialSource
  });
  let currentMemory = "";
  let existingEntries = [];
  try {
    [currentMemory, existingEntries] = await Promise.all([
      composeMemoryBody(dataDir),
      listMemoryEntries(dataDir)
    ]);
  } catch {
  }
  const userPayload = renderUserPayload({
    userMessage,
    assistantMessage: input?.assistantMessage,
    currentMemory
  });
  let raw = "";
  try {
    if (provider.transport === "chat-cli") {
      raw = await callLocalCli(provider, systemPrompt, userPayload, {
        dataDir,
        projectRoot,
        localCliRunner: options?.localCliRunner
      });
    } else if (provider.kind === "anthropic") {
      raw = await callAnthropic(provider, systemPrompt, userPayload);
    } else if (provider.kind === "azure") {
      raw = await callAzure(provider, systemPrompt, userPayload);
    } else if (provider.kind === "google") {
      raw = await callGoogle(provider, systemPrompt, userPayload);
    } else {
      raw = await callOpenAI(provider, systemPrompt, userPayload);
    }
  } catch (err) {
    console.warn(`[memory-llm] ${provider.kind} call failed`, err?.message ?? err);
    markFailed(attemptId, err);
    return { status: "failed", attemptId, proposed: [], existingEntries };
  }
  let proposed;
  try {
    proposed = parseEntries(raw);
    if (typeof options?.candidateFilter === "function") {
      proposed = proposed.filter((candidate) => {
        try {
          return options.candidateFilter(candidate);
        } catch {
          return false;
        }
      });
    }
  } catch (err) {
    markFailed(attemptId, err);
    return { status: "failed", attemptId, proposed: [], existingEntries };
  }
  markProposed(attemptId, proposed.length);
  return { status: "ok", attemptId, proposed, existingEntries };
}
async function suggestWithLLM(dataDir, input, options) {
  const result = await collectProposedEntries(dataDir, input, options);
  if (result.status !== "ok")
    return [];
  const suggestions = result.proposed.filter((cand) => !alreadyKnown(result.existingEntries, cand)).map(toMemoryDraft);
  markSuccess(result.attemptId, {
    writtenCount: 0,
    writtenIds: []
  });
  return suggestions;
}
async function extractWithLLM(dataDir, input, options) {
  const changeSource = options?.source ?? "llm";
  const result = await collectProposedEntries(dataDir, input, options);
  if (result.status !== "ok")
    return [];
  const { attemptId, proposed, existingEntries } = result;
  if (proposed.length === 0) {
    markSuccess(attemptId, { writtenCount: 0, writtenIds: [] });
    return [];
  }
  const written = [];
  for (const cand of proposed) {
    if (alreadyKnown(existingEntries, cand))
      continue;
    try {
      const entry = await upsertMemoryEntry(
        dataDir,
        toMemoryDraft(cand),
        // Suppress per-entry events; we batch a single 'extract' below
        // so the toast says "Memory updated (3 · LLM)" once.
        { silent: true, source: changeSource }
      );
      written.push({
        id: entry.id,
        name: entry.name,
        description: entry.description,
        type: entry.type,
        updatedAt: entry.updatedAt
      });
    } catch (err) {
      console.warn("[memory-llm] write failed", err?.message ?? err);
    }
  }
  if (written.length > 0) {
    memoryEvents.emit("change", {
      kind: "extract",
      count: written.length,
      source: changeSource,
      at: Date.now()
    });
  }
  markSuccess(attemptId, {
    writtenCount: written.length,
    writtenIds: written.map((e) => e.id)
  });
  return written;
}

export {
  MEDIA_PROVIDERS,
  IMAGE_MODELS,
  VIDEO_MODELS,
  AUDIO_MODELS_BY_KIND,
  MEDIA_ASPECTS,
  VIDEO_LENGTHS_SEC,
  AUDIO_DURATIONS_SEC,
  findMediaModel,
  findProvider,
  modelsForSurface,
  resolveProjectRelativePath,
  fetchVelaPresetModels,
  fetchVelaRemoteModelsWithRetry,
  getAgentDef,
  resolveAgentLaunch,
  applyAgentLaunchEnv,
  resolveAmrProfile,
  spawnEnvForAgent,
  cursorAuthGuidance,
  antigravityAuthGuidance,
  antigravityQuotaGuidance,
  classifyAgentAuthFailure,
  classifyAgentServiceFailure,
  probeAgentAuthStatus,
  detectAgents,
  buildLiveArtifactsMcpServersForAgent,
  checkPromptArgvBudget,
  checkWindowsCmdShimCommandLineBudget,
  checkWindowsDirectExeCommandLineBudget,
  parseFrontmatter,
  listExtractions,
  removeExtraction,
  clearExtractions,
  memoryEvents,
  memoryDir,
  readMemoryConfig,
  writeMemoryConfig,
  maskMemoryExtractionConfig,
  readMemoryIndex,
  writeMemoryIndex,
  listMemoryEntries,
  buildMemoryTree,
  readMemoryEntry,
  updateMemoryTreeNode,
  upsertMemoryEntry,
  deleteMemoryEntry,
  composeMemoryBody,
  extractFromMessage,
  exchangeCodeForToken,
  refreshAccessToken,
  PendingAuthCache,
  beginAuth,
  beginXAIAuth,
  completeXAIAuth,
  getXAIToken,
  setXAIToken,
  clearXAIToken,
  mediaConfigDir,
  resolveModelAlias,
  resolveProviderConfig,
  readMaskedConfig,
  writeConfig,
  seedProviderIfMissing,
  createJsonEventStreamHandler,
  suggestWithLLM,
  extractWithLLM
};
