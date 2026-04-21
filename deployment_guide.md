# ConvoDoc ai Deployment Guide (Google Compute Engine)

This guide provides step-by-step instructions for deploying your Docker-compose application to a Google Compute Engine VM in Google Cloud Platform (GCP).

## 1. Create the Compute Engine VM

1. Go to the [Google Cloud Console](https://console.cloud.google.com/compute/instances).
2. Click **Create Instance**.
3. **Name**: `convodocai-prod`
4. **Region/Zone**: Choose one closest to your users.
5. **Machine Configuration**: `e2-medium` (Recommended for running multiple containers) or `e2-micro` (If trying to stay in Free Tier, but it may struggle with Docker build steps if memory usage spikes).
6. **Boot Disk**: Switch to **Ubuntu 22.04 LTS**. Change the size to at least 20GB.
7. **Firewall**: Check **Allow HTTP traffic** and **Allow HTTPS traffic**. (Very important as this opens port 80 and 443).
8. Click **Create**.

## 2. SSH and Install Dependencies

Click the **SSH** button next to your instance in the Google Cloud Console.

### Install Docker and Git

Run the following commands in the SSH terminal:

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose-v2 git

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Allow your user to run docker commands without sudo
sudo usermod -aG docker $USER
newgrp docker
```

## 3. Clone Your Repository

```bash
# Clone the repository (you might need to generate an SSH key on the VM or use a personal access token if your repo is private)
git clone <your-github-repo-url>
cd <your-repository-folder>
```

## 4. Securely Set Up Environment Variables

Do **NOT** upload your `.env` files to GitHub. You must manually create it on the server.

```bash
# Create the .env file in the root directory
nano .env
```

Paste your combined environment variables into this file. Need something like this:

```env
# Database & Backend
DATABASE_URL="postgresql://..."
GEMINI_API_KEY="AIzaSy..."
PINECONE_API_KEY="..."
PINECONE_ENV="us-east-1"
UPLOADTHING_TOKEN="..."
REDIS_URL="redis://redis:6379"  # NOTE: Using docker internal network

# Frontend
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://<YOUR_VM_EXTERNAL_IP>" # Change this!
NEXT_PUBLIC_API_URL="http://<YOUR_VM_EXTERNAL_IP>:8000" # Change this!
```

After pasting and saving the file:

```bash
# Secure the file so only the root/owner can read it
chmod 600 .env
```

## 5. Build and Deploy

Export your server's public IP address as an environment variable so the frontend build process catches it:

```bash
export NEXT_PUBLIC_API_URL="http://<YOUR_VM_EXTERNAL_IP>:8000"

# Build and start the containers in detached mode
sudo docker compose -f docker-compose.prod.yml up -d --build
```

Your app should now be live at `http://<YOUR_VM_EXTERNAL_IP>` !

---

## 🚀 Future Steps: Adding a Domain Name (e.g., convodocai.ai)

When you are ready to point a domain to your service (which provides a much better experience and allows for SSL/HTTPS), follow these exact steps:

### Step 1: Update DNS Records
1. Go to your domain registrar (e.g., Namecheap, GoDaddy, Google Domains).
2. Create an **A Record** pointing to your Google Compute Engine VM's External IP Address.
   - **Host**: `@`
   - **Value**: `<YOUR_VM_EXTERNAL_IP>`
3. Wait 5-15 minutes for DNS to propagate.

### Step 2: Use Caddy or Nginx for SSL Auto-renewal
The easiest way to get an SSL certificate is to add `Caddy` as a reverse proxy in front of your containers. Caddy automatically handles HTTPS and Let's Encrypt certificates.

1. **Modify `docker-compose.prod.yml`**:
Change the Frontend section to only expose port `3000` internally (remove `"80:3000"` mapping and leave it without `ports`).
Add Caddy to your `docker-compose.prod.yml`:

```yaml
  caddy:
    image: caddy:latest
    container_name: caddy-proxy
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy-data:/data
      - caddy-config:/config
    networks:
      - app-network
    depends_on:
      - frontend
      - backend

volumes:
  # ... existing volumes...
  caddy-data:
  caddy-config:
```

2. **Create a `Caddyfile`**
In the root directory of the VM, create a file named `Caddyfile`:

```bash
nano Caddyfile
```

Add these rules:

```caddyfile
# Frontend Requests
convodocai.ai {
    reverse_proxy frontend:3000
}

# Backend API Requests
api.convodocai.ai {
    reverse_proxy backend:8000
}
```

3. **Update Your `.env`**
Now that you have a domain, update the variables inside the server's `.env`:

```env
NEXTAUTH_URL="https://convodocai.ai"
NEXT_PUBLIC_API_URL="https://api.convodocai.ai"
```

4. **Re-Deploy**
```bash
sudo docker compose -f docker-compose.prod.yml down
sudo docker compose -f docker-compose.prod.yml up -d --build
```

You are now fully running in Production with SSL!
