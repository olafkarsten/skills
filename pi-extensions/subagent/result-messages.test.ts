import test from "node:test";
import assert from "node:assert/strict";

import { formatAbnormalResultMessage } from "./result-messages.ts";

test("formatAbnormalResultMessage includes repo mutation details for aborted runs", () => {
	const message = formatAbnormalResultMessage({
		reason: "aborted",
		agent: "implementer",
		repoState: {
			root: "/repo",
			headChanged: true,
			newCommits: ["561b962 [pi] Work in progress"],
			changedFiles: ["M src/index.ts", "?? notes.md"],
		},
	});

	assert.match(message, /implementer/);
	assert.match(message, /aborted/i);
	assert.match(message, /561b962 \[pi\] Work in progress/);
	assert.match(message, /M src\/index\.ts/);
});

test("formatAbnormalResultMessage explains when no final assistant result was produced", () => {
	const message = formatAbnormalResultMessage({
		reason: "no-final-result",
		agent: "implementer",
		repoState: {
			root: "/repo",
			headChanged: false,
			newCommits: [],
			changedFiles: [],
		},
	});

	assert.match(message, /without a final assistant result/i);
	assert.match(message, /files changed: no/i);
	assert.match(message, /head changed: no/i);
});
