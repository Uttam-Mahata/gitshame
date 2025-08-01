import type { GitHubUser, GitHubRepository, GitHubCommit, UserAnalysis } from '../types/github';

// Common emoji patterns in commit messages
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;

// Conventional commit patterns
const CONVENTIONAL_COMMIT_REGEX = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .+/;

export function extractEmojis(text: string): string[] {
  return text.match(EMOJI_REGEX) || [];
}

export function isConventionalCommit(message: string): boolean {
  return CONVENTIONAL_COMMIT_REGEX.test(message);
}

export function analyzeCommitMessages(commits: GitHubCommit[]) {
  const analysis = {
    hasEmojis: 0,
    hasConventionalCommits: 0,
    averageLength: 0,
    mostCommonWords: {} as Record<string, number>,
    emojiCount: {} as Record<string, number>
  };

  if (commits.length === 0) return analysis;

  let totalLength = 0;
  const wordCounts: Record<string, number> = {};

  commits.forEach(commit => {
    const message = commit.commit.message.split('\n')[0]; // First line only
    totalLength += message.length;

    // Check for emojis
    const emojis = extractEmojis(message);
    if (emojis.length > 0) {
      analysis.hasEmojis++;
      emojis.forEach(emoji => {
        analysis.emojiCount[emoji] = (analysis.emojiCount[emoji] || 0) + 1;
      });
    }

    // Check for conventional commits
    if (isConventionalCommit(message)) {
      analysis.hasConventionalCommits++;
    }

    // Extract words (simple word extraction)
    const words = message
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2); // Filter out short words

    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
  });

  analysis.averageLength = Math.round(totalLength / commits.length);
  
  // Get top 10 most common words
  const sortedWords = Object.entries(wordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  analysis.mostCommonWords = Object.fromEntries(sortedWords);

  return analysis;
}

export function analyzeRepositoryPatterns(repositories: GitHubRepository[]) {
  const analysis = {
    namingPatterns: {} as Record<string, number>,
    topicsUsed: {} as Record<string, number>,
    averageStars: 0,
    averageSize: 0
  };

  if (repositories.length === 0) return analysis;

  let totalStars = 0;
  let totalSize = 0;

  repositories.forEach(repo => {
    totalStars += repo.stargazers_count;
    totalSize += repo.size;

    // Analyze naming patterns
    const name = repo.name.toLowerCase();
    if (name.includes('-')) {
      analysis.namingPatterns['kebab-case'] = (analysis.namingPatterns['kebab-case'] || 0) + 1;
    } else if (name.includes('_')) {
      analysis.namingPatterns['snake_case'] = (analysis.namingPatterns['snake_case'] || 0) + 1;
    } else if (/[A-Z]/.test(repo.name)) {
      analysis.namingPatterns['camelCase'] = (analysis.namingPatterns['camelCase'] || 0) + 1;
    } else {
      analysis.namingPatterns['lowercase'] = (analysis.namingPatterns['lowercase'] || 0) + 1;
    }

    // Analyze topics
    repo.topics.forEach(topic => {
      analysis.topicsUsed[topic] = (analysis.topicsUsed[topic] || 0) + 1;
    });
  });

  analysis.averageStars = Math.round(totalStars / repositories.length);
  analysis.averageSize = Math.round(totalSize / repositories.length);

  return analysis;
}

export function analyzeActivityPatterns(commits: GitHubCommit[]) {
  const analysis = {
    hourlyActivity: {} as Record<number, number>,
    weeklyActivity: {} as Record<number, number>,
    monthlyActivity: {} as Record<number, number>
  };

  // Initialize all hours, days, and months
  for (let i = 0; i < 24; i++) {
    analysis.hourlyActivity[i] = 0;
  }
  for (let i = 0; i < 7; i++) {
    analysis.weeklyActivity[i] = 0;
  }
  for (let i = 0; i < 12; i++) {
    analysis.monthlyActivity[i] = 0;
  }

  commits.forEach(commit => {
    const date = new Date(commit.commit.author.date);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    const month = date.getMonth();

    analysis.hourlyActivity[hour]++;
    analysis.weeklyActivity[dayOfWeek]++;
    analysis.monthlyActivity[month]++;
  });

  return analysis;
}

export function getLanguageDistribution(repositories: GitHubRepository[]): Record<string, number> {
  const languages: Record<string, number> = {};
  
  repositories.forEach(repo => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });

  return languages;
}

export function getMostActiveDay(commits: GitHubCommit[]): string {
  const dayCounts: Record<string, number> = {};
  
  commits.forEach(commit => {
    const date = commit.commit.author.date.split('T')[0];
    dayCounts[date] = (dayCounts[date] || 0) + 1;
  });

  const mostActiveDay = Object.entries(dayCounts)
    .sort(([,a], [,b]) => b - a)[0];

  return mostActiveDay ? mostActiveDay[0] : 'No activity';
}

export function calculateCommitStats(commits: GitHubCommit[]) {
  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  const commitsThisYear = commits.filter(commit => 
    new Date(commit.commit.author.date) >= oneYearAgo
  );

  const daysCovered = Math.ceil((now.getTime() - oneYearAgo.getTime()) / (1000 * 60 * 60 * 24));
  const averageCommitsPerDay = commitsThisYear.length / daysCovered;

  return {
    totalCommits: commits.length,
    commitsThisYear: commitsThisYear.length,
    averageCommitsPerDay: Math.round(averageCommitsPerDay * 100) / 100
  };
}

export function processUserData(
  profile: GitHubUser,
  repositories: GitHubRepository[],
  commits: GitHubCommit[]
): UserAnalysis {
  const commitStats = calculateCommitStats(commits);
  const commitMessageAnalysis = analyzeCommitMessages(commits);
  const repositoryPatterns = analyzeRepositoryPatterns(repositories);
  const activityPatterns = analyzeActivityPatterns(commits);
  const languageDistribution = getLanguageDistribution(repositories);
  const mostActiveDay = getMostActiveDay(commits);

  return {
    profile,
    repositories,
    commits,
    statistics: {
      ...commitStats,
      mostActiveDay,
      languageDistribution,
      emojiCount: commitMessageAnalysis.emojiCount,
      commitMessagePatterns: commitMessageAnalysis,
      repositoryPatterns,
      activityPatterns
    }
  };
}