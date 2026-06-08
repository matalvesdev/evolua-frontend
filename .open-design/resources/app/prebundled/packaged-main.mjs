var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../packages/sidecar-proto/dist/index.mjs
function assertObject(value, label) {
  if (typeof value !== "object" || value == null || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value;
}
function assertKnownKeys(value, allowed, label) {
  const allowedSet = new Set(allowed);
  const unexpected = Object.keys(value).filter((key) => !allowedSet.has(key));
  if (unexpected.length > 0) {
    throw new Error(`${label} contains unsupported fields: ${unexpected.join(", ")}`);
  }
}
function normalizeNonEmptyString(value, label) {
  if (typeof value !== "string") throw new Error(`${label} must be a string`);
  if (value.length === 0) throw new Error(`${label} must not be empty`);
  return value;
}
function normalizeNamespace(namespace) {
  if (typeof namespace !== "string") throw new Error("namespace must be a string");
  const value = namespace.trim();
  if (value.length === 0) throw new Error("namespace must not be empty");
  if (value !== namespace) throw new Error("namespace must not contain leading or trailing whitespace");
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value)) {
    throw new Error(`namespace contains unsupported characters: ${value}`);
  }
  if (/[\\/]/.test(value)) throw new Error(`namespace must not contain path separators: ${value}`);
  return value;
}
function isSidecarMode(value) {
  return Object.values(SIDECAR_MODES).includes(value);
}
function normalizeSidecarMode(mode) {
  if (!isSidecarMode(mode)) {
    throw new Error("sidecar mode must be dev or runtime");
  }
  return mode;
}
function isAppKey(value) {
  return Object.values(APP_KEYS).includes(value);
}
function normalizeAppKey(app5) {
  if (!isAppKey(app5)) throw new Error(`unsupported sidecar app: ${String(app5)}`);
  return app5;
}
function isSidecarSource(value) {
  return Object.values(SIDECAR_SOURCES).includes(value);
}
function normalizeSidecarSource(source) {
  if (!isSidecarSource(source)) {
    throw new Error(`unsupported sidecar source: ${String(source)}`);
  }
  return source;
}
function isWindowsNamedPipePath(value) {
  return typeof value === "string" && value.startsWith("\\\\.\\pipe\\");
}
function normalizeIpcPath(ipc) {
  if (typeof ipc !== "string") throw new Error("sidecar ipc path must be a string");
  if (ipc.length === 0) throw new Error("sidecar ipc path must not be empty");
  if (ipc.trim() !== ipc) throw new Error("sidecar ipc path must not contain leading or trailing whitespace");
  if (ipc.includes("\0")) throw new Error("sidecar ipc path must not contain null bytes");
  if (isWindowsNamedPipePath(ipc)) return ipc;
  if (!ipc.startsWith("/") && !/^[A-Za-z]:[\\/]/.test(ipc)) {
    throw new Error(`sidecar ipc path must be absolute: ${ipc}`);
  }
  return ipc;
}
function assertKnownStampKeys(value, label) {
  assertKnownKeys(value, SIDECAR_STAMP_FIELDS, label);
}
function normalizeSidecarStamp(input) {
  const value = assertObject(input, "sidecar stamp");
  assertKnownStampKeys(value, "sidecar stamp");
  return {
    app: normalizeAppKey(value.app),
    ipc: normalizeIpcPath(value.ipc),
    mode: normalizeSidecarMode(value.mode),
    namespace: normalizeNamespace(value.namespace),
    source: normalizeSidecarSource(value.source)
  };
}
function normalizeSidecarStampCriteria(input = {}) {
  const value = assertObject(input, "sidecar stamp criteria");
  assertKnownStampKeys(value, "sidecar stamp criteria");
  return {
    ...value.app == null ? {} : { app: normalizeAppKey(value.app) },
    ...value.ipc == null ? {} : { ipc: normalizeIpcPath(value.ipc) },
    ...value.mode == null ? {} : { mode: normalizeSidecarMode(value.mode) },
    ...value.namespace == null ? {} : { namespace: normalizeNamespace(value.namespace) },
    ...value.source == null ? {} : { source: normalizeSidecarSource(value.source) }
  };
}
function normalizeDesktopEvalInput(input) {
  const value = assertObject(input, "desktop eval input");
  assertKnownKeys(value, ["expression"], "desktop eval input");
  return { expression: normalizeNonEmptyString(value.expression, "desktop eval expression") };
}
function normalizeDesktopScreenshotInput(input) {
  const value = assertObject(input, "desktop screenshot input");
  assertKnownKeys(value, ["path"], "desktop screenshot input");
  return { path: normalizeNonEmptyString(value.path, "desktop screenshot path") };
}
function normalizeDesktopClickInput(input) {
  const value = assertObject(input, "desktop click input");
  assertKnownKeys(value, ["selector"], "desktop click input");
  return { selector: normalizeNonEmptyString(value.selector, "desktop click selector") };
}
function normalizeBoolean(value, label) {
  if (typeof value !== "boolean") throw new Error(`${label} must be a boolean`);
  return value;
}
function normalizeDesktopExportPdfInput(input) {
  const value = assertObject(input, "desktop PDF export input");
  assertKnownKeys(value, ["baseHref", "deck", "defaultFilename", "html", "title"], "desktop PDF export input");
  return {
    ...value.baseHref == null ? {} : { baseHref: normalizeNonEmptyString(value.baseHref, "desktop PDF export baseHref") },
    deck: normalizeBoolean(value.deck, "desktop PDF export deck"),
    defaultFilename: normalizeNonEmptyString(value.defaultFilename, "desktop PDF export defaultFilename"),
    html: normalizeNonEmptyString(value.html, "desktop PDF export html"),
    title: normalizeNonEmptyString(value.title, "desktop PDF export title")
  };
}
function isDesktopUpdateAction(value) {
  return Object.values(DESKTOP_UPDATE_ACTIONS).includes(value);
}
function normalizeDesktopUpdateInput(input) {
  const value = assertObject(input, "desktop update input");
  assertKnownKeys(value, ["action"], "desktop update input");
  if (!isDesktopUpdateAction(value.action)) {
    throw new Error(`unsupported desktop update action: ${String(value.action)}`);
  }
  return { action: value.action };
}
function normalizeMessageType(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new SidecarContractError(SIDECAR_ERROR_CODES.INVALID_MESSAGE, `${label} type must be a non-empty string`);
  }
  return value;
}
function normalizeDesktopSidecarMessage(input) {
  const value = assertObject(input, "desktop sidecar message");
  const type2 = normalizeMessageType(value.type, "desktop sidecar message");
  switch (type2) {
    case SIDECAR_MESSAGES.STATUS:
    case SIDECAR_MESSAGES.SHUTDOWN:
    case SIDECAR_MESSAGES.CONSOLE:
      assertKnownKeys(value, ["type"], "desktop sidecar message");
      return { type: type2 };
    case SIDECAR_MESSAGES.EVAL:
      assertKnownKeys(value, ["input", "type"], "desktop sidecar message");
      return { input: normalizeDesktopEvalInput(value.input), type: type2 };
    case SIDECAR_MESSAGES.SCREENSHOT:
      assertKnownKeys(value, ["input", "type"], "desktop sidecar message");
      return { input: normalizeDesktopScreenshotInput(value.input), type: type2 };
    case SIDECAR_MESSAGES.CLICK:
      assertKnownKeys(value, ["input", "type"], "desktop sidecar message");
      return { input: normalizeDesktopClickInput(value.input), type: type2 };
    case SIDECAR_MESSAGES.EXPORT_PDF:
      assertKnownKeys(value, ["input", "type"], "desktop sidecar message");
      return { input: normalizeDesktopExportPdfInput(value.input), type: type2 };
    case SIDECAR_MESSAGES.UPDATE:
      assertKnownKeys(value, ["input", "type"], "desktop sidecar message");
      return { input: normalizeDesktopUpdateInput(value.input), type: type2 };
    default:
      throw new SidecarContractError(SIDECAR_ERROR_CODES.UNKNOWN_MESSAGE, `unknown desktop sidecar message: ${type2}`);
  }
}
var APP_KEYS, SIDECAR_MODES, SIDECAR_SOURCES, SIDECAR_ENV, SIDECAR_RUNTIME_ENV, SIDECAR_STAMP_FLAGS, STAMP_APP_FLAG, STAMP_IPC_FLAG, STAMP_MODE_FLAG, STAMP_NAMESPACE_FLAG, STAMP_SOURCE_FLAG, SIDECAR_STAMP_FIELDS, SIDECAR_DEFAULTS, SIDECAR_MESSAGES, DESKTOP_UPDATE_ACTIONS, DESKTOP_UPDATE_MODES, DESKTOP_UPDATE_CHANNELS, DESKTOP_UPDATE_STATES, SIDECAR_ERROR_CODES, SidecarContractError, OPEN_DESIGN_SIDECAR_CONTRACT;
var init_dist = __esm({
  "../../packages/sidecar-proto/dist/index.mjs"() {
    "use strict";
    APP_KEYS = Object.freeze({
      DAEMON: "daemon",
      DESKTOP: "desktop",
      WEB: "web"
    });
    SIDECAR_MODES = Object.freeze({
      DEV: "dev",
      RUNTIME: "runtime"
    });
    SIDECAR_SOURCES = Object.freeze({
      PACKAGED: "packaged",
      TOOLS_DEV: "tools-dev",
      TOOLS_PACK: "tools-pack"
    });
    SIDECAR_ENV = Object.freeze({
      BASE: "OD_SIDECAR_BASE",
      DAEMON_CLI_PATH: "OD_DAEMON_CLI_PATH",
      DAEMON_PORT: "OD_PORT",
      IPC_BASE: "OD_SIDECAR_IPC_BASE",
      IPC_PATH: "OD_SIDECAR_IPC_PATH",
      NAMESPACE: "OD_SIDECAR_NAMESPACE",
      SOURCE: "OD_SIDECAR_SOURCE",
      TOOLS_DEV_PARENT_PID: "OD_TOOLS_DEV_PARENT_PID",
      WEB_DIST_DIR: "OD_WEB_DIST_DIR",
      WEB_PORT: "OD_WEB_PORT",
      WEB_TSCONFIG_PATH: "OD_WEB_TSCONFIG_PATH"
    });
    SIDECAR_RUNTIME_ENV = Object.freeze({
      base: SIDECAR_ENV.BASE,
      ipcBase: SIDECAR_ENV.IPC_BASE,
      ipcPath: SIDECAR_ENV.IPC_PATH,
      namespace: SIDECAR_ENV.NAMESPACE,
      source: SIDECAR_ENV.SOURCE
    });
    SIDECAR_STAMP_FLAGS = Object.freeze({
      app: "--od-stamp-app",
      ipc: "--od-stamp-ipc",
      mode: "--od-stamp-mode",
      namespace: "--od-stamp-namespace",
      source: "--od-stamp-source"
    });
    STAMP_APP_FLAG = SIDECAR_STAMP_FLAGS.app;
    STAMP_IPC_FLAG = SIDECAR_STAMP_FLAGS.ipc;
    STAMP_MODE_FLAG = SIDECAR_STAMP_FLAGS.mode;
    STAMP_NAMESPACE_FLAG = SIDECAR_STAMP_FLAGS.namespace;
    STAMP_SOURCE_FLAG = SIDECAR_STAMP_FLAGS.source;
    SIDECAR_STAMP_FIELDS = ["app", "mode", "namespace", "ipc", "source"];
    SIDECAR_DEFAULTS = Object.freeze({
      host: "127.0.0.1",
      ipcBase: "/tmp/open-design/ipc",
      namespace: "default",
      projectTmpDirName: ".tmp",
      windowsPipePrefix: "open-design"
    });
    SIDECAR_MESSAGES = Object.freeze({
      CLICK: "click",
      CONSOLE: "console",
      EVAL: "eval",
      EXPORT_PDF: "export-pdf",
      MINT_IMPORT_TOKEN: "mint-import-token",
      REGISTER_DESKTOP_AUTH: "register-desktop-auth",
      SCREENSHOT: "screenshot",
      SHUTDOWN: "shutdown",
      STATUS: "status",
      UPDATE: "update"
    });
    DESKTOP_UPDATE_ACTIONS = Object.freeze({
      CHECK: "check",
      DOWNLOAD: "download",
      INSTALL: "install",
      STATUS: "status"
    });
    DESKTOP_UPDATE_MODES = Object.freeze({
      JS_INCREMENTAL: "js-incremental",
      PACKAGE_LAUNCHER: "package-launcher"
    });
    DESKTOP_UPDATE_CHANNELS = Object.freeze({
      BETA: "beta",
      NIGHTLY: "nightly",
      PREVIEW: "preview",
      STABLE: "stable"
    });
    DESKTOP_UPDATE_STATES = Object.freeze({
      AVAILABLE: "available",
      CHECKING: "checking",
      DOWNLOADED: "downloaded",
      DOWNLOADING: "downloading",
      ERROR: "error",
      IDLE: "idle",
      INSTALLING: "installing",
      NOT_AVAILABLE: "not-available",
      UNSUPPORTED: "unsupported"
    });
    SIDECAR_ERROR_CODES = Object.freeze({
      INVALID_MESSAGE: "SIDECAR_INVALID_MESSAGE",
      UNKNOWN_MESSAGE: "SIDECAR_UNKNOWN_MESSAGE"
    });
    SidecarContractError = class extends Error {
      code;
      constructor(code, message) {
        super(message);
        this.name = "SidecarContractError";
        this.code = code;
      }
    };
    OPEN_DESIGN_SIDECAR_CONTRACT = Object.freeze({
      appKeys: APP_KEYS,
      defaults: SIDECAR_DEFAULTS,
      env: SIDECAR_RUNTIME_ENV,
      errorCodes: SIDECAR_ERROR_CODES,
      messages: SIDECAR_MESSAGES,
      modes: SIDECAR_MODES,
      normalizeApp: normalizeAppKey,
      normalizeNamespace,
      normalizeSource: normalizeSidecarSource,
      normalizeStamp: normalizeSidecarStamp,
      normalizeStampCriteria: normalizeSidecarStampCriteria,
      sources: SIDECAR_SOURCES,
      stampFields: SIDECAR_STAMP_FIELDS,
      stampFlags: SIDECAR_STAMP_FLAGS,
      updateActions: DESKTOP_UPDATE_ACTIONS,
      updateChannels: DESKTOP_UPDATE_CHANNELS,
      updateModes: DESKTOP_UPDATE_MODES,
      updateStates: DESKTOP_UPDATE_STATES
    });
  }
});

// ../../packages/sidecar/dist/index.mjs
import { lstat, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { createConnection, createServer as createNetServer } from "node:net";
import { dirname, isAbsolute, join, resolve } from "node:path";
function isWindowsNamedPipePath2(value) {
  return typeof value === "string" && value.startsWith("\\\\.\\pipe\\");
}
function resolveProjectRoot(projectRoot) {
  if (typeof projectRoot !== "string" || projectRoot.trim().length === 0) {
    throw new Error("projectRoot must be a non-empty string");
  }
  return resolve(projectRoot);
}
function resolveProjectTmpRoot({
  contract,
  projectRoot
}) {
  return join(resolveProjectRoot(projectRoot), contract.defaults.projectTmpDirName);
}
function resolveSourceRuntimeRoot({
  contract,
  projectRoot,
  source
}) {
  return join(resolveProjectTmpRoot({ contract, projectRoot }), contract.normalizeSource(source));
}
function resolveSidecarBase({
  base,
  contract,
  env = process.env,
  projectRoot = process.cwd(),
  source
}) {
  return resolve(base ?? env[contract.env.base] ?? resolveSourceRuntimeRoot({ contract, projectRoot, source }));
}
function resolveNamespaceRoot({
  base,
  contract,
  namespace
}) {
  return join(resolve(base), contract.normalizeNamespace(namespace));
}
function resolveRuntimeNamespaceRoot({
  contract,
  runtime,
  runtimeMode
}) {
  if (runtime.mode === runtimeMode) {
    return dirname(resolve(runtime.base));
  }
  return resolveNamespaceRoot({ base: runtime.base, contract, namespace: runtime.namespace });
}
function resolveLogsDir({
  app: app5,
  contract,
  runtimeRoot
}) {
  return join(runtimeRoot, "logs", contract.normalizeApp(app5));
}
function resolveLogFilePath({
  app: app5,
  contract,
  fileName = "latest.log",
  runtimeRoot
}) {
  return join(resolveLogsDir({ app: app5, contract, runtimeRoot }), fileName);
}
function resolveAppIpcPath({
  app: app5,
  contract,
  env = process.env,
  namespace
}) {
  const normalizedApp = contract.normalizeApp(app5);
  const normalizedNamespace = contract.normalizeNamespace(namespace);
  if (process.platform === "win32") {
    return `\\\\.\\pipe\\${contract.defaults.windowsPipePrefix}-${normalizedNamespace}-${normalizedApp}`;
  }
  const ipcBase = resolve(env[contract.env.ipcBase] ?? contract.defaults.ipcBase);
  return join(ipcBase, normalizedNamespace, `${normalizedApp}.sock`);
}
function createSidecarLaunchEnv({
  base,
  contract,
  extraEnv = process.env,
  stamp
}) {
  const normalizedStamp = contract.normalizeStamp(stamp);
  return {
    ...extraEnv,
    [contract.env.base]: resolveSidecarBase({ base, contract, env: extraEnv, source: normalizedStamp.source }),
    [contract.env.ipcPath]: normalizedStamp.ipc,
    [contract.env.namespace]: normalizedStamp.namespace,
    [contract.env.source]: normalizedStamp.source
  };
}
function assertMatchingEnv(env, key, expected) {
  const current = env[key];
  if (current != null && current !== expected) {
    throw new Error(`sidecar env mismatch for ${key}: expected ${expected}, received ${current}`);
  }
}
function bootstrapSidecarRuntime(stampInput, env, options) {
  const stamp = options.contract.normalizeStamp(stampInput);
  const expectedApp = options.contract.normalizeApp(options.app);
  if (stamp.app !== expectedApp) {
    throw new Error(`sidecar stamp app mismatch: expected ${expectedApp}, received ${stamp.app}`);
  }
  const base = resolveSidecarBase({
    base: options.base,
    contract: options.contract,
    env,
    projectRoot: options.projectRoot,
    source: stamp.source
  });
  const ipc = resolveAppIpcPath({ app: stamp.app, contract: options.contract, env, namespace: stamp.namespace });
  if (stamp.ipc !== ipc) {
    throw new Error(`sidecar ipc path mismatch: expected ${ipc}, received ${stamp.ipc}`);
  }
  assertMatchingEnv(env, options.contract.env.ipcPath, stamp.ipc);
  assertMatchingEnv(env, options.contract.env.namespace, stamp.namespace);
  assertMatchingEnv(env, options.contract.env.source, stamp.source);
  env[options.contract.env.ipcPath] = ipc;
  env[options.contract.env.namespace] = stamp.namespace;
  env[options.contract.env.source] = stamp.source;
  return {
    app: stamp.app,
    base,
    ipc,
    mode: stamp.mode,
    namespace: stamp.namespace,
    source: stamp.source
  };
}
async function closeServer(server) {
  if (!server.listening) return;
  await new Promise((resolveClose, rejectClose) => {
    server.close((error) => error == null ? resolveClose() : rejectClose(error));
  });
}
function errorCode(error) {
  if (typeof error !== "object" || error == null || !("code" in error)) return null;
  const code = error.code;
  return code == null ? null : String(code);
}
function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
function jsonIpcError(error) {
  return {
    ...errorCode(error) == null ? {} : { code: errorCode(error) },
    message: errorMessage(error)
  };
}
async function writeJsonFile(filePath, payload) {
  await mkdir(dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmpPath, `${JSON.stringify(payload, null, 2)}
`, "utf8");
  await rename(tmpPath, filePath);
}
async function removeFile(filePath) {
  await rm(filePath, { force: true });
}
async function staleUnixSocketExists(socketPath) {
  try {
    const stat7 = await lstat(socketPath);
    if (!stat7.isSocket()) return false;
  } catch (error) {
    if (errorCode(error) === "ENOENT") return false;
    throw error;
  }
  return await new Promise((resolveStale, rejectStale) => {
    const socket = createConnection(socketPath);
    let settled = false;
    const settle = (callback) => {
      if (settled) return;
      settled = true;
      socket.removeAllListeners();
      socket.destroy();
      callback();
    };
    socket.once("connect", () => settle(() => resolveStale(false)));
    socket.once("error", (error) => {
      const code = errorCode(error);
      if (code === "ENOENT" || code === "ECONNREFUSED") {
        settle(() => resolveStale(true));
        return;
      }
      settle(() => rejectStale(error));
    });
  });
}
async function prepareIpcPath(socketPath) {
  if (isWindowsNamedPipePath2(socketPath)) return;
  await mkdir(dirname(socketPath), { recursive: true });
  if (await staleUnixSocketExists(socketPath)) await rm(socketPath, { force: true });
}
async function createJsonIpcServer({
  handler,
  socketPath
}) {
  await prepareIpcPath(socketPath);
  const server = createNetServer((socket) => {
    let buffer = "";
    socket.on("error", () => {
    });
    socket.on("data", async (chunk) => {
      buffer += chunk.toString();
      const newlineIndex = buffer.indexOf("\n");
      if (newlineIndex < 0) return;
      const frame = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      try {
        const result = await handler(JSON.parse(frame));
        socket.end(`${JSON.stringify({ ok: true, result })}
`);
      } catch (error) {
        socket.end(
          `${JSON.stringify({
            ok: false,
            error: jsonIpcError(error)
          })}
`
        );
      }
    });
  });
  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(socketPath, () => {
      server.off("error", rejectListen);
      resolveListen();
    });
  });
  return {
    async close() {
      await closeServer(server);
      if (!isWindowsNamedPipePath2(socketPath)) await rm(socketPath, { force: true });
    }
  };
}
async function requestJsonIpc(socketPath, payload, { timeoutMs = 1500 } = {}) {
  return await new Promise((resolveRequest, rejectRequest) => {
    const socket = createConnection(socketPath);
    let settled = false;
    let buffer = "";
    const settle = (callback) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      callback();
    };
    const timeout = setTimeout(() => {
      socket.destroy();
      settle(() => rejectRequest(new Error(`IPC request timed out: ${socketPath}`)));
    }, timeoutMs);
    socket.on("connect", () => {
      socket.write(`${JSON.stringify(payload)}
`);
    });
    socket.on("data", (chunk) => {
      buffer += chunk.toString();
      const newlineIndex = buffer.indexOf("\n");
      if (newlineIndex < 0) return;
      socket.end();
      settle(() => {
        const response = JSON.parse(buffer.slice(0, newlineIndex));
        if (!response.ok) {
          rejectRequest(new Error(response.error?.message ?? "IPC request failed"));
          return;
        }
        resolveRequest(response.result);
      });
    });
    socket.on("error", (error) => {
      settle(() => rejectRequest(error));
    });
  });
}
var init_dist2 = __esm({
  "../../packages/sidecar/dist/index.mjs"() {
    "use strict";
  }
});

// ../../packages/platform/dist/index.mjs
import { execFile, execFileSync, spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { copyFile, mkdir as mkdir2, readFile as readFile2, rename as rename2, rm as rm2, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname as dirname2, extname, isAbsolute as isAbsolute2, join as join2, relative, resolve as resolve2 } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
function defaultSystemProxyCommandRunner(command, args) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    timeout: 2e3,
    windowsHide: true
  });
}
function canonicalProxyEnvKey(key) {
  return CANONICAL_PROXY_ENV_KEYS.get(key.toLowerCase()) ?? null;
}
function deleteProxyEnvVariants(env, canonicalKey) {
  for (const existingKey of Object.keys(env)) {
    if (existingKey.toLowerCase() === canonicalKey.toLowerCase()) delete env[existingKey];
  }
}
function setCanonicalProxyEnvValue(env, canonicalKey, value, platform2) {
  deleteProxyEnvVariants(env, canonicalKey);
  if (canonicalKey === "NODE_USE_ENV_PROXY") {
    env.NODE_USE_ENV_PROXY = value;
    return;
  }
  addProxyEnvValue(env, canonicalKey, value, platform2);
}
function mergeProxyAwareEnv(platform2, ...sources) {
  const merged = {};
  for (const source of sources) {
    const proxyEntries = /* @__PURE__ */ new Map();
    for (const [key, value] of Object.entries(source)) {
      if (value == null) continue;
      const canonicalKey = canonicalProxyEnvKey(key);
      if (canonicalKey) {
        const current = proxyEntries.get(canonicalKey);
        const preferLowercase = key === key.toLowerCase();
        if (!current || preferLowercase || !current.preferLowercase) {
          proxyEntries.set(canonicalKey, { preferLowercase, value });
        }
        continue;
      }
      merged[key] = value;
    }
    for (const [canonicalKey, entry] of proxyEntries) {
      setCanonicalProxyEnvValue(merged, canonicalKey, entry.value, platform2);
    }
  }
  if (hasProxyEndpointEnv(merged) && !hasCanonicalProxyEnv(merged, "NODE_USE_ENV_PROXY")) {
    merged.NODE_USE_ENV_PROXY = "1";
  }
  return merged;
}
function hasCanonicalProxyEnv(env, canonicalKey) {
  return Object.keys(env).some((key) => key.toLowerCase() === canonicalKey.toLowerCase());
}
function hasProxyEndpointEnv(env) {
  return ["ALL_PROXY", "HTTP_PROXY", "HTTPS_PROXY"].some((key) => {
    for (const [envKey, value] of Object.entries(env)) {
      if (envKey.toLowerCase() === key.toLowerCase() && value?.trim()) return true;
    }
    return false;
  });
}
function addProxyEnvValue(env, key, value, platform2) {
  const trimmed = value.trim();
  if (!trimmed) return;
  env[key] = trimmed;
  if (platform2 !== "win32") env[key.toLowerCase()] = trimmed;
}
function normalizeBypassToken(token) {
  const trimmed = token.trim();
  if (!trimmed) return [];
  if (trimmed === "<local>") return ["<local>", "localhost", "127.0.0.1", "[::1]", ".local"];
  if (trimmed === "::1") return ["[::1]"];
  if (trimmed.startsWith("*.")) return [`.${trimmed.slice(2)}`];
  return [trimmed];
}
function buildNoProxyValue(tokens) {
  const seen = /* @__PURE__ */ new Set();
  const values = [];
  for (const token of tokens) {
    for (const normalized of normalizeBypassToken(token)) {
      if (!seen.has(normalized)) {
        seen.add(normalized);
        values.push(normalized);
      }
    }
  }
  return values.length > 0 ? values.join(",") : null;
}
function preserveWildcardNoProxyValue(noProxy) {
  return noProxy?.split(",").some((token) => token.trim() === "*") ? "*" : void 0;
}
function normalizeProxyUrl(raw, scheme) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `${scheme}://${trimmed}`;
}
function bracketIpv6Authority(authority) {
  if (authority.startsWith("[") || !authority.includes(":")) return authority;
  const portSeparatorIndex = authority.lastIndexOf(":");
  if (portSeparatorIndex <= 0) return authority;
  const host = authority.slice(0, portSeparatorIndex);
  const port = authority.slice(portSeparatorIndex + 1);
  if (!host.includes(":") || !/^\d+$/.test(port)) return authority;
  return `[${host}]:${port}`;
}
function normalizeAuthorityProxyUrl(raw, scheme) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  return `${scheme}://${bracketIpv6Authority(trimmed)}`;
}
function normalizeHostPortProxyUrl(host, port, scheme) {
  const trimmedHost = host?.trim() ?? "";
  const trimmedPort = port?.trim() ?? "";
  if (!trimmedHost || !trimmedPort) return null;
  const normalizedHost = trimmedHost.includes(":") && !trimmedHost.startsWith("[") && !trimmedHost.endsWith("]") ? `[${trimmedHost}]` : trimmedHost;
  return normalizeProxyUrl(`${normalizedHost}:${trimmedPort}`, scheme);
}
function finalizeSystemProxyEnv(values, platform2) {
  const hasProxy = Boolean(values.httpProxy || values.httpsProxy || values.allProxy);
  const noProxy = hasProxy ? preserveWildcardNoProxyValue(values.noProxy) ?? buildNoProxyValue([
    ...values.noProxy ? values.noProxy.split(",") : [],
    "localhost",
    "127.0.0.1",
    "[::1]"
  ]) : null;
  const env = {};
  if (values.httpProxy) addProxyEnvValue(env, "HTTP_PROXY", values.httpProxy, platform2);
  if (values.httpsProxy) addProxyEnvValue(env, "HTTPS_PROXY", values.httpsProxy, platform2);
  if (values.allProxy) addProxyEnvValue(env, "ALL_PROXY", values.allProxy, platform2);
  if (noProxy) addProxyEnvValue(env, "NO_PROXY", noProxy, platform2);
  if (hasProxy) env.NODE_USE_ENV_PROXY = "1";
  return env;
}
function parseMacosScutilProxyOutput(stdout, platform2 = "darwin") {
  const scalars = /* @__PURE__ */ new Map();
  const exceptions = [];
  let inExceptions = false;
  for (const rawLine of stdout.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^ExceptionsList\s*:\s*<array>\s*\{$/.test(line)) {
      inExceptions = true;
      continue;
    }
    if (inExceptions) {
      if (line === "}") {
        inExceptions = false;
        continue;
      }
      const match2 = line.match(/^\d+\s*:\s*(.+)$/);
      if (match2) exceptions.push(match2[1].trim());
      continue;
    }
    const match = line.match(/^([A-Za-z][A-Za-z0-9]*)\s*:\s*(.+)$/);
    if (match) scalars.set(match[1], match[2].trim());
  }
  const httpProxy = scalars.get("HTTPEnable") === "1" ? normalizeHostPortProxyUrl(scalars.get("HTTPProxy"), scalars.get("HTTPPort"), "http") : null;
  const httpsProxy = scalars.get("HTTPSEnable") === "1" ? normalizeHostPortProxyUrl(scalars.get("HTTPSProxy"), scalars.get("HTTPSPort"), "http") : null;
  const allProxy = scalars.get("SOCKSEnable") === "1" ? normalizeHostPortProxyUrl(scalars.get("SOCKSProxy"), scalars.get("SOCKSPort"), "socks5") : null;
  return finalizeSystemProxyEnv(
    {
      allProxy,
      httpProxy,
      httpsProxy,
      noProxy: buildNoProxyValue([
        ...exceptions,
        ...scalars.get("ExcludeSimpleHostnames") === "1" ? ["<local>"] : []
      ])
    },
    platform2
  );
}
function parseRegistryValue(stdout, valueName) {
  const match = stdout.match(new RegExp(`^\\s*${valueName}\\s+REG_\\w+\\s+(.+)$`, "m"));
  return match ? match[1].trim() : null;
}
function parseWindowsInternetSettingsProxyOutput(input, platform2 = "win32") {
  const enabled = parseRegistryValue(input.proxyEnable, "ProxyEnable");
  if (enabled == null || !/^(1|0x1)$/i.test(enabled)) return {};
  const proxyServer = parseRegistryValue(input.proxyServer ?? "", "ProxyServer") ?? "";
  const proxyOverride = parseRegistryValue(input.proxyOverride ?? "", "ProxyOverride") ?? "";
  if (!proxyServer.trim()) return {};
  let httpProxy = null;
  let httpsProxy = null;
  let allProxy = null;
  if (proxyServer.includes("=")) {
    for (const segment of proxyServer.split(";")) {
      const [kind, rawValue] = segment.split("=", 2);
      const value = rawValue?.trim();
      if (!kind || !value) continue;
      const lowerKind = kind.trim().toLowerCase();
      if (lowerKind === "http") httpProxy = normalizeAuthorityProxyUrl(value, "http");
      else if (lowerKind === "https") httpsProxy = normalizeAuthorityProxyUrl(value, "http");
      else if (lowerKind === "socks") allProxy = normalizeAuthorityProxyUrl(value, "socks5");
    }
  } else {
    const shared = normalizeAuthorityProxyUrl(proxyServer, "http");
    httpProxy = shared;
    httpsProxy = shared;
  }
  return finalizeSystemProxyEnv(
    {
      allProxy,
      httpProxy,
      httpsProxy,
      noProxy: buildNoProxyValue(proxyOverride.split(/[;,]/))
    },
    platform2
  );
}
function resolveSystemProxyEnv(options = {}) {
  const platform2 = options.platform ?? process.platform;
  const runCommand = options.runCommand ?? defaultSystemProxyCommandRunner;
  const tryRun = (command, args) => {
    try {
      return runCommand(command, args);
    } catch {
      return "";
    }
  };
  try {
    if (platform2 === "darwin") {
      return parseMacosScutilProxyOutput(tryRun("scutil", ["--proxy"]), platform2);
    }
    if (platform2 === "win32") {
      return parseWindowsInternetSettingsProxyOutput(
        {
          proxyEnable: tryRun("reg", [
            "query",
            "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings",
            "/v",
            "ProxyEnable"
          ]),
          proxyOverride: tryRun("reg", [
            "query",
            "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings",
            "/v",
            "ProxyOverride"
          ]),
          proxyServer: tryRun("reg", [
            "query",
            "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings",
            "/v",
            "ProxyServer"
          ])
        },
        platform2
      );
    }
  } catch {
    return {};
  }
  return {};
}
function createProcessStampArgs(stamp, contract) {
  const normalized = contract.normalizeStamp(stamp);
  return contract.stampFields.map((field) => {
    const value = normalized[field];
    if (typeof value !== "string") {
      throw new Error(`process stamp field ${field} must normalize to a string`);
    }
    return `${contract.stampFlags[field]}=${value}`;
  });
}
function readFlagValue(args, flagName) {
  const inlinePrefix = `${flagName}=`;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === flagName) return args[index + 1] ?? null;
    if (typeof argument === "string" && argument.startsWith(inlinePrefix)) {
      return argument.slice(inlinePrefix.length);
    }
  }
  return null;
}
function readProcessStamp(args, contract) {
  try {
    const input = Object.fromEntries(
      contract.stampFields.map((field) => [field, readFlagValue(args, contract.stampFlags[field])])
    );
    return contract.normalizeStamp(input);
  } catch {
    return null;
  }
}
function errorCode2(error) {
  if (typeof error !== "object" || error == null || !("code" in error)) return null;
  const code = error.code;
  return code == null ? null : String(code);
}
function errorMessage2(error) {
  return error instanceof Error ? error.message : String(error);
}
function pathContains(root, target) {
  const resolvedRoot = resolve2(root);
  const resolvedTarget = resolve2(target);
  const rel = relative(resolvedRoot, resolvedTarget);
  return rel === "" || rel.length > 0 && !rel.startsWith("..") && !isAbsolute2(rel);
}
function destinationExistsError(destinationPath) {
  const error = new Error(`destination already exists: ${destinationPath}`);
  error.code = "EEXIST";
  return error;
}
async function atomicCopyFile(sourcePath, destinationPath, options = {}) {
  const source = resolve2(sourcePath);
  const destination = resolve2(destinationPath);
  if (source === destination) {
    const entry = await stat(destination);
    if (!entry.isFile()) throw new Error(`destination is not a file: ${destination}`);
    return { bytesCopied: entry.size, replaced: true };
  }
  const destinationDir = dirname2(destination);
  await mkdir2(destinationDir, { recursive: true });
  const existing = await stat(destination).catch((error) => {
    if (errorCode2(error) === "ENOENT") return null;
    throw error;
  });
  if (existing != null && options.overwrite !== true) {
    throw destinationExistsError(destination);
  }
  const tempPath = join2(
    destinationDir,
    `.${basename(destination)}.${process.pid}.${Date.now().toString(36)}.${Math.random().toString(36).slice(2)}.tmp`
  );
  try {
    await copyFile(source, tempPath);
    if (options.overwrite === true) {
      await rm2(destination, { force: true });
    }
    await rename2(tempPath, destination);
    const copied = await stat(destination);
    return { bytesCopied: copied.size, replaced: existing != null };
  } catch (error) {
    await rm2(tempPath, { force: true }).catch(() => void 0);
    throw error;
  }
}
async function removePathBestEffort(path, options = {}) {
  try {
    await rm2(path, { force: true, recursive: options.recursive ?? true });
    return { removed: true };
  } catch (error) {
    return { error: errorMessage2(error), removed: false };
  }
}
function isProcessAlive(pid) {
  if (typeof pid !== "number") return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (errorCode2(error) === "ESRCH") return false;
    return true;
  }
}
async function waitForProcessExit(pid, timeoutMs = 5e3) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (!isProcessAlive(pid)) return true;
    await sleep(100);
  }
  return !isProcessAlive(pid);
}
function signalProcesses(pids, signal) {
  for (const pid of pids) {
    try {
      process.kill(pid, signal);
    } catch (error) {
      if (errorCode2(error) !== "ESRCH") throw error;
    }
  }
}
async function waitForProcessesToExit(pids, timeoutMs = 5e3) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const remaining = pids.filter(isProcessAlive);
    if (remaining.length === 0) return [];
    await sleep(100);
  }
  return pids.filter(isProcessAlive);
}
async function stopProcesses(pids) {
  const uniquePids = [...new Set(pids)].filter((pid) => typeof pid === "number" && pid !== process.pid).sort((left, right) => right - left);
  if (uniquePids.length === 0) {
    return { alreadyStopped: true, forcedPids: [], matchedPids: [], remainingPids: [], stoppedPids: [] };
  }
  signalProcesses(uniquePids, "SIGTERM");
  const remainingAfterTerm = await waitForProcessesToExit(uniquePids);
  if (remainingAfterTerm.length === 0) {
    return { alreadyStopped: false, forcedPids: [], matchedPids: uniquePids, remainingPids: [], stoppedPids: uniquePids };
  }
  signalProcesses(remainingAfterTerm, "SIGKILL");
  const remainingAfterKill = await waitForProcessesToExit(remainingAfterTerm);
  const stoppedPids = uniquePids.filter((pid) => !remainingAfterKill.includes(pid));
  return { alreadyStopped: false, forcedPids: remainingAfterTerm, matchedPids: uniquePids, remainingPids: remainingAfterKill, stoppedPids };
}
function resolveUserScopedHome(raw, home) {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (value.length === 0) return null;
  if (value === "~") return home;
  if (value.startsWith("~/") || value.startsWith("~\\")) {
    return join2(home, value.slice(2));
  }
  return isAbsolute2(value) ? value : null;
}
function wellKnownUserToolchainBins(options = {}) {
  const home = options.home ?? homedir();
  const includeSystemBins = options.includeSystemBins ?? process.platform !== "win32";
  const env = options.env ?? process.env;
  const dirs = [];
  const vpHome = resolveUserScopedHome(env.VP_HOME, home);
  if (vpHome) {
    dirs.push(join2(vpHome, "bin"));
  }
  const npmPrefixRaw = env.NPM_CONFIG_PREFIX ?? env.npm_config_prefix;
  if (typeof npmPrefixRaw === "string") {
    const npmPrefix = npmPrefixRaw.trim();
    if (npmPrefix.length > 0) {
      dirs.push(join2(npmPrefix, "bin"));
    }
  }
  dirs.push(
    join2(home, ".local", "bin"),
    join2(home, ".vite-plus", "bin"),
    join2(home, ".opencode", "bin"),
    join2(home, ".bun", "bin"),
    join2(home, ".volta", "bin"),
    join2(home, ".asdf", "shims"),
    join2(home, "Library", "pnpm"),
    join2(home, ".cargo", "bin"),
    // Common user-level npm prefixes for sudo-free global installs.
    // ~/.npm-global is the dominant non-canonical convention shipped
    // in most third-party "fix npm EACCES" tutorials, and
    // ~/.npm-packages is the second-most common variant. Without
    // these, GUI-launched daemons miss `npm i -g`'d CLIs even though
    // they resolve cleanly from the user's shell. See open-design
    // issue #442.
    join2(home, ".npm-global", "bin"),
    join2(home, ".npm-packages", "bin")
  );
  if (includeSystemBins) {
    dirs.push("/opt/homebrew/bin", "/usr/local/bin");
  }
  dirs.push(...existingMiseNpmPackageBinDirs(join2(home, ".local", "share", "mise", "installs")));
  for (const installRoot of [
    {
      root: join2(home, ".local", "share", "mise", "installs", "node"),
      segments: ["bin"]
    },
    {
      root: join2(home, ".nvm", "versions", "node"),
      segments: ["bin"]
    },
    {
      root: join2(home, ".local", "share", "fnm", "node-versions"),
      segments: ["installation", "bin"]
    },
    {
      root: join2(home, ".fnm", "node-versions"),
      segments: ["installation", "bin"]
    }
  ]) {
    for (const dir of existingChildBinDirs(installRoot.root, installRoot.segments)) {
      dirs.push(dir);
    }
  }
  return dirs;
}
function existingMiseNpmPackageBinDirs(root) {
  const out = [];
  for (const packageName of ["npm-openai-codex"]) {
    const packageRoot = join2(root, packageName);
    out.push(...existingChildBinDirs(packageRoot, ["bin"]));
  }
  return out;
}
function existingChildBinDirs(root, segments) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(root, { encoding: "utf8", withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of sortVersionedDirEntries(entries)) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    const candidate = join2(root, entry.name, ...segments);
    if (existsSync(candidate)) out.push(candidate);
  }
  return out;
}
function sortVersionedDirEntries(entries) {
  return [...entries].sort((left, right) => compareVersionLikeDirNames(left.name, right.name));
}
function compareVersionLikeDirNames(left, right) {
  const leftSemver = parseVersionLikeDirName(left);
  const rightSemver = parseVersionLikeDirName(right);
  if (leftSemver && rightSemver) {
    for (let index = 0; index < leftSemver.length; index += 1) {
      const difference = rightSemver[index] - leftSemver[index];
      if (difference !== 0) return difference;
    }
  } else if (leftSemver) {
    return -1;
  } else if (rightSemver) {
    return 1;
  }
  return left.localeCompare(right);
}
function parseVersionLikeDirName(name) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(name);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}
var CANONICAL_PROXY_ENV_KEYS;
var init_dist3 = __esm({
  "../../packages/platform/dist/index.mjs"() {
    "use strict";
    CANONICAL_PROXY_ENV_KEYS = /* @__PURE__ */ new Map([
      ["all_proxy", "ALL_PROXY"],
      ["http_proxy", "HTTP_PROXY"],
      ["https_proxy", "HTTPS_PROXY"],
      ["node_use_env_proxy", "NODE_USE_ENV_PROXY"],
      ["no_proxy", "NO_PROXY"]
    ]);
  }
});

// ../desktop/dist/main/pdf-export.js
import { writeFile as writeFile2 } from "node:fs/promises";
import { BrowserWindow, dialog } from "electron";
async function exportPdfFromHtml(input) {
  const save = await dialog.showSaveDialog({
    defaultPath: input.defaultFilename,
    filters: [
      { name: "PDF", extensions: ["pdf"] },
      { name: "All Files", extensions: ["*"] }
    ],
    title: "Save PDF"
  });
  if (save.canceled || !save.filePath)
    return { canceled: true, ok: true };
  const window2 = new BrowserWindow({
    height: input.deck ? 1080 : 900,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
    width: input.deck ? 1920 : 1440
  });
  try {
    await window2.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(buildPrintableDocument(input))}`);
    await waitForPrintableContent(window2);
    const pageSize = input.deck ? DECK_PAGE_SIZE : await inferPageSize(window2);
    const pdf = await window2.webContents.printToPDF(printToPdfOptions(pageSize));
    await writeFile2(save.filePath, pdf);
    return { ok: true, path: save.filePath };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error), ok: false };
  } finally {
    if (!window2.isDestroyed())
      window2.destroy();
  }
}
function pdfFilenameFromDocument(html) {
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const title = match ? decodeBasicEntities(match[1]).trim() : "";
  return `${safeFilename(title, "artifact")}.pdf`;
}
async function savePrintReadyDocumentAsPdf(html, nonce, target, options = {}) {
  const savePath = await target.promptSavePath(pdfFilenameFromDocument(html));
  if (savePath == null) {
    target.dispose();
    return { canceled: true, ok: true };
  }
  try {
    await target.load(html, options);
    await target.waitUntilReady(nonce);
    const pageSize = options.deck ? DECK_PAGE_SIZE : await target.measurePageSize();
    const pdf = await target.printToPdf(printToPdfOptions(pageSize));
    await target.write(savePath, pdf);
    return { ok: true, path: savePath };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error), ok: false };
  } finally {
    target.dispose();
  }
}
function createElectronPdfTarget() {
  let window2 = null;
  return {
    async promptSavePath(defaultFilename) {
      const save = await dialog.showSaveDialog({
        defaultPath: defaultFilename,
        filters: [
          { name: "PDF", extensions: ["pdf"] },
          { name: "All Files", extensions: ["*"] }
        ],
        title: "Save PDF"
      });
      return save.canceled || !save.filePath ? null : save.filePath;
    },
    async load(html, options) {
      const printWindow = new BrowserWindow({
        height: options.deck ? 1080 : 900,
        show: false,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: true
        },
        width: options.deck ? 1920 : 1440
      });
      window2 = printWindow;
      printWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
      printWindow.webContents.on("will-navigate", (event) => event.preventDefault());
      await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    },
    async waitUntilReady(nonce) {
      if (!window2)
        throw new Error("PDF render window has not been loaded");
      await waitForPrintReadyHandshake(window2.webContents, nonce);
    },
    async measurePageSize() {
      if (!window2)
        throw new Error("PDF render window has not been loaded");
      return inferPageSize(window2);
    },
    async printToPdf(options) {
      if (!window2)
        throw new Error("PDF render window has not been loaded");
      return window2.webContents.printToPDF(options);
    },
    async write(filePath, data) {
      await writeFile2(filePath, data);
    },
    dispose() {
      if (window2 && !window2.isDestroyed())
        window2.destroy();
      window2 = null;
    }
  };
}
function printToPdfOptions(pageSize) {
  return {
    margins: { bottom: 0, left: 0, right: 0, top: 0 },
    pageSize,
    preferCSSPageSize: true,
    printBackground: true
  };
}
function buildPrintableDocument(input) {
  const source = injectBaseHref(input.html, input.baseHref);
  const withTitle = injectTitle(source, input.title);
  return input.deck ? injectPrintStylesheet(withTitle, DECK_PRINT_CSS) : withTitle;
}
function injectBaseHref(doc, baseHref) {
  if (!baseHref)
    return doc;
  const tag = `<base href="${escapeHtmlAttribute(baseHref)}">`;
  if (/<head[^>]*>/i.test(doc))
    return doc.replace(/<head[^>]*>/i, (match) => `${match}${tag}`);
  if (/<html[^>]*>/i.test(doc))
    return doc.replace(/<html[^>]*>/i, (match) => `${match}<head>${tag}</head>`);
  return `<!doctype html><html><head>${tag}</head><body>${doc}</body></html>`;
}
function injectTitle(doc, title) {
  const tag = `<title>${escapeHtmlText(title)}</title>`;
  if (/<title[^>]*>.*?<\/title>/is.test(doc))
    return doc.replace(/<title[^>]*>.*?<\/title>/is, tag);
  if (/<head[^>]*>/i.test(doc))
    return doc.replace(/<head[^>]*>/i, (match) => `${match}${tag}`);
  if (/<html[^>]*>/i.test(doc))
    return doc.replace(/<html[^>]*>/i, (match) => `${match}<head>${tag}</head>`);
  return `<!doctype html><html><head>${tag}</head><body>${doc}</body></html>`;
}
function injectPrintStylesheet(doc, css) {
  const tag = `<style data-od-desktop-pdf>${css}</style>`;
  if (/<\/head>/i.test(doc))
    return doc.replace(/<\/head>/i, `${tag}</head>`);
  if (/<head[^>]*>/i.test(doc))
    return doc.replace(/<head[^>]*>/i, (match) => `${match}${tag}`);
  return `${tag}${doc}`;
}
async function waitForPrintableContent(window2) {
  await window2.webContents.executeJavaScript(`Promise.all([
      document.fonts && document.fonts.ready ? document.fonts.ready.catch(function(){}) : Promise.resolve(),
      Promise.all(Array.from(document.images || []).map(function(img) {
        if (img.complete) return Promise.resolve();
        return new Promise(function(resolve) {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        });
      }))
    ]).then(function(){ return true; })`, true);
}
async function waitForPrintReadyHandshake(webContents, nonce) {
  const handshake = webContents.executeJavaScript(`(function() {
      if (window.__odPrintReady) return Promise.resolve(true);
      return new Promise(function(resolve) {
        window.addEventListener('message', function handler(event) {
          if (event.data && event.data.type === 'OD_PRINT_READY' && event.data.nonce === '${nonce}') {
            window.__odPrintReady = true;
            window.removeEventListener('message', handler);
            resolve(true);
          }
        });
      });
    })()`, true);
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Print handshake timed out")), 3e4));
  await Promise.race([handshake, timeout]);
}
async function inferPageSize(window2) {
  const size = await window2.webContents.executeJavaScript(`(() => {
      const de = document.documentElement;
      const body = document.body || de;
      return {
        width: Math.max(de.scrollWidth, body.scrollWidth, de.clientWidth, 1440),
        height: Math.max(de.scrollHeight, body.scrollHeight, de.clientHeight, 900)
      };
    })()`, true);
  const widthPx = typeof size.width === "number" && Number.isFinite(size.width) ? size.width : 1440;
  const heightPx = typeof size.height === "number" && Number.isFinite(size.height) ? size.height : 900;
  return {
    width: clamp(widthPx / 96, 1, MAX_PAGE_INCHES),
    height: clamp(heightPx / 96, 1, MAX_PAGE_INCHES)
  };
}
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function escapeHtmlAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeHtmlText(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function decodeBasicEntities(value) {
  return BASIC_HTML_ENTITIES.reduce((acc, [pattern, char]) => acc.replace(pattern, char), value);
}
function safeFilename(name, fallback) {
  const slug = (name || fallback).replace(/[^\w.\-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  return slug || fallback;
}
var DECK_PAGE_SIZE, MAX_PAGE_INCHES, DECK_PRINT_CSS, BASIC_HTML_ENTITIES;
var init_pdf_export = __esm({
  "../desktop/dist/main/pdf-export.js"() {
    "use strict";
    DECK_PAGE_SIZE = { width: 13.333333, height: 7.5 };
    MAX_PAGE_INCHES = 200;
    DECK_PRINT_CSS = `
@media print {
  @page { size: 1920px 1080px; margin: 0; }
  html, body {
    width: 1920px !important;
    height: auto !important;
    overflow: visible !important;
    background: #fff !important;
  }
  body {
    display: block !important;
    scroll-snap-type: none !important;
    transform: none !important;
  }
  .slide, [data-screen-label], section.slide, .deck-slide, .ppt-slide {
    flex: none !important;
    width: 1920px !important;
    height: 1080px !important;
    min-height: 1080px !important;
    max-height: 1080px !important;
    page-break-after: always;
    break-after: page;
    scroll-snap-align: none !important;
    transform: none !important;
    position: relative !important;
    overflow: hidden !important;
  }
  .slide:last-child, [data-screen-label]:last-child { page-break-after: auto; break-after: auto; }
  .deck-counter, .deck-hint, .deck-nav,
  [aria-label="Previous slide"], [aria-label="Next slide"] {
    display: none !important;
  }
}
`;
    BASIC_HTML_ENTITIES = [
      [/&lt;/gi, "<"],
      [/&gt;/gi, ">"],
      [/&quot;/gi, '"'],
      [/&#39;/g, "'"],
      [/&amp;/gi, "&"]
    ];
  }
});

// ../desktop/dist/main/runtime.js
import { createHmac, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { appendFile, mkdir as mkdir3, realpath, stat as stat2, writeFile as writeFile3 } from "node:fs/promises";
import { dirname as dirname3, isAbsolute as isAbsolute3, join as join3, resolve as resolve3 } from "node:path";
import { fileURLToPath } from "node:url";
import { BrowserWindow as BrowserWindow2, app, dialog as dialog2, ipcMain, nativeImage, screen, shell } from "electron";
async function validateExistingDirectory(p) {
  if (typeof p !== "string" || p.length === 0) {
    return { ok: false, reason: "path must be a non-empty string" };
  }
  if (!isAbsolute3(p)) {
    return { ok: false, reason: "path must be absolute" };
  }
  let resolvedReal;
  try {
    resolvedReal = await realpath(p);
  } catch {
    return { ok: false, reason: "path does not exist" };
  }
  let st;
  try {
    st = await stat2(resolvedReal);
  } catch {
    return { ok: false, reason: "path could not be stat'd" };
  }
  if (!st.isDirectory()) {
    return { ok: false, reason: "path is not a directory" };
  }
  if (resolvedReal.toLowerCase().endsWith(".app")) {
    return { ok: false, reason: "application bundles are not project directories" };
  }
  return { ok: true, resolved: resolvedReal };
}
function isOpenPathAllowedForProject(context) {
  if (context.hasBaseDir && !context.fromTrustedPicker) {
    return { ok: false, reason: "project did not come from the trusted picker flow" };
  }
  return { ok: true };
}
async function fetchResolvedProjectDir(apiBaseUrl, projectId, fetchImpl = globalThis.fetch) {
  if (typeof projectId !== "string" || projectId.length === 0) {
    return { ok: false, reason: "project id must be a non-empty string" };
  }
  if (!/^[A-Za-z0-9._-]{1,128}$/.test(projectId)) {
    return { ok: false, reason: "project id contains disallowed characters" };
  }
  let resp;
  try {
    resp = await fetchImpl(`${apiBaseUrl.replace(/\/+$/, "")}/api/projects/${encodeURIComponent(projectId)}`);
  } catch (err) {
    return { ok: false, reason: `daemon fetch failed: ${err instanceof Error ? err.message : String(err)}` };
  }
  if (!resp.ok) {
    return { ok: false, reason: `daemon returned HTTP ${resp.status}` };
  }
  let body;
  try {
    body = await resp.json();
  } catch {
    return { ok: false, reason: "daemon response was not JSON" };
  }
  const resolvedDir = body && typeof body === "object" && "resolvedDir" in body ? body.resolvedDir : void 0;
  if (typeof resolvedDir !== "string" || resolvedDir.length === 0) {
    return { ok: false, reason: "daemon response did not include resolvedDir" };
  }
  const project = body && typeof body === "object" && "project" in body ? body.project : void 0;
  const metadata = project && typeof project === "object" && "metadata" in project ? project.metadata : void 0;
  const hasBaseDir = metadata != null && typeof metadata === "object" && typeof metadata.baseDir === "string" && metadata.baseDir.length > 0;
  const fromTrustedPicker = metadata != null && typeof metadata === "object" && metadata.fromTrustedPicker === true;
  return { ok: true, context: { fromTrustedPicker, hasBaseDir, resolvedDir } };
}
function signDesktopImportToken(secret, baseDir, options) {
  const signature = createHmac("sha256", secret).update(`${baseDir}
${options.nonce}
${options.exp}`).digest("base64url");
  return [options.nonce, options.exp, signature].join(DESKTOP_IMPORT_TOKEN_FIELD_SEP);
}
function mintImportToken(secret, baseDir) {
  const nonce = randomBytes(16).toString("base64url");
  const exp = new Date(Date.now() + DESKTOP_IMPORT_TOKEN_TTL_MS).toISOString();
  return signDesktopImportToken(secret, baseDir, { nonce, exp });
}
async function pickAndImportFolder(deps) {
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;
  const mint = deps.mintToken ?? mintImportToken;
  const importUrl = `${deps.apiBaseUrl.replace(/\/+$/, "")}/api/import/folder`;
  const requestBody = JSON.stringify({
    baseDir: deps.baseDir,
    ...deps.init?.name == null ? {} : { name: deps.init.name },
    ...deps.init?.skillId === void 0 ? {} : { skillId: deps.init.skillId },
    ...deps.init?.designSystemId === void 0 ? {} : { designSystemId: deps.init.designSystemId }
  });
  async function postOnce() {
    const token = mint(deps.desktopAuthSecret, deps.baseDir);
    try {
      return await fetchImpl(importUrl, {
        body: requestBody,
        headers: {
          "Content-Type": "application/json",
          [DESKTOP_IMPORT_TOKEN_HEADER]: token
        },
        method: "POST"
      });
    } catch (err) {
      return { ok: false, reason: `daemon fetch failed: ${err instanceof Error ? err.message : String(err)}` };
    }
  }
  let resp = await postOnce();
  if ("reason" in resp) {
    return { ok: false, reason: resp.reason };
  }
  if (resp.status === 503 && deps.registerDesktopAuth != null) {
    let body2;
    try {
      body2 = await resp.clone().json();
    } catch {
      body2 = null;
    }
    const code = body2 != null && typeof body2 === "object" && "error" in body2 && body2.error != null && typeof body2.error === "object" && "code" in body2.error ? body2.error.code : void 0;
    if (code === "DESKTOP_AUTH_PENDING") {
      const reregistered = await deps.registerDesktopAuth();
      if (reregistered) {
        const retry = await postOnce();
        if ("reason" in retry) {
          return { ok: false, reason: retry.reason };
        }
        resp = retry;
      }
    }
  }
  let body;
  try {
    body = await resp.json();
  } catch {
    body = null;
  }
  if (!resp.ok) {
    return {
      ok: false,
      reason: `daemon returned HTTP ${resp.status}`,
      ...body == null ? {} : { details: body }
    };
  }
  return { ok: true, response: body };
}
async function pickAndReplaceWorkingDir(deps) {
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;
  const mint = deps.mintToken ?? mintImportToken;
  if (typeof deps.projectId !== "string" || deps.projectId.length === 0) {
    return { ok: false, reason: "project id must be a non-empty string" };
  }
  if (!/^[A-Za-z0-9._-]{1,128}$/.test(deps.projectId)) {
    return { ok: false, reason: "project id contains disallowed characters" };
  }
  const workingDirUrl = `${deps.apiBaseUrl.replace(/\/+$/, "")}/api/projects/${encodeURIComponent(deps.projectId)}/working-dir`;
  const requestBody = JSON.stringify({ baseDir: deps.baseDir });
  async function postOnce() {
    const token = mint(deps.desktopAuthSecret, deps.baseDir);
    try {
      return await fetchImpl(workingDirUrl, {
        body: requestBody,
        headers: {
          "Content-Type": "application/json",
          [DESKTOP_IMPORT_TOKEN_HEADER]: token
        },
        method: "POST"
      });
    } catch (err) {
      return { ok: false, reason: `daemon fetch failed: ${err instanceof Error ? err.message : String(err)}` };
    }
  }
  let resp = await postOnce();
  if ("reason" in resp) {
    return { ok: false, reason: resp.reason };
  }
  if (resp.status === 503 && deps.registerDesktopAuth != null) {
    let body2;
    try {
      body2 = await resp.clone().json();
    } catch {
      body2 = null;
    }
    const code = body2 != null && typeof body2 === "object" && "error" in body2 && body2.error != null && typeof body2.error === "object" && "code" in body2.error ? body2.error.code : void 0;
    if (code === "DESKTOP_AUTH_PENDING") {
      const reregistered = await deps.registerDesktopAuth();
      if (reregistered) {
        const retry = await postOnce();
        if ("reason" in retry) {
          return { ok: false, reason: retry.reason };
        }
        resp = retry;
      }
    }
  }
  let body;
  try {
    body = await resp.json();
  } catch {
    body = null;
  }
  if (!resp.ok) {
    return {
      ok: false,
      reason: `daemon returned HTTP ${resp.status}`,
      ...body == null ? {} : { details: body }
    };
  }
  return { ok: true, response: body };
}
function createPendingHtml() {
  const logoDataUrl = getDesktopIconDataUrl();
  return `data:text/html;charset=utf-8,${encodeURIComponent(`<!doctype html>
<html>
  <head>
    <title>Open Design</title>
    <style>
      body {
        align-items: center;
        background: #05070d;
        color: #f7f7fb;
        display: flex;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        height: 100vh;
        justify-content: center;
        margin: 0;
      }
      main {
        align-items: center;
        display: flex;
        flex-direction: column;
        text-align: center;
      }
      img {
        border-radius: 34%;
        display: block;
        height: 72px;
        object-fit: cover;
        width: 72px;
      }
      h1 { margin: 18px 0 0; }
      p { color: #aeb7d5; margin: 12px 0 0; }
    </style>
  </head>
  <body>
    <main>
      ${logoDataUrl ? `<img src="${logoDataUrl}" alt="" />` : ""}
      <h1>Open Design</h1>
      <p>Waiting for the web runtime URL\u2026</p>
    </main>
  </body>
</html>`)}`;
}
function resolveDesktopIconPath() {
  return resolve3(dirname3(fileURLToPath(import.meta.url)), "../../../web/public/app-icon.png");
}
function applyDockIcon() {
  if (process.platform !== "darwin" || !app.dock)
    return;
  const icon = nativeImage.createFromPath(resolveDesktopIconPath());
  if (icon.isEmpty())
    return;
  app.dock.setIcon(icon);
}
function getDesktopIconDataUrl() {
  try {
    return `data:image/png;base64,${readFileSync(resolveDesktopIconPath()).toString("base64")}`;
  } catch {
    return null;
  }
}
function normalizeScreenshotPath(filePath) {
  return isAbsolute3(filePath) ? filePath : resolve3(process.cwd(), filePath);
}
function mapConsoleLevel(level) {
  switch (level) {
    case 0:
      return "debug";
    case 1:
      return "info";
    case 2:
      return "warn";
    case 3:
      return "error";
    default:
      return "log";
  }
}
async function applyWindowChromeCss(window2) {
  if (process.platform !== "darwin" || window2.isDestroyed())
    return;
  await window2.webContents.insertCSS(MAC_WINDOW_CHROME_CSS, { cssOrigin: "user" });
}
function isHttpUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
function isAllowedChildWindowUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "blob:" || parsed.protocol === "od:" || parsed.protocol === "about:" && parsed.pathname === "blank";
  } catch {
    return false;
  }
}
function resolveDesktopStatusUrl(currentUrl, pendingUrl) {
  return pendingUrl ?? currentUrl;
}
function installWindowChromeCssHook(window2) {
  window2.webContents.on("did-finish-load", () => {
    void applyWindowChromeCss(window2).catch((error) => {
      console.error("desktop window chrome CSS injection failed", error);
    });
  });
}
function desktopPetUrl(baseUrl) {
  const url = new URL(baseUrl);
  url.pathname = "/desktop-pet";
  url.search = "";
  url.hash = "";
  return url.toString();
}
function osLocaleAdditionalArguments(osLocale) {
  return osLocale ? [`--od-os-locale=${encodeURIComponent(osLocale)}`] : void 0;
}
function createDesktopPetWindow(preloadPath, osLocale) {
  const { workArea } = screen.getPrimaryDisplay();
  const petWindow = new BrowserWindow2({
    width: DESKTOP_PET_WINDOW_WIDTH,
    height: DESKTOP_PET_WINDOW_HEIGHT,
    x: workArea.x + workArea.width - DESKTOP_PET_WINDOW_WIDTH - DESKTOP_PET_WINDOW_MARGIN,
    y: workArea.y + workArea.height - DESKTOP_PET_WINDOW_HEIGHT - DESKTOP_PET_WINDOW_MARGIN,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    focusable: false,
    webPreferences: {
      additionalArguments: osLocaleAdditionalArguments(osLocale),
      contextIsolation: true,
      nodeIntegration: false,
      preload: preloadPath,
      sandbox: true
    }
  });
  petWindow.setAlwaysOnTop(true, "floating");
  petWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true,
    skipTransformProcessType: true
  });
  petWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isHttpUrl(url))
      void shell.openExternal(url);
    return { action: "deny" };
  });
  petWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.includes("/desktop-pet"))
      event.preventDefault();
  });
  return petWindow;
}
function showWindowButtons(window2) {
  if (process.platform !== "darwin" || window2.isDestroyed())
    return;
  window2.setWindowButtonVisibility(true);
}
function ensureWindowVisible(window2) {
  if (window2.isDestroyed())
    return;
  if (window2.isMinimized())
    window2.restore();
  if (!window2.isVisible())
    window2.show();
  window2.focus();
}
function attachNonDarwinMainWindowCloseShutdown(window2, options) {
  window2.on("closed", () => {
    if (options.isStopped())
      return;
    options.requestQuit?.();
  });
}
function hideWindowExitingFullscreen(window2) {
  if (window2.isSimpleFullScreen()) {
    window2.once("leave-full-screen", () => window2.hide());
    window2.setSimpleFullScreen(false);
    return;
  }
  if (window2.isFullScreen()) {
    window2.once("leave-full-screen", () => window2.hide());
    window2.setFullScreen(false);
    return;
  }
  if (window2.isEnteringFullscreen()) {
    window2.once("enter-full-screen", () => {
      window2.once("leave-full-screen", () => window2.hide());
      window2.setFullScreen(false);
    });
    return;
  }
  window2.hide();
}
function attachDownloadSaveAsDialog(window2) {
  window2.webContents.session.on("will-download", (_event, item) => {
    const filename = item.getFilename();
    const dot = filename.lastIndexOf(".");
    const ext = dot >= 0 ? filename.slice(dot).toLowerCase() : "";
    if (!SAVE_AS_EXTENSIONS.has(ext))
      return;
    item.setSaveDialogOptions({
      title: "Save As",
      defaultPath: filename,
      filters: [
        { name: "PowerPoint Presentation", extensions: ["pptx"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });
  });
}
function parsePrintReadyPdfOptions(value) {
  if (value == null)
    return {};
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid print payload: expected options object");
  }
  const deck = value.deck;
  if (deck !== void 0 && typeof deck !== "boolean") {
    throw new Error("Invalid print payload: expected deck option to be boolean");
  }
  return deck === true ? { deck: true } : {};
}
function unavailableUpdaterStatus() {
  return {
    arch: process.arch,
    capabilities: {
      canApplyInPlace: false,
      canDownload: false,
      canOpenInstaller: false,
      requiresManualInstall: false
    },
    channel: DESKTOP_UPDATE_CHANNELS.BETA,
    currentVersion: "0.0.0",
    enabled: false,
    error: {
      code: "updater-unavailable",
      message: "Desktop updater is not available."
    },
    mode: DESKTOP_UPDATE_MODES.PACKAGE_LAUNCHER,
    platform: process.platform,
    state: DESKTOP_UPDATE_STATES.UNSUPPORTED,
    supported: false
  };
}
function checkOptionsFromHost(options) {
  const input = options;
  const payload = input?.payload;
  if (payload == null || typeof payload.autoDownload !== "boolean")
    return void 0;
  return { autoDownload: payload.autoDownload };
}
async function reportRendererCrash(options, properties) {
  try {
    const baseUrl = await (options.discoverDaemonUrl?.() ?? options.discoverUrl()) ?? null;
    if (!baseUrl)
      return;
    const url = new URL("/api/observability/event", baseUrl).toString();
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        event: "desktop_renderer_crash",
        properties: {
          reason: properties.reason,
          exit_code: properties.exit_code
        }
      })
    });
  } catch {
  }
}
async function createDesktopRuntime(options) {
  const preloadPath = options.preloadPath ?? join3(dirname3(fileURLToPath(import.meta.url)), "preload.cjs");
  applyDockIcon();
  ipcMain.removeHandler("dialog:pick-folder");
  ipcMain.removeHandler("dialog:pick-and-import");
  ipcMain.removeHandler("dialog:pick-and-replace-working-dir");
  ipcMain.removeHandler("shell:open-external");
  ipcMain.removeHandler("shell:open-path");
  for (const channel of UPDATER_IPC_CHANNELS) {
    ipcMain.removeHandler(channel);
  }
  ipcMain.handle("shell:open-external", async (_event, url) => {
    if (!isHttpUrl(url))
      return false;
    try {
      await shell.openExternal(url);
      return true;
    } catch {
      return false;
    }
  });
  ipcMain.handle("dialog:pick-and-import", async (_event, init) => {
    if (options.desktopAuthSecret == null) {
      return { ok: false, reason: "desktop auth secret not registered" };
    }
    const apiBaseUrl = (options.discoverDaemonUrl ? await options.discoverDaemonUrl() : null) ?? await options.discoverUrl();
    if (!apiBaseUrl) {
      return { ok: false, reason: "daemon API URL not available" };
    }
    const result = await dialog2.showOpenDialog({ properties: ["openDirectory"] });
    if (result.canceled || result.filePaths.length === 0) {
      return { ok: false, canceled: true };
    }
    const baseDir = result.filePaths[0].trim();
    if (baseDir.length === 0) {
      return { ok: false, reason: "picker returned an empty path" };
    }
    return await pickAndImportFolder({
      apiBaseUrl,
      baseDir,
      desktopAuthSecret: options.desktopAuthSecret,
      init,
      registerDesktopAuth: options.registerDesktopAuthWithDaemon
    });
  });
  ipcMain.handle("dialog:pick-and-replace-working-dir", async (_event, init) => {
    if (options.desktopAuthSecret == null) {
      return { ok: false, reason: "desktop auth secret not registered" };
    }
    const projectId = typeof init?.projectId === "string" ? init.projectId : "";
    if (projectId.length === 0) {
      return { ok: false, reason: "project id is required" };
    }
    const apiBaseUrl = (options.discoverDaemonUrl ? await options.discoverDaemonUrl() : null) ?? await options.discoverUrl();
    if (!apiBaseUrl) {
      return { ok: false, reason: "daemon API URL not available" };
    }
    const result = await dialog2.showOpenDialog({ properties: ["openDirectory"] });
    if (result.canceled || result.filePaths.length === 0) {
      return { ok: false, canceled: true };
    }
    const baseDir = result.filePaths[0].trim();
    if (baseDir.length === 0) {
      return { ok: false, reason: "picker returned an empty path" };
    }
    return await pickAndReplaceWorkingDir({
      apiBaseUrl,
      baseDir,
      desktopAuthSecret: options.desktopAuthSecret,
      projectId,
      registerDesktopAuth: options.registerDesktopAuthWithDaemon
    });
  });
  ipcMain.handle("shell:open-path", async (_event, projectId) => {
    const apiBaseUrl = (options.discoverDaemonUrl ? await options.discoverDaemonUrl() : null) ?? await options.discoverUrl();
    if (!apiBaseUrl) {
      return "open-path: daemon API URL not available";
    }
    const resolved = await fetchResolvedProjectDir(apiBaseUrl, projectId);
    if (!resolved.ok)
      return `open-path: ${resolved.reason}`;
    const allowed = isOpenPathAllowedForProject(resolved.context);
    if (!allowed.ok)
      return `open-path: ${allowed.reason}`;
    const validated = await validateExistingDirectory(resolved.context.resolvedDir);
    if (!validated.ok)
      return `open-path: ${validated.reason}`;
    try {
      return await shell.openPath(validated.resolved);
    } catch (err) {
      return err instanceof Error ? err.message : String(err);
    }
  });
  const consoleEntries = [];
  const petWindow = createDesktopPetWindow(preloadPath, options.osLocale);
  const window2 = new BrowserWindow2({
    height: 900,
    icon: resolveDesktopIconPath(),
    // Below this size the project page's left/right split (chat
    // composer + designs panel + preview pane) overlaps and the top
    // navigation clips, so prevent Electron from honoring user drags
    // that would shrink the window past the usable breakpoint.
    minHeight: 600,
    minWidth: 900,
    show: true,
    title: "Open Design",
    ...MAC_WINDOW_CHROME,
    webPreferences: {
      additionalArguments: osLocaleAdditionalArguments(options.osLocale),
      contextIsolation: true,
      nodeIntegration: false,
      preload: preloadPath,
      sandbox: true
    },
    width: 1280
  });
  installWindowChromeCssHook(window2);
  showWindowButtons(window2);
  attachDownloadSaveAsDialog(window2);
  window2.webContents.on("render-process-gone", (_event, details) => {
    void reportRendererCrash(options, {
      reason: details.reason,
      exit_code: typeof details.exitCode === "number" ? details.exitCode : null
    });
  });
  const sendUpdaterStatus = (status = options.updater?.snapshot() ?? unavailableUpdaterStatus()) => {
    if (window2.isDestroyed())
      return;
    window2.webContents.send(UPDATER_STATUS_EVENT, status);
  };
  const unsubscribeUpdater = options.updater?.subscribe(() => sendUpdaterStatus()) ?? (() => void 0);
  const requireMainWindowSender = (event) => {
    if (event.sender !== window2.webContents) {
      throw new Error("updater IPC is only available to the main Open Design window");
    }
  };
  ipcMain.handle("od:update:status", async (event) => {
    requireMainWindowSender(event);
    const status = await (options.updater?.status() ?? unavailableUpdaterStatus());
    sendUpdaterStatus(status);
    return status;
  });
  ipcMain.handle("od:update:check", async (event, updaterOptions) => {
    requireMainWindowSender(event);
    const status = await (options.updater?.checkForUpdates(checkOptionsFromHost(updaterOptions)) ?? unavailableUpdaterStatus());
    sendUpdaterStatus(status);
    return status;
  });
  ipcMain.handle("od:update:download", async (event) => {
    requireMainWindowSender(event);
    const status = await (options.updater?.downloadUpdate() ?? unavailableUpdaterStatus());
    sendUpdaterStatus(status);
    return status;
  });
  ipcMain.handle("od:update:install", async (event) => {
    requireMainWindowSender(event);
    const status = await (options.updater?.installUpdate() ?? unavailableUpdaterStatus());
    sendUpdaterStatus(status);
    return status;
  });
  ipcMain.handle("od:update:quit", async (event) => {
    requireMainWindowSender(event);
    const status = await (options.updater?.status() ?? unavailableUpdaterStatus());
    if (status.installResult == null) {
      return { ok: false, reason: "installer has not been opened" };
    }
    if (options.requestQuit == null) {
      return { ok: false, reason: "desktop quit is not available" };
    }
    setTimeout(() => options.requestQuit?.(), 0);
    return { ok: true };
  });
  ipcMain.removeAllListeners("desktop-pet:set-visible");
  ipcMain.on("desktop-pet:set-visible", (event, visible) => {
    if (petWindow.isDestroyed() || event.sender !== petWindow.webContents)
      return;
    if (visible)
      petWindow.showInactive();
    else
      petWindow.hide();
  });
  ipcMain.removeHandler("od:print-pdf");
  ipcMain.handle("od:print-pdf", async (_event, html, nonce, options2) => {
    if (typeof html !== "string") {
      throw new Error("Invalid print payload: expected HTML string");
    }
    const printNonce = typeof nonce === "string" ? nonce : "";
    const printOptions = parsePrintReadyPdfOptions(options2);
    const result = await savePrintReadyDocumentAsPdf(html, printNonce, createElectronPdfTarget(), printOptions);
    if (!result.ok) {
      throw new Error(result.error ?? "PDF export failed");
    }
  });
  let currentUrl = null;
  let currentPetUrl = null;
  let pendingUrl = null;
  let stopped = false;
  let timer = null;
  window2.on("focus", () => showWindowButtons(window2));
  window2.on("blur", () => showWindowButtons(window2));
  window2.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedChildWindowUrl(url))
      return { action: "allow" };
    if (isHttpUrl(url))
      void shell.openExternal(url);
    return { action: "deny" };
  });
  window2.webContents.on("will-navigate", (event, url) => {
    if (!isHttpUrl(url) || url === currentUrl)
      return;
    const currentOrigin = currentUrl ? new URL(currentUrl).origin : null;
    const nextOrigin = new URL(url).origin;
    if (currentOrigin === nextOrigin)
      return;
    event.preventDefault();
    void shell.openExternal(url);
  });
  if (process.platform === "darwin") {
    let enteringFullscreen = false;
    window2.webContents.on("enter-html-full-screen", () => {
      enteringFullscreen = true;
    });
    window2.webContents.on("leave-html-full-screen", () => {
      enteringFullscreen = false;
    });
    window2.on("enter-full-screen", () => {
      enteringFullscreen = false;
    });
    window2.on("leave-full-screen", () => {
      enteringFullscreen = false;
    });
    window2.on("close", (event) => {
      if (stopped)
        return;
      event.preventDefault();
      hideWindowExitingFullscreen({
        hide: () => window2.hide(),
        isFullScreen: () => window2.isFullScreen(),
        isSimpleFullScreen: () => window2.isSimpleFullScreen(),
        isEnteringFullscreen: () => enteringFullscreen,
        setFullScreen: (flag) => window2.setFullScreen(flag),
        setSimpleFullScreen: (flag) => window2.setSimpleFullScreen(flag),
        // BrowserWindow.once is heavily overloaded; both event names are
        // valid (BrowserWindow emits enter-full-screen and
        // leave-full-screen on macOS) but TypeScript can't pick a single
        // overload for the union, so narrow at the call site.
        once: (event2, listener) => event2 === "enter-full-screen" ? window2.once("enter-full-screen", listener) : window2.once("leave-full-screen", listener)
      });
    });
  } else {
    attachNonDarwinMainWindowCloseShutdown(window2, {
      isStopped: () => stopped,
      requestQuit: options.requestQuit
    });
  }
  const rendererLogPath = options.rendererLogPath ?? null;
  let rendererLogReady = null;
  const ensureRendererLogDir = async () => {
    if (rendererLogPath == null)
      return;
    if (rendererLogReady == null) {
      rendererLogReady = mkdir3(dirname3(rendererLogPath), { recursive: true }).then(() => void 0);
    }
    await rendererLogReady;
  };
  const persistRendererEntry = async (entry) => {
    if (rendererLogPath == null)
      return;
    if (entry.level !== "error" && entry.level !== "warn")
      return;
    try {
      await ensureRendererLogDir();
      const line = `${JSON.stringify({ timestamp: entry.timestamp, level: entry.level, text: entry.text })}
`;
      await appendFile(rendererLogPath, line, "utf8");
    } catch (error) {
      console.error("desktop renderer log append failed", error);
    }
  };
  window2.webContents.on("console-message", (event) => {
    const level = typeof event.level === "number" ? mapConsoleLevel(event.level) : event.level ?? "log";
    const entry = {
      level,
      text: event.message ?? "",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    consoleEntries.push(entry);
    if (consoleEntries.length > MAX_CONSOLE_ENTRIES) {
      consoleEntries.splice(0, consoleEntries.length - MAX_CONSOLE_ENTRIES);
    }
    void persistRendererEntry(entry);
  });
  await window2.loadURL(createPendingHtml());
  showWindowButtons(window2);
  ensureWindowVisible(window2);
  const schedule = (delayMs) => {
    if (stopped)
      return;
    timer = setTimeout(() => {
      void tick();
    }, delayMs);
  };
  const tick = async () => {
    if (stopped || window2.isDestroyed())
      return;
    try {
      const url = await options.discoverUrl();
      if (url != null && url !== currentUrl) {
        pendingUrl = url;
        await window2.loadURL(url);
        currentUrl = url;
        pendingUrl = null;
        showWindowButtons(window2);
        const nextPetUrl = desktopPetUrl(url);
        if (!petWindow.isDestroyed() && nextPetUrl !== currentPetUrl) {
          await petWindow.loadURL(nextPetUrl);
          currentPetUrl = nextPetUrl;
        }
      } else if (url == null) {
        pendingUrl = null;
      }
      schedule(url == null ? PENDING_POLL_MS : RUNNING_POLL_MS);
    } catch (error) {
      pendingUrl = null;
      console.error("desktop web discovery failed", error);
      schedule(PENDING_POLL_MS);
    }
  };
  void tick();
  return {
    async click(input) {
      if (window2.isDestroyed())
        return { clicked: false, found: false };
      const selector = JSON.stringify(input.selector);
      return await window2.webContents.executeJavaScript(`(() => {
          const element = document.querySelector(${selector});
          if (!element) return { found: false, clicked: false };
          if (typeof element.click === "function") element.click();
          return { found: true, clicked: true };
        })()`, true);
    },
    async close() {
      stopped = true;
      if (timer != null) {
        clearTimeout(timer);
        timer = null;
      }
      unsubscribeUpdater();
      ipcMain.removeAllListeners("desktop-pet:set-visible");
      for (const channel of UPDATER_IPC_CHANNELS) {
        ipcMain.removeHandler(channel);
      }
      if (!petWindow.isDestroyed())
        petWindow.close();
      if (!window2.isDestroyed())
        window2.close();
    },
    console() {
      return { entries: [...consoleEntries] };
    },
    async eval(input) {
      if (window2.isDestroyed())
        return { error: "desktop window is destroyed", ok: false };
      try {
        const value = await window2.webContents.executeJavaScript(input.expression, true);
        return { ok: true, value };
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error), ok: false };
      }
    },
    exportPdf(input) {
      return exportPdfFromHtml(input);
    },
    async screenshot(input) {
      if (window2.isDestroyed())
        throw new Error("desktop window is destroyed");
      const outputPath = normalizeScreenshotPath(input.path);
      const image = await window2.webContents.capturePage();
      await mkdir3(dirname3(outputPath), { recursive: true });
      await writeFile3(outputPath, image.toPNG());
      return { path: outputPath };
    },
    show() {
      if (!window2.isDestroyed()) {
        window2.show();
        window2.focus();
      }
    },
    status() {
      return {
        pid: process.pid,
        state: window2.isDestroyed() ? "unknown" : "running",
        title: window2.isDestroyed() ? null : window2.getTitle(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        url: resolveDesktopStatusUrl(currentUrl, pendingUrl),
        windowVisible: !window2.isDestroyed() && window2.isVisible()
      };
    }
  };
}
var DESKTOP_IMPORT_TOKEN_FIELD_SEP, PENDING_POLL_MS, RUNNING_POLL_MS, MAX_CONSOLE_ENTRIES, DESKTOP_PET_WINDOW_WIDTH, DESKTOP_PET_WINDOW_HEIGHT, DESKTOP_PET_WINDOW_MARGIN, UPDATER_STATUS_EVENT, UPDATER_IPC_CHANNELS, DESKTOP_IMPORT_TOKEN_HEADER, DESKTOP_IMPORT_TOKEN_TTL_MS, MAC_WINDOW_CHROME, MAC_WINDOW_CHROME_CSS, SAVE_AS_EXTENSIONS;
var init_runtime = __esm({
  "../desktop/dist/main/runtime.js"() {
    "use strict";
    init_dist();
    init_pdf_export();
    DESKTOP_IMPORT_TOKEN_FIELD_SEP = "~";
    PENDING_POLL_MS = 120;
    RUNNING_POLL_MS = 2e3;
    MAX_CONSOLE_ENTRIES = 200;
    DESKTOP_PET_WINDOW_WIDTH = 360;
    DESKTOP_PET_WINDOW_HEIGHT = 300;
    DESKTOP_PET_WINDOW_MARGIN = 24;
    UPDATER_STATUS_EVENT = "od:update:status-changed";
    UPDATER_IPC_CHANNELS = [
      "od:update:status",
      "od:update:check",
      "od:update:download",
      "od:update:install",
      "od:update:quit"
    ];
    DESKTOP_IMPORT_TOKEN_HEADER = "X-OD-Desktop-Import-Token";
    DESKTOP_IMPORT_TOKEN_TTL_MS = 6e4;
    MAC_WINDOW_CHROME = process.platform === "darwin" ? {
      titleBarStyle: "hiddenInset",
      trafficLightPosition: { x: 12, y: 10 }
    } : {};
    MAC_WINDOW_CHROME_CSS = `
  .app-chrome-header {
    --app-chrome-traffic-space: 64px !important;
    --app-chrome-traffic-margin: 4px !important;
    -webkit-app-region: drag;
  }
  .app-chrome-traffic-space {
    flex: 0 0 64px !important;
    width: 64px !important;
  }
  .app-chrome-header button,
  .app-chrome-header a,
  .app-chrome-header [role="button"],
  .app-chrome-header [contenteditable],
  .app-chrome-actions,
  .app-chrome-actions *,
  .avatar-popover,
  .avatar-popover *,
  .inline-switcher__popover,
  .inline-switcher__popover *,
  .workspace-tabs-popover,
  .workspace-tabs-popover * {
    -webkit-app-region: no-drag;
  }
  .app-chrome-drag {
    -webkit-app-region: drag;
  }
  .modal-backdrop,
  .modal-backdrop *,
  .modal,
  .modal *,
  .ds-modal-backdrop,
  .ds-modal-backdrop *,
  .ds-modal,
  .ds-modal *,
  .prompt-template-modal-backdrop,
  .prompt-template-modal-backdrop *,
  .prompt-template-modal,
  .prompt-template-modal *,
  .prompt-template-lightbox-backdrop,
  .prompt-template-lightbox-backdrop * {
    -webkit-app-region: no-drag;
  }
  .entry-brand {
    -webkit-app-region: drag;
    padding-top: 32px !important;
  }
  .entry-header {
    -webkit-app-region: drag;
  }
  .entry-brand button,
  .entry-brand [role="button"],
  .entry-header button,
  .entry-header [role="button"],
  .entry-tabs,
  .entry-tabs *,
  .viewer-toolbar,
  .viewer-toolbar *,
  .deck-nav,
  .deck-nav *,
  .share-menu-popover,
  .share-menu-popover *,
  .entry-side-resizer,
  .inline-switcher__popover,
  .inline-switcher__popover *,
  .avatar-popover,
  .avatar-popover *,
  .workspace-tabs-popover,
  .workspace-tabs-popover * {
    -webkit-app-region: no-drag;
  }
`;
    SAVE_AS_EXTENSIONS = /* @__PURE__ */ new Set([".pptx"]);
  }
});

// ../desktop/dist/main/uncaught-exception.js
function isHarmlessSocketOptionError(value) {
  if (!(value instanceof Error))
    return false;
  const message = typeof value.message === "string" ? value.message : "";
  if (!message)
    return false;
  if (!message.includes("setTypeOfService"))
    return false;
  const code = value.code;
  if (typeof code === "string" && code.length > 0) {
    return code === "EINVAL";
  }
  return message.includes("EINVAL");
}
function createDesktopUncaughtExceptionHandler(logger) {
  const handler = (error) => {
    if (isHarmlessSocketOptionError(error)) {
      logger.warn("desktop main swallowed harmless socket option error", { error });
      return;
    }
    logger.error("desktop main fatal uncaught exception", { error });
    process.removeListener("uncaughtException", handler);
    setImmediate(() => {
      throw error;
    });
  };
  return handler;
}
function createDesktopUnhandledRejectionHandler(logger) {
  const handler = (reason) => {
    if (isHarmlessSocketOptionError(reason)) {
      logger.warn("desktop main swallowed harmless socket option rejection", { reason });
      return;
    }
    logger.error("desktop main unhandled rejection", { reason });
    process.removeListener("unhandledRejection", handler);
    setImmediate(() => {
      throw reason;
    });
  };
  return handler;
}
function attachDesktopProcessErrorFilter(logger = consoleLogger()) {
  if (installedHandler !== null)
    return;
  const handler = createDesktopUncaughtExceptionHandler(logger);
  installedHandler = handler;
  process.on("uncaughtException", handler);
  process.on("unhandledRejection", createDesktopUnhandledRejectionHandler(logger));
}
function consoleLogger() {
  return {
    warn: (message, meta) => {
      if (meta === void 0)
        console.warn(message);
      else
        console.warn(message, meta);
    },
    error: (message, meta) => {
      if (meta === void 0)
        console.error(message);
      else
        console.error(message, meta);
    }
  };
}
var installedHandler;
var init_uncaught_exception = __esm({
  "../desktop/dist/main/uncaught-exception.js"() {
    "use strict";
    installedHandler = null;
  }
});

// ../../packages/download/dist/index.mjs
import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import {
  access,
  lstat as lstat2,
  mkdir as mkdir4,
  readFile as readFile3,
  readdir,
  rename as rename3,
  rm as rm3,
  stat as stat3,
  writeFile as writeFile4
} from "node:fs/promises";
import { dirname as dirname4, isAbsolute as isAbsolute4, join as join4, resolve as resolve4 } from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
function errorCode3(error) {
  if (typeof error !== "object" || error == null || !("code" in error)) return null;
  const code = error.code;
  return code == null ? null : String(code);
}
function errorMessage3(error) {
  return error instanceof Error ? error.message : String(error);
}
function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}
function normalizeChecksum(input) {
  if (input.algorithm !== "sha256" && input.algorithm !== "sha512") {
    throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.INVALID_TARGET, `unsupported checksum algorithm: ${String(input.algorithm)}`);
  }
  const value = input.value.trim().toLowerCase();
  const expectedLength = input.algorithm === "sha256" ? 64 : 128;
  if (!new RegExp(`^[0-9a-f]{${expectedLength}}$`).test(value)) {
    throw new ManagedDownloadError(
      MANAGED_DOWNLOAD_ERROR_CODES.INVALID_TARGET,
      `${input.algorithm} checksum must be ${expectedLength} hex characters`
    );
  }
  return { algorithm: input.algorithm, value };
}
function normalizeSegment(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.INVALID_TARGET, `${label} must be a non-empty string`);
  }
  if (value === "." || value === ".." || value.includes("\0") || /[\\/]/.test(value) || isAbsolute4(value)) {
    throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.INVALID_TARGET, `${label} must be a safe single path segment`);
  }
  return value;
}
function normalizeUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("only http and https URLs are supported");
    }
    return url.toString();
  } catch (error) {
    throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.INVALID_TARGET, errorMessage3(error));
  }
}
function normalizeBasePath(basePath) {
  if (typeof basePath !== "string" || basePath.length === 0 || basePath.includes("\0")) {
    throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.INVALID_TARGET, "basePath must be a non-empty path");
  }
  const resolved = resolve4(basePath);
  if (!isAbsolute4(resolved)) {
    throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.INVALID_TARGET, `basePath must resolve to an absolute path: ${basePath}`);
  }
  return resolved;
}
function targetFromOptions(options) {
  const basePath = normalizeBasePath(options.basePath);
  const bucket = normalizeSegment(options.bucket, "bucket");
  const fileName = normalizeSegment(options.fileName, "fileName");
  const checksum = normalizeChecksum(options.payload.checksum);
  const url = normalizeUrl(options.payload.url);
  const urlDigest = digest(url);
  const identityDigest = digest(`${url}\0${checksum.algorithm}\0${checksum.value}`);
  const targetKey = digest(`${bucket}\0${fileName}`);
  const finalPath = resolve4(basePath, bucket, fileName);
  const manifestPath = resolve4(basePath, STATE_DIR, `${targetKey}.json`);
  const partialPath = resolve4(basePath, PARTIAL_DIR, `${targetKey}.partial`);
  const lockPath = resolve4(basePath, LOCK_DIR, `${targetKey}.lock`);
  for (const path of [finalPath, manifestPath, partialPath, lockPath]) {
    if (!pathContains(basePath, path)) {
      throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.INVALID_TARGET, "resolved managed download path escaped basePath");
    }
  }
  return { basePath, bucket, checksum, fileName, finalPath, identityDigest, lockPath, manifestPath, partialPath, targetKey, url, urlDigest };
}
async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
async function readJson(path) {
  try {
    return JSON.parse(await readFile3(path, "utf8"));
  } catch {
    return null;
  }
}
async function writeJson(path, payload) {
  await mkdir4(dirname4(path), { recursive: true });
  const tmp = `${path}.${process.pid}.${Date.now().toString(36)}.tmp`;
  await writeFile4(tmp, `${JSON.stringify(payload, null, 2)}
`, "utf8");
  await rename3(tmp, path);
}
async function directoryIsEmpty(path) {
  const entries = await readdir(path);
  return entries.length === 0;
}
function isStoreSentinel(value) {
  if (typeof value !== "object" || value == null || Array.isArray(value)) return false;
  const record = value;
  return record.kind === STORE_KIND && record.schemaVersion === STORE_SCHEMA_VERSION && typeof record.createdAt === "string";
}
async function writeSentinel(basePath) {
  await writeJson(join4(basePath, STORE_SENTINEL), {
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    kind: STORE_KIND,
    schemaVersion: STORE_SCHEMA_VERSION
  });
}
async function resetOwnedBase(basePath) {
  const sentinel = await readJson(join4(basePath, STORE_SENTINEL));
  if (!isStoreSentinel(sentinel)) {
    throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.STORE_NOT_OWNED, `download base is not owned: ${basePath}`);
  }
  const entries = await readdir(basePath).catch(() => []);
  for (const entry of entries) {
    await rm3(join4(basePath, entry), { force: true, recursive: true }).catch(() => void 0);
  }
  await writeSentinel(basePath);
  await ensureStoreDirs(basePath);
}
async function ensureStoreDirs(basePath) {
  await mkdir4(join4(basePath, STATE_DIR), { recursive: true });
  await mkdir4(join4(basePath, PARTIAL_DIR), { recursive: true });
  await mkdir4(join4(basePath, LOCK_DIR), { recursive: true });
}
async function ensureManagedBase(basePath) {
  await mkdir4(basePath, { recursive: true });
  const entry = await lstat2(basePath);
  if (!entry.isDirectory() || entry.isSymbolicLink()) {
    throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.STORE_NOT_OWNED, `download base is not an owned directory: ${basePath}`);
  }
  const sentinelPath = join4(basePath, STORE_SENTINEL);
  const sentinel = await readJson(sentinelPath);
  if (sentinel == null) {
    if (!await directoryIsEmpty(basePath)) {
      throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.STORE_NOT_OWNED, `download base is not empty and has no ownership marker: ${basePath}`);
    }
    await writeSentinel(basePath);
  } else if (!isStoreSentinel(sentinel)) {
    throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.STORE_NOT_OWNED, `download base has an invalid ownership marker: ${basePath}`);
  }
  await ensureStoreDirs(basePath);
}
function isChecksum(value) {
  if (typeof value !== "object" || value == null || Array.isArray(value)) return false;
  const checksum = value;
  return (checksum.algorithm === "sha256" || checksum.algorithm === "sha512") && typeof checksum.value === "string";
}
function isManifest(value) {
  if (typeof value !== "object" || value == null || Array.isArray(value)) return false;
  const record = value;
  return record.kind === MANIFEST_KIND && record.schemaVersion === MANIFEST_SCHEMA_VERSION && typeof record.bucket === "string" && typeof record.fileName === "string" && typeof record.targetKey === "string" && typeof record.identityDigest === "string" && typeof record.urlDigest === "string" && isChecksum(record.checksum) && (record.state === "complete" || record.state === "partial") && typeof record.createdAt === "string" && typeof record.updatedAt === "string";
}
function isDownloadLockFile(value) {
  if (typeof value !== "object" || value == null || Array.isArray(value)) return false;
  const record = value;
  return typeof record.createdAt === "string" && typeof record.pid === "number" && Number.isInteger(record.pid) && record.pid > 0 && (record.processStartedAt == null || typeof record.processStartedAt === "string");
}
function parseTimeMs(value) {
  if (value == null) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}
function lockBelongsToCurrentProcess(lock) {
  if (lock.pid !== process.pid) return false;
  const ownerStartedAtMs = parseTimeMs(lock.processStartedAt);
  if (ownerStartedAtMs != null) return ownerStartedAtMs >= PROCESS_STARTED_AT_MS - PID_REUSE_GRACE_MS;
  const lockCreatedAtMs = parseTimeMs(lock.createdAt);
  return lockCreatedAtMs == null || lockCreatedAtMs >= PROCESS_STARTED_AT_MS - PID_REUSE_GRACE_MS;
}
function isLockProcessAlive(lock) {
  if (!isProcessAlive(lock.pid)) return false;
  if (lock.pid === process.pid) return lockBelongsToCurrentProcess(lock);
  return true;
}
async function readManifest(path) {
  try {
    const parsed = JSON.parse(await readFile3(path, "utf8"));
    return isManifest(parsed) ? parsed : "invalid";
  } catch (error) {
    if (errorCode3(error) === "ENOENT") return null;
    return "invalid";
  }
}
function manifestMatchesTarget(manifest, target) {
  return manifest.bucket === target.bucket && manifest.fileName === target.fileName && manifest.targetKey === target.targetKey && manifest.identityDigest === target.identityDigest && manifest.urlDigest === target.urlDigest && manifest.checksum.algorithm === target.checksum.algorithm && manifest.checksum.value.toLowerCase() === target.checksum.value;
}
function createManifest(target, state, patch = {}) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    bucket: target.bucket,
    checksum: target.checksum,
    createdAt: now,
    fileName: target.fileName,
    identityDigest: target.identityDigest,
    kind: MANIFEST_KIND,
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    state,
    targetKey: target.targetKey,
    updatedAt: now,
    urlDigest: target.urlDigest,
    ...patch
  };
}
async function hashFile(path, algorithm) {
  const hash = createHash(algorithm);
  await pipeline(createReadStream(path), hash);
  return hash.digest("hex");
}
async function statFileSize(path) {
  try {
    const entry = await stat3(path);
    return entry.isFile() ? entry.size : null;
  } catch {
    return null;
  }
}
async function emitExistingProgress(path, totalBytes, emit) {
  const existing = await statFileSize(path);
  if (existing == null || existing <= 0) return;
  emit({ receivedBytes: existing, sessionReceivedBytes: 0, ...totalBytes == null ? {} : { totalBytes } });
}
function contentLength(response) {
  const raw = response.headers.get("content-length");
  if (raw == null) return void 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : void 0;
}
function validatorsFromResponse(response) {
  const etag = response.headers.get("etag") ?? void 0;
  const lastModified = response.headers.get("last-modified") ?? void 0;
  return etag == null && lastModified == null ? void 0 : { ...etag == null ? {} : { etag }, ...lastModified == null ? {} : { lastModified } };
}
function validatorsConflict(saved, response) {
  if (saved == null) return false;
  const etag = response.headers.get("etag") ?? void 0;
  const lastModified = response.headers.get("last-modified") ?? void 0;
  if (saved.etag != null && etag != null && saved.etag !== etag) return true;
  if (saved.lastModified != null && lastModified != null && saved.lastModified !== lastModified) return true;
  return false;
}
function parseContentRange(value) {
  if (value == null) return null;
  const match = /^bytes\s+(\d+)-(\d+)\/(\d+|\*)$/i.exec(value.trim());
  if (match?.[1] == null || match[2] == null || match[3] == null) return null;
  const start = Number(match[1]);
  const end = Number(match[2]);
  const totalBytes = match[3] === "*" ? void 0 : Number(match[3]);
  if (!Number.isInteger(start) || !Number.isInteger(end) || end < start) return null;
  if (totalBytes != null && (!Number.isInteger(totalBytes) || totalBytes <= end)) return null;
  return { start, end, ...totalBytes == null ? {} : { totalBytes } };
}
async function writeResponseBodyToPartial(response, target, options) {
  if (response.body == null) throw new Error("download response did not include a body");
  let receivedBytes = options.startBytes;
  let sessionReceivedBytes = 0;
  const meter = new Transform({
    transform(chunk, _encoding, callback) {
      receivedBytes += chunk.byteLength;
      sessionReceivedBytes += chunk.byteLength;
      options.emit({
        receivedBytes,
        sessionReceivedBytes,
        ...options.totalBytes == null ? {} : { totalBytes: options.totalBytes }
      });
      callback(null, chunk);
    }
  });
  await pipeline(
    Readable.fromWeb(response.body),
    meter,
    createWriteStream(target.partialPath, { flags: options.startBytes > 0 ? "a" : "w" })
  );
}
async function tryResumeDownload(target, manifest, fetchImpl, emit, requestHeaders) {
  const partialBytes = await statFileSize(target.partialPath);
  if (partialBytes == null || partialBytes <= 0) return "restart";
  const response = await fetchImpl(target.url, {
    headers: {
      ...requestHeaders ?? {},
      ...manifest.validators?.etag == null ? {} : { "If-Range": manifest.validators.etag },
      Range: `bytes=${partialBytes}-`
    }
  });
  if (response.status !== 206) return "restart";
  const range = parseContentRange(response.headers.get("content-range"));
  if (range == null || range.start !== partialBytes || validatorsConflict(manifest.validators, response)) {
    return "restart";
  }
  const totalBytes = range.totalBytes ?? manifest.totalBytes ?? partialBytes + (contentLength(response) ?? 0);
  await emitExistingProgress(target.partialPath, totalBytes, emit);
  await writeJson(target.manifestPath, {
    ...manifest,
    state: "partial",
    totalBytes,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    validators: manifest.validators ?? validatorsFromResponse(response)
  });
  await writeResponseBodyToPartial(response, target, { emit, startBytes: partialBytes, totalBytes });
  return { resumed: true, totalBytes };
}
async function downloadFromZero(target, fetchImpl, emit, requestHeaders) {
  await rm3(target.partialPath, { force: true }).catch(() => void 0);
  const response = await fetchImpl(target.url, { headers: requestHeaders });
  if (!response.ok) throw new Error(`download request returned HTTP ${response.status}`);
  const totalBytes = contentLength(response);
  const validators = validatorsFromResponse(response);
  await writeJson(target.manifestPath, createManifest(target, "partial", { totalBytes, validators }));
  await writeResponseBodyToPartial(response, target, { emit, startBytes: 0, totalBytes });
  return { resumed: false, totalBytes };
}
async function downloadWithRetries(target, manifest, options) {
  let lastError;
  let nextManifest = manifest;
  let resumed = false;
  for (let attempt = 1; attempt <= options.maxAttempts; attempt += 1) {
    try {
      if (nextManifest?.state === "partial") {
        const resume = await tryResumeDownload(target, nextManifest, options.fetchImpl, options.emit, options.requestHeaders);
        if (resume !== "restart") return { ...resume, resumed: true };
        await rm3(target.partialPath, { force: true }).catch(() => void 0);
        nextManifest = null;
      }
      const full = await downloadFromZero(target, options.fetchImpl, options.emit, options.requestHeaders);
      resumed = resumed || full.resumed;
      return { ...full, resumed };
    } catch (error) {
      lastError = error;
      const partialBytes = await statFileSize(target.partialPath);
      if (partialBytes != null && partialBytes > 0) {
        nextManifest = {
          ...nextManifest ?? createManifest(target, "partial"),
          state: "partial",
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        await writeJson(target.manifestPath, nextManifest).catch(() => void 0);
      }
    }
  }
  throw new ManagedDownloadError(
    MANAGED_DOWNLOAD_ERROR_CODES.NETWORK_EXHAUSTED,
    `download failed after ${options.maxAttempts} attempts: ${errorMessage3(lastError)}`
  );
}
async function acquireLock(target) {
  await mkdir4(dirname4(target.lockPath), { recursive: true });
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await writeFile4(
        target.lockPath,
        `${JSON.stringify({
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          pid: process.pid,
          processStartedAt: new Date(PROCESS_STARTED_AT_MS).toISOString()
        })}
`,
        { flag: "wx" }
      );
      return { path: target.lockPath };
    } catch (error) {
      if (errorCode3(error) === "EEXIST") {
        const staleLockCleared = attempt === 0 && await clearStaleLock(target);
        if (staleLockCleared) continue;
        throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.TARGET_LOCKED, `download target is locked: ${target.bucket}/${target.fileName}`);
      }
      throw error;
    }
  }
  throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.TARGET_LOCKED, `download target is locked: ${target.bucket}/${target.fileName}`);
}
async function clearStaleLock(target) {
  const lock = await readJson(target.lockPath);
  if (!isDownloadLockFile(lock) || isLockProcessAlive(lock)) return false;
  await rm3(target.lockPath, { force: true }).catch(() => void 0);
  return true;
}
async function releaseLock(lock) {
  if (lock == null) return;
  await rm3(lock.path, { force: true }).catch(() => void 0);
}
async function suspiciousReset(target) {
  await resetOwnedBase(target.basePath);
  return { manifest: null, reset: true };
}
async function loadReusableState(target) {
  const manifest = await readManifest(target.manifestPath);
  const finalExists = await pathExists(target.finalPath);
  const partialExists = await pathExists(target.partialPath);
  if (manifest === "invalid") {
    return await suspiciousReset(target);
  }
  if (manifest == null) {
    if (finalExists || partialExists) return await suspiciousReset(target);
    return { manifest: null };
  }
  if (!manifestMatchesTarget(manifest, target)) {
    return await suspiciousReset(target);
  }
  if (manifest.state === "complete") {
    if (!finalExists) return await suspiciousReset(target);
    const actual = await hashFile(target.finalPath, target.checksum.algorithm).catch(() => null);
    if (actual !== target.checksum.value) return await suspiciousReset(target);
    const bytes = await statFileSize(target.finalPath);
    if (bytes == null) return await suspiciousReset(target);
    return {
      manifest,
      result: {
        bucket: target.bucket,
        bytes,
        checksum: target.checksum,
        fileName: target.fileName,
        path: target.finalPath,
        reusedComplete: true,
        resumed: false,
        urlDigest: target.urlDigest
      }
    };
  }
  if (!partialExists) return await suspiciousReset(target);
  return { manifest };
}
async function runManagedDownload(target, options) {
  await ensureManagedBase(target.basePath);
  await pruneManagedDownloads({ basePath: target.basePath }).catch(() => void 0);
  let lock = await acquireLock(target);
  try {
    let state = await loadReusableState(target);
    if (state.result != null) return state.result;
    if (state.reset === true) {
      await releaseLock(lock);
      lock = null;
      await ensureManagedBase(target.basePath);
      lock = await acquireLock(target);
      state = await loadReusableState(target);
      if (state.result != null) return state.result;
      if (state.reset === true) {
        throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.STORE_CORRUPT, "download state kept resetting after base cleanup");
      }
    }
    const download = await downloadWithRetries(target, state.manifest, options);
    const actual = await hashFile(target.partialPath, target.checksum.algorithm).catch((error) => {
      throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.STORE_CORRUPT, `downloaded partial could not be hashed: ${errorMessage3(error)}`);
    });
    if (actual !== target.checksum.value) {
      await resetOwnedBase(target.basePath).catch(() => void 0);
      throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.CHECKSUM_MISMATCH, "downloaded file checksum did not match requested payload", {
        actual,
        expected: target.checksum.value
      });
    }
    await mkdir4(dirname4(target.finalPath), { recursive: true });
    if (await pathExists(target.finalPath)) {
      const existing = await hashFile(target.finalPath, target.checksum.algorithm).catch(() => null);
      if (existing !== target.checksum.value) {
        await resetOwnedBase(target.basePath).catch(() => void 0);
        throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.STORE_CORRUPT, "existing complete file did not match requested payload");
      }
      await rm3(target.partialPath, { force: true }).catch(() => void 0);
    } else {
      await rename3(target.partialPath, target.finalPath);
    }
    const bytes = await statFileSize(target.finalPath);
    if (bytes == null) throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.STORE_CORRUPT, "complete file is missing after promotion");
    await writeJson(target.manifestPath, createManifest(target, "complete", { totalBytes: download.totalBytes }));
    return {
      bucket: target.bucket,
      bytes,
      checksum: target.checksum,
      fileName: target.fileName,
      path: target.finalPath,
      reusedComplete: false,
      resumed: download.resumed,
      urlDigest: target.urlDigest
    };
  } finally {
    await releaseLock(lock);
  }
}
function activeKey(target) {
  return `${target.basePath}\0${target.targetKey}\0${target.identityDigest}`;
}
function targetActiveKey(target) {
  return `${target.basePath}\0${target.targetKey}`;
}
function waitForTask(task, options) {
  return new Promise((resolveWait, rejectWait) => {
    if (options.signal?.aborted) {
      rejectWait(new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.ABORTED, "download wait was aborted"));
      return;
    }
    const listener = options.onProgress;
    if (listener != null) task.listeners.add(listener);
    const cleanup = () => {
      if (listener != null) task.listeners.delete(listener);
      options.signal?.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      cleanup();
      rejectWait(new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.ABORTED, "download wait was aborted"));
    };
    options.signal?.addEventListener("abort", onAbort, { once: true });
    task.promise.then(
      (result) => {
        cleanup();
        resolveWait(result);
      },
      (error) => {
        cleanup();
        rejectWait(error);
      }
    );
  });
}
async function managedDownload(options) {
  const target = targetFromOptions(options);
  const key = activeKey(target);
  const targetKey = targetActiveKey(target);
  const existingForTarget = activeTargets.get(targetKey);
  if (existingForTarget != null && existingForTarget !== key) {
    throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.TARGET_CONFLICT, `download target is already active with a different identity: ${target.bucket}/${target.fileName}`);
  }
  const existing = activeTasks.get(key);
  if (existing != null) return await waitForTask(existing, options);
  const listeners = /* @__PURE__ */ new Set();
  const emit = (progress) => {
    for (const listener of listeners) listener(progress);
  };
  const task = {
    listeners,
    targetKey,
    promise: runManagedDownload(target, {
      emit,
      fetchImpl: options.fetch ?? globalThis.fetch,
      maxAttempts: options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
      requestHeaders: options.payload.headers
    })
  };
  activeTasks.set(key, task);
  activeTargets.set(targetKey, key);
  task.promise.finally(() => {
    activeTasks.delete(key);
    if (activeTargets.get(targetKey) === key) activeTargets.delete(targetKey);
  }).catch(() => void 0);
  return await waitForTask(task, options);
}
function acquireCopyLease(target) {
  const key = targetActiveKey(target);
  const state = copyLeases.get(key) ?? { clearRequested: false, count: 0, removeOptions: null };
  state.count += 1;
  copyLeases.set(key, state);
  return { key };
}
async function requestClearAfterCopy(target) {
  const key = targetActiveKey(target);
  const state = copyLeases.get(key);
  if (state != null && state.count > 1) {
    state.clearRequested = true;
    state.removeOptions = { basePath: target.basePath, bucket: target.bucket, fileName: target.fileName };
    return "deferred";
  }
  await removeManagedDownload({ basePath: target.basePath, bucket: target.bucket, fileName: target.fileName });
  return "removed";
}
async function releaseCopyLease(lease) {
  const state = copyLeases.get(lease.key);
  if (state == null) return;
  state.count -= 1;
  if (state.count > 0) return;
  copyLeases.delete(lease.key);
  if (state.clearRequested && state.removeOptions != null) {
    await removeManagedDownload(state.removeOptions).catch(() => void 0);
  }
}
async function downloadCopyAndClear(options) {
  const target = targetFromOptions(options);
  if (typeof options.outputPath !== "string" || options.outputPath.length === 0 || options.outputPath.includes("\0")) {
    throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.INVALID_TARGET, "outputPath must be a non-empty path");
  }
  const outputPath = resolve4(options.outputPath);
  if (!isAbsolute4(outputPath)) {
    throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.INVALID_TARGET, `outputPath must resolve to an absolute path: ${options.outputPath}`);
  }
  const lease = acquireCopyLease(target);
  try {
    const downloaded = await managedDownload(options);
    const existingOutput = await statFileSize(outputPath);
    if (existingOutput != null) {
      const existingDigest = await hashFile(outputPath, target.checksum.algorithm).catch(() => null);
      if (existingDigest !== target.checksum.value) {
        throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.OUTPUT_CONFLICT, `output already exists with different bytes: ${outputPath}`);
      }
    } else {
      await atomicCopyFile(downloaded.path, outputPath);
      const copiedDigest = await hashFile(outputPath, target.checksum.algorithm);
      if (copiedDigest !== target.checksum.value) {
        throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.CHECKSUM_MISMATCH, "copied output checksum did not match requested payload");
      }
    }
    let cleanup = "removed";
    let cleanupWarning;
    try {
      cleanup = await requestClearAfterCopy(target);
    } catch (error) {
      cleanupWarning = errorMessage3(error);
    }
    return {
      bytes: downloaded.bytes,
      cleanup,
      ...cleanupWarning == null ? {} : { cleanupWarning },
      outputPath,
      reusedComplete: downloaded.reusedComplete,
      resumed: downloaded.resumed
    };
  } finally {
    await releaseCopyLease(lease);
  }
}
async function removeManagedDownload(options) {
  const target = targetFromOptions({
    ...options,
    payload: {
      checksum: { algorithm: "sha256", value: "0".repeat(64) },
      url: "https://example.invalid/"
    }
  });
  if (activeTargets.has(targetActiveKey(target))) {
    throw new ManagedDownloadError(MANAGED_DOWNLOAD_ERROR_CODES.TARGET_LOCKED, `download target is active: ${target.bucket}/${target.fileName}`);
  }
  await ensureManagedBase(target.basePath);
  await Promise.all([
    removePathBestEffort(target.finalPath),
    removePathBestEffort(target.partialPath, { recursive: false }),
    removePathBestEffort(target.manifestPath, { recursive: false }),
    removePathBestEffort(target.lockPath, { recursive: false })
  ]);
  const bucketPath = join4(target.basePath, target.bucket);
  const entries = await readdir(bucketPath).catch(() => null);
  if (entries != null && entries.length === 0) await rm3(bucketPath, { force: true, recursive: true }).catch(() => void 0);
  return { removed: true };
}
async function removeEntriesOlderThan(root, olderThan) {
  const warnings = [];
  let removed = 0;
  const entries = await readdir(root, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const path = join4(root, entry.name);
    const info = await stat3(path).catch(() => null);
    if (info == null || info.mtimeMs > olderThan) continue;
    const result = await removePathBestEffort(path);
    if (result.removed) removed += 1;
    else if (result.error != null) warnings.push(result.error);
  }
  return { removed, warnings };
}
async function pruneManagedDownloads(options) {
  const basePath = normalizeBasePath(options.basePath);
  await ensureManagedBase(basePath);
  const olderThan = (options.now?.getTime() ?? Date.now()) - (options.olderThanMs ?? DEFAULT_PRUNE_OLDER_THAN_MS);
  const roots = [join4(basePath, STATE_DIR), join4(basePath, PARTIAL_DIR), join4(basePath, LOCK_DIR)];
  let removed = 0;
  const warnings = [];
  for (const root of roots) {
    const result = await removeEntriesOlderThan(root, olderThan);
    removed += result.removed;
    warnings.push(...result.warnings);
  }
  const bucketEntries = await readdir(basePath, { withFileTypes: true }).catch(() => []);
  for (const entry of bucketEntries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    const result = await removeEntriesOlderThan(join4(basePath, entry.name), olderThan);
    removed += result.removed;
    warnings.push(...result.warnings);
    const remaining = await readdir(join4(basePath, entry.name)).catch(() => null);
    if (remaining != null && remaining.length === 0) await rm3(join4(basePath, entry.name), { force: true, recursive: true }).catch(() => void 0);
  }
  return { removed, warnings };
}
var STORE_SENTINEL, STATE_DIR, PARTIAL_DIR, LOCK_DIR, STORE_SCHEMA_VERSION, MANIFEST_SCHEMA_VERSION, STORE_KIND, MANIFEST_KIND, DEFAULT_MAX_ATTEMPTS, DEFAULT_PRUNE_OLDER_THAN_MS, PID_REUSE_GRACE_MS, PROCESS_STARTED_AT_MS, MANAGED_DOWNLOAD_ERROR_CODES, ManagedDownloadError, activeTasks, activeTargets, copyLeases;
var init_dist4 = __esm({
  "../../packages/download/dist/index.mjs"() {
    "use strict";
    init_dist3();
    STORE_SENTINEL = ".open-design-download-root.json";
    STATE_DIR = ".state";
    PARTIAL_DIR = ".partial";
    LOCK_DIR = ".locks";
    STORE_SCHEMA_VERSION = 1;
    MANIFEST_SCHEMA_VERSION = 1;
    STORE_KIND = "open-design-managed-download-root";
    MANIFEST_KIND = "open-design-managed-download";
    DEFAULT_MAX_ATTEMPTS = 3;
    DEFAULT_PRUNE_OLDER_THAN_MS = 24 * 60 * 60 * 1e3;
    PID_REUSE_GRACE_MS = 1e3;
    PROCESS_STARTED_AT_MS = Date.now() - process.uptime() * 1e3;
    MANAGED_DOWNLOAD_ERROR_CODES = Object.freeze({
      ABORTED: "aborted",
      CHECKSUM_MISMATCH: "checksum-mismatch",
      INVALID_TARGET: "invalid-target",
      NETWORK_EXHAUSTED: "network-exhausted",
      OUTPUT_CONFLICT: "output-conflict",
      STORE_CORRUPT: "store-corrupt",
      STORE_NOT_OWNED: "store-not-owned",
      TARGET_CONFLICT: "target-conflict",
      TARGET_LOCKED: "target-locked"
    });
    ManagedDownloadError = class extends Error {
      code;
      details;
      constructor(code, message, details) {
        super(message);
        this.name = "ManagedDownloadError";
        this.code = code;
        if (details !== void 0) this.details = details;
      }
    };
    activeTasks = /* @__PURE__ */ new Map();
    activeTargets = /* @__PURE__ */ new Map();
    copyLeases = /* @__PURE__ */ new Map();
  }
});

// ../desktop/dist/main/installer-observations.js
import { randomUUID } from "node:crypto";
import { mkdir as mkdir5, readFile as readFile4, rename as rename4, writeFile as writeFile5 } from "node:fs/promises";
import { dirname as dirname5, isAbsolute as isAbsolute5, relative as relative2, resolve as resolve5 } from "node:path";
function isSafeInstallerObservationFlowId(flowId) {
  return flowId.length > 0 && flowId.length <= 128 && flowId !== "." && flowId !== ".." && /^[A-Za-z0-9._-]+$/.test(flowId);
}
function assertSafeFlowId(flowId) {
  if (!isSafeInstallerObservationFlowId(flowId)) {
    throw new Error(`installer observation flow_id is not a safe path segment: ${flowId}`);
  }
}
function containsPath(root, path) {
  const rel = relative2(root, path);
  return rel === "" || rel.length > 0 && !rel.startsWith("..") && !isAbsolute5(rel);
}
function installerObservationSummaryPath(root, flowId) {
  if (!isAbsolute5(root))
    throw new Error(`installer observation root must be absolute: ${root}`);
  assertSafeFlowId(flowId);
  const resolvedRoot = resolve5(root);
  const summaryPath = resolve5(resolvedRoot, flowId, "summary.json");
  if (!containsPath(resolvedRoot, summaryPath)) {
    throw new Error("installer observation summary path escaped observation root");
  }
  return summaryPath;
}
async function writeJson2(path, payload) {
  await mkdir5(dirname5(path), { recursive: true });
  const tmpPath = `${path}.${process.pid}.${Date.now()}.tmp`;
  await writeFile5(tmpPath, `${JSON.stringify(payload, null, 2)}
`, "utf8");
  await rename4(tmpPath, path);
}
async function writePendingInstallerObservation(input) {
  const flowId = input.flowId ?? randomUUID();
  const summaryPath = installerObservationSummaryPath(input.root, flowId);
  const summary = {
    arch: input.arch,
    artifactType: input.artifactType,
    attemptedAt: input.attemptedAt,
    channel: input.channel,
    flowId,
    fromVersion: input.fromVersion,
    kind: INSTALLER_OBSERVATION_KIND,
    namespace: input.namespace,
    platform: input.platform,
    reason: "installer_open_requested",
    result: "pending",
    schemaVersion: INSTALLER_OBSERVATION_SCHEMA_VERSION,
    toVersion: input.toVersion,
    updatedAt: input.attemptedAt
  };
  await writeJson2(summaryPath, summary);
  return { flowId, summaryPath };
}
async function markInstallerObservationOpenFailed(handle, failedAt) {
  const parsed = JSON.parse(await readFile4(handle.summaryPath, "utf8"));
  await writeJson2(handle.summaryPath, {
    ...parsed,
    reason: "installer_open_failed",
    result: "unknown",
    updatedAt: failedAt
  });
}
var INSTALLER_OBSERVATION_SCHEMA_VERSION, INSTALLER_OBSERVATION_KIND;
var init_installer_observations = __esm({
  "../desktop/dist/main/installer-observations.js"() {
    "use strict";
    INSTALLER_OBSERVATION_SCHEMA_VERSION = 1;
    INSTALLER_OBSERVATION_KIND = "installer_apply_observation";
  }
});

// ../desktop/dist/main/updater.js
import { createHash as createHash2 } from "node:crypto";
import { spawn as spawn2 } from "node:child_process";
import { createReadStream as createReadStream2 } from "node:fs";
import { access as access2, chmod, lstat as lstat3, mkdir as mkdir6, readdir as readdir2, readFile as readFile5, realpath as realpath2, rename as rename5, rm as rm4, stat as stat4, writeFile as writeFile6 } from "node:fs/promises";
import { dirname as dirname6, extname as extname2, isAbsolute as isAbsolute6, join as join5, relative as relative3, resolve as resolve6 } from "node:path";
import { pipeline as pipeline2 } from "node:stream/promises";
function isTruthyEnv(value) {
  if (value == null || value.length === 0)
    return null;
  if (value === "1" || value === "true" || value === "yes")
    return true;
  if (value === "0" || value === "false" || value === "no")
    return false;
  throw new Error(`boolean env value must be one of 1/0/true/false/yes/no, got ${value}`);
}
function normalizeMode(value, fallback) {
  if (value == null || value.length === 0)
    return fallback;
  if (value === DESKTOP_UPDATE_MODES.PACKAGE_LAUNCHER || value === DESKTOP_UPDATE_MODES.JS_INCREMENTAL)
    return value;
  throw new Error(`unsupported desktop update mode: ${value}`);
}
function normalizeChannel(value, fallback) {
  if (value == null || value.length === 0)
    return fallback;
  if (isDesktopUpdateChannel(value))
    return value;
  throw new Error(`unsupported desktop update channel: ${value}`);
}
function isDesktopUpdateChannel(value) {
  return typeof value === "string" && DESKTOP_UPDATE_CHANNEL_VALUES.has(value);
}
function defaultMetadataUrl(channel) {
  return `${DEFAULT_RELEASE_ORIGIN}/${channel}/latest/metadata.json`;
}
function normalizeDownloadRoot(value) {
  if (value.includes("\0"))
    throw new Error("update download root must not contain null bytes");
  if (!isAbsolute6(value))
    throw new Error(`update download root must be absolute: ${value}`);
  return resolve6(value);
}
function normalizeOptionalRoot(value, label) {
  if (value == null || value.length === 0)
    return void 0;
  if (value.includes("\0"))
    throw new Error(`${label} must not contain null bytes`);
  if (!isAbsolute6(value))
    throw new Error(`${label} must be absolute: ${value}`);
  return resolve6(value);
}
function normalizeOptionalNonEmpty(value) {
  if (value == null)
    return void 0;
  const trimmed = value.trim();
  return trimmed.length === 0 ? void 0 : trimmed;
}
function durationEnv(value, fallback, name) {
  if (value == null || value.length === 0)
    return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0)
    throw new Error(`${name} must be a non-negative number of milliseconds`);
  return parsed;
}
function defaultPollIntervalMs(channel) {
  return channel === DESKTOP_UPDATE_CHANNELS.STABLE ? STABLE_POLL_INTERVAL_MS : BETA_POLL_INTERVAL_MS;
}
function resolveDesktopUpdaterConfig(input) {
  const env = input.env ?? process.env;
  const mode = normalizeMode(env[DESKTOP_UPDATE_ENV.MODE], input.mode ?? DESKTOP_UPDATE_MODES.PACKAGE_LAUNCHER);
  const defaultEnabled = input.source === SIDECAR_SOURCES.PACKAGED;
  const enabled = isTruthyEnv(env[DESKTOP_UPDATE_ENV.ENABLED]) ?? defaultEnabled;
  const runtimeBase = input.runtimeBase == null ? process.cwd() : input.runtimeBase;
  const downloadRoot = normalizeDownloadRoot(env[DESKTOP_UPDATE_ENV.DOWNLOAD_ROOT] ?? input.downloadRoot ?? join5(resolve6(runtimeBase), "updates"));
  const currentVersion = env[DESKTOP_UPDATE_ENV.CURRENT_VERSION] ?? input.currentVersion ?? input.appVersion ?? "0.0.0";
  const channel = normalizeChannel(env[DESKTOP_UPDATE_ENV.CHANNEL], defaultChannelForVersion(currentVersion));
  const installerObservationRoot = normalizeOptionalRoot(input.installerObservationRoot, "installer observation root");
  const namespace = normalizeOptionalNonEmpty(input.namespace);
  return {
    arch: env[DESKTOP_UPDATE_ENV.ARCH] ?? input.arch ?? process.arch,
    autoCheck: isTruthyEnv(env[DESKTOP_UPDATE_ENV.AUTO_CHECK]) ?? enabled,
    autoDownload: isTruthyEnv(env[DESKTOP_UPDATE_ENV.AUTO_DOWNLOAD]) ?? true,
    autoOpen: isTruthyEnv(env[DESKTOP_UPDATE_ENV.AUTO_OPEN]) ?? false,
    checkBackoffInitialMs: durationEnv(env[DESKTOP_UPDATE_ENV.CHECK_BACKOFF_INITIAL_MS], DEFAULT_POLL_BACKOFF_INITIAL_MS, DESKTOP_UPDATE_ENV.CHECK_BACKOFF_INITIAL_MS),
    checkBackoffMaxMs: durationEnv(env[DESKTOP_UPDATE_ENV.CHECK_BACKOFF_MAX_MS], DEFAULT_POLL_BACKOFF_MAX_MS, DESKTOP_UPDATE_ENV.CHECK_BACKOFF_MAX_MS),
    checkInitialDelayMs: durationEnv(env[DESKTOP_UPDATE_ENV.CHECK_INITIAL_DELAY_MS], DEFAULT_POLL_INITIAL_DELAY_MS, DESKTOP_UPDATE_ENV.CHECK_INITIAL_DELAY_MS),
    checkIntervalMs: durationEnv(env[DESKTOP_UPDATE_ENV.CHECK_INTERVAL_MS], defaultPollIntervalMs(channel), DESKTOP_UPDATE_ENV.CHECK_INTERVAL_MS),
    channel,
    currentVersion,
    downloadRoot,
    enabled,
    ...installerObservationRoot == null ? {} : { installerObservationRoot },
    metadataUrl: env[DESKTOP_UPDATE_ENV.METADATA_URL] ?? defaultMetadataUrl(channel),
    mode,
    ...namespace == null ? {} : { namespace },
    openDryRun: isTruthyEnv(env[DESKTOP_UPDATE_ENV.OPEN_DRY_RUN]) ?? false,
    platform: env[DESKTOP_UPDATE_ENV.PLATFORM] ?? input.platform ?? process.platform,
    source: input.source
  };
}
function isSupportedPackageLauncherPlatform(platform2) {
  return platform2 === "darwin" || platform2 === "win32";
}
function capabilitiesFor(status) {
  const packageLauncher = status.mode === DESKTOP_UPDATE_MODES.PACKAGE_LAUNCHER && isSupportedPackageLauncherPlatform(status.platform) && status.supported;
  return {
    canApplyInPlace: false,
    canDownload: packageLauncher,
    canOpenInstaller: packageLauncher,
    requiresManualInstall: packageLauncher
  };
}
function createError(code, message, details) {
  return {
    code,
    ...details === void 0 ? {} : { details },
    message
  };
}
function isRecord(value) {
  return typeof value === "object" && value != null && !Array.isArray(value);
}
function stringField(record, key) {
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}
function numberField(record, key) {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function objectField(record, key) {
  const value = record[key];
  return isRecord(value) ? value : null;
}
function sanitizePathSegment(value) {
  return value.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "update";
}
function extensionForArtifact(name, type2) {
  const ext = name == null ? "" : extname2(name).toLowerCase();
  if (ext === ".dmg" || ext === ".zip" || ext === ".exe" || ext === ".appimage")
    return ext;
  if (type2 === "dmg")
    return ".dmg";
  if (type2 === "zip")
    return ".zip";
  if (type2 === "installer")
    return ".exe";
  return ".bin";
}
function artifactFileName(candidate) {
  const ext = extensionForArtifact(candidate.artifact.name, candidate.artifact.type ?? "artifact");
  return [
    "open-design",
    sanitizePathSegment(candidate.version),
    sanitizePathSegment(candidate.platformKey),
    sanitizePathSegment(candidate.arch),
    sanitizePathSegment(candidate.artifact.type ?? "artifact")
  ].join("-") + ext;
}
function releaseKey(candidate, checksum) {
  const digest2 = checksum.value == null ? checksum.url ?? candidate.artifact.url : checksum.value;
  return [
    sanitizePathSegment(candidate.version),
    sanitizePathSegment(candidate.platformKey),
    sanitizePathSegment(candidate.arch),
    sanitizePathSegment(createHash2("sha256").update(digest2).digest("hex").slice(0, 12))
  ].join("-");
}
function releaseMatchesCandidate(saved, candidate) {
  if (saved.channel !== candidate.channel)
    return false;
  if (saved.platformKey !== candidate.platformKey)
    return false;
  if (saved.arch !== candidate.arch)
    return false;
  if (saved.version !== candidate.version)
    return false;
  if (saved.artifact.url !== candidate.artifact.url)
    return false;
  if (saved.checksum.algorithm !== candidate.checksum.algorithm)
    return false;
  if (candidate.checksum.url != null && saved.checksum.url !== candidate.checksum.url)
    return false;
  if (candidate.checksum.value != null && saved.checksum.value !== candidate.checksum.value)
    return false;
  return true;
}
function containsPath2(root, path) {
  const rel = relative3(root, path);
  return rel === "" || rel.length > 0 && !rel.startsWith("..") && !isAbsolute6(rel);
}
async function writeJson3(path, payload) {
  await mkdir6(dirname6(path), { recursive: true });
  const tmp = `${path}.${process.pid}.${Date.now()}.tmp`;
  await writeFile6(tmp, `${JSON.stringify(payload, null, 2)}
`, "utf8");
  await rename5(tmp, path);
}
async function readJson2(path) {
  try {
    return JSON.parse(await readFile5(path, "utf8"));
  } catch {
    return null;
  }
}
async function readJsonStrict(path) {
  return JSON.parse(await readFile5(path, "utf8"));
}
async function directoryIsEmpty2(path) {
  const entries = await readdir2(path);
  return entries.length === 0;
}
function storeShapeError(root, message, details) {
  return createError("update-store-invalid-shape", message, {
    root,
    ...details === void 0 ? {} : { details }
  });
}
function logStoreError(logger, error) {
  logger.error("[open-design updater] invalid update store", error);
}
function isAllowedRootEntry(name) {
  return name === OWNERSHIP_SENTINEL || name === STORE_METADATA_FILE || name === DOWNLOADS_DIR || name === RELEASES_DIR || name === STAGING_DIR || name === BACK_DIR || name === HELPERS_DIR;
}
function isUpdateStoreMetadata(value) {
  if (!isRecord(value) || value.version !== STORE_METADATA_VERSION)
    return false;
  if (value.active != null && !isUpdateReleaseRef(value.active))
    return false;
  if (value.incoming != null && !isIncomingRef(value.incoming))
    return false;
  if (value.installFrozen != null && typeof value.installFrozen !== "boolean")
    return false;
  if (value.installResult != null && !isInstallResult(value.installResult))
    return false;
  if (value.lastCheckedAt != null && typeof value.lastCheckedAt !== "string")
    return false;
  return true;
}
function isArtifactSnapshot(value) {
  if (!isRecord(value))
    return false;
  if (stringField(value, "platformKey") == null)
    return false;
  if (stringField(value, "type") == null)
    return false;
  if (stringField(value, "url") == null)
    return false;
  if (value.name != null && typeof value.name !== "string")
    return false;
  if (value.size != null && (typeof value.size !== "number" || !Number.isFinite(value.size)))
    return false;
  return true;
}
function isChecksumSnapshot(value) {
  if (!isRecord(value))
    return false;
  if (value.algorithm !== "sha256" && value.algorithm !== "sha512")
    return false;
  if (value.value != null && typeof value.value !== "string")
    return false;
  if (value.url != null && typeof value.url !== "string")
    return false;
  return true;
}
function isResolvedChecksumSnapshot(value) {
  return isChecksumSnapshot(value) && typeof value.value === "string" && value.value.length > 0;
}
function isUpdateReleaseRef(value) {
  if (!isRecord(value))
    return false;
  return stringField(value, "arch") != null && isArtifactSnapshot(value.artifact) && stringField(value, "artifactPath") != null && isChecksumSnapshot(value.checksum) && stringField(value, "checksumPath") != null && isDesktopUpdateChannel(value.channel) && stringField(value, "downloadedAt") != null && stringField(value, "key") != null && isRecord(value.metadata) && stringField(value, "metadataPath") != null && stringField(value, "platformKey") != null && stringField(value, "version") != null;
}
function isIncomingRef(value) {
  if (!isRecord(value))
    return false;
  return stringField(value, "arch") != null && isArtifactSnapshot(value.artifact) && isDesktopUpdateChannel(value.channel) && stringField(value, "cycleId") != null && isRecord(value.metadata) && stringField(value, "platformKey") != null && stringField(value, "startedAt") != null && stringField(value, "version") != null;
}
function isInstallResult(value) {
  if (!isRecord(value))
    return false;
  if (stringField(value, "openedAt") == null)
    return false;
  if (stringField(value, "path") == null)
    return false;
  if (value.dryRun != null && typeof value.dryRun !== "boolean")
    return false;
  return true;
}
async function ensureOwnedUpdateRoot(config, logger = console) {
  const root = normalizeDownloadRoot(config.downloadRoot);
  try {
    await mkdir6(root, { recursive: true });
    const rootEntry = await lstat3(root);
    if (!rootEntry.isDirectory() || rootEntry.isSymbolicLink()) {
      return {
        ok: false,
        error: createError("update-root-not-owned", `update root is not an owned directory: ${root}`)
      };
    }
    const realRoot = await realpath2(root);
    const sentinelPath = join5(realRoot, OWNERSHIP_SENTINEL);
    const metadataPath = join5(realRoot, STORE_METADATA_FILE);
    const sentinel = await readJson2(sentinelPath);
    if (sentinel != null) {
      if (sentinel.version !== UPDATE_ROOT_VERSION) {
        return {
          ok: false,
          error: createError("update-root-version-mismatch", `update root has unsupported ownership marker version at ${sentinelPath}`)
        };
      }
    } else {
      if (!await directoryIsEmpty2(realRoot)) {
        return {
          ok: false,
          error: createError("update-root-not-owned", `update root is not empty and has no Open Design updater ownership marker: ${realRoot}`)
        };
      }
      await writeJson3(sentinelPath, {
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        owner: "open-design-updater",
        source: config.source,
        version: UPDATE_ROOT_VERSION
      });
    }
    const entries = await readdir2(realRoot);
    const unexpected = entries.filter((entry) => !isAllowedRootEntry(entry));
    if (unexpected.length > 0) {
      const error = storeShapeError(realRoot, "update store contains unexpected root entries", { unexpected });
      logStoreError(logger, error);
      return { ok: false, error };
    }
    for (const dirName of [RELEASES_DIR, STAGING_DIR, DOWNLOADS_DIR, BACK_DIR, HELPERS_DIR]) {
      const path = join5(realRoot, dirName);
      let entry;
      try {
        entry = await lstat3(path);
      } catch {
        continue;
      }
      if (!entry.isDirectory() || entry.isSymbolicLink()) {
        const error = storeShapeError(realRoot, `update store entry ${dirName} must be a plain directory`, { path });
        logStoreError(logger, error);
        return { ok: false, error };
      }
      const realDir = await realpath2(path);
      if (!containsPath2(realRoot, realDir)) {
        const error = storeShapeError(realRoot, `update store entry ${dirName} escapes update root`, { path, realDir });
        logStoreError(logger, error);
        return { ok: false, error };
      }
    }
    try {
      await access2(metadataPath);
    } catch {
      const nonSentinelEntries = entries.filter((entry) => entry !== OWNERSHIP_SENTINEL);
      if (nonSentinelEntries.length > 0) {
        const error = storeShapeError(realRoot, "update store metadata.json is missing for a non-empty store", {
          entries: nonSentinelEntries
        });
        logStoreError(logger, error);
        return { ok: false, error };
      }
      await writeJson3(metadataPath, { version: STORE_METADATA_VERSION });
    }
    return { ok: true, metadataPath, realRoot };
  } catch (error) {
    return {
      ok: false,
      error: createError("update-root-unavailable", error instanceof Error ? error.message : String(error))
    };
  }
}
function numberPart(value) {
  return value != null && /^[0-9]+$/.test(value) ? Number(value) : 0;
}
function parseComparableVersion(value) {
  const cleaned = value.trim().replace(/^v/i, "").split("+", 1)[0] ?? "";
  const nightlyMatch = /^(\d+)\.(\d+)\.(\d+)\.nightly\.(\d+)$/i.exec(cleaned);
  if (nightlyMatch?.[1] != null && nightlyMatch[2] != null && nightlyMatch[3] != null && nightlyMatch[4] != null) {
    return {
      nums: [Number(nightlyMatch[1]), Number(nightlyMatch[2]), Number(nightlyMatch[3])],
      pre: ["nightly", nightlyMatch[4]]
    };
  }
  const prereleaseSeparator = cleaned.indexOf("-");
  const core = prereleaseSeparator === -1 ? cleaned : cleaned.slice(0, prereleaseSeparator);
  const prerelease = prereleaseSeparator === -1 ? "" : cleaned.slice(prereleaseSeparator + 1);
  const nums = core.split(".");
  return {
    nums: [numberPart(nums[0]), numberPart(nums[1]), numberPart(nums[2])],
    pre: prerelease.length === 0 ? [] : prerelease.split(".")
  };
}
function hasCountedPrerelease(version) {
  const parsed = parseComparableVersion(version);
  const last = parsed.pre.at(-1);
  return parsed.pre.length >= 2 && last != null && /^[0-9]+$/.test(last);
}
function defaultChannelForVersion(version) {
  if (/(?:^|[-.])beta(?:[-.]|$)/i.test(version))
    return DESKTOP_UPDATE_CHANNELS.BETA;
  if (/(?:^|[-.])preview(?:[-.]|$)/i.test(version))
    return DESKTOP_UPDATE_CHANNELS.PREVIEW;
  if (/(?:^|[-.])nightly(?:[-.]|$)/i.test(version))
    return DESKTOP_UPDATE_CHANNELS.NIGHTLY;
  return hasCountedPrerelease(version) ? DESKTOP_UPDATE_CHANNELS.BETA : DESKTOP_UPDATE_CHANNELS.STABLE;
}
function compareIdentifier(a, b) {
  const aNum = /^[0-9]+$/.test(a) ? Number(a) : null;
  const bNum = /^[0-9]+$/.test(b) ? Number(b) : null;
  if (aNum != null && bNum != null)
    return Math.sign(aNum - bNum);
  if (aNum != null)
    return -1;
  if (bNum != null)
    return 1;
  return a.localeCompare(b);
}
function compareVersions(a, b) {
  const left = parseComparableVersion(a);
  const right = parseComparableVersion(b);
  for (let index = 0; index < 3; index += 1) {
    const delta = (left.nums[index] ?? 0) - (right.nums[index] ?? 0);
    if (delta !== 0)
      return Math.sign(delta);
  }
  if (left.pre.length === 0 && right.pre.length === 0)
    return 0;
  if (left.pre.length === 0)
    return 1;
  if (right.pre.length === 0)
    return -1;
  const max = Math.max(left.pre.length, right.pre.length);
  for (let index = 0; index < max; index += 1) {
    const l = left.pre[index];
    const r = right.pre[index];
    if (l == null)
      return -1;
    if (r == null)
      return 1;
    const delta = compareIdentifier(l, r);
    if (delta !== 0)
      return delta;
  }
  return 0;
}
function metadataChannel(metadata) {
  const channel = stringField(metadata, "channel");
  return isDesktopUpdateChannel(channel) ? channel : null;
}
function releaseVersionForChannel(metadata, channel) {
  if (channel === DESKTOP_UPDATE_CHANNELS.BETA)
    return stringField(metadata, "betaVersion");
  if (channel === DESKTOP_UPDATE_CHANNELS.NIGHTLY)
    return stringField(metadata, "nightlyVersion") ?? stringField(metadata, "releaseVersion");
  if (channel === DESKTOP_UPDATE_CHANNELS.PREVIEW)
    return stringField(metadata, "previewVersion") ?? stringField(metadata, "releaseVersion");
  return stringField(metadata, "releaseVersion") ?? stringField(metadata, "stableVersion");
}
function selectedMacPlatformKey(arch2) {
  return arch2 === "x64" ? "macIntel" : "mac";
}
function selectedWinPlatformKey(arch2) {
  if (arch2 === "x64")
    return "win";
  if (arch2 === "arm64")
    return "winArm64";
  if (arch2 === "ia32")
    return "winIa32";
  return `win-${sanitizePathSegment(arch2)}`;
}
function selectedPackageLauncherArtifact(config) {
  if (config.platform === "darwin") {
    return {
      artifactKey: "dmg",
      artifactType: "dmg",
      description: "mac DMG",
      platformKey: selectedMacPlatformKey(config.arch)
    };
  }
  if (config.platform === "win32") {
    return {
      artifactKey: "installer",
      artifactType: "installer",
      description: "Windows installer",
      platformKey: selectedWinPlatformKey(config.arch)
    };
  }
  return null;
}
function installerObservationArtifactType(value) {
  if (value === "dmg" || value === "installer")
    return value;
  return null;
}
function selectUpdateCandidate(metadata, config) {
  if (config.mode === DESKTOP_UPDATE_MODES.JS_INCREMENTAL) {
    return {
      ok: false,
      state: DESKTOP_UPDATE_STATES.UNSUPPORTED,
      error: createError("update-mode-not-implemented", "js-incremental updates are not implemented yet")
    };
  }
  if (config.mode !== DESKTOP_UPDATE_MODES.PACKAGE_LAUNCHER) {
    return {
      ok: false,
      state: DESKTOP_UPDATE_STATES.UNSUPPORTED,
      error: createError("update-mode-unsupported", `unsupported update mode: ${config.mode}`)
    };
  }
  const artifactSelection = selectedPackageLauncherArtifact(config);
  if (artifactSelection == null) {
    return {
      ok: false,
      state: DESKTOP_UPDATE_STATES.UNSUPPORTED,
      error: createError("unsupported-platform", "package-launcher updates are currently supported on macOS and Windows only")
    };
  }
  const channel = metadataChannel(metadata);
  if (channel == null) {
    return {
      ok: false,
      state: DESKTOP_UPDATE_STATES.ERROR,
      error: createError("metadata-channel-unsupported", "release metadata does not include a supported update channel")
    };
  }
  if (channel !== config.channel) {
    return {
      ok: false,
      state: DESKTOP_UPDATE_STATES.ERROR,
      error: createError("metadata-channel-mismatch", `release metadata channel ${channel} does not match configured update channel ${config.channel}`)
    };
  }
  const platforms = objectField(metadata, "platforms");
  if (platforms == null) {
    return {
      ok: false,
      state: DESKTOP_UPDATE_STATES.ERROR,
      error: createError("metadata-missing-platforms", "release metadata does not include platform artifacts")
    };
  }
  const platformKey = artifactSelection.platformKey;
  const platform2 = objectField(platforms, platformKey);
  if (platform2 == null || platform2.enabled !== true) {
    return {
      ok: false,
      state: DESKTOP_UPDATE_STATES.ERROR,
      error: createError("no-compatible-artifact", `release metadata does not include an enabled ${platformKey} artifact`)
    };
  }
  const version = releaseVersionForChannel(metadata, config.channel);
  if (version == null) {
    return {
      ok: false,
      state: DESKTOP_UPDATE_STATES.ERROR,
      error: createError("metadata-missing-version", `release metadata does not include a ${config.channel} update version`)
    };
  }
  const artifacts = objectField(platform2, "artifacts");
  const artifactRecord = artifacts == null ? null : objectField(artifacts, artifactSelection.artifactKey);
  const url = artifactRecord == null ? null : stringField(artifactRecord, "url");
  if (artifactRecord == null || url == null) {
    return {
      ok: false,
      state: DESKTOP_UPDATE_STATES.ERROR,
      error: createError("no-compatible-artifact", `release metadata does not include a ${artifactSelection.description} artifact for ${platformKey}`)
    };
  }
  const artifact = {
    ...stringField(artifactRecord, "name") == null ? {} : { name: stringField(artifactRecord, "name") },
    platformKey,
    ...numberField(artifactRecord, "size") == null ? {} : { size: numberField(artifactRecord, "size") },
    type: artifactSelection.artifactType,
    url
  };
  const sha256 = stringField(artifactRecord, "sha256") ?? stringField(artifactRecord, "sha256Digest");
  const sha512 = stringField(artifactRecord, "sha512") ?? stringField(artifactRecord, "sha512Digest");
  const checksum = sha512 != null ? { algorithm: "sha512", value: sha512 } : {
    algorithm: "sha256",
    ...sha256 == null ? {} : { value: sha256 },
    ...stringField(artifactRecord, "sha256Url") == null ? {} : { url: stringField(artifactRecord, "sha256Url") }
  };
  return {
    ok: true,
    candidate: {
      arch: stringField(platform2, "arch") ?? config.arch,
      artifact,
      checksum,
      channel: config.channel,
      metadata,
      platformKey,
      version
    }
  };
}
async function fetchJson(fetchImpl, url) {
  const response = await fetchImpl(url);
  if (!response.ok)
    throw new Error(`metadata request returned HTTP ${response.status}`);
  const body = await response.json();
  if (!isRecord(body))
    throw new Error("metadata response was not a JSON object");
  return body;
}
function parseChecksumText(text, algorithm) {
  const length = algorithm === "sha256" ? 64 : 128;
  const match = text.match(new RegExp(`\\b[0-9a-fA-F]{${length}}\\b`));
  if (match == null)
    throw new Error(`checksum file does not include a ${algorithm} digest`);
  return match[0].toLowerCase();
}
async function resolveChecksum(fetchImpl, checksum) {
  if (checksum.value != null)
    return checksum;
  if (checksum.url == null)
    throw new Error("artifact checksum is missing");
  const response = await fetchImpl(checksum.url);
  if (!response.ok)
    throw new Error(`checksum request returned HTTP ${response.status}`);
  return {
    ...checksum,
    value: parseChecksumText(await response.text(), checksum.algorithm)
  };
}
async function hashFile2(path, algorithm) {
  const hash = createHash2(algorithm);
  await pipeline2(createReadStream2(path), hash);
  return hash.digest("hex");
}
function errorMessage4(error) {
  return error instanceof Error ? error.message : String(error);
}
function isRetryableArtifactDownloadError(error) {
  const message = errorMessage4(error);
  return /\b(?:terminated|aborted|ECONNRESET|ETIMEDOUT|EPIPE|UND_ERR_SOCKET|fetch failed)\b/i.test(message);
}
function userFacingDownloadErrorMessage(error) {
  if (error instanceof ManagedDownloadError && error.code === MANAGED_DOWNLOAD_ERROR_CODES.NETWORK_EXHAUSTED) {
    return `The network connection ended while downloading the update. Please try again.`;
  }
  const message = errorMessage4(error);
  if (isRetryableArtifactDownloadError(error)) {
    return `The network connection ended while downloading the update. Please try again.`;
  }
  return message;
}
function managedChecksum(checksum) {
  if (checksum.value == null)
    throw new Error("artifact checksum is missing");
  return {
    algorithm: checksum.algorithm,
    value: checksum.value
  };
}
function updateProgressFromManaged(progress) {
  return {
    receivedBytes: progress.receivedBytes,
    ...progress.totalBytes == null ? {} : { totalBytes: progress.totalBytes }
  };
}
function desktopDownloadError(error) {
  if (error instanceof ManagedDownloadError && error.code === MANAGED_DOWNLOAD_ERROR_CODES.CHECKSUM_MISMATCH) {
    return createError("checksum-mismatch", "downloaded update checksum did not match release metadata", error.details);
  }
  if (error instanceof ManagedDownloadError && error.code === MANAGED_DOWNLOAD_ERROR_CODES.TARGET_LOCKED) {
    return createError("download-target-locked", "another update download is already using this target");
  }
  return createError("download-failed", userFacingDownloadErrorMessage(error));
}
async function ensureOwnedSubdir(root, name) {
  if (name.length === 0 || name.includes("\0") || /[\\/]/.test(name)) {
    throw new Error(`update subdirectory must be a simple path segment: ${name}`);
  }
  const dir = join5(root, name);
  if (!containsPath2(root, dir))
    throw new Error(`update subdirectory escaped update root: ${dir}`);
  await mkdir6(dir, { recursive: true });
  const entry = await lstat3(dir);
  if (!entry.isDirectory() || entry.isSymbolicLink()) {
    throw new Error(`update subdirectory is not an owned directory: ${dir}`);
  }
  const realDir = await realpath2(dir);
  if (!containsPath2(root, realDir))
    throw new Error(`update subdirectory realpath escaped update root: ${realDir}`);
  return realDir;
}
function macDeferredInstallerScript() {
  return `#!/bin/sh
set -eu
target_pid="$1"
installer_path="$2"
timeout_seconds="$3"
cleanup() {
  rm -f "$0"
}
trap cleanup EXIT
deadline=$(($(date +%s) + timeout_seconds))
while kill -0 "$target_pid" 2>/dev/null; do
  if [ "$(date +%s)" -ge "$deadline" ]; then
    exit 1
  fi
  sleep 1
done
open "$installer_path" >/dev/null 2>&1 &
exit 0
`;
}
function windowsDeferredInstallerScript() {
  return `param(
  [Parameter(Mandatory = $true)]
  [int]$TargetPid,

  [Parameter(Mandatory = $true)]
  [string]$InstallerPath,

  [Parameter(Mandatory = $true)]
  [int]$TimeoutMs,

  [Parameter(Mandatory = $true)]
  [string]$LogPath
)

$ErrorActionPreference = "Stop"

function Write-HelperLog {
  param([string]$Message)
  try {
    Add-Content -LiteralPath $LogPath -Value ("{0:o} {1}" -f (Get-Date), $Message)
  } catch {
  }
}

try {
  Write-HelperLog ("armed for pid={0} installer={1}" -f $TargetPid, $InstallerPath)
  $deadline = (Get-Date).AddMilliseconds($TimeoutMs)
  while ($null -ne (Get-Process -Id $TargetPid -ErrorAction SilentlyContinue)) {
    if ((Get-Date) -ge $deadline) {
      throw ("timed out waiting for pid={0}" -f $TargetPid)
    }
    Start-Sleep -Milliseconds 250
  }

  Write-HelperLog ("observed pid={0} exit; opening installer" -f $TargetPid)
  Start-Process -FilePath $InstallerPath -WorkingDirectory (Split-Path -Parent $InstallerPath)
  Write-HelperLog "installer launch requested"
} catch {
  Write-HelperLog ("failed: {0}" -f $_.Exception.Message)
  exit 1
} finally {
  Remove-Item -LiteralPath $PSCommandPath -Force -ErrorAction SilentlyContinue
}
`;
}
function windowsDeferredInstallerLauncherScript() {
  return `param(
  [Parameter(Mandatory = $true)]
  [string]$PowerShellPath,

  [Parameter(Mandatory = $true)]
  [string]$HelperPath,

  [Parameter(Mandatory = $true)]
  [int]$TargetPid,

  [Parameter(Mandatory = $true)]
  [string]$InstallerPath,

  [Parameter(Mandatory = $true)]
  [int]$TimeoutMs,

  [Parameter(Mandatory = $true)]
  [string]$LogPath
)

$ErrorActionPreference = "Stop"

function Quote-WindowsPowerShellArgument {
  param([string]$Value)
  return '"' + ($Value -replace '"', '\\"') + '"'
}

function Write-LauncherLog {
  param([string]$Message)
  try {
    Add-Content -LiteralPath $LogPath -Value ("{0:o} {1}" -f (Get-Date), $Message)
  } catch {
  }
}

try {
  Write-LauncherLog ("launching helper={0}" -f $HelperPath)
  $arguments = @(
    "-NoLogo",
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    (Quote-WindowsPowerShellArgument $HelperPath),
    "-TargetPid",
    $TargetPid.ToString(),
    "-InstallerPath",
    (Quote-WindowsPowerShellArgument $InstallerPath),
    "-TimeoutMs",
    $TimeoutMs.ToString(),
    "-LogPath",
    (Quote-WindowsPowerShellArgument $LogPath)
  ) -join " "
  Start-Process -FilePath $PowerShellPath -WindowStyle Hidden -ArgumentList $arguments
  Write-LauncherLog "helper launch requested"
} catch {
  Write-LauncherLog ("launcher failed: {0}" -f $_.Exception.Message)
  exit 1
} finally {
  Remove-Item -LiteralPath $PSCommandPath -Force -ErrorAction SilentlyContinue
}
`;
}
function windowsPowerShellCommand(env = process.env) {
  const systemRoot = env.SystemRoot ?? env.SYSTEMROOT ?? "C:\\Windows";
  return join5(systemRoot, "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
}
async function launchMacInstallerAfterQuit(input, deps) {
  try {
    const helpersRoot = await ensureOwnedSubdir(input.root, HELPERS_DIR);
    const suffix = `${deps.now().getTime().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    const scriptPath = join5(helpersRoot, `open-installer-after-quit-${suffix}.sh`);
    await writeFile6(scriptPath, macDeferredInstallerScript(), { encoding: "utf8", mode: 448 });
    await chmod(scriptPath, 448);
    const timeoutSeconds = Math.max(1, Math.ceil(input.timeoutMs / 1e3)).toString();
    const child = deps.spawnDetached("/bin/sh", [scriptPath, input.appPid.toString(), input.installerPath, timeoutSeconds], { detached: true, stdio: "ignore", windowsHide: true });
    child.unref();
    return "";
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}
async function launchWindowsInstallerAfterQuit(input, deps) {
  try {
    const helpersRoot = await ensureOwnedSubdir(input.root, HELPERS_DIR);
    const suffix = `${deps.now().getTime().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    const scriptPath = join5(helpersRoot, `open-installer-after-quit-${suffix}.ps1`);
    const launcherPath = join5(helpersRoot, `open-installer-after-quit-${suffix}.launcher.ps1`);
    const logPath = join5(helpersRoot, `open-installer-after-quit-${suffix}.log`);
    const powerShellPath = windowsPowerShellCommand();
    await writeFile6(scriptPath, windowsDeferredInstallerScript(), { encoding: "utf8" });
    await writeFile6(launcherPath, windowsDeferredInstallerLauncherScript(), { encoding: "utf8" });
    const child = deps.spawnDetached(powerShellPath, [
      "-NoLogo",
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      launcherPath,
      "-PowerShellPath",
      powerShellPath,
      "-HelperPath",
      scriptPath,
      "-TargetPid",
      input.appPid.toString(),
      "-InstallerPath",
      input.installerPath,
      "-TimeoutMs",
      input.timeoutMs.toString(),
      "-LogPath",
      logPath
    ], { stdio: "ignore", windowsHide: true });
    child.unref();
    return "";
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}
async function cleanupBackDirectory(root, logger) {
  const backDir = join5(root, BACK_DIR);
  const entry = await lstat3(backDir).catch(() => null);
  if (entry == null)
    return;
  if (!entry.isDirectory() || entry.isSymbolicLink()) {
    logger.warn("[open-design updater] skipped invalid update backup directory", backDir);
    return;
  }
  const realBackDir = await realpath2(backDir).catch(() => null);
  if (realBackDir == null || !containsPath2(root, realBackDir)) {
    logger.warn("[open-design updater] skipped escaped update backup directory", backDir);
    return;
  }
  const entries = await readdir2(backDir);
  await Promise.all(entries.map(async (entry2) => {
    const path = join5(backDir, entry2);
    const resolved = resolve6(path);
    if (!containsPath2(root, resolved))
      return;
    const stats = await lstat3(resolved).catch(() => null);
    if (stats == null || stats.isSymbolicLink())
      return;
    if (stats.isDirectory()) {
      const real = await realpath2(resolved).catch(() => null);
      if (real == null || !containsPath2(root, real))
        return;
    }
    await rm4(resolved, { force: true, recursive: true }).catch((error) => {
      logger.warn("[open-design updater] failed to clean update backup entry", error);
    });
  }));
}
function scheduleBackCleanup(root, logger) {
  void cleanupBackDirectory(root, logger).catch((error) => {
    logger.warn("[open-design updater] failed to clean update backup directory", error);
  });
}
async function readStoreMetadata(root, logger) {
  try {
    const metadata = await readJsonStrict(root.metadataPath);
    if (!isUpdateStoreMetadata(metadata)) {
      const error = storeShapeError(root.realRoot, "updates/metadata.json does not match the updater store schema", {
        path: root.metadataPath
      });
      logStoreError(logger, error);
      return { ok: false, error };
    }
    return { ok: true, metadata };
  } catch (error) {
    const storeError = storeShapeError(root.realRoot, "updates/metadata.json could not be read as JSON", {
      path: root.metadataPath,
      reason: error instanceof Error ? error.message : String(error)
    });
    logStoreError(logger, storeError);
    return { ok: false, error: storeError };
  }
}
async function writeStoreMetadata(root, metadata) {
  await writeJson3(root.metadataPath, metadata);
}
async function clearInterruptedIncomingDownload(root, metadata, logger) {
  const incoming = metadata.incoming;
  if (incoming == null)
    return metadata;
  const stagingRoot = resolve6(root.realRoot, STAGING_DIR);
  const stagingDir = resolve6(stagingRoot, incoming.cycleId);
  if (containsPath2(stagingRoot, stagingDir)) {
    await rm4(stagingDir, { force: true, recursive: true }).catch((error) => {
      logger.warn("[open-design updater] failed to clean interrupted update staging directory", error);
    });
  } else {
    logger.warn("[open-design updater] skipped escaped interrupted update staging directory", {
      cycleId: incoming.cycleId,
      stagingDir
    });
  }
  const next = {
    ...metadata,
    incoming: void 0
  };
  await writeStoreMetadata(root, next);
  logger.warn("[open-design updater] cleared interrupted update download", {
    cycleId: incoming.cycleId,
    version: incoming.version
  });
  return next;
}
function releaseSnapshot(active) {
  const ref = active.ref;
  return {
    arch: ref.arch,
    artifact: ref.artifact,
    checksum: ref.checksum,
    channel: ref.channel,
    downloadedAt: ref.downloadedAt,
    key: ref.key,
    metadata: ref.metadata,
    path: active.path,
    platformKey: ref.platformKey,
    version: ref.version
  };
}
function incomingSnapshot(incoming, progress) {
  return {
    arch: incoming.arch,
    artifact: incoming.artifact,
    channel: incoming.channel,
    key: incoming.cycleId,
    metadata: incoming.metadata,
    ...progress == null ? {} : { progress },
    startedAt: incoming.startedAt,
    version: incoming.version
  };
}
async function loadActiveRelease(root, metadata, config, logger) {
  const active = metadata.active;
  if (active == null)
    return { ok: true, active: null };
  if (compareVersions(active.version, config.currentVersion) <= 0)
    return { ok: true, active: null };
  const artifactPath = resolve6(root.realRoot, active.artifactPath);
  if (!containsPath2(root.realRoot, artifactPath)) {
    const error = storeShapeError(root.realRoot, "active release artifact path escaped update root", { artifactPath });
    logStoreError(logger, error);
    return { ok: false, error };
  }
  try {
    const file = await stat4(artifactPath);
    if (!file.isFile()) {
      const error = storeShapeError(root.realRoot, "active release artifact is not a file", { artifactPath });
      logStoreError(logger, error);
      return { ok: false, error };
    }
  } catch (error) {
    const storeError = storeShapeError(root.realRoot, "active release artifact is missing", {
      artifactPath,
      reason: error instanceof Error ? error.message : String(error)
    });
    logStoreError(logger, storeError);
    return { ok: false, error: storeError };
  }
  return { ok: true, active: { path: artifactPath, ref: active } };
}
function checksumMatchesCandidate(checksum, candidate) {
  if (checksum.algorithm !== candidate.checksum.algorithm)
    return false;
  if (candidate.checksum.url != null && checksum.url !== candidate.checksum.url)
    return false;
  if (candidate.checksum.value != null && checksum.value.toLowerCase() !== candidate.checksum.value.toLowerCase())
    return false;
  return true;
}
async function loadVerifiedReleaseForCandidate(root, candidate) {
  const releasesRoot = resolve6(root.realRoot, RELEASES_DIR);
  const entries = await readdir2(releasesRoot, { withFileTypes: true }).catch(() => []);
  const outputName = artifactFileName(candidate);
  for (const entry of entries) {
    if (!entry.isDirectory())
      continue;
    const releaseDir = resolve6(releasesRoot, entry.name);
    if (!containsPath2(root.realRoot, releaseDir))
      continue;
    const checksum = await readJson2(join5(releaseDir, "checksum.json"));
    if (!isResolvedChecksumSnapshot(checksum) || !checksumMatchesCandidate(checksum, candidate))
      continue;
    if (entry.name !== releaseKey(candidate, checksum))
      continue;
    const metadata = await readJson2(join5(releaseDir, "metadata.json"));
    if (!isRecord(metadata))
      continue;
    const artifactPath = resolve6(releaseDir, outputName);
    if (!containsPath2(root.realRoot, artifactPath))
      continue;
    const artifactStat = await stat4(artifactPath).catch(() => null);
    if (artifactStat == null || !artifactStat.isFile())
      continue;
    const digest2 = await hashFile2(artifactPath, checksum.algorithm).catch(() => null);
    if (digest2?.toLowerCase() !== checksum.value.toLowerCase())
      continue;
    const ref = {
      arch: candidate.arch,
      artifact: candidate.artifact,
      artifactPath: relative3(root.realRoot, artifactPath),
      checksum,
      checksumPath: relative3(root.realRoot, join5(releaseDir, "checksum.json")),
      channel: candidate.channel,
      downloadedAt: artifactStat.mtime.toISOString(),
      key: entry.name,
      metadata,
      metadataPath: relative3(root.realRoot, join5(releaseDir, "metadata.json")),
      platformKey: candidate.platformKey,
      version: candidate.version
    };
    return { path: artifactPath, ref };
  }
  return null;
}
function createDesktopUpdater(configInput, deps = {}) {
  const config = resolveDesktopUpdaterConfig(configInput);
  const fetchImpl = deps.fetch ?? globalThis.fetch;
  const logger = deps.logger ?? console;
  const now = deps.now ?? (() => /* @__PURE__ */ new Date());
  const openPath = deps.openPath ?? (async () => "openPath is not available");
  const processPid = deps.processPid ?? process.pid;
  const spawnDetached = deps.spawnDetached ?? ((command, args, options) => spawn2(command, args, options));
  const launchInstallerAfterQuit = deps.launchInstallerAfterQuit ?? ((input) => config.platform === "win32" ? launchWindowsInstallerAfterQuit(input, { now, spawnDetached }) : launchMacInstallerAfterQuit(input, { now, spawnDetached }));
  const listeners = /* @__PURE__ */ new Set();
  let candidate = null;
  let activeRelease = null;
  let incomingRelease = null;
  let metadata = null;
  let lastCheckedAt;
  let installResult;
  let installFrozen = false;
  let progress;
  let state = DESKTOP_UPDATE_STATES.IDLE;
  let error;
  let operation = Promise.resolve();
  function supported() {
    return config.enabled && config.mode === DESKTOP_UPDATE_MODES.PACKAGE_LAUNCHER && isSupportedPackageLauncherPlatform(config.platform);
  }
  function emit() {
    for (const listener of listeners)
      listener();
  }
  function setState(next, nextError) {
    state = next;
    error = nextError;
    const status = snapshot();
    emit();
    return status;
  }
  function snapshot() {
    const statusSupported = supported();
    const active = activeRelease == null ? void 0 : releaseSnapshot(activeRelease);
    const activeArtifact = activeRelease?.ref.artifact ?? (state === DESKTOP_UPDATE_STATES.AVAILABLE ? candidate?.artifact : void 0);
    const activeChecksum = activeRelease?.ref.checksum ?? (state === DESKTOP_UPDATE_STATES.AVAILABLE ? candidate?.checksum : void 0);
    const availableVersion = activeRelease?.ref.version ?? candidate?.version;
    const downloadPath = activeRelease?.path;
    const incoming = incomingRelease == null ? void 0 : incomingSnapshot(incomingRelease, progress);
    return {
      ...active == null ? {} : { active },
      arch: config.arch,
      ...activeArtifact == null ? {} : { artifact: activeArtifact },
      ...activeArtifact?.url == null ? {} : { artifactUrl: activeArtifact.url },
      ...availableVersion == null ? {} : { availableVersion },
      capabilities: capabilitiesFor({ mode: config.mode, platform: config.platform, supported: statusSupported }),
      channel: config.channel,
      ...activeChecksum == null ? {} : { checksum: activeChecksum },
      currentVersion: config.currentVersion,
      ...downloadPath == null ? {} : { downloadPath },
      enabled: config.enabled,
      ...error == null ? {} : { error },
      ...incoming == null ? {} : { incoming },
      ...installResult == null ? {} : { installResult },
      ...lastCheckedAt == null ? {} : { lastCheckedAt },
      ...metadata == null ? {} : { metadata },
      mode: config.mode,
      paths: { downloadRoot: config.downloadRoot, manifestPath: join5(config.downloadRoot, STORE_METADATA_FILE) },
      platform: config.platform,
      ...progress == null ? {} : { progress },
      state,
      supported: statusSupported
    };
  }
  function unsupportedStatus() {
    if (!config.enabled) {
      return setState(DESKTOP_UPDATE_STATES.IDLE);
    }
    if (config.mode === DESKTOP_UPDATE_MODES.JS_INCREMENTAL) {
      return setState(DESKTOP_UPDATE_STATES.UNSUPPORTED, createError("update-mode-not-implemented", "js-incremental updates are not implemented yet"));
    }
    if (!isSupportedPackageLauncherPlatform(config.platform)) {
      return setState(DESKTOP_UPDATE_STATES.UNSUPPORTED, createError("unsupported-platform", "package-launcher updates are currently supported on macOS and Windows only"));
    }
    return null;
  }
  async function openStore() {
    const root = await ensureOwnedUpdateRoot(config, logger);
    if (!root.ok)
      return { ok: false, status: setState(DESKTOP_UPDATE_STATES.ERROR, root.error) };
    const loaded = await readStoreMetadata(root, logger);
    if (!loaded.ok)
      return { ok: false, status: setState(DESKTOP_UPDATE_STATES.ERROR, loaded.error) };
    return { ok: true, root, metadata: loaded.metadata };
  }
  async function restoreStoreState() {
    const opened = await openStore();
    if (!opened.ok)
      return opened.status;
    const restoredMetadata = await clearInterruptedIncomingDownload(opened.root, opened.metadata, logger);
    const loadedActive = await loadActiveRelease(opened.root, restoredMetadata, config, logger);
    if (!loadedActive.ok)
      return setState(DESKTOP_UPDATE_STATES.ERROR, loadedActive.error);
    activeRelease = loadedActive.active;
    const clearedAppliedRelease = activeRelease == null && (restoredMetadata.active != null || restoredMetadata.installFrozen === true || restoredMetadata.installResult != null);
    if (clearedAppliedRelease) {
      await writeStoreMetadata(opened.root, {
        ...restoredMetadata,
        active: void 0,
        incoming: void 0,
        installFrozen: void 0,
        installResult: void 0,
        version: STORE_METADATA_VERSION
      });
    }
    installFrozen = clearedAppliedRelease ? false : restoredMetadata.installFrozen === true;
    installResult = clearedAppliedRelease ? void 0 : restoredMetadata.installResult;
    lastCheckedAt = restoredMetadata.lastCheckedAt;
    metadata = activeRelease?.ref.metadata ?? null;
    candidate = null;
    incomingRelease = null;
    progress = void 0;
    return setState(activeRelease == null ? DESKTOP_UPDATE_STATES.IDLE : DESKTOP_UPDATE_STATES.DOWNLOADED);
  }
  async function writeMetadataPatch(patch) {
    const opened = await openStore();
    if (!opened.ok)
      return null;
    await writeStoreMetadata(opened.root, patch(opened.metadata));
    return opened.root;
  }
  async function checkForCandidate(options = {}) {
    const unsupported = unsupportedStatus();
    if (unsupported != null)
      return unsupported;
    if (installFrozen || installResult != null)
      return snapshot();
    if (state === DESKTOP_UPDATE_STATES.IDLE) {
      const restored = await restoreStoreState();
      if (restored?.state === DESKTOP_UPDATE_STATES.ERROR)
        return restored;
      if (installFrozen || installResult != null)
        return snapshot();
    }
    const keepDownloadedVisible = activeRelease != null;
    if (!keepDownloadedVisible)
      setState(DESKTOP_UPDATE_STATES.CHECKING);
    try {
      const body = await fetchJson(fetchImpl, config.metadataUrl);
      lastCheckedAt = now().toISOString();
      metadata = body;
      const root = await writeMetadataPatch((current) => ({
        ...current,
        lastCheckedAt
      }));
      if (root != null)
        scheduleBackCleanup(root.realRoot, logger);
      const selected = selectUpdateCandidate(body, config);
      if (!selected.ok)
        return setState(selected.state, selected.error);
      if (compareVersions(selected.candidate.version, config.currentVersion) <= 0) {
        candidate = null;
        activeRelease = null;
        await writeMetadataPatch((current) => ({
          ...current,
          active: void 0,
          incoming: void 0,
          lastCheckedAt
        }));
        return setState(DESKTOP_UPDATE_STATES.NOT_AVAILABLE);
      }
      if (activeRelease != null && releaseMatchesCandidate(activeRelease.ref, selected.candidate)) {
        candidate = selected.candidate;
        metadata = selected.candidate.metadata;
        return setState(DESKTOP_UPDATE_STATES.DOWNLOADED);
      }
      const openedForAdoption = await openStore();
      if (openedForAdoption.ok) {
        const adoptedRelease = await loadVerifiedReleaseForCandidate(openedForAdoption.root, selected.candidate);
        if (adoptedRelease != null) {
          candidate = selected.candidate;
          activeRelease = adoptedRelease;
          metadata = adoptedRelease.ref.metadata;
          installFrozen = false;
          installResult = void 0;
          incomingRelease = null;
          progress = void 0;
          await writeStoreMetadata(openedForAdoption.root, {
            ...openedForAdoption.metadata,
            active: adoptedRelease.ref,
            incoming: void 0,
            installFrozen: false,
            installResult: void 0,
            lastCheckedAt,
            version: STORE_METADATA_VERSION
          });
          return setState(DESKTOP_UPDATE_STATES.DOWNLOADED);
        }
      }
      candidate = selected.candidate;
      const available = activeRelease == null ? setState(DESKTOP_UPDATE_STATES.AVAILABLE) : setState(DESKTOP_UPDATE_STATES.DOWNLOADED);
      if (options.autoDownload ?? config.autoDownload)
        return await downloadUpdate();
      return available;
    } catch (checkError) {
      return setState(DESKTOP_UPDATE_STATES.ERROR, createError("metadata-unreachable", checkError instanceof Error ? checkError.message : String(checkError)));
    }
  }
  async function downloadUpdate() {
    const unsupported = unsupportedStatus();
    if (unsupported != null)
      return unsupported;
    if (installFrozen || installResult != null)
      return snapshot();
    if (candidate == null) {
      const checked = await checkForCandidate({ autoDownload: false });
      if (checked.state !== DESKTOP_UPDATE_STATES.AVAILABLE || candidate == null)
        return checked;
    }
    if (activeRelease != null && releaseMatchesCandidate(activeRelease.ref, candidate)) {
      return setState(DESKTOP_UPDATE_STATES.DOWNLOADED);
    }
    const opened = await openStore();
    if (!opened.ok)
      return opened.status;
    const nextCandidate = candidate;
    const outputName = artifactFileName(nextCandidate);
    const cycleId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    const startedAt = now().toISOString();
    incomingRelease = {
      arch: nextCandidate.arch,
      artifact: nextCandidate.artifact,
      channel: nextCandidate.channel,
      cycleId,
      metadata: nextCandidate.metadata,
      platformKey: nextCandidate.platformKey,
      startedAt,
      version: nextCandidate.version
    };
    progress = void 0;
    await writeStoreMetadata(opened.root, {
      ...opened.metadata,
      incoming: incomingRelease
    });
    setState(activeRelease == null ? DESKTOP_UPDATE_STATES.DOWNLOADING : DESKTOP_UPDATE_STATES.DOWNLOADED);
    let tmpPath = null;
    let stagingDir = null;
    const failDownload = async (nextError) => {
      if (stagingDir != null)
        await rm4(stagingDir, { force: true, recursive: true }).catch(() => void 0);
      incomingRelease = null;
      progress = void 0;
      await writeStoreMetadata(opened.root, {
        ...opened.metadata,
        incoming: void 0
      });
      return setState(DESKTOP_UPDATE_STATES.ERROR, nextError);
    };
    try {
      const stagingRoot = await ensureOwnedSubdir(opened.root.realRoot, STAGING_DIR);
      const downloadsRoot = await ensureOwnedSubdir(opened.root.realRoot, DOWNLOADS_DIR);
      const releasesRoot = await ensureOwnedSubdir(opened.root.realRoot, RELEASES_DIR);
      stagingDir = join5(stagingRoot, cycleId);
      if (!containsPath2(opened.root.realRoot, stagingDir)) {
        return await failDownload(createError("download-path-escaped", "resolved update staging path escaped update root"));
      }
      await mkdir6(stagingDir, { recursive: true });
      tmpPath = join5(stagingDir, outputName);
      if (!containsPath2(opened.root.realRoot, tmpPath)) {
        return await failDownload(createError("download-path-escaped", "resolved update download path escaped update root"));
      }
      const resolvedChecksum = await resolveChecksum(fetchImpl, nextCandidate.checksum);
      await downloadCopyAndClear({
        basePath: downloadsRoot,
        bucket: "package-launcher",
        fetch: fetchImpl,
        fileName: outputName,
        maxAttempts: ARTIFACT_DOWNLOAD_MAX_ATTEMPTS,
        onProgress: (nextProgress) => {
          progress = updateProgressFromManaged(nextProgress);
          emit();
        },
        outputPath: tmpPath,
        payload: {
          checksum: managedChecksum(resolvedChecksum),
          url: nextCandidate.artifact.url
        }
      });
      const digest2 = await hashFile2(tmpPath, resolvedChecksum.algorithm);
      if (resolvedChecksum.value == null || digest2.toLowerCase() !== resolvedChecksum.value.toLowerCase()) {
        return await failDownload(createError("checksum-mismatch", "downloaded update checksum did not match release metadata", {
          actual: digest2,
          expected: resolvedChecksum.value
        }));
      }
      const key = releaseKey(nextCandidate, resolvedChecksum);
      const releaseDir = join5(releasesRoot, key);
      if (!containsPath2(opened.root.realRoot, releaseDir)) {
        return await failDownload(createError("download-path-escaped", "resolved release path escaped update root"));
      }
      await writeJson3(join5(stagingDir, "metadata.json"), nextCandidate.metadata);
      await writeJson3(join5(stagingDir, "checksum.json"), resolvedChecksum);
      try {
        await rename5(stagingDir, releaseDir);
      } catch (renameError) {
        return await failDownload(createError("release-promote-failed", renameError instanceof Error ? renameError.message : String(renameError)));
      }
      const releaseRef = {
        arch: nextCandidate.arch,
        artifact: nextCandidate.artifact,
        artifactPath: relative3(opened.root.realRoot, join5(releaseDir, outputName)),
        checksum: resolvedChecksum,
        checksumPath: relative3(opened.root.realRoot, join5(releaseDir, "checksum.json")),
        channel: nextCandidate.channel,
        downloadedAt: now().toISOString(),
        key,
        metadata: nextCandidate.metadata,
        metadataPath: relative3(opened.root.realRoot, join5(releaseDir, "metadata.json")),
        platformKey: nextCandidate.platformKey,
        version: nextCandidate.version
      };
      progress = void 0;
      activeRelease = { path: join5(opened.root.realRoot, releaseRef.artifactPath), ref: releaseRef };
      incomingRelease = null;
      await writeStoreMetadata(opened.root, {
        ...opened.metadata,
        active: releaseRef,
        incoming: void 0,
        installFrozen: false,
        installResult: void 0,
        lastCheckedAt,
        version: STORE_METADATA_VERSION
      });
      const downloaded = setState(DESKTOP_UPDATE_STATES.DOWNLOADED);
      if (config.autoOpen)
        return await installUpdate();
      return downloaded;
    } catch (downloadError) {
      if (stagingDir != null)
        await rm4(stagingDir, { force: true, recursive: true }).catch(() => void 0);
      incomingRelease = null;
      progress = void 0;
      await writeMetadataPatch((current) => ({ ...current, incoming: void 0 }));
      return setState(DESKTOP_UPDATE_STATES.ERROR, desktopDownloadError(downloadError));
    }
  }
  async function writeInstallObservation(attemptedAt) {
    if (config.openDryRun)
      return null;
    if (config.installerObservationRoot == null || config.namespace == null)
      return null;
    if (activeRelease == null)
      return null;
    const artifactType = installerObservationArtifactType(activeRelease.ref.artifact.type);
    if (artifactType == null)
      return null;
    try {
      return await writePendingInstallerObservation({
        arch: activeRelease.ref.arch,
        artifactType,
        attemptedAt,
        channel: activeRelease.ref.channel,
        fromVersion: config.currentVersion,
        namespace: config.namespace,
        platform: config.platform,
        root: config.installerObservationRoot,
        toVersion: activeRelease.ref.version
      });
    } catch (observationError) {
      logger.warn("[open-design updater] failed to write installer observation", observationError);
      return null;
    }
  }
  async function markInstallObservationOpenFailed(observation, failedAt) {
    if (observation == null)
      return;
    try {
      await markInstallerObservationOpenFailed(observation, failedAt);
    } catch (observationError) {
      logger.warn("[open-design updater] failed to update installer observation", observationError);
    }
  }
  async function requestInstallerOpen(resolvedDownload, updateRoot) {
    if (config.platform !== "darwin" && config.platform !== "win32")
      return await openPath(resolvedDownload);
    return await launchInstallerAfterQuit({
      appPid: processPid,
      installerPath: resolvedDownload,
      root: updateRoot,
      timeoutMs: config.platform === "win32" ? WINDOWS_DEFERRED_INSTALLER_TIMEOUT_MS : MAC_DEFERRED_INSTALLER_TIMEOUT_MS
    });
  }
  async function installUpdate() {
    const unsupported = unsupportedStatus();
    if (unsupported != null)
      return unsupported;
    if (installResult != null) {
      installFrozen = true;
      return snapshot();
    }
    if (activeRelease == null) {
      const restored = await restoreStoreState();
      if (restored == null || activeRelease == null) {
        return setState(DESKTOP_UPDATE_STATES.ERROR, createError("update-not-downloaded", "no downloaded update package is available"));
      }
    }
    const opened = await openStore();
    if (!opened.ok)
      return opened.status;
    const resolvedDownload = activeRelease.path;
    if (!containsPath2(opened.root.realRoot, resolvedDownload)) {
      return setState(DESKTOP_UPDATE_STATES.ERROR, createError("download-path-escaped", "download path is outside the update root"));
    }
    setState(DESKTOP_UPDATE_STATES.INSTALLING);
    const installChecksum = activeRelease.ref.checksum;
    if (installChecksum?.value == null) {
      return setState(DESKTOP_UPDATE_STATES.ERROR, createError("checksum-missing", "downloaded update checksum is missing"));
    }
    let digest2;
    try {
      digest2 = await hashFile2(resolvedDownload, installChecksum.algorithm);
    } catch (hashError) {
      return setState(DESKTOP_UPDATE_STATES.ERROR, createError("download-unavailable", hashError instanceof Error ? hashError.message : String(hashError)));
    }
    if (digest2.toLowerCase() !== installChecksum.value.toLowerCase()) {
      return setState(DESKTOP_UPDATE_STATES.ERROR, createError("checksum-mismatch", "downloaded update checksum changed before install", {
        actual: digest2,
        expected: installChecksum.value
      }));
    }
    let observation = null;
    try {
      const openedAt = now().toISOString();
      observation = await writeInstallObservation(openedAt);
      if (!config.openDryRun) {
        const openError = await requestInstallerOpen(resolvedDownload, opened.root.realRoot);
        if (openError.length > 0) {
          await markInstallObservationOpenFailed(observation, now().toISOString());
          return setState(DESKTOP_UPDATE_STATES.ERROR, createError("open-installer-failed", openError));
        }
      }
      installResult = {
        ...config.openDryRun ? { dryRun: true } : {},
        openedAt,
        path: resolvedDownload
      };
      installFrozen = true;
      await writeStoreMetadata(opened.root, {
        ...opened.metadata,
        active: activeRelease.ref,
        incoming: void 0,
        installFrozen: true,
        installResult,
        lastCheckedAt,
        version: STORE_METADATA_VERSION
      });
      return setState(DESKTOP_UPDATE_STATES.DOWNLOADED);
    } catch (installError) {
      await markInstallObservationOpenFailed(observation, now().toISOString());
      return setState(DESKTOP_UPDATE_STATES.ERROR, createError("open-installer-failed", installError instanceof Error ? installError.message : String(installError)));
    }
  }
  async function serialized(run) {
    const next = operation.catch(() => void 0).then(run);
    operation = next.catch(() => void 0);
    return await next;
  }
  return {
    checkForUpdates: (options) => serialized(() => checkForCandidate(options)),
    config,
    downloadUpdate: () => serialized(downloadUpdate),
    handle(action) {
      switch (action) {
        case "status":
          return this.status();
        case "check":
          return this.checkForUpdates();
        case "download":
          return this.downloadUpdate();
        case "install":
          return this.installUpdate();
      }
    },
    installUpdate: () => serialized(installUpdate),
    shouldAutoCheck: () => config.enabled && config.autoCheck,
    snapshot,
    async status() {
      const unsupported = unsupportedStatus();
      if (unsupported != null)
        return unsupported;
      if (state === DESKTOP_UPDATE_STATES.IDLE) {
        const restored = await restoreStoreState();
        if (restored != null)
          return restored;
      }
      return snapshot();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }
  };
}
function createDesktopUpdaterScheduler(updater, options) {
  const logger = options.logger ?? console;
  let running = false;
  let timer = null;
  let failureCount = 0;
  let tickRunning = false;
  let unsubscribe = null;
  const clearTimer = () => {
    if (timer == null)
      return;
    clearTimeout(timer);
    timer = null;
  };
  const stop = (_reason) => {
    if (!running && timer == null)
      return;
    running = false;
    clearTimer();
    unsubscribe?.();
    unsubscribe = null;
  };
  const nextDelay = (status) => {
    if (status != null && status.state !== DESKTOP_UPDATE_STATES.ERROR) {
      failureCount = 0;
      return options.intervalMs;
    }
    failureCount += 1;
    const backoff = options.backoffInitialMs * 2 ** Math.max(0, failureCount - 1);
    return Math.min(options.backoffMaxMs, backoff);
  };
  const schedule = (delayMs) => {
    if (!running || timer != null)
      return;
    timer = setTimeout(() => {
      timer = null;
      void tick();
    }, delayMs);
    timer.unref?.();
  };
  const tick = async () => {
    if (!running || tickRunning)
      return;
    tickRunning = true;
    let status = null;
    try {
      status = await updater.checkForUpdates();
      if (status.installResult != null) {
        stop("installer-opened");
        return;
      }
    } catch (error) {
      logger.warn("[open-design updater] scheduled update check failed", error);
    } finally {
      tickRunning = false;
    }
    if (running)
      schedule(nextDelay(status));
  };
  return {
    isRunning: () => running,
    start() {
      if (running)
        return;
      if (updater.snapshot().installResult != null)
        return;
      running = true;
      unsubscribe = updater.subscribe(() => {
        if (updater.snapshot().installResult != null)
          stop("installer-opened");
      });
      schedule(options.initialDelayMs);
    },
    stop
  };
}
var DESKTOP_UPDATE_ENV, DEFAULT_RELEASE_ORIGIN, OWNERSHIP_SENTINEL, STORE_METADATA_FILE, RELEASES_DIR, STAGING_DIR, DOWNLOADS_DIR, BACK_DIR, HELPERS_DIR, UPDATE_ROOT_VERSION, STORE_METADATA_VERSION, BETA_POLL_INTERVAL_MS, STABLE_POLL_INTERVAL_MS, DEFAULT_POLL_INITIAL_DELAY_MS, DEFAULT_POLL_BACKOFF_INITIAL_MS, DEFAULT_POLL_BACKOFF_MAX_MS, MAC_DEFERRED_INSTALLER_TIMEOUT_MS, WINDOWS_DEFERRED_INSTALLER_TIMEOUT_MS, ARTIFACT_DOWNLOAD_MAX_ATTEMPTS, DESKTOP_UPDATE_CHANNEL_VALUES;
var init_updater = __esm({
  "../desktop/dist/main/updater.js"() {
    "use strict";
    init_dist4();
    init_dist();
    init_installer_observations();
    DESKTOP_UPDATE_ENV = Object.freeze({
      ARCH: "OD_UPDATE_ARCH",
      AUTO_CHECK: "OD_UPDATE_AUTO_CHECK",
      AUTO_DOWNLOAD: "OD_UPDATE_AUTO_DOWNLOAD",
      AUTO_OPEN: "OD_UPDATE_AUTO_OPEN",
      CHECK_BACKOFF_INITIAL_MS: "OD_UPDATE_CHECK_BACKOFF_INITIAL_MS",
      CHECK_BACKOFF_MAX_MS: "OD_UPDATE_CHECK_BACKOFF_MAX_MS",
      CHECK_INITIAL_DELAY_MS: "OD_UPDATE_CHECK_INITIAL_DELAY_MS",
      CHECK_INTERVAL_MS: "OD_UPDATE_CHECK_INTERVAL_MS",
      CHANNEL: "OD_UPDATE_CHANNEL",
      CURRENT_VERSION: "OD_UPDATE_CURRENT_VERSION",
      DOWNLOAD_ROOT: "OD_UPDATE_DOWNLOAD_ROOT",
      ENABLED: "OD_UPDATE_ENABLED",
      METADATA_URL: "OD_UPDATE_METADATA_URL",
      MODE: "OD_UPDATE_MODE",
      OPEN_DRY_RUN: "OD_UPDATE_OPEN_DRY_RUN",
      PLATFORM: "OD_UPDATE_PLATFORM"
    });
    DEFAULT_RELEASE_ORIGIN = "https://releases.open-design.ai";
    OWNERSHIP_SENTINEL = ".open-design-updater-root.json";
    STORE_METADATA_FILE = "metadata.json";
    RELEASES_DIR = "releases";
    STAGING_DIR = "staging";
    DOWNLOADS_DIR = "downloads";
    BACK_DIR = ".back";
    HELPERS_DIR = "helpers";
    UPDATE_ROOT_VERSION = 1;
    STORE_METADATA_VERSION = 1;
    BETA_POLL_INTERVAL_MS = 15 * 60 * 1e3;
    STABLE_POLL_INTERVAL_MS = 6 * 60 * 60 * 1e3;
    DEFAULT_POLL_INITIAL_DELAY_MS = 5e3;
    DEFAULT_POLL_BACKOFF_INITIAL_MS = 60 * 1e3;
    DEFAULT_POLL_BACKOFF_MAX_MS = 30 * 60 * 1e3;
    MAC_DEFERRED_INSTALLER_TIMEOUT_MS = 10 * 60 * 1e3;
    WINDOWS_DEFERRED_INSTALLER_TIMEOUT_MS = 10 * 60 * 1e3;
    ARTIFACT_DOWNLOAD_MAX_ATTEMPTS = 3;
    DESKTOP_UPDATE_CHANNEL_VALUES = new Set(Object.values(DESKTOP_UPDATE_CHANNELS));
  }
});

// ../../node_modules/.pnpm/process-nextick-args@2.0.1/node_modules/process-nextick-args/index.js
var require_process_nextick_args = __commonJS({
  "../../node_modules/.pnpm/process-nextick-args@2.0.1/node_modules/process-nextick-args/index.js"(exports, module) {
    "use strict";
    if (typeof process === "undefined" || !process.version || process.version.indexOf("v0.") === 0 || process.version.indexOf("v1.") === 0 && process.version.indexOf("v1.8.") !== 0) {
      module.exports = { nextTick };
    } else {
      module.exports = process;
    }
    function nextTick(fn, arg1, arg2, arg3) {
      if (typeof fn !== "function") {
        throw new TypeError('"callback" argument must be a function');
      }
      var len = arguments.length;
      var args, i;
      switch (len) {
        case 0:
        case 1:
          return process.nextTick(fn);
        case 2:
          return process.nextTick(function afterTickOne() {
            fn.call(null, arg1);
          });
        case 3:
          return process.nextTick(function afterTickTwo() {
            fn.call(null, arg1, arg2);
          });
        case 4:
          return process.nextTick(function afterTickThree() {
            fn.call(null, arg1, arg2, arg3);
          });
        default:
          args = new Array(len - 1);
          i = 0;
          while (i < args.length) {
            args[i++] = arguments[i];
          }
          return process.nextTick(function afterTick() {
            fn.apply(null, args);
          });
      }
    }
  }
});

// ../../node_modules/.pnpm/isarray@1.0.0/node_modules/isarray/index.js
var require_isarray = __commonJS({
  "../../node_modules/.pnpm/isarray@1.0.0/node_modules/isarray/index.js"(exports, module) {
    var toString = {}.toString;
    module.exports = Array.isArray || function(arr) {
      return toString.call(arr) == "[object Array]";
    };
  }
});

// ../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/internal/streams/stream.js
var require_stream = __commonJS({
  "../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/internal/streams/stream.js"(exports, module) {
    module.exports = __require("stream");
  }
});

// ../../node_modules/.pnpm/safe-buffer@5.1.2/node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "../../node_modules/.pnpm/safe-buffer@5.1.2/node_modules/safe-buffer/index.js"(exports, module) {
    var buffer = __require("buffer");
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module.exports = buffer;
    } else {
      copyProps(buffer, exports);
      exports.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// ../../node_modules/.pnpm/core-util-is@1.0.3/node_modules/core-util-is/lib/util.js
var require_util = __commonJS({
  "../../node_modules/.pnpm/core-util-is@1.0.3/node_modules/core-util-is/lib/util.js"(exports) {
    function isArray(arg) {
      if (Array.isArray) {
        return Array.isArray(arg);
      }
      return objectToString(arg) === "[object Array]";
    }
    exports.isArray = isArray;
    function isBoolean(arg) {
      return typeof arg === "boolean";
    }
    exports.isBoolean = isBoolean;
    function isNull(arg) {
      return arg === null;
    }
    exports.isNull = isNull;
    function isNullOrUndefined(arg) {
      return arg == null;
    }
    exports.isNullOrUndefined = isNullOrUndefined;
    function isNumber(arg) {
      return typeof arg === "number";
    }
    exports.isNumber = isNumber;
    function isString(arg) {
      return typeof arg === "string";
    }
    exports.isString = isString;
    function isSymbol(arg) {
      return typeof arg === "symbol";
    }
    exports.isSymbol = isSymbol;
    function isUndefined(arg) {
      return arg === void 0;
    }
    exports.isUndefined = isUndefined;
    function isRegExp(re) {
      return objectToString(re) === "[object RegExp]";
    }
    exports.isRegExp = isRegExp;
    function isObject(arg) {
      return typeof arg === "object" && arg !== null;
    }
    exports.isObject = isObject;
    function isDate(d) {
      return objectToString(d) === "[object Date]";
    }
    exports.isDate = isDate;
    function isError(e) {
      return objectToString(e) === "[object Error]" || e instanceof Error;
    }
    exports.isError = isError;
    function isFunction(arg) {
      return typeof arg === "function";
    }
    exports.isFunction = isFunction;
    function isPrimitive(arg) {
      return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || // ES6 symbol
      typeof arg === "undefined";
    }
    exports.isPrimitive = isPrimitive;
    exports.isBuffer = __require("buffer").Buffer.isBuffer;
    function objectToString(o) {
      return Object.prototype.toString.call(o);
    }
  }
});

// ../../node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS({
  "../../node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits_browser.js"(exports, module) {
    if (typeof Object.create === "function") {
      module.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        }
      };
    } else {
      module.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function() {
          };
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
      };
    }
  }
});

// ../../node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits.js
var require_inherits = __commonJS({
  "../../node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits.js"(exports, module) {
    try {
      util = __require("util");
      if (typeof util.inherits !== "function") throw "";
      module.exports = util.inherits;
    } catch (e) {
      module.exports = require_inherits_browser();
    }
    var util;
  }
});

// ../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/internal/streams/BufferList.js
var require_BufferList = __commonJS({
  "../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/internal/streams/BufferList.js"(exports, module) {
    "use strict";
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var Buffer2 = require_safe_buffer().Buffer;
    var util = __require("util");
    function copyBuffer(src, target, offset) {
      src.copy(target, offset);
    }
    module.exports = (function() {
      function BufferList() {
        _classCallCheck(this, BufferList);
        this.head = null;
        this.tail = null;
        this.length = 0;
      }
      BufferList.prototype.push = function push(v) {
        var entry = { data: v, next: null };
        if (this.length > 0) this.tail.next = entry;
        else this.head = entry;
        this.tail = entry;
        ++this.length;
      };
      BufferList.prototype.unshift = function unshift(v) {
        var entry = { data: v, next: this.head };
        if (this.length === 0) this.tail = entry;
        this.head = entry;
        ++this.length;
      };
      BufferList.prototype.shift = function shift() {
        if (this.length === 0) return;
        var ret = this.head.data;
        if (this.length === 1) this.head = this.tail = null;
        else this.head = this.head.next;
        --this.length;
        return ret;
      };
      BufferList.prototype.clear = function clear() {
        this.head = this.tail = null;
        this.length = 0;
      };
      BufferList.prototype.join = function join10(s) {
        if (this.length === 0) return "";
        var p = this.head;
        var ret = "" + p.data;
        while (p = p.next) {
          ret += s + p.data;
        }
        return ret;
      };
      BufferList.prototype.concat = function concat(n) {
        if (this.length === 0) return Buffer2.alloc(0);
        var ret = Buffer2.allocUnsafe(n >>> 0);
        var p = this.head;
        var i = 0;
        while (p) {
          copyBuffer(p.data, ret, i);
          i += p.data.length;
          p = p.next;
        }
        return ret;
      };
      return BufferList;
    })();
    if (util && util.inspect && util.inspect.custom) {
      module.exports.prototype[util.inspect.custom] = function() {
        var obj = util.inspect({ length: this.length });
        return this.constructor.name + " " + obj;
      };
    }
  }
});

// ../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/internal/streams/destroy.js
var require_destroy = __commonJS({
  "../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/internal/streams/destroy.js"(exports, module) {
    "use strict";
    var pna = require_process_nextick_args();
    function destroy(err, cb) {
      var _this = this;
      var readableDestroyed = this._readableState && this._readableState.destroyed;
      var writableDestroyed = this._writableState && this._writableState.destroyed;
      if (readableDestroyed || writableDestroyed) {
        if (cb) {
          cb(err);
        } else if (err) {
          if (!this._writableState) {
            pna.nextTick(emitErrorNT, this, err);
          } else if (!this._writableState.errorEmitted) {
            this._writableState.errorEmitted = true;
            pna.nextTick(emitErrorNT, this, err);
          }
        }
        return this;
      }
      if (this._readableState) {
        this._readableState.destroyed = true;
      }
      if (this._writableState) {
        this._writableState.destroyed = true;
      }
      this._destroy(err || null, function(err2) {
        if (!cb && err2) {
          if (!_this._writableState) {
            pna.nextTick(emitErrorNT, _this, err2);
          } else if (!_this._writableState.errorEmitted) {
            _this._writableState.errorEmitted = true;
            pna.nextTick(emitErrorNT, _this, err2);
          }
        } else if (cb) {
          cb(err2);
        }
      });
      return this;
    }
    function undestroy() {
      if (this._readableState) {
        this._readableState.destroyed = false;
        this._readableState.reading = false;
        this._readableState.ended = false;
        this._readableState.endEmitted = false;
      }
      if (this._writableState) {
        this._writableState.destroyed = false;
        this._writableState.ended = false;
        this._writableState.ending = false;
        this._writableState.finalCalled = false;
        this._writableState.prefinished = false;
        this._writableState.finished = false;
        this._writableState.errorEmitted = false;
      }
    }
    function emitErrorNT(self2, err) {
      self2.emit("error", err);
    }
    module.exports = {
      destroy,
      undestroy
    };
  }
});

// ../../node_modules/.pnpm/util-deprecate@1.0.2/node_modules/util-deprecate/node.js
var require_node = __commonJS({
  "../../node_modules/.pnpm/util-deprecate@1.0.2/node_modules/util-deprecate/node.js"(exports, module) {
    module.exports = __require("util").deprecate;
  }
});

// ../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/_stream_writable.js
var require_stream_writable = __commonJS({
  "../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/_stream_writable.js"(exports, module) {
    "use strict";
    var pna = require_process_nextick_args();
    module.exports = Writable;
    function CorkedRequest(state) {
      var _this = this;
      this.next = null;
      this.entry = null;
      this.finish = function() {
        onCorkedFinish(_this, state);
      };
    }
    var asyncWrite = !process.browser && ["v0.10", "v0.9."].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
    var Duplex;
    Writable.WritableState = WritableState;
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    var internalUtil = {
      deprecate: require_node()
    };
    var Stream = require_stream();
    var Buffer2 = require_safe_buffer().Buffer;
    var OurUint8Array = (typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
    };
    function _uint8ArrayToBuffer(chunk) {
      return Buffer2.from(chunk);
    }
    function _isUint8Array(obj) {
      return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
    }
    var destroyImpl = require_destroy();
    util.inherits(Writable, Stream);
    function nop() {
    }
    function WritableState(options, stream) {
      Duplex = Duplex || require_stream_duplex();
      options = options || {};
      var isDuplex = stream instanceof Duplex;
      this.objectMode = !!options.objectMode;
      if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;
      var hwm = options.highWaterMark;
      var writableHwm = options.writableHighWaterMark;
      var defaultHwm = this.objectMode ? 16 : 16 * 1024;
      if (hwm || hwm === 0) this.highWaterMark = hwm;
      else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;
      else this.highWaterMark = defaultHwm;
      this.highWaterMark = Math.floor(this.highWaterMark);
      this.finalCalled = false;
      this.needDrain = false;
      this.ending = false;
      this.ended = false;
      this.finished = false;
      this.destroyed = false;
      var noDecode = options.decodeStrings === false;
      this.decodeStrings = !noDecode;
      this.defaultEncoding = options.defaultEncoding || "utf8";
      this.length = 0;
      this.writing = false;
      this.corked = 0;
      this.sync = true;
      this.bufferProcessing = false;
      this.onwrite = function(er) {
        onwrite(stream, er);
      };
      this.writecb = null;
      this.writelen = 0;
      this.bufferedRequest = null;
      this.lastBufferedRequest = null;
      this.pendingcb = 0;
      this.prefinished = false;
      this.errorEmitted = false;
      this.bufferedRequestCount = 0;
      this.corkedRequestsFree = new CorkedRequest(this);
    }
    WritableState.prototype.getBuffer = function getBuffer() {
      var current = this.bufferedRequest;
      var out = [];
      while (current) {
        out.push(current);
        current = current.next;
      }
      return out;
    };
    (function() {
      try {
        Object.defineProperty(WritableState.prototype, "buffer", {
          get: internalUtil.deprecate(function() {
            return this.getBuffer();
          }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
        });
      } catch (_) {
      }
    })();
    var realHasInstance;
    if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
      realHasInstance = Function.prototype[Symbol.hasInstance];
      Object.defineProperty(Writable, Symbol.hasInstance, {
        value: function(object) {
          if (realHasInstance.call(this, object)) return true;
          if (this !== Writable) return false;
          return object && object._writableState instanceof WritableState;
        }
      });
    } else {
      realHasInstance = function(object) {
        return object instanceof this;
      };
    }
    function Writable(options) {
      Duplex = Duplex || require_stream_duplex();
      if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
        return new Writable(options);
      }
      this._writableState = new WritableState(options, this);
      this.writable = true;
      if (options) {
        if (typeof options.write === "function") this._write = options.write;
        if (typeof options.writev === "function") this._writev = options.writev;
        if (typeof options.destroy === "function") this._destroy = options.destroy;
        if (typeof options.final === "function") this._final = options.final;
      }
      Stream.call(this);
    }
    Writable.prototype.pipe = function() {
      this.emit("error", new Error("Cannot pipe, not readable"));
    };
    function writeAfterEnd(stream, cb) {
      var er = new Error("write after end");
      stream.emit("error", er);
      pna.nextTick(cb, er);
    }
    function validChunk(stream, state, chunk, cb) {
      var valid = true;
      var er = false;
      if (chunk === null) {
        er = new TypeError("May not write null values to stream");
      } else if (typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
        er = new TypeError("Invalid non-string/buffer chunk");
      }
      if (er) {
        stream.emit("error", er);
        pna.nextTick(cb, er);
        valid = false;
      }
      return valid;
    }
    Writable.prototype.write = function(chunk, encoding, cb) {
      var state = this._writableState;
      var ret = false;
      var isBuf = !state.objectMode && _isUint8Array(chunk);
      if (isBuf && !Buffer2.isBuffer(chunk)) {
        chunk = _uint8ArrayToBuffer(chunk);
      }
      if (typeof encoding === "function") {
        cb = encoding;
        encoding = null;
      }
      if (isBuf) encoding = "buffer";
      else if (!encoding) encoding = state.defaultEncoding;
      if (typeof cb !== "function") cb = nop;
      if (state.ended) writeAfterEnd(this, cb);
      else if (isBuf || validChunk(this, state, chunk, cb)) {
        state.pendingcb++;
        ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
      }
      return ret;
    };
    Writable.prototype.cork = function() {
      var state = this._writableState;
      state.corked++;
    };
    Writable.prototype.uncork = function() {
      var state = this._writableState;
      if (state.corked) {
        state.corked--;
        if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
      }
    };
    Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
      if (typeof encoding === "string") encoding = encoding.toLowerCase();
      if (!(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1)) throw new TypeError("Unknown encoding: " + encoding);
      this._writableState.defaultEncoding = encoding;
      return this;
    };
    function decodeChunk(state, chunk, encoding) {
      if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
        chunk = Buffer2.from(chunk, encoding);
      }
      return chunk;
    }
    Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function() {
        return this._writableState.highWaterMark;
      }
    });
    function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
      if (!isBuf) {
        var newChunk = decodeChunk(state, chunk, encoding);
        if (chunk !== newChunk) {
          isBuf = true;
          encoding = "buffer";
          chunk = newChunk;
        }
      }
      var len = state.objectMode ? 1 : chunk.length;
      state.length += len;
      var ret = state.length < state.highWaterMark;
      if (!ret) state.needDrain = true;
      if (state.writing || state.corked) {
        var last = state.lastBufferedRequest;
        state.lastBufferedRequest = {
          chunk,
          encoding,
          isBuf,
          callback: cb,
          next: null
        };
        if (last) {
          last.next = state.lastBufferedRequest;
        } else {
          state.bufferedRequest = state.lastBufferedRequest;
        }
        state.bufferedRequestCount += 1;
      } else {
        doWrite(stream, state, false, len, chunk, encoding, cb);
      }
      return ret;
    }
    function doWrite(stream, state, writev, len, chunk, encoding, cb) {
      state.writelen = len;
      state.writecb = cb;
      state.writing = true;
      state.sync = true;
      if (writev) stream._writev(chunk, state.onwrite);
      else stream._write(chunk, encoding, state.onwrite);
      state.sync = false;
    }
    function onwriteError(stream, state, sync, er, cb) {
      --state.pendingcb;
      if (sync) {
        pna.nextTick(cb, er);
        pna.nextTick(finishMaybe, stream, state);
        stream._writableState.errorEmitted = true;
        stream.emit("error", er);
      } else {
        cb(er);
        stream._writableState.errorEmitted = true;
        stream.emit("error", er);
        finishMaybe(stream, state);
      }
    }
    function onwriteStateUpdate(state) {
      state.writing = false;
      state.writecb = null;
      state.length -= state.writelen;
      state.writelen = 0;
    }
    function onwrite(stream, er) {
      var state = stream._writableState;
      var sync = state.sync;
      var cb = state.writecb;
      onwriteStateUpdate(state);
      if (er) onwriteError(stream, state, sync, er, cb);
      else {
        var finished = needFinish(state);
        if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
          clearBuffer(stream, state);
        }
        if (sync) {
          asyncWrite(afterWrite, stream, state, finished, cb);
        } else {
          afterWrite(stream, state, finished, cb);
        }
      }
    }
    function afterWrite(stream, state, finished, cb) {
      if (!finished) onwriteDrain(stream, state);
      state.pendingcb--;
      cb();
      finishMaybe(stream, state);
    }
    function onwriteDrain(stream, state) {
      if (state.length === 0 && state.needDrain) {
        state.needDrain = false;
        stream.emit("drain");
      }
    }
    function clearBuffer(stream, state) {
      state.bufferProcessing = true;
      var entry = state.bufferedRequest;
      if (stream._writev && entry && entry.next) {
        var l = state.bufferedRequestCount;
        var buffer = new Array(l);
        var holder = state.corkedRequestsFree;
        holder.entry = entry;
        var count = 0;
        var allBuffers = true;
        while (entry) {
          buffer[count] = entry;
          if (!entry.isBuf) allBuffers = false;
          entry = entry.next;
          count += 1;
        }
        buffer.allBuffers = allBuffers;
        doWrite(stream, state, true, state.length, buffer, "", holder.finish);
        state.pendingcb++;
        state.lastBufferedRequest = null;
        if (holder.next) {
          state.corkedRequestsFree = holder.next;
          holder.next = null;
        } else {
          state.corkedRequestsFree = new CorkedRequest(state);
        }
        state.bufferedRequestCount = 0;
      } else {
        while (entry) {
          var chunk = entry.chunk;
          var encoding = entry.encoding;
          var cb = entry.callback;
          var len = state.objectMode ? 1 : chunk.length;
          doWrite(stream, state, false, len, chunk, encoding, cb);
          entry = entry.next;
          state.bufferedRequestCount--;
          if (state.writing) {
            break;
          }
        }
        if (entry === null) state.lastBufferedRequest = null;
      }
      state.bufferedRequest = entry;
      state.bufferProcessing = false;
    }
    Writable.prototype._write = function(chunk, encoding, cb) {
      cb(new Error("_write() is not implemented"));
    };
    Writable.prototype._writev = null;
    Writable.prototype.end = function(chunk, encoding, cb) {
      var state = this._writableState;
      if (typeof chunk === "function") {
        cb = chunk;
        chunk = null;
        encoding = null;
      } else if (typeof encoding === "function") {
        cb = encoding;
        encoding = null;
      }
      if (chunk !== null && chunk !== void 0) this.write(chunk, encoding);
      if (state.corked) {
        state.corked = 1;
        this.uncork();
      }
      if (!state.ending) endWritable(this, state, cb);
    };
    function needFinish(state) {
      return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
    }
    function callFinal(stream, state) {
      stream._final(function(err) {
        state.pendingcb--;
        if (err) {
          stream.emit("error", err);
        }
        state.prefinished = true;
        stream.emit("prefinish");
        finishMaybe(stream, state);
      });
    }
    function prefinish(stream, state) {
      if (!state.prefinished && !state.finalCalled) {
        if (typeof stream._final === "function") {
          state.pendingcb++;
          state.finalCalled = true;
          pna.nextTick(callFinal, stream, state);
        } else {
          state.prefinished = true;
          stream.emit("prefinish");
        }
      }
    }
    function finishMaybe(stream, state) {
      var need = needFinish(state);
      if (need) {
        prefinish(stream, state);
        if (state.pendingcb === 0) {
          state.finished = true;
          stream.emit("finish");
        }
      }
      return need;
    }
    function endWritable(stream, state, cb) {
      state.ending = true;
      finishMaybe(stream, state);
      if (cb) {
        if (state.finished) pna.nextTick(cb);
        else stream.once("finish", cb);
      }
      state.ended = true;
      stream.writable = false;
    }
    function onCorkedFinish(corkReq, state, err) {
      var entry = corkReq.entry;
      corkReq.entry = null;
      while (entry) {
        var cb = entry.callback;
        state.pendingcb--;
        cb(err);
        entry = entry.next;
      }
      state.corkedRequestsFree.next = corkReq;
    }
    Object.defineProperty(Writable.prototype, "destroyed", {
      get: function() {
        if (this._writableState === void 0) {
          return false;
        }
        return this._writableState.destroyed;
      },
      set: function(value) {
        if (!this._writableState) {
          return;
        }
        this._writableState.destroyed = value;
      }
    });
    Writable.prototype.destroy = destroyImpl.destroy;
    Writable.prototype._undestroy = destroyImpl.undestroy;
    Writable.prototype._destroy = function(err, cb) {
      this.end();
      cb(err);
    };
  }
});

// ../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/_stream_duplex.js
var require_stream_duplex = __commonJS({
  "../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/_stream_duplex.js"(exports, module) {
    "use strict";
    var pna = require_process_nextick_args();
    var objectKeys = Object.keys || function(obj) {
      var keys2 = [];
      for (var key in obj) {
        keys2.push(key);
      }
      return keys2;
    };
    module.exports = Duplex;
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    var Readable2 = require_stream_readable();
    var Writable = require_stream_writable();
    util.inherits(Duplex, Readable2);
    {
      keys = objectKeys(Writable.prototype);
      for (v = 0; v < keys.length; v++) {
        method = keys[v];
        if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
      }
    }
    var keys;
    var method;
    var v;
    function Duplex(options) {
      if (!(this instanceof Duplex)) return new Duplex(options);
      Readable2.call(this, options);
      Writable.call(this, options);
      if (options && options.readable === false) this.readable = false;
      if (options && options.writable === false) this.writable = false;
      this.allowHalfOpen = true;
      if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;
      this.once("end", onend);
    }
    Object.defineProperty(Duplex.prototype, "writableHighWaterMark", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function() {
        return this._writableState.highWaterMark;
      }
    });
    function onend() {
      if (this.allowHalfOpen || this._writableState.ended) return;
      pna.nextTick(onEndNT, this);
    }
    function onEndNT(self2) {
      self2.end();
    }
    Object.defineProperty(Duplex.prototype, "destroyed", {
      get: function() {
        if (this._readableState === void 0 || this._writableState === void 0) {
          return false;
        }
        return this._readableState.destroyed && this._writableState.destroyed;
      },
      set: function(value) {
        if (this._readableState === void 0 || this._writableState === void 0) {
          return;
        }
        this._readableState.destroyed = value;
        this._writableState.destroyed = value;
      }
    });
    Duplex.prototype._destroy = function(err, cb) {
      this.push(null);
      this.end();
      pna.nextTick(cb, err);
    };
  }
});

// ../../node_modules/.pnpm/string_decoder@1.1.1/node_modules/string_decoder/lib/string_decoder.js
var require_string_decoder = __commonJS({
  "../../node_modules/.pnpm/string_decoder@1.1.1/node_modules/string_decoder/lib/string_decoder.js"(exports) {
    "use strict";
    var Buffer2 = require_safe_buffer().Buffer;
    var isEncoding = Buffer2.isEncoding || function(encoding) {
      encoding = "" + encoding;
      switch (encoding && encoding.toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
        case "raw":
          return true;
        default:
          return false;
      }
    };
    function _normalizeEncoding(enc) {
      if (!enc) return "utf8";
      var retried;
      while (true) {
        switch (enc) {
          case "utf8":
          case "utf-8":
            return "utf8";
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return "utf16le";
          case "latin1":
          case "binary":
            return "latin1";
          case "base64":
          case "ascii":
          case "hex":
            return enc;
          default:
            if (retried) return;
            enc = ("" + enc).toLowerCase();
            retried = true;
        }
      }
    }
    function normalizeEncoding(enc) {
      var nenc = _normalizeEncoding(enc);
      if (typeof nenc !== "string" && (Buffer2.isEncoding === isEncoding || !isEncoding(enc))) throw new Error("Unknown encoding: " + enc);
      return nenc || enc;
    }
    exports.StringDecoder = StringDecoder;
    function StringDecoder(encoding) {
      this.encoding = normalizeEncoding(encoding);
      var nb;
      switch (this.encoding) {
        case "utf16le":
          this.text = utf16Text;
          this.end = utf16End;
          nb = 4;
          break;
        case "utf8":
          this.fillLast = utf8FillLast;
          nb = 4;
          break;
        case "base64":
          this.text = base64Text;
          this.end = base64End;
          nb = 3;
          break;
        default:
          this.write = simpleWrite;
          this.end = simpleEnd;
          return;
      }
      this.lastNeed = 0;
      this.lastTotal = 0;
      this.lastChar = Buffer2.allocUnsafe(nb);
    }
    StringDecoder.prototype.write = function(buf) {
      if (buf.length === 0) return "";
      var r;
      var i;
      if (this.lastNeed) {
        r = this.fillLast(buf);
        if (r === void 0) return "";
        i = this.lastNeed;
        this.lastNeed = 0;
      } else {
        i = 0;
      }
      if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
      return r || "";
    };
    StringDecoder.prototype.end = utf8End;
    StringDecoder.prototype.text = utf8Text;
    StringDecoder.prototype.fillLast = function(buf) {
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
      }
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
      this.lastNeed -= buf.length;
    };
    function utf8CheckByte(byte) {
      if (byte <= 127) return 0;
      else if (byte >> 5 === 6) return 2;
      else if (byte >> 4 === 14) return 3;
      else if (byte >> 3 === 30) return 4;
      return byte >> 6 === 2 ? -1 : -2;
    }
    function utf8CheckIncomplete(self2, buf, i) {
      var j = buf.length - 1;
      if (j < i) return 0;
      var nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) self2.lastNeed = nb - 1;
        return nb;
      }
      if (--j < i || nb === -2) return 0;
      nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) self2.lastNeed = nb - 2;
        return nb;
      }
      if (--j < i || nb === -2) return 0;
      nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) {
          if (nb === 2) nb = 0;
          else self2.lastNeed = nb - 3;
        }
        return nb;
      }
      return 0;
    }
    function utf8CheckExtraBytes(self2, buf, p) {
      if ((buf[0] & 192) !== 128) {
        self2.lastNeed = 0;
        return "\uFFFD";
      }
      if (self2.lastNeed > 1 && buf.length > 1) {
        if ((buf[1] & 192) !== 128) {
          self2.lastNeed = 1;
          return "\uFFFD";
        }
        if (self2.lastNeed > 2 && buf.length > 2) {
          if ((buf[2] & 192) !== 128) {
            self2.lastNeed = 2;
            return "\uFFFD";
          }
        }
      }
    }
    function utf8FillLast(buf) {
      var p = this.lastTotal - this.lastNeed;
      var r = utf8CheckExtraBytes(this, buf, p);
      if (r !== void 0) return r;
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, p, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
      }
      buf.copy(this.lastChar, p, 0, buf.length);
      this.lastNeed -= buf.length;
    }
    function utf8Text(buf, i) {
      var total = utf8CheckIncomplete(this, buf, i);
      if (!this.lastNeed) return buf.toString("utf8", i);
      this.lastTotal = total;
      var end = buf.length - (total - this.lastNeed);
      buf.copy(this.lastChar, 0, end);
      return buf.toString("utf8", i, end);
    }
    function utf8End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) return r + "\uFFFD";
      return r;
    }
    function utf16Text(buf, i) {
      if ((buf.length - i) % 2 === 0) {
        var r = buf.toString("utf16le", i);
        if (r) {
          var c = r.charCodeAt(r.length - 1);
          if (c >= 55296 && c <= 56319) {
            this.lastNeed = 2;
            this.lastTotal = 4;
            this.lastChar[0] = buf[buf.length - 2];
            this.lastChar[1] = buf[buf.length - 1];
            return r.slice(0, -1);
          }
        }
        return r;
      }
      this.lastNeed = 1;
      this.lastTotal = 2;
      this.lastChar[0] = buf[buf.length - 1];
      return buf.toString("utf16le", i, buf.length - 1);
    }
    function utf16End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) {
        var end = this.lastTotal - this.lastNeed;
        return r + this.lastChar.toString("utf16le", 0, end);
      }
      return r;
    }
    function base64Text(buf, i) {
      var n = (buf.length - i) % 3;
      if (n === 0) return buf.toString("base64", i);
      this.lastNeed = 3 - n;
      this.lastTotal = 3;
      if (n === 1) {
        this.lastChar[0] = buf[buf.length - 1];
      } else {
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
      }
      return buf.toString("base64", i, buf.length - n);
    }
    function base64End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
      return r;
    }
    function simpleWrite(buf) {
      return buf.toString(this.encoding);
    }
    function simpleEnd(buf) {
      return buf && buf.length ? this.write(buf) : "";
    }
  }
});

// ../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/_stream_readable.js
var require_stream_readable = __commonJS({
  "../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/_stream_readable.js"(exports, module) {
    "use strict";
    var pna = require_process_nextick_args();
    module.exports = Readable2;
    var isArray = require_isarray();
    var Duplex;
    Readable2.ReadableState = ReadableState;
    var EE = __require("events").EventEmitter;
    var EElistenerCount = function(emitter, type2) {
      return emitter.listeners(type2).length;
    };
    var Stream = require_stream();
    var Buffer2 = require_safe_buffer().Buffer;
    var OurUint8Array = (typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
    };
    function _uint8ArrayToBuffer(chunk) {
      return Buffer2.from(chunk);
    }
    function _isUint8Array(obj) {
      return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
    }
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    var debugUtil = __require("util");
    var debug = void 0;
    if (debugUtil && debugUtil.debuglog) {
      debug = debugUtil.debuglog("stream");
    } else {
      debug = function() {
      };
    }
    var BufferList = require_BufferList();
    var destroyImpl = require_destroy();
    var StringDecoder;
    util.inherits(Readable2, Stream);
    var kProxyEvents = ["error", "close", "destroy", "pause", "resume"];
    function prependListener(emitter, event, fn) {
      if (typeof emitter.prependListener === "function") return emitter.prependListener(event, fn);
      if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);
      else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);
      else emitter._events[event] = [fn, emitter._events[event]];
    }
    function ReadableState(options, stream) {
      Duplex = Duplex || require_stream_duplex();
      options = options || {};
      var isDuplex = stream instanceof Duplex;
      this.objectMode = !!options.objectMode;
      if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;
      var hwm = options.highWaterMark;
      var readableHwm = options.readableHighWaterMark;
      var defaultHwm = this.objectMode ? 16 : 16 * 1024;
      if (hwm || hwm === 0) this.highWaterMark = hwm;
      else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;
      else this.highWaterMark = defaultHwm;
      this.highWaterMark = Math.floor(this.highWaterMark);
      this.buffer = new BufferList();
      this.length = 0;
      this.pipes = null;
      this.pipesCount = 0;
      this.flowing = null;
      this.ended = false;
      this.endEmitted = false;
      this.reading = false;
      this.sync = true;
      this.needReadable = false;
      this.emittedReadable = false;
      this.readableListening = false;
      this.resumeScheduled = false;
      this.destroyed = false;
      this.defaultEncoding = options.defaultEncoding || "utf8";
      this.awaitDrain = 0;
      this.readingMore = false;
      this.decoder = null;
      this.encoding = null;
      if (options.encoding) {
        if (!StringDecoder) StringDecoder = require_string_decoder().StringDecoder;
        this.decoder = new StringDecoder(options.encoding);
        this.encoding = options.encoding;
      }
    }
    function Readable2(options) {
      Duplex = Duplex || require_stream_duplex();
      if (!(this instanceof Readable2)) return new Readable2(options);
      this._readableState = new ReadableState(options, this);
      this.readable = true;
      if (options) {
        if (typeof options.read === "function") this._read = options.read;
        if (typeof options.destroy === "function") this._destroy = options.destroy;
      }
      Stream.call(this);
    }
    Object.defineProperty(Readable2.prototype, "destroyed", {
      get: function() {
        if (this._readableState === void 0) {
          return false;
        }
        return this._readableState.destroyed;
      },
      set: function(value) {
        if (!this._readableState) {
          return;
        }
        this._readableState.destroyed = value;
      }
    });
    Readable2.prototype.destroy = destroyImpl.destroy;
    Readable2.prototype._undestroy = destroyImpl.undestroy;
    Readable2.prototype._destroy = function(err, cb) {
      this.push(null);
      cb(err);
    };
    Readable2.prototype.push = function(chunk, encoding) {
      var state = this._readableState;
      var skipChunkCheck;
      if (!state.objectMode) {
        if (typeof chunk === "string") {
          encoding = encoding || state.defaultEncoding;
          if (encoding !== state.encoding) {
            chunk = Buffer2.from(chunk, encoding);
            encoding = "";
          }
          skipChunkCheck = true;
        }
      } else {
        skipChunkCheck = true;
      }
      return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
    };
    Readable2.prototype.unshift = function(chunk) {
      return readableAddChunk(this, chunk, null, true, false);
    };
    function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
      var state = stream._readableState;
      if (chunk === null) {
        state.reading = false;
        onEofChunk(stream, state);
      } else {
        var er;
        if (!skipChunkCheck) er = chunkInvalid(state, chunk);
        if (er) {
          stream.emit("error", er);
        } else if (state.objectMode || chunk && chunk.length > 0) {
          if (typeof chunk !== "string" && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer2.prototype) {
            chunk = _uint8ArrayToBuffer(chunk);
          }
          if (addToFront) {
            if (state.endEmitted) stream.emit("error", new Error("stream.unshift() after end event"));
            else addChunk(stream, state, chunk, true);
          } else if (state.ended) {
            stream.emit("error", new Error("stream.push() after EOF"));
          } else {
            state.reading = false;
            if (state.decoder && !encoding) {
              chunk = state.decoder.write(chunk);
              if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);
              else maybeReadMore(stream, state);
            } else {
              addChunk(stream, state, chunk, false);
            }
          }
        } else if (!addToFront) {
          state.reading = false;
        }
      }
      return needMoreData(state);
    }
    function addChunk(stream, state, chunk, addToFront) {
      if (state.flowing && state.length === 0 && !state.sync) {
        stream.emit("data", chunk);
        stream.read(0);
      } else {
        state.length += state.objectMode ? 1 : chunk.length;
        if (addToFront) state.buffer.unshift(chunk);
        else state.buffer.push(chunk);
        if (state.needReadable) emitReadable(stream);
      }
      maybeReadMore(stream, state);
    }
    function chunkInvalid(state, chunk) {
      var er;
      if (!_isUint8Array(chunk) && typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
        er = new TypeError("Invalid non-string/buffer chunk");
      }
      return er;
    }
    function needMoreData(state) {
      return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
    }
    Readable2.prototype.isPaused = function() {
      return this._readableState.flowing === false;
    };
    Readable2.prototype.setEncoding = function(enc) {
      if (!StringDecoder) StringDecoder = require_string_decoder().StringDecoder;
      this._readableState.decoder = new StringDecoder(enc);
      this._readableState.encoding = enc;
      return this;
    };
    var MAX_HWM = 8388608;
    function computeNewHighWaterMark(n) {
      if (n >= MAX_HWM) {
        n = MAX_HWM;
      } else {
        n--;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        n++;
      }
      return n;
    }
    function howMuchToRead(n, state) {
      if (n <= 0 || state.length === 0 && state.ended) return 0;
      if (state.objectMode) return 1;
      if (n !== n) {
        if (state.flowing && state.length) return state.buffer.head.data.length;
        else return state.length;
      }
      if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
      if (n <= state.length) return n;
      if (!state.ended) {
        state.needReadable = true;
        return 0;
      }
      return state.length;
    }
    Readable2.prototype.read = function(n) {
      debug("read", n);
      n = parseInt(n, 10);
      var state = this._readableState;
      var nOrig = n;
      if (n !== 0) state.emittedReadable = false;
      if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
        debug("read: emitReadable", state.length, state.ended);
        if (state.length === 0 && state.ended) endReadable(this);
        else emitReadable(this);
        return null;
      }
      n = howMuchToRead(n, state);
      if (n === 0 && state.ended) {
        if (state.length === 0) endReadable(this);
        return null;
      }
      var doRead = state.needReadable;
      debug("need readable", doRead);
      if (state.length === 0 || state.length - n < state.highWaterMark) {
        doRead = true;
        debug("length less than watermark", doRead);
      }
      if (state.ended || state.reading) {
        doRead = false;
        debug("reading or ended", doRead);
      } else if (doRead) {
        debug("do read");
        state.reading = true;
        state.sync = true;
        if (state.length === 0) state.needReadable = true;
        this._read(state.highWaterMark);
        state.sync = false;
        if (!state.reading) n = howMuchToRead(nOrig, state);
      }
      var ret;
      if (n > 0) ret = fromList(n, state);
      else ret = null;
      if (ret === null) {
        state.needReadable = true;
        n = 0;
      } else {
        state.length -= n;
      }
      if (state.length === 0) {
        if (!state.ended) state.needReadable = true;
        if (nOrig !== n && state.ended) endReadable(this);
      }
      if (ret !== null) this.emit("data", ret);
      return ret;
    };
    function onEofChunk(stream, state) {
      if (state.ended) return;
      if (state.decoder) {
        var chunk = state.decoder.end();
        if (chunk && chunk.length) {
          state.buffer.push(chunk);
          state.length += state.objectMode ? 1 : chunk.length;
        }
      }
      state.ended = true;
      emitReadable(stream);
    }
    function emitReadable(stream) {
      var state = stream._readableState;
      state.needReadable = false;
      if (!state.emittedReadable) {
        debug("emitReadable", state.flowing);
        state.emittedReadable = true;
        if (state.sync) pna.nextTick(emitReadable_, stream);
        else emitReadable_(stream);
      }
    }
    function emitReadable_(stream) {
      debug("emit readable");
      stream.emit("readable");
      flow(stream);
    }
    function maybeReadMore(stream, state) {
      if (!state.readingMore) {
        state.readingMore = true;
        pna.nextTick(maybeReadMore_, stream, state);
      }
    }
    function maybeReadMore_(stream, state) {
      var len = state.length;
      while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
        debug("maybeReadMore read 0");
        stream.read(0);
        if (len === state.length)
          break;
        else len = state.length;
      }
      state.readingMore = false;
    }
    Readable2.prototype._read = function(n) {
      this.emit("error", new Error("_read() is not implemented"));
    };
    Readable2.prototype.pipe = function(dest, pipeOpts) {
      var src = this;
      var state = this._readableState;
      switch (state.pipesCount) {
        case 0:
          state.pipes = dest;
          break;
        case 1:
          state.pipes = [state.pipes, dest];
          break;
        default:
          state.pipes.push(dest);
          break;
      }
      state.pipesCount += 1;
      debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
      var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
      var endFn = doEnd ? onend : unpipe;
      if (state.endEmitted) pna.nextTick(endFn);
      else src.once("end", endFn);
      dest.on("unpipe", onunpipe);
      function onunpipe(readable, unpipeInfo) {
        debug("onunpipe");
        if (readable === src) {
          if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
            unpipeInfo.hasUnpiped = true;
            cleanup();
          }
        }
      }
      function onend() {
        debug("onend");
        dest.end();
      }
      var ondrain = pipeOnDrain(src);
      dest.on("drain", ondrain);
      var cleanedUp = false;
      function cleanup() {
        debug("cleanup");
        dest.removeListener("close", onclose);
        dest.removeListener("finish", onfinish);
        dest.removeListener("drain", ondrain);
        dest.removeListener("error", onerror);
        dest.removeListener("unpipe", onunpipe);
        src.removeListener("end", onend);
        src.removeListener("end", unpipe);
        src.removeListener("data", ondata);
        cleanedUp = true;
        if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
      }
      var increasedAwaitDrain = false;
      src.on("data", ondata);
      function ondata(chunk) {
        debug("ondata");
        increasedAwaitDrain = false;
        var ret = dest.write(chunk);
        if (false === ret && !increasedAwaitDrain) {
          if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
            debug("false write response, pause", state.awaitDrain);
            state.awaitDrain++;
            increasedAwaitDrain = true;
          }
          src.pause();
        }
      }
      function onerror(er) {
        debug("onerror", er);
        unpipe();
        dest.removeListener("error", onerror);
        if (EElistenerCount(dest, "error") === 0) dest.emit("error", er);
      }
      prependListener(dest, "error", onerror);
      function onclose() {
        dest.removeListener("finish", onfinish);
        unpipe();
      }
      dest.once("close", onclose);
      function onfinish() {
        debug("onfinish");
        dest.removeListener("close", onclose);
        unpipe();
      }
      dest.once("finish", onfinish);
      function unpipe() {
        debug("unpipe");
        src.unpipe(dest);
      }
      dest.emit("pipe", src);
      if (!state.flowing) {
        debug("pipe resume");
        src.resume();
      }
      return dest;
    };
    function pipeOnDrain(src) {
      return function() {
        var state = src._readableState;
        debug("pipeOnDrain", state.awaitDrain);
        if (state.awaitDrain) state.awaitDrain--;
        if (state.awaitDrain === 0 && EElistenerCount(src, "data")) {
          state.flowing = true;
          flow(src);
        }
      };
    }
    Readable2.prototype.unpipe = function(dest) {
      var state = this._readableState;
      var unpipeInfo = { hasUnpiped: false };
      if (state.pipesCount === 0) return this;
      if (state.pipesCount === 1) {
        if (dest && dest !== state.pipes) return this;
        if (!dest) dest = state.pipes;
        state.pipes = null;
        state.pipesCount = 0;
        state.flowing = false;
        if (dest) dest.emit("unpipe", this, unpipeInfo);
        return this;
      }
      if (!dest) {
        var dests = state.pipes;
        var len = state.pipesCount;
        state.pipes = null;
        state.pipesCount = 0;
        state.flowing = false;
        for (var i = 0; i < len; i++) {
          dests[i].emit("unpipe", this, { hasUnpiped: false });
        }
        return this;
      }
      var index = indexOf(state.pipes, dest);
      if (index === -1) return this;
      state.pipes.splice(index, 1);
      state.pipesCount -= 1;
      if (state.pipesCount === 1) state.pipes = state.pipes[0];
      dest.emit("unpipe", this, unpipeInfo);
      return this;
    };
    Readable2.prototype.on = function(ev, fn) {
      var res = Stream.prototype.on.call(this, ev, fn);
      if (ev === "data") {
        if (this._readableState.flowing !== false) this.resume();
      } else if (ev === "readable") {
        var state = this._readableState;
        if (!state.endEmitted && !state.readableListening) {
          state.readableListening = state.needReadable = true;
          state.emittedReadable = false;
          if (!state.reading) {
            pna.nextTick(nReadingNextTick, this);
          } else if (state.length) {
            emitReadable(this);
          }
        }
      }
      return res;
    };
    Readable2.prototype.addListener = Readable2.prototype.on;
    function nReadingNextTick(self2) {
      debug("readable nexttick read 0");
      self2.read(0);
    }
    Readable2.prototype.resume = function() {
      var state = this._readableState;
      if (!state.flowing) {
        debug("resume");
        state.flowing = true;
        resume(this, state);
      }
      return this;
    };
    function resume(stream, state) {
      if (!state.resumeScheduled) {
        state.resumeScheduled = true;
        pna.nextTick(resume_, stream, state);
      }
    }
    function resume_(stream, state) {
      if (!state.reading) {
        debug("resume read 0");
        stream.read(0);
      }
      state.resumeScheduled = false;
      state.awaitDrain = 0;
      stream.emit("resume");
      flow(stream);
      if (state.flowing && !state.reading) stream.read(0);
    }
    Readable2.prototype.pause = function() {
      debug("call pause flowing=%j", this._readableState.flowing);
      if (false !== this._readableState.flowing) {
        debug("pause");
        this._readableState.flowing = false;
        this.emit("pause");
      }
      return this;
    };
    function flow(stream) {
      var state = stream._readableState;
      debug("flow", state.flowing);
      while (state.flowing && stream.read() !== null) {
      }
    }
    Readable2.prototype.wrap = function(stream) {
      var _this = this;
      var state = this._readableState;
      var paused = false;
      stream.on("end", function() {
        debug("wrapped end");
        if (state.decoder && !state.ended) {
          var chunk = state.decoder.end();
          if (chunk && chunk.length) _this.push(chunk);
        }
        _this.push(null);
      });
      stream.on("data", function(chunk) {
        debug("wrapped data");
        if (state.decoder) chunk = state.decoder.write(chunk);
        if (state.objectMode && (chunk === null || chunk === void 0)) return;
        else if (!state.objectMode && (!chunk || !chunk.length)) return;
        var ret = _this.push(chunk);
        if (!ret) {
          paused = true;
          stream.pause();
        }
      });
      for (var i in stream) {
        if (this[i] === void 0 && typeof stream[i] === "function") {
          this[i] = /* @__PURE__ */ (function(method) {
            return function() {
              return stream[method].apply(stream, arguments);
            };
          })(i);
        }
      }
      for (var n = 0; n < kProxyEvents.length; n++) {
        stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
      }
      this._read = function(n2) {
        debug("wrapped _read", n2);
        if (paused) {
          paused = false;
          stream.resume();
        }
      };
      return this;
    };
    Object.defineProperty(Readable2.prototype, "readableHighWaterMark", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function() {
        return this._readableState.highWaterMark;
      }
    });
    Readable2._fromList = fromList;
    function fromList(n, state) {
      if (state.length === 0) return null;
      var ret;
      if (state.objectMode) ret = state.buffer.shift();
      else if (!n || n >= state.length) {
        if (state.decoder) ret = state.buffer.join("");
        else if (state.buffer.length === 1) ret = state.buffer.head.data;
        else ret = state.buffer.concat(state.length);
        state.buffer.clear();
      } else {
        ret = fromListPartial(n, state.buffer, state.decoder);
      }
      return ret;
    }
    function fromListPartial(n, list, hasStrings) {
      var ret;
      if (n < list.head.data.length) {
        ret = list.head.data.slice(0, n);
        list.head.data = list.head.data.slice(n);
      } else if (n === list.head.data.length) {
        ret = list.shift();
      } else {
        ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
      }
      return ret;
    }
    function copyFromBufferString(n, list) {
      var p = list.head;
      var c = 1;
      var ret = p.data;
      n -= ret.length;
      while (p = p.next) {
        var str = p.data;
        var nb = n > str.length ? str.length : n;
        if (nb === str.length) ret += str;
        else ret += str.slice(0, n);
        n -= nb;
        if (n === 0) {
          if (nb === str.length) {
            ++c;
            if (p.next) list.head = p.next;
            else list.head = list.tail = null;
          } else {
            list.head = p;
            p.data = str.slice(nb);
          }
          break;
        }
        ++c;
      }
      list.length -= c;
      return ret;
    }
    function copyFromBuffer(n, list) {
      var ret = Buffer2.allocUnsafe(n);
      var p = list.head;
      var c = 1;
      p.data.copy(ret);
      n -= p.data.length;
      while (p = p.next) {
        var buf = p.data;
        var nb = n > buf.length ? buf.length : n;
        buf.copy(ret, ret.length - n, 0, nb);
        n -= nb;
        if (n === 0) {
          if (nb === buf.length) {
            ++c;
            if (p.next) list.head = p.next;
            else list.head = list.tail = null;
          } else {
            list.head = p;
            p.data = buf.slice(nb);
          }
          break;
        }
        ++c;
      }
      list.length -= c;
      return ret;
    }
    function endReadable(stream) {
      var state = stream._readableState;
      if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');
      if (!state.endEmitted) {
        state.ended = true;
        pna.nextTick(endReadableNT, state, stream);
      }
    }
    function endReadableNT(state, stream) {
      if (!state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.readable = false;
        stream.emit("end");
      }
    }
    function indexOf(xs, x) {
      for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x) return i;
      }
      return -1;
    }
  }
});

// ../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/_stream_transform.js
var require_stream_transform = __commonJS({
  "../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/_stream_transform.js"(exports, module) {
    "use strict";
    module.exports = Transform2;
    var Duplex = require_stream_duplex();
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    util.inherits(Transform2, Duplex);
    function afterTransform(er, data) {
      var ts = this._transformState;
      ts.transforming = false;
      var cb = ts.writecb;
      if (!cb) {
        return this.emit("error", new Error("write callback called multiple times"));
      }
      ts.writechunk = null;
      ts.writecb = null;
      if (data != null)
        this.push(data);
      cb(er);
      var rs = this._readableState;
      rs.reading = false;
      if (rs.needReadable || rs.length < rs.highWaterMark) {
        this._read(rs.highWaterMark);
      }
    }
    function Transform2(options) {
      if (!(this instanceof Transform2)) return new Transform2(options);
      Duplex.call(this, options);
      this._transformState = {
        afterTransform: afterTransform.bind(this),
        needTransform: false,
        transforming: false,
        writecb: null,
        writechunk: null,
        writeencoding: null
      };
      this._readableState.needReadable = true;
      this._readableState.sync = false;
      if (options) {
        if (typeof options.transform === "function") this._transform = options.transform;
        if (typeof options.flush === "function") this._flush = options.flush;
      }
      this.on("prefinish", prefinish);
    }
    function prefinish() {
      var _this = this;
      if (typeof this._flush === "function") {
        this._flush(function(er, data) {
          done(_this, er, data);
        });
      } else {
        done(this, null, null);
      }
    }
    Transform2.prototype.push = function(chunk, encoding) {
      this._transformState.needTransform = false;
      return Duplex.prototype.push.call(this, chunk, encoding);
    };
    Transform2.prototype._transform = function(chunk, encoding, cb) {
      throw new Error("_transform() is not implemented");
    };
    Transform2.prototype._write = function(chunk, encoding, cb) {
      var ts = this._transformState;
      ts.writecb = cb;
      ts.writechunk = chunk;
      ts.writeencoding = encoding;
      if (!ts.transforming) {
        var rs = this._readableState;
        if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
      }
    };
    Transform2.prototype._read = function(n) {
      var ts = this._transformState;
      if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
        ts.transforming = true;
        this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
      } else {
        ts.needTransform = true;
      }
    };
    Transform2.prototype._destroy = function(err, cb) {
      var _this2 = this;
      Duplex.prototype._destroy.call(this, err, function(err2) {
        cb(err2);
        _this2.emit("close");
      });
    };
    function done(stream, er, data) {
      if (er) return stream.emit("error", er);
      if (data != null)
        stream.push(data);
      if (stream._writableState.length) throw new Error("Calling transform done when ws.length != 0");
      if (stream._transformState.transforming) throw new Error("Calling transform done when still transforming");
      return stream.push(null);
    }
  }
});

// ../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/_stream_passthrough.js
var require_stream_passthrough = __commonJS({
  "../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/_stream_passthrough.js"(exports, module) {
    "use strict";
    module.exports = PassThrough;
    var Transform2 = require_stream_transform();
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    util.inherits(PassThrough, Transform2);
    function PassThrough(options) {
      if (!(this instanceof PassThrough)) return new PassThrough(options);
      Transform2.call(this, options);
    }
    PassThrough.prototype._transform = function(chunk, encoding, cb) {
      cb(null, chunk);
    };
  }
});

// ../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/readable.js
var require_readable = __commonJS({
  "../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/readable.js"(exports, module) {
    var Stream = __require("stream");
    if (process.env.READABLE_STREAM === "disable" && Stream) {
      module.exports = Stream;
      exports = module.exports = Stream.Readable;
      exports.Readable = Stream.Readable;
      exports.Writable = Stream.Writable;
      exports.Duplex = Stream.Duplex;
      exports.Transform = Stream.Transform;
      exports.PassThrough = Stream.PassThrough;
      exports.Stream = Stream;
    } else {
      exports = module.exports = require_stream_readable();
      exports.Stream = Stream || exports;
      exports.Readable = exports;
      exports.Writable = require_stream_writable();
      exports.Duplex = require_stream_duplex();
      exports.Transform = require_stream_transform();
      exports.PassThrough = require_stream_passthrough();
    }
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/support.js
var require_support = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/support.js"(exports) {
    "use strict";
    exports.base64 = true;
    exports.array = true;
    exports.string = true;
    exports.arraybuffer = typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined";
    exports.nodebuffer = typeof Buffer !== "undefined";
    exports.uint8array = typeof Uint8Array !== "undefined";
    if (typeof ArrayBuffer === "undefined") {
      exports.blob = false;
    } else {
      buffer = new ArrayBuffer(0);
      try {
        exports.blob = new Blob([buffer], {
          type: "application/zip"
        }).size === 0;
      } catch (e) {
        try {
          Builder = self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder;
          builder = new Builder();
          builder.append(buffer);
          exports.blob = builder.getBlob("application/zip").size === 0;
        } catch (e2) {
          exports.blob = false;
        }
      }
    }
    var buffer;
    var Builder;
    var builder;
    try {
      exports.nodestream = !!require_readable().Readable;
    } catch (e) {
      exports.nodestream = false;
    }
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/base64.js
var require_base64 = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/base64.js"(exports) {
    "use strict";
    var utils = require_utils();
    var support = require_support();
    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    exports.encode = function(input) {
      var output = [];
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0, len = input.length, remainingBytes = len;
      var isArray = utils.getTypeOf(input) !== "string";
      while (i < input.length) {
        remainingBytes = len - i;
        if (!isArray) {
          chr1 = input.charCodeAt(i++);
          chr2 = i < len ? input.charCodeAt(i++) : 0;
          chr3 = i < len ? input.charCodeAt(i++) : 0;
        } else {
          chr1 = input[i++];
          chr2 = i < len ? input[i++] : 0;
          chr3 = i < len ? input[i++] : 0;
        }
        enc1 = chr1 >> 2;
        enc2 = (chr1 & 3) << 4 | chr2 >> 4;
        enc3 = remainingBytes > 1 ? (chr2 & 15) << 2 | chr3 >> 6 : 64;
        enc4 = remainingBytes > 2 ? chr3 & 63 : 64;
        output.push(_keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4));
      }
      return output.join("");
    };
    exports.decode = function(input) {
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0, resultIndex = 0;
      var dataUrlPrefix = "data:";
      if (input.substr(0, dataUrlPrefix.length) === dataUrlPrefix) {
        throw new Error("Invalid base64 input, it looks like a data url.");
      }
      input = input.replace(/[^A-Za-z0-9+/=]/g, "");
      var totalLength = input.length * 3 / 4;
      if (input.charAt(input.length - 1) === _keyStr.charAt(64)) {
        totalLength--;
      }
      if (input.charAt(input.length - 2) === _keyStr.charAt(64)) {
        totalLength--;
      }
      if (totalLength % 1 !== 0) {
        throw new Error("Invalid base64 input, bad content length.");
      }
      var output;
      if (support.uint8array) {
        output = new Uint8Array(totalLength | 0);
      } else {
        output = new Array(totalLength | 0);
      }
      while (i < input.length) {
        enc1 = _keyStr.indexOf(input.charAt(i++));
        enc2 = _keyStr.indexOf(input.charAt(i++));
        enc3 = _keyStr.indexOf(input.charAt(i++));
        enc4 = _keyStr.indexOf(input.charAt(i++));
        chr1 = enc1 << 2 | enc2 >> 4;
        chr2 = (enc2 & 15) << 4 | enc3 >> 2;
        chr3 = (enc3 & 3) << 6 | enc4;
        output[resultIndex++] = chr1;
        if (enc3 !== 64) {
          output[resultIndex++] = chr2;
        }
        if (enc4 !== 64) {
          output[resultIndex++] = chr3;
        }
      }
      return output;
    };
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/nodejsUtils.js
var require_nodejsUtils = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/nodejsUtils.js"(exports, module) {
    "use strict";
    module.exports = {
      /**
       * True if this is running in Nodejs, will be undefined in a browser.
       * In a browser, browserify won't include this file and the whole module
       * will be resolved an empty object.
       */
      isNode: typeof Buffer !== "undefined",
      /**
       * Create a new nodejs Buffer from an existing content.
       * @param {Object} data the data to pass to the constructor.
       * @param {String} encoding the encoding to use.
       * @return {Buffer} a new Buffer.
       */
      newBufferFrom: function(data, encoding) {
        if (Buffer.from && Buffer.from !== Uint8Array.from) {
          return Buffer.from(data, encoding);
        } else {
          if (typeof data === "number") {
            throw new Error('The "data" argument must not be a number');
          }
          return new Buffer(data, encoding);
        }
      },
      /**
       * Create a new nodejs Buffer with the specified size.
       * @param {Integer} size the size of the buffer.
       * @return {Buffer} a new Buffer.
       */
      allocBuffer: function(size) {
        if (Buffer.alloc) {
          return Buffer.alloc(size);
        } else {
          var buf = new Buffer(size);
          buf.fill(0);
          return buf;
        }
      },
      /**
       * Find out if an object is a Buffer.
       * @param {Object} b the object to test.
       * @return {Boolean} true if the object is a Buffer, false otherwise.
       */
      isBuffer: function(b) {
        return Buffer.isBuffer(b);
      },
      isStream: function(obj) {
        return obj && typeof obj.on === "function" && typeof obj.pause === "function" && typeof obj.resume === "function";
      }
    };
  }
});

// ../../node_modules/.pnpm/immediate@3.0.6/node_modules/immediate/lib/index.js
var require_lib = __commonJS({
  "../../node_modules/.pnpm/immediate@3.0.6/node_modules/immediate/lib/index.js"(exports, module) {
    "use strict";
    var Mutation = global.MutationObserver || global.WebKitMutationObserver;
    var scheduleDrain;
    if (process.browser) {
      if (Mutation) {
        called = 0;
        observer = new Mutation(nextTick);
        element = global.document.createTextNode("");
        observer.observe(element, {
          characterData: true
        });
        scheduleDrain = function() {
          element.data = called = ++called % 2;
        };
      } else if (!global.setImmediate && typeof global.MessageChannel !== "undefined") {
        channel = new global.MessageChannel();
        channel.port1.onmessage = nextTick;
        scheduleDrain = function() {
          channel.port2.postMessage(0);
        };
      } else if ("document" in global && "onreadystatechange" in global.document.createElement("script")) {
        scheduleDrain = function() {
          var scriptEl = global.document.createElement("script");
          scriptEl.onreadystatechange = function() {
            nextTick();
            scriptEl.onreadystatechange = null;
            scriptEl.parentNode.removeChild(scriptEl);
            scriptEl = null;
          };
          global.document.documentElement.appendChild(scriptEl);
        };
      } else {
        scheduleDrain = function() {
          setTimeout(nextTick, 0);
        };
      }
    } else {
      scheduleDrain = function() {
        process.nextTick(nextTick);
      };
    }
    var called;
    var observer;
    var element;
    var channel;
    var draining;
    var queue = [];
    function nextTick() {
      draining = true;
      var i, oldQueue;
      var len = queue.length;
      while (len) {
        oldQueue = queue;
        queue = [];
        i = -1;
        while (++i < len) {
          oldQueue[i]();
        }
        len = queue.length;
      }
      draining = false;
    }
    module.exports = immediate;
    function immediate(task) {
      if (queue.push(task) === 1 && !draining) {
        scheduleDrain();
      }
    }
  }
});

// ../../node_modules/.pnpm/lie@3.3.0/node_modules/lie/lib/index.js
var require_lib2 = __commonJS({
  "../../node_modules/.pnpm/lie@3.3.0/node_modules/lie/lib/index.js"(exports, module) {
    "use strict";
    var immediate = require_lib();
    function INTERNAL() {
    }
    var handlers = {};
    var REJECTED = ["REJECTED"];
    var FULFILLED = ["FULFILLED"];
    var PENDING = ["PENDING"];
    if (!process.browser) {
      UNHANDLED = ["UNHANDLED"];
    }
    var UNHANDLED;
    module.exports = Promise2;
    function Promise2(resolver) {
      if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function");
      }
      this.state = PENDING;
      this.queue = [];
      this.outcome = void 0;
      if (!process.browser) {
        this.handled = UNHANDLED;
      }
      if (resolver !== INTERNAL) {
        safelyResolveThenable(this, resolver);
      }
    }
    Promise2.prototype.finally = function(callback) {
      if (typeof callback !== "function") {
        return this;
      }
      var p = this.constructor;
      return this.then(resolve9, reject2);
      function resolve9(value) {
        function yes() {
          return value;
        }
        return p.resolve(callback()).then(yes);
      }
      function reject2(reason) {
        function no() {
          throw reason;
        }
        return p.resolve(callback()).then(no);
      }
    };
    Promise2.prototype.catch = function(onRejected) {
      return this.then(null, onRejected);
    };
    Promise2.prototype.then = function(onFulfilled, onRejected) {
      if (typeof onFulfilled !== "function" && this.state === FULFILLED || typeof onRejected !== "function" && this.state === REJECTED) {
        return this;
      }
      var promise = new this.constructor(INTERNAL);
      if (!process.browser) {
        if (this.handled === UNHANDLED) {
          this.handled = null;
        }
      }
      if (this.state !== PENDING) {
        var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
        unwrap(promise, resolver, this.outcome);
      } else {
        this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
      }
      return promise;
    };
    function QueueItem(promise, onFulfilled, onRejected) {
      this.promise = promise;
      if (typeof onFulfilled === "function") {
        this.onFulfilled = onFulfilled;
        this.callFulfilled = this.otherCallFulfilled;
      }
      if (typeof onRejected === "function") {
        this.onRejected = onRejected;
        this.callRejected = this.otherCallRejected;
      }
    }
    QueueItem.prototype.callFulfilled = function(value) {
      handlers.resolve(this.promise, value);
    };
    QueueItem.prototype.otherCallFulfilled = function(value) {
      unwrap(this.promise, this.onFulfilled, value);
    };
    QueueItem.prototype.callRejected = function(value) {
      handlers.reject(this.promise, value);
    };
    QueueItem.prototype.otherCallRejected = function(value) {
      unwrap(this.promise, this.onRejected, value);
    };
    function unwrap(promise, func, value) {
      immediate(function() {
        var returnValue;
        try {
          returnValue = func(value);
        } catch (e) {
          return handlers.reject(promise, e);
        }
        if (returnValue === promise) {
          handlers.reject(promise, new TypeError("Cannot resolve promise with itself"));
        } else {
          handlers.resolve(promise, returnValue);
        }
      });
    }
    handlers.resolve = function(self2, value) {
      var result = tryCatch(getThen, value);
      if (result.status === "error") {
        return handlers.reject(self2, result.value);
      }
      var thenable = result.value;
      if (thenable) {
        safelyResolveThenable(self2, thenable);
      } else {
        self2.state = FULFILLED;
        self2.outcome = value;
        var i = -1;
        var len = self2.queue.length;
        while (++i < len) {
          self2.queue[i].callFulfilled(value);
        }
      }
      return self2;
    };
    handlers.reject = function(self2, error) {
      self2.state = REJECTED;
      self2.outcome = error;
      if (!process.browser) {
        if (self2.handled === UNHANDLED) {
          immediate(function() {
            if (self2.handled === UNHANDLED) {
              process.emit("unhandledRejection", error, self2);
            }
          });
        }
      }
      var i = -1;
      var len = self2.queue.length;
      while (++i < len) {
        self2.queue[i].callRejected(error);
      }
      return self2;
    };
    function getThen(obj) {
      var then = obj && obj.then;
      if (obj && (typeof obj === "object" || typeof obj === "function") && typeof then === "function") {
        return function appyThen() {
          then.apply(obj, arguments);
        };
      }
    }
    function safelyResolveThenable(self2, thenable) {
      var called = false;
      function onError(value) {
        if (called) {
          return;
        }
        called = true;
        handlers.reject(self2, value);
      }
      function onSuccess(value) {
        if (called) {
          return;
        }
        called = true;
        handlers.resolve(self2, value);
      }
      function tryToUnwrap() {
        thenable(onSuccess, onError);
      }
      var result = tryCatch(tryToUnwrap);
      if (result.status === "error") {
        onError(result.value);
      }
    }
    function tryCatch(func, value) {
      var out = {};
      try {
        out.value = func(value);
        out.status = "success";
      } catch (e) {
        out.status = "error";
        out.value = e;
      }
      return out;
    }
    Promise2.resolve = resolve8;
    function resolve8(value) {
      if (value instanceof this) {
        return value;
      }
      return handlers.resolve(new this(INTERNAL), value);
    }
    Promise2.reject = reject;
    function reject(reason) {
      var promise = new this(INTERNAL);
      return handlers.reject(promise, reason);
    }
    Promise2.all = all;
    function all(iterable) {
      var self2 = this;
      if (Object.prototype.toString.call(iterable) !== "[object Array]") {
        return this.reject(new TypeError("must be an array"));
      }
      var len = iterable.length;
      var called = false;
      if (!len) {
        return this.resolve([]);
      }
      var values = new Array(len);
      var resolved = 0;
      var i = -1;
      var promise = new this(INTERNAL);
      while (++i < len) {
        allResolver(iterable[i], i);
      }
      return promise;
      function allResolver(value, i2) {
        self2.resolve(value).then(resolveFromAll, function(error) {
          if (!called) {
            called = true;
            handlers.reject(promise, error);
          }
        });
        function resolveFromAll(outValue) {
          values[i2] = outValue;
          if (++resolved === len && !called) {
            called = true;
            handlers.resolve(promise, values);
          }
        }
      }
    }
    Promise2.race = race;
    function race(iterable) {
      var self2 = this;
      if (Object.prototype.toString.call(iterable) !== "[object Array]") {
        return this.reject(new TypeError("must be an array"));
      }
      var len = iterable.length;
      var called = false;
      if (!len) {
        return this.resolve([]);
      }
      var i = -1;
      var promise = new this(INTERNAL);
      while (++i < len) {
        resolver(iterable[i]);
      }
      return promise;
      function resolver(value) {
        self2.resolve(value).then(function(response) {
          if (!called) {
            called = true;
            handlers.resolve(promise, response);
          }
        }, function(error) {
          if (!called) {
            called = true;
            handlers.reject(promise, error);
          }
        });
      }
    }
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/external.js
var require_external = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/external.js"(exports, module) {
    "use strict";
    var ES6Promise = null;
    if (typeof Promise !== "undefined") {
      ES6Promise = Promise;
    } else {
      ES6Promise = require_lib2();
    }
    module.exports = {
      Promise: ES6Promise
    };
  }
});

// ../../node_modules/.pnpm/setimmediate@1.0.5/node_modules/setimmediate/setImmediate.js
var require_setImmediate = __commonJS({
  "../../node_modules/.pnpm/setimmediate@1.0.5/node_modules/setimmediate/setImmediate.js"(exports) {
    (function(global2, undefined2) {
      "use strict";
      if (global2.setImmediate) {
        return;
      }
      var nextHandle = 1;
      var tasksByHandle = {};
      var currentlyRunningATask = false;
      var doc = global2.document;
      var registerImmediate;
      function setImmediate2(callback) {
        if (typeof callback !== "function") {
          callback = new Function("" + callback);
        }
        var args = new Array(arguments.length - 1);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
        }
        var task = { callback, args };
        tasksByHandle[nextHandle] = task;
        registerImmediate(nextHandle);
        return nextHandle++;
      }
      function clearImmediate(handle) {
        delete tasksByHandle[handle];
      }
      function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
          case 0:
            callback();
            break;
          case 1:
            callback(args[0]);
            break;
          case 2:
            callback(args[0], args[1]);
            break;
          case 3:
            callback(args[0], args[1], args[2]);
            break;
          default:
            callback.apply(undefined2, args);
            break;
        }
      }
      function runIfPresent(handle) {
        if (currentlyRunningATask) {
          setTimeout(runIfPresent, 0, handle);
        } else {
          var task = tasksByHandle[handle];
          if (task) {
            currentlyRunningATask = true;
            try {
              run(task);
            } finally {
              clearImmediate(handle);
              currentlyRunningATask = false;
            }
          }
        }
      }
      function installNextTickImplementation() {
        registerImmediate = function(handle) {
          process.nextTick(function() {
            runIfPresent(handle);
          });
        };
      }
      function canUsePostMessage() {
        if (global2.postMessage && !global2.importScripts) {
          var postMessageIsAsynchronous = true;
          var oldOnMessage = global2.onmessage;
          global2.onmessage = function() {
            postMessageIsAsynchronous = false;
          };
          global2.postMessage("", "*");
          global2.onmessage = oldOnMessage;
          return postMessageIsAsynchronous;
        }
      }
      function installPostMessageImplementation() {
        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
          if (event.source === global2 && typeof event.data === "string" && event.data.indexOf(messagePrefix) === 0) {
            runIfPresent(+event.data.slice(messagePrefix.length));
          }
        };
        if (global2.addEventListener) {
          global2.addEventListener("message", onGlobalMessage, false);
        } else {
          global2.attachEvent("onmessage", onGlobalMessage);
        }
        registerImmediate = function(handle) {
          global2.postMessage(messagePrefix + handle, "*");
        };
      }
      function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
          var handle = event.data;
          runIfPresent(handle);
        };
        registerImmediate = function(handle) {
          channel.port2.postMessage(handle);
        };
      }
      function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
          var script = doc.createElement("script");
          script.onreadystatechange = function() {
            runIfPresent(handle);
            script.onreadystatechange = null;
            html.removeChild(script);
            script = null;
          };
          html.appendChild(script);
        };
      }
      function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
          setTimeout(runIfPresent, 0, handle);
        };
      }
      var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global2);
      attachTo = attachTo && attachTo.setTimeout ? attachTo : global2;
      if ({}.toString.call(global2.process) === "[object process]") {
        installNextTickImplementation();
      } else if (canUsePostMessage()) {
        installPostMessageImplementation();
      } else if (global2.MessageChannel) {
        installMessageChannelImplementation();
      } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        installReadyStateChangeImplementation();
      } else {
        installSetTimeoutImplementation();
      }
      attachTo.setImmediate = setImmediate2;
      attachTo.clearImmediate = clearImmediate;
    })(typeof self === "undefined" ? typeof global === "undefined" ? exports : global : self);
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/utils.js
var require_utils = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/utils.js"(exports) {
    "use strict";
    var support = require_support();
    var base64 = require_base64();
    var nodejsUtils = require_nodejsUtils();
    var external = require_external();
    require_setImmediate();
    function string2binary(str) {
      var result = null;
      if (support.uint8array) {
        result = new Uint8Array(str.length);
      } else {
        result = new Array(str.length);
      }
      return stringToArrayLike(str, result);
    }
    exports.newBlob = function(part, type2) {
      exports.checkSupport("blob");
      try {
        return new Blob([part], {
          type: type2
        });
      } catch (e) {
        try {
          var Builder = self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder;
          var builder = new Builder();
          builder.append(part);
          return builder.getBlob(type2);
        } catch (e2) {
          throw new Error("Bug : can't construct the Blob.");
        }
      }
    };
    function identity(input) {
      return input;
    }
    function stringToArrayLike(str, array) {
      for (var i = 0; i < str.length; ++i) {
        array[i] = str.charCodeAt(i) & 255;
      }
      return array;
    }
    var arrayToStringHelper = {
      /**
       * Transform an array of int into a string, chunk by chunk.
       * See the performances notes on arrayLikeToString.
       * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
       * @param {String} type the type of the array.
       * @param {Integer} chunk the chunk size.
       * @return {String} the resulting string.
       * @throws Error if the chunk is too big for the stack.
       */
      stringifyByChunk: function(array, type2, chunk) {
        var result = [], k = 0, len = array.length;
        if (len <= chunk) {
          return String.fromCharCode.apply(null, array);
        }
        while (k < len) {
          if (type2 === "array" || type2 === "nodebuffer") {
            result.push(String.fromCharCode.apply(null, array.slice(k, Math.min(k + chunk, len))));
          } else {
            result.push(String.fromCharCode.apply(null, array.subarray(k, Math.min(k + chunk, len))));
          }
          k += chunk;
        }
        return result.join("");
      },
      /**
       * Call String.fromCharCode on every item in the array.
       * This is the naive implementation, which generate A LOT of intermediate string.
       * This should be used when everything else fail.
       * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
       * @return {String} the result.
       */
      stringifyByChar: function(array) {
        var resultStr = "";
        for (var i = 0; i < array.length; i++) {
          resultStr += String.fromCharCode(array[i]);
        }
        return resultStr;
      },
      applyCanBeUsed: {
        /**
         * true if the browser accepts to use String.fromCharCode on Uint8Array
         */
        uint8array: (function() {
          try {
            return support.uint8array && String.fromCharCode.apply(null, new Uint8Array(1)).length === 1;
          } catch (e) {
            return false;
          }
        })(),
        /**
         * true if the browser accepts to use String.fromCharCode on nodejs Buffer.
         */
        nodebuffer: (function() {
          try {
            return support.nodebuffer && String.fromCharCode.apply(null, nodejsUtils.allocBuffer(1)).length === 1;
          } catch (e) {
            return false;
          }
        })()
      }
    };
    function arrayLikeToString(array) {
      var chunk = 65536, type2 = exports.getTypeOf(array), canUseApply = true;
      if (type2 === "uint8array") {
        canUseApply = arrayToStringHelper.applyCanBeUsed.uint8array;
      } else if (type2 === "nodebuffer") {
        canUseApply = arrayToStringHelper.applyCanBeUsed.nodebuffer;
      }
      if (canUseApply) {
        while (chunk > 1) {
          try {
            return arrayToStringHelper.stringifyByChunk(array, type2, chunk);
          } catch (e) {
            chunk = Math.floor(chunk / 2);
          }
        }
      }
      return arrayToStringHelper.stringifyByChar(array);
    }
    exports.applyFromCharCode = arrayLikeToString;
    function arrayLikeToArrayLike(arrayFrom, arrayTo) {
      for (var i = 0; i < arrayFrom.length; i++) {
        arrayTo[i] = arrayFrom[i];
      }
      return arrayTo;
    }
    var transform = {};
    transform["string"] = {
      "string": identity,
      "array": function(input) {
        return stringToArrayLike(input, new Array(input.length));
      },
      "arraybuffer": function(input) {
        return transform["string"]["uint8array"](input).buffer;
      },
      "uint8array": function(input) {
        return stringToArrayLike(input, new Uint8Array(input.length));
      },
      "nodebuffer": function(input) {
        return stringToArrayLike(input, nodejsUtils.allocBuffer(input.length));
      }
    };
    transform["array"] = {
      "string": arrayLikeToString,
      "array": identity,
      "arraybuffer": function(input) {
        return new Uint8Array(input).buffer;
      },
      "uint8array": function(input) {
        return new Uint8Array(input);
      },
      "nodebuffer": function(input) {
        return nodejsUtils.newBufferFrom(input);
      }
    };
    transform["arraybuffer"] = {
      "string": function(input) {
        return arrayLikeToString(new Uint8Array(input));
      },
      "array": function(input) {
        return arrayLikeToArrayLike(new Uint8Array(input), new Array(input.byteLength));
      },
      "arraybuffer": identity,
      "uint8array": function(input) {
        return new Uint8Array(input);
      },
      "nodebuffer": function(input) {
        return nodejsUtils.newBufferFrom(new Uint8Array(input));
      }
    };
    transform["uint8array"] = {
      "string": arrayLikeToString,
      "array": function(input) {
        return arrayLikeToArrayLike(input, new Array(input.length));
      },
      "arraybuffer": function(input) {
        return input.buffer;
      },
      "uint8array": identity,
      "nodebuffer": function(input) {
        return nodejsUtils.newBufferFrom(input);
      }
    };
    transform["nodebuffer"] = {
      "string": arrayLikeToString,
      "array": function(input) {
        return arrayLikeToArrayLike(input, new Array(input.length));
      },
      "arraybuffer": function(input) {
        return transform["nodebuffer"]["uint8array"](input).buffer;
      },
      "uint8array": function(input) {
        return arrayLikeToArrayLike(input, new Uint8Array(input.length));
      },
      "nodebuffer": identity
    };
    exports.transformTo = function(outputType, input) {
      if (!input) {
        input = "";
      }
      if (!outputType) {
        return input;
      }
      exports.checkSupport(outputType);
      var inputType = exports.getTypeOf(input);
      var result = transform[inputType][outputType](input);
      return result;
    };
    exports.resolve = function(path) {
      var parts = path.split("/");
      var result = [];
      for (var index = 0; index < parts.length; index++) {
        var part = parts[index];
        if (part === "." || part === "" && index !== 0 && index !== parts.length - 1) {
          continue;
        } else if (part === "..") {
          result.pop();
        } else {
          result.push(part);
        }
      }
      return result.join("/");
    };
    exports.getTypeOf = function(input) {
      if (typeof input === "string") {
        return "string";
      }
      if (Object.prototype.toString.call(input) === "[object Array]") {
        return "array";
      }
      if (support.nodebuffer && nodejsUtils.isBuffer(input)) {
        return "nodebuffer";
      }
      if (support.uint8array && input instanceof Uint8Array) {
        return "uint8array";
      }
      if (support.arraybuffer && input instanceof ArrayBuffer) {
        return "arraybuffer";
      }
    };
    exports.checkSupport = function(type2) {
      var supported = support[type2.toLowerCase()];
      if (!supported) {
        throw new Error(type2 + " is not supported by this platform");
      }
    };
    exports.MAX_VALUE_16BITS = 65535;
    exports.MAX_VALUE_32BITS = -1;
    exports.pretty = function(str) {
      var res = "", code, i;
      for (i = 0; i < (str || "").length; i++) {
        code = str.charCodeAt(i);
        res += "\\x" + (code < 16 ? "0" : "") + code.toString(16).toUpperCase();
      }
      return res;
    };
    exports.delay = function(callback, args, self2) {
      setImmediate(function() {
        callback.apply(self2 || null, args || []);
      });
    };
    exports.inherits = function(ctor, superCtor) {
      var Obj = function() {
      };
      Obj.prototype = superCtor.prototype;
      ctor.prototype = new Obj();
    };
    exports.extend = function() {
      var result = {}, i, attr;
      for (i = 0; i < arguments.length; i++) {
        for (attr in arguments[i]) {
          if (Object.prototype.hasOwnProperty.call(arguments[i], attr) && typeof result[attr] === "undefined") {
            result[attr] = arguments[i][attr];
          }
        }
      }
      return result;
    };
    exports.prepareContent = function(name, inputData, isBinary, isOptimizedBinaryString, isBase64) {
      var promise = external.Promise.resolve(inputData).then(function(data) {
        var isBlob = support.blob && (data instanceof Blob || ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(data)) !== -1);
        if (isBlob && typeof FileReader !== "undefined") {
          return new external.Promise(function(resolve8, reject) {
            var reader = new FileReader();
            reader.onload = function(e) {
              resolve8(e.target.result);
            };
            reader.onerror = function(e) {
              reject(e.target.error);
            };
            reader.readAsArrayBuffer(data);
          });
        } else {
          return data;
        }
      });
      return promise.then(function(data) {
        var dataType = exports.getTypeOf(data);
        if (!dataType) {
          return external.Promise.reject(
            new Error("Can't read the data of '" + name + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?")
          );
        }
        if (dataType === "arraybuffer") {
          data = exports.transformTo("uint8array", data);
        } else if (dataType === "string") {
          if (isBase64) {
            data = base64.decode(data);
          } else if (isBinary) {
            if (isOptimizedBinaryString !== true) {
              data = string2binary(data);
            }
          }
        }
        return data;
      });
    };
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/stream/GenericWorker.js
var require_GenericWorker = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/stream/GenericWorker.js"(exports, module) {
    "use strict";
    function GenericWorker(name) {
      this.name = name || "default";
      this.streamInfo = {};
      this.generatedError = null;
      this.extraStreamInfo = {};
      this.isPaused = true;
      this.isFinished = false;
      this.isLocked = false;
      this._listeners = {
        "data": [],
        "end": [],
        "error": []
      };
      this.previous = null;
    }
    GenericWorker.prototype = {
      /**
       * Push a chunk to the next workers.
       * @param {Object} chunk the chunk to push
       */
      push: function(chunk) {
        this.emit("data", chunk);
      },
      /**
       * End the stream.
       * @return {Boolean} true if this call ended the worker, false otherwise.
       */
      end: function() {
        if (this.isFinished) {
          return false;
        }
        this.flush();
        try {
          this.emit("end");
          this.cleanUp();
          this.isFinished = true;
        } catch (e) {
          this.emit("error", e);
        }
        return true;
      },
      /**
       * End the stream with an error.
       * @param {Error} e the error which caused the premature end.
       * @return {Boolean} true if this call ended the worker with an error, false otherwise.
       */
      error: function(e) {
        if (this.isFinished) {
          return false;
        }
        if (this.isPaused) {
          this.generatedError = e;
        } else {
          this.isFinished = true;
          this.emit("error", e);
          if (this.previous) {
            this.previous.error(e);
          }
          this.cleanUp();
        }
        return true;
      },
      /**
       * Add a callback on an event.
       * @param {String} name the name of the event (data, end, error)
       * @param {Function} listener the function to call when the event is triggered
       * @return {GenericWorker} the current object for chainability
       */
      on: function(name, listener) {
        this._listeners[name].push(listener);
        return this;
      },
      /**
       * Clean any references when a worker is ending.
       */
      cleanUp: function() {
        this.streamInfo = this.generatedError = this.extraStreamInfo = null;
        this._listeners = [];
      },
      /**
       * Trigger an event. This will call registered callback with the provided arg.
       * @param {String} name the name of the event (data, end, error)
       * @param {Object} arg the argument to call the callback with.
       */
      emit: function(name, arg) {
        if (this._listeners[name]) {
          for (var i = 0; i < this._listeners[name].length; i++) {
            this._listeners[name][i].call(this, arg);
          }
        }
      },
      /**
       * Chain a worker with an other.
       * @param {Worker} next the worker receiving events from the current one.
       * @return {worker} the next worker for chainability
       */
      pipe: function(next) {
        return next.registerPrevious(this);
      },
      /**
       * Same as `pipe` in the other direction.
       * Using an API with `pipe(next)` is very easy.
       * Implementing the API with the point of view of the next one registering
       * a source is easier, see the ZipFileWorker.
       * @param {Worker} previous the previous worker, sending events to this one
       * @return {Worker} the current worker for chainability
       */
      registerPrevious: function(previous) {
        if (this.isLocked) {
          throw new Error("The stream '" + this + "' has already been used.");
        }
        this.streamInfo = previous.streamInfo;
        this.mergeStreamInfo();
        this.previous = previous;
        var self2 = this;
        previous.on("data", function(chunk) {
          self2.processChunk(chunk);
        });
        previous.on("end", function() {
          self2.end();
        });
        previous.on("error", function(e) {
          self2.error(e);
        });
        return this;
      },
      /**
       * Pause the stream so it doesn't send events anymore.
       * @return {Boolean} true if this call paused the worker, false otherwise.
       */
      pause: function() {
        if (this.isPaused || this.isFinished) {
          return false;
        }
        this.isPaused = true;
        if (this.previous) {
          this.previous.pause();
        }
        return true;
      },
      /**
       * Resume a paused stream.
       * @return {Boolean} true if this call resumed the worker, false otherwise.
       */
      resume: function() {
        if (!this.isPaused || this.isFinished) {
          return false;
        }
        this.isPaused = false;
        var withError = false;
        if (this.generatedError) {
          this.error(this.generatedError);
          withError = true;
        }
        if (this.previous) {
          this.previous.resume();
        }
        return !withError;
      },
      /**
       * Flush any remaining bytes as the stream is ending.
       */
      flush: function() {
      },
      /**
       * Process a chunk. This is usually the method overridden.
       * @param {Object} chunk the chunk to process.
       */
      processChunk: function(chunk) {
        this.push(chunk);
      },
      /**
       * Add a key/value to be added in the workers chain streamInfo once activated.
       * @param {String} key the key to use
       * @param {Object} value the associated value
       * @return {Worker} the current worker for chainability
       */
      withStreamInfo: function(key, value) {
        this.extraStreamInfo[key] = value;
        this.mergeStreamInfo();
        return this;
      },
      /**
       * Merge this worker's streamInfo into the chain's streamInfo.
       */
      mergeStreamInfo: function() {
        for (var key in this.extraStreamInfo) {
          if (!Object.prototype.hasOwnProperty.call(this.extraStreamInfo, key)) {
            continue;
          }
          this.streamInfo[key] = this.extraStreamInfo[key];
        }
      },
      /**
       * Lock the stream to prevent further updates on the workers chain.
       * After calling this method, all calls to pipe will fail.
       */
      lock: function() {
        if (this.isLocked) {
          throw new Error("The stream '" + this + "' has already been used.");
        }
        this.isLocked = true;
        if (this.previous) {
          this.previous.lock();
        }
      },
      /**
       *
       * Pretty print the workers chain.
       */
      toString: function() {
        var me = "Worker " + this.name;
        if (this.previous) {
          return this.previous + " -> " + me;
        } else {
          return me;
        }
      }
    };
    module.exports = GenericWorker;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/utf8.js
var require_utf8 = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/utf8.js"(exports) {
    "use strict";
    var utils = require_utils();
    var support = require_support();
    var nodejsUtils = require_nodejsUtils();
    var GenericWorker = require_GenericWorker();
    var _utf8len = new Array(256);
    for (i = 0; i < 256; i++) {
      _utf8len[i] = i >= 252 ? 6 : i >= 248 ? 5 : i >= 240 ? 4 : i >= 224 ? 3 : i >= 192 ? 2 : 1;
    }
    var i;
    _utf8len[254] = _utf8len[254] = 1;
    var string2buf = function(str) {
      var buf, c, c2, m_pos, i2, str_len = str.length, buf_len = 0;
      for (m_pos = 0; m_pos < str_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 64512) === 56320) {
            c = 65536 + (c - 55296 << 10) + (c2 - 56320);
            m_pos++;
          }
        }
        buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
      }
      if (support.uint8array) {
        buf = new Uint8Array(buf_len);
      } else {
        buf = new Array(buf_len);
      }
      for (i2 = 0, m_pos = 0; i2 < buf_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 64512) === 56320) {
            c = 65536 + (c - 55296 << 10) + (c2 - 56320);
            m_pos++;
          }
        }
        if (c < 128) {
          buf[i2++] = c;
        } else if (c < 2048) {
          buf[i2++] = 192 | c >>> 6;
          buf[i2++] = 128 | c & 63;
        } else if (c < 65536) {
          buf[i2++] = 224 | c >>> 12;
          buf[i2++] = 128 | c >>> 6 & 63;
          buf[i2++] = 128 | c & 63;
        } else {
          buf[i2++] = 240 | c >>> 18;
          buf[i2++] = 128 | c >>> 12 & 63;
          buf[i2++] = 128 | c >>> 6 & 63;
          buf[i2++] = 128 | c & 63;
        }
      }
      return buf;
    };
    var utf8border = function(buf, max) {
      var pos;
      max = max || buf.length;
      if (max > buf.length) {
        max = buf.length;
      }
      pos = max - 1;
      while (pos >= 0 && (buf[pos] & 192) === 128) {
        pos--;
      }
      if (pos < 0) {
        return max;
      }
      if (pos === 0) {
        return max;
      }
      return pos + _utf8len[buf[pos]] > max ? pos : max;
    };
    var buf2string = function(buf) {
      var i2, out, c, c_len;
      var len = buf.length;
      var utf16buf = new Array(len * 2);
      for (out = 0, i2 = 0; i2 < len; ) {
        c = buf[i2++];
        if (c < 128) {
          utf16buf[out++] = c;
          continue;
        }
        c_len = _utf8len[c];
        if (c_len > 4) {
          utf16buf[out++] = 65533;
          i2 += c_len - 1;
          continue;
        }
        c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
        while (c_len > 1 && i2 < len) {
          c = c << 6 | buf[i2++] & 63;
          c_len--;
        }
        if (c_len > 1) {
          utf16buf[out++] = 65533;
          continue;
        }
        if (c < 65536) {
          utf16buf[out++] = c;
        } else {
          c -= 65536;
          utf16buf[out++] = 55296 | c >> 10 & 1023;
          utf16buf[out++] = 56320 | c & 1023;
        }
      }
      if (utf16buf.length !== out) {
        if (utf16buf.subarray) {
          utf16buf = utf16buf.subarray(0, out);
        } else {
          utf16buf.length = out;
        }
      }
      return utils.applyFromCharCode(utf16buf);
    };
    exports.utf8encode = function utf8encode(str) {
      if (support.nodebuffer) {
        return nodejsUtils.newBufferFrom(str, "utf-8");
      }
      return string2buf(str);
    };
    exports.utf8decode = function utf8decode(buf) {
      if (support.nodebuffer) {
        return utils.transformTo("nodebuffer", buf).toString("utf-8");
      }
      buf = utils.transformTo(support.uint8array ? "uint8array" : "array", buf);
      return buf2string(buf);
    };
    function Utf8DecodeWorker() {
      GenericWorker.call(this, "utf-8 decode");
      this.leftOver = null;
    }
    utils.inherits(Utf8DecodeWorker, GenericWorker);
    Utf8DecodeWorker.prototype.processChunk = function(chunk) {
      var data = utils.transformTo(support.uint8array ? "uint8array" : "array", chunk.data);
      if (this.leftOver && this.leftOver.length) {
        if (support.uint8array) {
          var previousData = data;
          data = new Uint8Array(previousData.length + this.leftOver.length);
          data.set(this.leftOver, 0);
          data.set(previousData, this.leftOver.length);
        } else {
          data = this.leftOver.concat(data);
        }
        this.leftOver = null;
      }
      var nextBoundary = utf8border(data);
      var usableData = data;
      if (nextBoundary !== data.length) {
        if (support.uint8array) {
          usableData = data.subarray(0, nextBoundary);
          this.leftOver = data.subarray(nextBoundary, data.length);
        } else {
          usableData = data.slice(0, nextBoundary);
          this.leftOver = data.slice(nextBoundary, data.length);
        }
      }
      this.push({
        data: exports.utf8decode(usableData),
        meta: chunk.meta
      });
    };
    Utf8DecodeWorker.prototype.flush = function() {
      if (this.leftOver && this.leftOver.length) {
        this.push({
          data: exports.utf8decode(this.leftOver),
          meta: {}
        });
        this.leftOver = null;
      }
    };
    exports.Utf8DecodeWorker = Utf8DecodeWorker;
    function Utf8EncodeWorker() {
      GenericWorker.call(this, "utf-8 encode");
    }
    utils.inherits(Utf8EncodeWorker, GenericWorker);
    Utf8EncodeWorker.prototype.processChunk = function(chunk) {
      this.push({
        data: exports.utf8encode(chunk.data),
        meta: chunk.meta
      });
    };
    exports.Utf8EncodeWorker = Utf8EncodeWorker;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/stream/ConvertWorker.js
var require_ConvertWorker = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/stream/ConvertWorker.js"(exports, module) {
    "use strict";
    var GenericWorker = require_GenericWorker();
    var utils = require_utils();
    function ConvertWorker(destType) {
      GenericWorker.call(this, "ConvertWorker to " + destType);
      this.destType = destType;
    }
    utils.inherits(ConvertWorker, GenericWorker);
    ConvertWorker.prototype.processChunk = function(chunk) {
      this.push({
        data: utils.transformTo(this.destType, chunk.data),
        meta: chunk.meta
      });
    };
    module.exports = ConvertWorker;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/nodejs/NodejsStreamOutputAdapter.js
var require_NodejsStreamOutputAdapter = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/nodejs/NodejsStreamOutputAdapter.js"(exports, module) {
    "use strict";
    var Readable2 = require_readable().Readable;
    var utils = require_utils();
    utils.inherits(NodejsStreamOutputAdapter, Readable2);
    function NodejsStreamOutputAdapter(helper, options, updateCb) {
      Readable2.call(this, options);
      this._helper = helper;
      var self2 = this;
      helper.on("data", function(data, meta) {
        if (!self2.push(data)) {
          self2._helper.pause();
        }
        if (updateCb) {
          updateCb(meta);
        }
      }).on("error", function(e) {
        self2.emit("error", e);
      }).on("end", function() {
        self2.push(null);
      });
    }
    NodejsStreamOutputAdapter.prototype._read = function() {
      this._helper.resume();
    };
    module.exports = NodejsStreamOutputAdapter;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/stream/StreamHelper.js
var require_StreamHelper = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/stream/StreamHelper.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var ConvertWorker = require_ConvertWorker();
    var GenericWorker = require_GenericWorker();
    var base64 = require_base64();
    var support = require_support();
    var external = require_external();
    var NodejsStreamOutputAdapter = null;
    if (support.nodestream) {
      try {
        NodejsStreamOutputAdapter = require_NodejsStreamOutputAdapter();
      } catch (e) {
      }
    }
    function transformZipOutput(type2, content, mimeType) {
      switch (type2) {
        case "blob":
          return utils.newBlob(utils.transformTo("arraybuffer", content), mimeType);
        case "base64":
          return base64.encode(content);
        default:
          return utils.transformTo(type2, content);
      }
    }
    function concat(type2, dataArray) {
      var i, index = 0, res = null, totalLength = 0;
      for (i = 0; i < dataArray.length; i++) {
        totalLength += dataArray[i].length;
      }
      switch (type2) {
        case "string":
          return dataArray.join("");
        case "array":
          return Array.prototype.concat.apply([], dataArray);
        case "uint8array":
          res = new Uint8Array(totalLength);
          for (i = 0; i < dataArray.length; i++) {
            res.set(dataArray[i], index);
            index += dataArray[i].length;
          }
          return res;
        case "nodebuffer":
          return Buffer.concat(dataArray);
        default:
          throw new Error("concat : unsupported type '" + type2 + "'");
      }
    }
    function accumulate(helper, updateCallback) {
      return new external.Promise(function(resolve8, reject) {
        var dataArray = [];
        var chunkType = helper._internalType, resultType = helper._outputType, mimeType = helper._mimeType;
        helper.on("data", function(data, meta) {
          dataArray.push(data);
          if (updateCallback) {
            updateCallback(meta);
          }
        }).on("error", function(err) {
          dataArray = [];
          reject(err);
        }).on("end", function() {
          try {
            var result = transformZipOutput(resultType, concat(chunkType, dataArray), mimeType);
            resolve8(result);
          } catch (e) {
            reject(e);
          }
          dataArray = [];
        }).resume();
      });
    }
    function StreamHelper(worker, outputType, mimeType) {
      var internalType = outputType;
      switch (outputType) {
        case "blob":
        case "arraybuffer":
          internalType = "uint8array";
          break;
        case "base64":
          internalType = "string";
          break;
      }
      try {
        this._internalType = internalType;
        this._outputType = outputType;
        this._mimeType = mimeType;
        utils.checkSupport(internalType);
        this._worker = worker.pipe(new ConvertWorker(internalType));
        worker.lock();
      } catch (e) {
        this._worker = new GenericWorker("error");
        this._worker.error(e);
      }
    }
    StreamHelper.prototype = {
      /**
       * Listen a StreamHelper, accumulate its content and concatenate it into a
       * complete block.
       * @param {Function} updateCb the update callback.
       * @return Promise the promise for the accumulation.
       */
      accumulate: function(updateCb) {
        return accumulate(this, updateCb);
      },
      /**
       * Add a listener on an event triggered on a stream.
       * @param {String} evt the name of the event
       * @param {Function} fn the listener
       * @return {StreamHelper} the current helper.
       */
      on: function(evt, fn) {
        var self2 = this;
        if (evt === "data") {
          this._worker.on(evt, function(chunk) {
            fn.call(self2, chunk.data, chunk.meta);
          });
        } else {
          this._worker.on(evt, function() {
            utils.delay(fn, arguments, self2);
          });
        }
        return this;
      },
      /**
       * Resume the flow of chunks.
       * @return {StreamHelper} the current helper.
       */
      resume: function() {
        utils.delay(this._worker.resume, [], this._worker);
        return this;
      },
      /**
       * Pause the flow of chunks.
       * @return {StreamHelper} the current helper.
       */
      pause: function() {
        this._worker.pause();
        return this;
      },
      /**
       * Return a nodejs stream for this helper.
       * @param {Function} updateCb the update callback.
       * @return {NodejsStreamOutputAdapter} the nodejs stream.
       */
      toNodejsStream: function(updateCb) {
        utils.checkSupport("nodestream");
        if (this._outputType !== "nodebuffer") {
          throw new Error(this._outputType + " is not supported by this method");
        }
        return new NodejsStreamOutputAdapter(this, {
          objectMode: this._outputType !== "nodebuffer"
        }, updateCb);
      }
    };
    module.exports = StreamHelper;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/defaults.js
var require_defaults = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/defaults.js"(exports) {
    "use strict";
    exports.base64 = false;
    exports.binary = false;
    exports.dir = false;
    exports.createFolders = true;
    exports.date = null;
    exports.compression = null;
    exports.compressionOptions = null;
    exports.comment = null;
    exports.unixPermissions = null;
    exports.dosPermissions = null;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/stream/DataWorker.js
var require_DataWorker = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/stream/DataWorker.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var GenericWorker = require_GenericWorker();
    var DEFAULT_BLOCK_SIZE = 16 * 1024;
    function DataWorker(dataP) {
      GenericWorker.call(this, "DataWorker");
      var self2 = this;
      this.dataIsReady = false;
      this.index = 0;
      this.max = 0;
      this.data = null;
      this.type = "";
      this._tickScheduled = false;
      dataP.then(function(data) {
        self2.dataIsReady = true;
        self2.data = data;
        self2.max = data && data.length || 0;
        self2.type = utils.getTypeOf(data);
        if (!self2.isPaused) {
          self2._tickAndRepeat();
        }
      }, function(e) {
        self2.error(e);
      });
    }
    utils.inherits(DataWorker, GenericWorker);
    DataWorker.prototype.cleanUp = function() {
      GenericWorker.prototype.cleanUp.call(this);
      this.data = null;
    };
    DataWorker.prototype.resume = function() {
      if (!GenericWorker.prototype.resume.call(this)) {
        return false;
      }
      if (!this._tickScheduled && this.dataIsReady) {
        this._tickScheduled = true;
        utils.delay(this._tickAndRepeat, [], this);
      }
      return true;
    };
    DataWorker.prototype._tickAndRepeat = function() {
      this._tickScheduled = false;
      if (this.isPaused || this.isFinished) {
        return;
      }
      this._tick();
      if (!this.isFinished) {
        utils.delay(this._tickAndRepeat, [], this);
        this._tickScheduled = true;
      }
    };
    DataWorker.prototype._tick = function() {
      if (this.isPaused || this.isFinished) {
        return false;
      }
      var size = DEFAULT_BLOCK_SIZE;
      var data = null, nextIndex = Math.min(this.max, this.index + size);
      if (this.index >= this.max) {
        return this.end();
      } else {
        switch (this.type) {
          case "string":
            data = this.data.substring(this.index, nextIndex);
            break;
          case "uint8array":
            data = this.data.subarray(this.index, nextIndex);
            break;
          case "array":
          case "nodebuffer":
            data = this.data.slice(this.index, nextIndex);
            break;
        }
        this.index = nextIndex;
        return this.push({
          data,
          meta: {
            percent: this.max ? this.index / this.max * 100 : 0
          }
        });
      }
    };
    module.exports = DataWorker;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/crc32.js
var require_crc32 = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/crc32.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    function makeTable() {
      var c, table = [];
      for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
          c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
        }
        table[n] = c;
      }
      return table;
    }
    var crcTable = makeTable();
    function crc32(crc, buf, len, pos) {
      var t = crcTable, end = pos + len;
      crc = crc ^ -1;
      for (var i = pos; i < end; i++) {
        crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 255];
      }
      return crc ^ -1;
    }
    function crc32str(crc, str, len, pos) {
      var t = crcTable, end = pos + len;
      crc = crc ^ -1;
      for (var i = pos; i < end; i++) {
        crc = crc >>> 8 ^ t[(crc ^ str.charCodeAt(i)) & 255];
      }
      return crc ^ -1;
    }
    module.exports = function crc32wrapper(input, crc) {
      if (typeof input === "undefined" || !input.length) {
        return 0;
      }
      var isArray = utils.getTypeOf(input) !== "string";
      if (isArray) {
        return crc32(crc | 0, input, input.length, 0);
      } else {
        return crc32str(crc | 0, input, input.length, 0);
      }
    };
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/stream/Crc32Probe.js
var require_Crc32Probe = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/stream/Crc32Probe.js"(exports, module) {
    "use strict";
    var GenericWorker = require_GenericWorker();
    var crc32 = require_crc32();
    var utils = require_utils();
    function Crc32Probe() {
      GenericWorker.call(this, "Crc32Probe");
      this.withStreamInfo("crc32", 0);
    }
    utils.inherits(Crc32Probe, GenericWorker);
    Crc32Probe.prototype.processChunk = function(chunk) {
      this.streamInfo.crc32 = crc32(chunk.data, this.streamInfo.crc32 || 0);
      this.push(chunk);
    };
    module.exports = Crc32Probe;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/stream/DataLengthProbe.js
var require_DataLengthProbe = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/stream/DataLengthProbe.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var GenericWorker = require_GenericWorker();
    function DataLengthProbe(propName) {
      GenericWorker.call(this, "DataLengthProbe for " + propName);
      this.propName = propName;
      this.withStreamInfo(propName, 0);
    }
    utils.inherits(DataLengthProbe, GenericWorker);
    DataLengthProbe.prototype.processChunk = function(chunk) {
      if (chunk) {
        var length = this.streamInfo[this.propName] || 0;
        this.streamInfo[this.propName] = length + chunk.data.length;
      }
      GenericWorker.prototype.processChunk.call(this, chunk);
    };
    module.exports = DataLengthProbe;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/compressedObject.js
var require_compressedObject = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/compressedObject.js"(exports, module) {
    "use strict";
    var external = require_external();
    var DataWorker = require_DataWorker();
    var Crc32Probe = require_Crc32Probe();
    var DataLengthProbe = require_DataLengthProbe();
    function CompressedObject(compressedSize, uncompressedSize, crc32, compression, data) {
      this.compressedSize = compressedSize;
      this.uncompressedSize = uncompressedSize;
      this.crc32 = crc32;
      this.compression = compression;
      this.compressedContent = data;
    }
    CompressedObject.prototype = {
      /**
       * Create a worker to get the uncompressed content.
       * @return {GenericWorker} the worker.
       */
      getContentWorker: function() {
        var worker = new DataWorker(external.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new DataLengthProbe("data_length"));
        var that = this;
        worker.on("end", function() {
          if (this.streamInfo["data_length"] !== that.uncompressedSize) {
            throw new Error("Bug : uncompressed data size mismatch");
          }
        });
        return worker;
      },
      /**
       * Create a worker to get the compressed content.
       * @return {GenericWorker} the worker.
       */
      getCompressedWorker: function() {
        return new DataWorker(external.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
      }
    };
    CompressedObject.createWorkerFrom = function(uncompressedWorker, compression, compressionOptions) {
      return uncompressedWorker.pipe(new Crc32Probe()).pipe(new DataLengthProbe("uncompressedSize")).pipe(compression.compressWorker(compressionOptions)).pipe(new DataLengthProbe("compressedSize")).withStreamInfo("compression", compression);
    };
    module.exports = CompressedObject;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/zipObject.js
var require_zipObject = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/zipObject.js"(exports, module) {
    "use strict";
    var StreamHelper = require_StreamHelper();
    var DataWorker = require_DataWorker();
    var utf8 = require_utf8();
    var CompressedObject = require_compressedObject();
    var GenericWorker = require_GenericWorker();
    var ZipObject = function(name, data, options) {
      this.name = name;
      this.dir = options.dir;
      this.date = options.date;
      this.comment = options.comment;
      this.unixPermissions = options.unixPermissions;
      this.dosPermissions = options.dosPermissions;
      this._data = data;
      this._dataBinary = options.binary;
      this.options = {
        compression: options.compression,
        compressionOptions: options.compressionOptions
      };
    };
    ZipObject.prototype = {
      /**
       * Create an internal stream for the content of this object.
       * @param {String} type the type of each chunk.
       * @return StreamHelper the stream.
       */
      internalStream: function(type2) {
        var result = null, outputType = "string";
        try {
          if (!type2) {
            throw new Error("No output type specified.");
          }
          outputType = type2.toLowerCase();
          var askUnicodeString = outputType === "string" || outputType === "text";
          if (outputType === "binarystring" || outputType === "text") {
            outputType = "string";
          }
          result = this._decompressWorker();
          var isUnicodeString = !this._dataBinary;
          if (isUnicodeString && !askUnicodeString) {
            result = result.pipe(new utf8.Utf8EncodeWorker());
          }
          if (!isUnicodeString && askUnicodeString) {
            result = result.pipe(new utf8.Utf8DecodeWorker());
          }
        } catch (e) {
          result = new GenericWorker("error");
          result.error(e);
        }
        return new StreamHelper(result, outputType, "");
      },
      /**
       * Prepare the content in the asked type.
       * @param {String} type the type of the result.
       * @param {Function} onUpdate a function to call on each internal update.
       * @return Promise the promise of the result.
       */
      async: function(type2, onUpdate) {
        return this.internalStream(type2).accumulate(onUpdate);
      },
      /**
       * Prepare the content as a nodejs stream.
       * @param {String} type the type of each chunk.
       * @param {Function} onUpdate a function to call on each internal update.
       * @return Stream the stream.
       */
      nodeStream: function(type2, onUpdate) {
        return this.internalStream(type2 || "nodebuffer").toNodejsStream(onUpdate);
      },
      /**
       * Return a worker for the compressed content.
       * @private
       * @param {Object} compression the compression object to use.
       * @param {Object} compressionOptions the options to use when compressing.
       * @return Worker the worker.
       */
      _compressWorker: function(compression, compressionOptions) {
        if (this._data instanceof CompressedObject && this._data.compression.magic === compression.magic) {
          return this._data.getCompressedWorker();
        } else {
          var result = this._decompressWorker();
          if (!this._dataBinary) {
            result = result.pipe(new utf8.Utf8EncodeWorker());
          }
          return CompressedObject.createWorkerFrom(result, compression, compressionOptions);
        }
      },
      /**
       * Return a worker for the decompressed content.
       * @private
       * @return Worker the worker.
       */
      _decompressWorker: function() {
        if (this._data instanceof CompressedObject) {
          return this._data.getContentWorker();
        } else if (this._data instanceof GenericWorker) {
          return this._data;
        } else {
          return new DataWorker(this._data);
        }
      }
    };
    var removedMethods = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"];
    var removedFn = function() {
      throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
    };
    for (i = 0; i < removedMethods.length; i++) {
      ZipObject.prototype[removedMethods[i]] = removedFn;
    }
    var i;
    module.exports = ZipObject;
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/utils/common.js
var require_common = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/utils/common.js"(exports) {
    "use strict";
    var TYPED_OK = typeof Uint8Array !== "undefined" && typeof Uint16Array !== "undefined" && typeof Int32Array !== "undefined";
    function _has(obj, key) {
      return Object.prototype.hasOwnProperty.call(obj, key);
    }
    exports.assign = function(obj) {
      var sources = Array.prototype.slice.call(arguments, 1);
      while (sources.length) {
        var source = sources.shift();
        if (!source) {
          continue;
        }
        if (typeof source !== "object") {
          throw new TypeError(source + "must be non-object");
        }
        for (var p in source) {
          if (_has(source, p)) {
            obj[p] = source[p];
          }
        }
      }
      return obj;
    };
    exports.shrinkBuf = function(buf, size) {
      if (buf.length === size) {
        return buf;
      }
      if (buf.subarray) {
        return buf.subarray(0, size);
      }
      buf.length = size;
      return buf;
    };
    var fnTyped = {
      arraySet: function(dest, src, src_offs, len, dest_offs) {
        if (src.subarray && dest.subarray) {
          dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
          return;
        }
        for (var i = 0; i < len; i++) {
          dest[dest_offs + i] = src[src_offs + i];
        }
      },
      // Join array of chunks to single array.
      flattenChunks: function(chunks) {
        var i, l, len, pos, chunk, result;
        len = 0;
        for (i = 0, l = chunks.length; i < l; i++) {
          len += chunks[i].length;
        }
        result = new Uint8Array(len);
        pos = 0;
        for (i = 0, l = chunks.length; i < l; i++) {
          chunk = chunks[i];
          result.set(chunk, pos);
          pos += chunk.length;
        }
        return result;
      }
    };
    var fnUntyped = {
      arraySet: function(dest, src, src_offs, len, dest_offs) {
        for (var i = 0; i < len; i++) {
          dest[dest_offs + i] = src[src_offs + i];
        }
      },
      // Join array of chunks to single array.
      flattenChunks: function(chunks) {
        return [].concat.apply([], chunks);
      }
    };
    exports.setTyped = function(on) {
      if (on) {
        exports.Buf8 = Uint8Array;
        exports.Buf16 = Uint16Array;
        exports.Buf32 = Int32Array;
        exports.assign(exports, fnTyped);
      } else {
        exports.Buf8 = Array;
        exports.Buf16 = Array;
        exports.Buf32 = Array;
        exports.assign(exports, fnUntyped);
      }
    };
    exports.setTyped(TYPED_OK);
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/trees.js
var require_trees = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/trees.js"(exports) {
    "use strict";
    var utils = require_common();
    var Z_FIXED = 4;
    var Z_BINARY = 0;
    var Z_TEXT = 1;
    var Z_UNKNOWN = 2;
    function zero(buf) {
      var len = buf.length;
      while (--len >= 0) {
        buf[len] = 0;
      }
    }
    var STORED_BLOCK = 0;
    var STATIC_TREES = 1;
    var DYN_TREES = 2;
    var MIN_MATCH = 3;
    var MAX_MATCH = 258;
    var LENGTH_CODES = 29;
    var LITERALS = 256;
    var L_CODES = LITERALS + 1 + LENGTH_CODES;
    var D_CODES = 30;
    var BL_CODES = 19;
    var HEAP_SIZE = 2 * L_CODES + 1;
    var MAX_BITS = 15;
    var Buf_size = 16;
    var MAX_BL_BITS = 7;
    var END_BLOCK = 256;
    var REP_3_6 = 16;
    var REPZ_3_10 = 17;
    var REPZ_11_138 = 18;
    var extra_lbits = (
      /* extra bits for each length code */
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]
    );
    var extra_dbits = (
      /* extra bits for each distance code */
      [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
    );
    var extra_blbits = (
      /* extra bits for each bit length code */
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]
    );
    var bl_order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
    var DIST_CODE_LEN = 512;
    var static_ltree = new Array((L_CODES + 2) * 2);
    zero(static_ltree);
    var static_dtree = new Array(D_CODES * 2);
    zero(static_dtree);
    var _dist_code = new Array(DIST_CODE_LEN);
    zero(_dist_code);
    var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
    zero(_length_code);
    var base_length = new Array(LENGTH_CODES);
    zero(base_length);
    var base_dist = new Array(D_CODES);
    zero(base_dist);
    function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
      this.static_tree = static_tree;
      this.extra_bits = extra_bits;
      this.extra_base = extra_base;
      this.elems = elems;
      this.max_length = max_length;
      this.has_stree = static_tree && static_tree.length;
    }
    var static_l_desc;
    var static_d_desc;
    var static_bl_desc;
    function TreeDesc(dyn_tree, stat_desc) {
      this.dyn_tree = dyn_tree;
      this.max_code = 0;
      this.stat_desc = stat_desc;
    }
    function d_code(dist) {
      return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
    }
    function put_short(s, w) {
      s.pending_buf[s.pending++] = w & 255;
      s.pending_buf[s.pending++] = w >>> 8 & 255;
    }
    function send_bits(s, value, length) {
      if (s.bi_valid > Buf_size - length) {
        s.bi_buf |= value << s.bi_valid & 65535;
        put_short(s, s.bi_buf);
        s.bi_buf = value >> Buf_size - s.bi_valid;
        s.bi_valid += length - Buf_size;
      } else {
        s.bi_buf |= value << s.bi_valid & 65535;
        s.bi_valid += length;
      }
    }
    function send_code(s, c, tree) {
      send_bits(
        s,
        tree[c * 2],
        tree[c * 2 + 1]
        /*.Len*/
      );
    }
    function bi_reverse(code, len) {
      var res = 0;
      do {
        res |= code & 1;
        code >>>= 1;
        res <<= 1;
      } while (--len > 0);
      return res >>> 1;
    }
    function bi_flush(s) {
      if (s.bi_valid === 16) {
        put_short(s, s.bi_buf);
        s.bi_buf = 0;
        s.bi_valid = 0;
      } else if (s.bi_valid >= 8) {
        s.pending_buf[s.pending++] = s.bi_buf & 255;
        s.bi_buf >>= 8;
        s.bi_valid -= 8;
      }
    }
    function gen_bitlen(s, desc) {
      var tree = desc.dyn_tree;
      var max_code = desc.max_code;
      var stree = desc.stat_desc.static_tree;
      var has_stree = desc.stat_desc.has_stree;
      var extra = desc.stat_desc.extra_bits;
      var base = desc.stat_desc.extra_base;
      var max_length = desc.stat_desc.max_length;
      var h;
      var n, m;
      var bits;
      var xbits;
      var f;
      var overflow = 0;
      for (bits = 0; bits <= MAX_BITS; bits++) {
        s.bl_count[bits] = 0;
      }
      tree[s.heap[s.heap_max] * 2 + 1] = 0;
      for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
        n = s.heap[h];
        bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
        if (bits > max_length) {
          bits = max_length;
          overflow++;
        }
        tree[n * 2 + 1] = bits;
        if (n > max_code) {
          continue;
        }
        s.bl_count[bits]++;
        xbits = 0;
        if (n >= base) {
          xbits = extra[n - base];
        }
        f = tree[n * 2];
        s.opt_len += f * (bits + xbits);
        if (has_stree) {
          s.static_len += f * (stree[n * 2 + 1] + xbits);
        }
      }
      if (overflow === 0) {
        return;
      }
      do {
        bits = max_length - 1;
        while (s.bl_count[bits] === 0) {
          bits--;
        }
        s.bl_count[bits]--;
        s.bl_count[bits + 1] += 2;
        s.bl_count[max_length]--;
        overflow -= 2;
      } while (overflow > 0);
      for (bits = max_length; bits !== 0; bits--) {
        n = s.bl_count[bits];
        while (n !== 0) {
          m = s.heap[--h];
          if (m > max_code) {
            continue;
          }
          if (tree[m * 2 + 1] !== bits) {
            s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
            tree[m * 2 + 1] = bits;
          }
          n--;
        }
      }
    }
    function gen_codes(tree, max_code, bl_count) {
      var next_code = new Array(MAX_BITS + 1);
      var code = 0;
      var bits;
      var n;
      for (bits = 1; bits <= MAX_BITS; bits++) {
        next_code[bits] = code = code + bl_count[bits - 1] << 1;
      }
      for (n = 0; n <= max_code; n++) {
        var len = tree[n * 2 + 1];
        if (len === 0) {
          continue;
        }
        tree[n * 2] = bi_reverse(next_code[len]++, len);
      }
    }
    function tr_static_init() {
      var n;
      var bits;
      var length;
      var code;
      var dist;
      var bl_count = new Array(MAX_BITS + 1);
      length = 0;
      for (code = 0; code < LENGTH_CODES - 1; code++) {
        base_length[code] = length;
        for (n = 0; n < 1 << extra_lbits[code]; n++) {
          _length_code[length++] = code;
        }
      }
      _length_code[length - 1] = code;
      dist = 0;
      for (code = 0; code < 16; code++) {
        base_dist[code] = dist;
        for (n = 0; n < 1 << extra_dbits[code]; n++) {
          _dist_code[dist++] = code;
        }
      }
      dist >>= 7;
      for (; code < D_CODES; code++) {
        base_dist[code] = dist << 7;
        for (n = 0; n < 1 << extra_dbits[code] - 7; n++) {
          _dist_code[256 + dist++] = code;
        }
      }
      for (bits = 0; bits <= MAX_BITS; bits++) {
        bl_count[bits] = 0;
      }
      n = 0;
      while (n <= 143) {
        static_ltree[n * 2 + 1] = 8;
        n++;
        bl_count[8]++;
      }
      while (n <= 255) {
        static_ltree[n * 2 + 1] = 9;
        n++;
        bl_count[9]++;
      }
      while (n <= 279) {
        static_ltree[n * 2 + 1] = 7;
        n++;
        bl_count[7]++;
      }
      while (n <= 287) {
        static_ltree[n * 2 + 1] = 8;
        n++;
        bl_count[8]++;
      }
      gen_codes(static_ltree, L_CODES + 1, bl_count);
      for (n = 0; n < D_CODES; n++) {
        static_dtree[n * 2 + 1] = 5;
        static_dtree[n * 2] = bi_reverse(n, 5);
      }
      static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
      static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);
      static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);
    }
    function init_block(s) {
      var n;
      for (n = 0; n < L_CODES; n++) {
        s.dyn_ltree[n * 2] = 0;
      }
      for (n = 0; n < D_CODES; n++) {
        s.dyn_dtree[n * 2] = 0;
      }
      for (n = 0; n < BL_CODES; n++) {
        s.bl_tree[n * 2] = 0;
      }
      s.dyn_ltree[END_BLOCK * 2] = 1;
      s.opt_len = s.static_len = 0;
      s.last_lit = s.matches = 0;
    }
    function bi_windup(s) {
      if (s.bi_valid > 8) {
        put_short(s, s.bi_buf);
      } else if (s.bi_valid > 0) {
        s.pending_buf[s.pending++] = s.bi_buf;
      }
      s.bi_buf = 0;
      s.bi_valid = 0;
    }
    function copy_block(s, buf, len, header) {
      bi_windup(s);
      if (header) {
        put_short(s, len);
        put_short(s, ~len);
      }
      utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
      s.pending += len;
    }
    function smaller(tree, n, m, depth) {
      var _n2 = n * 2;
      var _m2 = m * 2;
      return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
    }
    function pqdownheap(s, tree, k) {
      var v = s.heap[k];
      var j = k << 1;
      while (j <= s.heap_len) {
        if (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
          j++;
        }
        if (smaller(tree, v, s.heap[j], s.depth)) {
          break;
        }
        s.heap[k] = s.heap[j];
        k = j;
        j <<= 1;
      }
      s.heap[k] = v;
    }
    function compress_block(s, ltree, dtree) {
      var dist;
      var lc;
      var lx = 0;
      var code;
      var extra;
      if (s.last_lit !== 0) {
        do {
          dist = s.pending_buf[s.d_buf + lx * 2] << 8 | s.pending_buf[s.d_buf + lx * 2 + 1];
          lc = s.pending_buf[s.l_buf + lx];
          lx++;
          if (dist === 0) {
            send_code(s, lc, ltree);
          } else {
            code = _length_code[lc];
            send_code(s, code + LITERALS + 1, ltree);
            extra = extra_lbits[code];
            if (extra !== 0) {
              lc -= base_length[code];
              send_bits(s, lc, extra);
            }
            dist--;
            code = d_code(dist);
            send_code(s, code, dtree);
            extra = extra_dbits[code];
            if (extra !== 0) {
              dist -= base_dist[code];
              send_bits(s, dist, extra);
            }
          }
        } while (lx < s.last_lit);
      }
      send_code(s, END_BLOCK, ltree);
    }
    function build_tree(s, desc) {
      var tree = desc.dyn_tree;
      var stree = desc.stat_desc.static_tree;
      var has_stree = desc.stat_desc.has_stree;
      var elems = desc.stat_desc.elems;
      var n, m;
      var max_code = -1;
      var node;
      s.heap_len = 0;
      s.heap_max = HEAP_SIZE;
      for (n = 0; n < elems; n++) {
        if (tree[n * 2] !== 0) {
          s.heap[++s.heap_len] = max_code = n;
          s.depth[n] = 0;
        } else {
          tree[n * 2 + 1] = 0;
        }
      }
      while (s.heap_len < 2) {
        node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
        tree[node * 2] = 1;
        s.depth[node] = 0;
        s.opt_len--;
        if (has_stree) {
          s.static_len -= stree[node * 2 + 1];
        }
      }
      desc.max_code = max_code;
      for (n = s.heap_len >> 1; n >= 1; n--) {
        pqdownheap(s, tree, n);
      }
      node = elems;
      do {
        n = s.heap[
          1
          /*SMALLEST*/
        ];
        s.heap[
          1
          /*SMALLEST*/
        ] = s.heap[s.heap_len--];
        pqdownheap(
          s,
          tree,
          1
          /*SMALLEST*/
        );
        m = s.heap[
          1
          /*SMALLEST*/
        ];
        s.heap[--s.heap_max] = n;
        s.heap[--s.heap_max] = m;
        tree[node * 2] = tree[n * 2] + tree[m * 2];
        s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
        tree[n * 2 + 1] = tree[m * 2 + 1] = node;
        s.heap[
          1
          /*SMALLEST*/
        ] = node++;
        pqdownheap(
          s,
          tree,
          1
          /*SMALLEST*/
        );
      } while (s.heap_len >= 2);
      s.heap[--s.heap_max] = s.heap[
        1
        /*SMALLEST*/
      ];
      gen_bitlen(s, desc);
      gen_codes(tree, max_code, s.bl_count);
    }
    function scan_tree(s, tree, max_code) {
      var n;
      var prevlen = -1;
      var curlen;
      var nextlen = tree[0 * 2 + 1];
      var count = 0;
      var max_count = 7;
      var min_count = 4;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      }
      tree[(max_code + 1) * 2 + 1] = 65535;
      for (n = 0; n <= max_code; n++) {
        curlen = nextlen;
        nextlen = tree[(n + 1) * 2 + 1];
        if (++count < max_count && curlen === nextlen) {
          continue;
        } else if (count < min_count) {
          s.bl_tree[curlen * 2] += count;
        } else if (curlen !== 0) {
          if (curlen !== prevlen) {
            s.bl_tree[curlen * 2]++;
          }
          s.bl_tree[REP_3_6 * 2]++;
        } else if (count <= 10) {
          s.bl_tree[REPZ_3_10 * 2]++;
        } else {
          s.bl_tree[REPZ_11_138 * 2]++;
        }
        count = 0;
        prevlen = curlen;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        } else if (curlen === nextlen) {
          max_count = 6;
          min_count = 3;
        } else {
          max_count = 7;
          min_count = 4;
        }
      }
    }
    function send_tree(s, tree, max_code) {
      var n;
      var prevlen = -1;
      var curlen;
      var nextlen = tree[0 * 2 + 1];
      var count = 0;
      var max_count = 7;
      var min_count = 4;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      }
      for (n = 0; n <= max_code; n++) {
        curlen = nextlen;
        nextlen = tree[(n + 1) * 2 + 1];
        if (++count < max_count && curlen === nextlen) {
          continue;
        } else if (count < min_count) {
          do {
            send_code(s, curlen, s.bl_tree);
          } while (--count !== 0);
        } else if (curlen !== 0) {
          if (curlen !== prevlen) {
            send_code(s, curlen, s.bl_tree);
            count--;
          }
          send_code(s, REP_3_6, s.bl_tree);
          send_bits(s, count - 3, 2);
        } else if (count <= 10) {
          send_code(s, REPZ_3_10, s.bl_tree);
          send_bits(s, count - 3, 3);
        } else {
          send_code(s, REPZ_11_138, s.bl_tree);
          send_bits(s, count - 11, 7);
        }
        count = 0;
        prevlen = curlen;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        } else if (curlen === nextlen) {
          max_count = 6;
          min_count = 3;
        } else {
          max_count = 7;
          min_count = 4;
        }
      }
    }
    function build_bl_tree(s) {
      var max_blindex;
      scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
      scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
      build_tree(s, s.bl_desc);
      for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
        if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
          break;
        }
      }
      s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
      return max_blindex;
    }
    function send_all_trees(s, lcodes, dcodes, blcodes) {
      var rank;
      send_bits(s, lcodes - 257, 5);
      send_bits(s, dcodes - 1, 5);
      send_bits(s, blcodes - 4, 4);
      for (rank = 0; rank < blcodes; rank++) {
        send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1], 3);
      }
      send_tree(s, s.dyn_ltree, lcodes - 1);
      send_tree(s, s.dyn_dtree, dcodes - 1);
    }
    function detect_data_type(s) {
      var black_mask = 4093624447;
      var n;
      for (n = 0; n <= 31; n++, black_mask >>>= 1) {
        if (black_mask & 1 && s.dyn_ltree[n * 2] !== 0) {
          return Z_BINARY;
        }
      }
      if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 || s.dyn_ltree[13 * 2] !== 0) {
        return Z_TEXT;
      }
      for (n = 32; n < LITERALS; n++) {
        if (s.dyn_ltree[n * 2] !== 0) {
          return Z_TEXT;
        }
      }
      return Z_BINARY;
    }
    var static_init_done = false;
    function _tr_init(s) {
      if (!static_init_done) {
        tr_static_init();
        static_init_done = true;
      }
      s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
      s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
      s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
      s.bi_buf = 0;
      s.bi_valid = 0;
      init_block(s);
    }
    function _tr_stored_block(s, buf, stored_len, last) {
      send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
      copy_block(s, buf, stored_len, true);
    }
    function _tr_align(s) {
      send_bits(s, STATIC_TREES << 1, 3);
      send_code(s, END_BLOCK, static_ltree);
      bi_flush(s);
    }
    function _tr_flush_block(s, buf, stored_len, last) {
      var opt_lenb, static_lenb;
      var max_blindex = 0;
      if (s.level > 0) {
        if (s.strm.data_type === Z_UNKNOWN) {
          s.strm.data_type = detect_data_type(s);
        }
        build_tree(s, s.l_desc);
        build_tree(s, s.d_desc);
        max_blindex = build_bl_tree(s);
        opt_lenb = s.opt_len + 3 + 7 >>> 3;
        static_lenb = s.static_len + 3 + 7 >>> 3;
        if (static_lenb <= opt_lenb) {
          opt_lenb = static_lenb;
        }
      } else {
        opt_lenb = static_lenb = stored_len + 5;
      }
      if (stored_len + 4 <= opt_lenb && buf !== -1) {
        _tr_stored_block(s, buf, stored_len, last);
      } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {
        send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
        compress_block(s, static_ltree, static_dtree);
      } else {
        send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
        send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
        compress_block(s, s.dyn_ltree, s.dyn_dtree);
      }
      init_block(s);
      if (last) {
        bi_windup(s);
      }
    }
    function _tr_tally(s, dist, lc) {
      s.pending_buf[s.d_buf + s.last_lit * 2] = dist >>> 8 & 255;
      s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 255;
      s.pending_buf[s.l_buf + s.last_lit] = lc & 255;
      s.last_lit++;
      if (dist === 0) {
        s.dyn_ltree[lc * 2]++;
      } else {
        s.matches++;
        dist--;
        s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]++;
        s.dyn_dtree[d_code(dist) * 2]++;
      }
      return s.last_lit === s.lit_bufsize - 1;
    }
    exports._tr_init = _tr_init;
    exports._tr_stored_block = _tr_stored_block;
    exports._tr_flush_block = _tr_flush_block;
    exports._tr_tally = _tr_tally;
    exports._tr_align = _tr_align;
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/adler32.js
var require_adler32 = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/adler32.js"(exports, module) {
    "use strict";
    function adler32(adler, buf, len, pos) {
      var s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
      while (len !== 0) {
        n = len > 2e3 ? 2e3 : len;
        len -= n;
        do {
          s1 = s1 + buf[pos++] | 0;
          s2 = s2 + s1 | 0;
        } while (--n);
        s1 %= 65521;
        s2 %= 65521;
      }
      return s1 | s2 << 16 | 0;
    }
    module.exports = adler32;
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/crc32.js
var require_crc322 = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/crc32.js"(exports, module) {
    "use strict";
    function makeTable() {
      var c, table = [];
      for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
          c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
        }
        table[n] = c;
      }
      return table;
    }
    var crcTable = makeTable();
    function crc32(crc, buf, len, pos) {
      var t = crcTable, end = pos + len;
      crc ^= -1;
      for (var i = pos; i < end; i++) {
        crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 255];
      }
      return crc ^ -1;
    }
    module.exports = crc32;
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/messages.js
var require_messages = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/messages.js"(exports, module) {
    "use strict";
    module.exports = {
      2: "need dictionary",
      /* Z_NEED_DICT       2  */
      1: "stream end",
      /* Z_STREAM_END      1  */
      0: "",
      /* Z_OK              0  */
      "-1": "file error",
      /* Z_ERRNO         (-1) */
      "-2": "stream error",
      /* Z_STREAM_ERROR  (-2) */
      "-3": "data error",
      /* Z_DATA_ERROR    (-3) */
      "-4": "insufficient memory",
      /* Z_MEM_ERROR     (-4) */
      "-5": "buffer error",
      /* Z_BUF_ERROR     (-5) */
      "-6": "incompatible version"
      /* Z_VERSION_ERROR (-6) */
    };
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/deflate.js
var require_deflate = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/deflate.js"(exports) {
    "use strict";
    var utils = require_common();
    var trees = require_trees();
    var adler32 = require_adler32();
    var crc32 = require_crc322();
    var msg = require_messages();
    var Z_NO_FLUSH = 0;
    var Z_PARTIAL_FLUSH = 1;
    var Z_FULL_FLUSH = 3;
    var Z_FINISH = 4;
    var Z_BLOCK = 5;
    var Z_OK = 0;
    var Z_STREAM_END = 1;
    var Z_STREAM_ERROR = -2;
    var Z_DATA_ERROR = -3;
    var Z_BUF_ERROR = -5;
    var Z_DEFAULT_COMPRESSION = -1;
    var Z_FILTERED = 1;
    var Z_HUFFMAN_ONLY = 2;
    var Z_RLE = 3;
    var Z_FIXED = 4;
    var Z_DEFAULT_STRATEGY = 0;
    var Z_UNKNOWN = 2;
    var Z_DEFLATED = 8;
    var MAX_MEM_LEVEL = 9;
    var MAX_WBITS = 15;
    var DEF_MEM_LEVEL = 8;
    var LENGTH_CODES = 29;
    var LITERALS = 256;
    var L_CODES = LITERALS + 1 + LENGTH_CODES;
    var D_CODES = 30;
    var BL_CODES = 19;
    var HEAP_SIZE = 2 * L_CODES + 1;
    var MAX_BITS = 15;
    var MIN_MATCH = 3;
    var MAX_MATCH = 258;
    var MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;
    var PRESET_DICT = 32;
    var INIT_STATE = 42;
    var EXTRA_STATE = 69;
    var NAME_STATE = 73;
    var COMMENT_STATE = 91;
    var HCRC_STATE = 103;
    var BUSY_STATE = 113;
    var FINISH_STATE = 666;
    var BS_NEED_MORE = 1;
    var BS_BLOCK_DONE = 2;
    var BS_FINISH_STARTED = 3;
    var BS_FINISH_DONE = 4;
    var OS_CODE = 3;
    function err(strm, errorCode4) {
      strm.msg = msg[errorCode4];
      return errorCode4;
    }
    function rank(f) {
      return (f << 1) - (f > 4 ? 9 : 0);
    }
    function zero(buf) {
      var len = buf.length;
      while (--len >= 0) {
        buf[len] = 0;
      }
    }
    function flush_pending(strm) {
      var s = strm.state;
      var len = s.pending;
      if (len > strm.avail_out) {
        len = strm.avail_out;
      }
      if (len === 0) {
        return;
      }
      utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
      strm.next_out += len;
      s.pending_out += len;
      strm.total_out += len;
      strm.avail_out -= len;
      s.pending -= len;
      if (s.pending === 0) {
        s.pending_out = 0;
      }
    }
    function flush_block_only(s, last) {
      trees._tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last);
      s.block_start = s.strstart;
      flush_pending(s.strm);
    }
    function put_byte(s, b) {
      s.pending_buf[s.pending++] = b;
    }
    function putShortMSB(s, b) {
      s.pending_buf[s.pending++] = b >>> 8 & 255;
      s.pending_buf[s.pending++] = b & 255;
    }
    function read_buf(strm, buf, start, size) {
      var len = strm.avail_in;
      if (len > size) {
        len = size;
      }
      if (len === 0) {
        return 0;
      }
      strm.avail_in -= len;
      utils.arraySet(buf, strm.input, strm.next_in, len, start);
      if (strm.state.wrap === 1) {
        strm.adler = adler32(strm.adler, buf, len, start);
      } else if (strm.state.wrap === 2) {
        strm.adler = crc32(strm.adler, buf, len, start);
      }
      strm.next_in += len;
      strm.total_in += len;
      return len;
    }
    function longest_match(s, cur_match) {
      var chain_length = s.max_chain_length;
      var scan = s.strstart;
      var match;
      var len;
      var best_len = s.prev_length;
      var nice_match = s.nice_match;
      var limit = s.strstart > s.w_size - MIN_LOOKAHEAD ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
      var _win = s.window;
      var wmask = s.w_mask;
      var prev = s.prev;
      var strend = s.strstart + MAX_MATCH;
      var scan_end1 = _win[scan + best_len - 1];
      var scan_end = _win[scan + best_len];
      if (s.prev_length >= s.good_match) {
        chain_length >>= 2;
      }
      if (nice_match > s.lookahead) {
        nice_match = s.lookahead;
      }
      do {
        match = cur_match;
        if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) {
          continue;
        }
        scan += 2;
        match++;
        do {
        } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
        len = MAX_MATCH - (strend - scan);
        scan = strend - MAX_MATCH;
        if (len > best_len) {
          s.match_start = cur_match;
          best_len = len;
          if (len >= nice_match) {
            break;
          }
          scan_end1 = _win[scan + best_len - 1];
          scan_end = _win[scan + best_len];
        }
      } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
      if (best_len <= s.lookahead) {
        return best_len;
      }
      return s.lookahead;
    }
    function fill_window(s) {
      var _w_size = s.w_size;
      var p, n, m, more, str;
      do {
        more = s.window_size - s.lookahead - s.strstart;
        if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
          utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
          s.match_start -= _w_size;
          s.strstart -= _w_size;
          s.block_start -= _w_size;
          n = s.hash_size;
          p = n;
          do {
            m = s.head[--p];
            s.head[p] = m >= _w_size ? m - _w_size : 0;
          } while (--n);
          n = _w_size;
          p = n;
          do {
            m = s.prev[--p];
            s.prev[p] = m >= _w_size ? m - _w_size : 0;
          } while (--n);
          more += _w_size;
        }
        if (s.strm.avail_in === 0) {
          break;
        }
        n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
        s.lookahead += n;
        if (s.lookahead + s.insert >= MIN_MATCH) {
          str = s.strstart - s.insert;
          s.ins_h = s.window[str];
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + 1]) & s.hash_mask;
          while (s.insert) {
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;
            s.prev[str & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = str;
            str++;
            s.insert--;
            if (s.lookahead + s.insert < MIN_MATCH) {
              break;
            }
          }
        }
      } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
    }
    function deflate_stored(s, flush) {
      var max_block_size = 65535;
      if (max_block_size > s.pending_buf_size - 5) {
        max_block_size = s.pending_buf_size - 5;
      }
      for (; ; ) {
        if (s.lookahead <= 1) {
          fill_window(s);
          if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        s.strstart += s.lookahead;
        s.lookahead = 0;
        var max_start = s.block_start + max_block_size;
        if (s.strstart === 0 || s.strstart >= max_start) {
          s.lookahead = s.strstart - max_start;
          s.strstart = max_start;
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        if (s.strstart - s.block_start >= s.w_size - MIN_LOOKAHEAD) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      }
      s.insert = 0;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.strstart > s.block_start) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_NEED_MORE;
    }
    function deflate_fast(s, flush) {
      var hash_head;
      var bflush;
      for (; ; ) {
        if (s.lookahead < MIN_LOOKAHEAD) {
          fill_window(s);
          if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        hash_head = 0;
        if (s.lookahead >= MIN_MATCH) {
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
        }
        if (hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
          s.match_length = longest_match(s, hash_head);
        }
        if (s.match_length >= MIN_MATCH) {
          bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);
          s.lookahead -= s.match_length;
          if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
            s.match_length--;
            do {
              s.strstart++;
              s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
            } while (--s.match_length !== 0);
            s.strstart++;
          } else {
            s.strstart += s.match_length;
            s.match_length = 0;
            s.ins_h = s.window[s.strstart];
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + 1]) & s.hash_mask;
          }
        } else {
          bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
          s.lookahead--;
          s.strstart++;
        }
        if (bflush) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      }
      s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_BLOCK_DONE;
    }
    function deflate_slow(s, flush) {
      var hash_head;
      var bflush;
      var max_insert;
      for (; ; ) {
        if (s.lookahead < MIN_LOOKAHEAD) {
          fill_window(s);
          if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        hash_head = 0;
        if (s.lookahead >= MIN_MATCH) {
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
        }
        s.prev_length = s.match_length;
        s.prev_match = s.match_start;
        s.match_length = MIN_MATCH - 1;
        if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
          s.match_length = longest_match(s, hash_head);
          if (s.match_length <= 5 && (s.strategy === Z_FILTERED || s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096)) {
            s.match_length = MIN_MATCH - 1;
          }
        }
        if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
          max_insert = s.strstart + s.lookahead - MIN_MATCH;
          bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
          s.lookahead -= s.prev_length - 1;
          s.prev_length -= 2;
          do {
            if (++s.strstart <= max_insert) {
              s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
            }
          } while (--s.prev_length !== 0);
          s.match_available = 0;
          s.match_length = MIN_MATCH - 1;
          s.strstart++;
          if (bflush) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
        } else if (s.match_available) {
          bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
          if (bflush) {
            flush_block_only(s, false);
          }
          s.strstart++;
          s.lookahead--;
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        } else {
          s.match_available = 1;
          s.strstart++;
          s.lookahead--;
        }
      }
      if (s.match_available) {
        bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
        s.match_available = 0;
      }
      s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_BLOCK_DONE;
    }
    function deflate_rle(s, flush) {
      var bflush;
      var prev;
      var scan, strend;
      var _win = s.window;
      for (; ; ) {
        if (s.lookahead <= MAX_MATCH) {
          fill_window(s);
          if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        s.match_length = 0;
        if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
          scan = s.strstart - 1;
          prev = _win[scan];
          if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
            strend = s.strstart + MAX_MATCH;
            do {
            } while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
            s.match_length = MAX_MATCH - (strend - scan);
            if (s.match_length > s.lookahead) {
              s.match_length = s.lookahead;
            }
          }
        }
        if (s.match_length >= MIN_MATCH) {
          bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);
          s.lookahead -= s.match_length;
          s.strstart += s.match_length;
          s.match_length = 0;
        } else {
          bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
          s.lookahead--;
          s.strstart++;
        }
        if (bflush) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      }
      s.insert = 0;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_BLOCK_DONE;
    }
    function deflate_huff(s, flush) {
      var bflush;
      for (; ; ) {
        if (s.lookahead === 0) {
          fill_window(s);
          if (s.lookahead === 0) {
            if (flush === Z_NO_FLUSH) {
              return BS_NEED_MORE;
            }
            break;
          }
        }
        s.match_length = 0;
        bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
        s.lookahead--;
        s.strstart++;
        if (bflush) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      }
      s.insert = 0;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_BLOCK_DONE;
    }
    function Config(good_length, max_lazy, nice_length, max_chain, func) {
      this.good_length = good_length;
      this.max_lazy = max_lazy;
      this.nice_length = nice_length;
      this.max_chain = max_chain;
      this.func = func;
    }
    var configuration_table;
    configuration_table = [
      /*      good lazy nice chain */
      new Config(0, 0, 0, 0, deflate_stored),
      /* 0 store only */
      new Config(4, 4, 8, 4, deflate_fast),
      /* 1 max speed, no lazy matches */
      new Config(4, 5, 16, 8, deflate_fast),
      /* 2 */
      new Config(4, 6, 32, 32, deflate_fast),
      /* 3 */
      new Config(4, 4, 16, 16, deflate_slow),
      /* 4 lazy matches */
      new Config(8, 16, 32, 32, deflate_slow),
      /* 5 */
      new Config(8, 16, 128, 128, deflate_slow),
      /* 6 */
      new Config(8, 32, 128, 256, deflate_slow),
      /* 7 */
      new Config(32, 128, 258, 1024, deflate_slow),
      /* 8 */
      new Config(32, 258, 258, 4096, deflate_slow)
      /* 9 max compression */
    ];
    function lm_init(s) {
      s.window_size = 2 * s.w_size;
      zero(s.head);
      s.max_lazy_match = configuration_table[s.level].max_lazy;
      s.good_match = configuration_table[s.level].good_length;
      s.nice_match = configuration_table[s.level].nice_length;
      s.max_chain_length = configuration_table[s.level].max_chain;
      s.strstart = 0;
      s.block_start = 0;
      s.lookahead = 0;
      s.insert = 0;
      s.match_length = s.prev_length = MIN_MATCH - 1;
      s.match_available = 0;
      s.ins_h = 0;
    }
    function DeflateState() {
      this.strm = null;
      this.status = 0;
      this.pending_buf = null;
      this.pending_buf_size = 0;
      this.pending_out = 0;
      this.pending = 0;
      this.wrap = 0;
      this.gzhead = null;
      this.gzindex = 0;
      this.method = Z_DEFLATED;
      this.last_flush = -1;
      this.w_size = 0;
      this.w_bits = 0;
      this.w_mask = 0;
      this.window = null;
      this.window_size = 0;
      this.prev = null;
      this.head = null;
      this.ins_h = 0;
      this.hash_size = 0;
      this.hash_bits = 0;
      this.hash_mask = 0;
      this.hash_shift = 0;
      this.block_start = 0;
      this.match_length = 0;
      this.prev_match = 0;
      this.match_available = 0;
      this.strstart = 0;
      this.match_start = 0;
      this.lookahead = 0;
      this.prev_length = 0;
      this.max_chain_length = 0;
      this.max_lazy_match = 0;
      this.level = 0;
      this.strategy = 0;
      this.good_match = 0;
      this.nice_match = 0;
      this.dyn_ltree = new utils.Buf16(HEAP_SIZE * 2);
      this.dyn_dtree = new utils.Buf16((2 * D_CODES + 1) * 2);
      this.bl_tree = new utils.Buf16((2 * BL_CODES + 1) * 2);
      zero(this.dyn_ltree);
      zero(this.dyn_dtree);
      zero(this.bl_tree);
      this.l_desc = null;
      this.d_desc = null;
      this.bl_desc = null;
      this.bl_count = new utils.Buf16(MAX_BITS + 1);
      this.heap = new utils.Buf16(2 * L_CODES + 1);
      zero(this.heap);
      this.heap_len = 0;
      this.heap_max = 0;
      this.depth = new utils.Buf16(2 * L_CODES + 1);
      zero(this.depth);
      this.l_buf = 0;
      this.lit_bufsize = 0;
      this.last_lit = 0;
      this.d_buf = 0;
      this.opt_len = 0;
      this.static_len = 0;
      this.matches = 0;
      this.insert = 0;
      this.bi_buf = 0;
      this.bi_valid = 0;
    }
    function deflateResetKeep(strm) {
      var s;
      if (!strm || !strm.state) {
        return err(strm, Z_STREAM_ERROR);
      }
      strm.total_in = strm.total_out = 0;
      strm.data_type = Z_UNKNOWN;
      s = strm.state;
      s.pending = 0;
      s.pending_out = 0;
      if (s.wrap < 0) {
        s.wrap = -s.wrap;
      }
      s.status = s.wrap ? INIT_STATE : BUSY_STATE;
      strm.adler = s.wrap === 2 ? 0 : 1;
      s.last_flush = Z_NO_FLUSH;
      trees._tr_init(s);
      return Z_OK;
    }
    function deflateReset(strm) {
      var ret = deflateResetKeep(strm);
      if (ret === Z_OK) {
        lm_init(strm.state);
      }
      return ret;
    }
    function deflateSetHeader(strm, head) {
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      if (strm.state.wrap !== 2) {
        return Z_STREAM_ERROR;
      }
      strm.state.gzhead = head;
      return Z_OK;
    }
    function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
      if (!strm) {
        return Z_STREAM_ERROR;
      }
      var wrap = 1;
      if (level === Z_DEFAULT_COMPRESSION) {
        level = 6;
      }
      if (windowBits < 0) {
        wrap = 0;
        windowBits = -windowBits;
      } else if (windowBits > 15) {
        wrap = 2;
        windowBits -= 16;
      }
      if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED) {
        return err(strm, Z_STREAM_ERROR);
      }
      if (windowBits === 8) {
        windowBits = 9;
      }
      var s = new DeflateState();
      strm.state = s;
      s.strm = strm;
      s.wrap = wrap;
      s.gzhead = null;
      s.w_bits = windowBits;
      s.w_size = 1 << s.w_bits;
      s.w_mask = s.w_size - 1;
      s.hash_bits = memLevel + 7;
      s.hash_size = 1 << s.hash_bits;
      s.hash_mask = s.hash_size - 1;
      s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
      s.window = new utils.Buf8(s.w_size * 2);
      s.head = new utils.Buf16(s.hash_size);
      s.prev = new utils.Buf16(s.w_size);
      s.lit_bufsize = 1 << memLevel + 6;
      s.pending_buf_size = s.lit_bufsize * 4;
      s.pending_buf = new utils.Buf8(s.pending_buf_size);
      s.d_buf = 1 * s.lit_bufsize;
      s.l_buf = (1 + 2) * s.lit_bufsize;
      s.level = level;
      s.strategy = strategy;
      s.method = method;
      return deflateReset(strm);
    }
    function deflateInit(strm, level) {
      return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
    }
    function deflate(strm, flush) {
      var old_flush, s;
      var beg, val;
      if (!strm || !strm.state || flush > Z_BLOCK || flush < 0) {
        return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
      }
      s = strm.state;
      if (!strm.output || !strm.input && strm.avail_in !== 0 || s.status === FINISH_STATE && flush !== Z_FINISH) {
        return err(strm, strm.avail_out === 0 ? Z_BUF_ERROR : Z_STREAM_ERROR);
      }
      s.strm = strm;
      old_flush = s.last_flush;
      s.last_flush = flush;
      if (s.status === INIT_STATE) {
        if (s.wrap === 2) {
          strm.adler = 0;
          put_byte(s, 31);
          put_byte(s, 139);
          put_byte(s, 8);
          if (!s.gzhead) {
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
            put_byte(s, OS_CODE);
            s.status = BUSY_STATE;
          } else {
            put_byte(
              s,
              (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16)
            );
            put_byte(s, s.gzhead.time & 255);
            put_byte(s, s.gzhead.time >> 8 & 255);
            put_byte(s, s.gzhead.time >> 16 & 255);
            put_byte(s, s.gzhead.time >> 24 & 255);
            put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
            put_byte(s, s.gzhead.os & 255);
            if (s.gzhead.extra && s.gzhead.extra.length) {
              put_byte(s, s.gzhead.extra.length & 255);
              put_byte(s, s.gzhead.extra.length >> 8 & 255);
            }
            if (s.gzhead.hcrc) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
            }
            s.gzindex = 0;
            s.status = EXTRA_STATE;
          }
        } else {
          var header = Z_DEFLATED + (s.w_bits - 8 << 4) << 8;
          var level_flags = -1;
          if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
            level_flags = 0;
          } else if (s.level < 6) {
            level_flags = 1;
          } else if (s.level === 6) {
            level_flags = 2;
          } else {
            level_flags = 3;
          }
          header |= level_flags << 6;
          if (s.strstart !== 0) {
            header |= PRESET_DICT;
          }
          header += 31 - header % 31;
          s.status = BUSY_STATE;
          putShortMSB(s, header);
          if (s.strstart !== 0) {
            putShortMSB(s, strm.adler >>> 16);
            putShortMSB(s, strm.adler & 65535);
          }
          strm.adler = 1;
        }
      }
      if (s.status === EXTRA_STATE) {
        if (s.gzhead.extra) {
          beg = s.pending;
          while (s.gzindex < (s.gzhead.extra.length & 65535)) {
            if (s.pending === s.pending_buf_size) {
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              flush_pending(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                break;
              }
            }
            put_byte(s, s.gzhead.extra[s.gzindex] & 255);
            s.gzindex++;
          }
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          if (s.gzindex === s.gzhead.extra.length) {
            s.gzindex = 0;
            s.status = NAME_STATE;
          }
        } else {
          s.status = NAME_STATE;
        }
      }
      if (s.status === NAME_STATE) {
        if (s.gzhead.name) {
          beg = s.pending;
          do {
            if (s.pending === s.pending_buf_size) {
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              flush_pending(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                val = 1;
                break;
              }
            }
            if (s.gzindex < s.gzhead.name.length) {
              val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
            } else {
              val = 0;
            }
            put_byte(s, val);
          } while (val !== 0);
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          if (val === 0) {
            s.gzindex = 0;
            s.status = COMMENT_STATE;
          }
        } else {
          s.status = COMMENT_STATE;
        }
      }
      if (s.status === COMMENT_STATE) {
        if (s.gzhead.comment) {
          beg = s.pending;
          do {
            if (s.pending === s.pending_buf_size) {
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              flush_pending(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                val = 1;
                break;
              }
            }
            if (s.gzindex < s.gzhead.comment.length) {
              val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
            } else {
              val = 0;
            }
            put_byte(s, val);
          } while (val !== 0);
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          if (val === 0) {
            s.status = HCRC_STATE;
          }
        } else {
          s.status = HCRC_STATE;
        }
      }
      if (s.status === HCRC_STATE) {
        if (s.gzhead.hcrc) {
          if (s.pending + 2 > s.pending_buf_size) {
            flush_pending(strm);
          }
          if (s.pending + 2 <= s.pending_buf_size) {
            put_byte(s, strm.adler & 255);
            put_byte(s, strm.adler >> 8 & 255);
            strm.adler = 0;
            s.status = BUSY_STATE;
          }
        } else {
          s.status = BUSY_STATE;
        }
      }
      if (s.pending !== 0) {
        flush_pending(strm);
        if (strm.avail_out === 0) {
          s.last_flush = -1;
          return Z_OK;
        }
      } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH) {
        return err(strm, Z_BUF_ERROR);
      }
      if (s.status === FINISH_STATE && strm.avail_in !== 0) {
        return err(strm, Z_BUF_ERROR);
      }
      if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH && s.status !== FINISH_STATE) {
        var bstate = s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) : s.strategy === Z_RLE ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush);
        if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
          s.status = FINISH_STATE;
        }
        if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
          if (strm.avail_out === 0) {
            s.last_flush = -1;
          }
          return Z_OK;
        }
        if (bstate === BS_BLOCK_DONE) {
          if (flush === Z_PARTIAL_FLUSH) {
            trees._tr_align(s);
          } else if (flush !== Z_BLOCK) {
            trees._tr_stored_block(s, 0, 0, false);
            if (flush === Z_FULL_FLUSH) {
              zero(s.head);
              if (s.lookahead === 0) {
                s.strstart = 0;
                s.block_start = 0;
                s.insert = 0;
              }
            }
          }
          flush_pending(strm);
          if (strm.avail_out === 0) {
            s.last_flush = -1;
            return Z_OK;
          }
        }
      }
      if (flush !== Z_FINISH) {
        return Z_OK;
      }
      if (s.wrap <= 0) {
        return Z_STREAM_END;
      }
      if (s.wrap === 2) {
        put_byte(s, strm.adler & 255);
        put_byte(s, strm.adler >> 8 & 255);
        put_byte(s, strm.adler >> 16 & 255);
        put_byte(s, strm.adler >> 24 & 255);
        put_byte(s, strm.total_in & 255);
        put_byte(s, strm.total_in >> 8 & 255);
        put_byte(s, strm.total_in >> 16 & 255);
        put_byte(s, strm.total_in >> 24 & 255);
      } else {
        putShortMSB(s, strm.adler >>> 16);
        putShortMSB(s, strm.adler & 65535);
      }
      flush_pending(strm);
      if (s.wrap > 0) {
        s.wrap = -s.wrap;
      }
      return s.pending !== 0 ? Z_OK : Z_STREAM_END;
    }
    function deflateEnd(strm) {
      var status;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      status = strm.state.status;
      if (status !== INIT_STATE && status !== EXTRA_STATE && status !== NAME_STATE && status !== COMMENT_STATE && status !== HCRC_STATE && status !== BUSY_STATE && status !== FINISH_STATE) {
        return err(strm, Z_STREAM_ERROR);
      }
      strm.state = null;
      return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
    }
    function deflateSetDictionary(strm, dictionary) {
      var dictLength = dictionary.length;
      var s;
      var str, n;
      var wrap;
      var avail;
      var next;
      var input;
      var tmpDict;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      s = strm.state;
      wrap = s.wrap;
      if (wrap === 2 || wrap === 1 && s.status !== INIT_STATE || s.lookahead) {
        return Z_STREAM_ERROR;
      }
      if (wrap === 1) {
        strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
      }
      s.wrap = 0;
      if (dictLength >= s.w_size) {
        if (wrap === 0) {
          zero(s.head);
          s.strstart = 0;
          s.block_start = 0;
          s.insert = 0;
        }
        tmpDict = new utils.Buf8(s.w_size);
        utils.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
        dictionary = tmpDict;
        dictLength = s.w_size;
      }
      avail = strm.avail_in;
      next = strm.next_in;
      input = strm.input;
      strm.avail_in = dictLength;
      strm.next_in = 0;
      strm.input = dictionary;
      fill_window(s);
      while (s.lookahead >= MIN_MATCH) {
        str = s.strstart;
        n = s.lookahead - (MIN_MATCH - 1);
        do {
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;
          s.prev[str & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = str;
          str++;
        } while (--n);
        s.strstart = str;
        s.lookahead = MIN_MATCH - 1;
        fill_window(s);
      }
      s.strstart += s.lookahead;
      s.block_start = s.strstart;
      s.insert = s.lookahead;
      s.lookahead = 0;
      s.match_length = s.prev_length = MIN_MATCH - 1;
      s.match_available = 0;
      strm.next_in = next;
      strm.input = input;
      strm.avail_in = avail;
      s.wrap = wrap;
      return Z_OK;
    }
    exports.deflateInit = deflateInit;
    exports.deflateInit2 = deflateInit2;
    exports.deflateReset = deflateReset;
    exports.deflateResetKeep = deflateResetKeep;
    exports.deflateSetHeader = deflateSetHeader;
    exports.deflate = deflate;
    exports.deflateEnd = deflateEnd;
    exports.deflateSetDictionary = deflateSetDictionary;
    exports.deflateInfo = "pako deflate (from Nodeca project)";
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/utils/strings.js
var require_strings = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/utils/strings.js"(exports) {
    "use strict";
    var utils = require_common();
    var STR_APPLY_OK = true;
    var STR_APPLY_UIA_OK = true;
    try {
      String.fromCharCode.apply(null, [0]);
    } catch (__) {
      STR_APPLY_OK = false;
    }
    try {
      String.fromCharCode.apply(null, new Uint8Array(1));
    } catch (__) {
      STR_APPLY_UIA_OK = false;
    }
    var _utf8len = new utils.Buf8(256);
    for (q = 0; q < 256; q++) {
      _utf8len[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
    }
    var q;
    _utf8len[254] = _utf8len[254] = 1;
    exports.string2buf = function(str) {
      var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;
      for (m_pos = 0; m_pos < str_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 64512) === 56320) {
            c = 65536 + (c - 55296 << 10) + (c2 - 56320);
            m_pos++;
          }
        }
        buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
      }
      buf = new utils.Buf8(buf_len);
      for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 64512) === 56320) {
            c = 65536 + (c - 55296 << 10) + (c2 - 56320);
            m_pos++;
          }
        }
        if (c < 128) {
          buf[i++] = c;
        } else if (c < 2048) {
          buf[i++] = 192 | c >>> 6;
          buf[i++] = 128 | c & 63;
        } else if (c < 65536) {
          buf[i++] = 224 | c >>> 12;
          buf[i++] = 128 | c >>> 6 & 63;
          buf[i++] = 128 | c & 63;
        } else {
          buf[i++] = 240 | c >>> 18;
          buf[i++] = 128 | c >>> 12 & 63;
          buf[i++] = 128 | c >>> 6 & 63;
          buf[i++] = 128 | c & 63;
        }
      }
      return buf;
    };
    function buf2binstring(buf, len) {
      if (len < 65534) {
        if (buf.subarray && STR_APPLY_UIA_OK || !buf.subarray && STR_APPLY_OK) {
          return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
        }
      }
      var result = "";
      for (var i = 0; i < len; i++) {
        result += String.fromCharCode(buf[i]);
      }
      return result;
    }
    exports.buf2binstring = function(buf) {
      return buf2binstring(buf, buf.length);
    };
    exports.binstring2buf = function(str) {
      var buf = new utils.Buf8(str.length);
      for (var i = 0, len = buf.length; i < len; i++) {
        buf[i] = str.charCodeAt(i);
      }
      return buf;
    };
    exports.buf2string = function(buf, max) {
      var i, out, c, c_len;
      var len = max || buf.length;
      var utf16buf = new Array(len * 2);
      for (out = 0, i = 0; i < len; ) {
        c = buf[i++];
        if (c < 128) {
          utf16buf[out++] = c;
          continue;
        }
        c_len = _utf8len[c];
        if (c_len > 4) {
          utf16buf[out++] = 65533;
          i += c_len - 1;
          continue;
        }
        c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
        while (c_len > 1 && i < len) {
          c = c << 6 | buf[i++] & 63;
          c_len--;
        }
        if (c_len > 1) {
          utf16buf[out++] = 65533;
          continue;
        }
        if (c < 65536) {
          utf16buf[out++] = c;
        } else {
          c -= 65536;
          utf16buf[out++] = 55296 | c >> 10 & 1023;
          utf16buf[out++] = 56320 | c & 1023;
        }
      }
      return buf2binstring(utf16buf, out);
    };
    exports.utf8border = function(buf, max) {
      var pos;
      max = max || buf.length;
      if (max > buf.length) {
        max = buf.length;
      }
      pos = max - 1;
      while (pos >= 0 && (buf[pos] & 192) === 128) {
        pos--;
      }
      if (pos < 0) {
        return max;
      }
      if (pos === 0) {
        return max;
      }
      return pos + _utf8len[buf[pos]] > max ? pos : max;
    };
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/zstream.js
var require_zstream = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/zstream.js"(exports, module) {
    "use strict";
    function ZStream() {
      this.input = null;
      this.next_in = 0;
      this.avail_in = 0;
      this.total_in = 0;
      this.output = null;
      this.next_out = 0;
      this.avail_out = 0;
      this.total_out = 0;
      this.msg = "";
      this.state = null;
      this.data_type = 2;
      this.adler = 0;
    }
    module.exports = ZStream;
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/deflate.js
var require_deflate2 = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/deflate.js"(exports) {
    "use strict";
    var zlib_deflate = require_deflate();
    var utils = require_common();
    var strings = require_strings();
    var msg = require_messages();
    var ZStream = require_zstream();
    var toString = Object.prototype.toString;
    var Z_NO_FLUSH = 0;
    var Z_FINISH = 4;
    var Z_OK = 0;
    var Z_STREAM_END = 1;
    var Z_SYNC_FLUSH = 2;
    var Z_DEFAULT_COMPRESSION = -1;
    var Z_DEFAULT_STRATEGY = 0;
    var Z_DEFLATED = 8;
    function Deflate(options) {
      if (!(this instanceof Deflate)) return new Deflate(options);
      this.options = utils.assign({
        level: Z_DEFAULT_COMPRESSION,
        method: Z_DEFLATED,
        chunkSize: 16384,
        windowBits: 15,
        memLevel: 8,
        strategy: Z_DEFAULT_STRATEGY,
        to: ""
      }, options || {});
      var opt = this.options;
      if (opt.raw && opt.windowBits > 0) {
        opt.windowBits = -opt.windowBits;
      } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
        opt.windowBits += 16;
      }
      this.err = 0;
      this.msg = "";
      this.ended = false;
      this.chunks = [];
      this.strm = new ZStream();
      this.strm.avail_out = 0;
      var status = zlib_deflate.deflateInit2(
        this.strm,
        opt.level,
        opt.method,
        opt.windowBits,
        opt.memLevel,
        opt.strategy
      );
      if (status !== Z_OK) {
        throw new Error(msg[status]);
      }
      if (opt.header) {
        zlib_deflate.deflateSetHeader(this.strm, opt.header);
      }
      if (opt.dictionary) {
        var dict;
        if (typeof opt.dictionary === "string") {
          dict = strings.string2buf(opt.dictionary);
        } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
          dict = new Uint8Array(opt.dictionary);
        } else {
          dict = opt.dictionary;
        }
        status = zlib_deflate.deflateSetDictionary(this.strm, dict);
        if (status !== Z_OK) {
          throw new Error(msg[status]);
        }
        this._dict_set = true;
      }
    }
    Deflate.prototype.push = function(data, mode) {
      var strm = this.strm;
      var chunkSize = this.options.chunkSize;
      var status, _mode;
      if (this.ended) {
        return false;
      }
      _mode = mode === ~~mode ? mode : mode === true ? Z_FINISH : Z_NO_FLUSH;
      if (typeof data === "string") {
        strm.input = strings.string2buf(data);
      } else if (toString.call(data) === "[object ArrayBuffer]") {
        strm.input = new Uint8Array(data);
      } else {
        strm.input = data;
      }
      strm.next_in = 0;
      strm.avail_in = strm.input.length;
      do {
        if (strm.avail_out === 0) {
          strm.output = new utils.Buf8(chunkSize);
          strm.next_out = 0;
          strm.avail_out = chunkSize;
        }
        status = zlib_deflate.deflate(strm, _mode);
        if (status !== Z_STREAM_END && status !== Z_OK) {
          this.onEnd(status);
          this.ended = true;
          return false;
        }
        if (strm.avail_out === 0 || strm.avail_in === 0 && (_mode === Z_FINISH || _mode === Z_SYNC_FLUSH)) {
          if (this.options.to === "string") {
            this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output, strm.next_out)));
          } else {
            this.onData(utils.shrinkBuf(strm.output, strm.next_out));
          }
        }
      } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END);
      if (_mode === Z_FINISH) {
        status = zlib_deflate.deflateEnd(this.strm);
        this.onEnd(status);
        this.ended = true;
        return status === Z_OK;
      }
      if (_mode === Z_SYNC_FLUSH) {
        this.onEnd(Z_OK);
        strm.avail_out = 0;
        return true;
      }
      return true;
    };
    Deflate.prototype.onData = function(chunk) {
      this.chunks.push(chunk);
    };
    Deflate.prototype.onEnd = function(status) {
      if (status === Z_OK) {
        if (this.options.to === "string") {
          this.result = this.chunks.join("");
        } else {
          this.result = utils.flattenChunks(this.chunks);
        }
      }
      this.chunks = [];
      this.err = status;
      this.msg = this.strm.msg;
    };
    function deflate(input, options) {
      var deflator = new Deflate(options);
      deflator.push(input, true);
      if (deflator.err) {
        throw deflator.msg || msg[deflator.err];
      }
      return deflator.result;
    }
    function deflateRaw(input, options) {
      options = options || {};
      options.raw = true;
      return deflate(input, options);
    }
    function gzip(input, options) {
      options = options || {};
      options.gzip = true;
      return deflate(input, options);
    }
    exports.Deflate = Deflate;
    exports.deflate = deflate;
    exports.deflateRaw = deflateRaw;
    exports.gzip = gzip;
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/inffast.js
var require_inffast = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/inffast.js"(exports, module) {
    "use strict";
    var BAD = 30;
    var TYPE = 12;
    module.exports = function inflate_fast(strm, start) {
      var state;
      var _in;
      var last;
      var _out;
      var beg;
      var end;
      var dmax;
      var wsize;
      var whave;
      var wnext;
      var s_window;
      var hold;
      var bits;
      var lcode;
      var dcode;
      var lmask;
      var dmask;
      var here;
      var op;
      var len;
      var dist;
      var from;
      var from_source;
      var input, output;
      state = strm.state;
      _in = strm.next_in;
      input = strm.input;
      last = _in + (strm.avail_in - 5);
      _out = strm.next_out;
      output = strm.output;
      beg = _out - (start - strm.avail_out);
      end = _out + (strm.avail_out - 257);
      dmax = state.dmax;
      wsize = state.wsize;
      whave = state.whave;
      wnext = state.wnext;
      s_window = state.window;
      hold = state.hold;
      bits = state.bits;
      lcode = state.lencode;
      dcode = state.distcode;
      lmask = (1 << state.lenbits) - 1;
      dmask = (1 << state.distbits) - 1;
      top:
        do {
          if (bits < 15) {
            hold += input[_in++] << bits;
            bits += 8;
            hold += input[_in++] << bits;
            bits += 8;
          }
          here = lcode[hold & lmask];
          dolen:
            for (; ; ) {
              op = here >>> 24;
              hold >>>= op;
              bits -= op;
              op = here >>> 16 & 255;
              if (op === 0) {
                output[_out++] = here & 65535;
              } else if (op & 16) {
                len = here & 65535;
                op &= 15;
                if (op) {
                  if (bits < op) {
                    hold += input[_in++] << bits;
                    bits += 8;
                  }
                  len += hold & (1 << op) - 1;
                  hold >>>= op;
                  bits -= op;
                }
                if (bits < 15) {
                  hold += input[_in++] << bits;
                  bits += 8;
                  hold += input[_in++] << bits;
                  bits += 8;
                }
                here = dcode[hold & dmask];
                dodist:
                  for (; ; ) {
                    op = here >>> 24;
                    hold >>>= op;
                    bits -= op;
                    op = here >>> 16 & 255;
                    if (op & 16) {
                      dist = here & 65535;
                      op &= 15;
                      if (bits < op) {
                        hold += input[_in++] << bits;
                        bits += 8;
                        if (bits < op) {
                          hold += input[_in++] << bits;
                          bits += 8;
                        }
                      }
                      dist += hold & (1 << op) - 1;
                      if (dist > dmax) {
                        strm.msg = "invalid distance too far back";
                        state.mode = BAD;
                        break top;
                      }
                      hold >>>= op;
                      bits -= op;
                      op = _out - beg;
                      if (dist > op) {
                        op = dist - op;
                        if (op > whave) {
                          if (state.sane) {
                            strm.msg = "invalid distance too far back";
                            state.mode = BAD;
                            break top;
                          }
                        }
                        from = 0;
                        from_source = s_window;
                        if (wnext === 0) {
                          from += wsize - op;
                          if (op < len) {
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = _out - dist;
                            from_source = output;
                          }
                        } else if (wnext < op) {
                          from += wsize + wnext - op;
                          op -= wnext;
                          if (op < len) {
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = 0;
                            if (wnext < len) {
                              op = wnext;
                              len -= op;
                              do {
                                output[_out++] = s_window[from++];
                              } while (--op);
                              from = _out - dist;
                              from_source = output;
                            }
                          }
                        } else {
                          from += wnext - op;
                          if (op < len) {
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = _out - dist;
                            from_source = output;
                          }
                        }
                        while (len > 2) {
                          output[_out++] = from_source[from++];
                          output[_out++] = from_source[from++];
                          output[_out++] = from_source[from++];
                          len -= 3;
                        }
                        if (len) {
                          output[_out++] = from_source[from++];
                          if (len > 1) {
                            output[_out++] = from_source[from++];
                          }
                        }
                      } else {
                        from = _out - dist;
                        do {
                          output[_out++] = output[from++];
                          output[_out++] = output[from++];
                          output[_out++] = output[from++];
                          len -= 3;
                        } while (len > 2);
                        if (len) {
                          output[_out++] = output[from++];
                          if (len > 1) {
                            output[_out++] = output[from++];
                          }
                        }
                      }
                    } else if ((op & 64) === 0) {
                      here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
                      continue dodist;
                    } else {
                      strm.msg = "invalid distance code";
                      state.mode = BAD;
                      break top;
                    }
                    break;
                  }
              } else if ((op & 64) === 0) {
                here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
                continue dolen;
              } else if (op & 32) {
                state.mode = TYPE;
                break top;
              } else {
                strm.msg = "invalid literal/length code";
                state.mode = BAD;
                break top;
              }
              break;
            }
        } while (_in < last && _out < end);
      len = bits >> 3;
      _in -= len;
      bits -= len << 3;
      hold &= (1 << bits) - 1;
      strm.next_in = _in;
      strm.next_out = _out;
      strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
      strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
      state.hold = hold;
      state.bits = bits;
      return;
    };
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/inftrees.js
var require_inftrees = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/inftrees.js"(exports, module) {
    "use strict";
    var utils = require_common();
    var MAXBITS = 15;
    var ENOUGH_LENS = 852;
    var ENOUGH_DISTS = 592;
    var CODES = 0;
    var LENS = 1;
    var DISTS = 2;
    var lbase = [
      /* Length codes 257..285 base */
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      13,
      15,
      17,
      19,
      23,
      27,
      31,
      35,
      43,
      51,
      59,
      67,
      83,
      99,
      115,
      131,
      163,
      195,
      227,
      258,
      0,
      0
    ];
    var lext = [
      /* Length codes 257..285 extra */
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      17,
      17,
      17,
      17,
      18,
      18,
      18,
      18,
      19,
      19,
      19,
      19,
      20,
      20,
      20,
      20,
      21,
      21,
      21,
      21,
      16,
      72,
      78
    ];
    var dbase = [
      /* Distance codes 0..29 base */
      1,
      2,
      3,
      4,
      5,
      7,
      9,
      13,
      17,
      25,
      33,
      49,
      65,
      97,
      129,
      193,
      257,
      385,
      513,
      769,
      1025,
      1537,
      2049,
      3073,
      4097,
      6145,
      8193,
      12289,
      16385,
      24577,
      0,
      0
    ];
    var dext = [
      /* Distance codes 0..29 extra */
      16,
      16,
      16,
      16,
      17,
      17,
      18,
      18,
      19,
      19,
      20,
      20,
      21,
      21,
      22,
      22,
      23,
      23,
      24,
      24,
      25,
      25,
      26,
      26,
      27,
      27,
      28,
      28,
      29,
      29,
      64,
      64
    ];
    module.exports = function inflate_table(type2, lens, lens_index, codes, table, table_index, work, opts) {
      var bits = opts.bits;
      var len = 0;
      var sym = 0;
      var min = 0, max = 0;
      var root = 0;
      var curr = 0;
      var drop = 0;
      var left = 0;
      var used = 0;
      var huff = 0;
      var incr;
      var fill;
      var low;
      var mask;
      var next;
      var base = null;
      var base_index = 0;
      var end;
      var count = new utils.Buf16(MAXBITS + 1);
      var offs = new utils.Buf16(MAXBITS + 1);
      var extra = null;
      var extra_index = 0;
      var here_bits, here_op, here_val;
      for (len = 0; len <= MAXBITS; len++) {
        count[len] = 0;
      }
      for (sym = 0; sym < codes; sym++) {
        count[lens[lens_index + sym]]++;
      }
      root = bits;
      for (max = MAXBITS; max >= 1; max--) {
        if (count[max] !== 0) {
          break;
        }
      }
      if (root > max) {
        root = max;
      }
      if (max === 0) {
        table[table_index++] = 1 << 24 | 64 << 16 | 0;
        table[table_index++] = 1 << 24 | 64 << 16 | 0;
        opts.bits = 1;
        return 0;
      }
      for (min = 1; min < max; min++) {
        if (count[min] !== 0) {
          break;
        }
      }
      if (root < min) {
        root = min;
      }
      left = 1;
      for (len = 1; len <= MAXBITS; len++) {
        left <<= 1;
        left -= count[len];
        if (left < 0) {
          return -1;
        }
      }
      if (left > 0 && (type2 === CODES || max !== 1)) {
        return -1;
      }
      offs[1] = 0;
      for (len = 1; len < MAXBITS; len++) {
        offs[len + 1] = offs[len] + count[len];
      }
      for (sym = 0; sym < codes; sym++) {
        if (lens[lens_index + sym] !== 0) {
          work[offs[lens[lens_index + sym]]++] = sym;
        }
      }
      if (type2 === CODES) {
        base = extra = work;
        end = 19;
      } else if (type2 === LENS) {
        base = lbase;
        base_index -= 257;
        extra = lext;
        extra_index -= 257;
        end = 256;
      } else {
        base = dbase;
        extra = dext;
        end = -1;
      }
      huff = 0;
      sym = 0;
      len = min;
      next = table_index;
      curr = root;
      drop = 0;
      low = -1;
      used = 1 << root;
      mask = used - 1;
      if (type2 === LENS && used > ENOUGH_LENS || type2 === DISTS && used > ENOUGH_DISTS) {
        return 1;
      }
      for (; ; ) {
        here_bits = len - drop;
        if (work[sym] < end) {
          here_op = 0;
          here_val = work[sym];
        } else if (work[sym] > end) {
          here_op = extra[extra_index + work[sym]];
          here_val = base[base_index + work[sym]];
        } else {
          here_op = 32 + 64;
          here_val = 0;
        }
        incr = 1 << len - drop;
        fill = 1 << curr;
        min = fill;
        do {
          fill -= incr;
          table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
        } while (fill !== 0);
        incr = 1 << len - 1;
        while (huff & incr) {
          incr >>= 1;
        }
        if (incr !== 0) {
          huff &= incr - 1;
          huff += incr;
        } else {
          huff = 0;
        }
        sym++;
        if (--count[len] === 0) {
          if (len === max) {
            break;
          }
          len = lens[lens_index + work[sym]];
        }
        if (len > root && (huff & mask) !== low) {
          if (drop === 0) {
            drop = root;
          }
          next += min;
          curr = len - drop;
          left = 1 << curr;
          while (curr + drop < max) {
            left -= count[curr + drop];
            if (left <= 0) {
              break;
            }
            curr++;
            left <<= 1;
          }
          used += 1 << curr;
          if (type2 === LENS && used > ENOUGH_LENS || type2 === DISTS && used > ENOUGH_DISTS) {
            return 1;
          }
          low = huff & mask;
          table[low] = root << 24 | curr << 16 | next - table_index | 0;
        }
      }
      if (huff !== 0) {
        table[next + huff] = len - drop << 24 | 64 << 16 | 0;
      }
      opts.bits = root;
      return 0;
    };
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/inflate.js
var require_inflate = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/inflate.js"(exports) {
    "use strict";
    var utils = require_common();
    var adler32 = require_adler32();
    var crc32 = require_crc322();
    var inflate_fast = require_inffast();
    var inflate_table = require_inftrees();
    var CODES = 0;
    var LENS = 1;
    var DISTS = 2;
    var Z_FINISH = 4;
    var Z_BLOCK = 5;
    var Z_TREES = 6;
    var Z_OK = 0;
    var Z_STREAM_END = 1;
    var Z_NEED_DICT = 2;
    var Z_STREAM_ERROR = -2;
    var Z_DATA_ERROR = -3;
    var Z_MEM_ERROR = -4;
    var Z_BUF_ERROR = -5;
    var Z_DEFLATED = 8;
    var HEAD = 1;
    var FLAGS = 2;
    var TIME = 3;
    var OS = 4;
    var EXLEN = 5;
    var EXTRA = 6;
    var NAME = 7;
    var COMMENT = 8;
    var HCRC = 9;
    var DICTID = 10;
    var DICT = 11;
    var TYPE = 12;
    var TYPEDO = 13;
    var STORED = 14;
    var COPY_ = 15;
    var COPY = 16;
    var TABLE = 17;
    var LENLENS = 18;
    var CODELENS = 19;
    var LEN_ = 20;
    var LEN = 21;
    var LENEXT = 22;
    var DIST = 23;
    var DISTEXT = 24;
    var MATCH = 25;
    var LIT = 26;
    var CHECK = 27;
    var LENGTH = 28;
    var DONE = 29;
    var BAD = 30;
    var MEM = 31;
    var SYNC = 32;
    var ENOUGH_LENS = 852;
    var ENOUGH_DISTS = 592;
    var MAX_WBITS = 15;
    var DEF_WBITS = MAX_WBITS;
    function zswap32(q) {
      return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
    }
    function InflateState() {
      this.mode = 0;
      this.last = false;
      this.wrap = 0;
      this.havedict = false;
      this.flags = 0;
      this.dmax = 0;
      this.check = 0;
      this.total = 0;
      this.head = null;
      this.wbits = 0;
      this.wsize = 0;
      this.whave = 0;
      this.wnext = 0;
      this.window = null;
      this.hold = 0;
      this.bits = 0;
      this.length = 0;
      this.offset = 0;
      this.extra = 0;
      this.lencode = null;
      this.distcode = null;
      this.lenbits = 0;
      this.distbits = 0;
      this.ncode = 0;
      this.nlen = 0;
      this.ndist = 0;
      this.have = 0;
      this.next = null;
      this.lens = new utils.Buf16(320);
      this.work = new utils.Buf16(288);
      this.lendyn = null;
      this.distdyn = null;
      this.sane = 0;
      this.back = 0;
      this.was = 0;
    }
    function inflateResetKeep(strm) {
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      strm.total_in = strm.total_out = state.total = 0;
      strm.msg = "";
      if (state.wrap) {
        strm.adler = state.wrap & 1;
      }
      state.mode = HEAD;
      state.last = 0;
      state.havedict = 0;
      state.dmax = 32768;
      state.head = null;
      state.hold = 0;
      state.bits = 0;
      state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
      state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);
      state.sane = 1;
      state.back = -1;
      return Z_OK;
    }
    function inflateReset(strm) {
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      state.wsize = 0;
      state.whave = 0;
      state.wnext = 0;
      return inflateResetKeep(strm);
    }
    function inflateReset2(strm, windowBits) {
      var wrap;
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if (windowBits < 0) {
        wrap = 0;
        windowBits = -windowBits;
      } else {
        wrap = (windowBits >> 4) + 1;
        if (windowBits < 48) {
          windowBits &= 15;
        }
      }
      if (windowBits && (windowBits < 8 || windowBits > 15)) {
        return Z_STREAM_ERROR;
      }
      if (state.window !== null && state.wbits !== windowBits) {
        state.window = null;
      }
      state.wrap = wrap;
      state.wbits = windowBits;
      return inflateReset(strm);
    }
    function inflateInit2(strm, windowBits) {
      var ret;
      var state;
      if (!strm) {
        return Z_STREAM_ERROR;
      }
      state = new InflateState();
      strm.state = state;
      state.window = null;
      ret = inflateReset2(strm, windowBits);
      if (ret !== Z_OK) {
        strm.state = null;
      }
      return ret;
    }
    function inflateInit(strm) {
      return inflateInit2(strm, DEF_WBITS);
    }
    var virgin = true;
    var lenfix;
    var distfix;
    function fixedtables(state) {
      if (virgin) {
        var sym;
        lenfix = new utils.Buf32(512);
        distfix = new utils.Buf32(32);
        sym = 0;
        while (sym < 144) {
          state.lens[sym++] = 8;
        }
        while (sym < 256) {
          state.lens[sym++] = 9;
        }
        while (sym < 280) {
          state.lens[sym++] = 7;
        }
        while (sym < 288) {
          state.lens[sym++] = 8;
        }
        inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 });
        sym = 0;
        while (sym < 32) {
          state.lens[sym++] = 5;
        }
        inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 });
        virgin = false;
      }
      state.lencode = lenfix;
      state.lenbits = 9;
      state.distcode = distfix;
      state.distbits = 5;
    }
    function updatewindow(strm, src, end, copy) {
      var dist;
      var state = strm.state;
      if (state.window === null) {
        state.wsize = 1 << state.wbits;
        state.wnext = 0;
        state.whave = 0;
        state.window = new utils.Buf8(state.wsize);
      }
      if (copy >= state.wsize) {
        utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
        state.wnext = 0;
        state.whave = state.wsize;
      } else {
        dist = state.wsize - state.wnext;
        if (dist > copy) {
          dist = copy;
        }
        utils.arraySet(state.window, src, end - copy, dist, state.wnext);
        copy -= dist;
        if (copy) {
          utils.arraySet(state.window, src, end - copy, copy, 0);
          state.wnext = copy;
          state.whave = state.wsize;
        } else {
          state.wnext += dist;
          if (state.wnext === state.wsize) {
            state.wnext = 0;
          }
          if (state.whave < state.wsize) {
            state.whave += dist;
          }
        }
      }
      return 0;
    }
    function inflate(strm, flush) {
      var state;
      var input, output;
      var next;
      var put;
      var have, left;
      var hold;
      var bits;
      var _in, _out;
      var copy;
      var from;
      var from_source;
      var here = 0;
      var here_bits, here_op, here_val;
      var last_bits, last_op, last_val;
      var len;
      var ret;
      var hbuf = new utils.Buf8(4);
      var opts;
      var n;
      var order = (
        /* permutation of code lengths */
        [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
      );
      if (!strm || !strm.state || !strm.output || !strm.input && strm.avail_in !== 0) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if (state.mode === TYPE) {
        state.mode = TYPEDO;
      }
      put = strm.next_out;
      output = strm.output;
      left = strm.avail_out;
      next = strm.next_in;
      input = strm.input;
      have = strm.avail_in;
      hold = state.hold;
      bits = state.bits;
      _in = have;
      _out = left;
      ret = Z_OK;
      inf_leave:
        for (; ; ) {
          switch (state.mode) {
            case HEAD:
              if (state.wrap === 0) {
                state.mode = TYPEDO;
                break;
              }
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (state.wrap & 2 && hold === 35615) {
                state.check = 0;
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc32(state.check, hbuf, 2, 0);
                hold = 0;
                bits = 0;
                state.mode = FLAGS;
                break;
              }
              state.flags = 0;
              if (state.head) {
                state.head.done = false;
              }
              if (!(state.wrap & 1) || /* check if zlib header allowed */
              (((hold & 255) << 8) + (hold >> 8)) % 31) {
                strm.msg = "incorrect header check";
                state.mode = BAD;
                break;
              }
              if ((hold & 15) !== Z_DEFLATED) {
                strm.msg = "unknown compression method";
                state.mode = BAD;
                break;
              }
              hold >>>= 4;
              bits -= 4;
              len = (hold & 15) + 8;
              if (state.wbits === 0) {
                state.wbits = len;
              } else if (len > state.wbits) {
                strm.msg = "invalid window size";
                state.mode = BAD;
                break;
              }
              state.dmax = 1 << len;
              strm.adler = state.check = 1;
              state.mode = hold & 512 ? DICTID : TYPE;
              hold = 0;
              bits = 0;
              break;
            case FLAGS:
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.flags = hold;
              if ((state.flags & 255) !== Z_DEFLATED) {
                strm.msg = "unknown compression method";
                state.mode = BAD;
                break;
              }
              if (state.flags & 57344) {
                strm.msg = "unknown header flags set";
                state.mode = BAD;
                break;
              }
              if (state.head) {
                state.head.text = hold >> 8 & 1;
              }
              if (state.flags & 512) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc32(state.check, hbuf, 2, 0);
              }
              hold = 0;
              bits = 0;
              state.mode = TIME;
            /* falls through */
            case TIME:
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (state.head) {
                state.head.time = hold;
              }
              if (state.flags & 512) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                hbuf[2] = hold >>> 16 & 255;
                hbuf[3] = hold >>> 24 & 255;
                state.check = crc32(state.check, hbuf, 4, 0);
              }
              hold = 0;
              bits = 0;
              state.mode = OS;
            /* falls through */
            case OS:
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (state.head) {
                state.head.xflags = hold & 255;
                state.head.os = hold >> 8;
              }
              if (state.flags & 512) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc32(state.check, hbuf, 2, 0);
              }
              hold = 0;
              bits = 0;
              state.mode = EXLEN;
            /* falls through */
            case EXLEN:
              if (state.flags & 1024) {
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.length = hold;
                if (state.head) {
                  state.head.extra_len = hold;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                }
                hold = 0;
                bits = 0;
              } else if (state.head) {
                state.head.extra = null;
              }
              state.mode = EXTRA;
            /* falls through */
            case EXTRA:
              if (state.flags & 1024) {
                copy = state.length;
                if (copy > have) {
                  copy = have;
                }
                if (copy) {
                  if (state.head) {
                    len = state.head.extra_len - state.length;
                    if (!state.head.extra) {
                      state.head.extra = new Array(state.head.extra_len);
                    }
                    utils.arraySet(
                      state.head.extra,
                      input,
                      next,
                      // extra field is limited to 65536 bytes
                      // - no need for additional size check
                      copy,
                      /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                      len
                    );
                  }
                  if (state.flags & 512) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  state.length -= copy;
                }
                if (state.length) {
                  break inf_leave;
                }
              }
              state.length = 0;
              state.mode = NAME;
            /* falls through */
            case NAME:
              if (state.flags & 2048) {
                if (have === 0) {
                  break inf_leave;
                }
                copy = 0;
                do {
                  len = input[next + copy++];
                  if (state.head && len && state.length < 65536) {
                    state.head.name += String.fromCharCode(len);
                  }
                } while (len && copy < have);
                if (state.flags & 512) {
                  state.check = crc32(state.check, input, copy, next);
                }
                have -= copy;
                next += copy;
                if (len) {
                  break inf_leave;
                }
              } else if (state.head) {
                state.head.name = null;
              }
              state.length = 0;
              state.mode = COMMENT;
            /* falls through */
            case COMMENT:
              if (state.flags & 4096) {
                if (have === 0) {
                  break inf_leave;
                }
                copy = 0;
                do {
                  len = input[next + copy++];
                  if (state.head && len && state.length < 65536) {
                    state.head.comment += String.fromCharCode(len);
                  }
                } while (len && copy < have);
                if (state.flags & 512) {
                  state.check = crc32(state.check, input, copy, next);
                }
                have -= copy;
                next += copy;
                if (len) {
                  break inf_leave;
                }
              } else if (state.head) {
                state.head.comment = null;
              }
              state.mode = HCRC;
            /* falls through */
            case HCRC:
              if (state.flags & 512) {
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (hold !== (state.check & 65535)) {
                  strm.msg = "header crc mismatch";
                  state.mode = BAD;
                  break;
                }
                hold = 0;
                bits = 0;
              }
              if (state.head) {
                state.head.hcrc = state.flags >> 9 & 1;
                state.head.done = true;
              }
              strm.adler = state.check = 0;
              state.mode = TYPE;
              break;
            case DICTID:
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              strm.adler = state.check = zswap32(hold);
              hold = 0;
              bits = 0;
              state.mode = DICT;
            /* falls through */
            case DICT:
              if (state.havedict === 0) {
                strm.next_out = put;
                strm.avail_out = left;
                strm.next_in = next;
                strm.avail_in = have;
                state.hold = hold;
                state.bits = bits;
                return Z_NEED_DICT;
              }
              strm.adler = state.check = 1;
              state.mode = TYPE;
            /* falls through */
            case TYPE:
              if (flush === Z_BLOCK || flush === Z_TREES) {
                break inf_leave;
              }
            /* falls through */
            case TYPEDO:
              if (state.last) {
                hold >>>= bits & 7;
                bits -= bits & 7;
                state.mode = CHECK;
                break;
              }
              while (bits < 3) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.last = hold & 1;
              hold >>>= 1;
              bits -= 1;
              switch (hold & 3) {
                case 0:
                  state.mode = STORED;
                  break;
                case 1:
                  fixedtables(state);
                  state.mode = LEN_;
                  if (flush === Z_TREES) {
                    hold >>>= 2;
                    bits -= 2;
                    break inf_leave;
                  }
                  break;
                case 2:
                  state.mode = TABLE;
                  break;
                case 3:
                  strm.msg = "invalid block type";
                  state.mode = BAD;
              }
              hold >>>= 2;
              bits -= 2;
              break;
            case STORED:
              hold >>>= bits & 7;
              bits -= bits & 7;
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
                strm.msg = "invalid stored block lengths";
                state.mode = BAD;
                break;
              }
              state.length = hold & 65535;
              hold = 0;
              bits = 0;
              state.mode = COPY_;
              if (flush === Z_TREES) {
                break inf_leave;
              }
            /* falls through */
            case COPY_:
              state.mode = COPY;
            /* falls through */
            case COPY:
              copy = state.length;
              if (copy) {
                if (copy > have) {
                  copy = have;
                }
                if (copy > left) {
                  copy = left;
                }
                if (copy === 0) {
                  break inf_leave;
                }
                utils.arraySet(output, input, next, copy, put);
                have -= copy;
                next += copy;
                left -= copy;
                put += copy;
                state.length -= copy;
                break;
              }
              state.mode = TYPE;
              break;
            case TABLE:
              while (bits < 14) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.nlen = (hold & 31) + 257;
              hold >>>= 5;
              bits -= 5;
              state.ndist = (hold & 31) + 1;
              hold >>>= 5;
              bits -= 5;
              state.ncode = (hold & 15) + 4;
              hold >>>= 4;
              bits -= 4;
              if (state.nlen > 286 || state.ndist > 30) {
                strm.msg = "too many length or distance symbols";
                state.mode = BAD;
                break;
              }
              state.have = 0;
              state.mode = LENLENS;
            /* falls through */
            case LENLENS:
              while (state.have < state.ncode) {
                while (bits < 3) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.lens[order[state.have++]] = hold & 7;
                hold >>>= 3;
                bits -= 3;
              }
              while (state.have < 19) {
                state.lens[order[state.have++]] = 0;
              }
              state.lencode = state.lendyn;
              state.lenbits = 7;
              opts = { bits: state.lenbits };
              ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
              state.lenbits = opts.bits;
              if (ret) {
                strm.msg = "invalid code lengths set";
                state.mode = BAD;
                break;
              }
              state.have = 0;
              state.mode = CODELENS;
            /* falls through */
            case CODELENS:
              while (state.have < state.nlen + state.ndist) {
                for (; ; ) {
                  here = state.lencode[hold & (1 << state.lenbits) - 1];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (here_val < 16) {
                  hold >>>= here_bits;
                  bits -= here_bits;
                  state.lens[state.have++] = here_val;
                } else {
                  if (here_val === 16) {
                    n = here_bits + 2;
                    while (bits < n) {
                      if (have === 0) {
                        break inf_leave;
                      }
                      have--;
                      hold += input[next++] << bits;
                      bits += 8;
                    }
                    hold >>>= here_bits;
                    bits -= here_bits;
                    if (state.have === 0) {
                      strm.msg = "invalid bit length repeat";
                      state.mode = BAD;
                      break;
                    }
                    len = state.lens[state.have - 1];
                    copy = 3 + (hold & 3);
                    hold >>>= 2;
                    bits -= 2;
                  } else if (here_val === 17) {
                    n = here_bits + 3;
                    while (bits < n) {
                      if (have === 0) {
                        break inf_leave;
                      }
                      have--;
                      hold += input[next++] << bits;
                      bits += 8;
                    }
                    hold >>>= here_bits;
                    bits -= here_bits;
                    len = 0;
                    copy = 3 + (hold & 7);
                    hold >>>= 3;
                    bits -= 3;
                  } else {
                    n = here_bits + 7;
                    while (bits < n) {
                      if (have === 0) {
                        break inf_leave;
                      }
                      have--;
                      hold += input[next++] << bits;
                      bits += 8;
                    }
                    hold >>>= here_bits;
                    bits -= here_bits;
                    len = 0;
                    copy = 11 + (hold & 127);
                    hold >>>= 7;
                    bits -= 7;
                  }
                  if (state.have + copy > state.nlen + state.ndist) {
                    strm.msg = "invalid bit length repeat";
                    state.mode = BAD;
                    break;
                  }
                  while (copy--) {
                    state.lens[state.have++] = len;
                  }
                }
              }
              if (state.mode === BAD) {
                break;
              }
              if (state.lens[256] === 0) {
                strm.msg = "invalid code -- missing end-of-block";
                state.mode = BAD;
                break;
              }
              state.lenbits = 9;
              opts = { bits: state.lenbits };
              ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
              state.lenbits = opts.bits;
              if (ret) {
                strm.msg = "invalid literal/lengths set";
                state.mode = BAD;
                break;
              }
              state.distbits = 6;
              state.distcode = state.distdyn;
              opts = { bits: state.distbits };
              ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
              state.distbits = opts.bits;
              if (ret) {
                strm.msg = "invalid distances set";
                state.mode = BAD;
                break;
              }
              state.mode = LEN_;
              if (flush === Z_TREES) {
                break inf_leave;
              }
            /* falls through */
            case LEN_:
              state.mode = LEN;
            /* falls through */
            case LEN:
              if (have >= 6 && left >= 258) {
                strm.next_out = put;
                strm.avail_out = left;
                strm.next_in = next;
                strm.avail_in = have;
                state.hold = hold;
                state.bits = bits;
                inflate_fast(strm, _out);
                put = strm.next_out;
                output = strm.output;
                left = strm.avail_out;
                next = strm.next_in;
                input = strm.input;
                have = strm.avail_in;
                hold = state.hold;
                bits = state.bits;
                if (state.mode === TYPE) {
                  state.back = -1;
                }
                break;
              }
              state.back = 0;
              for (; ; ) {
                here = state.lencode[hold & (1 << state.lenbits) - 1];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (here_op && (here_op & 240) === 0) {
                last_bits = here_bits;
                last_op = here_op;
                last_val = here_val;
                for (; ; ) {
                  here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (last_bits + here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= last_bits;
                bits -= last_bits;
                state.back += last_bits;
              }
              hold >>>= here_bits;
              bits -= here_bits;
              state.back += here_bits;
              state.length = here_val;
              if (here_op === 0) {
                state.mode = LIT;
                break;
              }
              if (here_op & 32) {
                state.back = -1;
                state.mode = TYPE;
                break;
              }
              if (here_op & 64) {
                strm.msg = "invalid literal/length code";
                state.mode = BAD;
                break;
              }
              state.extra = here_op & 15;
              state.mode = LENEXT;
            /* falls through */
            case LENEXT:
              if (state.extra) {
                n = state.extra;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.length += hold & (1 << state.extra) - 1;
                hold >>>= state.extra;
                bits -= state.extra;
                state.back += state.extra;
              }
              state.was = state.length;
              state.mode = DIST;
            /* falls through */
            case DIST:
              for (; ; ) {
                here = state.distcode[hold & (1 << state.distbits) - 1];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if ((here_op & 240) === 0) {
                last_bits = here_bits;
                last_op = here_op;
                last_val = here_val;
                for (; ; ) {
                  here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (last_bits + here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= last_bits;
                bits -= last_bits;
                state.back += last_bits;
              }
              hold >>>= here_bits;
              bits -= here_bits;
              state.back += here_bits;
              if (here_op & 64) {
                strm.msg = "invalid distance code";
                state.mode = BAD;
                break;
              }
              state.offset = here_val;
              state.extra = here_op & 15;
              state.mode = DISTEXT;
            /* falls through */
            case DISTEXT:
              if (state.extra) {
                n = state.extra;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.offset += hold & (1 << state.extra) - 1;
                hold >>>= state.extra;
                bits -= state.extra;
                state.back += state.extra;
              }
              if (state.offset > state.dmax) {
                strm.msg = "invalid distance too far back";
                state.mode = BAD;
                break;
              }
              state.mode = MATCH;
            /* falls through */
            case MATCH:
              if (left === 0) {
                break inf_leave;
              }
              copy = _out - left;
              if (state.offset > copy) {
                copy = state.offset - copy;
                if (copy > state.whave) {
                  if (state.sane) {
                    strm.msg = "invalid distance too far back";
                    state.mode = BAD;
                    break;
                  }
                }
                if (copy > state.wnext) {
                  copy -= state.wnext;
                  from = state.wsize - copy;
                } else {
                  from = state.wnext - copy;
                }
                if (copy > state.length) {
                  copy = state.length;
                }
                from_source = state.window;
              } else {
                from_source = output;
                from = put - state.offset;
                copy = state.length;
              }
              if (copy > left) {
                copy = left;
              }
              left -= copy;
              state.length -= copy;
              do {
                output[put++] = from_source[from++];
              } while (--copy);
              if (state.length === 0) {
                state.mode = LEN;
              }
              break;
            case LIT:
              if (left === 0) {
                break inf_leave;
              }
              output[put++] = state.length;
              left--;
              state.mode = LEN;
              break;
            case CHECK:
              if (state.wrap) {
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold |= input[next++] << bits;
                  bits += 8;
                }
                _out -= left;
                strm.total_out += _out;
                state.total += _out;
                if (_out) {
                  strm.adler = state.check = /*UPDATE(state.check, put - _out, _out);*/
                  state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out);
                }
                _out = left;
                if ((state.flags ? hold : zswap32(hold)) !== state.check) {
                  strm.msg = "incorrect data check";
                  state.mode = BAD;
                  break;
                }
                hold = 0;
                bits = 0;
              }
              state.mode = LENGTH;
            /* falls through */
            case LENGTH:
              if (state.wrap && state.flags) {
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (hold !== (state.total & 4294967295)) {
                  strm.msg = "incorrect length check";
                  state.mode = BAD;
                  break;
                }
                hold = 0;
                bits = 0;
              }
              state.mode = DONE;
            /* falls through */
            case DONE:
              ret = Z_STREAM_END;
              break inf_leave;
            case BAD:
              ret = Z_DATA_ERROR;
              break inf_leave;
            case MEM:
              return Z_MEM_ERROR;
            case SYNC:
            /* falls through */
            default:
              return Z_STREAM_ERROR;
          }
        }
      strm.next_out = put;
      strm.avail_out = left;
      strm.next_in = next;
      strm.avail_in = have;
      state.hold = hold;
      state.bits = bits;
      if (state.wsize || _out !== strm.avail_out && state.mode < BAD && (state.mode < CHECK || flush !== Z_FINISH)) {
        if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
          state.mode = MEM;
          return Z_MEM_ERROR;
        }
      }
      _in -= strm.avail_in;
      _out -= strm.avail_out;
      strm.total_in += _in;
      strm.total_out += _out;
      state.total += _out;
      if (state.wrap && _out) {
        strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
        state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out);
      }
      strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
      if ((_in === 0 && _out === 0 || flush === Z_FINISH) && ret === Z_OK) {
        ret = Z_BUF_ERROR;
      }
      return ret;
    }
    function inflateEnd(strm) {
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      var state = strm.state;
      if (state.window) {
        state.window = null;
      }
      strm.state = null;
      return Z_OK;
    }
    function inflateGetHeader(strm, head) {
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if ((state.wrap & 2) === 0) {
        return Z_STREAM_ERROR;
      }
      state.head = head;
      head.done = false;
      return Z_OK;
    }
    function inflateSetDictionary(strm, dictionary) {
      var dictLength = dictionary.length;
      var state;
      var dictid;
      var ret;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if (state.wrap !== 0 && state.mode !== DICT) {
        return Z_STREAM_ERROR;
      }
      if (state.mode === DICT) {
        dictid = 1;
        dictid = adler32(dictid, dictionary, dictLength, 0);
        if (dictid !== state.check) {
          return Z_DATA_ERROR;
        }
      }
      ret = updatewindow(strm, dictionary, dictLength, dictLength);
      if (ret) {
        state.mode = MEM;
        return Z_MEM_ERROR;
      }
      state.havedict = 1;
      return Z_OK;
    }
    exports.inflateReset = inflateReset;
    exports.inflateReset2 = inflateReset2;
    exports.inflateResetKeep = inflateResetKeep;
    exports.inflateInit = inflateInit;
    exports.inflateInit2 = inflateInit2;
    exports.inflate = inflate;
    exports.inflateEnd = inflateEnd;
    exports.inflateGetHeader = inflateGetHeader;
    exports.inflateSetDictionary = inflateSetDictionary;
    exports.inflateInfo = "pako inflate (from Nodeca project)";
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/constants.js
var require_constants = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/constants.js"(exports, module) {
    "use strict";
    module.exports = {
      /* Allowed flush values; see deflate() and inflate() below for details */
      Z_NO_FLUSH: 0,
      Z_PARTIAL_FLUSH: 1,
      Z_SYNC_FLUSH: 2,
      Z_FULL_FLUSH: 3,
      Z_FINISH: 4,
      Z_BLOCK: 5,
      Z_TREES: 6,
      /* Return codes for the compression/decompression functions. Negative values
      * are errors, positive values are used for special but normal events.
      */
      Z_OK: 0,
      Z_STREAM_END: 1,
      Z_NEED_DICT: 2,
      Z_ERRNO: -1,
      Z_STREAM_ERROR: -2,
      Z_DATA_ERROR: -3,
      //Z_MEM_ERROR:     -4,
      Z_BUF_ERROR: -5,
      //Z_VERSION_ERROR: -6,
      /* compression levels */
      Z_NO_COMPRESSION: 0,
      Z_BEST_SPEED: 1,
      Z_BEST_COMPRESSION: 9,
      Z_DEFAULT_COMPRESSION: -1,
      Z_FILTERED: 1,
      Z_HUFFMAN_ONLY: 2,
      Z_RLE: 3,
      Z_FIXED: 4,
      Z_DEFAULT_STRATEGY: 0,
      /* Possible values of the data_type field (though see inflate()) */
      Z_BINARY: 0,
      Z_TEXT: 1,
      //Z_ASCII:                1, // = Z_TEXT (deprecated)
      Z_UNKNOWN: 2,
      /* The deflate compression method */
      Z_DEFLATED: 8
      //Z_NULL:                 null // Use -1 or null inline, depending on var type
    };
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/gzheader.js
var require_gzheader = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/gzheader.js"(exports, module) {
    "use strict";
    function GZheader() {
      this.text = 0;
      this.time = 0;
      this.xflags = 0;
      this.os = 0;
      this.extra = null;
      this.extra_len = 0;
      this.name = "";
      this.comment = "";
      this.hcrc = 0;
      this.done = false;
    }
    module.exports = GZheader;
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/inflate.js
var require_inflate2 = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/inflate.js"(exports) {
    "use strict";
    var zlib_inflate = require_inflate();
    var utils = require_common();
    var strings = require_strings();
    var c = require_constants();
    var msg = require_messages();
    var ZStream = require_zstream();
    var GZheader = require_gzheader();
    var toString = Object.prototype.toString;
    function Inflate(options) {
      if (!(this instanceof Inflate)) return new Inflate(options);
      this.options = utils.assign({
        chunkSize: 16384,
        windowBits: 0,
        to: ""
      }, options || {});
      var opt = this.options;
      if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
        opt.windowBits = -opt.windowBits;
        if (opt.windowBits === 0) {
          opt.windowBits = -15;
        }
      }
      if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options && options.windowBits)) {
        opt.windowBits += 32;
      }
      if (opt.windowBits > 15 && opt.windowBits < 48) {
        if ((opt.windowBits & 15) === 0) {
          opt.windowBits |= 15;
        }
      }
      this.err = 0;
      this.msg = "";
      this.ended = false;
      this.chunks = [];
      this.strm = new ZStream();
      this.strm.avail_out = 0;
      var status = zlib_inflate.inflateInit2(
        this.strm,
        opt.windowBits
      );
      if (status !== c.Z_OK) {
        throw new Error(msg[status]);
      }
      this.header = new GZheader();
      zlib_inflate.inflateGetHeader(this.strm, this.header);
      if (opt.dictionary) {
        if (typeof opt.dictionary === "string") {
          opt.dictionary = strings.string2buf(opt.dictionary);
        } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
          opt.dictionary = new Uint8Array(opt.dictionary);
        }
        if (opt.raw) {
          status = zlib_inflate.inflateSetDictionary(this.strm, opt.dictionary);
          if (status !== c.Z_OK) {
            throw new Error(msg[status]);
          }
        }
      }
    }
    Inflate.prototype.push = function(data, mode) {
      var strm = this.strm;
      var chunkSize = this.options.chunkSize;
      var dictionary = this.options.dictionary;
      var status, _mode;
      var next_out_utf8, tail, utf8str;
      var allowBufError = false;
      if (this.ended) {
        return false;
      }
      _mode = mode === ~~mode ? mode : mode === true ? c.Z_FINISH : c.Z_NO_FLUSH;
      if (typeof data === "string") {
        strm.input = strings.binstring2buf(data);
      } else if (toString.call(data) === "[object ArrayBuffer]") {
        strm.input = new Uint8Array(data);
      } else {
        strm.input = data;
      }
      strm.next_in = 0;
      strm.avail_in = strm.input.length;
      do {
        if (strm.avail_out === 0) {
          strm.output = new utils.Buf8(chunkSize);
          strm.next_out = 0;
          strm.avail_out = chunkSize;
        }
        status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);
        if (status === c.Z_NEED_DICT && dictionary) {
          status = zlib_inflate.inflateSetDictionary(this.strm, dictionary);
        }
        if (status === c.Z_BUF_ERROR && allowBufError === true) {
          status = c.Z_OK;
          allowBufError = false;
        }
        if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
          this.onEnd(status);
          this.ended = true;
          return false;
        }
        if (strm.next_out) {
          if (strm.avail_out === 0 || status === c.Z_STREAM_END || strm.avail_in === 0 && (_mode === c.Z_FINISH || _mode === c.Z_SYNC_FLUSH)) {
            if (this.options.to === "string") {
              next_out_utf8 = strings.utf8border(strm.output, strm.next_out);
              tail = strm.next_out - next_out_utf8;
              utf8str = strings.buf2string(strm.output, next_out_utf8);
              strm.next_out = tail;
              strm.avail_out = chunkSize - tail;
              if (tail) {
                utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0);
              }
              this.onData(utf8str);
            } else {
              this.onData(utils.shrinkBuf(strm.output, strm.next_out));
            }
          }
        }
        if (strm.avail_in === 0 && strm.avail_out === 0) {
          allowBufError = true;
        }
      } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== c.Z_STREAM_END);
      if (status === c.Z_STREAM_END) {
        _mode = c.Z_FINISH;
      }
      if (_mode === c.Z_FINISH) {
        status = zlib_inflate.inflateEnd(this.strm);
        this.onEnd(status);
        this.ended = true;
        return status === c.Z_OK;
      }
      if (_mode === c.Z_SYNC_FLUSH) {
        this.onEnd(c.Z_OK);
        strm.avail_out = 0;
        return true;
      }
      return true;
    };
    Inflate.prototype.onData = function(chunk) {
      this.chunks.push(chunk);
    };
    Inflate.prototype.onEnd = function(status) {
      if (status === c.Z_OK) {
        if (this.options.to === "string") {
          this.result = this.chunks.join("");
        } else {
          this.result = utils.flattenChunks(this.chunks);
        }
      }
      this.chunks = [];
      this.err = status;
      this.msg = this.strm.msg;
    };
    function inflate(input, options) {
      var inflator = new Inflate(options);
      inflator.push(input, true);
      if (inflator.err) {
        throw inflator.msg || msg[inflator.err];
      }
      return inflator.result;
    }
    function inflateRaw(input, options) {
      options = options || {};
      options.raw = true;
      return inflate(input, options);
    }
    exports.Inflate = Inflate;
    exports.inflate = inflate;
    exports.inflateRaw = inflateRaw;
    exports.ungzip = inflate;
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/index.js
var require_pako = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/index.js"(exports, module) {
    "use strict";
    var assign = require_common().assign;
    var deflate = require_deflate2();
    var inflate = require_inflate2();
    var constants = require_constants();
    var pako = {};
    assign(pako, deflate, inflate, constants);
    module.exports = pako;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/flate.js
var require_flate = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/flate.js"(exports) {
    "use strict";
    var USE_TYPEDARRAY = typeof Uint8Array !== "undefined" && typeof Uint16Array !== "undefined" && typeof Uint32Array !== "undefined";
    var pako = require_pako();
    var utils = require_utils();
    var GenericWorker = require_GenericWorker();
    var ARRAY_TYPE = USE_TYPEDARRAY ? "uint8array" : "array";
    exports.magic = "\b\0";
    function FlateWorker(action, options) {
      GenericWorker.call(this, "FlateWorker/" + action);
      this._pako = null;
      this._pakoAction = action;
      this._pakoOptions = options;
      this.meta = {};
    }
    utils.inherits(FlateWorker, GenericWorker);
    FlateWorker.prototype.processChunk = function(chunk) {
      this.meta = chunk.meta;
      if (this._pako === null) {
        this._createPako();
      }
      this._pako.push(utils.transformTo(ARRAY_TYPE, chunk.data), false);
    };
    FlateWorker.prototype.flush = function() {
      GenericWorker.prototype.flush.call(this);
      if (this._pako === null) {
        this._createPako();
      }
      this._pako.push([], true);
    };
    FlateWorker.prototype.cleanUp = function() {
      GenericWorker.prototype.cleanUp.call(this);
      this._pako = null;
    };
    FlateWorker.prototype._createPako = function() {
      this._pako = new pako[this._pakoAction]({
        raw: true,
        level: this._pakoOptions.level || -1
        // default compression
      });
      var self2 = this;
      this._pako.onData = function(data) {
        self2.push({
          data,
          meta: self2.meta
        });
      };
    };
    exports.compressWorker = function(compressionOptions) {
      return new FlateWorker("Deflate", compressionOptions);
    };
    exports.uncompressWorker = function() {
      return new FlateWorker("Inflate", {});
    };
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/compressions.js
var require_compressions = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/compressions.js"(exports) {
    "use strict";
    var GenericWorker = require_GenericWorker();
    exports.STORE = {
      magic: "\0\0",
      compressWorker: function() {
        return new GenericWorker("STORE compression");
      },
      uncompressWorker: function() {
        return new GenericWorker("STORE decompression");
      }
    };
    exports.DEFLATE = require_flate();
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/signature.js
var require_signature = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/signature.js"(exports) {
    "use strict";
    exports.LOCAL_FILE_HEADER = "PK";
    exports.CENTRAL_FILE_HEADER = "PK";
    exports.CENTRAL_DIRECTORY_END = "PK";
    exports.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07";
    exports.ZIP64_CENTRAL_DIRECTORY_END = "PK";
    exports.DATA_DESCRIPTOR = "PK\x07\b";
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/generate/ZipFileWorker.js
var require_ZipFileWorker = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/generate/ZipFileWorker.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var GenericWorker = require_GenericWorker();
    var utf8 = require_utf8();
    var crc32 = require_crc32();
    var signature = require_signature();
    var decToHex = function(dec, bytes) {
      var hex = "", i;
      for (i = 0; i < bytes; i++) {
        hex += String.fromCharCode(dec & 255);
        dec = dec >>> 8;
      }
      return hex;
    };
    var generateUnixExternalFileAttr = function(unixPermissions, isDir) {
      var result = unixPermissions;
      if (!unixPermissions) {
        result = isDir ? 16893 : 33204;
      }
      return (result & 65535) << 16;
    };
    var generateDosExternalFileAttr = function(dosPermissions) {
      return (dosPermissions || 0) & 63;
    };
    var generateZipParts = function(streamInfo, streamedContent, streamingEnded, offset, platform2, encodeFileName) {
      var file = streamInfo["file"], compression = streamInfo["compression"], useCustomEncoding = encodeFileName !== utf8.utf8encode, encodedFileName = utils.transformTo("string", encodeFileName(file.name)), utfEncodedFileName = utils.transformTo("string", utf8.utf8encode(file.name)), comment = file.comment, encodedComment = utils.transformTo("string", encodeFileName(comment)), utfEncodedComment = utils.transformTo("string", utf8.utf8encode(comment)), useUTF8ForFileName = utfEncodedFileName.length !== file.name.length, useUTF8ForComment = utfEncodedComment.length !== comment.length, dosTime, dosDate, extraFields = "", unicodePathExtraField = "", unicodeCommentExtraField = "", dir = file.dir, date = file.date;
      var dataInfo = {
        crc32: 0,
        compressedSize: 0,
        uncompressedSize: 0
      };
      if (!streamedContent || streamingEnded) {
        dataInfo.crc32 = streamInfo["crc32"];
        dataInfo.compressedSize = streamInfo["compressedSize"];
        dataInfo.uncompressedSize = streamInfo["uncompressedSize"];
      }
      var bitflag = 0;
      if (streamedContent) {
        bitflag |= 8;
      }
      if (!useCustomEncoding && (useUTF8ForFileName || useUTF8ForComment)) {
        bitflag |= 2048;
      }
      var extFileAttr = 0;
      var versionMadeBy = 0;
      if (dir) {
        extFileAttr |= 16;
      }
      if (platform2 === "UNIX") {
        versionMadeBy = 798;
        extFileAttr |= generateUnixExternalFileAttr(file.unixPermissions, dir);
      } else {
        versionMadeBy = 20;
        extFileAttr |= generateDosExternalFileAttr(file.dosPermissions, dir);
      }
      dosTime = date.getUTCHours();
      dosTime = dosTime << 6;
      dosTime = dosTime | date.getUTCMinutes();
      dosTime = dosTime << 5;
      dosTime = dosTime | date.getUTCSeconds() / 2;
      dosDate = date.getUTCFullYear() - 1980;
      dosDate = dosDate << 4;
      dosDate = dosDate | date.getUTCMonth() + 1;
      dosDate = dosDate << 5;
      dosDate = dosDate | date.getUTCDate();
      if (useUTF8ForFileName) {
        unicodePathExtraField = // Version
        decToHex(1, 1) + // NameCRC32
        decToHex(crc32(encodedFileName), 4) + // UnicodeName
        utfEncodedFileName;
        extraFields += // Info-ZIP Unicode Path Extra Field
        "up" + // size
        decToHex(unicodePathExtraField.length, 2) + // content
        unicodePathExtraField;
      }
      if (useUTF8ForComment) {
        unicodeCommentExtraField = // Version
        decToHex(1, 1) + // CommentCRC32
        decToHex(crc32(encodedComment), 4) + // UnicodeName
        utfEncodedComment;
        extraFields += // Info-ZIP Unicode Path Extra Field
        "uc" + // size
        decToHex(unicodeCommentExtraField.length, 2) + // content
        unicodeCommentExtraField;
      }
      var header = "";
      header += "\n\0";
      header += decToHex(bitflag, 2);
      header += compression.magic;
      header += decToHex(dosTime, 2);
      header += decToHex(dosDate, 2);
      header += decToHex(dataInfo.crc32, 4);
      header += decToHex(dataInfo.compressedSize, 4);
      header += decToHex(dataInfo.uncompressedSize, 4);
      header += decToHex(encodedFileName.length, 2);
      header += decToHex(extraFields.length, 2);
      var fileRecord = signature.LOCAL_FILE_HEADER + header + encodedFileName + extraFields;
      var dirRecord = signature.CENTRAL_FILE_HEADER + // version made by (00: DOS)
      decToHex(versionMadeBy, 2) + // file header (common to file and central directory)
      header + // file comment length
      decToHex(encodedComment.length, 2) + // disk number start
      "\0\0\0\0" + // external file attributes
      decToHex(extFileAttr, 4) + // relative offset of local header
      decToHex(offset, 4) + // file name
      encodedFileName + // extra field
      extraFields + // file comment
      encodedComment;
      return {
        fileRecord,
        dirRecord
      };
    };
    var generateCentralDirectoryEnd = function(entriesCount, centralDirLength, localDirLength, comment, encodeFileName) {
      var dirEnd = "";
      var encodedComment = utils.transformTo("string", encodeFileName(comment));
      dirEnd = signature.CENTRAL_DIRECTORY_END + // number of this disk
      "\0\0\0\0" + // total number of entries in the central directory on this disk
      decToHex(entriesCount, 2) + // total number of entries in the central directory
      decToHex(entriesCount, 2) + // size of the central directory   4 bytes
      decToHex(centralDirLength, 4) + // offset of start of central directory with respect to the starting disk number
      decToHex(localDirLength, 4) + // .ZIP file comment length
      decToHex(encodedComment.length, 2) + // .ZIP file comment
      encodedComment;
      return dirEnd;
    };
    var generateDataDescriptors = function(streamInfo) {
      var descriptor = "";
      descriptor = signature.DATA_DESCRIPTOR + // crc-32                          4 bytes
      decToHex(streamInfo["crc32"], 4) + // compressed size                 4 bytes
      decToHex(streamInfo["compressedSize"], 4) + // uncompressed size               4 bytes
      decToHex(streamInfo["uncompressedSize"], 4);
      return descriptor;
    };
    function ZipFileWorker(streamFiles, comment, platform2, encodeFileName) {
      GenericWorker.call(this, "ZipFileWorker");
      this.bytesWritten = 0;
      this.zipComment = comment;
      this.zipPlatform = platform2;
      this.encodeFileName = encodeFileName;
      this.streamFiles = streamFiles;
      this.accumulate = false;
      this.contentBuffer = [];
      this.dirRecords = [];
      this.currentSourceOffset = 0;
      this.entriesCount = 0;
      this.currentFile = null;
      this._sources = [];
    }
    utils.inherits(ZipFileWorker, GenericWorker);
    ZipFileWorker.prototype.push = function(chunk) {
      var currentFilePercent = chunk.meta.percent || 0;
      var entriesCount = this.entriesCount;
      var remainingFiles = this._sources.length;
      if (this.accumulate) {
        this.contentBuffer.push(chunk);
      } else {
        this.bytesWritten += chunk.data.length;
        GenericWorker.prototype.push.call(this, {
          data: chunk.data,
          meta: {
            currentFile: this.currentFile,
            percent: entriesCount ? (currentFilePercent + 100 * (entriesCount - remainingFiles - 1)) / entriesCount : 100
          }
        });
      }
    };
    ZipFileWorker.prototype.openedSource = function(streamInfo) {
      this.currentSourceOffset = this.bytesWritten;
      this.currentFile = streamInfo["file"].name;
      var streamedContent = this.streamFiles && !streamInfo["file"].dir;
      if (streamedContent) {
        var record = generateZipParts(streamInfo, streamedContent, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
        this.push({
          data: record.fileRecord,
          meta: { percent: 0 }
        });
      } else {
        this.accumulate = true;
      }
    };
    ZipFileWorker.prototype.closedSource = function(streamInfo) {
      this.accumulate = false;
      var streamedContent = this.streamFiles && !streamInfo["file"].dir;
      var record = generateZipParts(streamInfo, streamedContent, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
      this.dirRecords.push(record.dirRecord);
      if (streamedContent) {
        this.push({
          data: generateDataDescriptors(streamInfo),
          meta: { percent: 100 }
        });
      } else {
        this.push({
          data: record.fileRecord,
          meta: { percent: 0 }
        });
        while (this.contentBuffer.length) {
          this.push(this.contentBuffer.shift());
        }
      }
      this.currentFile = null;
    };
    ZipFileWorker.prototype.flush = function() {
      var localDirLength = this.bytesWritten;
      for (var i = 0; i < this.dirRecords.length; i++) {
        this.push({
          data: this.dirRecords[i],
          meta: { percent: 100 }
        });
      }
      var centralDirLength = this.bytesWritten - localDirLength;
      var dirEnd = generateCentralDirectoryEnd(this.dirRecords.length, centralDirLength, localDirLength, this.zipComment, this.encodeFileName);
      this.push({
        data: dirEnd,
        meta: { percent: 100 }
      });
    };
    ZipFileWorker.prototype.prepareNextSource = function() {
      this.previous = this._sources.shift();
      this.openedSource(this.previous.streamInfo);
      if (this.isPaused) {
        this.previous.pause();
      } else {
        this.previous.resume();
      }
    };
    ZipFileWorker.prototype.registerPrevious = function(previous) {
      this._sources.push(previous);
      var self2 = this;
      previous.on("data", function(chunk) {
        self2.processChunk(chunk);
      });
      previous.on("end", function() {
        self2.closedSource(self2.previous.streamInfo);
        if (self2._sources.length) {
          self2.prepareNextSource();
        } else {
          self2.end();
        }
      });
      previous.on("error", function(e) {
        self2.error(e);
      });
      return this;
    };
    ZipFileWorker.prototype.resume = function() {
      if (!GenericWorker.prototype.resume.call(this)) {
        return false;
      }
      if (!this.previous && this._sources.length) {
        this.prepareNextSource();
        return true;
      }
      if (!this.previous && !this._sources.length && !this.generatedError) {
        this.end();
        return true;
      }
    };
    ZipFileWorker.prototype.error = function(e) {
      var sources = this._sources;
      if (!GenericWorker.prototype.error.call(this, e)) {
        return false;
      }
      for (var i = 0; i < sources.length; i++) {
        try {
          sources[i].error(e);
        } catch (e2) {
        }
      }
      return true;
    };
    ZipFileWorker.prototype.lock = function() {
      GenericWorker.prototype.lock.call(this);
      var sources = this._sources;
      for (var i = 0; i < sources.length; i++) {
        sources[i].lock();
      }
    };
    module.exports = ZipFileWorker;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/generate/index.js
var require_generate = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/generate/index.js"(exports) {
    "use strict";
    var compressions = require_compressions();
    var ZipFileWorker = require_ZipFileWorker();
    var getCompression = function(fileCompression, zipCompression) {
      var compressionName = fileCompression || zipCompression;
      var compression = compressions[compressionName];
      if (!compression) {
        throw new Error(compressionName + " is not a valid compression method !");
      }
      return compression;
    };
    exports.generateWorker = function(zip, options, comment) {
      var zipFileWorker = new ZipFileWorker(options.streamFiles, comment, options.platform, options.encodeFileName);
      var entriesCount = 0;
      try {
        zip.forEach(function(relativePath, file) {
          entriesCount++;
          var compression = getCompression(file.options.compression, options.compression);
          var compressionOptions = file.options.compressionOptions || options.compressionOptions || {};
          var dir = file.dir, date = file.date;
          file._compressWorker(compression, compressionOptions).withStreamInfo("file", {
            name: relativePath,
            dir,
            date,
            comment: file.comment || "",
            unixPermissions: file.unixPermissions,
            dosPermissions: file.dosPermissions
          }).pipe(zipFileWorker);
        });
        zipFileWorker.entriesCount = entriesCount;
      } catch (e) {
        zipFileWorker.error(e);
      }
      return zipFileWorker;
    };
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/nodejs/NodejsStreamInputAdapter.js
var require_NodejsStreamInputAdapter = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/nodejs/NodejsStreamInputAdapter.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var GenericWorker = require_GenericWorker();
    function NodejsStreamInputAdapter(filename, stream) {
      GenericWorker.call(this, "Nodejs stream input adapter for " + filename);
      this._upstreamEnded = false;
      this._bindStream(stream);
    }
    utils.inherits(NodejsStreamInputAdapter, GenericWorker);
    NodejsStreamInputAdapter.prototype._bindStream = function(stream) {
      var self2 = this;
      this._stream = stream;
      stream.pause();
      stream.on("data", function(chunk) {
        self2.push({
          data: chunk,
          meta: {
            percent: 0
          }
        });
      }).on("error", function(e) {
        if (self2.isPaused) {
          this.generatedError = e;
        } else {
          self2.error(e);
        }
      }).on("end", function() {
        if (self2.isPaused) {
          self2._upstreamEnded = true;
        } else {
          self2.end();
        }
      });
    };
    NodejsStreamInputAdapter.prototype.pause = function() {
      if (!GenericWorker.prototype.pause.call(this)) {
        return false;
      }
      this._stream.pause();
      return true;
    };
    NodejsStreamInputAdapter.prototype.resume = function() {
      if (!GenericWorker.prototype.resume.call(this)) {
        return false;
      }
      if (this._upstreamEnded) {
        this.end();
      } else {
        this._stream.resume();
      }
      return true;
    };
    module.exports = NodejsStreamInputAdapter;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/object.js
var require_object = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/object.js"(exports, module) {
    "use strict";
    var utf8 = require_utf8();
    var utils = require_utils();
    var GenericWorker = require_GenericWorker();
    var StreamHelper = require_StreamHelper();
    var defaults = require_defaults();
    var CompressedObject = require_compressedObject();
    var ZipObject = require_zipObject();
    var generate = require_generate();
    var nodejsUtils = require_nodejsUtils();
    var NodejsStreamInputAdapter = require_NodejsStreamInputAdapter();
    var fileAdd = function(name, data, originalOptions) {
      var dataType = utils.getTypeOf(data), parent;
      var o = utils.extend(originalOptions || {}, defaults);
      o.date = o.date || /* @__PURE__ */ new Date();
      if (o.compression !== null) {
        o.compression = o.compression.toUpperCase();
      }
      if (typeof o.unixPermissions === "string") {
        o.unixPermissions = parseInt(o.unixPermissions, 8);
      }
      if (o.unixPermissions && o.unixPermissions & 16384) {
        o.dir = true;
      }
      if (o.dosPermissions && o.dosPermissions & 16) {
        o.dir = true;
      }
      if (o.dir) {
        name = forceTrailingSlash(name);
      }
      if (o.createFolders && (parent = parentFolder(name))) {
        folderAdd.call(this, parent, true);
      }
      var isUnicodeString = dataType === "string" && o.binary === false && o.base64 === false;
      if (!originalOptions || typeof originalOptions.binary === "undefined") {
        o.binary = !isUnicodeString;
      }
      var isCompressedEmpty = data instanceof CompressedObject && data.uncompressedSize === 0;
      if (isCompressedEmpty || o.dir || !data || data.length === 0) {
        o.base64 = false;
        o.binary = true;
        data = "";
        o.compression = "STORE";
        dataType = "string";
      }
      var zipObjectContent = null;
      if (data instanceof CompressedObject || data instanceof GenericWorker) {
        zipObjectContent = data;
      } else if (nodejsUtils.isNode && nodejsUtils.isStream(data)) {
        zipObjectContent = new NodejsStreamInputAdapter(name, data);
      } else {
        zipObjectContent = utils.prepareContent(name, data, o.binary, o.optimizedBinaryString, o.base64);
      }
      var object = new ZipObject(name, zipObjectContent, o);
      this.files[name] = object;
    };
    var parentFolder = function(path) {
      if (path.slice(-1) === "/") {
        path = path.substring(0, path.length - 1);
      }
      var lastSlash = path.lastIndexOf("/");
      return lastSlash > 0 ? path.substring(0, lastSlash) : "";
    };
    var forceTrailingSlash = function(path) {
      if (path.slice(-1) !== "/") {
        path += "/";
      }
      return path;
    };
    var folderAdd = function(name, createFolders) {
      createFolders = typeof createFolders !== "undefined" ? createFolders : defaults.createFolders;
      name = forceTrailingSlash(name);
      if (!this.files[name]) {
        fileAdd.call(this, name, null, {
          dir: true,
          createFolders
        });
      }
      return this.files[name];
    };
    function isRegExp(object) {
      return Object.prototype.toString.call(object) === "[object RegExp]";
    }
    var out = {
      /**
       * @see loadAsync
       */
      load: function() {
        throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
      },
      /**
       * Call a callback function for each entry at this folder level.
       * @param {Function} cb the callback function:
       * function (relativePath, file) {...}
       * It takes 2 arguments : the relative path and the file.
       */
      forEach: function(cb) {
        var filename, relativePath, file;
        for (filename in this.files) {
          file = this.files[filename];
          relativePath = filename.slice(this.root.length, filename.length);
          if (relativePath && filename.slice(0, this.root.length) === this.root) {
            cb(relativePath, file);
          }
        }
      },
      /**
       * Filter nested files/folders with the specified function.
       * @param {Function} search the predicate to use :
       * function (relativePath, file) {...}
       * It takes 2 arguments : the relative path and the file.
       * @return {Array} An array of matching elements.
       */
      filter: function(search) {
        var result = [];
        this.forEach(function(relativePath, entry) {
          if (search(relativePath, entry)) {
            result.push(entry);
          }
        });
        return result;
      },
      /**
       * Add a file to the zip file, or search a file.
       * @param   {string|RegExp} name The name of the file to add (if data is defined),
       * the name of the file to find (if no data) or a regex to match files.
       * @param   {String|ArrayBuffer|Uint8Array|Buffer} data  The file data, either raw or base64 encoded
       * @param   {Object} o     File options
       * @return  {JSZip|Object|Array} this JSZip object (when adding a file),
       * a file (when searching by string) or an array of files (when searching by regex).
       */
      file: function(name, data, o) {
        if (arguments.length === 1) {
          if (isRegExp(name)) {
            var regexp = name;
            return this.filter(function(relativePath, file) {
              return !file.dir && regexp.test(relativePath);
            });
          } else {
            var obj = this.files[this.root + name];
            if (obj && !obj.dir) {
              return obj;
            } else {
              return null;
            }
          }
        } else {
          name = this.root + name;
          fileAdd.call(this, name, data, o);
        }
        return this;
      },
      /**
       * Add a directory to the zip file, or search.
       * @param   {String|RegExp} arg The name of the directory to add, or a regex to search folders.
       * @return  {JSZip} an object with the new directory as the root, or an array containing matching folders.
       */
      folder: function(arg) {
        if (!arg) {
          return this;
        }
        if (isRegExp(arg)) {
          return this.filter(function(relativePath, file) {
            return file.dir && arg.test(relativePath);
          });
        }
        var name = this.root + arg;
        var newFolder = folderAdd.call(this, name);
        var ret = this.clone();
        ret.root = newFolder.name;
        return ret;
      },
      /**
       * Delete a file, or a directory and all sub-files, from the zip
       * @param {string} name the name of the file to delete
       * @return {JSZip} this JSZip object
       */
      remove: function(name) {
        name = this.root + name;
        var file = this.files[name];
        if (!file) {
          if (name.slice(-1) !== "/") {
            name += "/";
          }
          file = this.files[name];
        }
        if (file && !file.dir) {
          delete this.files[name];
        } else {
          var kids = this.filter(function(relativePath, file2) {
            return file2.name.slice(0, name.length) === name;
          });
          for (var i = 0; i < kids.length; i++) {
            delete this.files[kids[i].name];
          }
        }
        return this;
      },
      /**
       * @deprecated This method has been removed in JSZip 3.0, please check the upgrade guide.
       */
      generate: function() {
        throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
      },
      /**
       * Generate the complete zip file as an internal stream.
       * @param {Object} options the options to generate the zip file :
       * - compression, "STORE" by default.
       * - type, "base64" by default. Values are : string, base64, uint8array, arraybuffer, blob.
       * @return {StreamHelper} the streamed zip file.
       */
      generateInternalStream: function(options) {
        var worker, opts = {};
        try {
          opts = utils.extend(options || {}, {
            streamFiles: false,
            compression: "STORE",
            compressionOptions: null,
            type: "",
            platform: "DOS",
            comment: null,
            mimeType: "application/zip",
            encodeFileName: utf8.utf8encode
          });
          opts.type = opts.type.toLowerCase();
          opts.compression = opts.compression.toUpperCase();
          if (opts.type === "binarystring") {
            opts.type = "string";
          }
          if (!opts.type) {
            throw new Error("No output type specified.");
          }
          utils.checkSupport(opts.type);
          if (opts.platform === "darwin" || opts.platform === "freebsd" || opts.platform === "linux" || opts.platform === "sunos") {
            opts.platform = "UNIX";
          }
          if (opts.platform === "win32") {
            opts.platform = "DOS";
          }
          var comment = opts.comment || this.comment || "";
          worker = generate.generateWorker(this, opts, comment);
        } catch (e) {
          worker = new GenericWorker("error");
          worker.error(e);
        }
        return new StreamHelper(worker, opts.type || "string", opts.mimeType);
      },
      /**
       * Generate the complete zip file asynchronously.
       * @see generateInternalStream
       */
      generateAsync: function(options, onUpdate) {
        return this.generateInternalStream(options).accumulate(onUpdate);
      },
      /**
       * Generate the complete zip file asynchronously.
       * @see generateInternalStream
       */
      generateNodeStream: function(options, onUpdate) {
        options = options || {};
        if (!options.type) {
          options.type = "nodebuffer";
        }
        return this.generateInternalStream(options).toNodejsStream(onUpdate);
      }
    };
    module.exports = out;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/reader/DataReader.js
var require_DataReader = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/reader/DataReader.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    function DataReader(data) {
      this.data = data;
      this.length = data.length;
      this.index = 0;
      this.zero = 0;
    }
    DataReader.prototype = {
      /**
       * Check that the offset will not go too far.
       * @param {string} offset the additional offset to check.
       * @throws {Error} an Error if the offset is out of bounds.
       */
      checkOffset: function(offset) {
        this.checkIndex(this.index + offset);
      },
      /**
       * Check that the specified index will not be too far.
       * @param {string} newIndex the index to check.
       * @throws {Error} an Error if the index is out of bounds.
       */
      checkIndex: function(newIndex) {
        if (this.length < this.zero + newIndex || newIndex < 0) {
          throw new Error("End of data reached (data length = " + this.length + ", asked index = " + newIndex + "). Corrupted zip ?");
        }
      },
      /**
       * Change the index.
       * @param {number} newIndex The new index.
       * @throws {Error} if the new index is out of the data.
       */
      setIndex: function(newIndex) {
        this.checkIndex(newIndex);
        this.index = newIndex;
      },
      /**
       * Skip the next n bytes.
       * @param {number} n the number of bytes to skip.
       * @throws {Error} if the new index is out of the data.
       */
      skip: function(n) {
        this.setIndex(this.index + n);
      },
      /**
       * Get the byte at the specified index.
       * @param {number} i the index to use.
       * @return {number} a byte.
       */
      byteAt: function() {
      },
      /**
       * Get the next number with a given byte size.
       * @param {number} size the number of bytes to read.
       * @return {number} the corresponding number.
       */
      readInt: function(size) {
        var result = 0, i;
        this.checkOffset(size);
        for (i = this.index + size - 1; i >= this.index; i--) {
          result = (result << 8) + this.byteAt(i);
        }
        this.index += size;
        return result;
      },
      /**
       * Get the next string with a given byte size.
       * @param {number} size the number of bytes to read.
       * @return {string} the corresponding string.
       */
      readString: function(size) {
        return utils.transformTo("string", this.readData(size));
      },
      /**
       * Get raw data without conversion, <size> bytes.
       * @param {number} size the number of bytes to read.
       * @return {Object} the raw data, implementation specific.
       */
      readData: function() {
      },
      /**
       * Find the last occurrence of a zip signature (4 bytes).
       * @param {string} sig the signature to find.
       * @return {number} the index of the last occurrence, -1 if not found.
       */
      lastIndexOfSignature: function() {
      },
      /**
       * Read the signature (4 bytes) at the current position and compare it with sig.
       * @param {string} sig the expected signature
       * @return {boolean} true if the signature matches, false otherwise.
       */
      readAndCheckSignature: function() {
      },
      /**
       * Get the next date.
       * @return {Date} the date.
       */
      readDate: function() {
        var dostime = this.readInt(4);
        return new Date(Date.UTC(
          (dostime >> 25 & 127) + 1980,
          // year
          (dostime >> 21 & 15) - 1,
          // month
          dostime >> 16 & 31,
          // day
          dostime >> 11 & 31,
          // hour
          dostime >> 5 & 63,
          // minute
          (dostime & 31) << 1
        ));
      }
    };
    module.exports = DataReader;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/reader/ArrayReader.js
var require_ArrayReader = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/reader/ArrayReader.js"(exports, module) {
    "use strict";
    var DataReader = require_DataReader();
    var utils = require_utils();
    function ArrayReader(data) {
      DataReader.call(this, data);
      for (var i = 0; i < this.data.length; i++) {
        data[i] = data[i] & 255;
      }
    }
    utils.inherits(ArrayReader, DataReader);
    ArrayReader.prototype.byteAt = function(i) {
      return this.data[this.zero + i];
    };
    ArrayReader.prototype.lastIndexOfSignature = function(sig) {
      var sig0 = sig.charCodeAt(0), sig1 = sig.charCodeAt(1), sig2 = sig.charCodeAt(2), sig3 = sig.charCodeAt(3);
      for (var i = this.length - 4; i >= 0; --i) {
        if (this.data[i] === sig0 && this.data[i + 1] === sig1 && this.data[i + 2] === sig2 && this.data[i + 3] === sig3) {
          return i - this.zero;
        }
      }
      return -1;
    };
    ArrayReader.prototype.readAndCheckSignature = function(sig) {
      var sig0 = sig.charCodeAt(0), sig1 = sig.charCodeAt(1), sig2 = sig.charCodeAt(2), sig3 = sig.charCodeAt(3), data = this.readData(4);
      return sig0 === data[0] && sig1 === data[1] && sig2 === data[2] && sig3 === data[3];
    };
    ArrayReader.prototype.readData = function(size) {
      this.checkOffset(size);
      if (size === 0) {
        return [];
      }
      var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
      this.index += size;
      return result;
    };
    module.exports = ArrayReader;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/reader/StringReader.js
var require_StringReader = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/reader/StringReader.js"(exports, module) {
    "use strict";
    var DataReader = require_DataReader();
    var utils = require_utils();
    function StringReader(data) {
      DataReader.call(this, data);
    }
    utils.inherits(StringReader, DataReader);
    StringReader.prototype.byteAt = function(i) {
      return this.data.charCodeAt(this.zero + i);
    };
    StringReader.prototype.lastIndexOfSignature = function(sig) {
      return this.data.lastIndexOf(sig) - this.zero;
    };
    StringReader.prototype.readAndCheckSignature = function(sig) {
      var data = this.readData(4);
      return sig === data;
    };
    StringReader.prototype.readData = function(size) {
      this.checkOffset(size);
      var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
      this.index += size;
      return result;
    };
    module.exports = StringReader;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/reader/Uint8ArrayReader.js
var require_Uint8ArrayReader = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/reader/Uint8ArrayReader.js"(exports, module) {
    "use strict";
    var ArrayReader = require_ArrayReader();
    var utils = require_utils();
    function Uint8ArrayReader(data) {
      ArrayReader.call(this, data);
    }
    utils.inherits(Uint8ArrayReader, ArrayReader);
    Uint8ArrayReader.prototype.readData = function(size) {
      this.checkOffset(size);
      if (size === 0) {
        return new Uint8Array(0);
      }
      var result = this.data.subarray(this.zero + this.index, this.zero + this.index + size);
      this.index += size;
      return result;
    };
    module.exports = Uint8ArrayReader;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/reader/NodeBufferReader.js
var require_NodeBufferReader = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/reader/NodeBufferReader.js"(exports, module) {
    "use strict";
    var Uint8ArrayReader = require_Uint8ArrayReader();
    var utils = require_utils();
    function NodeBufferReader(data) {
      Uint8ArrayReader.call(this, data);
    }
    utils.inherits(NodeBufferReader, Uint8ArrayReader);
    NodeBufferReader.prototype.readData = function(size) {
      this.checkOffset(size);
      var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
      this.index += size;
      return result;
    };
    module.exports = NodeBufferReader;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/reader/readerFor.js
var require_readerFor = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/reader/readerFor.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var support = require_support();
    var ArrayReader = require_ArrayReader();
    var StringReader = require_StringReader();
    var NodeBufferReader = require_NodeBufferReader();
    var Uint8ArrayReader = require_Uint8ArrayReader();
    module.exports = function(data) {
      var type2 = utils.getTypeOf(data);
      utils.checkSupport(type2);
      if (type2 === "string" && !support.uint8array) {
        return new StringReader(data);
      }
      if (type2 === "nodebuffer") {
        return new NodeBufferReader(data);
      }
      if (support.uint8array) {
        return new Uint8ArrayReader(utils.transformTo("uint8array", data));
      }
      return new ArrayReader(utils.transformTo("array", data));
    };
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/zipEntry.js
var require_zipEntry = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/zipEntry.js"(exports, module) {
    "use strict";
    var readerFor = require_readerFor();
    var utils = require_utils();
    var CompressedObject = require_compressedObject();
    var crc32fn = require_crc32();
    var utf8 = require_utf8();
    var compressions = require_compressions();
    var support = require_support();
    var MADE_BY_DOS = 0;
    var MADE_BY_UNIX = 3;
    var findCompression = function(compressionMethod) {
      for (var method in compressions) {
        if (!Object.prototype.hasOwnProperty.call(compressions, method)) {
          continue;
        }
        if (compressions[method].magic === compressionMethod) {
          return compressions[method];
        }
      }
      return null;
    };
    function ZipEntry(options, loadOptions) {
      this.options = options;
      this.loadOptions = loadOptions;
    }
    ZipEntry.prototype = {
      /**
       * say if the file is encrypted.
       * @return {boolean} true if the file is encrypted, false otherwise.
       */
      isEncrypted: function() {
        return (this.bitFlag & 1) === 1;
      },
      /**
       * say if the file has utf-8 filename/comment.
       * @return {boolean} true if the filename/comment is in utf-8, false otherwise.
       */
      useUTF8: function() {
        return (this.bitFlag & 2048) === 2048;
      },
      /**
       * Read the local part of a zip file and add the info in this object.
       * @param {DataReader} reader the reader to use.
       */
      readLocalPart: function(reader) {
        var compression, localExtraFieldsLength;
        reader.skip(22);
        this.fileNameLength = reader.readInt(2);
        localExtraFieldsLength = reader.readInt(2);
        this.fileName = reader.readData(this.fileNameLength);
        reader.skip(localExtraFieldsLength);
        if (this.compressedSize === -1 || this.uncompressedSize === -1) {
          throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
        }
        compression = findCompression(this.compressionMethod);
        if (compression === null) {
          throw new Error("Corrupted zip : compression " + utils.pretty(this.compressionMethod) + " unknown (inner file : " + utils.transformTo("string", this.fileName) + ")");
        }
        this.decompressed = new CompressedObject(this.compressedSize, this.uncompressedSize, this.crc32, compression, reader.readData(this.compressedSize));
      },
      /**
       * Read the central part of a zip file and add the info in this object.
       * @param {DataReader} reader the reader to use.
       */
      readCentralPart: function(reader) {
        this.versionMadeBy = reader.readInt(2);
        reader.skip(2);
        this.bitFlag = reader.readInt(2);
        this.compressionMethod = reader.readString(2);
        this.date = reader.readDate();
        this.crc32 = reader.readInt(4);
        this.compressedSize = reader.readInt(4);
        this.uncompressedSize = reader.readInt(4);
        var fileNameLength = reader.readInt(2);
        this.extraFieldsLength = reader.readInt(2);
        this.fileCommentLength = reader.readInt(2);
        this.diskNumberStart = reader.readInt(2);
        this.internalFileAttributes = reader.readInt(2);
        this.externalFileAttributes = reader.readInt(4);
        this.localHeaderOffset = reader.readInt(4);
        if (this.isEncrypted()) {
          throw new Error("Encrypted zip are not supported");
        }
        reader.skip(fileNameLength);
        this.readExtraFields(reader);
        this.parseZIP64ExtraField(reader);
        this.fileComment = reader.readData(this.fileCommentLength);
      },
      /**
       * Parse the external file attributes and get the unix/dos permissions.
       */
      processAttributes: function() {
        this.unixPermissions = null;
        this.dosPermissions = null;
        var madeBy = this.versionMadeBy >> 8;
        this.dir = this.externalFileAttributes & 16 ? true : false;
        if (madeBy === MADE_BY_DOS) {
          this.dosPermissions = this.externalFileAttributes & 63;
        }
        if (madeBy === MADE_BY_UNIX) {
          this.unixPermissions = this.externalFileAttributes >> 16 & 65535;
        }
        if (!this.dir && this.fileNameStr.slice(-1) === "/") {
          this.dir = true;
        }
      },
      /**
       * Parse the ZIP64 extra field and merge the info in the current ZipEntry.
       * @param {DataReader} reader the reader to use.
       */
      parseZIP64ExtraField: function() {
        if (!this.extraFields[1]) {
          return;
        }
        var extraReader = readerFor(this.extraFields[1].value);
        if (this.uncompressedSize === utils.MAX_VALUE_32BITS) {
          this.uncompressedSize = extraReader.readInt(8);
        }
        if (this.compressedSize === utils.MAX_VALUE_32BITS) {
          this.compressedSize = extraReader.readInt(8);
        }
        if (this.localHeaderOffset === utils.MAX_VALUE_32BITS) {
          this.localHeaderOffset = extraReader.readInt(8);
        }
        if (this.diskNumberStart === utils.MAX_VALUE_32BITS) {
          this.diskNumberStart = extraReader.readInt(4);
        }
      },
      /**
       * Read the central part of a zip file and add the info in this object.
       * @param {DataReader} reader the reader to use.
       */
      readExtraFields: function(reader) {
        var end = reader.index + this.extraFieldsLength, extraFieldId, extraFieldLength, extraFieldValue;
        if (!this.extraFields) {
          this.extraFields = {};
        }
        while (reader.index + 4 < end) {
          extraFieldId = reader.readInt(2);
          extraFieldLength = reader.readInt(2);
          extraFieldValue = reader.readData(extraFieldLength);
          this.extraFields[extraFieldId] = {
            id: extraFieldId,
            length: extraFieldLength,
            value: extraFieldValue
          };
        }
        reader.setIndex(end);
      },
      /**
       * Apply an UTF8 transformation if needed.
       */
      handleUTF8: function() {
        var decodeParamType = support.uint8array ? "uint8array" : "array";
        if (this.useUTF8()) {
          this.fileNameStr = utf8.utf8decode(this.fileName);
          this.fileCommentStr = utf8.utf8decode(this.fileComment);
        } else {
          var upath = this.findExtraFieldUnicodePath();
          if (upath !== null) {
            this.fileNameStr = upath;
          } else {
            var fileNameByteArray = utils.transformTo(decodeParamType, this.fileName);
            this.fileNameStr = this.loadOptions.decodeFileName(fileNameByteArray);
          }
          var ucomment = this.findExtraFieldUnicodeComment();
          if (ucomment !== null) {
            this.fileCommentStr = ucomment;
          } else {
            var commentByteArray = utils.transformTo(decodeParamType, this.fileComment);
            this.fileCommentStr = this.loadOptions.decodeFileName(commentByteArray);
          }
        }
      },
      /**
       * Find the unicode path declared in the extra field, if any.
       * @return {String} the unicode path, null otherwise.
       */
      findExtraFieldUnicodePath: function() {
        var upathField = this.extraFields[28789];
        if (upathField) {
          var extraReader = readerFor(upathField.value);
          if (extraReader.readInt(1) !== 1) {
            return null;
          }
          if (crc32fn(this.fileName) !== extraReader.readInt(4)) {
            return null;
          }
          return utf8.utf8decode(extraReader.readData(upathField.length - 5));
        }
        return null;
      },
      /**
       * Find the unicode comment declared in the extra field, if any.
       * @return {String} the unicode comment, null otherwise.
       */
      findExtraFieldUnicodeComment: function() {
        var ucommentField = this.extraFields[25461];
        if (ucommentField) {
          var extraReader = readerFor(ucommentField.value);
          if (extraReader.readInt(1) !== 1) {
            return null;
          }
          if (crc32fn(this.fileComment) !== extraReader.readInt(4)) {
            return null;
          }
          return utf8.utf8decode(extraReader.readData(ucommentField.length - 5));
        }
        return null;
      }
    };
    module.exports = ZipEntry;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/zipEntries.js
var require_zipEntries = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/zipEntries.js"(exports, module) {
    "use strict";
    var readerFor = require_readerFor();
    var utils = require_utils();
    var sig = require_signature();
    var ZipEntry = require_zipEntry();
    var support = require_support();
    function ZipEntries(loadOptions) {
      this.files = [];
      this.loadOptions = loadOptions;
    }
    ZipEntries.prototype = {
      /**
       * Check that the reader is on the specified signature.
       * @param {string} expectedSignature the expected signature.
       * @throws {Error} if it is an other signature.
       */
      checkSignature: function(expectedSignature) {
        if (!this.reader.readAndCheckSignature(expectedSignature)) {
          this.reader.index -= 4;
          var signature = this.reader.readString(4);
          throw new Error("Corrupted zip or bug: unexpected signature (" + utils.pretty(signature) + ", expected " + utils.pretty(expectedSignature) + ")");
        }
      },
      /**
       * Check if the given signature is at the given index.
       * @param {number} askedIndex the index to check.
       * @param {string} expectedSignature the signature to expect.
       * @return {boolean} true if the signature is here, false otherwise.
       */
      isSignature: function(askedIndex, expectedSignature) {
        var currentIndex = this.reader.index;
        this.reader.setIndex(askedIndex);
        var signature = this.reader.readString(4);
        var result = signature === expectedSignature;
        this.reader.setIndex(currentIndex);
        return result;
      },
      /**
       * Read the end of the central directory.
       */
      readBlockEndOfCentral: function() {
        this.diskNumber = this.reader.readInt(2);
        this.diskWithCentralDirStart = this.reader.readInt(2);
        this.centralDirRecordsOnThisDisk = this.reader.readInt(2);
        this.centralDirRecords = this.reader.readInt(2);
        this.centralDirSize = this.reader.readInt(4);
        this.centralDirOffset = this.reader.readInt(4);
        this.zipCommentLength = this.reader.readInt(2);
        var zipComment = this.reader.readData(this.zipCommentLength);
        var decodeParamType = support.uint8array ? "uint8array" : "array";
        var decodeContent = utils.transformTo(decodeParamType, zipComment);
        this.zipComment = this.loadOptions.decodeFileName(decodeContent);
      },
      /**
       * Read the end of the Zip 64 central directory.
       * Not merged with the method readEndOfCentral :
       * The end of central can coexist with its Zip64 brother,
       * I don't want to read the wrong number of bytes !
       */
      readBlockZip64EndOfCentral: function() {
        this.zip64EndOfCentralSize = this.reader.readInt(8);
        this.reader.skip(4);
        this.diskNumber = this.reader.readInt(4);
        this.diskWithCentralDirStart = this.reader.readInt(4);
        this.centralDirRecordsOnThisDisk = this.reader.readInt(8);
        this.centralDirRecords = this.reader.readInt(8);
        this.centralDirSize = this.reader.readInt(8);
        this.centralDirOffset = this.reader.readInt(8);
        this.zip64ExtensibleData = {};
        var extraDataSize = this.zip64EndOfCentralSize - 44, index = 0, extraFieldId, extraFieldLength, extraFieldValue;
        while (index < extraDataSize) {
          extraFieldId = this.reader.readInt(2);
          extraFieldLength = this.reader.readInt(4);
          extraFieldValue = this.reader.readData(extraFieldLength);
          this.zip64ExtensibleData[extraFieldId] = {
            id: extraFieldId,
            length: extraFieldLength,
            value: extraFieldValue
          };
        }
      },
      /**
       * Read the end of the Zip 64 central directory locator.
       */
      readBlockZip64EndOfCentralLocator: function() {
        this.diskWithZip64CentralDirStart = this.reader.readInt(4);
        this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8);
        this.disksCount = this.reader.readInt(4);
        if (this.disksCount > 1) {
          throw new Error("Multi-volumes zip are not supported");
        }
      },
      /**
       * Read the local files, based on the offset read in the central part.
       */
      readLocalFiles: function() {
        var i, file;
        for (i = 0; i < this.files.length; i++) {
          file = this.files[i];
          this.reader.setIndex(file.localHeaderOffset);
          this.checkSignature(sig.LOCAL_FILE_HEADER);
          file.readLocalPart(this.reader);
          file.handleUTF8();
          file.processAttributes();
        }
      },
      /**
       * Read the central directory.
       */
      readCentralDir: function() {
        var file;
        this.reader.setIndex(this.centralDirOffset);
        while (this.reader.readAndCheckSignature(sig.CENTRAL_FILE_HEADER)) {
          file = new ZipEntry({
            zip64: this.zip64
          }, this.loadOptions);
          file.readCentralPart(this.reader);
          this.files.push(file);
        }
        if (this.centralDirRecords !== this.files.length) {
          if (this.centralDirRecords !== 0 && this.files.length === 0) {
            throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
          } else {
          }
        }
      },
      /**
       * Read the end of central directory.
       */
      readEndOfCentral: function() {
        var offset = this.reader.lastIndexOfSignature(sig.CENTRAL_DIRECTORY_END);
        if (offset < 0) {
          var isGarbage = !this.isSignature(0, sig.LOCAL_FILE_HEADER);
          if (isGarbage) {
            throw new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");
          } else {
            throw new Error("Corrupted zip: can't find end of central directory");
          }
        }
        this.reader.setIndex(offset);
        var endOfCentralDirOffset = offset;
        this.checkSignature(sig.CENTRAL_DIRECTORY_END);
        this.readBlockEndOfCentral();
        if (this.diskNumber === utils.MAX_VALUE_16BITS || this.diskWithCentralDirStart === utils.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === utils.MAX_VALUE_16BITS || this.centralDirRecords === utils.MAX_VALUE_16BITS || this.centralDirSize === utils.MAX_VALUE_32BITS || this.centralDirOffset === utils.MAX_VALUE_32BITS) {
          this.zip64 = true;
          offset = this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
          if (offset < 0) {
            throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
          }
          this.reader.setIndex(offset);
          this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
          this.readBlockZip64EndOfCentralLocator();
          if (!this.isSignature(this.relativeOffsetEndOfZip64CentralDir, sig.ZIP64_CENTRAL_DIRECTORY_END)) {
            this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);
            if (this.relativeOffsetEndOfZip64CentralDir < 0) {
              throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
            }
          }
          this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir);
          this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);
          this.readBlockZip64EndOfCentral();
        }
        var expectedEndOfCentralDirOffset = this.centralDirOffset + this.centralDirSize;
        if (this.zip64) {
          expectedEndOfCentralDirOffset += 20;
          expectedEndOfCentralDirOffset += 12 + this.zip64EndOfCentralSize;
        }
        var extraBytes = endOfCentralDirOffset - expectedEndOfCentralDirOffset;
        if (extraBytes > 0) {
          if (this.isSignature(endOfCentralDirOffset, sig.CENTRAL_FILE_HEADER)) {
          } else {
            this.reader.zero = extraBytes;
          }
        } else if (extraBytes < 0) {
          throw new Error("Corrupted zip: missing " + Math.abs(extraBytes) + " bytes.");
        }
      },
      prepareReader: function(data) {
        this.reader = readerFor(data);
      },
      /**
       * Read a zip file and create ZipEntries.
       * @param {String|ArrayBuffer|Uint8Array|Buffer} data the binary string representing a zip file.
       */
      load: function(data) {
        this.prepareReader(data);
        this.readEndOfCentral();
        this.readCentralDir();
        this.readLocalFiles();
      }
    };
    module.exports = ZipEntries;
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/load.js
var require_load = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/load.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var external = require_external();
    var utf8 = require_utf8();
    var ZipEntries = require_zipEntries();
    var Crc32Probe = require_Crc32Probe();
    var nodejsUtils = require_nodejsUtils();
    function checkEntryCRC32(zipEntry) {
      return new external.Promise(function(resolve8, reject) {
        var worker = zipEntry.decompressed.getContentWorker().pipe(new Crc32Probe());
        worker.on("error", function(e) {
          reject(e);
        }).on("end", function() {
          if (worker.streamInfo.crc32 !== zipEntry.decompressed.crc32) {
            reject(new Error("Corrupted zip : CRC32 mismatch"));
          } else {
            resolve8();
          }
        }).resume();
      });
    }
    module.exports = function(data, options) {
      var zip = this;
      options = utils.extend(options || {}, {
        base64: false,
        checkCRC32: false,
        optimizedBinaryString: false,
        createFolders: false,
        decodeFileName: utf8.utf8decode
      });
      if (nodejsUtils.isNode && nodejsUtils.isStream(data)) {
        return external.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file."));
      }
      return utils.prepareContent("the loaded zip file", data, true, options.optimizedBinaryString, options.base64).then(function(data2) {
        var zipEntries = new ZipEntries(options);
        zipEntries.load(data2);
        return zipEntries;
      }).then(function checkCRC32(zipEntries) {
        var promises = [external.Promise.resolve(zipEntries)];
        var files = zipEntries.files;
        if (options.checkCRC32) {
          for (var i = 0; i < files.length; i++) {
            promises.push(checkEntryCRC32(files[i]));
          }
        }
        return external.Promise.all(promises);
      }).then(function addFiles(results) {
        var zipEntries = results.shift();
        var files = zipEntries.files;
        for (var i = 0; i < files.length; i++) {
          var input = files[i];
          var unsafeName = input.fileNameStr;
          var safeName = utils.resolve(input.fileNameStr);
          zip.file(safeName, input.decompressed, {
            binary: true,
            optimizedBinaryString: true,
            date: input.date,
            dir: input.dir,
            comment: input.fileCommentStr.length ? input.fileCommentStr : null,
            unixPermissions: input.unixPermissions,
            dosPermissions: input.dosPermissions,
            createFolders: options.createFolders
          });
          if (!input.dir) {
            zip.file(safeName).unsafeOriginalName = unsafeName;
          }
        }
        if (zipEntries.zipComment.length) {
          zip.comment = zipEntries.zipComment;
        }
        return zip;
      });
    };
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/index.js
var require_lib3 = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/lib/index.js"(exports, module) {
    "use strict";
    function JSZip2() {
      if (!(this instanceof JSZip2)) {
        return new JSZip2();
      }
      if (arguments.length) {
        throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
      }
      this.files = /* @__PURE__ */ Object.create(null);
      this.comment = null;
      this.root = "";
      this.clone = function() {
        var newObj = new JSZip2();
        for (var i in this) {
          if (typeof this[i] !== "function") {
            newObj[i] = this[i];
          }
        }
        return newObj;
      };
    }
    JSZip2.prototype = require_object();
    JSZip2.prototype.loadAsync = require_load();
    JSZip2.support = require_support();
    JSZip2.defaults = require_defaults();
    JSZip2.version = "3.10.1";
    JSZip2.loadAsync = function(content, options) {
      return new JSZip2().loadAsync(content, options);
    };
    JSZip2.external = require_external();
    module.exports = JSZip2;
  }
});

// ../../packages/diagnostics/dist/index.mjs
import { open, readFile as readFile6, readdir as readdir3, stat as stat5 } from "node:fs/promises";
import { join as join6 } from "node:path";
import { arch, hostname, platform, release, totalmem, type } from "node:os";
function redactJsonValue(value, opts = {}) {
  if (Array.isArray(value)) return value.map((entry) => redactJsonValue(entry, opts));
  if (value !== null && typeof value === "object") {
    const out = {};
    for (const [key, raw] of Object.entries(value)) {
      if (SENSITIVE_KEY_RE.test(key) && typeof raw === "string" && raw.length > 0) {
        out[key] = REDACTED;
      } else {
        out[key] = redactJsonValue(raw, opts);
      }
    }
    return out;
  }
  if (typeof value === "string") return redactText(value, opts);
  return value;
}
function redactText(text, opts = {}) {
  let out = text.replace(HTTP_AUTH_SCHEME_RE, (_match, scheme) => `${scheme} ${REDACTED}`);
  out = out.replace(URL_QUERY_SECRET_RE, (_match, sep, name, eq) => `${sep}${name}${eq}${REDACTED}`);
  out = out.replace(BARE_SECRET_RE, (_match, lead, name, sep) => `${lead}${name}${sep}${REDACTED}`);
  const username = opts.username;
  if (username && username.length > 1) {
    const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`/Users/${escaped}(?=[/"\\s])`, "g"), "/Users/<USER>");
    out = out.replace(new RegExp(`\\\\Users\\\\${escaped}(?=[\\\\"\\s])`, "g"), "\\Users\\<USER>");
    out = out.replace(new RegExp(`/home/${escaped}(?=[/"\\s])`, "g"), "/home/<USER>");
  }
  return out;
}
function redactJsonText(text, opts = {}) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return redactText(text, opts);
  }
  return JSON.stringify(redactJsonValue(parsed, opts), null, 2);
}
async function readMaybeTail(absolutePath, tailBytes) {
  if (tailBytes == null || tailBytes <= 0) {
    const buf = await readFile6(absolutePath);
    return { text: buf.toString("utf8"), bytes: buf.byteLength };
  }
  const info = await stat5(absolutePath);
  if (info.size <= tailBytes) {
    const buf = await readFile6(absolutePath);
    return { text: buf.toString("utf8"), bytes: buf.byteLength };
  }
  const fd = await open(absolutePath, "r");
  try {
    const start = info.size - tailBytes;
    const buffer = Buffer.alloc(tailBytes);
    const { bytesRead } = await fd.read(buffer, 0, tailBytes, start);
    return { text: buffer.subarray(0, bytesRead).toString("utf8"), bytes: bytesRead };
  } finally {
    await fd.close();
  }
}
async function collectLogSource(source, opts = {}) {
  try {
    const { text, bytes } = await readMaybeTail(source.absolutePath, source.tailBytes);
    const redacted = source.kind === "json" ? redactJsonText(text, opts) : redactText(text, opts);
    return { name: source.name, absolutePath: source.absolutePath, content: redacted, bytes };
  } catch (error) {
    return {
      name: source.name,
      absolutePath: source.absolutePath,
      content: null,
      bytes: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
async function collectLogSources(sources, opts = {}) {
  return await Promise.all(sources.map((source) => collectLogSource(source, opts)));
}
async function findMacOSCrashReports(lookup) {
  if (process.platform !== "darwin") return [];
  const within = (lookup.withinDays ?? 7) * 24 * 60 * 60 * 1e3;
  const cutoff = Date.now() - within;
  const max = lookup.maxReports ?? 20;
  const dirs = lookup.searchDirs ?? [
    ...lookup.homeDir ? [join6(lookup.homeDir, "Library/Logs/DiagnosticReports")] : [],
    ...DEFAULT_CRASH_DIRS_DARWIN
  ];
  const matches = lookup.matchSubstrings.map((entry) => entry.toLowerCase());
  const found = [];
  for (const dir of dirs) {
    let entries;
    try {
      entries = await readdir3(dir);
    } catch {
      continue;
    }
    for (const entry of entries) {
      const lower = entry.toLowerCase();
      if (!matches.some((needle) => lower.includes(needle))) continue;
      const absolutePath = join6(dir, entry);
      try {
        const info = await stat5(absolutePath);
        if (!info.isFile()) continue;
        if (info.mtimeMs < cutoff) continue;
        found.push({ absolutePath, mtimeMs: info.mtimeMs, name: entry });
      } catch {
        continue;
      }
    }
  }
  found.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return found.slice(0, max).map(({ absolutePath, name }) => ({
    name: `crash-reports/${name}`,
    absolutePath,
    kind: "text"
  }));
}
function buildManifest(context, files) {
  const warnings = [...context.warnings ?? []];
  for (const file of files) {
    if (file.error) warnings.push(`${file.name}: ${file.error}`);
  }
  return {
    exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
    app: context.app,
    source: context.source,
    namespace: context.namespace,
    endpoint: context.endpoint,
    daemonReachable: context.daemonReachable,
    files: files.map((file) => ({
      name: file.name,
      absolutePath: file.absolutePath,
      bytes: file.bytes,
      error: file.error
    })),
    warnings,
    extra: context.extra
  };
}
function buildMachineInfo(username) {
  return {
    hostname: hostname(),
    platform: platform(),
    release: release(),
    arch: arch(),
    type: type(),
    totalMemoryBytes: totalmem(),
    nodeVersion: process.version,
    pid: process.pid,
    ppid: process.ppid,
    cwd: process.cwd(),
    username
  };
}
function diagnosticsFileName(prefix, now = /* @__PURE__ */ new Date()) {
  const iso = now.toISOString().replace(/[:.]/g, "-").replace(/-\d{3}Z$/, "Z");
  return `${prefix}-${iso}.zip`;
}
function placeholderForMissing(file) {
  return `${PLACEHOLDER_PREFIX}${file.error ?? "unknown error"}
`;
}
async function buildDiagnosticsZip(input) {
  const redaction = input.redaction ?? {};
  const sources = [...input.sources];
  if (input.crashReports != null) {
    const crashes = await findMacOSCrashReports(input.crashReports);
    sources.push(...crashes);
  }
  const collected = await collectLogSources(sources, redaction);
  const manifest = buildManifest(input.context, collected);
  const machineInfo = buildMachineInfo(redaction.username);
  const zip = new import_jszip.default();
  for (const file of collected) {
    zip.file(file.name, file.content ?? placeholderForMissing(file));
  }
  zip.file("summary/manifest.json", JSON.stringify(redactJsonValue(manifest, redaction), null, 2));
  zip.file("summary/machine-info.json", JSON.stringify(redactJsonValue(machineInfo, redaction), null, 2));
  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 }
  });
  return { zip: buffer, manifest, machineInfo };
}
var import_jszip, DIAGNOSTICS_FILENAME_PREFIX, SENSITIVE_KEY_RE, URL_QUERY_SECRET_RE, BARE_SECRET_RE, HTTP_AUTH_SCHEME_RE, REDACTED, DEFAULT_CRASH_DIRS_DARWIN, PLACEHOLDER_PREFIX;
var init_dist5 = __esm({
  "../../packages/diagnostics/dist/index.mjs"() {
    "use strict";
    import_jszip = __toESM(require_lib3(), 1);
    DIAGNOSTICS_FILENAME_PREFIX = "open-design-diagnostics";
    SENSITIVE_KEY_RE = /token|password|secret|key|dsn|authorization|cookie/i;
    URL_QUERY_SECRET_RE = /([?&#])(token|password|secret|key|dsn|api[_-]?key|auth|access_token|refresh_token|id_token)(=)([^&\s#"']*)/gi;
    BARE_SECRET_RE = /(^|[\s,;])(access_token|refresh_token|id_token|api[_-]?key|password|secret|token|auth(?:orization)?)(=|:\s*)([^\s,;"']+)/gi;
    HTTP_AUTH_SCHEME_RE = /\b(Bearer|Token|Basic)\s+([A-Za-z0-9._~\-+/=:]{4,})/gi;
    REDACTED = "[REDACTED]";
    DEFAULT_CRASH_DIRS_DARWIN = [
      "/Library/Logs/DiagnosticReports"
    ];
    PLACEHOLDER_PREFIX = "; file unavailable: ";
  }
});

// ../desktop/dist/main/diagnostics.js
import { writeFile as writeFile7 } from "node:fs/promises";
import { homedir as homedir2, userInfo } from "node:os";
import { dirname as dirname7, join as join7 } from "node:path";
import { BrowserWindow as BrowserWindow3, app as app2, dialog as dialog3, ipcMain as ipcMain2, shell as shell2 } from "electron";
function safeUsername() {
  try {
    const info = userInfo();
    return info?.username && info.username.length > 0 ? info.username : void 0;
  } catch {
    return void 0;
  }
}
function buildSidecarLogSources(runtime) {
  const namespaceRoot = resolveRuntimeNamespaceRoot({
    contract: OPEN_DESIGN_SIDECAR_CONTRACT,
    runtime,
    runtimeMode: SIDECAR_MODES.RUNTIME
  });
  const apps = [APP_KEYS.DAEMON, APP_KEYS.WEB, APP_KEYS.DESKTOP];
  const sources = [];
  for (const appKey of apps) {
    const absolutePath = resolveLogFilePath({
      app: appKey,
      contract: OPEN_DESIGN_SIDECAR_CONTRACT,
      runtimeRoot: namespaceRoot
    });
    sources.push({
      name: `logs/${appKey}/latest.log`,
      absolutePath,
      kind: "text",
      tailBytes: TAIL_BYTES_PER_LOG
    });
    if (appKey === APP_KEYS.DESKTOP) {
      sources.push({
        name: `logs/${appKey}/renderer.log`,
        absolutePath: join7(dirname7(absolutePath), "renderer.log"),
        kind: "text",
        tailBytes: TAIL_BYTES_PER_LOG
      });
    }
  }
  return sources;
}
async function exportDiagnosticsToFile(runtime, parentWindow) {
  const filename = diagnosticsFileName(DIAGNOSTICS_FILENAME_PREFIX);
  const downloadsDir = (() => {
    try {
      return app2.getPath("downloads");
    } catch {
      return homedir2();
    }
  })();
  const defaultPath = join7(downloadsDir, filename);
  const dialogOptions = {
    title: "Export Open Design diagnostics",
    defaultPath,
    filters: [{ name: "Zip archive", extensions: ["zip"] }]
  };
  const choice = parentWindow != null ? await dialog3.showSaveDialog(parentWindow, dialogOptions) : await dialog3.showSaveDialog(dialogOptions);
  if (choice.canceled || choice.filePath == null) {
    return { ok: false, cancelled: true };
  }
  try {
    const result = await buildDiagnosticsZip({
      context: {
        app: { name: "open-design", version: app2.getVersion(), packaged: app2.isPackaged },
        source: "desktop-ipc",
        namespace: runtime.namespace,
        extra: {
          electronVersion: process.versions.electron,
          chromiumVersion: process.versions.chrome,
          base: runtime.base,
          mode: runtime.mode,
          sourceTag: runtime.source
        }
      },
      sources: buildSidecarLogSources(runtime),
      redaction: { username: safeUsername() },
      crashReports: {
        // Restrict to Open Design's own process names. A generic "Electron"
        // substring would sweep up crash reports from any other Electron app
        // on the host (VS Code, Slack, …) and leak unrelated user data into
        // the support bundle.
        matchSubstrings: ["Open Design", "open-design"],
        withinDays: 7,
        maxReports: 10,
        homeDir: homedir2()
      }
    });
    await writeFile7(choice.filePath, result.zip);
    try {
      shell2.showItemInFolder(choice.filePath);
    } catch (revealError) {
      console.warn("desktop diagnostics reveal failed", revealError);
    }
    return { ok: true, path: choice.filePath };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, cancelled: false, message };
  }
}
function registerDesktopDiagnosticsIpc(runtime) {
  const handler = async (event) => {
    const senderWindow = BrowserWindow3.fromWebContents(event.sender);
    return await exportDiagnosticsToFile(runtime, senderWindow);
  };
  ipcMain2.handle(DESKTOP_DIAGNOSTICS_IPC_CHANNEL, handler);
  return () => {
    ipcMain2.removeHandler(DESKTOP_DIAGNOSTICS_IPC_CHANNEL);
  };
}
var DESKTOP_DIAGNOSTICS_IPC_CHANNEL, TAIL_BYTES_PER_LOG;
var init_diagnostics = __esm({
  "../desktop/dist/main/diagnostics.js"() {
    "use strict";
    init_dist();
    init_dist2();
    init_dist5();
    DESKTOP_DIAGNOSTICS_IPC_CHANNEL = "diagnostics:export-to-file";
    TAIL_BYTES_PER_LOG = 4 * 1024 * 1024;
  }
});

// ../desktop/dist/main/index.js
var main_exports = {};
__export(main_exports, {
  OS_LOCALE_PRELOAD_ARG_PREFIX: () => OS_LOCALE_PRELOAD_ARG_PREFIX,
  applyOsLocaleSwitch: () => applyOsLocaleSwitch,
  fetchResolvedProjectDir: () => fetchResolvedProjectDir,
  isAllowedChildWindowUrl: () => isAllowedChildWindowUrl,
  isHttpUrl: () => isHttpUrl,
  isOpenPathAllowedForProject: () => isOpenPathAllowedForProject,
  pickAndImportFolder: () => pickAndImportFolder,
  resolveDesktopStatusUrl: () => resolveDesktopStatusUrl,
  runDesktopMain: () => runDesktopMain,
  signDesktopImportToken: () => signDesktopImportToken,
  validateExistingDirectory: () => validateExistingDirectory
});
import { randomBytes as randomBytes2 } from "node:crypto";
import { realpathSync } from "node:fs";
import { fileURLToPath as fileURLToPath2 } from "node:url";
import { BrowserWindow as BrowserWindow4, Menu, app as app3, shell as shell3 } from "electron";
import { dirname as dirname8, join as join8 } from "node:path";
function applyOsLocaleSwitch(electronApp) {
  const preferred = electronApp.getPreferredSystemLanguages?.() ?? [];
  const osLocale = preferred[0] ?? "en";
  if (!electronApp.isReady()) {
    electronApp.commandLine.appendSwitch("lang", osLocale);
  }
  return osLocale;
}
function isDirectEntry() {
  const entryPath = process.argv[1];
  if (entryPath == null || entryPath.length === 0 || entryPath.startsWith("--"))
    return false;
  try {
    return realpathSync(entryPath) === realpathSync(fileURLToPath2(import.meta.url));
  } catch {
    return false;
  }
}
function isProcessAlive2(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
function attachParentMonitor(stop) {
  const parentPid = Number(process.env[TOOLS_DEV_PARENT_PID_ENV]);
  if (!Number.isInteger(parentPid) || parentPid <= 0)
    return;
  const timer = setInterval(() => {
    if (isProcessAlive2(parentPid))
      return;
    clearInterval(timer);
    void stop().finally(() => process.exit(0));
  }, 1e3);
  timer.unref();
}
function createWebDiscovery(runtime) {
  return async () => {
    const webIpc = resolveAppIpcPath({
      app: APP_KEYS.WEB,
      contract: OPEN_DESIGN_SIDECAR_CONTRACT,
      namespace: runtime.namespace
    });
    const web = await requestJsonIpc(webIpc, { type: SIDECAR_MESSAGES.STATUS }, { timeoutMs: 600 }).catch(() => null);
    return web?.url ?? null;
  };
}
function installDesktopMenu(runtime) {
  const exportDiagnostics = () => {
    const focused = BrowserWindow4.getFocusedWindow();
    void exportDiagnosticsToFile(runtime, focused).catch((error) => {
      console.error("desktop diagnostics export from menu failed", error);
    });
  };
  const rebuild = () => {
    const template = [
      ...process.platform === "darwin" ? [
        {
          label: app3.name,
          submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" }
          ]
        }
      ] : [
        {
          label: "File",
          submenu: [
            { role: "quit" }
          ]
        }
      ],
      {
        label: "Edit",
        submenu: [
          { role: "undo" },
          { role: "redo" },
          { type: "separator" },
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
          { role: "selectAll" }
        ]
      },
      {
        label: "View",
        submenu: [
          { role: "reload" },
          { role: "forceReload" },
          { role: "toggleDevTools" },
          { type: "separator" },
          { role: "resetZoom" },
          { role: "zoomIn" },
          { role: "zoomOut" },
          { type: "separator" },
          { role: "togglefullscreen" }
        ]
      },
      {
        label: "Window",
        submenu: [
          { role: "minimize" },
          { role: "zoom" },
          ...process.platform === "darwin" ? [{ type: "separator" }, { role: "front" }] : [{ role: "close" }]
        ]
      },
      {
        label: "Help",
        submenu: [
          {
            label: "Open Design",
            click() {
              void shell3.openExternal("https://github.com/nexu-io/open-design");
            }
          },
          { type: "separator" },
          { label: "Export Diagnostics\u2026", click: exportDiagnostics }
        ]
      }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  };
  rebuild();
  return () => void 0;
}
async function registerDesktopAuthWithDaemon(runtime, secret) {
  const daemonIpc = resolveAppIpcPath({
    app: APP_KEYS.DAEMON,
    contract: OPEN_DESIGN_SIDECAR_CONTRACT,
    namespace: runtime.namespace
  });
  const message = {
    input: { secret: secret.toString("base64") },
    type: SIDECAR_MESSAGES.REGISTER_DESKTOP_AUTH
  };
  const delays = REGISTER_DESKTOP_AUTH_RETRY_DELAYS_MS;
  for (let attempt = 0; attempt <= delays.length; attempt += 1) {
    try {
      const result = await requestJsonIpc(daemonIpc, message, { timeoutMs: REGISTER_DESKTOP_AUTH_TIMEOUT_MS });
      if (result?.accepted === true)
        return true;
    } catch {
    }
    if (attempt >= delays.length)
      break;
    await new Promise((resolveDelay) => {
      setTimeout(resolveDelay, delays[attempt]);
    });
  }
  return false;
}
async function runDesktopMain(runtime, options = {}) {
  attachDesktopProcessErrorFilter();
  const osLocale = applyOsLocaleSwitch(app3);
  await app3.whenReady();
  const desktopAuthSecret = randomBytes2(32);
  const registered = await registerDesktopAuthWithDaemon(runtime, desktopAuthSecret);
  if (!registered) {
    console.warn("[open-design desktop] initial import-token handshake with daemon did not complete; first folder-import attempt will lazily retry registration before failing");
  }
  const updater = createDesktopUpdater({
    currentVersion: options.update?.currentVersion,
    downloadRoot: options.update?.downloadRoot,
    installerObservationRoot: options.update?.installerObservationRoot,
    namespace: runtime.namespace,
    runtimeBase: runtime.base,
    source: runtime.source
  }, { openPath: (path) => shell3.openPath(path) });
  const namespaceRoot = resolveRuntimeNamespaceRoot({
    contract: OPEN_DESIGN_SIDECAR_CONTRACT,
    runtime,
    runtimeMode: SIDECAR_MODES.RUNTIME
  });
  const desktopLogPath = resolveLogFilePath({
    app: APP_KEYS.DESKTOP,
    contract: OPEN_DESIGN_SIDECAR_CONTRACT,
    runtimeRoot: namespaceRoot
  });
  const rendererLogPath = join8(dirname8(desktopLogPath), "renderer.log");
  let desktop = null;
  let disposeMenu = () => void 0;
  let updateScheduler = null;
  let removeDiagnosticsIpc = () => void 0;
  let ipcServer = null;
  let shuttingDown = false;
  async function shutdown() {
    if (shuttingDown)
      return;
    shuttingDown = true;
    await options.beforeShutdown?.().catch((error) => {
      console.error("desktop beforeShutdown failed", error);
    });
    updateScheduler?.stop("shutdown");
    disposeMenu();
    removeDiagnosticsIpc();
    await ipcServer?.close().catch(() => void 0);
    await desktop?.close().catch(() => void 0);
    app3.quit();
  }
  function shutdownAndExit() {
    void shutdown().finally(() => process.exit(0));
  }
  desktop = await createDesktopRuntime({
    desktopAuthSecret,
    discoverUrl: options.discoverWebUrl ?? createWebDiscovery(runtime),
    discoverDaemonUrl: options.discoverDaemonUrl,
    osLocale,
    preloadPath: options.preloadPath,
    // Round-5 (lefarcen P1, mrcfps): runtime hands this back to itself
    // on `503 DESKTOP_AUTH_PENDING` to re-handshake with the daemon
    // (after a daemon restart, or after a missed startup window). The
    // runtime then mints a FRESH token (new nonce + new exp — replay
    // protection still works) and POSTs once more.
    registerDesktopAuthWithDaemon: () => registerDesktopAuthWithDaemon(runtime, desktopAuthSecret),
    rendererLogPath,
    requestQuit: shutdownAndExit,
    updater
  });
  options.onDesktopReady?.({ show: () => desktop?.show() });
  disposeMenu = installDesktopMenu(runtime);
  removeDiagnosticsIpc = registerDesktopDiagnosticsIpc(runtime);
  updateScheduler = createDesktopUpdaterScheduler(updater, {
    backoffInitialMs: updater.config.checkBackoffInitialMs,
    backoffMaxMs: updater.config.checkBackoffMaxMs,
    initialDelayMs: updater.config.checkInitialDelayMs,
    intervalMs: updater.config.checkIntervalMs
  });
  if (updater.shouldAutoCheck())
    updateScheduler.start();
  attachParentMonitor(shutdown);
  app3.on("before-quit", (event) => {
    if (shuttingDown)
      return;
    event.preventDefault();
    void shutdown().finally(() => process.exit(0));
  });
  ipcServer = await createJsonIpcServer({
    socketPath: runtime.ipc,
    handler: async (message) => {
      const request = normalizeDesktopSidecarMessage(message);
      const activeDesktop = desktop;
      if (activeDesktop == null) {
        throw new Error("desktop runtime is not initialized");
      }
      switch (request.type) {
        case SIDECAR_MESSAGES.STATUS:
          return { ...activeDesktop.status(), update: await updater.status() };
        case SIDECAR_MESSAGES.EVAL:
          return await activeDesktop.eval(request.input);
        case SIDECAR_MESSAGES.SCREENSHOT:
          return await activeDesktop.screenshot(request.input);
        case SIDECAR_MESSAGES.CONSOLE:
          return activeDesktop.console();
        case SIDECAR_MESSAGES.CLICK:
          return await activeDesktop.click(request.input);
        case SIDECAR_MESSAGES.EXPORT_PDF:
          return await activeDesktop.exportPdf(request.input);
        case SIDECAR_MESSAGES.UPDATE:
          return await updater.handle(request.input.action);
        case SIDECAR_MESSAGES.SHUTDOWN:
          setImmediate(() => {
            shutdownAndExit();
          });
          return { accepted: true };
      }
    }
  });
  app3.on("before-quit", (event) => {
    if (shuttingDown)
      return;
    event.preventDefault();
    shutdownAndExit();
  });
  app3.on("window-all-closed", () => {
    shutdownAndExit();
  });
  app3.on("activate", () => {
    desktop?.show();
  });
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      shutdownAndExit();
    });
  }
}
var TOOLS_DEV_PARENT_PID_ENV, OS_LOCALE_PRELOAD_ARG_PREFIX, REGISTER_DESKTOP_AUTH_RETRY_DELAYS_MS, REGISTER_DESKTOP_AUTH_TIMEOUT_MS;
var init_main = __esm({
  "../desktop/dist/main/index.js"() {
    "use strict";
    init_dist();
    init_dist2();
    init_dist3();
    init_runtime();
    init_uncaught_exception();
    init_updater();
    init_diagnostics();
    init_runtime();
    init_runtime();
    TOOLS_DEV_PARENT_PID_ENV = SIDECAR_ENV.TOOLS_DEV_PARENT_PID;
    OS_LOCALE_PRELOAD_ARG_PREFIX = "--od-os-locale=";
    REGISTER_DESKTOP_AUTH_RETRY_DELAYS_MS = [120, 240, 480, 960, 1500];
    REGISTER_DESKTOP_AUTH_TIMEOUT_MS = 800;
    if (isDirectEntry()) {
      const stamp = readProcessStamp(process.argv.slice(2), OPEN_DESIGN_SIDECAR_CONTRACT);
      if (stamp == null)
        throw new Error("sidecar stamp is required");
      const runtime = bootstrapSidecarRuntime(stamp, process.env, {
        app: APP_KEYS.DESKTOP,
        contract: OPEN_DESIGN_SIDECAR_CONTRACT
      });
      void runDesktopMain(runtime).catch((error) => {
        console.error(error instanceof Error ? error.stack || error.message : String(error));
        process.exit(1);
      });
    }
  }
});

// dist/index.mjs
init_dist();
init_dist2();
init_main();
init_dist3();
init_dist();
init_dist2();
init_dist();
init_dist();
init_dist2();
init_dist3();
import { join as join42 } from "node:path";
import { app as app22, dialog as dialog4 } from "electron";
import { access as access3, readFile as readFile7 } from "node:fs/promises";
import { join as join9, resolve as resolve7 } from "node:path";
import { dirname as dirname9 } from "node:path";
import { access as access22, mkdir as mkdir7, stat as stat6 } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { dirname as dirname22 } from "node:path";
import { userInfo as userInfo2 } from "node:os";
import { app as app4 } from "electron";
import { appendFileSync } from "node:fs";
import { homedir as homedir3 } from "node:os";
import { isAbsolute as isAbsolute7, join as join22, win32 } from "node:path";
import { protocol } from "electron";
import { spawn as spawn3 } from "node:child_process";
import { access as access32, mkdir as mkdir22, open as open2 } from "node:fs/promises";
import { createRequire } from "node:module";
import { delimiter, dirname as dirname32, join as join32 } from "node:path";
import { setTimeout as sleep2 } from "node:timers/promises";
async function loadElectronApp() {
  const electron = await import("electron");
  return electron.app;
}
var PACKAGED_CONFIG_PATH_ENV = "OD_PACKAGED_CONFIG_PATH";
var PACKAGED_NAMESPACE_ENV = "OD_PACKAGED_NAMESPACE";
var PACKAGED_WEB_OUTPUT_MODE_OVERRIDE_ENV = "OD_PACKAGED_ALLOW_WEB_OUTPUT_MODE_OVERRIDE";
var PACKAGED_WEB_STANDALONE_ROOT_ENV = "OD_WEB_STANDALONE_ROOT";
var PACKAGED_WEB_OUTPUT_MODE_ENV = "OD_WEB_OUTPUT_MODE";
async function pathExists2(filePath) {
  try {
    await access3(filePath);
    return true;
  } catch {
    return false;
  }
}
async function readJsonIfExists(filePath) {
  if (!await pathExists2(filePath)) return null;
  return JSON.parse(await readFile7(filePath, "utf8"));
}
function resolveDefaultConfigPath() {
  return join9(process.resourcesPath, "open-design-config.json");
}
async function readRawPackagedConfig() {
  const explicit = process.env[PACKAGED_CONFIG_PATH_ENV];
  if (explicit != null && explicit.length > 0) {
    const config = await readJsonIfExists(resolve7(explicit));
    if (config == null) throw new Error(`packaged config not found at ${explicit}`);
    return config;
  }
  const electronApp = await loadElectronApp();
  return await readJsonIfExists(resolveDefaultConfigPath()) ?? await readJsonIfExists(join9(electronApp.getAppPath(), "open-design-config.json")) ?? {};
}
function resolveOptionalPath(value) {
  return value == null || value.length === 0 ? void 0 : resolve7(value);
}
function cleanOptionalString(value) {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}
function resolvePackagedWebOutputMode(value) {
  if (value == null || value.length === 0) return "server";
  if (value === "server" || value === "standalone") return value;
  throw new Error(`unsupported packaged web output mode: ${value}`);
}
function resolvePackagedAmrProfile(value) {
  const cleaned = cleanOptionalString(value);
  if (cleaned == null) return null;
  if (cleaned === "prod" || cleaned === "test" || cleaned === "local") return cleaned;
  throw new Error(`unsupported packaged AMR profile: ${value}`);
}
function isTruthyEnv2(value) {
  return value === "1" || value === "true" || value === "yes";
}
function resolvePackagedWebStandaloneRoot(webOutputMode, value) {
  const configured = resolveOptionalPath(value);
  if (configured != null) return configured;
  if (webOutputMode !== "standalone") return null;
  return join9(process.resourcesPath, "open-design-web-standalone");
}
async function resolvePackagedRelativeEntry(value) {
  const cleaned = cleanOptionalString(value);
  if (cleaned == null) return null;
  const entry = join9(process.resourcesPath, cleaned);
  if (!await pathExists2(entry)) {
    throw new Error(`configured packaged entry not found at ${entry}`);
  }
  return entry;
}
async function readPackagedConfig() {
  const raw = await readRawPackagedConfig();
  const namespace = normalizeNamespace(
    process.env[PACKAGED_NAMESPACE_ENV] ?? raw.namespace ?? SIDECAR_DEFAULTS.namespace
  );
  const electronApp = await loadElectronApp();
  const namespaceBaseRoot = resolveOptionalPath(raw.namespaceBaseRoot) ?? join9(electronApp.getPath("userData"), "namespaces");
  const resourceRoot = resolveOptionalPath(raw.resourceRoot) ?? join9(process.resourcesPath, "open-design");
  const relativeNodeCommand = raw.nodeCommandRelative == null || raw.nodeCommandRelative.length === 0 ? join9("open-design", "bin", "node") : raw.nodeCommandRelative;
  const nodeCommandCandidate = join9(process.resourcesPath, relativeNodeCommand);
  const nodeCommand = await pathExists2(nodeCommandCandidate) ? nodeCommandCandidate : null;
  const allowWebOutputModeOverride = isTruthyEnv2(process.env[PACKAGED_WEB_OUTPUT_MODE_OVERRIDE_ENV]);
  const webOutputMode = resolvePackagedWebOutputMode(
    allowWebOutputModeOverride ? process.env[PACKAGED_WEB_OUTPUT_MODE_ENV] ?? raw.webOutputMode : raw.webOutputMode
  );
  const webStandaloneRoot = resolvePackagedWebStandaloneRoot(
    webOutputMode,
    allowWebOutputModeOverride ? process.env[PACKAGED_WEB_STANDALONE_ROOT_ENV] ?? raw.webStandaloneRoot : raw.webStandaloneRoot
  );
  const daemonCliEntry = await resolvePackagedRelativeEntry(raw.daemonCliEntryRelative);
  const daemonSidecarEntry = await resolvePackagedRelativeEntry(raw.daemonSidecarEntryRelative);
  const webSidecarEntry = await resolvePackagedRelativeEntry(raw.webSidecarEntryRelative);
  return {
    amrProfile: resolvePackagedAmrProfile(raw.amrProfile),
    appVersion: cleanOptionalString(raw.appVersion),
    daemonCliEntry,
    daemonSidecarEntry,
    namespace,
    namespaceBaseRoot,
    nodeCommand,
    resourceRoot,
    telemetryRelayUrl: cleanOptionalString(raw.telemetryRelayUrl),
    posthogKey: cleanOptionalString(raw.posthogKey),
    posthogHost: cleanOptionalString(raw.posthogHost),
    webSidecarEntry,
    webStandaloneRoot,
    webOutputMode
  };
}
function resolveCurrentMacAppPath(executablePath) {
  return dirname9(dirname9(dirname9(executablePath)));
}
function createPackagedDesktopRootIdentity(options) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const executablePath = process.execPath;
  return {
    appPath: resolveCurrentMacAppPath(executablePath),
    executablePath,
    logPath: options.paths.desktopLogPath,
    namespaceRoot: options.paths.namespaceRoot,
    pid: process.pid,
    ppid: process.ppid,
    stamp: options.stamp,
    startedAt: now,
    updatedAt: now,
    version: 1
  };
}
async function writePackagedDesktopIdentity(options) {
  const identity = createPackagedDesktopRootIdentity(options);
  const identityPath = options.identityPath ?? options.paths.desktopIdentityPath;
  const writeIdentity = async () => {
    identity.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    await writeJsonFile(identityPath, identity);
  };
  await writeIdentity();
  const heartbeat = setInterval(() => {
    void writeIdentity().catch(() => void 0);
  }, 5e3);
  heartbeat.unref();
  return {
    async close() {
      clearInterval(heartbeat);
      await removeFile(identityPath).catch(() => void 0);
    },
    identity
  };
}
var PackagedPathAccessError = class extends Error {
  title;
  constructor(message, options) {
    super(message, options);
    this.name = "PackagedPathAccessError";
    this.title = options?.title ?? "Open Design cannot access its data folder";
  }
};
function formatMode(mode) {
  if (mode == null) return "unknown";
  return `0${(mode & 511).toString(8)}`;
}
async function inspectPath(path) {
  try {
    const stats = await stat6(path);
    return { exists: true, mode: stats.mode, path };
  } catch {
    return { exists: false, path };
  }
}
function formatWritablePathError(options) {
  const { attemptedPath, currentUser, diagnostic, error, parentDiagnostic } = options;
  const message = error instanceof Error ? error.message : String(error);
  const parentPath = dirname22(attemptedPath);
  const diagLines = [
    `Open Design could not create or write to:`,
    attemptedPath,
    "",
    `Current user: ${currentUser}`,
    `Node error: ${message}`,
    `Target exists: ${diagnostic.exists ? "yes" : "no"}`,
    `Target mode: ${formatMode(diagnostic.mode)}`,
    `Parent exists: ${parentDiagnostic.exists ? "yes" : "no"}`,
    `Parent mode: ${formatMode(parentDiagnostic.mode)}`,
    "",
    `Common causes:`,
    `\u2022 the folder was created by another user (for example with sudo)`,
    `\u2022 the parent folder is not writable`,
    `\u2022 the folder is a symlink to a protected location`,
    "",
    `Try in Terminal:`,
    `ls -ld "${parentPath}" "${attemptedPath}"`,
    `sudo chown -R "${currentUser}":staff "${parentPath}"`,
    `chmod -R u+rwX "${parentPath}"`
  ];
  return diagLines.join("\n");
}
async function verifyPackagedDataRootWritable(paths) {
  try {
    await mkdir7(paths.dataRoot, { recursive: true });
    await access22(paths.dataRoot, fsConstants.W_OK);
  } catch (error) {
    const [diagnostic, parentDiagnostic] = await Promise.all([
      inspectPath(paths.dataRoot),
      inspectPath(dirname22(paths.dataRoot))
    ]);
    throw new PackagedPathAccessError(
      formatWritablePathError({
        attemptedPath: paths.dataRoot,
        currentUser: userInfo2().username,
        diagnostic,
        error,
        parentDiagnostic
      }),
      { cause: error }
    );
  }
}
async function ensurePackagedNamespacePaths(paths) {
  await verifyPackagedDataRootWritable(paths);
  await Promise.all([
    mkdir7(paths.namespaceRoot, { recursive: true }),
    mkdir7(paths.cacheRoot, { recursive: true }),
    mkdir7(paths.dataRoot, { recursive: true }),
    mkdir7(paths.logsRoot, { recursive: true }),
    mkdir7(paths.desktopLogsRoot, { recursive: true }),
    mkdir7(paths.runtimeRoot, { recursive: true }),
    mkdir7(paths.updateRoot, { recursive: true }),
    mkdir7(paths.electronUserDataRoot, { recursive: true }),
    mkdir7(paths.electronSessionDataRoot, { recursive: true })
  ]);
}
function applyPackagedElectronPathOverrides(paths) {
  app4.setPath("userData", paths.electronUserDataRoot);
  app4.setPath("sessionData", paths.electronSessionDataRoot);
  app4.setPath("logs", paths.desktopLogsRoot);
}
function claimPackagedSingleInstanceLock(electronApp, onSecondInstance) {
  if (!electronApp.requestSingleInstanceLock()) {
    electronApp.quit();
    return false;
  }
  electronApp.on("second-instance", () => {
    onSecondInstance();
  });
  return true;
}
var DESKTOP_LOG_ECHO_ENV = "OD_DESKTOP_LOG_ECHO";
function normalizeError(error) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack
    };
  }
  return error;
}
function isHarmlessSocketOptionError2(value) {
  if (!(value instanceof Error)) return false;
  const message = typeof value.message === "string" ? value.message : "";
  if (!message) return false;
  if (!message.includes("setTypeOfService")) return false;
  const code = value.code;
  if (typeof code === "string" && code.length > 0) {
    return code === "EINVAL";
  }
  return message.includes("EINVAL");
}
function createFatalUncaughtExceptionHandler(logger) {
  const handler = (error) => {
    if (isHarmlessSocketOptionError2(error)) {
      logger.warn("packaged desktop swallowed harmless socket option error", { error });
      return;
    }
    logger.error("packaged desktop fatal uncaught exception", { error });
    process.removeListener("uncaughtException", handler);
    setImmediate(() => {
      throw error;
    });
  };
  return handler;
}
function createFatalUnhandledRejectionHandler(logger) {
  const handler = (reason) => {
    if (isHarmlessSocketOptionError2(reason)) {
      logger.warn("packaged desktop swallowed harmless socket option rejection", { reason });
      return;
    }
    logger.error("packaged desktop unhandled rejection", { reason });
    process.removeListener("unhandledRejection", handler);
    setImmediate(() => {
      throw reason;
    });
  };
  return handler;
}
function normalizeMeta(meta) {
  if (meta == null) return void 0;
  return Object.fromEntries(
    Object.entries(meta).map(([key, value]) => [key, key === "error" || key === "reason" ? normalizeError(value) : value])
  );
}
function serializeMessage(level, message, meta) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  try {
    return `${JSON.stringify({
      level,
      message,
      timestamp,
      ...meta == null ? {} : { meta: normalizeMeta(meta) }
    })}
`;
  } catch (error) {
    return `${JSON.stringify({
      level,
      message,
      timestamp,
      meta: {
        serializationError: error instanceof Error ? error.message : String(error)
      }
    })}
`;
  }
}
function createPackagedDesktopLogger(paths) {
  const echo = process.env[DESKTOP_LOG_ECHO_ENV] !== "0";
  const write = (level, message, meta) => {
    appendFileSync(paths.desktopLogPath, serializeMessage(level, message, meta), "utf8");
  };
  const logger = {
    error(message, meta) {
      write("error", message, meta);
    },
    info(message, meta) {
      write("info", message, meta);
    },
    warn(message, meta) {
      write("warn", message, meta);
    }
  };
  const originalConsole = {
    error: console.error.bind(console),
    info: console.info.bind(console),
    log: console.log.bind(console),
    warn: console.warn.bind(console)
  };
  console.log = (...args) => {
    logger.info("console.log", { args });
    if (echo) originalConsole.log(...args);
  };
  console.info = (...args) => {
    logger.info("console.info", { args });
    if (echo) originalConsole.info(...args);
  };
  console.warn = (...args) => {
    logger.warn("console.warn", { args });
    if (echo) originalConsole.warn(...args);
  };
  console.error = (...args) => {
    logger.error("console.error", { args });
    if (echo) originalConsole.error(...args);
  };
  return logger;
}
function attachPackagedDesktopProcessLogging(options) {
  const { logger, paths, stamp } = options;
  logger.info("packaged desktop starting", {
    daemonDataRoot: paths.dataRoot,
    electronUserDataRoot: paths.electronUserDataRoot,
    executablePath: process.execPath,
    logPath: paths.desktopLogPath,
    namespace: stamp.namespace,
    pid: process.pid,
    ppid: process.ppid,
    resourceRoot: paths.resourceRoot,
    runtimeRoot: paths.runtimeRoot,
    source: stamp.source
  });
  process.on("uncaughtExceptionMonitor", (error) => {
    logger.error("packaged desktop uncaught exception", { error });
  });
  process.on("uncaughtException", createFatalUncaughtExceptionHandler(logger));
  process.on("unhandledRejection", createFatalUnhandledRejectionHandler(logger));
  process.on("beforeExit", (code) => {
    logger.warn("packaged desktop beforeExit", { code });
  });
  process.on("exit", (code) => {
    logger.warn("packaged desktop exit", { code });
  });
}
var HOME_BARE_TOKENS = /* @__PURE__ */ new Set(["~", "$HOME", "${HOME}"]);
var HOME_PREFIX_RE = /^(~|\$\{HOME\}|\$HOME)[/\\](.*)$/;
function expandHomePrefix(raw) {
  if (HOME_BARE_TOKENS.has(raw)) return homedir3();
  const match = HOME_PREFIX_RE.exec(raw);
  if (match) return join22(homedir3(), match[2] ?? "");
  return raw;
}
function getScopedPackagedDataRootNamespace(raw) {
  const parts = raw.replace(/[\\/]+$/g, "").split(/[\\/]+/);
  const last = parts.length - 1;
  if (last < 2) return null;
  if (parts[last - 2] !== "namespaces" || parts[last] !== "data") return null;
  return parts[last - 1] ?? null;
}
function resolvePackagedDataRoot(config, namespace, env = {}) {
  const odDataDir = env.OD_DATA_DIR?.trim();
  if (odDataDir) {
    const expanded = expandHomePrefix(odDataDir);
    const isAbs = process.platform === "win32" ? win32.isAbsolute(expanded) : isAbsolute7(expanded);
    if (!isAbs) {
      throw new PackagedPathAccessError(
        [
          "Open Design's packaged runtime requires OD_DATA_DIR to be an absolute path.",
          "",
          `Configured value: ${odDataDir}`,
          "",
          "Set OD_DATA_DIR to an absolute path (for example, C:\\\\Users\\\\You\\\\OpenDesign on Windows or /Users/you/OpenDesign on macOS/Linux) and relaunch Open Design."
        ].join("\n"),
        { title: "Open Design cannot start with this OD_DATA_DIR" }
      );
    }
    const scopedNamespace = getScopedPackagedDataRootNamespace(expanded);
    if (scopedNamespace) {
      if (scopedNamespace !== namespace) {
        throw new PackagedPathAccessError(
          [
            "Open Design's packaged runtime requires OD_DATA_DIR to target the active namespace.",
            "",
            `Configured value: ${odDataDir}`,
            `Configured namespace: ${scopedNamespace}`,
            `Active namespace: ${namespace}`,
            "",
            "Use an unscoped absolute base path or relaunch the matching packaged namespace."
          ].join("\n"),
          { title: "Open Design cannot start with this OD_DATA_DIR" }
        );
      }
      return expanded;
    }
    return join22(expanded, "namespaces", namespace, "data");
  }
  return join22(config.namespaceBaseRoot, namespace, "data");
}
function resolvePackagedNamespacePaths(config, namespace = config.namespace, env = {}) {
  const normalizedNamespace = normalizeNamespace(namespace);
  const namespaceRoot = join22(config.namespaceBaseRoot, normalizedNamespace);
  const dataRoot = resolvePackagedDataRoot(config, normalizedNamespace, env);
  const installationRoot = join22(config.namespaceBaseRoot, "..");
  return {
    cacheRoot: join22(namespaceRoot, "cache"),
    desktopIdentityPath: join22(namespaceRoot, "runtime", "desktop-root.json"),
    desktopLogPath: join22(namespaceRoot, "logs", APP_KEYS.DESKTOP, "latest.log"),
    dataRoot,
    desktopLogsRoot: join22(namespaceRoot, "logs", APP_KEYS.DESKTOP),
    electronSessionDataRoot: join22(namespaceRoot, "user-data", "session"),
    electronUserDataRoot: join22(namespaceRoot, "user-data"),
    headlessIdentityPath: join22(namespaceRoot, "runtime", "headless-root.json"),
    installationRoot,
    installerObservationRoot: join22(dataRoot, "observations", "installer"),
    logsRoot: join22(namespaceRoot, "logs"),
    namespaceRoot,
    resourceRoot: config.resourceRoot,
    runtimeRoot: join22(namespaceRoot, "runtime"),
    updateRoot: join22(namespaceRoot, "updates"),
    webIdentityPath: join22(namespaceRoot, "runtime", "web-root.json")
  };
}
var OD_SCHEME = "od";
var OD_ENTRY_URL = `${OD_SCHEME}://app/`;
protocol.registerSchemesAsPrivileged([
  {
    privileges: {
      corsEnabled: true,
      secure: true,
      standard: true,
      stream: true,
      supportFetchAPI: true
    },
    scheme: OD_SCHEME
  }
]);
function toWebRuntimeUrl(webRuntimeUrl, requestUrl) {
  const incoming = new URL(requestUrl);
  const target = new URL(webRuntimeUrl);
  target.pathname = incoming.pathname;
  target.search = incoming.search;
  target.hash = incoming.hash;
  return target.toString();
}
function buildProxyErrorResponse(error, target) {
  const message = error instanceof Error ? error.message : String(error);
  const code = error instanceof Error && typeof error.code === "string" ? error.code : null;
  return new Response(
    JSON.stringify({
      error: "OD_PROTOCOL_PROXY_FAILED",
      message,
      ...code === null ? {} : { code },
      target
    }),
    {
      status: 502,
      headers: { "content-type": "application/json" }
    }
  );
}
async function handleOdRequest(request, webRuntimeUrl, fetchImpl = fetch) {
  const target = toWebRuntimeUrl(webRuntimeUrl, request.url);
  try {
    return await fetchImpl(new Request(target, request));
  } catch (error) {
    return buildProxyErrorResponse(error, target);
  }
}
function packagedEntryUrl() {
  return OD_ENTRY_URL;
}
function registerOdProtocol(webRuntimeUrl) {
  protocol.handle(OD_SCHEME, async (request) => {
    return await handleOdRequest(request, webRuntimeUrl);
  });
}
var require2 = createRequire(import.meta.url);
var PACKAGED_CHILD_ENV_ALLOWLIST = [
  "HOME",
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "LANG",
  "LC_ALL",
  "LOGNAME",
  "ALL_PROXY",
  "NODE_USE_ENV_PROXY",
  "NO_PROXY",
  "TMPDIR",
  "USER",
  "VP_HOME",
  "all_proxy",
  "http_proxy",
  "https_proxy",
  "no_proxy"
];
function shouldForwardPackagedChildEnv(key, includeProviderSecrets = false) {
  return PACKAGED_CHILD_ENV_ALLOWLIST.includes(
    key
  ) || includeProviderSecrets && (key.endsWith("_API_KEY") || key.endsWith("_TOKEN"));
}
function resolveSidecarEntry(packageName, exportName) {
  return require2.resolve(`${packageName}/${exportName}`);
}
function logPathFor(paths, app32) {
  return join32(paths.logsRoot, app32, "latest.log");
}
async function pathExists22(path) {
  try {
    await access32(path);
    return true;
  } catch {
    return false;
  }
}
async function resolvePackagedElectronNodeCommand(execPath = process.execPath, platform2 = process.platform) {
  if (platform2 !== "darwin") return execPath;
  const executableName = execPath.split("/").pop();
  if (executableName == null || executableName.length === 0) return execPath;
  const marker = "/Contents/MacOS/";
  const markerIndex = execPath.lastIndexOf(marker);
  if (markerIndex === -1) return execPath;
  const appPath = execPath.slice(0, markerIndex);
  const helperName = `${executableName} Helper`;
  const helperPath = join32(
    appPath,
    "Contents",
    "Frameworks",
    `${helperName}.app`,
    "Contents",
    "MacOS",
    helperName
  );
  return await pathExists22(helperPath) ? helperPath : execPath;
}
async function openLog(path) {
  await mkdir22(dirname32(path), { recursive: true });
  return await open2(path, "w");
}
var DAEMON_STATUS_TIMEOUT_MS = 35e3;
var DAEMON_MIGRATION_STATUS_TIMEOUT_MS = 30 * 60 * 1e3;
function resolveDaemonStatusTimeoutMs(env = process.env) {
  const raw = env.OD_LEGACY_DATA_DIR;
  if (raw != null && raw.length > 0) return DAEMON_MIGRATION_STATUS_TIMEOUT_MS;
  return DAEMON_STATUS_TIMEOUT_MS;
}
async function waitForStatus(ipcPath, isReady, timeoutMs = DAEMON_STATUS_TIMEOUT_MS, watch = null) {
  const startedAt = Date.now();
  let lastError;
  let childExited = null;
  if (watch != null && watch.child.exitCode !== null) {
    childExited = { code: watch.child.exitCode, signal: watch.child.signalCode };
  }
  const onChildExit = (code, signal) => {
    childExited = { code, signal };
  };
  watch?.child.once("exit", onChildExit);
  try {
    while (Date.now() - startedAt < timeoutMs) {
      if (childExited !== null) {
        throw new Error(
          `daemon exited before reporting status (code=${childExited.code}, signal=${childExited.signal ?? "none"}); see ${watch?.logPath ?? "<no log path>"} for details`
        );
      }
      try {
        const status = await requestJsonIpc(
          ipcPath,
          { type: SIDECAR_MESSAGES.STATUS },
          { timeoutMs: 800 }
        );
        if (isReady(status)) return status;
      } catch (error) {
        lastError = error;
      }
      await sleep2(150);
    }
    throw new Error(
      `timed out waiting for sidecar status at ${ipcPath}${lastError instanceof Error ? ` (${lastError.message})` : ""}`
    );
  } finally {
    watch?.child.off("exit", onChildExit);
  }
}
function extractPort(url) {
  const parsed = new URL(url);
  return parsed.port || (parsed.protocol === "https:" ? "443" : "80");
}
var PACKAGED_POSIX_SYSTEM_BINS = ["/usr/bin", "/bin", "/usr/sbin", "/sbin"];
function resolvePackagedPathEnv(basePath = process.env.PATH ?? "") {
  const candidates = [
    ...basePath.split(delimiter),
    ...wellKnownUserToolchainBins(),
    ...PACKAGED_POSIX_SYSTEM_BINS
  ];
  return [...new Set(candidates.filter((entry) => entry.length > 0))].join(delimiter);
}
function resolvePackagedChildBaseEnv(env = process.env, includeProviderSecrets = false, systemProxyEnv = resolveSystemProxyEnv(), includeSystemProxyEnv = true) {
  const forwardedEnv = {};
  for (const [key, value] of Object.entries(env)) {
    if (value != null && value.length > 0 && shouldForwardPackagedChildEnv(key, includeProviderSecrets)) {
      forwardedEnv[key] = value;
    }
  }
  return includeSystemProxyEnv ? mergeProxyAwareEnv(process.platform, systemProxyEnv, forwardedEnv) : mergeProxyAwareEnv(process.platform, forwardedEnv);
}
function createPackagedDaemonManagedPathEnv(paths) {
  return {
    OD_DATA_DIR: paths.dataRoot,
    OD_RESOURCE_ROOT: paths.resourceRoot,
    OD_INSTALLATION_DIR: paths.installationRoot
  };
}
function buildPackagedDaemonSpawnEnv(paths, options) {
  return {
    [SIDECAR_ENV.DAEMON_PORT]: "0",
    ...options.daemonCliEntry == null ? {} : { [SIDECAR_ENV.DAEMON_CLI_PATH]: options.daemonCliEntry },
    // PR #974 round-4 P1 + round-5 P2: pinned ON when a desktop is
    // being started, OFF for headless. The daemon-side flag refuses
    // tokenless imports even before the desktop main process has
    // finished registering, closing the daemon-restart-mid-session
    // bypass that a runtime-only handshake left open. Headless skips
    // it because there is no privileged shell.openPath surface and
    // no client to register a secret.
    ...options.requireDesktopAuth ? { OD_REQUIRE_DESKTOP_AUTH: "1" } : {},
    // Packaged daemon managed paths are deliberately delivered through
    // the sidecar launch environment. The daemon may keep its own default
    // fallback, but packaged runtime must not rely on path inference from
    // Electron userData, bundle names, or ports.
    ...createPackagedDaemonManagedPathEnv(paths),
    ...options.amrProfile == null || options.amrProfile.length === 0 ? {} : { OPEN_DESIGN_AMR_PROFILE: options.amrProfile },
    ...options.appVersion == null ? {} : { OD_APP_VERSION: options.appVersion },
    ...options.telemetryRelayUrl == null || options.telemetryRelayUrl.length === 0 ? {} : { OPEN_DESIGN_TELEMETRY_RELAY_URL: options.telemetryRelayUrl },
    // OD_LEGACY_DATA_DIR is the one-shot recovery handle for users
    // upgrading from 0.3.x .od/ layouts. The daemon's startup
    // migrator (legacy-data-migrator.ts) reads it; the env-allowlist
    // for packaged children would otherwise drop it. Forward only
    // when set so we do not invent an empty string and trigger the
    // daemon's "env set but path invalid" error path.
    ...options.legacyDataDir == null || options.legacyDataDir.length === 0 ? {} : { OD_LEGACY_DATA_DIR: options.legacyDataDir },
    // PostHog analytics ingest key, baked into the bundle at packaging time
    // by tools/pack. Daemon reads this as POSTHOG_KEY at startup. Absent
    // for fork builds without the CI secret — the daemon's analytics
    // module no-ops cleanly in that case, and /api/analytics/config
    // returns enabled=false regardless of user consent.
    ...options.posthogKey == null || options.posthogKey.length === 0 ? {} : { POSTHOG_KEY: options.posthogKey },
    ...options.posthogHost == null || options.posthogHost.length === 0 ? {} : { POSTHOG_HOST: options.posthogHost }
  };
}
async function spawnSidecarChild(options) {
  const ipcPath = resolveAppIpcPath({
    app: options.app,
    contract: OPEN_DESIGN_SIDECAR_CONTRACT,
    namespace: options.runtime.namespace
  });
  const stamp = {
    app: options.app,
    ipc: ipcPath,
    mode: SIDECAR_MODES.RUNTIME,
    namespace: options.runtime.namespace,
    source: options.runtime.source
  };
  const logHandle = await openLog(logPathFor(options.paths, options.app));
  const childEnv = createSidecarLaunchEnv({
    base: options.paths.runtimeRoot,
    contract: OPEN_DESIGN_SIDECAR_CONTRACT,
    extraEnv: {
      ...resolvePackagedChildBaseEnv(
        process.env,
        options.app === APP_KEYS.DAEMON,
        resolveSystemProxyEnv(),
        options.app !== APP_KEYS.DAEMON
      ),
      ...options.env,
      NODE_ENV: "production",
      PATH: resolvePackagedPathEnv(),
      ...options.nodeCommand == null ? { ELECTRON_RUN_AS_NODE: "1" } : {}
    },
    stamp
  });
  const command = options.nodeCommand ?? await resolvePackagedElectronNodeCommand();
  const child = spawn3(
    command,
    [options.entryPath, ...createProcessStampArgs(stamp, OPEN_DESIGN_SIDECAR_CONTRACT)],
    {
      cwd: process.cwd(),
      env: childEnv,
      stdio: ["ignore", logHandle.fd, logHandle.fd],
      windowsHide: true
    }
  );
  await new Promise((resolveSpawn, rejectSpawn) => {
    child.once("error", rejectSpawn);
    child.once("spawn", resolveSpawn);
  });
  return { app: options.app, child, ipcPath, logHandle };
}
async function closeManagedChild(child) {
  try {
    await requestJsonIpc(child.ipcPath, { type: SIDECAR_MESSAGES.SHUTDOWN }, { timeoutMs: 1200 });
  } catch {
  }
  if (!await waitForProcessExit(child.child.pid, 5e3)) {
    await stopProcesses([child.child.pid]);
  }
  await child.logHandle.close().catch(() => void 0);
}
async function startPackagedSidecars(runtime, paths, options) {
  await mkdir22(paths.namespaceRoot, { recursive: true });
  await mkdir22(paths.cacheRoot, { recursive: true });
  await mkdir22(paths.dataRoot, { recursive: true });
  await mkdir22(paths.logsRoot, { recursive: true });
  await mkdir22(paths.desktopLogsRoot, { recursive: true });
  await mkdir22(paths.runtimeRoot, { recursive: true });
  await mkdir22(paths.updateRoot, { recursive: true });
  await mkdir22(paths.electronUserDataRoot, { recursive: true });
  await mkdir22(paths.electronSessionDataRoot, { recursive: true });
  const children = [];
  try {
    const daemon = await spawnSidecarChild({
      app: APP_KEYS.DAEMON,
      entryPath: options.daemonSidecarEntry ?? resolveSidecarEntry("@open-design/daemon", "sidecar"),
      env: buildPackagedDaemonSpawnEnv(paths, {
        appVersion: options.appVersion,
        amrProfile: options.amrProfile,
        daemonCliEntry: options.daemonCliEntry,
        legacyDataDir: process.env.OD_LEGACY_DATA_DIR ?? null,
        requireDesktopAuth: options.requireDesktopAuth,
        telemetryRelayUrl: options.telemetryRelayUrl,
        posthogKey: options.posthogKey,
        posthogHost: options.posthogHost
      }),
      nodeCommand: options.nodeCommand,
      paths,
      runtime
    });
    children.push(daemon);
    const daemonStatus = await waitForStatus(
      daemon.ipcPath,
      (status) => status.url != null,
      resolveDaemonStatusTimeoutMs(),
      // Race the IPC polling against the daemon child's exit. Without
      // this, a daemon that throws at startup (LegacyMigrationError on
      // invalid OD_LEGACY_DATA_DIR, existing target payload, symlink,
      // marker write failure) leaves the packaged app waiting the full
      // 30-minute migration budget for a process that already died.
      { child: daemon.child, logPath: logPathFor(paths, APP_KEYS.DAEMON) }
    );
    if (daemonStatus.url == null) throw new Error("daemon did not report a URL");
    const web = await spawnSidecarChild({
      app: APP_KEYS.WEB,
      entryPath: options.webSidecarEntry ?? resolveSidecarEntry("@open-design/web", "sidecar"),
      env: {
        [SIDECAR_ENV.DAEMON_PORT]: extractPort(daemonStatus.url),
        [SIDECAR_ENV.WEB_PORT]: "0",
        ...options.webStandaloneRoot == null ? {} : { OD_WEB_STANDALONE_ROOT: options.webStandaloneRoot },
        OD_WEB_OUTPUT_MODE: options.webOutputMode,
        PORT: "0"
      },
      nodeCommand: options.nodeCommand,
      paths,
      runtime
    });
    children.push(web);
    const webStatus = await waitForStatus(
      web.ipcPath,
      (status) => status.url != null
    );
    if (webStatus.url == null) throw new Error("web did not report a URL");
    return {
      daemon: daemonStatus,
      web: webStatus,
      async close() {
        for (const child of [...children].reverse()) {
          await closeManagedChild(child).catch((error) => {
            console.error(`failed to close packaged ${child.app} sidecar`, error);
          });
        }
      }
    };
  } catch (error) {
    for (const child of [...children].reverse()) {
      await closeManagedChild(child).catch(() => void 0);
    }
    throw error;
  }
}
var packagedLogger = null;
var pendingSecondInstanceFocus = false;
var showExistingDesktop = null;
function createPackagedDesktopStamp(namespace) {
  return {
    app: APP_KEYS.DESKTOP,
    ipc: resolveAppIpcPath({
      app: APP_KEYS.DESKTOP,
      contract: OPEN_DESIGN_SIDECAR_CONTRACT,
      namespace
    }),
    mode: SIDECAR_MODES.RUNTIME,
    namespace,
    source: SIDECAR_SOURCES.PACKAGED
  };
}
function applyLaunchEnv(base, stamp) {
  const env = createSidecarLaunchEnv({
    base,
    contract: OPEN_DESIGN_SIDECAR_CONTRACT,
    stamp
  });
  for (const [key, value] of Object.entries(env)) {
    if (value != null) process.env[key] = value;
  }
}
async function main() {
  applyOsLocaleSwitch(app22);
  const config = await readPackagedConfig();
  const argvStamp = readProcessStamp(process.argv.slice(1), OPEN_DESIGN_SIDECAR_CONTRACT);
  const namespace = argvStamp?.namespace ?? config.namespace;
  const paths = resolvePackagedNamespacePaths(config, namespace, process.env);
  const stamp = argvStamp ?? createPackagedDesktopStamp(namespace);
  await ensurePackagedNamespacePaths(paths);
  packagedLogger = createPackagedDesktopLogger(paths);
  attachPackagedDesktopProcessLogging({ logger: packagedLogger, paths, stamp });
  applyPackagedElectronPathOverrides(paths);
  if (!claimPackagedSingleInstanceLock(app22, () => {
    if (showExistingDesktop == null) {
      pendingSecondInstanceFocus = true;
      return;
    }
    showExistingDesktop();
  })) {
    return;
  }
  const identity = await writePackagedDesktopIdentity({ paths, stamp });
  await app22.whenReady();
  applyLaunchEnv(paths.runtimeRoot, stamp);
  const runtime = bootstrapSidecarRuntime(stamp, process.env, {
    app: APP_KEYS.DESKTOP,
    base: paths.runtimeRoot,
    contract: OPEN_DESIGN_SIDECAR_CONTRACT
  });
  const sidecars = await startPackagedSidecars(runtime, paths, {
    appVersion: config.appVersion,
    amrProfile: config.amrProfile,
    daemonCliEntry: config.daemonCliEntry,
    daemonSidecarEntry: config.daemonSidecarEntry,
    nodeCommand: config.nodeCommand,
    telemetryRelayUrl: config.telemetryRelayUrl,
    posthogKey: config.posthogKey,
    posthogHost: config.posthogHost,
    // PR #974 round-5 (lefarcen P2): the Electron entry runs desktop
    // main alongside the daemon, so the import-folder gate must be
    // pinned ON from request 0. See `apps/packaged/src/headless.ts` for
    // the daemon+web-only counterpart that passes `false`.
    requireDesktopAuth: true,
    webSidecarEntry: config.webSidecarEntry,
    webStandaloneRoot: config.webStandaloneRoot,
    webOutputMode: config.webOutputMode
  });
  registerOdProtocol(sidecars.web.url ?? "http://127.0.0.1:0");
  const { runDesktopMain: runDesktopMain2 } = await Promise.resolve().then(() => (init_main(), main_exports));
  await runDesktopMain2(runtime, {
    async beforeShutdown() {
      try {
        await sidecars.close();
      } finally {
        await identity.close();
      }
    },
    async discoverWebUrl() {
      return packagedEntryUrl();
    },
    // Round-7 (lefarcen P2 @ runtime.ts:336): packaged main-process
    // fetch targets the daemon sidecar's real http URL — never the
    // od://app/ renderer URL, which Node/undici cannot resolve through
    // Electron's protocol handler.
    async discoverDaemonUrl() {
      return sidecars.daemon.url;
    },
    onDesktopReady(controls) {
      showExistingDesktop = controls.show;
      if (!pendingSecondInstanceFocus) return;
      pendingSecondInstanceFocus = false;
      controls.show();
    },
    preloadPath: join42(app22.getAppPath(), "preload.cjs"),
    update: {
      currentVersion: config.appVersion,
      downloadRoot: paths.updateRoot,
      installerObservationRoot: paths.installerObservationRoot
    }
  });
}
void main().catch((error) => {
  if (error instanceof PackagedPathAccessError) {
    try {
      dialog4.showErrorBox(error.title, error.message);
    } catch {
    }
  }
  packagedLogger?.error("packaged runtime failed", { error });
  console.error("packaged runtime failed", error);
  process.exit(1);
});
