import test from "node:test";
import assert from "node:assert/strict";

import { selectSubagentModel, toCanonicalModelRef, type ModelCandidate } from "./model-selection.ts";

const models: ModelCandidate[] = [
	{ provider: "openai-codex", id: "gpt-5.4", hasAuth: true },
	{ provider: "azure-openai-responses", id: "gpt-5.4", hasAuth: false },
	{ provider: "anthropic", id: "claude-haiku-4-5", hasAuth: true },
	{ provider: "anthropic", id: "claude-opus-4-6", hasAuth: true },
];

test("selectSubagentModel resolves explicit overrides to a canonical provider/model reference", () => {
	const selection = selectSubagentModel({
		requestedModel: "gpt-5.4",
		currentModel: { provider: "openai-codex", id: "gpt-5.4", hasAuth: true },
		allModels: models,
		availableModels: models.filter((model) => model.hasAuth),
	});

	assert.equal(selection.status, "ok");
	assert.equal(selection.modelRef, "openai-codex/gpt-5.4");
});

test("selectSubagentModel falls back from an unavailable agent default to the current model", () => {
	const selection = selectSubagentModel({
		agentDefaultModel: "gpt-5.4-codex",
		currentModel: { provider: "anthropic", id: "claude-opus-4-6", hasAuth: true },
		allModels: models,
		availableModels: models.filter((model) => model.hasAuth),
	});

	assert.equal(selection.status, "fallback");
	assert.equal(selection.modelRef, "anthropic/claude-opus-4-6");
	assert.match(selection.warning ?? "", /gpt-5\.4-codex/);
});

test("selectSubagentModel treats inherit as the current session model", () => {
	const selection = selectSubagentModel({
		agentDefaultModel: "inherit",
		currentModel: { provider: "openai-codex", id: "gpt-5.4", hasAuth: true },
		allModels: models,
		availableModels: models.filter((model) => model.hasAuth),
	});

	assert.equal(selection.status, "ok");
	assert.equal(selection.modelRef, "openai-codex/gpt-5.4");
});

test("selectSubagentModel fails early for an explicit override without configured auth", () => {
	const selection = selectSubagentModel({
		requestedModel: "azure-openai-responses/gpt-5.4",
		allModels: models,
		availableModels: models.filter((model) => model.hasAuth),
	});

	assert.equal(selection.status, "error");
	assert.match(selection.error ?? "", /No API key configured/);
});

test("toCanonicalModelRef formats provider and model deterministically", () => {
	assert.equal(toCanonicalModelRef({ provider: "anthropic", id: "claude-haiku-4-5", hasAuth: true }), "anthropic/claude-haiku-4-5");
});
