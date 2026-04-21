# Workflow: Mensagens WhatsApp via SendFlow

> Este workflow descreve como o agente agenda sequencias de mensagens WhatsApp no SendFlow a partir de um Google Doc.

---

## Fluxo Geral

```text
Google Doc (conteudo + cronograma)
       |
       v
Agente le o documento
       |
       v
Usuario informa a campanha via URL ou ID
       |
       v
Agente reutiliza a sessao autenticada do navegador canonico via CDP
       |
       v
Agente agenda as mensagens no SendFlow
       |
       v
Agente valida o resultado
```

---

## Conceito: ID da Campanha pela URL

O SendFlow organiza as mensagens dentro de campanhas. O ID da campanha costuma aparecer na URL:

```text
https://app.sendflow.pro/campaign/12345
                                  ^^^^^
                                  Este e o ID da campanha
```

O usuario pode fornecer a URL completa ou apenas o ID.

---

## Pre-requisitos

Antes de executar este workflow, certifique-se de que:

1. Existe uma **sessao de navegador canonica** pronta para reutilizacao via CDP.
2. O usuario esta logado no SendFlow nessa sessao.
3. O WhatsApp de teste esta conectado, se o fluxo exigir teste em WhatsApp Web.
4. A campanha ja existe no SendFlow.

> O navegador canonico nao precisa ser Google Chrome. Pode ser qualquer navegador Chromium compativel com CDP.

---

## Entrada: Google Doc

O Google Doc deve conter, para cada mensagem:

| Campo | Descricao |
|-------|-----------|
| **Conteudo** | Texto da mensagem |
| **Midia** | URL de imagem/video, se houver |
| **Data/Hora** | Quando a mensagem deve ser disparada |
| **Variaveis** | Campos personalizados como `{nome}` |

### Formato Sugerido

```text
## Mensagem 1
- Data/Hora: YYYY-MM-DD HH:MM
- Midia: [URL ou "nenhuma"]

### Conteudo
Ola {nome}!

[texto da mensagem]
```

---

## Execucao pelo Agente

### Passo 1: Obter o ID da campanha

O agente extrai o ID da URL ou usa o ID informado diretamente.

### Passo 2: Ler o Google Doc

O agente parseia:

- conteudo
- midia
- horario
- variaveis

### Passo 3: Conectar ao SendFlow via CDP

O agente usa Playwright conectado a sessao autenticada do navegador canonico.

```javascript
const { chromium } = require(process.env.TEMP.replace(/\\/g, '/') + '/pw-ac-ui/node_modules/playwright-core');

(async () => {
  const cdpEndpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9222';
  const browser = await chromium.connectOverCDP(cdpEndpoint);
  const context = browser.contexts()[0];
  const page = await context.newPage();

  try {
    await page.goto('https://app.sendflow.pro/campaign/12345', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    // ... interagir com a UI do SendFlow ...
  } finally {
    await page.close();
    browser.disconnect();
  }
})();
```

> Se sua maquina usa outra porta, ajuste `CDP_ENDPOINT`. O ponto importante e reaproveitar a sessao existente.

### Passo 4: Agendar cada mensagem

Para cada mensagem no Google Doc:

1. abrir a campanha correta
2. inserir o conteudo
3. anexar midia, se aplicavel
4. configurar data e hora
5. confirmar o agendamento

### Passo 5: Validar

Validacao minima:

- campanha correta
- conteudo correto
- horario correto
- variaveis formatadas corretamente
- evidencia visual ou confirmacao na UI

---

## Guardrails

1. **Sempre usar a sessao canonica via CDP para o SendFlow.**
2. **Nao depender de historico de conversa externo ao repositorio.**
3. **Nunca disparar imediatamente se a tarefa e de agendamento.**
4. **Verificar se o WhatsApp esta conectado antes de concluir.**
5. **Se a sessao estiver expirada, parar para re-login manual na mesma sessao canonica.**

---

## Login no WhatsApp de Teste (Primeira Vez)

Se e a primeira vez usando este workflow:

1. abra `https://web.whatsapp.com` na mesma sessao canonica
2. escaneie o QR Code
3. confirme que as conversas aparecem

Depois disso, o agente reaproveita essa mesma sessao.

---

## Exemplo de Sessao

```text
Usuario: "Leia o Google Doc [URL] e agende as mensagens na campanha
https://app.sendflow.pro/campaign/12345"

Agente:
  1. Extrai o ID 12345
  2. Le o Google Doc
  3. Reutiliza a sessao autenticada via CDP
  4. Abre a campanha no SendFlow
  5. Agenda as mensagens
  6. Valida o resultado
  7. Relata a conclusao
```

---

## Troubleshooting

| Problema | Solucao |
|----------|---------|
| Sessao expirada no SendFlow | Refaca o login manual na mesma sessao canonica |
| WhatsApp desconectado | Reescaneie o QR Code no WhatsApp Web da mesma sessao |
| Campanha nao encontrada | Verifique o ID extraido da URL |
| Mensagem nao foi agendada | Verifique horario, variaveis e estado da campanha |
