---
description: Run the canonical subagent-driven-development workflow for one task using two sequential loop invocations.
argument-hint: <implementation task>
---

Use the subagent tool to implement the following:

$@

Important: current `loop` mode supports only two roles per invocation (`coder` and
`reviewer`). To run the canonical 3-agent workflow, execute **two loop invocations in
sequence** with the same `implementer` agent:

1. `implementer` ↔ `spec-compliance-reviewer`
2. `implementer` ↔ `code-quality-reviewer`

Keep this prompt focused on execution mechanics. The detailed behavior of each role is
owned by the agent definitions.

## Phase 1 — Spec compliance loop

Run the subagent tool in `loop` mode with:

- `coder.agent`: `implementer`
- `reviewer.agent`: `spec-compliance-reviewer`
- `approvalPhrase`: `Spec compliant`
- `maxIterations`: `3`

### Coder task

Implement the following task exactly as requested:

$@

Use `{feedback}` for reviewer feedback on subsequent iterations.

### Reviewer task

Requested task:

$@

Review the actual implementation against the request. The implementer's output is
available via `{previous}`.

Approve only by including the exact phrase:

`Spec compliant`

If not approved, list concrete missing, extra, or incorrect work, with file:line
references where possible.

## Phase 2 — Code quality loop

Only run this phase if phase 1 is approved.

Run the subagent tool in `loop` mode with:

- `coder.agent`: `implementer`
- `reviewer.agent`: `code-quality-reviewer`
- `approvalPhrase`: `Ready to merge: Yes`
- `maxIterations`: `3`

### Coder task

The following task is now spec compliant:

$@

Review the current implementation, make any necessary quality improvements, run the
relevant tests, and summarize the resulting implementation.

Use `{feedback}` for reviewer feedback on subsequent iterations.

### Reviewer task

Original task:

$@

Review the actual implementation for code quality and production readiness. The
implementer's output is available via `{previous}`.

Approve only by including the exact phrase:

`Ready to merge: Yes`

If not approved, group issues by severity and include file:line references where
possible.

## Final response

### If both phases approve

Report back with:

- **What Was Implemented**
- **Commits**
- **Scenarios** (if any)
- **Learnings and good to know**

### If phase 1 exhausts all 3 iterations without approval

Stop and report:

- **Implementation Status:** Spec compliance unresolved
- **What Was Implemented**
- **Open Spec Issues**
- **Recommendation**

### If phase 2 exhausts all 3 iterations without approval

Report:

- **Implementation Status:** Code quality unresolved
- **What Was Implemented**
- **Open Quality Issues**
- **Recommendation**
