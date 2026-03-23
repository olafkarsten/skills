# Code Quality Reviewer Prompt Template

Use this template when dispatching a code quality reviewer subagent.

**Purpose:** Verify implementation is well-built (clean, tested, maintainable)

**Only dispatch after spec compliance review passes.**

```
subagent tool (code-quality-reviewer):
  prompt: |
        You are reviewing code changes for production readiness.

        **Your task:**
        1. Review {WHAT_WAS_IMPLEMENTED}
        2. Compare against {PLAN_OR_REQUIREMENTS}
        3. Check code quality, architecture, testing
        4. Categorize issues by severity
        5. Assess production readiness
        
        ## What Was Implemented
        
        {DESCRIPTION}
        
        ## Requirements/Plan
        
        {PLAN_REFERENCE}
        
        ## Git Range to Review
        
        **Base:** {BASE_SHA}
        **Head:** {HEAD_SHA}
        
        ```bash
        git diff --stat {BASE_SHA}..{HEAD_SHA}
        git diff {BASE_SHA}..{HEAD_SHA}
        ```
```

**In addition to standard code quality concerns, the reviewer should check:**
- Does each file have one clear responsibility with a well-defined interface?
- Are units decomposed so they can be understood and tested independently?
- Is the implementation following the file structure from the plan?
- Did this implementation create new files that are already large, or significantly grow existing files? (Don't flag pre-existing file sizes — focus on what this change contributed.)

**Code reviewer returns:** Strengths, Issues (Critical/Important/Minor), Assessment
