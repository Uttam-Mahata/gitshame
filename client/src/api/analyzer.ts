import type { GitHubCommit, GitHubRepo, GitHubUser } from './github';

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
export function generateRoastContent(analysis: UserAnalysis, user: GitHubUser): string[] {
  const roasts: string[] = [];

  // Account age roasts
  if (analysis.userStats.accountAge < 365) {
    roasts.push(`Wow, your GitHub account is only ${Math.round(analysis.userStats.accountAge / 30)} months old. Still got that new developer smell!`);
  } else if (analysis.userStats.accountAge > 3650) {
    roasts.push(`Your GitHub account is ${Math.round(analysis.userStats.accountAge / 365)} years old. That's like a century in JavaScript framework years!`);
  }

  // Commit time patterns
  const commitTimeMax = Math.max(
    analysis.commitPatterns.timeOfDay.morning,
    analysis.commitPatterns.timeOfDay.afternoon,
    analysis.commitPatterns.timeOfDay.evening,
    analysis.commitPatterns.timeOfDay.night
  );
  
  if (analysis.commitPatterns.timeOfDay.night === commitTimeMax) {
    roasts.push("I see you're a night owl. Nothing says 'I make good decisions' like committing code at 3 AM!");
  }
  
  if (analysis.commitPatterns.dayOfWeek.Saturday + analysis.commitPatterns.dayOfWeek.Sunday > 
     (analysis.commitPatterns.dayOfWeek.Monday + analysis.commitPatterns.dayOfWeek.Tuesday + 
      analysis.commitPatterns.dayOfWeek.Wednesday + analysis.commitPatterns.dayOfWeek.Thursday + 
      analysis.commitPatterns.dayOfWeek.Friday) / 5) {
    roasts.push("Weekend commits? Your social life must be as empty as your test coverage.");
  }

  // Emoji usage
  if (analysis.emojiUsage.count > 10) {
    roasts.push(`${analysis.emojiUsage.count} emojis in your commits? Your code might be buggy, but your commits are definitely 🔥💯👌`);
  } else if (analysis.emojiUsage.count === 0) {
    roasts.push("Not a single emoji in your commits? You must be fun at parties.");
  }

  // Commit messages
  if (analysis.commitLanguage.shortMessages > analysis.userStats.publicContributions / 3) {
    roasts.push("Your commit messages are shorter than your attention span. 'fix', 'update', classic.");
  }
  
  if (analysis.commitLanguage.questionableMessages.length > 0) {
    const funnyMessage = analysis.commitLanguage.questionableMessages[Math.floor(Math.random() * analysis.commitLanguage.questionableMessages.length)];
    roasts.push(`"${funnyMessage}" - Shakespeare? No, just your commit message. Pure poetry.`);
  }

  // Repository patterns
  if (analysis.repoAnalysis.abandonedRepos > 0) {
    roasts.push(`${analysis.repoAnalysis.abandonedRepos} abandoned repos. Commitment issues much?`);
  }
  
  if (analysis.repoAnalysis.namingPatterns.includes('hasDemo') || analysis.repoAnalysis.namingPatterns.includes('hasTutorial')) {
    roasts.push("Another 'tutorial' repo? How many 'Hello World' apps does one person need?");
  }
  
  if (analysis.userStats.repoToStarRatio < 1) {
    roasts.push(`${analysis.userStats.repoToStarRatio.toFixed(1)} stars per repo. Even your mom forgot to star your projects.`);
  }

  // Follow ratio
  if (analysis.userStats.followRatio < 0.5) {
    roasts.push(`You follow ${user.following} people but only have ${user.followers} followers. Desperate much?`);
  } else if (analysis.userStats.followRatio > 5) {
    roasts.push(`${user.followers} followers? What are you, a GitHub influencer? #GitFluencer`);
  }

  return roasts;
}
