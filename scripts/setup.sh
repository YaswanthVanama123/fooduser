#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Change to project directory
cd "$PROJECT_DIR" || exit 1

print_header "User App Setup Script"

# Step 1: Check if Node.js is installed
print_status "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js $NODE_VERSION found"

# Step 2: Check if npm is installed
print_status "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi
NPM_VERSION=$(npm -v)
print_success "npm $NPM_VERSION found"

# Step 3: Install dependencies
print_header "Installing Dependencies"
print_status "Running npm install..."
if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 4: Setup environment file
print_header "Setting Up Environment"
if [ -f ".env" ]; then
    print_warning ".env file already exists, skipping..."
else
    if [ -f ".env.example" ]; then
        print_status "Copying .env.example to .env..."
        cp .env.example .env
        print_success ".env file created"
        print_warning "Please update .env file with your configuration"
    else
        print_error ".env.example not found"
        exit 1
    fi
fi

# Step 5: Run build check
print_header "Running Build Check"
print_status "Building project..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Success message
print_header "Setup Complete!"
echo ""
echo -e "${GREEN}User App has been set up successfully!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Update the ${YELLOW}.env${NC} file with your configuration"
echo -e "  2. Make sure the backend server is running"
echo -e "  3. Start the development server: ${YELLOW}npm run dev${NC}"
echo ""
echo -e "${BLUE}Available commands:${NC}"
echo -e "  ${YELLOW}npm run dev${NC}      - Start development server"
echo -e "  ${YELLOW}npm run build${NC}    - Build for production"
echo -e "  ${YELLOW}npm run preview${NC}  - Preview production build"
echo ""
echo -e "${GREEN}Happy coding!${NC}"
echo ""
