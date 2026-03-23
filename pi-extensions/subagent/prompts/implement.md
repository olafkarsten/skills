---
description: Implement a task using a implementer→spec-compliance-reviewer->code-quality-reviewer loop (max 3 iterations). Presents open issues if no agreement is reached.
---

Use the subagent tool in **loop** mode to implement the following:

$@

## Loop Configuration

- **implementer** agent implements the task. On subsequent iterations it receives the reviewer's feedback via `{feedback}`.
- **spec compliance reviewer** agent reviews the the spec compliance of the implementation. It signals approval by including **"Spec compliant"** in its assessment.
- **code quality reviewer** agent reviews the implementation. It signals approval by including **"Ready to merge: Yes"** in its assessment.
- **maxIterations**: 3
- **approvalPhrase**: `Ready to merge: Yes`

## Coder Task

Implement the following from the implementation plan: $@

Use `{feedback}` as the placeholder where reviewer feedback will be injected on subsequent iterations.

## Spec compliance reviewer task

What was requested: $@
Review what the implementer did. The implementers output is available via `{previous}`.
**If the spec reviewer approved** (`Spec compliant` found): the code quality reviewer
gets invoked.

## Code quality reviewer task

What was requested: $@
Review what the implementer did. The implementers output is available via `{previous}`.

## After the Loop


**If the reviewer approved** (`Ready to merge: Yes` found):
Report back with:

### What Was Implemented
{DESCRIPTION}

### Commits
List of git commits with their messages.

### Scenarios
Filenames and short description (if applicable).

### Learnings and good to know
Things learned. Any further important information. No fluff.

---

**If the loop exhausted all 5 iterations without approval**, do NOT just summarize — instead present the unresolved issues clearly:

### Implementation Status: Unresolved after 5 iterations

### What Was Implemented
Brief description of what the coder built.

### Open Issues
Extract and list every unresolved issue from the final reviewer feedback, grouped by severity (Critical / Important / Minor). For each issue include the file:line reference and what needs to be fixed.

### Recommendation
Your assessment of what the next step should be (e.g. which issues to tackle first to reach approval).
