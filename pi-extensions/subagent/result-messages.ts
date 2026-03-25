export interface RepoStateSummary {
	root: string;
	headChanged: boolean;
	newCommits: string[];
	changedFiles: string[];
}

interface AbnormalResultMessageInput {
	reason: "aborted" | "no-final-result";
	agent: string;
	repoState?: RepoStateSummary;
	stderr?: string;
}

export function formatAbnormalResultMessage(input: AbnormalResultMessageInput): string {
	const lines = [
		input.reason === "aborted"
			? `Agent ${input.agent} was aborted before it produced a final result.`
			: `Agent ${input.agent} finished without a final assistant result.`,
	];

	if (input.repoState) {
		lines.push(`Repository: ${input.repoState.root}`);
		lines.push(`HEAD changed: ${input.repoState.headChanged ? "yes" : "no"}`);
		lines.push(`Files changed: ${input.repoState.changedFiles.length > 0 ? "yes" : "no"}`);
		if (input.repoState.newCommits.length > 0) {
			lines.push("New commits:");
			for (const commit of input.repoState.newCommits) lines.push(`- ${commit}`);
		}
		if (input.repoState.changedFiles.length > 0) {
			lines.push("Working tree changes:");
			for (const file of input.repoState.changedFiles) lines.push(`- ${file}`);
		}
	}

	if (input.stderr?.trim()) {
		lines.push("stderr:");
		lines.push(input.stderr.trim());
	}

	return lines.join("\n");
}
