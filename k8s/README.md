# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying the Student Management System to Azure Kubernetes Service (AKS) or any Kubernetes cluster.

## Prerequisites

- Kubernetes cluster (AKS or other)
- `kubectl` CLI installed and configured
- Docker images pushed to Docker Hub or container registry

## Configuration Files

### ConfigMap (`app-configmap.yaml`)

Contains non-sensitive configuration data:
- `api_url`: Backend API endpoint URL for frontend

**To apply:**
```bash
kubectl apply -f app-configmap.yaml
```

**To view:**
```bash
kubectl get configmap app-config -o yaml
```

**To update:**
Edit the `app-configmap.yaml` file and reapply:
```bash
kubectl apply -f app-configmap.yaml
```

### Secrets (`app-secrets.yaml`)

Contains sensitive configuration data:
- `mongodb_uri`: MongoDB connection string
- `session_secret`: Secret key for session encryption

**IMPORTANT: The `app-secrets.yaml.template` file is a template only. Do NOT commit actual secrets to version control.**

## Creating Secrets

### Method 1: Using the Template (Recommended for Development)

1. Copy the template file:
   ```bash
   cp app-secrets.yaml.template app-secrets.yaml
   ```

2. Generate a strong session secret:
   ```bash
   # On Linux/Mac:
   openssl rand -base64 32
   
   # On Windows (PowerShell):
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   ```

3. Edit `app-secrets.yaml` and replace `REPLACE_WITH_STRONG_RANDOM_SECRET` with the generated secret

4. Apply the secret:
   ```bash
   kubectl apply -f app-secrets.yaml
   ```

5. **IMPORTANT:** Add `app-secrets.yaml` to `.gitignore` to prevent committing secrets:
   ```bash
   echo "k8s/app-secrets.yaml" >> .gitignore
   ```

### Method 2: Using kubectl create secret (Recommended for Production)

Create the secret directly without a YAML file:

```bash
# Generate session secret
SESSION_SECRET=$(openssl rand -base64 32)

# Create the secret
kubectl create secret generic app-secrets \
  --from-literal=mongodb_uri="mongodb://mongodb:27017/examdb" \
  --from-literal=session_secret="$SESSION_SECRET"
```

### Method 3: Using kubectl from Environment Variables

```bash
# Set environment variables
export MONGODB_URI="mongodb://mongodb:27017/examdb"
export SESSION_SECRET=$(openssl rand -base64 32)

# Create secret from environment variables
kubectl create secret generic app-secrets \
  --from-literal=mongodb_uri="$MONGODB_URI" \
  --from-literal=session_secret="$SESSION_SECRET"
```

### Method 4: Using Base64 Encoded Values (Advanced)

If you need to use `data` instead of `stringData` in the YAML:

1. Encode your secrets:
   ```bash
   echo -n "mongodb://mongodb:27017/examdb" | base64
   echo -n "your-session-secret" | base64
   ```

2. Create a YAML file with encoded values:
   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: app-secrets
   type: Opaque
   data:
     mongodb_uri: bW9uZ29kYjovL21vbmdvZGI6MjcwMTcvZXhhbWRi
     session_secret: eW91ci1zZXNzaW9uLXNlY3JldA==
   ```

3. Apply the secret:
   ```bash
   kubectl apply -f app-secrets.yaml
   ```

## Viewing Secrets

**List secrets:**
```bash
kubectl get secrets
```

**View secret details (values are hidden):**
```bash
kubectl describe secret app-secrets
```

**View secret values (decoded):**
```bash
# View all keys
kubectl get secret app-secrets -o jsonpath='{.data}'

# View specific key (decoded)
kubectl get secret app-secrets -o jsonpath='{.data.mongodb_uri}' | base64 --decode
kubectl get secret app-secrets -o jsonpath='{.data.session_secret}' | base64 --decode
```

## Updating Secrets

### Option 1: Delete and Recreate
```bash
kubectl delete secret app-secrets
kubectl create secret generic app-secrets \
  --from-literal=mongodb_uri="mongodb://mongodb:27017/examdb" \
  --from-literal=session_secret="new-secret-value"
```

### Option 2: Edit Directly
```bash
kubectl edit secret app-secrets
```

### Option 3: Patch Existing Secret
```bash
kubectl patch secret app-secrets -p '{"stringData":{"session_secret":"new-secret-value"}}'
```

**Note:** After updating secrets, you need to restart pods for changes to take effect:
```bash
kubectl rollout restart deployment/backend
```

## Deployment Order

Deploy resources in this order:

1. **ConfigMap and Secrets** (must be created first):
   ```bash
   kubectl apply -f app-configmap.yaml
   kubectl apply -f app-secrets.yaml
   ```

2. **MongoDB StatefulSet and Service**:
   ```bash
   kubectl apply -f mongodb-statefulset.yaml
   kubectl apply -f mongodb-service.yaml
   ```

3. **Backend Deployment and Service**:
   ```bash
   kubectl apply -f backend-deployment.yaml
   kubectl apply -f backend-service.yaml
   ```

4. **Frontend Deployment and Service**:
   ```bash
   kubectl apply -f frontend-deployment.yaml
   kubectl apply -f frontend-service.yaml
   ```

## Quick Deployment (All at Once)

```bash
# Apply all manifests
kubectl apply -f .

# Wait for all pods to be ready
kubectl wait --for=condition=ready pod -l app=mongodb --timeout=120s
kubectl wait --for=condition=ready pod -l app=backend --timeout=120s
kubectl wait --for=condition=ready pod -l app=frontend --timeout=120s
```

## Verification

**Check all resources:**
```bash
kubectl get all
```

**Check ConfigMap:**
```bash
kubectl get configmap app-config
```

**Check Secret:**
```bash
kubectl get secret app-secrets
```

**Check pod logs:**
```bash
kubectl logs -l app=backend
kubectl logs -l app=frontend
kubectl logs -l app=mongodb
```

**Get frontend service external IP:**
```bash
kubectl get service frontend
```

## Troubleshooting

### Pods not starting due to missing ConfigMap/Secret

**Error:** `Error: configmap "app-config" not found` or `Error: secret "app-secrets" not found`

**Solution:** Ensure ConfigMap and Secrets are created before deploying applications:
```bash
kubectl apply -f app-configmap.yaml
kubectl apply -f app-secrets.yaml
```

### Backend cannot connect to MongoDB

**Check MongoDB URI in secret:**
```bash
kubectl get secret app-secrets -o jsonpath='{.data.mongodb_uri}' | base64 --decode
```

**Verify MongoDB service is running:**
```bash
kubectl get service mongodb
kubectl get pods -l app=mongodb
```

### Frontend cannot connect to Backend

**Check API URL in ConfigMap:**
```bash
kubectl get configmap app-config -o yaml
```

**Verify backend service is accessible:**
```bash
kubectl get service backend
kubectl exec -it deployment/frontend -- curl http://backend:3000/health
```

## Security Best Practices

1. **Never commit secrets to version control**
   - Add `app-secrets.yaml` to `.gitignore`
   - Use secret management tools (Azure Key Vault, HashiCorp Vault, etc.)

2. **Use strong random secrets**
   - Generate session secrets with at least 32 bytes of entropy
   - Rotate secrets regularly

3. **Limit secret access**
   - Use Kubernetes RBAC to restrict who can view secrets
   - Use separate namespaces for different environments

4. **Encrypt secrets at rest**
   - Enable encryption at rest in your Kubernetes cluster
   - Use cloud provider secret management services

5. **Use external secret management (Production)**
   - Azure Key Vault with CSI driver
   - AWS Secrets Manager
   - HashiCorp Vault
   - Sealed Secrets for GitOps workflows

## CI/CD Integration

For automated deployments, store secrets in your CI/CD platform:

**GitHub Actions example:**
```yaml
- name: Create Kubernetes Secret
  run: |
    kubectl create secret generic app-secrets \
      --from-literal=mongodb_uri="${{ secrets.MONGODB_URI }}" \
      --from-literal=session_secret="${{ secrets.SESSION_SECRET }}" \
      --dry-run=client -o yaml | kubectl apply -f -
```

**Azure DevOps example:**
```yaml
- task: Kubernetes@1
  inputs:
    command: 'create'
    arguments: 'secret generic app-secrets --from-literal=mongodb_uri=$(MONGODB_URI) --from-literal=session_secret=$(SESSION_SECRET)'
```

## Cleanup

To remove all resources:
```bash
kubectl delete -f .
```

To remove only secrets and configmap:
```bash
kubectl delete configmap app-config
kubectl delete secret app-secrets
```
