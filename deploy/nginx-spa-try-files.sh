#!/bin/bash
# SPA: serve index.html for unknown paths (React Router).
set -eu
CONF="/etc/nginx/sites-enabled/default"
sudo sed -i 's|try_files $uri $uri/ =404;|try_files $uri $uri/ /index.html;|g' "$CONF"
sudo nginx -t
sudo systemctl reload nginx
echo "nginx: SPA try_files applied"
