# Subagent Extension

Delegate tasks to specialized subagents with isolated context windows.

This extension registers the `subagent-driven-dev` tool, which runs a separate `pi`
process for each delegated agent.

## Features

- **Isolated context**: Each subagent runs in a separate `pi` process
- **Single / parallel / chain / loop modes**
- **Streaming output**: See tool calls and progress as they happen
- **Parallel streaming**: Parallel tasks update simultaneously
- **Markdown rendering**: Final output rendered with proper formatting in expanded view
- **Usage tracking**: Shows turns, tokens, cost, and context usage per agent
- **Abort support**: Ctrl+C propagates to kill subagent processes

## Structure

```text
pi-extensions/subagent/
├── README.md
├── index.ts                # extension entry point
├── agents.ts               # agent discovery logic
├── agents/                 # agent definitions
│   ├── scout.md
│   ├── planner.md
│   ├── implementer.md
│   ├── spec-compliance-reviewer.md
│   ├── code-quality-reviewer.md
│   └── ... other specialized agents
└── prompts/                # workflow prompt presets
    ├── implement.md        # implementer ↔ spec reviewer, then implementer ↔ quality reviewer
    ├── scout-and-plan.md   # scout → planner
    └── scout-brainstorm-plan.md # scout → brainstorm/design → planner
```

## Installation

From the repository root, symlink the files:

```bash
# Symlink the extension (must be in a subdirectory with index.ts)
mkdir -p ~/.pi/agent/extensions/subagent
ln -sf "$(pwd)/pi-extensions/subagent/index.ts" ~/.pi/agent/extensions/subagent/index.ts
ln -sf "$(pwd)/pi-extensions/subagent/agents.ts" ~/.pi/agent/extensions/subagent/agents.ts

# Symlink agents
mkdir -p ~/.pi/agent/agents
for f in pi-extensions/subagent/agents/*.md; do
  ln -sf "$(pwd)/$f" ~/.pi/agent/agents/$(basename "$f")
done

# Symlink workflow prompts
mkdir -p ~/.pi/agent/prompts
for f in pi-extensions/subagent/prompts/*.md; do
  ln -sf "$(pwd)/$f" ~/.pi/agent/prompts/$(basename "$f")
done
```

## Security Model

This tool executes a separate `pi` subprocess with a delegated system prompt and
optional tool/model configuration.

**Project-local agents** (`.pi/agents/*.md`) are repo-controlled prompts that can
instruct the model to read files, run bash commands, etc.

**Default behavior:** only loads **user-level agents** from `~/.pi/agent/agents`.

To enable project-local agents, pass `agentScope: "both"` (or `"project"`). Only do
this for repositories you trust.

When running interactively, the tool prompts for confirmation before running
project-local agents. Set `confirmProjectAgents: false` to disable.

## Usage

### Single agent

```text
Use scout to find all authentication code
```

### Parallel execution

```text
Run 2 scouts in parallel: one to find models, one to find providers
```

### Chained workflow

```text
Use a chain: first have scout find the read tool, then have planner suggest improvements
```

### Workflow prompts

```text
/implement add Redis caching to the session store
/scout-and-plan refactor auth to support OAuth
/scout-brainstorm-plan design a better plugin configuration flow
```

## Tool Modes

| Mode | Parameter | Description |
|------|-----------|-------------|
| Single | `{ agent, task, model? }` | One agent, one task |
| Parallel | `{ tasks: [...] }` | Multiple agents run concurrently (max 8, 4 concurrent) |
| Chain | `{ chain: [...] }` | Sequential with `{previous}` placeholder |
| Loop | `{ loop: { coder, reviewer, ... } }` | Coder → reviewer cycle until approval or max iterations |

**Note:** loop mode is currently two-party only (`coder` + `reviewer`). The
`/implement` prompt achieves a 3-agent workflow by running two loops in sequence:
first spec compliance, then code quality.

## Model Overrides

The `model` in an agent markdown file is the default model for that agent. You can
override it per invocation:

```json
{ "agent": "scout", "task": "Find auth code", "model": "openai-codex/gpt-5.4" }
```

This also works for `tasks[]`, `chain[]`, and `loop.coder` / `loop.reviewer` items.

Model handling is preflighted before the subprocess starts:
- explicit `model` overrides fail early if the model is missing or has no auth
- invalid or unauthenticated **agent default** models fall back to the current
  session model when possible, otherwise the first authenticated model
- `model: inherit` in agent frontmatter uses the current session model

Canonical `provider/model` references are recommended when multiple providers ship
models with the same ID.

## Output Display

**Collapsed view** (default):
- Status icon (✓/✗/⏳) and agent name
- Last 5-10 items (tool calls and text)
- Usage stats: `3 turns ↑input ↓output RcacheRead WcacheWrite $cost ctx:contextTokens model`

**Expanded view** (Ctrl+O):
- Full task text
- All tool calls with formatted arguments
- Final output rendered as Markdown
- Per-task usage (for chain / parallel / loop)

**Parallel mode streaming**:
- Shows all tasks with live status (⏳ running, ✓ done, ✗ failed)
- Updates as each task makes progress
- Shows `2/3 done, 1 running` style status

**Tool call formatting**:
- `$ command` for bash
- `read ~/path:1-10` for read
- `grep /pattern/ in ~/path` for grep
- etc.

## Agent Definitions

Agents are markdown files with YAML frontmatter:

```markdown
---
name: my-agent
aliases: short-name, old-name
description: What this agent does
tools: read, grep, find, ls
model: claude-haiku-4-5
---

System prompt for the agent goes here.
```

The `model` value above is the default. A caller can override it when invoking the
subagent tool.

Agents can be resolved by:
- `name` in frontmatter
- optional `aliases`
- the markdown filename basename (for example `implementation-plan-reviewer.md`)

**Locations:**
- `~/.pi/agent/agents/*.md` - user-level (always loaded)
- `.pi/agents/*.md` - project-level (only with `agentScope: "project"` or `"both"`)

Project agents override user agents with the same name when `agentScope: "both"`.

## Common Agents

These are the main built-in roles used by the shipped prompts. Additional specialized
agents also exist in `agents/`.

| Agent | Purpose | Default model | Tools |
|-------|---------|---------------|-------|
| `scout` | Fast codebase recon and compressed handoff context | `claude-haiku-4-5` | `read, grep, find, ls, bash` |
| `planner` | Create implementation plans from requirements and context | `claude-opus-4-6` | default toolset |
| `implementer` | Implement tasks with full capabilities | `claude-haiku-4-5` | default toolset |
| `spec-compliance-reviewer` | Verify implementation matches the request exactly | `claude-opus-4-6` | `read, grep, find, ls` |
| `code-quality-reviewer` | Review production readiness, testing, and maintainability | `claude-opus-4-6` | `read, grep, find, ls` |
| `worker` | General-purpose subagent with full capabilities | `claude-opus-4-6` | default toolset |

## Workflow Prompts

| Prompt | Flow |
|--------|------|
| `/implement <query>` | implementer ↔ spec-compliance-reviewer, then implementer ↔ code-quality-reviewer |
| `/scout-and-plan <query>` | scout → planner |
| `/scout-brainstorm-plan <query>` | scout → brainstorm/design → planner |

## Error Handling

- **Exit code != 0**: tool returns error with stderr / output
- **stopReason `error`**: LLM error propagated with error message
- **stopReason `aborted`**: user abort (Ctrl+C) kills subprocess and returns structured repo-state metadata
- **No final assistant result**: surfaced as an error with repo-state metadata instead of a blank result
- **Chain mode**: stops at the first failing step and reports which step failed
- **Loop mode**: stops if coder or reviewer fails, or ends after `maxIterations` without approval

## Limitations

- Output is truncated in collapsed view (expand to see all details)
- Agents are discovered fresh on each invocation (allows editing mid-session)
- Parallel mode is limited to 8 tasks, with 4 concurrent
- Loop mode is limited to a coder/reviewer pair per invocation
