# Adaptadores - Como Usar Este Harness em Outras Ferramentas

> Este harness foi originalmente construido para o **OpenAI Codex** (que le `.agents/AGENTS.md` nativamente). Se voce usa outra ferramenta, siga as instrucoes abaixo para adaptar os arquivos.

> **Importante:** ferramentas diferentes nao compartilham historico de conversa. Se voce vai rodar isso em **Claude Code**, trate `CLAUDE.md`, `.claude/napkin.md` e os workflows versionados como a fonte de verdade operacional.

> **Dica para agentes:** detecte a ferramenta pelo diretorio de configuracao presente no sistema (`.claude/`, `.cursor/`, `.windsurf/`) e execute a adaptacao correspondente.

---

## Deteccao Automatica da Ferramenta

O agente pode detectar qual ferramenta esta em uso verificando:

```powershell
if (Test-Path ".claude") { $tool = "claude-code" }
elseif (Test-Path ".cursor") { $tool = "cursor" }
elseif (Test-Path ".windsurf") { $tool = "windsurf" }
elseif (Test-Path ".agents") { $tool = "codex" }
else { $tool = "unknown" }
Write-Host "Ferramenta detectada: $tool"
```

---

## Claude Code

O Claude Code usa `CLAUDE.md` como equivalente ao `AGENTS.md` e a pasta `.claude/` para configuracoes.

### Mapeamento de Arquivos

| Original (Codex) | Destino (Claude Code) | Notas |
|:----|:----|:----|
| `.agents/AGENTS.md` | `CLAUDE.md` (raiz do projeto) | Arquivo principal de instrucoes |
| `.agents/napkin.md` | `.claude/napkin.md` | Memoria operacional local |
| `.agents/skills/*` | `.claude/skills/*` | Manter estrutura identica |

### Instrucoes de Adaptacao

Se voce ja possui um `CLAUDE.md` ou skills locais customizadas, revise o diff antes de sobrescrever.

```powershell
New-Item -ItemType Directory -Path ".claude\skills" -Force | Out-Null

Copy-Item ".agents\AGENTS.md" -Destination "CLAUDE.md" -Force
Copy-Item ".agents\napkin.md" -Destination ".claude\napkin.md" -Force
Copy-Item -Recurse -Force ".agents\skills\*" ".claude\skills\"
```

### Ajustes no Conteudo do CLAUDE.md

Apos copiar, o agente deve fazer estas substituicoes no `CLAUDE.md`:

1. Trocar referencias de `~/.agents/skills/` por `~/.claude/skills/`
2. Trocar referencias de `.agents/napkin.md` por `.claude/napkin.md`
3. Manter qualquer referencia ao navegador canonico em termos genericos: **sessao CDP compativel**, nao "Chrome 9222" como regra universal
4. Adicionar no topo do arquivo:

```markdown
# Instrucoes para Claude Code

> Este arquivo foi adaptado automaticamente do harness original.
> Fonte: https://github.com/petrickramos/Time-de-Infra.git
```

### Referencia Cruzada (Opcional)

Se preferir manter o `AGENTS.md` como fonte de verdade e apenas referencia-lo:

```markdown
Leia e aplique todas as instrucoes contidas em `.agents/AGENTS.md`.
Leia e aplique todas as skills em `.agents/skills/`.
```

---

## Cursor

O Cursor usa arquivos `.mdc` dentro de `.cursor/rules/`.

### Mapeamento de Arquivos

| Original (Codex) | Destino (Cursor) | Notas |
|:----|:----|:----|
| `.agents/AGENTS.md` | `.cursor/rules/core-harness.mdc` | Regra "always apply" |
| `.agents/napkin.md` | `.cursor/rules/napkin-runbook.mdc` | Regra "always apply" |
| `.agents/skills/playwright/SKILL.md` | `.cursor/rules/skill-playwright.mdc` | Ativar por palavras-chave |
| `.agents/skills/n8n-builder/SKILL.md` | `.cursor/rules/skill-n8n.mdc` | Ativar por palavras-chave |
| Outros skills | `.cursor/rules/skill-<nome>.mdc` | Mesmo padrao |

### Formato `.mdc`

Cada arquivo `.mdc` precisa de frontmatter YAML:

```markdown
---
description: "Instrucoes globais do agente"
globs: []
alwaysApply: true
---

# Conteudo do AGENTS.md aqui...
```

Para skills carregadas sob demanda:

```markdown
---
description: "Skill Playwright - automacao de browser via CDP, reuso da sessao canonica do navegador"
globs: []
alwaysApply: false
---

# Conteudo do SKILL.md do playwright aqui...
```

### Instrucoes de Adaptacao

```powershell
New-Item -ItemType Directory -Path ".cursor\rules" -Force | Out-Null

$frontmatter = @"
---
description: "Instrucoes globais do agente"
globs: []
alwaysApply: true
---

"@
$content = Get-Content ".agents\AGENTS.md" -Raw
$frontmatter + $content | Out-File -Encoding utf8 ".cursor\rules\core-harness.mdc"

$skills = @("playwright", "napkin", "n8n-builder")
foreach ($skill in $skills) {
  $skillPath = ".agents\skills\$skill\SKILL.md"
  if (Test-Path $skillPath) {
    $skillContent = Get-Content $skillPath -Raw
    $skillContent = $skillContent -replace "(?s)^---.*?---\s*", ""
    $cursorFrontmatter = @"
---
description: "Skill $skill - carregada sob demanda quando relevante"
globs: []
alwaysApply: false
---

"@
    $cursorFrontmatter + $skillContent | Out-File -Encoding utf8 ".cursor\rules\skill-$skill.mdc"
  }
}

Write-Host "Arquivos .mdc criados em .cursor\rules\"
```

---

## Windsurf

O Windsurf suporta `AGENTS.md` na raiz do projeto e usa `.windsurf/rules/` para regras adicionais.

### Mapeamento de Arquivos

| Original (Codex) | Destino (Windsurf) | Notas |
|:----|:----|:----|
| `.agents/AGENTS.md` | `AGENTS.md` (raiz) | Windsurf le nativamente |
| `.agents/napkin.md` | `.windsurf/rules/napkin.md` | Ou manter em `.agents/` |
| `.agents/skills/*` | `.windsurf/rules/` ou manter `.agents/skills/` | Referenciar no `AGENTS.md` |

### Instrucoes de Adaptacao

Se voce ja possui regras customizadas no Windsurf, revise o diff antes de sobrescrever.

```powershell
Copy-Item ".agents\AGENTS.md" -Destination "AGENTS.md" -Force
New-Item -ItemType Directory -Path ".windsurf\rules" -Force | Out-Null
Copy-Item -Recurse -Force ".agents\skills\*" ".windsurf\rules\"
Copy-Item ".agents\napkin.md" -Destination ".windsurf\rules\napkin.md" -Force
```

### Notas sobre Windsurf

- O Windsurf nao usa frontmatter especial - Markdown puro funciona
- O `AGENTS.md` na raiz e detectado e aplicado ao projeto
- Regras em subdiretorios sao aplicadas apenas quando o agente trabalha naquele diretorio
- Para regras globais, coloque em `~\.windsurf\rules\`

---

## Deepagents

Este repositorio nao inclui um adapter especifico para Deepagents, mas voce pode usar o `AGENTS.md` como fonte de verdade e carregar as skills relevantes a partir da arvore `.agents/`.

Na pratica, a adaptacao minima e:

1. manter `.agents/AGENTS.md` no repositorio
2. manter `.agents/skills/` com as skills realmente usadas
3. garantir que o launcher ou CLI do Deepagents execute dentro do workspace certo
4. registrar no setup local como o Deepagents deve ler esse contexto

> Este repositorio nao tenta inferir automaticamente como cada instalacao de Deepagents carrega regras. Se sua equipe usa um launcher proprio, documente esse launcher no runbook local.

---

## Tabela Resumo

| Aspecto | Codex | Claude Code | Cursor | Windsurf |
|:--------|:------|:------------|:-------|:---------|
| Arquivo principal | `.agents/AGENTS.md` | `CLAUDE.md` | `.cursor/rules/*.mdc` | `AGENTS.md` na raiz |
| Skills | `.agents/skills/` | `.claude/skills/` | `.cursor/rules/skill-*.mdc` | `.windsurf/rules/` |
| Memoria (`napkin`) | `.agents/napkin.md` | `.claude/napkin.md` | `.cursor/rules/napkin.mdc` | `.windsurf/rules/napkin.md` |
| Frontmatter | YAML (skills) | Nenhum | YAML obrigatorio | Nenhum |
| Escopo | Diretorio home | Raiz do projeto | Raiz do projeto | Raiz do projeto |

---

## Para Agentes: Instrucoes de Auto-Adaptacao

Se voce e um agente de IA lendo este documento pela primeira vez:

1. Detecte sua ferramenta usando o bloco de deteccao automatica acima.
2. Execute os comandos de adaptacao da secao correspondente.
3. Verifique que os arquivos foram criados corretamente.
4. Leia o `SETUP.md` para continuar a configuracao do ambiente.
5. Informe o usuario sobre o que foi feito e quais passos manuais restam.
