---
name: playwright
description: |
  Use Playwright to control the browser, navigate pages, take screenshots,
  interact with elements, and perform end-to-end testing. Invoke when asked to
  test a web app, navigate a website, take screenshots, or automate browser tasks.
  CRITICAL: always reuse the user's existing Chrome session via CDP — never
  download Chromium and never ask for login again.
version: 2.0.0
date: 2026-04-05
---

# Playwright Skill (Session-Reuse Edition)

Control the browser via Playwright scripts. This skill prioritizes **reusing
the user's existing Chrome session** so you never download Chromium, never
trigger a fresh login, and never lose cookies/state.

## Golden Rules

1. **Use `playwright-core`, NOT `playwright`.**
   `playwright-core` does not download any browsers. `playwright` tries to
   download Chromium on install — that is exactly what we want to avoid.

2. **Connect to the user's running Chrome via CDP whenever possible.**
   This gives you the user's cookies, login sessions, extensions, everything.

3. **Never run `npx playwright install`** unless the user explicitly asks for
   a standalone Chromium. This downloads ~400 MB and is almost never needed.

4. **Fallback order:**
   CDP attach → launchPersistentContext (Chrome exe) → headless Chrome exe

---

## Setup: Shared Playwright Workspace

Create a shared workspace for Playwright scripts:

```powershell
$pwDir = "$env:TEMP\pw-ac-ui"
if (-not (Test-Path $pwDir)) {
  New-Item -ItemType Directory -Path $pwDir -Force
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

> **NOTE:** The path above uses `process.env.TEMP` to be portable across Windows machines.
> For macOS/Linux, use `/tmp/pw-ac-ui` or an equivalent temp directory.

---

## Strategy 1: CDP Attach (PREFERRED)

Connect to the user's already-open Chrome. This preserves all sessions, logins,
and cookies. The user must have Chrome running with `--remote-debugging-port`.

### How to launch Chrome with debugging

The user (or a previous session) may have already done this. Check first:

```powershell
# Check if Chrome is running with a debugging port
$chromeProcs = Get-CimInstance Win32_Process -Filter "Name = 'chrome.exe'" |
  Select-Object -ExpandProperty CommandLine |
  Where-Object { $_ -match 'remote-debugging-port' }
if ($chromeProcs) { Write-Host "Chrome CDP already running" }
```

If Chrome is NOT running with CDP, launch it:

```powershell
Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  -ArgumentList "--remote-debugging-port=9222"
```

> **WARNING**: This starts a NEW Chrome instance. If Chrome is already open
> WITHOUT the debugging flag, you must close it first or use a different port.
> The user's existing Chrome tabs will be accessible if they restart Chrome
> with the flag.

### CDP Connect Script Pattern

```javascript
const { execSync } = require('child_process');
const { chromium } = require(process.env.TEMP.replace(/\\/g, '/') + '/pw-ac-ui/node_modules/playwright-core');

// Auto-discover the CDP port from running Chrome processes
function findCdpEndpoint() {
  const raw = execSync(
    'powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name = \'chrome.exe\'\\" | Select-Object -ExpandProperty CommandLine | ConvertTo-Json -Compress"',
    { encoding: 'utf8' }
  ).trim();
  const cmds = JSON.parse(raw);
  for (const cmd of cmds) {
    const m = cmd.match(/--remote-debugging-port=(\d+)/);
    if (m) return `http://127.0.0.1:${m[1]}`;
  }
  throw new Error('No Chrome instance found with --remote-debugging-port. Launch Chrome with that flag first.');
}

(async () => {
  const cdpEndpoint = findCdpEndpoint();
  const browser = await chromium.connectOverCDP(cdpEndpoint);
  const context = browser.contexts()[0]; // reuse existing context with cookies
  const page = await context.newPage();

  try {
    await page.goto('https://example.com', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    // ... do your work ...
    await page.screenshot({ path: 'result.png' });
  } finally {
    await page.close();
    browser.disconnect(); // disconnect, do NOT close — keeps Chrome alive
  }
})();
```

**Key points:**
- Use `browser.disconnect()` at the end, NOT `browser.close()`. You want to
  detach without killing the user's Chrome.
- Use `browser.contexts()[0]` to get the existing context with all cookies.
- `context.newPage()` creates a new tab in the user's existing Chrome.

---

## Strategy 2: Persistent Context (FALLBACK)

When CDP is not available (Chrome isn't running with the flag), use
`launchPersistentContext` with the real Chrome executable. This opens a
separate Chrome instance with its own profile but does NOT download Chromium.

```javascript
const { chromium } = require(process.env.TEMP.replace(/\\/g, '/') + '/pw-ac-ui/node_modules/playwright-core');

(async () => {
  const context = await chromium.launchPersistentContext(
    process.env.TEMP + '/pw-playwright-profile', // dedicated profile dir
    {
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: false,
      args: ['--profile-directory=Default']
    }
  );
  const page = context.pages()[0] || await context.newPage();

  try {
    await page.goto('https://example.com', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    // ... do your work ...
  } finally {
    await context.close();
  }
})();
```

**Key points:**
- The profile directory persists cookies between runs, so you only log in once.
- Use a stable path (not random temp) so sessions survive across agent invocations.
- Use `headless: false` when the user needs to see what's happening or when the
  site blocks headless browsers.

---

## Strategy 3: Built-in Browser Subagent

Some agent environments have a built-in browser tool. Use it for:
- Quick navigation and inspection
- Taking screenshots of pages
- Simple click/type interactions

It does NOT share the user's Chrome session, so it may trigger login screens on
authenticated sites. Prefer CDP for authenticated workflows.

---

## When to Use Which Strategy

| Scenario | Strategy |
|----------|----------|
| Site requires login (ActiveCampaign, WhatsApp Web, etc.) | **CDP Attach** |
| Need to interact with user's open tabs | **CDP Attach** |
| Site doesn't require auth, quick check | **Browser Subagent** or **Persistent Context** |
| Need to automate a long flow with retries | **CDP Attach** or **Persistent Context** |
| User explicitly asks for a fresh browser | **Persistent Context** |

---

## Core Interaction Patterns

### Wait for Elements

```javascript
await page.waitForSelector('.loaded');
await page.waitForTimeout(2000);
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

1. **Downloading Chromium**: Never use `npx playwright install` or bare
   `playwright` package. Always use `playwright-core` + real Chrome.

2. **Closing the user's browser**: Use `browser.disconnect()` with CDP,
   NOT `browser.close()`.

3. **Creating a new context instead of reusing**: With CDP, always use
   `browser.contexts()[0]` to get the existing context with cookies.

4. **Not waiting for page load**: Always use `waitForLoadState` or
   `waitForSelector` before interacting.

5. **Hardcoded selectors**: Prefer `data-testid`, role-based selectors,
   or semantic selectors over fragile CSS paths.

6. **Using `playwright` package**: This triggers a ~400 MB Chromium download.
   Use `playwright-core` instead.

7. **Asking user to log in again**: If you're using CDP and the user is
   already logged in, you inherit their session. Don't navigate to login pages.

---

## Testing Workflow

When asked to test a web application:

1. **Check if Chrome is running with CDP** — if yes, attach via CDP
2. **If no CDP**, start Chrome with `--remote-debugging-port=9222`
3. **Open the target page** in a new tab
4. **Take a screenshot** to verify the initial state
5. **Interact** with elements (click, fill, select)
6. **Take another screenshot** to verify the result
7. **Disconnect** from the browser (don't close it)
8. **Report** findings with screenshots as evidence

---

## Paths Reference (Windows)

| Item | Path |
|------|------|
| Chrome executable | `C:\Program Files\Google\Chrome\Application\chrome.exe` |
| Playwright workspace | `$env:TEMP\pw-ac-ui` |
| Persistent profile | `$env:TEMP\pw-playwright-profile` |
| Chrome User Data | `$env:LOCALAPPDATA\Google\Chrome\User Data` |

> **NOTE:** Paths use environment variables for portability. On macOS/Linux,
> Chrome is at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
> or `/usr/bin/google-chrome`.
