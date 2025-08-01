#!/bin/bash

# GitShame Roaster API Startup Script

echo "🔥 Starting GitShame Roaster API..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source .venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please copy .env.example to .env and add your Gemini API key:"
    echo "cp .env.example .env"
    echo "Then edit .env and add your GEMINI_API_KEY"
    echo ""
    echo "Get your Gemini API key from: https://aistudio.google.com/app/apikey"
    echo ""
fi

# Start the server
echo "🚀 Starting FastAPI server..."
echo "Server will be available at: http://localhost:8000"
echo "API docs will be available at: http://localhost:8000/docs"
echo ""

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
