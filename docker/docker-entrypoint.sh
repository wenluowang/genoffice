#!/bin/sh
# Docker entrypoint script for GenOffice

set -e

# Wait for any background processes to be ready
echo "Starting GenOffice..."

# Execute the main command
exec "$@"
