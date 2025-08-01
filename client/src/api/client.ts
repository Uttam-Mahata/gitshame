// GitShame API Client - REST API Service
import { API_CONFIG, buildApiUrl, ApiError } from './config';
import type { GitHubUser, GitHubRepo, GitHubCommit } from './github';
import type { UserAnalysis } from './analyzer';

// Request/Response Types
export interface RoastRequest {
  user: {
    login: string;
    name: string | null;
    bio: string | null;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
    avatar_url: string;
  };
  repos: Array<{
    name: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    created_at: string;
    updated_at: string;
  }>;
  commits: Array<{
    message: string;
    date: string;
  }>;
  analysis: UserAnalysis;
}

export interface RoastResponse {
  roasts: string[];
  source: string;
  overall_tone?: string;
  metadata?: {
    roast_categories?: string[];
    severity_levels?: string[];
  };
}

export interface RoastabilityResponse {
  roast_score: number;
  roastability_level: string;
  message: string;
  roast_factors: string[];
  suggestions: string[];
}

export interface HealthResponse {
  status: string;
  service: string;
}

export class GitShameApiClient {
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.defaultHeaders = API_CONFIG.HEADERS;
  }

  // Generic HTTP client method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = buildApiUrl(endpoint);
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `API request failed: ${response.statusText}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage += ` - ${errorText}`;
          }
        } catch {
          // Ignore error text parsing errors
        }
        
        throw new ApiError(
          errorMessage,
          response.status,
          endpoint
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, endpoint);
      }
      
      throw new ApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        endpoint
      );
    }
  }

  // Health check
  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>(API_CONFIG.ENDPOINTS.HEALTH);
  }

  // Generate roasts
  async generateRoasts(requestData: RoastRequest): Promise<RoastResponse> {
    return this.request<RoastResponse>(API_CONFIG.ENDPOINTS.GENERATE_ROASTS, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  // Analyze roast potential
  async analyzeRoastPotential(requestData: RoastRequest): Promise<RoastabilityResponse> {
    return this.request<RoastabilityResponse>(API_CONFIG.ENDPOINTS.ANALYZE_ROAST_POTENTIAL, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  // Get API info
  async getApiInfo(): Promise<{ message: string }> {
    return this.request<{ message: string }>(API_CONFIG.ENDPOINTS.ROOT);
  }

  // Helper method to transform GitHub data to API format
  static transformToApiFormat(
    user: GitHubUser,
    repos: GitHubRepo[],
    commits: GitHubCommit[],
    analysis: UserAnalysis
  ): RoastRequest {
    return {
      user: {
        login: user.login,
        name: user.name,
        bio: user.bio,
        public_repos: user.public_repos,
        followers: user.followers,
        following: user.following,
        created_at: user.created_at,
        avatar_url: user.avatar_url,
      },
      repos: repos.map(repo => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
      })),
      commits: commits.map(commit => ({
        message: commit.commit.message,
        date: commit.commit.author.date,
      })),
      analysis,
    };
  }
}

// Create and export a singleton instance
const apiClient = new GitShameApiClient();
export default apiClient;
