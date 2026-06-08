import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);
import {
  getInstalledPlugin
} from "./chunk-ABQBL4YO.mjs";
import "./chunk-4TAOG76C.mjs";
import "./chunk-KZ5KHCCG.mjs";
import "./chunk-KRZ3KSO3.mjs";
import "./chunk-WRAIAC3Y.mjs";

// ../daemon/dist/plugins/atom-bodies.js
import path from "node:path";
import { promises as fsp } from "node:fs";
async function loadAtomBodies(db, atomIds) {
  const out = [];
  for (const id of atomIds) {
    const slug = id.toLowerCase();
    const plugin = preferBundledPlugin(db, slug);
    if (!plugin)
      continue;
    let raw;
    try {
      raw = await fsp.readFile(path.join(plugin.fsPath, "SKILL.md"), "utf8");
    } catch {
      continue;
    }
    const body = stripFrontmatter(raw).trim();
    if (!body)
      continue;
    out.push({ atomId: slug, pluginId: plugin.id, body });
  }
  return out;
}
function preferBundledPlugin(db, id) {
  const bundled = db.prepare(`SELECT id FROM installed_plugins WHERE id = ? AND source_kind = 'bundled' LIMIT 1`).get(id);
  if (bundled?.id) {
    return getInstalledPlugin(db, bundled.id);
  }
  return getInstalledPlugin(db, id);
}
function stripFrontmatter(raw) {
  if (!raw.startsWith("---"))
    return raw;
  const closeIdx = raw.indexOf("\n---", 3);
  if (closeIdx === -1)
    return raw;
  const after = raw.slice(closeIdx + 4);
  return after.replace(/^\r?\n/, "");
}
export {
  loadAtomBodies
};
