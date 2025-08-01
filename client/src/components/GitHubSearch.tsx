import { useState } from 'react';
import GitHubProfile from './GitHubProfile';
import '../styles/GitHubSearch.css';

const GitHubSearch: React.FC = () => {
  const [username, setUsername] = useState('');
  const [searchedUsername, setSearchedUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }
    
    // GitHub username validation (allows letters, numbers, hyphens)
    if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(username)) {
      setError('Invalid GitHub username format');
      return;
    }
    
    setError(null);
    setSearchedUsername(username.trim());
  };

  const handleReset = () => {
    setSearchedUsername('');
    setUsername('');
  };

  return (
    <div className="github-search">
      {!searchedUsername ? (
        <div className="search-container">
          <div className="app-header">
            <div className="app-logo">
              <svg viewBox="0 0 16 16" width="48" height="48" fill="currentColor">
                <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
              <h1>GitShame</h1>
            </div>
            <h2>The GitHub Roaster</h2>
            <p className="app-description">
              Enter a GitHub username and we'll analyze their repos, commits, and activity for a personalized roast 🔥
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="search-form">
            <div className="input-group">
              <div className="input-icon">@</div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="GitHub Username"
                aria-label="GitHub Username"
                className={error ? 'input-error' : ''}
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="search-button">
              Roast This User
            </button>
          </form>
          
          <div className="examples">
            <p>Try these: <span className="example-user">torvalds</span>, <span className="example-user">gaearon</span>, <span className="example-user">rich-harris</span></p>
          </div>
        </div>
      ) : (
        <GitHubProfile username={searchedUsername} onReset={handleReset} />
      )}
    </div>
  );
};

export default GitHubSearch;
