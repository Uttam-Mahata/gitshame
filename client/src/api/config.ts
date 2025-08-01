// API Configuration for GitShame Frontend

// Environment-based API URL configuration
const getApiBaseUrl = (): string => {
  // Check if we're in development or production
  if (import.meta.env.DEV) {
    // Development environment - backend running locally
    return import.meta.env.VITE_API_URL || 'http://localhost:8000';
  } else {
    // Production environment - use environment variable or relative URL
    return import.meta.env.VITE_API_URL || '/api';
  }
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    GENERATE_ROASTS: '/generate-roasts',
    ANALYZE_ROAST_POTENTIAL: '/analyze-roast-potential',
    HEALTH: '/health',
    ROOT: '/'
  },
  TIMEOUT: 30000, // 30 seconds timeout for AI generation
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

// API error handling
export class ApiError extends Error {
  status: number;
  endpoint: string;

  constructor(
    message: string,
    status: number,
    endpoint: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

export default API_CONFIG;
