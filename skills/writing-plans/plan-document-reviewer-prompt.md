# Plan Document Reviewer Prompt Template

Use this template when dispatching a plan-review-agent.

**Purpose:** Verify the plan is complete, matches the spec, and has proper task decomposition.

**Dispatch after:** The complete plan is written.

```
  prompt: |
    You are a plan document reviewer. Verify this plan is complete and ready for implementation.

    **Plan to review:** [PLAN_FILE_PATH]
    **Spec for reference:** [SPEC_FILE_PATH]
```

**Reviewer returns:** Status, Issues (if any), Recommendations
