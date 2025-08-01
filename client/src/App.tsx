import { useState } from 'react';
import { gitHubDataFetcher } from './services/githubDataFetcher';
import type { UserAnalysis } from './types/github';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [analysis, setAnalysis] = useState<UserAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchData = async () => {
    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await gitHubDataFetcher.fetchUserAnalysis(username.trim());
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFetchData();
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔥 GitShame 🔥</h1>
        <p>Analyze GitHub profiles and get roasted!</p>
        <p className="demo-notice">
          📋 Demo Mode: Using sample data for demonstration. 
          Real GitHub API integration requires authentication and CORS handling.
        </p>
        
        <div className="input-section">
          <input
            type="text"
            placeholder="Enter GitHub username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button onClick={handleFetchData} disabled={loading || !username.trim()}>
            {loading ? 'Analyzing...' : 'Roast Me!'}
          </button>
        </div>

        {error && (
          <div className="error">
            <h3>❌ Error</h3>
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="loading">
            <h3>🔍 Analyzing GitHub Profile...</h3>
            <p>Fetching your coding sins...</p>
          </div>
        )}

        {analysis && (
          <div className="analysis-results">
            <div className="profile-section">
              <h2>👤 Profile: {analysis.profile.name || analysis.profile.login}</h2>
              <div className="profile-info">
                <img src={analysis.profile.avatar_url} alt="Profile" width="100" />
                <div>
                  <p><strong>Location:</strong> {analysis.profile.location || 'Unknown'}</p>
                  <p><strong>Bio:</strong> {analysis.profile.bio || 'No bio'}</p>
                  <p><strong>Public Repos:</strong> {analysis.profile.public_repos}</p>
                  <p><strong>Followers:</strong> {analysis.profile.followers}</p>
                  <p><strong>Following:</strong> {analysis.profile.following}</p>
                  <p><strong>Joined:</strong> {new Date(analysis.profile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="stats-section">
              <h3>📊 Coding Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Commits</h4>
                  <p><strong>Total:</strong> {analysis.statistics.totalCommits}</p>
                  <p><strong>This Year:</strong> {analysis.statistics.commitsThisYear}</p>
                  <p><strong>Avg/Day:</strong> {analysis.statistics.averageCommitsPerDay}</p>
                </div>

                <div className="stat-card">
                  <h4>Most Active Day</h4>
                  <p>{analysis.statistics.mostActiveDay}</p>
                </div>

                <div className="stat-card">
                  <h4>Repositories</h4>
                  <p><strong>Count:</strong> {analysis.repositories.length}</p>
                  <p><strong>Avg Stars:</strong> {analysis.statistics.repositoryPatterns.averageStars}</p>
                </div>

                <div className="stat-card">
                  <h4>Commit Messages</h4>
                  <p><strong>Avg Length:</strong> {analysis.statistics.commitMessagePatterns.averageLength}</p>
                  <p><strong>With Emojis:</strong> {analysis.statistics.commitMessagePatterns.hasEmojis}</p>
                  <p><strong>Conventional:</strong> {analysis.statistics.commitMessagePatterns.hasConventionalCommits}</p>
                </div>
              </div>
            </div>

            {Object.keys(analysis.statistics.languageDistribution).length > 0 && (
              <div className="languages-section">
                <h3>💻 Programming Languages</h3>
                <div className="languages-list">
                  {Object.entries(analysis.statistics.languageDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([language, count]) => (
                      <span key={language} className="language-tag">
                        {language} ({count})
                      </span>
                    ))}
                </div>
              </div>
            )}

            {Object.keys(analysis.statistics.emojiCount).length > 0 && (
              <div className="emojis-section">
                <h3>😄 Emoji Usage</h3>
                <div className="emojis-list">
                  {Object.entries(analysis.statistics.emojiCount)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([emoji, count]) => (
                      <span key={emoji} className="emoji-tag">
                        {emoji} ({count})
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
