# SmartHire-X Setup Script for Windows PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SmartHire-X Project Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion is installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if MongoDB is running (optional check)
Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
Write-Host "Note: Ensure MongoDB is running locally or you have MongoDB Atlas connection string" -ForegroundColor Yellow

# Install Backend Dependencies
Write-Host ""
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location "backend"
if (Test-Path "node_modules") {
    Write-Host "Backend dependencies already installed" -ForegroundColor Green
} else {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Backend dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
        exit 1
    }
}
Set-Location ".."

# Install Frontend Dependencies
Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location "frontend"
if (Test-Path "node_modules") {
    Write-Host "Frontend dependencies already installed" -ForegroundColor Green
} else {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Frontend dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
}
Set-Location ".."

# Check for .env files
Write-Host ""
Write-Host "Checking environment files..." -ForegroundColor Yellow

if (-not (Test-Path "backend\.env")) {
    Write-Host "⚠ Backend .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Host "✓ Created backend/.env - Please update with your API keys" -ForegroundColor Green
    } else {
        Write-Host "✗ .env.example not found. Please create backend/.env manually" -ForegroundColor Red
    }
} else {
    Write-Host "✓ Backend .env file exists" -ForegroundColor Green
}

if (-not (Test-Path "frontend\.env")) {
    Write-Host "⚠ Frontend .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path "frontend\.env.example") {
        Copy-Item "frontend\.env.example" "frontend\.env"
        Write-Host "✓ Created frontend/.env - Please update with your configuration" -ForegroundColor Green
    } else {
        Write-Host "✗ .env.example not found. Please create frontend/.env manually" -ForegroundColor Red
    }
} else {
    Write-Host "✓ Frontend .env file exists" -ForegroundColor Green
}

# Check face-api.js models
Write-Host ""
Write-Host "Checking face-api.js models..." -ForegroundColor Yellow
$modelsPath = "frontend\public\models"
$requiredModels = @(
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-shard1",
    "face_expression_model-weights_manifest.json",
    "face_expression_model-shard1"
)

$missingModels = @()
foreach ($model in $requiredModels) {
    if (Test-Path "$modelsPath\$model") {
        Write-Host "✓ $model exists" -ForegroundColor Green
    } else {
        Write-Host "✗ $model is missing" -ForegroundColor Red
        $missingModels += $model
    }
}

if ($missingModels.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠ Some face-api.js models are missing. Please download them:" -ForegroundColor Yellow
    Write-Host "   Visit: https://github.com/justadudewhohacks/face-api.js-models" -ForegroundColor Yellow
    Write-Host "   Place files in: $modelsPath" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update backend/.env with your API keys:" -ForegroundColor White
Write-Host "   - MONGODB_URI" -ForegroundColor Gray
Write-Host "   - GEN_AI_API_KEY (Google Gemini)" -ForegroundColor Gray
Write-Host "   - CLOUDINARY_* (for image uploads)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Update frontend/.env with your configuration:" -ForegroundColor White
Write-Host "   - VITE_BACKEND_URL" -ForegroundColor Gray
Write-Host "   - VITE_ZEGO_APP_ID & VITE_ZEGO_SERVER_SECRET (for HR interviews)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start MongoDB (if using local instance)" -ForegroundColor White
Write-Host ""
Write-Host "4. Run the application:" -ForegroundColor White
Write-Host "   Terminal 1: cd backend && npm start" -ForegroundColor Gray
Write-Host "   Terminal 2: cd frontend && npm run dev" -ForegroundColor Gray
Write-Host ""

