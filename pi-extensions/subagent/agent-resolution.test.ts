import test from "node:test";
import assert from "node:assert/strict";

import { buildAgentAliases, matchesAgentName } from "./agent-resolution.ts";

test("buildAgentAliases includes the markdown filename when it differs from frontmatter name", () => {
	const aliases = buildAgentAliases("plan-reviewer", "/tmp/implementation-plan-reviewer.md");
	assert.deepEqual(aliases, ["implementation-plan-reviewer"]);
});

test("buildAgentAliases deduplicates filename and explicit aliases", () => {
	const aliases = buildAgentAliases("plan-reviewer", "/tmp/implementation-plan-reviewer.md", [
		"implementation-plan-reviewer",
		" plan-reviewer ",
		"review-plan",
	]);
	assert.deepEqual(aliases, ["implementation-plan-reviewer", "review-plan"]);
});

test("matchesAgentName resolves canonical names and aliases deterministically", () => {
	const agent = {
		name: "plan-reviewer",
		aliases: ["implementation-plan-reviewer", "review-plan"],
	};

	assert.equal(matchesAgentName(agent, "plan-reviewer"), true);
	assert.equal(matchesAgentName(agent, "implementation-plan-reviewer"), true);
	assert.equal(matchesAgentName(agent, "review-plan"), true);
	assert.equal(matchesAgentName(agent, "reviewer"), false);
});
