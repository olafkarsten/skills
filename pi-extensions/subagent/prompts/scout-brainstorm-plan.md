---
description: Scout gathers context, brainstorm creates design, planner creates implementation plan (no coding)
argument-hint: <feature or idea>
---
Use the subagent tool with the chain parameter to execute this workflow:

1. First, use the "scout" agent to find all code relevant to: $@
2. Then, use the "brainstormer" agent to create an design plan for for "$@" using the context from the previous step (use {previous} placeholder)
3. Then, use the "planner" agent to create an implementation plan for "$@" using the design file from the previous step (use {previous} placeholder)

Execute this as a chain, passing output between steps via {previous}. Do NOT implement - just return the plan.
