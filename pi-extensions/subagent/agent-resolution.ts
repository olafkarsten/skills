import * as path from "node:path";

export interface AgentNameRecord {
	name: string;
	aliases?: string[];
}

function normalizeName(value: string | undefined): string | undefined {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
}

export function buildAgentAliases(name: string, filePath: string, explicitAliases: string[] = []): string[] {
	const aliasSet = new Set<string>();
	const canonicalName = normalizeName(name);
	const fileAlias = normalizeName(path.basename(filePath, path.extname(filePath)));

	for (const alias of [fileAlias, ...explicitAliases.map(normalizeName)]) {
		if (!alias || alias === canonicalName) continue;
		aliasSet.add(alias);
	}

	return Array.from(aliasSet);
}

export function getAgentNames(agent: AgentNameRecord): string[] {
	return [agent.name, ...(agent.aliases ?? [])];
}

export function matchesAgentName(agent: AgentNameRecord, requestedName: string): boolean {
	const candidate = normalizeName(requestedName);
	if (!candidate) return false;
	return getAgentNames(agent).includes(candidate);
}
