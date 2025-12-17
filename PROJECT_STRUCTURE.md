# Project Structure

Complete overview of the Student Management System codebase organization.

## Directory Tree

```
student-management-system/
├── .github/
│   └── workflows/
│       └── ci-cd-pipeline.yml      # GitHub Actions CI/CD pipeline
├── .kiro/
│   └── specs/
│       └── devops-pipeline-enhancement/
│           ├── design.md           # Feature design document
│           ├── requirements.md     # Feature requirements
│           └── tasks.md            # Implementation tasks
├── ansible/
│   ├── roles/                      # Ansible roles
│   │   ├── common/                 # Base system configuration
│   │   ├── docker/                 # Docker installation
│   │   ├── nodejs/                 # Node.js installation
│   │   ├── firewall/               # Firewall configuration
│   │   └── app/                    # Application deployment
│   ├── hosts.ini                   # Inventory file
│   ├── playbook.yml                # Main playbook
│   ├── ansible.cfg                 # Ansible configuration
│   └── README.md                   # Ansible documentation
├── k8s/
│   ├── app-configmap.yaml          # ConfigMap for non-sensitive config
│   ├── app-secrets.yaml.template   # Secret template
│   ├── backend-deployment.yaml     # Backend deployment
│   ├── backend-service.yaml        # Backend service
│   ├── frontend-deployment.yaml    # Frontend deployment
│   ├── frontend-service.yaml       # Frontend service (LoadBalancer)
│   ├── mongodb-statefulset.yaml    # MongoDB StatefulSet
│   ├── mongodb-service.yaml        # MongoDB service
│   └── README.md                   # Kubernetes documentation
├── middleware/
│   └── auth.js                     # Authentication middleware
├── models/
│   └── User.js                     # User model (Mongoose schema)
├── public/
│   ├── app.js                      # Main frontend application logic
│   ├── auth.js                     # Authentication state management
│   ├── index.html                  # Main application page
│   ├── login.html                  # Login/registration page
│   ├── style.css                   # Application styles
│   ├── health.html                 # Health check page
│   └── navigation.test.js          # Frontend navigation tests
├── routes/
│   ├── auth.js                     # Authentication routes
│   ├── auth.test.js                # Authentication tests
│   ├── students.js                 # Student CRUD routes
│   └── users.js                    # User profile routes
├── screenshots/
│   └── README.md                   # Screenshot guidelines
├── selenium_tests/
│   ├── conftest.py                 # Pytest configuration
│   ├── test_homepage.py            # Homepage tests
│   ├── test_login.py               # Login tests
│   ├── test_navigation.py          # Navigation tests
│   ├── test_profile.py             # Profile tests
│   ├── test_student_creation.py    # Student creation tests
│   ├── requirements.txt            # Python dependencies
│   ├── pytest.ini                  # Pytest configuration
│   ├── run_tests.sh                # Test runner (Linux/Mac)
│   ├── run_tests.bat               # Test runner (Windows)
│   ├── run_tests.py                # Test runner (Python)
│   └── README.md                   # Selenium documentation
├── .dockerignore                   # Docker ignore patterns
├── .eslintignore                   # ESLint ignore patterns
├── .eslintrc.json                  # ESLint configuration
├── .gitignore                      # Git ignore patterns
├── CI_CD_SETUP.md                  # CI/CD setup guide
├── DEPLOYMENT_GUIDE.md             # Complete deployment guide
├── docker-compose.yml              # Docker Compose configuration
├── Dockerfile                      # Backend Docker image
├── ENVIRONMENT_VARIABLES.md        # Environment variables reference
├── frontend.Dockerfile             # Frontend Docker image
├── FRONTEND_DOCKER.md              # Frontend Docker documentation
├── jest.config.js                  # Jest test configuration
├── nginx.conf                      # Nginx configuration
├── nginx-env.sh                    # Environment injection script
├── package.json                    # Node.js dependencies and scripts
├── package-lock.json               # Locked dependency versions
├── PROJECT_STRUCTURE.md            # This file
├── QUICK_START.md                  # Quick start guide
├── README.md                       # Main documentation
├── SECRETS_TEMPLATE.md             # GitHub secrets template
├── server.js                       # Express.js server entry point
└── test-health.ps1                 # Health check script (PowerShell)
```

## Core Application Files

### Backend

#### `server.js`
- **Purpose:** Express.js server entry point
- **Responsibilities:**
  - Initialize Express application
  - Configure middleware (body-parser, sessions, CORS)
  - Connect to MongoDB
  - Register routes
  - Start HTTP server
  - Health check endpoint
- **Key Dependencies:** express, mongoose, express-session

#### `models/User.js`
- **Purpose:** User data model
- **Responsibilities:**
  - Define User schema (username, email, password, fullName)
  - Password hashing with bcrypt
  - Password comparison method
  - Timestamps (createdAt, updatedAt)
- **Key Dependencies:** mongoose, bcrypt

#### `middleware/auth.js`
- **Purpose:** Authentication middleware
- **Responsibilities:**
  - Verify user session
  - Protect routes requiring authentication
  - Attach user object to request
- **Used By:** Protected routes (students, profile)

#### `routes/auth.js`
- **Purpose:** Authentication routes
- **Endpoints:**
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `POST /api/auth/logout` - User logout
  - `GET /api/auth/me` - Get current user
- **Key Dependencies:** bcrypt, express-session

#### `routes/users.js`
- **Purpose:** User profile routes
- **Endpoints:**
  - `GET /api/users/profile` - Get user profile
  - `PUT /api/users/profile` - Update user profile
- **Authentication:** Required (uses auth middleware)

#### `routes/students.js`
- **Purpose:** Student CRUD routes
- **Endpoints:**
  - `GET /api/students` - List all students
  - `GET /api/students/:id` - Get single student
  - `POST /api/students` - Create student
  - `PUT /api/students/:id` - Update student
  - `DELETE /api/students/:id` - Delete student
- **Authentication:** Required (uses auth middleware)

### Frontend

#### `public/index.html`
- **Purpose:** Main application page
- **Features:**
  - Navigation bar (Home, Students, Profile, Logout)
  - Tab content containers
  - Student management interface
  - Profile view and edit forms
- **Loads:** app.js, auth.js, style.css

#### `public/login.html`
- **Purpose:** Login and registration page
- **Features:**
  - Login form
  - Registration form
  - Form validation
  - Error message display
- **Loads:** auth.js, style.css

#### `public/app.js`
- **Purpose:** Main application logic
- **Responsibilities:**
  - Tab navigation
  - Student CRUD operations
  - API client methods
  - Form handling
  - Data formatting
  - DOM manipulation
- **Key Functions:**
  - `showTab()` - Switch between tabs
  - `loadStudents()` - Fetch and display students
  - `addStudent()` - Create new student
  - `editStudent()` - Update existing student
  - `deleteStudent()` - Remove student

#### `public/auth.js`
- **Purpose:** Authentication state management
- **Responsibilities:**
  - Login/logout functionality
  - Session management
  - User registration
  - Authentication state checking
  - Redirect logic
- **Key Functions:**
  - `login()` - Authenticate user
  - `register()` - Create new account
  - `logout()` - End session
  - `checkAuth()` - Verify authentication

#### `public/style.css`
- **Purpose:** Application styles
- **Features:**
  - Responsive design
  - Navigation styling
  - Form styling
  - Button styles
  - Table layouts
  - Color scheme

## DevOps Files

### Docker

#### `Dockerfile`
- **Purpose:** Backend Docker image
- **Base Image:** node:18-alpine
- **Features:**
  - Multi-stage build
  - Non-root user
  - Health check
  - Production dependencies only
- **Exposed Port:** 3000

#### `frontend.Dockerfile`
- **Purpose:** Frontend Docker image
- **Base Image:** nginx:alpine
- **Features:**
  - Multi-stage build
  - Static file serving
  - Environment variable injection
  - SPA routing support
  - Health check
- **Exposed Port:** 80

#### `docker-compose.yml`
- **Purpose:** Multi-container orchestration
- **Services:**
  - `frontend` - Nginx web server
  - `backend` - Express.js API
  - `mongodb` - MongoDB database
- **Features:**
  - Common network
  - Volume persistence
  - Environment configuration
  - Service dependencies

#### `nginx.conf`
- **Purpose:** Nginx web server configuration
- **Features:**
  - SPA routing (fallback to index.html)
  - Gzip compression
  - Static file caching
  - Security headers
  - Health check endpoint

#### `nginx-env.sh`
- **Purpose:** Environment variable injection
- **Responsibilities:**
  - Read API_BASE_URL from environment
  - Create config.js file
  - Make config available to frontend

### Kubernetes

#### Deployments
- **backend-deployment.yaml** - Backend pods (2 replicas)
- **frontend-deployment.yaml** - Frontend pods (2 replicas)
- **mongodb-statefulset.yaml** - MongoDB with persistent storage

#### Services
- **backend-service.yaml** - ClusterIP (internal)
- **frontend-service.yaml** - LoadBalancer (external)
- **mongodb-service.yaml** - Headless service

#### Configuration
- **app-configmap.yaml** - Non-sensitive configuration
- **app-secrets.yaml.template** - Sensitive data template

### CI/CD

#### `.github/workflows/ci-cd-pipeline.yml`
- **Purpose:** Automated CI/CD pipeline
- **Stages:**
  1. Lint - ESLint code quality
  2. Unit Tests - Jest test execution
  3. Build - Docker image creation
  4. Integration Tests - Service testing
  5. Deploy - AKS deployment
  6. Selenium Tests - Browser testing
- **Triggers:** Push to main, pull requests

### Ansible

#### `ansible/playbook.yml`
- **Purpose:** Infrastructure automation
- **Roles:**
  - common - Base system setup
  - docker - Docker installation
  - nodejs - Node.js installation
  - firewall - UFW configuration
  - app - Application deployment

#### `ansible/hosts.ini`
- **Purpose:** Inventory file
- **Groups:**
  - webservers - Application servers
  - dbservers - Database servers

## Testing Files

### Unit Tests

#### `routes/auth.test.js`
- **Purpose:** Authentication route tests
- **Framework:** Jest + Supertest
- **Tests:**
  - User registration
  - User login
  - Session management
  - Password hashing
  - Duplicate detection

#### `public/navigation.test.js`
- **Purpose:** Frontend navigation tests
- **Framework:** Jest
- **Tests:**
  - Tab switching
  - Active tab highlighting
  - Content display

### Property-Based Tests

Located in test files with `// Feature: devops-pipeline-enhancement, Property X` comments.

**Properties Tested:**
1. Password hashing
2. Duplicate detection
3. Session lifecycle
4. Authentication rejection
5. Data persistence
6. Validation errors
7. Data formatting

### Selenium Tests

#### `selenium_tests/test_homepage.py`
- **Tests:** Homepage load, elements present

#### `selenium_tests/test_login.py`
- **Tests:** Login flow, invalid credentials

#### `selenium_tests/test_student_creation.py`
- **Tests:** Student CRUD operations

#### `selenium_tests/test_navigation.py`
- **Tests:** Tab navigation, content display

#### `selenium_tests/test_profile.py`
- **Tests:** Profile view, data display

#### `selenium_tests/conftest.py`
- **Purpose:** Pytest fixtures and configuration
- **Fixtures:**
  - `driver` - WebDriver instance
  - `base_url` - Application URL
  - `test_user` - Test user credentials

## Configuration Files

### `.eslintrc.json`
- **Purpose:** ESLint configuration
- **Rules:** Code quality standards
- **Extends:** eslint:recommended

### `jest.config.js`
- **Purpose:** Jest test configuration
- **Settings:**
  - Test environment: node
  - Coverage thresholds
  - Test patterns

### `pytest.ini`
- **Purpose:** Pytest configuration
- **Settings:**
  - Test discovery patterns
  - Markers
  - Output formatting

### `.dockerignore`
- **Purpose:** Exclude files from Docker build
- **Excludes:**
  - node_modules
  - .git
  - tests
  - documentation

### `.gitignore`
- **Purpose:** Exclude files from version control
- **Excludes:**
  - node_modules
  - .env
  - secrets
  - build artifacts

## Documentation Files

### Main Documentation
- **README.md** - Complete project documentation
- **QUICK_START.md** - Fast getting started guide
- **DEPLOYMENT_GUIDE.md** - Detailed deployment instructions
- **PROJECT_STRUCTURE.md** - This file

### Specialized Documentation
- **ENVIRONMENT_VARIABLES.md** - Environment configuration
- **CI_CD_SETUP.md** - CI/CD pipeline setup
- **FRONTEND_DOCKER.md** - Frontend Docker details
- **SECRETS_TEMPLATE.md** - GitHub secrets template

### Component Documentation
- **k8s/README.md** - Kubernetes deployment
- **ansible/README.md** - Ansible automation
- **selenium_tests/README.md** - Selenium testing
- **screenshots/README.md** - Screenshot guidelines

## Key Patterns and Conventions

### File Naming
- **Routes:** `routes/<resource>.js`
- **Models:** `models/<Model>.js` (PascalCase)
- **Tests:** `<file>.test.js` (co-located with source)
- **Config:** `<tool>.config.js` or `.<tool>rc.json`

### Code Organization
- **Backend:** MVC pattern (Models, Routes, Middleware)
- **Frontend:** Vanilla JavaScript with modular functions
- **Tests:** Co-located with source files
- **Config:** Root level configuration files

### Environment Configuration
- **Local:** `.env` file
- **Docker:** `docker-compose.yml` environment section
- **Kubernetes:** ConfigMaps and Secrets
- **CI/CD:** GitHub Secrets

### Testing Strategy
- **Unit Tests:** Jest for backend, co-located with source
- **Property Tests:** fast-check for universal properties
- **Integration Tests:** Supertest for API testing
- **E2E Tests:** Selenium for browser automation

## Dependencies

### Production Dependencies
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcrypt** - Password hashing
- **express-session** - Session management
- **connect-mongo** - MongoDB session store
- **body-parser** - Request body parsing

### Development Dependencies
- **eslint** - Code linting
- **jest** - Unit testing
- **supertest** - API testing
- **fast-check** - Property-based testing

### Python Dependencies (Selenium)
- **selenium** - Browser automation
- **pytest** - Testing framework
- **pytest-html** - HTML report generation
- **webdriver-manager** - ChromeDriver management

## Build and Deployment Artifacts

### Docker Images
- `<username>/sms-backend:latest` - Backend image
- `<username>/sms-frontend:latest` - Frontend image

### Kubernetes Resources
- Deployments: backend, frontend, mongodb
- Services: backend (ClusterIP), frontend (LoadBalancer), mongodb (Headless)
- ConfigMaps: app-config
- Secrets: app-secrets
- PersistentVolumeClaims: mongodb-data

### CI/CD Artifacts
- Test reports (HTML)
- Coverage reports
- Docker images (tagged with commit SHA)
- Deployment manifests

## Getting Started with the Codebase

### For Developers
1. Start with `server.js` - Understand the application entry point
2. Review `models/User.js` - Understand data models
3. Explore `routes/` - Understand API endpoints
4. Check `public/app.js` - Understand frontend logic
5. Read tests - Understand expected behavior

### For DevOps Engineers
1. Review `docker-compose.yml` - Understand local deployment
2. Explore `k8s/` - Understand Kubernetes deployment
3. Check `.github/workflows/` - Understand CI/CD pipeline
4. Review `ansible/` - Understand infrastructure automation
5. Read deployment guides - Understand deployment process

### For QA Engineers
1. Review `selenium_tests/` - Understand E2E tests
2. Check `routes/*.test.js` - Understand unit tests
3. Read test documentation - Understand test strategy
4. Run tests locally - Verify test execution
5. Review test reports - Understand test results

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/)
- [Ansible Documentation](https://docs.ansible.com/)
- [Selenium Documentation](https://www.selenium.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Pytest Documentation](https://docs.pytest.org/)
