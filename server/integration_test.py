#!/usr/bin/env python3
"""
Complete integration test for GitShame Roaster
Tests the frontend-backend integration flow
"""

import requests
import json
import time
from datetime import datetime

def test_integration():
    base_url = "http://localhost:8000"
    
    print("🔥 GitShame Integration Test")
    print("=" * 50)
    
    # Test 1: Health Check
    print("\n1. Testing Health Check...")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is healthy")
            health_data = response.json()
            print(f"   Status: {health_data['status']}")
            print(f"   Service: {health_data['service']}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Is it running on port 8000?")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # Test 2: Generate Roasts (simulating frontend request)
    print("\n2. Testing Roast Generation...")
    sample_payload = {
        "user": {
            "login": "testuser",
            "name": "Test Developer",
            "bio": "I code at 3 AM and drink too much coffee",
            "public_repos": 15,
            "followers": 42,
            "following": 200,
            "created_at": "2020-01-15T00:00:00Z",
            "avatar_url": "https://github.com/testuser.png"
        },
        "repos": [
            {
                "name": "my-awesome-project",
                "description": "Yet another TODO app that will change the world",
                "language": "JavaScript",
                "stargazers_count": 0,
                "forks_count": 0,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-02T00:00:00Z"
            },
            {
                "name": "hello-world-v2",
                "description": None,
                "language": "Python",
                "stargazers_count": 1,
                "forks_count": 0,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            },
            {
                "name": "definitely-not-copied",
                "description": "Original work do not steal",
                "language": "TypeScript",
                "stargazers_count": 0,
                "forks_count": 0,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2023-06-01T00:00:00Z"  # Abandoned repo
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
                "message": "finally!!! 🎉🎉🎉",
                "date": "2024-01-01T04:00:00Z"
            },
            {
                "message": "oops forgot to commit",
                "date": "2024-01-02T02:00:00Z"
            },
            {
                "message": "WTF is this code",
                "date": "2024-01-02T02:30:00Z"
            }
        ],
        "analysis": {
            "commitPatterns": {
                "timeOfDay": {"morning": 0, "afternoon": 1, "evening": 0, "night": 4},
                "dayOfWeek": {"Monday": 3, "Tuesday": 2, "Wednesday": 0, "Thursday": 0, "Friday": 0, "Saturday": 0, "Sunday": 0},
                "commitFrequency": {"daily": 5, "weekly": 5, "monthly": 5}
            },
            "emojiUsage": {
                "count": 3,
                "topEmojis": [{"emoji": "🎉", "count": 3}]
            },
            "commitLanguage": {
                "averageLength": 18,
                "shortMessages": 1,
                "longMessages": 0,
                "questionableMessages": ["fix stuff", "why doesn't this work???", "oops forgot to commit", "WTF is this code"]
            },
            "repoAnalysis": {
                "namingPatterns": ["kebab-case", "hasApp"],
                "languages": {"JavaScript": 1, "Python": 1, "TypeScript": 1},
                "abandonedRepos": 1,
                "oneCommitWonders": 0
            },
            "userStats": {
                "accountAge": 1500,
                "publicContributions": 5,
                "followRatio": 0.21,
                "repoToStarRatio": 0.33
            }
        }
    }
    
    try:
        print("   Sending request to /generate-roasts...")
        start_time = time.time()
        
        response = requests.post(
            f"{base_url}/generate-roasts", 
            json=sample_payload,
            timeout=30  # AI generation might take a while
        )
        
        end_time = time.time()
        print(f"   Response time: {end_time - start_time:.2f} seconds")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Roast generation successful!")
            print(f"   Source: {data.get('source', 'unknown')}")
            print(f"   Number of roasts: {len(data.get('roasts', []))}")
            
            if 'overall_tone' in data:
                print(f"   Overall tone: {data['overall_tone']}")
            
            print("\n   🔥 Sample Roasts:")
            for i, roast in enumerate(data.get('roasts', [])[:3], 1):
                print(f"   {i}. {roast}")
            
            if 'metadata' in data:
                metadata = data['metadata']
                if 'roast_categories' in metadata:
                    print(f"   Categories: {', '.join(metadata['roast_categories'][:3])}")
                if 'severity_levels' in metadata:
                    print(f"   Severity: {', '.join(set(metadata['severity_levels']))}")
                    
        else:
            print(f"❌ Roast generation failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out (AI generation took too long)")
        return False
    except Exception as e:
        print(f"❌ Error during roast generation: {e}")
        return False
    
    # Test 3: Roastability Analysis
    print("\n3. Testing Roastability Analysis...")
    try:
        response = requests.post(f"{base_url}/analyze-roast-potential", json=sample_payload, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✅ Roastability analysis successful!")
            print(f"   Roast Score: {data.get('roast_score', 0)}/100")
            print(f"   Level: {data.get('roastability_level', 'unknown')}")
            print(f"   Message: {data.get('message', 'No message')}")
            
            factors = data.get('roast_factors', [])
            if factors:
                print(f"   Key factors: {', '.join(factors)}")
        else:
            print(f"❌ Roastability analysis failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error during roastability analysis: {e}")
        return False
    
    # Test 4: CORS Headers
    print("\n4. Testing CORS Configuration...")
    try:
        response = requests.options(f"{base_url}/generate-roasts", headers={
            'Origin': 'http://localhost:5173',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        })
        
        if response.status_code == 200:
            cors_headers = response.headers
            if 'Access-Control-Allow-Origin' in cors_headers:
                print("✅ CORS configured correctly")
                print(f"   Allowed origins: {cors_headers.get('Access-Control-Allow-Origin')}")
            else:
                print("⚠️  CORS headers present but may need adjustment")
        else:
            print(f"❌ CORS preflight failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing CORS: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 All integration tests passed!")
    print("\nBackend is ready to serve roasts to the frontend!")
    print("\nNext steps:")
    print("1. Start the frontend: cd client && npm run dev")
    print("2. Visit: http://localhost:5173")
    print("3. Enter a GitHub username and get roasted! 🔥")
    
    return True

if __name__ == "__main__":
    success = test_integration()
    exit(0 if success else 1)
