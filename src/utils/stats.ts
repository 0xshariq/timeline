// Statistics and analytics utilities

interface Dataset {
  label: string;
  data: number[];
  labels?: string[];
}

interface StatsResult {
  totalCommits: number;
  repositoriesAnalyzed: number;
  dateRange: {
    start: string | null;
    end: string | null;
    days: number;
  };
  topRepos: Array<{ name: string; commits: number }>;
  averageCommitsPerRepo: number;
  averageCommitsPerDay: number;
}

export function calculateStats(datasets: Dataset[]): StatsResult | null {
  if (!datasets || datasets.length === 0) {
    return null;
  }

  const stats = {
    totalCommits: 0,
    repositoriesAnalyzed: datasets.length,
    dateRange: {
      start: null,
      end: null,
      days: 0,
    },
    topRepos: [],
    averageCommitsPerRepo: 0,
    averageCommitsPerDay: 0,
  };

  // Calculate total commits and find date range
  let allDates = [];
  
  datasets.forEach((dataset) => {
    const commits = dataset.data.reduce((sum, count) => sum + count, 0);
    stats.totalCommits += commits;
    
    stats.topRepos.push({
      name: dataset.label,
      commits: commits,
    });
    
    if (dataset.labels) {
      allDates.push(...dataset.labels);
    }
  });

  // Sort top repos
  stats.topRepos.sort((a, b) => b.commits - a.commits);
  stats.topRepos = stats.topRepos.slice(0, 5); // Top 5

  // Calculate date range
  if (allDates.length > 0) {
    allDates = [...new Set(allDates)].sort();
    stats.dateRange.start = allDates[0];
    stats.dateRange.end = allDates[allDates.length - 1];
    
    const startDate = new Date(stats.dateRange.start);
    const endDate = new Date(stats.dateRange.end);
    stats.dateRange.days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Calculate averages
  stats.averageCommitsPerRepo = Math.round(stats.totalCommits / stats.repositoriesAnalyzed);
  if (stats.dateRange.days > 0) {
    stats.averageCommitsPerDay = parseFloat((stats.totalCommits / stats.dateRange.days).toFixed(2));
  }

  return stats;
}

export function formatStats(stats: StatsResult | null): string {
  if (!stats) return '';

  const lines = [
    `📊 Statistics Summary`,
    `─────────────────────`,
    `Total Commits: ${stats.totalCommits}`,
    `Repositories: ${stats.repositoriesAnalyzed}`,
    `Date Range: ${stats.dateRange.start} to ${stats.dateRange.end} (${stats.dateRange.days} days)`,
    `Average per Repo: ${stats.averageCommitsPerRepo} commits`,
    `Average per Day: ${stats.averageCommitsPerDay} commits`,
    ``,
    `🏆 Top Repositories:`,
  ];

  stats.topRepos.forEach((repo, index) => {
    lines.push(`  ${index + 1}. ${repo.name}: ${repo.commits} commits`);
  });

  return lines.join('\n');
}
