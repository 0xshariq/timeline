#!/usr/bin/env node

import { Command } from 'commander';
import { input, select, confirm, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import gradient from 'gradient-string';
import boxen from 'boxen';
import { generateTimeline } from './timeline.js';
import { checkCanvasOnStartup } from './utils/canvas-fix.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

// Custom gradient theme
const titleGradient = gradient(['#FF6B6B', '#4ECDC4', '#45B7D1']);

const program = new Command();

function displayBanner() {
  const banner = `
╔═══════════════════════════════════════════╗
║   Repository Timeline Generator 📊        ║
║   Multi-Platform Git Analytics            ║
╚═══════════════════════════════════════════╝
  `;
  console.log(titleGradient(banner));
}

async function checkAndPromptForToken(platform) {
  const tokenConfig = {
    github: {
      envVar: 'GITHUB_TOKEN',
      name: 'GitHub',
      instructions: [
        '1. Go to https://github.com/settings/tokens',
        '2. Click "Generate new token (classic)"',
        '3. Select "public_repo" scope',
        '4. Copy the token (starts with ghp_)',
      ],
      limit: '60 → 5,000 requests/hour'
    },
    gitlab: {
      envVar: 'GITLAB_TOKEN',
      name: 'GitLab',
      instructions: [
        '1. Go to https://gitlab.com/-/user_settings/personal_access_tokens',
        '2. Create a token with "read_api" scope',
        '3. Copy the token',
      ],
      limit: 'Increases API rate limit'
    },
    bitbucket: {
      envVar: 'BITBUCKET_APP_PASSWORD',
      name: 'Bitbucket',
      instructions: [
        '1. Go to https://bitbucket.org/account/settings/app-passwords/',
        '2. Create an app password with "Repositories: Read" permission',
        '3. Copy the password',
      ],
      limit: 'Better rate limits'
    },
    sourcehut: {
      envVar: 'SOURCEHUT_TOKEN',
      name: 'SourceHut',
      instructions: [
        '1. Go to https://meta.sr.ht/oauth',
        '2. Create a personal access token',
        '3. Copy the token',
      ],
      limit: 'Required for API access'
    }
  };

  const config = tokenConfig[platform];
  if (!config) return;

  // Check if token is already set
  const existingToken = process.env[config.envVar];
  
  if (!existingToken) {
    console.log('\n' + boxen(
      chalk.yellow('⚠️  Authentication Token Not Found\n\n') +
      chalk.white(`${config.name} API works better with authentication\n`) +
      chalk.gray(`Benefit: ${config.limit}\n\n`) +
      chalk.cyan('How to get a token:\n') +
      config.instructions.map(i => chalk.gray('  ' + i)).join('\n'),
      {
        padding: 1,
        margin: 0,
        borderStyle: 'round',
        borderColor: 'yellow',
      }
    ));

    const shouldSetToken = await confirm({
      message: chalk.cyan(`Would you like to set a ${config.name} token now?`),
      default: true,
    });

    if (shouldSetToken) {
      const token = await input({
        message: chalk.cyan(`Enter your ${config.name} token:`),
        validate: (value) => {
          if (value.trim() === '') return 'Token cannot be empty (press Ctrl+C to skip)';
          return true;
        },
      });

      if (token && token.trim()) {
        process.env[config.envVar] = token.trim();
        console.log(chalk.green(`✓ Token set for this session!`));
        console.log(chalk.gray(`To make it permanent, add to your ~/.bashrc or ~/.zshrc:`));
        console.log(chalk.gray(`  export ${config.envVar}="${token.trim()}"`));
      }
    } else {
      console.log(chalk.yellow(`⚠️  Continuing without token (may hit rate limits)`));
    }
    console.log('');
  } else {
    console.log(chalk.green(`✓ ${config.name} token found`));
  }
}

async function interactiveMode(options) {
  displayBanner();

  // Check canvas availability and rebuild if needed
  try {
    await checkCanvasOnStartup();
  } catch (error) {
    process.exit(1);
  }

  // Select platform if not provided
  let platform = options.platform;
  if (!platform) {
    platform = await select({
      message: chalk.cyan('Select Git platform:'),
      choices: [
        {
          name: chalk.white('🐙 GitHub'),
          value: 'github',
          description: 'Most popular platform'
        },
        {
          name: chalk.white('🦊 GitLab'),
          value: 'gitlab',
          description: 'Open source alternative'
        },
        {
          name: chalk.white('🪣 Bitbucket'),
          value: 'bitbucket',
          description: 'Atlassian product'
        },
        {
          name: chalk.white('🎯 SourceHut'),
          value: 'sourcehut',
          description: 'Minimal and fast'
        },
      ],
    });
    console.log(chalk.gray(`Selected: ${platform}`));
  }

  // Check for authentication token based on platform
  await checkAndPromptForToken(platform);

  // Get username if not provided
  let username = options.username;
  if (!username) {
    username = await input({
      message: chalk.cyan('Enter username:'),
      validate: (value) => {
        if (value.trim() === '') return 'Username is required';
        if (!/^[a-zA-Z0-9_-]+$/.test(value.trim())) {
          return 'Username can only contain letters, numbers, hyphens, and underscores';
        }
        return true;
      },
    });
  }
  console.log(chalk.gray(`User: ${username.trim()}`));

  // Ask for specific repos or all
  let repoList = [];
  if (options.repos) {
    repoList = options.repos.split(',').map(r => r.trim()).filter(r => r);
  } else if (!options.all) {
    const useAllRepos = await confirm({
      message: chalk.cyan('Analyze all repositories?'),
      default: true,
    });

    if (!useAllRepos) {
      const reposInput = await input({
        message: chalk.cyan('Enter repository names (comma-separated):'),
        validate: (value) => value.trim() !== '' || 'Please enter at least one repository name',
      });
      repoList = reposInput.split(',').map(r => r.trim()).filter(r => r);
      console.log(chalk.gray(`Repositories: ${repoList.join(', ')}`));
    }
  }

  // Select chart type if not provided
  let chartType = options.chart || options.type;
  if (!chartType) {
    chartType = await select({
      message: chalk.cyan('Select chart type:'),
      choices: [
        {
          name: chalk.white('📈 Line Chart'),
          value: 'line',
          description: 'Timeline of commits over time'
        },
        {
          name: chalk.white('📊 Bar Chart'),
          value: 'bar',
          description: 'Compare commits across repositories'
        },
        {
          name: chalk.white('🥧 Pie Chart'),
          value: 'pie',
          description: 'Repository contribution percentage'
        },
        {
          name: chalk.white('🍩 Doughnut Chart'),
          value: 'doughnut',
          description: 'Like pie chart with center hole'
        },
        {
          name: chalk.white('📡 Radar Chart'),
          value: 'radar',
          description: 'Multi-dimensional comparison'
        },
        {
          name: chalk.white('🔥 Heatmap'),
          value: 'heatmap',
          description: 'Activity calendar (GitHub-style)'
        },
      ],
    });
  }
  console.log(chalk.gray(`Chart type: ${chartType}`));

  // Additional options
  let optionsList = [];
  if (!options.verbose && !options.quiet && !options.noMerge && !options.open) {
    optionsList = await checkbox({
      message: chalk.cyan('Select options:'),
      choices: [
        {
          name: 'Show detailed progress',
          value: 'verbose',
          checked: true
        },
        {
          name: 'Include merge commits',
          value: 'includeMerges',
          checked: true
        },
        {
          name: 'Open chart after generation',
          value: 'openChart',
          checked: false
        },
      ],
    });
  }

  const config = {
    verbose: options.verbose || optionsList.includes('verbose') || !options.quiet,
    includeMerges: options.noMerge ? false : (optionsList.includes('includeMerges') || true),
    openChart: options.open || optionsList.includes('openChart'),
    chartType: chartType,
  };

  console.log('\n' + chalk.yellow('━'.repeat(50)) + '\n');

  // Generate timeline with spinner
  const spinner = ora({
    text: chalk.cyan('Initializing...'),
    color: 'cyan',
    spinner: 'dots12',
  }).start();

  try {
    await generateTimeline(platform, username.trim(), repoList, config, spinner);

    spinner.succeed(chalk.green('Timeline generated successfully!'));

    // Display success message in a box
    const chartTypeLabel = {
      line: 'Line Chart',
      bar: 'Bar Chart',
      pie: 'Pie Chart',
      doughnut: 'Doughnut Chart',
      radar: 'Radar Chart',
      heatmap: 'Heatmap'
    }[chartType] || 'Chart';

    const filename = `timeline-${chartType}.png`;

    const successMessage = boxen(
      chalk.green.bold('✨ Chart saved as ') +
      chalk.white.bold(filename) +
      chalk.green.bold(' ✨\n\n') +
      chalk.gray(`Type: ${chartTypeLabel}\n`) +
      chalk.gray('You can find it in the current directory'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green',
        backgroundColor: '#1a1a1a',
      }
    );

    console.log('\n' + successMessage);

    // Open chart if requested
    if (config.openChart) {
      const { exec } = await import('child_process');
      exec(`xdg-open ${filename} || open ${filename} || start ${filename}`);
    }

  } catch (error) {
    spinner.fail(chalk.red('Failed to generate timeline'));

    console.log('\n' + boxen(chalk.red.bold('❌ Error: ') + chalk.white(error.message), {
      padding: 0.5,
      margin: 0.5,
      borderStyle: 'round',
      borderColor: 'red',
    }));

    process.exit(1);
  }
}

// Configure the main program
program
  .name('timeline')
  .description('Generate beautiful commit timeline charts for Git repositories')
  .version(packageJson.version)
  .addHelpText('before', titleGradient(`
╔═══════════════════════════════════════════╗
║   Repository Timeline Generator 📊        ║
║   Multi-Platform Git Analytics            ║
╚═══════════════════════════════════════════╝
`))
  .addHelpText('after', `
${chalk.cyan.bold('Examples:')}
  ${chalk.gray('# Interactive mode (recommended)')}
  $ timeline

  ${chalk.gray('# Quick generation')}
  $ timeline quick -p github -u octocat

  ${chalk.gray('# With specific options')}
  $ timeline -p gitlab -u johndoe -t pie --verbose

  ${chalk.gray('# Specific repositories')}
  $ timeline -p github -u alice -r "repo1,repo2"

  ${chalk.gray('# All repos with bar chart')}
  $ timeline --all -p bitbucket -u bob -t bar

  ${chalk.gray('# Exclude merge commits')}
  $ timeline -p github -u charlie --no-merge

  ${chalk.gray('# Open chart automatically')}
  $ timeline -p github -u dave -t heatmap --open

${chalk.cyan.bold('Supported Platforms:')}
  ${chalk.white('🐙 github     - GitHub (https://github.com)')}
  ${chalk.white('🦊 gitlab     - GitLab (https://gitlab.com)')}
  ${chalk.white('🪣 bitbucket  - Bitbucket (https://bitbucket.org)')}
  ${chalk.white('🎯 sourcehut  - SourceHut (https://sr.ht)')}

${chalk.cyan.bold('Chart Types:')}
  ${chalk.white('📈 line      - Timeline of commits over time')}
  ${chalk.white('📊 bar       - Compare commits across repositories')}
  ${chalk.white('🥧 pie       - Repository contribution percentage')}
  ${chalk.white('🍩 doughnut  - Like pie chart with center hole')}
  ${chalk.white('📡 radar     - Multi-dimensional comparison')}
  ${chalk.white('🔥 heatmap   - Activity calendar (GitHub-style)')}

${chalk.cyan.bold('More Info:')}
  Documentation: ${chalk.blue('https://github.com/0xshariq/timeline#readme')}
  Issues: ${chalk.blue('https://github.com/0xshariq/timeline/issues')}
`)
  .option('-p, --platform <platform>', 'Git platform (github, gitlab, bitbucket, sourcehut)')
  .option('-u, --username <username>', 'Username on the platform')
  .option('-r, --repos <repos>', 'Comma-separated repository names')
  .option('-a, --all', 'Analyze all repositories')
  .option('-t, --type <type>', 'Chart type (line, bar, pie, doughnut, radar, heatmap)', 'line')
  .option('-c, --chart <type>', 'Alias for --type')
  .option('-v, --verbose', 'Show detailed progress')
  .option('-q, --quiet', 'Minimal output')
  .option('--no-merge', 'Exclude merge commits')
  .option('-o, --open', 'Open chart after generation')
  .action(async (options) => {
    try {
      await interactiveMode(options);
    } catch (error) {
      if (error.name === 'ExitPromptError') {
        console.log('\n' + boxen(chalk.yellow('👋 Cancelled by user'), {
          padding: 0.5,
          margin: 0.5,
          borderStyle: 'round',
          borderColor: 'yellow',
        }));
        process.exit(0);
      }
      throw error;
    }
  });

// Subcommand: generate (alias for main command with more options)
program
  .command('generate')
  .description('Generate a timeline chart (interactive mode)')
  .option('-p, --platform <platform>', 'Git platform')
  .option('-u, --username <username>', 'Username')
  .option('-r, --repos <repos>', 'Repository names')
  .option('-t, --type <type>', 'Chart type', 'line')
  .addHelpText('after', `
${chalk.cyan('Example:')}
  $ timeline generate -p github -u octocat
  $ timeline generate
`)
  .action(async (options) => {
    await interactiveMode(options);
  });

// Subcommand: list platforms
program
  .command('platforms')
  .alias('platform')
  .description('List supported Git platforms')
  .addHelpText('after', `
${chalk.cyan('Usage:')}
  $ timeline platforms
`)
  .action(() => {
    console.log(chalk.cyan.bold('\n📦 Supported Platforms:\n'));
    console.log(chalk.white('  🐙 github     - GitHub (https://github.com)'));
    console.log(chalk.white('     API: REST API v3'));
    console.log(chalk.white('     Rate Limit: 60 requests/hour (unauthenticated)\n'));
    
    console.log(chalk.white('  🦊 gitlab     - GitLab (https://gitlab.com)'));
    console.log(chalk.white('     API: REST API v4'));
    console.log(chalk.white('     Rate Limit: 10 requests/second\n'));
    
    console.log(chalk.white('  🪣 bitbucket  - Bitbucket (https://bitbucket.org)'));
    console.log(chalk.white('     API: REST API 2.0'));
    console.log(chalk.white('     Rate Limit: Varies\n'));
    
    console.log(chalk.white('  🎯 sourcehut  - SourceHut (https://sr.ht)'));
    console.log(chalk.white('     API: GraphQL API'));
    console.log(chalk.white('     Rate Limit: Check documentation\n'));
    
    console.log(chalk.gray('Use: timeline -p <platform> -u <username>'));
    console.log();
  });

// Subcommand: list chart types
program
  .command('charts')
  .alias('chart')
  .description('List available chart types')
  .addHelpText('after', `
${chalk.cyan('Usage:')}
  $ timeline charts
  $ timeline -t <chart-type>
`)
  .action(() => {
    console.log(chalk.cyan.bold('\n📊 Available Chart Types:\n'));
    
    console.log(chalk.white('  📈 line      - Timeline of commits over time'));
    console.log(chalk.gray('     Best for: Seeing activity patterns and trends'));
    console.log(chalk.gray('     Output: timeline-line.png\n'));
    
    console.log(chalk.white('  📊 bar       - Compare commits across repositories'));
    console.log(chalk.gray('     Best for: Repository comparison, portfolio'));
    console.log(chalk.gray('     Output: timeline-bar.png\n'));
    
    console.log(chalk.white('  🥧 pie       - Repository contribution percentage'));
    console.log(chalk.gray('     Best for: Understanding project distribution'));
    console.log(chalk.gray('     Output: timeline-pie.png\n'));
    
    console.log(chalk.white('  🍩 doughnut  - Like pie chart with center hole'));
    console.log(chalk.gray('     Best for: Modern looking distribution charts'));
    console.log(chalk.gray('     Output: timeline-doughnut.png\n'));
    
    console.log(chalk.white('  📡 radar     - Multi-dimensional comparison'));
    console.log(chalk.gray('     Best for: Comparing top 6 repositories'));
    console.log(chalk.gray('     Output: timeline-radar.png\n'));
    
    console.log(chalk.white('  🔥 heatmap   - Activity calendar (GitHub-style)'));
    console.log(chalk.gray('     Best for: Daily activity patterns (365 days)'));
    console.log(chalk.gray('     Output: timeline-heatmap.png\n'));
    
    console.log(chalk.gray('Example: timeline -t pie -p github -u octocat'));
    console.log();
  });

// Subcommand: quick
program
  .command('quick')
  .description('Quick generation with minimal prompts')
  .requiredOption('-p, --platform <platform>', 'Git platform (github, gitlab, bitbucket, sourcehut)')
  .requiredOption('-u, --username <username>', 'Username on the selected platform')
  .option('-t, --type <type>', 'Chart type (line, bar, pie, doughnut, radar, heatmap)', 'line')
  .option('--no-merge', 'Exclude merge commits from analysis')
  .addHelpText('before', chalk.cyan('\nQuick mode for fast, non-interactive chart generation\n'))
  .addHelpText('after', `
${chalk.cyan('Examples:')}
  ${chalk.gray('# Generate line chart for GitHub user')}
  $ timeline quick -p github -u octocat

  ${chalk.gray('# Generate pie chart for GitLab user')}
  $ timeline quick -p gitlab -u johndoe -t pie

  ${chalk.gray('# Bar chart without merge commits')}
  $ timeline quick -p bitbucket -u alice -t bar --no-merge

${chalk.yellow('Note:')} This mode automatically processes all repositories with default settings.
`)
  .action(async (options) => {
    displayBanner();

    const config = {
      verbose: true,
      includeMerges: options.merge,
      openChart: false,
      chartType: options.type || 'line',
    };

    console.log(chalk.gray(`Platform: ${options.platform}`));
    console.log(chalk.gray(`User: ${options.username}`));
    console.log(chalk.gray(`Chart: ${config.chartType}`));
    console.log('\n' + chalk.yellow('━'.repeat(50)) + '\n');

    const spinner = ora({
      text: chalk.cyan('Initializing...'),
      color: 'cyan',
      spinner: 'dots12',
    }).start();

    try {
      await generateTimeline(options.platform, options.username, [], config, spinner);
      spinner.succeed(chalk.green('Timeline generated successfully!'));
      console.log(chalk.green(`\n✨ Chart saved as timeline-${config.chartType}.png\n`));
    } catch (error) {
      spinner.fail(chalk.red('Failed'));
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// Subcommand: config
program
  .command('config')
  .alias('info')
  .description('Show current configuration')
  .addHelpText('after', `
${chalk.cyan('Usage:')}
  $ timeline config
  $ timeline info
`)
  .action(() => {
    console.log(chalk.cyan.bold('\n⚙️  Configuration:\n'));
    console.log(chalk.white('  Package:    ' + chalk.bold(packageJson.name)));
    console.log(chalk.white('  Version:    ' + chalk.bold(packageJson.version)));
    console.log(chalk.white('  Node:       ' + chalk.bold(process.version)));
    console.log(chalk.white('  Platform:   ' + chalk.bold(process.platform)));
    console.log(chalk.white('  Arch:       ' + chalk.bold(process.arch)));
    console.log(chalk.white('\n  Repository: ' + chalk.blue(packageJson.repository.url)));
    console.log(chalk.white('  Homepage:   ' + chalk.blue(packageJson.homepage)));
    console.log();
  });

// Subcommand: examples
program
  .command('examples')
  .description('Show usage examples')
  .action(() => {
    console.log(chalk.cyan.bold('\n📚 Usage Examples:\n'));
    console.log(chalk.white('  # Interactive mode (recommended)'));
    console.log(chalk.gray('  $ timeline\n'));

    console.log(chalk.white('  # Quick generation'));
    console.log(chalk.gray('  $ timeline quick -p github -u 0xshariq -t line\n'));

    console.log(chalk.white('  # With specific options'));
    console.log(chalk.gray('  $ timeline -p gitlab -u 0xshariq -t pie --verbose\n'));

    console.log(chalk.white('  # Specific repositories'));
    console.log(chalk.gray('  $ timeline -p github -u 0xshariq -r "repo1,repo2,repo3"\n'));

    console.log(chalk.white('  # All repos with bar chart'));
    console.log(chalk.gray('  $ timeline -p bitbucket -u 0xshariq --all -t bar\n'));

    console.log(chalk.white('  # Exclude merge commits'));
    console.log(chalk.gray('  $ timeline -p github -u 0xshariq --no-merge\n'));

    console.log(chalk.white('  # Open chart automatically'));
    console.log(chalk.gray('  $ timeline -p github -u 0xshariq -t heatmap --open\n'));

    console.log();
  });

program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  interactiveMode({}).catch(error => {
    if (error.name === 'ExitPromptError') {
      console.log('\n' + boxen(chalk.yellow('👋 Cancelled by user'), {
        padding: 0.5,
        margin: 0.5,
        borderStyle: 'round',
        borderColor: 'yellow',
      }));
      process.exit(0);
    }
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
    process.exit(1);
  });
}
