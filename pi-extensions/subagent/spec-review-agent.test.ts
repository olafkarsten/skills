import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const agentPath = path.join(process.cwd(), "subagent/agents/spec-review-agent.md");

test("spec-review-agent is defined for brainstorming spec review loops", () => {
	const content = fs.readFileSync(agentPath, "utf-8");

	assert.match(content, /^---\nname: spec-review-agent\n/m);
	assert.match(content, /Reviews design specs/i);
	assert.match(content, /Ready for implementation plan\./);
	assert.match(content, /Needs modification before implementation plan\./);
	assert.match(content, /brainstorming/i);
	assert.match(content, /implementation planning readiness/i);
});
