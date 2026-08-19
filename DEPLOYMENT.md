# GenOffice Deployment Guide

This guide covers multiple deployment options for GenOffice, including Docker, web server, and Hugging Face Spaces.

## Table of Contents

- [Docker Deployment](#docker-deployment)
- [Docker Compose](#docker-compose)
- [Hugging Face Spaces](#hugging-face-spaces)
- [Manual Web Server](#manual-web-server)
- [Environment Variables](#environment-variables)

## Docker Deployment

### Build the Docker Image

```bash
# Build the production image
docker build -t genoffice .

# Build with a specific tag
docker build -t genoffice:latest .
```

### Run the Docker Container

```bash
# Basic run
docker run -p 3000:3000 genoffice

# With environment variables
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e HOST=0.0.0.0 \
  genoffice

# Detached mode with restart policy
docker run -d --restart unless-stopped \
  -p 3000:3000 \
  --name genoffice \
  genoffice
```

### Access the Application

Once running, access GenOffice at: `http://localhost:3000`

Health check endpoint: `http://localhost:3000/health`

## Docker Compose

### Quick Start

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Docker Compose Configuration

The `docker-compose.yml` includes:
- Port mapping (3000:3000)
- Environment variables
- Restart policies
- Health checks
- Resource limits

### Production Deployment

For production use, you can customize `docker-compose.yml`:

```yaml
services:
  genoffice:
    # Add persistent storage if needed
    volumes:
      - genoffice-data:/app/data
    
    # Add custom environment variables
    environment:
      - NODE_ENV=production
      - PORT=3000
    
    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

volumes:
  genoffice-data:
```

## Hugging Face Spaces

GenOffice supports deployment to Hugging Face Spaces using Docker containers. The GitHub Actions workflow automatically builds and pushes Docker images to the Hugging Face container registry.

### Prerequisites

1. A Hugging Face account
2. A Hugging Face Space created (Docker SDK type)
3. GitHub repository secrets configured

### Setup GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, then add:

- `HF_USERNAME`: Your Hugging Face username
- `HF_TOKEN`: Your Hugging Face API token (with write permissions)

To get your HF_TOKEN:
1. Go to https://huggingface.co/settings/tokens
2. Create a new token with "write" permissions
3. Copy the token and add it to your GitHub secrets

### Automatic Deployment

The GitHub Actions workflow (`.github/workflows/deploy-hf-space.yml`) will automatically:

1. Build the Docker image when you push to `main` branch
2. Push the image to `huggingface.co/YOUR_USERNAME/genoffice`
3. Tag the image with branch name, SHA, and `latest`

### Manual Deployment

If you prefer manual deployment:

```bash
# Build the image
docker build -t genoffice .

# Tag for Hugging Face
docker tag genoffice huggingface.co/YOUR_USERNAME/genoffice:latest

# Login to Hugging Face
docker login huggingface.co
# Enter your username and token

# Push the image
docker push huggingface.co/YOUR_USERNAME/genoffice:latest
```

### Configure Hugging Face Space

1. Go to your Hugging Face Space: https://huggingface.co/spaces/YOUR_USERNAME/genoffice
2. Click on "Settings" tab
3. Under "Docker", select the pushed image: `huggingface.co/YOUR_USERNAME/genoffice:latest`
4. Configure environment variables if needed:
   - `PORT`: Should be 7860 for HF Spaces (auto-configured)
   - `HOST`: Should be 0.0.0.0
5. Click "Restart" or "Rebuild" to apply changes

### Space Metadata

Create or update `README.md` in your Space with:

```markdown
---
title: GenOffice Web
emoji: 🚀
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: apache-2.0
---

# GenOffice Web

The world's first full-featured open-source AI Office suite!

## Features

- 📄 **Docs** - Word processor with .docx support
- 📊 **Sheets** - Spreadsheet editor with .xlsx support
- 📽️ **Slides** - Presentation editor with .pptx support
- 📕 **PDF** - PDF viewer and editor
- 📝 **Markdown** - Markdown editor

## About

GenOffice is a free, open-source alternative to Microsoft Office for macOS, Windows, and Linux, 
built around AI editing as a first-class workflow.

[GitHub Repository](https://github.com/genspark-ai/genoffice)
```

## Manual Web Server

### Prerequisites

- Node.js 22+
- npm

### Setup

```bash
# Install dependencies
npm install

# Build all applications
npm run build:all

# Start the web server
node docker/server.js
```

Or with custom port:

```bash
PORT=8080 node docker/server.js
```

### Development Mode

```bash
# Start development servers
npm run dev
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `HOST` | 0.0.0.0 | Server host |
| `NODE_ENV` | production | Environment mode |

### Setting Environment Variables

**Docker:**
```bash
docker run -e PORT=3000 -e HOST=0.0.0.0 genoffice
```

**Docker Compose:**
Edit `docker-compose.yml` environment section.

**Hugging Face Spaces:**
Configure in Space settings → Variables and secrets.

**Manual:**
```bash
export PORT=3000
export HOST=0.0.0.0
node docker/server.js
```

## Troubleshooting

### Docker Build Fails

- Ensure you have enough disk space
- Check if Rust toolchain can be installed (required for xlsx-engine)
- Try clearing Docker cache: `docker builder prune`

### Container Won't Start

- Check logs: `docker logs genoffice`
- Verify port is not in use: `lsof -i :3000`
- Ensure health check passes: `curl http://localhost:3000/health`

### Hugging Face Deployment Issues

- Verify secrets are correctly set in GitHub
- Check HF_TOKEN has write permissions
- Ensure Space is configured to use Docker SDK
- Review GitHub Actions logs for detailed errors

### Performance Issues

- Increase container resources in docker-compose.yml
- Use production build: `npm run build:all`
- Enable caching in Docker builds

## Security Considerations

### Production Checklist

- [ ] Change default ports if needed
- [ ] Set up HTTPS/TLS termination
- [ ] Configure firewall rules
- [ ] Enable resource limits
- [ ] Set up monitoring and logging
- [ ] Regular security updates
- [ ] Backup strategy for user data

### Docker Security

- The Dockerfile uses a non-root user (`nodejs`)
- Health checks are enabled
- Consider adding security scanning: `docker scan genoffice`

## Support

For issues and questions:
- GitHub Issues: https://github.com/genspark-ai/genoffice/issues
- Documentation: https://github.com/genspark-ai/genoffice/docs
