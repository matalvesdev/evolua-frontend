import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);

// ../../packages/platform/dist/index.mjs
import { execFile, execFileSync, spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
var CANONICAL_PROXY_ENV_KEYS = /* @__PURE__ */ new Map([
  ["all_proxy", "ALL_PROXY"],
  ["http_proxy", "HTTP_PROXY"],
  ["https_proxy", "HTTPS_PROXY"],
  ["node_use_env_proxy", "NODE_USE_ENV_PROXY"],
  ["no_proxy", "NO_PROXY"]
]);
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
function setCanonicalProxyEnvValue(env, canonicalKey, value, platform) {
  deleteProxyEnvVariants(env, canonicalKey);
  if (canonicalKey === "NODE_USE_ENV_PROXY") {
    env.NODE_USE_ENV_PROXY = value;
    return;
  }
  addProxyEnvValue(env, canonicalKey, value, platform);
}
function mergeProxyAwareEnv(platform, ...sources) {
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
      setCanonicalProxyEnvValue(merged, canonicalKey, entry.value, platform);
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
function addProxyEnvValue(env, key, value, platform) {
  const trimmed = value.trim();
  if (!trimmed) return;
  env[key] = trimmed;
  if (platform !== "win32") env[key.toLowerCase()] = trimmed;
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
function finalizeSystemProxyEnv(values, platform) {
  const hasProxy = Boolean(values.httpProxy || values.httpsProxy || values.allProxy);
  const noProxy = hasProxy ? preserveWildcardNoProxyValue(values.noProxy) ?? buildNoProxyValue([
    ...values.noProxy ? values.noProxy.split(",") : [],
    "localhost",
    "127.0.0.1",
    "[::1]"
  ]) : null;
  const env = {};
  if (values.httpProxy) addProxyEnvValue(env, "HTTP_PROXY", values.httpProxy, platform);
  if (values.httpsProxy) addProxyEnvValue(env, "HTTPS_PROXY", values.httpsProxy, platform);
  if (values.allProxy) addProxyEnvValue(env, "ALL_PROXY", values.allProxy, platform);
  if (noProxy) addProxyEnvValue(env, "NO_PROXY", noProxy, platform);
  if (hasProxy) env.NODE_USE_ENV_PROXY = "1";
  return env;
}
function parseMacosScutilProxyOutput(stdout, platform = "darwin") {
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
    platform
  );
}
function parseRegistryValue(stdout, valueName) {
  const match = stdout.match(new RegExp(`^\\s*${valueName}\\s+REG_\\w+\\s+(.+)$`, "m"));
  return match ? match[1].trim() : null;
}
function parseWindowsInternetSettingsProxyOutput(input, platform = "win32") {
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
    platform
  );
}
function resolveSystemProxyEnv(options = {}) {
  const platform = options.platform ?? process.platform;
  const runCommand = options.runCommand ?? defaultSystemProxyCommandRunner;
  const tryRun = (command, args) => {
    try {
      return runCommand(command, args);
    } catch {
      return "";
    }
  };
  try {
    if (platform === "darwin") {
      return parseMacosScutilProxyOutput(tryRun("scutil", ["--proxy"]), platform);
    }
    if (platform === "win32") {
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
        platform
      );
    }
  } catch {
    return {};
  }
  return {};
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
function quoteWindowsCommandArg(value) {
  if (!/[\s"&<>|^%]/.test(value)) return value;
  const escaped = value.replace(/"/g, '""').replace(/%/g, '"^%"');
  return `"${escaped}"`;
}
function buildCmdShimInvocation(command, args, env) {
  const inner = [command, ...args].map(quoteWindowsCommandArg).join(" ");
  return {
    args: ["/d", "/s", "/c", `"${inner}"`],
    command: env.ComSpec ?? process.env.ComSpec ?? "cmd.exe",
    windowsVerbatimArguments: true
  };
}
function createCommandInvocation({ args = [], command, env = process.env }) {
  if (process.platform === "win32" && /\.(bat|cmd)$/i.test(command)) {
    return buildCmdShimInvocation(command, args, env);
  }
  return { args, command };
}
function resolveUserScopedHome(raw, home) {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (value.length === 0) return null;
  if (value === "~") return home;
  if (value.startsWith("~/") || value.startsWith("~\\")) {
    return join(home, value.slice(2));
  }
  return isAbsolute(value) ? value : null;
}
function wellKnownUserToolchainBins(options = {}) {
  const home = options.home ?? homedir();
  const includeSystemBins = options.includeSystemBins ?? process.platform !== "win32";
  const env = options.env ?? process.env;
  const dirs = [];
  const vpHome = resolveUserScopedHome(env.VP_HOME, home);
  if (vpHome) {
    dirs.push(join(vpHome, "bin"));
  }
  const npmPrefixRaw = env.NPM_CONFIG_PREFIX ?? env.npm_config_prefix;
  if (typeof npmPrefixRaw === "string") {
    const npmPrefix = npmPrefixRaw.trim();
    if (npmPrefix.length > 0) {
      dirs.push(join(npmPrefix, "bin"));
    }
  }
  dirs.push(
    join(home, ".local", "bin"),
    join(home, ".vite-plus", "bin"),
    join(home, ".opencode", "bin"),
    join(home, ".bun", "bin"),
    join(home, ".volta", "bin"),
    join(home, ".asdf", "shims"),
    join(home, "Library", "pnpm"),
    join(home, ".cargo", "bin"),
    // Common user-level npm prefixes for sudo-free global installs.
    // ~/.npm-global is the dominant non-canonical convention shipped
    // in most third-party "fix npm EACCES" tutorials, and
    // ~/.npm-packages is the second-most common variant. Without
    // these, GUI-launched daemons miss `npm i -g`'d CLIs even though
    // they resolve cleanly from the user's shell. See open-design
    // issue #442.
    join(home, ".npm-global", "bin"),
    join(home, ".npm-packages", "bin")
  );
  if (includeSystemBins) {
    dirs.push("/opt/homebrew/bin", "/usr/local/bin");
  }
  dirs.push(...existingMiseNpmPackageBinDirs(join(home, ".local", "share", "mise", "installs")));
  for (const installRoot of [
    {
      root: join(home, ".local", "share", "mise", "installs", "node"),
      segments: ["bin"]
    },
    {
      root: join(home, ".nvm", "versions", "node"),
      segments: ["bin"]
    },
    {
      root: join(home, ".local", "share", "fnm", "node-versions"),
      segments: ["installation", "bin"]
    },
    {
      root: join(home, ".fnm", "node-versions"),
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
    const packageRoot = join(root, packageName);
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
    const candidate = join(root, entry.name, ...segments);
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

export {
  mergeProxyAwareEnv,
  resolveSystemProxyEnv,
  readProcessStamp,
  createCommandInvocation,
  wellKnownUserToolchainBins
};
