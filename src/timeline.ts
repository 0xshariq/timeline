import chalk from 'chalk';
import type { Ora } from 'ora';
import { GitHubProvider } from './providers/github.js';
import { GitLabProvider } from './providers/gitlab.js';
import { BitbucketProvider } from './providers/bitbucket.js';
import { SourceHutProvider } from './providers/sourcehut.js';
import { generateChart } from './chart.js';
import { calculateStats, formatStats } from './utils/stats.js';
import type { Commit, ChartCustomization } from './types/index.js';

type Platform = 'github' | 'gitlab' | 'bitbucket' | 'sourcehut';
type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'heatmap' | 'polarArea' | 'scatter' | 'bubble' | 'mixed';

interface TimelineConfig {
  verbose?: boolean;
  includeMerges?: boolean;
  openChart?: boolean;
  chartType?: ChartType;
  chartOptions?: ChartCustomization;
}

type Provider = GitHubProvider | GitLabProvider | BitbucketProvider | SourceHutProvider;

const providers: Record<Platform, new (username: string, token?: string | null) => Provider> = {
  github: GitHubProvider,
  gitlab: GitLabProvider,
  bitbucket: BitbucketProvider,
  sourcehut: SourceHutProvider,
};

export async function generateTimeline(
  platform: Platform, 
  username: string, 
  repos: string[] = [], 
  config: TimelineConfig = {}, 
  spinner: Ora | null = null
): Promise<void> {
  const ProviderClass = providers[platform];
  
  if (!ProviderClass) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const provider = new ProviderClass(username);
  const verbose = config.verbose !== false;
  const chartType = config.chartType || 'line';  // Default to 'line' if not specified

  if (spinner) {
    spinner.text = chalk.cyan(`Connecting to ${platform}...`);
  }

  // Get repositories
  let reposToProcess = repos;
  if (reposToProcess.length === 0) {
    if (spinner) {
      spinner.text = chalk.cyan('Fetching repositories...');
    }
    
    try {
      const repositories = await provider.fetchRepositories(username);
      reposToProcess = repositories.map(r => r.name);
      
      if (!reposToProcess || reposToProcess.length === 0) {
        throw new Error(`No repositories found for user '${username}' on ${platform}`);
      }
      
      if (verbose && spinner) {
        spinner.info(chalk.blue(`Found ${chalk.bold(reposToProcess.length)} repositories`));
        spinner.start();
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch repositories: ${errorMsg}`);
    }
  }

  // Fetch commits for each repository
  const datasets = [];
  let totalCommits = 0;
  let processedRepos = 0;
  let skippedRepos = 0;
  const errors = [];
  
  for (const repo of reposToProcess) {
    processedRepos++;
    
    if (spinner) {
      spinner.text = chalk.cyan(`Processing ${chalk.bold(repo)} (${processedRepos}/${reposToProcess.length})`);
    }
    
    try {
      let commits = await provider.fetchCommits(username, repo, spinner);
      
      // Filter commits based on config
      if (config.includeMerges === false) {
        // Note: merge detection would need to be added to Commit interface
        // For now, we keep all commits
      }
      
      // Skip repositories with no commits
      if (!commits || commits.length === 0) {
        skippedRepos++;
        if (verbose && spinner) {
          spinner.warn(chalk.yellow(`⚠ Skipped ${chalk.bold(repo)}: No commits found`));
          spinner.start();
        }
        continue;
      }
      
      const grouped = groupByDate(commits);
      
      if (grouped.data.length > 0) {
        datasets.push({
          label: repo,
          data: grouped.data,
          labels: grouped.labels,
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
        });
        
        totalCommits += commits.length;
        
        if (verbose && spinner) {
          spinner.info(chalk.green(`✓ ${chalk.bold(repo)}: ${commits.length} commits`));
          spinner.start();
        }
      }
    } catch (error) {
      skippedRepos++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push({ repo, error: errorMsg });
      
      if (verbose && spinner) {
        spinner.warn(chalk.yellow(`⚠ Skipped ${chalk.bold(repo)}: ${errorMsg}`));
        spinner.start();
      }
    }
  }

  if (datasets.length === 0) {
    if (errors.length > 0) {
      throw new Error(`No data to generate chart. All repositories failed or are empty.`);
    }
    throw new Error('No repositories with commits found');
  }

  if (spinner) {
    spinner.text = chalk.cyan('Generating chart...');
  }
  
  console.log(`[DEBUG TIMELINE] Received chartType from config: ${config.chartType}`);
  console.log(`[DEBUG TIMELINE] Using chartType: ${chartType}`);
  
  // Generate chart and get the filename
  const outputFile = await generateChart(username, platform, datasets, totalCommits, chartType, config.chartOptions);
  
  if (verbose && spinner) {
    spinner.info(chalk.blue(`Chart saved to: ${chalk.bold(outputFile)}`));
    spinner.info(chalk.blue(`Total commits analyzed: ${chalk.bold(totalCommits)}`));
    spinner.info(chalk.blue(`Repositories included: ${chalk.bold(datasets.length)}`));
    if (skippedRepos > 0) {
      spinner.info(chalk.yellow(`Skipped repositories: ${chalk.bold(skippedRepos)}`));
    }
    
    // Show statistics
    const stats = calculateStats(datasets);
    if (stats) {
      console.log('\n' + chalk.cyan(formatStats(stats)) + '\n');
    }
  }
}

function groupByDate(commits: Commit[]): { labels: string[]; data: number[] } {
  const map: Record<string, number> = {};
  for (const c of commits) {
    const date = c.date.toISOString().slice(0, 10);
    map[date] = (map[date] || 0) + 1;
  }
  
  return Object.entries(map)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .reduce(
      (acc, [date, count]) => {
        acc.labels.push(date);
        acc.data.push(count as number);
        return acc;
      },
      { labels: [] as string[], data: [] as number[] }
    );
}
