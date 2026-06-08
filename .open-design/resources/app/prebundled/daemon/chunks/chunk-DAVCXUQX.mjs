import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);

// ../daemon/dist/browser-open.js
import { spawn as nodeSpawn } from "node:child_process";
function quoteWindowsCommandArg(value, { force = false } = {}) {
  if (value.length === 0)
    return '""';
  if (!force && !/[\s"&<>|^%]/.test(value))
    return value;
  const escaped = value.replace(/"/g, '""').replace(/%/g, '"^%"');
  return `"${escaped}"`;
}
function createBrowserOpenInvocation(platform, url, env = process.env) {
  if (platform === "win32") {
    const comspec = env.ComSpec || env.COMSPEC || "cmd.exe";
    const inner = [
      "start",
      quoteWindowsCommandArg(""),
      quoteWindowsCommandArg(url, { force: true })
    ].join(" ");
    return {
      command: comspec,
      args: ["/d", "/s", "/c", `"${inner}"`],
      options: { detached: true, stdio: "ignore", windowsHide: true, windowsVerbatimArguments: true }
    };
  }
  return {
    command: platform === "darwin" ? "open" : "xdg-open",
    args: [url],
    options: { detached: true, stdio: "ignore" }
  };
}
function openBrowser(url, deps = {}) {
  const platform = deps.platform ?? process.platform;
  const spawn = deps.spawn ?? nodeSpawn;
  const warn = deps.warn ?? ((message) => console.warn(message));
  const invocation = createBrowserOpenInvocation(platform, url, deps.env);
  try {
    const child = spawn(invocation.command, invocation.args, invocation.options);
    child.on("error", (error) => {
      const detail = error instanceof Error ? error.message : String(error);
      warn(`[od] failed to open browser: ${detail}`);
    });
    child.unref();
    return child;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    warn(`[od] failed to open browser: ${detail}`);
    return null;
  }
}

export {
  createBrowserOpenInvocation,
  openBrowser
};
