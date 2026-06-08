#!/usr/bin/env node
import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);
import {
  runConnectorsToolCli
} from "./chunk-FPG5NG2K.mjs";
import {
  resolveProjectArg,
  withActiveEcho
} from "./chunk-YALIBYIQ.mjs";
import {
  postCreateArtifactRequest
} from "./chunk-QIXWVCMU.mjs";
import {
  runDaemonCliStartup
} from "./chunk-4XMLGMSK.mjs";
import {
  SIDECAR_ENV,
  SIDECAR_MESSAGES,
  requestJsonIpc
} from "./chunk-YQ23VIX5.mjs";
import {
  __require
} from "./chunk-WRAIAC3Y.mjs";

// ../daemon/dist/mcp-live-artifacts-server.js
import readline from "node:readline";
var EMPTY_OBJECT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {}
};
var CONNECTORS_LIST_INPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    useCase: { type: "string", enum: ["personal_daily_digest"] }
  }
};
var ARTIFACT_INPUT_SCHEMA = {
  type: "object",
  additionalProperties: true,
  description: "LiveArtifactCreateInput/LiveArtifactUpdateInput JSON plus optional templateHtml and provenanceJson fields."
};
function createLiveArtifactsMcpTools() {
  return [
    {
      name: "live_artifacts_create",
      description: 'Create a project-scoped live artifact through the daemon tool endpoint. POSIX equivalent: `"$OD_NODE_BIN" "$OD_BIN" tools live-artifacts create --input artifact.json`.',
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["input"],
        properties: {
          input: ARTIFACT_INPUT_SCHEMA,
          templateHtml: { type: "string" },
          provenanceJson: { type: "object", additionalProperties: true }
        }
      }
    },
    {
      name: "live_artifacts_list",
      description: 'List compact project-scoped live artifacts through the daemon tool endpoint. POSIX equivalent: `"$OD_NODE_BIN" "$OD_BIN" tools live-artifacts list --format compact`.',
      inputSchema: EMPTY_OBJECT_SCHEMA
    },
    {
      name: "live_artifacts_update",
      description: 'Update a live artifact through the daemon tool endpoint. POSIX equivalent: `"$OD_NODE_BIN" "$OD_BIN" tools live-artifacts update --artifact-id <id> --input artifact.json`.',
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["artifactId", "input"],
        properties: {
          artifactId: { type: "string", minLength: 1 },
          input: ARTIFACT_INPUT_SCHEMA,
          templateHtml: { type: "string" },
          provenanceJson: { type: "object", additionalProperties: true }
        }
      }
    },
    {
      name: "live_artifacts_refresh",
      description: 'Refresh a live artifact through the daemon tool endpoint. POSIX equivalent: `"$OD_NODE_BIN" "$OD_BIN" tools live-artifacts refresh --artifact-id <id>`.',
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["artifactId"],
        properties: {
          artifactId: { type: "string", minLength: 1 }
        }
      }
    },
    {
      name: "connectors_list",
      description: 'List connector catalog and available read-only tools through the daemon tool endpoint. Use `{ "useCase": "personal_daily_digest" }` for curated daily-digest tools. POSIX equivalent: `"$OD_NODE_BIN" "$OD_BIN" tools connectors list --use-case personal_daily_digest --format compact` or fallback `"$OD_NODE_BIN" "$OD_BIN" tools connectors list --format compact`.',
      inputSchema: CONNECTORS_LIST_INPUT_SCHEMA
    },
    {
      name: "connectors_execute",
      description: 'Execute an allowed connector read tool through the daemon tool endpoint. POSIX equivalent: `"$OD_NODE_BIN" "$OD_BIN" tools connectors execute --connector <id> --tool <name> --input input.json`.',
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["connectorId", "toolName", "input"],
        properties: {
          connectorId: { type: "string", minLength: 1 },
          toolName: { type: "string", minLength: 1 },
          input: { type: "object", additionalProperties: true }
        }
      }
    }
  ];
}
function daemonUrl() {
  const rawUrl = process.env.OD_DAEMON_URL;
  if (!rawUrl)
    throw new Error("OD_DAEMON_URL is required");
  const url = new URL(rawUrl);
  url.pathname = url.pathname.replace(/\/+$/u, "");
  url.search = "";
  url.hash = "";
  return url;
}
function toolToken() {
  const token = process.env.OD_TOOL_TOKEN;
  if (!token)
    throw new Error("OD_TOOL_TOKEN is required");
  return token;
}
function endpoint(baseUrl, pathname) {
  const url = new URL(baseUrl.toString());
  const [pathPart, searchPart] = pathname.split("?");
  url.pathname = `${url.pathname}${pathPart ?? ""}`.replace(/\/+/gu, "/");
  url.search = searchPart === void 0 ? "" : `?${searchPart}`;
  return url.toString();
}
async function requestJson(pathname, init = {}) {
  const response = await fetch(endpoint(daemonUrl(), pathname), {
    ...init,
    headers: {
      Authorization: `Bearer ${toolToken()}`,
      Accept: "application/json",
      ...init.body === void 0 ? {} : { "Content-Type": "application/json" },
      ...init.headers
    }
  });
  const text = await response.text();
  let body = text;
  if (text.length > 0) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text };
    }
  }
  if (!response.ok) {
    const error = new Error(`daemon tool endpoint failed with ${response.status}`);
    error.details = body;
    throw error;
  }
  return body;
}
async function callTool(name, args) {
  if (name === "live_artifacts_create") {
    return await requestJson("/api/tools/live-artifacts/create", {
      method: "POST",
      body: JSON.stringify({
        input: args.input ?? {},
        ...typeof args.templateHtml === "string" ? { templateHtml: args.templateHtml } : {},
        ...args.provenanceJson && typeof args.provenanceJson === "object" && !Array.isArray(args.provenanceJson) ? { provenanceJson: args.provenanceJson } : {}
      })
    });
  }
  if (name === "live_artifacts_list") {
    return await requestJson("/api/tools/live-artifacts/list", { method: "GET" });
  }
  if (name === "live_artifacts_update") {
    return await requestJson("/api/tools/live-artifacts/update", {
      method: "POST",
      body: JSON.stringify({
        artifactId: args.artifactId,
        input: typeof args.input === "object" && args.input ? args.input : {},
        ...typeof args.templateHtml === "string" ? { templateHtml: args.templateHtml } : {},
        ...args.provenanceJson && typeof args.provenanceJson === "object" && !Array.isArray(args.provenanceJson) ? { provenanceJson: args.provenanceJson } : {}
      })
    });
  }
  if (name === "live_artifacts_refresh") {
    return await requestJson("/api/tools/live-artifacts/refresh", { method: "POST", body: JSON.stringify({ artifactId: args.artifactId }) });
  }
  if (name === "connectors_list") {
    const useCase = args.useCase === "personal_daily_digest" ? "?useCase=personal_daily_digest" : "";
    return await requestJson(`/api/tools/connectors/list${useCase}`, { method: "GET" });
  }
  if (name === "connectors_execute") {
    return await requestJson("/api/tools/connectors/execute", {
      method: "POST",
      body: JSON.stringify({ connectorId: args.connectorId, toolName: args.toolName, input: args.input ?? {} })
    });
  }
  throw new Error(`unknown MCP tool: ${name}`);
}
async function handleLiveArtifactsMcpRequest(request) {
  const id = request.id ?? null;
  const method = request.method;
  if (method === "notifications/initialized")
    return void 0;
  try {
    if (method === "initialize") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2025-03-26",
          capabilities: { tools: {} },
          serverInfo: { name: "open-design-live-artifacts", version: "0.1.0" }
        }
      };
    }
    if (method === "tools/list") {
      return { jsonrpc: "2.0", id, result: { tools: createLiveArtifactsMcpTools() } };
    }
    if (method === "tools/call") {
      const params = request.params ?? {};
      const name = typeof params.name === "string" ? params.name : "";
      const args = params.arguments && typeof params.arguments === "object" && !Array.isArray(params.arguments) ? params.arguments : {};
      const result = await callTool(name, args);
      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: JSON.stringify(result) }]
        }
      };
    }
    return { jsonrpc: "2.0", id, error: { code: -32601, message: `method not found: ${String(method)}` } };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const details = error && typeof error === "object" && "details" in error ? error.details : void 0;
    return { jsonrpc: "2.0", id, error: { code: -32e3, message, ...details === void 0 ? {} : { data: details } } };
  }
}
async function runLiveArtifactsMcpServer() {
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim())
      continue;
    let request;
    try {
      request = JSON.parse(line);
    } catch {
      process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } })}
`);
      continue;
    }
    const response = await handleLiveArtifactsMcpRequest(request);
    if (response)
      process.stdout.write(`${JSON.stringify(response)}
`);
  }
  return { exitCode: 0 };
}

// ../daemon/dist/artifacts-cli.js
import { readFile } from "node:fs/promises";

// ../daemon/dist/daemon-url.js
var DEFAULT_DAEMON_URL = "http://127.0.0.1:7456";
async function resolveDaemonUrl(options = {}) {
  const env = options.env ?? process.env;
  const flagUrl = options.flagUrl ?? null;
  if (flagUrl != null && flagUrl.length > 0)
    return flagUrl;
  const envUrl = env.OD_DAEMON_URL;
  if (envUrl != null && envUrl.length > 0)
    return envUrl;
  const discovered = await discoverDaemonUrlFromIpc(env, options.timeoutMs ?? 800);
  if (discovered != null)
    return discovered;
  return DEFAULT_DAEMON_URL;
}
async function discoverDaemonUrlFromIpc(env, timeoutMs) {
  const socketPath = env[SIDECAR_ENV.IPC_PATH];
  if (socketPath == null || socketPath.length === 0)
    return null;
  try {
    const status = await requestJsonIpc(socketPath, { type: SIDECAR_MESSAGES.STATUS }, { timeoutMs });
    return status?.url ?? null;
  } catch {
    return null;
  }
}

// ../daemon/dist/artifacts-cli.js
var USAGE = `Usage:
  od artifacts create --name <path> --input <file> [--project <id-or-name>] [--manifest artifact.json] [--encoding utf8|base64] [--daemon-url <url>]

Creates one normal Open Design project artifact entry file through the local daemon.
When --project is omitted, the active Open Design project is used.
Existing target paths are rejected.
`;
function writeJson(value, stream = process.stdout) {
  stream.write(`${JSON.stringify(value)}
`);
}
function fail(message, details, status) {
  writeJson({
    ok: false,
    ...status === void 0 ? {} : { status },
    error: { message, ...details === void 0 ? {} : { details } }
  }, process.stderr);
  return { exitCode: 1 };
}
function parseOptions(args) {
  const [command, ...rest] = args;
  const options = {
    command: command === "-h" || command === "--help" ? void 0 : command,
    encoding: "utf8",
    help: command === "-h" || command === "--help"
  };
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === "--project") {
      const value = rest[++index];
      if (!value)
        return { error: "--project requires a value" };
      options.project = value;
    } else if (arg === "--name") {
      const value = rest[++index];
      if (!value)
        return { error: "--name requires a path" };
      options.name = value;
    } else if (arg === "--input") {
      const value = rest[++index];
      if (!value)
        return { error: "--input requires a file path" };
      options.inputPath = value;
    } else if (arg === "--manifest") {
      const value = rest[++index];
      if (!value)
        return { error: "--manifest requires a file path" };
      options.manifestPath = value;
    } else if (arg === "--daemon-url") {
      const value = rest[++index];
      if (!value)
        return { error: "--daemon-url requires a URL" };
      options.daemonUrl = value;
    } else if (arg === "--encoding") {
      const value = rest[++index];
      if (value !== "utf8" && value !== "base64")
        return { error: "--encoding must be utf8 or base64" };
      options.encoding = value;
    } else if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else {
      return { error: `unknown option: ${arg}` };
    }
  }
  return options;
}
async function readJsonObject(filePath) {
  const text = await readFile(filePath, "utf8");
  let value;
  try {
    value = JSON.parse(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`invalid JSON in ${filePath}: ${message}`);
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${filePath} must contain a JSON object`);
  }
  return value;
}
async function runArtifactsCli(args) {
  const options = parseOptions(args);
  if ("error" in options)
    return fail(options.error);
  if (options.help || !options.command) {
    process.stdout.write(USAGE);
    return { exitCode: options.command ? 0 : 1 };
  }
  if (options.command !== "create")
    return fail(`unknown artifacts command: ${options.command}`);
  if (!options.name)
    return fail("create requires --name <path>");
  if (!options.inputPath)
    return fail("create requires --input <file>");
  try {
    const daemonUrl4 = await resolveDaemonUrl(options.daemonUrl === void 0 ? {} : { flagUrl: options.daemonUrl });
    const { id, resolved, active } = await resolveProjectArg(daemonUrl4, options.project);
    const fileBuffer = await readFile(options.inputPath);
    const content = options.encoding === "base64" ? fileBuffer.toString("base64") : fileBuffer.toString("utf8");
    const artifactManifest = options.manifestPath === void 0 ? void 0 : await readJsonObject(options.manifestPath);
    const response = await postCreateArtifactRequest({
      baseUrl: daemonUrl4,
      projectId: id,
      input: {
        name: options.name,
        content,
        encoding: options.encoding,
        ...artifactManifest === void 0 ? {} : { artifactManifest }
      }
    });
    const payload = response && typeof response === "object" && !Array.isArray(response) ? response : { result: response };
    writeJson({ ok: true, ...withActiveEcho(payload, active, resolved) });
    return { exitCode: 0 };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const details = error && typeof error === "object" && "details" in error ? error.details : void 0;
    const status = error && typeof error === "object" && "status" in error ? error.status : void 0;
    return fail(message, details, status);
  }
}

// ../daemon/dist/handoff-cli.js
function isHandoffResponse(value) {
  if (!value || typeof value !== "object")
    return false;
  const v = value;
  return typeof v.prompt === "string" && typeof v.model === "string" && typeof v.inputTokens === "number" && typeof v.outputTokens === "number" && typeof v.transcriptMessageCount === "number";
}
var USAGE2 = `Usage:
  od project handoff <projectId> --conversation <id> --api-key <key> --model <model>
                     [--base-url <url>] [--max-tokens <n>] [--daemon-url <url>] [--json]

Synthesizes a "resume conversation" handoff prompt from one conversation's
transcript via the local daemon. Prints the prompt to stdout; --json emits
the full response (prompt + model + token usage).
`;
function writeJson2(value, stream = process.stdout) {
  stream.write(`${JSON.stringify(value)}
`);
}
function fail2(message, code, status) {
  writeJson2({
    ok: false,
    ...status === void 0 ? {} : { status },
    error: { message, ...code === void 0 ? {} : { code } }
  }, process.stderr);
  return { exitCode: 1 };
}
function parseOptions2(args) {
  const options = { json: false, help: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === void 0)
      continue;
    if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--conversation") {
      const value = args[++index];
      if (!value)
        return { error: "--conversation requires a value" };
      options.conversationId = value;
    } else if (arg === "--api-key") {
      const value = args[++index];
      if (!value)
        return { error: "--api-key requires a value" };
      options.apiKey = value;
    } else if (arg === "--model") {
      const value = args[++index];
      if (!value)
        return { error: "--model requires a value" };
      options.model = value;
    } else if (arg === "--base-url") {
      const value = args[++index];
      if (!value)
        return { error: "--base-url requires a value" };
      options.baseUrl = value;
    } else if (arg === "--max-tokens") {
      const value = args[++index];
      if (!value)
        return { error: "--max-tokens requires a value" };
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return { error: "--max-tokens must be a positive number" };
      }
      options.maxTokens = parsed;
    } else if (arg === "--daemon-url") {
      const value = args[++index];
      if (!value)
        return { error: "--daemon-url requires a URL" };
      options.daemonUrl = value;
    } else if (arg.startsWith("-")) {
      return { error: `unknown option: ${arg}` };
    } else if (options.projectId === void 0) {
      options.projectId = arg;
    } else {
      return { error: `unexpected argument: ${arg}` };
    }
  }
  return options;
}
async function runProjectHandoff(args) {
  const options = parseOptions2(args);
  if ("error" in options)
    return fail2(options.error);
  if (options.help) {
    process.stdout.write(USAGE2);
    return { exitCode: 0 };
  }
  if (!options.projectId)
    return fail2("handoff requires <projectId>");
  if (!options.conversationId)
    return fail2("handoff requires --conversation <id>");
  if (!options.apiKey)
    return fail2("handoff requires --api-key <key>");
  if (!options.model)
    return fail2("handoff requires --model <model>");
  try {
    const daemonUrl4 = (await resolveDaemonUrl(options.daemonUrl === void 0 ? {} : { flagUrl: options.daemonUrl })).replace(/\/$/, "");
    const body = {
      conversationId: options.conversationId,
      apiKey: options.apiKey,
      model: options.model,
      ...options.baseUrl === void 0 ? {} : { baseUrl: options.baseUrl },
      ...options.maxTokens === void 0 ? {} : { maxTokens: options.maxTokens }
    };
    const resp = await fetch(`${daemonUrl4}/api/projects/${encodeURIComponent(options.projectId)}/handoff`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    const payload = await resp.json().catch(() => void 0);
    if (!resp.ok) {
      const err = payload?.error;
      return fail2(err?.message ?? `handoff failed: HTTP ${resp.status}`, err?.code, resp.status);
    }
    if (!isHandoffResponse(payload)) {
      return fail2("daemon returned a malformed handoff response", void 0, resp.status);
    }
    if (options.json) {
      writeJson2(payload);
    } else {
      process.stdout.write(`${payload.prompt}
`);
    }
    return { exitCode: 0 };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return fail2(message);
  }
}

// ../daemon/dist/tools-design-systems-cli.js
var DESIGN_SYSTEMS_USAGE = `Usage:
  od tools design-systems read --path <manifest-declared-path> [--design-system <id>]

Environment:
  OD_NODE_BIN     Node-compatible runtime for agent wrapper invocations
  OD_BIN          Open Design CLI script for agent wrapper invocations
  OD_DAEMON_URL   Daemon base URL injected into agent runs
  OD_TOOL_TOKEN   Bearer token injected into agent runs

Agent runtime invocation:
  "$OD_NODE_BIN" "$OD_BIN" tools design-systems read --path preview/colors.html
`;
function writeJson3(value, stream = process.stdout) {
  stream.write(`${JSON.stringify(value)}
`);
}
function fail3(message, details) {
  writeJson3({ ok: false, error: { message, ...details === void 0 ? {} : { details } } }, process.stderr);
  return { exitCode: 1 };
}
function parseOptions3(args) {
  const [command, ...rest] = args;
  const options = {
    command: command === "-h" || command === "--help" ? void 0 : command,
    help: command === "-h" || command === "--help"
  };
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === "--path") {
      const value = rest[++index];
      if (!value)
        return { error: "--path requires a relative file path" };
      options.path = value;
    } else if (arg === "--design-system") {
      const value = rest[++index];
      if (!value)
        return { error: "--design-system requires an id" };
      options.designSystemId = value;
    } else if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else {
      return { error: `unknown option: ${arg}` };
    }
  }
  return options;
}
function daemonUrl2() {
  const rawUrl = process.env.OD_DAEMON_URL;
  if (!rawUrl)
    return { error: "OD_DAEMON_URL is required" };
  try {
    const url = new URL(rawUrl);
    url.pathname = url.pathname.replace(/\/+$/u, "");
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return { error: "OD_DAEMON_URL must be a valid URL" };
  }
}
function toolToken2() {
  const token = process.env.OD_TOOL_TOKEN;
  if (!token)
    return { error: "OD_TOOL_TOKEN is required" };
  return token;
}
function endpoint2(baseUrl, pathname) {
  const url = new URL(baseUrl.toString());
  url.pathname = `${url.pathname}${pathname}`.replace(/\/+/gu, "/");
  return url.toString();
}
async function requestJson2(baseUrl, token, pathname, init = {}) {
  const response = await fetch(endpoint2(baseUrl, pathname), {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...init.body === void 0 ? {} : { "Content-Type": "application/json" },
      ...init.headers
    }
  });
  const text = await response.text();
  let body = text;
  if (text.length > 0) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text };
    }
  }
  return { status: response.status, body };
}
function normalizeCliError(body) {
  const rawError = body && typeof body === "object" && "error" in body ? body.error : body;
  if (typeof rawError === "string")
    return { message: rawError };
  if (!rawError || typeof rawError !== "object")
    return { message: String(rawError ?? "request failed") };
  const error = rawError;
  return {
    ...typeof error.code === "string" ? { code: error.code } : {},
    message: typeof error.message === "string" ? error.message : String(error.error ?? "request failed"),
    ...error.details === void 0 ? {} : { details: error.details }
  };
}
async function printApiResult(response) {
  if (response.status < 200 || response.status >= 300) {
    writeJson3({ ok: false, status: response.status, error: normalizeCliError(response.body) }, process.stderr);
    return { exitCode: 1 };
  }
  const body = response.body && typeof response.body === "object" && !Array.isArray(response.body) ? response.body : { result: response.body };
  writeJson3({ ok: true, ...body });
  return { exitCode: 0 };
}
async function runDesignSystemsToolCli(args) {
  const options = parseOptions3(args);
  if ("error" in options)
    return fail3(options.error);
  if (options.help || !options.command) {
    process.stdout.write(DESIGN_SYSTEMS_USAGE);
    return { exitCode: options.command ? 0 : 1 };
  }
  const baseUrl = daemonUrl2();
  if ("error" in baseUrl)
    return fail3(baseUrl.error);
  const token = toolToken2();
  if (typeof token !== "string")
    return fail3(token.error);
  if (options.command !== "read")
    return fail3(`unknown design-systems command: ${options.command}`);
  if (!options.path)
    return fail3("read requires --path <manifest-declared-path>");
  return printApiResult(await requestJson2(baseUrl, token, "/api/tools/design-systems/read", {
    method: "POST",
    body: JSON.stringify({
      path: options.path,
      ...options.designSystemId ? { designSystemId: options.designSystemId } : {}
    })
  }));
}

// ../daemon/dist/design-systems-cli-help.js
var DESIGN_SYSTEMS_USAGE2 = `Usage:
  od design-systems list                       List design systems.
  od design-systems show <id>                  Print one entry.
  od design-systems rename <id> --title <new>  Rename an editable design system.`;
function isDesignSystemsHelpArg(arg) {
  return arg === "help" || arg === "--help" || arg === "-h";
}

// ../daemon/dist/design-system-rename-args.js
var STRING_FLAGS_WITH_VALUE = /* @__PURE__ */ new Set(["daemon-url", "query", "tag", "title"]);
function isFlagValue(token) {
  return token !== void 0 && !token.startsWith("-");
}
function parseDesignSystemRenameArgs(args) {
  let flagTitle;
  const positionals = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      const key = eq >= 0 ? arg.slice(2, eq) : arg.slice(2);
      const inlineValue = eq >= 0 ? arg.slice(eq + 1) : void 0;
      if (key === "title") {
        if (inlineValue !== void 0) {
          flagTitle = inlineValue;
        } else if (isFlagValue(args[i + 1])) {
          flagTitle = args[++i];
        }
      } else if (inlineValue === void 0 && STRING_FLAGS_WITH_VALUE.has(key) && isFlagValue(args[i + 1])) {
        i++;
      }
      continue;
    }
    if (arg.startsWith("-"))
      continue;
    positionals.push(arg);
  }
  const id = positionals[0];
  const title = (flagTitle ?? positionals.slice(1).join(" ") ?? "").trim();
  if (!id || !title)
    return null;
  return { id, title };
}

// ../daemon/dist/tools-live-artifacts-cli.js
import { access, readFile as readFile2 } from "node:fs/promises";
import path from "node:path";
var LIVE_ARTIFACTS_USAGE = `Usage:
  od tools live-artifacts create --input artifact.json
  od tools live-artifacts list [--format compact]
  od tools live-artifacts refresh --artifact-id <id>
  od tools live-artifacts update --artifact-id <id> --input artifact.json

Environment:
  OD_NODE_BIN     Node-compatible runtime for agent wrapper invocations
  OD_BIN          Open Design CLI script for agent wrapper invocations
  OD_DAEMON_URL   Daemon base URL injected into agent runs
  OD_TOOL_TOKEN   Bearer token injected into agent runs

Agent runtime invocation:
  "$OD_NODE_BIN" "$OD_BIN" tools live-artifacts list --format compact
`;
function writeJson4(value, stream = process.stdout) {
  stream.write(`${JSON.stringify(value)}
`);
}
function fail4(message, details) {
  writeJson4({ ok: false, error: { message, ...details === void 0 ? {} : { details } } }, process.stderr);
  return { exitCode: 1 };
}
function parseOptions4(args) {
  const [command, ...rest] = args;
  const options = {
    command: command === "-h" || command === "--help" ? void 0 : command,
    format: "compact",
    help: command === "-h" || command === "--help"
  };
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === "--input") {
      const value = rest[++index];
      if (!value)
        return { error: "--input requires a file path" };
      options.inputPath = value;
    } else if (arg === "--artifact-id") {
      const value = rest[++index];
      if (!value)
        return { error: "--artifact-id requires an artifact id" };
      options.artifactId = value;
    } else if (arg === "--format") {
      const value = rest[++index];
      if (value !== "compact" && value !== "json")
        return { error: "--format must be compact or json" };
      options.format = value;
    } else if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else {
      return { error: `unknown option: ${arg}` };
    }
  }
  return options;
}
function daemonUrl3() {
  const rawUrl = process.env.OD_DAEMON_URL;
  if (!rawUrl)
    return { error: "OD_DAEMON_URL is required" };
  try {
    const url = new URL(rawUrl);
    url.pathname = url.pathname.replace(/\/+$/u, "");
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return { error: "OD_DAEMON_URL must be a valid URL" };
  }
}
function toolToken3() {
  const token = process.env.OD_TOOL_TOKEN;
  if (!token)
    return { error: "OD_TOOL_TOKEN is required" };
  return token;
}
function endpoint3(baseUrl, pathname) {
  const url = new URL(baseUrl.toString());
  url.pathname = `${url.pathname}${pathname}`.replace(/\/+/gu, "/");
  return url.toString();
}
async function readJsonFile(filePath) {
  const text = await readFile2(filePath, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`invalid JSON in ${filePath}: ${message}`);
  }
}
async function readOptionalTextFile(filePath) {
  try {
    await access(filePath);
    return await readFile2(filePath, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT")
      return void 0;
    throw error;
  }
}
async function readOptionalJsonObject(filePath) {
  try {
    await access(filePath);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT")
      return void 0;
    throw error;
  }
  const value = await readJsonFile(filePath);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${filePath} must contain a JSON object`);
  }
  return value;
}
async function readArtifactInput(inputPath) {
  const resolvedInputPath = path.resolve(inputPath);
  const input = await readJsonFile(resolvedInputPath);
  const inputDir = path.dirname(resolvedInputPath);
  const dataJson = await readOptionalJsonObject(path.join(inputDir, "data.json"));
  const templateHtml = await readOptionalTextFile(path.join(inputDir, "template.html"));
  const provenanceJson = await readOptionalJsonObject(path.join(inputDir, "provenance.json"));
  let inputWithDataJson = input;
  if (dataJson !== void 0 && input && typeof input === "object" && !Array.isArray(input)) {
    const inputRecord = input;
    const document = inputRecord.document;
    if (document && typeof document === "object" && !Array.isArray(document)) {
      inputWithDataJson = { ...inputRecord, document: { ...document, dataJson } };
    }
  }
  return { input: inputWithDataJson, ...templateHtml === void 0 ? {} : { templateHtml }, ...provenanceJson === void 0 ? {} : { provenanceJson } };
}
async function requestJson3(baseUrl, token, pathname, init = {}) {
  const response = await fetch(endpoint3(baseUrl, pathname), {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...init.body === void 0 ? {} : { "Content-Type": "application/json" },
      ...init.headers
    }
  });
  const text = await response.text();
  let body = text;
  if (text.length > 0) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text };
    }
  }
  return { status: response.status, body };
}
function compactArtifact(value) {
  if (!value || typeof value !== "object")
    return value;
  const artifact = value;
  return {
    id: artifact.id,
    title: artifact.title,
    status: artifact.status,
    refreshStatus: artifact.refreshStatus,
    preview: artifact.preview,
    updatedAt: artifact.updatedAt
  };
}
function compactList(value) {
  if (!value || typeof value !== "object")
    return value;
  const response = value;
  const artifacts = Array.isArray(response.artifacts) ? response.artifacts : [];
  return {
    artifacts: artifacts.map(compactArtifact)
  };
}
function compactValidationDetails(details) {
  if (!details || typeof details !== "object")
    return details;
  const record = details;
  if (record.kind !== "validation" || !Array.isArray(record.issues))
    return details;
  return {
    kind: "validation",
    issues: record.issues.map((issue) => {
      if (!issue || typeof issue !== "object")
        return { message: String(issue) };
      const issueRecord = issue;
      return {
        ...typeof issueRecord.path === "string" ? { path: issueRecord.path } : {},
        message: typeof issueRecord.message === "string" ? issueRecord.message : String(issueRecord.message ?? "validation failed"),
        ...typeof issueRecord.code === "string" ? { code: issueRecord.code } : {}
      };
    })
  };
}
function normalizeCliError2(body) {
  const rawError = body && typeof body === "object" && "error" in body ? body.error : body;
  if (typeof rawError === "string")
    return { message: rawError };
  if (!rawError || typeof rawError !== "object")
    return { message: String(rawError ?? "request failed") };
  const error = rawError;
  const normalized = {
    ...typeof error.code === "string" ? { code: error.code } : {},
    message: typeof error.message === "string" ? error.message : String(error.error ?? "request failed"),
    ...error.details === void 0 ? {} : { details: compactValidationDetails(error.details) },
    ...typeof error.retryable === "boolean" ? { retryable: error.retryable } : {},
    ...typeof error.requestId === "string" ? { requestId: error.requestId } : {}
  };
  return normalized;
}
async function printApiResult2(response, compact) {
  if (response.status < 200 || response.status >= 300) {
    writeJson4({ ok: false, status: response.status, error: normalizeCliError2(response.body) }, process.stderr);
    return { exitCode: 1 };
  }
  const body = compact(response.body);
  writeJson4(body && typeof body === "object" && !Array.isArray(body) ? { ok: true, ...body } : { ok: true, result: body });
  return { exitCode: 0 };
}
async function runLiveArtifactsToolCli(args) {
  const options = parseOptions4(args);
  if ("error" in options)
    return fail4(options.error);
  if (options.help || !options.command) {
    process.stdout.write(LIVE_ARTIFACTS_USAGE);
    return { exitCode: options.command ? 0 : 1 };
  }
  const baseUrl = daemonUrl3();
  if ("error" in baseUrl)
    return fail4(baseUrl.error);
  const token = toolToken3();
  if (typeof token !== "string")
    return fail4(token.error);
  try {
    if (options.command === "create") {
      if (!options.inputPath)
        return fail4("create requires --input artifact.json");
      const input = await readArtifactInput(options.inputPath);
      return await printApiResult2(await requestJson3(baseUrl, token, "/api/tools/live-artifacts/create", { method: "POST", body: JSON.stringify(input) }), (body) => ({ artifact: compactArtifact(body.artifact) }));
    }
    if (options.command === "list") {
      return await printApiResult2(await requestJson3(baseUrl, token, "/api/tools/live-artifacts/list", { method: "GET" }), options.format === "compact" ? compactList : (body) => body);
    }
    if (options.command === "update") {
      if (!options.artifactId)
        return fail4("update requires --artifact-id <id>");
      if (!options.inputPath)
        return fail4("update requires --input artifact.json");
      const input = await readArtifactInput(options.inputPath);
      return await printApiResult2(await requestJson3(baseUrl, token, "/api/tools/live-artifacts/update", {
        method: "POST",
        body: JSON.stringify({ artifactId: options.artifactId, ...input })
      }), (body) => ({ artifact: compactArtifact(body.artifact) }));
    }
    if (options.command === "refresh") {
      if (!options.artifactId)
        return fail4("refresh requires --artifact-id <id>");
      return await printApiResult2(await requestJson3(baseUrl, token, "/api/tools/live-artifacts/refresh", {
        method: "POST",
        body: JSON.stringify({ artifactId: options.artifactId })
      }), (body) => ({
        artifact: compactArtifact(body.artifact),
        refresh: body.refresh
      }));
    }
    return fail4(`unknown live-artifacts command: ${options.command}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return fail4(message);
  }
}

// ../daemon/dist/research/cli-args.js
function splitResearchSubcommand(args) {
  const sub = args.find((a) => a && !a.startsWith("--"));
  if (!sub)
    return { sub: void 0, subArgs: args };
  const idx = args.indexOf(sub);
  return {
    sub,
    subArgs: [...args.slice(0, idx), ...args.slice(idx + 1)]
  };
}

// ../daemon/dist/mcp-agent-install.js
import path2 from "node:path";
var AGENT_SLUGS = [
  "claude",
  "codex",
  "cursor",
  "copilot",
  "openclaw",
  "antigravity",
  "gemini",
  "pi",
  "vibe",
  "hermes",
  "cline",
  "kimi",
  "trae",
  "opencode"
];
function isAgentSlug(value) {
  return AGENT_SLUGS.includes(value);
}
function envFlags(env, flag) {
  const out = [];
  for (const [k, v] of Object.entries(env)) {
    out.push(flag, `${k}=${v}`);
  }
  return out;
}
function jsonEntry(spec, extra = {}, envKey = "env") {
  const entry = {
    command: spec.command,
    args: spec.args,
    ...extra
  };
  if (Object.keys(spec.env).length > 0) {
    entry[envKey] = spec.env;
  }
  return entry;
}
function planAgentInstall(slug, spec, ctx) {
  const { home, platform, serverName } = ctx;
  switch (slug) {
    // ----- CLI-driven agents (idempotent via the agent's own tool) -----
    case "claude":
      return {
        kind: "cli",
        slug,
        bin: "claude",
        addArgv: [
          "mcp",
          "add",
          "--scope",
          "user",
          serverName,
          ...envFlags(spec.env, "-e"),
          "--",
          spec.command,
          ...spec.args
        ],
        removeArgv: ["mcp", "remove", "--scope", "user", serverName],
        getArgv: ["mcp", "get", serverName]
      };
    case "codex":
      return {
        kind: "cli",
        slug,
        bin: "codex",
        addArgv: [
          "mcp",
          "add",
          serverName,
          ...envFlags(spec.env, "--env"),
          "--",
          spec.command,
          ...spec.args
        ],
        removeArgv: ["mcp", "remove", serverName],
        getArgv: ["mcp", "get", serverName]
      };
    case "gemini":
      return {
        kind: "cli",
        slug,
        bin: "gemini",
        addArgv: [
          "mcp",
          "add",
          "-s",
          "user",
          "-t",
          "stdio",
          ...envFlags(spec.env, "-e"),
          serverName,
          spec.command,
          ...spec.args
        ],
        removeArgv: ["mcp", "remove", serverName],
        getArgv: ["mcp", "list"]
      };
    case "kimi":
      return {
        kind: "cli",
        slug,
        bin: "kimi",
        addArgv: [
          "mcp",
          "add",
          "--transport",
          "stdio",
          ...envFlags(spec.env, "--env"),
          serverName,
          "--",
          spec.command,
          ...spec.args
        ],
        removeArgv: ["mcp", "remove", serverName],
        getArgv: ["mcp", "get", serverName]
      };
    // ----- JSON config-file agents (safe deep-merge) -----
    case "cursor":
      return {
        kind: "json",
        slug,
        configPath: path2.join(home, ".cursor", "mcp.json"),
        keyPath: ["mcpServers"],
        serverKey: serverName,
        entry: jsonEntry(spec, { type: "stdio" })
      };
    case "copilot":
      return {
        kind: "json",
        slug,
        configPath: path2.join(home, ".copilot", "mcp-config.json"),
        keyPath: ["mcpServers"],
        serverKey: serverName,
        entry: jsonEntry(spec, { type: "local", tools: ["*"] })
      };
    case "cline":
      return {
        kind: "json",
        slug,
        configPath: clineConfigPath(home, platform),
        keyPath: ["mcpServers"],
        serverKey: serverName,
        entry: jsonEntry(spec, { disabled: false, autoApprove: [] })
      };
    case "opencode":
      return {
        kind: "json",
        slug,
        configPath: path2.join(home, ".config", "opencode", "opencode.json"),
        keyPath: ["mcp"],
        serverKey: serverName,
        entry: (() => {
          const e = {
            type: "local",
            command: [spec.command, ...spec.args],
            enabled: true
          };
          if (Object.keys(spec.env).length > 0)
            e.environment = spec.env;
          return e;
        })()
      };
    case "openclaw":
      return {
        kind: "json",
        slug,
        configPath: path2.join(home, ".openclaw", "openclaw.json"),
        keyPath: ["mcp", "servers"],
        serverKey: serverName,
        entry: jsonEntry(spec)
      };
    case "antigravity":
      return {
        kind: "json",
        slug,
        configPath: path2.join(home, ".gemini", "antigravity", "mcp_config.json"),
        keyPath: ["mcpServers"],
        serverKey: serverName,
        entry: jsonEntry(spec)
      };
    case "trae":
      return {
        kind: "json",
        slug,
        configPath: traeConfigPath(home, platform),
        keyPath: ["mcpServers"],
        serverKey: serverName,
        entry: jsonEntry(spec)
      };
    // ----- Unverified formats: print-only, never write -----
    case "vibe":
      return {
        kind: "manual",
        slug,
        format: "toml",
        configPath: path2.join(home, ".vibe", "config.toml"),
        snippet: vibeTomlSnippet(spec, serverName),
        reason: "Mistral Vibe uses a TOML array-of-tables ([[mcp_servers]]); its exact schema is unverified, so append this block by hand to avoid corrupting an existing config."
      };
    case "pi":
      return {
        kind: "manual",
        slug,
        format: "json",
        configPath: path2.join(home, ".pi", "agent", "mcp.json"),
        snippet: genericMcpServersSnippet(spec, serverName),
        reason: "The pi coding agent exposes MCP, but its config path/schema is not authoritatively documented. Paste this into pi\u2019s MCP config (check `pi --help` for the exact location)."
      };
    case "hermes":
      return {
        kind: "manual",
        slug,
        format: "yaml",
        configPath: path2.join(home, ".hermes", "config.yaml"),
        snippet: hermesYamlSnippet(spec, serverName),
        reason: "Hermes config format is unverified. Add this under your Hermes MCP server configuration by hand."
      };
    default: {
      const exhaustive = slug;
      throw new Error(`unknown agent slug: ${String(exhaustive)}`);
    }
  }
}
function clineConfigPath(home, platform) {
  const rel = path2.join("globalStorage", "saoudrizwan.claude-dev", "settings", "cline_mcp_settings.json");
  if (platform === "darwin") {
    return path2.join(home, "Library", "Application Support", "Code", "User", rel);
  }
  if (platform === "win32") {
    const appData = process.env.APPDATA ?? path2.join(home, "AppData", "Roaming");
    return path2.join(appData, "Code", "User", rel);
  }
  return path2.join(home, ".config", "Code", "User", rel);
}
function traeConfigPath(home, platform) {
  if (platform === "darwin") {
    return path2.join(home, "Library", "Application Support", "Trae", "User", "mcp.json");
  }
  if (platform === "win32") {
    const appData = process.env.APPDATA ?? path2.join(home, "AppData", "Roaming");
    return path2.join(appData, "Trae", "User", "mcp.json");
  }
  return path2.join(home, ".config", "Trae", "User", "mcp.json");
}
function applyJsonInstall(existingText, plan) {
  const root = parseJsonObject(existingText, plan.configPath);
  let cursor = root;
  for (const key of plan.keyPath) {
    const next = cursor[key];
    if (next == null || typeof next !== "object" || Array.isArray(next)) {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }
  cursor[plan.serverKey] = plan.entry;
  return `${JSON.stringify(root, null, 2)}
`;
}
function removeJsonInstall(existingText, plan) {
  if (existingText == null || existingText.trim() === "")
    return null;
  const root = parseJsonObject(existingText, plan.configPath);
  let cursor = root;
  for (const key of plan.keyPath) {
    const next = cursor[key];
    if (next == null || typeof next !== "object" || Array.isArray(next)) {
      return null;
    }
    cursor = next;
  }
  if (!(plan.serverKey in cursor))
    return null;
  delete cursor[plan.serverKey];
  return `${JSON.stringify(root, null, 2)}
`;
}
function parseJsonObject(text, where) {
  if (text == null || text.trim() === "")
    return {};
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(`existing config at ${where} is not valid JSON: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`existing config at ${where} is not a JSON object`);
  }
  return parsed;
}
function genericMcpServersSnippet(spec, name) {
  const server = {
    command: spec.command,
    args: spec.args
  };
  if (Object.keys(spec.env).length > 0)
    server.env = spec.env;
  return JSON.stringify({ mcpServers: { [name]: server } }, null, 2);
}
function hermesYamlSnippet(spec, name) {
  const lines = [
    "mcp_servers:",
    `  ${name}:`,
    `    command: ${JSON.stringify(spec.command)}`,
    `    args: ${JSON.stringify(spec.args)}`
  ];
  if (Object.keys(spec.env).length > 0) {
    lines.push("    env:");
    for (const [k, v] of Object.entries(spec.env)) {
      lines.push(`      ${k}: ${JSON.stringify(v)}`);
    }
  }
  return lines.join("\n");
}
function vibeTomlSnippet(spec, name) {
  const argsToml = `[${spec.args.map((a) => JSON.stringify(a)).join(", ")}]`;
  const lines = [
    "[[mcp_servers]]",
    `name = ${JSON.stringify(name)}`,
    'transport = "stdio"',
    `command = ${JSON.stringify(spec.command)}`,
    `args = ${argsToml}`
  ];
  return lines.join("\n");
}

// ../daemon/dist/cli.js
var argv = process.argv.slice(2);
var MEDIA_GENERATE_STRING_FLAGS = /* @__PURE__ */ new Set([
  "project",
  "surface",
  "model",
  "prompt",
  "output",
  "aspect",
  "length",
  "duration",
  "prompt-influence",
  "voice",
  "audio-kind",
  "composition-dir",
  "image",
  "daemon-url",
  "language"
]);
var MEDIA_GENERATE_BOOLEAN_FLAGS = /* @__PURE__ */ new Set([
  "help",
  "h",
  "loop"
]);
var MCP_STRING_FLAGS = /* @__PURE__ */ new Set([
  "daemon-url"
]);
var MCP_BOOLEAN_FLAGS = /* @__PURE__ */ new Set([
  "help",
  "h"
]);
var MCP_INSTALL_STRING_FLAGS = /* @__PURE__ */ new Set([
  "daemon-url",
  "name"
]);
var MCP_INSTALL_BOOLEAN_FLAGS = /* @__PURE__ */ new Set([
  "help",
  "h",
  "json",
  "print",
  "dry-run",
  "uninstall",
  "remove"
]);
var RESEARCH_SEARCH_STRING_FLAGS = /* @__PURE__ */ new Set([
  "query",
  "max-sources",
  "daemon-url"
]);
var RESEARCH_SEARCH_BOOLEAN_FLAGS = /* @__PURE__ */ new Set([
  "help",
  "h"
]);
var PLUGIN_STRING_FLAGS = /* @__PURE__ */ new Set([
  "daemon-url",
  "source",
  "inputs",
  "project",
  "conversation",
  "message",
  "agent",
  "model",
  "snapshot-id",
  "capabilities",
  "grant-caps",
  "before",
  "trust",
  "tag",
  "policy",
  "version",
  "reason",
  "catalog",
  "host"
]);
var PLUGIN_BOOLEAN_FLAGS = /* @__PURE__ */ new Set([
  "help",
  "h",
  "json",
  "revoke",
  "follow",
  "strict"
]);
var UI_STRING_FLAGS = /* @__PURE__ */ new Set([
  "daemon-url",
  "run",
  "project",
  "value",
  "value-json",
  "plugin",
  "snapshot-id",
  "persist",
  "kind"
]);
var UI_BOOLEAN_FLAGS = /* @__PURE__ */ new Set([
  "help",
  "h",
  "json",
  "skip",
  // Plan §6 Phase 2A.5 — `od ui show --schema` returns just the
  // surface's JSON Schema (or `null` when the surface declares
  // none). Lets a code agent inspect the contract before piping a
  // value back through `od ui respond --value-json`.
  "schema"
]);
var DAEMON_STRING_FLAGS = /* @__PURE__ */ new Set([
  "daemon-url",
  "port",
  "host"
]);
var DAEMON_BOOLEAN_FLAGS = /* @__PURE__ */ new Set([
  "help",
  "h",
  "json",
  "headless",
  "serve-web",
  "no-open"
]);
var LIBRARY_STRING_FLAGS = /* @__PURE__ */ new Set(["daemon-url", "query", "tag"]);
var LIBRARY_BOOLEAN_FLAGS = /* @__PURE__ */ new Set(["help", "h", "json"]);
var PROJECT_STRING_FLAGS = /* @__PURE__ */ new Set([
  "daemon-url",
  "name",
  "skill",
  "design-system",
  "plugin",
  "metadata-json",
  "pending-prompt",
  "project",
  "conversation",
  "message",
  "path",
  "as",
  "agent",
  "model",
  "snapshot-id",
  "inputs",
  "grant-caps",
  "editor",
  "title",
  "against"
]);
var PROJECT_BOOLEAN_FLAGS = /* @__PURE__ */ new Set(["help", "h", "json", "follow"]);
var AUTOMATION_STRING_FLAGS = /* @__PURE__ */ new Set([
  "daemon-url",
  "name",
  "prompt",
  "prompt-file",
  "schedule",
  "target",
  "project",
  "skill",
  "agent",
  "limit",
  "plugin",
  "mcp",
  "connector",
  "status",
  "reason",
  "template",
  "source-kind",
  "source-ref",
  "title",
  "body",
  "body-file",
  "compression",
  "sensitivity",
  "account",
  "candidate-sinks",
  "memory-type"
]);
var AUTOMATION_BOOLEAN_FLAGS = /* @__PURE__ */ new Set([
  "help",
  "h",
  "json",
  "disabled",
  "enabled"
]);
var MEMORY_STRING_FLAGS = /* @__PURE__ */ new Set([
  "daemon-url",
  "name",
  "description",
  "type",
  "body",
  "body-file"
]);
var MEMORY_BOOLEAN_FLAGS = /* @__PURE__ */ new Set([
  "help",
  "h",
  "json"
]);
var AUTOMATION_WEEKDAY_TOKENS = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};
var RECOVERABLE_EXIT_CODES = {
  "daemon-not-running": 64,
  "plugin-not-found": 65,
  "snapshot-not-found": 65,
  "capabilities-required": 66,
  "missing-input": 67,
  "project-not-found": 68,
  "run-not-found": 69,
  "provider-not-configured": 70,
  "plugin-requires-daemon": 71,
  "snapshot-stale": 72,
  "genui-surface-awaiting": 73,
  "desktop-auth-pending": 74,
  "desktop-import-token-rejected": 75
};
var PLUGIN_LIST_FILTER_FLAGS = /* @__PURE__ */ new Set([
  ...PLUGIN_STRING_FLAGS,
  "task-kind",
  "mode",
  "tag",
  "trust"
]);
var PLUGIN_LIST_BOOLEAN_FLAGS = /* @__PURE__ */ new Set([
  ...PLUGIN_BOOLEAN_FLAGS,
  "bundled",
  "no-bundled"
]);
var SUBCOMMAND_MAP = {
  artifacts: runArtifacts,
  media: runMedia,
  mcp: runMcp,
  research: runResearch,
  plugin: runPlugin,
  ui: runUi,
  marketplace: runMarketplace,
  project: runProject,
  automation: runAutomation,
  automations: runAutomation,
  memory: runMemory,
  run: runRun,
  files: runFiles,
  conversation: runConversation,
  daemon: runDaemon,
  atoms: runAtoms,
  skills: runSkills,
  "design-systems": runDesignSystems,
  craft: runCraft,
  diagnostics: runDiagnostics,
  status: runStatus,
  version: runVersion,
  doctor: runDoctor,
  config: runConfig
};
if (argv[0] === "mcp" && argv[1] === "live-artifacts") {
  try {
    const { exitCode } = await runLiveArtifactsMcpServer();
    process.exit(exitCode);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${JSON.stringify({ ok: false, error: { message } })}
`);
    process.exit(1);
  }
}
var first = argv.find((a) => !a.startsWith("-"));
if (first && SUBCOMMAND_MAP[first]) {
  const idx = argv.indexOf(first);
  const rest = [...argv.slice(0, idx), ...argv.slice(idx + 1)];
  await SUBCOMMAND_MAP[first](rest);
  process.exit(0);
}
if (argv[0] === "tools" && argv[1] === "live-artifacts") {
  runLiveArtifactsToolCli(argv.slice(2)).then(({ exitCode }) => {
    process.exitCode = exitCode;
  }).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${JSON.stringify({ ok: false, error: { message } })}
`);
    process.exitCode = 1;
  });
} else if (argv[0] === "tools" && argv[1] === "connectors") {
  runConnectorsToolCli(argv.slice(2)).then(({ exitCode }) => {
    process.exitCode = exitCode;
  }).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${JSON.stringify({ ok: false, error: { message } })}
`);
    process.exitCode = 1;
  });
} else if (argv[0] === "tools" && argv[1] === "design-systems") {
  runDesignSystemsToolCli(argv.slice(2)).then(({ exitCode }) => {
    process.exitCode = exitCode;
  }).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${JSON.stringify({ ok: false, error: { message } })}
`);
    process.exitCode = 1;
  });
} else {
  await runDaemonCliStartup(argv, { printHelp: printRootHelp });
}
function printRootHelp() {
  console.log(`Usage:
  od [--port <n>] [--host <addr>] [--no-open]
      Start the local daemon and open the web UI.

  od tools live-artifacts <create|list|update|refresh> [options]
      Manage live artifacts through daemon wrapper commands.

  od artifacts create --name <path> --input <file> [--project <id-or-name>]
      Create a normal project artifact through the local daemon.

  od tools connectors <list|execute|github-design-context> [options]
      Discover and execute configured connectors.

  od tools design-systems read --path <manifest-declared-path>
      Read active design-system pull-layer files through daemon wrapper commands.

  od mcp live-artifacts
      Start the MCP server exposing live-artifact and connector tools.

  od research search --query <text> [--max-sources 5] [--daemon-url <url>]
      Run agent-callable Tavily research through the local daemon.

  od plugin <list|info|install|uninstall|apply|doctor|replay|trust> [args]
      Discover, install, and apply plugins through the local daemon.
  od plugin publish-repo <folder>
      Create/update the author's GitHub repo for a local plugin folder.
  od plugin open-design-pr <folder>
      Push a community-catalog branch and open the Open Design PR form.

  od automation <list|get|create|update|run|runs|pause|resume|delete> [args]
      Drive the Automations surface headlessly. Same store as the UI's
      Automations tab, so an external agent (hermes, openclaw, ...) can
      schedule, trigger, or harvest results from a routine without
      opening the web UI.

  od memory tree <list|view|edit|move> [args]
      Inspect and edit the memory tree that is injected into agent prompts.

  od ui <list|show|respond|revoke|prefill> [args]
      Read and answer GenUI surfaces (form / choice / confirmation / oauth-prompt) headlessly.

  od diagnostics export [<path>] [--json]
      Bundle daemon/web/desktop logs, machine info, and recent crash reports
      into a zip for support tickets. Same output as Settings \u2192 About \u2192
      Export diagnostics.

  "$OD_NODE_BIN" "$OD_BIN" tools ...
      Recommended agent-runtime form; avoids relying on user PATH for od or node.

  od media generate --surface <image|video|audio> --model <id> [opts]
      Generate a media artifact and write it into the active project.
      Designed to be invoked by a code agent - picks up OD_DAEMON_URL
      and OD_PROJECT_ID from the env that the daemon injected on spawn.

  od mcp [--daemon-url <url>]
      Run a stdio MCP server that proxies project tool calls to a
      running Open Design daemon. Wire it into a coding agent
      (Claude Code, Cursor, VS Code, Zed, Windsurf) in another repo
      to pull files from a local Open Design project and create
      project-scoped artifacts without exporting a zip.

Options:
  --port <n>       Port to listen on (default: 7456, env: OD_PORT).
  --host <addr>    Interface address to bind to (default: 127.0.0.1, env: OD_BIND_HOST).
                   Set to a specific IP (e.g. a Tailscale address) to restrict access
                   to that interface only.
  --no-open        Do not open the browser after start.

What the daemon does:
  * scans PATH for installed code-agent CLIs (claude, codex, devin, gemini, opencode, cursor-agent, ...)
  * serves the chat UI at http://<host>:<port>
  * proxies messages (text + images) to the selected agent via child-process spawn
  * exposes /api/projects/:id/media/generate \u2014 the unified image/video/audio
     dispatcher that the agent calls via \`od media generate\`.`);
}
async function runResearch(args) {
  const { sub, subArgs } = splitResearchSubcommand(args);
  if (!sub || sub === "help" || args.includes("--help") || args.includes("-h")) {
    printResearchHelp();
    process.exit(sub === "help" || args.includes("--help") || args.includes("-h") ? 0 : 2);
  }
  if (sub !== "search") {
    console.error(`unknown subcommand: od research ${sub}`);
    printResearchHelp();
    process.exit(2);
  }
  return runResearchSearch(subArgs);
}
async function runResearchSearch(rawArgs) {
  let flags;
  try {
    flags = parseFlags(rawArgs, {
      string: RESEARCH_SEARCH_STRING_FLAGS,
      boolean: RESEARCH_SEARCH_BOOLEAN_FLAGS
    });
  } catch (err) {
    console.error(err.message);
    printResearchHelp();
    process.exit(2);
  }
  const query = typeof flags.query === "string" ? flags.query.trim() : "";
  if (!query) {
    console.error("--query required");
    process.exit(2);
  }
  const daemonUrl4 = await cliDaemonUrl(flags);
  const maxSources = flags["max-sources"] == null ? void 0 : Number(flags["max-sources"]);
  const url = `${daemonUrl4.replace(/\/$/, "")}/api/research/search`;
  let resp;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query,
        ...Number.isFinite(maxSources) ? { maxSources } : {}
      })
    });
  } catch (err) {
    surfaceFetchError(err, daemonUrl4);
    process.exit(3);
  }
  if (!resp.ok) {
    const text = await resp.text();
    console.error(`daemon ${resp.status}: ${text}`);
    process.exit(4);
  }
  process.stdout.write(`${await resp.text()}
`);
}
async function runArtifacts(args) {
  const { exitCode } = await runArtifactsCli(args);
  process.exit(exitCode);
}
function printResearchHelp() {
  console.log(`Usage:
  od research search --query <text> [--max-sources 5] [--daemon-url <url>]

Runs Tavily-backed shallow research through the local Open Design daemon.
Output is JSON only on stdout:
  { "query": "...", "summary": "...", "sources": [...], "provider": "tavily", "depth": "shallow", "fetchedAt": 0 }

Flags:
  --query        Required search query.
  --max-sources  Optional source cap. Defaults to 5, clamped to Tavily's max.
  --daemon-url   Local daemon URL. Defaults to OD_DAEMON_URL, OD_SIDECAR_IPC_PATH discovery, or http://127.0.0.1:7456.`);
}
async function runMedia(args) {
  const sub = args.find((a) => !a.startsWith("-")) || "";
  if (sub === "help" || sub === "-h" || sub === "--help" || sub === "") {
    printMediaHelp();
    return;
  }
  if (sub !== "generate" && sub !== "wait") {
    console.error(`unknown subcommand: od media ${sub}`);
    printMediaHelp();
    process.exit(1);
  }
  const idx = args.indexOf(sub);
  const subArgs = [...args.slice(0, idx), ...args.slice(idx + 1)];
  if (sub === "wait")
    return runMediaWait(subArgs);
  return runMediaGenerate(subArgs);
}
async function runMediaGenerate(rawArgs) {
  let flags;
  try {
    flags = parseFlags(rawArgs, {
      string: MEDIA_GENERATE_STRING_FLAGS,
      boolean: MEDIA_GENERATE_BOOLEAN_FLAGS
    });
  } catch (err) {
    console.error(err.message);
    printMediaHelp();
    process.exit(2);
  }
  const daemonUrl4 = await cliDaemonUrl(flags);
  const projectId = flags.project || process.env.OD_PROJECT_ID;
  const token = process.env.OD_TOOL_TOKEN;
  if (!projectId && !token) {
    console.error("project id required. Pass --project <id> or set OD_PROJECT_ID. The daemon injects this when it spawns the code agent.");
    process.exit(2);
  }
  const surface = flags.surface;
  if (!surface || !["image", "video", "audio"].includes(surface)) {
    console.error("--surface must be one of: image | video | audio");
    process.exit(2);
  }
  if (!flags.model) {
    console.error("--model required (see http://<daemon>/api/media/models)");
    process.exit(2);
  }
  const body = {
    surface,
    model: flags.model,
    prompt: flags.prompt,
    output: flags.output,
    aspect: flags.aspect,
    voice: flags.voice,
    audioKind: flags["audio-kind"],
    compositionDir: flags["composition-dir"],
    image: flags.image,
    language: flags.language
  };
  if (flags.length != null)
    body.length = Number(flags.length);
  if (flags.duration != null)
    body.duration = Number(flags.duration);
  if (flags["prompt-influence"] != null)
    body.promptInfluence = Number(flags["prompt-influence"]);
  if (flags.loop === true)
    body.loop = true;
  const url = token ? `${daemonUrl4.replace(/\/$/, "")}/api/tools/media/generate` : `${daemonUrl4.replace(/\/$/, "")}/api/projects/${encodeURIComponent(projectId)}/media/generate`;
  let resp;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...token ? { authorization: `Bearer ${token}` } : {}
      },
      body: JSON.stringify(body)
    });
  } catch (err) {
    surfaceFetchError(err, daemonUrl4);
    process.exit(3);
  }
  if (!resp.ok) {
    const text = await resp.text();
    console.error(`daemon ${resp.status}: ${text}`);
    process.exit(4);
  }
  const accepted = await resp.json();
  const { taskId } = accepted;
  if (!taskId) {
    console.error("daemon did not return a taskId");
    process.exit(4);
  }
  console.error(`task ${taskId} queued (${accepted.status || "queued"})`);
  await pollUntilDoneOrBudget(daemonUrl4, taskId, 0, {
    stillRunningExitCode: 0
  });
}
async function runMediaWait(rawArgs) {
  const taskId = rawArgs.find((a) => a && !a.startsWith("--"));
  if (!taskId) {
    console.error("usage: od media wait <taskId> [--since <n>] [--daemon-url <url>]");
    process.exit(2);
  }
  const flagsOnly = rawArgs.filter((a) => a !== taskId);
  let flags;
  try {
    flags = parseFlags(flagsOnly, {
      string: /* @__PURE__ */ new Set(["since", "daemon-url"]),
      boolean: /* @__PURE__ */ new Set(["help", "h"])
    });
  } catch (err) {
    console.error(err.message);
    printMediaHelp();
    process.exit(2);
  }
  const daemonUrl4 = await cliDaemonUrl(flags);
  const since = Number.isFinite(Number(flags.since)) ? Number(flags.since) : 0;
  await pollUntilDoneOrBudget(daemonUrl4, taskId, since);
}
async function pollUntilDoneOrBudget(daemonUrl4, taskId, sinceStart, options = {}) {
  const totalBudgetMs = 25e3;
  const perCallTimeoutMs = 4e3;
  const stillRunningExitCode = typeof options.stillRunningExitCode === "number" ? options.stillRunningExitCode : 2;
  const startedAt = Date.now();
  const url = `${daemonUrl4.replace(/\/$/, "")}/api/media/tasks/${encodeURIComponent(taskId)}/wait`;
  let since = Number.isFinite(sinceStart) ? sinceStart : 0;
  let lastSnapshot = null;
  while (Date.now() - startedAt < totalBudgetMs) {
    const remaining = totalBudgetMs - (Date.now() - startedAt);
    const callTimeout = Math.max(500, Math.min(perCallTimeoutMs, remaining));
    let resp;
    try {
      resp = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ since, timeoutMs: callTimeout })
      });
    } catch (err) {
      surfaceFetchError(err, daemonUrl4);
      process.exit(3);
    }
    if (resp.status === 404) {
      console.error(`task ${taskId} not found (expired or never queued)`);
      process.exit(4);
    }
    if (!resp.ok) {
      const text = await resp.text();
      console.error(`daemon ${resp.status}: ${text}`);
      process.exit(4);
    }
    let snap;
    try {
      snap = await resp.json();
    } catch {
      console.error("daemon returned non-JSON for /wait");
      process.exit(4);
    }
    lastSnapshot = snap;
    if (Array.isArray(snap.progress)) {
      for (const line of snap.progress) {
        process.stderr.write(line + "\n");
        process.stdout.write(`# ${line}
`);
      }
    }
    if (typeof snap.nextSince === "number")
      since = snap.nextSince;
    if (snap.status === "done") {
      const file = snap.file || {};
      const warnings = Array.isArray(file.warnings) ? file.warnings : [];
      for (const w of warnings) {
        if (typeof w === "string" && w)
          console.error(`WARN: ${w}`);
      }
      if (file.providerError) {
        const provider = file.providerId || "provider";
        console.error(`WARN: ${provider} call failed \u2014 wrote stub fallback (${file.size} bytes) to ${file.name}`);
        console.error(`WARN: reason: ${file.providerError}`);
        console.error("WARN: surface this verbatim to the user. Do NOT claim the stub is the final result.");
      }
      process.stdout.write(JSON.stringify({ file }) + "\n");
      process.exit(file.providerError ? 5 : 0);
    }
    if (snap.status === "failed") {
      const msg = snap.error?.message || "task failed";
      console.error(`task failed: ${msg}`);
      process.stdout.write(JSON.stringify({ taskId, status: "failed", error: snap.error || {} }) + "\n");
      process.exit(snap.error?.status || 5);
    }
    if (snap.status === "interrupted") {
      const msg = snap.error?.message || "task interrupted";
      console.error(`task interrupted: ${msg}`);
      process.stdout.write(JSON.stringify({ taskId, status: "interrupted", error: snap.error || {} }) + "\n");
      process.exit(snap.error?.status || 5);
    }
  }
  const handoff = {
    taskId,
    status: lastSnapshot?.status || "running",
    nextSince: since,
    elapsed: Math.round((Date.now() - startedAt) / 1e3)
  };
  process.stdout.write(JSON.stringify(handoff) + "\n");
  const stillRunningHint = stillRunningExitCode === 0 ? "This is a successful queued/running handoff, not a failure." : `exit code ${stillRunningExitCode} = still running.`;
  process.stderr.write(`task ${taskId} still running after ${handoff.elapsed}s. Run \`"$OD_NODE_BIN" "$OD_BIN" media wait ${taskId} --since ${since}\` to continue in an agent runtime (${stillRunningHint}).
`);
  process.exit(stillRunningExitCode);
}
function surfaceFetchError(err, daemonUrl4) {
  const cause = err && typeof err === "object" ? err.cause : null;
  const code = cause && typeof cause === "object" && typeof cause.code === "string" ? cause.code : null;
  const causeMsg = cause && typeof cause === "object" && typeof cause.message === "string" ? cause.message : "";
  let detail = err && err.message ? err.message : String(err);
  if (code)
    detail = `${code}${causeMsg ? ` \u2014 ${causeMsg}` : ""}`;
  else if (causeMsg)
    detail = causeMsg;
  console.error(`failed to reach daemon at ${daemonUrl4}: ${detail}`);
  if (code === "EPERM" || code === "ENETUNREACH") {
    console.error("hint: outbound connect was denied by a sandbox. If you launched this command from a code agent, check the agent's sandbox / network policy. The Open Design daemon itself is unaffected - it can be reached from a regular shell.");
  }
}
function parseFlags(argv2, opts = {}) {
  const stringFlags = opts.string instanceof Set ? opts.string : /* @__PURE__ */ new Set();
  const booleanFlags = opts.boolean instanceof Set ? opts.boolean : /* @__PURE__ */ new Set();
  const knownFlags = /* @__PURE__ */ new Set([...stringFlags, ...booleanFlags]);
  const out = {};
  for (let i = 0; i < argv2.length; i++) {
    const a = argv2[i];
    if (!a || !a.startsWith("--")) {
      continue;
    }
    const eq = a.indexOf("=");
    const key = eq >= 0 ? a.slice(2, eq) : a.slice(2);
    if (knownFlags.size > 0 && !knownFlags.has(key)) {
      throw new Error(`unknown flag: --${key}. Run with --help for the list of accepted flags.`);
    }
    if (eq >= 0) {
      out[key] = a.slice(eq + 1);
      continue;
    }
    if (booleanFlags.has(key)) {
      out[key] = true;
      continue;
    }
    if (stringFlags.has(key)) {
      const next2 = argv2[i + 1];
      if (next2 == null) {
        throw new Error(`flag --${key} requires a value`);
      }
      out[key] = next2;
      i++;
      continue;
    }
    const next = argv2[i + 1];
    if (next != null && !next.startsWith("--")) {
      out[key] = next;
      i++;
    } else {
      out[key] = true;
    }
  }
  return out;
}
function positionalArgs(argv2, stringFlags = /* @__PURE__ */ new Set()) {
  const out = [];
  for (let i = 0; i < argv2.length; i++) {
    const a = argv2[i];
    if (!a)
      continue;
    if (!a.startsWith("--")) {
      out.push(a);
      continue;
    }
    const eq = a.indexOf("=");
    const key = eq >= 0 ? a.slice(2, eq) : a.slice(2);
    if (eq < 0 && stringFlags.has(key))
      i++;
  }
  return out;
}
async function cliDaemonUrl(flags) {
  return resolveDaemonUrl({ flagUrl: flags?.["daemon-url"] });
}
async function cliDaemonBaseUrl(flags) {
  return (await cliDaemonUrl(flags)).replace(/\/$/, "");
}
function printMediaHelp() {
  console.log(`Usage: od media generate --surface <image|video|audio> --model <id> [opts]
       "$OD_NODE_BIN" "$OD_BIN" media generate --surface <image|video|audio> --model <id> [opts]

Required:
  --surface  image | video | audio
  --model    Model id from /api/media/models (e.g. gpt-image-2, seedance-2, suno-v5).
  --project  Project id. Auto-resolved from OD_PROJECT_ID when invoked by the daemon.

Common options:
  --prompt "<text>"         Generation prompt. ElevenLabs SFX prompts must stay under 450 characters.
  --output <filename>       File to write under the project. Auto-named if omitted.
  --aspect 1:1|16:9|9:16|4:3|3:4
  --length <seconds>        Video length.
  --duration <seconds>      Audio duration.
  --prompt-influence <0-1>  ElevenLabs SFX prompt adherence. Higher values follow the prompt more closely.
  --loop                    ElevenLabs SFX only: request a seamless loop.
  --voice <voice-id>        Speech / TTS voice.
  --language <lang>         Language boost for TTS (e.g. Chinese,Yue for Cantonese).
  --audio-kind music|speech|sfx
  --composition-dir <path>  hyperframes-html only \u2014 project-relative path
                            to the dir containing hyperframes.json /
                            meta.json / index.html. The daemon runs
                            \`npx hyperframes render\` against it.
  --image <path>            Project-relative path to a reference image
                            (image-to-video for Seedance i2v models, or
                            future image-edit endpoints). Daemon reads
                            the file from the project, base64-encodes
                            it, and forwards it to the upstream API.
  --daemon-url <url>

Output: a single line of JSON: {"file": { name, size, kind, mime, ... }}

Skills should call this and then reference the returned filename in their
artifact / message body. The daemon writes the bytes into the project's
files folder so the FileViewer can preview them immediately.`);
}
async function runMcp(args) {
  if (args[0] === "install") {
    return runMcpInstall(args.slice(1));
  }
  let flags;
  try {
    flags = parseFlags(args, {
      string: MCP_STRING_FLAGS,
      boolean: MCP_BOOLEAN_FLAGS
    });
  } catch (err) {
    console.error(err.message);
    printMcpHelp();
    process.exit(2);
  }
  if (flags.help || flags.h) {
    printMcpHelp();
    return;
  }
  const daemonUrl4 = await cliDaemonUrl(flags);
  const { runMcpStdio } = await import("./mcp-FTSOMO56.mjs");
  await runMcpStdio({ daemonUrl: daemonUrl4 });
}
function printMcpHelp() {
  console.log(`Usage: od mcp [--daemon-url <url>]

Run a stdio MCP (Model Context Protocol) server that proxies project
tool calls to a running Open Design daemon. Wire it into a coding agent
in another repo so the agent can pull files from a local Open Design
project and create project-scoped artifacts without exporting a zip
every iteration.

Options:
  --daemon-url <url>   Open Design daemon HTTP base URL. Resolution
                       order: this flag, OD_DAEMON_URL, OD_SIDECAR_IPC_PATH,
                       then http://127.0.0.1:7456. Each new MCP spawn
                       discovers the live daemon URL at startup, so
                       MCP client configs stay valid across daemon
                       restarts even when the port is ephemeral. A
                       running MCP server caches the URL; restart the
                       MCP client after a daemon restart to pick up a
                       new port.

Tools exposed:
  list_projects                  list every Open Design project
  get_active_context             what project/file the user has open right now
  get_artifact([project, entry]) bundle: entry file + every referenced sibling
  get_project([project])         single project metadata
  get_file([project, path])      file contents (textual mimes only for now)
  search_files(query[, project]) literal substring search across textual files
  list_files([project])          project files + artifactManifest sidecars
  create_artifact(name, content) create one normal artifact entry file

When project is omitted, get_artifact / get_project / get_file /
search_files / list_files / create_artifact default to the project the
user has open in Open Design; get_artifact and get_file additionally
default to the active file. The response stamps usedActiveContext so
callers can see which project/file got resolved.

For the copy-paste, per-client snippet (with absolute paths resolved
for your machine, plus a one-click deeplink for Cursor), open Settings
\u2192 MCP server in the Open Design app. The daemon must be running locally
for tool calls to succeed.

To register this server into a coding agent's own config automatically:
  od mcp install <agent> [--uninstall] [--print] [--json] [--daemon-url <url>]
  Agents: ${AGENT_SLUGS.join(" ")}`);
}
async function resolveMcpLaunchSpec(flags) {
  const base = await cliDaemonBaseUrl(flags);
  try {
    const resp = await fetch(`${base}/api/mcp/install-info`);
    if (resp.ok) {
      const info = await resp.json();
      if (info && typeof info.command === "string" && Array.isArray(info.args)) {
        return {
          command: info.command,
          args: info.args,
          env: info.env && typeof info.env === "object" ? info.env : {}
        };
      }
    }
  } catch {
  }
  return {
    command: "od",
    args: ["mcp", "--daemon-url", base],
    env: {}
  };
}
function emitInstallResult(useJson, result) {
  if (useJson) {
    console.log(JSON.stringify(result));
    return;
  }
  if (result.ok) {
    console.log(`\u2713 ${result.message}`);
  } else {
    console.error(`\u2717 ${result.message}`);
  }
}
async function runMcpInstall(args) {
  let flags;
  try {
    flags = parseFlags(args, {
      string: MCP_INSTALL_STRING_FLAGS,
      boolean: MCP_INSTALL_BOOLEAN_FLAGS
    });
  } catch (err) {
    console.error(err.message);
    printMcpInstallHelp();
    process.exit(2);
  }
  if (flags.help || flags.h) {
    printMcpInstallHelp();
    return;
  }
  const slug = positionalArgs(args, MCP_INSTALL_STRING_FLAGS)[0];
  const useJson = Boolean(flags.json);
  if (!slug) {
    console.error("missing agent slug");
    printMcpInstallHelp();
    process.exit(2);
  }
  if (!isAgentSlug(slug)) {
    const msg = `unknown agent: ${slug} (expected one of: ${AGENT_SLUGS.join(" ")})`;
    emitInstallResult(useJson, { ok: false, agent: slug, message: msg });
    process.exit(2);
  }
  const uninstall = Boolean(flags.uninstall || flags.remove);
  const dryRun = Boolean(flags.print || flags["dry-run"]);
  const serverName = flags.name || "open-design";
  const os = await import("node:os");
  const spec = await resolveMcpLaunchSpec(flags);
  const plan = planAgentInstall(slug, spec, {
    home: os.homedir(),
    platform: process.platform,
    serverName
  });
  if (plan.kind === "manual") {
    const result = {
      ok: false,
      agent: slug,
      kind: "manual",
      configPath: plan.configPath,
      format: plan.format,
      snippet: plan.snippet,
      message: `${slug}: manual setup required. ${plan.reason}`
    };
    if (useJson) {
      console.log(JSON.stringify(result));
    } else {
      console.error(`\u203A ${result.message}`);
      if (plan.configPath)
        console.error(`  Config: ${plan.configPath}`);
      console.error(`  Add this ${plan.format} block:
`);
      console.log(plan.snippet);
    }
    return;
  }
  if (plan.kind === "cli") {
    const argv2 = uninstall ? plan.removeArgv : plan.addArgv;
    if (dryRun) {
      emitInstallResult(useJson, {
        ok: true,
        agent: slug,
        kind: "cli",
        command: `${plan.bin} ${argv2.join(" ")}`,
        message: `would run: ${plan.bin} ${argv2.join(" ")}`
      });
      return;
    }
    const { spawn } = await import("node:child_process");
    const code = await new Promise((resolve) => {
      const child = spawn(plan.bin, argv2, { stdio: "inherit" });
      child.on("error", (err) => {
        console.error(`\u2717 failed to run ${plan.bin}: ${err.message}`);
        resolve(127);
      });
      child.on("exit", (c) => resolve(c ?? 0));
    });
    if (code !== 0) {
      emitInstallResult(useJson, {
        ok: false,
        agent: slug,
        kind: "cli",
        message: `${plan.bin} exited with code ${code}`
      });
      process.exit(code || 1);
    }
    emitInstallResult(useJson, {
      ok: true,
      agent: slug,
      kind: "cli",
      message: uninstall ? `removed ${serverName} from ${slug}` : `installed ${serverName} into ${slug}`
    });
    return;
  }
  const fs = await import("node:fs/promises");
  const path3 = await import("node:path");
  let existing = null;
  try {
    existing = await fs.readFile(plan.configPath, "utf8");
  } catch (err) {
    if (err && err.code !== "ENOENT")
      throw err;
  }
  if (uninstall) {
    const next2 = removeJsonInstall(existing, plan);
    if (next2 == null) {
      emitInstallResult(useJson, {
        ok: true,
        agent: slug,
        kind: "json",
        configPath: plan.configPath,
        message: `${serverName} not present in ${plan.configPath} \u2014 nothing to remove`
      });
      return;
    }
    if (dryRun) {
      emitInstallResult(useJson, {
        ok: true,
        agent: slug,
        kind: "json",
        configPath: plan.configPath,
        preview: next2,
        message: `would update ${plan.configPath}`
      });
      return;
    }
    await fs.writeFile(plan.configPath, next2, "utf8");
    emitInstallResult(useJson, {
      ok: true,
      agent: slug,
      kind: "json",
      configPath: plan.configPath,
      message: `removed ${serverName} from ${plan.configPath}`
    });
    return;
  }
  const next = applyJsonInstall(existing, plan);
  if (dryRun) {
    emitInstallResult(useJson, {
      ok: true,
      agent: slug,
      kind: "json",
      configPath: plan.configPath,
      preview: next,
      message: `would write ${plan.configPath}`
    });
    return;
  }
  await fs.mkdir(path3.dirname(plan.configPath), { recursive: true });
  await fs.writeFile(plan.configPath, next, "utf8");
  emitInstallResult(useJson, {
    ok: true,
    agent: slug,
    kind: "json",
    configPath: plan.configPath,
    message: `installed ${serverName} into ${plan.configPath}`
  });
}
function printMcpInstallHelp() {
  console.log(`Usage: od mcp install <agent> [options]

Register Open Design's stdio MCP server into a coding agent's own config.

Agents:
  ${AGENT_SLUGS.join(" ")}

Options:
  --uninstall, --remove   Remove the Open Design MCP server instead.
  --print, --dry-run      Show what would change; write nothing.
  --json                  Machine-readable result.
  --name <name>           MCP server name in the agent config (default: open-design).
  --daemon-url <url>      Daemon URL used to resolve the launch command.

The launch command is resolved from the running daemon's
/api/mcp/install-info, so the installed entry matches the Settings \u2192 MCP
panel snippet byte-for-byte. Start the daemon first for an exact match;
otherwise a minimal \`od mcp --daemon-url <url>\` command is used.`);
}
function exitWithStructuredError({ code, message, data }) {
  const exit = RECOVERABLE_EXIT_CODES[code] ?? 1;
  const envelope = { error: { code, message, data: data ?? {} } };
  process.stderr.write(JSON.stringify(envelope) + "\n");
  process.exit(exit);
}
async function structuredHttpFailure(resp, fallbackCode = "daemon-not-running") {
  let parsed;
  try {
    parsed = await resp.json();
  } catch {
    parsed = {};
  }
  const errCode = normalizeRecoverableErrorCode(parsed?.error?.code, parsed?.error?.message);
  if (errCode && errCode in RECOVERABLE_EXIT_CODES) {
    exitWithStructuredError({
      code: errCode,
      message: parsed.error.message ?? `HTTP ${resp.status}`,
      data: structuredErrorData(parsed.error)
    });
  }
  exitWithStructuredError({
    code: fallbackCode,
    message: parsed?.error?.message ?? `HTTP ${resp.status}: ${await resp.text().catch(() => "")}`,
    data: structuredErrorData(parsed?.error)
  });
}
function normalizeRecoverableErrorCode(code, message) {
  if (code === "DESKTOP_AUTH_PENDING")
    return "desktop-auth-pending";
  if (code === "FORBIDDEN" && /desktop import token rejected/i.test(String(message ?? ""))) {
    return "desktop-import-token-rejected";
  }
  return code;
}
function structuredErrorData(error) {
  if (!error || typeof error !== "object")
    return void 0;
  const data = {};
  if ("data" in error && error.data !== void 0)
    Object.assign(data, error.data);
  if ("details" in error && error.details !== void 0)
    data.details = error.details;
  if (typeof error.retryable === "boolean")
    data.retryable = error.retryable;
  return Object.keys(data).length > 0 ? data : void 0;
}
async function runPlugin(args) {
  if (args.length === 0 || args[0] === "help" || args.includes("--help") || args.includes("-h")) {
    printPluginHelp();
    process.exit(args.length === 0 ? 2 : 0);
  }
  const sub = args[0];
  const rest = args.slice(1);
  switch (sub) {
    case "list":
      return runPluginList(rest);
    case "search":
      return runPluginSearch(rest);
    case "stats":
      return runPluginStats(rest);
    case "sources":
      return runPluginSources(rest);
    case "info":
      return runPluginInfo(rest);
    case "manifest":
      return runPluginManifest(rest);
    case "install":
      return runPluginInstall(rest);
    case "upgrade":
      return runPluginUpgrade(rest);
    case "uninstall":
      return runPluginUninstall(rest);
    case "apply":
      return runPluginApply(rest);
    case "canon":
      return runPluginCanon(rest);
    case "diff":
      return runPluginDiff(rest);
    case "doctor":
      return runPluginDoctor(rest);
    case "replay":
      return runPluginReplay(rest);
    case "trust":
      return runPluginTrust(rest);
    case "snapshots":
      return runPluginSnapshots(rest);
    case "simulate":
      return runPluginSimulate(rest);
    case "verify":
      return runPluginVerify(rest);
    case "events":
      return runPluginEvents(rest);
    case "run":
      return runPluginRun(rest);
    case "scaffold":
      return runPluginScaffold(rest);
    case "validate":
      return runPluginValidate(rest);
    case "pack":
      return runPluginPack(rest);
    case "candidates":
      return runPluginCandidates(rest);
    case "login":
      return runPluginLogin(rest);
    case "whoami":
      return runPluginWhoami(rest);
    case "export":
      return runPluginExport(rest);
    case "publish":
      return runPluginPublish(rest);
    case "publish-repo":
      return runPluginPublishRepo(rest);
    case "open-design-pr":
      return runPluginOpenDesignPr(rest);
    case "yank":
      return runPluginYank(rest);
    default:
      console.error(`unknown subcommand: od plugin ${sub}`);
      printPluginHelp();
      process.exit(2);
  }
}
async function runPluginScaffold(rest) {
  const flags = parseFlags(rest, {
    string: /* @__PURE__ */ new Set([
      "id",
      "title",
      "description",
      "task-kind",
      "mode",
      "scenario",
      "out"
    ]),
    boolean: /* @__PURE__ */ new Set(["help", "h", "json", "with-claude-plugin"])
  });
  if (rest.length === 0 || flags.help || flags.h) {
    console.log(`Usage:
  od plugin scaffold --id <id> [--title "<title>"] [--description "<text>"]
                     [--task-kind new-generation|code-migration|figma-migration|tune-collab]
                     [--mode <mode>] [--scenario <scenario>]
                     [--out <dir>] [--with-claude-plugin]

Writes <out|cwd>/<id>/{SKILL.md,open-design.json,README.md}.`);
    process.exit(rest.length === 0 ? 2 : 0);
  }
  const id = typeof flags.id === "string" && flags.id.length > 0 ? flags.id : rest.find((a) => !a.startsWith("-"));
  if (!id) {
    console.error("Usage: od plugin scaffold --id <id>");
    process.exit(2);
  }
  const targetDir = typeof flags.out === "string" && flags.out.length > 0 ? flags.out : process.cwd();
  const { scaffoldPlugin, ScaffoldError } = await import("./scaffold-LW4ADHPE.mjs");
  try {
    const input = {
      targetDir,
      id,
      ...flags.title ? { title: flags.title } : {},
      ...flags.description ? { description: flags.description } : {},
      ...flags["task-kind"] ? { taskKind: flags["task-kind"] } : {},
      ...flags.mode ? { mode: flags.mode } : {},
      ...flags.scenario ? { scenario: flags.scenario } : {},
      withClaudePlugin: Boolean(flags["with-claude-plugin"])
    };
    const result = await scaffoldPlugin(input);
    if (flags.json)
      return process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    console.log(`[scaffold] ${result.folder}`);
    for (const file of result.files)
      console.log(`  ${file}`);
    console.log(`
Next: od plugin install ${result.folder}`);
  } catch (err) {
    if (err instanceof ScaffoldError) {
      console.error(`[scaffold] ${err.message}`);
      process.exit(2);
    }
    throw err;
  }
}
async function runPluginValidate(rest) {
  const flags = parseFlags(rest, {
    string: /* @__PURE__ */ new Set(["daemon-url"]),
    boolean: /* @__PURE__ */ new Set(["help", "h", "json", "no-daemon"])
  });
  if (flags.help || flags.h || rest.length === 0 || rest[0]?.startsWith("-")) {
    console.log(`Usage:
  od plugin validate <folder> [--json] [--no-daemon] [--daemon-url <url>]

Runs the plugin doctor against an unfinished plugin folder before
install. Validates manifest shape, atom ids, until expressions, and
context refs against the live daemon registry (skip with --no-daemon).

Exit codes:
  0  doctor.ok = true
  4  doctor.ok = false (errors present)
  2  CLI usage error / folder unreadable`);
    process.exit(rest.length === 0 ? 2 : 0);
  }
  const folder = rest[0];
  let registry;
  if (!flags["no-daemon"]) {
    const base = (await libraryDaemonUrl(flags)).replace(/\/$/, "");
    try {
      const [skillsResp, dsResp, atomsResp] = await Promise.all([
        fetch(`${base}/api/skills`).catch(() => null),
        fetch(`${base}/api/design-systems`).catch(() => null),
        fetch(`${base}/api/atoms`).catch(() => null)
      ]);
      const skills = (skillsResp?.ok ? (await skillsResp.json())?.skills : []) ?? [];
      const designSystems = (dsResp?.ok ? (await dsResp.json())?.designSystems : []) ?? [];
      const atoms = (atomsResp?.ok ? (await atomsResp.json())?.atoms : []) ?? [];
      registry = {
        skills: skills.map((s) => ({ id: s.id, title: s.name ?? s.title, description: s.description })),
        designSystems: designSystems.map((d) => ({ id: d.id, title: d.title })),
        craft: [],
        atoms: atoms.map((a) => ({ id: a.id, label: a.label }))
      };
    } catch {
      registry = void 0;
    }
  }
  let result;
  try {
    const { validatePluginFolder, flattenValidationDiagnostics } = await import("./validate-52GWHAV4.mjs");
    result = await validatePluginFolder({ folder, ...registry ? { registry } : {} });
    if (flags.json) {
      const flat = flattenValidationDiagnostics(result);
      process.stdout.write(JSON.stringify({
        ok: result.ok,
        folder: result.folder,
        ...result.doctor ? { freshDigest: result.doctor.freshDigest, pluginId: result.doctor.pluginId } : {},
        diagnostics: flat
      }, null, 2) + "\n");
    } else {
      console.log(`[validate] folder: ${result.folder}`);
      if (result.doctor) {
        console.log(`[validate] pluginId: ${result.doctor.pluginId}`);
        console.log(`[validate] freshDigest: ${result.doctor.freshDigest.slice(0, 12)}\u2026`);
      }
      const diagnostics = (await import("./validate-52GWHAV4.mjs")).flattenValidationDiagnostics(result);
      const errors = diagnostics.filter((d) => d.severity === "error");
      const warnings = diagnostics.filter((d) => d.severity === "warning");
      const infos = diagnostics.filter((d) => d.severity === "info");
      for (const d of errors)
        console.error(`  [error]   ${d.code}: ${d.message}`);
      for (const d of warnings)
        console.warn(`  [warning] ${d.code}: ${d.message}`);
      for (const d of infos)
        console.log(`  [info]    ${d.code}: ${d.message}`);
      if (errors.length === 0 && warnings.length === 0 && infos.length === 0) {
        console.log("[validate] no issues");
      }
      console.log(`[validate] ok=${result.ok}`);
    }
  } catch (err) {
    console.error(`[validate] failed: ${err?.message ?? err}`);
    process.exit(2);
  }
  process.exit(result.ok ? 0 : 4);
}
async function runPluginPack(rest) {
  const flags = parseFlags(rest, {
    string: /* @__PURE__ */ new Set(["out"]),
    boolean: /* @__PURE__ */ new Set(["help", "h", "json"])
  });
  if (flags.help || flags.h || rest.length === 0 || rest[0]?.startsWith("-")) {
    console.log(`Usage:
  od plugin pack <folder> [--out <path>] [--json]

Builds a gzip-compressed tar archive of <folder> at --out (default
'<folder>/../<basename>-<manifest.version>.tgz'). The archive is the
exact shape \`od plugin install --source <https://...>\` consumes.

Skipped when packing:
  node_modules / .git / .next / dist / build / out / coverage /
  .turbo / .cache / .pnpm-store / .parcel-cache / .svelte-kit /
  .nuxt / .astro / .vercel / .vscode / .DS_Store / Thumbs.db
  (matches the installer's tarball-extract skiplist).
Symlinks are rejected at pack time (consistent with extract-time
rejection at install).

Exit codes:
  0  archive written
  2  CLI usage error
  4  pack-time error (missing open-design.json, invalid JSON, etc)`);
    process.exit(rest.length === 0 ? 2 : 0);
  }
  const folder = rest[0];
  try {
    const { packPlugin, PackPluginError } = await import("./pack-PVYROFB3.mjs");
    let result;
    try {
      result = await packPlugin({
        folder,
        ...typeof flags.out === "string" ? { out: flags.out } : {}
      });
    } catch (err) {
      if (err instanceof PackPluginError) {
        if (flags.json) {
          process.stdout.write(JSON.stringify({ ok: false, error: err.message }, null, 2) + "\n");
        } else {
          console.error(`[pack] ${err.message}`);
        }
        process.exit(4);
      }
      throw err;
    }
    if (flags.json) {
      process.stdout.write(JSON.stringify({
        ok: true,
        outPath: result.outPath,
        bytes: result.bytes,
        fileCount: result.files.length,
        pluginId: result.pluginId,
        pluginVersion: result.pluginVersion
      }, null, 2) + "\n");
    } else {
      const idStr = result.pluginVersion ? `${result.pluginId ?? "plugin"}@${result.pluginVersion}` : result.pluginId ?? "plugin";
      console.log(`[pack] packed ${idStr}`);
      console.log(`[pack] out:    ${result.outPath}`);
      console.log(`[pack] files:  ${result.files.length}`);
      console.log(`[pack] bytes:  ${result.bytes}`);
      console.log(`
Next: od plugin install --source ${result.outPath}`);
    }
  } catch (err) {
    console.error(`[pack] failed: ${err?.message ?? err}`);
    process.exit(2);
  }
}
async function runPluginLogin(rest) {
  const flags = parseFlags(rest, {
    string: /* @__PURE__ */ new Set(["host"]),
    boolean: /* @__PURE__ */ new Set(["help", "h"])
  });
  if (flags.help || flags.h) {
    console.log(`Usage:
  od plugin login [--host github.com]

Wraps GitHub CLI auth for Open Design registry publishing. The token stays in gh.`);
    return;
  }
  const host = typeof flags.host === "string" ? flags.host : "github.com";
  const version = await execGhBuffered(["--version"], { timeout: 1e4 });
  if (!version.ok) {
    console.error("[plugin login] GitHub CLI is required. Install gh from https://cli.github.com/ and retry.");
    process.exit(1);
  }
  const result = await spawnGhPassthrough(["auth", "login", "--hostname", host, "--web"]);
  process.exit(result.code ?? 0);
}
async function runPluginWhoami(rest) {
  const flags = parseFlags(rest, {
    string: /* @__PURE__ */ new Set(["host"]),
    boolean: /* @__PURE__ */ new Set(["help", "h", "json"])
  });
  if (flags.help || flags.h) {
    console.log(`Usage:
  od plugin whoami [--host github.com] [--json]

Shows the GitHub account gh will use for Open Design registry publishing.`);
    return;
  }
  const host = typeof flags.host === "string" ? flags.host : "github.com";
  const auth = await execGhBuffered(["auth", "status", "--hostname", host], { timeout: 1e4 });
  if (!auth.ok) {
    if (flags.json) {
      process.stdout.write(JSON.stringify({
        ok: false,
        host,
        message: "GitHub CLI is not authenticated for this host.",
        log: auth.stderr || auth.stdout
      }, null, 2) + "\n");
      return;
    }
    console.error(`[plugin whoami] gh is not authenticated for ${host}. Run: od plugin login --host ${host}`);
    if (auth.stderr || auth.stdout)
      console.error(auth.stderr || auth.stdout);
    process.exit(1);
  }
  const user = await execGhBuffered(["api", "user", "--hostname", host], { timeout: 1e4 });
  let login = "";
  let name = "";
  try {
    const parsed = JSON.parse(user.stdout || "{}");
    login = typeof parsed.login === "string" ? parsed.login : "";
    name = typeof parsed.name === "string" ? parsed.name : "";
  } catch {
  }
  const payload = {
    ok: true,
    host,
    login,
    name,
    auth: auth.stderr || auth.stdout
  };
  if (flags.json) {
    process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
  } else {
    console.log(`[plugin whoami] ${login || "authenticated"}${name ? ` (${name})` : ""} @ ${host}`);
  }
}
async function execFileBuffered(command, args, opts = {}) {
  const { execFile } = await import("node:child_process");
  return new Promise((resolve) => {
    execFile(command, args, {
      timeout: 3e4,
      maxBuffer: 1024 * 1024,
      ...opts
    }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        code: error?.code,
        stdout: String(stdout ?? "").trim(),
        stderr: String(stderr ?? "").trim(),
        error
      });
    });
  });
}
function quotePosixShellArg(value) {
  const text = String(value ?? "");
  return `'${text.replace(/'/g, `'\\''`)}'`;
}
function buildGhShellCommand(args) {
  return ["gh", ...args].map(quotePosixShellArg).join(" ");
}
function buildLoginShellCommand(innerCommand) {
  return `export PATH=${quotePosixShellArg(process.env.PATH ?? "")}; ${innerCommand}`;
}
async function execGhBuffered(args, opts = {}) {
  if (process.platform === "win32")
    return execFileBuffered("gh", args, opts);
  const shell = process.env.SHELL && process.env.SHELL.trim() ? process.env.SHELL.trim() : "/bin/zsh";
  return execFileBuffered(shell, ["-c", buildLoginShellCommand(buildGhShellCommand(args))], {
    env: process.env,
    ...opts
  });
}
async function spawnPassthrough(command, args, opts = {}) {
  const { spawn } = await import("node:child_process");
  return await new Promise((resolve) => {
    const child = spawn(command, args, { stdio: "inherit", ...opts });
    child.on("error", (error) => resolve({ code: 1, error }));
    child.on("close", (code) => resolve({ code }));
  });
}
async function spawnGhPassthrough(args) {
  if (process.platform === "win32")
    return spawnPassthrough("gh", args);
  const shell = process.env.SHELL && process.env.SHELL.trim() ? process.env.SHELL.trim() : "/bin/zsh";
  return spawnPassthrough(shell, ["-c", buildLoginShellCommand(buildGhShellCommand(args))], {
    env: process.env
  });
}
function inferGithubHost(target) {
  if (!target || target === "github.com")
    return "github.com";
  try {
    const parsed = new URL(target);
    return parsed.hostname || "github.com";
  } catch {
    return "github.com";
  }
}
async function runPluginExport(rest) {
  const flags = parseFlags(rest, {
    string: /* @__PURE__ */ new Set(["daemon-url", "as", "out", "snapshot-id", "project"]),
    boolean: /* @__PURE__ */ new Set(["help", "h", "json"])
  });
  if (rest.length === 0 || flags.help || flags.h) {
    console.log(`Usage:
  od plugin export <projectId> --as od|claude-plugin|agent-skill --out <dir>
  od plugin export --snapshot-id <id> --as od|claude-plugin|agent-skill --out <dir>

The export resolves through the daemon HTTP \`POST /api/applied-plugins/export\`
endpoint so the running daemon's installed_plugins / applied_plugin_snapshots
view is the single source of truth.`);
    process.exit(rest.length === 0 ? 2 : 0);
  }
  const positional = rest.find((a) => !a.startsWith("-"));
  const projectId = flags.project ?? positional ?? null;
  const snapshotId = typeof flags["snapshot-id"] === "string" ? flags["snapshot-id"] : null;
  if (!projectId && !snapshotId) {
    console.error("Usage: od plugin export <projectId> --as <target> --out <dir>");
    process.exit(2);
  }
  const target = String(flags.as ?? "od");
  if (target !== "od" && target !== "claude-plugin" && target !== "agent-skill") {
    console.error(`--as must be one of: od, claude-plugin, agent-skill (got "${target}")`);
    process.exit(2);
  }
  const out = typeof flags.out === "string" && flags.out.length > 0 ? flags.out : process.cwd();
  const base = (await pluginDaemonUrl(flags)).replace(/\/$/, "");
  const resp = await fetch(`${base}/api/applied-plugins/export`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...snapshotId ? { snapshotId } : { projectId },
      target,
      outDir: out
    })
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    console.error(`POST /api/applied-plugins/export failed: ${resp.status} ${JSON.stringify(data)}`);
    process.exit(1);
  }
  if (flags.json)
    return process.stdout.write(JSON.stringify(data, null, 2) + "\n");
  console.log(`[export] ${data.folder} (snapshot ${data.snapshotId})`);
  for (const f of data.files ?? [])
    console.log(`  ${f}`);
}
async function runMarketplace(args) {
  if (args.length === 0 || args[0] === "help" || args.includes("--help") || args.includes("-h")) {
    console.log(`Usage:
  od marketplace add     <url> [--trust trusted|restricted]   Register a federated catalog.
  od marketplace list                                         List registered marketplaces.
  od marketplace info    <id>                                 Inspect one marketplace + cached manifest.
  od marketplace plugins <id> [--json]                        List cached plugin entries for one marketplace.
  od marketplace search  <query> [--json]                     Search cached marketplace entries.
  od marketplace doctor  [id] [--strict] [--json]             Validate cached marketplace entries.
  od marketplace login   <id|url> [--host github.com]         Authenticate gh for private GitHub catalogs.
  od marketplace refresh <id>                                 Re-fetch the manifest.
  od marketplace remove  <id>                                 Forget a marketplace.
  od marketplace trust   <id> [--trust trusted|restricted|official]
                                                              Update the marketplace trust tier.

Common options:
  --daemon-url <url>   Open Design daemon HTTP base (default OD_DAEMON_URL, OD_SIDECAR_IPC_PATH discovery, or http://127.0.0.1:7456).
  --json               Emit raw JSON (suitable for scripts).`);
    process.exit(args.length === 0 ? 2 : 0);
  }
  const sub = args[0];
  const rest = args.slice(1);
  const flags = parseFlags(rest, { string: PLUGIN_STRING_FLAGS, boolean: PLUGIN_BOOLEAN_FLAGS });
  const base = (await pluginDaemonUrl(flags)).replace(/\/$/, "");
  switch (sub) {
    case "list": {
      const resp = await fetch(`${base}/api/marketplaces`);
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok)
        return structuredHttpFailure(resp);
      if (flags.json) {
        process.stdout.write(JSON.stringify(data, null, 2) + "\n");
        return;
      }
      const rows = data?.marketplaces ?? [];
      if (rows.length === 0) {
        console.log("No marketplaces registered. Run `od marketplace add <url>`.");
        return;
      }
      for (const m of rows) {
        console.log(`${m.id}  version=${m.version ?? "unknown"}  spec=${m.specVersion ?? "unknown"}  trust=${m.trust}  url=${m.url}`);
      }
      return;
    }
    case "search": {
      const query = (rest.find((a) => !a.startsWith("-")) ?? "").toLowerCase();
      if (!query) {
        console.error('Usage: od marketplace search "<query>" [--tag <tag>]');
        process.exit(2);
      }
      const tag = typeof flags.tag === "string" ? flags.tag.toLowerCase() : null;
      const resp = await fetch(`${base}/api/marketplaces`);
      if (!resp.ok)
        return structuredHttpFailure(resp);
      const data = await resp.json();
      const matches = [];
      for (const mp of data?.marketplaces ?? []) {
        const plugins = mp.manifest?.plugins ?? [];
        for (const p of plugins) {
          const haystack = [
            p.name ?? "",
            p.description ?? "",
            ...Array.isArray(p.tags) ? p.tags : []
          ].join(" ").toLowerCase();
          if (!haystack.includes(query))
            continue;
          if (tag && !(Array.isArray(p.tags) && p.tags.map((t) => t.toLowerCase()).includes(tag)))
            continue;
          matches.push({
            marketplaceId: mp.id,
            marketplaceUrl: mp.url,
            marketplaceVersion: mp.version,
            name: p.name,
            version: p.version,
            source: p.source,
            description: p.description ?? "",
            tags: p.tags ?? []
          });
        }
      }
      if (flags.json) {
        process.stdout.write(JSON.stringify({ matches }, null, 2) + "\n");
        return;
      }
      if (matches.length === 0) {
        console.log(`No matches for "${query}"`);
        return;
      }
      for (const m of matches) {
        console.log(`${m.name}@${m.version}	${m.source}	${m.marketplaceId}@${m.marketplaceVersion}	${m.description}`);
      }
      return;
    }
    case "plugins": {
      const id = rest.find((a) => !a.startsWith("-"));
      if (!id) {
        console.error("Usage: od marketplace plugins <id> [--json]");
        process.exit(2);
      }
      const resp = await fetch(`${base}/api/marketplaces/${encodeURIComponent(id)}/plugins`);
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        console.error(`plugins failed: ${resp.status} ${JSON.stringify(data)}`);
        process.exit(1);
      }
      const plugins = Array.isArray(data?.plugins) ? data.plugins : [];
      if (flags.json) {
        process.stdout.write(JSON.stringify({ marketplaceId: id, plugins }, null, 2) + "\n");
        return;
      }
      if (plugins.length === 0) {
        console.log(`No plugins in marketplace ${id}.`);
        return;
      }
      for (const p of plugins) {
        console.log(`${p.name}@${p.version}	${p.source}	${p.description ?? ""}`);
      }
      return;
    }
    case "doctor": {
      const strict = flags.strict === true;
      const id = rest.find((a) => !a.startsWith("-"));
      const resp = id ? await fetch(`${base}/api/marketplaces/${encodeURIComponent(id)}`) : await fetch(`${base}/api/marketplaces`);
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        console.error(`doctor failed: ${resp.status} ${JSON.stringify(data)}`);
        process.exit(1);
      }
      const rows = id ? [data] : data?.marketplaces ?? [];
      const { doctorMarketplace } = await import("./marketplace-doctor-3OXUEACK.mjs");
      const reports = [];
      for (const row of rows) {
        reports.push(await doctorMarketplace({
          id: row.id,
          trust: row.trust,
          manifest: row.manifest,
          strict
        }));
      }
      const ok = reports.every((report) => report.ok);
      if (flags.json) {
        process.stdout.write(JSON.stringify({ ok, reports }, null, 2) + "\n");
      } else {
        for (const report of reports) {
          console.log(`[marketplace doctor] ${report.backendId}: ${report.ok ? "ok" : "issues"} (${report.entriesChecked} entries)`);
          for (const issue of report.issues) {
            console.log(`  [${issue.severity}] ${issue.code}${issue.pluginName ? ` ${issue.pluginName}` : ""}: ${issue.message}`);
          }
        }
      }
      process.exit(ok ? 0 : 1);
    }
    case "login": {
      const target = rest.find((a) => !a.startsWith("-"));
      const host = typeof flags.host === "string" ? flags.host : inferGithubHost(target ?? "github.com");
      const version = await execFileBuffered("gh", ["--version"], { timeout: 1e4 });
      if (!version.ok) {
        console.error("[marketplace login] GitHub CLI is required. Install gh from https://cli.github.com/ and retry.");
        process.exit(1);
      }
      console.log(`[marketplace login] authenticating gh for ${host}. Tokens stay in gh, not Open Design.`);
      const result = await spawnPassthrough("gh", ["auth", "login", "--hostname", host, "--web"]);
      process.exit(result.code ?? 0);
    }
    case "add": {
      const url = rest.find((a) => !a.startsWith("-"));
      if (!url) {
        console.error("Usage: od marketplace add <url> [--trust trusted|restricted]");
        process.exit(2);
      }
      const trust = flags.trust ?? "restricted";
      const resp = await fetch(`${base}/api/marketplaces`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, trust })
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        console.error(`add failed: ${resp.status} ${JSON.stringify(data)}`);
        process.exit(1);
      }
      console.log(`[marketplace] added ${data.id} (${data.url}) trust=${data.trust}`);
      return;
    }
    case "info":
    case "refresh":
    case "remove":
    case "trust": {
      const id = rest.find((a) => !a.startsWith("-") && a !== flags.trust);
      if (!id) {
        console.error(`Usage: od marketplace ${sub} <id>`);
        process.exit(2);
      }
      let url;
      let method = "GET";
      let body;
      if (sub === "info")
        url = `${base}/api/marketplaces/${encodeURIComponent(id)}`;
      else if (sub === "refresh") {
        url = `${base}/api/marketplaces/${encodeURIComponent(id)}/refresh`;
        method = "POST";
      } else if (sub === "remove") {
        url = `${base}/api/marketplaces/${encodeURIComponent(id)}`;
        method = "DELETE";
      } else if (sub === "trust") {
        const trust = flags.trust ?? "trusted";
        url = `${base}/api/marketplaces/${encodeURIComponent(id)}/trust`;
        method = "POST";
        body = JSON.stringify({ trust });
      }
      const resp = await fetch(url, {
        method,
        ...body ? { headers: { "content-type": "application/json" }, body } : {}
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        console.error(`${sub} failed: ${resp.status} ${JSON.stringify(data)}`);
        process.exit(1);
      }
      process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      return;
    }
    default:
      console.error(`unknown subcommand: od marketplace ${sub}`);
      process.exit(2);
  }
}
async function runPluginSnapshots(args) {
  const sub = args[0];
  if (!sub || sub === "help" || args.includes("--help") || args.includes("-h")) {
    console.log(`Usage:
  od plugin snapshots list  [--project <id>]               List applied plugin snapshots.
  od plugin snapshots show  <snapshotId> [--json]          Print one snapshot's full contents.
  od plugin snapshots diff  <id-a> <id-b> [--json]         Compare two snapshots field-by-field.
  od plugin snapshots prune [--before <unix-ms>]           Delete expired (or older-than-cutoff) snapshots.`);
    process.exit(args.length === 0 ? 2 : 0);
  }
  const flags = parseFlags(args.slice(1), { string: PLUGIN_STRING_FLAGS, boolean: PLUGIN_BOOLEAN_FLAGS });
  const base = (await pluginDaemonUrl(flags)).replace(/\/$/, "");
  if (sub === "show") {
    const positional = args.slice(1).filter((a) => !a.startsWith("-"));
    const id = positional[0];
    if (!id) {
      console.error("Usage: od plugin snapshots show <snapshotId>");
      process.exit(2);
    }
    const url = `${base}/api/applied-plugins/${encodeURIComponent(id)}`;
    const resp = await fetch(url);
    if (resp.status === 404) {
      console.error(`snapshot ${id} not found`);
      process.exit(72);
    }
    if (!resp.ok) {
      console.error(`GET ${url} failed: ${resp.status} ${await resp.text()}`);
      process.exit(1);
    }
    const data = await resp.json();
    process.stdout.write(JSON.stringify(data, null, 2) + "\n");
    return;
  }
  if (sub === "diff") {
    const positional = args.slice(1).filter((a2) => !a2.startsWith("-"));
    if (positional.length < 2) {
      console.error("Usage: od plugin snapshots diff <id-a> <id-b>");
      process.exit(2);
    }
    const [idA, idB] = positional;
    const [respA, respB] = await Promise.all([
      fetch(`${base}/api/applied-plugins/${encodeURIComponent(idA)}`),
      fetch(`${base}/api/applied-plugins/${encodeURIComponent(idB)}`)
    ]);
    if (respA.status === 404) {
      console.error(`snapshot ${idA} not found`);
      process.exit(72);
    }
    if (respB.status === 404) {
      console.error(`snapshot ${idB} not found`);
      process.exit(72);
    }
    if (!respA.ok || !respB.ok) {
      console.error(`fetch failed: ${respA.status} / ${respB.status}`);
      process.exit(1);
    }
    const a = await respA.json();
    const b = await respB.json();
    const { diffSnapshots } = await import("./snapshot-diff-L6JZTO5R.mjs");
    const report = diffSnapshots({ a, b });
    if (flags.json) {
      process.stdout.write(JSON.stringify(report, null, 2) + "\n");
      return;
    }
    const digestNote = report.digestEqual ? "\u2713 manifestSourceDigest equal (e2e-2 invariant holds)" : "\u2717 manifestSourceDigest DIFFERS (replay would diverge)";
    console.log(`[snapshots diff] ${idA} \u2194 ${idB}`);
    console.log(`  ${digestNote}`);
    console.log(`  ${report.added} added, ${report.removed} removed, ${report.changed} changed`);
    if (report.entries.length === 0) {
      console.log("  (no field-level differences)");
      return;
    }
    for (const e of report.entries) {
      const tag = e.kind === "added" ? "+" : e.kind === "removed" ? "-" : "~";
      if (e.summary) {
        console.log(`  ${tag} ${e.field}  (${e.summary})`);
      } else if (e.kind === "changed") {
        console.log(`  ${tag} ${e.field}: ${e.before ?? ""} \u2192 ${e.after ?? ""}`);
      } else if (e.kind === "added") {
        console.log(`  ${tag} ${e.field}: ${e.after ?? ""}`);
      } else {
        console.log(`  ${tag} ${e.field}: ${e.before ?? ""}`);
      }
    }
    return;
  }
  if (sub === "list") {
    const url = flags.project ? `${base}/api/projects/${encodeURIComponent(flags.project)}/applied-plugins` : `${base}/api/applied-plugins`;
    const resp = await fetch(url);
    if (!resp.ok) {
      console.error(`GET ${url} failed: ${resp.status} ${await resp.text()}`);
      process.exit(1);
    }
    const data = await resp.json();
    process.stdout.write(JSON.stringify(data, null, 2) + "\n");
    return;
  }
  if (sub === "prune") {
    const url = `${base}/api/applied-plugins/prune`;
    const before = flags.before ? Number(flags.before) : void 0;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(before ? { before } : {})
    });
    if (!resp.ok) {
      console.error(`POST ${url} failed: ${resp.status} ${await resp.text()}`);
      process.exit(1);
    }
    const data = await resp.json();
    if (flags.json) {
      process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      return;
    }
    console.log(`[snapshots] pruned ${data.removed ?? 0} snapshot(s)`);
    return;
  }
  console.error(`unknown subcommand: od plugin snapshots ${sub}`);
  process.exit(2);
}
async function runPluginRun(rest) {
  const flags = parseFlags(rest, { string: PLUGIN_STRING_FLAGS, boolean: PLUGIN_BOOLEAN_FLAGS });
  const id = rest.find((a) => !a.startsWith("-") && a !== flags["daemon-url"] && a !== flags.source && a !== flags.inputs && a !== flags.project && a !== flags.conversation && a !== flags.message && a !== flags.agent && a !== flags.model && a !== flags["snapshot-id"] && a !== flags.capabilities && a !== flags["grant-caps"]);
  if (!id) {
    console.error('Usage: od plugin run <id> --project <projectId> [--inputs <json>] [--agent <id>] [--message "<text>"] [--grant-caps a,b] [--follow]');
    process.exit(2);
  }
  if (!flags.project) {
    console.error("--project <projectId> is required (Phase 1.5 will add the auto-create wrapper)");
    process.exit(2);
  }
  const inputs = flags.inputs ? safeParseJson(flags.inputs) ?? {} : {};
  const grantCaps = typeof flags["grant-caps"] === "string" && flags["grant-caps"].length > 0 ? flags["grant-caps"].split(",").map((c) => c.trim()).filter(Boolean) : [];
  const base = (await pluginDaemonUrl(flags)).replace(/\/$/, "");
  const applyResp = await fetch(`${base}/api/plugins/${encodeURIComponent(id)}/apply`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ inputs, grantCaps, projectId: flags.project })
  });
  const applyData = await applyResp.json().catch(() => ({}));
  if (!applyResp.ok) {
    console.error(`apply failed: ${applyResp.status} ${JSON.stringify(applyData)}`);
    process.exit(applyResp.status === 422 ? 67 : 1);
  }
  const runResp = await fetch(`${base}/api/runs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      projectId: flags.project,
      pluginId: id,
      pluginInputs: inputs,
      grantCaps,
      ...flags.conversation ? { conversationId: flags.conversation } : {},
      ...flags.message ? { message: flags.message } : {},
      ...flags.agent ? { agentId: flags.agent } : {},
      ...flags.model ? { model: flags.model } : {},
      ...flags["snapshot-id"] ? { appliedPluginSnapshotId: flags["snapshot-id"] } : {}
    })
  });
  const runData = await runResp.json().catch(() => ({}));
  if (!runResp.ok) {
    if (runResp.status === 409 && runData?.error?.code === "capabilities-required") {
      const missing = (runData.error.data?.missing ?? []).join(",");
      console.error(`[run] capabilities required: ${missing}`);
      console.error(`[run] retry with --grant-caps ${missing} or run \`od plugin trust ${id} --capabilities ${missing}\``);
      process.exit(66);
    }
    console.error(`run failed: ${runResp.status} ${JSON.stringify(runData)}`);
    process.exit(1);
  }
  if (flags.json) {
    process.stdout.write(JSON.stringify({ apply: applyData, run: runData }, null, 2) + "\n");
    if (flags.follow)
      await streamRunEvents(base, runData.runId);
    return;
  }
  console.log(`[run] started run ${runData.runId} (snapshot ${runData.appliedPluginSnapshotId ?? applyData?.appliedPlugin?.snapshotId ?? "n/a"})`);
  if (flags.follow) {
    await streamRunEvents(base, runData.runId);
  }
}
async function pluginDaemonUrl(flags) {
  return cliDaemonUrl(flags);
}
async function runPluginList(rest) {
  const flags = parseFlags(rest, {
    string: PLUGIN_LIST_FILTER_FLAGS,
    boolean: PLUGIN_LIST_BOOLEAN_FLAGS
  });
  if (flags.help || flags.h) {
    console.log(`Usage:
  od plugin list [--task-kind <kind>] [--mode <mode>] [--tag <tag>] \\
                 [--trust <tier>] [--bundled | --no-bundled] [--json]

Lists installed plugins. Filters AND together: --task-kind=code-migration
+ --tag=phase-7 returns only code-migration plugins tagged 'phase-7'.

  --task-kind   Match od.taskKind (new-generation / figma-migration /
                code-migration / tune-collab).
  --mode        Match od.mode.
  --tag         Match an entry in tags[].
  --trust       Match trust tier (trusted / restricted / bundled).
  --bundled     Restrict to bundled plugins (sourceKind='bundled' OR
                trust='bundled').
  --no-bundled  Exclude bundled plugins.`);
    process.exit(0);
  }
  const data = await fetchPluginList(flags);
  const filtered = await applyPluginFilters(data?.plugins ?? [], flags);
  emitPluginList({ entries: filtered, json: !!flags.json, emptyMessage: "No plugins matched the filter." });
}
async function runPluginSearch(rest) {
  const flags = parseFlags(rest, {
    string: PLUGIN_LIST_FILTER_FLAGS,
    boolean: PLUGIN_LIST_BOOLEAN_FLAGS
  });
  const positional = rest.filter((a) => !a.startsWith("-"));
  const query = positional[0];
  if (flags.help || flags.h || !query) {
    console.log(`Usage:
  od plugin search <query> [--task-kind <kind>] [--mode <mode>] \\
                           [--tag <tag>] [--trust <tier>] \\
                           [--bundled | --no-bundled] [--json]

Free-text search across installed plugins. Matches case-insensitively
on id / title / description / tags. Combines with the same filter
flags as 'od plugin list'.`);
    process.exit(query ? 0 : 2);
  }
  const data = await fetchPluginList(flags);
  const filtered = await applyPluginFilters(data?.plugins ?? [], flags, query);
  emitPluginList({
    entries: filtered,
    json: !!flags.json,
    emptyMessage: `No installed plugins matched "${query}".`,
    showRank: true
  });
}
async function runPluginStats(rest) {
  const flags = parseFlags(rest, {
    string: PLUGIN_STRING_FLAGS,
    boolean: PLUGIN_BOOLEAN_FLAGS
  });
  if (flags.help || flags.h) {
    console.log(`Usage:
  od plugin stats [--json]

Prints an at-a-glance plugin + snapshot inventory:
  - Plugin counts by sourceKind, trust, taskKind.
  - Bundled vs. third-party split.
  - Plugins with elevated capabilities (fs:write, subprocess,
    bash, network, connector:*).
  - Snapshot total, status breakdown, project / run linkage.
  - Oldest / newest applied snapshot timestamps.`);
    process.exit(0);
  }
  const base = (await pluginDaemonUrl(flags)).replace(/\/$/, "");
  const url = `${base}/api/plugins/stats`;
  const resp = await fetch(url);
  if (!resp.ok) {
    console.error(`GET ${url} failed: ${resp.status} ${await resp.text()}`);
    process.exit(1);
  }
  const data = await resp.json();
  if (flags.json) {
    process.stdout.write(JSON.stringify(data, null, 2) + "\n");
    return;
  }
  const p = data?.plugins ?? {};
  const s = data?.snapshots ?? {};
  const lastInstalled = formatTimestamp(p.lastInstalledAt);
  const lastUpdated = formatTimestamp(p.lastUpdatedAt);
  const oldestApplied = formatTimestamp(s.oldestAppliedAt);
  const newestApplied = formatTimestamp(s.newestAppliedAt);
  console.log("# Plugins");
  console.log(`  total:            ${p.total ?? 0}`);
  console.log(`  bundled:          ${p.bundled ?? 0}`);
  console.log(`  third-party:      ${p.thirdParty ?? 0}`);
  console.log(`  with elevated:    ${p.withElevatedCapabilities ?? 0}`);
  console.log(`  by sourceKind:    ${formatCounts(p.bySourceKind)}`);
  console.log(`  by trust:         ${formatCounts(p.byTrust)}`);
  console.log(`  by taskKind:      ${formatCounts(p.byTaskKind)}`);
  console.log(`  last installed:   ${lastInstalled}`);
  console.log(`  last updated:     ${lastUpdated}`);
  console.log("");
  console.log("# Snapshots");
  console.log(`  total:            ${s.total ?? 0}`);
  console.log(`  by status:        ${formatCounts(s.byStatus)}`);
  console.log(`  with project:     ${s.withProject ?? 0}`);
  console.log(`  with run:         ${s.withRun ?? 0}`);
  console.log(`  oldest applied:   ${oldestApplied}`);
  console.log(`  newest applied:   ${newestApplied}`);
}
function formatCounts(counts) {
  if (!counts || typeof counts !== "object")
    return "(none)";
  const entries = Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
  if (entries.length === 0)
    return "(none)";
  return entries.map(([k, v]) => `${k}=${v}`).join(", ");
}
function formatTimestamp(ts) {
  if (typeof ts !== "number" || !Number.isFinite(ts))
    return "(none)";
  try {
    return new Date(ts).toISOString();
  } catch {
    return String(ts);
  }
}
async function fetchPluginList(flags) {
  const url = `${(await pluginDaemonUrl(flags)).replace(/\/$/, "")}/api/plugins`;
  const resp = await fetch(url);
  if (!resp.ok) {
    console.error(`GET /api/plugins failed: ${resp.status} ${await resp.text()}`);
    process.exit(1);
  }
  const data = await resp.json();
  return data;
}
async function applyPluginFilters(plugins, flags, query) {
  if (!Array.isArray(plugins) || plugins.length === 0)
    return [];
  const { searchInstalledPlugins } = await import("./search-K5IEJQW6.mjs");
  const trustFlag = typeof flags.trust === "string" ? flags.trust : void 0;
  const taskKind = typeof flags["task-kind"] === "string" ? flags["task-kind"] : void 0;
  const mode = typeof flags.mode === "string" ? flags.mode : void 0;
  const tag = typeof flags.tag === "string" ? flags.tag : void 0;
  let bundled;
  if (flags.bundled === true)
    bundled = true;
  if (flags["no-bundled"] === true)
    bundled = false;
  const result = searchInstalledPlugins({
    plugins,
    ...typeof query === "string" && query.trim() ? { query } : {},
    ...taskKind ? { taskKind } : {},
    ...mode ? { mode } : {},
    ...tag ? { tag } : {},
    ...trustFlag === "trusted" || trustFlag === "restricted" || trustFlag === "bundled" ? { trust: trustFlag } : {},
    ...typeof bundled === "boolean" ? { bundled } : {}
  });
  return result.entries;
}
function emitPluginList({ entries, json, emptyMessage, showRank }) {
  if (json) {
    process.stdout.write(JSON.stringify({
      total: entries.length,
      plugins: entries.map((e) => ({
        ...e.plugin,
        ...showRank ? { matched: e.matched, rank: e.rank } : {}
      }))
    }, null, 2) + "\n");
    return;
  }
  if (entries.length === 0) {
    console.log(emptyMessage ?? "No plugins matched.");
    return;
  }
  for (const entry of entries) {
    const p = entry.plugin;
    const tail = showRank && entry.matched.length > 0 ? `  matched=[${entry.matched.join(",")}]` : "";
    console.log(`${p.id}@${p.version}  trust=${p.trust}  source=${p.sourceKind}  title="${p.title}"${tail}`);
  }
}
async function runPluginInfo(rest) {
  const flags = parseFlags(rest, { string: PLUGIN_STRING_FLAGS, boolean: PLUGIN_BOOLEAN_FLAGS });
  const id = rest.find((a) => !a.startsWith("--") && a !== flags["daemon-url"] && a !== flags.source && a !== flags.version);
  if (!id) {
    console.error("Usage: od plugin info <id-or-marketplace-name> [--version <version|tag|range>] [--json]");
    process.exit(2);
  }
  const base = (await pluginDaemonUrl(flags)).replace(/\/$/, "");
  const url = `${base}/api/plugins/${encodeURIComponent(id)}`;
  const resp = await fetch(url);
  if (resp.ok && !flags.version) {
    const data2 = await resp.json();
    process.stdout.write(JSON.stringify(data2, null, 2) + "\n");
    return;
  }
  const mpResp = await fetch(`${base}/api/marketplaces`);
  if (mpResp.ok) {
    const mpData = await mpResp.json().catch(() => ({}));
    const resolved = resolveMarketplacePluginFromList(mpData?.marketplaces ?? [], flags.version ? `${id}@${flags.version}` : id);
    if (resolved) {
      process.stdout.write(JSON.stringify({ marketplace: resolved }, null, 2) + "\n");
      return;
    }
  }
  if (!resp.ok) {
    console.error(`GET /api/plugins/${id} failed: ${resp.status} ${await resp.text()}`);
    process.exit(1);
  }
  const data = await resp.json();
  process.stdout.write(JSON.stringify(data, null, 2) + "\n");
}
function resolveMarketplacePluginFromList(marketplaces, specifier) {
  const parsed = parseCliPluginSpecifier(specifier);
  const target = parsed.name.toLowerCase();
  for (const marketplace of marketplaces) {
    for (const entry of marketplace?.manifest?.plugins ?? []) {
      if (String(entry.name ?? "").toLowerCase() !== target)
        continue;
      const version = resolveCliEntryVersion(entry, parsed.range);
      if (!version)
        return null;
      return {
        marketplaceId: marketplace.id,
        marketplaceTrust: marketplace.trust,
        name: entry.name,
        version: version.version,
        source: version.source,
        ref: version.ref,
        integrity: version.integrity,
        manifestDigest: version.manifestDigest,
        entry
      };
    }
  }
  return null;
}
function parseCliPluginSpecifier(input) {
  const trimmed = String(input ?? "").trim();
  const slash = trimmed.indexOf("/");
  const at = trimmed.lastIndexOf("@");
  if (slash > 0 && at > slash + 1) {
    return { name: trimmed.slice(0, at), range: trimmed.slice(at + 1) };
  }
  return { name: trimmed, range: void 0 };
}
function resolveCliEntryVersion(entry, range) {
  if (entry?.yanked)
    return null;
  const versions = Array.isArray(entry?.versions) ? entry.versions : [];
  const target = range && range !== "latest" ? entry?.distTags?.[range] ?? range : entry?.distTags?.latest ?? entry?.version;
  const version = versions.find((item) => item.version === target) ?? null;
  if (version?.yanked)
    return null;
  return {
    version: target,
    source: version?.source ?? entry?.source,
    ref: version?.ref ?? entry?.ref,
    integrity: version?.integrity ?? version?.dist?.integrity ?? entry?.integrity ?? entry?.dist?.integrity,
    manifestDigest: version?.manifestDigest ?? version?.dist?.manifestDigest ?? entry?.manifestDigest ?? entry?.dist?.manifestDigest
  };
}
async function runPluginManifest(rest) {
  const flags = parseFlags(rest, { string: PLUGIN_STRING_FLAGS, boolean: PLUGIN_BOOLEAN_FLAGS });
  const id = rest.find((a) => !a.startsWith("--") && a !== flags["daemon-url"] && a !== flags.source);
  if (!id) {
    console.error("Usage: od plugin manifest <id>");
    process.exit(2);
  }
  const url = `${(await pluginDaemonUrl(flags)).replace(/\/$/, "")}/api/plugins/${encodeURIComponent(id)}`;
  const resp = await fetch(url);
  if (resp.status === 404) {
    console.error(`plugin ${id} not found`);
    process.exit(65);
  }
  if (!resp.ok) {
    console.error(`GET /api/plugins/${id} failed: ${resp.status} ${await resp.text()}`);
    process.exit(1);
  }
  const data = await resp.json();
  if (!data?.manifest) {
    console.error(`plugin ${id} has no recorded manifest (registry row is incomplete)`);
    process.exit(1);
  }
  process.stdout.write(JSON.stringify(data.manifest, null, 2) + "\n");
}
async function runPluginSources(rest) {
  const flags = parseFlags(rest, { string: PLUGIN_STRING_FLAGS, boolean: PLUGIN_BOOLEAN_FLAGS });
  const url = `${(await pluginDaemonUrl(flags)).replace(/\/$/, "")}/api/plugins`;
  const resp = await fetch(url);
  if (!resp.ok) {
    console.error(`GET /api/plugins failed: ${resp.status} ${await resp.text()}`);
    process.exit(1);
  }
  const data = await resp.json();
  const plugins = Array.isArray(data?.plugins) ? data.plugins : [];
  const buckets = /* @__PURE__ */ new Map();
  for (const p of plugins) {
    const key = `${p.sourceKind ?? "unknown"}	${p.source ?? "(none)"}`;
    const entry = buckets.get(key) ?? { sourceKind: p.sourceKind ?? "unknown", source: p.source ?? "(none)", count: 0, plugins: [] };
    entry.count += 1;
    entry.plugins.push({ id: p.id, version: p.version });
    buckets.set(key, entry);
  }
  const rows = [...buckets.values()].sort((a, b) => {
    if (a.count !== b.count)
      return b.count - a.count;
    if (a.sourceKind !== b.sourceKind)
      return a.sourceKind.localeCompare(b.sourceKind);
    return a.source.localeCompare(b.source);
  });
  if (flags.json) {
    process.stdout.write(JSON.stringify({ total: plugins.length, sources: rows }, null, 2) + "\n");
    return;
  }
  if (rows.length === 0) {
    console.log("No plugins installed.");
    return;
  }
  console.log(`# Plugin install sources (total: ${plugins.length})`);
  for (const row of rows) {
    console.log(`  ${row.sourceKind.padEnd(11)}  ${String(row.count).padStart(3)}  ${row.source}`);
    for (const plug of row.plugins) {
      console.log(`               \u2514\u2500 ${plug.id}@${plug.version}`);
    }
  }
}
async function runPluginInstall(rest) {
  const flags = parseFlags(rest, { string: PLUGIN_STRING_FLAGS, boolean: PLUGIN_BOOLEAN_FLAGS });
  const source = typeof flags.source === "string" ? flags.source : rest.find((a) => !a.startsWith("-"));
  if (!source) {
    console.error("Usage: od plugin install <source-or-name>\n       od plugin install ./local-folder\n       od plugin install github:owner/repo[@ref][/subpath]\n       od plugin install https://example.com/plugin.tar.gz\n       od plugin install <name>[@version|tag|range]  # resolves through configured marketplaces");
    process.exit(2);
  }
  const url = `${(await pluginDaemonUrl(flags)).replace(/\/$/, "")}/api/plugins/install`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "text/event-stream" },
    body: JSON.stringify({ source })
  });
  if (!resp.ok || !resp.body) {
    console.error(`POST /api/plugins/install failed: ${resp.status} ${await resp.text()}`);
    process.exit(1);
  }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let exitCode = 0;
  const events = [];
  let finalEvent = null;
  while (true) {
    const { value, done } = await reader.read();
    if (done)
      break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";
    for (const block of blocks) {
      const lines = block.split("\n");
      const eventLine = lines.find((l) => l.startsWith("event: "));
      const dataLine = lines.find((l) => l.startsWith("data: "));
      const event = eventLine ? eventLine.slice("event: ".length) : "message";
      const data = dataLine ? safeParseJson(dataLine.slice("data: ".length)) : null;
      events.push({ event, data });
      if (event === "progress") {
        if (!flags.json)
          console.log(`[install] ${data?.phase ?? "..."}: ${data?.message ?? ""}`);
      } else if (event === "success") {
        finalEvent = data;
        if (!flags.json)
          console.log(`[install] ok \u2014 ${data?.plugin?.id}@${data?.plugin?.version} (trust=${data?.plugin?.trust})`);
        if (!flags.json && Array.isArray(data?.warnings) && data.warnings.length > 0) {
          for (const w of data.warnings)
            console.log(`[install] warn: ${w}`);
        }
      } else if (event === "error") {
        finalEvent = data;
        if (!flags.json)
          console.error(`[install] error: ${data?.message ?? "unknown"}`);
        exitCode = 1;
      }
    }
  }
  if (flags.json) {
    process.stdout.write(JSON.stringify({
      ok: exitCode === 0,
      result: finalEvent,
      events
    }, null, 2) + "\n");
  }
  process.exit(exitCode);
}
async function runPluginEvents(rest) {
  const sub = rest[0];
  if (!sub || sub === "help" || rest.includes("--help") || rest.includes("-h")) {
    console.log(`Usage:
  od plugin events tail     [-f] [--since <id>] [--kind <k>] [--plugin-id <id>] [--json]
  od plugin events snapshot [--since <id>] [--kind <k>] [--plugin-id <id>] [--json]
  od plugin events stats    [--json]
  od plugin events purge    [--confirm] [--json]    (loopback-only)

Tail / snapshot / stats / purge over the daemon's in-memory
plugin event ring buffer (capped at 1000 entries; resets on
daemon restart).
Lifecycle vocabulary:
  plugin.installed | plugin.upgraded | plugin.uninstalled
  plugin.trust-changed | plugin.snapshot-pruned
  plugin.marketplace-refreshed | plugin.applied

  --since <id>       Trim backlog to events strictly after id.
  --kind <k>         Filter to a single kind.
  --plugin-id <id>   Filter to events touching one plugin id.
  -f / --follow      tail-only: keep the SSE stream open.
  --json             Emit raw JSON (one event per line on tail,
                     full report on snapshot/stats).`);
    process.exit(sub ? 0 : 2);
  }
  const flags = parseFlags(rest.slice(1), {
    string: /* @__PURE__ */ new Set([...PLUGIN_STRING_FLAGS, "since", "kind", "plugin-id"]),
    boolean: /* @__PURE__ */ new Set([...PLUGIN_BOOLEAN_FLAGS, "f", "follow"])
  });
  const base = (await pluginDaemonUrl(flags)).replace(/\/$/, "");
  const since = typeof flags.since === "string" ? Number(flags.since) : 0;
  const kindFilter = typeof flags.kind === "string" && flags.kind.length > 0 ? flags.kind : null;
  const pluginIdFilter = typeof flags["plugin-id"] === "string" && flags["plugin-id"].length > 0 ? flags["plugin-id"] : null;
  const matches = (ev) => {
    if (!ev)
      return false;
    if (kindFilter && ev.kind !== kindFilter)
      return false;
    if (pluginIdFilter && ev.pluginId !== pluginIdFilter)
      return false;
    return true;
  };
  if (sub === "snapshot") {
    const url2 = `${base}/api/plugins/events/snapshot${Number.isFinite(since) && since > 0 ? `?since=${since}` : ""}`;
    const resp2 = await fetch(url2);
    if (!resp2.ok) {
      console.error(`GET ${url2} failed: ${resp2.status} ${await resp2.text()}`);
      process.exit(1);
    }
    const data = await resp2.json();
    const events = (Array.isArray(data?.events) ? data.events : []).filter(matches);
    if (flags.json) {
      process.stdout.write(JSON.stringify({ events, count: events.length, generatedAt: data?.generatedAt }, null, 2) + "\n");
      return;
    }
    if (events.length === 0) {
      console.log("[events snapshot] no events match filter");
      return;
    }
    for (const ev of events) {
      const ts = ev.at ? new Date(ev.at).toISOString() : "?";
      const detailKeys = ev.details ? Object.keys(ev.details).slice(0, 3).join(",") : "";
      console.log(`#${ev.id}  ${ts}  ${ev.kind}  pluginId=${ev.pluginId || "-"}` + (detailKeys ? `  details=${detailKeys}` : ""));
    }
    return;
  }
  if (sub === "purge") {
    const purgeFlags = parseFlags(rest.slice(1), {
      string: /* @__PURE__ */ new Set(["daemon-url"]),
      boolean: /* @__PURE__ */ new Set(["help", "h", "json", "confirm"])
    });
    if (!purgeFlags.confirm) {
      console.error("[events purge] refusing without --confirm. This drops every event in the in-memory buffer.");
      process.exit(2);
    }
    const resp2 = await fetch(`${base}/api/plugins/events/purge`, { method: "POST" });
    if (!resp2.ok) {
      console.error(`POST /api/plugins/events/purge failed: ${resp2.status} ${await resp2.text()}`);
      process.exit(1);
    }
    const data = await resp2.json();
    if (purgeFlags.json) {
      process.stdout.write(JSON.stringify(data, null, 2) + "\n");
    } else {
      console.log(`[events purge] dropped ${data.purged ?? 0} event${(data.purged ?? 0) === 1 ? "" : "s"} (id range: ${data.firstId ?? "(none)"} \u2192 ${data.lastId ?? "(none)"}; preNextId=${data.preNextId})`);
    }
    return;
  }
  if (sub === "stats") {
    const resp2 = await fetch(`${base}/api/plugins/events/stats`);
    if (!resp2.ok) {
      console.error(`GET /api/plugins/events/stats failed: ${resp2.status} ${await resp2.text()}`);
      process.exit(1);
    }
    const data = await resp2.json();
    if (flags.json) {
      process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      return;
    }
    const s = data?.stats ?? {};
    console.log("# Plugin events");
    console.log(`  total:           ${s.total ?? 0}`);
    console.log(`  by kind:         ${formatCounts(s.byKind)}`);
    console.log(`  by pluginId:     ${formatCounts(s.byPluginId)}`);
    console.log(`  oldest at:       ${formatTimestamp(s.oldestAt)}`);
    console.log(`  newest at:       ${formatTimestamp(s.newestAt)}`);
    console.log(`  id range:        ${s.firstId ?? "(none)"} \u2192 ${s.lastId ?? "(none)"}`);
    return;
  }
  if (sub !== "tail") {
    console.error(`unknown subcommand: od plugin events ${sub}`);
    process.exit(2);
  }
  const follow = flags.f === true || flags.follow === true;
  const url = `${base}/api/plugins/events${Number.isFinite(since) && since > 0 ? `?since=${since}` : ""}`;
  const resp = await fetch(url, { headers: { accept: "text/event-stream" } });
  if (!resp.ok || !resp.body) {
    console.error(`GET ${url} failed: ${resp.status} ${await resp.text()}`);
    process.exit(1);
  }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const renderEvent = (channel, data) => {
    if (!matches(data))
      return;
    if (flags.json) {
      process.stdout.write(JSON.stringify({ channel, ...data }) + "\n");
      return;
    }
    const ts = data?.at ? new Date(data.at).toISOString() : "?";
    const id = data?.id ?? "?";
    const tag = channel === "backlog" ? "[bk]" : "[ev]";
    const detailKeys = data?.details ? Object.keys(data.details).slice(0, 3).join(",") : "";
    console.log(`${tag} #${id}  ${ts}  ${data?.kind ?? "?"}  pluginId=${data?.pluginId ?? "-"}` + (detailKeys ? `  details=${detailKeys}` : ""));
  };
  if (!follow) {
    let lastChunkAt = Date.now();
    const idleMs = 200;
    const idleTimer = setInterval(() => {
      if (Date.now() - lastChunkAt > idleMs) {
        clearInterval(idleTimer);
        try {
          reader.cancel();
        } catch {
        }
      }
    }, 100);
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done)
          break;
        lastChunkAt = Date.now();
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() ?? "";
        for (const block of blocks) {
          const lines = block.split("\n");
          const ev = lines.find((l) => l.startsWith("event: "))?.slice("event: ".length) ?? "message";
          const dat = lines.find((l) => l.startsWith("data: "))?.slice("data: ".length);
          if (!dat)
            continue;
          try {
            renderEvent(ev, JSON.parse(dat));
          } catch {
          }
        }
      }
    } finally {
      clearInterval(idleTimer);
    }
    return;
  }
  while (true) {
    const { value, done } = await reader.read();
    if (done)
      break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";
    for (const block of blocks) {
      const lines = block.split("\n");
      const ev = lines.find((l) => l.startsWith("event: "))?.slice("event: ".length) ?? "message";
      const dat = lines.find((l) => l.startsWith("data: "))?.slice("data: ".length);
      if (!dat)
        continue;
      try {
        renderEvent(ev, JSON.parse(dat));
      } catch {
      }
    }
  }
}
async function runPluginVerify(rest) {
  const flags = parseFlags(rest, {
    string: /* @__PURE__ */ new Set([...PLUGIN_STRING_FLAGS, "config"]),
    boolean: PLUGIN_BOOLEAN_FLAGS
  });
  const positional = rest.filter((a) => !a.startsWith("-"));
  const id = positional[0];
  if (flags.help || flags.h || !id) {
    console.log(`Usage:
  od plugin verify <pluginId> [--config <path>] [--json]

CI meta-command. Reads an optional config from
'<plugin-folder>/.od-verify.json' (or --config <path>) and runs:

  doctor    \u2014 manifest + atom + ref lint
  simulate  \u2014 convergence dry-run for every until expression,
              with per-stage signals from config.simulate.signals
  canon     \u2014 byte-equality check against
              config.canon.fixturePath using the snapshot at
              config.canon.snapshotId

Sample .od-verify.json:

  {
    "enabled": ["doctor", "simulate"],
    "simulate": {
      "signals": { "critique.score": 5, "build.passing": true },
      "iterationCap": 5
    },
    "canon": {
      "snapshotId": "snap-abc",
      "fixturePath": "tests/expected-block.md"
    }
  }

Exit codes:
  0  every enabled check passed
  4  one or more enabled checks failed
  2  CLI usage error / plugin not found / config malformed`);
    process.exit(id ? 0 : 2);
  }
  const base = (await pluginDaemonUrl(flags)).replace(/\/$/, "");
  const pluginResp = await fetch(`${base}/api/plugins/${encodeURIComponent(id)}`);
  if (pluginResp.status === 404) {
    console.error(`plugin ${id} not found`);
    process.exit(65);
  }
  if (!pluginResp.ok) {
    console.error(`GET /api/plugins/${id} failed: ${pluginResp.status} ${await pluginResp.text()}`);
    process.exit(1);
  }
  const plugin = await pluginResp.json();
  const fs = await import("node:fs/promises");
  const path3 = await import("node:path");
  const configPath = typeof flags.config === "string" ? path3.resolve(flags.config) : typeof plugin?.fsPath === "string" ? path3.join(plugin.fsPath, ".od-verify.json") : null;
  let config = { enabled: ["doctor", "simulate", "canon"] };
  if (configPath) {
    try {
      const raw = await fs.readFile(configPath, "utf8");
      config = JSON.parse(raw);
    } catch (err) {
      const e = err;
      if (e?.code !== "ENOENT") {
        console.error(`[verify] cannot read config ${configPath}: ${e?.message ?? e}`);
        process.exit(2);
      }
    }
  }
  const enabledSet = new Set((config.enabled ?? ["doctor", "simulate", "canon"]).filter((c) => c === "doctor" || c === "simulate" || c === "canon"));
  let doctorReport = null;
  if (enabledSet.has("doctor")) {
    const doctorResp = await fetch(`${base}/api/plugins/${encodeURIComponent(id)}/doctor`);
    if (doctorResp.ok) {
      doctorReport = await doctorResp.json();
    }
  }
  let simulateReport = null;
  if (enabledSet.has("simulate")) {
    const pipeline = plugin?.manifest?.od?.pipeline;
    if (pipeline && Array.isArray(pipeline.stages) && pipeline.stages.length > 0) {
      const { simulatePipeline } = await import("./simulate-E3VZMYGU.mjs");
      simulateReport = simulatePipeline({
        pipeline,
        signals: config.simulate?.signals ?? {},
        ...typeof config.simulate?.iterationCap === "number" && config.simulate.iterationCap > 0 ? { iterationCap: config.simulate.iterationCap } : {}
      });
    }
  }
  let canonActual = null;
  let canonExpected = null;
  if (enabledSet.has("canon") && config.canon?.snapshotId && config.canon?.fixturePath) {
    const fixturePath = path3.resolve(typeof flags.config === "string" ? path3.dirname(path3.resolve(flags.config)) : typeof plugin?.fsPath === "string" ? plugin.fsPath : process.cwd(), config.canon.fixturePath);
    try {
      canonExpected = await fs.readFile(fixturePath, "utf8");
    } catch {
      canonExpected = null;
    }
    if (canonExpected !== null) {
      const canonResp = await fetch(`${base}/api/applied-plugins/${encodeURIComponent(config.canon.snapshotId)}/canon`, { headers: { accept: "text/plain" } });
      if (canonResp.ok) {
        canonActual = await canonResp.text();
      }
    }
  }
  const { verifyPlugin } = await import("./verify-4AF4MFDX.mjs");
  const report = verifyPlugin({
    config: {
      enabled: [...enabledSet],
      ...config.strict === true ? { strict: true } : {},
      ...config.simulate ? { simulate: config.simulate } : {},
      ...config.canon ? { canon: config.canon } : {}
    },
    ...doctorReport ? { doctor: doctorReport } : {},
    ...simulateReport ? { simulate: simulateReport } : {},
    ...canonActual ? { canon: canonActual } : {},
    ...canonExpected ? { canonExpected } : {}
  });
  if (flags.json) {
    process.stdout.write(JSON.stringify({ pluginId: id, ...report }, null, 2) + "\n");
  } else {
    console.log(`[verify] plugin ${id} \u2014 ${report.passed ? "PASSED" : "FAILED"}`);
    for (const o of report.outcomes) {
      const tag = o.status === "passed" ? "\u2713" : o.status === "failed" ? "\u2717" : o.status === "skipped" ? "-" : "!";
      console.log(`  ${tag} ${o.summary}`);
    }
  }
  process.exit(report.passed ? 0 : 4);
}
async function runPluginSimulate(rest) {
  const flags = parseFlags(rest, {
    string: /* @__PURE__ */ new Set([...PLUGIN_STRING_FLAGS, "s", "cap"]),
    boolean: PLUGIN_BOOLEAN_FLAGS
  });
  const positional = rest.filter((a) => !a.startsWith("-"));
  const id = positional[0];
  if (flags.help || flags.h || !id) {
    console.log(`Usage:
  od plugin simulate <pluginId> [-s key=value ...] [--cap <n>] [--json]

Walks the plugin's pipeline against caller-supplied signals and
reports per-stage convergence. No LLM is invoked.

Examples:
  # critique-theater stage that exits when score >= 4
  od plugin simulate my-plugin -s critique.score=5

  # build-test devloop where both signals must hold
  od plugin simulate code-migration \\
      -s build.passing=true -s tests.passing=true

  # raise the per-stage iteration cap (default 10)
  od plugin simulate my-plugin -s critique.score=2 --cap 20

Closed signal vocabulary:
  critique.score (number)
  iterations     (number)
  user.confirmed (boolean)
  preview.ok     (boolean)
  build.passing  (boolean)
  tests.passing  (boolean)`);
    process.exit(id ? 0 : 2);
  }
  const sValues = [];
  for (let i = 0; i < rest.length; i++) {
    if ((rest[i] === "-s" || rest[i] === "--signal") && typeof rest[i + 1] === "string") {
      sValues.push(rest[i + 1]);
    }
  }
  const base = (await pluginDaemonUrl(flags)).replace(/\/$/, "");
  const resp = await fetch(`${base}/api/plugins/${encodeURIComponent(id)}`);
  if (resp.status === 404) {
    console.error(`plugin ${id} not found`);
    process.exit(65);
  }
  if (!resp.ok) {
    console.error(`GET /api/plugins/${id} failed: ${resp.status} ${await resp.text()}`);
    process.exit(1);
  }
  const plugin = await resp.json();
  const pipeline = plugin?.manifest?.od?.pipeline;
  if (!pipeline || !Array.isArray(pipeline.stages) || pipeline.stages.length === 0) {
    if (flags.json) {
      process.stdout.write(JSON.stringify({ outcome: "no-pipeline", stages: [] }, null, 2) + "\n");
    } else {
      console.log(`[simulate] plugin ${id} has no od.pipeline (or it is empty); nothing to walk.`);
    }
    return;
  }
  const { simulatePipeline, parseSignalKv } = await import("./simulate-E3VZMYGU.mjs");
  const parsedSignals = parseSignalKv(sValues);
  for (const w of parsedSignals.warnings)
    console.warn(`[simulate] warn: ${w}`);
  const cap = typeof flags.cap === "string" ? Number(flags.cap) : void 0;
  const result = simulatePipeline({
    pipeline,
    signals: parsedSignals.signals,
    ...Number.isFinite(cap) && cap > 0 ? { iterationCap: cap } : {}
  });
  if (flags.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    return;
  }
  console.log(`[simulate] plugin ${id} \u2014 outcome: ${result.outcome}, totalIterations: ${result.totalIterations}`);
  for (const stage of result.stages) {
    const tag = stage.outcome === "converged" ? "\u2713" : stage.outcome === "cap" ? "\u2717" : stage.outcome === "unparsable" ? "!" : "\u2014";
    const reason = stage.reason ? `  (${stage.reason})` : "";
    const matched = stage.matched && stage.matched.length > 0 ? `  matched=[${stage.matched.map((c) => `${c.signal}${c.op}${c.value}`).join(" && ")}]` : "";
    console.log(`  ${tag} ${stage.stageId}: ${stage.outcome} (${stage.iterations} iter)${reason}${matched}`);
  }
  if (result.outcome === "cap-hit" || result.outcome === "unparsable")
    process.exit(4);
}
async function runPluginCanon(rest) {
  const flags = parseFlags(rest, {
    string: /* @__PURE__ */ new Set([...PLUGIN_STRING_FLAGS, "check"]),
    boolean: PLUGIN_BOOLEAN_FLAGS
  });
  const positional = rest.filter((a) => !a.startsWith("-"));
  const id = positional[0];
  if (flags.help || flags.h || !id) {
    console.log(`Usage:
  od plugin canon <snapshotId> [--json]
  od plugin canon <snapshotId> --check <expected-file>

Prints the canonical '## Active plugin' / '## Plugin inputs' /
'## Plugin atoms' block this snapshot would splice into the
system prompt. Default output is plain text; --json wraps the
block in { snapshotId, pluginId, block }.

--check <file> compares the canon output to the file's bytes and
exits 4 on mismatch. Useful for committing renderPluginBlock()
fixtures into a plugin's own tests/.`);
    process.exit(id ? 0 : 2);
  }
  const base = (await pluginDaemonUrl(flags)).replace(/\/$/, "");
  const url = `${base}/api/applied-plugins/${encodeURIComponent(id)}/canon`;
  const checkPath = typeof flags.check === "string" ? flags.check : null;
  const wantsText = !flags.json || checkPath !== null;
  const headers = { accept: wantsText ? "text/plain" : "application/json" };
  const resp = await fetch(url, { headers });
  if (resp.status === 404) {
    console.error(`snapshot ${id} not found`);
    process.exit(72);
  }
  if (!resp.ok) {
    console.error(`GET ${url} failed: ${resp.status} ${await resp.text()}`);
    process.exit(1);
  }
  if (checkPath) {
    const fs = await import("node:fs/promises");
    let expected;
    try {
      expected = await fs.readFile(checkPath, "utf8");
    } catch (err) {
      console.error(`[canon --check] cannot read ${checkPath}: ${err?.message ?? err}`);
      process.exit(2);
    }
    const actual = await resp.text();
    if (actual === expected) {
      console.log(`[canon] \u2713 byte-equal to ${checkPath}`);
      return;
    }
    console.error(`[canon --check] \u2717 mismatch with ${checkPath}`);
    console.error(`  expected length: ${expected.length} bytes`);
    console.error(`  actual length:   ${actual.length} bytes`);
    const expectedLines = expected.split("\n");
    const actualLines = actual.split("\n");
    const limit = Math.min(Math.max(expectedLines.length, actualLines.length), 40);
    for (let i = 0; i < limit; i++) {
      if (expectedLines[i] !== actualLines[i]) {
        console.error(`  line ${i + 1}:`);
        if (expectedLines[i] !== void 0)
          console.error(`    - ${expectedLines[i]}`);
        if (actualLines[i] !== void 0)
          console.error(`    + ${actualLines[i]}`);
      }
    }
    process.exit(4);
  }
  if (flags.json) {
    const data = await resp.json();
    process.stdout.write(JSON.stringify(data, null, 2) + "\n");
    return;
  }
  const body = await resp.text();
  process.stdout.write(body);
  if (!body.endsWith("\n"))
    process.stdout.write("\n");
}
async function runPluginDiff(rest) {
  const flags = parseFlags(rest, { string: PLUGIN_STRING_FLAGS, boolean: PLUGIN_BOOLEAN_FLAGS });
  const positional = rest.filter((a2) => !a2.startsWith("-"));
  if (flags.help || flags.h || positional.length < 2) {
    console.log(`Usage:
  od plugin diff <id-a> <id-b> [--json]

Compares two installed plugins (or two installs of the same id at
different versions) and prints every changed field. Output groups
into 'added' / 'removed' / 'changed' with one line per field.`);
    process.exit(positional.length < 2 ? 2 : 0);
  }
  const [idA, idB] = positional;
  const base = (await pluginDaemonUrl(flags)).replace(/\/$/, "");
  const [respA, respB] = await Promise.all([
    fetch(`${base}/api/plugins/${encodeURIComponent(idA)}`),
    fetch(`${base}/api/plugins/${encodeURIComponent(idB)}`)
  ]);
  if (!respA.ok) {
    console.error(`GET /api/plugins/${idA} failed: ${respA.status}`);
    process.exit(1);
  }
  if (!respB.ok) {
    console.error(`GET /api/plugins/${idB} failed: ${respB.status}`);
    process.exit(1);
  }
  const a = await respA.json();
  const b = await respB.json();
  const { diffPlugins } = await import("./diff-IYXQZC7O.mjs");
  const report = diffPlugins({ a, b });
  if (flags.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
    return;
  }
  if (report.entries.length === 0) {
    console.log(`[diff] ${idA} and ${idB} are equivalent on every recorded field.`);
    return;
  }
  console.log(`[diff] ${idA} \u2194 ${idB} \u2014 ${report.added} added, ${report.removed} removed, ${report.changed} changed`);
  for (const e of report.entries) {
    const tag = e.kind === "added" ? "+" : e.kind === "removed" ? "-" : "~";
    if (e.summary) {
      console.log(`  ${tag} ${e.field}  (${e.summary})`);
    } else if (e.kind === "changed") {
      console.log(`  ${tag} ${e.field}: ${e.before ?? ""} \u2192 ${e.after ?? ""}`);
    } else if (e.kind === "added") {
      console.log(`  ${tag} ${e.field}: ${e.after ?? ""}`);
    } else {
      console.log(`  ${tag} ${e.field}: ${e.before ?? ""}`);
    }
  }
}
async function runPluginUpgrade(rest) {
  const flags = parseFlags(rest, { string: PLUGIN_STRING_FLAGS, boolean: PLUGIN_BOOLEAN_FLAGS });
  const id = rest.find((a) => !a.startsWith("-") && a !== flags["daemon-url"] && a !== flags.source);
  if (!id) {
    console.error("Usage: od plugin upgrade <id> [--policy latest|pinned] [--json]");
    process.exit(2);
  }
  const url = `${(await pluginDaemonUrl(flags)).replace(/\/$/, "")}/api/plugins/${encodeURIComponent(id)}/upgrade`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "text/event-stream" },
    body: JSON.stringify({
      policy: flags.policy === "pinned" ? "pinned" : "latest"
    })
  });
  if (!resp.ok || !resp.body) {
    let msg = "";
    try {
      msg = await resp.text();
    } catch {
      msg = "";
    }
    console.error(`POST /api/plugins/${id}/upgrade failed: ${resp.status} ${msg}`);
    process.exit(1);
  }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let exitCode = 0;
  const events = [];
  let finalEvent = null;
  while (true) {
    const { value, done } = await reader.read();
    if (done)
      break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";
    for (const block of blocks) {
      const lines = block.split("\n");
      const eventLine = lines.find((l) => l.startsWith("event: "));
      const dataLine = lines.find((l) => l.startsWith("data: "));
      const event = eventLine ? eventLine.slice("event: ".length) : "message";
      const data = dataLine ? safeParseJson(dataLine.slice("data: ".length)) : null;
      events.push({ event, data });
      if (event === "progress") {
        if (!flags.json)
          console.log(`[upgrade] ${data?.phase ?? "..."}: ${data?.message ?? ""}`);
      } else if (event === "success") {
        finalEvent = data;
        if (!flags.json)
          console.log(`[upgrade] ok \u2014 ${data?.plugin?.id}@${data?.plugin?.version} (trust=${data?.plugin?.trust})`);
        if (!flags.json && Array.isArray(data?.warnings) && data.warnings.length > 0) {
          for (const w of data.warnings)
            console.log(`[upgrade] warn: ${w}`);
        }
      } else if (event === "error") {
        finalEvent = data;
        if (!flags.json)
          console.error(`[upgrade] error: ${data?.message ?? "unknown"}`);
        exitCode = 1;
      }
    }
  }
  if (flags.json) {
    process.stdout.write(JSON.stringify({
      ok: exitCode === 0,
      policy: flags.policy === "pinned" ? "pinned" : "latest",
      result: finalEvent,
      events
    }, null, 2) + "\n");
  }
  process.exit(exitCode);
}
async function runPluginUninstall(rest) {
  const flags = parseFlags(rest, { string: PLUGIN_STRING_FLAGS, boolean: PLUGIN_BOOLEAN_FLAGS });
  const id = rest.find((a) => !a.startsWith("-") && a !== flags["daemon-url"] && a !== flags.source);
  if (!id) {
    console.error("Usage: od plugin uninstall <id>");
    process.exit(2);
  }
  const url = `${(await pluginDaemonUrl(flags)).replace(/\/$/, "")}/api/plugins/${encodeURIComponent(id)}/uninstall`;
  const resp = await fetch(url, { method: "POST" });
  if (!resp.ok) {
    console.error(`POST /api/plugins/${id}/uninstall failed: ${resp.status} ${await resp.text()}`);
    process.exit(1);
  }
  const data = await resp.json();
  console.log(`[uninstall] ${data?.removedFolder ? "ok" : "no-op"}${data?.warning ? ` (warning: ${data.warning})` : ""}`);
}
async function runPluginApply(rest) {
  const flags = parseFlags(rest, { string: PLUGIN_STRING_FLAGS, boolean: PLUGIN_BOOLEAN_FLAGS });
  const id = rest.find((a) => !a.startsWith("-") && a !== flags["daemon-url"] && a !== flags.source && a !== flags.inputs && a !== flags.project && a !== flags["grant-caps"]);
  if (!id) {
    console.error("Usage: od plugin apply <id> [--inputs <json>] [--input k=v ...] [--project <id>] [--grant-caps a,b]");
    process.exit(2);
  }
  let inputs = {};
  if (typeof flags.inputs === "string" && flags.inputs.trim().length > 0) {
    try {
      inputs = JSON.parse(flags.inputs);
    } catch (err) {
      console.error(`--inputs must be valid JSON: ${err.message}`);
      process.exit(2);
    }
  }
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--input" && typeof rest[i + 1] === "string") {
      const kv = rest[i + 1];
      const eq = kv.indexOf("=");
      if (eq > 0) {
        const k = kv.slice(0, eq);
        const v = kv.slice(eq + 1);
        inputs[k] = coerceCliValue(v);
      }
      i += 1;
    }
  }
  const grantCaps = typeof flags["grant-caps"] === "string" && flags["grant-caps"].length > 0 ? flags["grant-caps"].split(",").map((c) => c.trim()).filter(Boolean) : [];
  const url = `${(await pluginDaemonUrl(flags)).replace(/\/$/, "")}/api/plugins/${encodeURIComponent(id)}/apply`;
  let resp;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ inputs, projectId: flags.project, grantCaps })
    });
  } catch (err) {
    return exitWithStructuredError({
      code: "daemon-not-running",
      message: `Cannot reach daemon at ${await pluginDaemonUrl(flags)}: ${err?.message ?? err}`
    });
  }
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    if (resp.status === 422 && Array.isArray(data?.fields)) {
      return exitWithStructuredError({
        code: "missing-input",
        message: `Plugin "${id}" is missing required inputs: ${data.fields.join(", ")}`,
        data: { pluginId: id, missing: data.fields }
      });
    }
    return structuredHttpFailure(resp);
  }
  if (flags.json) {
    process.stdout.write(JSON.stringify(data, null, 2) + "\n");
    return;
  }
  const snap = data?.appliedPlugin;
  if (snap) {
    console.log(`[apply] ${snap.pluginId}@${snap.pluginVersion} digest=${snap.manifestSourceDigest.slice(0, 12)}\u2026`);
    console.log(`[apply] context: ${(data.contextItems ?? []).map((c) => `${c.kind}:${c.id ?? c.name ?? c.path}`).join(", ")}`);
    if (Array.isArray(data.warnings) && data.warnings.length > 0) {
      for (const w of data.warnings)
        console.log(`[apply] warn: ${w}`);
    }
  } else {
    console.log(JSON.stringify(data));
  }
}
function coerceCliValue(raw) {
  if (raw === "true")
    return true;
  if (raw === "false")
    return false;
  if (/^-?\d+(\.\d+)?$/.test(raw))
    return Number(raw);
  return raw;
}
async function runPluginCandidates(rest) {
  const sub = rest[0];
  const args = rest.slice(1);
  const flags = parseFlags(args, {
    string: /* @__PURE__ */ new Set(["daemon-url", "project", "action"]),
    boolean: /* @__PURE__ */ new Set(["help", "h", "json", "include-dismissed"])
  });
  if (!sub || flags.help || flags.h) {
    console.log(`Usage:
  od plugin candidates list --project <projectId> [--json] [--include-dismissed]
  od plugin candidates draft <candidateId> --project <projectId> [--json]
  od plugin candidates dismiss <candidateId> --project <projectId> [--json]

Lists and formalizes persisted skill-to-plugin candidates.`);
    process.exit(!sub ? 2 : 0);
  }
  const projectId = typeof flags.project === "string" && flags.project.length > 0 ? flags.project : "";
  if (!projectId) {
    console.error("--project <projectId> is required");
    process.exit(2);
  }
  const base = (await pluginDaemonUrl(flags)).replace(/\/$/, "");
  if (sub === "list") {
    const qs = flags["include-dismissed"] ? "?includeDismissed=true" : "";
    const resp = await fetch(`${base}/api/projects/${encodeURIComponent(projectId)}/plugin-candidates${qs}`);
    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
      console.error(`GET plugin candidates failed: ${resp.status} ${JSON.stringify(data)}`);
      process.exit(1);
    }
    if (flags.json)
      return process.stdout.write(JSON.stringify(data, null, 2) + "\n");
    const candidates = Array.isArray(data?.candidates) ? data.candidates : [];
    if (candidates.length === 0) {
      console.log("No plugin candidates.");
      return;
    }
    for (const candidate of candidates) {
      console.log(`${candidate.id}	${candidate.status}	${candidate.title}	${candidate.draftPath ?? ""}`);
    }
    return;
  }
  const candidateId = args.find((a) => !a.startsWith("-") && a !== flags.project && a !== flags.action);
  if (!candidateId) {
    console.error(`candidate id is required for ${sub}`);
    process.exit(2);
  }
  if (sub === "draft") {
    const resp = await fetch(`${base}/api/projects/${encodeURIComponent(projectId)}/plugin-candidates/${encodeURIComponent(candidateId)}/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}"
    });
    const data = await resp.json().catch(() => null);
    if (flags.json) {
      process.stdout.write(JSON.stringify(data, null, 2) + "\n");
    } else if (resp.ok) {
      console.log(`[candidate] draft: ${data.draftPath}`);
      console.log(`[candidate] validation ok=${data.validation?.ok}`);
    } else {
      console.error(`[candidate] draft failed: ${data?.message ?? JSON.stringify(data)}`);
    }
    process.exit(resp.ok ? 0 : resp.status === 422 ? 4 : 1);
  }
  if (sub === "dismiss") {
    const resp = await fetch(`${base}/api/projects/${encodeURIComponent(projectId)}/plugin-candidates/${encodeURIComponent(candidateId)}/dismiss`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}"
    });
    const data = await resp.json().catch(() => null);
    if (flags.json)
      process.stdout.write(JSON.stringify(data, null, 2) + "\n");
    else if (resp.ok)
      console.log(`[candidate] dismissed ${candidateId}`);
    else
      console.error(`[candidate] dismiss failed: ${data?.message ?? JSON.stringify(data)}`);
    process.exit(resp.ok ? 0 : 1);
  }
  console.error(`unknown subcommand: od plugin candidates ${sub}`);
  process.exit(2);
}
async function runPluginPublish(rest) {
  const flags = parseFlags(rest, {
    string: /* @__PURE__ */ new Set(["daemon-url", "to", "snapshot-id", "repo", "catalog"]),
    boolean: /* @__PURE__ */ new Set(["help", "h", "json", "open"])
  });
  if (rest.length === 0 || flags.help || flags.h) {
    console.log(`Usage:
  od plugin publish <pluginId> --to open-design|anthropics-skills|awesome-agent-skills|clawhub|skills-sh
                    [--repo <github-url>] [--snapshot-id <id>] [--open] [--json]
  od plugin publish <pluginId> --to marketplace-json --catalog ./open-design-marketplace.json --repo <github-url>

The CLI prints the catalog's submission URL + a pre-filled PR body.
Pass --open to auto-launch the system browser. Use --snapshot-id to
publish from a frozen run snapshot rather than the live installed copy.`);
    process.exit(rest.length === 0 ? 2 : 0);
  }
  const id = rest.find((a) => !a.startsWith("-") && a !== flags.to && a !== flags.repo && a !== flags["snapshot-id"]);
  const target = String(flags.to ?? "");
  if (!id) {
    console.error("Usage: od plugin publish <pluginId> --to <catalog>");
    process.exit(2);
  }
  if (!target) {
    console.error("--to <catalog> is required (one of: open-design, anthropics-skills, awesome-agent-skills, clawhub, skills-sh)");
    process.exit(2);
  }
  const base = (await pluginDaemonUrl(flags)).replace(/\/$/, "");
  let meta = { pluginId: id, pluginVersion: "0.0.0" };
  try {
    const resp = await fetch(`${base}/api/plugins/${encodeURIComponent(id)}`);
    if (resp.ok) {
      const row = await resp.json();
      const storedVersion = typeof row.version === "string" && row.version.length > 0 ? row.version : null;
      const manifestVersion = typeof row.manifest?.version === "string" && row.manifest.version.length > 0 ? row.manifest.version : null;
      const resolvedVersion = storedVersion && storedVersion !== "0.0.0" ? storedVersion : manifestVersion ?? storedVersion ?? "0.0.0";
      meta = {
        pluginId: row.id ?? id,
        pluginVersion: resolvedVersion,
        ...row.title ? { pluginTitle: row.title } : {},
        ...row.manifest?.description ? { pluginDescription: row.manifest.description } : {}
      };
    }
  } catch {
  }
  if (typeof flags.repo === "string" && flags.repo.length > 0) {
    meta.repoUrl = flags.repo;
  }
  if (target === "marketplace-json") {
    if (typeof flags.catalog !== "string" || flags.catalog.length === 0) {
      console.error("--catalog <path> is required for --to marketplace-json");
      process.exit(2);
    }
    if (!meta.repoUrl) {
      console.error("--repo <github-url> is required for --to marketplace-json so the source can be reproduced");
      process.exit(2);
    }
    const outcome = await publishToMarketplaceJson({
      catalogPath: flags.catalog,
      meta
    });
    if (flags.json) {
      process.stdout.write(JSON.stringify(outcome, null, 2) + "\n");
    } else {
      console.log(`[publish] updated ${outcome.catalogPath}`);
      console.log(`[publish] ${outcome.entry.name}@${outcome.entry.version} -> ${outcome.entry.source}`);
    }
    return;
  }
  const { buildPublishLink, PublishError } = await import("./publish-D7UUVW7T.mjs");
  let link;
  try {
    link = buildPublishLink({ catalog: target, meta });
  } catch (err) {
    if (err instanceof PublishError) {
      console.error(`[publish] ${err.message}`);
      process.exit(2);
    }
    throw err;
  }
  if (flags.json) {
    process.stdout.write(JSON.stringify(link, null, 2) + "\n");
  } else {
    console.log(`[publish] ${link.catalogLabel}`);
    console.log(link.url);
    console.log("---");
    console.log(link.prBody);
  }
  if (flags.open) {
    const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
    const { spawn } = await import("node:child_process");
    spawn(opener, [link.url], { detached: true, stdio: "ignore" }).unref();
  }
}
async function runPluginPublishRepo(rest) {
  const flags = parseFlags(rest, {
    string: /* @__PURE__ */ new Set(["host", "owner"]),
    boolean: /* @__PURE__ */ new Set(["help", "h", "json", "dry-run"])
  });
  if (rest.length === 0 || flags.help || flags.h) {
    console.log(`Usage:
  od plugin publish-repo <folder> [--host github.com] [--owner github-login-or-org] [--dry-run] [--json]

Creates or updates the public GitHub repository named by the plugin manifest.
If plugin.repo is missing or uses a placeholder owner, the CLI resolves the
target from --owner, a trusted manifest owner, local gh auth status, then the
GitHub API as a last resort. It never publishes to placeholder owners.`);
    process.exit(rest.length === 0 ? 2 : 0);
  }
  const folder = rest.find((a) => !a.startsWith("-") && a !== flags.host && a !== flags.owner);
  if (!folder) {
    console.error("Usage: od plugin publish-repo <folder>");
    process.exit(2);
  }
  const [{ resolve, join }, { readFile: readFile3, writeFile, stat, mkdtemp, readdir, rm, mkdir, cp }, { pathToFileURL }, os] = await Promise.all([
    import("node:path"),
    import("node:fs/promises"),
    import("node:url"),
    import("node:os")
  ]);
  const absFolder = resolve(process.cwd(), folder);
  const manifestPath = resolve(absFolder, "open-design.json");
  const manifest = JSON.parse(await readFile3(manifestPath, "utf8"));
  const host = typeof flags.host === "string" ? flags.host : "github.com";
  const target = await resolvePluginGithubTarget({ host, owner: flags.owner, manifest, purpose: "publish-repo" });
  const normalized = normalizeManifestRepoForOwner(manifest, target.owner);
  if (normalized.changed && !flags["dry-run"]) {
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}
`, "utf8");
    await pluginCliValidateFolder(absFolder);
  }
  const repo = parseGithubRepoUrl(normalized.repoUrl);
  if (!repo) {
    console.error(`[publish-repo] invalid plugin.repo after normalization: ${normalized.repoUrl}`);
    process.exit(2);
  }
  const steps = [];
  const run = async (label, command, args, opts = {}) => {
    steps.push({ label, command: [command, ...args].join(" ") });
    if (flags["dry-run"])
      return { ok: true, stdout: "", stderr: "" };
    const result = await (command === "gh" ? execGhBuffered(args, { cwd: opts.cwd ?? absFolder, timeout: opts.timeout ?? 12e4 }) : execFileBuffered(command, args, { cwd: opts.cwd ?? absFolder, timeout: opts.timeout ?? 12e4 }));
    steps[steps.length - 1].ok = result.ok;
    steps[steps.length - 1].stdout = result.stdout;
    steps[steps.length - 1].stderr = result.stderr;
    if (!result.ok) {
      emitPluginWorkflowResult(flags, {
        ok: false,
        action: "publish-repo",
        folder: absFolder,
        repoUrl: normalized.repoUrl,
        login: target.login,
        owner: target.owner,
        ownerSource: target.ownerSource,
        apiRateLimited: target.apiRateLimited,
        steps,
        error: { label, stdout: result.stdout, stderr: result.stderr, code: result.code }
      });
      process.exit(1);
    }
    return result;
  };
  let exists = false;
  const view = flags["dry-run"] ? { ok: false, stderr: "dry-run" } : await execGhBuffered(["repo", "view", repo.fullName], { cwd: absFolder, timeout: 3e4 });
  steps.push({ label: "check repo", command: `gh repo view ${repo.fullName}`, ok: view.ok, stdout: view.stdout, stderr: view.stderr });
  if (view.ok) {
    exists = true;
  } else if (!flags["dry-run"] && !isRepoNotFound(view)) {
    emitPluginWorkflowResult(flags, {
      ok: false,
      action: "publish-repo",
      folder: absFolder,
      repoUrl: normalized.repoUrl,
      login: target.login,
      owner: target.owner,
      ownerSource: target.ownerSource,
      apiRateLimited: target.apiRateLimited,
      steps,
      error: { label: "check repo", stdout: view.stdout, stderr: view.stderr, code: view.code }
    });
    process.exit(1);
  }
  let workdir = absFolder;
  let cleanupDir = null;
  if (exists && !flags["dry-run"]) {
    cleanupDir = await mkdtemp(join(os.tmpdir(), "od-plugin-publish-sync-"));
    workdir = join(cleanupDir, repo.name);
    await run("clone repo", "gh", ["repo", "clone", repo.fullName, workdir], { cwd: cleanupDir, timeout: 24e4 });
    for (const entry of await readdir(workdir)) {
      if (entry === ".git")
        continue;
      await rm(join(workdir, entry), { recursive: true, force: true });
    }
    await mkdir(workdir, { recursive: true });
    for (const entry of await readdir(absFolder)) {
      if (entry === ".git")
        continue;
      await cp(join(absFolder, entry), join(workdir, entry), { recursive: true, force: true });
    }
  } else if (!flags["dry-run"]) {
    let hasGit = false;
    try {
      await stat(resolve(absFolder, ".git"));
      hasGit = true;
    } catch {
    }
    if (!hasGit)
      await run("git init", "git", ["init"]);
  }
  await run("git add", "git", ["add", "-A"], { cwd: workdir });
  const status = flags["dry-run"] ? { stdout: "dry-run" } : await execFileBuffered("git", ["status", "--porcelain"], { cwd: workdir });
  if (status.stdout.trim().length > 0 || !exists) {
    const commitMessage = exists ? `Update: ${manifest.name} v${manifest.version ?? "0.0.0"}` : `Initial commit: ${manifest.name} v${manifest.version ?? "0.0.0"}`;
    await run("git commit", "git", ["commit", "-m", commitMessage], { cwd: workdir });
  }
  const tag = `v${manifest.version ?? "0.0.0"}`;
  if (!flags["dry-run"]) {
    const localTag = await execFileBuffered("git", ["rev-parse", "-q", "--verify", `refs/tags/${tag}`], { cwd: workdir });
    if (!localTag.ok)
      await run("git tag", "git", ["tag", tag], { cwd: workdir });
  }
  if (exists) {
    await run("git push", "git", ["push", "origin", "HEAD"], { cwd: workdir });
  } else {
    await run("gh repo create", "gh", [
      "repo",
      "create",
      repo.fullName,
      "--public",
      "--source",
      ".",
      "--push",
      "--description",
      String(manifest.description ?? "")
    ], { cwd: workdir });
  }
  await run("git push tags", "git", ["push", "--tags"], { cwd: workdir });
  const verify = flags["dry-run"] ? { ok: true, stdout: JSON.stringify({ nameWithOwner: repo.fullName, url: normalized.repoUrl }) } : await run("verify repo", "gh", ["repo", "view", repo.fullName, "--json", "url,nameWithOwner"], { cwd: workdir });
  const parsedVerify = safeJson(verify.stdout);
  if (cleanupDir && !flags["dry-run"]) {
    await rm(cleanupDir, { recursive: true, force: true }).catch(() => void 0);
  }
  emitPluginWorkflowResult(flags, {
    ok: true,
    action: "publish-repo",
    folder: absFolder,
    login: target.login,
    owner: target.owner,
    ownerSource: target.ownerSource,
    apiRateLimited: target.apiRateLimited,
    repoUrl: parsedVerify?.url ?? normalized.repoUrl,
    manifestRewritten: normalized.changed,
    manifestPath: pathToFileURL(manifestPath).pathname,
    steps
  });
}
async function runPluginOpenDesignPr(rest) {
  const flags = parseFlags(rest, {
    string: /* @__PURE__ */ new Set(["host", "owner"]),
    boolean: /* @__PURE__ */ new Set(["help", "h", "json", "dry-run"])
  });
  if (rest.length === 0 || flags.help || flags.h) {
    console.log(`Usage:
  od plugin open-design-pr <folder> [--host github.com] [--owner github-login-or-fork-owner] [--dry-run] [--json]

Copies a local plugin folder into plugins/community/<name>/ on the author's
fork of nexu-io/open-design, pushes a branch, and opens the PR form with --web.`);
    process.exit(rest.length === 0 ? 2 : 0);
  }
  const folder = rest.find((a) => !a.startsWith("-") && a !== flags.host && a !== flags.owner);
  if (!folder) {
    console.error("Usage: od plugin open-design-pr <folder>");
    process.exit(2);
  }
  const [{ resolve, join }, fsp, os] = await Promise.all([
    import("node:path"),
    import("node:fs/promises"),
    import("node:os")
  ]);
  const absFolder = resolve(process.cwd(), folder);
  const manifestPath = resolve(absFolder, "open-design.json");
  const manifest = JSON.parse(await fsp.readFile(manifestPath, "utf8"));
  const host = typeof flags.host === "string" ? flags.host : "github.com";
  const target = await resolvePluginGithubTarget({ host, owner: flags.owner, manifest, purpose: "open-design-pr" });
  const name = String(manifest.name ?? "").trim();
  if (!name) {
    console.error("[open-design-pr] manifest.name is required");
    process.exit(2);
  }
  const title = String(manifest.title ?? name).trim();
  const branch = `plugin/${name}-${Math.floor(Date.now() / 1e3)}`;
  const tmpRoot = await fsp.mkdtemp(join(os.tmpdir(), "od-open-design-pr-"));
  const checkout = join(tmpRoot, "open-design");
  const steps = [];
  const run = async (label, command, args, opts = {}) => {
    steps.push({ label, command: [command, ...args].join(" ") });
    if (flags["dry-run"])
      return { ok: true, stdout: "", stderr: "" };
    const result = await (command === "gh" ? execGhBuffered(args, { cwd: opts.cwd ?? process.cwd(), timeout: opts.timeout ?? 18e4 }) : execFileBuffered(command, args, { cwd: opts.cwd ?? process.cwd(), timeout: opts.timeout ?? 18e4 }));
    steps[steps.length - 1].ok = result.ok;
    steps[steps.length - 1].stdout = result.stdout;
    steps[steps.length - 1].stderr = result.stderr;
    if (!result.ok && !opts.tolerate?.(result)) {
      emitPluginWorkflowResult(flags, {
        ok: false,
        action: "open-design-pr",
        folder: absFolder,
        login: target.login,
        owner: target.owner,
        ownerSource: target.ownerSource,
        apiRateLimited: target.apiRateLimited,
        branch,
        steps,
        error: { label, stdout: result.stdout, stderr: result.stderr, code: result.code }
      });
      process.exit(1);
    }
    return result;
  };
  await run("fork", "gh", ["repo", "fork", "nexu-io/open-design"], {
    tolerate: (r) => /already exists|existing fork/i.test(`${r.stdout}
${r.stderr}`)
  });
  await run("clone fork", "git", [
    "clone",
    "--depth",
    "1",
    "--single-branch",
    "--branch",
    "main",
    "--filter=blob:none",
    "--sparse",
    `https://github.com/${target.owner}/open-design.git`,
    checkout
  ], { timeout: 24e4 });
  await run("sparse checkout", "git", ["sparse-checkout", "set", "plugins/community"], { cwd: checkout });
  await run("checkout branch", "git", ["checkout", "-b", branch], { cwd: checkout });
  const dest = join(checkout, "plugins", "community", name);
  if (!flags["dry-run"]) {
    await fsp.rm(dest, { recursive: true, force: true });
    await fsp.mkdir(dest, { recursive: true });
    await fsp.cp(absFolder, dest, { recursive: true, force: true, filter: (src) => !src.includes(`${absFolder}/.git`) });
  }
  await run("git add", "git", ["add", `plugins/community/${name}`], { cwd: checkout });
  await run("git commit", "git", ["commit", "-m", `Add ${title} plugin`], { cwd: checkout });
  await run("git push branch", "git", ["push", "-u", "origin", branch], { cwd: checkout });
  const body = [
    `Add ${title} (${name}) plugin.`,
    "",
    `Version: ${manifest.version ?? "0.0.0"}`,
    manifest.description ? `Description: ${manifest.description}` : ""
  ].filter(Boolean).join("\n");
  const pr = await run("open PR form", "gh", [
    "pr",
    "create",
    "--repo",
    "nexu-io/open-design",
    "--head",
    `${target.owner}:${branch}`,
    "--base",
    "main",
    "--title",
    `Add ${title} plugin`,
    "--body",
    body,
    "--web"
  ], { cwd: checkout });
  const prUrl = extractFirstUrl(pr.stdout || pr.stderr) ?? `https://github.com/${target.owner}/open-design/pull/new/${branch}`;
  emitPluginWorkflowResult(flags, {
    ok: true,
    action: "open-design-pr",
    folder: absFolder,
    login: target.login,
    owner: target.owner,
    ownerSource: target.ownerSource,
    apiRateLimited: target.apiRateLimited,
    branch,
    prUrl,
    checkout,
    steps
  });
}
async function publishToMarketplaceJson({ catalogPath, meta }) {
  const [{ dirname, resolve }, { mkdir, readFile: readFile3, writeFile }, { PublishError, upsertMarketplaceJsonEntry }] = await Promise.all([
    import("node:path"),
    import("node:fs/promises"),
    import("./publish-D7UUVW7T.mjs")
  ]);
  const resolvedPath = resolve(process.cwd(), catalogPath);
  let existing = null;
  try {
    existing = JSON.parse(await readFile3(resolvedPath, "utf8"));
  } catch (err) {
    if (err?.code !== "ENOENT") {
      throw err;
    }
  }
  let outcome;
  try {
    outcome = upsertMarketplaceJsonEntry({ manifest: existing, meta });
  } catch (err) {
    if (err instanceof PublishError) {
      console.error(`[publish] ${err.message}`);
      process.exit(2);
    }
    throw err;
  }
  await mkdir(dirname(resolvedPath), { recursive: true });
  await writeFile(resolvedPath, `${JSON.stringify(outcome.manifest, null, 2)}
`, "utf8");
  return {
    catalogPath: resolvedPath,
    inserted: outcome.inserted,
    entry: outcome.entry,
    manifest: {
      name: outcome.manifest.name,
      version: outcome.manifest.version,
      plugins: outcome.manifest.plugins.length
    }
  };
}
async function resolvePluginGithubTarget({ host = "github.com", owner, manifest, purpose }) {
  const version = await execGhBuffered(["--version"], { timeout: 1e4 });
  if (!version.ok) {
    console.error("[plugin github] GitHub CLI is required. Install gh from https://cli.github.com/ and retry.");
    process.exit(1);
  }
  let status = await execGhBuffered(["auth", "status", "--hostname", host, "--active"], { timeout: 1e4 });
  if (!status.ok && /unknown flag: --active/i.test(`${status.stdout}
${status.stderr}`)) {
    status = await execGhBuffered(["auth", "status", "--hostname", host], { timeout: 1e4 });
  }
  if (!status.ok) {
    console.error(`[plugin github] gh is not authenticated for ${host}.`);
    if (status.stderr || status.stdout)
      console.error(status.stderr || status.stdout);
    console.error("Run: gh auth login -h github.com -s repo,workflow");
    process.exit(1);
  }
  const manifestRepo = parseGithubRepoUrl(typeof manifest?.plugin?.repo === "string" ? manifest.plugin.repo.trim() : "");
  const trustedManifestOwner = purpose === "publish-repo" && manifestRepo && !isPlaceholderRepoOwner(manifestRepo.owner) ? manifestRepo.owner : "";
  const explicitOwner = typeof owner === "string" ? owner.trim() : "";
  if (explicitOwner && isPlaceholderRepoOwner(explicitOwner)) {
    console.error(`[plugin github] refusing placeholder owner "${explicitOwner}". Pass a real GitHub login or org.`);
    process.exit(2);
  }
  const statusLogin = parseGhAuthStatusLogin(status.stderr || status.stdout);
  let login = statusLogin;
  let resolvedOwner = explicitOwner || trustedManifestOwner || statusLogin;
  let source = explicitOwner ? "--owner" : trustedManifestOwner ? "plugin.repo" : statusLogin ? "gh auth status" : "";
  let apiError = null;
  if (!resolvedOwner || !login) {
    const user = await execGhBuffered(["api", "user", "--hostname", host, "--jq", ".login"], { timeout: 2e4 });
    if (user.ok && user.stdout.trim()) {
      login = user.stdout.trim();
      if (!resolvedOwner) {
        resolvedOwner = login;
        source = "gh api user";
      }
    } else {
      apiError = user;
    }
  }
  if (!resolvedOwner) {
    console.error(`[plugin github] could not resolve the GitHub owner for ${purpose}.`);
    if (apiError?.stderr || apiError?.stdout)
      console.error(apiError.stderr || apiError.stdout);
    if (apiError && isGhApiRateLimit(apiError)) {
      const ownerHint = purpose === "open-design-pr" ? "<github-login-or-fork-owner>" : "<github-login-or-org>";
      console.error(`GitHub API is rate limited. Re-run with --owner ${ownerHint}, or authenticate/refresh gh and retry.`);
    } else {
      console.error("Run: gh auth refresh -h github.com -s repo,workflow");
      console.error("Or:  gh auth login -h github.com -s repo,workflow");
      console.error(purpose === "open-design-pr" ? "If the fork owner differs from your auth login, pass --owner <github-login-or-fork-owner>." : "If this is an org-owned plugin, pass --owner <github-org>.");
    }
    process.exit(1);
  }
  if (apiError && isGhApiRateLimit(apiError)) {
    console.warn("[plugin github] GitHub API is rate limited; continuing with the owner resolved locally.");
  }
  if (isPlaceholderRepoOwner(resolvedOwner)) {
    console.error(`[plugin github] refusing placeholder owner "${resolvedOwner}". Pass --owner <github-login-or-org>.`);
    process.exit(2);
  }
  return {
    host,
    login: login || resolvedOwner,
    owner: resolvedOwner,
    ownerSource: source,
    apiRateLimited: Boolean(apiError && isGhApiRateLimit(apiError)),
    version: version.stdout,
    status: status.stderr || status.stdout
  };
}
function parseGhAuthStatusLogin(output) {
  const text = String(output ?? "");
  const activeAccount = /Logged in to [^\s]+ account ([^\s()]+)/i.exec(text);
  if (activeAccount?.[1])
    return activeAccount[1].trim();
  const tokenAccount = /Token account:\s*([^\s()]+)/i.exec(text);
  if (tokenAccount?.[1])
    return tokenAccount[1].trim();
  return "";
}
function isGhApiRateLimit(result) {
  const text = `${result?.stdout ?? ""}
${result?.stderr ?? ""}`;
  return /rate limit exceeded|authenticated requests get a higher rate limit/i.test(text);
}
function normalizeManifestRepoForOwner(manifest, owner) {
  const name = String(manifest?.name ?? "").trim();
  if (!name) {
    console.error("[plugin repo] manifest.name is required");
    process.exit(2);
  }
  const rawRepo = typeof manifest?.plugin?.repo === "string" ? manifest.plugin.repo.trim() : "";
  const parsed = parseGithubRepoUrl(rawRepo);
  const placeholder = parsed ? isPlaceholderRepoOwner(parsed.owner) : false;
  const shouldRewrite = !parsed || placeholder || parsed.name.toLowerCase() !== name.toLowerCase() || parsed.owner.toLowerCase() !== owner.toLowerCase();
  const repoUrl = shouldRewrite ? `https://github.com/${owner}/${name}` : parsed.url;
  if (shouldRewrite) {
    if (!manifest.plugin || typeof manifest.plugin !== "object")
      manifest.plugin = {};
    manifest.plugin.repo = repoUrl;
    manifest.homepage = repoUrl;
    if (!manifest.author || typeof manifest.author !== "object")
      manifest.author = {};
    manifest.author.url = `https://github.com/${owner}`;
  }
  return {
    changed: shouldRewrite,
    repoUrl,
    previousRepoUrl: rawRepo || null
  };
}
function parseGithubRepoUrl(raw) {
  if (!raw || typeof raw !== "string")
    return null;
  const trimmed = raw.trim().replace(/\.git$/i, "");
  let owner = "";
  let name = "";
  try {
    const url = new URL(trimmed);
    if (!/^github\.com$/i.test(url.hostname))
      return null;
    const parts = url.pathname.split("/").filter(Boolean);
    owner = parts[0] ?? "";
    name = parts[1] ?? "";
  } catch {
    const match = /^([^/\s]+)\/([^/\s]+)$/.exec(trimmed);
    if (!match)
      return null;
    owner = match[1];
    name = match[2];
  }
  if (!owner || !name)
    return null;
  return {
    owner,
    name,
    fullName: `${owner}/${name}`,
    url: `https://github.com/${owner}/${name}`
  };
}
function isPlaceholderRepoOwner(owner) {
  return /^(open-design-user|<vendor>|vendor|example-user|your-org|your-username|owner|user|username)$/i.test(String(owner ?? "").trim());
}
function isRepoNotFound(result) {
  const text = `${result?.stdout ?? ""}
${result?.stderr ?? ""}`;
  return /could not resolve to a repository|not found|repository not found/i.test(text);
}
async function pluginCliValidateFolder(folder) {
  const result = await execFileBuffered(process.execPath, [process.argv[1], "plugin", "validate", folder], {
    timeout: 12e4
  });
  if (!result.ok) {
    console.error("[plugin validate] failed after manifest normalization");
    if (result.stdout)
      console.error(result.stdout);
    if (result.stderr)
      console.error(result.stderr);
    process.exit(1);
  }
  return result;
}
function emitPluginWorkflowResult(flags, payload) {
  if (flags.json) {
    process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
    return;
  }
  if (!payload.ok) {
    console.error(`[${payload.action}] failed${payload.error?.label ? ` at ${payload.error.label}` : ""}`);
    if (payload.error?.stderr)
      console.error(payload.error.stderr);
    if (payload.error?.stdout)
      console.error(payload.error.stdout);
    return;
  }
  if (payload.action === "publish-repo") {
    console.log(`Plugin published: ${payload.repoUrl}`);
    if (payload.ownerSource)
      console.log(`[publish-repo] owner resolved from ${payload.ownerSource}: ${payload.owner}`);
    if (payload.apiRateLimited)
      console.log("[publish-repo] GitHub API was rate limited; continued with the locally resolved owner.");
    if (payload.manifestRewritten)
      console.log("[publish-repo] manifest repo fields were normalized before publishing.");
    return;
  }
  if (payload.action === "open-design-pr") {
    if (payload.ownerSource)
      console.log(`[open-design-pr] owner resolved from ${payload.ownerSource}: ${payload.owner}`);
    if (payload.apiRateLimited)
      console.log("[open-design-pr] GitHub API was rate limited; continued with the locally resolved owner.");
    console.log(`Open this URL and click Create to file the PR: ${payload.prUrl}`);
    return;
  }
  console.log(JSON.stringify(payload, null, 2));
}
function safeJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function extractFirstUrl(text) {
  const match = /https?:\/\/\S+/i.exec(String(text ?? ""));
  return match ? match[0].replace(/[)\].,]+$/, "") : null;
}
async function runPluginYank(rest) {
  const flags = parseFlags(rest, {
    string: /* @__PURE__ */ new Set(["daemon-url", "reason", "to"]),
    boolean: /* @__PURE__ */ new Set(["help", "h", "json", "open"])
  });
  if (rest.length === 0 || flags.help || flags.h) {
    console.log(`Usage:
  od plugin yank <vendor/plugin-name>@<version> --reason "<why>" [--to open-design] [--json]

Yanking never deletes metadata or bytes. It opens the registry review flow that
marks a version unresolvable for new installs while preserving lockfile replay.`);
    process.exit(rest.length === 0 ? 2 : 0);
  }
  const spec = rest.find((a) => !a.startsWith("-") && a !== flags.reason && a !== flags.to);
  const reason = typeof flags.reason === "string" ? flags.reason.trim() : "";
  const parsed = parseCliPluginSpecifier(spec);
  if (!parsed.name || !parsed.range) {
    console.error('Usage: od plugin yank <vendor/plugin-name>@<version> --reason "<why>"');
    process.exit(2);
  }
  if (!reason) {
    console.error("--reason is required for yanking");
    process.exit(2);
  }
  const target = flags.to ?? "open-design";
  if (target !== "open-design") {
    console.error("Only --to open-design is supported in this v1 GitHub-backed yank flow.");
    process.exit(2);
  }
  const title = `Yank ${parsed.name}@${parsed.range}`;
  const body = [
    `## Yank ${parsed.name}@${parsed.range}`,
    "",
    `Reason: ${reason}`,
    "",
    "Expected registry patch:",
    "",
    "```json",
    JSON.stringify({
      name: parsed.name,
      version: parsed.range,
      yanked: true,
      yankReason: reason
    }, null, 2),
    "```",
    "",
    "Generated by `od plugin yank`."
  ].join("\n");
  const params = new URLSearchParams({ title, body });
  const payload = {
    catalog: "open-design",
    name: parsed.name,
    version: parsed.range,
    reason,
    url: `https://github.com/nexu-io/open-design/issues/new?${params.toString()}`,
    body
  };
  if (flags.json) {
    process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
  } else {
    console.log(`[yank] ${payload.url}`);
    console.log("---");
    console.log(body);
  }
  if (flags.open) {
    const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
    const { spawn } = await import("node:child_process");
    spawn(opener, [payload.url], { detached: true, stdio: "ignore" }).unref();
  }
}
async function runPluginDoctor(rest) {
  const flags = parseFlags(rest, {
    string: PLUGIN_STRING_FLAGS,
    boolean: /* @__PURE__ */ new Set([...PLUGIN_BOOLEAN_FLAGS, "strict"])
  });
  const id = rest.find((a) => !a.startsWith("-") && a !== flags["daemon-url"] && a !== flags.source);
  if (!id) {
    console.error("Usage: od plugin doctor <id> [--strict] [--json]");
    process.exit(2);
  }
  const url = `${(await pluginDaemonUrl(flags)).replace(/\/$/, "")}/api/plugins/${encodeURIComponent(id)}/doctor`;
  const resp = await fetch(url, { method: "POST" });
  if (!resp.ok) {
    console.error(`POST /api/plugins/${id}/doctor failed: ${resp.status} ${await resp.text()}`);
    process.exit(1);
  }
  const data = await resp.json();
  const issues = Array.isArray(data?.issues) ? data.issues : [];
  const warnings = issues.filter((i) => i?.severity === "warning");
  const strict = flags.strict === true;
  const passed = data.ok && (!strict || warnings.length === 0);
  if (flags.json) {
    process.stdout.write(JSON.stringify({ ...data, strict, passed }, null, 2) + "\n");
  } else {
    if (passed && issues.length === 0) {
      console.log(`[doctor] ${data.pluginId} ok (digest ${data.freshDigest.slice(0, 12)}\u2026)`);
    } else {
      const tier = !data.ok ? "errors" : strict && warnings.length > 0 ? "warnings (--strict)" : "warnings";
      console.log(`[doctor] ${data.pluginId} ${tier}:`);
      for (const issue of issues) {
        console.log(`  [${issue.severity}] ${issue.code}: ${issue.message}`);
      }
    }
  }
  process.exit(passed ? 0 : data.ok ? 4 : 1);
}
function safeParseJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
async function runPluginReplay(rest) {
  const flags = parseFlags(rest, { string: PLUGIN_STRING_FLAGS, boolean: PLUGIN_BOOLEAN_FLAGS });
  const runId = rest.find((a) => !a.startsWith("-") && a !== flags["daemon-url"] && a !== flags.source && a !== flags.inputs && a !== flags.project && a !== flags["snapshot-id"] && a !== flags.capabilities);
  if (!runId) {
    console.error("Usage: od plugin replay <runId> --snapshot-id <id>");
    process.exit(2);
  }
  const snapshotId = flags["snapshot-id"];
  if (!snapshotId) {
    console.error("--snapshot-id is required (runs are in-memory in Phase 2A; pass the snapshot id returned by od plugin apply)");
    process.exit(2);
  }
  const url = `${(await pluginDaemonUrl(flags)).replace(/\/$/, "")}/api/runs/${encodeURIComponent(runId)}/replay`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ snapshotId })
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    console.error(`POST /api/runs/${runId}/replay failed: ${resp.status} ${JSON.stringify(data)}`);
    process.exit(1);
  }
  if (flags.json) {
    process.stdout.write(JSON.stringify(data, null, 2) + "\n");
    return;
  }
  console.log(`[replay] ${data.rerun?.pluginId}@${data.rerun?.pluginVersion} digest=${(data.rerun?.manifestSourceDigest ?? "").slice(0, 12)}\u2026`);
  console.log(`[replay] inputs: ${JSON.stringify(data.rerun?.inputs ?? {})}`);
  console.log("[replay] re-apply via: od plugin apply " + data.rerun?.pluginId + " --inputs " + JSON.stringify(JSON.stringify(data.rerun?.inputs ?? {})));
}
async function runPluginTrust(rest) {
  const flags = parseFlags(rest, { string: PLUGIN_STRING_FLAGS, boolean: PLUGIN_BOOLEAN_FLAGS });
  const id = rest.find((a) => !a.startsWith("-") && a !== flags["daemon-url"] && a !== flags.source && a !== flags.inputs && a !== flags.project && a !== flags["snapshot-id"] && a !== flags.capabilities);
  if (!id) {
    console.error("Usage: od plugin trust <id> --capabilities connector:figma,connector:notion [--revoke]");
    process.exit(2);
  }
  const capsCsv = typeof flags.capabilities === "string" ? flags.capabilities : "";
  const caps = capsCsv.split(",").map((c) => c.trim()).filter(Boolean);
  if (caps.length === 0) {
    console.error("--capabilities is required (comma-separated, e.g. connector:figma,fs:read)");
    process.exit(2);
  }
  const action = flags.revoke ? "revoke" : "grant";
  const url = `${(await pluginDaemonUrl(flags)).replace(/\/$/, "")}/api/plugins/${encodeURIComponent(id)}/trust`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ capabilities: caps, action })
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    if (resp.status === 400 && data?.error?.code === "invalid-capability") {
      const rej = (data.error.data?.rejected ?? []).map((r) => `${r.capability} (${r.reason})`).join(", ");
      console.error(`[trust] invalid capabilities: ${rej}`);
      process.exit(2);
    }
    console.error(`POST ${url} failed: ${resp.status} ${JSON.stringify(data)}`);
    process.exit(1);
  }
  if (flags.json) {
    process.stdout.write(JSON.stringify(data, null, 2) + "\n");
    return;
  }
  console.log(`[trust] ${action === "grant" ? "granted" : "revoked"} on ${id}: ${caps.join(", ")}`);
  console.log(`[trust] now: ${(data.capabilitiesGranted ?? []).join(", ")}`);
}
async function runUi(args) {
  if (args.length === 0 || args[0] === "help" || args.includes("--help") || args.includes("-h")) {
    printUiHelp();
    process.exit(args.length === 0 ? 2 : 0);
  }
  const sub = args[0];
  const rest = args.slice(1);
  switch (sub) {
    case "list":
      return runUiList(rest);
    case "show":
      return runUiShow(rest);
    case "respond":
      return runUiRespond(rest);
    case "revoke":
      return runUiRevoke(rest);
    case "prefill":
      return runUiPrefill(rest);
    default:
      console.error(`unknown subcommand: od ui ${sub}`);
      printUiHelp();
      process.exit(2);
  }
}
async function uiDaemonUrl(flags) {
  return cliDaemonUrl(flags);
}
async function runUiList(rest) {
  const flags = parseFlags(rest, { string: UI_STRING_FLAGS, boolean: UI_BOOLEAN_FLAGS });
  const base = (await uiDaemonUrl(flags)).replace(/\/$/, "");
  let url;
  if (flags.run)
    url = `${base}/api/runs/${encodeURIComponent(flags.run)}/genui`;
  else if (flags.project)
    url = `${base}/api/projects/${encodeURIComponent(flags.project)}/genui`;
  else {
    console.error("Usage: od ui list --run <runId> | --project <projectId>");
    process.exit(2);
  }
  const resp = await fetch(url);
  if (!resp.ok) {
    console.error(`GET ${url} failed: ${resp.status} ${await resp.text()}`);
    process.exit(1);
  }
  const data = await resp.json();
  if (flags.json) {
    process.stdout.write(JSON.stringify(data, null, 2) + "\n");
    return;
  }
  const surfaces = Array.isArray(data?.surfaces) ? data.surfaces : [];
  if (surfaces.length === 0) {
    console.log("No GenUI surfaces.");
    return;
  }
  for (const s of surfaces) {
    console.log(`${s.surfaceId}  kind=${s.kind}  persist=${s.persist}  status=${s.status}  rowId=${s.id}`);
  }
}
async function runUiShow(rest) {
  const flags = parseFlags(rest, { string: UI_STRING_FLAGS, boolean: UI_BOOLEAN_FLAGS });
  const positional = rest.filter((a) => !a.startsWith("-") && a !== flags["daemon-url"] && a !== flags.run && a !== flags.project && a !== flags.value && a !== flags["value-json"] && a !== flags.plugin && a !== flags["snapshot-id"] && a !== flags.persist && a !== flags.kind);
  const runId = flags.run ?? positional[0];
  const surfaceId = flags["snapshot-id"] ? null : positional[flags.run ? 0 : 1];
  if (!runId || !surfaceId) {
    console.error("Usage: od ui show --run <runId> <surfaceId>");
    process.exit(2);
  }
  const url = `${(await uiDaemonUrl(flags)).replace(/\/$/, "")}/api/runs/${encodeURIComponent(runId)}/genui/${encodeURIComponent(surfaceId)}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    console.error(`GET ${url} failed: ${resp.status} ${await resp.text()}`);
    process.exit(1);
  }
  const data = await resp.json();
  if (flags.schema) {
    const schema = data?.spec?.schema ?? null;
    process.stdout.write(JSON.stringify(schema, null, 2) + "\n");
    return;
  }
  process.stdout.write(JSON.stringify(data, null, 2) + "\n");
}
async function runUiRespond(rest) {
  const flags = parseFlags(rest, { string: UI_STRING_FLAGS, boolean: UI_BOOLEAN_FLAGS });
  const positional = rest.filter((a) => !a.startsWith("-") && a !== flags["daemon-url"] && a !== flags.run && a !== flags.project && a !== flags.value && a !== flags["value-json"] && a !== flags.plugin && a !== flags["snapshot-id"] && a !== flags.persist && a !== flags.kind);
  const runId = flags.run ?? positional[0];
  const surfaceId = positional[flags.run ? 0 : 1];
  if (!runId || !surfaceId) {
    console.error("Usage: od ui respond --run <runId> <surfaceId> [--value <text> | --value-json <json> | --skip]");
    process.exit(2);
  }
  let value = null;
  if (flags.skip) {
    value = null;
  } else if (typeof flags["value-json"] === "string") {
    try {
      value = JSON.parse(flags["value-json"]);
    } catch (err) {
      console.error(`--value-json must be valid JSON: ${err.message}`);
      process.exit(2);
    }
  } else if (typeof flags.value === "string") {
    value = flags.value;
  }
  const url = `${(await uiDaemonUrl(flags)).replace(/\/$/, "")}/api/runs/${encodeURIComponent(runId)}/genui/${encodeURIComponent(surfaceId)}/respond`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ value, respondedBy: "user" })
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    console.error(`POST ${url} failed: ${resp.status} ${JSON.stringify(data)}`);
    process.exit(1);
  }
  if (flags.json) {
    process.stdout.write(JSON.stringify(data, null, 2) + "\n");
  } else {
    console.log(`[ui] ${surfaceId} resolved (rowId=${data?.surface?.id})`);
  }
}
async function runUiRevoke(rest) {
  const flags = parseFlags(rest, { string: UI_STRING_FLAGS, boolean: UI_BOOLEAN_FLAGS });
  const positional = rest.filter((a) => !a.startsWith("-") && a !== flags["daemon-url"] && a !== flags.run && a !== flags.project && a !== flags.value && a !== flags["value-json"] && a !== flags.plugin && a !== flags["snapshot-id"] && a !== flags.persist && a !== flags.kind);
  const projectId = flags.project ?? positional[0];
  const surfaceId = positional[flags.project ? 0 : 1];
  if (!projectId || !surfaceId) {
    console.error("Usage: od ui revoke --project <projectId> <surfaceId>");
    process.exit(2);
  }
  const url = `${(await uiDaemonUrl(flags)).replace(/\/$/, "")}/api/projects/${encodeURIComponent(projectId)}/genui/${encodeURIComponent(surfaceId)}/revoke`;
  const resp = await fetch(url, { method: "POST" });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    console.error(`POST ${url} failed: ${resp.status} ${JSON.stringify(data)}`);
    process.exit(1);
  }
  if (flags.json) {
    process.stdout.write(JSON.stringify(data, null, 2) + "\n");
  } else {
    console.log(`[ui] revoked ${data.invalidated} row(s)`);
  }
}
async function runUiPrefill(rest) {
  const flags = parseFlags(rest, { string: UI_STRING_FLAGS, boolean: UI_BOOLEAN_FLAGS });
  const positional = rest.filter((a) => !a.startsWith("-") && a !== flags["daemon-url"] && a !== flags.run && a !== flags.project && a !== flags.value && a !== flags["value-json"] && a !== flags.plugin && a !== flags["snapshot-id"] && a !== flags.persist && a !== flags.kind);
  const projectId = flags.project ?? positional[0];
  const surfaceId = positional[flags.project ? 0 : 1];
  const snapshotId = flags["snapshot-id"];
  if (!projectId || !surfaceId || !snapshotId) {
    console.error("Usage: od ui prefill --project <projectId> --snapshot-id <id> <surfaceId> [--value <text> | --value-json <json>] [--persist run|conversation|project] [--kind form|choice|confirmation|oauth-prompt]");
    process.exit(2);
  }
  let value = null;
  if (typeof flags["value-json"] === "string") {
    try {
      value = JSON.parse(flags["value-json"]);
    } catch (err) {
      console.error(`--value-json must be valid JSON: ${err.message}`);
      process.exit(2);
    }
  } else if (typeof flags.value === "string") {
    value = flags.value;
  }
  const url = `${(await uiDaemonUrl(flags)).replace(/\/$/, "")}/api/projects/${encodeURIComponent(projectId)}/genui/prefill`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      snapshotId,
      surfaceId,
      kind: flags.kind ?? "confirmation",
      persist: flags.persist ?? "project",
      value
    })
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    console.error(`POST ${url} failed: ${resp.status} ${JSON.stringify(data)}`);
    process.exit(1);
  }
  if (flags.json) {
    process.stdout.write(JSON.stringify(data, null, 2) + "\n");
  } else {
    console.log(`[ui] prefilled ${surfaceId} (rowId=${data?.surface?.id})`);
  }
}
function printUiHelp() {
  console.log(`Usage:
  od ui list  --run <runId>                          List GenUI surfaces for a run.
  od ui list  --project <projectId>                  List GenUI surfaces for a project.
  od ui show  --run <runId> <surfaceId> [--schema]   Read a single surface (kind / schema / value). --schema prints just the JSON Schema.
  od ui respond --run <runId> <surfaceId> [--value <txt> | --value-json <json> | --skip]
                                                     Answer a pending surface from any process.
  od ui revoke --project <projectId> <surfaceId>     Invalidate a project-tier cached answer.
  od ui prefill --project <projectId> --snapshot-id <id> <surfaceId>
                [--value <text> | --value-json <json>] [--persist run|conversation|project]
                                                     Pre-answer a surface so the run never broadcasts it.

Common options:
  --daemon-url <url>   Open Design daemon HTTP base (default OD_DAEMON_URL, OD_SIDECAR_IPC_PATH discovery, or http://127.0.0.1:7456).
  --json               Emit raw JSON (suitable for scripts) instead of human-readable output.`);
}
function printPluginHelp() {
  console.log(`Usage:
  od plugin list [--task-kind <kind>]     List installed plugins (filterable).
  od plugin search <query> [--tag <t>]    Search installed plugins by id/title/desc/tag.
  od plugin stats [--json]                Inventory + snapshot health report.
  od plugin info <id>                     Print a plugin's manifest + trust state as JSON.
  od plugin manifest <id>                 Print only the parsed manifest JSON (no wrapper).
  od plugin sources                       List distinct install sources + counts.
  od plugin install --source <path>       Install a plugin from a local folder (Phase 1).
  od plugin upgrade <id>                  Re-install a plugin from its recorded source.
  od plugin uninstall <id>                Remove a plugin from the registry + on-disk staging.
  od plugin apply <id> [--inputs <json>]  Compute an ApplyResult (preview) for a plugin.
  od plugin doctor <id>                   Lint a plugin's manifest, atoms and resolved refs.
  od plugin canon <snapshotId>            Print the canonical system-prompt block for a snapshot.
                                          (--check <file> for byte-equality fixtures.)
  od plugin simulate <pluginId> [-s k=v]  Walk the plugin's pipeline against caller-supplied
                                          signals; report stage convergence + iterations
                                          (no LLM in the loop).
  od plugin verify <pluginId>             CI meta-command: doctor + simulate + canon --check
                                          driven by an .od-verify.json config in the plugin folder.
  od plugin events tail [-f] [--kind k]   Tail the in-memory plugin event ring buffer.
  od plugin events snapshot               One-shot read (filterable, no SSE).
  od plugin events stats                  Roll-up: counts by kind / pluginId / time range.
  od plugin events purge                  Drop every event in the buffer (loopback-only).
  od plugin diff <a> <b> [--json]         Compare two installed plugins by id.
  od plugin replay <runId> --snapshot-id <id>
                                          Re-emit the immutable snapshot a run launched against.
  od plugin trust <id> --capabilities a,b
                                          Stage a capability grant (full mutation lands Phase 3).
  od plugin validate <folder> [--json]    Lint a plugin folder before installing
                                          (manifest parse + atom + ref checks).
  od plugin pack <folder> [--out <path>]  Build a .tgz archive of a plugin
                                          folder for distribution.
  od plugin candidates list --project <id>
                                          List persisted skill-to-plugin candidates.
  od plugin publish-repo <folder>         Create/update the author's public
                                          GitHub repo for a plugin folder.
  od plugin open-design-pr <folder>       Push a community-catalog branch and
                                          open the nexu-io/open-design PR form.
  od plugin publish <folder> --to open-design|anthropics-skills|awesome-agent-skills|clawhub|skills-sh
                                          Prepare a registry submission link.
  od plugin login [--host github.com]      Authenticate registry publishing via gh.
  od plugin whoami [--host github.com]     Show the gh account used for publishing.

Common options:
  --daemon-url <url>   Open Design daemon HTTP base (default OD_DAEMON_URL, OD_SIDECAR_IPC_PATH discovery, or http://127.0.0.1:7456).
  --json               Emit raw JSON (suitable for scripts) instead of human-readable output.

Installs support local folders, github:owner/repo refs, HTTPS .tgz archives,
and bare marketplace names resolved through configured registry sources.`);
}
async function projectDaemonUrl(flags) {
  return cliDaemonUrl(flags);
}
function safeReadJsonFile(p) {
  try {
    const fs = __require ? __require("node:fs") : null;
    if (!fs)
      return null;
    if (p === "-")
      return JSON.parse(fs.readFileSync(0, "utf8"));
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}
async function runProject(args) {
  if (args.length === 0 || args[0] === "help" || args.includes("--help") || args.includes("-h")) {
    console.log(`Usage:
  od project create [--name "<title>"] [--skill <id>] [--design-system <id>]
                    [--plugin <id>] [--inputs <json>] [--metadata-json <path|->]
  od project import <baseDir> [--name "<title>"]
  od project list                         List projects.
  od project info <id>                    Print one project.
  od project delete <id>                  Delete a project.
  od project editors                      List locally-installed editors that
                                          can open a project (hand-off targets).
  od project open-in <id> --editor <slug> Open the project's working directory
                                          in the chosen editor (cursor, zed,
                                          vscode, finder, terminal, \u2026).
  od project handoff <id> --conversation <id> --api-key <key> --model <model>
                    [--base-url <url>] [--max-tokens <n>]
                    Synthesize a resume-conversation handoff prompt.

Common options:
  --daemon-url <url>   Open Design daemon HTTP base.
  --json               Emit raw JSON.`);
    process.exit(args.length === 0 ? 2 : 0);
  }
  const sub = args[0];
  const rest = args.slice(1);
  if (sub === "handoff") {
    const { exitCode } = await runProjectHandoff(rest);
    if (exitCode !== 0)
      process.exit(exitCode);
    return;
  }
  const flags = parseFlags(rest, { string: PROJECT_STRING_FLAGS, boolean: PROJECT_BOOLEAN_FLAGS });
  const base = (await projectDaemonUrl(flags)).replace(/\/$/, "");
  switch (sub) {
    case "list": {
      const resp = await fetch(`${base}/api/projects`);
      if (!resp.ok)
        return structuredHttpFailure(resp);
      const data = await resp.json();
      if (flags.json)
        return process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      const projects = data?.projects ?? [];
      if (projects.length === 0) {
        console.log('No projects. Create one with `od project create --name "..."`.');
        return;
      }
      for (const p of projects)
        console.log(`${p.id}	${p.name}	${p.skillId ?? "-"}`);
      return;
    }
    case "info": {
      const id = rest.find((a) => !a.startsWith("-"));
      if (!id) {
        console.error("Usage: od project info <id>");
        process.exit(2);
      }
      const resp = await fetch(`${base}/api/projects/${encodeURIComponent(id)}`);
      if (!resp.ok)
        return structuredHttpFailure(resp, "project-not-found");
      const data = await resp.json();
      process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      return;
    }
    case "create": {
      const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      const name = typeof flags.name === "string" && flags.name.length > 0 ? flags.name : "Untitled project";
      const body = {
        id,
        name,
        skillId: flags.skill ?? null,
        designSystemId: flags["design-system"] ?? null
      };
      if (flags["pending-prompt"])
        body.pendingPrompt = flags["pending-prompt"];
      if (flags["metadata-json"]) {
        const mj = safeReadJsonFile(flags["metadata-json"]);
        if (mj && typeof mj === "object")
          body.metadata = mj;
      }
      if (flags.plugin)
        body.pluginId = flags.plugin;
      if (flags.inputs) {
        try {
          body.pluginInputs = JSON.parse(flags.inputs);
        } catch (err) {
          console.error(`--inputs must be valid JSON: ${err.message}`);
          process.exit(2);
        }
      }
      if (flags["grant-caps"]) {
        body.grantCaps = String(flags["grant-caps"]).split(",").map((c) => c.trim()).filter(Boolean);
      }
      const resp = await fetch(`${base}/api/projects`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        if (resp.status === 409 && data?.error?.code === "capabilities-required") {
          return exitWithStructuredError({
            code: "capabilities-required",
            message: data.error.message,
            data: data.error.data
          });
        }
        console.error(`POST /api/projects failed: ${resp.status} ${JSON.stringify(data)}`);
        process.exit(1);
      }
      if (flags.json)
        return process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      console.log(`[project] created ${data.project?.id ?? id} (conversation ${data.conversationId})`);
      return;
    }
    case "import": {
      const [baseDir] = positionalArgs(rest, PROJECT_STRING_FLAGS);
      const importBaseDir = typeof baseDir === "string" ? baseDir.trim() : "";
      if (!importBaseDir) {
        console.error('Usage: od project import <baseDir> [--name "<title>"]');
        process.exit(2);
      }
      const body = { baseDir: importBaseDir };
      if (typeof flags.name === "string" && flags.name.length > 0)
        body.name = flags.name;
      if (typeof flags.skill === "string" && flags.skill.length > 0)
        body.skillId = flags.skill;
      if (typeof flags["design-system"] === "string" && flags["design-system"].length > 0) {
        body.designSystemId = flags["design-system"];
      }
      const headers = { "content-type": "application/json" };
      const importToken = await mintCliImportToken(importBaseDir);
      if (importToken != null) {
        headers["x-od-desktop-import-token"] = importToken;
      }
      const resp = await fetch(`${base}/api/import/folder`, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });
      if (!resp.ok)
        return structuredHttpFailure(resp);
      const data = await resp.json();
      if (flags.json)
        return process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      console.log(`[project] imported ${data.project?.id ?? "-"} (conversation ${data.conversationId ?? "-"})`);
      return;
    }
    case "delete": {
      const id = rest.find((a) => !a.startsWith("-"));
      if (!id) {
        console.error("Usage: od project delete <id>");
        process.exit(2);
      }
      const resp = await fetch(`${base}/api/projects/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!resp.ok)
        return structuredHttpFailure(resp, "project-not-found");
      console.log(`[project] deleted ${id}`);
      return;
    }
    case "editors": {
      const resp = await fetch(`${base}/api/editors`);
      if (!resp.ok)
        return structuredHttpFailure(resp);
      const data = await resp.json();
      if (flags.json)
        return process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      const editors = data?.editors ?? [];
      for (const ed of editors) {
        const status = ed.available ? "available" : "missing";
        console.log(`${ed.id}	${ed.label}	${status}`);
      }
      return;
    }
    case "open-in": {
      const id = rest.find((a) => !a.startsWith("-"));
      if (!id) {
        console.error("Usage: od project open-in <id> --editor <slug>");
        process.exit(2);
      }
      const editor = typeof flags.editor === "string" ? flags.editor : "";
      if (!editor) {
        console.error("--editor <slug> is required. Run `od project editors` to list options.");
        process.exit(2);
      }
      const resp = await fetch(`${base}/api/projects/${encodeURIComponent(id)}/open-in`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ editorId: editor })
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        if (flags.json)
          process.stdout.write(JSON.stringify(data, null, 2) + "\n");
        else
          console.error(`POST /api/projects/${id}/open-in failed: ${resp.status} ${JSON.stringify(data)}`);
        process.exit(1);
      }
      if (flags.json)
        return process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      console.log(`[project] opened ${id} in ${editor} (${data.path ?? ""})`);
      return;
    }
    default:
      console.error(`unknown subcommand: od project ${sub}`);
      process.exit(2);
  }
}
async function runRun(args) {
  if (args.length === 0 || args[0] === "help" || args.includes("--help") || args.includes("-h")) {
    console.log(`Usage:
  od run start --project <projectId> [--conversation <id>] [--message "<text>"]
               [--plugin <id>] [--inputs <json>] [--grant-caps a,b]
               [--agent claude|codex|gemini] [--model <id>] [--follow] [--json]
  od run watch  <runId>                     ND-JSON event stream on stdout.
  od run cancel <runId>                     Request cancellation.
  od run list   [--project <id>]            List recent runs.
  od run info   <runId>                     One run's status.

Common options:
  --daemon-url <url>   Open Design daemon HTTP base.
  --json               Emit raw JSON.`);
    process.exit(args.length === 0 ? 2 : 0);
  }
  const sub = args[0];
  const rest = args.slice(1);
  const flags = parseFlags(rest, { string: PROJECT_STRING_FLAGS, boolean: PROJECT_BOOLEAN_FLAGS });
  const base = (await projectDaemonUrl(flags)).replace(/\/$/, "");
  switch (sub) {
    case "list": {
      const url = flags.project ? `${base}/api/runs?projectId=${encodeURIComponent(flags.project)}` : `${base}/api/runs`;
      const resp = await fetch(url);
      if (!resp.ok)
        return structuredHttpFailure(resp);
      const data = await resp.json();
      if (flags.json)
        return process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      const runs = data?.runs ?? [];
      for (const r of runs) {
        console.log(`${r.id}	${r.status}	project=${r.projectId ?? "-"}	plugin=${r.pluginId ?? "-"}`);
      }
      return;
    }
    case "info": {
      const id = rest.find((a) => !a.startsWith("-"));
      if (!id) {
        console.error("Usage: od run info <runId>");
        process.exit(2);
      }
      const resp = await fetch(`${base}/api/runs/${encodeURIComponent(id)}`);
      if (!resp.ok)
        return structuredHttpFailure(resp, "run-not-found");
      const data = await resp.json();
      process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      return;
    }
    case "cancel": {
      const id = rest.find((a) => !a.startsWith("-"));
      if (!id) {
        console.error("Usage: od run cancel <runId>");
        process.exit(2);
      }
      const resp = await fetch(`${base}/api/runs/${encodeURIComponent(id)}/cancel`, { method: "POST" });
      if (!resp.ok)
        return structuredHttpFailure(resp, "run-not-found");
      console.log(`[run] cancelled ${id}`);
      return;
    }
    case "watch": {
      const id = rest.find((a) => !a.startsWith("-"));
      if (!id) {
        console.error("Usage: od run watch <runId>");
        process.exit(2);
      }
      await streamRunEvents(base, id);
      return;
    }
    case "start": {
      if (!flags.project) {
        console.error("--project <projectId> is required");
        process.exit(2);
      }
      const body = { projectId: flags.project };
      if (flags.conversation)
        body.conversationId = flags.conversation;
      if (flags.message)
        body.message = flags.message;
      if (flags.plugin)
        body.pluginId = flags.plugin;
      if (flags.agent)
        body.agentId = flags.agent;
      if (flags.model)
        body.model = flags.model;
      if (flags.inputs) {
        try {
          body.pluginInputs = JSON.parse(flags.inputs);
        } catch (err) {
          console.error(`--inputs must be valid JSON: ${err.message}`);
          process.exit(2);
        }
      }
      if (flags["grant-caps"]) {
        body.grantCaps = String(flags["grant-caps"]).split(",").map((c) => c.trim()).filter(Boolean);
      }
      if (flags["snapshot-id"])
        body.appliedPluginSnapshotId = flags["snapshot-id"];
      const resp = await fetch(`${base}/api/runs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        if (resp.status === 409 && data?.error?.code === "capabilities-required") {
          return exitWithStructuredError({
            code: "capabilities-required",
            message: data.error.message,
            data: data.error.data
          });
        }
        if (resp.status === 422 && data?.error?.code === "missing-input") {
          return exitWithStructuredError({
            code: "missing-input",
            message: data.error.message,
            data: data.error.data
          });
        }
        console.error(`POST /api/runs failed: ${resp.status} ${JSON.stringify(data)}`);
        process.exit(1);
      }
      if (flags.json && !flags.follow) {
        return process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      }
      console.log(`[run] started ${data.runId}`);
      if (flags.follow)
        await streamRunEvents(base, data.runId);
      return;
    }
    default:
      console.error(`unknown subcommand: od run ${sub}`);
      process.exit(2);
  }
}
async function streamRunEvents(base, runId) {
  const resp = await fetch(`${base}/api/runs/${encodeURIComponent(runId)}/events`, {
    headers: { accept: "text/event-stream" }
  });
  if (!resp.ok || !resp.body) {
    console.error(`run watch failed: ${resp.status}`);
    process.exit(1);
  }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done)
      break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";
    for (const block of blocks) {
      const lines = block.split("\n");
      const eventLine = lines.find((l) => l.startsWith("event: "));
      const dataLine = lines.find((l) => l.startsWith("data: "));
      const event = eventLine ? eventLine.slice("event: ".length) : "message";
      const dataRaw = dataLine ? dataLine.slice("data: ".length) : "";
      let parsed;
      try {
        parsed = JSON.parse(dataRaw);
      } catch {
        parsed = dataRaw;
      }
      process.stdout.write(JSON.stringify({ event, data: parsed }) + "\n");
      if (event === "end") {
        return;
      }
    }
  }
}
async function runFiles(args) {
  if (args.length === 0 || args[0] === "help" || args.includes("--help") || args.includes("-h")) {
    console.log(`Usage:
  od files list   <projectId>                  List files in a project.
  od files read   <projectId> <relpath>        Stream file bytes to stdout.
  od files write  <projectId> <relpath> [< stdin]
                                               Write content from stdin.
  od files upload <projectId> <localpath> [--as <relpath>]
                                               Upload a local file.
  od files delete <projectId> <name>           Delete a project file.
  od files diff   <projectId> <relpathA> [<relpathB> | --against -]
                                               Print a unified diff.

Common options:
  --daemon-url <url>   Open Design daemon HTTP base.
  --json               Emit raw JSON.`);
    process.exit(args.length === 0 ? 2 : 0);
  }
  const sub = args[0];
  const rest = args.slice(1);
  const flags = parseFlags(rest, { string: PROJECT_STRING_FLAGS, boolean: PROJECT_BOOLEAN_FLAGS });
  const base = (await projectDaemonUrl(flags)).replace(/\/$/, "");
  switch (sub) {
    case "list": {
      const id = rest.find((a) => !a.startsWith("-"));
      if (!id) {
        console.error("Usage: od files list <projectId>");
        process.exit(2);
      }
      const resp = await fetch(`${base}/api/projects/${encodeURIComponent(id)}/files`);
      if (!resp.ok)
        return structuredHttpFailure(resp, "project-not-found");
      const data = await resp.json();
      if (flags.json)
        return process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      const files = Array.isArray(data?.files) ? data.files : [];
      for (const f of files)
        console.log(`${f.size}	${f.name ?? f.path}`);
      return;
    }
    case "read": {
      const positional = rest.filter((a) => !a.startsWith("-"));
      const [id, rel] = positional;
      if (!id || !rel) {
        console.error("Usage: od files read <projectId> <relpath>");
        process.exit(2);
      }
      const resp = await fetch(`${base}/api/projects/${encodeURIComponent(id)}/files/${rel.split("/").map(encodeURIComponent).join("/")}`);
      if (!resp.ok)
        return structuredHttpFailure(resp, "project-not-found");
      const buf = Buffer.from(await resp.arrayBuffer());
      process.stdout.write(buf);
      return;
    }
    case "upload": {
      const positional = rest.filter((a) => !a.startsWith("-") && a !== flags.as);
      const [id, localPath] = positional;
      if (!id || !localPath) {
        console.error("Usage: od files upload <projectId> <localpath> [--as <relpath>]");
        process.exit(2);
      }
      const fs = __require("node:fs");
      const path3 = __require("node:path");
      const buf = fs.readFileSync(localPath);
      const desiredName = typeof flags.as === "string" && flags.as.length > 0 ? flags.as : path3.basename(localPath);
      const resp = await fetch(`${base}/api/projects/${encodeURIComponent(id)}/files`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: desiredName,
          content: buf.toString("base64"),
          encoding: "base64"
        })
      });
      if (!resp.ok)
        return structuredHttpFailure(resp);
      const data = await resp.json();
      if (flags.json)
        return process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      console.log(`[files] uploaded ${data?.file?.name ?? desiredName}`);
      return;
    }
    case "write": {
      const positional = rest.filter((a) => !a.startsWith("-"));
      const [id, rel] = positional;
      if (!id || !rel) {
        console.error("Usage: od files write <projectId> <relpath> [< stdin]");
        process.exit(2);
      }
      const fs = __require("node:fs");
      let chunks = [];
      try {
        const stdin = fs.readFileSync(0);
        chunks = [stdin];
      } catch (err) {
        console.error(`stdin read failed: ${err.message ?? err}`);
        process.exit(1);
      }
      const body = Buffer.concat(chunks);
      const resp = await fetch(`${base}/api/projects/${encodeURIComponent(id)}/files`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: rel,
          content: body.toString("utf8"),
          encoding: "utf8"
        })
      });
      if (!resp.ok)
        return structuredHttpFailure(resp);
      const data = await resp.json();
      if (flags.json)
        return process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      console.log(`[files] wrote ${data?.file?.name ?? rel}`);
      return;
    }
    case "delete": {
      const positional = rest.filter((a) => !a.startsWith("-"));
      const [id, name] = positional;
      if (!id || !name) {
        console.error("Usage: od files delete <projectId> <name>");
        process.exit(2);
      }
      const resp = await fetch(`${base}/api/projects/${encodeURIComponent(id)}/files/${encodeURIComponent(name)}`, { method: "DELETE" });
      if (!resp.ok)
        return structuredHttpFailure(resp);
      console.log(`[files] deleted ${name}`);
      return;
    }
    case "diff": {
      const positional = positionalArgs(rest, PROJECT_STRING_FLAGS);
      const [id, relA, relB] = positional;
      const against = typeof flags.against === "string" ? flags.against : null;
      if (!id || !relA || !relB && !against || relB && against) {
        console.error("Usage: od files diff <projectId> <relpathA> [<relpathB> | --against -]");
        process.exit(2);
      }
      const left = await fetchProjectFileText(base, id, relA);
      const rightLabel = against ?? relB;
      const right = against === "-" ? await readStdinUtf8() : await fetchProjectFileText(base, id, rightLabel);
      const diff = createUnifiedDiff(`a/${relA}`, `b/${rightLabel}`, left, right);
      if (flags.json)
        return process.stdout.write(JSON.stringify({ diff }, null, 2) + "\n");
      process.stdout.write(diff);
      return;
    }
    default:
      console.error(`unknown subcommand: od files ${sub}`);
      process.exit(2);
  }
}
function encodeProjectRelpath(rel) {
  return String(rel).split("/").map(encodeURIComponent).join("/");
}
async function fetchProjectFileText(base, id, rel) {
  const resp = await fetch(`${base}/api/projects/${encodeURIComponent(id)}/files/${encodeProjectRelpath(rel)}`);
  if (!resp.ok)
    return structuredHttpFailure(resp, "project-not-found");
  const buf = Buffer.from(await resp.arrayBuffer());
  return buf.toString("utf8");
}
async function readStdinUtf8() {
  const fs = await import("node:fs");
  return fs.readFileSync(0, "utf8");
}
async function mintCliImportToken(baseDir) {
  const socketPath = process.env[SIDECAR_ENV.IPC_PATH];
  if (typeof socketPath !== "string" || socketPath.length === 0)
    return null;
  let result;
  try {
    result = await requestJsonIpc(socketPath, { type: SIDECAR_MESSAGES.MINT_IMPORT_TOKEN, input: { baseDir } }, { timeoutMs: 800 });
  } catch {
    return null;
  }
  if (result?.ok === true && typeof result.token === "string" && result.token.length > 0) {
    return result.token;
  }
  if (result?.ok === false && result.code === "DESKTOP_AUTH_PENDING") {
    exitWithStructuredError({
      code: "desktop-auth-pending",
      message: result.message ?? "desktop auth required but secret not yet registered",
      data: { retryable: result.retryable === true }
    });
  }
  return null;
}
function createUnifiedDiff(leftLabel, rightLabel, leftText, rightText) {
  if (leftText === rightText)
    return "";
  const leftLines = splitDiffLines(leftText);
  const rightLines = splitDiffLines(rightText);
  let prefix = 0;
  while (prefix < leftLines.length && prefix < rightLines.length && leftLines[prefix] === rightLines[prefix]) {
    prefix++;
  }
  let leftEnd = leftLines.length;
  let rightEnd = rightLines.length;
  while (leftEnd > prefix && rightEnd > prefix && leftLines[leftEnd - 1] === rightLines[rightEnd - 1]) {
    leftEnd--;
    rightEnd--;
  }
  const oldMid = leftLines.slice(prefix, leftEnd);
  const newMid = rightLines.slice(prefix, rightEnd);
  const body = diffLineBody(oldMid, newMid);
  if (body.length === 0) {
    body.push(...oldMid.map((line) => diffLine("-", line)), ...newMid.map((line) => diffLine("+", line)));
  }
  const oldStart = oldMid.length === 0 ? prefix : prefix + 1;
  const newStart = newMid.length === 0 ? prefix : prefix + 1;
  return [
    `--- ${leftLabel}`,
    `+++ ${rightLabel}`,
    `@@ -${formatDiffRange(oldStart, oldMid.length)} +${formatDiffRange(newStart, newMid.length)} @@`,
    ...body
  ].join("\n") + "\n";
}
function splitDiffLines(text) {
  const value = String(text);
  if (value.length === 0)
    return [];
  return value.match(/.*?(?:\r\n|\n|\r|$)/gs).filter((line) => line.length > 0);
}
function formatDiffRange(start, length) {
  return length === 1 ? String(start) : `${start},${length}`;
}
function diffLineBody(oldLines, newLines) {
  if (oldLines.length === 0)
    return newLines.map((line) => diffLine("+", line));
  if (newLines.length === 0)
    return oldLines.map((line) => diffLine("-", line));
  if (oldLines.length * newLines.length > 1e6) {
    return [...oldLines.map((line) => diffLine("-", line)), ...newLines.map((line) => diffLine("+", line))];
  }
  const width = newLines.length + 1;
  const lcs = Array.from({ length: oldLines.length + 1 }, () => new Uint32Array(width));
  for (let i2 = oldLines.length - 1; i2 >= 0; i2--) {
    for (let j2 = newLines.length - 1; j2 >= 0; j2--) {
      lcs[i2][j2] = oldLines[i2] === newLines[j2] ? lcs[i2 + 1][j2 + 1] + 1 : Math.max(lcs[i2 + 1][j2], lcs[i2][j2 + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < oldLines.length && j < newLines.length) {
    if (oldLines[i] === newLines[j]) {
      out.push(diffLine(" ", oldLines[i]));
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      out.push(diffLine("-", oldLines[i]));
      i++;
    } else {
      out.push(diffLine("+", newLines[j]));
      j++;
    }
  }
  while (i < oldLines.length)
    out.push(diffLine("-", oldLines[i++]));
  while (j < newLines.length)
    out.push(diffLine("+", newLines[j++]));
  return out;
}
function diffLine(prefix, line) {
  const value = String(line);
  if (value.endsWith("\r\n"))
    return `${prefix}${renderDiffLineContent(value.slice(0, -1))}`;
  if (value.endsWith("\n"))
    return `${prefix}${renderDiffLineContent(value.slice(0, -1))}`;
  if (value.endsWith("\r"))
    return `${prefix}${renderDiffLineContent(value)}`;
  return `${prefix}${renderDiffLineContent(value)}
\\ No newline at end of file`;
}
function renderDiffLineContent(value) {
  return String(value).replace(/\r/g, "\\r");
}
async function runConversation(args) {
  if (args.length === 0 || args[0] === "help" || args.includes("--help") || args.includes("-h")) {
    console.log(`Usage:
  od conversation new  <projectId> [--title "<title>"]
                                           Create a conversation in a project.
  od conversation list <projectId>           List conversations in a project.
  od conversation info <conversationId>      Print one conversation.

Common options:
  --daemon-url <url>   Open Design daemon HTTP base.
  --json               Emit raw JSON.`);
    process.exit(args.length === 0 ? 2 : 0);
  }
  const sub = args[0];
  const rest = args.slice(1);
  const flags = parseFlags(rest, { string: PROJECT_STRING_FLAGS, boolean: PROJECT_BOOLEAN_FLAGS });
  const base = (await projectDaemonUrl(flags)).replace(/\/$/, "");
  switch (sub) {
    case "new": {
      const [id] = positionalArgs(rest, PROJECT_STRING_FLAGS);
      if (!id) {
        console.error('Usage: od conversation new <projectId> [--title "<title>"]');
        process.exit(2);
      }
      const body = {};
      if (typeof flags.title === "string")
        body.title = flags.title;
      const resp = await fetch(`${base}/api/projects/${encodeURIComponent(id)}/conversations`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!resp.ok)
        return structuredHttpFailure(resp, "project-not-found");
      const data = await resp.json();
      if (flags.json)
        return process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      console.log(`[conversation] created ${data.conversation?.id ?? "-"}`);
      return;
    }
    case "list": {
      const id = rest.find((a) => !a.startsWith("-"));
      if (!id) {
        console.error("Usage: od conversation list <projectId>");
        process.exit(2);
      }
      const resp = await fetch(`${base}/api/projects/${encodeURIComponent(id)}/conversations`);
      if (!resp.ok)
        return structuredHttpFailure(resp);
      const data = await resp.json();
      process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      return;
    }
    case "info": {
      const id = rest.find((a) => !a.startsWith("-"));
      if (!id) {
        console.error("Usage: od conversation info <conversationId>");
        process.exit(2);
      }
      const resp = await fetch(`${base}/api/conversations/${encodeURIComponent(id)}`);
      if (!resp.ok)
        return structuredHttpFailure(resp);
      const data = await resp.json();
      process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      return;
    }
    default:
      console.error(`unknown subcommand: od conversation ${sub}`);
      process.exit(2);
  }
}
async function runDaemon(args) {
  if (args.length === 0 || args[0] === "help" || args.includes("--help") || args.includes("-h")) {
    console.log(`Usage:
  od daemon start [--headless] [--serve-web] [--port <n>] [--host <addr>] [--no-open]
                                          Start the daemon (Phase 1.5 headless mode).
  od daemon status [--json] [--daemon-url <url>]
                                          Print the daemon's runtime snapshot.
  od daemon stop   [--daemon-url <url>]   Send a graceful shutdown signal.
  od daemon db     status                 Print SQLite path + size + table row counts.
  od daemon db     verify [--quick]       Run integrity_check + foreign_key_check.
  od daemon db     vacuum                 Run SQLite VACUUM to reclaim space after deletes.

Common options:
  --daemon-url <url>   Open Design daemon HTTP base.
  --headless           No browser auto-open; aliased --no-open.
  --serve-web          Serve the web UI over the existing port (no electron).
  --json               Emit raw JSON.`);
    process.exit(args.length === 0 ? 2 : 0);
  }
  const sub = args[0];
  const rest = args.slice(1);
  const flags = parseFlags(rest, { string: DAEMON_STRING_FLAGS, boolean: DAEMON_BOOLEAN_FLAGS });
  switch (sub) {
    case "start":
      return runDaemonStart(flags);
    case "status":
      return runDaemonStatus(flags);
    case "stop":
      return runDaemonStop(flags);
    case "db":
      return runDaemonDb(rest, flags);
    default:
      console.error(`unknown subcommand: od daemon ${sub}`);
      process.exit(2);
  }
}
async function runDaemonDb(rest, flags) {
  const sub = rest[0];
  if (!sub || sub === "help" || rest.includes("--help") || rest.includes("-h")) {
    console.log(`Usage:
  od daemon db status [--json] [--daemon-url <url>]
  od daemon db verify [--quick] [--json] [--daemon-url <url>]
  od daemon db vacuum [--json] [--daemon-url <url>]

status:
  Prints a structured inventory of the daemon's SQLite backend:
    - file path (under .od/ by default; OD_DATA_DIR overrides)
    - size on disk (primary + WAL + SHM)
    - schema version (user_version PRAGMA)
    - per-table row counts (system tables excluded)

verify:
  Runs SQLite PRAGMA integrity_check (or quick_check with --quick)
  + foreign_key_check, returns a structured issues[] report.
  Exit 0 when ok=true, 4 when any issue is found.

vacuum:
  Runs SQLite VACUUM to reclaim space after large delete batches
  (snapshot prune, plugin uninstall, etc.). Reports before/after
  sizes + elapsed ms.`);
    process.exit(sub ? 0 : 2);
  }
  const base = (await libraryDaemonUrl(flags)).replace(/\/$/, "");
  if (sub === "vacuum") {
    const resp2 = await fetch(`${base}/api/daemon/db/vacuum`, { method: "POST" });
    if (!resp2.ok) {
      console.error(`POST /api/daemon/db/vacuum failed: ${resp2.status} ${await resp2.text()}`);
      process.exit(1);
    }
    const data2 = await resp2.json();
    if (flags.json) {
      process.stdout.write(JSON.stringify(data2, null, 2) + "\n");
      return;
    }
    console.log(`[db vacuum] reclaimed ${formatBytes(data2.reclaimedBytes ?? 0)} (${formatBytes(data2.beforeBytes ?? 0)} \u2192 ${formatBytes(data2.afterBytes ?? 0)}, ${data2.elapsedMs ?? 0}ms)`);
    return;
  }
  if (sub === "verify") {
    const verifyFlags = parseFlags(rest.slice(1), {
      string: /* @__PURE__ */ new Set(["daemon-url"]),
      boolean: /* @__PURE__ */ new Set(["help", "h", "json", "quick"])
    });
    const url = `${base}/api/daemon/db/verify${verifyFlags.quick ? "?quick=1" : ""}`;
    const resp2 = await fetch(url, { method: "POST" });
    if (!resp2.ok) {
      console.error(`POST ${url} failed: ${resp2.status} ${await resp2.text()}`);
      process.exit(1);
    }
    const data2 = await resp2.json();
    if (flags.json) {
      process.stdout.write(JSON.stringify(data2, null, 2) + "\n");
    } else {
      const issueCount = Array.isArray(data2.issues) ? data2.issues.length : 0;
      console.log(`[db verify] mode=${data2.mode}  ok=${data2.ok}  issues=${issueCount}  ${data2.elapsedMs ?? 0}ms`);
      if (issueCount > 0) {
        for (const issue of data2.issues) {
          console.error(`  [${issue.kind}] ${issue.message}`);
        }
      }
    }
    process.exit(data2.ok ? 0 : 4);
  }
  if (sub !== "status") {
    console.error(`unknown subcommand: od daemon db ${sub}`);
    process.exit(2);
  }
  const resp = await fetch(`${base}/api/daemon/db`);
  if (!resp.ok) {
    console.error(`GET /api/daemon/db failed: ${resp.status} ${await resp.text()}`);
    process.exit(1);
  }
  const data = await resp.json();
  if (flags.json) {
    process.stdout.write(JSON.stringify(data, null, 2) + "\n");
    return;
  }
  console.log(`# Daemon DB`);
  console.log(`  kind:           ${data.kind ?? "unknown"}`);
  console.log(`  location:       ${data.location ?? "?"}`);
  console.log(`  size on disk:   ${formatBytes(data.sizeBytes ?? 0)}`);
  console.log(`  schema version: ${data.schemaVersion ?? "(none)"}`);
  console.log(`  tables:`);
  const tables = Array.isArray(data.tables) ? data.tables : [];
  if (tables.length === 0) {
    console.log("    (none)");
  } else {
    const longest = Math.max(...tables.map((t) => t.name.length));
    for (const t of tables) {
      console.log(`    ${t.name.padEnd(longest)}  ${t.rowCount}`);
    }
  }
}
function formatBytes(n) {
  if (n < 1024)
    return `${n} B`;
  if (n < 1024 * 1024)
    return `${(n / 1024).toFixed(1)} KiB`;
  if (n < 1024 * 1024 * 1024)
    return `${(n / 1024 / 1024).toFixed(2)} MiB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GiB`;
}
async function runDaemonStart(flags) {
  const port = Number(flags.port ?? process.env.OD_PORT ?? 7456);
  const host = String(flags.host ?? process.env.OD_BIND_HOST ?? "127.0.0.1");
  const headless = Boolean(flags.headless || flags["no-open"] || flags["serve-web"]);
  process.env.OD_BIND_HOST = host;
  process.env.OD_PORT = String(port);
  const { startServer: startHeadless } = await import("./server-RB3XHRCQ.mjs");
  const started = await startHeadless({ port, host, returnServer: true });
  const url = started.url;
  const server = started.server;
  const shutdown = started.shutdown;
  const closeServer = () => new Promise((resolve) => {
    let resolved = false;
    const resolveOnce = () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    };
    const idleTimer = setTimeout(() => server.closeIdleConnections?.(), 1e3);
    const hardTimer = setTimeout(() => {
      server.closeAllConnections?.();
      resolveOnce();
    }, 5e3);
    idleTimer.unref?.();
    hardTimer.unref?.();
    server.close(() => resolveOnce());
  });
  let shuttingDown = false;
  const stop = () => {
    if (shuttingDown)
      process.exit(0);
    shuttingDown = true;
    void Promise.allSettled([
      Promise.resolve().then(() => shutdown?.()),
      closeServer()
    ]).finally(() => process.exit(0));
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  console.log(`[od] listening on ${url} (${headless ? "headless" : "desktop"})`);
  if (!headless) {
    const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
    import("node:child_process").then(({ spawn }) => {
      spawn(opener, [url], { detached: true, stdio: "ignore" }).unref();
    });
  }
}
async function runDaemonStatus(flags) {
  const base = await cliDaemonBaseUrl(flags);
  let resp;
  try {
    resp = await fetch(`${base}/api/daemon/status`);
  } catch (err) {
    return exitWithStructuredError({
      code: "daemon-not-running",
      message: `Cannot reach daemon at ${base}: ${err?.message ?? err}`
    });
  }
  if (!resp.ok)
    return structuredHttpFailure(resp);
  const data = await resp.json();
  if (flags.json)
    return process.stdout.write(JSON.stringify(data, null, 2) + "\n");
  console.log(`[daemon] ${data.bindHost}:${data.port} v${data.version} pid=${data.pid} plugins=${data.installedPlugins}`);
}
async function runDaemonStop(flags) {
  const base = await cliDaemonBaseUrl(flags);
  let resp;
  try {
    resp = await fetch(`${base}/api/daemon/shutdown`, { method: "POST" });
  } catch (err) {
    return exitWithStructuredError({
      code: "daemon-not-running",
      message: `Cannot reach daemon at ${base}: ${err?.message ?? err}`
    });
  }
  if (!resp.ok)
    return structuredHttpFailure(resp);
  console.log(`[daemon] shutdown scheduled`);
}
async function libraryDaemonUrl(flags) {
  return cliDaemonUrl(flags);
}
async function runAtoms(args) {
  if (args.length === 0 || args[0] === "help" || args.includes("--help") || args.includes("-h")) {
    console.log(`Usage:
  od atoms list             List first-party atoms (implemented + planned).
  od atoms show <id>        Print one atom's metadata.
  od atoms info <id>        Print metadata + the bundled SKILL.md body.

Common options:
  --daemon-url <url>   Open Design daemon HTTP base.
  --json               Emit raw JSON.`);
    process.exit(args.length === 0 ? 2 : 0);
  }
  const sub = args[0];
  const rest = args.slice(1);
  const flags = parseFlags(rest, { string: LIBRARY_STRING_FLAGS, boolean: LIBRARY_BOOLEAN_FLAGS });
  const base = (await libraryDaemonUrl(flags)).replace(/\/$/, "");
  switch (sub) {
    case "list": {
      const resp = await fetch(`${base}/api/atoms`);
      if (!resp.ok)
        return structuredHttpFailure(resp);
      const data = await resp.json();
      if (flags.json)
        return process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      const atoms = data?.atoms ?? [];
      for (const a of atoms) {
        console.log(`${a.id}	${a.status}	[${(a.taskKinds ?? []).join(", ")}]	${a.label}`);
      }
      return;
    }
    case "show": {
      const id = rest.find((a) => !a.startsWith("-"));
      if (!id) {
        console.error("Usage: od atoms show <id>");
        process.exit(2);
      }
      const resp = await fetch(`${base}/api/atoms`);
      if (!resp.ok)
        return structuredHttpFailure(resp);
      const data = await resp.json();
      const atom = (data?.atoms ?? []).find((a) => a.id === id);
      if (!atom) {
        console.error(`atom ${id} not found`);
        process.exit(65);
      }
      process.stdout.write(JSON.stringify(atom, null, 2) + "\n");
      return;
    }
    case "info": {
      const id = rest.find((a) => !a.startsWith("-"));
      if (!id) {
        console.error("Usage: od atoms info <id>");
        process.exit(2);
      }
      const resp = await fetch(`${base}/api/atoms/${encodeURIComponent(id)}`);
      if (resp.status === 404) {
        console.error(`atom ${id} not found`);
        process.exit(65);
      }
      if (!resp.ok)
        return structuredHttpFailure(resp);
      const atom = await resp.json();
      if (flags.json)
        return process.stdout.write(JSON.stringify(atom, null, 2) + "\n");
      console.log(`# ${atom.label} (${atom.id})`);
      console.log(`status:    ${atom.status}`);
      console.log(`taskKinds: ${(atom.taskKinds ?? []).join(", ")}`);
      console.log(`summary:   ${atom.description}`);
      if (typeof atom.skillBody === "string" && atom.skillBody.length > 0) {
        console.log("");
        console.log("--- SKILL.md ---");
        console.log(atom.skillBody.trimEnd());
      } else {
        console.log("");
        console.log("(no bundled SKILL.md body found for this atom)");
      }
      return;
    }
    default:
      console.error(`unknown subcommand: od atoms ${sub}`);
      process.exit(2);
  }
}
async function runLibraryList(name, args) {
  if (args.length === 0 || args[0] === "help" || args.includes("--help") || args.includes("-h")) {
    console.log(`Usage:
  od ${name} list           List ${name}.
  od ${name} show <id>      Print one entry.`);
    process.exit(args.length === 0 ? 2 : 0);
  }
  const sub = args[0];
  const rest = args.slice(1);
  const flags = parseFlags(rest, { string: LIBRARY_STRING_FLAGS, boolean: LIBRARY_BOOLEAN_FLAGS });
  const base = (await libraryDaemonUrl(flags)).replace(/\/$/, "");
  const apiPath = name === "design-systems" ? "/api/design-systems" : `/api/${name}`;
  switch (sub) {
    case "list": {
      const resp = await fetch(`${base}${apiPath}`);
      if (!resp.ok)
        return structuredHttpFailure(resp);
      const data = await resp.json();
      if (flags.json)
        return process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      const rows = data?.[name === "design-systems" ? "designSystems" : name] ?? [];
      for (const row of rows) {
        const label = row.title ?? row.name ?? row.id ?? row.label;
        console.log(`${row.id}	${label}`);
      }
      return;
    }
    case "show": {
      const id = rest.find((a) => !a.startsWith("-"));
      if (!id) {
        console.error(`Usage: od ${name} show <id>`);
        process.exit(2);
      }
      const resp = await fetch(`${base}${apiPath}/${encodeURIComponent(id)}`);
      if (!resp.ok)
        return structuredHttpFailure(resp);
      const data = await resp.json();
      process.stdout.write(JSON.stringify(data, null, 2) + "\n");
      return;
    }
    default:
      console.error(`unknown subcommand: od ${name} ${sub}`);
      process.exit(2);
  }
}
async function runSkills(args) {
  return runLibraryList("skills", args);
}
async function runCraft(args) {
  return runLibraryList("craft", args);
}
async function runDesignSystems(args) {
  if (args[0] === "rename")
    return runDesignSystemRename(args.slice(1));
  if (!args[0] || isDesignSystemsHelpArg(args[0])) {
    console.log(DESIGN_SYSTEMS_USAGE2);
    process.exit(isDesignSystemsHelpArg(args[0]) ? 0 : 2);
  }
  return runLibraryList("design-systems", args);
}
async function runDesignSystemRename(args) {
  if (args.length === 0 || args[0] === "help" || args.includes("--help") || args.includes("-h")) {
    console.log(`Usage:
  od design-systems rename <id> --title <new-title> [--json] [--daemon-url <url>]
  od design-systems rename <id> "<new title>" [--json]

Renames an editable (user-created) design system. Built-in systems are read-only.`);
    process.exit(args.length === 0 ? 2 : 0);
  }
  const parsed = parseDesignSystemRenameArgs(args);
  if (!parsed) {
    console.error("Usage: od design-systems rename <id> --title <new-title>");
    process.exit(2);
  }
  const flags = parseFlags(args, {
    string: /* @__PURE__ */ new Set([...LIBRARY_STRING_FLAGS, "title"]),
    boolean: LIBRARY_BOOLEAN_FLAGS
  });
  const base = (await libraryDaemonUrl(flags)).replace(/\/$/, "");
  const resp = await fetch(`${base}/api/design-systems/${encodeURIComponent(parsed.id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: parsed.title })
  });
  if (!resp.ok)
    return structuredHttpFailure(resp);
  const data = await resp.json();
  if (flags.json)
    return process.stdout.write(JSON.stringify(data, null, 2) + "\n");
  const renamed = data.designSystem ?? data;
  console.log(`Renamed ${parsed.id} -> ${renamed.title ?? parsed.title}`);
}
async function runStatus(args) {
  return runDaemon(["status", ...args]);
}
var DIAGNOSTICS_STRING_FLAGS = /* @__PURE__ */ new Set(["daemon-url", "output"]);
var DIAGNOSTICS_BOOLEAN_FLAGS = /* @__PURE__ */ new Set(["help", "h", "json"]);
async function runDiagnostics(args) {
  const sub = args[0];
  if (!sub || sub === "help" || args.includes("--help") || args.includes("-h")) {
    console.log(`Usage:
  od diagnostics export [<path>] [--output <path>] [--json] [--daemon-url <url>]

Bundles daemon/web/desktop logs, machine info, and recent crash reports
into a zip. The bundle is the same one Settings \u2192 About \u2192 Export
diagnostics produces.

  <path>                 Where to write the zip. Defaults to
                         ./open-design-diagnostics-<timestamp>.zip in the
                         current working directory. Alias: --output <path>.
  --json                 Print {path, sizeBytes} on stdout instead of a
                         human-readable summary. The file is still written
                         to <path>.
  --daemon-url <url>     Override the daemon HTTP base URL.`);
    process.exit(0);
  }
  if (sub !== "export") {
    console.error(`unknown subcommand: od diagnostics ${sub}`);
    process.exit(2);
  }
  const flags = parseFlags(args.slice(1), {
    string: DIAGNOSTICS_STRING_FLAGS,
    boolean: DIAGNOSTICS_BOOLEAN_FLAGS
  });
  const positional = args.slice(1).filter((a) => !a.startsWith("-"));
  const base = (await libraryDaemonUrl(flags)).replace(/\/$/, "");
  const { DIAGNOSTICS_EXPORT_PATH, DIAGNOSTICS_FILENAME_PREFIX, diagnosticsFileName } = await import("./dist-VXYW5YWW.mjs");
  const fs = await import("node:fs/promises");
  const path3 = await import("node:path");
  const explicitOutput = typeof flags.output === "string" && flags.output.length > 0 ? flags.output : positional[0];
  const targetPath = path3.resolve(explicitOutput ?? diagnosticsFileName(DIAGNOSTICS_FILENAME_PREFIX));
  let resp;
  try {
    resp = await fetch(`${base}${DIAGNOSTICS_EXPORT_PATH}`);
  } catch (err) {
    return exitWithStructuredError({
      code: "daemon-not-running",
      message: `Cannot reach daemon at ${base}: ${err?.message ?? err}`
    });
  }
  if (!resp.ok)
    return structuredHttpFailure(resp);
  const buf = Buffer.from(await resp.arrayBuffer());
  await fs.mkdir(path3.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, buf);
  if (flags.json) {
    process.stdout.write(JSON.stringify({ path: targetPath, sizeBytes: buf.length }) + "\n");
    return;
  }
  console.log(`Wrote diagnostics bundle to ${targetPath} (${buf.length} bytes).`);
}
async function runVersion(args) {
  const flags = parseFlags(args, { string: LIBRARY_STRING_FLAGS, boolean: LIBRARY_BOOLEAN_FLAGS });
  const base = (await libraryDaemonUrl(flags)).replace(/\/$/, "");
  let resp;
  try {
    resp = await fetch(`${base}/api/version`);
  } catch (err) {
    return exitWithStructuredError({
      code: "daemon-not-running",
      message: `Cannot reach daemon at ${base}: ${err?.message ?? err}`
    });
  }
  if (!resp.ok)
    return structuredHttpFailure(resp);
  const data = await resp.json();
  if (flags.json)
    return process.stdout.write(JSON.stringify(data, null, 2) + "\n");
  const version = typeof data?.version === "string" ? data.version : data?.version?.version ?? JSON.stringify(data);
  console.log(version);
}
var CONFIG_STRING_FLAGS = /* @__PURE__ */ new Set(["daemon-url", "value", "value-json"]);
var CONFIG_BOOLEAN_FLAGS = /* @__PURE__ */ new Set(["help", "h", "json"]);
async function runDoctor(args) {
  const flags = parseFlags(args, { string: CONFIG_STRING_FLAGS, boolean: CONFIG_BOOLEAN_FLAGS });
  if (flags.help || flags.h) {
    console.log(`Usage:
  od doctor [--json]   Print a daemon + plugin + design-library health summary.

Exit code is non-zero when any installed plugin's doctor returns ok=false
or the daemon cannot be reached.`);
    process.exit(0);
  }
  const base = (await libraryDaemonUrl(flags)).replace(/\/$/, "");
  const report = {
    daemon: null,
    plugins: [],
    skills: [],
    designSystems: [],
    atoms: [],
    issues: []
  };
  try {
    const resp = await fetch(`${base}/api/daemon/status`);
    if (!resp.ok) {
      report.issues.push({ severity: "error", code: "daemon-status", message: `HTTP ${resp.status}` });
    } else {
      report.daemon = await resp.json();
    }
  } catch (err) {
    report.issues.push({ severity: "error", code: "daemon-not-running", message: String(err?.message ?? err) });
    if (flags.json) {
      process.stdout.write(JSON.stringify(report, null, 2) + "\n");
    } else {
      console.error("[doctor] daemon unreachable:", String(err?.message ?? err));
    }
    process.exit(64);
  }
  try {
    const [skillsResp, dsResp, atomsResp] = await Promise.all([
      fetch(`${base}/api/skills`),
      fetch(`${base}/api/design-systems`),
      fetch(`${base}/api/atoms`)
    ]);
    if (skillsResp.ok) {
      const data = await skillsResp.json();
      report.skills = data?.skills ?? [];
    }
    if (dsResp.ok) {
      const data = await dsResp.json();
      report.designSystems = data?.designSystems ?? [];
    }
    if (atomsResp.ok) {
      const data = await atomsResp.json();
      report.atoms = data?.atoms ?? [];
    }
  } catch (err) {
    report.issues.push({ severity: "warn", code: "library-list-failed", message: String(err?.message ?? err) });
  }
  try {
    const listResp = await fetch(`${base}/api/plugins`);
    if (listResp.ok) {
      const list = await listResp.json();
      const plugins = list?.plugins ?? [];
      for (const p of plugins) {
        try {
          const doctorResp = await fetch(`${base}/api/plugins/${encodeURIComponent(p.id)}/doctor`, { method: "POST" });
          const data = await doctorResp.json().catch(() => ({}));
          report.plugins.push({ id: p.id, version: p.version, ok: !!data?.ok, issues: data?.issues ?? [] });
          if (!data?.ok) {
            report.issues.push({
              severity: "error",
              code: "plugin-doctor-failed",
              message: `${p.id}@${p.version}: ${(data?.issues ?? []).map((i) => i.code).join(", ")}`
            });
          }
        } catch (err) {
          report.issues.push({
            severity: "warn",
            code: "plugin-doctor-error",
            message: `${p.id}: ${err?.message ?? err}`
          });
        }
      }
    }
  } catch (err) {
    report.issues.push({ severity: "warn", code: "plugin-list-failed", message: String(err?.message ?? err) });
  }
  if (flags.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    console.log(`[doctor] daemon ${report.daemon?.bindHost ?? "?"}:${report.daemon?.port ?? "?"} pid=${report.daemon?.pid ?? "?"}`);
    console.log(`[doctor] plugins: ${report.plugins.length} (skills ${report.skills.length}, design-systems ${report.designSystems.length}, atoms ${report.atoms.length})`);
    if (report.issues.length === 0) {
      console.log("[doctor] no issues");
    } else {
      for (const i of report.issues) {
        console.log(`  [${i.severity}] ${i.code}: ${i.message}`);
      }
    }
  }
  const hasError = report.issues.some((i) => i.severity === "error");
  process.exit(hasError ? 1 : 0);
}
async function runConfig(args) {
  if (args.length === 0 || args[0] === "help" || args.includes("--help") || args.includes("-h")) {
    console.log(`Usage:
  od config list                      Print the full app config as JSON.
  od config get <key>                 Print one top-level key.
  od config set <key> <value>         Set a top-level key (string / number / boolean).
  od config set <key> --value-json '<json>'
                                       Set a key to a JSON value.
  od config unset <key>               Remove a top-level key.

Common options:
  --daemon-url <url>   Open Design daemon HTTP base.
  --json               Emit raw JSON.`);
    process.exit(args.length === 0 ? 2 : 0);
  }
  const sub = args[0];
  const rest = args.slice(1);
  const flags = parseFlags(rest, { string: CONFIG_STRING_FLAGS, boolean: CONFIG_BOOLEAN_FLAGS });
  const base = (await libraryDaemonUrl(flags)).replace(/\/$/, "");
  const fetchConfig = async () => {
    const resp = await fetch(`${base}/api/app-config`);
    if (!resp.ok)
      return structuredHttpFailure(resp);
    const data = await resp.json();
    return data?.config ?? {};
  };
  const writeConfig = async (next) => {
    const resp = await fetch(`${base}/api/app-config`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next)
    });
    if (!resp.ok)
      return structuredHttpFailure(resp);
    return (await resp.json())?.config ?? next;
  };
  switch (sub) {
    case "list": {
      const cfg = await fetchConfig();
      process.stdout.write(JSON.stringify(cfg, null, 2) + "\n");
      return;
    }
    case "get": {
      const key = rest.find((a) => !a.startsWith("-"));
      if (!key) {
        console.error("Usage: od config get <key>");
        process.exit(2);
      }
      const cfg = await fetchConfig();
      const value = cfg?.[key];
      if (flags.json) {
        process.stdout.write(JSON.stringify(value ?? null, null, 2) + "\n");
      } else {
        console.log(value === void 0 ? "" : typeof value === "string" ? value : JSON.stringify(value, null, 2));
      }
      return;
    }
    case "set": {
      const positional = rest.filter((a) => !a.startsWith("-") && a !== flags.value && a !== flags["value-json"]);
      const [key, scalarValue] = positional;
      if (!key) {
        console.error("Usage: od config set <key> <value> | od config set <key> --value-json <json>");
        process.exit(2);
      }
      let parsed;
      if (typeof flags["value-json"] === "string") {
        try {
          parsed = JSON.parse(flags["value-json"]);
        } catch (err) {
          console.error(`--value-json must be valid JSON: ${err.message}`);
          process.exit(2);
        }
      } else if (typeof flags.value === "string") {
        parsed = coerceCliValue(flags.value);
      } else if (scalarValue !== void 0) {
        parsed = coerceCliValue(scalarValue);
      } else {
        console.error("Provide a value (positional, --value, or --value-json).");
        process.exit(2);
      }
      const cfg = await fetchConfig();
      const next = { ...cfg, [key]: parsed };
      const written = await writeConfig(next);
      if (flags.json) {
        process.stdout.write(JSON.stringify(written, null, 2) + "\n");
      } else {
        console.log(`[config] set ${key}`);
      }
      return;
    }
    case "unset": {
      const key = rest.find((a) => !a.startsWith("-"));
      if (!key) {
        console.error("Usage: od config unset <key>");
        process.exit(2);
      }
      const cfg = await fetchConfig();
      const next = { ...cfg };
      delete next[key];
      const written = await writeConfig(next);
      if (flags.json) {
        process.stdout.write(JSON.stringify(written, null, 2) + "\n");
      } else {
        console.log(`[config] unset ${key}`);
      }
      return;
    }
    default:
      console.error(`unknown subcommand: od config ${sub}`);
      process.exit(2);
  }
}
function printMemoryHelp() {
  console.log(`Usage:
  od memory tree list [--json]
      List derived memory-tree folders and entry nodes.

  od memory tree view <id> [--json]
      Print one folder node or entry body.

  od memory tree edit <id> [--name <title>] [--description <text>]
                       [--type user|feedback|project|reference]
                       [--body <markdown> | --body-file <path|->] [--json]
      Patch an editable entry node. Folder nodes are derived from entry types.

  od memory tree move <id> --type user|feedback|project|reference [--json]
      Move an entry node to a different memory bucket while preserving its id.

Common options:
  --daemon-url <url>   Open Design daemon HTTP base.`);
}
function memoryPositionals(values) {
  const out = [];
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (!value)
      continue;
    if (value.startsWith("--")) {
      const eq = value.indexOf("=");
      const key = eq >= 0 ? value.slice(2, eq) : value.slice(2);
      if (eq < 0 && MEMORY_STRING_FLAGS.has(key))
        i++;
      continue;
    }
    out.push(value);
  }
  return out;
}
async function readMemoryBodyFromFlags(flags) {
  if (typeof flags.body === "string")
    return flags.body;
  if (typeof flags["body-file"] !== "string")
    return void 0;
  const path3 = flags["body-file"];
  if (path3 === "-") {
    let body = "";
    for await (const chunk of process.stdin)
      body += chunk;
    return body;
  }
  const { readFile: readFile3 } = await import("node:fs/promises");
  return await readFile3(path3, "utf8");
}
function formatMemoryTreeRow(node) {
  return [
    node.id,
    node.parentId ?? "-",
    node.path,
    node.kind,
    node.type ?? "-",
    node.scope,
    node.name
  ].join("	");
}
function printMemoryEntry(entry) {
  console.log(`# ${entry.name}`);
  console.log(`id: ${entry.id}`);
  console.log(`type: ${entry.type}`);
  console.log(`description: ${entry.description || "-"}`);
  console.log("");
  process.stdout.write(`${entry.body ?? ""}
`);
}
async function fetchMemoryTree(base) {
  let resp;
  try {
    resp = await fetch(`${base}/api/memory/tree`);
  } catch (err) {
    surfaceFetchError(err, base);
    process.exit(3);
  }
  if (!resp.ok)
    return structuredHttpFailure(resp);
  return await resp.json();
}
async function patchMemoryTreeNode(base, id, body) {
  let resp;
  try {
    resp = await fetch(`${base}/api/memory/tree/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (err) {
    surfaceFetchError(err, base);
    process.exit(3);
  }
  if (!resp.ok)
    return structuredHttpFailure(resp);
  return await resp.json();
}
async function runMemory(args) {
  if (args.length === 0 || args[0] === "help" || args.includes("--help") || args.includes("-h")) {
    printMemoryHelp();
    process.exit(args.length === 0 ? 2 : 0);
  }
  const topic = args[0];
  if (topic !== "tree") {
    console.error(`unknown subcommand: od memory ${topic}`);
    printMemoryHelp();
    process.exit(2);
  }
  const rest = args.slice(1);
  let flags;
  try {
    flags = parseFlags(rest, {
      string: MEMORY_STRING_FLAGS,
      boolean: MEMORY_BOOLEAN_FLAGS
    });
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }
  const base = await cliDaemonBaseUrl(flags);
  const writeJson5 = (data) => process.stdout.write(JSON.stringify(data, null, 2) + "\n");
  const parts = memoryPositionals(rest);
  const action = parts[0] ?? "list";
  if (action === "list") {
    const data = await fetchMemoryTree(base);
    if (flags.json)
      return writeJson5(data);
    const tree = data.tree ?? [];
    if (tree.length === 0) {
      console.log("No memory tree nodes.");
      return;
    }
    console.log("# id	parent	path	kind	type	scope	name");
    for (const node of tree)
      console.log(formatMemoryTreeRow(node));
    return;
  }
  if (action === "view") {
    const id = parts[1];
    if (!id) {
      console.error("Usage: od memory tree view <id>");
      process.exit(2);
    }
    const treeData = await fetchMemoryTree(base);
    const node = (treeData.tree ?? []).find((item) => item.id === id);
    if (!node) {
      console.error(`memory tree node not found: ${id}`);
      process.exit(4);
    }
    if (node.kind === "folder") {
      if (flags.json)
        return writeJson5({ node });
      console.log(`${node.path}	${node.name}	${node.childrenCount ?? 0} children`);
      return;
    }
    let resp;
    try {
      resp = await fetch(`${base}/api/memory/${encodeURIComponent(id)}`);
    } catch (err) {
      surfaceFetchError(err, base);
      process.exit(3);
    }
    if (!resp.ok)
      return structuredHttpFailure(resp);
    const data = await resp.json();
    if (flags.json)
      return writeJson5(data);
    printMemoryEntry(data.entry ?? data);
    return;
  }
  if (action === "edit") {
    const id = parts[1];
    if (!id) {
      console.error("Usage: od memory tree edit <id> [--name ...] [--description ...] [--type ...] [--body ...|--body-file ...]");
      process.exit(2);
    }
    const body = {};
    if (typeof flags.name === "string")
      body.name = flags.name;
    if (typeof flags.description === "string")
      body.description = flags.description;
    if (typeof flags.type === "string")
      body.type = flags.type;
    const nextBody = await readMemoryBodyFromFlags(flags);
    if (typeof nextBody === "string")
      body.body = nextBody;
    if (Object.keys(body).length === 0) {
      console.error("nothing to edit; pass --name, --description, --type, --body, or --body-file");
      process.exit(2);
    }
    const data = await patchMemoryTreeNode(base, id, body);
    if (flags.json)
      return writeJson5(data);
    console.log(`[memory] updated ${data.entry?.id ?? id}`);
    return;
  }
  if (action === "move") {
    const id = parts[1];
    const type = flags.type ?? parts[2];
    if (!id || !type) {
      console.error("Usage: od memory tree move <id> --type user|feedback|project|reference");
      process.exit(2);
    }
    const data = await patchMemoryTreeNode(base, id, { type });
    if (flags.json)
      return writeJson5(data);
    console.log(`[memory] moved ${data.entry?.id ?? id} to ${data.entry?.type ?? type}`);
    return;
  }
  console.error(`unknown subcommand: od memory tree ${action}`);
  printMemoryHelp();
  process.exit(2);
}
function parseScheduleFlag(raw) {
  if (!raw || typeof raw !== "string") {
    throw new Error("--schedule is required. Forms: hourly:<minute> | daily:HH:MM[:TZ] | weekdays:HH:MM[:TZ] | weekly:DAY:HH:MM[:TZ]");
  }
  const parts = raw.split(":");
  const kind = parts[0];
  if (kind === "hourly") {
    const minute = Number(parts[1]);
    if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
      throw new Error("--schedule hourly requires :<minute>, 0-59");
    }
    return { kind: "hourly", minute };
  }
  if (kind === "daily" || kind === "weekdays") {
    if (parts.length < 3) {
      throw new Error(`--schedule ${kind} requires :HH:MM[:TZ]`);
    }
    const hh = parts[1];
    const mm = parts[2];
    const time = `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}`;
    if (!/^[0-2]\d:[0-5]\d$/.test(time)) {
      throw new Error(`--schedule ${kind} time must be HH:MM (24h)`);
    }
    const timezone = parts.slice(3).join(":") || "UTC";
    return { kind, time, timezone };
  }
  if (kind === "weekly") {
    if (parts.length < 4) {
      throw new Error("--schedule weekly requires :DAY:HH:MM[:TZ] (DAY is 0-6 or sun/mon/...)");
    }
    const dayToken = String(parts[1]).toLowerCase();
    let weekday;
    if (/^[0-6]$/.test(dayToken)) {
      weekday = Number(dayToken);
    } else if (AUTOMATION_WEEKDAY_TOKENS[dayToken] !== void 0) {
      weekday = AUTOMATION_WEEKDAY_TOKENS[dayToken];
    } else {
      throw new Error(`--schedule weekly day must be 0-6 or sun..sat (got "${parts[1]}")`);
    }
    const time = `${parts[2].padStart(2, "0")}:${parts[3].padStart(2, "0")}`;
    if (!/^[0-2]\d:[0-5]\d$/.test(time)) {
      throw new Error("--schedule weekly time must be HH:MM (24h)");
    }
    const timezone = parts.slice(4).join(":") || "UTC";
    return { kind: "weekly", weekday, time, timezone };
  }
  throw new Error(`--schedule kind must be hourly|daily|weekdays|weekly (got "${kind}")`);
}
function parseAutomationTarget(flags) {
  const raw = flags.target;
  if (raw == null) {
    if (flags.project)
      return { mode: "reuse", projectId: String(flags.project) };
    return { mode: "create_each_run" };
  }
  const value = String(raw);
  if (value === "worktree" || value === "new-project" || value === "create-each-run" || value === "create_each_run") {
    return { mode: "create_each_run" };
  }
  if (value === "reuse") {
    if (!flags.project) {
      throw new Error("--target reuse needs --project <id>");
    }
    return { mode: "reuse", projectId: String(flags.project) };
  }
  const eq = value.indexOf("=");
  if ((value.startsWith("reuse=") || value.startsWith("reuse:")) && eq > 0) {
    const projectId = value.slice(eq + 1).trim();
    if (!projectId)
      throw new Error("--target reuse=<projectId> needs a non-empty id");
    return { mode: "reuse", projectId };
  }
  throw new Error(`--target must be "new-project" or "reuse=<projectId>" (got "${value}")`);
}
function describeAutomationScheduleForCli(schedule) {
  if (!schedule)
    return "-";
  if (schedule.kind === "hourly") {
    return `hourly:${String(schedule.minute).padStart(2, "0")}`;
  }
  if (schedule.kind === "weekly") {
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    return `weekly:${days[schedule.weekday] ?? schedule.weekday}:${schedule.time}:${schedule.timezone}`;
  }
  return `${schedule.kind}:${schedule.time}:${schedule.timezone}`;
}
function describeAutomationTargetForCli(target) {
  if (!target)
    return "-";
  if (target.mode === "reuse")
    return `reuse=${target.projectId}`;
  return "new-project";
}
function splitAutomationIds(value) {
  if (typeof value !== "string" || value.trim().length === 0)
    return [];
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const part of value.split(",")) {
    const id = part.trim();
    if (!id || seen.has(id))
      continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}
function automationContextFromFlags(flags) {
  const skillIds = splitAutomationIds(flags.skill);
  const pluginIds = splitAutomationIds(flags.plugin);
  const mcpServerIds = splitAutomationIds(flags.mcp);
  const connectorIds = splitAutomationIds(flags.connector);
  const context = {
    ...skillIds.length > 0 ? { skillIds } : {},
    ...pluginIds.length > 0 ? { pluginIds } : {},
    ...mcpServerIds.length > 0 ? { mcpServerIds } : {},
    ...connectorIds.length > 0 ? { connectorIds } : {}
  };
  return Object.keys(context).length > 0 ? context : null;
}
function formatAutomationRow(r) {
  const next = r.nextRunAt ? new Date(r.nextRunAt).toISOString() : r.enabled ? "-" : "paused";
  return [
    r.id,
    r.name,
    describeAutomationScheduleForCli(r.schedule),
    describeAutomationTargetForCli(r.target),
    r.enabled ? "enabled" : "paused",
    next
  ].join("	");
}
async function readPromptFromFlags(flags) {
  if (typeof flags.prompt === "string" && flags.prompt.length > 0) {
    return flags.prompt;
  }
  if (typeof flags["prompt-file"] === "string" && flags["prompt-file"].length > 0) {
    const path3 = flags["prompt-file"];
    if (path3 === "-") {
      return await new Promise((resolve, reject) => {
        let buf = "";
        process.stdin.setEncoding("utf8");
        process.stdin.on("data", (chunk) => {
          buf += chunk;
        });
        process.stdin.on("end", () => resolve(buf));
        process.stdin.on("error", reject);
      });
    }
    const { readFile: readFile3 } = await import("node:fs/promises");
    return await readFile3(path3, "utf8");
  }
  return null;
}
function printAutomationHelp() {
  console.log(`Usage:
  od automation template list                                List built-in automation templates.
  od automation template get <id>                            Print one built-in automation template.
  od automation source ingest --source-kind <kind> --title <title>
                              [--source-ref <ref>] [--template <id>]
                              [--body <markdown> | --body-file <path|->]
                              [--connector <id>] [--compression off|balanced|aggressive]
                              [--json]
  od automation source list [--limit 20] [--json]             List ingested source packets.
  od automation source get <id> [--json]                      Print one source packet.
  od automation proposal list [--status pending-review]       List self-evolution proposals.
  od automation proposal get <id>                             Print one proposal.
  od automation proposal apply <id>                           Apply a reviewable proposal.
  od automation proposal reject <id> [--reason "<why>"]       Reject a reviewable proposal.
  od automation list                                         List automations.
  od automation get <id>                                     Print one automation.
  od automation create --name "<title>" --prompt "<text>"
                       --schedule <spec>
                       [--target new-project|reuse=<projectId>]
                       [--disabled] [--json]
                       [--prompt-file <path|->] (alternative to --prompt)
                       [--skill <id>[,<id>]] [--plugin <id>[,<id>]]
                       [--mcp <id>[,<id>]] [--connector <id>[,<id>]]
                       [--agent <id>]
  od automation update <id> [--name ...] [--prompt ...]
                            [--schedule ...] [--target ...]
                            [--skill ...] [--plugin ...] [--mcp ...]
                            [--connector ...] [--enabled|--disabled]
                            Patch fields.
  od automation run <id>                                       Trigger a manual run; prints projectId/conversationId.
  od automation runs <id> [--limit 10]                         Print run history.
  od automation crystallize-run <routineId> <runId> [--json]    Turn a succeeded run into skill/memory proposals.
  od automation pause <id>                                     Mark disabled.
  od automation resume <id>                                    Mark enabled.
  od automation delete <id>                                    Remove the automation (history retained).

Schedule formats:
  hourly:<minute>                    Every hour at :MM.
  daily:HH:MM[:TZ]                   Daily at HH:MM in TZ (default UTC).
  weekdays:HH:MM[:TZ]                Mon-Fri at HH:MM.
  weekly:DAY:HH:MM[:TZ]              DAY = 0-6 or sun|mon|...|sat.

Output:
  Plain text: tab-separated rows for list, human-readable lines for get / runs.
  --json     Raw JSON for any subcommand.
  Designed so external agents (hermes-agent, openclaw, scripted jobs)
  can drive the full automation lifecycle headlessly.

Common options:
  --daemon-url <url>   Open Design daemon HTTP base.`);
}
async function runAutomation(args) {
  if (args.length === 0 || args[0] === "help" || args.includes("--help") || args.includes("-h")) {
    printAutomationHelp();
    process.exit(args.length === 0 ? 2 : 0);
  }
  const sub = args[0];
  const rest = args.slice(1);
  let flags;
  try {
    flags = parseFlags(rest, {
      string: AUTOMATION_STRING_FLAGS,
      boolean: AUTOMATION_BOOLEAN_FLAGS
    });
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }
  const base = await cliDaemonBaseUrl(flags);
  const writeJson5 = (data) => process.stdout.write(JSON.stringify(data, null, 2) + "\n");
  const positionalArgs2 = (values) => {
    const out = [];
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (!value)
        continue;
      if (value.startsWith("--")) {
        const eq = value.indexOf("=");
        const key = eq >= 0 ? value.slice(2, eq) : value.slice(2);
        if (eq < 0 && AUTOMATION_STRING_FLAGS.has(key))
          i++;
        continue;
      }
      out.push(value);
    }
    return out;
  };
  const requireId = (label) => {
    const id = positionalArgs2(rest)[0];
    if (!id) {
      console.error(`Usage: od automation ${label} <id>`);
      process.exit(2);
    }
    return id;
  };
  const readAutomationIngestBody = async () => {
    const direct = await readMemoryBodyFromFlags(flags);
    if (typeof direct === "string")
      return direct;
    return await readPromptFromFlags(flags);
  };
  switch (sub) {
    case "template":
    case "templates": {
      const parts = positionalArgs2(rest);
      const action = parts[0] ?? "list";
      if (action === "list") {
        let resp;
        try {
          resp = await fetch(`${base}/api/automation-templates`);
        } catch (err) {
          surfaceFetchError(err, base);
          process.exit(3);
        }
        if (!resp.ok)
          return structuredHttpFailure(resp);
        const data = await resp.json();
        if (flags.json)
          return writeJson5(data);
        const templates = data.templates ?? [];
        if (templates.length === 0) {
          console.log("No automation templates available.");
          return;
        }
        console.log("# id	title	triggers	sources	outputs	compression	review");
        for (const template of templates) {
          console.log([
            template.id,
            template.title,
            (template.triggerKinds ?? []).join(","),
            (template.sourceKinds ?? []).join(","),
            (template.outputSinks ?? []).join(","),
            template.tokenCompression,
            template.reviewPolicy
          ].join("	"));
        }
        return;
      }
      if (action === "get") {
        const id = parts[1];
        if (!id) {
          console.error("Usage: od automation template get <id>");
          process.exit(2);
        }
        let resp;
        try {
          resp = await fetch(`${base}/api/automation-templates/${encodeURIComponent(id)}`);
        } catch (err) {
          surfaceFetchError(err, base);
          process.exit(3);
        }
        if (!resp.ok)
          return structuredHttpFailure(resp);
        const data = await resp.json();
        return writeJson5(flags.json ? data : data.template ?? data);
      }
      console.error(`unknown subcommand: od automation template ${action}`);
      printAutomationHelp();
      process.exit(2);
    }
    case "ingest":
    case "source":
    case "sources": {
      const parts = positionalArgs2(rest);
      const action = sub === "ingest" ? "ingest" : parts[0] ?? "list";
      if (action === "ingest") {
        const sourceKind = flags["source-kind"] ?? (sub === "ingest" ? parts[0] : parts[1]);
        if (!sourceKind) {
          console.error("Usage: od automation source ingest --source-kind <kind> --body-file <path|->");
          process.exit(2);
        }
        const bodyMarkdown = await readAutomationIngestBody();
        if (!bodyMarkdown) {
          console.error("--body, --body-file, --prompt, or --prompt-file is required");
          process.exit(2);
        }
        const candidateSinks = typeof flags["candidate-sinks"] === "string" ? flags["candidate-sinks"].split(",").map((item) => item.trim()).filter(Boolean) : void 0;
        let resp;
        try {
          resp = await fetch(`${base}/api/automation-ingestions`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              templateId: flags.template,
              sourceKind,
              sourceRef: flags["source-ref"],
              title: flags.title ?? flags.name,
              bodyMarkdown,
              projectId: flags.project,
              connectorId: flags.connector,
              accountLabel: flags.account,
              sensitivity: flags.sensitivity,
              tokenCompression: flags.compression,
              candidateSinks,
              memoryType: flags["memory-type"]
            })
          });
        } catch (err) {
          surfaceFetchError(err, base);
          process.exit(3);
        }
        if (!resp.ok)
          return structuredHttpFailure(resp);
        const data = await resp.json();
        if (flags.json)
          return writeJson5(data);
        console.log(`[automation source] ingested ${data.packet?.id}`);
        console.log(`compression: ${data.compressionReport?.status ?? "unknown"} (${data.compressionReport?.beforeTokens ?? 0} -> ${data.compressionReport?.afterTokens ?? 0} tokens)`);
        const proposals = data.proposals ?? [];
        if (proposals.length > 0) {
          console.log("# proposals");
          for (const proposal of proposals) {
            console.log([
              proposal.id,
              proposal.targetKind,
              proposal.action,
              proposal.status,
              proposal.title
            ].join("	"));
          }
        }
        return;
      }
      if (action === "list") {
        const query = flags.limit ? `?limit=${encodeURIComponent(String(flags.limit))}` : "";
        let resp;
        try {
          resp = await fetch(`${base}/api/automation-source-packets${query}`);
        } catch (err) {
          surfaceFetchError(err, base);
          process.exit(3);
        }
        if (!resp.ok)
          return structuredHttpFailure(resp);
        const data = await resp.json();
        if (flags.json)
          return writeJson5(data);
        const packets = data.packets ?? [];
        if (packets.length === 0) {
          console.log("No automation source packets.");
          return;
        }
        console.log("# id	kind	capturedAt	tokens	title");
        for (const packet of packets) {
          console.log([
            packet.id,
            packet.sourceKind,
            packet.capturedAt,
            packet.tokenStats?.originalTokens ?? 0,
            packet.title
          ].join("	"));
        }
        return;
      }
      if (action === "get") {
        const id = parts[1];
        if (!id) {
          console.error("Usage: od automation source get <id>");
          process.exit(2);
        }
        let resp;
        try {
          resp = await fetch(`${base}/api/automation-source-packets/${encodeURIComponent(id)}`);
        } catch (err) {
          surfaceFetchError(err, base);
          process.exit(3);
        }
        if (!resp.ok)
          return structuredHttpFailure(resp);
        return writeJson5(await resp.json());
      }
      console.error(`unknown subcommand: od automation source ${action}`);
      printAutomationHelp();
      process.exit(2);
    }
    case "proposal":
    case "proposals": {
      const parts = positionalArgs2(rest);
      const action = parts[0] ?? "list";
      if (action === "list") {
        const query = flags.status ? `?status=${encodeURIComponent(String(flags.status))}` : "";
        let resp;
        try {
          resp = await fetch(`${base}/api/automation-proposals${query}`);
        } catch (err) {
          surfaceFetchError(err, base);
          process.exit(3);
        }
        if (!resp.ok)
          return structuredHttpFailure(resp);
        const data = await resp.json();
        if (flags.json)
          return writeJson5(data);
        const proposals = data.proposals ?? [];
        if (proposals.length === 0) {
          console.log("No automation proposals.");
          return;
        }
        console.log("# id	status	target	action	updatedAt	title");
        for (const proposal of proposals) {
          console.log([
            proposal.id,
            proposal.status,
            proposal.targetKind,
            proposal.action,
            proposal.updatedAt,
            proposal.title
          ].join("	"));
        }
        return;
      }
      if (action === "get") {
        const id = parts[1];
        if (!id) {
          console.error("Usage: od automation proposal get <id>");
          process.exit(2);
        }
        let resp;
        try {
          resp = await fetch(`${base}/api/automation-proposals/${encodeURIComponent(id)}`);
        } catch (err) {
          surfaceFetchError(err, base);
          process.exit(3);
        }
        if (!resp.ok)
          return structuredHttpFailure(resp);
        return writeJson5(await resp.json());
      }
      if (action === "apply" || action === "reject") {
        const id = parts[1];
        if (!id) {
          console.error(`Usage: od automation proposal ${action} <id>`);
          process.exit(2);
        }
        let resp;
        try {
          resp = await fetch(`${base}/api/automation-proposals/${encodeURIComponent(id)}/${action}`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: action === "reject" ? JSON.stringify({ reason: flags.reason ?? "" }) : "{}"
          });
        } catch (err) {
          surfaceFetchError(err, base);
          process.exit(3);
        }
        if (!resp.ok)
          return structuredHttpFailure(resp);
        const data = await resp.json();
        if (flags.json)
          return writeJson5(data);
        console.log(`[automation proposal] ${action === "apply" ? "applied" : "rejected"} ${data.proposal?.id ?? id}`);
        return;
      }
      console.error(`unknown subcommand: od automation proposal ${action}`);
      printAutomationHelp();
      process.exit(2);
    }
    case "list": {
      let resp;
      try {
        resp = await fetch(`${base}/api/routines`);
      } catch (err) {
        surfaceFetchError(err, base);
        process.exit(3);
      }
      if (!resp.ok)
        return structuredHttpFailure(resp);
      const data = await resp.json();
      if (flags.json)
        return writeJson5(data);
      const routines = data.routines ?? [];
      if (routines.length === 0) {
        console.log('No automations. Create one with `od automation create --name "..." --prompt "..." --schedule daily:09:00`.');
        return;
      }
      console.log("# id	name	schedule	target	status	nextRun");
      for (const r of routines)
        console.log(formatAutomationRow(r));
      return;
    }
    case "get": {
      const id = requireId("get");
      let resp;
      try {
        resp = await fetch(`${base}/api/routines/${encodeURIComponent(id)}`);
      } catch (err) {
        surfaceFetchError(err, base);
        process.exit(3);
      }
      if (!resp.ok)
        return structuredHttpFailure(resp);
      const data = await resp.json();
      if (flags.json)
        return writeJson5(data);
      writeJson5(data.routine ?? data);
      return;
    }
    case "runs": {
      const id = requireId("runs");
      const limit = Number(flags.limit) > 0 ? Number(flags.limit) : 20;
      let resp;
      try {
        resp = await fetch(`${base}/api/routines/${encodeURIComponent(id)}/runs?limit=${limit}`);
      } catch (err) {
        surfaceFetchError(err, base);
        process.exit(3);
      }
      if (!resp.ok)
        return structuredHttpFailure(resp);
      const data = await resp.json();
      if (flags.json)
        return writeJson5(data);
      const runs = data.runs ?? [];
      if (runs.length === 0) {
        console.log(`No runs yet for ${id}.`);
        return;
      }
      console.log("# runId	status	trigger	startedAt	projectId	conversationId");
      for (const r of runs) {
        console.log([
          r.id,
          r.status,
          r.trigger,
          new Date(r.startedAt).toISOString(),
          r.projectId,
          r.conversationId
        ].join("	"));
      }
      return;
    }
    case "crystallize-run": {
      const parts = positionalArgs2(rest);
      const routineId = parts[0];
      const runId = parts[1];
      if (!routineId || !runId) {
        console.error("Usage: od automation crystallize-run <routineId> <runId> [--json]");
        process.exit(2);
      }
      let resp;
      try {
        resp = await fetch(`${base}/api/routines/${encodeURIComponent(routineId)}/runs/${encodeURIComponent(runId)}/crystallize`, { method: "POST" });
      } catch (err) {
        surfaceFetchError(err, base);
        process.exit(3);
      }
      if (!resp.ok)
        return structuredHttpFailure(resp);
      const data = await resp.json();
      if (flags.json)
        return writeJson5(data);
      console.log(`[automation] crystallized ${runId}`);
      console.log(`sourcePacket	${data.packet?.id ?? ""}`);
      console.log(`compression	${data.compressionReport?.status ?? "unknown"}	${data.compressionReport?.beforeTokens ?? 0}->${data.compressionReport?.afterTokens ?? 0}`);
      const proposals = data.proposals ?? [];
      if (proposals.length > 0) {
        console.log("# proposals");
        for (const proposal of proposals) {
          console.log([
            proposal.id,
            proposal.targetKind,
            proposal.action,
            proposal.status,
            proposal.title
          ].join("	"));
        }
      }
      return;
    }
    case "create": {
      const name = typeof flags.name === "string" ? flags.name.trim() : "";
      if (!name) {
        console.error("--name is required");
        process.exit(2);
      }
      const prompt = await readPromptFromFlags(flags) || "";
      if (!prompt.trim()) {
        console.error("--prompt or --prompt-file is required");
        process.exit(2);
      }
      let schedule;
      let target;
      try {
        schedule = parseScheduleFlag(flags.schedule);
        target = parseAutomationTarget(flags);
      } catch (err) {
        console.error(err.message);
        process.exit(2);
      }
      const body = {
        name,
        prompt: prompt.trim(),
        schedule,
        target,
        enabled: !flags.disabled
      };
      const context = automationContextFromFlags(flags);
      const skillIds = splitAutomationIds(flags.skill);
      if (skillIds.length > 0)
        body.skillId = skillIds[0];
      if (context)
        body.context = context;
      if (flags.agent)
        body.agentId = String(flags.agent);
      let resp;
      try {
        resp = await fetch(`${base}/api/routines`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body)
        });
      } catch (err) {
        surfaceFetchError(err, base);
        process.exit(3);
      }
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        console.error(`POST /api/routines failed: ${resp.status} ${JSON.stringify(data)}`);
        process.exit(1);
      }
      if (flags.json)
        return writeJson5(data);
      console.log(`[automation] created ${data.routine?.id}`);
      console.log(formatAutomationRow(data.routine));
      return;
    }
    case "update": {
      const id = requireId("update");
      const patch = {};
      if (typeof flags.name === "string")
        patch.name = flags.name.trim();
      const promptPatch = await readPromptFromFlags(flags);
      if (promptPatch != null)
        patch.prompt = promptPatch.trim();
      if (flags.schedule) {
        try {
          patch.schedule = parseScheduleFlag(flags.schedule);
        } catch (err) {
          console.error(err.message);
          process.exit(2);
        }
      }
      if (flags.target || flags.project) {
        try {
          patch.target = parseAutomationTarget(flags);
        } catch (err) {
          console.error(err.message);
          process.exit(2);
        }
      }
      if (flags.disabled)
        patch.enabled = false;
      if (flags.enabled)
        patch.enabled = true;
      const context = automationContextFromFlags(flags);
      if (context) {
        const skillIds = splitAutomationIds(flags.skill);
        if (skillIds.length > 0)
          patch.skillId = skillIds[0];
        patch.context = context;
      }
      if (Object.keys(patch).length === 0) {
        console.error("update needs at least one of --name --prompt(--prompt-file) --schedule --target --skill --plugin --mcp --connector --enabled --disabled");
        process.exit(2);
      }
      let resp;
      try {
        resp = await fetch(`${base}/api/routines/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(patch)
        });
      } catch (err) {
        surfaceFetchError(err, base);
        process.exit(3);
      }
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        console.error(`PATCH /api/routines/${id} failed: ${resp.status} ${JSON.stringify(data)}`);
        process.exit(1);
      }
      if (flags.json)
        return writeJson5(data);
      console.log(`[automation] updated ${id}`);
      console.log(formatAutomationRow(data.routine));
      return;
    }
    case "pause":
    case "resume": {
      const id = requireId(sub);
      const enabled = sub === "resume";
      let resp;
      try {
        resp = await fetch(`${base}/api/routines/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ enabled })
        });
      } catch (err) {
        surfaceFetchError(err, base);
        process.exit(3);
      }
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        console.error(`PATCH /api/routines/${id} failed: ${resp.status} ${JSON.stringify(data)}`);
        process.exit(1);
      }
      if (flags.json)
        return writeJson5(data);
      console.log(`[automation] ${sub}d ${id}`);
      return;
    }
    case "run": {
      const id = requireId("run");
      let resp;
      try {
        resp = await fetch(`${base}/api/routines/${encodeURIComponent(id)}/run`, {
          method: "POST"
        });
      } catch (err) {
        surfaceFetchError(err, base);
        process.exit(3);
      }
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok && resp.status !== 202) {
        console.error(`POST /api/routines/${id}/run failed: ${resp.status} ${JSON.stringify(data)}`);
        process.exit(1);
      }
      if (flags.json)
        return writeJson5(data);
      console.log(`[automation] triggered ${id}`);
      if (data.projectId)
        console.log(`projectId	${data.projectId}`);
      if (data.conversationId)
        console.log(`conversationId	${data.conversationId}`);
      if (data.agentRunId)
        console.log(`agentRunId	${data.agentRunId}`);
      return;
    }
    case "delete": {
      const id = requireId("delete");
      let resp;
      try {
        resp = await fetch(`${base}/api/routines/${encodeURIComponent(id)}`, {
          method: "DELETE"
        });
      } catch (err) {
        surfaceFetchError(err, base);
        process.exit(3);
      }
      if (!resp.ok)
        return structuredHttpFailure(resp);
      if (flags.json)
        return writeJson5({ ok: true, id });
      console.log(`[automation] deleted ${id}`);
      return;
    }
    default:
      console.error(`unknown subcommand: od automation ${sub}`);
      printAutomationHelp();
      process.exit(2);
  }
}
