# GitShame - GitHub Roaster 🔥

A full-stack application that analyzes GitHub profiles and generates AI-powered roasts using Google's Gemini API with structured output.

## Architecture

```
Frontend (React + TypeScript)
    ↓ (GitHub API)
GitHub Data Fetching
    ↓ (Analysis)
Local Data Analysis
    ↓ (HTTP POST)
Backend (FastAPI + Python)
    ↓ (Gemini API)
AI Roast Generation
    ↓ (JSON Response)
Dynamic Roasts + Metadata
```

## Features

- 🤖 **AI-Powered Roasts**: Uses Google Gemini 2.0 Flash with structured output
- 📊 **GitHub Analysis**: Analyzes commit patterns, repo organization, and coding habits
- 🔄 **Fallback System**: Static roasts when AI is unavailable
- 🎨 **Modern UI**: React with TypeScript and custom CSS
- ⚡ **Fast API**: FastAPI backend with CORS support
- 🛡️ **Error Handling**: Comprehensive error handling and user feedback

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd gitshame
```

### 2. Backend Setup

```bash
cd server

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

**Get your Gemini API key**: https://aistudio.google.com/app/apikey

### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Start Both Servers

**Terminal 1 (Backend):**
```bash
cd server
source venv/bin/activate
python main.py
# Server runs on http://localhost:8000
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

## API Integration

### Frontend → Backend Communication

The frontend calls the backend through a POST request to `/generate-roasts`:

```typescript
// In analyzer.ts
const response = await fetch('http://localhost:8000/generate-roasts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user: { /* GitHub user data */ },
    repos: [ /* Repository data */ ],
    commits: [ /* Commit data */ ],
    analysis: { /* Local analysis results */ }
  })
});
```

### Backend Response Format

```json
{
  "roasts": [
    "Your code commits tell a story... mostly about debugging at 2 AM! 📚",
    "I see you're a fellow member of the '3 AM commit club'. Sleep is overrated anyway! 🦉"
  ],
  "source": "ai",
  "overall_tone": "veteran",
  "metadata": {
    "roast_categories": ["coding_habits", "commit_messages"],
    "severity_levels": ["medium", "mild"]
  }
}
```

## Structured Output with Gemini

The backend uses Gemini's structured output feature:

```python
response = client.models.generate_content(
    model="gemini-2.0-flash-exp",
    contents=prompt,
    config={
        "response_mime_type": "application/json",
        "response_schema": GeneratedRoasts,  # Pydantic model
        "temperature": 0.8,
        "max_output_tokens": 2048,
    },
)
```

## Fallback System

If the AI backend fails, the frontend automatically falls back to static roasts:

1. **Primary**: AI-generated roasts from Gemini
2. **Secondary**: Backend fallback roasts
3. **Tertiary**: Frontend static roasts

## Development

### Testing the API

```bash
# Test the backend directly
cd server
python test_api.py

# Check API documentation
# Visit http://localhost:8000/docs
```

### Environment Variables

```env
# Backend (.env)
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8000
HOST=0.0.0.0
DEBUG=True
FRONTEND_URL=http://localhost:5173
```

## Project Structure

```
gitshame/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # GitHub & Backend APIs
│   │   ├── components/    # React components
│   │   └── styles/        # CSS styles
│   └── package.json
├── server/                 # FastAPI backend
│   ├── main.py           # FastAPI application
│   ├── requirements.txt  # Python dependencies
│   ├── .env.example      # Environment template
│   └── README.md         # Backend documentation
└── SETUP.md              # This file
```

## API Endpoints

### `POST /generate-roasts`
Generates AI-powered roasts based on GitHub analysis.

### `POST /analyze-roast-potential`
Analyzes how "roastable" a user is based on their GitHub activity.

### `GET /health`
Health check endpoint.

### `GET /`
API status and information.

## Roast Categories

- **coding_habits**: Commit patterns, timing, frequency
- **repo_patterns**: Naming, organization, abandonment
- **commit_messages**: Quality, length, questionable content
- **social_metrics**: Followers, stars, social behavior
- **general**: Overall developer personality

## Troubleshooting

### Backend Issues

1. **Gemini API Key**: Make sure you have a valid API key in `.env`
2. **Dependencies**: Ensure all Python packages are installed
3. **Port Conflicts**: Check if port 8000 is available

### Frontend Issues

1. **CORS Errors**: Backend must be running on port 8000
2. **Network Errors**: Check if backend is accessible
3. **Dependencies**: Run `npm install` to ensure all packages are installed

### Common Errors

**"Gemini API key not configured"**
- Add your API key to `.env` file

**"Network error"**
- Ensure backend is running on http://localhost:8000

**"User not found"**
- Check GitHub username spelling and availability

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
