import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);

// ../../../../_temp/tools-pack-cache/entries/win.packaged-app/cc055f964d62.tmp-3652-82324559/prebundle-entrypoints/daemon-cli.js
import { fileURLToPath } from "node:url";
var selfPath = fileURLToPath(import.meta.url);
process.env.OD_BIN ??= selfPath;
process.env.OD_DAEMON_CLI_PATH ??= selfPath;
await import("./chunks/cli-CYV7OPSL.mjs");
