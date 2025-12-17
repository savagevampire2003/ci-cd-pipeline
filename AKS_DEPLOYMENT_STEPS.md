# Quick AKS Deployment Steps

Follow these steps to deploy the Student Management System to Azure Kubernetes Service.

## Prerequisites

- Azure CLI installed ✓ (you have v2.77.0)
- kubectl installed ✓ (you have v1.34.1)
- Docker installed ✓
- Docker Hub account
- Azure account with active subscription

## Option 1: Automated Deployment (Recommended)

### Step 1: Update Configuration

Edit `deploy-to-aks.ps1` and change this line:
```powershell
$DOCKER_USERNAME = "YOUR_DOCKERHUB_USERNAME"  # CHANGE THIS!
```

Replace `YOUR_DOCKERHUB_USERNAME` with your actual Docker Hub username.

### Step 2: Run the Script

```powershell
# Login to Azure first
az login

# Run the deployment script
.\deploy-to-aks.ps1
```

The script will:
1. ✓ Check Azure login
2. ✓ Create resource group (if needed)
3. ✓ Create AKS cluster (if needed) - takes 10-15 minutes
4. ✓ Configure kubectl
5. ✓ Build and push Docker images
6. ✓ Create ConfigMap and Secrets
7. ✓ Deploy all services
8. ✓ Wait for pods to be ready
9. ✓ Get external IP address

## Option 2: Manual Deployment

### Step 1: Login to Azure

```powershell
az login
```

### Step 2: Create Resource Group

```powershell
az group create --name sms-resource-group --location eastus
```

### Step 3: Create AKS Cluster

```powershell
az aks create `
  --resource-group sms-resource-group `
  --name sms-aks-cluster `
  --node-count 2 `
  --node-vm-size Standard_B2s `
  --enable-managed-identity `
  --generate-ssh-keys
```

This takes 10-15 minutes. Wait for it to complete.

### Step 4: Get AKS Credentials

```powershell
az aks get-credentials `
  --resource-group sms-resource-group `
  --name sms-aks-cluster
```

### Step 5: Verify Connection

```powershell
kubectl cluster-info
kubectl get nodes
```

### Step 6: Build and Push Docker Images

```powershell
# Login to Docker Hub
docker login

# Build images
docker build -t YOUR_USERNAME/sms-backend:latest -f Dockerfile .
docker build -t YOUR_USERNAME/sms-frontend:latest -f frontend.Dockerfile .

# Push images
docker push YOUR_USERNAME/sms-backend:latest
docker push YOUR_USERNAME/sms-frontend:latest
```

**IMPORTANT:** Replace `YOUR_USERNAME` with your Docker Hub username!

### Step 7: Update Kubernetes Manifests

Edit these files and replace the image names:

**k8s/backend-deployment.yaml:**
```yaml
spec:
  template:
    spec:
      containers:
      - name: backend
        image: YOUR_USERNAME/sms-backend:latest  # UPDATE THIS
```

**k8s/frontend-deployment.yaml:**
```yaml
spec:
  template:
    spec:
      containers:
      - name: frontend
        image: YOUR_USERNAME/sms-frontend:latest  # UPDATE THIS
```

### Step 8: Create ConfigMap

```powershell
kubectl apply -f k8s/app-configmap.yaml
```

### Step 9: Create Secrets

```powershell
# Generate a random session secret
$sessionSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Create the secret
kubectl create secret generic app-secrets `
  --from-literal=mongodb_uri="mongodb://mongodb:27017/examdb" `
  --from-literal=session_secret="$sessionSecret"
```

### Step 10: Deploy MongoDB

```powershell
kubectl apply -f k8s/mongodb-statefulset.yaml
kubectl apply -f k8s/mongodb-service.yaml
```

Wait for MongoDB to be ready:
```powershell
kubectl wait --for=condition=ready pod -l app=mongodb --timeout=300s
```

### Step 11: Deploy Backend

```powershell
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
```

Wait for backend to be ready:
```powershell
kubectl wait --for=condition=ready pod -l app=backend --timeout=300s
```

### Step 12: Deploy Frontend

```powershell
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

Wait for frontend to be ready:
```powershell
kubectl wait --for=condition=ready pod -l app=frontend --timeout=300s
```

### Step 13: Get External IP

```powershell
kubectl get service frontend
```

Wait for EXTERNAL-IP to be assigned (may take 2-5 minutes). You can watch it:
```powershell
kubectl get service frontend --watch
```

Press Ctrl+C to stop watching.

### Step 14: Access Application

Once you have the external IP, access your application:
```
http://YOUR_EXTERNAL_IP
```

## Verification Commands

```powershell
# Check all resources
kubectl get all

# Check pods
kubectl get pods

# Check services
kubectl get services

# Check persistent volumes
kubectl get pvc

# View backend logs
kubectl logs -l app=backend --tail=50

# View frontend logs
kubectl logs -l app=frontend --tail=50

# View MongoDB logs
kubectl logs -l app=mongodb --tail=50

# Test backend health
kubectl exec -it deployment/backend -- curl http://localhost:3000/health
```

## Troubleshooting

### Pods not starting

```powershell
# Check pod status
kubectl describe pod POD_NAME

# Check logs
kubectl logs POD_NAME
```

### ImagePullBackOff error

- Verify Docker images are pushed to Docker Hub
- Check image names in deployment files match your Docker Hub username
- Ensure images are public or configure image pull secrets

### External IP stuck in <pending>

- Wait 5-10 minutes
- Check Azure portal for LoadBalancer creation
- Verify your Azure subscription has quota for LoadBalancers

### Backend can't connect to MongoDB

```powershell
# Check MongoDB is running
kubectl get pods -l app=mongodb

# Check MongoDB service
kubectl get service mongodb

# Check secrets
kubectl get secret app-secrets
kubectl get secret app-secrets -o jsonpath='{.data.mongodb_uri}' | base64 --decode
```

## Cleanup

To delete everything:

```powershell
# Delete Kubernetes resources
kubectl delete -f k8s/

# Delete AKS cluster
az aks delete --resource-group sms-resource-group --name sms-aks-cluster --yes --no-wait

# Delete resource group (deletes everything)
az group delete --name sms-resource-group --yes --no-wait
```

## Cost Considerations

The default configuration uses:
- 2 x Standard_B2s nodes (~$30-40/month each)
- 1 x LoadBalancer (~$20/month)
- Storage (~$5/month)

**Total estimated cost: ~$85-105/month**

To minimize costs:
- Use 1 node instead of 2
- Delete the cluster when not in use
- Use Azure free tier if eligible

## Next Steps

After successful deployment:
1. Register a user account
2. Test all functionality
3. Run Selenium tests against the deployed application
4. Take screenshots for submission
5. Configure custom domain (optional)
6. Set up SSL/TLS (optional)
7. Configure monitoring and alerts (optional)

## Support

For issues:
1. Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
2. Check [k8s/README.md](k8s/README.md)
3. Review pod logs
4. Check Azure portal for resource status
