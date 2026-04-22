# Workflow: E-mails no ActiveCampaign

> Este workflow descreve o modelo operacional recomendado para series de e-mail no ActiveCampaign quando o conteudo vem de um Google Doc e o layout nasce de um template humano ja aprovado.

---

## Fluxo Geral

```text
Google Doc (conteudo da serie)
       |
       v
Humano cria o e-mail 1 manualmente
       |
       v
Agente le o documento e extrai os e-mails seguintes
       |
       v
Agente duplica o e-mail 1 como template base
       |
       v
Agente ajusta copy, assunto, preheader, CTAs e horario
       |
       v
Agente valida no editor + preview + teste (quando pedido)
```

---

## Regra Central: o E-mail 1 e Humano

> **O agente nao cria o primeiro e-mail do zero.** O `e-mail 1` da serie e sempre feito por uma pessoa e passa a ser a fonte de verdade visual para os proximos.

### Por que isso importa?

Porque o `e-mail 1` define:

- template base
- layout
- editor usado
- estilo visual
- estrutura dos blocos
- UTMs e convencoes de link

O agente so deve operar com seguranca quando essa base ja existe.

---

## O Que o Agente Pode Alterar

Quando a serie reaproveita o mesmo template base, o agente pode alterar:

- nome da campanha
- nome da mensagem
- assunto
- preheader
- copy do miolo
- texto dos botoes
- links dos botoes
- data e hora do envio

## O Que o Agente Nao Deve Alterar Sozinho

Sem instrucao explicita, o agente nao deve mexer em:

- imagem de topo
- rodape
- redes sociais
- cores
- estrutura visual
- tipo de editor/template

Se o doc divergir estruturalmente do template base, vence o template base ou a tarefa deve ser escalada.

---

## Guardrails de Encoding e Emoji

Para series de e-mail com emoji, acentos ou destaque visual relevante:

- preserve Unicode de ponta a ponta em `subject`, `preheader`, corpo e labels de botao
- trate UTF-8 como obrigatorio em arquivos intermediarios, JSONs, HTMLs e scripts que mexam na copy
- se um arquivo parecer mojibake no terminal, valide com `node` antes de concluir que houve regressao real de UTF-8
- se algum acento ou emoji virar `?`, caractere de substituicao ou glifo incorreto no editor/preview, pare e escale

> Sintoma tipico de falha de encoding: o emoji chega ao ActiveCampaign como um simbolo preto de interrogacao ou como `?`.

Quando houver duvida residual:

- registrar `emojiStatus: review_needed`
- manter revisao visual humana para emoji e micro-espacamento

---

## Guardrails de CTA e UTM

O link do `e-mail 1` e a fonte de verdade para rastreamento.

Regra base:

- manter `host` e `path` iguais ao template base
- trocar apenas os tokens de rastreamento que variam por e-mail
- nao improvisar dominio, subdominio ou path novo

Padroes comuns:

- `utm_content=emailN`
- `utm_content=foemailN`
- `sck=emailN`
- `sck=foemailN`

O harness deve preferir **script local** para derivar os links dos e-mails seguintes. O objetivo nao e "automatizar por automatizar"; e reduzir risco de:

- drift de UTM
- typo manual em query string
- troca acidental de dominio ou path
- inconsistencias entre botoes do mesmo e-mail

Se a empresa usar outro modelo de rastreamento:

1. inspeccionar o link-base do `e-mail 1`
2. inferir quais partes sao fixas e quais variam por numero/etapa
3. adaptar ou gerar um script novo para esse schema
4. usar o script como protecao do harness em vez de editar os links na mao

> Exemplo generico: [templates/utm-link-patcher.example.js](../templates/utm-link-patcher.example.js)

---

## Pre-requisitos

Antes de rodar este workflow:

1. O `e-mail 1` da serie ja existe no ActiveCampaign.
2. O usuario informou qual campanha ou mensagem serve de base.
3. A mesma sessao autenticada do navegador canonico pode ser reutilizada via CDP.
4. O Google Doc esta organizado com ancoras claras para os e-mails seguintes.

---

## Entrada: Google Doc

O Google Doc deve conter, para cada e-mail da serie:

| Campo | Descricao |
|-------|-----------|
| **Assunto** | Linha de assunto |
| **Preheader** | Texto de preview |
| **Texto do e-mail** | Copy do corpo editavel |
| **CTA** | Texto e link do botao |
| **Data/Hora** | Quando o e-mail deve ser agendado |

### Formato Sugerido

```text
## E-mail 2
- Assunto: ...
- Preheader: ...
- Data/Hora: YYYY-MM-DD HH:MM

### Texto do e-mail
[copy]

### CTA
Texto: ...
Link: ...
```

---

## Execucao pelo Agente

### Passo 1: Ler e parsear o documento

O agente extrai dos e-mails `2..N`:

- assunto
- preheader
- corpo do e-mail
- CTA
- data e hora

### Passo 2: Abrir a base correta

O agente acessa o `e-mail 1` ja criado e confirma que ele e o template certo.

> Prefira deep links canonicamente estaveis do ActiveCampaign, como `/app/campaigns/{cid}`, em vez de URLs antigas de resumo.

### Passo 3: Inspecionar o modelo de links

Antes de trocar CTAs, o agente deve ler o link-base do `e-mail 1` e identificar:

- quais partes do URL sao fixas
- quais parametros mudam por e-mail
- se existe convencao numerada de `utm_content`, `sck` ou equivalente

Se houver mais de um botao, todos devem seguir a mesma derivacao do template-base.

### Passo 4: Duplicar o template base

O agente duplica a campanha/mensagem base e gera cada e-mail seguinte a partir dela.

### Passo 5: Editar sem destruir o layout

O agente deve:

- usar a API para metadata quando isso for seguro
- usar o editor nativo da campanha para o corpo quando a fidelidade visual depender do template
- preservar blocos nativos do layout

O agente **nao deve** substituir o corpo inteiro por um bloco HTML gigante.

### Passo 6: Aplicar CTAs por script

Ao atualizar os links:

- derive as URLs a partir do link-base
- aplique os tokens de rastreamento corretos para aquele e-mail
- valide que `host` e `path` permaneceram identicos ao original

Se o schema da empresa for diferente do exemplo local, o agente deve adaptar o script antes de rodar.

### Passo 7: Agendar exatamente no horario do documento

O horario salvo deve bater com o horario informado no Google Doc. Nao aplique offsets implicitos.

### Passo 8: Validar antes de encerrar

Validacao minima:

- nome da campanha
- data e hora
- assunto
- preheader
- CTAs derivados corretamente do `e-mail 1`
- estrutura visual no editor
- preview
- envio de teste, se solicitado

---

## Guardrails

1. **Nunca criar e-mail sem template base.**
2. **Nunca regravar o corpo inteiro com "HTMLzao".**
3. **Usar Playwright + sessao CDP canonica para UI autenticada.**
4. **Nao enviar imediatamente se a tarefa e de agendamento.**
5. **O horario final deve ser exatamente o do documento.**
6. **Preservar Unicode e UTF-8 de ponta a ponta quando houver emoji ou acentos sensiveis.**
7. **Preferir script para derivacao de CTA/UTM, em vez de editar query strings manualmente.**
8. **Se a estrutura divergir do template base, parar e escalar.**
9. **Se o editor, o layout, os links ou o encoding parecerem quebrados, parar e escalar.**

---

## Exemplo de Sessao

```text
Usuario: "Leia o Google Doc [URL] e crie os e-mails 2, 3 e 4.
O e-mail 1 ja esta criado no ActiveCampaign e deve ser a base."

Agente:
  1. Le o Google Doc
  2. Parseia os e-mails 2, 3 e 4
  3. Reaproveita a sessao autenticada do navegador
  4. Abre o e-mail 1 no ActiveCampaign
  5. Duplica a base para gerar o e-mail 2
  6. Troca assunto, preheader, copy, CTA e horario
  7. Repete para os demais
  8. Valida preview e agenda
  9. Relata o resultado
```
