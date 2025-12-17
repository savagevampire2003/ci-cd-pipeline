#!/bin/bash
# Setup Ansible on Azure VM and run playbook

echo "=== Installing Ansible on Ubuntu VM ==="

# Update package list
sudo apt update

# Install software-properties-common (required for adding PPA)
sudo apt install -y software-properties-common

# Add Ansible PPA
sudo add-apt-repository --yes --update ppa:ansible/ansible

# Install Ansible
sudo apt install -y ansible

# Verify installation
ansible --version

echo ""
echo "=== Ansible installed successfully! ==="
echo ""
echo "Next steps:"
echo "1. Upload your ansible directory to this VM"
echo "2. Run: ansible-playbook -i ansible/hosts.ini ansible/playbook.yml"
