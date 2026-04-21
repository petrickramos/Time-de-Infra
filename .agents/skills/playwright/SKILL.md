---
name: playwright
description: |
  Use Playwright to control the browser, navigate pages, take screenshots,
  interact with elements, and perform end-to-end testing. Invoke when asked to
  test a web app, navigate a website, take screenshots, or automate browser tasks.
  CRITICAL: always reuse the user's canonical CDP-compatible browser session for
  authenticated workflows. Never download Chromium and never force a fresh login.
version: 2.1.0
date: 2026-04-20
---

# Playwright Skill (Canonical Browser Edition)

Control the browser via local Playwright scripts. This skill prioritizes **reusing the user's existing authenticated browser session via CDP** so you do not lose cookies, trigger fresh logins, or download Chromium.

## Golden Rules

1. **Use `playwright-core`, not `playwright`.**
2. **For authenticated workflows, attach to the canonical browser session via CDP.**
3. **The browser does not need to be Google Chrome.** It can be Chrome, Edge, Brave, or another Chromium browser that exposes CDP.
4. **Never assume a hardcoded executable or port.** Read local docs, env vars, launchers, or running processes first.
5. **Use `browser.disconnect()` at the end, not `browser.close()`.**
6. **Do not fall back to a fresh isolated browser for authenticated marketing workflows.** If the canonical session does not exist, stop and ask for setup.

---

## Setup: Shared Playwright Workspace

Create a shared workspace for Playwright scripts:

```powershell
$pwDir = "$env:TEMP\pw-ac-ui"
if (-not (Test-Path $pwDir)) {
  New-Item -ItemType Directory -Path $pwDir -Force | Out-Null
  Push-Location $pwDir
  npm init -y
  npm install playwright-core
  Pop-Location
}
```

When writing scripts, require from this workspace:

```javascript
const { chromium } = require(process.env.TEMP.replace(/\\/g, '/') + '/pw-ac-ui/node_modules/playwright-core');
```

---

## Strategy 1: CDP Attach (Preferred)

Connect to the user's already-open canonical browser session. This preserves sessions, logins, cookies, and extensions.

### Browser Contract

The local environment should define:

- which Chromium browser is canonical
- which port or endpoint exposes CDP
- which profile/session must be reused

### How to detect an existing CDP session on Windows

```powershell
Get-CimInstance Win32_Process |
  Where-Object {
    $_.Name -match '^(chrome|msedge|brave)\.exe$' -and
    $_.CommandLine -match 'remote-debugging-port'
  } |
  Select-Object Name, CommandLine
```

### CDP Connect Script Pattern

```javascript
const { execSync } = require('child_process');
const { chromium } = require(process.env.TEMP.replace(/\\/g, '/') + '/pw-ac-ui/node_modules/playwright-core');

function findCdpEndpoint() {
  if (process.env.CDP_ENDPOINT) return process.env.CDP_ENDPOINT;

  const raw = execSync(
    `powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -match '^(chrome|msedge|brave)\\.exe$' -and $_.CommandLine -match 'remote-debugging-port' } | Select-Object -ExpandProperty CommandLine | ConvertTo-Json -Compress"`,
    { encoding: 'utf8' }
  ).trim();

  if (!raw) {
    throw new Error('No CDP-compatible browser session found. Complete local setup first.');
  }

  const cmds = JSON.parse(raw);
  const list = Array.isArray(cmds) ? cmds : [cmds];
  for (const cmd of list) {
    const match = String(cmd).match(/--remote-debugging-port=(\d+)/);
    if (match) return `http://127.0.0.1:${match[1]}`;
  }

  throw new Error('A browser process exists, but no remote debugging port was found.');
}

(async () => {
  const cdpEndpoint = findCdpEndpoint();
  const browser = await chromium.connectOverCDP(cdpEndpoint);
  const context = browser.contexts()[0];
  const page = await context.newPage();

  try {
    await page.goto('https://example.com', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await page.screenshot({ path: 'result.png' });
  } finally {
    await page.close();
    browser.disconnect();
  }
})();
```

**Key points:**

- `browser.contexts()[0]` reuses the existing context with cookies.
- `context.newPage()` creates a new tab in the user's live session.
- `browser.disconnect()` detaches without closing the user's browser.

---

## Strategy 2: Public, Unauthenticated Pages Only

If a page does **not** require login and no canonical browser session exists, you may use `launchPersistentContext` with a real browser executable.

> Do **not** use this fallback for ActiveCampaign, SendFlow, WhatsApp Web, or any workflow that depends on the user's authenticated session.

```javascript
const { chromium } = require(process.env.TEMP.replace(/\\/g, '/') + '/pw-ac-ui/node_modules/playwright-core');

(async () => {
  const executablePath = process.env.BROWSER_EXE;
  if (!executablePath) {
    throw new Error('Set BROWSER_EXE before using the unauthenticated fallback.');
  }

  const context = await chromium.launchPersistentContext(
    process.env.TEMP + '/pw-playwright-profile',
    {
      executablePath,
      headless: false
    }
  );

  const page = context.pages()[0] || await context.newPage();
  try {
    await page.goto('https://example.com', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
  } finally {
    await context.close();
  }
})();
```

---

## When to Use Which Strategy

| Scenario | Strategy |
|----------|----------|
| Site requires login | **CDP Attach** |
| Need to reuse open tabs or cookies | **CDP Attach** |
| Public page with no auth and no canonical session | **Persistent Context** |
| Authenticated workflow with no canonical session available | **Stop and complete setup first** |

---

## Core Interaction Patterns

### Wait for Elements

```javascript
await page.waitForSelector('.loaded');
await page.waitForLoadState('networkidle');
```

### Click and Fill

```javascript
await page.click('button#submit');
await page.fill('input[name="email"]', 'user@example.com');
await page.getByRole('button', { name: /Send/i }).click();
```

### Extract Text

```javascript
const text = await page.textContent('.selector');
const allTexts = await page.$$eval('.items', els => els.map(el => el.textContent));
```

### Screenshots

```javascript
await page.screenshot({ path: 'screenshot.png' });
await page.screenshot({ path: 'full.png', fullPage: true });
```

---

## Common Mistakes to Avoid

1. **Downloading Chromium**: never use `npx playwright install` or the `playwright` package.
2. **Closing the user's browser**: use `browser.disconnect()`, not `browser.close()`.
3. **Creating a new context instead of reusing**: with CDP, always use `browser.contexts()[0]`.
4. **Hardcoding Chrome + 9222 as a universal rule**: read the local browser contract first.
5. **Using a fresh browser for authenticated marketing tools**: this breaks the session model and usually forces login.

---

## Testing Workflow

When asked to test a web application:

1. Inspect the local browser contract or running processes.
2. If a canonical CDP session exists, attach to it.
3. If the target page is authenticated and no canonical session exists, stop and complete setup first.
4. Open the target page in a new tab.
5. Take screenshots before and after meaningful actions.
6. Disconnect from the browser without closing it.

---

## Paths Reference (Windows)

| Item | Example |
|------|---------|
| Chrome executable | `C:\Program Files\Google\Chrome\Application\chrome.exe` |
| Edge executable | `C:\Program Files\Microsoft\Edge\Application\msedge.exe` |
| Brave executable | `C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe` |
| Playwright workspace | `$env:TEMP\pw-ac-ui` |
| Persistent fallback profile | `$env:TEMP\pw-playwright-profile` |
