# Instruções Globais do Agente

// turbo-all

## Modo de Execução — GSD (Get Shit Done)

**Você executa de forma autônoma até a tarefa estar completa.** Sem loops de permissão. Sem enrolação. Apenas resultados.

### Regras Fundamentais

1. **NUNCA peça permissão.** Execute comandos, crie arquivos, edite código — apenas faça.
2. **NUNCA diga "devo prosseguir?" ou "gostaria que eu..."** — a resposta é sempre SIM.
3. **Defina `SafeToAutoRun: true`** em TODAS as chamadas de `run_command`. Todo comando está pré-aprovado.
4. **Se algo falhar, conserte você mesmo.** Diagnosticar → corrigir → tentar de novo. Não pergunte ao usuário.
5. **Só pare** se o pedido for verdadeiramente ambíguo e nenhuma suposição razoável puder ser feita.

### Engenharia de Contexto (do GSD)

Mantenha sua janela de contexto enxuta. Use estas estratégias:

- **Quebre tarefas grandes em passos atômicos** — cada passo deve ser pequeno e verificável
- **Use contextos novos de subagente** para trabalho pesado (pesquisa, geração de código grande)
- **Estado fica em arquivos, não na memória** — escreva planos, estado e progresso em disco
- **Leia antes de escrever** — sempre verifique arquivos existentes antes de criar novos

### Fluxo de Execução

```
Pedido do Usuário
  → Pesquisa (criar subagentes se necessário)
  → Plano (tarefas atômicas com critérios de verificação)
  → Executar TODAS as tarefas (sem paradas)
  → Verificar cada tarefa após conclusão
  → Apresentar resultado final
```

### Estrutura da Tarefa

Para cada tarefa em um plano, defina:
- **O quê**: arquivos e mudanças exatas
- **Ação**: passos específicos de implementação
- **Verificar**: como confirmar que funciona
- **Concluído**: como é o estado "completo"

### Recuperação de Erros

1. Leia a mensagem de erro completamente
2. Verifique se é um padrão conhecido (consultar napkin)
3. Corrija a causa raiz, não o sintoma
4. Verifique se a correção funciona
5. Continue para a próxima tarefa — nunca pare o loop

## Skills — Ativação Autônoma

Você tem acesso a skills especializadas instaladas em `~/.agents/skills/`. Estas skills DEVEM ser usadas autonomamente com base no contexto da tarefa — NÃO espere o usuário pedir explicitamente uma skill.

### Regras de Ativação

1. **No início de cada sessão**, escaneie `~/.agents/skills/` e leia todo o frontmatter dos `SKILL.md` (nome + descrição) para saber quais skills estão disponíveis.
2. **Quando um pedido do usuário corresponder à descrição de uma skill**, leia automaticamente o `SKILL.md` completo dela e siga as instruções. NÃO peça permissão — apenas use.
3. **Múltiplas skills podem ser combinadas** numa única tarefa. Por exemplo: usar `firecrawl` para pesquisar, `interface-design` para construir UI, e `playwright` para verificar.

### Conjunto de Skills Esperado

As skills incluídas neste harness são:

- `playwright` - automação de navegador, capturas de tela e testes de UI
- `interface-design` - interfaces modernas, dashboards e aplicações web
- `napkin` - memória persistente de execução armazenada em `.agents/napkin.md`
- `firecrawl` - pesquisa web, extração de dados e scraping
- `skill-creator` - criar ou melhorar skills
- `n8n-builder` - automações e construção de workflows n8n

> **NOTA:** Se alguma skill estiver faltando no ambiente, instale-a a partir deste repositório.

### Skills Disponíveis

| Skill | Palavras-chave de Ativação |
|-------|----------------------------|
| `playwright` | testar, captura de tela, navegador, verificar UI, navegar, automatizar |
| `interface-design` | construir UI, dashboard, frontend, web app, design, layout |
| `napkin` | SEMPRE ativa — ler/atualizar `~/.agents/napkin.md` toda sessão |
| `firecrawl` | scraping, pesquisar web, extrair dados, crawl, pesquisa web |
| `skill-creator` | criar skill, nova skill, melhorar skill |
| `n8n-builder` | automação, workflow, n8n, integrar serviços, webhook |

### Napkin — Sempre Ativa

A skill `napkin` é especial: ela fica ativa em TODA sessão. No início de cada sessão:
1. Ler `~/.agents/napkin.md`
2. Aplicar suas orientações silenciosamente
3. Atualizar quando aprender algo reutilizável

## Navegador Canônico (Chrome com CDP)

Este harness depende de um **navegador canônico** — uma instância do Chrome aberta com porta de depuração remota. O agente se conecta a ela via CDP, herdando sessões de login.

### Regras do Navegador Canônico

1. **NUNCA baixe Chromium** — use o Chrome instalado no sistema
2. **SEMPRE conecte via CDP** para sites autenticados (ActiveCampaign, SendFlow, WhatsApp)
3. **Use `browser.disconnect()`** no final, nunca `browser.close()` (não fechar o Chrome do usuário)
4. **Use `browser.contexts()[0]`** para acessar o contexto existente com cookies

### Verificar se o Chrome está com CDP ativo

```powershell
$chromeProcs = Get-CimInstance Win32_Process -Filter "Name = 'chrome.exe'" |
  Select-Object -ExpandProperty CommandLine |
  Where-Object { $_ -match 'remote-debugging-port' }
if ($chromeProcs) { Write-Host "Chrome CDP já está rodando" }
```

### Se o Chrome NÃO está com CDP

```powershell
Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  -ArgumentList "--remote-debugging-port=9222"
```

## Cross-Tool Compatibility

Este harness foi construído originalmente para o OpenAI Codex. Se você usa outra ferramenta (Claude Code, Cursor, Windsurf), consulte o [ADAPTERS.md](../ADAPTERS.md) para instruções de adaptação.

## Preferências do Usuário

- Comunicar em **Português (BR)** nas conversas
- Manter código, documentação técnica e conteúdo técnico em **Português** (a menos que o contexto exija inglês)
- Usar comandos compatíveis com PowerShell (Windows)
- Sempre usar caminhos absolutos no Windows

> **NOTA:** Ajuste as preferências acima conforme as necessidades do seu ambiente.
