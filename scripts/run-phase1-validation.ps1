# Start Next.js production server on port 3000 in background job
Write-Host "Starting Next.js server on port 3000..."
$serverProcess = Start-Process -FilePath "pnpm" -ArgumentList "start", "--port", "3000" -WorkingDirectory "apps\web" -PassThru

# Wait for server to respond on http://localhost:3000
$retries = 30
$ready = $false
while ($retries -gt 0) {
    try {
        $res = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2
        if ($res.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch {
        Start-Sleep -Seconds 1
        $retries--
    }
}

if (-not $ready) {
    Write-Error "Server failed to start within timeout"
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "Server is live on http://localhost:3000!"

try {
    # 1. Capture screenshots for all breakpoints and themes
    Write-Host "Capturing Phase 1 screenshots..."
    npx ts-node -P scripts/tsconfig.json scripts/capture-phase1.ts

    # 2. Run Playwright E2E tests for Phase 1
    Write-Host "Running Playwright E2E test suite..."
    npx playwright test tests/e2e/phase1-headers.spec.ts
} finally {
    Write-Host "Stopping Next.js server..."
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next*" } | Stop-Process -Force -ErrorAction SilentlyContinue
}
