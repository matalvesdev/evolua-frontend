import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);
import {
  adaptAgentSkill,
  adaptClaudePlugin,
  mergeManifests,
  parseManifest,
  validateSafe
} from "./chunk-4TAOG76C.mjs";

// ../daemon/dist/plugins/registry.js
import path from "node:path";
import fs from "node:fs";
import { promises as fsp } from "node:fs";
function registryRootsForDataDir(dataDir) {
  return {
    userPluginsRoot: path.join(dataDir, "plugins")
  };
}
function defaultRegistryRoots() {
  return registryRootsForDataDir(path.resolve(process.env.OD_DATA_DIR ?? path.join(process.cwd(), ".od")));
}
async function resolvePluginFolder(opts) {
  const warnings = [];
  const errors = [];
  const folder = opts.folder;
  let stats;
  try {
    stats = await fsp.stat(folder);
  } catch (err) {
    return { ok: false, errors: [`Plugin folder not found: ${folder} (${err.message})`], warnings };
  }
  if (!stats.isDirectory()) {
    return { ok: false, errors: [`Plugin path is not a directory: ${folder}`], warnings };
  }
  const sidecarPath = path.join(folder, "open-design.json");
  const skillPath = path.join(folder, "SKILL.md");
  const claudePath = path.join(folder, ".claude-plugin", "plugin.json");
  let sidecar;
  if (fs.existsSync(sidecarPath)) {
    const rawSidecar = await fsp.readFile(sidecarPath, "utf8");
    const parsed = parseManifest(rawSidecar);
    if (!parsed.ok) {
      errors.push(...parsed.errors.map((e) => `open-design.json: ${e}`));
    } else {
      sidecar = parsed.manifest;
      warnings.push(...parsed.warnings);
    }
  }
  const adapters = [];
  if (fs.existsSync(skillPath)) {
    const raw = await fsp.readFile(skillPath, "utf8");
    const adapted = adaptAgentSkill(raw, { folderId: opts.folderId });
    adapters.push(adapted.manifest);
    warnings.push(...adapted.warnings);
  }
  if (fs.existsSync(claudePath)) {
    const raw = await fsp.readFile(claudePath, "utf8");
    const adapted = adaptClaudePlugin(raw, { folderId: opts.folderId });
    adapters.push(adapted.manifest);
    warnings.push(...adapted.warnings);
  }
  if (!sidecar && adapters.length === 0) {
    return {
      ok: false,
      errors: [...errors, `Plugin folder contains no SKILL.md, no .claude-plugin/plugin.json, and no open-design.json: ${folder}`],
      warnings
    };
  }
  const manifest = mergeManifests({ sidecar, adapters });
  const validation = validateSafe(manifest);
  warnings.push(...validation.warnings);
  if (!validation.ok) {
    return { ok: false, errors: [...errors, ...validation.errors], warnings };
  }
  if (errors.length > 0) {
    return { ok: false, errors, warnings };
  }
  const now = Date.now();
  const id = (manifest.name ?? opts.folderId).toLowerCase();
  const record = {
    id,
    title: manifest.title ?? manifest.name,
    version: manifest.version,
    sourceKind: opts.sourceKind ?? "local",
    source: opts.source ?? folder,
    pinnedRef: opts.pinnedRef,
    sourceMarketplaceId: opts.sourceMarketplaceId,
    sourceMarketplaceEntryName: opts.sourceMarketplaceEntryName,
    sourceMarketplaceEntryVersion: opts.sourceMarketplaceEntryVersion,
    marketplaceTrust: opts.marketplaceTrust,
    resolvedSource: opts.resolvedSource,
    resolvedRef: opts.resolvedRef,
    manifestDigest: opts.manifestDigest,
    archiveIntegrity: opts.archiveIntegrity,
    trust: opts.trust ?? "restricted",
    capabilitiesGranted: opts.capabilitiesGranted ?? defaultRestrictedCapabilities(),
    manifest,
    fsPath: folder,
    installedAt: now,
    updatedAt: now
  };
  return { ok: true, record, warnings };
}
function defaultRestrictedCapabilities() {
  return ["prompt:inject"];
}
function rowToInstalledPlugin(row) {
  const manifestJson = typeof row["manifest_json"] === "string" ? row["manifest_json"] : "{}";
  const manifest = JSON.parse(manifestJson);
  const capabilitiesJson = typeof row["capabilities_granted"] === "string" ? row["capabilities_granted"] : "[]";
  const capabilities = JSON.parse(capabilitiesJson);
  return {
    id: String(row["id"]),
    title: String(row["title"]),
    version: String(row["version"]),
    sourceKind: row["source_kind"],
    source: String(row["source"]),
    pinnedRef: row["pinned_ref"] != null ? String(row["pinned_ref"]) : void 0,
    sourceDigest: row["source_digest"] != null ? String(row["source_digest"]) : void 0,
    sourceMarketplaceId: row["source_marketplace_id"] != null ? String(row["source_marketplace_id"]) : void 0,
    sourceMarketplaceEntryName: row["source_marketplace_entry_name"] != null ? String(row["source_marketplace_entry_name"]) : void 0,
    sourceMarketplaceEntryVersion: row["source_marketplace_entry_version"] != null ? String(row["source_marketplace_entry_version"]) : void 0,
    marketplaceTrust: row["marketplace_trust"] != null ? row["marketplace_trust"] : void 0,
    resolvedSource: row["resolved_source"] != null ? String(row["resolved_source"]) : void 0,
    resolvedRef: row["resolved_ref"] != null ? String(row["resolved_ref"]) : void 0,
    manifestDigest: row["manifest_digest"] != null ? String(row["manifest_digest"]) : void 0,
    archiveIntegrity: row["archive_integrity"] != null ? String(row["archive_integrity"]) : void 0,
    trust: row["trust"],
    capabilitiesGranted: Array.isArray(capabilities) ? capabilities : [],
    manifest,
    fsPath: String(row["fs_path"]),
    installedAt: Number(row["installed_at"]),
    updatedAt: Number(row["updated_at"])
  };
}
function listInstalledPlugins(db) {
  const rows = db.prepare(`SELECT * FROM installed_plugins ORDER BY title ASC`).all();
  return rows.map(rowToInstalledPlugin);
}
function getInstalledPlugin(db, id) {
  const row = db.prepare(`SELECT * FROM installed_plugins WHERE id = ?`).get(id);
  return row ? rowToInstalledPlugin(row) : null;
}
function upsertInstalledPlugin(db, record) {
  db.prepare(`
    INSERT INTO installed_plugins (
      id, title, version, source_kind, source, pinned_ref, source_digest,
      source_marketplace_id, source_marketplace_entry_name,
      source_marketplace_entry_version, marketplace_trust, resolved_source,
      resolved_ref, manifest_digest, archive_integrity,
      trust, capabilities_granted, manifest_json,
      fs_path, installed_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      version = excluded.version,
      source_kind = excluded.source_kind,
      source = excluded.source,
      pinned_ref = excluded.pinned_ref,
      source_digest = excluded.source_digest,
      source_marketplace_id = excluded.source_marketplace_id,
      source_marketplace_entry_name = excluded.source_marketplace_entry_name,
      source_marketplace_entry_version = excluded.source_marketplace_entry_version,
      marketplace_trust = excluded.marketplace_trust,
      resolved_source = excluded.resolved_source,
      resolved_ref = excluded.resolved_ref,
      manifest_digest = excluded.manifest_digest,
      archive_integrity = excluded.archive_integrity,
      trust = excluded.trust,
      capabilities_granted = excluded.capabilities_granted,
      manifest_json = excluded.manifest_json,
      fs_path = excluded.fs_path,
      updated_at = excluded.updated_at
  `).run(record.id, record.title, record.version, record.sourceKind, record.source, record.pinnedRef ?? null, record.sourceDigest ?? null, record.sourceMarketplaceId ?? null, record.sourceMarketplaceEntryName ?? null, record.sourceMarketplaceEntryVersion ?? null, record.marketplaceTrust ?? null, record.resolvedSource ?? null, record.resolvedRef ?? null, record.manifestDigest ?? null, record.archiveIntegrity ?? null, record.trust, JSON.stringify(record.capabilitiesGranted ?? []), JSON.stringify(record.manifest), record.fsPath, record.installedAt, record.updatedAt);
}
function deleteInstalledPlugin(db, id) {
  const info = db.prepare(`DELETE FROM installed_plugins WHERE id = ?`).run(id);
  return info.changes > 0;
}

export {
  registryRootsForDataDir,
  defaultRegistryRoots,
  resolvePluginFolder,
  listInstalledPlugins,
  getInstalledPlugin,
  upsertInstalledPlugin,
  deleteInstalledPlugin
};
