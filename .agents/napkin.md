# Napkin Runbook

## Curation Rules

- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)

1. **[2026-03-12] Always verify file existence after creation**
   Do instead: Use file listing or search to confirm the expected files were actually created.

2. **[2026-03-12] Use absolute paths on Windows**
   Do instead: Always use full absolute paths (for example `C:\Users\USERNAME\...`) to avoid ambiguity.

3. **[2026-04-05] Never download Chromium via Playwright**
   Do instead: Use `playwright-core` and attach to the user's canonical CDP-compatible browser session whenever possible.

4. **[2026-04-05] Always reuse the user's canonical browser session**
   Do instead: Attach via CDP to inherit cookies and sessions. Use `browser.disconnect()` at the end, not `browser.close()`.

5. **[2026-04-05] Playwright workspace uses `playwright-core` in a temp directory**
   Do instead: Require from `$env:TEMP/pw-ac-ui/node_modules/playwright-core`. If missing, create that workspace and install only `playwright-core`.

## Shell & Command Reliability

1. **[2026-03-12] PowerShell is the default shell on Windows systems**
   Do instead: Write commands compatible with PowerShell syntax.

2. **[2026-03-12] Use `npx -y` for one-off package execution**
   Do instead: Add `-y` when a one-off package may prompt for confirmation.

## Domain Behavior Guardrails

1. **[2026-03-16] Primary local skills live in `.agents/skills/`**
   Do instead: Keep `playwright`, `napkin`, and `n8n-builder` available for autonomous use.

2. **[2026-04-05] For authenticated sites, use the canonical browser session via CDP**
   Do instead: Never open an isolated browser for ActiveCampaign, SendFlow, WhatsApp Web, or similar authenticated products.

3. **[2026-04-20] The repository must be self-sufficient**
   Do instead: If a decision matters for future runs, record it in versioned docs instead of relying on chat history.

## User Directives

1. **[2026-03-12] User prefers Portuguese (BR) for communication**
   Do instead: Respond in Portuguese during conversations.

2. **[2026-03-12] User works from a stable office environment**
   Do instead: Assume normal internet access and a full development setup.

> **NOTE:** This is a template napkin. The agent should curate it as it learns patterns specific to the target environment.
