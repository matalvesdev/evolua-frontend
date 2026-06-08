import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);
import {
  readPluginEnvKnobs
} from "./chunk-2BSQKLPO.mjs";
import {
  OPEN_DESIGN_PLUGIN_SPEC_VERSION
} from "./chunk-KZ5KHCCG.mjs";

// ../daemon/dist/plugins/snapshots.js
import { randomUUID } from "node:crypto";
function createSnapshot(db, input) {
  const id = randomUUID();
  const now = Date.now();
  const knobs = readPluginEnvKnobs();
  const expiresAt = input.runId ? null : knobs.snapshotUnreferencedTtlDays > 0 ? now + knobs.snapshotUnreferencedTtlDays * 24 * 60 * 60 * 1e3 : null;
  db.prepare(`
    INSERT INTO applied_plugin_snapshots (
      id, project_id, conversation_id, run_id, plugin_id, plugin_spec_version, plugin_version,
      manifest_source_digest, source_marketplace_id, source_marketplace_entry_name,
      source_marketplace_entry_version, marketplace_trust, resolved_source,
      resolved_ref, archive_integrity, pinned_ref, task_kind,
      inputs_json, resolved_context_json, pipeline_json, genui_surfaces_json,
      capabilities_granted, capabilities_required, assets_staged_json,
      connectors_required_json, connectors_resolved_json, mcp_servers_json,
      plugin_title, plugin_description, query_text,
      status, applied_at, expires_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'fresh', ?, ?)
  `).run(id, input.projectId, input.conversationId ?? null, input.runId ?? null, input.pluginId, input.pluginSpecVersion ?? OPEN_DESIGN_PLUGIN_SPEC_VERSION, input.pluginVersion, input.manifestSourceDigest, input.sourceMarketplaceId ?? null, input.sourceMarketplaceEntryName ?? null, input.sourceMarketplaceEntryVersion ?? null, input.marketplaceTrust ?? null, input.resolvedSource ?? null, input.resolvedRef ?? null, input.archiveIntegrity ?? null, input.pinnedRef ?? null, input.taskKind, JSON.stringify(input.inputs), JSON.stringify(input.resolvedContext), input.pipeline ? JSON.stringify(input.pipeline) : null, JSON.stringify(input.genuiSurfaces ?? []), JSON.stringify(input.capabilitiesGranted), JSON.stringify(input.capabilitiesRequired), JSON.stringify(input.assetsStaged), JSON.stringify(input.connectorsRequired), JSON.stringify(input.connectorsResolved), JSON.stringify(input.mcpServers), input.pluginTitle ?? null, input.pluginDescription ?? null, input.query ?? null, now, expiresAt);
  const snapshot = buildSnapshot({
    id,
    appliedAt: now,
    input,
    status: "fresh"
  });
  return snapshot;
}
function getSnapshot(db, snapshotId) {
  const row = db.prepare(`SELECT * FROM applied_plugin_snapshots WHERE id = ?`).get(snapshotId);
  if (!row)
    return null;
  return rowToSnapshot(row);
}
function listSnapshotsForProject(db, projectId) {
  const rows = db.prepare(`SELECT * FROM applied_plugin_snapshots WHERE project_id = ? ORDER BY applied_at DESC`).all(projectId);
  return rows.map(rowToSnapshot);
}
function linkSnapshotToRun(db, snapshotId, runId) {
  db.prepare(`
    UPDATE applied_plugin_snapshots
       SET run_id = ?, expires_at = NULL
     WHERE id = ?
  `).run(runId, snapshotId);
}
function linkSnapshotToProject(db, snapshotId, projectId) {
  db.prepare(`UPDATE applied_plugin_snapshots
        SET project_id = ?, expires_at = NULL
      WHERE id = ?`).run(projectId, snapshotId);
  db.prepare(`UPDATE projects
        SET applied_plugin_snapshot_id = ?
      WHERE id = ?`).run(snapshotId, projectId);
}
function restoreProjectSnapshotLink(db, projectId, snapshotIdToDiscard, previousSnapshotId, discardedRunId) {
  const previous = typeof previousSnapshotId === "string" && previousSnapshotId.length > 0 ? previousSnapshotId : null;
  db.prepare(`UPDATE projects
        SET applied_plugin_snapshot_id = ?
      WHERE id = ?
        AND applied_plugin_snapshot_id = ?`).run(previous, projectId, snapshotIdToDiscard);
  const expiry = unreferencedSnapshotExpiry();
  if (typeof discardedRunId === "string" && discardedRunId.length > 0) {
    const result = db.prepare(`UPDATE applied_plugin_snapshots
          SET run_id = NULL,
              expires_at = ?
        WHERE id = ?
          AND project_id = ?
          AND run_id = ?`).run(expiry, snapshotIdToDiscard, projectId, discardedRunId);
    if (result.changes > 0)
      return;
  }
  db.prepare(`UPDATE applied_plugin_snapshots
        SET expires_at = ?
      WHERE id = ?
        AND run_id IS NULL
        AND project_id = ?`).run(expiry, snapshotIdToDiscard, projectId);
}
function unreferencedSnapshotExpiry() {
  const days = readPluginEnvKnobs().snapshotUnreferencedTtlDays;
  return days > 0 ? Date.now() + days * 24 * 60 * 60 * 1e3 : null;
}
function linkSnapshotToConversation(db, snapshotId, conversationId) {
  db.prepare(`UPDATE applied_plugin_snapshots
        SET conversation_id = ?, expires_at = NULL
      WHERE id = ?`).run(conversationId, snapshotId);
  db.prepare(`UPDATE conversations
        SET applied_plugin_snapshot_id = ?
      WHERE id = ?`).run(snapshotId, conversationId);
}
function markSnapshotStale(db, snapshotId) {
  db.prepare(`UPDATE applied_plugin_snapshots SET status = 'stale' WHERE id = ?`).run(snapshotId);
}
function pruneExpiredSnapshots(db, options = {}) {
  const now = options.now ?? Date.now();
  const cutoff = typeof options.before === "number" ? options.before : now;
  const expiredIds = db.prepare(`SELECT id FROM applied_plugin_snapshots
        WHERE expires_at IS NOT NULL AND expires_at <= ?`).all(cutoff);
  const beforeIds = typeof options.before === "number" ? db.prepare(`SELECT id FROM applied_plugin_snapshots
            WHERE expires_at IS NULL AND run_id IS NULL AND applied_at <= ?`).all(options.before) : [];
  const retentionIds = [];
  if (typeof options.retentionDays === "number" && options.retentionDays > 0) {
    const retentionCutoff = now - options.retentionDays * 24 * 60 * 60 * 1e3;
    const rows = db.prepare(`SELECT s.id AS id
           FROM applied_plugin_snapshots s
           LEFT JOIN projects p ON p.id = s.project_id
          WHERE s.applied_at <= ?
            AND p.id IS NULL`).all(retentionCutoff);
    retentionIds.push(...rows);
  }
  const ids = [...expiredIds, ...beforeIds, ...retentionIds].map((r) => r.id);
  const unique = Array.from(new Set(ids));
  if (unique.length === 0)
    return { removed: 0, ids: [] };
  const placeholders = unique.map(() => "?").join(", ");
  db.prepare(`DELETE FROM applied_plugin_snapshots WHERE id IN (${placeholders})`).run(...unique);
  return { removed: unique.length, ids: unique };
}
function countSnapshotsForProject(db, projectId) {
  const row = db.prepare(`SELECT COUNT(*) AS n FROM applied_plugin_snapshots WHERE project_id = ?`).get(projectId);
  return Number(row["n"] ?? 0);
}
function buildSnapshot(args) {
  const { id, appliedAt, input, status } = args;
  const snapshot = {
    snapshotId: id,
    pluginId: input.pluginId,
    pluginSpecVersion: input.pluginSpecVersion ?? OPEN_DESIGN_PLUGIN_SPEC_VERSION,
    pluginVersion: input.pluginVersion,
    manifestSourceDigest: input.manifestSourceDigest,
    sourceMarketplaceId: input.sourceMarketplaceId ?? void 0,
    sourceMarketplaceEntryName: input.sourceMarketplaceEntryName ?? void 0,
    sourceMarketplaceEntryVersion: input.sourceMarketplaceEntryVersion ?? void 0,
    marketplaceTrust: input.marketplaceTrust ?? void 0,
    resolvedSource: input.resolvedSource ?? void 0,
    resolvedRef: input.resolvedRef ?? void 0,
    archiveIntegrity: input.archiveIntegrity ?? void 0,
    pinnedRef: input.pinnedRef ?? void 0,
    inputs: input.inputs,
    resolvedContext: input.resolvedContext,
    capabilitiesGranted: input.capabilitiesGranted,
    capabilitiesRequired: input.capabilitiesRequired,
    assetsStaged: input.assetsStaged,
    taskKind: input.taskKind,
    appliedAt,
    connectorsRequired: input.connectorsRequired,
    connectorsResolved: input.connectorsResolved,
    mcpServers: input.mcpServers,
    pipeline: input.pipeline,
    genuiSurfaces: input.genuiSurfaces,
    pluginTitle: input.pluginTitle,
    pluginDescription: input.pluginDescription,
    query: input.query,
    status
  };
  return snapshot;
}
function rowToSnapshot(row) {
  const pipeline = parseJsonOrUndefined(row["pipeline_json"]);
  const snapshot = {
    snapshotId: String(row["id"]),
    pluginId: String(row["plugin_id"]),
    pluginSpecVersion: row["plugin_spec_version"] != null ? String(row["plugin_spec_version"]) : void 0,
    pluginVersion: String(row["plugin_version"]),
    manifestSourceDigest: String(row["manifest_source_digest"]),
    sourceMarketplaceId: row["source_marketplace_id"] != null ? String(row["source_marketplace_id"]) : void 0,
    sourceMarketplaceEntryName: row["source_marketplace_entry_name"] != null ? String(row["source_marketplace_entry_name"]) : void 0,
    sourceMarketplaceEntryVersion: row["source_marketplace_entry_version"] != null ? String(row["source_marketplace_entry_version"]) : void 0,
    marketplaceTrust: row["marketplace_trust"] != null ? row["marketplace_trust"] : void 0,
    resolvedSource: row["resolved_source"] != null ? String(row["resolved_source"]) : void 0,
    resolvedRef: row["resolved_ref"] != null ? String(row["resolved_ref"]) : void 0,
    archiveIntegrity: row["archive_integrity"] != null ? String(row["archive_integrity"]) : void 0,
    pinnedRef: row["pinned_ref"] != null ? String(row["pinned_ref"]) : void 0,
    inputs: parseJsonOr(row["inputs_json"], {}),
    resolvedContext: parseJsonOr(row["resolved_context_json"], { items: [] }),
    capabilitiesGranted: parseJsonOr(row["capabilities_granted"], []),
    capabilitiesRequired: parseJsonOr(row["capabilities_required"], []),
    assetsStaged: parseJsonOr(row["assets_staged_json"], []),
    taskKind: row["task_kind"],
    appliedAt: Number(row["applied_at"]),
    connectorsRequired: parseJsonOr(row["connectors_required_json"], []),
    connectorsResolved: parseJsonOr(row["connectors_resolved_json"], []),
    mcpServers: parseJsonOr(row["mcp_servers_json"], []),
    pipeline,
    genuiSurfaces: parseJsonOr(row["genui_surfaces_json"], []),
    pluginTitle: row["plugin_title"] != null ? String(row["plugin_title"]) : void 0,
    pluginDescription: row["plugin_description"] != null ? String(row["plugin_description"]) : void 0,
    query: row["query_text"] != null ? String(row["query_text"]) : void 0,
    status: row["status"] === "stale" ? "stale" : "fresh"
  };
  return snapshot;
}
function parseJsonOr(value, fallback) {
  if (typeof value !== "string" || value.length === 0)
    return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
function parseJsonOrUndefined(value) {
  if (typeof value !== "string" || value.length === 0)
    return void 0;
  try {
    return JSON.parse(value);
  } catch {
    return void 0;
  }
}

export {
  createSnapshot,
  getSnapshot,
  listSnapshotsForProject,
  linkSnapshotToRun,
  linkSnapshotToProject,
  restoreProjectSnapshotLink,
  linkSnapshotToConversation,
  markSnapshotStale,
  pruneExpiredSnapshots,
  countSnapshotsForProject,
  rowToSnapshot
};
