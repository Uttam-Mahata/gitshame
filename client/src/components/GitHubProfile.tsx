import { useState, useEffect } from 'react';
import githubAPI, { GitHubError, type UserData } from '../api/github';
import { type UserAnalysis, analyzeUserData, generateRoastContent } from '../api/analyzer';
import '../styles/GitHubProfile.css';

interface GitHubProfileProps {
  username: string;
  onReset: () => void;
}

const GitHubProfile: React.FC<GitHubProfileProps> = ({ username, onReset }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [analysis, setAnalysis] = useState<UserAnalysis | null>(null);
  const [roasts, setRoasts] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState({
    stage: 'profile',
    percent: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      setUserData(null);
      setAnalysis(null);
      setRoasts([]);
      
      try {
        // Stage 1: Fetch user profile
        setLoadingProgress({ stage: 'profile', percent: 10 });
        await new Promise(r => setTimeout(r, 500)); // For visual effect
        
        const data = await githubAPI.getAllUserData(username);
        setUserData(data);
        
        // Stage 2: Analyze data
        setLoadingProgress({ stage: 'analyzing', percent: 60 });
        await new Promise(r => setTimeout(r, 800)); // For visual effect
        
        const userAnalysis = analyzeUserData(data.user, data.repos, data.commits);
        setAnalysis(userAnalysis);
        
        // Stage 3: Generate roasts
        setLoadingProgress({ stage: 'roasting', percent: 90 });
        await new Promise(r => setTimeout(r, 700)); // For visual effect
        
        const userRoasts = generateRoastContent(userAnalysis, data.user);
        setRoasts(userRoasts);
        
        setLoadingProgress({ stage: 'complete', percent: 100 });
      } catch (err) {
        console.error('Error fetching GitHub data:', err);
        
        if (err instanceof GitHubError) {
          switch (err.type) {
            case 'RATE_LIMIT_EXCEEDED':
              setError(`GitHub API rate limit exceeded. Please try again in ${Math.ceil((err.retryAfter || 60) / 60)} minutes.`);
              break;
            case 'USER_NOT_FOUND':
              setError(`User "${username}" not found on GitHub. Check the username and try again.`);
              break;
            case 'NETWORK_ERROR':
              setError('Network error. Please check your connection and try again.');
              break;
            default:
              setError(err.message || 'An unknown error occurred.');
          }
        } else {
          setError('Failed to fetch GitHub data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="github-profile loading">
        <div className="loading-container">
          <div className="loading-icon">
            <svg viewBox="0 0 16 16" width="64" height="64" fill="currentColor">
              <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
          </div>
          <div className="loading-bar">
            <div 
              className="loading-progress" 
              style={{ width: `${loadingProgress.percent}%` }}
            ></div>
          </div>
          <div className="loading-text">
            {loadingProgress.stage === 'profile' && 'Fetching GitHub profile...'}
            {loadingProgress.stage === 'analyzing' && 'Analyzing repository patterns...'}
            {loadingProgress.stage === 'roasting' && 'Preparing savage roasts...'}
            {loadingProgress.stage === 'complete' && 'Ready to serve humble pie!'}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="github-profile error">
        <div className="error-container">
          <div className="error-icon">
            <svg viewBox="0 0 16 16" width="64" height="64" fill="currentColor">
              <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zm-.25-6.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z"></path>
            </svg>
          </div>
          <h2>Error</h2>
          <p>{error}</p>
          <button className="primary-button" onClick={onReset}>
            Try Another Username
          </button>
        </div>
      </div>
    );
  }

  if (!userData || !analysis) {
    return null;
  }

  const { user, repos, commits, rateLimit } = userData;

  return (
    <div className="github-profile">
      <div className="profile-header">
        <div className="user-info">
          <img 
            src={user.avatar_url} 
            alt={`${username}'s avatar`} 
            className="avatar"
          />
          <div className="user-details">
            <h2>{user.name || username}</h2>
            <h3>@{username}</h3>
            {user.bio && <p className="bio">{user.bio}</p>}
            <div className="stats">
              <div className="stat">
                <span className="stat-count">{user.public_repos}</span>
                <span className="stat-label">Repos</span>
              </div>
              <div className="stat">
                <span className="stat-count">{user.followers}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat">
                <span className="stat-count">{user.following}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>
          </div>
        </div>
        <a 
          href={user.html_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="github-link"
        >
          View on GitHub
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path fillRule="evenodd" d="M10.604 1h4.146a.25.25 0 01.25.25v4.146a.25.25 0 01-.427.177L13.03 4.03 9.28 7.78a.75.75 0 01-1.06-1.06l3.75-3.75-1.543-1.543A.25.25 0 0110.604 1zM3.75 2A1.75 1.75 0 002 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 12.25v-3.5a.75.75 0 00-1.5 0v3.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-8.5a.25.25 0 01.25-.25h3.5a.75.75 0 000-1.5h-3.5z"></path>
          </svg>
        </a>
      </div>

      <div className="roast-container">
        <h2 className="roast-header">
          <span className="fire-emoji">🔥</span> The Roast <span className="fire-emoji">🔥</span>
        </h2>
        <div className="roasts">
          {roasts.map((roast: string, index: number) => (
            <div key={index} className="roast-card">
              <p>{roast}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="data-insights">
        <div className="section">
          <h3>Commit Habits</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <h4>Time of Day</h4>
              <div className="chart-placeholder">
                <div className="chart-bar" style={{ 
                  height: `${(analysis.commitPatterns.timeOfDay.morning / (commits.length || 1)) * 100}%`,
                  backgroundColor: '#4CAF50'
                }}>
                  <span>Morning</span>
                </div>
                <div className="chart-bar" style={{ 
                  height: `${(analysis.commitPatterns.timeOfDay.afternoon / (commits.length || 1)) * 100}%`,
                  backgroundColor: '#2196F3'
                }}>
                  <span>Afternoon</span>
                </div>
                <div className="chart-bar" style={{ 
                  height: `${(analysis.commitPatterns.timeOfDay.evening / (commits.length || 1)) * 100}%`,
                  backgroundColor: '#FF9800'
                }}>
                  <span>Evening</span>
                </div>
                <div className="chart-bar" style={{ 
                  height: `${(analysis.commitPatterns.timeOfDay.night / (commits.length || 1)) * 100}%`, 
                  backgroundColor: '#9C27B0'
                }}>
                  <span>Night</span>
                </div>
              </div>
            </div>
            
            <div className="insight-card">
              <h4>Emoji Usage</h4>
              {analysis.emojiUsage.topEmojis.length > 0 ? (
                <div className="emoji-list">
                  {analysis.emojiUsage.topEmojis.map((emojiData: { emoji: string; count: number }, index: number) => (
                    <div key={index} className="emoji-item">
                      <span className="emoji">{emojiData.emoji}</span>
                      <span className="count">{emojiData.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No emojis found in commits</p>
              )}
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Repository Analysis</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <h4>Languages</h4>
              <div className="language-list">
                {Object.entries(analysis.repoAnalysis.languages).slice(0, 5).map(([lang, count]: [string, number], index: number) => (
                  <div key={index} className="language-item">
                    <span className="language-name">{lang}</span>
                    <span className="language-count">{count} repos</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="insight-card">
              <h4>Questionable Commits</h4>
              {analysis.commitLanguage.questionableMessages.length > 0 ? (
                <div className="commit-messages">
                  {analysis.commitLanguage.questionableMessages.slice(0, 3).map((message: string, index: number) => (
                    <div key={index} className="commit-message">
                      "{message.length > 50 ? message.substring(0, 50) + '...' : message}"
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No questionable commits found (boring!)</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="actions">
        <button className="primary-button" onClick={onReset}>
          Roast Another User
        </button>
     
      </div>
    </div>
  );
};

export default GitHubProfile;
