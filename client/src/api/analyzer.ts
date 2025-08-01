import type { GitHubCommit, GitHubRepo, GitHubUser } from './github';
import apiClient, { GitShameApiClient } from './client';
import { ApiError } from './config';

export interface UserAnalysis {
  commitPatterns: {
    timeOfDay: Record<string, number>; // morning, afternoon, evening, night
    dayOfWeek: Record<string, number>; // Monday through Sunday
    commitFrequency: Record<string, number>; // daily, weekly, monthly stats
  };
  emojiUsage: {
    count: number;
    topEmojis: Array<{ emoji: string; count: number }>;
  };
  commitLanguage: {
    averageLength: number;
    shortMessages: number;
    longMessages: number;
    questionableMessages: string[]; // Funny or strange commit messages
  };
  repoAnalysis: {
    namingPatterns: string[];
    languages: Record<string, number>;
    abandonedRepos: number; // No commits for over 6 months
    oneCommitWonders: number; // Repos with just one commit
  };
  userStats: {
    accountAge: number; // in days
    publicContributions: number;
    followRatio: number; // followers/following
    repoToStarRatio: number; // total stars / repos
  };
}

// Helper function to extract emojis from text
export function extractEmojis(text: string): string[] {
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  return text.match(emojiRegex) || [];
}

// Get time of day category
export function getTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

// Get day of week
export function getDayOfWeek(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

// Check if a commit message is questionable or funny
export function isQuestionableCommit(message: string): boolean {
  const questionablePatterns = [
    /fix/i,
    /oops/i,
    /wtf/i,
    /forgot/i,
    /hack/i,
    /sorry/i,
    /temp/i,
    /temporary/i,
    /todo/i,
    /fixme/i,
    /please work/i,
    /finally/i,
    /i hate/i,
    /why/i,
    /what/i,
    /\?\?\?/,
    /!!!/,
    /magic/i,
  ];
  
  return questionablePatterns.some(pattern => pattern.test(message));
}

// Analyze a user's GitHub data
export function analyzeUserData(
  user: GitHubUser,
  repos: GitHubRepo[],
  commits: GitHubCommit[]
): UserAnalysis {
  // Initialize analysis structure
  const analysis: UserAnalysis = {
    commitPatterns: {
      timeOfDay: { morning: 0, afternoon: 0, evening: 0, night: 0 },
      dayOfWeek: { 
        Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, 
        Friday: 0, Saturday: 0, Sunday: 0 
      },
      commitFrequency: { daily: 0, weekly: 0, monthly: 0 }
    },
    emojiUsage: {
      count: 0,
      topEmojis: []
    },
    commitLanguage: {
      averageLength: 0,
      shortMessages: 0,
      longMessages: 0,
      questionableMessages: []
    },
    repoAnalysis: {
      namingPatterns: [],
      languages: {},
      abandonedRepos: 0,
      oneCommitWonders: 0
    },
    userStats: {
      accountAge: 0,
      publicContributions: commits.length,
      followRatio: user.followers / (user.following || 1),
      repoToStarRatio: 0
    }
  };

  // Calculate account age in days
  const createdAt = new Date(user.created_at);
  const now = new Date();
  analysis.userStats.accountAge = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

  // Analyze commit patterns
  let totalMessageLength = 0;
  const emojiMap: Record<string, number> = {};

  commits.forEach(commit => {
    const message = commit.commit.message;
    const date = new Date(commit.commit.author.date);
    
    // Time of day analysis
    analysis.commitPatterns.timeOfDay[getTimeOfDay(date)]++;
    
    // Day of week analysis
    analysis.commitPatterns.dayOfWeek[getDayOfWeek(date)]++;
    
    // Message length analysis
    totalMessageLength += message.length;
    if (message.length < 10) analysis.commitLanguage.shortMessages++;
    if (message.length > 100) analysis.commitLanguage.longMessages++;
    
    // Questionable commit messages
    if (isQuestionableCommit(message)) {
      analysis.commitLanguage.questionableMessages.push(message);
    }
    
    // Emoji analysis
    const emojis = extractEmojis(message);
    analysis.emojiUsage.count += emojis.length;
    
    emojis.forEach(emoji => {
      emojiMap[emoji] = (emojiMap[emoji] || 0) + 1;
    });
  });

  // Calculate average commit message length
  analysis.commitLanguage.averageLength = commits.length 
    ? Math.round(totalMessageLength / commits.length) 
    : 0;

  // Get top emojis
  analysis.emojiUsage.topEmojis = Object.entries(emojiMap)
    .map(([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Analyze repositories
  let totalStars = 0;
  const languagesMap: Record<string, number> = {};
  const namingPatterns: Record<string, number> = {
    camelCase: 0,
    kebabCase: 0,
    snakeCase: 0,
    pascalCase: 0,
    hasNumbers: 0,
    hasEmoji: 0,
    hasAcronym: 0,
    hasJs: 0,
    hasApp: 0,
    hasDemo: 0,
    hasTutorial: 0
  };

  repos.forEach(repo => {
    // Count stars
    totalStars += repo.stargazers_count;
    
    // Track languages
    if (repo.language) {
      languagesMap[repo.language] = (languagesMap[repo.language] || 0) + 1;
    }
    
    // Check if repo is abandoned (no updates in 6+ months)
    const lastUpdate = new Date(repo.updated_at);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    if (lastUpdate < sixMonthsAgo) {
      analysis.repoAnalysis.abandonedRepos++;
    }
    
    // Naming pattern analysis
    const name = repo.name;
    if (/^[a-z][a-zA-Z0-9]*$/.test(name) && name.includes(/[A-Z]/.test(name) ? 'A' : '')) {
      namingPatterns.camelCase++;
    }
    if (name.includes('-')) namingPatterns.kebabCase++;
    if (name.includes('_')) namingPatterns.snakeCase++;
    if (/^[A-Z][a-zA-Z0-9]*$/.test(name)) namingPatterns.pascalCase++;
    if (/\d/.test(name)) namingPatterns.hasNumbers++;
    if (extractEmojis(name).length > 0) namingPatterns.hasEmoji++;
    if (/[A-Z]{2,}/.test(name)) namingPatterns.hasAcronym++;
    if (/js|javascript/i.test(name)) namingPatterns.hasJs++;
    if (/app/i.test(name)) namingPatterns.hasApp++;
    if (/demo/i.test(name)) namingPatterns.hasDemo++;
    if (/tutorial|example/i.test(name)) namingPatterns.hasTutorial++;
  });

  // Calculate repo to star ratio
  analysis.userStats.repoToStarRatio = repos.length ? totalStars / repos.length : 0;

  // Sort languages by frequency
  analysis.repoAnalysis.languages = Object.fromEntries(
    Object.entries(languagesMap)
      .sort((a, b) => b[1] - a[1])
  );

  // Extract naming patterns
  analysis.repoAnalysis.namingPatterns = Object.entries(namingPatterns)
    .filter(([_, count]) => count > 0)
    .map(([pattern, _]) => pattern);

  return analysis;
}

// Generate roast content based on user analysis
export async function generateRoastContent(analysis: UserAnalysis, user: GitHubUser, repos: GitHubRepo[], commits: GitHubCommit[]): Promise<{
  roasts: string[];
  metadata: {
    source: string;
    overall_tone?: string;
    categories?: string[];
    severity_levels?: string[];
  };
}> {
  try {
    // Transform data to API format
    const requestData = GitShameApiClient.transformToApiFormat(user, repos, commits, analysis);
    
    // Call the backend API
    const response = await apiClient.generateRoasts(requestData);
    
    console.log(`Generated ${response.roasts.length} AI roasts from ${response.source} source`);
    
    return {
      roasts: response.roasts,
      metadata: {
        source: response.source,
        overall_tone: response.overall_tone,
        categories: response.metadata?.roast_categories,
        severity_levels: response.metadata?.severity_levels
      }
    };
    
  } catch (error) {
    console.error('Error generating AI roasts:', error);
    
    // Provide more specific error handling
    if (error instanceof ApiError) {
      if (error.status === 0) {
        console.warn('Backend not available, falling back to static roasts');
      } else if (error.status >= 500) {
        console.warn('Backend server error, falling back to static roasts');
      } else {
        console.warn(`Backend API error (${error.status}), falling back to static roasts`);
      }
    }
    
    // Fallback to static roasts
    const staticRoasts = generateStaticRoasts(analysis, user);
    return {
      roasts: staticRoasts,
      metadata: {
        source: 'static_fallback',
        overall_tone: 'sarcastic'
      }
    };
  }
}

// Generate static roast content as a fallback
function generateStaticRoasts(analysis: UserAnalysis, user: GitHubUser): string[] {
  const roasts: string[] = [];

  // Account age roasts
  if (analysis.userStats.accountAge < 365) {
    roasts.push(`New to GitHub, @${user.login}? Your account is younger than some of my leftovers! 🍕`);
  } else if (analysis.userStats.accountAge > 3650) {
    roasts.push(`Wow, @${user.login} has been on GitHub for ${Math.floor(analysis.userStats.accountAge/365)} years. Remember when "the cloud" meant bad weather? 👴`);
  }

  // Commit time patterns
  const commitTimeMax = Math.max(
    analysis.commitPatterns.timeOfDay.morning,
    analysis.commitPatterns.timeOfDay.afternoon,
    analysis.commitPatterns.timeOfDay.evening,
    analysis.commitPatterns.timeOfDay.night
  );
  
  if (analysis.commitPatterns.timeOfDay.night === commitTimeMax) {
    roasts.push(`Looks like someone's a night owl! Most commits after dark. Do you even know what the sun looks like? 🦉`);
  }
  
  if (analysis.commitPatterns.dayOfWeek.Saturday + analysis.commitPatterns.dayOfWeek.Sunday > 
     (analysis.commitPatterns.dayOfWeek.Monday + analysis.commitPatterns.dayOfWeek.Tuesday + 
      analysis.commitPatterns.dayOfWeek.Wednesday + analysis.commitPatterns.dayOfWeek.Thursday + 
      analysis.commitPatterns.dayOfWeek.Friday) / 5) {
    roasts.push(`Weekend warrior much? Your social life must be as non-existent as your test coverage. 🤓`);
  }

  // Emoji usage
  if (analysis.emojiUsage.count > 10) {
    roasts.push(`${analysis.emojiUsage.count} emojis in your commits? Your code might be buggy, but your commit messages are definitely 🔥 💯 👌`);
  } else if (analysis.emojiUsage.count === 0) {
    roasts.push(`Zero emojis in your commits? You must be fun at parties... 😐`);
  }

  // Commit messages
  if (analysis.commitLanguage.shortMessages > analysis.userStats.publicContributions / 3) {
    roasts.push(`"Fixed stuff" is not a commit message, it's a cry for help. Try using more than ${analysis.commitLanguage.averageLength} characters next time! 📝`);
  }
  
  if (analysis.commitLanguage.questionableMessages.length > 0) {
    roasts.push(`"${analysis.commitLanguage.questionableMessages[0]}" - This commit message is a work of art. Did you let your cat walk on the keyboard? 🐱`);
  }

  // Repository patterns
  if (analysis.repoAnalysis.abandonedRepos > 0) {
    roasts.push(`${analysis.repoAnalysis.abandonedRepos} abandoned repos? Your GitHub is starting to look like a project graveyard. RIP. ⚰️`);
  }
  
  if (analysis.repoAnalysis.namingPatterns.includes('hasDemo') || analysis.repoAnalysis.namingPatterns.includes('hasTutorial')) {
    roasts.push(`Another "demo" repo? Let me guess, you followed a tutorial and pushed it without changing the name. How original! 👏`);
  }
  
  if (analysis.userStats.repoToStarRatio < 1) {
    roasts.push(`${user.public_repos} repos but only ${Math.floor(analysis.userStats.repoToStarRatio * user.public_repos)} stars? Even your mom didn't star your projects! ⭐`);
  }

  // Follow ratio
  if (analysis.userStats.followRatio < 0.5) {
    roasts.push(`Following ${user.following} people but only ${user.followers} followers? GitHub isn't a dating app - they're not going to follow you back! 💔`);
  } else if (analysis.userStats.followRatio > 5) {
    roasts.push(`${user.followers} followers? What are you, a GitHub influencer? #GitFluencer 📸`);
  }

  return roasts;
}
