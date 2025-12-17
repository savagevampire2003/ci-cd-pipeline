# Push Docker Images to Docker Hub
# This script builds and pushes both backend and frontend images

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Docker Hub Image Push Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration - UPDATE THIS!
$DOCKER_USERNAME = "YOUR_DOCKERHUB_USERNAME"  # CHANGE THIS!

if ($DOCKER_USERNAME -eq "YOUR_DOCKERHUB_USERNAME") {
    Write-Host "⚠ ERROR: Please update DOCKER_USERNAME in this script!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Edit push-to-dockerhub.ps1 and change line 8:" -ForegroundColor Yellow
    Write-Host '  $DOCKER_USERNAME = "YOUR_DOCKERHUB_USERNAME"' -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Replace YOUR_DOCKERHUB_USERNAME with your actual Docker Hub username" -ForegroundColor Yellow
    exit 1
}

$BACKEND_IMAGE = "${DOCKER_USERNAME}/sms-backend"
$FRONTEND_IMAGE = "${DOCKER_USERNAME}/sms-frontend"
$TAG = "latest"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Docker Hub Username: $DOCKER_USERNAME" -ForegroundColor White
Write-Host "  Backend Image: ${BACKEND_IMAGE}:${TAG}" -ForegroundColor White
Write-Host "  Frontend Image: ${FRONTEND_IMAGE}:${TAG}" -ForegroundColor White
Write-Host ""

# Step 1: Check Docker is running
Write-Host "[Step 1/6] Checking Docker..." -ForegroundColor Green
docker version > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker is running" -ForegroundColor Green
Write-Host ""

# Step 2: Login to Docker Hub
Write-Host "[Step 2/6] Logging in to Docker Hub..." -ForegroundColor Green
Write-Host "Please enter your Docker Hub credentials:" -ForegroundColor Yellow
docker login
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Docker login failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Logged in successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Build Backend Image
Write-Host "[Step 3/6] Building backend image..." -ForegroundColor Green
Write-Host "This may take 2-5 minutes..." -ForegroundColor Yellow
docker build -t "${BACKEND_IMAGE}:${TAG}" -f Dockerfile .
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Backend build failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Check that Dockerfile exists" -ForegroundColor White
    Write-Host "  - Check that package.json exists" -ForegroundColor White
    Write-Host "  - Check that all source files are present" -ForegroundColor White
    exit 1
}
Write-Host "✓ Backend image built successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Build Frontend Image
Write-Host "[Step 4/6] Building frontend image..." -ForegroundColor Green
Write-Host "This may take 2-5 minutes..." -ForegroundColor Yellow
docker build -t "${FRONTEND_IMAGE}:${TAG}" -f frontend.Dockerfile .
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend build failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Check that frontend.Dockerfile exists" -ForegroundColor White
    Write-Host "  - Check that nginx.conf exists" -ForegroundColor White
    Write-Host "  - Check that nginx-env.sh exists" -ForegroundColor White
    Write-Host "  - Check that public/ folder exists" -ForegroundColor White
    exit 1
}
Write-Host "✓ Frontend image built successfully" -ForegroundColor Green
Write-Host ""

# Step 5: Push Backend Image
Write-Host "[Step 5/6] Pushing backend image to Docker Hub..." -ForegroundColor Green
Write-Host "This may take 2-5 minutes depending on your internet speed..." -ForegroundColor Yellow
docker push "${BACKEND_IMAGE}:${TAG}"
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Backend push failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Check your internet connection" -ForegroundColor White
    Write-Host "  - Verify you're logged in: docker login" -ForegroundColor White
    Write-Host "  - Check Docker Hub username is correct" -ForegroundColor White
    exit 1
}
Write-Host "✓ Backend image pushed successfully" -ForegroundColor Green
Write-Host ""

# Step 6: Push Frontend Image
Write-Host "[Step 6/6] Pushing frontend image to Docker Hub..." -ForegroundColor Green
Write-Host "This may take 2-5 minutes depending on your internet speed..." -ForegroundColor Yellow
docker push "${FRONTEND_IMAGE}:${TAG}"
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend push failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Check your internet connection" -ForegroundColor White
    Write-Host "  - Verify you're logged in: docker login" -ForegroundColor White
    Write-Host "  - Check Docker Hub username is correct" -ForegroundColor White
    exit 1
}
Write-Host "✓ Frontend image pushed successfully" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ SUCCESS! Images pushed to Docker Hub" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your images are now available at:" -ForegroundColor Yellow
Write-Host "  Backend:  https://hub.docker.com/r/${DOCKER_USERNAME}/sms-backend" -ForegroundColor Cyan
Write-Host "  Frontend: https://hub.docker.com/r/${DOCKER_USERNAME}/sms-frontend" -ForegroundColor Cyan
Write-Host ""
Write-Host "Image names for Kubernetes:" -ForegroundColor Yellow
Write-Host "  ${BACKEND_IMAGE}:${TAG}" -ForegroundColor Cyan
Write-Host "  ${FRONTEND_IMAGE}:${TAG}" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update k8s/backend-deployment.yaml with backend image name" -ForegroundColor White
Write-Host "  2. Update k8s/frontend-deployment.yaml with frontend image name" -ForegroundColor White
Write-Host "  3. Run: .\deploy-to-aks.ps1" -ForegroundColor White
Write-Host ""

# Show image sizes
Write-Host "Image sizes:" -ForegroundColor Yellow
docker images | Select-String -Pattern "sms-backend|sms-frontend|REPOSITORY"
Write-Host ""

Write-Host "Done! 🚀" -ForegroundColor Green
