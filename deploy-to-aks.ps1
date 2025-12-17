# AKS Deployment Script for Student Management System
# This script deploys the application to Azure Kubernetes Service

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Student Management System - AKS Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration Variables
$RESOURCE_GROUP = "sms-resource-group"
$CLUSTER_NAME = "sms-aks-cluster"
$LOCATION = "eastus"
$NODE_COUNT = 2
$NODE_SIZE = "Standard_B2s"

# Docker Hub Configuration (UPDATE THESE!)
$DOCKER_USERNAME = "YOUR_DOCKERHUB_USERNAME"  # CHANGE THIS!
$DOCKER_REPO_BACKEND = "$DOCKER_USERNAME/sms-backend"
$DOCKER_REPO_FRONTEND = "$DOCKER_USERNAME/sms-frontend"
$IMAGE_TAG = "latest"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Resource Group: $RESOURCE_GROUP"
Write-Host "  Cluster Name: $CLUSTER_NAME"
Write-Host "  Location: $LOCATION"
Write-Host "  Docker Username: $DOCKER_USERNAME"
Write-Host ""

# Step 1: Login to Azure
Write-Host "[Step 1/10] Checking Azure login..." -ForegroundColor Green
$account = az account show 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to Azure. Please run 'az login' first." -ForegroundColor Red
    Write-Host "Run: az login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Logged in to Azure" -ForegroundColor Green
Write-Host ""

# Step 2: Check if resource group exists
Write-Host "[Step 2/10] Checking resource group..." -ForegroundColor Green
$rgExists = az group exists --name $RESOURCE_GROUP
if ($rgExists -eq "false") {
    Write-Host "Creating resource group: $RESOURCE_GROUP" -ForegroundColor Yellow
    az group create --name $RESOURCE_GROUP --location $LOCATION
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to create resource group" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Resource group created" -ForegroundColor Green
} else {
    Write-Host "✓ Resource group exists" -ForegroundColor Green
}
Write-Host ""

# Step 3: Check if AKS cluster exists
Write-Host "[Step 3/10] Checking AKS cluster..." -ForegroundColor Green
$clusterExists = az aks show --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating AKS cluster: $CLUSTER_NAME (this may take 10-15 minutes)..." -ForegroundColor Yellow
    az aks create `
        --resource-group $RESOURCE_GROUP `
        --name $CLUSTER_NAME `
        --node-count $NODE_COUNT `
        --node-vm-size $NODE_SIZE `
        --enable-managed-identity `
        --generate-ssh-keys `
        --no-wait
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to create AKS cluster" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ AKS cluster creation initiated" -ForegroundColor Green
    Write-Host "Waiting for cluster to be ready..." -ForegroundColor Yellow
    
    # Wait for cluster to be ready
    $maxAttempts = 60
    $attempt = 0
    while ($attempt -lt $maxAttempts) {
        $state = az aks show --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME --query "provisioningState" -o tsv 2>$null
        if ($state -eq "Succeeded") {
            Write-Host "✓ AKS cluster is ready" -ForegroundColor Green
            break
        }
        $attempt++
        Write-Host "  Waiting... ($attempt/$maxAttempts) Current state: $state" -ForegroundColor Yellow
        Start-Sleep -Seconds 30
    }
    
    if ($attempt -eq $maxAttempts) {
        Write-Host "✗ Timeout waiting for cluster" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ AKS cluster exists" -ForegroundColor Green
}
Write-Host ""

# Step 4: Get AKS credentials
Write-Host "[Step 4/10] Getting AKS credentials..." -ForegroundColor Green
az aks get-credentials --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME --overwrite-existing
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to get credentials" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Credentials configured" -ForegroundColor Green
Write-Host ""

# Step 5: Verify kubectl connection
Write-Host "[Step 5/10] Verifying kubectl connection..." -ForegroundColor Green
kubectl cluster-info
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Cannot connect to cluster" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Connected to cluster" -ForegroundColor Green
Write-Host ""

# Step 6: Build and push Docker images
Write-Host "[Step 6/10] Building and pushing Docker images..." -ForegroundColor Green

if ($DOCKER_USERNAME -eq "YOUR_DOCKERHUB_USERNAME") {
    Write-Host "⚠ WARNING: Please update DOCKER_USERNAME in this script!" -ForegroundColor Red
    Write-Host "Edit deploy-to-aks.ps1 and set your Docker Hub username" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Skipping Docker build. You can build manually:" -ForegroundColor Yellow
    Write-Host "  docker login" -ForegroundColor Cyan
    Write-Host "  docker build -t YOUR_USERNAME/sms-backend:latest -f Dockerfile ." -ForegroundColor Cyan
    Write-Host "  docker build -t YOUR_USERNAME/sms-frontend:latest -f frontend.Dockerfile ." -ForegroundColor Cyan
    Write-Host "  docker push YOUR_USERNAME/sms-backend:latest" -ForegroundColor Cyan
    Write-Host "  docker push YOUR_USERNAME/sms-frontend:latest" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then update the image names in k8s/backend-deployment.yaml and k8s/frontend-deployment.yaml" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Have you already built and pushed the images? (yes/no)"
    if ($response -ne "yes") {
        Write-Host "Please build and push images first, then run this script again." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "Logging in to Docker Hub..." -ForegroundColor Yellow
    docker login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Docker login failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Building backend image..." -ForegroundColor Yellow
    docker build -t "${DOCKER_REPO_BACKEND}:${IMAGE_TAG}" -f Dockerfile .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Backend build failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Building frontend image..." -ForegroundColor Yellow
    docker build -t "${DOCKER_REPO_FRONTEND}:${IMAGE_TAG}" -f frontend.Dockerfile .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Frontend build failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Pushing backend image..." -ForegroundColor Yellow
    docker push "${DOCKER_REPO_BACKEND}:${IMAGE_TAG}"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Backend push failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Pushing frontend image..." -ForegroundColor Yellow
    docker push "${DOCKER_REPO_FRONTEND}:${IMAGE_TAG}"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Frontend push failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ Images built and pushed" -ForegroundColor Green
}
Write-Host ""

# Step 7: Create ConfigMap
Write-Host "[Step 7/10] Creating ConfigMap..." -ForegroundColor Green
kubectl apply -f k8s/app-configmap.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to create ConfigMap" -ForegroundColor Red
    exit 1
}
Write-Host "✓ ConfigMap created" -ForegroundColor Green
Write-Host ""

# Step 8: Create Secrets
Write-Host "[Step 8/10] Creating Secrets..." -ForegroundColor Green
$secretExists = kubectl get secret app-secrets 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Generating session secret..." -ForegroundColor Yellow
    $sessionSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    
    kubectl create secret generic app-secrets `
        --from-literal=mongodb_uri="mongodb://mongodb:27017/examdb" `
        --from-literal=session_secret="$sessionSecret"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to create secrets" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Secrets created" -ForegroundColor Green
} else {
    Write-Host "✓ Secrets already exist" -ForegroundColor Green
}
Write-Host ""

# Step 9: Deploy all services
Write-Host "[Step 9/10] Deploying services..." -ForegroundColor Green

Write-Host "  Deploying MongoDB..." -ForegroundColor Yellow
kubectl apply -f k8s/mongodb-statefulset.yaml
kubectl apply -f k8s/mongodb-service.yaml

Write-Host "  Deploying Backend..." -ForegroundColor Yellow
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

Write-Host "  Deploying Frontend..." -ForegroundColor Yellow
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Deployment failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ All services deployed" -ForegroundColor Green
Write-Host ""

# Step 10: Wait for deployments and get external IP
Write-Host "[Step 10/10] Waiting for deployments to be ready..." -ForegroundColor Green
Write-Host "This may take 2-5 minutes..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Waiting for MongoDB..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=mongodb --timeout=300s

Write-Host "Waiting for Backend..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=backend --timeout=300s

Write-Host "Waiting for Frontend..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=frontend --timeout=300s

Write-Host "✓ All pods are ready" -ForegroundColor Green
Write-Host ""

# Get external IP
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

kubectl get pods
Write-Host ""

Write-Host "Getting external IP (this may take a few minutes)..." -ForegroundColor Yellow
$maxAttempts = 20
$attempt = 0
$externalIP = ""

while ($attempt -lt $maxAttempts) {
    $externalIP = kubectl get service frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>$null
    if ($externalIP -and $externalIP -ne "") {
        break
    }
    $attempt++
    Write-Host "  Waiting for external IP... ($attempt/$maxAttempts)" -ForegroundColor Yellow
    Start-Sleep -Seconds 15
}

if ($externalIP -and $externalIP -ne "") {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Application URL: http://$externalIP" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now access your application at the URL above!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Useful commands:" -ForegroundColor Yellow
    Write-Host "  kubectl get pods              # Check pod status" -ForegroundColor Cyan
    Write-Host "  kubectl get services          # Check services" -ForegroundColor Cyan
    Write-Host "  kubectl logs -l app=backend   # View backend logs" -ForegroundColor Cyan
    Write-Host "  kubectl logs -l app=frontend  # View frontend logs" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "⚠ External IP not assigned yet" -ForegroundColor Yellow
    Write-Host "Run this command to check status:" -ForegroundColor Yellow
    Write-Host "  kubectl get service frontend --watch" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "Deployment complete!" -ForegroundColor Green
