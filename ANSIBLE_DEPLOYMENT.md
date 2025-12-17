# Ansible Deployment Guide

## Current Azure Infrastructure

Your Azure for Students subscription has the following VMs configured:

- **sms-web1**: Public IP `4.193.200.100`, Private IP `10.0.0.4`
- **sms-web2**: Private IP `10.0.0.5` (no public IP)

## Ansible Inventory Configuration

The `ansible/hosts.ini` file is already configured with your VM details:

```ini
[webservers]
web1 ansible_host=4.193.200.100
web2 ansible_host=10.0.0.5

[dbservers]
db1 ansible_host=10.0.0.5

[all:vars]
ansible_user=azureuser
ansible_ssh_private_key_file=~/.ssh/id_rsa
ansible_python_interpreter=/usr/bin/python3
```

## Quick Start

### 1. Install Ansible (if not already installed)

```bash
# Windows (using pip)
pip install ansible

# Or using WSL
wsl --install
# Then in WSL:
sudo apt update
sudo apt install ansible
```

### 2. Test Connectivity

```bash
cd ansible
ansible all -i hosts.ini -m ping
```

### 3. Run the Playbook

Deploy the complete infrastructure:

```bash
ansible-playbook -i hosts.ini playbook.yml
```

## What Gets Deployed

The Ansible playbook will:

1. **Common Role** - Update packages, install utilities
2. **Docker Role** - Install Docker and Docker Compose
3. **Node.js Role** - Install Node.js 18 LTS
4. **Firewall Role** - Configure UFW firewall
5. **App Role** - Deploy the Student Management System

## Verification

After deployment, verify the application:

```bash
# Check if services are running
curl http://4.193.200.100:3000/health

# Access the application
http://4.193.200.100
```

## Alternative: Use AKS Deployment

Since you already have a working AKS deployment at `http://135.171.208.223`, you may prefer to use that instead of VMs to avoid quota issues.

## Troubleshooting

### Azure Quota Limits

Your Azure for Students subscription has:
- **3 Public IPs max** (currently using all 3)
- **4 CPU cores max** (currently using all 4)

If you need more resources, consider:
1. Deleting unused resources
2. Using the AKS deployment instead
3. Requesting quota increase (may not be available for student accounts)

### SSH Access

To access web1:
```bash
ssh azureuser@4.193.200.100
```

To access web2 (via web1 as jump host):
```bash
ssh -J azureuser@4.193.200.100 azureuser@10.0.0.5
```

## Summary

You have successfully:
- ✅ Deployed to AKS (http://135.171.208.223)
- ✅ Created Azure VMs for Ansible deployment
- ✅ Configured Ansible inventory
- ⏳ Ready to run Ansible playbook when needed

The Ansible configuration is complete and ready to use whenever you want to deploy to VMs instead of Kubernetes.
