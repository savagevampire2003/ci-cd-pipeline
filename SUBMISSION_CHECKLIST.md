# CSC418 DevOps Assignment Submission Checklist

Use this checklist to ensure your submission is complete and meets all requirements.

## Pre-Submission Verification

### ✅ Application Functionality

- [ ] Application runs locally without errors
- [ ] User registration works correctly
- [ ] User login/logout works correctly
- [ ] Student CRUD operations work (Create, Read, Update, Delete)
- [ ] Navigation between tabs works (Home, Students, Profile)
- [ ] User profile view and edit works
- [ ] Form validation displays appropriate errors
- [ ] Data persists after application restart

### ✅ Docker Containerization

- [ ] Backend Dockerfile builds successfully
- [ ] Frontend Dockerfile builds successfully
- [ ] docker-compose.yml starts all services
- [ ] All three services run (frontend, backend, mongodb)
- [ ] Frontend accessible at http://localhost
- [ ] Backend accessible at http://localhost:3000
- [ ] MongoDB data persists using volumes
- [ ] Health endpoints respond correctly
- [ ] Environment variables configured properly

**Verification Commands:**
```bash
docker-compose up -d
docker-compose ps
curl http://localhost:3000/health
curl http://localhost/health.html
docker-compose down -v
```

### ✅ Kubernetes Deployment

- [ ] AKS cluster created and accessible
- [ ] kubectl configured with cluster credentials
- [ ] Docker images pushed to Docker Hub
- [ ] ConfigMap created (app-configmap.yaml)
- [ ] Secrets created (mongodb_uri, session_secret)
- [ ] MongoDB StatefulSet deployed with PVC
- [ ] Backend deployment running (2 replicas)
- [ ] Frontend deployment running (2 replicas)
- [ ] All pods in Running state
- [ ] Frontend service has external IP (LoadBalancer)
- [ ] Backend service accessible internally (ClusterIP)
- [ ] Application accessible via external IP
- [ ] Health checks passing (liveness and readiness probes)

**Verification Commands:**
```bash
kubectl get all
kubectl get pods
kubectl get services
kubectl get pvc
kubectl logs -l app=backend
kubectl logs -l app=frontend
```

### ✅ CI/CD Pipeline

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] GitHub Actions workflow file exists (.github/workflows/ci-cd-pipeline.yml)
- [ ] All required secrets configured:
  - [ ] DOCKER_USERNAME
  - [ ] DOCKER_PASSWORD
  - [ ] AZURE_CREDENTIALS
  - [ ] AKS_CLUSTER_NAME
  - [ ] AKS_RESOURCE_GROUP
- [ ] Pipeline runs successfully on push to main
- [ ] Lint stage passes
- [ ] Unit test stage passes
- [ ] Docker build stage passes
- [ ] Integration test stage passes
- [ ] Deploy to AKS stage passes
- [ ] Selenium test stage passes
- [ ] Pipeline completes in reasonable time (<40 minutes)

**Verification:**
- Go to GitHub → Actions tab
- Verify latest workflow run is green (all stages passed)
- Download and review test reports

### ✅ Ansible Configuration

- [ ] Ansible installed on control machine
- [ ] hosts.ini configured with at least 2 target hosts
- [ ] SSH access to target hosts verified
- [ ] playbook.yml includes all required roles:
  - [ ] common (system updates, utilities)
  - [ ] docker (Docker installation)
  - [ ] nodejs (Node.js installation)
  - [ ] firewall (UFW configuration)
  - [ ] app (application deployment)
- [ ] Playbook runs successfully without errors
- [ ] Docker installed on target hosts
- [ ] Node.js installed on target hosts
- [ ] Firewall configured with required ports
- [ ] Application services running on target hosts

**Verification Commands:**
```bash
ansible all -i hosts.ini -m ping
ansible-playbook -i hosts.ini playbook.yml
ansible all -i hosts.ini -m command -a "docker --version"
ansible all -i hosts.ini -m command -a "node --version"
```

### ✅ Selenium Automated Testing

- [ ] Selenium test suite exists (selenium_tests/)
- [ ] Python dependencies installed (requirements.txt)
- [ ] At least 3 test files created:
  - [ ] test_homepage.py
  - [ ] test_login.py
  - [ ] test_student_creation.py (or similar)
- [ ] Additional tests (navigation, profile) implemented
- [ ] All tests pass when run against deployed application
- [ ] HTML test report generated
- [ ] Test report shows pass/fail status for each test
- [ ] Tests run in headless mode (CI/CD compatible)

**Verification Commands:**
```bash
cd selenium_tests
pip install -r requirements.txt
pytest -v --html=test_report.html --self-contained-html
```

### ✅ Code Quality

- [ ] ESLint configuration exists (.eslintrc.json)
- [ ] Code passes linting without errors
- [ ] Unit tests exist for backend routes
- [ ] Property-based tests implemented
- [ ] Test coverage above 70%
- [ ] No console errors in browser
- [ ] No security vulnerabilities in dependencies

**Verification Commands:**
```bash
npm run lint
npm test
npm test -- --coverage
```

## Documentation Requirements

### ✅ Main Documentation

- [ ] README.md is complete and up-to-date
- [ ] README includes:
  - [ ] Project overview
  - [ ] Features list
  - [ ] Technology stack
  - [ ] Quick start instructions
  - [ ] Deployment options (local, Docker, Kubernetes, Ansible)
  - [ ] CI/CD pipeline description
  - [ ] Testing instructions
  - [ ] API documentation
  - [ ] Troubleshooting section
- [ ] QUICK_START.md provides fast getting started guide
- [ ] DEPLOYMENT_GUIDE.md has detailed deployment instructions
- [ ] ENVIRONMENT_VARIABLES.md documents all configuration
- [ ] PROJECT_STRUCTURE.md explains codebase organization

### ✅ Specialized Documentation

- [ ] CI_CD_SETUP.md explains pipeline configuration
- [ ] k8s/README.md documents Kubernetes deployment
- [ ] ansible/README.md documents Ansible automation
- [ ] selenium_tests/README.md documents test suite
- [ ] FRONTEND_DOCKER.md explains frontend containerization
- [ ] SECRETS_TEMPLATE.md provides GitHub secrets template

### ✅ Code Comments

- [ ] Complex logic has explanatory comments
- [ ] API endpoints documented with comments
- [ ] Property-based tests tagged with property numbers
- [ ] Configuration files have inline comments

## Screenshots Requirements

### ✅ Application Screenshots

- [ ] login.png - Login page with registration link
- [ ] dashboard.png - Dashboard/Home tab
- [ ] students.png - Student management interface
- [ ] profile.png - User profile page
- [ ] navigation.png - Navigation with active tab

### ✅ DevOps Screenshots

- [ ] docker-compose.png - Docker Compose services running
- [ ] kubernetes.png - Kubernetes deployment (kubectl get all)
- [ ] github-actions.png - CI/CD pipeline execution
- [ ] selenium-report.png - Selenium test report
- [ ] ansible.png - Ansible playbook execution

### ✅ Screenshot Quality

- [ ] All screenshots are clear and readable
- [ ] Text in screenshots is legible
- [ ] Screenshots show successful execution
- [ ] No sensitive information visible (passwords, keys, IPs)
- [ ] Screenshots are recent (not outdated)
- [ ] File names match the required names
- [ ] Screenshots are in PNG or JPG format

**See [screenshots/README.md](screenshots/README.md) for detailed guidelines.**

## Repository Requirements

### ✅ Git Repository

- [ ] Repository is clean (no unnecessary files)
- [ ] .gitignore properly configured
- [ ] No secrets committed to repository
- [ ] No node_modules committed
- [ ] Commit history is clean and meaningful
- [ ] README.md is in repository root
- [ ] All documentation files included

### ✅ Files to Include

- [ ] Source code (server.js, routes/, models/, public/)
- [ ] Docker files (Dockerfile, frontend.Dockerfile, docker-compose.yml)
- [ ] Kubernetes manifests (k8s/*.yaml)
- [ ] Ansible files (ansible/playbook.yml, hosts.ini, roles/)
- [ ] CI/CD workflow (.github/workflows/ci-cd-pipeline.yml)
- [ ] Selenium tests (selenium_tests/*.py)
- [ ] Configuration files (.eslintrc.json, jest.config.js, etc.)
- [ ] Documentation (all .md files)
- [ ] Screenshots (screenshots/*.png)

### ✅ Files to Exclude

- [ ] node_modules/ (use .gitignore)
- [ ] .env files with real secrets
- [ ] k8s/app-secrets.yaml (only include template)
- [ ] Test reports (generated files)
- [ ] Build artifacts
- [ ] IDE-specific files (.vscode/, .idea/)

## Testing Before Submission

### ✅ Fresh Clone Test

Test that everything works from a fresh clone:

```bash
# 1. Clone to a new directory
git clone <your-repo-url> test-submission
cd test-submission

# 2. Test local development
npm install
# Create .env file
npm start
# Verify application works

# 3. Test Docker Compose
docker-compose up -d
# Verify all services work
docker-compose down -v

# 4. Test Kubernetes (if possible)
kubectl apply -f k8s/
# Verify deployment
kubectl delete -f k8s/

# 5. Test Ansible (if possible)
cd ansible
ansible-playbook -i hosts.ini playbook.yml --check

# 6. Test Selenium
cd selenium_tests
pip install -r requirements.txt
pytest -v
```

### ✅ Documentation Review

- [ ] Read through README.md as if you're a new user
- [ ] Follow quick start instructions step-by-step
- [ ] Verify all links in documentation work
- [ ] Check for typos and formatting issues
- [ ] Ensure all commands are correct for your OS

### ✅ Final Verification

- [ ] All features work as expected
- [ ] All tests pass
- [ ] All documentation is accurate
- [ ] All screenshots are present and correct
- [ ] Repository is clean and organized
- [ ] No errors in console or logs
- [ ] Application is production-ready

## Submission Package

### ✅ What to Submit

1. **GitHub Repository URL**
   - Public repository or provide access
   - Include repository URL in submission

2. **Screenshots**
   - All required screenshots in screenshots/ directory
   - Or submit as separate ZIP file if required

3. **Documentation**
   - README.md with complete instructions
   - All supporting documentation files

4. **Deployment Evidence**
   - AKS cluster details (name, resource group)
   - Docker Hub repository links
   - CI/CD pipeline URL (GitHub Actions)

5. **Test Reports**
   - Selenium test report (HTML)
   - Unit test coverage report
   - CI/CD pipeline execution logs

### ✅ Submission Format

Follow your instructor's requirements for:
- [ ] Submission platform (Moodle, email, etc.)
- [ ] File format (ZIP, GitHub link, etc.)
- [ ] Naming conventions
- [ ] Additional requirements (report, presentation, etc.)

## Common Issues to Check

### ❌ Common Mistakes to Avoid

- [ ] Committing secrets or passwords to Git
- [ ] Hardcoding URLs or IPs in code
- [ ] Missing environment variables
- [ ] Incorrect Docker image names in Kubernetes manifests
- [ ] Missing GitHub secrets for CI/CD
- [ ] Outdated or incorrect documentation
- [ ] Missing screenshots
- [ ] Tests that don't actually test functionality
- [ ] Ansible playbook that doesn't run successfully
- [ ] CI/CD pipeline that fails

### ✅ Quality Checks

- [ ] Code is clean and well-organized
- [ ] No commented-out code blocks
- [ ] No debug console.log statements
- [ ] Error handling is implemented
- [ ] Security best practices followed
- [ ] Performance is acceptable
- [ ] UI is responsive and user-friendly

## Final Checklist

Before submitting, verify:

- [ ] ✅ Application works end-to-end
- [ ] ✅ All deployment methods tested (local, Docker, Kubernetes)
- [ ] ✅ CI/CD pipeline passes all stages
- [ ] ✅ Ansible playbook runs successfully
- [ ] ✅ Selenium tests pass
- [ ] ✅ All documentation is complete
- [ ] ✅ All screenshots are present
- [ ] ✅ Repository is clean and organized
- [ ] ✅ No secrets committed
- [ ] ✅ Fresh clone test passed
- [ ] ✅ Submission package prepared

## Grading Criteria Reference

Ensure your submission addresses all grading criteria:

### Application Functionality (15-20%)
- [ ] User authentication works
- [ ] Student CRUD operations work
- [ ] Navigation works
- [ ] Profile management works
- [ ] Data persistence works

### Docker Containerization (15-20%)
- [ ] Dockerfiles are correct
- [ ] docker-compose.yml works
- [ ] All services run correctly
- [ ] Volumes configured for persistence

### Kubernetes Deployment (20-25%)
- [ ] AKS cluster deployed
- [ ] All manifests correct
- [ ] Application accessible
- [ ] Scaling and health checks work

### CI/CD Pipeline (15-20%)
- [ ] GitHub Actions workflow configured
- [ ] All stages pass
- [ ] Automated deployment works
- [ ] Tests run in pipeline

### Ansible Automation (10-15%)
- [ ] Playbook runs successfully
- [ ] All roles implemented
- [ ] Target hosts configured correctly

### Testing (10-15%)
- [ ] Unit tests implemented
- [ ] Selenium tests implemented
- [ ] Tests pass consistently
- [ ] Test coverage adequate

### Documentation (10-15%)
- [ ] README is comprehensive
- [ ] All documentation files present
- [ ] Screenshots included
- [ ] Instructions are clear

## Post-Submission

After submitting:

1. **Keep the deployment running** (if required for grading)
2. **Monitor the CI/CD pipeline** for any issues
3. **Be prepared to demo** the application
4. **Keep backups** of all files and screenshots
5. **Document any known issues** or limitations

## Need Help?

If you encounter issues:

1. Check the [Troubleshooting](README.md#troubleshooting) section
2. Review the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
3. Check component-specific README files
4. Review error logs and messages
5. Test each component individually
6. Ask for help from instructor or TA

## Resources

- [README.md](README.md) - Main documentation
- [QUICK_START.md](QUICK_START.md) - Quick start guide
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Deployment instructions
- [CI_CD_SETUP.md](CI_CD_SETUP.md) - CI/CD configuration
- [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) - Configuration reference
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Codebase organization

---

**Good luck with your submission! 🚀**

Remember: A complete, well-documented submission that demonstrates all required DevOps practices will score well. Take time to verify everything works before submitting.
