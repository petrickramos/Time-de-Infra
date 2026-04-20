# Marketing Ops Harness

> Um **Agent Harness** pronto para uso que transforma agentes de IA (Codex, Claude Code, Cursor, Windsurf) em operadores autônomos de marketing — capazes de ler documentos de campanha, criar e agendar e-mails no ActiveCampaign e disparar mensagens no SendFlow/WhatsApp.

---

## O Que É Isso?

Este repositório é um **harness** — a infraestrutura operacional que envolve um agente de IA para torná-lo produtivo em tarefas de marketing digital. Ele contém:

| Componente | O Que Faz |
|-----------|-----------|
| **AGENTS.md** | Instruções globais de comportamento do agente (modo GSD) |
| **Skills** | Pacotes modulares de expertise (Playwright, Firecrawl, etc.) |
| **Napkin** | Runbook persistente com aprendizados operacionais |
| **Workflows** | Documentação dos fluxos de ActiveCampaign e SendFlow |
| **Adapters** | Instruções de adaptação para Claude Code, Cursor e Windsurf |

### Terminologia

| Termo | Definição |
|-------|-----------|
| **Harness** | A infraestrutura de software que envolve o agente — gerencia estado, contexto, ferramentas, segurança e confiabilidade. **É isso que este repositório é.** |
| **Skill** | Um pacote modular de instruções que o agente carrega sob demanda (ex: `playwright`, `firecrawl`) |
| **Agent** | O modelo de IA em si (Codex, Claude, GPT, etc.) — o "cérebro" que roda dentro do harness |

---

## Arquitetura

```
┌─────────────────────────────────────────────────┐
│                    HARNESS                       │
│  ┌─────────────┐  ┌──────────┐  ┌────────────┐  │
│  │  AGENTS.md  │  │  Napkin  │  │  Workflows │  │
│  │  (regras)   │  │ (memória)│  │  (fluxos)  │  │
│  └─────────────┘  └──────────┘  └────────────┘  │
│  ┌──────────────────────────────────────────────┐│
│  │              SKILLS                          ││
│  │  playwright │ firecrawl │ n8n │ napkin │ ... ││
│  └──────────────────────────────────────────────┘│
│                       │                          │
│              Navegador Canônico                  │
│              (Chrome com CDP)                    │
│                       │                          │
│         ┌─────────────┼─────────────┐            │
│         ▼             ▼             ▼            │
│   ActiveCampaign  SendFlow   Google Docs         │
└─────────────────────────────────────────────────┘
```

O **Navegador Canônico** é uma instância do Chrome aberta com `--remote-debugging-port=9222`. O agente se conecta a ela via CDP (Chrome DevTools Protocol), herdando todas as sessões de login sem precisar de senhas ou tokens.

---

## Pré-requisitos

- **Node.js** 18+ instalado
- **Google Chrome** instalado
- **Conta ActiveCampaign** (para workflows de e-mail)
- **Conta SendFlow** (para workflows de WhatsApp)
- Uma **ferramenta de agente de IA** instalada:
  - [OpenAI Codex](https://openai.com/codex) (nativo — zero configuração)
  - [Claude Code](https://claude.ai/code) (ver [ADAPTERS.md](ADAPTERS.md))
  - [Cursor](https://cursor.sh) (ver [ADAPTERS.md](ADAPTERS.md))
  - [Windsurf](https://windsurf.com) (ver [ADAPTERS.md](ADAPTERS.md))

---

## Como Começar

### 1. Clone o repositório

```bash
git clone https://github.com/SEU_USUARIO/marketing-ops-harness.git
```

### 2. Posicione os arquivos

Copie a pasta `.agents/` para o diretório raiz do seu usuário:

```powershell
# Windows (PowerShell)
Copy-Item -Recurse -Force .\marketing-ops-harness\.agents\ $env:USERPROFILE\.agents\

# macOS/Linux
cp -r ./marketing-ops-harness/.agents/ ~/.agents/
```

### 3. Siga o Setup de Primeira Execução

Leia o [SETUP.md](SETUP.md) — ele guia você por:
- Instalação de dependências
- Configuração do navegador canônico
- Login nas plataformas
- Teste de validação

### 4. Adapte para sua ferramenta (se necessário)

Se você **não** usa o Codex, leia o [ADAPTERS.md](ADAPTERS.md) para adaptar os arquivos à sua ferramenta (Claude Code, Cursor, Windsurf).

---

## Workflows Disponíveis

| Workflow | Descrição | Documentação |
|----------|-----------|--------------|
| **E-mails ActiveCampaign** | Lê Google Doc → replica template do 1º e-mail → agenda os demais | [activecampaign-emails.md](workflows/activecampaign-emails.md) |
| **WhatsApp SendFlow** | Lê Google Doc → usa ID da campanha via URL → agenda mensagens | [sendflow-whatsapp.md](workflows/sendflow-whatsapp.md) |

---

## Skills Incluídas

| Skill | Descrição |
|-------|-----------|
| `playwright` | Automação de browser via CDP — reusa sessão do Chrome, nunca baixa Chromium |
| `firecrawl` | Scraping e pesquisa web com IA |
| `napkin` | Memória persistente do agente — sempre ativa |
| `n8n-builder` | Criação de workflows de automação N8N |
| `interface-design` | Design de interfaces web modernas |
| `skill-creator` | Criação e melhoria de skills |

---

## Compatibilidade

| Ferramenta | Status | Configuração |
|-----------|--------|-------------|
| OpenAI Codex | ✅ Nativo | Zero config — usa `.agents/` diretamente |
| Claude Code | ✅ Suportado | Ver [ADAPTERS.md](ADAPTERS.md) — adaptar para `CLAUDE.md` / `.claude/` |
| Cursor | ✅ Suportado | Ver [ADAPTERS.md](ADAPTERS.md) — converter para `.cursor/rules/*.mdc` |
| Windsurf | ✅ Suportado | Ver [ADAPTERS.md](ADAPTERS.md) — usar `AGENTS.md` na raiz ou `.windsurf/rules/` |

---

## Licença

MIT — use, modifique e compartilhe livremente.
