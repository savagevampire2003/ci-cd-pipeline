# Health Check Test Script
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Student Management System - Health Check" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

# Test Backend Health Endpoint
Write-Host "1. Testing Backend Health Endpoint..." -ForegroundColor Cyan
Write-Host "   URL: http://localhost:3000/health`n" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Health Status: $($json.status)" -ForegroundColor $(if ($json.status -eq "ok") { "Green" } else { "Red" })
    Write-Host "   Database Status: $($json.database.status)" -ForegroundColor $(if ($json.database.connected) { "Green" } else { "Red" })
    Write-Host "   Database Connected: $($json.database.connected)" -ForegroundColor $(if ($json.database.connected) { "Green" } else { "Red" })
    Write-Host "   Timestamp: $($json.timestamp)" -ForegroundColor Gray
    Write-Host "   ✓ Backend health check PASSED`n" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Backend health check FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test Frontend Health Endpoint
Write-Host "2. Testing Frontend Health Endpoint..." -ForegroundColor Cyan
Write-Host "   URL: http://localhost:3000/health.html`n" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health.html" -UseBasicParsing
    
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Content Type: $($response.Headers['Content-Type'])" -ForegroundColor Gray
    Write-Host "   Content Length: $($response.Content.Length) bytes" -ForegroundColor Gray
    Write-Host "   ✓ Frontend health check PASSED`n" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Frontend health check FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test Main Application
Write-Host "3. Testing Main Application..." -ForegroundColor Cyan
Write-Host "   URL: http://localhost:3000`n" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
    
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   ✓ Main application is accessible`n" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Main application check FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "  All Health Checks Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Application is running at: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Login page: http://localhost:3000/login.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server when done." -ForegroundColor Gray
Write-Host ""
