---
name: firecrawl
description: |
  Use the Firecrawl CLI to scrape, search, crawl, and map websites.
  Invoke when asked to extract data from websites, search the web,
  crawl pages, or gather information from URLs. Firecrawl uses AI to
  extract clean, structured data from any website. Results are written
  to the filesystem as markdown or JSON.
version: 1.0.0
date: 2026-03-11
---

# Firecrawl CLI Skill

Scrape, search, crawl, and map the web using the Firecrawl CLI.
AI-powered scraping that stays robust even when page layouts change.

## Prerequisites

Install the Firecrawl CLI:
```bash
npm install -g firecrawl-cli
```

Authenticate (browser-based):
```bash
npx firecrawl-cli auth
```

Or set the API key directly:
```bash
export FIRECRAWL_API_KEY=your-key-here
```

Get a free API key at: https://firecrawl.dev

## Core Commands

### Scrape a Single Page
```bash
npx firecrawl-cli scrape <url>
npx firecrawl-cli scrape <url> --format markdown
npx firecrawl-cli scrape <url> --format json
npx firecrawl-cli scrape <url> -o output.md
```

### Search the Web
```bash
npx firecrawl-cli search "query here"
npx firecrawl-cli search "query here" --limit 5
npx firecrawl-cli search "query here" -o results.md
```

### Crawl a Website (Multiple Pages)
```bash
npx firecrawl-cli crawl <url>
npx firecrawl-cli crawl <url> --limit 10
npx firecrawl-cli crawl <url> --max-depth 2
npx firecrawl-cli crawl <url> -o output-dir/
```

### Map a Website (Sitemap)
```bash
npx firecrawl-cli map <url>
npx firecrawl-cli map <url> -o sitemap.json
```

## Usage Patterns

### Extract Structured Data
```bash
npx firecrawl-cli scrape <url> --extract '{"schema": {"title": "string", "price": "number", "description": "string"}}'
```

### Search and Summarize
1. Search for the topic
2. Scrape the top results
3. Compile findings

### Monitor a Page
```bash
npx firecrawl-cli scrape <url> -o snapshot_$(date +%Y%m%d).md
```

## When to Use

- User asks to find information on the web
- User asks to scrape/extract data from a website
- User asks to crawl a website and collect pages
- User needs documentation from an external site
- User wants to monitor changes on a webpage
- User asks "what is..." or "find me..." about a web topic

## vs Playwright

- Use **Firecrawl** for: content extraction, web search, structured data scraping
- Use **Playwright** for: interactive browser control, testing, UI verification, clicking buttons

## Common Mistakes

- **Not saving output**: Always use `-o` flag to save results to a file
- **Scraping too many pages**: Use `--limit` to control crawl scope
- **Ignoring rate limits**: Firecrawl handles rate limiting, but be reasonable
- **Using for interactive pages**: If you need to click/interact, use Playwright instead
