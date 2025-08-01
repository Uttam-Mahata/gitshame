// GitHub API Response Types

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  email: string | null;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  topics: string[];
  owner: {
    login: string;
    id: number;
    avatar_url: string;
  };
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
    id: number;
    avatar_url: string;
  } | null;
  committer: {
    login: string;
    id: number;
    avatar_url: string;
  } | null;
}

export interface GitHubAPIError {
  message: string;
  documentation_url?: string;
  status?: number;
}

export interface UserAnalysis {
  profile: GitHubUser;
  repositories: GitHubRepository[];
  commits: GitHubCommit[];
  statistics: {
    totalCommits: number;
    commitsThisYear: number;
    mostActiveDay: string;
    averageCommitsPerDay: number;
    languageDistribution: Record<string, number>;
    emojiCount: Record<string, number>;
    commitMessagePatterns: {
      hasEmojis: number;
      hasConventionalCommits: number;
      averageLength: number;
      mostCommonWords: Record<string, number>;
    };
    repositoryPatterns: {
      namingPatterns: Record<string, number>;
      topicsUsed: Record<string, number>;
      averageStars: number;
      averageSize: number;
    };
    activityPatterns: {
      hourlyActivity: Record<number, number>;
      weeklyActivity: Record<number, number>;
      monthlyActivity: Record<number, number>;
    };
  };
}

export interface APIRequestConfig {
  token?: string;
  rateLimit?: {
    remaining: number;
    reset: number;
  };
}