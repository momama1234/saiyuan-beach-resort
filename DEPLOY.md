# Web Andalay Deployment Guide

## 🚀 Deployment Overview

This guide covers deploying Web Andalay (Next.js app) to Digital Ocean Droplet using GitHub Actions and Docker.

## 📋 Prerequisites

### 1. Digital Ocean Droplet Setup

- Ubuntu 20.04+ Droplet
- Docker installed
- SSH access configured

### 2. GitHub Repository Secrets

Configure the following secrets in your GitHub repository settings:

| Secret Name   | Description                         | Example                                  |
| ------------- | ----------------------------------- | ---------------------------------------- |
| `DO_HOST`     | Digital Ocean Droplet IP address    | `192.168.1.100`                          |
| `DO_USERNAME` | SSH username                        | `root` or `ubuntu`                       |
| `DO_SSH_KEY`  | Private SSH key for droplet access  | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DO_PORT`     | SSH port (optional, defaults to 22) | `22`                                     |

## 🐳 Docker Setup on Digital Ocean Droplet

### Install Docker

```bash
# Update package index
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (optional)
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

### Configure Firewall

```bash
# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow application port
sudo ufw allow 3000

# Enable firewall
sudo ufw --force enable
```

## 🔧 Local Development & Testing

### Build and Test Locally

```bash
# From project root
cd apps/web-andalay

# Build Docker image
docker build -t web-andalay -f Dockerfile ../..

# Run container
docker run -p 3000:3000 -e NODE_ENV=production web-andalay

# Test with docker-compose
docker-compose up --build
```

### Test the Application

```bash
# Check if app is running
curl http://localhost:3000

# Check container logs
docker logs web-andalay

# Check container status
docker ps
```

## 🚀 Deployment Process

### Automatic Deployment

The deployment triggers automatically when:

- Code is pushed to `main` or `master` branch
- Changes are made to `apps/web-andalay/**` or `packages/**`
- Workflow file is modified

### Manual Deployment

1. Go to your GitHub repository
2. Navigate to **Actions** tab
3. Select **Deploy Web Andalay to Digital Ocean** workflow
4. Click **Run workflow**

### What Happens During Deployment

1. **Build Phase**:
    - Checkout repository code
    - Set up Docker Buildx
    - Login to GitHub Container Registry
    - Build and push Docker image

2. **Deploy Phase**:
    - SSH into Digital Ocean Droplet
    - Stop existing container
    - Pull latest image
    - Start new container
    - Verify deployment

## 🔍 Monitoring & Troubleshooting

### Check Application Status

```bash
# SSH into your droplet
ssh user@your-droplet-ip

# Check running containers
docker ps

# Check application logs
docker logs web-andalay

# Check container health
docker inspect web-andalay | grep Health
```

### Common Issues

#### 1. Build Failures

```bash
# Check GitHub Actions logs
# Usually caused by:
# - Missing dependencies
# - TypeScript errors
# - Build configuration issues
```

#### 2. Deployment Failures

```bash
# SSH connection issues
# Check your SSH key and droplet configuration

# Docker issues on droplet
sudo systemctl status docker
sudo systemctl restart docker
```

#### 3. Application Not Starting

```bash
# Check container logs
docker logs web-andalay

# Check port conflicts
netstat -tulpn | grep :3000

# Restart container
docker restart web-andalay
```

## 🔄 Updates & Rollbacks

### Update Application

1. Push changes to main branch
2. GitHub Actions will automatically deploy
3. Monitor deployment in Actions tab

### Rollback to Previous Version

```bash
# SSH into droplet
ssh user@your-droplet-ip

# List available images
docker images | grep web-andalay

# Stop current container
docker stop web-andalay
docker rm web-andalay

# Run previous version
docker run -d --name web-andalay --restart unless-stopped -p 3000:3000 [PREVIOUS_IMAGE_TAG]
```

## 🔒 Security Considerations

### SSL/TLS Setup (Recommended)

```bash
# Install Nginx
sudo apt install nginx

# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Configure domain
sudo nano /etc/nginx/sites-available/web-andalay

# Enable site
sudo ln -s /etc/nginx/sites-available/web-andalay /etc/nginx/sites-enabled/

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Test renewal
sudo certbot renew --dry-run
```

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Performance Optimization

### Container Resources

```bash
# Run with resource limits
docker run -d \
  --name web-andalay \
  --restart unless-stopped \
  --memory="1g" \
  --cpus="1.0" \
  -p 3000:3000 \
  web-andalay
```

### Monitoring

```bash
# Check resource usage
docker stats web-andalay

# Check system resources
htop
df -h
```

## 🆘 Support

If you encounter issues:

1. Check GitHub Actions logs
2. Check container logs: `docker logs web-andalay`
3. Verify all secrets are correctly configured
4. Ensure your droplet has sufficient resources
5. Check firewall and network configuration

## 📝 Additional Notes

- The application runs on port 3000 by default
- Images are stored in GitHub Container Registry
- Automatic cleanup removes unused images after deployment
- Health checks ensure the application is responding correctly
- Container automatically restarts on failure
