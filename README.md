# Student Management System

A comprehensive 3-tier web application for managing student records with authentication, user profiles, and full DevOps pipeline integration. Built for the CSC418 DevOps assignment demonstrating containerization, CI/CD automation, Kubernetes orchestration, configuration management, and automated testing.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Deployment Options](#deployment-options)
  - [Local Development](#local-development)
  - [Docker Compose](#docker-compose)
  - [Kubernetes (AKS)](#kubernetes-aks)
  - [Ansible Configuration](#ansible-configuration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Features

- **User Authentication** - Secure registration and login with session management
- **User Profiles** - View and edit personal information
- **Student Management** - Full CRUD operations for student records
- **Navigation System** - Multi-tab interface (Home, Students, Profile)
- **Responsive UI** - Clean, modern interface with form validation
- **Health Monitoring** - Health check endpoints for all services
- **Containerized** - Docker containers for frontend, backend, and database
- **Kubernetes Ready** - Production-grade deployment manifests
- **CI/CD Automated** - GitHub Actions pipeline with automated testing
- **Configuration Management** - Ansible playbooks for infrastructure automation
- **Automated Testing** - Selenium browser tests and Jest unit tests

## Technology Stack

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- Nginx web server
- Client-side routing for SPA behavior

**Backend:**
- Node.js 18 LTS
- Express.js 4.x
- Mongoose 7.x (MongoDB ODM)
- bcrypt for password hashing
- express-session for authentication

**Database:**
- MongoDB 6.0

**DevOps:**
- Docker & Docker Compose
- Kubernetes (Azure AKS)
- GitHub Actions (CI/CD)
- Ansible (Configuration Management)
- Selenium (Automated Testing)
- ESLint (Code Quality)
- Jest (Unit Testing)

## Quick Start

**New to the project?** Check out the [Quick Start Guide](QUICK_START.md) for the fastest way to get up and running!

### 5-Minute Local Setup

```bash
# 1. Clone and install
git clone <repository-url>
cd student-management-system
npm install

# 2. Start MongoDB
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

**Access:** http://localhost:3000

### 10-Minute Docker Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd student-management-system

# 2. Start all services
docker-compose up -d

# 3. Access the application
# Frontend: http://localhost
# Backend: http://localhost:3000
```

For detailed instructions, see [QUICK_START.md](QUICK_START.md) or [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## Documentation

### Getting Started
- **[Quick Start Guide](QUICK_START.md)** - Get running in 5-10 minutes
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[Environment Variables](ENVIRONMENT_VARIABLES.md)** - Configuration reference
- **[Project Structure](PROJECT_STRUCTURE.md)** - Codebase organization

### DevOps
- **[CI/CD Setup](CI_CD_SETUP.md)** - GitHub Actions pipeline configuration
- **[Kubernetes Deployment](k8s/README.md)** - AKS deployment guide
- **[Ansible Automation](ansible/README.md)** - Infrastructure automation
- **[Frontend Docker](FRONTEND_DOCKER.md)** - Frontend containerization

### Testing
- **[Selenium Tests](selenium_tests/README.md)** - Automated browser testing
- **[Test Summary](selenium_tests/TEST_SUMMARY.md)** - Test results overview
- **[Quick Start Testing](selenium_tests/QUICK_START.md)** - Run tests quickly

### Submission
- **[Submission Checklist](SUBMISSION_CHECKLIST.md)** - Complete pre-submission verification
- **[Screenshots Guide](screenshots/README.md)** - Screenshot requirements
- **[Secrets Template](SECRETS_TEMPLATE.md)** - GitHub secrets configuration

## Deployment Options

### Local Development

For development without Docker:

```bash
# Install dependencies
npm install

# Start MongoDB (separate terminal)
mongod

# Start the application
npm start

# Or use nodemon for auto-reload
npm run dev
```

Access at http://localhost:3000

### Docker Compose

The easiest way to run the complete application stack:

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

**Services:**
- Frontend: http://localhost (port 80)
- Backend: http://localhost:3000
- MongoDB: localhost:27017 (internal only)

**Environment Configuration:**

Edit `docker-compose.yml` to customize:
- `API_BASE_URL` - Frontend API endpoint
- `MONGODB_URI` - Database connection string
- `SESSION_SECRET` - Session encryption key

For detailed Docker documentation, see [FRONTEND_DOCKER.md](FRONTEND_DOCKER.md).

### Kubernetes (AKS)

Deploy to Azure Kubernetes Service for production:

#### Prerequisites

- Azure account with active subscription
- Azure CLI installed and configured
- kubectl CLI installed
- AKS cluster created and running
- Docker images pushed to Docker Hub

#### Quick Deploy

```bash
# 1. Get AKS credentials
az aks get-credentials --resource-group <resource-group> --name <cluster-name>

# 2. Create ConfigMap
kubectl apply -f k8s/app-configmap.yaml

# 3. Create Secrets
kubectl create secret generic app-secrets \
  --from-literal=mongodb_uri="mongodb://mongodb:27017/examdb" \
  --from-literal=session_secret="$(openssl rand -base64 32)"

# 4. Deploy all services
kubectl apply -f k8s/

# 5. Wait for deployment
kubectl wait --for=condition=ready pod --all --timeout=300s

# 6. Get frontend external IP
kubectl get service frontend

# 7. Access application
# Use the EXTERNAL-IP from the previous command
```

#### Deployment Order

For manual step-by-step deployment:

```bash
# 1. ConfigMap and Secrets (must be first)
kubectl apply -f k8s/app-configmap.yaml
kubectl apply -f k8s/app-secrets.yaml

# 2. MongoDB (StatefulSet with persistent storage)
kubectl apply -f k8s/mongodb-statefulset.yaml
kubectl apply -f k8s/mongodb-service.yaml

# 3. Backend (API server)
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# 4. Frontend (Nginx web server)
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

#### Verification

```bash
# Check all resources
kubectl get all

# Check pod status
kubectl get pods

# Check services
kubectl get services

# View logs
kubectl logs -l app=backend
kubectl logs -l app=frontend
kubectl logs -l app=mongodb

# Test health endpoints
kubectl exec -it deployment/backend -- curl http://localhost:3000/health
```

For detailed Kubernetes documentation, see [k8s/README.md](k8s/README.md).

### Ansible Configuration

Automate infrastructure setup with Ansible:

#### Prerequisites

- Ansible installed on control machine
- SSH access to target servers
- Sudo privileges on target servers

#### Quick Setup

```bash
# 1. Navigate to ansible directory
cd ansible

# 2. Update inventory with your server IPs
nano hosts.ini

# 3. Test connectivity
ansible all -i hosts.ini -m ping

# 4. Run playbook
ansible-playbook -i hosts.ini playbook.yml

# 5. Verify installation
ansible all -i hosts.ini -m command -a "docker --version"
ansible all -i hosts.ini -m command -a "node --version"
```

#### What Gets Installed

- **Common utilities** - curl, wget, git, vim
- **Docker CE** - Container runtime
- **Docker Compose** - Multi-container orchestration
- **Node.js 18** - JavaScript runtime
- **npm** - Package manager
- **Firewall rules** - UFW with required ports
- **Application deployment** - Docker Compose setup

For detailed Ansible documentation, see [ansible/README.md](ansible/README.md).

## CI/CD Pipeline

Automated GitHub Actions pipeline for continuous integration and deployment.

### Pipeline Stages

1. **Lint** - ESLint code quality checks
2. **Unit Tests** - Jest test execution with coverage
3. **Build Docker Images** - Build and push to Docker Hub
4. **Integration Tests** - Test services with docker-compose
5. **Deploy to AKS** - Automated Kubernetes deployment
6. **Selenium Tests** - Automated browser testing

### Setup Instructions

1. **Configure GitHub Secrets:**

   Go to Repository → Settings → Secrets and variables → Actions

   Add the following secrets:
   - `DOCKER_USERNAME` - Docker Hub username
   - `DOCKER_PASSWORD` - Docker Hub access token
   - `AZURE_CREDENTIALS` - Azure service principal JSON
   - `AKS_CLUSTER_NAME` - AKS cluster name
   - `AKS_RESOURCE_GROUP` - Azure resource group

2. **Trigger Pipeline:**
   ```bash
   # Push to main branch
   git push origin main
   
   # Or create pull request
   git checkout -b feature-branch
   git push origin feature-branch
   # Create PR on GitHub
   ```

3. **Monitor Execution:**
   - Go to GitHub repository → Actions tab
   - Click on the workflow run
   - View logs for each stage

For detailed CI/CD documentation, see [CI_CD_SETUP.md](CI_CD_SETUP.md).

### Local Testing

Test pipeline stages locally before pushing:

```bash
# Lint
npm run lint

# Unit tests
npm test

# Unit tests with coverage
npm test -- --coverage

# Build Docker images
docker build -t sms-backend:test -f Dockerfile .
docker build -t sms-frontend:test -f frontend.Dockerfile .

# Integration test
docker-compose up -d
sleep 30
curl http://localhost:3000/health
curl http://localhost/health.html
docker-compose down -v
```

## Testing

### Unit Tests (Jest)

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- routes/auth.test.js

# Watch mode
npm test -- --watch
```

### Selenium Tests

Automated browser tests for end-to-end validation:

```bash
# Navigate to test directory
cd selenium_tests

# Install dependencies
pip install -r requirements.txt

# Run all tests
pytest -v --html=test_report.html --self-contained-html

# Run specific test
pytest test_login.py -v

# Run against different URL
BASE_URL=http://your-app-url pytest
```

**Test Coverage:**
- Homepage load and elements
- User registration and login
- Invalid login handling
- Student CRUD operations
- Navigation between tabs
- Profile view and display

For detailed testing documentation, see [selenium_tests/README.md](selenium_tests/README.md).

### Property-Based Tests

Property-based tests validate universal properties across all inputs:

```bash
# Run property tests
npm test -- --testPathPattern=property

# Tests include:
# - Password hashing properties
# - Session lifecycle properties
# - Duplicate detection properties
# - Data persistence properties
```

## Environment Variables

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3000 | No |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/examdb | Yes |
| `SESSION_SECRET` | Session encryption key | - | Yes |
| `NODE_ENV` | Environment (development/production) | development | No |

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `API_BASE_URL` | Backend API endpoint | http://localhost:3000 | Yes |

### Setting Environment Variables

**Local Development (.env file):**
```bash
MONGODB_URI=mongodb://localhost:27017/examdb
SESSION_SECRET=your-secret-key-here
PORT=3000
```

**Docker Compose:**
```yaml
environment:
  - MONGODB_URI=mongodb://mongodb:27017/examdb
  - SESSION_SECRET=your-secret-key-here
```

**Kubernetes:**
```bash
# ConfigMap for non-sensitive data
kubectl apply -f k8s/app-configmap.yaml

# Secrets for sensitive data
kubectl create secret generic app-secrets \
  --from-literal=mongodb_uri="mongodb://mongodb:27017/examdb" \
  --from-literal=session_secret="$(openssl rand -base64 32)"
```

**Generating Secure Session Secret:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## API Documentation

### Authentication Endpoints

**Register User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "fullName": "John Doe"
}

Response: 201 Created
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe"
  }
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword"
}

Response: 200 OK
{
  "message": "Login successful",
  "user": { ... }
}
```

**Logout**
```http
POST /api/auth/logout

Response: 200 OK
{
  "message": "Logout successful"
}
```

**Get Current User**
```http
GET /api/auth/me

Response: 200 OK
{
  "user": { ... }
}
```

### User Profile Endpoints

**Get Profile**
```http
GET /api/users/profile

Response: 200 OK
{
  "username": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Update Profile**
```http
PUT /api/users/profile
Content-Type: application/json

{
  "email": "newemail@example.com",
  "fullName": "John Updated Doe"
}

Response: 200 OK
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

### Student Endpoints

**List Students**
```http
GET /api/students

Response: 200 OK
[
  {
    "id": "...",
    "name": "Jane Smith",
    "registrationNumber": "REG001",
    "email": "jane@example.com",
    "phone": "123-456-7890",
    "address": "123 Main St"
  }
]
```

**Get Student**
```http
GET /api/students/:id

Response: 200 OK
{
  "id": "...",
  "name": "Jane Smith",
  ...
}
```

**Create Student**
```http
POST /api/students
Content-Type: application/json

{
  "name": "Jane Smith",
  "registrationNumber": "REG001",
  "email": "jane@example.com",
  "phone": "123-456-7890",
  "address": "123 Main St"
}

Response: 201 Created
{
  "message": "Student created successfully",
  "student": { ... }
}
```

**Update Student**
```http
PUT /api/students/:id
Content-Type: application/json

{
  "name": "Jane Updated Smith",
  ...
}

Response: 200 OK
{
  "message": "Student updated successfully",
  "student": { ... }
}
```

**Delete Student**
```http
DELETE /api/students/:id

Response: 200 OK
{
  "message": "Student deleted successfully"
}
```

### Health Check Endpoints

**Backend Health**
```http
GET /health

Response: 200 OK
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Frontend Health**
```http
GET /health.html

Response: 200 OK
(HTML page)
```

## Screenshots

### Application Screenshots

**Login Page**
![Login Page](screenshots/login.png)
*User authentication with registration link*

**Dashboard (Home Tab)**
![Dashboard](screenshots/dashboard.png)
*Welcome message and system statistics*

**Student Management**
![Student List](screenshots/students.png)
*CRUD operations for student records*

**User Profile**
![Profile](screenshots/profile.png)
*View and edit user information*

**Navigation**
![Navigation](screenshots/navigation.png)
*Multi-tab interface with active highlighting*

### DevOps Screenshots

**Docker Compose**
![Docker Compose](screenshots/docker-compose.png)
*All services running with docker-compose*

**Kubernetes Dashboard**
![Kubernetes](screenshots/kubernetes.png)
*Pods, services, and deployments in AKS*

**CI/CD Pipeline**
![GitHub Actions](screenshots/github-actions.png)
*Automated pipeline execution*

**Selenium Test Report**
![Selenium Report](screenshots/selenium-report.png)
*Automated test results with pass/fail status*

**Ansible Playbook**
![Ansible](screenshots/ansible.png)
*Infrastructure automation execution*

> **Note:** Add actual screenshots to the `screenshots/` directory before submission. See [screenshots/README.md](screenshots/README.md) for detailed guidelines.

## Project Structure

The codebase is organized into clear, logical sections:

```
student-management-system/
├── .github/workflows/        # CI/CD pipeline
├── ansible/                  # Infrastructure automation
├── k8s/                      # Kubernetes manifests
├── middleware/               # Express middleware
├── models/                   # Data models
├── public/                   # Frontend files
├── routes/                   # API routes
├── selenium_tests/           # E2E tests
├── screenshots/              # Documentation screenshots
├── server.js                 # Application entry point
├── docker-compose.yml        # Multi-container setup
├── Dockerfile                # Backend image
├── frontend.Dockerfile       # Frontend image
└── [documentation files]     # Guides and references
```

For a complete breakdown, see [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md).

## Troubleshooting

### Common Issues

#### Application won't start

**Problem:** Backend fails to connect to MongoDB

**Solution:**
```bash
# Check MongoDB is running
docker ps | grep mongo

# Check connection string
echo $MONGODB_URI

# Restart MongoDB
docker-compose restart mongodb
```

#### Docker build fails

**Problem:** Docker build errors or timeouts

**Solution:**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check Docker disk space
docker system df
```

#### Kubernetes pods not starting

**Problem:** Pods stuck in Pending or CrashLoopBackOff

**Solution:**
```bash
# Check pod status
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Verify secrets exist
kubectl get secrets

# Check resource availability
kubectl top nodes
```

#### CI/CD pipeline fails

**Problem:** Pipeline fails at specific stage

**Solution:**
```bash
# Test locally first
npm run lint
npm test
docker-compose up -d

# Verify GitHub secrets are set
# Check pipeline logs in Actions tab
# Ensure AKS cluster is accessible
```

#### Selenium tests fail

**Problem:** Tests timeout or elements not found

**Solution:**
```bash
# Verify application is running
curl http://localhost/health.html

# Check BASE_URL is correct
echo $BASE_URL

# Run tests with visible browser (remove --headless)
# Increase wait times in conftest.py
```

### Getting Help

1. Check the relevant README files:
   - [CI_CD_SETUP.md](CI_CD_SETUP.md)
   - [k8s/README.md](k8s/README.md)
   - [ansible/README.md](ansible/README.md)
   - [selenium_tests/README.md](selenium_tests/README.md)

2. Review application logs:
   ```bash
   # Docker Compose
   docker-compose logs -f
   
   # Kubernetes
   kubectl logs -l app=backend
   kubectl logs -l app=frontend
   ```

3. Check health endpoints:
   ```bash
   curl http://localhost:3000/health
   curl http://localhost/health.html
   ```

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test locally
4. Run linting: `npm run lint`
5. Run tests: `npm test`
6. Commit changes: `git commit -m "Description"`
7. Push to branch: `git push origin feature-name`
8. Create pull request

### Code Style

- Follow ESLint rules (`.eslintrc.json`)
- Use meaningful variable names
- Add comments for complex logic
- Write tests for new features
- Update documentation

### Testing Requirements

- All new features must include unit tests
- Maintain test coverage above 70%
- Add Selenium tests for UI changes
- Verify all tests pass before submitting PR

## License

This project is created for educational purposes as part of the CSC418 DevOps course.

## Acknowledgments

- Built for CSC418 DevOps Assignment
- Demonstrates containerization, CI/CD, Kubernetes, Ansible, and automated testing
- Uses modern DevOps best practices and tools
