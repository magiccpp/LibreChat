#!/bin/sh
set -e

# Update CA certificates
echo "Updating CA certificates..."
update-ca-certificates 
exec "$@"
