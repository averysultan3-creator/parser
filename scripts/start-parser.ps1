$ErrorActionPreference = 'Continue'
$proj = Split-Path -Parent $PSScriptRoot
Set-Location $proj

function Normalize-Url([string]$value) {
  if ([string]::IsNullOrWhiteSpace($value)) { return $null }
  $cleaned = $value.Trim().TrimEnd('/')
  if ($cleaned -notmatch '^https?://') {
    $cleaned = "https://$cleaned"
  }
  return $cleaned
}

function Get-TunnelHeaders([string]$url) {
  if ($url -match 'ngrok') {
    return @{ 'ngrok-skip-browser-warning' = '1' }
  }
  return @{}
}

function Test-BackendHealth([string]$baseUrl, [int]$timeoutSec = 10) {
  $cleaned = Normalize-Url $baseUrl
  if (-not $cleaned) { return $false }
  try {
    $response = Invoke-WebRequest -Uri "$cleaned/api/health" -UseBasicParsing -TimeoutSec $timeoutSec -Headers (Get-TunnelHeaders $cleaned)
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

function Read-CurrentTunnelUrl() {
  $path = Join-Path $proj 'public\tunnel.json'
  if (-not (Test-Path $path)) { return $null }
  try {
    $json = Get-Content -Raw $path | ConvertFrom-Json
    if ($json.api) { return Normalize-Url $json.api }
    if ($json.url) { return Normalize-Url $json.url }
  } catch {}
  return $null
}

function Start-BackendIfNeeded() {
  if (Test-BackendHealth 'http://localhost:4317' 3) {
    Write-Host '[1/4] Backend already running on localhost:4317.' -ForegroundColor Green
    return
  }

  Write-Host '[1/4] Starting backend: npm run dev' -ForegroundColor Yellow
  Start-Process cmd -ArgumentList '/k', 'npm run dev' -WorkingDirectory $proj

  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 2
    if (Test-BackendHealth 'http://localhost:4317' 3) {
      Write-Host '    Backend is ready.' -ForegroundColor Green
      return
    }
  }

  Write-Host 'ERROR: backend did not become healthy on localhost:4317 within 40 seconds.' -ForegroundColor Red
  exit 1
}

function Start-CloudflaredQuickTunnel() {
  if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
    return $null
  }

  Write-Host '[2/4] Starting cloudflared quick tunnel...' -ForegroundColor Yellow
  Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
  Start-Sleep -Seconds 2

  $logPath = Join-Path $proj 'tunnel.log'
  Remove-Item $logPath -ErrorAction SilentlyContinue

  Start-Process cloudflared -ArgumentList @('--config', 'NUL', 'tunnel', '--url', 'http://localhost:4317') -WindowStyle Hidden -RedirectStandardError $logPath

  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 2
    $match = Select-String -Path $logPath -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $match) { continue }
    $url = $match.Matches[0].Value
    if (Test-BackendHealth $url 10) {
      Write-Host "    cloudflared OK: $url" -ForegroundColor Green
      return $url
    }
  }

  Write-Host '    cloudflared tunnel did not become healthy.' -ForegroundColor Yellow
  return $null
}

function Start-NgrokTunnel([string]$preferredUrl) {
  if (-not (Get-Command ngrok -ErrorAction SilentlyContinue)) {
    return $null
  }

  $preferredUrl = Normalize-Url $preferredUrl
  if ($preferredUrl) {
    Write-Host "[2/4] Starting ngrok tunnel for $preferredUrl..." -ForegroundColor Yellow
  } else {
    Write-Host '[2/4] Starting ngrok tunnel...' -ForegroundColor Yellow
  }

  Get-Process ngrok -ErrorAction SilentlyContinue | Stop-Process -Force
  Start-Sleep -Seconds 2

  $logPath = Join-Path $proj 'ngrok.log'
  $errPath = Join-Path $proj 'ngrok.err.log'
  Remove-Item $logPath, $errPath -ErrorAction SilentlyContinue

  $args = @('http', 'http://localhost:4317', '--log', 'stdout')
  if ($preferredUrl) {
    $args += @('--url', $preferredUrl)
  }
  Start-Process ngrok -ArgumentList $args -WindowStyle Hidden -RedirectStandardOutput $logPath -RedirectStandardError $errPath

  if ($preferredUrl) {
    for ($i = 0; $i -lt 20; $i++) {
      Start-Sleep -Seconds 2
      if (Test-BackendHealth $preferredUrl 10) {
        Write-Host "    ngrok OK: $preferredUrl" -ForegroundColor Green
        return $preferredUrl
      }
    }
  }

  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 2
    $match = Select-String -Path $logPath -Pattern 'https://[a-z0-9-]+\.ngrok(?:-[a-z]+)?\.(?:dev|app)' -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $match) { continue }
    $url = $match.Matches[0].Value
    if (Test-BackendHealth $url 10) {
      Write-Host "    ngrok OK: $url" -ForegroundColor Green
      return $url
    }
  }

  if ($preferredUrl -and (Test-BackendHealth $preferredUrl 10)) {
    Write-Host "    Reusing already live ngrok endpoint: $preferredUrl" -ForegroundColor Green
    return $preferredUrl
  }

  Write-Host '    ngrok tunnel did not become healthy.' -ForegroundColor Yellow
  return $null
}

function Publish-TunnelUrl([string]$url) {
  $tunnelJson = Join-Path $proj 'public\tunnel.json'
  $payload = '{"api":"' + $url + '","updated":"' + (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ') + '"}'
  Set-Content -Path $tunnelJson -Value $payload -Encoding ASCII

  git add public/tunnel.json | Out-Null
  git diff --cached --quiet
  if ($LASTEXITCODE -ne 0) {
    git commit -m "update tunnel url" | Out-Null
    git push | Out-Null
    if ($LASTEXITCODE -eq 0) {
      Write-Host '    tunnel.json pushed to GitHub Pages.' -ForegroundColor Green
    } else {
      Write-Host '    Warning: git push failed. Push the latest commit manually.' -ForegroundColor Yellow
    }
  } else {
    Write-Host '    tunnel.json is unchanged; nothing to push.' -ForegroundColor Green
  }
}

Write-Host '=== Warsaw Site Parser: start ===' -ForegroundColor Cyan

Start-BackendIfNeeded

$tunnelUrl = $null
$preferredTunnelUrl = Read-CurrentTunnelUrl

if ($preferredTunnelUrl -and (Test-BackendHealth $preferredTunnelUrl 5)) {
  Write-Host "[2/4] Reusing live tunnel from public/tunnel.json: $preferredTunnelUrl" -ForegroundColor Green
  $tunnelUrl = $preferredTunnelUrl
}

if (-not $tunnelUrl -and $preferredTunnelUrl -and $preferredTunnelUrl -match 'ngrok') {
  $tunnelUrl = Start-NgrokTunnel $preferredTunnelUrl
}

if (-not $tunnelUrl) {
  $tunnelUrl = Start-CloudflaredQuickTunnel
}

if (-not $tunnelUrl) {
  $tunnelUrl = Start-NgrokTunnel $null
}

if (-not $tunnelUrl) {
  Write-Host 'ERROR: no healthy public tunnel is available. Check tunnel.log / ngrok.log.' -ForegroundColor Red
  exit 1
}

Write-Host "[3/4] Tunnel ready: $tunnelUrl" -ForegroundColor Green

Write-Host '[4/4] Publishing public tunnel URL...' -ForegroundColor Yellow
Publish-TunnelUrl $tunnelUrl

Write-Host ''
Write-Host '=== READY ===' -ForegroundColor Cyan
Write-Host 'Worker link:' -ForegroundColor White
Write-Host '  https://averysultan3-creator.github.io/parser/public/index.html' -ForegroundColor Green
Write-Host ''
Write-Host 'Immediate fallback link:' -ForegroundColor White
Write-Host "  https://averysultan3-creator.github.io/parser/public/index.html?api=$tunnelUrl" -ForegroundColor Green
Write-Host ''
Write-Host 'Keep the backend window and this computer online while the worker uses the parser.' -ForegroundColor Yellow
