import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);

// ../../packages/sidecar-proto/dist/index.mjs
var APP_KEYS = Object.freeze({
  DAEMON: "daemon",
  DESKTOP: "desktop",
  WEB: "web"
});
var SIDECAR_MODES = Object.freeze({
  DEV: "dev",
  RUNTIME: "runtime"
});
var SIDECAR_SOURCES = Object.freeze({
  PACKAGED: "packaged",
  TOOLS_DEV: "tools-dev",
  TOOLS_PACK: "tools-pack"
});
var SIDECAR_ENV = Object.freeze({
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
var SIDECAR_RUNTIME_ENV = Object.freeze({
  base: SIDECAR_ENV.BASE,
  ipcBase: SIDECAR_ENV.IPC_BASE,
  ipcPath: SIDECAR_ENV.IPC_PATH,
  namespace: SIDECAR_ENV.NAMESPACE,
  source: SIDECAR_ENV.SOURCE
});
var SIDECAR_STAMP_FLAGS = Object.freeze({
  app: "--od-stamp-app",
  ipc: "--od-stamp-ipc",
  mode: "--od-stamp-mode",
  namespace: "--od-stamp-namespace",
  source: "--od-stamp-source"
});
var STAMP_APP_FLAG = SIDECAR_STAMP_FLAGS.app;
var STAMP_IPC_FLAG = SIDECAR_STAMP_FLAGS.ipc;
var STAMP_MODE_FLAG = SIDECAR_STAMP_FLAGS.mode;
var STAMP_NAMESPACE_FLAG = SIDECAR_STAMP_FLAGS.namespace;
var STAMP_SOURCE_FLAG = SIDECAR_STAMP_FLAGS.source;
var SIDECAR_STAMP_FIELDS = ["app", "mode", "namespace", "ipc", "source"];
var SIDECAR_DEFAULTS = Object.freeze({
  host: "127.0.0.1",
  ipcBase: "/tmp/open-design/ipc",
  namespace: "default",
  projectTmpDirName: ".tmp",
  windowsPipePrefix: "open-design"
});
var SIDECAR_MESSAGES = Object.freeze({
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
var DESKTOP_UPDATE_ACTIONS = Object.freeze({
  CHECK: "check",
  DOWNLOAD: "download",
  INSTALL: "install",
  STATUS: "status"
});
var DESKTOP_UPDATE_MODES = Object.freeze({
  JS_INCREMENTAL: "js-incremental",
  PACKAGE_LAUNCHER: "package-launcher"
});
var DESKTOP_UPDATE_CHANNELS = Object.freeze({
  BETA: "beta",
  NIGHTLY: "nightly",
  PREVIEW: "preview",
  STABLE: "stable"
});
var DESKTOP_UPDATE_STATES = Object.freeze({
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
var SIDECAR_ERROR_CODES = Object.freeze({
  INVALID_MESSAGE: "SIDECAR_INVALID_MESSAGE",
  UNKNOWN_MESSAGE: "SIDECAR_UNKNOWN_MESSAGE"
});
var SidecarContractError = class extends Error {
  code;
  constructor(code, message) {
    super(message);
    this.name = "SidecarContractError";
    this.code = code;
  }
};
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
function normalizeAppKey(app) {
  if (!isAppKey(app)) throw new Error(`unsupported sidecar app: ${String(app)}`);
  return app;
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
function normalizeRegisterDesktopAuthInput(input) {
  const value = assertObject(input, "register-desktop-auth input");
  assertKnownKeys(value, ["secret"], "register-desktop-auth input");
  const secret = normalizeNonEmptyString(value.secret, "register-desktop-auth secret");
  if (!/^[A-Za-z0-9+/_=-]+$/.test(secret)) {
    throw new Error("register-desktop-auth secret must be base64-encoded");
  }
  return { secret };
}
function normalizeMintImportTokenInput(input) {
  const value = assertObject(input, "mint-import-token input");
  assertKnownKeys(value, ["baseDir"], "mint-import-token input");
  return { baseDir: normalizeNonEmptyString(value.baseDir, "mint-import-token baseDir") };
}
function normalizeMessageType(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new SidecarContractError(SIDECAR_ERROR_CODES.INVALID_MESSAGE, `${label} type must be a non-empty string`);
  }
  return value;
}
function normalizeDaemonSidecarMessage(input) {
  const value = assertObject(input, "daemon sidecar message");
  const type = normalizeMessageType(value.type, "daemon sidecar message");
  if (type === SIDECAR_MESSAGES.STATUS || type === SIDECAR_MESSAGES.SHUTDOWN) {
    assertKnownKeys(value, ["type"], "daemon sidecar message");
    return { type };
  }
  if (type === SIDECAR_MESSAGES.REGISTER_DESKTOP_AUTH) {
    assertKnownKeys(value, ["input", "type"], "daemon sidecar message");
    return { input: normalizeRegisterDesktopAuthInput(value.input), type };
  }
  if (type === SIDECAR_MESSAGES.MINT_IMPORT_TOKEN) {
    assertKnownKeys(value, ["input", "type"], "daemon sidecar message");
    return { input: normalizeMintImportTokenInput(value.input), type };
  }
  throw new SidecarContractError(SIDECAR_ERROR_CODES.UNKNOWN_MESSAGE, `unknown daemon sidecar message: ${type}`);
}
var OPEN_DESIGN_SIDECAR_CONTRACT = Object.freeze({
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
  app,
  contract,
  runtimeRoot
}) {
  return join(runtimeRoot, "logs", contract.normalizeApp(app));
}
function resolveLogFilePath({
  app,
  contract,
  fileName = "latest.log",
  runtimeRoot
}) {
  return join(resolveLogsDir({ app, contract, runtimeRoot }), fileName);
}
function resolveAppIpcPath({
  app,
  contract,
  env = process.env,
  namespace
}) {
  const normalizedApp = contract.normalizeApp(app);
  const normalizedNamespace = contract.normalizeNamespace(namespace);
  if (process.platform === "win32") {
    return `\\\\.\\pipe\\${contract.defaults.windowsPipePrefix}-${normalizedNamespace}-${normalizedApp}`;
  }
  const ipcBase = resolve(env[contract.env.ipcBase] ?? contract.defaults.ipcBase);
  return join(ipcBase, normalizedNamespace, `${normalizedApp}.sock`);
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
async function staleUnixSocketExists(socketPath) {
  try {
    const stat = await lstat(socketPath);
    if (!stat.isSocket()) return false;
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

export {
  APP_KEYS,
  SIDECAR_MODES,
  SIDECAR_ENV,
  SIDECAR_DEFAULTS,
  SIDECAR_MESSAGES,
  normalizeDaemonSidecarMessage,
  OPEN_DESIGN_SIDECAR_CONTRACT,
  resolveRuntimeNamespaceRoot,
  resolveLogFilePath,
  resolveAppIpcPath,
  bootstrapSidecarRuntime,
  createJsonIpcServer,
  requestJsonIpc
};
