param(
  [ValidateSet("start", "stop")]
  [string]$Action = "start"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $projectRoot ".lowkey-runtime"
$pidFile = Join-Path $runtimeDir "server.pid"
$logFile = Join-Path $runtimeDir "server.log"
$port = 3000

function Get-ListeningProcessId {
  $connection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1

  if ($null -eq $connection) {
    return $null
  }

  return [int]$connection.OwningProcess
}

if ($Action -eq "stop") {
  $serverProcessId = Get-ListeningProcessId

  if ($null -ne $serverProcessId) {
    & taskkill.exe /PID $serverProcessId /T /F | Out-Null
  }

  if (Test-Path -LiteralPath $pidFile) {
    Remove-Item -LiteralPath $pidFile -Force
  }

  exit 0
}

New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null

if ($null -ne (Get-ListeningProcessId)) {
  exit 0
}

Set-Location -LiteralPath $projectRoot
$PID | Set-Content -LiteralPath $pidFile -Encoding ascii

try {
  & npm.cmd run dev *>> $logFile
}
finally {
  if (Test-Path -LiteralPath $pidFile) {
    Remove-Item -LiteralPath $pidFile -Force
  }
}
