# Setup de Primeira Execução

> Este guia é para a **primeira vez** que você roda o harness no seu computador. Após completar estes passos, o agente conseguirá operar de forma autônoma nas próximas sessões.

---

## Passo 1: Auditoria do Ambiente

Antes de instalar qualquer coisa, o agente deve verificar o que já existe no seu sistema.

### Checklist de Auditoria

O agente deve rodar estes comandos para mapear o estado atual:

```powershell
# 1. Verificar Node.js
node --version

# 2. Verificar se a pasta .agents já existe
Test-Path "$env:USERPROFILE\.agents"

# 3. Verificar se Chrome está instalado
Test-Path "C:\Program Files\Google\Chrome\Application\chrome.exe"

# 4. Verificar se playwright-core já está instalado em algum lugar
$pwDir = "$env:TEMP\pw-ac-ui"
Test-Path "$pwDir\node_modules\playwright-core"

# 5. Verificar se firecrawl-cli está disponível
Get-Command firecrawl-cli -ErrorAction SilentlyContinue

# 6. Verificar skills existentes
if (Test-Path "$env:USERPROFILE\.agents\skills") {
    Get-ChildItem "$env:USERPROFILE\.agents\skills" -Directory | Select-Object Name
}
```

> **Resultado esperado:** O agente saberá exatamente o que falta instalar e o que já existe. Ele deve preencher o que falta sem sobrescrever o que já funciona.

---

## Passo 2: Instalar o Harness

### 2.1. Copiar arquivos do harness

Se você clonou o repositório, copie a estrutura `.agents/` para o diretório do usuário:

```powershell
# Windows
Copy-Item -Recurse -Force ".\marketing-ops-harness\.agents\" "$env:USERPROFILE\.agents\"
```

```bash
# macOS/Linux
cp -r ./marketing-ops-harness/.agents/ ~/.agents/
```

> **IMPORTANTE:** Se você já possui uma pasta `.agents/` com skills customizadas, o harness NÃO deve sobrescrever suas skills existentes. Copie apenas as que estão faltando.

### 2.2. Instalar Playwright workspace

O harness usa `playwright-core` (NÃO `playwright`) para evitar download de ~400 MB do Chromium.

```powershell
# Criar workspace temporário para Playwright
$pwDir = "$env:TEMP\pw-ac-ui"
if (-not (Test-Path $pwDir)) {
    New-Item -ItemType Directory -Path $pwDir -Force
    Push-Location $pwDir
    npm init -y
    npm install playwright-core
    Pop-Location
    Write-Host "✅ playwright-core instalado em $pwDir"
} else {
    Write-Host "✅ playwright-core já existe em $pwDir"
}
```

> ⚠️ **NUNCA execute `npx playwright install`** — isso baixa o Chromium. Sempre use `playwright-core` + o Chrome que já está instalado no computador.

### 2.3. Instalar Firecrawl CLI (opcional)

Se você pretende usar a skill de pesquisa web:

```powershell
npm install -g firecrawl-cli
npx firecrawl-cli auth   # Autenticação via browser
```

---

## Passo 3: Configurar o Navegador Canônico

O **Navegador Canônico** é uma instância do Chrome aberta com porta de depuração remota. O agente se conecta a ela via CDP (Chrome DevTools Protocol), herdando todas as suas sessões de login.

### 3.1. Abrir Chrome com CDP

```powershell
# Feche TODAS as instâncias do Chrome primeiro
Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Abra Chrome com porta de depuração
Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" `
    -ArgumentList "--remote-debugging-port=9222"
```

> **ATENÇÃO:** O Chrome precisa ser a ÚNICA instância rodando. Se houver outro Chrome aberto sem a flag `--remote-debugging-port`, o CDP não funcionará.

### 3.2. Verificar que o CDP está ativo

```powershell
# Verificar se Chrome está escutando na porta 9222
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:9222/json/version" -UseBasicParsing
    Write-Host "✅ Chrome CDP ativo:" ($response.Content | ConvertFrom-Json).Browser
} catch {
    Write-Host "❌ Chrome CDP não está respondendo. Verifique se o Chrome foi aberto com --remote-debugging-port=9222"
}
```

---

## Passo 4: Login nas Plataformas (Manual, Uma Única Vez)

Agora você vai fazer login manualmente nas plataformas que o agente vai operar. **Isso precisa ser feito apenas uma vez** — depois disso, o agente reusa a sessão via CDP.

### 4.1. ActiveCampaign

1. No Chrome (que está com CDP ativo), navegue até a URL da sua conta ActiveCampaign:
   ```
   https://SUA_CONTA.activehosted.com
   ```
2. Faça login com suas credenciais
3. Confirme que está logado e o dashboard aparece
4. **NÃO feche esta aba** — o agente vai acessá-la depois

### 4.2. SendFlow

1. No mesmo Chrome, abra uma nova aba e navegue até:
   ```
   https://app.sendflow.pro
   ```
2. Faça login com suas credenciais
3. Confirme que o dashboard do SendFlow aparece
4. **NÃO feche esta aba**

### 4.3. WhatsApp Web (se aplicável)

Se a sua operação inclui disparo de mensagens via WhatsApp de teste:

1. No mesmo Chrome, abra uma nova aba e navegue até:
   ```
   https://web.whatsapp.com
   ```
2. **Escaneie o QR Code** com o celular do número de disparo de testes
3. Confirme que as conversas aparecem
4. **NÃO feche esta aba**

> **NOTA:** O WhatsApp Web pode exigir re-escaneamento do QR Code periodicamente. Se o agente detectar que a sessão expirou, ele vai pedir que você escaneie novamente.

---

## Passo 5: Teste de Validação

Rode o script abaixo para confirmar que tudo está funcionando:

```powershell
# Criar script de teste temporário
$testScript = @"
const { chromium } = require('$($env:TEMP -replace '\\','/')/pw-ac-ui/node_modules/playwright-core');

(async () => {
    console.log('🔌 Conectando ao Chrome via CDP...');
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const context = browser.contexts()[0];
    const pages = context.pages();

    console.log('📄 Abas abertas:', pages.length);
    for (const page of pages) {
        console.log('  -', await page.title(), '|', page.url());
    }

    // Verificar ActiveCampaign
    const acPage = pages.find(p => p.url().includes('activehosted.com'));
    if (acPage) {
        console.log('✅ ActiveCampaign: sessão ativa');
    } else {
        console.log('⚠️  ActiveCampaign: não encontrado nas abas abertas');
    }

    // Verificar SendFlow
    const sfPage = pages.find(p => p.url().includes('sendflow'));
    if (sfPage) {
        console.log('✅ SendFlow: sessão ativa');
    } else {
        console.log('⚠️  SendFlow: não encontrado nas abas abertas');
    }

    // Verificar WhatsApp
    const waPage = pages.find(p => p.url().includes('web.whatsapp.com'));
    if (waPage) {
        console.log('✅ WhatsApp Web: sessão ativa');
    } else {
        console.log('ℹ️  WhatsApp Web: não encontrado (opcional)');
    }

    browser.disconnect();
    console.log('\\n🎉 Validação completa! O harness está pronto para uso.');
})();
"@

$testScript | Out-File -Encoding utf8 "$env:TEMP\harness-test.js"
node "$env:TEMP\harness-test.js"
```

### Resultado Esperado

```
🔌 Conectando ao Chrome via CDP...
📄 Abas abertas: 3
  - ActiveCampaign | https://suaconta.activehosted.com/...
  - SendFlow | https://app.sendflow.pro/...
  - WhatsApp Web | https://web.whatsapp.com/...
✅ ActiveCampaign: sessão ativa
✅ SendFlow: sessão ativa
✅ WhatsApp Web: sessão ativa

🎉 Validação completa! O harness está pronto para uso.
```

---

## Próximos Passos

Após completar o setup:

1. ✅ **Leia os workflows** em [workflows/](workflows/) para entender como usar o agente
2. ✅ **Se não usa Codex**, leia o [ADAPTERS.md](ADAPTERS.md) para adaptar os arquivos à sua ferramenta
3. ✅ **Comece com uma tarefa simples** — peça ao agente para listar suas campanhas no ActiveCampaign
4. ✅ **O agente aprende** — conforme você trabalha, ele atualiza o `napkin.md` com aprendizados para sessões futuras

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Chrome não conecta no CDP | Feche TODAS as instâncias do Chrome e reabra com `--remote-debugging-port=9222` |
| `playwright` tentou baixar Chromium | Você instalou `playwright` em vez de `playwright-core`. Desinstale e reinstale: `npm uninstall playwright && npm install playwright-core` |
| Sessão do ActiveCampaign expirou | Abra o Chrome canônico e faça login novamente. O agente herdará a nova sessão |
| WhatsApp pediu QR Code novamente | Normal — escaneie novamente no Chrome canônico |
| Agente não encontra as skills | Verifique se `.agents/skills/` está no diretório home do usuário (`$env:USERPROFILE\.agents\skills\`) |
