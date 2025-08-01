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
              <img 
                src="/logo.png" 
                alt="GitShame Logo" 
                width="80" 
                height="80"
                style={{ marginRight: '16px' }}
              />
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
