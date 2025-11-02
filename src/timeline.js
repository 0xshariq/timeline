import chalk from 'chalk';
import { GitHubProvider } from './providers/github.js';
import { GitLabProvider } from './providers/gitlab.js';
import { BitbucketProvider } from './providers/bitbucket.js';
import { SourceHutProvider } from './providers/sourcehut.js';
import { generateChart } from './chart.js';
import { calculateStats, formatStats } from './utils/stats.js';

const providers = {
  github: GitHubProvider,
  gitlab: GitLabProvider,
  bitbucket: BitbucketProvider,
  sourcehut: SourceHutProvider,
};

export async function generateTimeline(platform, username, repos = [], config = {}, spinner = null) {
  const ProviderClass = providers[platform];
  
  if (!ProviderClass) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const provider = new ProviderClass(username);
  const verbose = config.verbose !== false;

  if (spinner) {
    spinner.text = chalk.cyan(`Connecting to ${platform}...`);
  }

  // Get repositories
  let reposToProcess = repos;
  if (reposToProcess.length === 0) {
    if (spinner) {
      spinner.text = chalk.cyan('Fetching repositories...');
    }
    reposToProcess = await provider.fetchRepos();
    
    if (verbose) {
      spinner.info(chalk.blue(`Found ${chalk.bold(reposToProcess.length)} repositories`));
      spinner.start();
    }
  }

  // Fetch commits for each repository
  const datasets = [];
  let totalCommits = 0;
  let processedRepos = 0;
  
  for (const repo of reposToProcess) {
    processedRepos++;
    
    if (spinner) {
      spinner.text = chalk.cyan(`Processing ${chalk.bold(repo)} (${processedRepos}/${reposToProcess.length})`);
    }
    
    try {
      const commits = await provider.fetchAllCommits(repo, config);
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
        
        if (verbose) {
          spinner.info(chalk.green(`✓ ${chalk.bold(repo)}: ${commits.length} commits`));
          spinner.start();
        }
      }
    } catch (error) {
      if (verbose) {
        spinner.warn(chalk.yellow(`⚠ Skipped ${chalk.bold(repo)}: ${error.message}`));
        spinner.start();
      }
    }
  }

  if (datasets.length === 0) {
    throw new Error('No data to generate chart');
  }

  if (spinner) {
    spinner.text = chalk.cyan('Generating chart...');
  }
  
  // Generate chart
  await generateChart(username, platform, datasets, totalCommits, config.chartType || 'line');
  
  if (verbose && spinner) {
    spinner.info(chalk.blue(`Total commits analyzed: ${chalk.bold(totalCommits)}`));
    spinner.info(chalk.blue(`Repositories included: ${chalk.bold(datasets.length)}`));
    
    // Show statistics
    const stats = calculateStats(datasets);
    if (stats) {
      console.log('\n' + chalk.cyan(formatStats(stats)) + '\n');
    }
  }
}

function groupByDate(commits) {
  const map = {};
  for (const c of commits) {
    const date = c.date.slice(0, 10);
    map[date] = (map[date] || 0) + 1;
  }
  
  return Object.entries(map)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .reduce(
      (acc, [date, count]) => {
        acc.labels.push(date);
        acc.data.push(count);
        return acc;
      },
      { labels: [], data: [] }
    );
}
