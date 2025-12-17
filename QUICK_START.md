# Quick Start Guide

Get the Student Management System up and running in minutes!

## Choose Your Deployment Method

- [Local Development](#local-development-5-minutes) - Fastest way to start developing
- [Docker Compose](#docker-compose-10-minutes) - Complete stack with one command
- [Kubernetes (AKS)](#kubernetes-aks-30-minutes) - Production-ready deployment

---

## Local Development (5 minutes)

Perfect for development and testing.

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- Git

### Steps

```bash
# 1. Clone and install
git clone <repository-url>
cd student-management-system
npm install

# 2. Start MongoDB (using Docker)
docker run -d -p 27017:27017 --name mongodb mongo:6.0

# 3. Create environment file
cat > .env << EOF
PORT=3000
MONGODB_URI=mongodb://localhost:27017/examdb
SESSION_SECRET=$(openssl rand -base64 32)
NODE_ENV=development
EOF

# 4. Start the application
npm start
```

### Access the Application

Open http://localhost:3000 in your browser.

### Next Steps

- Register a new user account
- Create some student records
- Run tests: `npm test`
- Run linter: `npm run lint`

---

## Docker Compose (10 minutes)

Complete application stack with frontend, backend, and database.

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Steps

```bash
# 1. Clone repository
git clone <repository-url>
cd student-management-system

# 2. Create environment file (optional)
cat > .env << EOF
SESSION_SECRET=$(openssl rand -base64 32)
EOF

# 3. Start all services
docker-compose up -d

# 4. Wait for services to be ready (30 seconds)
sleep 30

# 5. Verify health
curl http://localhost:3000/health
curl http://localhost/health.html
```

### Access the Application

- **Frontend:** http://localhost
- **Backend API:** http://localhost:3000
- **MongoDB:** localhost:27017 (internal only)

### Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Clean slate (removes data)
docker-compose down -v
```

### Next Steps

- Register a new user at http://localhost
- Test the API endpoints
- Run Selenium tests (see below)

---

## Kubernetes (AKS) (30 minutes)

Production-ready deployment on Azure Kubernetes Service.

### Prerequisites
- Azure account with active subscription
- Azure CLI installed
- kubectl installed
- Docker Hub account

### Quick Deploy

```bash
# 1. Login to Azure
az login

# 2. Create AKS cluster (if not exists)
az aks create \
  --resource-group sms-resource-group \
  --name sms-aks-cluster \
  --node-count 2 \
  --node-vm-size Standard_B2s \
  --generate-ssh-keys

# 3. Get credentials
az aks get-credentials \
  --resource-group sms-resource-group \
  --name sms-aks-cluster

# 4. Build and push images
docker login
docker build -t <your-username>/sms-backend:latest -f Dockerfile .
docker build -t <your-username>/sms-frontend:latest -f frontend.Dockerfile .
docker push <your-username>/sms-backend:latest
docker push <your-username>/sms-frontend:latest

# 5. Update image names in k8s/*.yaml files
# Edit k8s/backend-deployment.yaml and k8s/frontend-deployment.yaml
# Replace image names with your Docker Hub username

# 6. Create ConfigMap
kubectl apply -f k8s/app-configmap.yaml

# 7. Create Secrets
kubectl create secret generic app-secrets \
  --from-literal=mongodb_uri="mongodb://mongodb:27017/examdb" \
  --from-literal=session_secret="$(openssl rand -base64 32)"

# 8. Deploy all services
kubectl apply -f k8s/

# 9. Wait for deployment
kubectl wait --for=condition=ready pod --all --timeout=300s

# 10. Get external IP
kubectl get service frontend
```

### Access the Application

Wait for EXTERNAL-IP to be assigned (may take 2-5 minutes), then access:

```bash
EXTERNAL_IP=$(kubectl get service frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Application URL: http://$EXTERNAL_IP"
```

### Useful Commands

```bash
# Check status
kubectl get all

# View logs
kubectl logs -l app=backend
kubectl logs -l app=frontend

# Scale deployment
kubectl scale deployment backend --replicas=3

# Delete everything
kubectl delete -f k8s/
```

### Next Steps

- Configure custom domain
- Set up SSL/TLS certificates
- Configure CI/CD pipeline
- Set up monitoring and alerts

---

## Running Tests

### Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- routes/auth.test.js
```

### Selenium Tests

```bash
# Install dependencies
cd selenium_tests
pip install -r requirements.txt

# Run tests (application must be running)
pytest -v --html=test_report.html --self-contained-html

# Run against different URL
BASE_URL=http://your-app-url pytest -v
```

### Linting

```bash
# Check code quality
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

---

## Common Tasks

### Register First User

1. Open the application in browser
2. Click "Register here"
3. Fill in the form:
   - Username: testuser
   - Email: test@example.com
   - Password: password123
   - Full Name: Test User
4. Click "Register"
5. Login with credentials

### Create Student Record

1. Login to the application
2. Click "Students" tab
3. Click "Add Student" button
4. Fill in the form:
   - Name: John Doe
   - Registration Number: REG001
   - Email: john@example.com
   - Phone: 123-456-7890
   - Address: 123 Main St
5. Click "Add Student"

### View User Profile

1. Login to the application
2. Click "Profile" tab
3. View your account information
4. Click "Edit Profile" to update

### Check Application Health

```bash
# Backend health
curl http://localhost:3000/health

# Frontend health
curl http://localhost/health.html

# Kubernetes health
kubectl get pods
```

---

## Troubleshooting

### Application won't start

**Check MongoDB connection:**
```bash
# Local
mongo --eval "db.adminCommand('ping')"

# Docker
docker-compose exec mongodb mongo --eval "db.adminCommand('ping')"
```

**Check environment variables:**
```bash
# Local
cat .env

# Docker
docker-compose exec backend env | grep MONGODB_URI
```

### Port already in use

**Find and kill process:**
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

### Docker build fails

**Clear cache and rebuild:**
```bash
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

### Kubernetes pods not starting

**Check pod status:**
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

**Common issues:**
- ImagePullBackOff → Check image name and Docker Hub access
- CrashLoopBackOff → Check logs for application errors
- Pending → Check resource availability

---

## Next Steps

### For Development
1. Read [README.md](README.md) for complete documentation
2. Review [API Documentation](README.md#api-documentation)
3. Check [Testing Strategy](README.md#testing)
4. Review code in `server.js`, `routes/`, `models/`

### For DevOps
1. Set up [CI/CD Pipeline](CI_CD_SETUP.md)
2. Configure [Ansible Automation](ansible/README.md)
3. Review [Kubernetes Deployment](k8s/README.md)
4. Set up monitoring and logging

### For Production
1. Configure SSL/TLS certificates
2. Set up custom domain
3. Enable authentication for MongoDB
4. Configure backup and disaster recovery
5. Set up monitoring and alerting
6. Implement rate limiting
7. Configure auto-scaling

---

## Getting Help

### Documentation
- [README.md](README.md) - Complete documentation
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Detailed deployment instructions
- [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) - Environment configuration
- [CI_CD_SETUP.md](CI_CD_SETUP.md) - CI/CD pipeline setup
- [k8s/README.md](k8s/README.md) - Kubernetes deployment
- [ansible/README.md](ansible/README.md) - Ansible automation
- [selenium_tests/README.md](selenium_tests/README.md) - Automated testing

### Check Logs
```bash
# Local
npm start

# Docker Compose
docker-compose logs -f

# Kubernetes
kubectl logs -l app=backend
kubectl logs -l app=frontend
```

### Verify Health
```bash
# Backend
curl http://localhost:3000/health

# Frontend
curl http://localhost/health.html

# Database
mongo --eval "db.adminCommand('ping')"
```

---

## Summary

You now have the Student Management System running! Here's what you can do:

✅ Register users and manage authentication  
✅ Create, read, update, and delete student records  
✅ Navigate between Home, Students, and Profile tabs  
✅ View and edit user profiles  
✅ Run automated tests  
✅ Deploy to production with Kubernetes  

For more details, see the [complete documentation](README.md).

Happy coding! 🚀
