import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);

// ../daemon/dist/plugins/scaffold.js
import path from "node:path";
import { promises as fsp } from "node:fs";
var SAFE_ID = /^[a-z][a-z0-9._-]{0,62}$/;
var ScaffoldError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ScaffoldError";
  }
};
async function scaffoldPlugin(input) {
  if (!SAFE_ID.test(input.id)) {
    throw new ScaffoldError(`plugin id "${input.id}" must be lowercase, start with a letter, and use [a-z0-9._-]`);
  }
  const folder = path.join(input.targetDir, input.id);
  try {
    const entries = await fsp.readdir(folder).catch(() => []);
    const conflicts = entries.filter((e) => e === "SKILL.md" || e === "open-design.json" || e === ".claude-plugin" || e === "README.md");
    if (conflicts.length > 0) {
      throw new ScaffoldError(`destination ${folder} already contains ${conflicts.join(", ")}; refusing to overwrite`);
    }
  } catch (err) {
    if (err instanceof ScaffoldError)
      throw err;
    if (err.code !== "ENOENT")
      throw err;
  }
  const title = input.title?.trim() || humanize(input.id);
  const description = input.description?.trim() || `One-paragraph description of ${title}.`;
  const taskKind = input.taskKind ?? "new-generation";
  await fsp.mkdir(folder, { recursive: true });
  const written = [];
  const skillFrontmatter = [
    "---",
    `name: ${input.id}`,
    `description: ${description}`,
    "od:",
    `  mode: ${input.mode ?? "prototype"}`,
    `  scenario: ${input.scenario ?? "general"}`,
    "---",
    "",
    `# ${title}`,
    "",
    "Workflow steps:",
    "",
    "1. Discovery / clarifying questions.",
    "2. Plan + direction picker.",
    "3. Generate the artifact.",
    "4. Self-critique against the design system + craft rules.",
    "",
    `Replace this body with the actual ${title} workflow before publishing.`,
    ""
  ].join("\n");
  const skillPath = path.join(folder, "SKILL.md");
  await fsp.writeFile(skillPath, skillFrontmatter, "utf8");
  written.push(skillPath);
  const manifest = {
    $schema: "https://open-design.ai/schemas/plugin.v1.json",
    specVersion: "1.0.0",
    name: input.id,
    title,
    version: "0.1.0",
    description,
    license: "MIT",
    tags: [taskKind],
    compat: { agentSkills: [{ path: "./SKILL.md" }] },
    od: {
      kind: "skill",
      taskKind,
      mode: input.mode ?? "prototype",
      scenario: input.scenario ?? "general",
      useCase: { query: `Generate a ${title.toLowerCase()} for {{audience}}.` },
      context: {
        skills: [{ ref: input.id }],
        atoms: ["discovery-question-form", "todo-write"]
      },
      inputs: [
        { name: "audience", type: "string", required: true, label: "Audience" }
      ],
      capabilities: ["prompt:inject"]
    }
  };
  const manifestPath = path.join(folder, "open-design.json");
  await fsp.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  written.push(manifestPath);
  const readme = [
    `# ${title}`,
    "",
    description,
    "",
    "## Try it",
    "",
    "```bash",
    `od plugin install ./${input.id}`,
    `od plugin apply ${input.id} --input audience=VC`,
    "```",
    "",
    "## Files",
    "",
    "- `SKILL.md` \u2014 the canonical agent skill body.",
    "- `open-design.json` \u2014 the versioned Open Design marketplace sidecar.",
    "",
    "Edit `SKILL.md` to teach the agent how to perform the workflow.",
    "Edit `open-design.json` to refine the marketplace card and inputs.",
    ""
  ].join("\n");
  const readmePath = path.join(folder, "README.md");
  await fsp.writeFile(readmePath, readme, "utf8");
  written.push(readmePath);
  if (input.withClaudePlugin) {
    const claudeDir = path.join(folder, ".claude-plugin");
    await fsp.mkdir(claudeDir, { recursive: true });
    const cp = {
      name: input.id,
      description,
      version: "0.1.0"
    };
    const cpPath = path.join(claudeDir, "plugin.json");
    await fsp.writeFile(cpPath, JSON.stringify(cp, null, 2) + "\n", "utf8");
    written.push(cpPath);
  }
  return { folder, files: written };
}
function humanize(id) {
  return id.replace(/[-_]+/g, " ").split(" ").filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}

export {
  ScaffoldError,
  scaffoldPlugin
};
