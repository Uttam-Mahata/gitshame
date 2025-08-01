from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import os
from google import genai
import json
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="GitShame Roaster API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite and React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Pydantic models for structured output
class RoastLine(BaseModel):
    text: str = Field(description="A witty, clever roast based on the user's GitHub activity")
    category: str = Field(description="Category of roast: coding_habits, repo_patterns, commit_messages, social_metrics, or general")
    severity: str = Field(description="How harsh the roast is: mild, medium, savage")

class GeneratedRoasts(BaseModel):
    roasts: List[RoastLine] = Field(description="List of personalized roasts for the GitHub user")
    overall_tone: str = Field(description="Overall assessment: rookie, veteran, chaos_engineer, perfectionist, or mysterious")

# Request models
class GitHubUserData(BaseModel):
    login: str
    name: Optional[str]
    bio: Optional[str]
    public_repos: int
    followers: int
    following: int
    created_at: str
    avatar_url: str

class GitHubRepo(BaseModel):
    name: str
    description: Optional[str]
    language: Optional[str]
    stargazers_count: int
    forks_count: int
    created_at: str
    updated_at: str

class GitHubCommit(BaseModel):
    message: str
    date: str

class UserAnalysis(BaseModel):
    commitPatterns: Dict[str, Any]
    emojiUsage: Dict[str, Any]
    commitLanguage: Dict[str, Any]
    repoAnalysis: Dict[str, Any]
    userStats: Dict[str, Any]

class RoastRequest(BaseModel):
    user: GitHubUserData
    repos: List[GitHubRepo]
    commits: List[GitHubCommit]
    analysis: UserAnalysis

@app.get("/")
async def root():
    return {"message": "GitShame Roaster API - Ready to serve some digital humble pie! 🔥"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "GitShame Roaster API"}

def create_roast_prompt(user_data: RoastRequest) -> str:
    """Create a comprehensive prompt for the AI roaster"""
    
    user = user_data.user
    repos = user_data.repos
    commits = user_data.commits
    analysis = user_data.analysis
    
    # Extract key insights
    account_age = analysis.userStats.get('accountAge', 0)
    repo_count = len(repos)
    commit_count = len(commits)
    
    # Most used languages
    languages = list(analysis.repoAnalysis.get('languages', {}).keys())[:3]
    
    # Commit patterns
    commit_times = analysis.commitPatterns.get('timeOfDay', {})
    most_active_time = max(commit_times, key=commit_times.get) if commit_times else 'unknown'
    
    # Questionable commits
    questionable_commits = analysis.commitLanguage.get('questionableMessages', [])[:5]
    
    # Emoji usage
    emoji_count = analysis.emojiUsage.get('count', 0)
    top_emojis = analysis.emojiUsage.get('topEmojis', [])
    
    # Repo patterns
    abandoned_repos = analysis.repoAnalysis.get('abandonedRepos', 0)
    one_commit_wonders = analysis.repoAnalysis.get('oneCommitWonders', 0)
    naming_patterns = analysis.repoAnalysis.get('namingPatterns', [])
    
    # Social metrics
    follow_ratio = analysis.userStats.get('followRatio', 0)
    repo_to_star_ratio = analysis.userStats.get('repoToStarRatio', 0)
    
    prompt = f"""
You are a witty, sarcastic GitHub code reviewer who specializes in roasting developers based on their GitHub activity. 
Create 5-8 clever, humorous roasts for this GitHub user. Be playful and teasing, but never mean-spirited or personally attacking.

USER PROFILE:
- Username: {user.login}
- Name: {user.name or 'No name provided'}
- Bio: {user.bio or 'No bio'}
- Account Age: {account_age} days
- Public Repos: {user.public_repos}
- Followers: {user.followers}
- Following: {user.following}

CODING PATTERNS:
- Primary Languages: {', '.join(languages) if languages else 'None detected'}
- Most Active Time: {most_active_time}
- Total Commits Analyzed: {commit_count}
- Emoji Usage: {emoji_count} emojis found
- Top Emojis: {', '.join([e.get('emoji', '') for e in top_emojis[:3]])}

REPOSITORY INSIGHTS:
- Total Repos: {repo_count}
- Abandoned Repos: {abandoned_repos}
- One-Commit Wonders: {one_commit_wonders}
- Naming Patterns: {', '.join(naming_patterns[:3])}
- Average Stars per Repo: {repo_to_star_ratio:.1f}

SOCIAL METRICS:
- Follow Ratio: {follow_ratio:.1f} (followers/following)

QUESTIONABLE COMMIT MESSAGES:
{chr(10).join([f"- {msg}" for msg in questionable_commits[:3]])}

RECENT REPOS:
{chr(10).join([f"- {repo.name}: {repo.description or 'No description'} ({repo.language or 'Unknown language'})" for repo in repos[:3]])}

Create roasts that reference specific patterns you see. Focus on:
1. Coding habits and commit patterns
2. Repository naming and organization
3. Commit message quality
4. Social coding behavior
5. Language choices and project patterns

Make each roast:
- Specific to their actual GitHub activity
- Clever and witty, not mean
- Tech-savvy and programmer-humor focused
- About 1-2 sentences each

Categories for roasts:
- coding_habits: About their coding patterns, commit times, etc.
- repo_patterns: About their repositories, naming, organization
- commit_messages: About their commit message quality
- social_metrics: About followers, stars, social coding behavior
- general: Overall developer personality/style

Severity levels:
- mild: Gentle teasing
- medium: More pointed but still playful
- savage: Brutally honest but still humorous
"""
    
    return prompt

@app.post("/generate-roasts")
async def generate_roasts(request: RoastRequest):
    """Generate AI-powered roasts based on GitHub analysis"""
    
    try:
        # Check if API key is available
        if not os.getenv("GEMINI_API_KEY"):
            raise HTTPException(
                status_code=500, 
                detail="Gemini API key not configured. Please set GEMINI_API_KEY environment variable."
            )
        
        # Create the prompt
        prompt = create_roast_prompt(request)
        
        # Generate roasts with structured output
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": GeneratedRoasts,
                "temperature": 0.8,  # Add some creativity
                "max_output_tokens": 2048,
            },
        )
        
        # Parse the structured response
        roast_data: GeneratedRoasts = response.parsed
        
        if not roast_data or not roast_data.roasts:
            # Fallback to static roasts if AI fails
            fallback_roasts = generate_fallback_roasts(request)
            return {"roasts": fallback_roasts, "source": "fallback", "overall_tone": "mysterious"}
        
        # Convert to simple string array for frontend compatibility
        roast_strings = [roast.text for roast in roast_data.roasts]
        
        return {
            "roasts": roast_strings,
            "source": "ai",
            "overall_tone": roast_data.overall_tone,
            "metadata": {
                "roast_categories": [roast.category for roast in roast_data.roasts],
                "severity_levels": [roast.severity for roast in roast_data.roasts]
            }
        }
        
    except Exception as e:
        print(f"Error generating AI roasts: {e}")
        # Fallback to static roasts
        fallback_roasts = generate_fallback_roasts(request)
        return {"roasts": fallback_roasts, "source": "fallback", "overall_tone": "mysterious"}

def generate_fallback_roasts(request: RoastRequest) -> List[str]:
    """Generate fallback roasts when AI is unavailable"""
    
    user = request.user
    analysis = request.analysis
    
    roasts = []
    
    # Account age roasts
    account_age = analysis.userStats.get('accountAge', 0)
    if account_age < 365:
        roasts.append(f"Welcome to GitHub, {user.login}! Still figuring out what a commit is, I see. 🐣")
    elif account_age > 3650:
        roasts.append(f"Been here {account_age // 365} years and still haven't learned to write decent commit messages? Classic! 👴")
    
    # Commit pattern roasts
    commit_times = analysis.commitPatterns.get('timeOfDay', {})
    if commit_times.get('night', 0) > sum(commit_times.values()) * 0.4:
        roasts.append("I see you're a fellow member of the '3 AM commit club'. Sleep is overrated anyway! 🦉")
    
    # Emoji roasts
    emoji_count = analysis.emojiUsage.get('count', 0)
    if emoji_count > 10:
        roasts.append("Your commits have more emojis than a teenager's text messages. Very professional! 🎭")
    elif emoji_count == 0:
        roasts.append("Zero emojis in your commits? What are you, a robot? Even robots use emojis now! 🤖")
    
    # Repository roasts
    abandoned_repos = analysis.repoAnalysis.get('abandonedRepos', 0)
    if abandoned_repos > 0:
        roasts.append(f"You have {abandoned_repos} abandoned repos. GitHub isn't a graveyard for your coding dreams! ⚰️")
    
    # Follow ratio roasts
    follow_ratio = analysis.userStats.get('followRatio', 0)
    if follow_ratio < 0.5:
        roasts.append("Following more people than follow you back? That's the developer equivalent of unrequited love! 💔")
    
    # Add a few more generic ones if we don't have enough
    if len(roasts) < 3:
        roasts.extend([
            "Your code commits tell a story... mostly about debugging at 2 AM! 📚",
            "I've seen more organization in a tornado than in your repository structure! 🌪️",
            "Your commit messages are like modern art - nobody understands them, but everyone pretends they do! 🎨"
        ])
    
    return roasts[:6]  # Return max 6 roasts

@app.post("/analyze-roast-potential")
async def analyze_roast_potential(request: RoastRequest):
    """Analyze how 'roastable' a user is based on their GitHub activity"""
    
    analysis = request.analysis
    user = request.user
    
    roast_score = 0
    roast_factors = []
    
    # Calculate roastability score
    if analysis.commitLanguage.get('questionableMessages', []):
        roast_score += 20
        roast_factors.append("questionable_commits")
    
    if analysis.emojiUsage.get('count', 0) > 15:
        roast_score += 15
        roast_factors.append("emoji_overuse")
    elif analysis.emojiUsage.get('count', 0) == 0:
        roast_score += 10
        roast_factors.append("emoji_drought")
    
    if analysis.repoAnalysis.get('abandonedRepos', 0) > 2:
        roast_score += 25
        roast_factors.append("repo_abandonment")
    
    if analysis.userStats.get('followRatio', 1) < 0.3:
        roast_score += 15
        roast_factors.append("social_awkwardness")
    
    commit_times = analysis.commitPatterns.get('timeOfDay', {})
    if commit_times.get('night', 0) > sum(commit_times.values()) * 0.5:
        roast_score += 20
        roast_factors.append("night_owl_coding")
    
    if analysis.commitLanguage.get('averageLength', 0) < 10:
        roast_score += 10
        roast_factors.append("lazy_commit_messages")
    
    # Determine roastability level
    if roast_score >= 60:
        level = "highly_roastable"
        message = "This developer is a goldmine for roasts! 🔥"
    elif roast_score >= 30:
        level = "moderately_roastable"
        message = "Some good roast material here. 😏"
    else:
        level = "minimally_roastable"
        message = "This developer is suspiciously well-behaved... 🤔"
    
    return {
        "roast_score": roast_score,
        "roastability_level": level,
        "message": message,
        "roast_factors": roast_factors,
        "suggestions": [
            "Try committing at 3 AM for bonus roast points!",
            "Add more emojis to your commit messages!",
            "Create a repo called 'my-awesome-project' and abandon it!",
            "Write commit messages like 'fix stuff' and 'idk anymore'!"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
