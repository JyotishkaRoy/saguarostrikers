#!/bin/bash

# Saguaro Strikers Deployment Script

set -e

echo "🚀 Starting deployment process..."

# Colors for output
GREEN='\033[0.32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd backend
npm ci
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# 2. Build backend
echo -e "${BLUE}🔨 Building backend...${NC}"
npm run build
echo -e "${GREEN}✅ Backend built successfully${NC}"

# 3. Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd ../frontend
npm ci
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

# 4. Build frontend
echo -e "${BLUE}🔨 Building frontend...${NC}"
npm run build
echo -e "${GREEN}✅ Frontend built successfully${NC}"

# 5. Success message
echo -e "${GREEN}"
echo "╔════════════════════════════════════════╗"
echo "║   ✅ Deployment Successful!           ║"
echo "║                                        ║"
echo "║   Backend:  backend/dist/             ║"
echo "║   Frontend: frontend/dist/            ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

echo "📝 Next steps:"
echo "1. Copy backend/dist/ to your server"
echo "2. Copy frontend/dist/ to your web host"
echo "3. Set environment variables"
echo "4. Start the backend: npm start"
