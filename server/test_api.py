#!/usr/bin/env python3
"""
Test script for GitShame Roaster API
"""

import requests
import json

def test_api():
    base_url = "http://localhost:8000"
    
    print("🔥 Testing GitShame Roaster API...")
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
        else:
            print("❌ Health check failed")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure the server is running on port 8000")
        return
    
    # Test roast generation with sample data
    sample_data = {
        "user": {
            "login": "testuser",
            "name": "Test User",
            "bio": "I love coding at 3 AM",
            "public_repos": 42,
            "followers": 10,
            "following": 100,
            "created_at": "2020-01-01T00:00:00Z",
            "avatar_url": "https://github.com/testuser.png"
        },
        "repos": [
            {
                "name": "my-awesome-project",
                "description": "Yet another TODO app",
                "language": "JavaScript",
                "stargazers_count": 0,
                "forks_count": 0,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-02T00:00:00Z"
            },
            {
                "name": "hello-world",
                "description": None,
                "language": "Python",
                "stargazers_count": 1,
                "forks_count": 0,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        ],
        "commits": [
            {
                "message": "fix stuff",
                "date": "2024-01-01T03:00:00Z"
            },
            {
                "message": "why doesn't this work???",
                "date": "2024-01-01T03:30:00Z"
            },
            {
                "message": "finally!!! 🎉",
                "date": "2024-01-01T04:00:00Z"
            }
        ],
        "analysis": {
            "commitPatterns": {
                "timeOfDay": {"morning": 0, "afternoon": 0, "evening": 0, "night": 3},
                "dayOfWeek": {"Monday": 3, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0, "Saturday": 0, "Sunday": 0},
                "commitFrequency": {"daily": 3, "weekly": 3, "monthly": 3}
            },
            "emojiUsage": {
                "count": 1,
                "topEmojis": [{"emoji": "🎉", "count": 1}]
            },
            "commitLanguage": {
                "averageLength": 15,
                "shortMessages": 1,
                "longMessages": 0,
                "questionableMessages": ["fix stuff", "why doesn't this work???"]
            },
            "repoAnalysis": {
                "namingPatterns": ["kebab-case", "hasApp"],
                "languages": {"JavaScript": 1, "Python": 1},
                "abandonedRepos": 0,
                "oneCommitWonders": 1
            },
            "userStats": {
                "accountAge": 1500,
                "publicContributions": 3,
                "followRatio": 0.1,
                "repoToStarRatio": 0.5
            }
        }
    }
    
    try:
        response = requests.post(f"{base_url}/generate-roasts", json=sample_data)
        if response.status_code == 200:
            data = response.json()
            print("✅ Roast generation successful!")
            print(f"📝 Generated {len(data['roasts'])} roasts from {data['source']} source")
            print("\n🔥 Sample Roasts:")
            for i, roast in enumerate(data['roasts'][:3], 1):
                print(f"{i}. {roast}")
            if 'overall_tone' in data:
                print(f"\n🎭 Overall Tone: {data['overall_tone']}")
        else:
            print(f"❌ Roast generation failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Error testing roast generation: {e}")
    
    # Test roastability analysis
    try:
        response = requests.post(f"{base_url}/analyze-roast-potential", json=sample_data)
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ Roastability analysis successful!")
            print(f"📊 Roast Score: {data['roast_score']}")
            print(f"🎯 Level: {data['roastability_level']}")
            print(f"💬 {data['message']}")
        else:
            print(f"❌ Roastability analysis failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing roastability analysis: {e}")

if __name__ == "__main__":
    test_api()
