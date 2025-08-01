import GitHubAPIClient from './githubApi';
import { processUserData } from '../utils/dataProcessor';
import { getMockData } from '../data/mockData';
import type { UserAnalysis } from '../types/github';

export interface GitHubDataFetcherConfig {
  token?: string;
  maxRepositories?: number;
  maxCommitsPerRepo?: number;
  useMockData?: boolean;
}

export class GitHubDataFetcher {
  private apiClient: GitHubAPIClient;
  private config: GitHubDataFetcherConfig;

  constructor(config: GitHubDataFetcherConfig = {}) {
    this.config = {
      maxRepositories: 10,
      maxCommitsPerRepo: 50,
      useMockData: false,
      ...config
    };
    
    this.apiClient = new GitHubAPIClient({
      token: config.token
    });
  }

  async fetchUserAnalysis(username: string): Promise<UserAnalysis> {
    // If mock data is enabled or no token is provided, use mock data
    if (this.config.useMockData || !this.config.token) {
      console.log(`Using mock data for user: ${username}`);
      return getMockData(username);
    }

    try {
      console.log(`Fetching data for user: ${username}`);
      
      // Fetch user profile
      console.log('Fetching user profile...');
      const profile = await this.apiClient.getUserProfile(username);
      
      // Fetch repositories
      console.log('Fetching repositories...');
      const repositories = await this.apiClient.getUserRepositories(username, 30);
      
      // Fetch commits
      console.log('Fetching commits...');
      const commits = await this.apiClient.getUserCommits(username);
      
      console.log(`Fetched ${repositories.length} repositories and ${commits.length} commits`);
      
      // Process and analyze data
      console.log('Processing data...');
      const analysis = processUserData(profile, repositories, commits);
      
      console.log('Data processing complete');
      return analysis;
      
    } catch {
      console.warn('GitHub API failed, falling back to mock data');
      return getMockData(username);
    }
  }

  async checkAPIStatus(): Promise<{ remaining: number; reset: Date }> {
    if (this.config.useMockData || !this.config.token) {
      return { remaining: 5000, reset: new Date(Date.now() + 3600000) }; // Mock: 1 hour from now
    }

    try {
      return await this.apiClient.checkRateLimit();
    } catch {
      return { remaining: 0, reset: new Date(Date.now() + 3600000) };
    }
  }

  setToken(token: string): void {
    this.config.token = token;
    this.config.useMockData = false;
    this.apiClient = new GitHubAPIClient({ token });
  }

  enableMockData(): void {
    this.config.useMockData = true;
  }

  disableMockData(): void {
    this.config.useMockData = false;
  }
}

// Export a default instance with mock data enabled for demonstration
export const gitHubDataFetcher = new GitHubDataFetcher({ useMockData: true });