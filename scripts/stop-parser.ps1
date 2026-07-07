$ErrorActionPreference = 'Stop'
$proj = Split-Path -Parent $PSScriptRoot
$pidFile = Join-Path $proj '.runtime\parser.pid'
$cloudflaredPidFile = Join-Path $proj '.runtime\cloudflared.pid'

if (-not (Test-Path $pidFile)) {
  Write-Host 'Parser PID file not found. Nothing to stop.' -ForegroundColor Yellow
  exit 0
}

$pidText = (Get-Content $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
$parserPid = 0
if (-not [int]::TryParse(($pidText | Out-String).Trim(), [ref]$parserPid)) {
  Remove-Item $pidFile -ErrorAction SilentlyContinue
  Write-Host 'PID file was invalid and has been removed.' -ForegroundColor Yellow
  exit 0
}

$proc = Get-Process -Id $parserPid -ErrorAction SilentlyContinue
if ($proc) {
  Stop-Process -Id $parserPid -Force
  Write-Host "Stopped parser PID $parserPid." -ForegroundColor Green
} else {
  Write-Host "Process PID $parserPid was not running." -ForegroundColor Yellow
}

Remove-Item $pidFile -ErrorAction SilentlyContinue

if (Test-Path $cloudflaredPidFile) {
  $cloudflaredText = (Get-Content $cloudflaredPidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
  $cloudflaredPid = 0
  if ([int]::TryParse(($cloudflaredText | Out-String).Trim(), [ref]$cloudflaredPid)) {
    $cloudflaredProc = Get-Process -Id $cloudflaredPid -ErrorAction SilentlyContinue
    if ($cloudflaredProc) {
      Stop-Process -Id $cloudflaredPid -Force
      Write-Host "Stopped cloudflared PID $cloudflaredPid." -ForegroundColor Green
    } else {
      Write-Host "Cloudflared PID $cloudflaredPid was not running." -ForegroundColor Yellow
    }
  } else {
    Write-Host 'Cloudflared PID file was invalid and has been removed.' -ForegroundColor Yellow
  }

  Remove-Item $cloudflaredPidFile -ErrorAction SilentlyContinue
}
