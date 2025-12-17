# Ansible Configuration Management

This directory contains Ansible playbooks and roles for automating the deployment and configuration of the Student Management System infrastructure.

## Prerequisites

1. **Ansible installed** on your control machine:
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install ansible

   # macOS
   brew install ansible

   # Or using pip
   pip install ansible
   ```

2. **SSH access** to target servers with sudo privileges

3. **SSH key** configured for passwordless authentication

## Directory Structure

```
ansible/
├── hosts.ini              # Inventory file with target hosts
├── playbook.yml           # Main playbook
├── README.md              # This file
└── roles/
    ├── common/            # Base system configuration
    ├── docker/            # Docker installation
    ├── nodejs/            # Node.js installation
    ├── firewall/          # Firewall configuration
    └── app/               # Application deployment
```

## Configuration

### 1. Update Inventory File

Edit `hosts.ini` and replace the placeholder IP addresses with your actual server IPs:

```ini
[webservers]
web1 ansible_host=YOUR_WEB_SERVER_1_IP
web2 ansible_host=YOUR_WEB_SERVER_2_IP

[dbservers]
db1 ansible_host=YOUR_DB_SERVER_IP

[all:vars]
ansible_user=YOUR_SSH_USER
ansible_ssh_private_key_file=~/.ssh/YOUR_PRIVATE_KEY
```

### 2. Test Connectivity

Verify Ansible can connect to all hosts:

```bash
ansible all -i hosts.ini -m ping
```

Expected output:
```
web1 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
...
```

## Usage

### Run the Complete Playbook

Deploy the entire infrastructure:

```bash
ansible-playbook -i hosts.ini playbook.yml
```

### Run Specific Roles

Deploy only specific components:

```bash
# Install only Docker
ansible-playbook -i hosts.ini playbook.yml --tags docker

# Install only Node.js
ansible-playbook -i hosts.ini playbook.yml --tags nodejs
```

### Run on Specific Hosts

Target specific host groups:

```bash
# Configure only web servers
ansible-playbook -i hosts.ini playbook.yml --limit webservers

# Configure only database servers
ansible-playbook -i hosts.ini playbook.yml --limit dbservers
```

### Dry Run (Check Mode)

Preview changes without applying them:

```bash
ansible-playbook -i hosts.ini playbook.yml --check
```

### Verbose Output

Run with increased verbosity for debugging:

```bash
ansible-playbook -i hosts.ini playbook.yml -v   # verbose
ansible-playbook -i hosts.ini playbook.yml -vv  # more verbose
ansible-playbook -i hosts.ini playbook.yml -vvv # very verbose
```

## What the Playbook Does

### Common Role
- Updates system packages
- Installs essential utilities (curl, wget, git, vim, etc.)
- Creates application user and directories
- Sets timezone to UTC

### Docker Role
- Removes old Docker versions
- Adds Docker repository
- Installs Docker CE and Docker Compose
- Starts and enables Docker service
- Adds application user to docker group
- Verifies installation

### Node.js Role
- Adds NodeSource repository
- Installs Node.js 18 LTS
- Installs npm
- Installs global packages (pm2)
- Verifies installation

### Firewall Role
- Installs and configures UFW firewall
- Opens required ports:
  - 22 (SSH)
  - 80 (HTTP)
  - 443 (HTTPS)
  - 3000 (Backend API - web servers only)
  - 27017 (MongoDB - database servers only)
- Enables firewall
- Verifies configuration

### App Role (Web Servers Only)
- Copies docker-compose.yml to server
- Creates environment configuration
- Pulls Docker images
- Starts application services
- Verifies health endpoints
- Displays running containers

## Verification

After running the playbook, verify the installation:

### Check Docker
```bash
ansible webservers -i hosts.ini -m command -a "docker --version"
ansible webservers -i hosts.ini -m command -a "docker compose version"
```

### Check Node.js
```bash
ansible webservers -i hosts.ini -m command -a "node --version"
ansible webservers -i hosts.ini -m command -a "npm --version"
```

### Check Firewall
```bash
ansible all -i hosts.ini -m command -a "sudo ufw status" -b
```

### Check Running Services
```bash
ansible webservers -i hosts.ini -m command -a "docker compose ps" -a "chdir=/opt/sms"
```

### Check Application Health
```bash
# Backend health
curl http://YOUR_WEB_SERVER_IP:3000/health

# Frontend
curl http://YOUR_WEB_SERVER_IP/health.html
```

## Troubleshooting

### Connection Issues

If you get connection errors:

1. Verify SSH access manually:
   ```bash
   ssh -i ~/.ssh/your_key user@server_ip
   ```

2. Check SSH key permissions:
   ```bash
   chmod 600 ~/.ssh/your_key
   ```

3. Verify Python is installed on target hosts:
   ```bash
   ansible all -i hosts.ini -m raw -a "python3 --version"
   ```

### Permission Issues

If you get permission denied errors:

1. Ensure your user has sudo privileges
2. Add `-b` flag to become root:
   ```bash
   ansible-playbook -i hosts.ini playbook.yml -b
   ```

### Docker Issues

If Docker installation fails:

1. Check if old Docker versions are installed
2. Manually remove them:
   ```bash
   sudo apt remove docker docker-engine docker.io containerd runc
   ```

### Service Verification Failures

If health checks fail:

1. Check Docker containers are running:
   ```bash
   ssh user@server "cd /opt/sms && docker compose ps"
   ```

2. Check container logs:
   ```bash
   ssh user@server "cd /opt/sms && docker compose logs"
   ```

3. Verify firewall rules:
   ```bash
   ssh user@server "sudo ufw status verbose"
   ```

## Customization

### Environment Variables

Edit `roles/app/templates/env.j2` to customize application configuration.

### Firewall Rules

Edit `roles/firewall/tasks/main.yml` to add or modify firewall rules.

### Docker Compose

The playbook copies the docker-compose.yml from the project root. Ensure it's up to date before running the playbook.

## Requirements Validation

This Ansible configuration satisfies the following requirements:

- **Requirement 8.1**: Inventory file defines two web servers and one database server
- **Requirement 8.2**: Docker role installs Docker CE on all target machines
- **Requirement 8.3**: Node.js role installs Node.js 18 and npm on web servers
- **Requirement 8.4**: Firewall role configures UFW with required ports
- **Requirement 8.5**: App role verifies all services are running correctly

## Additional Resources

- [Ansible Documentation](https://docs.ansible.com/)
- [Ansible Best Practices](https://docs.ansible.com/ansible/latest/user_guide/playbooks_best_practices.html)
- [Docker Installation Guide](https://docs.docker.com/engine/install/ubuntu/)
- [Node.js Installation Guide](https://github.com/nodesource/distributions)
