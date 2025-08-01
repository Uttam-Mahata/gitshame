# GitShame Roaster API 🔥

A FastAPI backend that generates AI-powered roasts for GitHub users using Google's Gemini AI with structured output.

## Features

- **AI-Powered Roasts**: Uses Google Gemini 2.0 Flash for dynamic, personalized roasts
- **Structured Output**: Leverages Gemini's structured output capabilities for consistent JSON responses
- **Fallback System**: Static roasts when AI is unavailable
- **Roastability Analysis**: Analyzes how "roastable" a user is based on their GitHub activity
- **CORS Enabled**: Ready for frontend integration
- **Type Safety**: Fully typed with Pydantic models

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey) and add it to `.env`:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Start the Server

**Option A: Using the startup script (recommended)**
```bash
./start.sh
```

**Option B: Manual start**
```bash
# Activate virtual environment
source venv/bin/activate

# Start server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### `POST /generate-roasts`

Generates AI-powered roasts based on GitHub user analysis.

**Request Body:**
```json
{
  "user": {
    "login": "username",
    "name": "User Name",
    "bio": "User bio",
    "public_repos": 42,
    "followers": 123,
    "following": 45,
    "created_at": "2020-01-01T00:00:00Z",
    "avatar_url": "https://..."
  },
  "repos": [...],
  "commits": [...],
  "analysis": {
    "commitPatterns": {...},
    "emojiUsage": {...},
    "commitLanguage": {...},
    "repoAnalysis": {...},
    "userStats": {...}
  }
}
```

**Response:**
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

### `POST /analyze-roast-potential`

Analyzes how "roastable" a user is based on their GitHub activity.

**Response:**
```json
{
  "roast_score": 75,
  "roastability_level": "highly_roastable",
  "message": "This developer is a goldmine for roasts! 🔥",
  "roast_factors": ["questionable_commits", "night_owl_coding", "repo_abandonment"],
  "suggestions": [
    "Try committing at 3 AM for bonus roast points!",
    "Add more emojis to your commit messages!"
  ]
}
```

### `GET /health`

Health check endpoint.

## Structured Output

The API uses Google Gemini's structured output feature to ensure consistent, well-formatted responses. The roasts are generated with:

- **Categories**: `coding_habits`, `repo_patterns`, `commit_messages`, `social_metrics`, `general`
- **Severity Levels**: `mild`, `medium`, `savage`
- **Overall Tone**: `rookie`, `veteran`, `chaos_engineer`, `perfectionist`, `mysterious`

## Roast Categories

1. **Coding Habits**: Commit patterns, timing, frequency
2. **Repository Patterns**: Naming, organization, abandonment
3. **Commit Messages**: Quality, length, questionable content
4. **Social Metrics**: Followers, stars, social behavior
5. **General**: Overall developer personality and style

## Error Handling

The API includes comprehensive error handling:
- Falls back to static roasts when AI is unavailable
- CORS configuration for frontend integration
- Detailed error messages and logging
- Rate limiting awareness

## Development

The server runs with auto-reload enabled during development. Any changes to the code will automatically restart the server.

## Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key (required)
- `PORT`: Server port (default: 8000)
- `HOST`: Server host (default: 0.0.0.0)
- `DEBUG`: Debug mode (default: True)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:5173)

## License

This project is part of the GitShame roaster application.
