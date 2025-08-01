import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { GitHubUser, GitHubRepository, GitHubCommit, GitHubAPIError, APIRequestConfig } from '../types/github';

class GitHubAPIClient {
  private client: AxiosInstance;
  private config: APIRequestConfig;

  constructor(config: APIRequestConfig = {}) {
    this.config = config;
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        // Remove User-Agent header as it's blocked in browsers
        ...(config.token && { 'Authorization': `token ${config.token}` })
      },
      timeout: 10000
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const apiError: GitHubAPIError = {
            message: error.response.data?.message || 'API request failed',
            documentation_url: error.response.data?.documentation_url,
            status: error.response.status
          };
          throw apiError;
        }
        throw error;
      }
    );
  }

  private async handleRateLimit(): Promise<void> {
    try {
      const response = await this.client.get('/rate_limit');
      const rateLimit = response.data.rate;
      this.config.rateLimit = {
        remaining: rateLimit.remaining,
        reset: rateLimit.reset
      };

      if (rateLimit.remaining === 0) {
        const resetTime = new Date(rateLimit.reset * 1000);
        const waitTime = resetTime.getTime() - Date.now();
        
        if (waitTime > 0) {
          console.warn(`Rate limit exceeded. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    } catch (error) {
      console.warn('Could not check rate limit:', error);
    }
  }

  async getUserProfile(username: string): Promise<GitHubUser> {
    try {
      const response: AxiosResponse<GitHubUser> = await this.client.get(`/users/${username}`);
      return response.data;
    } catch (error) {
      if ((error as GitHubAPIError).status === 404) {
        throw new Error(`User '${username}' not found`);
      }
      if ((error as GitHubAPIError).status === 403) {
        await this.handleRateLimit();
        return this.getUserProfile(username);
      }
      throw error;
    }
  }

  async getUserRepositories(username: string, perPage: number = 30): Promise<GitHubRepository[]> {
    try {
      const repositories: GitHubRepository[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore && repositories.length < 100) { // Limit to 100 repos max
        const response: AxiosResponse<GitHubRepository[]> = await this.client.get(
          `/users/${username}/repos`,
          {
            params: {
              per_page: perPage,
              page,
              sort: 'updated',
              direction: 'desc'
            }
          }
        );

        const repos = response.data;
        repositories.push(...repos);
        hasMore = repos.length === perPage;
        page++;
      }

      return repositories;
    } catch (error) {
      if ((error as GitHubAPIError).status === 403) {
        await this.handleRateLimit();
        return this.getUserRepositories(username, perPage);
      }
      throw error;
    }
  }

  async getRepositoryCommits(
    owner: string,
    repo: string,
    author: string,
    perPage: number = 30
  ): Promise<GitHubCommit[]> {
    try {
      const commits: GitHubCommit[] = [];
      let page = 1;
      let hasMore = true;
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      while (hasMore && commits.length < 100) { // Limit to 100 commits per repo
        const response: AxiosResponse<GitHubCommit[]> = await this.client.get(
          `/repos/${owner}/${repo}/commits`,
          {
            params: {
              author,
              since: oneYearAgo.toISOString(),
              per_page: perPage,
              page
            }
          }
        );

        const repoCommits = response.data;
        commits.push(...repoCommits);
        hasMore = repoCommits.length === perPage;
        page++;
      }

      return commits;
    } catch (error) {
      if ((error as GitHubAPIError).status === 403) {
        await this.handleRateLimit();
        return this.getRepositoryCommits(owner, repo, author, perPage);
      }
      if ((error as GitHubAPIError).status === 409) {
        // Repository is empty
        return [];
      }
      throw error;
    }
  }

  async getUserCommits(username: string): Promise<GitHubCommit[]> {
    const repositories = await this.getUserRepositories(username);
    const allCommits: GitHubCommit[] = [];

    // Get commits from user's repositories
    for (const repo of repositories.slice(0, 10)) { // Limit to 10 repos for performance
      try {
        const commits = await this.getRepositoryCommits(repo.owner.login, repo.name, username);
        allCommits.push(...commits);
      } catch {
        console.warn(`Could not fetch commits for ${repo.name}`);
        // Continue with other repositories
      }
    }

    return allCommits;
  }

  async checkRateLimit(): Promise<{ remaining: number; reset: Date }> {
    try {
      const response = await this.client.get('/rate_limit');
      const rate = response.data.rate;
      return {
        remaining: rate.remaining,
        reset: new Date(rate.reset * 1000)
      };
    } catch {
      throw new Error('Could not check rate limit');
    }
  }
}

export default GitHubAPIClient;