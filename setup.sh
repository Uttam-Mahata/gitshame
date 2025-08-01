#!/bin/bash

# GitShame Full Stack Setup Script

echo "🔥 Setting up GitShame - The GitHub Roaster!"
echo "==========================================="

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "client" ] && [ ! -d "server" ]; then
    print_error "Please run this script from the gitshame project root directory"
    exit 1
fi

print_status "Setting up GitShame project..."

# Backend Setup
print_status "Setting up backend..."
cd server

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
    if [ $? -eq 0 ]; then
        print_success "Virtual environment created successfully!"
    else
        print_error "Failed to create virtual environment"
        exit 1
    fi
fi

# Activate virtual environment and install dependencies
print_status "Activating virtual environment and installing dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed successfully!"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found! Creating from template..."
    cp .env.example .env
    print_warning "⚠️  IMPORTANT: Edit server/.env and add your Gemini API key!"
    print_warning "Get your API key from: https://aistudio.google.com/app/apikey"
    print_warning "Then add it to server/.env as: GEMINI_API_KEY=your_actual_api_key"
fi

# Frontend Setup
cd ../client
print_status "Setting up frontend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        print_success "Frontend dependencies installed successfully!"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
else
    print_success "Frontend dependencies already installed!"
fi

# Back to root
cd ..

print_success "🎉 Setup completed successfully!"
echo ""
echo "🚀 To start the application:"
echo "================================"
echo ""
echo "1. Terminal 1 - Start Backend Server:"
echo "   cd server"
echo "   source venv/bin/activate"
echo "   python main.py"
echo "   (Server will run on http://localhost:8000)"
echo ""
echo "2. Terminal 2 - Start Frontend:"
echo "   cd client"
echo "   npm run dev"
echo "   (Frontend will run on http://localhost:5173)"
echo ""
echo "3. Open your browser and navigate to http://localhost:5173"
echo ""
echo "📝 Don't forget to:"
echo "- Add your Gemini API key to server/.env"
echo "- Check the API docs at http://localhost:8000/docs"
echo ""
echo "🔥 Ready to roast some GitHub profiles!"
