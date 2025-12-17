# Complete Deployment Guide

This comprehensive guide walks you through deploying the Student Management System using different methods: local development, Docker Compose, Kubernetes (AKS), and Ansible automation.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Deployment](#local-development-deployment)
3. [Docker Compose Deployment](#docker-compose-deployment)
4. [Kubernetes (AKS) Deployment](#kubernetes-aks-deployment)
5. [Ansible Automated Deployment](#ansible-automated-deployment)
6. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

**For Local Development:**
- Node.js 18 or higher
- MongoDB 6.0 or higher
- Git
- npm or yarn

**For Docker Deployment:**
- Docker 20.10 or higher
- Docker Compose 2.0 or higher

**For Kubernetes Deployment:**
- Azure CLI (`az`)
- kubectl CLI
- Active Azure subscription
- AKS cluster (or other Kubernetes cluster)

**For Ansible Deployment:**
- Ansible 2.9 or higher
- SSH access to target servers
- Python 3.8 or higher

**For Testing:**
- Python 3.8+ (for Selenium tests)
- Chrome browser

### Account Requirements

- **Docker Hub Account** - For storing container images
- **Azure Account** - For AKS deployment
- **GitHub Account** - For CI/CD pipeline

## Local Development Deployment

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd student-management-system
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Setup MongoDB

**Option A: Using Docker**
```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodata:/data/db \
  mongo:6.0
```

**Option B: Local Installation**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community@6.0

# Start MongoDB
mongod
```

### Step 4: Configure Environment

Create `.env` file:
```bash
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/examdb
SESSION_SECRET=$(openssl rand -base64 32)
PORT=3000
NODE_ENV=development
EOF
```

### Step 5: Start Application

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

### Step 6: Access Application

Open browser to http://localhost:3000

**Default Test User:**
- Register a new account on the login page
- Use the application to manage student records

### Step 7: Run Tests

```bash
# Unit tests
npm test

# Linting
npm run lint

# Selenium tests (requires app running)
cd selenium_tests
pip install -r requirements.txt
pytest -v
```

## Docker Compose Deployment

### Step 1: Verify Docker Installation

```bash
docker --version
docker-compose --version
```

### Step 2: Review Configuration

Edit `docker-compose.yml` if needed:
```yaml
services:
  frontend:
    environment:
      - API_BASE_URL=http://backend:3000
  
  backend:
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/examdb
      - SESSION_SECRET=change-this-secret
```

### Step 3: Build and Start Services

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### Step 4: Verify Services

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# Check health endpoints
curl http://localhost:3000/health
curl http://localhost/health.html
```

### Step 5: Access Application

- **Frontend:** http://localhost
- **Backend API:** http://localhost:3000
- **MongoDB:** localhost:27017 (internal only)

### Step 6: Stop Services

```bash
# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## Kubernetes (AKS) Deployment

### Step 1: Create AKS Cluster

```bash
# Login to Azure
az login

# Create resource group
az group create \
  --name sms-resource-group \
  --location eastus

# Create AKS cluster
az aks create \
  --resource-group sms-resource-group \
  --name sms-aks-cluster \
  --node-count 2 \
  --node-vm-size Standard_B2s \
  --enable-managed-identity \
  --generate-ssh-keys

# Get credentials
az aks get-credentials \
  --resource-group sms-resource-group \
  --name sms-aks-cluster
```

### Step 2: Verify Cluster Access

```bash
# Check cluster info
kubectl cluster-info

# Check nodes
kubectl get nodes

# Check current context
kubectl config current-context
```

### Step 3: Build and Push Docker Images

```bash
# Login to Docker Hub
docker login

# Build backend image
docker build -t <your-dockerhub-username>/sms-backend:latest -f Dockerfile .

# Build frontend image
docker build -t <your-dockerhub-username>/sms-frontend:latest -f frontend.Dockerfile .

# Push images
docker push <your-dockerhub-username>/sms-backend:latest
docker push <your-dockerhub-username>/sms-frontend:latest
```

### Step 4: Update Kubernetes Manifests

Edit deployment files to use your Docker Hub username:

**k8s/backend-deployment.yaml:**
```yaml
spec:
  template:
    spec:
      containers:
      - name: backend
        image: <your-dockerhub-username>/sms-backend:latest
```

**k8s/frontend-deployment.yaml:**
```yaml
spec:
  template:
    spec:
      containers:
      - name: frontend
        image: <your-dockerhub-username>/sms-frontend:latest
```

### Step 5: Create ConfigMap

```bash
kubectl apply -f k8s/app-configmap.yaml
```

### Step 6: Create Secrets

```bash
# Generate session secret
SESSION_SECRET=$(openssl rand -base64 32)

# Create secret
kubectl create secret generic app-secrets \
  --from-literal=mongodb_uri="mongodb://mongodb:27017/examdb" \
  --from-literal=session_secret="$SESSION_SECRET"

# Verify secret
kubectl get secret app-secrets
```

### Step 7: Deploy MongoDB

```bash
# Deploy StatefulSet
kubectl apply -f k8s/mongodb-statefulset.yaml

# Deploy Service
kubectl apply -f k8s/mongodb-service.yaml

# Wait for MongoDB to be ready
kubectl wait --for=condition=ready pod -l app=mongodb --timeout=120s

# Verify
kubectl get pods -l app=mongodb
kubectl get pvc
```

### Step 8: Deploy Backend

```bash
# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Wait for backend to be ready
kubectl wait --for=condition=ready pod -l app=backend --timeout=120s

# Verify
kubectl get pods -l app=backend
kubectl logs -l app=backend
```

### Step 9: Deploy Frontend

```bash
# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# Wait for frontend to be ready
kubectl wait --for=condition=ready pod -l app=frontend --timeout=120s

# Verify
kubectl get pods -l app=frontend
```

### Step 10: Get External IP

```bash
# Get frontend service external IP
kubectl get service frontend

# Wait for EXTERNAL-IP (may take a few minutes)
kubectl get service frontend --watch
```

### Step 11: Access Application

Once EXTERNAL-IP is assigned:
```bash
# Get the IP
EXTERNAL_IP=$(kubectl get service frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Access application
echo "Application URL: http://$EXTERNAL_IP"

# Test health endpoint
curl http://$EXTERNAL_IP/health.html
```

### Step 12: Verify Deployment

```bash
# Check all resources
kubectl get all

# Check pod status
kubectl get pods

# Check services
kubectl get services

# Check persistent volumes
kubectl get pv
kubectl get pvc

# View logs
kubectl logs -l app=backend --tail=50
kubectl logs -l app=frontend --tail=50
kubectl logs -l app=mongodb --tail=50
```

## Ansible Automated Deployment

### Step 1: Install Ansible

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install ansible

# macOS
brew install ansible

# Or using pip
pip install ansible
```

### Step 2: Prepare Target Servers

Ensure you have:
- 2+ Ubuntu/Debian servers
- SSH access with key-based authentication
- Sudo privileges on all servers

### Step 3: Configure Inventory

Edit `ansible/hosts.ini`:
```ini
[webservers]
web1 ansible_host=192.168.1.10
web2 ansible_host=192.168.1.11

[dbservers]
db1 ansible_host=192.168.1.20

[all:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=~/.ssh/id_rsa
ansible_python_interpreter=/usr/bin/python3
```

### Step 4: Test Connectivity

```bash
cd ansible

# Test ping
ansible all -i hosts.ini -m ping

# Test sudo access
ansible all -i hosts.ini -m command -a "sudo whoami" -b
```

### Step 5: Review Playbook

Check `ansible/playbook.yml` for tasks:
- System updates
- Docker installation
- Node.js installation
- Firewall configuration
- Application deployment

### Step 6: Run Playbook

```bash
# Dry run (check mode)
ansible-playbook -i hosts.ini playbook.yml --check

# Run playbook
ansible-playbook -i hosts.ini playbook.yml

# Run with verbose output
ansible-playbook -i hosts.ini playbook.yml -v
```

### Step 7: Verify Installation

```bash
# Check Docker
ansible webservers -i hosts.ini -m command -a "docker --version"

# Check Node.js
ansible webservers -i hosts.ini -m command -a "node --version"

# Check firewall
ansible all -i hosts.ini -m command -a "sudo ufw status" -b

# Check running containers
ansible webservers -i hosts.ini -m command -a "docker ps"
```

### Step 8: Deploy Application

```bash
# Copy docker-compose.yml to servers
ansible webservers -i hosts.ini -m copy \
  -a "src=../docker-compose.yml dest=/opt/sms/docker-compose.yml"

# Start services
ansible webservers -i hosts.ini -m command \
  -a "docker-compose up -d" \
  -a "chdir=/opt/sms"
```

## CI/CD Pipeline Setup

### Step 1: Fork Repository

Fork the repository to your GitHub account.

### Step 2: Create Docker Hub Repository

1. Login to Docker Hub
2. Create repositories:
   - `<username>/sms-backend`
   - `<username>/sms-frontend`

### Step 3: Generate Azure Credentials

```bash
# Login to Azure
az login

# Get subscription ID
az account show --query id -o tsv

# Create service principal
az ad sp create-for-rbac \
  --name "github-actions-sms" \
  --role contributor \
  --scopes /subscriptions/<subscription-id>/resourceGroups/<resource-group> \
  --sdk-auth

# Copy the entire JSON output
```

### Step 4: Configure GitHub Secrets

Go to: Repository → Settings → Secrets and variables → Actions

Add these secrets:

1. **DOCKER_USERNAME**
   ```
   your-dockerhub-username
   ```

2. **DOCKER_PASSWORD**
   ```
   your-dockerhub-access-token
   ```

3. **AZURE_CREDENTIALS**
   ```json
   {
     "clientId": "...",
     "clientSecret": "...",
     "subscriptionId": "...",
     "tenantId": "..."
   }
   ```

4. **AKS_CLUSTER_NAME**
   ```
   sms-aks-cluster
   ```

5. **AKS_RESOURCE_GROUP**
   ```
   sms-resource-group
   ```

### Step 5: Update Workflow File

Edit `.github/workflows/ci-cd-pipeline.yml`:
- Update Docker Hub username
- Verify AKS cluster details
- Adjust deployment steps if needed

### Step 6: Trigger Pipeline

```bash
# Push to main branch
git add .
git commit -m "Setup CI/CD pipeline"
git push origin main

# Or create pull request
git checkout -b feature-branch
git push origin feature-branch
# Create PR on GitHub
```

### Step 7: Monitor Pipeline

1. Go to GitHub repository
2. Click "Actions" tab
3. Select the workflow run
4. View logs for each stage
5. Download artifacts (test reports)

## Post-Deployment Verification

### Health Checks

```bash
# Backend health
curl http://<app-url>:3000/health

# Frontend health
curl http://<app-url>/health.html

# Kubernetes health
kubectl get pods
kubectl get services
```

### Functional Testing

1. **Access Application**
   - Open browser to application URL
   - Verify login page loads

2. **Register User**
   - Click "Register"
   - Fill form with test data
   - Submit registration

3. **Login**
   - Enter credentials
   - Verify redirect to dashboard

4. **Test Navigation**
   - Click Home tab
   - Click Students tab
   - Click Profile tab
   - Verify content loads

5. **Create Student**
   - Navigate to Students tab
   - Click "Add Student"
   - Fill form
   - Submit
   - Verify student appears in list

6. **Update Student**
   - Click edit on a student
   - Modify data
   - Save
   - Verify changes

7. **Delete Student**
   - Click delete on a student
   - Confirm deletion
   - Verify student removed

### Automated Testing

```bash
# Run Selenium tests
cd selenium_tests
BASE_URL=http://<app-url> pytest -v --html=report.html

# View report
open report.html
```

## Monitoring and Maintenance

### Kubernetes Monitoring

```bash
# Watch pod status
kubectl get pods --watch

# View resource usage
kubectl top nodes
kubectl top pods

# Check events
kubectl get events --sort-by='.lastTimestamp'

# View logs
kubectl logs -f deployment/backend
kubectl logs -f deployment/frontend
```

### Docker Compose Monitoring

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# View resource usage
docker stats

# Restart services
docker-compose restart
```

### Database Backup

**Kubernetes:**
```bash
# Backup MongoDB
kubectl exec -it mongodb-0 -- mongodump --out=/tmp/backup

# Copy backup
kubectl cp mongodb-0:/tmp/backup ./mongodb-backup
```

**Docker Compose:**
```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --out=/tmp/backup

# Copy backup
docker cp <container-id>:/tmp/backup ./mongodb-backup
```

### Scaling

**Kubernetes:**
```bash
# Scale backend
kubectl scale deployment backend --replicas=3

# Scale frontend
kubectl scale deployment frontend --replicas=3

# Verify
kubectl get pods
```

**Docker Compose:**
```bash
# Scale services
docker-compose up -d --scale backend=3 --scale frontend=3
```

### Updates and Rollouts

**Kubernetes:**
```bash
# Update image
kubectl set image deployment/backend backend=<username>/sms-backend:v2

# Check rollout status
kubectl rollout status deployment/backend

# Rollback if needed
kubectl rollout undo deployment/backend
```

## Troubleshooting

### Application Won't Start

**Check logs:**
```bash
# Docker Compose
docker-compose logs backend

# Kubernetes
kubectl logs -l app=backend
```

**Common issues:**
- MongoDB connection failed → Check MONGODB_URI
- Port already in use → Change PORT in environment
- Missing dependencies → Run `npm install`

### Database Connection Issues

**Verify MongoDB:**
```bash
# Docker Compose
docker-compose exec mongodb mongo --eval "db.adminCommand('ping')"

# Kubernetes
kubectl exec -it mongodb-0 -- mongo --eval "db.adminCommand('ping')"
```

**Check connection string:**
```bash
# Kubernetes
kubectl get secret app-secrets -o jsonpath='{.data.mongodb_uri}' | base64 --decode
```

### Kubernetes Pods Not Starting

**Check pod status:**
```bash
kubectl describe pod <pod-name>
```

**Common issues:**
- ImagePullBackOff → Check image name and Docker Hub access
- CrashLoopBackOff → Check logs for application errors
- Pending → Check resource availability

### CI/CD Pipeline Failures

**Lint stage fails:**
```bash
# Run locally
npm run lint

# Fix errors
npm run lint -- --fix
```

**Test stage fails:**
```bash
# Run locally
npm test

# Debug specific test
npm test -- --verbose
```

**Deploy stage fails:**
- Verify Azure credentials
- Check AKS cluster is running
- Verify kubectl can access cluster

### Performance Issues

**Check resource usage:**
```bash
# Kubernetes
kubectl top pods
kubectl top nodes

# Docker
docker stats
```

**Scale if needed:**
```bash
# Kubernetes
kubectl scale deployment backend --replicas=3

# Docker Compose
docker-compose up -d --scale backend=3
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Azure AKS Documentation](https://docs.microsoft.com/en-us/azure/aks/)
- [Ansible Documentation](https://docs.ansible.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [Selenium Documentation](https://www.selenium.dev/documentation/)

## Support

For issues or questions:
1. Check this deployment guide
2. Review specific README files in subdirectories
3. Check application logs
4. Verify all prerequisites are met
5. Test components individually
6. Review troubleshooting section

## Next Steps

After successful deployment:
1. Configure monitoring and alerting
2. Set up automated backups
3. Implement SSL/TLS certificates
4. Configure custom domain
5. Set up log aggregation
6. Implement security hardening
7. Configure auto-scaling policies
8. Set up disaster recovery plan
