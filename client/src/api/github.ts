import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';



// GitHub API response interfaces
export interface GitHubUser {
  login: string;
  id: number;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  location: string | null;
  email: string | null;
  blog: string | null;
  company: string | null;
  created_at: string;
  updated_at: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string;
  } | null;
  topics: string[];
}

export interface GitHubCommit {
  sha: string;
  commit: {
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
    message: string;
  };
  html_url: string;
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

export interface RateLimitResponse {
  resources: {
    core: {
      limit: number;
      used: number;
      remaining: number;
      reset: number;
    };
    search: {
      limit: number;
      used: number;
      remaining: number;
      reset: number;
    };
    graphql: {
      limit: number;
      used: number;
      remaining: number;
      reset: number;
    };
  };
  rate: {
    limit: number;
    used: number;
    remaining: number;
    reset: number;
  };
}

export interface GitHubErrorResponse {
  message: string;
  documentation_url: string;
}

export interface UserData {
  user: GitHubUser;
  repos: GitHubRepo[];
  commits: GitHubCommit[];
  rateLimit: RateLimitResponse['rate'];
  error?: string;
}

// Error types for handling GitHub API errors
export const GitHubErrorType = {
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

export type GitHubErrorType =
  | typeof GitHubErrorType.RATE_LIMIT_EXCEEDED
  | typeof GitHubErrorType.USER_NOT_FOUND
  | typeof GitHubErrorType.NETWORK_ERROR
  | typeof GitHubErrorType.UNKNOWN_ERROR;

export class GitHubError extends Error {
  type: GitHubErrorType;
  status?: number;
  retryAfter?: number;

  constructor(message: string, type: GitHubErrorType, status?: number, retryAfter?: number) {
    super(message);
    this.name = 'GitHubError';
    this.type = type;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

class GitHubAPI {
  private client: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(token?: string) {
    const config: AxiosRequestConfig = {
      baseURL: 'https://api.github.com',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      }
    };

    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `token ${token}`
      };
    }

    this.client = axios.create(config);

    // Add response interceptor for rate limiting
    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError<GitHubErrorResponse>) => {
        if (error.response) {
          const { status, headers, data } = error.response;

          // Rate limit exceeded
          if (status === 403 && headers['x-ratelimit-remaining'] === '0') {
            const resetTime = parseInt(headers['x-ratelimit-reset'] as string, 10) * 1000;
            const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
            throw new GitHubError(
              'GitHub API rate limit exceeded. Please try again later.',
              GitHubErrorType.RATE_LIMIT_EXCEEDED,
              status,
              retryAfter
            );
          }

          // User not found
          if (status === 404) {
            throw new GitHubError(
              'GitHub user not found.',
              GitHubErrorType.USER_NOT_FOUND,
              status
            );
          }

          // Generic error with GitHub response
          throw new GitHubError(
            data?.message || 'Unknown GitHub API error',
            GitHubErrorType.UNKNOWN_ERROR,
            status
          );
        }

        // Network errors
        if (error.request) {
          throw new GitHubError(
            'Network error. Please check your connection and try again.',
            GitHubErrorType.NETWORK_ERROR
          );
        }

        // Unknown errors
        throw new GitHubError(
          error.message || 'Unknown error occurred',
          GitHubErrorType.UNKNOWN_ERROR
        );
      }
    );
  }

  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    return `${endpoint}${params ? JSON.stringify(params) : ''}`;
  }

  private getFromCache<T>(cacheKey: string): T | null {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(cacheKey: string, data: any): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  private async fetchWithCache<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, params);
    const cachedData = this.getFromCache<T>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const response = await this.client.get<T>(endpoint, { params });
    this.setCache(cacheKey, response.data);
    return response.data;
  }

  async getUser(username: string): Promise<GitHubUser> {
    return this.fetchWithCache<GitHubUser>(`/users/${username}`);
  }

  async getUserRepos(
    username: string,
    page = 1,
    perPage = 30,
    sort: 'created' | 'updated' | 'pushed' | 'full_name' = 'pushed'
  ): Promise<GitHubRepo[]> {
    return this.fetchWithCache<GitHubRepo[]>(`/users/${username}/repos`, {
      page,
      per_page: perPage,
      sort
    });
  }

  async getRepoCommits(
    owner: string,
    repo: string,
    page = 1,
    perPage = 30
  ): Promise<GitHubCommit[]> {
    return this.fetchWithCache<GitHubCommit[]>(`/repos/${owner}/${repo}/commits`, {
      page,
      per_page: perPage
    });
  }

  async getUserCommits(
    username: string,
    maxRepos = 5,
    commitsPerRepo = 10
  ): Promise<GitHubCommit[]> {
    const repos = await this.getUserRepos(username, 1, maxRepos);
    const commits: GitHubCommit[] = [];

    await Promise.all(
      repos.map(async (repo) => {
        try {
          if (!repo.fork) { // Skip forked repositories
            const repoCommits = await this.getRepoCommits(username, repo.name, 1, commitsPerRepo);
            commits.push(...repoCommits);
          }
        } catch (error) {
          // Silently skip repos we can't access
          console.warn(`Could not fetch commits for ${repo.name}:`, error);
        }
      })
    );

    return commits;
  }

  async getRateLimit(): Promise<RateLimitResponse> {
    return this.fetchWithCache<RateLimitResponse>('/rate_limit');
  }

  async getAllUserData(username: string): Promise<UserData> {
    try {
      const [user, repos, rateLimit] = await Promise.all([
        this.getUser(username),
        this.getUserRepos(username, 1, 10),
        this.getRateLimit()
      ]);

      const commits = await this.getUserCommits(username, 5, 10);

      return {
        user,
        repos,
        commits,
        rateLimit: rateLimit.rate
      };
    } catch (error) {
      if (error instanceof GitHubError) {
        throw error;
      }
      throw new GitHubError(
        'Failed to fetch GitHub user data',
        GitHubErrorType.UNKNOWN_ERROR
      );
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Create and export the GitHub API client
const githubAPI = new GitHubAPI();
export default githubAPI;
