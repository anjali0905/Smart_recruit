# SmartHire-X Start Script for Windows PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting SmartHire-X Application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env files exist
if (-not (Test-Path "backend\.env")) {
    Write-Host "⚠ Warning: backend/.env not found. Please create it first." -ForegroundColor Yellow
    Write-Host "   Copy backend/.env.example to backend/.env and update with your API keys" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "frontend\.env")) {
    Write-Host "⚠ Warning: frontend/.env not found. Please create it first." -ForegroundColor Yellow
    Write-Host "   Copy frontend/.env.example to frontend/.env and update with your configuration" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Backend Server Starting...' -ForegroundColor Green; npm start" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host 'Frontend Server Starting...' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "✓ Servers are starting in separate windows..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend will be available at: http://localhost:4000" -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window (servers will continue running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

