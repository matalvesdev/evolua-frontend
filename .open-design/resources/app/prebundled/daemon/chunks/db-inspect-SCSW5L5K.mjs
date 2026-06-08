import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);
import "./chunk-WRAIAC3Y.mjs";

// ../daemon/dist/storage/db-inspect.js
import { promises as fsp } from "node:fs";
var SYSTEM_TABLE_PREFIXES = ["sqlite_", "better_sqlite3_"];
function isSystemTable(name) {
  return SYSTEM_TABLE_PREFIXES.some((p) => name.startsWith(p));
}
async function inspectSqliteDatabase(input) {
  const { db, file } = input;
  let schemaVersion = null;
  try {
    const v = db.pragma("user_version", { simple: true });
    schemaVersion = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(schemaVersion))
      schemaVersion = null;
  } catch {
    schemaVersion = null;
  }
  const tables = [];
  try {
    const names = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).all();
    for (const { name } of names) {
      if (isSystemTable(name))
        continue;
      try {
        const safe = sanitizeTableName(name);
        if (!safe)
          continue;
        const row = db.prepare(`SELECT count(*) AS c FROM "${safe}"`).get();
        tables.push({ name: safe, rowCount: row?.c ?? 0 });
      } catch {
        tables.push({ name, rowCount: 0 });
      }
    }
  } catch {
  }
  const sizeBytes = await sumFileSizes([file, `${file}-wal`, `${file}-shm`]);
  return {
    kind: "sqlite",
    location: file,
    sizeBytes,
    schemaVersion,
    tables,
    generatedAt: Date.now()
  };
}
async function sumFileSizes(paths) {
  let total = 0;
  for (const p of paths) {
    try {
      const stat = await fsp.stat(p);
      total += stat.size;
    } catch {
    }
  }
  return total;
}
function sanitizeTableName(name) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name))
    return null;
  return name;
}
function verifySqliteIntegrity(opts) {
  const { db, quick = false } = opts;
  const startedAt = Date.now();
  const issues = [];
  const pragma = quick ? "quick_check" : "integrity_check";
  try {
    const rows = db.pragma(pragma);
    for (const row of rows) {
      const message = row[pragma] ?? Object.values(row)[0];
      if (typeof message !== "string")
        continue;
      if (message.toLowerCase() === "ok")
        continue;
      issues.push({ kind: "integrity", message });
    }
  } catch (err) {
    issues.push({ kind: "integrity", message: `pragma ${pragma} threw: ${err.message}` });
  }
  try {
    const rows = db.pragma("foreign_key_check");
    for (const row of rows) {
      const tbl = row.table ?? "?";
      const parent = row.parent ?? "?";
      const fkid = row.fkid ?? "?";
      const rowid = row.rowid ?? "?";
      issues.push({
        kind: "foreign_key",
        message: `FK violation in ${tbl} (rowid=${rowid}) referencing ${parent} (fkid=${fkid})`
      });
    }
  } catch (err) {
    issues.push({ kind: "foreign_key", message: `pragma foreign_key_check threw: ${err.message}` });
  }
  return {
    ok: issues.length === 0,
    mode: quick ? "quick_check" : "integrity_check",
    issues,
    elapsedMs: Date.now() - startedAt,
    generatedAt: Date.now()
  };
}
export {
  inspectSqliteDatabase,
  verifySqliteIntegrity
};
