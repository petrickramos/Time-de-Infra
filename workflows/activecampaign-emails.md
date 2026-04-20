# Workflow: E-mails no ActiveCampaign

> Este workflow descreve como o agente cria e agenda sequências de e-mails de marketing no ActiveCampaign a partir de um Google Doc.

---

## Fluxo Geral

```
Google Doc (conteúdo)
       │
       ▼
  Agente lê o documento
       │
       ▼
  Humano cria o 1º e-mail manualmente
  (define template, layout, UTMs)
       │
       ▼
  Agente replica o template do 1º e-mail
  para criar os e-mails seguintes
       │
       ▼
  Agente agenda cada e-mail via API + Playwright
       │
       ▼
  Verificação via screenshot
```

---

## Conceito Fundamental: O Primeiro E-mail

> **O primeiro e-mail da sequência é sempre criado pelo humano.** O agente NÃO cria e-mails do zero.

### Por quê?

1. **O primeiro e-mail define o template base** — layout, cores, fontes, estrutura HTML
2. **O primeiro e-mail define os UTMs** — `utm_source`, `utm_medium`, `utm_campaign`
3. **O primeiro e-mail define o estilo** — tom de voz visual, posicionamento de imagens, botões
4. O agente **replica** esse template para os e-mails seguintes, trocando apenas o conteúdo (copy, assunto, horário)

### Na Prática

1. O humano vai ao ActiveCampaign e cria uma campanha de e-mail manualmente
2. Configura o design, layout e UTMs
3. Informa ao agente: "O primeiro e-mail já está criado, use-o como base para os próximos"
4. O agente lê a estrutura do primeiro e-mail (via API ou Playwright) e replica

---

## Entrada: Google Doc

O Google Doc deve conter, para cada e-mail:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| **Assunto** | Linha de assunto do e-mail | "🔥 Última chance: inscrições fecham amanhã" |
| **Pré-header** | Texto de preview | "Não perca essa oportunidade..." |
| **Copy** | Conteúdo do corpo do e-mail | Texto completo com formatação |
| **CTA** | Call-to-action (texto + link do botão) | "QUERO ME INSCREVER" → https://... |
| **Data/Hora** | Quando o e-mail deve ser enviado | "2026-04-21 10:00 BRT" |
| **Lista/Segmento** | Para quem enviar | "Lista: Leads Quentes" |

### Formato Sugerido no Google Doc

```
## E-mail 2 — [Nome do E-mail]
- Assunto: ...
- Pré-header: ...
- Data/Hora: YYYY-MM-DD HH:MM
- Lista: ...

### Copy:
[Conteúdo do e-mail aqui]

### CTA:
Texto: ...
Link: ...
```

---

## Execução pelo Agente

### Passo 1: Ler o Google Doc

O agente usa a skill `firecrawl` ou acessa o Google Doc via URL compartilhável:

```bash
npx firecrawl-cli scrape "https://docs.google.com/document/d/DOC_ID/pub" -o campaign-content.md
```

### Passo 2: Parsear o Conteúdo

O agente extrai de cada seção:
- Assunto
- Pré-header
- Copy (corpo do e-mail)
- CTA (texto + URL)
- Data/hora de envio
- Lista/segmento alvo

### Passo 3: Replicar o Template do 1º E-mail

Via API do ActiveCampaign ou Playwright:
1. Acessar o 1º e-mail da sequência
2. Duplicar a campanha
3. Trocar assunto, pré-header, copy e CTA
4. Configurar data/hora de envio
5. Salvar

### Passo 4: Agendar

1. Configurar a data e hora de envio
2. Selecionar a lista/segmento
3. Agendar o e-mail

### Passo 5: Verificar

1. Tirar screenshot do e-mail agendado
2. Confirmar que assunto, lista e horário estão corretos
3. Relatar ao usuário

---

## Guardrails (Regras de Segurança)

1. **NUNCA criar e-mail sem template base** — sempre replicar do primeiro
2. **SEMPRE verificar UTMs** — todo link no e-mail deve ter `utm_source`, `utm_medium`, `utm_campaign`
3. **NUNCA enviar imediatamente** — sempre agendar para o futuro
4. **SEMPRE fazer preflight check** — verificar assunto, lista, horário antes de confirmar
5. **NUNCA usar o browser_subagent para sites autenticados** — usar CDP via skill `playwright`
6. **SEMPRE tirar screenshot** de confirmação após agendar

---

## Exemplo de Sessão

```
Usuário: "Leia o Google Doc [URL] e crie os e-mails 2, 3 e 4 da sequência.
          O e-mail 1 já está criado no ActiveCampaign."

Agente:
  1. Lê o Google Doc via firecrawl
  2. Parseia e-mails 2, 3 e 4
  3. Conecta ao Chrome via CDP
  4. Acessa ActiveCampaign
  5. Duplica o e-mail 1 → cria e-mail 2
  6. Troca conteúdo (assunto, copy, CTA)
  7. Agenda para a data/hora especificada
  8. Repete para e-mails 3 e 4
  9. Tira screenshots de confirmação
  10. Relata: "✅ E-mails 2, 3 e 4 criados e agendados."
```

---

## Referência: API ActiveCampaign

Endpoints úteis (requerem API key):

| Endpoint | Uso |
|----------|-----|
| `GET /api/3/campaigns` | Listar campanhas existentes |
| `POST /api/3/campaigns` | Criar nova campanha |
| `PUT /api/3/campaigns/:id` | Atualizar campanha |
| `GET /api/3/lists` | Listar listas de contatos |

> A API key deve ser configurada como variável de ambiente: `$env:AC_API_KEY`
> A URL base depende da conta: `https://SUA_CONTA.api-us1.com`
