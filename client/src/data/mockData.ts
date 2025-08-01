import type { UserAnalysis } from '../types/github';

// Mock data for demonstration purposes
export const mockUserData: UserAnalysis = {
  profile: {
    login: 'octocat',
    id: 1,
    avatar_url: 'https://github.com/images/error/octocat_happy.gif',
    name: 'The Octocat',
    bio: 'A great place to work',
    location: 'San Francisco',
    email: null,
    company: '@github',
    blog: 'https://github.blog',
    twitter_username: null,
    public_repos: 8,
    public_gists: 8,
    followers: 9000,
    following: 9,
    created_at: '2008-01-14T04:33:35Z',
    updated_at: '2023-12-15T14:06:15Z'
  },
  repositories: [
    {
      id: 1296269,
      name: 'Hello-World',
      full_name: 'octocat/Hello-World',
      description: 'This your first repo!',
      private: false,
      html_url: 'https://github.com/octocat/Hello-World',
      created_at: '2011-01-26T19:01:12Z',
      updated_at: '2023-12-15T14:06:15Z',
      pushed_at: '2023-12-15T14:06:15Z',
      size: 108,
      stargazers_count: 80,
      watchers_count: 80,
      language: 'JavaScript',
      forks_count: 9,
      open_issues_count: 0,
      default_branch: 'main',
      topics: ['github', 'octocat'],
      owner: {
        login: 'octocat',
        id: 1,
        avatar_url: 'https://github.com/images/error/octocat_happy.gif'
      }
    },
    {
      id: 1296270,
      name: 'awesome-project',
      full_name: 'octocat/awesome-project',
      description: 'An awesome project for learning',
      private: false,
      html_url: 'https://github.com/octocat/awesome-project',
      created_at: '2023-01-15T10:30:00Z',
      updated_at: '2023-12-01T16:45:30Z',
      pushed_at: '2023-12-01T16:45:30Z',
      size: 256,
      stargazers_count: 150,
      watchers_count: 150,
      language: 'Python',
      forks_count: 25,
      open_issues_count: 3,
      default_branch: 'main',
      topics: ['python', 'machine-learning', 'awesome'],
      owner: {
        login: 'octocat',
        id: 1,
        avatar_url: 'https://github.com/images/error/octocat_happy.gif'
      }
    }
  ],
  commits: [
    {
      sha: 'abc123',
      commit: {
        message: '🎉 Initial commit',
        author: {
          name: 'The Octocat',
          email: 'octocat@github.com',
          date: '2023-12-15T10:30:00Z'
        },
        committer: {
          name: 'The Octocat',
          email: 'octocat@github.com',
          date: '2023-12-15T10:30:00Z'
        }
      },
      author: {
        login: 'octocat',
        id: 1,
        avatar_url: 'https://github.com/images/error/octocat_happy.gif'
      },
      committer: {
        login: 'octocat',
        id: 1,
        avatar_url: 'https://github.com/images/error/octocat_happy.gif'
      }
    },
    {
      sha: 'def456',
      commit: {
        message: 'fix: resolve critical bug in user authentication',
        author: {
          name: 'The Octocat',
          email: 'octocat@github.com',
          date: '2023-12-14T15:20:00Z'
        },
        committer: {
          name: 'The Octocat',
          email: 'octocat@github.com',
          date: '2023-12-14T15:20:00Z'
        }
      },
      author: {
        login: 'octocat',
        id: 1,
        avatar_url: 'https://github.com/images/error/octocat_happy.gif'
      },
      committer: {
        login: 'octocat',
        id: 1,
        avatar_url: 'https://github.com/images/error/octocat_happy.gif'
      }
    },
    {
      sha: 'ghi789',
      commit: {
        message: 'Add new feature for better UX 🚀',
        author: {
          name: 'The Octocat',
          email: 'octocat@github.com',
          date: '2023-12-13T09:15:00Z'
        },
        committer: {
          name: 'The Octocat',
          email: 'octocat@github.com',
          date: '2023-12-13T09:15:00Z'
        }
      },
      author: {
        login: 'octocat',
        id: 1,
        avatar_url: 'https://github.com/images/error/octocat_happy.gif'
      },
      committer: {
        login: 'octocat',
        id: 1,
        avatar_url: 'https://github.com/images/error/octocat_happy.gif'
      }
    }
  ],
  statistics: {
    totalCommits: 247,
    commitsThisYear: 89,
    mostActiveDay: '2023-12-15',
    averageCommitsPerDay: 0.68,
    languageDistribution: {
      'JavaScript': 15,
      'Python': 8,
      'TypeScript': 5,
      'Java': 3,
      'Go': 2
    },
    emojiCount: {
      '🎉': 12,
      '🚀': 8,
      '🐛': 5,
      '✨': 4,
      '🔧': 3
    },
    commitMessagePatterns: {
      hasEmojis: 45,
      hasConventionalCommits: 156,
      averageLength: 42,
      mostCommonWords: {
        'fix': 32,
        'add': 28,
        'update': 24,
        'refactor': 18,
        'improve': 15,
        'implement': 12,
        'optimize': 8,
        'feature': 7,
        'bug': 6,
        'docs': 5
      }
    },
    repositoryPatterns: {
      namingPatterns: {
        'kebab-case': 12,
        'snake_case': 3,
        'camelCase': 8,
        'lowercase': 2
      },
      topicsUsed: {
        'javascript': 8,
        'python': 6,
        'web': 5,
        'api': 4,
        'react': 3,
        'node': 3,
        'machine-learning': 2
      },
      averageStars: 45,
      averageSize: 182
    },
    activityPatterns: {
      hourlyActivity: {
        0: 2, 1: 1, 2: 0, 3: 0, 4: 0, 5: 1,
        6: 3, 7: 8, 8: 15, 9: 25, 10: 32, 11: 28,
        12: 18, 13: 22, 14: 35, 15: 41, 16: 38, 17: 25,
        18: 15, 19: 12, 20: 8, 21: 6, 22: 4, 23: 3
      },
      weeklyActivity: {
        0: 15, 1: 45, 2: 52, 3: 48, 4: 42, 5: 35, 6: 10
      },
      monthlyActivity: {
        0: 18, 1: 22, 2: 28, 3: 32, 4: 35, 5: 42,
        6: 38, 7: 45, 8: 48, 9: 52, 10: 28, 11: 15
      }
    }
  }
};

export function getMockData(username: string): Promise<UserAnalysis> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Customize the mock data with the requested username
      const customizedData = {
        ...mockUserData,
        profile: {
          ...mockUserData.profile,
          login: username,
          name: username.charAt(0).toUpperCase() + username.slice(1)
        }
      };
      resolve(customizedData);
    }, 1500); // Simulate API delay
  });
}