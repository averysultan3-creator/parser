param(
  [switch]$NoBrowser,
  [switch]$Restart,
  [switch]$Tunnel
)

$ErrorActionPreference = 'Stop'
$proj = Split-Path -Parent $PSScriptRoot
Set-Location $proj

$runtimeDir = Join-Path $proj '.runtime'
$null = New-Item -ItemType Directory -Path $runtimeDir -Force
$pidFile = Join-Path $runtimeDir 'parser.pid'
$cloudflaredPidFile = Join-Path $runtimeDir 'cloudflared.pid'
$outLog = Join-Path $runtimeDir 'parser.out.log'
$errLog = Join-Path $runtimeDir 'parser.err.log'
$lastLinkFile = Join-Path $runtimeDir 'last-link.txt'
$workerLinkFile = Join-Path $proj 'worker-link.txt'
$publicTunnelFile = Join-Path $proj 'public\tunnel.json'

function Get-ConfigValue([string]$Name, [string]$DefaultValue = '') {
  $envValue = [Environment]::GetEnvironmentVariable($Name)
  if (-not [string]::IsNullOrWhiteSpace($envValue)) {
    return $envValue.Trim()
  }

  $envPath = Join-Path $proj '.env'
  if (Test-Path $envPath) {
    $match = Select-String -Path $envPath -Pattern ("^\s*{0}\s*=\s*(.*)\s*$" -f [Regex]::Escape($Name)) | Select-Object -First 1
    if ($match) {
      $raw = $match.Matches[0].Groups[1].Value.Trim()
      if ($raw.StartsWith('"') -and $raw.EndsWith('"')) { $raw = $raw.Substring(1, $raw.Length - 2) }
      if ($raw.StartsWith("'") -and $raw.EndsWith("'")) { $raw = $raw.Substring(1, $raw.Length - 2) }
      if (-not [string]::IsNullOrWhiteSpace($raw)) {
        return $raw
      }
    }
  }

  return $DefaultValue
}

function Test-IsAdmin() {
  $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-BackendHealth([string]$BaseUrl, [int]$TimeoutSec = 4) {
  try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/health" -UseBasicParsing -TimeoutSec $TimeoutSec
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

function Test-HostResolves([string]$Url) {
  try {
    $uri = [Uri]$Url
    $addresses = [System.Net.Dns]::GetHostAddresses($uri.Host)
    return ($addresses | Measure-Object).Count -gt 0
  } catch {
    return $false
  }
}

function Normalize-Url([string]$Url) {
  if ([string]::IsNullOrWhiteSpace($Url)) { return '' }
  $cleaned = $Url.Trim().TrimEnd('/')
  if (-not $cleaned) { return '' }
  if (-not $cleaned.StartsWith('http://') -and -not $cleaned.StartsWith('https://')) {
    $cleaned = "https://$cleaned"
  }
  return $cleaned
}

function Get-LocalUrl() {
  return "http://localhost:$script:port"
}

function Get-LanUrls() {
  $addresses = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) |
    Where-Object {
      $_.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork -and
      -not $_.IPAddressToString.StartsWith('127.') -and
      -not $_.IPAddressToString.StartsWith('169.254.')
    } |
    Select-Object -ExpandProperty IPAddressToString -Unique

  return @($addresses | ForEach-Object { "http://${_}:$($script:port)" })
}

function Save-PreferredLink([string]$Url) {
  if ([string]::IsNullOrWhiteSpace($Url)) { return }
  Set-Content -Path $lastLinkFile -Value $Url -Encoding ASCII
  Set-Content -Path $workerLinkFile -Value $Url -Encoding ASCII
  if (Get-Command Set-Clipboard -ErrorAction SilentlyContinue) {
    try {
      Set-Clipboard -Value $Url
      Write-Host "Copied to clipboard: $Url" -ForegroundColor Green
    } catch {}
  }
}

function Write-PublicTunnelConfig([string]$Url) {
  $cleaned = Normalize-Url $Url
  if (-not $cleaned) { return }

  $payload = @{
    api = $cleaned
    url = $cleaned
  } | ConvertTo-Json -Compress

  Set-Content -Path $publicTunnelFile -Value $payload -Encoding UTF8
}

function Get-CloudflaredTunnelName() {
  foreach ($name in @(
    'CLOUDFLARE_TUNNEL_NAME',
    'CLOUDFLARED_TUNNEL_NAME',
    'TUNNEL_NAME'
  )) {
    $value = Get-ConfigValue $name
    if (-not [string]::IsNullOrWhiteSpace($value)) {
      return $value.Trim()
    }
  }

  return 'parser'
}

function Get-CloudflaredToken() {
  foreach ($name in @(
    'CLOUDFLARE_TUNNEL_TOKEN',
    'CLOUDFLARED_TUNNEL_TOKEN',
    'TUNNEL_TOKEN'
  )) {
    $value = Get-ConfigValue $name
    if (-not [string]::IsNullOrWhiteSpace($value)) {
      return $value.Trim()
    }
  }

  foreach ($name in @(
    'CLOUDFLARE_TUNNEL_TOKEN_FILE',
    'CLOUDFLARED_TUNNEL_TOKEN_FILE',
    'TUNNEL_TOKEN_FILE'
  )) {
    $tokenFile = Get-ConfigValue $name
    if (-not [string]::IsNullOrWhiteSpace($tokenFile) -and (Test-Path $tokenFile)) {
      $token = (Get-Content $tokenFile -Raw -ErrorAction SilentlyContinue).Trim()
      if (-not [string]::IsNullOrWhiteSpace($token)) {
        return $token
      }
    }
  }

  $runtimeTokenFile = Join-Path $runtimeDir 'cloudflared-token.txt'
  if (Test-Path $runtimeTokenFile) {
    $cachedToken = (Get-Content $runtimeTokenFile -Raw -ErrorAction SilentlyContinue).Trim()
    if (-not [string]::IsNullOrWhiteSpace($cachedToken)) {
      return $cachedToken
    }
  }

  $tunnelName = Get-CloudflaredTunnelName
  if (Get-Command cloudflared -ErrorAction SilentlyContinue) {
    try {
      $tokenOutput = & cloudflared tunnel token $tunnelName 2>$null
      $token = (($tokenOutput | Out-String).Trim() -split '\r?\n' | Where-Object { $_ -match '^eyJ[a-zA-Z0-9._-]+' } | Select-Object -First 1).Trim()
      if (-not [string]::IsNullOrWhiteSpace($token) -and $token.StartsWith('eyJ')) {
        Set-Content -Path $runtimeTokenFile -Value $token -Encoding ASCII
        return $token
      }
    } catch {}
  }

  return ''
}

function Get-ConfiguredPublicUrl() {
  foreach ($name in @(
    'PARSER_PUBLIC_URL',
    'CLOUDFLARE_TUNNEL_HOSTNAME',
    'TUNNEL_PUBLIC_URL',
    'PUBLIC_URL'
  )) {
    $value = Normalize-Url (Get-ConfigValue $name)
    if (-not [string]::IsNullOrWhiteSpace($value)) {
      return $value
    }
  }

  if (Test-Path $publicTunnelFile) {
    try {
      $json = Get-Content $publicTunnelFile -Raw -ErrorAction SilentlyContinue | ConvertFrom-Json
      $candidate = ''
      if ($json.api) {
        $candidate = $json.api
      } elseif ($json.url) {
        $candidate = $json.url
      }
      $value = Normalize-Url $candidate
      if (-not [string]::IsNullOrWhiteSpace($value)) {
        return $value
      }
    } catch {}
  }

  return ''
}

function Ensure-NodeEnvironment() {
  $script:nodeCommand = Get-Command node -ErrorAction SilentlyContinue
  if (-not $script:nodeCommand) {
    throw 'Node.js not found. Install Node.js 20+ and run start-parser.bat again.'
  }

  if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw 'npm not found. Install Node.js with npm and run start-parser.bat again.'
  }

  if (-not (Test-Path (Join-Path $proj 'node_modules'))) {
    Write-Host '[1/5] Installing dependencies: npm install' -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
      throw 'npm install failed.'
    }
  } else {
    Write-Host '[1/5] Dependencies already installed.' -ForegroundColor Green
  }
}

function Stop-ProcessFromPidFile([string]$Path, [string]$Label) {
  if (-not (Test-Path $Path)) { return }

  $pidText = (Get-Content $Path -ErrorAction SilentlyContinue | Select-Object -First 1)
  $existingPid = 0
  if (-not [int]::TryParse(($pidText | Out-String).Trim(), [ref]$existingPid)) {
    Remove-Item $Path -ErrorAction SilentlyContinue
    return
  }

  $proc = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
  if (-not $proc) {
    Remove-Item $Path -ErrorAction SilentlyContinue
    return
  }

  Write-Host ('Stopping previous {0} process PID {1}...' -f $Label, $existingPid) -ForegroundColor Yellow
  Stop-Process -Id $existingPid -Force
  Start-Sleep -Seconds 2
  Remove-Item $Path -ErrorAction SilentlyContinue
}

function Remove-StalePid() {
  if (-not (Test-Path $pidFile)) { return }

  $pidText = (Get-Content $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
  $existingPid = 0
  if (-not [int]::TryParse(($pidText | Out-String).Trim(), [ref]$existingPid)) {
    Remove-Item $pidFile -ErrorAction SilentlyContinue
    return
  }

  $proc = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
  if (-not $proc) {
    Remove-Item $pidFile -ErrorAction SilentlyContinue
  }
}

function Get-Pm2Command() {
  $localPm2 = Join-Path $proj 'node_modules\.bin\pm2.cmd'
  if (Test-Path $localPm2) { return $localPm2 }
  $globalPm2 = Get-Command pm2 -ErrorAction SilentlyContinue
  if ($globalPm2) { return $globalPm2.Source }
  return $null
}

function Stop-BackendIfOwned() {
  $pm2 = Get-Pm2Command
  if ($pm2) {
    # pm2 exits non-zero when there is no aura-parser process yet (first run) -
    # that is an expected, non-fatal outcome here, not a real failure, so this
    # must not trip the script's global $ErrorActionPreference = 'Stop'.
    try {
      & $pm2 delete aura-parser *> $null
    } catch {}
  }
  # Also clear out any pre-pm2 raw `node server.js` process still tracked by
  # the legacy PID file, so upgrading an already-running install doesn't leave
  # two backends fighting over the same port.
  Stop-ProcessFromPidFile $pidFile 'parser'
}

function Stop-CloudflaredIfOwned() {
  Stop-ProcessFromPidFile $cloudflaredPidFile 'cloudflared'
}

function Ensure-FirewallRule() {
  if (-not (Get-Command Get-NetFirewallRule -ErrorAction SilentlyContinue) -or -not (Get-Command New-NetFirewallRule -ErrorAction SilentlyContinue)) {
    Write-Host "[3/5] Firewall cmdlets are unavailable on this Windows install. Open TCP port $script:port manually if other devices must connect." -ForegroundColor Yellow
    return
  }

  $ruleName = "Aura Parser $script:port"
  $existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
  if ($existing) {
    Write-Host "[3/5] Firewall rule already exists: $ruleName" -ForegroundColor Green
    return
  }

  if (-not (Test-IsAdmin)) {
    Write-Host "[3/5] Firewall rule not created. Run start-parser.bat once as Administrator to open TCP port $script:port for other devices." -ForegroundColor Yellow
    return
  }

  New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort $script:port | Out-Null
  Write-Host "[3/5] Firewall rule created for TCP port $script:port." -ForegroundColor Green
}

function Start-Backend() {
  if (-not $Restart -and (Test-BackendHealth (Get-LocalUrl) 3)) {
    Write-Host "[2/5] Backend already running on $(Get-LocalUrl)" -ForegroundColor Green
    return
  }

  if ($Restart) {
    Stop-BackendIfOwned
  }

  if (Test-BackendHealth (Get-LocalUrl) 3) {
    Write-Host "[2/5] Existing parser process responded after restart check." -ForegroundColor Green
    return
  }

  Remove-StalePid
  Remove-Item $outLog, $errLog -ErrorAction SilentlyContinue

  $pm2 = Get-Pm2Command
  $pm2ErrLog = Join-Path $runtimeDir 'pm2-err.log'

  if ($pm2) {
    Write-Host '[2/5] Starting parser backend under pm2 supervision (auto-restart on crash)...' -ForegroundColor Yellow
    Remove-Item $pm2ErrLog -ErrorAction SilentlyContinue
    & $pm2 start (Join-Path $proj 'ecosystem.config.cjs') | Out-Null
    & $pm2 save | Out-Null
  } else {
    Write-Host '[2/5] pm2 not found - starting parser backend WITHOUT crash supervision (run npm install to get pm2).' -ForegroundColor Yellow
    $process = Start-Process $script:nodeCommand.Source -ArgumentList 'server.js' -WorkingDirectory $proj -WindowStyle Hidden -RedirectStandardOutput $outLog -RedirectStandardError $errLog -PassThru
    Set-Content -Path $pidFile -Value $process.Id -Encoding ASCII
  }

  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    if (Test-BackendHealth (Get-LocalUrl) 3) {
      Write-Host "    Parser is ready on $(Get-LocalUrl)" -ForegroundColor Green
      return
    }
  }

  $tail = ''
  $logToCheck = if ($pm2) { $pm2ErrLog } else { $errLog }
  if (Test-Path $logToCheck) {
    $tail = (Get-Content $logToCheck -Tail 20 -ErrorAction SilentlyContinue | Out-String).Trim()
  }
  throw ("Parser did not start within 30 seconds. Check {0}`n{1}" -f $logToCheck, $tail)
}

function Start-CloudflaredTunnel() {
  if (-not $Tunnel) { return $null }
  if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
    Write-Host '[5/5] cloudflared not found. Skipping tunnel.' -ForegroundColor Yellow
    return $null
  }

  $logPath = Join-Path $runtimeDir 'cloudflared.log'
  $namedTunnelUrl = Get-ConfiguredPublicUrl
  $namedTunnelToken = Get-CloudflaredToken
  $namedTunnelName = Get-CloudflaredTunnelName

  if ($namedTunnelUrl -and (Test-BackendHealth $namedTunnelUrl 10)) {
    Write-Host "[5/5] Reusing healthy public tunnel: $namedTunnelUrl" -ForegroundColor Green
    Write-PublicTunnelConfig $namedTunnelUrl
    return $namedTunnelUrl
  }

  if ($namedTunnelUrl -and $namedTunnelToken) {
    Stop-CloudflaredIfOwned
    Remove-Item $logPath -ErrorAction SilentlyContinue

    Write-Host "[5/5] Starting named Cloudflare tunnel '$namedTunnelName' for $namedTunnelUrl..." -ForegroundColor Yellow
    $process = Start-Process cloudflared -ArgumentList @('tunnel', 'run', '--token', $namedTunnelToken) -WorkingDirectory $proj -WindowStyle Hidden -RedirectStandardError $logPath -PassThru
    Set-Content -Path $cloudflaredPidFile -Value $process.Id -Encoding ASCII

    for ($i = 0; $i -lt 45; $i++) {
      Start-Sleep -Seconds 2
      if (Test-BackendHealth $namedTunnelUrl 10) {
        Write-PublicTunnelConfig $namedTunnelUrl
        return $namedTunnelUrl
      }
    }

    Write-Host "    Named tunnel did not become reachable: $namedTunnelUrl" -ForegroundColor Yellow
  }

  for ($attempt = 1; $attempt -le 3; $attempt++) {
    Remove-Item $logPath -ErrorAction SilentlyContinue
    Stop-CloudflaredIfOwned
    Write-Host "[5/5] Starting optional cloudflared tunnel (attempt $attempt/3)..." -ForegroundColor Yellow
    $process = Start-Process cloudflared -ArgumentList @('--config', 'NUL', 'tunnel', '--url', (Get-LocalUrl)) -WindowStyle Hidden -RedirectStandardError $logPath -PassThru
    Set-Content -Path $cloudflaredPidFile -Value $process.Id -Encoding ASCII

    $publicUrl = $null
    for ($i = 0; $i -lt 45; $i++) {
      Start-Sleep -Seconds 2
      $match = Select-String -Path $logPath -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -ErrorAction SilentlyContinue | Select-Object -First 1
      if (-not $match) { continue }
      $publicUrl = $match.Matches[0].Value
      if (-not (Test-HostResolves $publicUrl)) { continue }
      if (Test-BackendHealth $publicUrl 10) {
        return $publicUrl
      }
    }

    if ($publicUrl) {
      Write-Host "    Tunnel URL was created but never became reachable: $publicUrl" -ForegroundColor Yellow
    } else {
      Write-Host '    Tunnel URL was not created in time.' -ForegroundColor Yellow
    }
  }

  Write-Host '    Tunnel did not become healthy after 3 attempts. Continue with local/LAN links.' -ForegroundColor Yellow
  return $null
}

$script:port = [int](Get-ConfigValue 'PORT' '4317')
$script:listenHost = Get-ConfigValue 'HOST' '0.0.0.0'
[Environment]::SetEnvironmentVariable('PORT', [string]$script:port, 'Process')
[Environment]::SetEnvironmentVariable('HOST', $script:listenHost, 'Process')

Write-Host '=== Aura Parser ===' -ForegroundColor Cyan
Write-Host "Project: $proj" -ForegroundColor DarkGray

Ensure-NodeEnvironment
Start-Backend
Ensure-FirewallRule

$localUrl = Get-LocalUrl
$lanUrls = Get-LanUrls

Write-Host "[4/5] Parser links" -ForegroundColor Cyan
Write-Host "Local: $localUrl" -ForegroundColor Green
foreach ($url in $lanUrls) {
  Write-Host "LAN:   $url" -ForegroundColor Green
}

$configuredPublicUrl = Get-ConfiguredPublicUrl
if ($configuredPublicUrl) {
  Write-Host "Public: $configuredPublicUrl" -ForegroundColor Green
}

$preferredUrl = if ($configuredPublicUrl) { $configuredPublicUrl } elseif ($lanUrls.Count -gt 0) { $lanUrls[0] } else { $localUrl }

$tunnelUrl = Start-CloudflaredTunnel
if ($tunnelUrl) {
  $preferredUrl = $tunnelUrl
}

Save-PreferredLink $preferredUrl

Write-Host "USE THIS URL (phone / other PC): $preferredUrl" -ForegroundColor Cyan
if ($tunnelUrl) {
  Write-Host "Public tunnel: $tunnelUrl" -ForegroundColor Green
}

Write-Host ''
Write-Host 'Logs:' -ForegroundColor White
  Write-Host "  $outLog" -ForegroundColor DarkGray
  Write-Host "  $errLog" -ForegroundColor DarkGray
  Write-Host "  $lastLinkFile" -ForegroundColor DarkGray
  Write-Host "  $workerLinkFile" -ForegroundColor DarkGray
Write-Host ''
Write-Host 'Stop command:' -ForegroundColor White
Write-Host '  stop-parser.bat' -ForegroundColor DarkGray
Write-Host ''
Write-Host 'Do not open the old GitHub Pages link in local mode. Use the Local/LAN URL above.' -ForegroundColor Yellow

if (-not $NoBrowser) {
  Start-Process $preferredUrl
}
