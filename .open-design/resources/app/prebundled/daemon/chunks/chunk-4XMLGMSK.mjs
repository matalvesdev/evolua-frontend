import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);

// ../daemon/dist/daemon-startup.js
async function closeHttpServer(server, { closeTimeoutMs = 5e3, idleCloseMs = 1e3 } = {}) {
  if (!server.listening)
    return;
  await new Promise((resolveClose, rejectClose) => {
    let resolved = false;
    const resolveOnce = () => {
      if (resolved)
        return;
      resolved = true;
      clearTimeout(idleTimer);
      clearTimeout(hardTimer);
      resolveClose();
    };
    const rejectOnce = (error) => {
      if (resolved)
        return;
      resolved = true;
      clearTimeout(idleTimer);
      clearTimeout(hardTimer);
      rejectClose(error);
    };
    const idleTimer = setTimeout(() => {
      server.closeIdleConnections?.();
    }, Math.min(idleCloseMs, closeTimeoutMs));
    const hardTimer = setTimeout(() => {
      server.closeAllConnections?.();
      resolveOnce();
    }, closeTimeoutMs);
    idleTimer.unref?.();
    hardTimer.unref?.();
    server.close((error) => error == null ? resolveOnce() : rejectOnce(error));
  }).finally(() => {
    server.closeIdleConnections?.();
  });
}
async function startDaemonRuntime(options = {}) {
  const { openBrowser: shouldOpenBrowser = false, logListening = false, ...serverOptions } = options;
  const { startServer } = await import("./server-RB3XHRCQ.mjs");
  const started = await startServer({
    ...serverOptions,
    returnServer: true
  });
  if (typeof started === "string") {
    throw new Error("daemon startServer did not return a server handle");
  }
  const stop = async () => {
    const closePromise = closeHttpServer(started.server);
    const shutdownPromise = started.shutdown?.().catch((error) => {
      console.error("daemon shutdown cleanup failed", error);
    }) ?? Promise.resolve();
    await Promise.allSettled([shutdownPromise, closePromise]);
  };
  if (logListening) {
    console.log(`[od] listening on ${started.url}`);
  }
  if (shouldOpenBrowser) {
    const { openBrowser } = await import("./browser-open-DO5NTVYE.mjs");
    openBrowser(started.url);
  }
  return {
    ...started,
    stop
  };
}
async function runDaemonCliStartup(argv, options = {}) {
  let port = Number(process.env.OD_PORT) || 7456;
  let host = process.env.OD_BIND_HOST || "127.0.0.1";
  let open = true;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-p" || a === "--port") {
      port = Number(argv[++i]);
    } else if (a === "--host") {
      const next = argv[++i];
      if (next != null)
        host = next;
    } else if (a === "--no-open") {
      open = false;
    } else if (a === "-h" || a === "--help") {
      options.printHelp?.();
      return;
    }
  }
  const runtime = await startDaemonRuntime({
    host,
    logListening: true,
    openBrowser: open,
    port
  });
  let shuttingDown = false;
  const stop = () => {
    if (shuttingDown) {
      process.exit(0);
    }
    shuttingDown = true;
    void runtime.stop().finally(() => process.exit(0));
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

export {
  startDaemonRuntime,
  runDaemonCliStartup
};
