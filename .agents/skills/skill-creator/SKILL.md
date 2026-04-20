---
name: skill-creator
description: |
  Create, evaluate, improve, and benchmark agent skills. Use this skill when
  asked to create a new skill, refine an existing one, or test skill quality.
  Generates properly formatted SKILL.md files following the Agent Skills spec.
version: 1.0.0
date: 2026-03-11
---

# Skill Creator

You are a specialized skill author. When the user asks you to create, improve,
or evaluate a skill, follow this process.

## Creating a New Skill

### Step 1: Understand the Task
Ask (or infer) the following:
- **What task** should the skill automate or improve?
- **What tools/CLIs/APIs** does it use?
- **What patterns** should the agent follow?
- **What mistakes** should the agent avoid?

### Step 2: Research
- If the task involves a CLI or API, read its documentation or `--help` output.
- If the task involves a codebase, explore the repo structure.
- If there are existing examples, study them for patterns.

### Step 3: Write the SKILL.md
Create a skill following this structure:

```markdown
---
name: skill-name-here
description: |
  One-paragraph description of what the skill does and when to trigger it.
  This is shown to the agent to decide whether to load the full skill.
  Make it specific enough to trigger correctly, broad enough to be useful.
version: 1.0.0
date: YYYY-MM-DD
---

# Skill Name

Brief overview of what this skill enables.

## When to Use
- Trigger condition 1
- Trigger condition 2

## Instructions
Step-by-step instructions for the agent.

## Examples
Concrete examples of input/output or usage.

## Common Mistakes
- Mistake 1: explanation and correct approach
- Mistake 2: explanation and correct approach

## Guidelines
- Guideline 1
- Guideline 2
```

### Step 4: Validate
- Check that the `description` in frontmatter is clear and specific.
- Ensure instructions are concrete and actionable (not vague).
- Include "Do instead" patterns for common mistakes.
- Test the skill mentally: would an agent know exactly what to do?

## Improving an Existing Skill

1. Read the current SKILL.md.
2. Identify gaps: missing instructions, vague steps, uncovered edge cases.
3. Add concrete examples for unclear sections.
4. Add "Common Mistakes" entries based on observed failures.
5. Tighten the description for better trigger accuracy.

## Skill Quality Checklist

- [ ] Description is specific enough to trigger correctly
- [ ] Instructions are step-by-step and actionable
- [ ] Examples cover the most common use cases
- [ ] Common mistakes are documented with corrections
- [ ] No vague language ("consider", "maybe", "try to")
- [ ] File follows the YAML frontmatter + markdown format
- [ ] Skill is self-contained (agent doesn't need external context)

## File Organization

Skills should be saved to `.agents/skills/<skill-name>/SKILL.md`.
If the skill requires scripts, put them in `.agents/skills/<skill-name>/scripts/`.
If the skill needs reference files, put them in `.agents/skills/<skill-name>/resources/`.

## Best Practices

- **Be specific**: "Run `npm test -- --coverage`" > "Run tests"
- **Be prescriptive**: "Always use X" > "Consider using X"
- **Include constraints**: "Max 10 items per category" > "Keep it short"
- **Add dates**: Include `[YYYY-MM-DD]` on entries that may go stale
- **Think in patterns**: Write reusable guidance, not one-off fixes
