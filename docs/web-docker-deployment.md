# Web Version & Docker Deployment for GenOffice

## Overview

This document describes the web version and Docker deployment setup for GenOffice, enabling the suite to run as a web application accessible through a browser.

## Architecture

The web version adapts the Electron-based desktop applications to run in a browser environment by:

- Replacing Electron-specific APIs with web-compatible alternatives
- Using a Node.js backend for file system operations
- Serving the renderer processes through a web server

## Quick Start

### Docker Deployment

```bash
# Build the Docker image
docker build -t genoffice:latest .

# Run the container
docker run -d -p 3000:3000 --name genoffice genoffice:latest
```

Access the application at `http://localhost:3000`

### Docker Compose

```bash
docker-compose up -d
```

### Local Development

```bash
# Install dependencies
npm install

# Build all applications
npm run build:all

# Start the web server
node docker/server.js

## Configuration

### Environment Variables

| Variable            | Description            | Default                    |
| ------------------- | ---------------------- | -------------------------- |
| `PORT`              | Server port            | `3000`                     |
| `HOST`              | Server host            | `0.0.0.0`                  |
| `GENSPARK_API_URL`  | Genspark API endpoint  | (required for AI features) |
| `ALLOW_FILE_UPLOAD` | Enable file upload     | `true`                     |
| `MAX_FILE_SIZE`     | Maximum file size (MB) | `50`                       |

### Docker Environment

Create a `.env` file in the root directory:

```env
PORT=3000
HOST=0.0.0.0
# GENSPARK_API_URL=https://api.genspark.ai
```

## Features

### Supported Applications (Web)

- **GenOffice Docs** - Word processor with `.docx` support
- **GenOffice Sheets** - Spreadsheet editor with `.xlsx` support
- **GenOffice Slides** - Presentation editor with `.pptx` support
- **GenOffice PDF** - PDF viewer and editor
- **GenOffice Markdown** - Markdown editor

### Limitations vs Desktop Version

1. **File System Access**: Web version uses browser file picker and download instead of direct file system access
2. **Native Features**: Some Electron-specific features (system tray, native menus) are not available
3. **Offline Mode**: Requires service worker configuration for full offline support
4. **Performance**: Large documents may have different performance characteristics

## File Upload/Download

The web version supports:

- Drag and drop file upload
- File picker dialog
- Automatic download of edited files
- Cloud storage integration (configurable)

## Security Considerations

1. **Authentication**: Configure authentication middleware for production deployments
2. **File Validation**: All uploaded files are validated before processing
3. **Sandboxing**: Browser provides natural sandboxing for untrusted content
4. **HTTPS**: Always use HTTPS in production environments

## Production Deployment

### Docker Production Build

```bash
docker build --target production -t genoffice:production .
```

### Kubernetes

Example deployment manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: genoffice
spec:
  replicas: 3
  selector:
    matchLabels:
      app: genoffice
  template:
    metadata:
      labels:
        app: genoffice
    spec:
      containers:
        - name: genoffice
          image: genoffice:production
          ports:
            - containerPort: 3000
          env:
            - name: PORT
              value: '3000'
          resources:
            limits:
              memory: '1Gi'
              cpu: '1000m'
---
apiVersion: v1
kind: Service
metadata:
  name: genoffice-service
spec:
  selector:
    app: genoffice
  ports:
    - port: 80
      targetPort: 3000
  type: LoadBalancer
```

## Troubleshooting

### Common Issues

1. **Container fails to start**: Check logs with `docker logs genoffice`
2. **Port already in use**: Change PORT environment variable
3. **Memory issues**: Increase container memory limits
4. **File upload fails**: Verify MAX_FILE_SIZE setting

### Logs

```bash
# View Docker logs
docker logs -f genoffice

# Access logs inside container
docker exec genoffice tail -f /app/logs/server.log
```

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/genspark-ai/genoffice).
