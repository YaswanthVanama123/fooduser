#\!/usr/bin/env bash

# User App Setup Script
# This script sets up the user/customer application
# Compatible with Windows Git Bash, Linux, and macOS

set -e

# Detect OS
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    IS_WINDOWS=true
else
    IS_WINDOWS=false
fi

# Colors for output (compatible with Git Bash)
if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    NC='\033[0m'
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    NC=''
fi

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}User App Setup${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Check if Node.js is installed
if \! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js is installed: $(node --version)"

# Check if npm is installed
if \! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} npm is installed: $(npm --version)"
echo ""

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
if $IS_WINDOWS; then
    npm install --no-optional 2>&1 | tee npm-install.log
else
    npm install
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Dependencies installed successfully"
    [ -f npm-install.log ] && rm -f npm-install.log
else
    echo -e "${RED}✗${NC} Failed to install dependencies"
    [ -f npm-install.log ] && echo "See npm-install.log for details"
    exit 1
fi

echo ""

# Copy .env.example to .env if it doesn't exist
if [ \! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    if $IS_WINDOWS; then
        cp .env.example .env 2>/dev/null || cat .env.example > .env
    else
        cp .env.example .env
    fi
    echo -e "${GREEN}✓${NC} .env file created from .env.example"
    echo -e "${YELLOW}Note: Please update .env with your configuration${NC}"
else
    echo -e "${YELLOW}ℹ${NC} .env file already exists, skipping..."
fi

echo ""

# Run build check
echo -e "${YELLOW}Running build check...${NC}"
npm run build 2>&1 | tail -20

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Build successful"
else
    echo -e "${RED}✗${NC} Build failed"
    echo -e "${YELLOW}Tip: Check for TypeScript errors above${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Setup Complete\!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "You can now run the development server with:"
echo -e "${YELLOW}npm run dev${NC}"
echo ""
echo -e "The user app will be available at:"
echo -e "${BLUE}http://localhost:5173${NC}"
echo ""
echo -e "${GREEN}Happy coding\!${NC}"
echo ""
