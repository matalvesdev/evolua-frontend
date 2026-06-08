import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);

// ../daemon/dist/app-config.js
import { mkdir as mkdir2, readFile as readFile2, rename, writeFile as writeFile2 } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";

// ../daemon/dist/installation.js
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
function resolveInstallationDir(dataDir) {
  const env = process.env.OD_INSTALLATION_DIR;
  if (env && env.length > 0)
    return env;
  return dataDir;
}
function installationFilePath(installationDir) {
  return join(installationDir, "installation.json");
}
async function readInstallationFile(installationDir) {
  try {
    const raw = await readFile(installationFilePath(installationDir), "utf8");
    const parsed = JSON.parse(raw);
    if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const obj = parsed;
    const out = {};
    if (typeof obj.installationId === "string" && obj.installationId.length > 0) {
      out.installationId = obj.installationId;
    }
    return out;
  } catch (err) {
    const e = err;
    if (e.code === "ENOENT")
      return {};
    if (e.name === "SyntaxError")
      return {};
    return {};
  }
}
var writeLocks = /* @__PURE__ */ new Map();
async function writeInstallationFile(installationDir, patch) {
  const prev = writeLocks.get(installationDir) ?? Promise.resolve();
  const task = prev.catch(() => void 0).then(() => doWrite(installationDir, patch));
  writeLocks.set(installationDir, task);
  try {
    return await task;
  } finally {
    if (writeLocks.get(installationDir) === task)
      writeLocks.delete(installationDir);
  }
}
async function doWrite(installationDir, patch) {
  const existing = await readInstallationFile(installationDir);
  const next = { ...existing };
  if (Object.prototype.hasOwnProperty.call(patch, "installationId")) {
    if (typeof patch.installationId === "string" && patch.installationId.length > 0) {
      next.installationId = patch.installationId;
    } else {
      delete next.installationId;
    }
  }
  await mkdir(dirname(installationFilePath(installationDir)), { recursive: true });
  await writeFile(installationFilePath(installationDir), JSON.stringify(next, null, 2) + "\n", "utf8");
  return next;
}

// ../daemon/dist/app-config.js
function intFromEnv(key, fallback) {
  const raw = process.env[key];
  if (typeof raw !== "string" || raw.trim().length === 0)
    return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0)
    return fallback;
  return Math.floor(parsed);
}
function nullableIntFromEnv(key) {
  const raw = process.env[key];
  if (typeof raw !== "string" || raw.trim().length === 0)
    return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0)
    return null;
  return Math.floor(parsed);
}
function readPluginEnvKnobs() {
  return {
    maxDevloopIterations: intFromEnv("OD_MAX_DEVLOOP_ITERATIONS", 10),
    snapshotUnreferencedTtlDays: intFromEnv("OD_SNAPSHOT_UNREFERENCED_TTL_DAYS", 30),
    snapshotRetentionDays: nullableIntFromEnv("OD_SNAPSHOT_RETENTION_DAYS"),
    snapshotGcIntervalMs: intFromEnv("OD_SNAPSHOT_GC_INTERVAL_MS", 6 * 60 * 60 * 1e3)
  };
}
var ALLOWED_KEYS = /* @__PURE__ */ new Set([
  "onboardingCompleted",
  "agentId",
  "agentModels",
  "agentCliEnv",
  "skillId",
  "designSystemId",
  "disabledSkills",
  "disabledDesignSystems",
  "installationId",
  "telemetry",
  "privacyDecisionAt",
  "orbit",
  "customInstructions"
]);
function configFile(dataDir) {
  return path.join(dataDir, "app-config.json");
}
var AGENT_MODEL_KEYS = /* @__PURE__ */ new Set(["model", "reasoning"]);
var TELEMETRY_KEYS = /* @__PURE__ */ new Set([
  "metrics",
  "content",
  "artifactManifest"
]);
function validateTelemetry(raw) {
  if (raw === void 0 || raw === null)
    return void 0;
  if (typeof raw !== "object" || Array.isArray(raw))
    return void 0;
  const result = /* @__PURE__ */ Object.create(null);
  for (const [k, v] of Object.entries(raw)) {
    if (k === "__proto__" || k === "constructor")
      continue;
    if (!TELEMETRY_KEYS.has(k))
      continue;
    if (typeof v === "boolean")
      result[k] = v;
  }
  return Object.keys(result).length > 0 ? result : void 0;
}
var AGENT_CLI_ENV_KEYS = /* @__PURE__ */ new Map([
  ["amr", /* @__PURE__ */ new Set([
    "VELA_BIN",
    "VELA_LINK_URL",
    "VELA_RUNTIME_KEY",
    "VELA_OPENCODE_BIN",
    "OPEN_DESIGN_AMR_PROFILE",
    "OPENCODE_TEST_HOME"
  ])],
  ["aider", /* @__PURE__ */ new Set(["AIDER_BIN"])],
  ["claude", /* @__PURE__ */ new Set(["CLAUDE_CONFIG_DIR", "CLAUDE_BIN", "ANTHROPIC_BASE_URL", "ANTHROPIC_API_KEY"])],
  ["codex", /* @__PURE__ */ new Set(["CODEX_HOME", "CODEX_BIN", "OPENAI_BASE_URL", "CODEX_API_KEY", "OPENAI_API_KEY"])],
  ["copilot", /* @__PURE__ */ new Set(["COPILOT_BIN"])],
  ["cursor-agent", /* @__PURE__ */ new Set(["CURSOR_AGENT_BIN"])],
  ["deepseek", /* @__PURE__ */ new Set(["DEEPSEEK_BIN"])],
  ["devin", /* @__PURE__ */ new Set(["DEVIN_BIN"])],
  ["gemini", /* @__PURE__ */ new Set(["GEMINI_BIN"])],
  ["hermes", /* @__PURE__ */ new Set(["HERMES_BIN"])],
  ["kimi", /* @__PURE__ */ new Set(["KIMI_BIN"])],
  ["kiro", /* @__PURE__ */ new Set(["KIRO_BIN"])],
  ["kilo", /* @__PURE__ */ new Set(["KILO_BIN"])],
  ["opencode", /* @__PURE__ */ new Set(["OPENCODE_BIN"])],
  ["pi", /* @__PURE__ */ new Set(["PI_BIN"])],
  ["qoder", /* @__PURE__ */ new Set(["QODER_BIN"])],
  ["qwen", /* @__PURE__ */ new Set(["QWEN_BIN"])],
  ["trae-cli", /* @__PURE__ */ new Set(["TRAE_CLI_BIN"])],
  ["vibe", /* @__PURE__ */ new Set(["VIBE_BIN"])]
]);
function isValidAgentModelEntry(v) {
  if (!v || typeof v !== "object" || Array.isArray(v))
    return false;
  const obj = v;
  for (const k of Object.keys(obj)) {
    if (!AGENT_MODEL_KEYS.has(k))
      return false;
    if (obj[k] !== void 0 && typeof obj[k] !== "string")
      return false;
  }
  return true;
}
function validateAgentModels(raw) {
  if (raw === void 0 || raw === null)
    return void 0;
  if (typeof raw !== "object" || Array.isArray(raw))
    return void 0;
  const result = /* @__PURE__ */ Object.create(null);
  for (const [k, v] of Object.entries(raw)) {
    if (k === "__proto__" || k === "constructor")
      continue;
    if (isValidAgentModelEntry(v)) {
      result[k] = v;
    }
  }
  return Object.keys(result).length > 0 ? result : void 0;
}
function validateAgentCliEnv(raw) {
  if (raw === void 0 || raw === null)
    return void 0;
  if (typeof raw !== "object" || Array.isArray(raw))
    return void 0;
  const result = /* @__PURE__ */ Object.create(null);
  for (const [agentId, value] of Object.entries(raw)) {
    if (agentId === "__proto__" || agentId === "constructor")
      continue;
    const allowed = AGENT_CLI_ENV_KEYS.get(agentId);
    if (!allowed || typeof value !== "object" || value === null || Array.isArray(value)) {
      continue;
    }
    const env = /* @__PURE__ */ Object.create(null);
    for (const [envKey, envValue] of Object.entries(value)) {
      if (!allowed.has(envKey))
        continue;
      if (typeof envValue !== "string")
        continue;
      const trimmed = envValue.trim();
      if (!trimmed)
        continue;
      env[envKey] = trimmed;
    }
    if (Object.keys(env).length > 0)
      result[agentId] = env;
  }
  return Object.keys(result).length > 0 ? result : void 0;
}
function isValidOrbitTime(time) {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match)
    return false;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}
function validateOrbit(raw) {
  if (raw === void 0 || raw === null)
    return void 0;
  if (typeof raw !== "object" || Array.isArray(raw))
    return void 0;
  const obj = raw;
  const enabled = typeof obj.enabled === "boolean" ? obj.enabled : false;
  const time = typeof obj.time === "string" && isValidOrbitTime(obj.time) ? obj.time : "08:00";
  const orbit = { enabled, time };
  if (Object.hasOwn(obj, "templateSkillId")) {
    orbit.templateSkillId = typeof obj.templateSkillId === "string" && obj.templateSkillId.trim() ? obj.templateSkillId.trim() : null;
  }
  return orbit;
}
function agentCliEnvForAgent(prefs, agentId) {
  if (!prefs || typeof agentId !== "string")
    return {};
  const env = prefs[agentId];
  if (!env || typeof env !== "object" || Array.isArray(env))
    return {};
  return { ...env };
}
function applyConfigValue(target, key, value) {
  if (key === "onboardingCompleted") {
    if (typeof value === "boolean")
      target[key] = value;
    return;
  }
  if (key === "agentId" || key === "skillId" || key === "designSystemId") {
    if (typeof value === "string" || value === null)
      target[key] = value;
    return;
  }
  if (key === "agentModels") {
    const validated = validateAgentModels(value);
    if (validated !== void 0) {
      target[key] = validated;
    } else {
      delete target[key];
    }
  }
  if (key === "agentCliEnv") {
    const validated = validateAgentCliEnv(value);
    if (validated !== void 0) {
      target[key] = validated;
    } else {
      delete target[key];
    }
  }
  if (key === "disabledSkills" || key === "disabledDesignSystems") {
    if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
      target[key] = value;
    } else {
      delete target[key];
    }
  }
  if (key === "installationId") {
    if (typeof value === "string" || value === null)
      target[key] = value;
    return;
  }
  if (key === "telemetry") {
    const validated = validateTelemetry(value);
    if (validated !== void 0) {
      target[key] = validated;
    } else {
      delete target[key];
    }
  }
  if (key === "privacyDecisionAt") {
    if (value === null || typeof value === "number" && Number.isFinite(value) && value >= 0) {
      target[key] = value;
    } else {
      delete target[key];
    }
    return;
  }
  if (key === "orbit") {
    const validated = validateOrbit(value);
    if (validated !== void 0) {
      target[key] = validated;
    } else {
      delete target[key];
    }
  }
  if (key === "customInstructions") {
    if (typeof value === "string") {
      target[key] = value.slice(0, 5e3);
    } else if (value === null) {
      target[key] = value;
    }
    return;
  }
}
function filterAllowedKeys(obj) {
  const result = /* @__PURE__ */ Object.create(null);
  for (const key of Object.keys(obj)) {
    if (ALLOWED_KEYS.has(key)) {
      applyConfigValue(result, key, obj[key]);
    }
  }
  return result;
}
function applyTelemetryDefaults(prefs) {
  if (prefs.telemetry === void 0) {
    return {
      ...prefs,
      telemetry: { metrics: true, content: true, artifactManifest: false }
    };
  }
  return prefs;
}
async function readAppConfig(dataDir) {
  const base = await readAppConfigFileOnly(dataDir);
  const installationDir = resolveInstallationDir(dataDir);
  const installation = await readInstallationFile(installationDir);
  if (typeof installation.installationId === "string" && installation.installationId.length > 0) {
    return applyTelemetryDefaults({ ...base, installationId: installation.installationId });
  }
  if (typeof base.installationId === "string" && base.installationId.length > 0) {
    try {
      await writeInstallationFile(installationDir, { installationId: base.installationId });
    } catch {
    }
  }
  return applyTelemetryDefaults(base);
}
async function readAppConfigFileOnly(dataDir) {
  try {
    const raw = await readFile2(configFile(dataDir), "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return filterAllowedKeys(parsed);
    }
    console.warn("[app-config] Invalid shape in config file, returning empty");
    return {};
  } catch (err) {
    const e = err;
    if (e.code === "ENOENT")
      return {};
    if (e.name === "SyntaxError") {
      console.error("[app-config] Corrupted JSON, returning empty:", e.message);
      return {};
    }
    throw err;
  }
}
var writeLocks2 = /* @__PURE__ */ new Map();
async function writeAppConfig(dataDir, partial) {
  const prev = writeLocks2.get(dataDir) ?? Promise.resolve();
  const task = prev.catch(() => {
  }).then(() => doWrite2(dataDir, partial));
  writeLocks2.set(dataDir, task);
  try {
    return await task;
  } finally {
    if (writeLocks2.get(dataDir) === task)
      writeLocks2.delete(dataDir);
  }
}
async function doWrite2(dataDir, partial) {
  const existing = await readAppConfig(dataDir);
  const next = { ...existing };
  for (const key of Object.keys(partial)) {
    if (!ALLOWED_KEYS.has(key))
      continue;
    applyConfigValue(next, key, partial[key]);
  }
  const file = configFile(dataDir);
  await mkdir2(path.dirname(file), { recursive: true });
  const tmp = file + "." + randomBytes(4).toString("hex") + ".tmp";
  await writeFile2(tmp, JSON.stringify(next, null, 2), "utf8");
  await rename(tmp, file);
  if (Object.prototype.hasOwnProperty.call(partial, "installationId")) {
    const id = next.installationId;
    const installPatch = {
      installationId: typeof id === "string" && id.length > 0 ? id : null
    };
    try {
      await writeInstallationFile(resolveInstallationDir(dataDir), installPatch);
    } catch {
    }
  }
  return next;
}

export {
  readPluginEnvKnobs,
  validateAgentCliEnv,
  agentCliEnvForAgent,
  readAppConfig,
  writeAppConfig
};
