#!/usr/bin/env bash
# ==============================================================================
# BankSight AI — Automated Oracle Cloud Ubuntu VM Deployment Script
# ==============================================================================
set -e

echo "========================================================================"
echo "  BankSight AI — Automated Deployment for Oracle Cloud Ubuntu VM"
echo "========================================================================"

# 1. Update OS Packages
echo "[1/5] Updating system packages..."
sudo apt-get update -y
sudo apt-get install -y --no-install-recommends \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    iptables-persistent \
    netfilter-persistent

# 2. Configure Oracle Cloud Ubuntu Firewall (iptables)
echo "[2/5] Opening firewall ports (80, 443, 8000) for Oracle Cloud VM..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 1 -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 1 -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8000 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 1 -p tcp --dport 8000 -j ACCEPT
sudo netfilter-persistent save

# 3. Install Docker & Docker Compose
echo "[3/5] Installing Docker & Docker Compose..."
if ! command -v docker &> /dev/null; then
    sudo apt-get install -y docker.io docker-compose-v2
    sudo systemctl enable --now docker
    sudo usermod -aG docker "$USER"
fi

# 4. Clone or Pull Latest Code
REPO_DIR="$HOME/BankSight-AI"
if [ -d "$REPO_DIR/.git" ]; then
    echo "[4/5] Pulling latest code from GitHub..."
    cd "$REPO_DIR"
    git pull origin main
else
    echo "[4/5] Cloning BankSight-AI from GitHub..."
    git clone https://github.com/pranavkokande60/BankSight-AI.git "$REPO_DIR"
    cd "$REPO_DIR"
fi

# 5. Build and Start Container
echo "[5/5] Building and launching BankSight AI Docker container..."
sudo docker compose down 2>/dev/null || true
sudo docker compose up -d --build

PUBLIC_IP=$(curl -s https://ifconfig.me || curl -s https://api.ipify.org || echo "YOUR_SERVER_IP")

echo ""
echo "========================================================================"
echo "  SUCCESS! BankSight AI is now running on Oracle Cloud!"
echo "========================================================================"
echo "  Live Application URL: http://${PUBLIC_IP}:8000"
echo "  API Documentation:    http://${PUBLIC_IP}:8000/docs"
echo "========================================================================"
echo "  NOTE: Ensure port 8000 is allowed in your Oracle Cloud Ingress Rules:"
echo "  OCI Console -> Networking -> VCN -> Security Lists -> Add Ingress Rule (Port 8000)"
echo "========================================================================"
