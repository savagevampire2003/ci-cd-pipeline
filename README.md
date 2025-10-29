# Student Records Management System

A simple full-stack app to manage student records (name, registration number, email, phone, address) with a clean UI.

Tech: Node.js, Express, MongoDB, HTML/CSS/JS. Containerized with Docker and deployable to AKS.

## Run locally (with Docker Compose)

```powershell
cd C:\Users\amc\Desktop\App
npm install
docker-compose up --build
```

Open http://localhost:3000

## Docker

```powershell
# Build
docker build -t adeelahmad2003/student-records:latest .

# Run (uses local Mongo via docker-compose)
docker-compose up
```

## Kubernetes (AKS) quick deploy

```bash
az aks get-credentials --resource-group student-records-rg --name student-records-aks
kubectl apply -f k8s/mongo-deployment.yaml
kubectl apply -f k8s/app-deployment.yaml
kubectl get svc student-record-management-app-svc
```

## API endpoints

- GET /api/students
- POST /api/students
- GET /api/students/:id
- PUT /api/students/:id
- DELETE /api/students/:id
