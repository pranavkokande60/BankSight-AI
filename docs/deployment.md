# BankSight AI — Cloud & Server Deployment Guide

BankSight AI is configured for instant cloud server deployment with FastAPI serving both the REST analytics API and the pre-compiled React 18 production frontend.

---

## Option 1: Render.com (Recommended — Free & 1-Click)

Render connects directly to your GitHub repository and automatically deploys on every `git push`.

1. Go to **[render.com](https://render.com)** and sign in with your GitHub account.
2. Click **New +** $\rightarrow$ **Web Service**.
3. Choose **Build and deploy from a Git repository**.
4. Select your repository: **`pranavkokande60/BankSight-AI`**.
5. Configure the service settings:
   - **Name**: `banksight-ai`
   - **Region**: Choose closest to you (e.g. Frankfurt / Singapore / Oregon)
   - **Language**: `Python 3`
   - **Branch**: `main`
   - **Build Command**:
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: **Free**
6. Click **Create Web Service**.
7. Render will build the environment and provide your live HTTPS URL:
   `https://banksight-ai.onrender.com`

---

## Option 2: Railway.app (Zero-Config Fast Deploy)

1. Go to **[railway.app](https://railway.app)** and log in with GitHub.
2. Click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. Select **`pranavkokande60/BankSight-AI`**.
4. Railway will automatically detect the `Dockerfile` or `Procfile`.
5. Under **Settings** $\rightarrow$ **Networking**, click **Generate Domain**.
6. Your live URL will be active immediately.

---

## Option 3: Any Cloud VPS / Linux Server with Docker (AWS, DigitalOcean, Hetzner, GCP)

If you have an Ubuntu/Debian server or VM:

### 1. Clone the repository
```bash
git clone https://github.com/pranavkokande60/BankSight-AI.git
cd BankSight-AI
```

### 2. Run with Docker Compose
```bash
docker compose up -d --build
```
Your app will be running at `http://your-server-ip:8000`.

---

## Option 4: Linux Server as a Systemd Service (Native Python)

### 1. Set up Python virtual environment
```bash
git clone https://github.com/pranavkokande60/BankSight-AI.git /var/www/banksight-ai
cd /var/www/banksight-ai
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 2. Create Systemd Service File
```bash
sudo nano /etc/systemd/system/banksight.service
```
Paste:
```ini
[Unit]
Description=BankSight AI FastAPI Server
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/var/www/banksight-ai
ExecStart=/var/www/banksight-ai/venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### 3. Start and Enable Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable banksight
sudo systemctl start banksight
```
Check status:
```bash
sudo systemctl status banksight
```

---

## Option 5: Nginx Reverse Proxy with Free SSL (Certbot)

To serve on a custom domain (e.g., `banksight.yourdomain.com`) with HTTPS:

```nginx
server {
    server_name banksight.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable SSL:
```bash
sudo certbot --nginx -d banksight.yourdomain.com
```
