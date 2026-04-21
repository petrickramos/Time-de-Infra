---
name: n8n-builder
description: |
  Create, manage, and deploy N8N automation workflows. Use when asked to build
  automation flows, integrate services, or create N8N workflows. Generates
  complete workflow JSON files ready to import into N8N, or deploys via API.
version: 1.0.0
date: 2026-03-11
---

# N8N Workflow Builder

Build automation workflows for N8N. Generate complete workflow JSON files
ready for import, or deploy directly via the N8N REST API.

## When to Use

- User asks to create an automation workflow
- User asks to integrate services (Telegram, Google Sheets, Email, etc.)
- User asks to build a N8N flow
- User mentions triggers, webhooks, or scheduled automations
- User wants to create the SendFlow `Entrada` / `Saida` metrics flow in n8n

## N8N Workflow JSON Structure

Every N8N workflow follows this JSON structure:

```json
{
  "name": "Workflow Name",
  "nodes": [
    {
      "parameters": {},
      "id": "unique-id",
      "name": "Node Name",
      "type": "n8n-nodes-base.nodeType",
      "typeVersion": 1,
      "position": [x, y]
    }
  ],
  "connections": {
    "Source Node Name": {
      "main": [
        [
          {
            "node": "Target Node Name",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {
    "executionOrder": "v1"
  }
}
```

## Common Node Types

### Triggers
- `n8n-nodes-base.scheduleTrigger` — Run on schedule (cron)
- `n8n-nodes-base.webhookTrigger` — HTTP webhook
- `n8n-nodes-base.emailTrigger` — When email received
- `n8n-nodes-base.telegramTrigger` — Telegram message

### Actions
- `n8n-nodes-base.httpRequest` — Make HTTP requests
- `n8n-nodes-base.code` — Run JavaScript/Python code
- `n8n-nodes-base.set` — Set values / transform data
- `n8n-nodes-base.if` — Conditional branching
- `n8n-nodes-base.switch` — Multiple condition branching
- `n8n-nodes-base.merge` — Merge data from multiple branches
- `n8n-nodes-base.splitInBatches` — Process items in batches

### Integrations
- `n8n-nodes-base.googleSheets` — Google Sheets
- `n8n-nodes-base.gmail` — Send email via Gmail
- `n8n-nodes-base.telegram` — Telegram bot
- `n8n-nodes-base.slack` — Slack messages
- `n8n-nodes-base.notion` — Notion pages/databases
- `n8n-nodes-base.postgres` — PostgreSQL queries
- `n8n-nodes-base.mysql` — MySQL queries
- `n8n-nodes-base.openAi` — OpenAI API
- `n8n-nodes-base.discord` — Discord bot

### Error Handling
- `n8n-nodes-base.errorTrigger` — Catch workflow errors
- Always add an Error Trigger node to production workflows

## Workflow Design Patterns

### Basic: Trigger → Action
```
Schedule Trigger → HTTP Request → Google Sheets
```

### With Error Handling
```
Webhook → Code → IF (success?) 
  ├── Yes → Google Sheets
  └── No → Telegram (alert)
Error Trigger → Email (notify admin)
```

### Data Pipeline
```
Schedule → HTTP Request → Code (transform) → Split In Batches → DB Insert
```

### Multi-Source Merge
```
Source A → Set (normalize) ─┐
                            ├── Merge → Process → Output
Source B → Set (normalize) ─┘
```

## Node Positioning

Position nodes on a grid for visual clarity:
- **X axis**: Flow direction (left to right), increment by 250px
- **Y axis**: Parallel branches, increment by 150px
- First node at position `[250, 300]`

## N8N REST API

If the user has N8N running, deploy workflows via API:

### List Workflows
```bash
curl -X GET http://localhost:5678/api/v1/workflows \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

### Create Workflow
```bash
curl -X POST http://localhost:5678/api/v1/workflows \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @workflow.json
```

### Activate Workflow
```bash
curl -X POST http://localhost:5678/api/v1/workflows/{id}/activate \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

### Deactivate Workflow
```bash
curl -X POST http://localhost:5678/api/v1/workflows/{id}/deactivate \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

### Import from File
Users can also import via N8N UI: Menu → Import from File → Select JSON

## Build Process

1. **Understand the automation**: What triggers it? What does it do? What services?
2. **Design the flow**: Draw the node chain mentally
3. **Generate the JSON**: Create the complete workflow JSON
4. **Save the file**: Write to `workflow.json` (or descriptive name)
5. **Provide instructions**: Tell user how to import or deploy

## SendFlow Bonus Pattern: Entrada / Saida

When the user wants the WhatsApp metrics flow for SendFlow, use this pattern:

1. reuse a known-good workflow as the base
2. patch the webhook path
3. patch the target Google Sheet
4. verify the `Webhook - Sendflow` node has a `webhookId`
5. save with `PUT /api/v1/workflows/{id}`
6. activate with `POST /api/v1/workflows/{id}/activate`
7. register the hook on the SendFlow side
8. validate one `added` event to `Entrada`
9. validate one `removed` event to `Saida`

If the production webhook returns `not registered`, regenerate `webhookId`, save, deactivate, activate, and test again.

## Common Mistakes

- **Missing Error Trigger**: Always include error handling in production workflows
- **Wrong typeVersion**: Check the N8N docs for current type versions
- **Forgetting connections**: Every node (except triggers and endpoints) must be connected
- **Static credentials**: Use N8N credential system, never hardcode API keys in nodes
- **No testing**: Always suggest the user test with sample data first

## Best Practices

- Name nodes descriptively: "Fetch Weather Data" not "HTTP Request"
- Add sticky notes for complex logic
- Group related nodes visually
- Use the Code node for complex transformations
- Set meaningful workflow descriptions
- Use environment variables for API URLs and keys
