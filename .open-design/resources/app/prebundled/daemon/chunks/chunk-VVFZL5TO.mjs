import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);
import {
  createCommandInvocation
} from "./chunk-FBHBYNIK.mjs";

// ../daemon/dist/runtimes/defs/antigravity.js
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { readFile as fsReadFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

// ../daemon/dist/acp.js
import { spawn } from "node:child_process";
import path from "node:path";
var ACP_PROTOCOL_VERSION = 1;
var DEFAULT_TIMEOUT_MS = 15e3;
var MAX_TIMEOUT_MS = 24 * 60 * 60 * 1e3;
var DEFAULT_STAGE_TIMEOUT_MS = 6e5;
var MODEL_CONFIG_OPTION_IDS = /* @__PURE__ */ new Set(["model", "models", "modelid", "modelids"]);
function errorMessage(err) {
  return err instanceof Error ? err.message : String(err);
}
function resolveAcpTimeoutMs(env, fallbackMs) {
  const raw = Number(env.OD_ACP_TIMEOUT_MS);
  if (!Number.isFinite(raw))
    return fallbackMs;
  return Math.min(MAX_TIMEOUT_MS, Math.max(0, Math.floor(raw)));
}
function asObject(value) {
  return value && typeof value === "object" ? value : null;
}
function buildAcpSessionNewParams(cwd, { mcpServers } = {}) {
  const servers = Array.isArray(mcpServers) ? mcpServers : [];
  return {
    cwd: path.resolve(cwd),
    // MCP is an optional compatibility layer. Default to no MCP servers so ACP
    // agents can run through the skill + CLI path without MCP support. Do not
    // auto-install or mutate user/global MCP config; callers must pass an
    // explicit per-session MCP descriptor when a compatible agent supports it.
    // Normalize to the ACP stdio server shape expected by Kimi/Hermes.
    mcpServers: servers.map((s) => ({
      type: typeof s?.type === "string" ? s.type : "stdio",
      name: typeof s?.name === "string" ? s.name : "",
      command: typeof s?.command === "string" ? s.command : "",
      args: Array.isArray(s?.args) ? s.args : [],
      env: Array.isArray(s?.env) ? s.env : []
    }))
  };
}
function sendRpc(writable, id, method, params) {
  writable.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}
`);
}
function sendRpcResult(writable, id, result) {
  writable.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}
`);
}
function buildPromptBlocks(prompt, imagePaths) {
  const blocks = [{ type: "text", text: prompt }];
  for (const imagePath of imagePaths) {
    if (typeof imagePath !== "string" || imagePath.trim().length === 0)
      continue;
    blocks.push({ type: "resource_link", uri: imagePath });
  }
  return blocks;
}
function isJsonRpcId(value) {
  return typeof value === "number" || typeof value === "string";
}
function rpcErrorMessage(raw) {
  const obj = asObject(raw);
  const error = asObject(obj?.error);
  if (!obj || !error) {
    return "";
  }
  const message = typeof error.message === "string" ? error.message : typeof error.code === "number" ? String(error.code) : "json-rpc error";
  return typeof obj.id === "number" ? `json-rpc id ${obj.id}: ${message}` : message;
}
function formatUsage(usage) {
  const src = asObject(usage);
  if (!src)
    return null;
  const out = {};
  if (typeof src.inputTokens === "number")
    out.input_tokens = src.inputTokens;
  if (typeof src.outputTokens === "number")
    out.output_tokens = src.outputTokens;
  if (typeof src.cachedReadTokens === "number") {
    out.cached_read_tokens = src.cachedReadTokens;
  }
  if (typeof src.thoughtTokens === "number")
    out.thought_tokens = src.thoughtTokens;
  if (typeof src.totalTokens === "number")
    out.total_tokens = src.totalTokens;
  return Object.keys(out).length > 0 ? out : null;
}
function choosePermissionOutcome(options) {
  const list = Array.isArray(options) ? options : [];
  const approveForSession = list.find((option) => option?.optionId === "approve_for_session");
  if (approveForSession)
    return "approve_for_session";
  const allowAlways = list.find((option) => option?.kind === "allow_always");
  if (allowAlways?.optionId)
    return allowAlways.optionId;
  const allowOnce = list.find((option) => option?.kind === "allow_once");
  if (allowOnce?.optionId)
    return allowOnce.optionId;
  return null;
}
function normalizeConfigOptionToken(value) {
  return typeof value === "string" ? value.trim().toLowerCase().replace(/[\s_-]+/g, "") : "";
}
function isModelConfigOption(option, configId) {
  const category = normalizeConfigOptionToken(option.category);
  if (category === "model")
    return true;
  const id = normalizeConfigOptionToken(configId);
  if (id === "model")
    return true;
  if (category)
    return false;
  const name = normalizeConfigOptionToken(option.name);
  return MODEL_CONFIG_OPTION_IDS.has(id) || name === "model";
}
function findModelConfigOption(configOptions) {
  const options = Array.isArray(configOptions) ? configOptions : [];
  for (const rawOption of options) {
    const option = asObject(rawOption);
    if (!option)
      continue;
    const configId = typeof option.id === "string" ? option.id.trim() : "";
    if (!configId)
      continue;
    const type = typeof option.type === "string" ? option.type.trim() : "";
    if (type && type !== "select")
      continue;
    if (!isModelConfigOption(option, configId))
      continue;
    const currentValue = typeof option.currentValue === "string" && option.currentValue.trim() ? option.currentValue.trim() : null;
    return {
      configId,
      currentValue,
      values: Array.isArray(option.options) ? option.options : []
    };
  }
  return null;
}
function normalizeModelConfigOptions(configOptions, defaultModelOption) {
  const modelConfig = findModelConfigOption(configOptions);
  if (!modelConfig)
    return null;
  const seen = /* @__PURE__ */ new Set([defaultModelOption.id]);
  const out = [defaultModelOption];
  for (const rawValue of modelConfig.values) {
    const value = asObject(rawValue);
    if (!value)
      continue;
    const id = typeof value.value === "string" && value.value.trim() ? value.value.trim() : typeof value.id === "string" ? value.id.trim() : "";
    if (!id || seen.has(id))
      continue;
    seen.add(id);
    const name = typeof value.name === "string" ? value.name.trim() : "";
    const isCurrent = id === modelConfig.currentValue;
    const labelBase = name && name !== id ? `${name} (${id})` : id;
    out.push({ id, label: isCurrent ? `${labelBase} \u2022 current` : labelBase });
  }
  return { currentModelId: modelConfig.currentValue, models: out };
}
function normalizeModels(models, defaultModelOption, configOptions) {
  const configModels = normalizeModelConfigOptions(configOptions, defaultModelOption);
  if (configModels && configModels.models.length > 1) {
    return configModels.models;
  }
  const modelsObj = asObject(models);
  const available = Array.isArray(modelsObj?.availableModels) ? modelsObj.availableModels : [];
  const currentModelId = typeof modelsObj?.currentModelId === "string" ? modelsObj.currentModelId : null;
  const seen = /* @__PURE__ */ new Set([defaultModelOption.id]);
  const out = [defaultModelOption];
  for (const model of available) {
    const id = typeof model?.modelId === "string" ? model.modelId.trim() : "";
    if (!id || seen.has(id))
      continue;
    seen.add(id);
    const name = typeof model?.name === "string" ? model.name.trim() : "";
    const isCurrent = id === currentModelId;
    const labelBase = name && name !== id ? `${name} (${id})` : id;
    out.push({ id, label: isCurrent ? `${labelBase} \u2022 current` : labelBase });
  }
  return out.length > 1 || !configModels ? out : configModels.models;
}
function modelSelectionErrorIsRecoverable(code) {
  return code === -32603 || code === -32602 || code === -32601 || code === -32002;
}
function currentModelFromSessionResult(result) {
  const configCurrent = findModelConfigOption(result.configOptions)?.currentValue;
  if (configCurrent)
    return configCurrent;
  const models = asObject(result.models);
  return typeof models?.currentModelId === "string" && models.currentModelId.trim() ? models.currentModelId.trim() : null;
}
function createJsonLineStream(onMessage) {
  let buffer = "";
  return {
    feed(chunk) {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed)
          continue;
        try {
          onMessage(JSON.parse(trimmed), trimmed);
        } catch {
        }
      }
    },
    flush() {
      const trimmed = buffer.trim();
      buffer = "";
      if (!trimmed)
        return;
      try {
        onMessage(JSON.parse(trimmed), trimmed);
      } catch {
      }
    }
  };
}
async function detectAcpModels({ bin, args, cwd = process.cwd(), env = process.env, timeoutMs = DEFAULT_TIMEOUT_MS, clientName = "open-design-detect", clientVersion = "runtime-adapter", defaultModelOption = { id: "default", label: "Default (CLI config)" } }) {
  const effectiveTimeoutMs = resolveAcpTimeoutMs(env, timeoutMs);
  return await new Promise((resolve, reject) => {
    const child = spawn(bin, args, {
      cwd,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...env }
    });
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    let settled = false;
    let stderrBuf = "";
    let expectedId = 1;
    let nextId = 2;
    let timer = null;
    const finish = (fn, value) => {
      if (settled)
        return;
      settled = true;
      if (timer)
        clearTimeout(timer);
      try {
        child.stdin.end();
      } catch {
      }
      fn(value);
    };
    const fail = (message) => {
      finish(reject, new Error(message));
      if (!child.killed)
        child.kill("SIGTERM");
    };
    const writeRpc = (id, method, params) => {
      try {
        sendRpc(child.stdin, id, method, params);
      } catch (err) {
        fail(`stdin write failed: ${errorMessage(err)}`);
      }
    };
    const sendSessionNew = () => {
      expectedId = nextId;
      writeRpc(nextId, "session/new", buildAcpSessionNewParams(cwd));
      nextId += 1;
    };
    const parser = createJsonLineStream((raw) => {
      const obj = asObject(raw);
      const error = asObject(obj?.error);
      const result = asObject(obj?.result);
      const rpcErr = rpcErrorMessage(raw);
      if (rpcErr) {
        if (error?.code === -32603 && obj?.id !== expectedId)
          return;
        fail(rpcErr);
        return;
      }
      if (obj?.id !== expectedId || !result)
        return;
      if (expectedId === 1) {
        sendSessionNew();
        return;
      }
      if (expectedId === 2) {
        const models = normalizeModels(result.models, defaultModelOption, result.configOptions);
        finish(resolve, models);
        if (!child.killed)
          child.kill("SIGTERM");
      }
    });
    child.stdout.on("data", (chunk) => parser.feed(chunk));
    child.stdout.on("close", () => parser.flush());
    child.stdin.on("error", (err) => fail(`stdin error: ${err.message}`));
    child.stderr.on("data", (chunk) => {
      stderrBuf = `${stderrBuf}${chunk}`.slice(-16e3);
    });
    child.on("error", (err) => fail(`spawn failed: ${err.message}`));
    child.on("close", (code, signal) => {
      parser.flush();
      if (!settled) {
        const errTail = stderrBuf.trim();
        const suffix = errTail ? ` stderr=${errTail}` : "";
        fail(`ACP model detection exited code=${code} signal=${signal ?? "none"}${suffix}`);
      }
    });
    if (effectiveTimeoutMs > 0) {
      timer = setTimeout(() => {
        fail(`ACP model detection timed out after ${effectiveTimeoutMs}ms`);
      }, effectiveTimeoutMs);
    }
    writeRpc(1, "initialize", {
      protocolVersion: ACP_PROTOCOL_VERSION,
      clientCapabilities: { terminal: false },
      clientInfo: { name: clientName, version: clientVersion }
    });
  });
}
function attachAcpSession({ child, prompt, cwd, model, imagePaths = [], mcpServers, send, clientName = "open-design", clientVersion = "runtime-adapter", stageTimeoutMs = DEFAULT_STAGE_TIMEOUT_MS, modelUnavailableErrorCode }) {
  const runStartedAt = Date.now();
  const effectiveCwd = path.resolve(cwd || process.cwd());
  if (!child.stdin || !child.stdout) {
    throw new Error("ACP child process must expose stdin and stdout streams");
  }
  const stdin = child.stdin;
  const stdout = child.stdout;
  let expectedId = 1;
  let nextId = 2;
  let promptRequestId = null;
  let setModelRequestId = null;
  let sessionId = null;
  let activeModel = null;
  let modelConfigId = null;
  let emittedThinkingStart = false;
  let emittedFirstTokenStatus = false;
  let emittedTextChunk = false;
  let emittedToolCall = false;
  let finished = false;
  let fatal = false;
  let aborted = false;
  let stageTimer = null;
  const stageWatchdogDisabled = stageTimeoutMs <= 0;
  const resetStageTimer = (label) => {
    if (stageTimer)
      clearTimeout(stageTimer);
    if (stageWatchdogDisabled)
      return;
    stageTimer = setTimeout(() => {
      fail(`ACP ${label} timed out after ${stageTimeoutMs}ms`);
    }, stageTimeoutMs);
  };
  const clearStageTimer = () => {
    if (stageTimer)
      clearTimeout(stageTimer);
    stageTimer = null;
  };
  const amrModelUnavailablePayload = (message) => ({
    message,
    error: {
      code: "AMR_MODEL_UNAVAILABLE",
      message,
      retryable: false,
      details: { kind: "amr_model", action: "choose_model" }
    }
  });
  const isModelUnavailableError = (message) => {
    const value = message.toLowerCase();
    return value.includes("model not found") || value.includes("providermodelnotfounderror") || value.includes("unknown model") || value.includes("invalid model");
  };
  const fail = (message, options = {}) => {
    if (finished)
      return;
    finished = true;
    fatal = true;
    clearStageTimer();
    const useModelUnavailable = modelUnavailableErrorCode && (options.forceModelUnavailable || isModelUnavailableError(message));
    send("error", useModelUnavailable ? amrModelUnavailablePayload(message) : { message });
    if (!child.killed)
      child.kill("SIGTERM");
  };
  const writeRpc = (id, method, params, timeoutLabel) => {
    resetStageTimer(timeoutLabel);
    try {
      sendRpc(stdin, id, method, params);
    } catch (err) {
      fail(`stdin write failed: ${errorMessage(err)}`);
    }
  };
  const sendPrompt = () => {
    promptRequestId = nextId;
    expectedId = promptRequestId;
    writeRpc(promptRequestId, "session/prompt", {
      sessionId,
      prompt: buildPromptBlocks(prompt, imagePaths)
    }, "session/prompt");
    nextId += 1;
  };
  const replyPermission = (raw) => {
    const params = asObject(raw.params);
    const optionId = choosePermissionOutcome(params?.options);
    if (!optionId || !isJsonRpcId(raw.id)) {
      fail(`unhandled ACP permission request: ${JSON.stringify(raw)}`);
      return;
    }
    resetStageTimer("session/request_permission");
    try {
      sendRpcResult(stdin, raw.id, {
        outcome: { outcome: "selected", optionId }
      });
    } catch (err) {
      fail(`stdin write failed: ${errorMessage(err)}`);
    }
  };
  const recoverFromModelSelectionError = () => {
    setModelRequestId = null;
    activeModel = activeModel || "default";
    send("agent", { type: "status", label: "model", model: activeModel });
    sendPrompt();
  };
  const parser = createJsonLineStream((raw, rawLine) => {
    if (aborted)
      return;
    resetStageTimer("response");
    const obj = asObject(raw);
    if (!obj)
      return;
    const error = asObject(obj.error);
    const params = asObject(obj.params);
    const result = asObject(obj.result);
    const rpcErr = rpcErrorMessage(obj);
    if (rpcErr) {
      if (finished)
        return;
      if (obj.id === setModelRequestId && modelSelectionErrorIsRecoverable(error?.code) && promptRequestId === null) {
        recoverFromModelSelectionError();
        return;
      }
      if (error?.code === -32603 && obj.id !== expectedId) {
        return;
      }
      fail(rpcErr);
      return;
    }
    if (obj.method === "session/request_permission") {
      replyPermission(obj);
      return;
    }
    const update = asObject(params?.update);
    if (obj.method === "session/update" && update) {
      if (update.sessionUpdate === "agent_thought_chunk") {
        const text = asObject(update.content)?.text;
        if (typeof text === "string" && text.length > 0) {
          if (!emittedThinkingStart) {
            emittedThinkingStart = true;
            send("agent", { type: "thinking_start" });
          }
          send("agent", { type: "thinking_delta", delta: text });
        }
        return;
      }
      if (update.sessionUpdate === "agent_message_chunk") {
        const text = asObject(update.content)?.text;
        if (typeof text === "string" && text.length > 0) {
          emittedTextChunk = true;
          if (!emittedFirstTokenStatus) {
            emittedFirstTokenStatus = true;
            send("agent", {
              type: "status",
              label: "streaming",
              ttftMs: Date.now() - runStartedAt
            });
          }
          send("agent", { type: "text_delta", delta: text });
        }
        return;
      }
      if (update.sessionUpdate === "tool_call" || update.sessionUpdate === "tool_call_update") {
        emittedToolCall = true;
        return;
      }
      return;
    }
    if (obj.id !== expectedId || !result) {
      return;
    }
    if (expectedId === 1) {
      expectedId = nextId;
      writeRpc(nextId, "session/new", buildAcpSessionNewParams(effectiveCwd, mcpServers ? { mcpServers } : {}), "session/new");
      nextId += 1;
      return;
    }
    if (expectedId === 2) {
      sessionId = typeof result.sessionId === "string" ? result.sessionId : null;
      const modelConfig = findModelConfigOption(result.configOptions);
      modelConfigId = modelConfig?.configId ?? null;
      activeModel = currentModelFromSessionResult(result);
      if (sessionId && activeModel) {
        send("agent", { type: "status", label: "model", model: activeModel });
      }
      if (sessionId && model && model !== "default") {
        setModelRequestId = nextId;
        expectedId = nextId;
        const setModelMethod = modelConfigId ? "session/set_config_option" : "session/set_model";
        const setModelParams = modelConfigId ? { sessionId, configId: modelConfigId, value: model } : { sessionId, modelId: model };
        writeRpc(nextId, setModelMethod, setModelParams, setModelMethod);
        nextId += 1;
        return;
      }
      if (!sessionId) {
        fail(`invalid session/new response: ${rawLine}`);
        return;
      }
      sendPrompt();
      return;
    }
    if (promptRequestId !== null && obj.id === promptRequestId) {
      if (!emittedTextChunk && !emittedToolCall && modelUnavailableErrorCode) {
        fail("ACP session completed without producing any assistant text. Refresh the AMR model list, choose a supported model, and retry this run.", { forceModelUnavailable: true });
        return;
      }
      const usage = formatUsage(result.usage);
      if (usage) {
        send("agent", {
          type: "usage",
          usage,
          durationMs: Date.now() - runStartedAt
        });
      }
      finished = true;
      clearStageTimer();
      stdin.end();
      const cleanExitTimer = setTimeout(() => {
        if (!child.killed)
          child.kill("SIGTERM");
      }, 500);
      child.once("close", () => clearTimeout(cleanExitTimer));
      return;
    }
    if (sessionId && model && model !== "default" && obj.id === expectedId) {
      activeModel = currentModelFromSessionResult(result) ?? model;
      send("agent", { type: "status", label: "model", model: activeModel });
      sendPrompt();
    }
  });
  stdout.on("data", (chunk) => parser.feed(chunk));
  child.on("close", (code, signal) => {
    clearStageTimer();
    parser.flush();
    if (!finished && !aborted && !fatal) {
      fail(`ACP session exited before completion (code=${code ?? "null"}, signal=${signal ?? "none"})`);
    }
  });
  child.on("error", (err) => fail(err.message));
  stdin.on("error", (err) => fail(`stdin error: ${err.message}`));
  writeRpc(1, "initialize", {
    protocolVersion: ACP_PROTOCOL_VERSION,
    clientCapabilities: { terminal: false },
    clientInfo: { name: clientName, version: clientVersion }
  }, "initialize");
  return {
    hasFatalError() {
      return fatal;
    },
    completedSuccessfully() {
      return finished && !fatal && !aborted;
    },
    abort() {
      if (aborted || finished)
        return;
      aborted = true;
      finished = true;
      clearStageTimer();
      if (!child.stdin || child.stdin.destroyed || child.stdin.writableEnded)
        return;
      if (sessionId) {
        try {
          sendRpc(child.stdin, nextId, "session/cancel", { sessionId });
          nextId += 1;
        } catch {
        }
      }
      try {
        child.stdin.end();
      } catch {
      }
    }
  };
}

// ../daemon/dist/pi-rpc.js
import fs from "node:fs";
import path2 from "node:path";
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function errorMessage2(err) {
  return err instanceof Error ? err.message : String(err);
}
function errorCode(err) {
  return isRecord(err) && typeof err.code === "string" ? err.code : void 0;
}
function getRecord(value) {
  return isRecord(value) ? value : void 0;
}
var MAX_IMAGE_COUNT = 10;
var MAX_TOTAL_IMAGE_BYTES = 20 * 1024 * 1024;
var ALLOWED_IMAGE_EXTENSIONS = /* @__PURE__ */ new Set([".png", ".jpg", ".jpeg", ".gif", ".webp"]);
var FIRE_AND_FORGET_METHODS = /* @__PURE__ */ new Set([
  "setStatus",
  "setWidget",
  "notify",
  "setTitle",
  "set_editor_text"
]);
function replyExtensionUi(writable, raw) {
  if (raw?.id == null)
    return;
  if (typeof raw.method === "string" && FIRE_AND_FORGET_METHODS.has(raw.method))
    return;
  let result;
  if (raw.method === "confirm") {
    result = { confirmed: true };
  } else {
    const params = getRecord(raw.params);
    const opts = params?.options ?? raw.options;
    if (Array.isArray(opts) && opts.length > 0) {
      const first = opts[0];
      result = typeof first === "string" ? { value: first } : { value: getRecord(first)?.label ?? getRecord(first)?.value ?? "" };
    } else {
      result = { cancelled: true };
    }
  }
  writable.write(`${JSON.stringify({ type: "extension_ui_response", id: raw.id, ...result })}
`);
}
function mapPiRpcEvent(raw, send, ctx) {
  if (raw.type === "agent_start") {
    send("agent", { type: "status", label: "working" });
    return null;
  }
  if (raw.type === "agent_end") {
    return "agent_end";
  }
  if (raw.type === "turn_start") {
    send("agent", { type: "status", label: "thinking" });
    return null;
  }
  if (raw.type === "turn_end") {
    const message = getRecord(raw.message);
    const messageUsage = getRecord(message?.usage);
    if (messageUsage) {
      const u = messageUsage;
      const usage = {};
      if (typeof u.input === "number")
        usage.input_tokens = u.input;
      if (typeof u.output === "number")
        usage.output_tokens = u.output;
      if (typeof u.cacheRead === "number")
        usage.cached_read_tokens = u.cacheRead;
      if (typeof u.cacheWrite === "number")
        usage.cached_write_tokens = u.cacheWrite;
      if (typeof u.totalTokens === "number")
        usage.total_tokens = u.totalTokens;
      if (Object.keys(usage).length > 0) {
        const cost = getRecord(u.cost);
        send("agent", {
          type: "usage",
          usage,
          costUsd: cost?.total ?? cost?.totalCost ?? null,
          durationMs: Date.now() - ctx.runStartedAt
        });
      }
    }
    return null;
  }
  const assistantMessageEvent = getRecord(raw.assistantMessageEvent);
  if (raw.type === "message_update" && assistantMessageEvent) {
    const ev = assistantMessageEvent;
    if (ev.type === "text_delta" && typeof ev.delta === "string") {
      if (!ctx.sentFirstToken.value) {
        ctx.sentFirstToken.value = true;
        send("agent", {
          type: "status",
          label: "streaming",
          ttftMs: Date.now() - ctx.runStartedAt
        });
      }
      send("agent", { type: "text_delta", delta: ev.delta });
      return null;
    }
    if (ev.type === "thinking_delta" && typeof ev.delta === "string") {
      send("agent", { type: "thinking_delta", delta: ev.delta });
      return null;
    }
    if (ev.type === "thinking_start") {
      send("agent", { type: "thinking_start" });
      return null;
    }
    if (ev.type === "thinking_end") {
      send("agent", { type: "thinking_end" });
      return null;
    }
    if (ev.type === "error") {
      const message = typeof ev.reason === "string" && ev.reason.length > 0 ? ev.reason : typeof ev.delta === "string" && ev.delta.length > 0 ? ev.delta : "Agent error";
      send("agent", { type: "error", message, raw });
      return null;
    }
    return null;
  }
  if (raw.type === "message_end") {
    return null;
  }
  if (raw.type === "tool_execution_start") {
    send("agent", {
      type: "tool_use",
      id: raw.toolCallId ?? null,
      name: raw.toolName ?? null,
      input: raw.args ?? null
    });
    return null;
  }
  if (raw.type === "tool_execution_end") {
    const result = getRecord(raw.result);
    const content = result?.content;
    const text = Array.isArray(content) ? content.map((c) => {
      const item = getRecord(c);
      return item?.type === "text" ? String(item.text ?? "") : JSON.stringify(c);
    }).join("\n") : typeof content === "string" ? content : "";
    send("agent", {
      type: "tool_result",
      toolUseId: raw.toolCallId ?? null,
      content: text,
      isError: raw.isError === true
    });
    return null;
  }
  if (raw.type === "extension_error") {
    const message = typeof raw.error === "string" && raw.error.length > 0 ? raw.error : "Extension error";
    send("agent", { type: "error", message, raw });
    return null;
  }
  if (raw.type === "compaction_start") {
    send("agent", { type: "status", label: "compacting" });
    return null;
  }
  if (raw.type === "auto_retry_start") {
    send("agent", { type: "status", label: "retrying" });
    return null;
  }
  if (raw.type === "auto_retry_end" && raw.success === false) {
    const message = typeof raw.finalError === "string" && raw.finalError.length > 0 ? raw.finalError : "Auto-retry exhausted";
    send("agent", { type: "error", message, raw });
    return null;
  }
  return null;
}
function attachPiRpcSession({ child, prompt, cwd: _cwd, model, send, imagePaths, uploadRoot }) {
  const stdin = child.stdin;
  const stdout = child.stdout;
  if (stdin === null) {
    throw new Error("pi RPC child process is missing stdin");
  }
  if (stdout === null) {
    throw new Error("pi RPC child process is missing stdout");
  }
  const runStartedAt = Date.now();
  let finished = false;
  let fatal = false;
  const sentFirstToken = { value: false };
  let nextRpcId = 1;
  let stdinOpen = true;
  function sendCommand(writable, type, params = {}) {
    if (!stdinOpen)
      return null;
    const id = nextRpcId++;
    writable.write(`${JSON.stringify({ id, type, ...params })}
`);
    return id;
  }
  let promptRpcId = null;
  const fail = (message) => {
    if (finished)
      return;
    finished = true;
    fatal = true;
    send("error", { message });
    if (!child.killed)
      child.kill("SIGTERM");
  };
  send("agent", {
    type: "status",
    label: "initializing",
    model: typeof model === "string" && model ? model : null
  });
  stdin.on("error", (err) => {
    if (errorCode(err) !== "EPIPE") {
      fail(`stdin: ${errorMessage2(err)}`);
    }
  });
  stdin.on("close", () => {
    stdinOpen = false;
  });
  const images = [];
  if (Array.isArray(imagePaths) && imagePaths.length > 0) {
    let totalBytes = 0;
    for (const imgPath of imagePaths) {
      if (images.length >= MAX_IMAGE_COUNT)
        break;
      if (typeof imgPath !== "string" || !imgPath.length)
        continue;
      try {
        const realPath = fs.realpathSync(imgPath);
        const stat = fs.statSync(realPath);
        if (!stat.isFile())
          continue;
        if (uploadRoot) {
          const resolvedRoot = fs.realpathSync(uploadRoot);
          if (realPath !== resolvedRoot && !realPath.startsWith(resolvedRoot + path2.sep))
            continue;
        }
        const ext = path2.extname(realPath).toLowerCase();
        if (!ALLOWED_IMAGE_EXTENSIONS.has(ext))
          continue;
        if (totalBytes + stat.size > MAX_TOTAL_IMAGE_BYTES)
          continue;
        const buf = fs.readFileSync(realPath);
        const mimeType = ext === ".png" ? "image/png" : ext === ".gif" ? "image/gif" : ext === ".webp" ? "image/webp" : "image/jpeg";
        images.push({
          type: "image",
          data: buf.toString("base64"),
          mimeType
        });
        totalBytes += stat.size;
      } catch (_err) {
      }
    }
  }
  promptRpcId = sendCommand(stdin, "prompt", {
    message: prompt,
    ...images.length > 0 ? { images } : {}
  });
  const parser = createJsonLineStream((raw) => {
    if (!isRecord(raw))
      return;
    if (finished)
      return;
    if (raw.type === "extension_ui_request") {
      replyExtensionUi(stdin, raw);
      return;
    }
    if (raw.type === "response") {
      if (raw.id === promptRpcId && raw.success === false) {
        fail(`prompt rejected: ${String(raw.error ?? "unknown")}`);
      }
      return;
    }
    const result = mapPiRpcEvent(raw, send, { runStartedAt, sentFirstToken });
    if (result === "agent_end") {
      finished = true;
      try {
        stdin.end();
      } catch (err) {
        fail(`stdin close: ${errorMessage2(err)}`);
      }
      const shutdownMs = Number(process.env.PI_GRACEFUL_SHUTDOWN_MS) || 5e3;
      setTimeout(() => {
        if (!child.killed)
          child.kill("SIGTERM");
      }, shutdownMs);
    }
  });
  stdout.on("data", (chunk) => {
    try {
      parser.feed(typeof chunk === "string" ? chunk : chunk.toString("utf8"));
    } catch (err) {
      fail(`parser: ${errorMessage2(err)}`);
    }
  });
  stdout.on("close", () => parser.flush());
  child.on("error", (err) => fail(errorMessage2(err)));
  return {
    hasFatalError() {
      return fatal;
    },
    abort() {
      if (finished || child.killed)
        return;
      finished = true;
      sendCommand(stdin, "abort");
    }
  };
}
function parsePiModels(stdout) {
  const lines = String(stdout || "").split("\n").map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith("#"));
  if (lines.length === 0)
    return null;
  const DEFAULT_MODEL_OPTION2 = { id: "default", label: "Default (CLI config)" };
  const entries = [DEFAULT_MODEL_OPTION2];
  const seen = /* @__PURE__ */ new Set(["default"]);
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line === void 0)
      continue;
    const parts = line.split(/\s+/);
    if (parts.length < 2)
      continue;
    const provider = parts[0];
    const modelId = parts[1];
    if (provider === void 0 || modelId === void 0)
      continue;
    const fullId = `${provider}/${modelId}`;
    if (seen.has(fullId))
      continue;
    seen.add(fullId);
    entries.push({ id: fullId, label: fullId });
  }
  return entries.length > 1 ? entries : null;
}

// ../daemon/dist/runtimes/invocation.js
import { execFile } from "node:child_process";
import { promisify } from "node:util";
var execFileP = promisify(execFile);
function execAgentFile(command, args, options = {}) {
  const invocation = createCommandInvocation(options.env ? {
    command,
    args,
    env: options.env
  } : {
    command,
    args
  });
  return execFileP(invocation.command, invocation.args, {
    ...options,
    windowsVerbatimArguments: invocation.windowsVerbatimArguments
  });
}

// ../daemon/dist/runtimes/models.js
var DEFAULT_MODEL_OPTION = {
  id: "default",
  label: "Default (CLI config)"
};
var liveModelCache = /* @__PURE__ */ new Map();
var liveModelOrder = /* @__PURE__ */ new Map();
function rememberLiveModels(agentId, models) {
  if (!Array.isArray(models))
    return;
  const ids = models.map((m) => m && m.id).filter((id) => typeof id === "string");
  liveModelCache.set(agentId, new Set(ids));
  liveModelOrder.set(agentId, ids);
}
function getRememberedLiveModels(agentId) {
  const ids = liveModelOrder.get(agentId) ?? [];
  return ids.map((id) => ({ id, label: id }));
}
function preferFreshLiveModels(freshModels, rememberedModels) {
  return freshModels.length > 0 ? freshModels : rememberedModels;
}
function isKnownModel(def, modelId) {
  if (!modelId)
    return false;
  const live = liveModelCache.get(def.id);
  if (live && live.has(modelId))
    return true;
  if (Array.isArray(def.fallbackModels)) {
    return def.fallbackModels.some((m) => m.id === modelId);
  }
  return false;
}
function resolveModelForAgent(def, resolved, env = process.env) {
  if (resolved && resolved !== "default")
    return resolved;
  if (def.defaultModelEnvVar) {
    const raw = env[def.defaultModelEnvVar];
    if (typeof raw === "string" && raw.trim())
      return raw.trim();
  }
  const fallbacks = Array.isArray(def.fallbackModels) ? def.fallbackModels : [];
  if (fallbacks.some((m) => m.id === "default"))
    return resolved;
  const liveModels = liveModelOrder.get(def.id) ?? [];
  const firstLive = liveModels[0];
  if (firstLive)
    return firstLive;
  if (fallbacks.length === 0)
    return resolved;
  const firstFallback = fallbacks[0];
  return firstFallback ? firstFallback.id : resolved;
}
function sanitizeCustomModel(id) {
  if (typeof id !== "string")
    return null;
  const trimmed = id.trim();
  if (trimmed.length === 0 || trimmed.length > 200)
    return null;
  if (!/^[A-Za-z0-9][A-Za-z0-9._/:@-]*$/.test(trimmed))
    return null;
  return trimmed;
}

// ../daemon/dist/runtimes/defs/shared.js
function clampCodexReasoning(modelId, effort) {
  if (!effort)
    return effort;
  const raw = String(modelId ?? "").trim();
  const id = raw.includes("/") ? raw.split("/").pop() : raw;
  const isGpt5LateFamily = !id || id === "default" || id.startsWith("gpt-5.2") || id.startsWith("gpt-5.3") || id.startsWith("gpt-5.4") || id.startsWith("gpt-5.5");
  if (isGpt5LateFamily && effort === "minimal")
    return "low";
  if (id === "gpt-5.1" && effort === "xhigh")
    return "high";
  if (id === "gpt-5.1-codex-mini") {
    return effort === "high" || effort === "xhigh" ? "high" : "medium";
  }
  return effort;
}
function parseLineSeparatedModels(stdout) {
  const ids = String(stdout || "").split("\n").map((line) => line.trim()).filter((line) => line.length > 0 && !line.startsWith("#"));
  const seen = /* @__PURE__ */ new Set();
  const out = [DEFAULT_MODEL_OPTION];
  for (const id of ids) {
    if (seen.has(id))
      continue;
    seen.add(id);
    out.push({ id, label: id });
  }
  return out;
}

// ../daemon/dist/runtimes/defs/antigravity.js
var ANTIGRAVITY_SETTINGS_PATH = join(homedir(), ".gemini", "antigravity-cli", "settings.json");
function writeAntigravityModelSelection(label, settingsPath = ANTIGRAVITY_SETTINGS_PATH) {
  let existing = {};
  if (existsSync(settingsPath)) {
    try {
      const parsed = JSON.parse(readFileSync(settingsPath, "utf8"));
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        existing = parsed;
      }
    } catch {
    }
  }
  existing.model = label;
  mkdirSync(dirname(settingsPath), { recursive: true });
  writeFileSync(settingsPath, `${JSON.stringify(existing, null, 2)}
`);
}
var antigravityLockChain = Promise.resolve();
async function acquireAntigravityModelLock() {
  const previous = antigravityLockChain;
  let release = () => {
  };
  antigravityLockChain = new Promise((resolve) => {
    release = resolve;
  });
  await previous;
  return release;
}
function _resetAntigravityModelLockForTests() {
  antigravityLockChain = Promise.resolve();
}
async function waitForAgyToReadModel(logFilePath, expectedModel, options = {}) {
  const timeoutMs = options.timeoutMs ?? 15e3;
  const pollIntervalMs = options.pollIntervalMs ?? 250;
  const readFile = options.readFile ?? ((path3) => fsReadFile(path3, "utf8"));
  const now = options.now ?? Date.now;
  const abortSignal = options.abortSignal;
  if (abortSignal?.aborted)
    return false;
  const escaped = expectedModel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`Propagating selected model override to backend: label="${escaped}"`);
  const deadline = now() + timeoutMs;
  while (now() < deadline) {
    if (abortSignal?.aborted)
      return false;
    try {
      const content = await readFile(logFilePath);
      if (pattern.test(content))
        return true;
    } catch {
    }
    if (now() >= deadline)
      break;
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, pollIntervalMs);
      const onAbort = () => {
        clearTimeout(timer);
        resolve();
      };
      abortSignal?.addEventListener("abort", onAbort, { once: true });
    });
  }
  return false;
}
var antigravityAgentDef = {
  id: "antigravity",
  name: "Antigravity",
  bin: "agy",
  versionArgs: ["--version"],
  fallbackModels: [
    DEFAULT_MODEL_OPTION,
    { id: "Gemini 3.1 Pro (High)", label: "Gemini 3.1 Pro (High)" },
    { id: "Gemini 3.1 Pro (Low)", label: "Gemini 3.1 Pro (Low)" },
    { id: "Gemini 3.5 Flash (High)", label: "Gemini 3.5 Flash (High)" },
    { id: "Gemini 3.5 Flash (Medium)", label: "Gemini 3.5 Flash (Medium)" },
    { id: "Gemini 3.5 Flash (Low)", label: "Gemini 3.5 Flash (Low)" },
    {
      id: "Claude Sonnet 4.6 (Thinking)",
      label: "Claude Sonnet 4.6 (Thinking)"
    },
    { id: "Claude Opus 4.6 (Thinking)", label: "Claude Opus 4.6 (Thinking)" },
    { id: "GPT-OSS 120B (Medium)", label: "GPT-OSS 120B (Medium)" }
  ],
  supportsCustomModel: false,
  // We deliberately do NOT opt into `resumesSessionViaCli` / agy's `-c`
  // resume flag on follow-up turns. Tested both shapes; `-c` activates
  // agy's internal agentic loop (multi-step model retries, tool calls,
  // fallback-to-cached-response on tool errors) which can't be steered
  // from OD's system-prompt OVERRIDE — even with the strongest wording
  // we got an identical byte-for-byte form re-emission on turn 2 when
  // turn 1's tool-call retry path returned the cached form response.
  //
  // Instead we treat agy as a stateless plain adapter like qwen /
  // deepseek: every spawn gets the full OD-rendered transcript via
  // `buildDaemonTranscript`, and that transcript's prior assistant
  // turns are sanitized to strip `<question-form>` markup + form-schema
  // JSON fences (see `sanitizePriorAssistantTurnForTranscript` in
  // apps/web/src/providers/daemon.ts). The stronger OVERRIDE block
  // composed in server.ts gives a second line of defense for weak
  // plain-stream models like Gemini 3.5 Flash.
  buildArgs: (_prompt, _imagePaths, _extra = [], options = {}, runtimeContext = {}) => {
    if (options.model && options.model !== DEFAULT_MODEL_OPTION.id) {
      writeAntigravityModelSelection(options.model, runtimeContext.antigravitySettingsPath);
    }
    const args = ["-p"];
    if (runtimeContext.agentLogFilePath) {
      args.push("--log-file", runtimeContext.agentLogFilePath);
    }
    args.push("-");
    return args;
  },
  promptViaStdin: true,
  streamFormat: "plain",
  installUrl: "https://antigravity.google/cli",
  docsUrl: "https://antigravity.google/docs/cli-overview"
};

export {
  detectAcpModels,
  attachAcpSession,
  attachPiRpcSession,
  parsePiModels,
  execAgentFile,
  DEFAULT_MODEL_OPTION,
  rememberLiveModels,
  getRememberedLiveModels,
  preferFreshLiveModels,
  isKnownModel,
  resolveModelForAgent,
  sanitizeCustomModel,
  clampCodexReasoning,
  parseLineSeparatedModels,
  writeAntigravityModelSelection,
  acquireAntigravityModelLock,
  _resetAntigravityModelLockForTests,
  waitForAgyToReadModel,
  antigravityAgentDef
};
