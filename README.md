# Time de Infra

> Um **Agent Harness** portavel que transforma agentes de IA (Codex, Claude Code, Cursor, Windsurf e outros agentes compativeis) em operadores de marketing capazes de ler documentos de campanha, criar series de e-mail no ActiveCampaign e operar campanhas no SendFlow/WhatsApp.

> Nome do projeto: **Time de Infra**

---

## O Que E Isso?

Este repositorio e o pacote de contexto operacional que torna um agente confiavel nesse dominio. Ele reune:

| Componente | O Que Faz |
|-----------|-----------|
| **AGENTS.md** | Instrucoes globais de comportamento do agente |
| **Skills** | Pacotes modulares de expertise (`playwright`, `napkin`, `n8n-builder`) |
| **Napkin** | Runbook persistente com aprendizados operacionais |
| **Workflows** | Fluxos de ActiveCampaign, SendFlow e bonus de n8n |
| **Adapters** | Adaptacao para Claude Code, Cursor, Windsurf e Deepagents |

### Terminologia

| Termo | Definicao |
|-------|-----------|
| **Harness** | A infraestrutura que envolve o agente e o torna operavel com contexto, memoria, ferramentas e guardrails. **E isso que este repositorio e.** |
| **Skill** | Um pacote modular de instrucoes carregado sob demanda |
| **Agent** | O modelo de IA em si: Codex, Claude, GPT, etc. |

---

## Principio de Portabilidade

Este repositorio precisa ser suficiente por si so. Quem receber o harness e roda-lo em **Claude Code**, **Cursor** ou **Windsurf** nao vera suas conversas anteriores no Codex.

Tudo que for operacionalmente relevante deve morar em arquivos versionados:

- `README.md`
- `SETUP.md`
- `ADAPTERS.md`
- `workflows/`
- `.agents/AGENTS.md`
- `.agents/napkin.md`

O que ficar so na conversa nao viaja com o harness.

---

## Arquitetura

```text
HARNESS
|- AGENTS.md       -> regras globais do agente
|- napkin.md       -> memoria operacional persistente
|- skills/         -> capacidades sob demanda
|- workflows/      -> procedimentos por canal
|- adapters/ docs  -> instrucoes para outras ferramentas
|
`- Navegador Canonico (sessao autenticada via CDP)
   |- ActiveCampaign
   |- SendFlow
   `- WhatsApp Web
```

O **Navegador Canonico** e a sessao autenticada escolhida pelo usuario para automacao. Ele **nao precisa ser Google Chrome**. Pode ser Chrome, Edge, Brave ou outro navegador Chromium compativel com CDP. O requisito real e:

- haver um endpoint CDP conhecido
- a sessao ser estavel
- os logins serem reaproveitados pelo agente

---

## Pre-requisitos

- **Node.js** 18+ instalado
- Um **navegador Chromium compativel com CDP** instalado
- **Conta ActiveCampaign** para workflows de e-mail
- **Conta SendFlow** para workflows de WhatsApp
- Uma ferramenta de agente de IA:
  - [OpenAI Codex](https://openai.com/codex)
  - [Claude Code](https://claude.ai/code)
  - [Cursor](https://cursor.sh)
  - [Windsurf](https://windsurf.com)

> Se a pessoa usa Firefox ou Safari no dia a dia, tudo bem. Para estes workflows autenticados ela ainda precisara de um navegador Chromium separado para expor CDP ao Playwright.

---

## Como Comecar

### 1. Clone o repositorio

```bash
git clone https://github.com/petrickramos/Time-de-Infra.git
```

### 2. Rode o Setup de Primeira Execucao

Leia o [SETUP.md](SETUP.md). Ele cobre:

- auditoria do ambiente
- instalacao do harness sem sobrescrever assets existentes
- definicao do navegador canonico
- login manual inicial nas plataformas
- script de validacao via CDP

### 3. Adapte para sua ferramenta

Se voce **nao usa Codex**, leia o [ADAPTERS.md](ADAPTERS.md) para gerar os arquivos equivalentes para Claude Code, Cursor ou Windsurf.

### 4. Leia os workflows antes da primeira operacao real

Este harness assume guardrails especificos por canal. O fluxo de e-mail, por exemplo, parte do principio de que:

- o **e-mail 1** da serie e criado pelo humano
- o agente usa esse e-mail como **fonte de verdade visual**
- o agente cria apenas os e-mails seguintes

---

## Workflows Disponiveis

| Workflow | Descricao | Documentacao |
|----------|-----------|--------------|
| **E-mails ActiveCampaign** | Humano cria o `e-mail 1` manualmente; agente duplica o template base, troca copy/CTA/horario e agenda os demais | [activecampaign-emails.md](workflows/activecampaign-emails.md) |
| **WhatsApp SendFlow** | Agente le o Google Doc, usa a campanha existente no SendFlow via URL/ID e agenda as mensagens na mesma sessao autenticada | [sendflow-whatsapp.md](workflows/sendflow-whatsapp.md) |
| **Bonus: n8n SendFlow Entrada/Saida** | Duplicar um workflow base, ajustar webhook/path/planilha e ativar via API para registrar metricas de `Entrada` e `Saida` | [n8n-sendflow-entrada-saida.md](workflows/n8n-sendflow-entrada-saida.md) |

---

## Skills Incluidas

| Skill | Descricao |
|-------|-----------|
| `playwright` | Automacao de navegador via CDP, reaproveitando a sessao autenticada do usuario |
| `napkin` | Memoria persistente do agente |
| `n8n-builder` | Criacao, ajuste e deploy de workflows N8N, inclusive via API |

---

## Compatibilidade

| Ferramenta | Status | Configuracao |
|-----------|--------|-------------|
| OpenAI Codex | Sim | Usa `.agents/` diretamente |
| Claude Code | Sim | Ver [ADAPTERS.md](ADAPTERS.md) para adaptar para `CLAUDE.md` e `.claude/` |
| Cursor | Sim | Ver [ADAPTERS.md](ADAPTERS.md) para converter em `.cursor/rules/*.mdc` |
| Windsurf | Sim | Ver [ADAPTERS.md](ADAPTERS.md) para usar `AGENTS.md` na raiz ou `.windsurf/rules/` |
| Deepagents | Parcial | Ver [ADAPTERS.md](ADAPTERS.md); usa `AGENTS.md` como fonte de verdade, mas depende do launcher/CLI local |

---

## Licenca

MIT - use, modifique e compartilhe livremente.
