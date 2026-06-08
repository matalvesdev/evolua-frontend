import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);
import {
  getDesktopAuthSecret,
  isDesktopAuthGateActive,
  isDesktopAuthRegistered,
  setDesktopAuthSecret,
  signDesktopImportToken
} from "./chunks/chunk-EBV37MM6.mjs";
import {
  startDaemonRuntime
} from "./chunks/chunk-4XMLGMSK.mjs";
import {
  APP_KEYS,
  OPEN_DESIGN_SIDECAR_CONTRACT,
  SIDECAR_ENV,
  SIDECAR_MESSAGES,
  bootstrapSidecarRuntime,
  createJsonIpcServer,
  normalizeDaemonSidecarMessage,
  requestJsonIpc,
  resolveAppIpcPath
} from "./chunks/chunk-YQ23VIX5.mjs";
import {
  readProcessStamp
} from "./chunks/chunk-FBHBYNIK.mjs";
import "./chunks/chunk-WRAIAC3Y.mjs";

// ../daemon/dist/sidecar/server.js
import { randomBytes } from "node:crypto";
function withCurrentDesktopAuthGate(snapshot) {
  return { ...snapshot, desktopAuthGateActive: isDesktopAuthGateActive() };
}
var DAEMON_PORT_ENV = SIDECAR_ENV.DAEMON_PORT;
var WEB_PORT_ENV = SIDECAR_ENV.WEB_PORT;
var TOOLS_DEV_PARENT_PID_ENV = SIDECAR_ENV.TOOLS_DEV_PARENT_PID;
var DESKTOP_IMPORT_TOKEN_TTL_MS = 6e4;
function parsePort(value) {
  if (value == null || value.trim().length === 0)
    return 0;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`${DAEMON_PORT_ENV} must be an integer between 0 and 65535`);
  }
  return port;
}
function parseOptionalTrustedWebPort(value) {
  const port = parsePort(value);
  return port > 0 ? port : null;
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
    void stop().finally(() => process.exit(0));
  }, 1e3);
  timer.unref();
}
function mintImportTokenForCli(baseDir) {
  if (!isDesktopAuthGateActive()) {
    return {
      ok: false,
      code: "DESKTOP_AUTH_INACTIVE",
      message: "desktop import auth gate is inactive",
      retryable: false
    };
  }
  const secret = getDesktopAuthSecret();
  if (secret == null || !isDesktopAuthRegistered()) {
    return {
      ok: false,
      code: "DESKTOP_AUTH_PENDING",
      message: "desktop auth required but secret not yet registered",
      retryable: true
    };
  }
  const nonce = randomBytes(16).toString("base64url");
  const expiresAt = new Date(Date.now() + DESKTOP_IMPORT_TOKEN_TTL_MS).toISOString();
  return {
    ok: true,
    expiresAt,
    token: signDesktopImportToken(secret, baseDir, { nonce, exp: expiresAt })
  };
}
async function startDaemonSidecar(runtime) {
  const serverHandle = await startDaemonRuntime({
    desktopPdfExporter: async (input) => {
      const desktopIpc = resolveAppIpcPath({
        app: APP_KEYS.DESKTOP,
        contract: OPEN_DESIGN_SIDECAR_CONTRACT,
        namespace: runtime.namespace
      });
      return await requestJsonIpc(desktopIpc, { input, type: SIDECAR_MESSAGES.EXPORT_PDF }, { timeoutMs: 6e5 });
    },
    port: parsePort(process.env[DAEMON_PORT_ENV]),
    runtime
  });
  const state = {
    desktopAuthGateActive: isDesktopAuthGateActive(),
    pid: process.pid,
    state: "running",
    trustedWebOriginPort: parseOptionalTrustedWebPort(process.env[WEB_PORT_ENV]),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    url: serverHandle.url
  };
  let ipcServer = null;
  let stopped = false;
  let resolveStopped;
  const stoppedPromise = new Promise((resolveStop) => {
    resolveStopped = resolveStop;
  });
  async function stop() {
    if (stopped)
      return;
    stopped = true;
    state.state = "stopped";
    state.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    await ipcServer?.close().catch(() => void 0);
    await serverHandle.stop().catch(() => void 0);
    resolveStopped();
  }
  attachParentMonitor(stop);
  ipcServer = await createJsonIpcServer({
    socketPath: runtime.ipc,
    handler: async (message) => {
      const request = normalizeDaemonSidecarMessage(message);
      switch (request.type) {
        case SIDECAR_MESSAGES.STATUS:
          return withCurrentDesktopAuthGate(state);
        case SIDECAR_MESSAGES.SHUTDOWN:
          setImmediate(() => {
            void stop().finally(() => process.exit(0));
          });
          return { accepted: true };
        case SIDECAR_MESSAGES.REGISTER_DESKTOP_AUTH:
          setDesktopAuthSecret(Buffer.from(request.input.secret, "base64"));
          return { accepted: true };
        case SIDECAR_MESSAGES.MINT_IMPORT_TOKEN:
          return mintImportTokenForCli(request.input.baseDir);
      }
    }
  });
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      void stop().finally(() => process.exit(0));
    });
  }
  return {
    async status() {
      return withCurrentDesktopAuthGate(state);
    },
    stop,
    waitUntilStopped() {
      return stoppedPromise;
    }
  };
}

// ../daemon/dist/sidecar/index.js
async function main() {
  const stamp = readProcessStamp(process.argv.slice(2), OPEN_DESIGN_SIDECAR_CONTRACT);
  if (stamp == null)
    throw new Error("sidecar stamp is required");
  const runtime = bootstrapSidecarRuntime(stamp, process.env, {
    app: APP_KEYS.DAEMON,
    contract: OPEN_DESIGN_SIDECAR_CONTRACT
  });
  const server = await startDaemonSidecar(runtime);
  process.stdout.write(`${JSON.stringify(await server.status(), null, 2)}
`);
  await server.waitUntilStopped();
}
void main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
