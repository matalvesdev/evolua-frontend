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
function normalizeMessageType(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new SidecarContractError(SIDECAR_ERROR_CODES.INVALID_MESSAGE, `${label} type must be a non-empty string`);
  }
  return value;
}
function normalizeWebSidecarMessage(input) {
  const value = assertObject(input, "web sidecar message");
  const type = normalizeMessageType(value.type, "web sidecar message");
  if (type === SIDECAR_MESSAGES.STATUS || type === SIDECAR_MESSAGES.SHUTDOWN) {
    assertKnownKeys(value, ["type"], "web sidecar message");
    return { type };
  }
  throw new SidecarContractError(SIDECAR_ERROR_CODES.UNKNOWN_MESSAGE, `unknown web sidecar message: ${type}`);
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

// ../../packages/platform/dist/index.mjs
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

// ../web/dist/sidecar/server.js
import { spawn } from "node:child_process";
import { createServer as createHttpServer, request as createHttpRequest } from "node:http";
import { request as createHttpsRequest } from "node:https";
import { existsSync, readFileSync } from "node:fs";
import { readFile as readFile2, rm as rm2, writeFile as writeFile2 } from "node:fs/promises";
import { createRequire } from "node:module";
import { createServer as createTcpServer } from "node:net";
import { dirname as dirname2, isAbsolute as isAbsolute2, join as join2 } from "node:path";
import { fileURLToPath } from "node:url";
var HOST = process.env.OD_HOST || "127.0.0.1";
if (process.env.OD_HOST != null && !/^[a-zA-Z0-9._\-:[\]@]+$/.test(process.env.OD_HOST)) {
  throw new Error(`OD_HOST contains invalid characters: ${process.env.OD_HOST}`);
}
var DAEMON_HOST = "127.0.0.1";
var STANDALONE_BACKEND_HOST = "127.0.0.1";
var DAEMON_PORT_ENV = SIDECAR_ENV.DAEMON_PORT;
var WEB_DIST_DIR_ENV = SIDECAR_ENV.WEB_DIST_DIR;
var WEB_PORT_ENV = SIDECAR_ENV.WEB_PORT;
var TOOLS_DEV_PARENT_PID_ENV = SIDECAR_ENV.TOOLS_DEV_PARENT_PID;
var WEB_OUTPUT_MODE_ENV = "OD_WEB_OUTPUT_MODE";
var WEB_STANDALONE_ROOT_ENV = "OD_WEB_STANDALONE_ROOT";
var STANDALONE_PARENT_PID_ENV = "OD_STANDALONE_PARENT_PID";
var STANDALONE_STARTUP_TIMEOUT_ENV = "OD_STANDALONE_STARTUP_TIMEOUT_MS";
var SHUTDOWN_TIMEOUT_MS = 3e3;
var require2 = createRequire(import.meta.url);
function createNextApp(options) {
  const createNextServer = require2("next");
  return createNextServer(options);
}
function resolveWebRoot() {
  let current = dirname2(fileURLToPath(import.meta.url));
  for (let depth = 0; depth < 8; depth += 1) {
    try {
      const packageJson = JSON.parse(readFileSync(join2(current, "package.json"), "utf8"));
      if (packageJson.name === "@open-design/web")
        return current;
    } catch {
    }
    const parent = dirname2(current);
    if (parent === current)
      break;
    current = parent;
  }
  throw new Error("failed to resolve @open-design/web package root");
}
function parsePort(value) {
  if (value == null || value.trim().length === 0)
    return 0;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`${WEB_PORT_ENV} must be an integer between 0 and 65535`);
  }
  return port;
}
function parsePositiveIntegerEnv(envName, defaultValue) {
  const value = process.env[envName];
  if (value == null || value.trim().length === 0)
    return defaultValue;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${envName} must be a positive integer`);
  }
  return parsed;
}
function resolveStandaloneStartupTimeoutMs() {
  return parsePositiveIntegerEnv(STANDALONE_STARTUP_TIMEOUT_ENV, 35e3);
}
function createStandaloneParentMonitorImport(parentPidEnv = STANDALONE_PARENT_PID_ENV) {
  const source = `
const parentPid = Number(process.env[${JSON.stringify(parentPidEnv)}]);
if (Number.isInteger(parentPid) && parentPid > 0) {
  const isParentAlive = () => {
    try {
      process.kill(parentPid, 0);
      return true;
    } catch {
      return false;
    }
  };
  const timer = setInterval(() => {
    if (process.ppid === parentPid && isParentAlive()) return;
    process.exit(0);
  }, 1000);
  timer.unref?.();
}
`;
  return `data:text/javascript,${encodeURIComponent(source)}`;
}
function createStandaloneServerArgs(entryPath) {
  return ["--import", createStandaloneParentMonitorImport(), entryPath];
}
function resolveStandaloneBackendOrigin(port) {
  return `http://${STANDALONE_BACKEND_HOST}:${port}`;
}
function createStandaloneBackendEnv(options) {
  return {
    ...options.baseEnv ?? process.env,
    HOSTNAME: STANDALONE_BACKEND_HOST,
    NODE_ENV: "production",
    PORT: String(options.port),
    [STANDALONE_PARENT_PID_ENV]: String(options.parentPid ?? process.pid)
  };
}
function resolveWebDistDir(webRoot) {
  const configured = process.env[WEB_DIST_DIR_ENV];
  if (configured == null || configured.length === 0)
    return join2(webRoot, ".next");
  return isAbsolute2(configured) ? configured : join2(webRoot, configured);
}
function resolveConfiguredStandaloneRoot() {
  const configured = process.env[WEB_STANDALONE_ROOT_ENV];
  if (configured == null || configured.length === 0)
    return null;
  return isAbsolute2(configured) ? configured : join2(process.cwd(), configured);
}
function resolveStandaloneServerEntry(webRoot = resolveWebRoot(), standaloneRoot = resolveConfiguredStandaloneRoot()) {
  const configuredRoot = standaloneRoot == null || standaloneRoot.length === 0 ? null : isAbsolute2(standaloneRoot) ? standaloneRoot : join2(process.cwd(), standaloneRoot);
  const candidates = [
    ...configuredRoot == null ? [] : [
      join2(configuredRoot, "apps", "web", "server.js"),
      join2(configuredRoot, "server.js")
    ],
    ...webRoot == null ? [] : [
      join2(resolveWebDistDir(webRoot), "standalone", "apps", "web", "server.js"),
      join2(resolveWebDistDir(webRoot), "standalone", "server.js")
    ]
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}
function shouldUseStandaloneOutput(runtime) {
  return runtime.mode !== "dev" && process.env[WEB_OUTPUT_MODE_ENV] === "standalone";
}
function resolveDaemonOrigin() {
  const port = parsePort(process.env[DAEMON_PORT_ENV]);
  return port === 0 ? null : `http://${DAEMON_HOST}:${port}`;
}
function isDaemonProxyPathname(pathname) {
  return pathname === "/api" || pathname.startsWith("/api/") || pathname === "/artifacts" || pathname.startsWith("/artifacts/") || pathname === "/frames" || pathname.startsWith("/frames/");
}
function resolveDaemonProxyTarget(daemonOrigin, requestUrl) {
  const target = resolveHttpProxyTarget(daemonOrigin, requestUrl);
  if (target == null || !isDaemonProxyPathname(target.pathname))
    return null;
  return target;
}
function resolveHttpProxyTarget(origin, requestUrl) {
  if (requestUrl == null)
    return null;
  let parsedRequestUrl;
  try {
    parsedRequestUrl = new URL(requestUrl, `http://${HOST}`);
  } catch {
    return null;
  }
  return new URL(`${parsedRequestUrl.pathname}${parsedRequestUrl.search}`, origin);
}
function normalizeDaemonProxyOriginHeader(options) {
  if (options.origin == null || options.origin.length === 0)
    return options.origin;
  const schemes = ["http", "https"];
  const loopbackHosts = ["127.0.0.1", "localhost", "[::1]", HOST];
  const allowedWebOrigins = new Set(schemes.flatMap((scheme) => loopbackHosts.map((host) => `${scheme}://${host}:${options.webPort}`)));
  if (allowedWebOrigins.has(options.origin))
    return options.daemonOrigin;
  const parsedOrigin = parseHttpOrigin(options.origin);
  if (parsedOrigin != null && isSameBrowserHostOrigin({
    origin: parsedOrigin,
    requestHost: options.requestHost,
    webPort: options.webPort
  })) {
    return options.daemonOrigin;
  }
  return options.origin;
}
function firstHeaderValue(value) {
  return Array.isArray(value) ? value[0] : value;
}
function parseHostHeader(value) {
  const raw = firstHeaderValue(value)?.trim();
  if (raw == null || raw.length === 0)
    return null;
  try {
    return new URL(`http://${raw}`);
  } catch {
    return null;
  }
}
function parseHttpOrigin(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed : null;
  } catch {
    return null;
  }
}
function parseAllowedDevHost(value) {
  const trimmed = value.trim();
  if (trimmed.length === 0)
    return null;
  try {
    return new URL(trimmed).hostname.toLowerCase();
  } catch {
    try {
      return new URL(`http://${trimmed}`).hostname.toLowerCase();
    } catch {
      return null;
    }
  }
}
function configuredAllowedDevHosts() {
  return new Set((process.env.OD_ALLOWED_DEV_ORIGINS ?? "").split(",").map(parseAllowedDevHost).filter((host) => host != null));
}
function isAllowedDevHost(hostname, allowedHosts) {
  const host = hostname.toLowerCase();
  if (allowedHosts.has(host))
    return true;
  for (const allowedHost of allowedHosts) {
    if (!allowedHost.startsWith("*."))
      continue;
    const suffix = allowedHost.slice(1);
    if (host.endsWith(suffix) && host.length > suffix.length)
      return true;
  }
  return false;
}
function parseIpv4(value) {
  const parts = value.split(".");
  if (parts.length !== 4)
    return null;
  if (!parts.every((part) => /^\d+$/.test(part)))
    return null;
  const octets = parts.map((part) => Number(part));
  if (!octets.every((octet) => Number.isInteger(octet) && octet >= 0 && octet <= 255))
    return null;
  return octets;
}
function isPrivateLanIpv4(value) {
  const octets = parseIpv4(value);
  if (octets == null)
    return false;
  const [a, b] = octets;
  return a === 10 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168 || a === 169 && b === 254 || a === 100 && b >= 64 && b <= 127;
}
function isLoopbackOrPrivateLanHost(hostname) {
  const host = hostname.toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]" || host === "0.0.0.0" || host === "::" || isPrivateLanIpv4(host);
}
function defaultPortForProtocol(protocol) {
  return protocol === "https:" ? "443" : "80";
}
function isSameBrowserHostOrigin(options) {
  const requestHost = parseHostHeader(options.requestHost);
  if (requestHost == null)
    return false;
  const originPort = options.origin.port || defaultPortForProtocol(options.origin.protocol);
  const requestPort = requestHost.port || "80";
  if (originPort !== String(options.webPort) || requestPort !== originPort)
    return false;
  if (requestHost.hostname.toLowerCase() !== options.origin.hostname.toLowerCase())
    return false;
  const allowedDevHosts = configuredAllowedDevHosts();
  const originHost = options.origin.hostname.toLowerCase();
  return isLoopbackOrPrivateLanHost(originHost) || isAllowedDevHost(originHost, allowedDevHosts);
}
async function proxyHttpRequest(target, request, response, options = {}) {
  const proxyRequestFactory = target.protocol === "https:" ? createHttpsRequest : createHttpRequest;
  const headers = { ...request.headers, host: target.host };
  if (options.daemonWebPort != null) {
    const origin = normalizeDaemonProxyOriginHeader({
      daemonOrigin: target.origin,
      origin: typeof request.headers.origin === "string" ? request.headers.origin : void 0,
      requestHost: request.headers.host,
      webPort: options.daemonWebPort
    });
    if (origin == null || origin.length === 0) {
      delete headers.origin;
    } else {
      headers.origin = origin;
    }
  }
  await new Promise((resolveProxy) => {
    const proxyRequest = proxyRequestFactory(target, {
      headers,
      method: request.method
    }, (proxyResponse) => {
      response.writeHead(proxyResponse.statusCode ?? 502, proxyResponse.headers);
      proxyResponse.pipe(response);
      proxyResponse.on("end", resolveProxy);
    });
    proxyRequest.on("error", (error) => {
      if (!response.headersSent) {
        response.statusCode = 502;
        response.setHeader("content-type", "text/plain; charset=utf-8");
      }
      response.end(error instanceof Error ? error.message : String(error));
      resolveProxy();
    });
    request.pipe(proxyRequest);
  });
}
async function prepareNextApp(app, dir) {
  const nextEnvPath = join2(dir, "next-env.d.ts");
  const previousNextEnv = await readFile2(nextEnvPath, "utf8").catch(() => null);
  await app.prepare();
  if (previousNextEnv == null) {
    await rm2(nextEnvPath, { force: true }).catch(() => void 0);
    return;
  }
  await writeFile2(nextEnvPath, previousNextEnv, "utf8").catch(() => void 0);
}
async function listen(server, port, host = HOST) {
  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen({ host, port }, () => {
      server.off("error", rejectListen);
      resolveListen();
    });
  });
  const address = server.address();
  if (address == null || typeof address === "string") {
    throw new Error("failed to resolve Next.js server address");
  }
  return address.port;
}
async function closeServer2(server) {
  if (!server.listening)
    return;
  await new Promise((resolveClose, rejectClose) => {
    server.close((error) => error == null ? resolveClose() : rejectClose(error));
  });
}
async function reserveTcpPort(host = HOST) {
  const server = createTcpServer();
  try {
    return await listen(server, 0, host);
  } finally {
    await closeServer2(server).catch(() => void 0);
  }
}
async function waitForChildExit(child) {
  if (child.exitCode != null || child.signalCode != null)
    return;
  await new Promise((resolveExit) => {
    child.once("exit", () => resolveExit());
  });
}
async function stopStandaloneChild(child) {
  if (child.exitCode != null || child.signalCode != null)
    return;
  child.kill("SIGTERM");
  let timeout;
  try {
    await Promise.race([
      waitForChildExit(child),
      new Promise((resolveTimeout) => {
        timeout = setTimeout(resolveTimeout, SHUTDOWN_TIMEOUT_MS);
        timeout.unref();
      })
    ]);
  } finally {
    if (timeout != null)
      clearTimeout(timeout);
  }
  if (child.exitCode == null && child.signalCode == null) {
    child.kill("SIGKILL");
    await waitForChildExit(child).catch(() => void 0);
  }
}
async function probeStandaloneBackend(origin) {
  return await new Promise((resolveProbe) => {
    const request = createHttpRequest(new URL("/", origin), { method: "HEAD", timeout: 800 }, (response) => {
      response.resume();
      resolveProbe(true);
    });
    request.on("timeout", () => {
      request.destroy();
      resolveProbe(false);
    });
    request.on("error", () => resolveProbe(false));
    request.end();
  });
}
async function waitForStandaloneBackendReady(child, origin, timeoutMs = resolveStandaloneStartupTimeoutMs()) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (child.exitCode != null || child.signalCode != null) {
      const elapsedMs = Date.now() - startedAt;
      const likelyPortRace = elapsedMs <= 200;
      throw new Error(`standalone Next.js server exited before readiness after ${elapsedMs}ms: code=${child.exitCode} signal=${child.signalCode}` + (likelyPortRace ? "; the reserved startup port may have been claimed before the child process bound it, retry the launch" : ""));
    }
    if (await probeStandaloneBackend(origin))
      return;
    await new Promise((resolveWait) => setTimeout(resolveWait, 150));
  }
  throw new Error(`timed out after ${timeoutMs}ms waiting for standalone Next.js server at ${origin}; override with ${STANDALONE_STARTUP_TIMEOUT_ENV}`);
}
async function startStandaloneBackend(webRoot) {
  const entryPath = resolveStandaloneServerEntry(webRoot);
  if (entryPath == null) {
    throw new Error(webRoot == null ? `missing Next.js standalone server under ${WEB_STANDALONE_ROOT_ENV}; configure ${WEB_STANDALONE_ROOT_ENV} or install @open-design/web` : `missing Next.js standalone server under ${resolveWebDistDir(webRoot)}; rebuild with ${WEB_OUTPUT_MODE_ENV}=standalone`);
  }
  const port = await reserveTcpPort(STANDALONE_BACKEND_HOST);
  const origin = resolveStandaloneBackendOrigin(port);
  console.log(`[open-design web] starting standalone Next.js server from ${entryPath}`);
  const child = spawn(process.execPath, createStandaloneServerArgs(entryPath), {
    cwd: dirname2(entryPath),
    env: createStandaloneBackendEnv({ port }),
    stdio: ["ignore", "inherit", "inherit"],
    ...process.platform === "win32" ? { windowsHide: true } : {}
  });
  await new Promise((resolveSpawn, rejectSpawn) => {
    child.once("error", rejectSpawn);
    child.once("spawn", resolveSpawn);
  });
  let standaloneRunning = true;
  let standaloneExitReason = null;
  child.once("exit", (code, signal) => {
    standaloneRunning = false;
    standaloneExitReason = `code=${code ?? "null"} signal=${signal ?? "null"}`;
    console.error(`[open-design web] standalone Next.js server exited ${standaloneExitReason}`);
  });
  try {
    await waitForStandaloneBackendReady(child, origin);
  } catch (error) {
    await stopStandaloneChild(child).catch(() => void 0);
    throw error;
  }
  return {
    exitReason() {
      return standaloneExitReason;
    },
    isRunning() {
      return standaloneRunning && child.exitCode == null && child.signalCode == null;
    },
    origin,
    async stop() {
      await stopStandaloneChild(child);
    }
  };
}
async function settleShutdownTask(task) {
  if (task == null)
    return;
  let timeout;
  try {
    await Promise.race([
      task.catch(() => void 0),
      new Promise((resolveTimeout) => {
        timeout = setTimeout(resolveTimeout, SHUTDOWN_TIMEOUT_MS);
        timeout.unref();
      })
    ]);
  } finally {
    if (timeout != null)
      clearTimeout(timeout);
  }
}
function stopThenExit(stop) {
  const hardExit = setTimeout(() => process.exit(0), SHUTDOWN_TIMEOUT_MS + 1e3);
  hardExit.unref();
  void stop().finally(() => {
    clearTimeout(hardExit);
    process.exit(0);
  });
}
function isProcessAlive(pid) {
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
    if (isProcessAlive(parentPid))
      return;
    clearInterval(timer);
    stopThenExit(stop);
  }, 1e3);
  timer.unref();
}
async function createWebSidecarHandle(runtime, httpServer, closeRuntime, isRuntimeRunning) {
  const port = await listen(httpServer, parsePort(process.env[WEB_PORT_ENV]));
  const state = {
    pid: process.pid,
    state: "running",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    url: `http://${HOST}:${port}`
  };
  let ipcServer = null;
  let stopped = false;
  let resolveStopped;
  const stoppedPromise = new Promise((resolveStop) => {
    resolveStopped = resolveStop;
  });
  function refreshRuntimeState() {
    if (stopped || isRuntimeRunning == null || isRuntimeRunning())
      return;
    state.state = "stopped";
    state.url = null;
    state.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  }
  async function stop() {
    if (stopped)
      return;
    stopped = true;
    state.state = "stopped";
    state.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    await settleShutdownTask(ipcServer?.close());
    await settleShutdownTask(closeServer2(httpServer));
    await settleShutdownTask(Promise.resolve().then(closeRuntime));
    resolveStopped();
  }
  attachParentMonitor(stop);
  ipcServer = await createJsonIpcServer({
    socketPath: runtime.ipc,
    handler: async (message) => {
      const request = normalizeWebSidecarMessage(message);
      switch (request.type) {
        case SIDECAR_MESSAGES.STATUS:
          refreshRuntimeState();
          return { ...state };
        case SIDECAR_MESSAGES.SHUTDOWN:
          setImmediate(() => {
            stopThenExit(stop);
          });
          return { accepted: true };
      }
    }
  });
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      stopThenExit(stop);
    });
  }
  return {
    async status() {
      refreshRuntimeState();
      return { ...state };
    },
    stop,
    waitUntilStopped() {
      return stoppedPromise;
    }
  };
}
function createDaemonProxyHandler(daemonOrigin, fallback) {
  return (request, response) => {
    const daemonProxyTarget = daemonOrigin == null ? null : resolveDaemonProxyTarget(daemonOrigin, request.url);
    if (daemonProxyTarget != null) {
      const localPort = request.socket.localPort;
      void proxyHttpRequest(daemonProxyTarget, request, response, {
        daemonWebPort: typeof localPort === "number" ? localPort : 0
      }).catch((error) => {
        response.statusCode = 502;
        response.end(error instanceof Error ? error.message : String(error));
      });
      return;
    }
    void fallback(request, response).catch((error) => {
      response.statusCode = 500;
      response.end(error instanceof Error ? error.message : String(error));
    });
  };
}
async function startRegularNextSidecar(runtime, webRoot) {
  const app = createNextApp({ dev: process.env.OD_WEB_PROD !== "1" && runtime.mode === "dev", dir: webRoot });
  await prepareNextApp(app, webRoot);
  const daemonOrigin = resolveDaemonOrigin();
  const handleRequest = app.getRequestHandler();
  const httpServer = createHttpServer(createDaemonProxyHandler(daemonOrigin, handleRequest));
  return await createWebSidecarHandle(runtime, httpServer, async () => {
    await app.close?.();
  });
}
async function startStandaloneNextSidecar(runtime, webRoot) {
  const daemonOrigin = resolveDaemonOrigin();
  const backend = await startStandaloneBackend(webRoot);
  const httpServer = createHttpServer(createDaemonProxyHandler(daemonOrigin, async (request, response) => {
    if (!backend.isRunning()) {
      response.statusCode = 502;
      response.end(`standalone Next.js server is not running${backend.exitReason() == null ? "" : ` (${backend.exitReason()})`}`);
      return;
    }
    const target = resolveHttpProxyTarget(backend.origin, request.url);
    if (target == null) {
      response.statusCode = 400;
      response.end("invalid request URL");
      return;
    }
    await proxyHttpRequest(target, request, response);
  }));
  try {
    return await createWebSidecarHandle(runtime, httpServer, backend.stop, backend.isRunning);
  } catch (error) {
    await backend.stop().catch(() => void 0);
    throw error;
  }
}
async function startWebSidecar(runtime) {
  if (shouldUseStandaloneOutput(runtime)) {
    const webRoot2 = resolveConfiguredStandaloneRoot() == null ? resolveWebRoot() : null;
    return await startStandaloneNextSidecar(runtime, webRoot2);
  }
  const webRoot = resolveWebRoot();
  return await startRegularNextSidecar(runtime, webRoot);
}

// ../web/dist/sidecar/index.js
async function main() {
  const stamp = readProcessStamp(process.argv.slice(2), OPEN_DESIGN_SIDECAR_CONTRACT);
  if (stamp == null)
    throw new Error("sidecar stamp is required");
  const runtime = bootstrapSidecarRuntime(stamp, process.env, {
    app: APP_KEYS.WEB,
    contract: OPEN_DESIGN_SIDECAR_CONTRACT
  });
  const server = await startWebSidecar(runtime);
  process.stdout.write(`${JSON.stringify(await server.status(), null, 2)}
`);
  await server.waitUntilStopped();
}
void main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
