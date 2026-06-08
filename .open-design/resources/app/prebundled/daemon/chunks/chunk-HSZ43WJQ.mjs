import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);

// ../daemon/dist/plugins/publish.js
var PublishError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "PublishError";
  }
};
var KNOWN_TARGETS = /* @__PURE__ */ new Set([
  "anthropics-skills",
  "awesome-agent-skills",
  "clawhub",
  "skills-sh",
  "open-design"
]);
function buildPublishLink(args) {
  if (!KNOWN_TARGETS.has(args.catalog)) {
    throw new PublishError(`unknown catalog: ${args.catalog}. Accepted: ${Array.from(KNOWN_TARGETS).join(", ")}`);
  }
  const m = args.meta;
  const title = `Add ${m.pluginTitle ?? m.pluginId}`;
  const body = renderPrBody(m);
  switch (args.catalog) {
    case "anthropics-skills": {
      const url = newIssueUrl("anthropics/skills", title, body);
      return { catalog: args.catalog, catalogLabel: "anthropics/skills", url, prBody: body };
    }
    case "awesome-agent-skills": {
      const url = newIssueUrl("VoltAgent/awesome-agent-skills", title, body);
      return { catalog: args.catalog, catalogLabel: "VoltAgent/awesome-agent-skills", url, prBody: body };
    }
    case "clawhub": {
      const url = newIssueUrl("openclaw/clawhub", title, body);
      return { catalog: args.catalog, catalogLabel: "openclaw/clawhub", url, prBody: body };
    }
    case "skills-sh": {
      const repo = m.repoUrl?.replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/i, "") ?? "owner/repo";
      return {
        catalog: args.catalog,
        catalogLabel: "skills.sh",
        url: "https://skills.sh/",
        prBody: [
          body,
          "",
          "## Submission steps",
          "",
          `1. Push the plugin repo to https://github.com/${repo}`,
          `2. Run \`npx skills add ${repo}\` once locally to seed the catalog index.`,
          "3. Verify the entry appears at https://skills.sh/ within ~24 hours."
        ].join("\n")
      };
    }
    case "open-design": {
      const bodyWithRegistry = [
        body,
        "",
        "## Open Design registry entry",
        "",
        "- Target path: `plugins/community/<plugin-name>/open-design.json`",
        "- Generated index: `plugins/registry/community/open-design-marketplace.json`",
        "- Required checks: `od plugin validate`, `od plugin pack`, integrity digest, preview smoke."
      ].join("\n");
      const url = newIssueUrl("nexu-io/open-design", title, bodyWithRegistry);
      return {
        catalog: args.catalog,
        catalogLabel: "nexu-io/open-design",
        url,
        prBody: bodyWithRegistry
      };
    }
  }
  throw new PublishError(`unhandled catalog: ${String(args.catalog)}`);
}
function buildMarketplaceJsonEntry(meta) {
  if (!meta.pluginId.includes("/")) {
    throw new PublishError("marketplace-json publish requires a stable namespaced id: vendor/plugin-name");
  }
  if (!meta.repoUrl) {
    throw new PublishError("marketplace-json publish requires meta.repoUrl");
  }
  const parsedRepo = parseGithubRepo(meta.repoUrl);
  const entry = {
    name: meta.pluginId,
    source: parsedRepo.source,
    version: meta.pluginVersion,
    repo: meta.repoUrl,
    homepage: meta.repoUrl,
    publisher: {
      name: parsedRepo.owner,
      github: parsedRepo.owner,
      url: `https://github.com/${parsedRepo.owner}`
    }
  };
  if (meta.pluginTitle)
    entry.title = meta.pluginTitle;
  if (meta.pluginDescription)
    entry.description = meta.pluginDescription;
  return entry;
}
function upsertMarketplaceJsonEntry(args) {
  const entry = buildMarketplaceJsonEntry(args.meta);
  const existing = args.manifest ?? {};
  const plugins = Array.isArray(existing.plugins) ? existing.plugins : [];
  let inserted = true;
  const nextPlugins = plugins.map((plugin) => {
    if (plugin?.name === entry.name) {
      inserted = false;
      return {
        ...plugin,
        ...entry
      };
    }
    return plugin;
  });
  if (inserted) {
    nextPlugins.push(entry);
  }
  nextPlugins.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  const manifest = {
    ...existing,
    specVersion: typeof existing.specVersion === "string" ? existing.specVersion : "1.0.0",
    name: typeof existing.name === "string" ? existing.name : "open-design-marketplace",
    version: typeof existing.version === "string" ? existing.version : "1.0.0",
    generatedAt: args.generatedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
    plugins: nextPlugins
  };
  return { manifest, entry, inserted };
}
function newIssueUrl(repo, title, body) {
  const params = new URLSearchParams();
  params.set("title", title);
  params.set("body", body);
  return `https://github.com/${repo}/issues/new?${params.toString()}`;
}
function parseGithubRepo(repoUrl) {
  let url;
  try {
    url = new URL(repoUrl);
  } catch {
    throw new PublishError(`unsupported repo URL: ${repoUrl}`);
  }
  if (url.hostname.toLowerCase() !== "github.com") {
    throw new PublishError("marketplace-json publish currently requires a github.com repo URL");
  }
  const parts = url.pathname.split("/").filter(Boolean);
  const owner = parts[0];
  const repo = parts[1]?.replace(/\.git$/i, "");
  if (!owner || !repo) {
    throw new PublishError(`unsupported GitHub repo URL: ${repoUrl}`);
  }
  if (parts[2] === "tree" && parts[3]) {
    const ref = parts[3];
    const subpath = parts.slice(4).join("/");
    return {
      owner,
      repo,
      source: `github:${owner}/${repo}@${ref}${subpath ? `/${subpath}` : ""}`
    };
  }
  return {
    owner,
    repo,
    source: `github:${owner}/${repo}`
  };
}
function renderPrBody(m) {
  const lines = [];
  lines.push(`## ${m.pluginTitle ?? m.pluginId}`);
  if (m.pluginDescription) {
    lines.push("");
    lines.push(m.pluginDescription);
  }
  lines.push("");
  lines.push("## Provenance");
  lines.push("");
  lines.push(`- name: \`${m.pluginId}\``);
  lines.push(`- version: \`${m.pluginVersion}\``);
  if (m.repoUrl)
    lines.push(`- repository: ${m.repoUrl}`);
  lines.push("");
  lines.push("## Compatibility");
  lines.push("");
  lines.push("- Ships `SKILL.md` (canonical agent skill anchor).");
  lines.push("- Ships `open-design.json` sidecar (additive Open Design metadata).");
  lines.push("");
  lines.push("Generated by `od plugin publish` \u2014 see https://open-design.ai/docs/plugins-spec.md.");
  return lines.join("\n");
}
var PUBLISH_TARGETS = Array.from(KNOWN_TARGETS);

export {
  PublishError,
  buildPublishLink,
  buildMarketplaceJsonEntry,
  upsertMarketplaceJsonEntry,
  PUBLISH_TARGETS
};
