export interface ModelCandidate {
	provider: string;
	id: string;
	hasAuth: boolean;
}

interface SelectSubagentModelInput {
	requestedModel?: string;
	agentDefaultModel?: string;
	currentModel?: ModelCandidate;
	allModels: ModelCandidate[];
	availableModels: ModelCandidate[];
}

export interface ModelSelectionResult {
	status: "ok" | "fallback" | "error";
	modelRef?: string;
	warning?: string;
	error?: string;
}

function normalizeModelRef(modelRef: string | undefined): string | undefined {
	const trimmed = modelRef?.trim();
	return trimmed ? trimmed : undefined;
}

export function toCanonicalModelRef(model: Pick<ModelCandidate, "provider" | "id">): string {
	return `${model.provider}/${model.id}`;
}

function findMatchingModels(modelRef: string, allModels: ModelCandidate[]): ModelCandidate[] {
	if (modelRef.includes("/")) {
		const [provider, ...modelIdParts] = modelRef.split("/");
		const modelId = modelIdParts.join("/");
		return allModels.filter((model) => model.provider === provider && model.id === modelId);
	}
	return allModels.filter((model) => model.id === modelRef);
}

function pickResolvedModel(matches: ModelCandidate[], currentModel: ModelCandidate | undefined): ModelCandidate | undefined {
	if (matches.length === 0) return undefined;
	if (matches.length === 1) return matches[0];

	const currentMatch = currentModel
		? matches.find((model) => model.provider === currentModel.provider && model.id === currentModel.id)
		: undefined;
	if (currentMatch) return currentMatch;

	const authenticatedMatches = matches.filter((model) => model.hasAuth);
	if (authenticatedMatches.length === 1) return authenticatedMatches[0];

	return undefined;
}

function pickFallbackModel(currentModel: ModelCandidate | undefined, availableModels: ModelCandidate[]): ModelCandidate | undefined {
	if (currentModel?.hasAuth) return currentModel;
	return availableModels[0];
}

export function selectSubagentModel(input: SelectSubagentModelInput): ModelSelectionResult {
	const requestedModel = normalizeModelRef(input.requestedModel);
	const agentDefaultModel = normalizeModelRef(input.agentDefaultModel);

	if (!requestedModel && !agentDefaultModel) {
		return { status: "ok" };
	}

	if (agentDefaultModel === "inherit" && !requestedModel) {
		const inheritedModel = pickFallbackModel(input.currentModel, input.availableModels);
		if (!inheritedModel) {
			return {
				status: "error",
				error: 'Agent is configured with model: inherit, but there is no authenticated session model or fallback model available.',
			};
		}
		return { status: "ok", modelRef: toCanonicalModelRef(inheritedModel) };
	}

	const configuredModel = requestedModel ?? agentDefaultModel;
	if (!configuredModel) {
		return { status: "ok" };
	}

	const matches = findMatchingModels(configuredModel, input.allModels);
	const resolvedModel = pickResolvedModel(matches, input.currentModel);
	const explicitOverride = Boolean(requestedModel);
	const scopeLabel = explicitOverride ? "Requested model" : "Agent default model";

	if (!resolvedModel) {
		if (explicitOverride) {
			return {
				status: "error",
				error: `${scopeLabel} "${configuredModel}" is not available in this environment. Use a canonical provider/model reference or choose an installed model.`,
			};
		}

		const fallbackModel = pickFallbackModel(input.currentModel, input.availableModels);
		if (!fallbackModel) {
			return {
				status: "error",
				error: `${scopeLabel} "${configuredModel}" is not available in this environment, and no authenticated fallback model is configured.`,
			};
		}
		return {
			status: "fallback",
			modelRef: toCanonicalModelRef(fallbackModel),
			warning: `${scopeLabel} "${configuredModel}" is not available in this environment. Falling back to ${toCanonicalModelRef(fallbackModel)}.`,
		};
	}

	if (!resolvedModel.hasAuth) {
		if (explicitOverride) {
			return {
				status: "error",
				error: `No API key configured for ${toCanonicalModelRef(resolvedModel)}. Either configure auth for that provider or choose a different model.`,
			};
		}

		const fallbackModel = pickFallbackModel(input.currentModel, input.availableModels);
		if (!fallbackModel) {
			return {
				status: "error",
				error: `${scopeLabel} "${configuredModel}" resolved to ${toCanonicalModelRef(resolvedModel)}, but no API key is configured and no authenticated fallback model is available.`,
			};
		}
		return {
			status: "fallback",
			modelRef: toCanonicalModelRef(fallbackModel),
			warning: `${scopeLabel} "${configuredModel}" resolved to ${toCanonicalModelRef(resolvedModel)}, but no API key is configured. Falling back to ${toCanonicalModelRef(fallbackModel)}.`,
		};
	}

	return { status: "ok", modelRef: toCanonicalModelRef(resolvedModel) };
}
