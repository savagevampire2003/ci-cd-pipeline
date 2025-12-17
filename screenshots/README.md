# Screenshots Directory

This directory contains screenshots for the Student Management System documentation and submission.

## Required Screenshots

### Application Screenshots

1. **login.png** - Login page with registration link
   - Shows login form
   - Shows registration link
   - Shows application branding

2. **dashboard.png** - Dashboard/Home tab
   - Shows welcome message
   - Shows system statistics
   - Shows navigation bar

3. **students.png** - Student management interface
   - Shows student list
   - Shows add/edit/delete buttons
   - Shows student form

4. **profile.png** - User profile page
   - Shows user information
   - Shows edit profile button
   - Shows account details

5. **navigation.png** - Navigation demonstration
   - Shows all tabs (Home, Students, Profile, Logout)
   - Shows active tab highlighting
   - Shows tab content

### DevOps Screenshots

6. **docker-compose.png** - Docker Compose running
   - Terminal showing `docker-compose ps`
   - All services running (frontend, backend, mongodb)
   - Container status and ports

7. **kubernetes.png** - Kubernetes deployment
   - Terminal showing `kubectl get all`
   - Pods, services, deployments
   - All resources in Running state

8. **github-actions.png** - CI/CD pipeline
   - GitHub Actions workflow execution
   - All stages passing (lint, test, build, deploy)
   - Green checkmarks for successful stages

9. **selenium-report.png** - Selenium test report
   - HTML test report
   - Test results with pass/fail status
   - Test execution times

10. **ansible.png** - Ansible playbook execution
    - Terminal showing ansible-playbook output
    - Tasks being executed
    - Success status for all tasks

## How to Capture Screenshots

### Application Screenshots

1. **Start the application:**
   ```bash
   docker-compose up -d
   ```

2. **Open browser to http://localhost**

3. **Capture each screen:**
   - Login page (before login)
   - Dashboard (after login)
   - Students tab with data
   - Profile tab
   - Navigation with active tab

4. **Save as PNG files** with names listed above

### Docker Compose Screenshot

```bash
# Start services
docker-compose up -d

# Capture terminal output
docker-compose ps

# Take screenshot of terminal
```

### Kubernetes Screenshot

```bash
# Deploy to AKS
kubectl apply -f k8s/

# Capture terminal output
kubectl get all

# Take screenshot of terminal
```

### GitHub Actions Screenshot

1. Go to GitHub repository
2. Click "Actions" tab
3. Select a successful workflow run
4. Capture the workflow visualization
5. Save as `github-actions.png`

### Selenium Report Screenshot

```bash
# Run Selenium tests
cd selenium_tests
pytest --html=test_report.html --self-contained-html

# Open test_report.html in browser
# Capture the report page
# Save as selenium-report.png
```

### Ansible Screenshot

```bash
# Run Ansible playbook
cd ansible
ansible-playbook -i hosts.ini playbook.yml

# Capture terminal output showing:
# - Tasks being executed
# - Success status
# - Recap at the end
```

## Screenshot Guidelines

### Technical Requirements

- **Format:** PNG (preferred) or JPG
- **Resolution:** Minimum 1280x720, recommended 1920x1080
- **Quality:** High quality, clear and readable text
- **File Size:** Keep under 5MB per image

### Content Guidelines

- **Clarity:** Ensure all text is readable
- **Context:** Include relevant UI elements and labels
- **Completeness:** Show the full screen or relevant section
- **Annotations:** Add arrows or highlights if needed (optional)

### Privacy

- **Remove sensitive data:**
  - Real email addresses
  - Real passwords
  - Personal information
  - API keys or secrets
  - IP addresses (if sensitive)

- **Use test data:**
  - Test usernames (e.g., testuser, johndoe)
  - Test emails (e.g., test@example.com)
  - Sample student records

## Screenshot Checklist

Before submission, verify you have:

- [ ] login.png - Login page
- [ ] dashboard.png - Dashboard/Home
- [ ] students.png - Student management
- [ ] profile.png - User profile
- [ ] navigation.png - Navigation tabs
- [ ] docker-compose.png - Docker Compose
- [ ] kubernetes.png - Kubernetes deployment
- [ ] github-actions.png - CI/CD pipeline
- [ ] selenium-report.png - Test report
- [ ] ansible.png - Ansible execution

## Tools for Screenshots

### Windows
- **Snipping Tool** - Built-in screenshot tool
- **Snip & Sketch** - Windows 10/11 screenshot tool
- **ShareX** - Advanced screenshot tool (free)

### macOS
- **Command+Shift+3** - Full screen
- **Command+Shift+4** - Selection
- **Command+Shift+5** - Screenshot utility

### Linux
- **gnome-screenshot** - GNOME screenshot tool
- **Spectacle** - KDE screenshot tool
- **Flameshot** - Advanced screenshot tool

### Browser Extensions
- **Awesome Screenshot** - Full page screenshots
- **Nimbus Screenshot** - Annotated screenshots
- **Lightshot** - Quick screenshots

## Editing Screenshots

If you need to edit screenshots:

1. **Crop** to relevant area
2. **Resize** if too large
3. **Add annotations** (arrows, boxes, text)
4. **Blur sensitive information**
5. **Optimize file size** without losing quality

### Recommended Tools

- **GIMP** - Free image editor (all platforms)
- **Paint.NET** - Windows image editor
- **Preview** - macOS built-in editor
- **Photopea** - Online image editor

## Submission

When submitting:

1. Ensure all required screenshots are present
2. Verify file names match the list above
3. Check image quality and readability
4. Confirm no sensitive data is visible
5. Include this directory in your submission

## Example Screenshot Descriptions

### For Documentation

When referencing screenshots in documentation:

```markdown
![Login Page](screenshots/login.png)
*User authentication with registration link*

![Dashboard](screenshots/dashboard.png)
*Welcome message and system statistics*
```

### For Submission Report

When describing screenshots in your report:

**Figure 1: Login Page**
- Shows the user authentication interface
- Includes login form with username and password fields
- Displays registration link for new users
- Demonstrates responsive design

**Figure 2: Kubernetes Deployment**
- Shows all pods in Running state
- Displays services with ClusterIP and LoadBalancer types
- Demonstrates successful deployment to AKS
- Includes frontend, backend, and MongoDB components

## Notes

- Screenshots should be taken from a **clean, working deployment**
- Use **consistent test data** across screenshots
- Ensure **timestamps are recent** (if visible)
- **Test all functionality** before capturing screenshots
- Keep **original high-quality versions** as backup

## Troubleshooting

### Screenshot is blurry
- Increase screen resolution
- Use native screenshot tools
- Avoid scaling or compression

### Text is not readable
- Increase font size in terminal
- Use higher resolution
- Zoom in before capturing

### Colors look wrong
- Check color profile settings
- Use PNG format for better quality
- Avoid excessive compression

### File size too large
- Use PNG optimization tools
- Crop unnecessary areas
- Reduce resolution if acceptable
- Use online compression tools (TinyPNG, etc.)
