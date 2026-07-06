# Запускает Warsaw Site Parser целиком:
# 1. Backend (npm run dev) на localhost:4317
# 2. Публичный туннель cloudflared
# 3. Записывает адрес туннеля в public/tunnel.json и пушит его на GitHub Pages
# После этого работнику достаточно открыть обычную ссылку на GitHub Pages -
# страница сама подхватит свежий адрес backend из tunnel.json.

$ErrorActionPreference = 'Continue'
$proj = Split-Path -Parent $PSScriptRoot
Set-Location $proj

Write-Host '=== Warsaw Site Parser: запуск ===' -ForegroundColor Cyan

# --- 1. Backend ---
$backendUp = $false
try {
  Invoke-WebRequest -Uri 'http://localhost:4317/api/health' -UseBasicParsing -TimeoutSec 3 | Out-Null
  $backendUp = $true
  Write-Host '[1/4] Backend уже запущен (localhost:4317).' -ForegroundColor Green
} catch {}

if (-not $backendUp) {
  Write-Host '[1/4] Запускаю backend (npm run dev)...' -ForegroundColor Yellow
  Start-Process cmd -ArgumentList '/k', 'npm run dev' -WorkingDirectory $proj
  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 2
    try {
      Invoke-WebRequest -Uri 'http://localhost:4317/api/health' -UseBasicParsing -TimeoutSec 3 | Out-Null
      $backendUp = $true
      break
    } catch {}
  }
  if (-not $backendUp) {
    Write-Host 'ОШИБКА: backend не поднялся за 40 секунд. Проверьте окно npm run dev.' -ForegroundColor Red
    exit 1
  }
  Write-Host '    Backend запущен.' -ForegroundColor Green
}

# --- 2. Туннель cloudflared ---
Write-Host '[2/4] Перезапускаю туннель cloudflared...' -ForegroundColor Yellow
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
$tunnelLog = Join-Path $proj 'tunnel.log'
Remove-Item $tunnelLog -ErrorAction SilentlyContinue
# --config NUL: игнорируем C:\Users\...\.cloudflared\config.yml от других проектов,
# иначе quick tunnel отдаёт 404 из-за чужих ingress-правил.
Start-Process cloudflared -ArgumentList '--config', 'NUL', 'tunnel', '--url', 'http://localhost:4317' -WindowStyle Hidden -RedirectStandardError $tunnelLog

$tunnelUrl = $null
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 2
  $m = Select-String -Path $tunnelLog -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($m) { $tunnelUrl = $m.Matches[0].Value; break }
}
if (-not $tunnelUrl) {
  Write-Host 'ОШИБКА: не удалось получить адрес туннеля. Смотрите tunnel.log.' -ForegroundColor Red
  exit 1
}
Write-Host "    Туннель: $tunnelUrl" -ForegroundColor Green

# --- 3. Ждём, пока туннель начнёт отвечать ---
Write-Host '[3/4] Проверяю доступность туннеля...' -ForegroundColor Yellow
$tunnelOk = $false
for ($i = 0; $i -lt 15; $i++) {
  Start-Sleep -Seconds 2
  try {
    $r = Invoke-WebRequest -Uri "$tunnelUrl/api/health" -UseBasicParsing -TimeoutSec 10
    if ($r.StatusCode -eq 200) { $tunnelOk = $true; break }
  } catch {}
}
if ($tunnelOk) {
  Write-Host '    Туннель отвечает (200 OK).' -ForegroundColor Green
} else {
  Write-Host '    Внимание: туннель пока не отвечает, но обычно поднимается в течение минуты.' -ForegroundColor Yellow
}

# --- 4. Публикуем адрес туннеля на GitHub Pages ---
Write-Host '[4/4] Публикую адрес туннеля на GitHub Pages...' -ForegroundColor Yellow
$tunnelJson = Join-Path $proj 'public\tunnel.json'
Set-Content -Path $tunnelJson -Value ('{"api":"' + $tunnelUrl + '","updated":"' + (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ') + '"}') -Encoding ASCII

git add public/tunnel.json 2>&1 | Out-Null
git commit -m "update tunnel url" 2>&1 | Out-Null
git push 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
  Write-Host '    tunnel.json опубликован на GitHub.' -ForegroundColor Green
} else {
  Write-Host '    Внимание: git push не удался. Проверьте доступ к GitHub (git push вручную).' -ForegroundColor Yellow
}

Write-Host ''
Write-Host '=== ГОТОВО ===' -ForegroundColor Cyan
Write-Host 'Постоянная ссылка для работника (всегда одна и та же):' -ForegroundColor White
Write-Host '  https://averysultan3-creator.github.io/parser/public/index.html' -ForegroundColor Green
Write-Host ''
Write-Host 'Запасная прямая ссылка (если Pages ещё кеширует старый tunnel.json):' -ForegroundColor White
Write-Host "  https://averysultan3-creator.github.io/parser/public/index.html?api=$tunnelUrl" -ForegroundColor Green
Write-Host ''
Write-Host 'Не закрывайте окно npm run dev и не выключайте компьютер, пока работник пользуется парсером.' -ForegroundColor Yellow
