#!/bin/bash

# GenOffice Docker Deployment Script for Hugging Face Spaces
# This script builds and pushes the Docker image to Hugging Face container registry

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 GenOffice Docker Deployment to Hugging Face${NC}"
echo "================================================"

# Check if HF_USERNAME is set
if [ -z "$HF_USERNAME" ]; then
    echo -e "${YELLOW}⚠️  HF_USERNAME environment variable not set${NC}"
    read -p "Enter your Hugging Face username: " HF_USERNAME
    export HF_USERNAME
fi

# Check if HF_TOKEN is set
if [ -z "$HF_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  HF_TOKEN environment variable not set${NC}"
    echo "You can get your token from: https://huggingface.co/settings/tokens"
    read -sp "Enter your Hugging Face API token: " HF_TOKEN
    export HF_TOKEN
    echo ""
fi

# Validate credentials
if [ -z "$HF_USERNAME" ] || [ -z "$HF_TOKEN" ]; then
    echo -e "${RED}❌ Error: Username and token are required${NC}"
    exit 1
fi

IMAGE_NAME="huggingface.co/${HF_USERNAME}/genoffice"
TAG="${1:-latest}"

echo ""
echo -e "${GREEN}📦 Building Docker image...${NC}"
echo "   Image: ${IMAGE_NAME}:${TAG}"
echo ""

# Build the Docker image
docker build -t "${IMAGE_NAME}:${TAG}" .

echo ""
echo -e "${GREEN}✅ Docker image built successfully${NC}"
echo ""

# Login to Hugging Face registry
echo -e "${GREEN}🔐 Logging in to Hugging Face registry...${NC}"
echo "${HF_TOKEN}" | docker login huggingface.co -u "${HF_USERNAME}" --password-stdin

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to login to Hugging Face registry${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Logged in successfully${NC}"
echo ""

# Push the image
echo -e "${GREEN}📤 Pushing Docker image to Hugging Face...${NC}"
docker push "${IMAGE_NAME}:${TAG}"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to push Docker image${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Successfully pushed ${IMAGE_NAME}:${TAG}${NC}"
echo ""
echo -e "${GREEN}📋 Next steps:${NC}"
echo "   1. Go to your Hugging Face Space: https://huggingface.co/spaces/${HF_USERNAME}/genoffice"
echo "   2. Configure the Space to use Docker SDK"
echo "   3. Select the image: ${IMAGE_NAME}:${TAG}"
echo "   4. Restart or rebuild the Space"
echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
