# Environment Variables Reference

Complete reference for all environment variables used in the Student Management System across different deployment methods.

## Table of Contents

- [Backend Environment Variables](#backend-environment-variables)
- [Frontend Environment Variables](#frontend-environment-variables)
- [MongoDB Environment Variables](#mongodb-environment-variables)
- [CI/CD Environment Variables](#cicd-environment-variables)
- [Configuration by Deployment Method](#configuration-by-deployment-method)
- [Security Best Practices](#security-best-practices)
- [Examples](#examples)

## Backend Environment Variables

### PORT

- **Description:** Port number for the Express.js server
- **Type:** Number
- **Default:** 3000
- **Required:** No
- **Example:** `PORT=3000`
- **Used in:** Local development, Docker, Kubernetes


### MONGODB_URI

- **Description:** MongoDB connection string
- **Type:** String
- **Default:** None
- **Required:** Yes
- **Example:** `MONGODB_URI=mongodb://localhost:27017/examdb`
- **Used in:** Local development, Docker, Kubernetes
- **Format:** `mongodb://[username:password@]host[:port]/database[?options]`

**Connection String Examples:**

```bash
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/examdb

# Docker Compose (service name as host)
MONGODB_URI=mongodb://mongodb:27017/examdb

# Kubernetes (service name as host)
MONGODB_URI=mongodb://mongodb:27017/examdb

# MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/examdb

# With authentication
MONGODB_URI=mongodb://admin:password@localhost:27017/examdb?authSource=admin
```

### SESSION_SECRET

- **Description:** Secret key used to sign session cookies
- **Type:** String
- **Default:** None
- **Required:** Yes
- **Example:** `SESSION_SECRET=your-secret-key-here`
- **Used in:** Local development, Docker, Kubernetes
- **Security:** Must be a strong random string (minimum 32 characters)

**Generating Secure Session Secrets:**

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### NODE_ENV

- **Description:** Node.js environment mode
- **Type:** String
- **Default:** development
- **Required:** No
- **Example:** `NODE_ENV=production`
- **Used in:** All environments
- **Valid Values:** `development`, `production`, `test`

**Effects:**
- `development` - Verbose logging, detailed error messages
- `production` - Optimized performance, minimal logging
- `test` - Used during automated testing

## Frontend Environment Variables

### API_BASE_URL

- **Description:** Backend API endpoint URL
- **Type:** String
- **Default:** http://localhost:3000
- **Required:** Yes (for Docker/Kubernetes)
- **Example:** `API_BASE_URL=http://backend:3000`
- **Used in:** Docker, Kubernetes

**Environment-Specific Values:**

```bash
# Local development
API_BASE_URL=http://localhost:3000

# Docker Compose (service name)
API_BASE_URL=http://backend:3000

# Kubernetes (service name)
API_BASE_URL=http://backend:3000

# Production (external URL)
API_BASE_URL=https://api.yourdomain.com
```

**Note:** In the Docker frontend container, this variable is injected at runtime via the `nginx-env.sh` script and made available as `window.ENV.API_BASE_URL` in JavaScript.

## MongoDB Environment Variables

When using the official MongoDB Docker image, you can configure authentication:

### MONGO_INITDB_ROOT_USERNAME

- **Description:** MongoDB root username
- **Type:** String
- **Default:** None
- **Required:** No (but recommended for production)
- **Example:** `MONGO_INITDB_ROOT_USERNAME=admin`

### MONGO_INITDB_ROOT_PASSWORD

- **Description:** MongoDB root password
- **Type:** String
- **Default:** None
- **Required:** No (but recommended for production)
- **Example:** `MONGO_INITDB_ROOT_PASSWORD=securepassword`

### MONGO_INITDB_DATABASE

- **Description:** Database to create on initialization
- **Type:** String
- **Default:** None
- **Required:** No
- **Example:** `MONGO_INITDB_DATABASE=examdb`

**Example with Authentication:**

```yaml
# docker-compose.yml
services:
  mongodb:
    image: mongo:6.0
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=securepassword
      - MONGO_INITDB_DATABASE=examdb
    
  backend:
    environment:
      - MONGODB_URI=mongodb://admin:securepassword@mongodb:27017/examdb?authSource=admin
```

## CI/CD Environment Variables

These are configured as GitHub Secrets and used in the CI/CD pipeline:

### DOCKER_USERNAME

- **Description:** Docker Hub username
- **Type:** String
- **Required:** Yes (for CI/CD)
- **Example:** `johndoe`
- **Where to set:** GitHub Repository → Settings → Secrets → Actions

### DOCKER_PASSWORD

- **Description:** Docker Hub password or access token
- **Type:** String
- **Required:** Yes (for CI/CD)
- **Example:** `dckr_pat_xxxxxxxxxxxxx`
- **Where to set:** GitHub Repository → Settings → Secrets → Actions
- **Recommendation:** Use access token instead of password

### AZURE_CREDENTIALS

- **Description:** Azure service principal credentials (JSON)
- **Type:** JSON String
- **Required:** Yes (for AKS deployment)
- **Format:**
```json
{
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "...",
  "tenantId": "..."
}
```
- **Where to set:** GitHub Repository → Settings → Secrets → Actions

### AKS_CLUSTER_NAME

- **Description:** Azure Kubernetes Service cluster name
- **Type:** String
- **Required:** Yes (for AKS deployment)
- **Example:** `sms-aks-cluster`
- **Where to set:** GitHub Repository → Settings → Secrets → Actions

### AKS_RESOURCE_GROUP

- **Description:** Azure resource group name
- **Type:** String
- **Required:** Yes (for AKS deployment)
- **Example:** `sms-resource-group`
- **Where to set:** GitHub Repository → Settings → Secrets → Actions

## Configuration by Deployment Method

### Local Development

Create a `.env` file in the project root:

```bash
# .env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/examdb
SESSION_SECRET=your-secret-key-here
NODE_ENV=development
```

**Load environment variables:**

```bash
# Using dotenv package (already configured in server.js)
npm start

# Or manually export
export PORT=3000
export MONGODB_URI=mongodb://localhost:27017/examdb
export SESSION_SECRET=your-secret-key-here
npm start
```

### Docker Compose

Configure in `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: frontend.Dockerfile
    environment:
      - API_BASE_URL=http://backend:3000
    ports:
      - "80:80"

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - PORT=3000
      - MONGODB_URI=mongodb://mongodb:27017/examdb
      - SESSION_SECRET=change-this-in-production
      - NODE_ENV=production
    ports:
      - "3000:3000"

  mongodb:
    image: mongo:6.0
    volumes:
      - mongodata:/data/db

volumes:
  mongodata:
```

**Override with .env file:**

Create `.env` file:
```bash
SESSION_SECRET=your-secret-key-here
```

Docker Compose will automatically load variables from `.env` file.

### Kubernetes

#### ConfigMap (Non-Sensitive Data)

Create `k8s/app-configmap.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  api_url: "http://backend:3000"
  node_env: "production"
```

Apply:
```bash
kubectl apply -f k8s/app-configmap.yaml
```

#### Secrets (Sensitive Data)

Create secrets using kubectl:

```bash
# Generate session secret
SESSION_SECRET=$(openssl rand -base64 32)

# Create secret
kubectl create secret generic app-secrets \
  --from-literal=mongodb_uri="mongodb://mongodb:27017/examdb" \
  --from-literal=session_secret="$SESSION_SECRET"
```

#### Use in Deployments

Reference in deployment manifests:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  template:
    spec:
      containers:
      - name: backend
        image: your-username/sms-backend:latest
        env:
        # From ConfigMap
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: node_env
        # From Secret
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongodb_uri
        - name: SESSION_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: session_secret
        # Direct value
        - name: PORT
          value: "3000"
```

### Ansible Deployment

Configure in `ansible/roles/app/templates/env.j2`:

```bash
PORT=3000
MONGODB_URI=mongodb://mongodb:27017/examdb
SESSION_SECRET={{ session_secret }}
NODE_ENV=production
API_BASE_URL=http://backend:3000
```

Define variables in `ansible/playbook.yml` or inventory:

```yaml
vars:
  session_secret: "{{ lookup('password', '/dev/null length=32 chars=ascii_letters,digits') }}"
```

## Security Best Practices

### 1. Never Commit Secrets to Version Control

**Add to `.gitignore`:**
```
.env
.env.local
.env.*.local
k8s/app-secrets.yaml
```

### 2. Use Strong Random Secrets

- Minimum 32 characters
- Use cryptographically secure random generators
- Rotate regularly (every 90 days recommended)

### 3. Different Secrets per Environment

- Development secrets ≠ Production secrets
- Use separate secrets for each environment
- Never use development secrets in production

### 4. Limit Secret Access

- Use Kubernetes RBAC to restrict secret access
- Use separate namespaces for different environments
- Implement least privilege principle

### 5. Encrypt Secrets at Rest

- Enable encryption at rest in Kubernetes
- Use cloud provider secret management:
  - Azure Key Vault
  - AWS Secrets Manager
  - Google Secret Manager

### 6. Use Secret Management Tools

**For Production:**
- Azure Key Vault with CSI driver
- HashiCorp Vault
- AWS Secrets Manager
- Sealed Secrets (for GitOps)

**Example with Azure Key Vault:**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: backend
spec:
  containers:
  - name: backend
    image: backend:latest
    volumeMounts:
    - name: secrets-store
      mountPath: "/mnt/secrets"
      readOnly: true
  volumes:
  - name: secrets-store
    csi:
      driver: secrets-store.csi.k8s.io
      readOnly: true
      volumeAttributes:
        secretProviderClass: "azure-keyvault"
```

### 7. Audit Secret Access

- Enable audit logging
- Monitor secret access patterns
- Alert on suspicious activity

### 8. Rotate Secrets Regularly

**Rotation Schedule:**
- Development: Every 90 days
- Production: Every 30-60 days
- After security incidents: Immediately

**Rotation Process:**
1. Generate new secret
2. Update secret in secret store
3. Restart applications to load new secret
4. Verify applications work with new secret
5. Revoke old secret

## Examples

### Complete Local Development Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd student-management-system

# 2. Install dependencies
npm install

# 3. Create .env file
cat > .env << EOF
PORT=3000
MONGODB_URI=mongodb://localhost:27017/examdb
SESSION_SECRET=$(openssl rand -base64 32)
NODE_ENV=development
EOF

# 4. Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:6.0

# 5. Start application
npm start
```

### Complete Docker Compose Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd student-management-system

# 2. Create .env file for docker-compose
cat > .env << EOF
SESSION_SECRET=$(openssl rand -base64 32)
EOF

# 3. Start all services
docker-compose up -d

# 4. Verify
curl http://localhost:3000/health
curl http://localhost/health.html
```

### Complete Kubernetes Setup

```bash
# 1. Create ConfigMap
kubectl apply -f k8s/app-configmap.yaml

# 2. Create Secrets
SESSION_SECRET=$(openssl rand -base64 32)
kubectl create secret generic app-secrets \
  --from-literal=mongodb_uri="mongodb://mongodb:27017/examdb" \
  --from-literal=session_secret="$SESSION_SECRET"

# 3. Deploy all services
kubectl apply -f k8s/

# 4. Wait for deployment
kubectl wait --for=condition=ready pod --all --timeout=300s

# 5. Get external IP
kubectl get service frontend

# 6. Verify
EXTERNAL_IP=$(kubectl get service frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
curl http://$EXTERNAL_IP/health.html
```

## Troubleshooting

### Backend Cannot Connect to MongoDB

**Check connection string:**
```bash
# Local
echo $MONGODB_URI

# Docker
docker-compose exec backend env | grep MONGODB_URI

# Kubernetes
kubectl exec deployment/backend -- env | grep MONGODB_URI
```

**Verify MongoDB is running:**
```bash
# Local
mongo --eval "db.adminCommand('ping')"

# Docker
docker-compose exec mongodb mongo --eval "db.adminCommand('ping')"

# Kubernetes
kubectl exec mongodb-0 -- mongo --eval "db.adminCommand('ping')"
```

### Frontend Cannot Connect to Backend

**Check API URL:**
```bash
# Docker
docker-compose exec frontend cat /usr/share/nginx/html/config.js

# Kubernetes
kubectl exec deployment/frontend -- cat /usr/share/nginx/html/config.js
```

**Test backend connectivity:**
```bash
# Docker
docker-compose exec frontend curl http://backend:3000/health

# Kubernetes
kubectl exec deployment/frontend -- curl http://backend:3000/health
```

### Session Secret Not Set

**Error:** `Error: SESSION_SECRET environment variable is required`

**Solution:**
```bash
# Generate and set secret
export SESSION_SECRET=$(openssl rand -base64 32)

# Or add to .env file
echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env
```

### Environment Variables Not Loading

**Docker Compose:**
- Verify `.env` file exists in same directory as `docker-compose.yml`
- Check variable names match exactly
- Restart containers: `docker-compose restart`

**Kubernetes:**
- Verify ConfigMap exists: `kubectl get configmap app-config`
- Verify Secret exists: `kubectl get secret app-secrets`
- Check pod environment: `kubectl exec deployment/backend -- env`
- Restart pods: `kubectl rollout restart deployment/backend`

## Additional Resources

- [Node.js Environment Variables](https://nodejs.org/api/process.html#process_process_env)
- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Kubernetes ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/)
- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [12-Factor App Config](https://12factor.net/config)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
