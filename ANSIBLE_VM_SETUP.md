# Running Ansible from Azure VM

## Step 1: SSH into the VM

Open PowerShell and connect to your Azure VM:

```powershell
ssh azureuser@4.193.200.100
```

When prompted, type `yes` to accept the host key.

## Step 2: Install Ansible on the VM

Once connected, run these commands:

```bash
# Update package list
sudo apt update

# Install Ansible
sudo apt install -y software-properties-common
sudo add-apt-repository --yes --update ppa:ansible/ansible
sudo apt install -y ansible

# Verify installation
ansible --version
```

## Step 3: Upload Ansible Files to VM

From your **local machine** (open a new PowerShell window), upload the ansible directory:

```powershell
# Create a tar archive of the ansible directory
tar -czf ansible.tar.gz ansible/

# Upload to VM
scp ansible.tar.gz azureuser@4.193.200.100:~/

# Also upload docker-compose.yml (needed by the app role)
scp docker-compose.yml azureuser@4.193.200.100:~/
```

## Step 4: Extract and Prepare Files on VM

Back in your **SSH session** on the VM:

```bash
# Extract the ansible files
tar -xzf ansible.tar.gz

# Verify files are there
ls -la ansible/

# Check the inventory
cat ansible/hosts.ini
```

## Step 5: Test Ansible Connectivity

```bash
# Test connection to localhost (web1)
ansible web1 -i ansible/hosts.ini -m ping

# This should succeed since we're on web1
```

## Step 6: Run the Ansible Playbook

```bash
# Run the full playbook
ansible-playbook -i ansible/hosts.ini ansible/playbook.yml --ask-become-pass

# When prompted, enter the sudo password (same as your SSH password)
```

### Run Specific Roles (Optional)

If you want to run specific parts:

```bash
# Install only Docker
ansible-playbook -i ansible/hosts.ini ansible/playbook.yml --tags docker --ask-become-pass

# Install only Node.js
ansible-playbook -i ansible/hosts.ini ansible/playbook.yml --tags nodejs --ask-become-pass

# Configure only firewall
ansible-playbook -i ansible/hosts.ini ansible/playbook.yml --tags firewall --ask-become-pass
```

## Step 7: Verify Installation

After the playbook completes, verify the installations:

```bash
# Check Docker
docker --version
docker compose version

# Check Node.js
node --version
npm --version

# Check firewall
sudo ufw status

# Check if application is running (if app role was executed)
docker compose ps
```

## Troubleshooting

### If you get "Permission denied" errors:
```bash
# Make sure you're using --ask-become-pass
ansible-playbook -i ansible/hosts.ini ansible/playbook.yml --ask-become-pass
```

### If web2 connection fails:
The playbook is configured to use web1 as a jump host for web2. Make sure:
1. SSH keys are properly set up
2. web1 can reach web2 on the private network

### To run only on web1 (skip web2):
```bash
ansible-playbook -i ansible/hosts.ini ansible/playbook.yml --limit web1 --ask-become-pass
```

## Quick Command Reference

```bash
# SSH to VM
ssh azureuser@4.193.200.100

# Check Ansible version
ansible --version

# List all hosts
ansible all -i ansible/hosts.ini --list-hosts

# Ping all hosts
ansible all -i ansible/hosts.ini -m ping

# Run playbook
ansible-playbook -i ansible/hosts.ini ansible/playbook.yml --ask-become-pass

# Run playbook in check mode (dry run)
ansible-playbook -i ansible/hosts.ini ansible/playbook.yml --check

# Run with verbose output
ansible-playbook -i ansible/hosts.ini ansible/playbook.yml -v --ask-become-pass
```

## Expected Output

When the playbook runs successfully, you should see:

```
PLAY [Configure Web Servers] ***********************************************

TASK [Gathering Facts] *****************************************************
ok: [web1]

TASK [common : Update apt cache] *******************************************
changed: [web1]

TASK [common : Install essential packages] *********************************
changed: [web1]

...

PLAY RECAP *****************************************************************
web1                       : ok=25   changed=20   unreachable=0    failed=0
```

## What Gets Installed

The playbook will install and configure:

1. **Common packages:** curl, wget, git, vim, htop, etc.
2. **Docker:** Docker CE and Docker Compose
3. **Node.js:** Node.js 18 LTS and npm
4. **Firewall:** UFW with ports 22, 80, 443, 3000 open
5. **Application:** Docker Compose setup (if app role runs)

## After Successful Deployment

Your application will be accessible at:
- http://4.193.200.100 (if deployed via Docker Compose)

To check the application:
```bash
# Check running containers
docker compose ps

# Check logs
docker compose logs

# Access the application
curl http://localhost
```
