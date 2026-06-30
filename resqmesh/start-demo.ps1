# ResQMesh - Windows Quick-Start Helper
# Run from the resqmesh folder: .\start-demo.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host ""
Write-Host "  =========================================" -ForegroundColor Red
Write-Host "       ResQMesh - Hackathon Demo" -ForegroundColor Red
Write-Host "  Offline-First Disaster Response System" -ForegroundColor Gray
Write-Host "  =========================================" -ForegroundColor Red
Write-Host ""

function Start-ResQMeshService {
    param(
        [string]$Name,
        [string]$Command,
        [string]$WorkDir
    )
    Write-Host "  Starting $Name..." -ForegroundColor Yellow
    $escapedDir = $WorkDir -replace "'", "''"
    $fullCommand = "Set-Location -LiteralPath '$escapedDir'; `$env:SSL_CERT_FILE=`$null; `$env:REQUESTS_CA_BUNDLE=`$null; `$env:CURL_CA_BUNDLE=`$null; `$env:SSL_CERT_DIR=`$null; `$env:HTTPS_CA_BUNDLE=`$null; $Command"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $fullCommand -WindowStyle Normal
    Start-Sleep -Milliseconds 600
}

function Install-PythonDeps {
    param([string]$ServiceDir, [string]$Name)
    $req = Join-Path $ServiceDir "requirements.txt"
    if (-not (Test-Path $req)) { return }
    Write-Host "  Installing Python deps for $Name..." -ForegroundColor Cyan
    # Clear broken PostgreSQL SSL cert path that breaks pip on some Windows setups
    $env:SSL_CERT_FILE = $null
    $env:REQUESTS_CA_BUNDLE = $null
    $env:CURL_CA_BUNDLE = $null
    python -m pip install -r $req --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  WARNING: pip install failed for $Name. Run manually:" -ForegroundColor Yellow
        Write-Host "    cd $ServiceDir" -ForegroundColor Yellow
        Write-Host "    python -m pip install -r requirements.txt" -ForegroundColor Yellow
    }
}

# Copy .env files if missing
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path (Split-Path $root -Parent) "frontend"

foreach ($pair in @(@("backend", $backendDir), @("frontend", $frontendDir))) {
    $name = $pair[0]
    $dir = $pair[1]
    $envFile = Join-Path $dir ".env"
    $example = Join-Path $dir ".env.example"
    if (-not (Test-Path $envFile) -and (Test-Path $example)) {
        Copy-Item $example $envFile
        Write-Host "  Created $name\.env from example" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "  Checking prerequisites..." -ForegroundColor Gray

try {
    $null = Get-Command node -ErrorAction Stop
    $null = Get-Command python -ErrorAction Stop
    $null = Get-Command npm -ErrorAction Stop
} catch {
    Write-Host "  ERROR: node, npm, and python must be on PATH." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "  Installing Python dependencies..." -ForegroundColor Gray
Install-PythonDeps (Join-Path $root "ai-service") "AI Service"
Install-PythonDeps (Join-Path $root "relay-node") "Relay Node"
Install-PythonDeps (Join-Path $root "speech-service") "Speech Service"

Write-Host ""
Write-Host "  Starting services in separate windows..." -ForegroundColor Green
Write-Host ""

Start-ResQMeshService "AI Service"   "python app.py"    (Join-Path $root "ai-service")
Start-ResQMeshService "Relay Node" "python app.py"    (Join-Path $root "relay-node")
Start-ResQMeshService "Speech Service" "python app.py"  (Join-Path $root "speech-service")
Start-ResQMeshService "Backend"    "npm run dev"      (Join-Path $root "backend")

Write-Host ""
Write-Host "  Waiting 5 seconds for backend to start..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Start-ResQMeshService "Frontend" "npm run dev" $frontendDir

Write-Host ""
Write-Host "  +-------------------------------------------+" -ForegroundColor Green
Write-Host "  |  All services started!                    |" -ForegroundColor Green
Write-Host "  |                                           |" -ForegroundColor Green
Write-Host "  |  Victim App     ->  http://localhost:3000          |" -ForegroundColor White
Write-Host "  |  Dashboard      ->  http://localhost:3000/dashboard |" -ForegroundColor White
Write-Host "  |  Backend API    ->  http://localhost:3001    |" -ForegroundColor White
Write-Host "  |  Relay Node     ->  http://localhost:5000    |" -ForegroundColor White
Write-Host "  |  AI Service     ->  http://localhost:5001    |" -ForegroundColor White
Write-Host "  |  Speech Service ->  http://localhost:5002    |" -ForegroundColor White
Write-Host "  +-------------------------------------------+" -ForegroundColor Green
Write-Host ""
Write-Host "  NOTE: MongoDB is optional - backend uses in-memory storage if mongod is not running." -ForegroundColor Yellow
Write-Host "  NOTE: Ollama must be running with qwen2.5:1.5b for AI triage." -ForegroundColor Yellow
Write-Host "        ollama pull qwen2.5:1.5b" -ForegroundColor Yellow
Write-Host ""
