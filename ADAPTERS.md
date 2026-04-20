# Adaptadores — Como Usar Este Harness em Outras Ferramentas

> Este harness foi originalmente construído para o **OpenAI Codex** (que lê `.agents/AGENTS.md` nativamente). Se você usa outra ferramenta, siga as instruções abaixo para adaptar os arquivos.

> **DICA PARA AGENTES:** Se você é um agente de IA lendo este arquivo, execute as instruções de adaptação automaticamente com base na ferramenta que está sendo usada. Detecte a ferramenta pelo diretório de configuração presente no sistema (`.claude/`, `.cursor/`, `.windsurf/`).

---

## Detecção Automática da Ferramenta

O agente pode detectar qual ferramenta está em uso verificando:

```powershell
# Detectar ferramenta
if (Test-Path ".claude") { $tool = "claude-code" }
elseif (Test-Path ".cursor") { $tool = "cursor" }
elseif (Test-Path ".windsurf") { $tool = "windsurf" }
elseif (Test-Path ".agents") { $tool = "codex" }
else { $tool = "unknown" }
Write-Host "Ferramenta detectada: $tool"
```

---

## Claude Code

O Claude Code usa `CLAUDE.md` como equivalente ao `AGENTS.md` e a pasta `.claude/` para configurações.

### Mapeamento de Arquivos

| Original (Codex) | Destino (Claude Code) | Notas |
|:----|:----|:----|
| `.agents/AGENTS.md` | `CLAUDE.md` (raiz do projeto) | Arquivo principal de instruções |
| `.agents/napkin.md` | `.claude/napkin.md` | Ou referenciado no `CLAUDE.md` |
| `.agents/skills/*` | `.claude/skills/*` | Manter estrutura idêntica |

### Instruções de Adaptação

Execute estes comandos para adaptar:

```powershell
# 1. Criar diretório .claude se não existir
New-Item -ItemType Directory -Path ".claude\skills" -Force

# 2. Copiar AGENTS.md como CLAUDE.md
Copy-Item ".agents\AGENTS.md" -Destination "CLAUDE.md" -Force

# 3. Copiar napkin
Copy-Item ".agents\napkin.md" -Destination ".claude\napkin.md" -Force

# 4. Copiar skills
Copy-Item -Recurse -Force ".agents\skills\*" ".claude\skills\"
```

### Ajustes no Conteúdo do CLAUDE.md

Após copiar, o agente deve fazer estas substituições no `CLAUDE.md`:

1. Trocar referências de `~/.agents/skills/` por `~/.claude/skills/`
2. Trocar referências de `.agents/napkin.md` por `.claude/napkin.md`
3. Trocar referências de `.codex/` por `.claude/`
4. Adicionar no topo do arquivo:

```markdown
# Instruções para Claude Code

> Este arquivo foi adaptado automaticamente do harness original (Codex).
> Fonte: https://github.com/SEU_USUARIO/marketing-ops-harness
```

### Referência Cruzada (Opcional)

Se preferir manter o `AGENTS.md` como fonte de verdade e apenas referenciá-lo:

```markdown
<!-- No CLAUDE.md -->
Leia e aplique todas as instruções contidas em `.agents/AGENTS.md`.
Leia e aplique todas as skills em `.agents/skills/`.
```

> O Claude Code suporta referências a outros arquivos via `@AGENTS.md` no prompt.

---

## Cursor

O Cursor usa arquivos `.mdc` (Markdown Cursor) dentro de `.cursor/rules/`.

### Mapeamento de Arquivos

| Original (Codex) | Destino (Cursor) | Notas |
|:----|:----|:----|
| `.agents/AGENTS.md` | `.cursor/rules/core-harness.mdc` | Regra "always apply" |
| `.agents/napkin.md` | `.cursor/rules/napkin-runbook.mdc` | Regra "always apply" |
| `.agents/skills/playwright/SKILL.md` | `.cursor/rules/skill-playwright.mdc` | Ativar por palavras-chave |
| `.agents/skills/firecrawl/SKILL.md` | `.cursor/rules/skill-firecrawl.mdc` | Ativar por palavras-chave |
| `.agents/skills/n8n-builder/SKILL.md` | `.cursor/rules/skill-n8n.mdc` | Ativar por palavras-chave |
| Outros skills | `.cursor/rules/skill-<nome>.mdc` | Mesmo padrão |

### Formato .mdc

Cada arquivo `.mdc` precisa de frontmatter YAML:

```markdown
---
description: "Instruções globais do agente — modo GSD, guardrails, preferências"
globs: []
alwaysApply: true
---

# Conteúdo do AGENTS.md aqui...
```

Para skills que devem ser ativadas sob demanda:

```markdown
---
description: "Skill Playwright — automação de browser via CDP, reuso de sessão Chrome"
globs: []
alwaysApply: false
---

# Conteúdo do SKILL.md do playwright aqui...
```

### Instruções de Adaptação

```powershell
# 1. Criar diretório de rules
New-Item -ItemType Directory -Path ".cursor\rules" -Force

# 2. Converter AGENTS.md para .mdc (adicionar frontmatter)
$frontmatter = @"
---
description: "Instruções globais do agente — modo GSD, guardrails, preferências do usuário"
globs: []
alwaysApply: true
---

"@
$content = Get-Content ".agents\AGENTS.md" -Raw
$frontmatter + $content | Out-File -Encoding utf8 ".cursor\rules\core-harness.mdc"

# 3. Converter cada skill para .mdc
$skills = @("playwright", "firecrawl", "napkin", "n8n-builder", "interface-design", "skill-creator")
foreach ($skill in $skills) {
    $skillPath = ".agents\skills\$skill\SKILL.md"
    if (Test-Path $skillPath) {
        $skillContent = Get-Content $skillPath -Raw
        # Remover frontmatter YAML existente e adicionar frontmatter Cursor
        $skillContent = $skillContent -replace "(?s)^---.*?---\s*", ""
        $cursorFrontmatter = @"
---
description: "Skill $skill — carregada sob demanda quando relevante"
globs: []
alwaysApply: false
---

"@
        $cursorFrontmatter + $skillContent | Out-File -Encoding utf8 ".cursor\rules\skill-$skill.mdc"
    }
}

Write-Host "✅ Arquivos .mdc criados em .cursor\rules\"
```

---

## Windsurf

O Windsurf suporta nativamente `AGENTS.md` na raiz do projeto e usa `.windsurf/rules/` para regras adicionais.

### Mapeamento de Arquivos

| Original (Codex) | Destino (Windsurf) | Notas |
|:----|:----|:----|
| `.agents/AGENTS.md` | `AGENTS.md` (raiz) | Windsurf lê nativamente |
| `.agents/napkin.md` | `.windsurf/rules/napkin.md` | Ou manter em `.agents/` |
| `.agents/skills/*` | `.windsurf/rules/` ou manter `.agents/skills/` | Referenciar no AGENTS.md |

### Instruções de Adaptação

```powershell
# 1. Copiar AGENTS.md para a raiz
Copy-Item ".agents\AGENTS.md" -Destination "AGENTS.md" -Force

# 2. Criar diretório de rules (opcional, para organização)
New-Item -ItemType Directory -Path ".windsurf\rules" -Force

# 3. Copiar skills como rules
Copy-Item -Recurse -Force ".agents\skills\*" ".windsurf\rules\"

# 4. Copiar napkin
Copy-Item ".agents\napkin.md" -Destination ".windsurf\rules\napkin.md" -Force
```

### Notas sobre Windsurf

- O Windsurf **não** usa frontmatter especial — Markdown puro funciona
- O `AGENTS.md` na raiz é automaticamente detectado e aplicado a todo o projeto
- Regras em subdiretórios são aplicadas apenas quando o agente trabalha naquele diretório
- Para regras globais (todos os projetos), coloque em `~\.windsurf\rules\`

---

## Tabela Resumo

| Aspecto | Codex | Claude Code | Cursor | Windsurf |
|:--------|:------|:------------|:-------|:---------|
| Arquivo principal | `.agents/AGENTS.md` | `CLAUDE.md` | `.cursor/rules/*.mdc` | `AGENTS.md` (raiz) |
| Skills | `.agents/skills/` | `.claude/skills/` | `.cursor/rules/skill-*.mdc` | `.windsurf/rules/` |
| Memória (napkin) | `.agents/napkin.md` | `.claude/napkin.md` | `.cursor/rules/napkin.mdc` | `.windsurf/rules/napkin.md` |
| Frontmatter | YAML (skills) | Nenhum | YAML obrigatório (`.mdc`) | Nenhum |
| Escopo | Diretório home | Raiz do projeto | Raiz do projeto | Raiz do projeto |

---

## Para Agentes: Instruções de Auto-Adaptação

Se você é um agente de IA lendo este documento pela primeira vez:

1. **Detecte sua ferramenta** usando o bloco de detecção automática acima
2. **Execute os comandos de adaptação** da seção correspondente
3. **Verifique** que os arquivos foram criados corretamente
4. **Leia o `SETUP.md`** para continuar a configuração do ambiente
5. **Informe o usuário** sobre o que foi feito e quais passos manuais restam (login nas plataformas, QR Code, etc.)
