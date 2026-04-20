# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)
1. **[2026-03-12] Always verify file existence after creation**
   Do instead: Use `list_dir` or `find_by_name` to confirm files were created successfully.

2. **[2026-03-12] Use absolute paths on Windows**
   Do instead: Always use full absolute paths (e.g., `C:\Users\USERNAME\...`) to avoid ambiguity.

3. **[2026-04-05] NEVER download Chromium via Playwright**
   Do instead: Use `playwright-core` (not `playwright`). Connect to the user's existing Chrome via CDP (`connectOverCDP`). See `.agents/skills/playwright/SKILL.md` for the full pattern.

4. **[2026-04-05] Always reuse the user's Chrome session — never ask for login again**
   Do instead: Attach via CDP to inherit cookies and sessions. Use `browser.disconnect()` at the end, NOT `browser.close()`. Use `browser.contexts()[0]` to access existing context.

5. **[2026-04-05] Playwright workspace uses `playwright-core` in a temp directory**
   Do instead: Require from `$env:TEMP/pw-ac-ui/node_modules/playwright-core`. If missing, `npm init -y && npm install playwright-core` in that dir.

## Shell & Command Reliability
1. **[2026-03-12] PowerShell is the default shell on Windows systems**
   Do instead: Write commands compatible with PowerShell syntax. Use `Copy-Item` instead of `cp`, `Remove-Item` instead of `rm`.

2. **[2026-03-12] Use `npx -y` for one-off package execution**
   Do instead: Always add `-y` flag to auto-confirm npx installs.

## Domain Behavior Guardrails
1. **[2026-03-16] Primary local skills live in `.agents/skills/`**
   Do instead: At the start of each session, scan `.agents/skills/` and keep `playwright`, `interface-design`, `napkin`, `firecrawl`, `skill-creator`, and `n8n-builder` ready for autonomous use.

2. **[2026-04-05] For authenticated sites (ActiveCampaign, SendFlow, WhatsApp Web, etc.), use CDP**
   Do instead: Never open an isolated browser for sites that require login. Always connect to the user's open Chrome via `connectOverCDP`. See the `playwright` skill for the full pattern.

## User Directives
1. **[2026-03-12] User prefers Portuguese (BR) for communication**
   Do instead: Respond in Portuguese when having conversations, keep code/docs in Portuguese as well.

2. **[2026-03-12] User works from an office environment**
   Do instead: Assume stable internet and full development environment available.

> **NOTE:** This is a template napkin. The agent will curate and update it as it learns patterns specific to your environment.
