# PowerShell launcher for Intelli Hire AI Job Portal

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "🚀 Launching Intelli Hire AI Job Portal..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Start Django Backend on port 8000
Write-Host "-> Starting Django backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle='Intelli-Hire Backend'; python manage.py runserver 127.0.0.1:8000" -WorkingDirectory "$PSScriptRoot\backend"

# 2. Start Next.js Frontend on port 3000
Write-Host "-> Starting Next.js frontend on http://localhost:3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle='Intelli-Hire Frontend'; npm run dev" -WorkingDirectory "$PSScriptRoot\frontend"

Write-Host "-> Waiting for servers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 4

# 3. Open browser
Write-Host "-> Opening browser to dashboard..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "🎉 Intelli Hire started successfully! Check the newly opened terminal windows for logs." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
