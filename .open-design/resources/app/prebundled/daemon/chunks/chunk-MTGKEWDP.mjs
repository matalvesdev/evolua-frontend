import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);

// ../daemon/dist/plugins/search.js
function searchInstalledPlugins(input) {
  const query = (input.query ?? "").trim().toLowerCase();
  const taskKind = input.taskKind?.trim().toLowerCase();
  const mode = input.mode?.trim().toLowerCase();
  const tag = input.tag?.trim().toLowerCase();
  const trust = input.trust;
  const bundledFilter = input.bundled;
  const out = [];
  for (const plugin of input.plugins) {
    const manifest = plugin.manifest;
    const matched = [];
    if (taskKind && (manifest.od?.taskKind ?? "").toLowerCase() !== taskKind)
      continue;
    if (taskKind)
      matched.push("taskKind");
    if (mode && (manifest.od?.mode ?? "").toLowerCase() !== mode)
      continue;
    if (mode)
      matched.push("mode");
    if (trust && plugin.trust !== trust)
      continue;
    if (trust)
      matched.push("trust");
    if (typeof bundledFilter === "boolean") {
      const isBundled = plugin.sourceKind === "bundled" || plugin.trust === "bundled";
      if (isBundled !== bundledFilter)
        continue;
      if (bundledFilter)
        matched.push("bundled");
    }
    const tags = collectTags(manifest);
    if (tag && !tags.some((t) => t.toLowerCase() === tag))
      continue;
    if (tag)
      matched.push("tag");
    let rank;
    if (query) {
      const id = plugin.id.toLowerCase();
      const title = (plugin.title ?? manifest.title ?? "").toLowerCase();
      const description = (manifest.description ?? "").toLowerCase();
      if (id === query) {
        rank = 0;
        matched.push("id");
      } else if (title === query) {
        rank = 1;
        matched.push("title");
      } else if (tags.some((t) => t.toLowerCase() === query)) {
        rank = 2;
        matched.push("tag");
      } else if (id.includes(query)) {
        rank = 3;
        matched.push("id");
      } else if (title.includes(query)) {
        rank = 4;
        matched.push("title");
      } else if (description.includes(query)) {
        rank = 5;
        matched.push("description");
      } else if (tags.some((t) => t.toLowerCase().includes(query))) {
        rank = 6;
        matched.push("tag");
      } else
        continue;
    } else {
      rank = matched.length > 0 ? 9 : 0;
    }
    out.push({ plugin, rank, matched });
  }
  out.sort((a, b) => {
    if (a.rank !== b.rank)
      return a.rank - b.rank;
    return a.plugin.id.localeCompare(b.plugin.id);
  });
  return { entries: out, total: out.length };
}
function collectTags(manifest) {
  const raw = manifest.tags;
  if (!Array.isArray(raw))
    return [];
  return raw.filter((t) => typeof t === "string" && t.length > 0);
}

export {
  searchInstalledPlugins
};
