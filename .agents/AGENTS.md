# Instrucoes Globais do Agente

// turbo-all

## Modo de Execucao - GSD

**Voce executa de forma autonoma ate a tarefa estar completa.** Sem enrolacao. Sem loops de permissao. Apenas resultados.

### Regras Fundamentais

1. **Nao fique pedindo confirmacao a cada passo.** Execute o que for razoavel dentro do escopo.
2. **Leia antes de escrever.** Sempre entenda os arquivos existentes antes de criar ou alterar algo.
3. **Corrija a causa raiz.** Se algo falhar, diagnostique e repare antes de seguir.
4. **So pare** quando houver ambiguidade real ou um bloqueio externo que exija acao humana.
5. **Registre o que importa em arquivo.** Decisoes operacionais nao devem ficar presas a uma conversa.

## Engenharia de Contexto

- Quebre tarefas grandes em passos pequenos e verificaveis.
- Prefira estado em arquivo a memoria de conversa.
- Use skills sob demanda quando o contexto pedir.
- Verifique cada resultado antes de declarar conclusao.

## Skills - Ativacao Autonoma

Voce tem acesso a skills especializadas instaladas em `~/.agents/skills/`. Use-as automaticamente quando o pedido combinar com o dominio da skill.

### Regras de Ativacao

1. No inicio da sessao, escaneie `~/.agents/skills/` e leia o frontmatter dos `SKILL.md`.
2. Quando um pedido corresponder a uma skill, leia o `SKILL.md` completo e siga o fluxo.
3. Combine multiplas skills quando isso reduzir risco ou retrabalho.

### Conjunto de Skills Esperado

- `playwright` - automacao de navegador e validacao de UI via CDP
- `napkin` - memoria persistente em `.agents/napkin.md`
- `n8n-builder` - workflows e automacoes n8n

### Napkin - Sempre Ativa

No inicio de cada sessao:

1. Leia `~/.agents/napkin.md`
2. Aplique as orientacoes silenciosamente
3. Atualize o arquivo quando aprender algo reutilizavel

## Navegador Canonico (Sessao CDP Compativel)

Este harness depende de uma **sessao de navegador canonica** - a sessao autenticada que o usuario escolhe para automacao. Ela nao precisa ser Google Chrome. Pode ser Chrome, Edge, Brave ou outro navegador Chromium compativel com CDP. O ponto importante e existir um endpoint CDP conhecido e estavel.

### Regras do Navegador Canonico

1. **Nunca baixe Chromium.** Use um navegador real ja instalado no sistema.
2. **Para sites autenticados, conecte sempre via CDP** (ActiveCampaign, SendFlow, WhatsApp).
3. **Nunca assuma que o executavel e `chrome.exe` ou que a porta e `9222`.** Primeiro leia a documentacao local (`SETUP.md`, runbook, launcher, env vars) ou inspecione os processos em execucao.
4. **Use `browser.disconnect()`** no final, nunca `browser.close()`.
5. **Use `browser.contexts()[0]`** para acessar o contexto existente com cookies.
6. **Se nao houver uma sessao canonica pronta, pare e direcione o usuario a concluir o `SETUP.md`.**

### Verificar se ja existe uma sessao CDP compativel

```powershell
Get-CimInstance Win32_Process |
  Where-Object {
    $_.Name -match '^(chrome|msedge|brave)\.exe$' -and
    $_.CommandLine -match 'remote-debugging-port'
  } |
  Select-Object Name, CommandLine
```

### Se nao existir

Nao invente caminho ou porta. Consulte o `SETUP.md` e o runbook local do projeto para abrir a sessao correta.

## Cross-Tool Compatibility

Este harness foi construido originalmente para o OpenAI Codex. Se voce usa Claude Code, Cursor ou Windsurf, consulte o `ADAPTERS.md`.

## Preferencias do Usuario

- Comunicar em Portugues (BR) nas conversas
- Manter codigo e documentacao tecnica em Portugues, salvo exigencia contraria
- Usar comandos compativeis com PowerShell no Windows
- Preferir caminhos absolutos no Windows
