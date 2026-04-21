# Setup de Primeira Execucao

> Este guia e para a **primeira vez** que voce roda o harness no seu computador. O objetivo e estabelecer um ambiente portavel: instalar o contexto do agente sem sobrescrever assets existentes, definir um navegador canonico reutilizavel e fazer o login manual inicial nas plataformas.

> **Importante:** ferramentas diferentes nao compartilham automaticamente historico de conversa nem memoria operacional. Se surgir uma decisao importante durante o setup, registre-a no repositorio.

---

## Passo 1: Auditoria do Ambiente

Antes de instalar qualquer coisa, o agente deve verificar o que ja existe no sistema.

### Checklist de Auditoria

```powershell
# 1. Verificar Node.js
node --version

# 2. Verificar diretorios ja existentes
Test-Path "$env:USERPROFILE\.agents"
Test-Path ".\.claude"
Test-Path ".\.cursor"
Test-Path ".\.windsurf"

# 3. Encontrar navegadores Chromium compativeis com CDP
$browserCandidates = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\BraveSoftware\Brave-Browser\Application\brave.exe",
  "${env:ProgramFiles(x86)}\BraveSoftware\Brave-Browser\Application\brave.exe"
)
$browserCandidates | Where-Object { Test-Path $_ }

# 4. Verificar se ja existe alguma sessao com remote debugging ativa
Get-CimInstance Win32_Process |
  Where-Object {
    $_.Name -match '^(chrome|msedge|brave)\.exe$' -and
    $_.CommandLine -match 'remote-debugging-port'
  } |
  Select-Object Name, CommandLine

# 5. Verificar se playwright-core ja existe
$pwDir = "$env:TEMP\pw-ac-ui"
Test-Path "$pwDir\node_modules\playwright-core"

# 6. Verificar skills existentes
if (Test-Path "$env:USERPROFILE\.agents\skills") {
  Get-ChildItem "$env:USERPROFILE\.agents\skills" -Directory | Select-Object Name
}
```

> **Resultado esperado:** o agente sabera o que falta instalar, qual navegador pode ser reaproveitado e se ja existe uma sessao CDP ativa.

---

## Passo 2: Instalar o Harness

### 2.1. Copiar `.agents/` sem sobrescrever o que ja existe

Se voce clonou o repositorio, use uma copia conservadora. O harness deve preencher lacunas, nao apagar customizacoes locais.

```powershell
$src = (Resolve-Path ".\marketing-ops-harness\.agents").Path
$dst = Join-Path $env:USERPROFILE ".agents"

New-Item -ItemType Directory -Path $dst -Force | Out-Null

Get-ChildItem $src -Recurse -File | ForEach-Object {
  $relative = $_.FullName.Substring($src.Length).TrimStart('\')
  $target = Join-Path $dst $relative
  $targetDir = Split-Path $target -Parent

  New-Item -ItemType Directory -Path $targetDir -Force | Out-Null

  if (-not (Test-Path $target)) {
    Copy-Item $_.FullName -Destination $target
  }
}
```

```bash
rsync -a --ignore-existing ./marketing-ops-harness/.agents/ ~/.agents/
```

> **Regra:** se voce ja possui skills ou regras locais, preserve-as. Revise diferencas manualmente antes de substituir qualquer arquivo existente.

### 2.2. Instalar o workspace do Playwright

O harness usa `playwright-core` para evitar download automatico de navegadores.

```powershell
$pwDir = "$env:TEMP\pw-ac-ui"
if (-not (Test-Path $pwDir)) {
  New-Item -ItemType Directory -Path $pwDir -Force | Out-Null
  Push-Location $pwDir
  npm init -y
  npm install playwright-core
  Pop-Location
  Write-Host "playwright-core instalado em $pwDir"
} else {
  Write-Host "playwright-core ja existe em $pwDir"
}
```

> **Nunca execute `npx playwright install`.** Use `playwright-core` + um navegador Chromium real ja instalado na maquina.

## Passo 3: Definir o Navegador Canonico

O **Navegador Canonico** e a sessao autenticada que o agente vai reutilizar em ActiveCampaign, SendFlow e WhatsApp Web. Ele **nao precisa ser Google Chrome**. Pode ser:

- Google Chrome
- Microsoft Edge
- Brave
- outro navegador Chromium compativel com CDP

Se a pessoa usa Firefox ou Safari no dia a dia, tudo bem. Para estes workflows autenticados ela ainda precisara de um navegador Chromium separado.

### 3.1. Escolher o executavel e a porta

Use um executavel real instalado na maquina e uma porta estavel. `9222` e apenas um exemplo comum.

```powershell
$browserExe = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"  # ajuste para sua maquina
$cdpPort = 9222

Start-Process $browserExe -ArgumentList "--remote-debugging-port=$cdpPort"
```

> **Importante:** se o navegador escolhido ja estiver aberto sem a flag de debugging, feche-o e reabra a **mesma sessao/perfil** com `--remote-debugging-port`. O que importa nao e o nome do navegador, e sim a continuidade da sessao autenticada.

### 3.2. Verificar que o CDP esta ativo

```powershell
$cdpPort = 9222

try {
  $response = Invoke-WebRequest -Uri "http://127.0.0.1:$cdpPort/json/version" -UseBasicParsing
  Write-Host "Navegador CDP ativo:" ($response.Content | ConvertFrom-Json).Browser
} catch {
  Write-Host "O endpoint CDP nao esta respondendo. Verifique o executavel e a porta escolhidos."
}
```

### 3.3. Regra operacional

Depois que a sessao canonica estiver definida:

- use sempre a **mesma sessao**
- faca o login manual apenas uma vez
- deixe claro no seu runbook local qual executavel e qual porta foram escolhidos

---

## Passo 4: Login nas Plataformas (Manual, Uma Unica Vez)

Agora voce vai fazer login manualmente nas plataformas que o agente vai operar. Depois disso, o agente reaproveita a sessao via CDP.

### 4.1. ActiveCampaign

1. No navegador canonico, navegue ate a URL da sua conta ActiveCampaign:
   ```
   https://SUA_CONTA.activehosted.com
   ```
2. Faca login com suas credenciais.
3. Confirme que o dashboard aparece.
4. Nao feche a aba se voce pretende operar logo em seguida.

### 4.2. SendFlow

1. No mesmo navegador canonico, abra:
   ```
   https://app.sendflow.pro
   ```
2. Faca login.
3. Confirme que o dashboard aparece.

### 4.3. WhatsApp Web (se aplicavel)

1. No mesmo navegador canonico, abra:
   ```
   https://web.whatsapp.com
   ```
2. Escaneie o QR Code com o numero de disparo de testes.
3. Confirme que as conversas aparecem.

> **Nota:** o WhatsApp Web pode expirar periodicamente. Quando isso acontecer, reescaneie o QR Code na mesma sessao canonica.

---

## Passo 5: Teste de Validacao

Rode o script abaixo para confirmar que o agente consegue anexar na sessao CDP correta:

```powershell
$env:CDP_ENDPOINT = "http://127.0.0.1:9222"  # ajuste se voce escolheu outra porta

$testScript = @"
const { chromium } = require('$($env:TEMP -replace '\\','/')/pw-ac-ui/node_modules/playwright-core');

(async () => {
  const cdpEndpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9222';
  console.log('Conectando ao navegador via CDP:', cdpEndpoint);

  const browser = await chromium.connectOverCDP(cdpEndpoint);
  const context = browser.contexts()[0];
  const pages = context.pages();

  console.log('Abas abertas:', pages.length);
  for (const page of pages) {
    console.log('  -', await page.title(), '|', page.url());
  }

  const acPage = pages.find(p => p.url().includes('activehosted.com'));
  console.log(acPage ? 'ActiveCampaign: sessao ativa' : 'ActiveCampaign: nao encontrado');

  const sfPage = pages.find(p => p.url().includes('sendflow'));
  console.log(sfPage ? 'SendFlow: sessao ativa' : 'SendFlow: nao encontrado');

  const waPage = pages.find(p => p.url().includes('web.whatsapp.com'));
  console.log(waPage ? 'WhatsApp Web: sessao ativa' : 'WhatsApp Web: nao encontrado (opcional)');

  browser.disconnect();
  console.log('\nValidacao completa. O harness esta pronto para uso.');
})();
"@

$testScript | Out-File -Encoding utf8 "$env:TEMP\harness-test.js"
node "$env:TEMP\harness-test.js"
```

### Resultado Esperado

```text
Conectando ao navegador via CDP: http://127.0.0.1:9222
Abas abertas: 3
  - ActiveCampaign | https://suaconta.activehosted.com/...
  - SendFlow | https://app.sendflow.pro/...
  - WhatsApp Web | https://web.whatsapp.com/...
ActiveCampaign: sessao ativa
SendFlow: sessao ativa
WhatsApp Web: sessao ativa

Validacao completa. O harness esta pronto para uso.
```

---

## Proximos Passos

Apos completar o setup:

1. Leia os workflows em [workflows/](workflows/).
2. Se voce usa **Claude Code**, **Cursor** ou **Windsurf**, aplique o [ADAPTERS.md](ADAPTERS.md).
3. Comece com uma tarefa simples de leitura/validacao antes de operar uma campanha real.
4. Registre excecoes e aprendizados no `napkin.md`.

---

## Troubleshooting

| Problema | Solucao |
|----------|---------|
| O navegador nao conecta no CDP | Verifique o executavel escolhido, a porta e se a sessao foi reaberta com `--remote-debugging-port` |
| `playwright` tentou baixar Chromium | Voce instalou `playwright` em vez de `playwright-core`. Reinstale corretamente |
| Sessao do ActiveCampaign expirou | Refaca o login manual na sessao canonica; o agente herdara a nova sessao |
| WhatsApp pediu QR Code novamente | Reescaneie o QR Code na mesma sessao canonica |
| Agente nao encontra as skills | Verifique se `.agents/skills/` ou o diretorio equivalente da sua ferramenta foi criado corretamente |
