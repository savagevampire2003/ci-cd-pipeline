# GitHub Secrets Configuration Template

This file provides a quick reference for configuring GitHub secrets required by the CI/CD pipeline.

## Required Secrets

Copy this checklist and fill in your values:

### 1. DOCKER_USERNAME
```
Value: [Your Docker Hub username]
Example: johndoe
```

### 2. DOCKER_PASSWORD
```
Value: [Your Docker Hub access token or password]
Example: dckr_pat_xxxxxxxxxxxxx
Note: Use access token for better security
```

### 3. AZURE_CREDENTIALS
```json
{
  "clientId": "[service-principal-client-id]",
  "clientSecret": "[service-principal-secret]",
  "subscriptionId": "[azure-subscription-id]",
  "tenantId": "[azure-tenant-id]"
}
```

**To generate Azure credentials:**
```bash
az ad sp create-for-rbac \
  --name "github-actions-sms" \
  --role contributor \
  --scopes /subscriptions/[subscription-id]/resourceGroups/[resource-group] \
  --sdk-auth
```

### 4. AKS_CLUSTER_NAME
```
Value: [Your AKS cluster name]
Example: sms-aks-cluster
```

### 5. AKS_RESOURCE_GROUP
```
Value: [Azure resource group name]
Example: sms-resource-group
```

## How to Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the secret name (exactly as shown above)
5. Paste the secret value
6. Click **Add secret**
7. Repeat for all 5 secrets

## Verification Checklist

- [ ] DOCKER_USERNAME configured
- [ ] DOCKER_PASSWORD configured
- [ ] AZURE_CREDENTIALS configured (valid JSON format)
- [ ] AKS_CLUSTER_NAME configured
- [ ] AKS_RESOURCE_GROUP configured
- [ ] AKS cluster is running and accessible
- [ ] Docker Hub repository exists or account can create repositories
- [ ] Azure service principal has contributor role on resource group

## Testing Secrets

After configuring secrets, push a commit to a feature branch and create a pull request to test the pipeline without deploying to production.

The pipeline will:
- ✅ Run lint checks
- ✅ Run unit tests
- ✅ Build Docker images
- ✅ Run integration tests
- ❌ Skip deployment (only on main branch)
- ❌ Skip Selenium tests (only on main branch)
