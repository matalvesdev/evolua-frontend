import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);
import "./chunk-WRAIAC3Y.mjs";

// ../daemon/dist/runtimes/terminal-launch.js
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
var execFileAsync = promisify(execFile);
async function launchOnDarwin(command) {
  const safe = command.replace(/"/g, '\\"');
  const script = `tell application "Terminal" to do script "${safe}"
tell application "Terminal" to activate`;
  try {
    await execFileAsync("osascript", ["-e", script], { timeout: 5e3 });
    return { ok: true, platform: "darwin", via: "osascript" };
  } catch (err) {
    return {
      ok: false,
      platform: "darwin",
      reason: `osascript failed: ${err instanceof Error ? err.message : String(err)}`
    };
  }
}
async function launchOnLinux(command) {
  const attempts = [
    { bin: "x-terminal-emulator", args: ["-e", command] },
    { bin: "gnome-terminal", args: ["--", "sh", "-c", `${command}; exec $SHELL`] },
    { bin: "konsole", args: ["-e", command] },
    { bin: "xfce4-terminal", args: ["-e", command] },
    { bin: "xterm", args: ["-e", command] }
  ];
  const errors = [];
  for (const { bin, args } of attempts) {
    try {
      await new Promise((resolve, reject) => {
        const child = spawn(bin, args, { detached: true, stdio: "ignore" });
        child.unref();
        child.once("spawn", resolve);
        child.once("error", reject);
      });
      return { ok: true, platform: "linux", via: bin };
    } catch (err) {
      errors.push(`${bin}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return {
    ok: false,
    platform: "linux",
    reason: `no system terminal worked (${errors.join("; ")})`
  };
}
async function launchOnWindows(command) {
  try {
    await execFileAsync("cmd.exe", ["/c", "start", "Open Design", "cmd.exe", "/k", command], { timeout: 5e3 });
    return { ok: true, platform: "win32", via: "cmd /c start" };
  } catch (err) {
    return {
      ok: false,
      platform: "win32",
      reason: `cmd /c start failed: ${err instanceof Error ? err.message : String(err)}`
    };
  }
}
async function launchAgentInSystemTerminal(command, platform = process.platform) {
  switch (platform) {
    case "darwin":
      return launchOnDarwin(command);
    case "linux":
      return launchOnLinux(command);
    case "win32":
      return launchOnWindows(command);
    default:
      return {
        ok: false,
        platform,
        reason: `system-terminal launch is not supported on ${platform}`
      };
  }
}
export {
  launchAgentInSystemTerminal
};
