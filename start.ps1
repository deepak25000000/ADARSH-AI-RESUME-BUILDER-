Write-Host ""
Write-Host "Starting AI Resume Builder..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Backend (FastAPI)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'C:\Users\Administrator\Desktop\Adarsh_Project\backend'; python -m uvicorn app.main:app --reload --port 8000"

Start-Sleep -Seconds 3

Write-Host "Starting Frontend (React)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'C:\Users\Administrator\Desktop\Adarsh_Project\frontend'; npm run dev"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Both servers starting!" -ForegroundColor Green
Write-Host "Opening browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Two new terminal windows opened. Keep them running!" -ForegroundColor Yellow
