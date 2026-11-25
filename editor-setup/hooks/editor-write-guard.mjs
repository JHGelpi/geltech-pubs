#!/usr/bin/env node
// PreToolUse guard for the `editor` subagent.
// Allows Write only to research/<slug>.review.md or research/<slug>.talking-points.md.
// Anything else is blocked with exit code 2 (the message goes back to the agent).
import { readFileSync } from "node:fs";
import path from "node:path";

let input = {};
try {
  input = JSON.parse(readFileSync(0, "utf8") || "{}");
} catch {
  console.error("editor-write-guard: could not parse hook input; blocking to be safe.");
  process.exit(2);
}

const filePath = input?.tool_input?.file_path;
if (!filePath) {
  console.error("editor-write-guard: no file_path in Write call; blocking.");
  process.exit(2);
}

const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const researchDir = path.resolve(projectDir, "research");
const target = path.resolve(projectDir, filePath);
const rel = path.relative(researchDir, target);

const insideResearch = rel && !rel.startsWith("..") && !path.isAbsolute(rel);
const isTopLevel = insideResearch && !rel.includes(path.sep);
const allowedName = /^[a-z0-9][a-z0-9-]*\.(review|talking-points)\.md$/.test(rel);

if (insideResearch && isTopLevel && allowedName) process.exit(0);

console.error(
  `Blocked: the editor may only write research/<slug>.review.md or research/<slug>.talking-points.md (attempted: ${filePath}). ` +
    "Post content is Wes's to write."
);
process.exit(2);
