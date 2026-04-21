# Workflow Bonus: n8n + SendFlow Entrada/Saida

> Este workflow bonus documenta como criar a automacao de metricas WPP que recebe eventos do SendFlow e grava `Entrada` e `Saida` em abas separadas no Google Sheets usando n8n.

---

## Quando Usar

Use este fluxo quando a operacao precisar de:

- webhook do SendFlow
- workflow no n8n
- planilha com abas `Entrada` e `Saida`
- validacao real de eventos `added` e `removed`

---

## Fluxo Geral

```text
Workflow base no n8n
       |
       v
Duplicar workflow
       |
       v
Trocar path do webhook
       |
       v
Trocar planilha alvo
       |
       v
Ativar workflow via API
       |
       v
Cadastrar hook no SendFlow
       |
       v
Validar um evento de Entrada e um de Saida
```

---

## Estrutura Esperada do Workflow

O fluxo padrao deve ter estes blocos:

1. `Webhook - Sendflow`
2. `Normalizador`
3. `Switch`
4. `Entrada` (Google Sheets)
5. `Saida` (Google Sheets)

Regra do `Switch`:

- `group.updated.members.added` -> `Entrada`
- `group.updated.members.removed` -> `Saida`

---

## Insumos Minimos

Antes de comecar, confirme:

1. codigo da operacao
2. workflow-modelo correto no n8n
3. planilha modelo ja validada
4. acesso ao SendFlow
5. credencial de Google Sheets no n8n
6. campanha/grupo correto no SendFlow

---

## Nomenclatura Recomendada

- automacao no n8n: `[CODIGO] Automacao Metricas WPP - Entrada/Saida`
- planilha: `[CODIGO] Entrada, Saida e Metricas`
- webhook do SendFlow: usar o codigo da operacao
- path do webhook no n8n: codigo minusculo + `metricaswpp`

Exemplo:

- codigo: `DELTARJ0426L`
- path: `deltarj0426lmetricaswpp`

---

## Procedimento

### 1. Criar a planilha nova

1. copie a planilha modelo
2. renomeie no padrao da operacao
3. confirme que as abas `Entrada` e `Saida` existem
4. capture o ID da planilha

### 2. Duplicar o workflow base

1. localize uma automacao padrao ja funcional
2. duplique o workflow
3. renomeie para a nova operacao
4. mantenha desativado enquanto ajusta

### 3. Ajustar webhook e Sheets

1. troque o `Path` do no `Webhook - Sendflow`
2. ajuste o no `Entrada` para a nova planilha e aba `Entrada`
3. ajuste o no `Saida` para a mesma planilha e aba `Saida`

### 4. Salvar e ativar via API

Na API v1 do n8n:

- atualizar workflow: `PUT /api/v1/workflows/{id}`
- ativar: `POST /api/v1/workflows/{id}/activate`
- desativar: `POST /api/v1/workflows/{id}/deactivate`

> Nao envie `active` no `PUT`, porque esse campo e tratado como read-only nessa superficie.

### 5. Verificar `webhookId`

Clones por API podem sair sem `webhookId` no no `Webhook - Sendflow`.

Sintoma tipico:

```text
404 The requested webhook "POST <path>" is not registered.
```

Correcao:

1. gerar um `webhookId` novo
2. salvar o workflow novamente
3. fazer `deactivate -> activate`
4. repetir o teste

### 6. Cadastrar o hook no SendFlow

Use a superficie de `sendhooks`, nao `sendapi`.

Sequencia real do wizard:

1. `Sendhook` -> `PROXIMA`
2. `Campanha` -> `PROXIMA`
3. clicar nos dois `Enviar teste`
4. `PROXIMA`
5. `Enviar`

Se parar antes do `Enviar`, o hook nao fica persistido.

### 7. Validar teste e producao

Validacao minima:

1. um evento `added` deve cair em `Entrada`
2. um evento `removed` deve cair em `Saida`
3. o hook deve aparecer na lista do SendFlow
4. o n8n deve mostrar `Executions` de sucesso

---

## Guardrails

1. **Duplicar base funcional e patchar, nao recriar do zero.**
2. **Usar `sendhooks` para o ultimo quilometro do webhook.**
3. **Nao considerar o wizard de teste como prova suficiente.**
4. **Validar `Executions` no n8n e gravacao real nas abas.**
5. **Se faltar `webhookId`, corrigir antes de declarar concluido.**

---

## Resultado Esperado

Ao final, a operacao deve ter:

- um workflow novo ativo no n8n
- um webhook persistido no SendFlow
- uma planilha com abas `Entrada` e `Saida`
- prova real de um evento `added` e um `removed`
