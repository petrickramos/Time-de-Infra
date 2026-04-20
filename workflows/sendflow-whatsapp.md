# Workflow: Mensagens WhatsApp via SendFlow

> Este workflow descreve como o agente agenda sequências de mensagens WhatsApp no SendFlow a partir de um Google Doc.

---

## Fluxo Geral

```
Google Doc (conteúdo + cronograma)
       │
       ▼
  Agente lê o documento
       │
       ▼
  Usuário fornece o ID da campanha
  (extraído da URL do SendFlow)
       │
       ▼
  Agente acessa SendFlow via CDP
       │
       ▼
  Agente agenda cada mensagem
       │
       ▼
  Verificação via screenshot
```

---

## Conceito: ID da Campanha pela URL

O SendFlow organiza as mensagens dentro de **campanhas**. O ID da campanha está contido na URL:

```
https://app.sendflow.pro/campaign/12345
                                  ^^^^^
                                  Este é o ID da campanha
```

> O usuário deve fornecer a URL da campanha ou o ID diretamente. O agente extrai o ID numérico da URL.

---

## Pré-requisitos

Antes de executar este workflow, certifique-se de que:

1. ✅ O **Chrome Canônico** está aberto com `--remote-debugging-port=9222`
2. ✅ Você está **logado no SendFlow** (`https://app.sendflow.pro`)
3. ✅ O **WhatsApp de disparo** está conectado (QR Code escaneado)
4. ✅ A **campanha já existe** no SendFlow (com contatos/lista configurados)

---

## Entrada: Google Doc

O Google Doc deve conter, para cada mensagem:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| **Conteúdo** | Texto da mensagem WhatsApp | "Olá {nome}! Vamos lá..." |
| **Mídia** | URL de imagem/vídeo (opcional) | `https://...imagem.jpg` |
| **Data/Hora** | Quando a mensagem deve ser disparada | "2026-04-21 10:00 BRT" |
| **Variáveis** | Campos personalizados | `{nome}`, `{empresa}`, etc. |

### Formato Sugerido no Google Doc

```
## Mensagem 1 — [Nome/Descrição]
- Data/Hora: YYYY-MM-DD HH:MM
- Mídia: [URL ou "nenhuma"]

### Conteúdo:
Olá {nome}!

[Texto da mensagem aqui]

Abraços,
[Assinatura]
```

---

## Execução pelo Agente

### Passo 1: Obter o ID da Campanha

O usuário fornece a URL ou ID:

```
Usuário: "Agende as mensagens na campanha https://app.sendflow.pro/campaign/12345"
Agente extrai: ID = 12345
```

### Passo 2: Ler o Google Doc

```bash
npx firecrawl-cli scrape "https://docs.google.com/document/d/DOC_ID/pub" -o whatsapp-content.md
```

### Passo 3: Conectar ao SendFlow via CDP

```javascript
const { chromium } = require('PLAYWRIGHT_CORE_PATH/playwright-core');

(async () => {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const context = browser.contexts()[0];
    const page = await context.newPage();

    // Navegar para a campanha
    await page.goto('https://app.sendflow.pro/campaign/12345', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
    });

    // ... interagir com a UI do SendFlow para agendar mensagens ...

    await page.close();
    browser.disconnect();
})();
```

### Passo 4: Agendar Cada Mensagem

Para cada mensagem no Google Doc:
1. Acessar a seção de agendamento da campanha
2. Inserir o conteúdo da mensagem
3. Anexar mídia (se aplicável)
4. Configurar data e hora de envio
5. Confirmar agendamento

### Passo 5: Verificar

1. Tirar screenshot de cada mensagem agendada
2. Confirmar que conteúdo, horário e lista estão corretos
3. Relatar ao usuário

---

## Guardrails (Regras de Segurança)

1. **SEMPRE verificar que o WhatsApp está conectado** antes de agendar — checar na interface do SendFlow se o número está ativo
2. **NUNCA disparar mensagem imediatamente** — sempre agendar para o futuro
3. **SEMPRE usar CDP** para acessar o SendFlow — nunca browser_subagent (precisa sessão autenticada)
4. **SEMPRE tirar screenshot** de confirmação após agendar cada mensagem
5. **VERIFICAR variáveis** — confirmar que `{nome}` e outras variáveis estão formatadas corretamente

---

## Login no WhatsApp de Teste (Primeira Vez)

Se é a primeira vez usando este workflow, o agente deve:

1. Navegar até a seção de configuração do WhatsApp no SendFlow
2. Verificar se há um número conectado
3. Se **não houver**, informar o usuário:
   ```
   ⚠️ Nenhum WhatsApp conectado no SendFlow.
   
   Para conectar:
   1. Acesse https://app.sendflow.pro/settings/whatsapp (ou equivalente)
   2. Clique em "Conectar novo número"
   3. Escaneie o QR Code com o celular do número de disparo de testes
   4. Aguarde a confirmação de conexão
   
   Após conectar, me avise para continuar o agendamento.
   ```
4. Se **houver**, prosseguir com o agendamento normalmente

---

## Exemplo de Sessão

```
Usuário: "Leia o Google Doc [URL] e agende as mensagens na campanha
          https://app.sendflow.pro/campaign/12345"

Agente:
  1. Extrai ID da campanha: 12345
  2. Lê o Google Doc via firecrawl
  3. Parseia 5 mensagens com datas/horários
  4. Conecta ao Chrome via CDP
  5. Acessa a campanha no SendFlow
  6. Verifica que WhatsApp está conectado ✅
  7. Agenda mensagem 1 para 2026-04-21 10:00
  8. Agenda mensagem 2 para 2026-04-22 10:00
  9. ... (repete para todas)
  10. Tira screenshots de confirmação
  11. Relata: "✅ 5 mensagens agendadas na campanha 12345."
```

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| SendFlow mostra "sessão expirada" | Fazer login manualmente no Chrome canônico e tentar novamente |
| WhatsApp desconectado | Re-escanear QR Code no SendFlow. O agente informará quando detectar isso |
| Mensagem não foi agendada | Verificar se a data está no futuro e se o formato está correto |
| Campanha não encontrada | Verificar se o ID está correto na URL |
