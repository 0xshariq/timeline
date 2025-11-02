#!/usr/bin/env node

import { input, select, confirm, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import gradient from 'gradient-string';
import boxen from 'boxen';
import { generateTimeline } from './timeline.js';

// Custom gradient theme
const titleGradient = gradient(['#FF6B6B', '#4ECDC4', '#45B7D1']);
const successGradient = gradient(['#06D6A0', '#118AB2']);

function displayBanner() {
  const banner = `
╔═══════════════════════════════════════════╗
║   Repository Timeline Generator 📊        ║
║   Multi-Platform Git Analytics            ║
╚═══════════════════════════════════════════╝
  `;
  console.log(titleGradient(banner));
}

async function run() {
  try {
    displayBanner();
    
    // Select platform
    const platform = await select({
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

    console.log(chalk.gray(`\nSelected: ${platform}`));

    // Get username
    const username = await input({
      message: chalk.cyan('Enter username:'),
      validate: (value) => {
        if (value.trim() === '') return 'Username is required';
        if (!/^[a-zA-Z0-9_-]+$/.test(value.trim())) {
          return 'Username can only contain letters, numbers, hyphens, and underscores';
        }
        return true;
      },
    });

    console.log(chalk.gray(`User: ${username.trim()}`));

    // Ask for specific repos or all
    const useAllRepos = await confirm({
      message: chalk.cyan('Analyze all repositories?'),
      default: true,
    });

    let repoList = [];
    
    if (!useAllRepos) {
      const reposInput = await input({
        message: chalk.cyan('Enter repository names (comma-separated):'),
        validate: (value) => value.trim() !== '' || 'Please enter at least one repository name',
      });
      repoList = reposInput.split(',').map(r => r.trim()).filter(r => r);
      console.log(chalk.gray(`Repositories: ${repoList.join(', ')}`));
    }

    // Select chart type
    const chartType = await select({
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

    console.log(chalk.gray(`Chart type: ${chartType}`));

    // Additional options
    console.log('');
    const options = await checkbox({
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

    const config = {
      verbose: options.includes('verbose'),
      includeMerges: options.includes('includeMerges'),
      openChart: options.includes('openChart'),
      chartType: chartType,
    };

    console.log('\n' + chalk.yellow('━'.repeat(50)) + '\n');

    // Generate timeline with spinner
    const spinner = ora({
      text: chalk.cyan('Initializing...'),
      color: 'cyan',
      spinner: 'dots12',
    }).start();

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
    if (error.name === 'ExitPromptError') {
      console.log('\n' + boxen(chalk.yellow('👋 Cancelled by user'), {
        padding: 0.5,
        margin: 0.5,
        borderStyle: 'round',
        borderColor: 'yellow',
      }));
      process.exit(0);
    }
    
    console.log('\n' + boxen(chalk.red.bold('❌ Error: ') + chalk.white(error.message), {
      padding: 0.5,
      margin: 0.5,
      borderStyle: 'round',
      borderColor: 'red',
    }));
    
    process.exit(1);
  }
}

run();
