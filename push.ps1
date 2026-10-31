# One-click push to GitHub Pages.
# Run:  powershell -ExecutionPolicy Bypass -File .\push.ps1
# (or right-click > "Run with PowerShell")

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$GitExe = 'F:\github\Git\cmd\git.exe'
if (-not (Test-Path $GitExe)) {
    $found = Get-Command git -ErrorAction SilentlyContinue
    if ($found) { $GitExe = $found.Source }
    else {
        Write-Host 'git not found. Install from https://git-scm.com/download/win' -ForegroundColor Red
        Read-Host 'Press Enter to close'
        exit 1
    }
}

Write-Host '== 1/3 staging ==' -ForegroundColor Cyan
& $GitExe add -A
if ($LASTEXITCODE -ne 0) { Write-Host 'git add failed' -ForegroundColor Red; Read-Host 'Press Enter to close'; exit 1 }

$changed = (& $GitExe status --short | Measure-Object).Count
if ($changed -gt 0) {
    Write-Host "   $changed file(s) changed - committing" -ForegroundColor DarkGray
    & $GitExe commit -m "Update portfolio"
    if ($LASTEXITCODE -ne 0) { Write-Host 'git commit failed' -ForegroundColor Red; Read-Host 'Press Enter to close'; exit 1 }
} else {
    Write-Host '   nothing to commit' -ForegroundColor DarkGray
}

Write-Host '== 2/3 pushing (a GitHub login window will pop up - sign in there) ==' -ForegroundColor Cyan
& $GitExe push -u origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host ''
    Write-Host 'Push failed. Common causes:' -ForegroundColor Yellow
    Write-Host '  - the login popup was closed without signing in  -> run this script again'
    Write-Host '  - wrong account signed in                    -> sign out of github.com in that browser first'
    Write-Host '  - repo name mismatch                         -> check: git remote -v'
    Read-Host 'Press Enter to close'
    exit 1
}

Write-Host ''
Write-Host '== 3/3 done ==' -ForegroundColor Green
Write-Host 'Next: open your repo -> Settings -> Pages -> Source: GitHub Actions' -ForegroundColor Green
Write-Host 'Then send CNAME value  liukeyi534-stack.github.io  to the x8iu.com DNS owner.' -ForegroundColor Green
Write-Host ''
Write-Host 'Your site will be at:  https://liukeyi534-stack.github.io/keyi-design-web/' -ForegroundColor Cyan
Write-Host 'After DNS is ready:    https://ib.x8iu.com' -ForegroundColor Cyan

Read-Host 'Press Enter to close'
