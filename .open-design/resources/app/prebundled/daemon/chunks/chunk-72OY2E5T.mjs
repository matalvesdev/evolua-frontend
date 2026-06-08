import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);
import {
  getInstalledPlugin
} from "./chunk-ABQBL4YO.mjs";
import {
  getSnapshot
} from "./chunk-YYINZYFM.mjs";

// ../daemon/dist/plugins/export.js
import path from "node:path";
import { promises as fsp } from "node:fs";
var ExportError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ExportError";
  }
};
async function exportPlugin(input) {
  const snapshot = pickSnapshot(input);
  if (!snapshot) {
    throw new ExportError(input.snapshotId ? `snapshot ${input.snapshotId} not found` : `no snapshot found for project ${input.projectId}`);
  }
  const plugin = getInstalledPlugin(input.db, snapshot.pluginId);
  const folder = path.join(input.outDir, snapshot.pluginId);
  await fsp.mkdir(folder, { recursive: true });
  const written = [];
  const skillBody = await readSkillBody(plugin?.fsPath, snapshot);
  if (input.target !== "od") {
    const skillPath = path.join(folder, "SKILL.md");
    await fsp.writeFile(skillPath, skillBody, "utf8");
    written.push(skillPath);
  } else {
    const skillPath = path.join(folder, "SKILL.md");
    await fsp.writeFile(skillPath, skillBody, "utf8");
    written.push(skillPath);
  }
  if (input.target === "od") {
    const manifest = buildPortableManifest(snapshot);
    const manifestPath = path.join(folder, "open-design.json");
    await fsp.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
    written.push(manifestPath);
  }
  if (input.target === "claude-plugin") {
    const cpDir = path.join(folder, ".claude-plugin");
    await fsp.mkdir(cpDir, { recursive: true });
    const cp = {
      name: snapshot.pluginId,
      description: snapshot.pluginDescription ?? "",
      version: snapshot.pluginVersion
    };
    const cpPath = path.join(cpDir, "plugin.json");
    await fsp.writeFile(cpPath, JSON.stringify(cp, null, 2) + "\n", "utf8");
    written.push(cpPath);
  }
  const readme = [
    `# ${snapshot.pluginTitle ?? snapshot.pluginId}`,
    "",
    snapshot.pluginDescription ?? "",
    "",
    "## Provenance",
    "",
    `- Snapshot id: \`${snapshot.snapshotId}\``,
    `- Plugin version: \`${snapshot.pluginVersion}\``,
    `- Manifest digest: \`${snapshot.manifestSourceDigest}\``,
    `- Task kind: \`${snapshot.taskKind}\``,
    "",
    "This folder was produced by `od plugin export`.",
    ""
  ].join("\n");
  const readmePath = path.join(folder, "README.md");
  await fsp.writeFile(readmePath, readme, "utf8");
  written.push(readmePath);
  return { folder, files: written, snapshotId: snapshot.snapshotId };
}
function pickSnapshot(input) {
  if (input.snapshotId) {
    return getSnapshot(input.db, input.snapshotId);
  }
  if (input.projectId) {
    const row = input.db.prepare(`SELECT id FROM applied_plugin_snapshots WHERE project_id = ? ORDER BY applied_at DESC LIMIT 1`).get(input.projectId);
    if (!row?.id)
      return null;
    return getSnapshot(input.db, row.id);
  }
  return null;
}
async function readSkillBody(fsPath, snapshot) {
  if (fsPath) {
    try {
      return await fsp.readFile(path.join(fsPath, "SKILL.md"), "utf8");
    } catch {
    }
  }
  return [
    "---",
    `name: ${snapshot.pluginId}`,
    `description: ${snapshot.pluginDescription ?? snapshot.pluginTitle ?? snapshot.pluginId}`,
    `od:`,
    `  scenario: general`,
    "---",
    "",
    `# ${snapshot.pluginTitle ?? snapshot.pluginId}`,
    "",
    snapshot.pluginDescription ?? "",
    "",
    `Snapshot id: ${snapshot.snapshotId}`,
    `Manifest digest: ${snapshot.manifestSourceDigest}`,
    ""
  ].join("\n");
}
function buildPortableManifest(snapshot) {
  return {
    $schema: "https://open-design.ai/schemas/plugin.v1.json",
    specVersion: snapshot.pluginSpecVersion ?? "1.0.0",
    name: snapshot.pluginId,
    title: snapshot.pluginTitle ?? snapshot.pluginId,
    version: snapshot.pluginVersion,
    description: snapshot.pluginDescription ?? "",
    license: "MIT",
    od: {
      kind: "skill",
      taskKind: snapshot.taskKind,
      ...snapshot.query ? { useCase: { query: snapshot.query } } : {},
      context: {
        ...snapshot.resolvedContext.items.length > 0 ? { atoms: snapshot.resolvedContext.items.filter((i) => i.kind === "atom").map((i) => i.id) } : {}
      },
      capabilities: snapshot.capabilitiesGranted,
      ...snapshot.pipeline ? { pipeline: snapshot.pipeline } : {}
    },
    provenance: {
      snapshotId: snapshot.snapshotId,
      manifestSourceDigest: snapshot.manifestSourceDigest,
      appliedAt: snapshot.appliedAt
    }
  };
}

export {
  ExportError,
  exportPlugin
};
