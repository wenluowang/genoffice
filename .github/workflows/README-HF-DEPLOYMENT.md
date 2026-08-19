# Hugging Face Spaces Docker Deployment

This document explains how to deploy GenOffice to Hugging Face Spaces using Docker images.

## Overview

The GitHub Actions workflow automatically builds and pushes Docker images to the Hugging Face container registry. This approach:

- ✅ **Does NOT push source code** to Hugging Face Spaces
- ✅ **Only builds and pushes Docker images** to `huggingface.co/YOUR_USERNAME/genoffice`
- ✅ **Supports automatic deployment** on push to main branch
- ✅ **Provides manual deployment options** via script or CLI

## Prerequisites

1. **Hugging Face Account**: Create one at https://huggingface.co
2. **Hugging Face Space**: Create a new Space with Docker SDK
3. **GitHub Repository Secrets**: Configure as described below

## Setup Instructions

### Step 1: Create Hugging Face Space

1. Go to https://huggingface.co/spaces
2. Click "Create new Space"
3. Choose:
   - **Space name**: `genoffice` (or your preferred name)
   - **License**: Apache-2.0
   - **SDK**: Docker
   - **Visibility**: Public or Private (your choice)
4. Click "Create Space"

### Step 2: Configure GitHub Secrets

In your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click "New repository secret"
3. Add these secrets:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `HF_USERNAME` | Your Hugging Face username | `your-username` |
| `HF_TOKEN` | Hugging Face API token with write permissions | `hf_xxxxxxxxxxxx` |

To get your HF_TOKEN:
1. Go to https://huggingface.co/settings/tokens
2. Click "Create new token"
3. Select role: "Write"
4. Copy the generated token

### Step 3: Deploy

#### Option A: Automatic Deployment (Recommended)

Simply push to the `main` branch:

```bash
git add .
git commit -m "Update GenOffice"
git push origin main
```

The workflow will automatically:
1. Build the Docker image
2. Push to `huggingface.co/YOUR_USERNAME/genoffice:latest`
3. Tag with commit SHA and branch name

#### Option B: Manual Deployment with Script

```bash
cd docker
export HF_USERNAME="your-username"
export HF_TOKEN="hf_xxxxxxxxxxxx"
./deploy-to-hf.sh
```

#### Option C: Manual Deployment with Docker CLI

```bash
# Build the image
docker build -t genoffice .

# Tag for Hugging Face
docker tag genoffice huggingface.co/YOUR_USERNAME/genoffice:latest

# Login to Hugging Face
docker login huggingface.co
# Enter your username and token when prompted

# Push the image
docker push huggingface.co/YOUR_USERNAME/genoffice:latest
```

### Step 4: Configure Hugging Face Space

1. Go to your Space: https://huggingface.co/spaces/YOUR_USERNAME/genoffice
2. Click on the **"Files"** tab
3. Upload or update these files:
   - `README.md` (use content from `docker/HF_SPACE_README.md`)
   - Optionally create a `.dockerignore` file
4. Click on the **"Settings"** tab
5. Under **"Docker"**, ensure the image is set to:
   ```
   huggingface.co/YOUR_USERNAME/genoffice:latest
   ```
6. Click **"Restart"** or **"Rebuild"** to apply changes

Your Space should now be running the latest Docker image!

## Workflow Details

### Trigger Conditions

The workflow triggers on:
- Push to `main` branch with changes in:
  - `apps/**`
  - `packages/**`
  - `docker/**`
  - `Dockerfile`
  - `docker-compose.yml`
  - `.dockerignore`
- Manual trigger via GitHub Actions UI

### Image Tags

The workflow creates multiple tags:
- `latest` - Always points to the latest successful build from main
- `main` - Branch-based tag
- `<commit-sha>` - Unique tag for each commit
- `<semver>` - If version tags exist (e.g., `v0.6.0`)

### Caching

The workflow uses GitHub Actions cache to speed up builds:
- Docker layer caching via GitHub Cache API
- Buildx cache for faster subsequent builds

## Troubleshooting

### Build Fails

Check the GitHub Actions logs for detailed error messages. Common issues:

1. **Rust installation fails**: Ensure the builder stage has enough resources
2. **npm install fails**: Check package-lock.json is up to date
3. **Build runs out of memory**: Consider using GitHub-hosted runners with more RAM

### Push Fails

1. **Authentication error**: Verify HF_USERNAME and HF_TOKEN are correct
2. **Permission denied**: Ensure HF_TOKEN has write permissions
3. **Repository not found**: Check that the Space exists and you own it

### Space Doesn't Update

1. **Wrong image selected**: Verify Space settings point to correct image
2. **Cache issue**: Try "Rebuild" instead of "Restart"
3. **Port mismatch**: Ensure Docker image exposes port 7860 for HF Spaces

## Security Considerations

- **Never commit HF_TOKEN** to the repository
- **Use GitHub Secrets** for all credentials
- **Rotate tokens periodically** for security
- **Review Docker image contents** before pushing to public registry

## Cost Considerations

- **Hugging Face Spaces**: Free tier available, paid tiers for more resources
- **GitHub Actions**: Free minutes included, additional usage may incur costs
- **Docker Storage**: Hugging Face provides free container registry storage

## Support

For issues:
- GitHub Issues: https://github.com/genspark-ai/genoffice/issues
- Hugging Face Community: https://discuss.huggingface.co/
