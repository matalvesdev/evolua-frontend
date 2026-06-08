import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);
import {
  pickFirstLocalSkillPath
} from "./chunk-RMGLMMYN.mjs";
import "./chunk-6QGA3KRC.mjs";
import "./chunk-MA3L3OFF.mjs";
import "./chunk-4TAOG76C.mjs";
import "./chunk-KZ5KHCCG.mjs";
import "./chunk-KRZ3KSO3.mjs";
import "./chunk-WRAIAC3Y.mjs";

// ../daemon/dist/plugins/local-skill.js
import path from "node:path";
import { promises as fsp } from "node:fs";
async function loadPluginLocalSkill(plugin) {
  const manifest = plugin.manifest;
  const relpath = pickFirstLocalSkillPath(manifest);
  if (!relpath)
    return null;
  const safeRel = stripLeadingDotSlash(relpath);
  if (safeRel.split("/").some((segment) => segment === ".."))
    return null;
  const abs = path.join(plugin.fsPath, safeRel);
  let raw;
  try {
    raw = await fsp.readFile(abs, "utf8");
  } catch {
    return null;
  }
  const body = stripFrontmatter(raw).trim();
  if (!body)
    return null;
  const name = (manifest.title ?? manifest.name ?? plugin.id).toString();
  return {
    body,
    name,
    dir: path.dirname(abs),
    relpath: safeRel
  };
}
function stripLeadingDotSlash(value) {
  return value.startsWith("./") ? value.slice(2) : value;
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
  loadPluginLocalSkill
};
