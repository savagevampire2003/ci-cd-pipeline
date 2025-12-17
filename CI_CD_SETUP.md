# CI/CD Pipeline Setup Guide

This document provides instructions for configuring the GitHub Actions CI/CD pipeline for the Student Management System.

## Overview

The CI/CD pipeline automates the following stages:
1. **Lint** - Code quality checks with ESLint
2. **Unit Tests** - Jest test execution with coverage reporting
3. **Build Docker Images** - Build and push frontend and backend images to Docker Hub
4. **Integration Tests** - Test services running in Docker containers
5. **Deploy to AKS** - Deploy to Azure Kubernetes Service
6. **Selenium Tests** - Automated browser testing against deployed application

## Prerequisites

Before setting up the pipeline, ensure you have:

1. **Docker Hub Account** - For storing container images
2. **Azure Account** - With an active subscription
3. **Azure Kubernetes Service (AKS) Cluster** - Pre-configured and running
4. **GitHub Repository** - With admin access to configure secrets

## Required GitHub Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions, and add the following secrets:

### 1. DOCKER_USERNAME
- **Description**: Your Docker Hub username
- **Example**: `johndoe`
- **How to get**: Your Docker Hub account username

### 2. DOCKER_PASSWORD
- **Description**: Your Docker Hub password or access token
- **Example**: `dckr_pat_xxxxxxxxxxxxx`
- **How to get**: 
  - Login to Docker Hub
  - Go to Account Settings → Security → New Access Token
  - Create a token with Read & Write permissions
  - **Recommended**: Use access token instead of password for better security

### 3. AZURE_CREDENTIALS
- **Description**: Azure service principal credentials in JSON format
- **Format**:
```json
{
  "clientId": "<client-id>",
  "clientSecret": "<client-secret>",
  "subscriptionId": "<subscription-id>",
  "tenantId": "<tenant-id>"
}
```
- **How to get**:
```bash
# Login to Azure CLI
az login

# Create service principal with contributor role
az ad sp create-for-rbac \
  --name "github-actions-sms" \
  --role contributor \
  --scopes /subscriptions/<subscription-id>/resourceGroups/<resource-group-name> \
  --sdk-auth

# Copy the entire JSON output and paste as the secret value
```

### 4. AKS_CLUSTER_NAME
- **Description**: Name of your Azure Kubernetes Service cluster
- **Example**: `sms-aks-cluster`
- **How to get**: 
```bash
az aks list --output table
```

### 5. AKS_RESOURCE_GROUP
- **Description**: Azure resource group containing your AKS cluster
- **Example**: `sms-resource-group`
- **How to get**:
```bash
az aks list --output table
# Look for the resource group column
```

## Pipeline Workflow

### Trigger Events

The pipeline runs on:
- **Push to main branch** - Full pipeline including deployment
- **Pull requests to main** - Lint, tests, and build only (no deployment)

### Stage Details

#### 1. Lint Stage
- Runs ESLint on all JavaScript files
- Fails pipeline if linting errors are found
- **Duration**: ~1-2 minutes

#### 2. Unit Tests Stage
- Runs Jest test suite
- Generates code coverage report
- Fails if coverage is below 70%
- Uploads coverage to Codecov (optional)
- **Duration**: ~2-3 minutes

#### 3. Build Docker Images Stage
- Builds backend and frontend Docker images
- Tags images with:
  - `latest` - Always points to most recent build
  - `<commit-sha>` - Specific commit identifier
- Pushes images to Docker Hub
- Uses layer caching for faster builds
- **Duration**: ~5-8 minutes

#### 4. Integration Tests Stage
- Pulls latest Docker images
- Starts all services using docker-compose
- Verifies health endpoints
- Runs integration test suite
- Cleans up containers
- **Duration**: ~3-5 minutes

#### 5. Deploy to AKS Stage
- **Only runs on push to main branch**
- Authenticates with Azure
- Sets kubectl context to AKS cluster
- Updates Kubernetes manifests with new image tags
- Applies manifests in correct order:
  1. ConfigMap
  2. MongoDB StatefulSet and Service
  3. Backend Deployment and Service
  4. Frontend Deployment and Service
- Waits for rollout to complete
- Verifies all pods are running
- **Duration**: ~5-10 minutes

#### 6. Selenium Tests Stage
- **Only runs on push to main branch**
- Sets up Python and Selenium
- Gets frontend LoadBalancer external IP
- Waits for application to be ready
- Runs automated browser tests
- Generates HTML test report
- Uploads report as artifact
- **Duration**: ~5-8 minutes

### Total Pipeline Duration
- **Pull Request**: ~10-15 minutes (no deployment)
- **Main Branch Push**: ~25-35 minutes (full pipeline)

## Local Testing

Before pushing to GitHub, test the pipeline stages locally:

### Run Linting
```bash
npm install
npm run lint
```

### Run Unit Tests
```bash
npm test
```

### Build Docker Images
```bash
# Backend
docker build -t sms-backend:test -f Dockerfile .

# Frontend
docker build -t sms-frontend:test -f frontend.Dockerfile .
```

### Run Integration Tests
```bash
docker-compose up -d
sleep 30
curl http://localhost:3000/health
curl http://localhost:80/health
docker-compose down -v
```

## Troubleshooting

### Pipeline Fails at Lint Stage
- Run `npm run lint` locally to see errors
- Fix linting errors or update `.eslintrc.json` rules
- Commit and push changes

### Pipeline Fails at Unit Tests Stage
- Run `npm test` locally to identify failing tests
- Check test coverage with `npm test -- --coverage`
- Fix failing tests or update test cases

### Pipeline Fails at Docker Build Stage
- Check Docker Hub credentials are correct
- Verify DOCKER_USERNAME and DOCKER_PASSWORD secrets
- Ensure Docker Hub repository exists or is public

### Pipeline Fails at Deploy Stage
- Verify Azure credentials are valid
- Check AKS cluster is running: `az aks show -n <cluster-name> -g <resource-group>`
- Ensure service principal has correct permissions
- Verify Kubernetes secrets exist: `kubectl get secrets`

### Pipeline Fails at Selenium Tests Stage
- Check if frontend LoadBalancer has external IP: `kubectl get svc frontend`
- Verify application is accessible from internet
- Check Selenium test scripts exist in `selenium-tests/` directory

## Monitoring Pipeline Execution

1. Go to your GitHub repository
2. Click on "Actions" tab
3. Select the workflow run to view details
4. Click on individual jobs to see logs
5. Download artifacts (test reports, coverage) from the workflow summary

## Pipeline Optimization Tips

1. **Use Branch Protection Rules**
   - Require status checks to pass before merging
   - Require pull request reviews

2. **Enable Codecov Integration**
   - Sign up at codecov.io
   - Add CODECOV_TOKEN secret
   - View coverage trends over time

3. **Cache Dependencies**
   - Pipeline already uses npm cache
   - Reduces dependency installation time

4. **Parallel Jobs**
   - Lint and unit tests could run in parallel
   - Modify workflow if needed

5. **Skip CI for Documentation Changes**
   - Add `[skip ci]` to commit message
   - Or use path filters in workflow triggers

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Use access tokens** instead of passwords
3. **Rotate credentials** regularly
4. **Limit service principal permissions** to minimum required
5. **Enable branch protection** on main branch
6. **Review pull requests** before merging
7. **Monitor pipeline logs** for suspicious activity

## Updating the Pipeline

To modify the pipeline:

1. Edit `.github/workflows/ci-cd-pipeline.yml`
2. Test changes on a feature branch first
3. Create pull request to review changes
4. Merge to main after approval

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [Azure Kubernetes Service Documentation](https://docs.microsoft.com/en-us/azure/aks/)
- [Selenium Documentation](https://www.selenium.dev/documentation/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ESLint Documentation](https://eslint.org/docs/latest/)

## Support

For issues with the pipeline:
1. Check the troubleshooting section above
2. Review pipeline logs in GitHub Actions
3. Verify all prerequisites are met
4. Check that all secrets are configured correctly
5. Ensure AKS cluster and services are healthy
