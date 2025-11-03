#!/usr/bin/env node

import { Command } from 'commander';
import { input, select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import gradient from 'gradient-string';
import boxen from 'boxen';
import { generateTimeline } from './timeline.js';
import { checkCanvasOnStartup } from './utils/canvas-fix.js';
import { loadConfig, updateConfig, resetConfig, getConfigPath } from './utils/config.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import modular CLI components
import { displayBanner } from './cli/display.js';
import { checkAndPromptForToken } from './cli/tokens.js';
import {
  promptForPlatform,
  promptForUsername,
  promptForRepositories,
  promptForChartType,
  promptForBasicOptions,
  promptForCustomization
} from './cli/prompts.js';
import { showPlatforms, showChartTypes, showPackageInfo, showExamples } from './cli/commands.js';
import type { Platform, ChartType, CommandOptions } from './types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

// Custom gradient theme
const titleGradient = gradient(['#FF6B6B', '#4ECDC4', '#45B7D1']);

const program = new Command();

/**
 * Interactive mode - Main flow for timeline generation
 */
async function interactiveMode(options: CommandOptions): Promise<void> {
  displayBanner();

  // Load saved config
  const savedConfig = loadConfig();

  // Check canvas availability and rebuild if needed
  try {
    await checkCanvasOnStartup();
  } catch (error) {
    process.exit(1);
  }

  // Use modular prompts  
  const platform = options.platform || savedConfig.defaultPlatform || await promptForPlatform(savedConfig.defaultPlatform);
  await checkAndPromptForToken(platform);

  const username = options.username || savedConfig.defaultUsername || await promptForUsername(savedConfig.defaultUsername);

  // Handle repositories
  let repoList: string[] = [];
  if (options.repos) {
    repoList = options.repos.split(',').map(r => r.trim()).filter(r => r);
  } else if (!options.all) {
    const repoResult = await promptForRepositories();
    repoList = repoResult.selectAll ? [] : repoResult.repos;
  }

  const chartType = options.chart || options.type || await promptForChartType();
  console.log(`[DEBUG CLI] Selected chart type: ${chartType}`);

  const basicOptions = await promptForBasicOptions();
  const customization = await promptForCustomization(chartType);

  // Build chart customization options
  const chartOptions = {
    colors: options.colors ? options.colors.split(',').map(c => c.trim()) : customization.colors,
    useGradient: options.gradient || customization.useGradient || false,
    gradientColors: (options.gradientStart || options.gradientEnd || customization.gradientStart || customization.gradientEnd) ? {
      start: options.gradientStart || customization.gradientStart || '#667eea',
      end: options.gradientEnd || customization.gradientEnd || '#764ba2',
    } : undefined,
    borderWidth: options.borderWidth || customization.borderWidth,
    borderColor: options.borderColor,
    animate: options.animate !== false && !(customization.advancedOptions?.includes('noAnimate')),
    animationDuration: options.animationDuration,
    animationEasing: options.animationEasing as any,
    scaleType: options.scaleType as any,
    beginAtZero: options.zero !== false,
    showGridLines: options.grid !== false && !(customization.advancedOptions?.includes('noGrid')),
    showLabels: options.labels !== false,
    labelFontSize: options.labelSize || customization.labelSize,
    labelColor: options.labelColor,
    showTooltips: options.tooltips !== false,
    tooltipBackgroundColor: options.tooltipBg,
    showLegend: options.legend !== false,
    legendPosition: (options.legendPosition || customization.legendPosition) as any,
    // Plugins
    enableExport: options.exportEnabled || customization.advancedOptions?.includes('export') || false,
    enableAnnotations: options.annotationsEnabled || customization.advancedOptions?.includes('annotations') || false,
    enableZoom: options.zoomEnabled || customization.advancedOptions?.includes('zoom') || false,
  };

  const config = {
    verbose: options.verbose || basicOptions.includes('verbose') || !options.quiet,
    includeMerges: options.noMerge ? false : basicOptions.includes('includeMerges'),
    openChart: options.open || basicOptions.includes('openChart'),
    chartType: chartType,
    chartOptions: chartOptions,
  };

  console.log(`[DEBUG CLI] Config chartType: ${config.chartType}`);

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
    const chartTypeLabel: Record<string, string> = {
      // 2D Charts
      line: 'Line Chart',
      bar: 'Bar Chart',
      pie: 'Pie Chart',
      doughnut: 'Doughnut Chart',
      radar: 'Radar Chart',
      heatmap: 'Heatmap',
      polarArea: 'Polar Area Chart',
      scatter: 'Scatter Chart',
      bubble: 'Bubble Chart',
      mixed: 'Mixed Chart',
      // 3D Charts
      line3d: '3D Line Chart',
      bar3d: '3D Bar Chart',
      scatter3d: '3D Scatter Chart',
      surface3d: '3D Surface Chart',
      bubble3d: '3D Bubble Chart',
    };
    const typeLabel = chartTypeLabel[chartType] || 'Chart';
    const is3DChart = ['bar3d', 'line3d', 'scatter3d', 'surface3d', 'bubble3d'].includes(chartType);

    const filename = `charts/timeline-${chartType}.png`;

    const successMessage = boxen(
      chalk.green.bold('✨ Chart saved as ') +
      chalk.white.bold(filename) +
      chalk.green.bold(' ✨\n\n') +
      chalk.gray(`Type: ${typeLabel}${is3DChart ? ' (Three.js)' : ''}\n`) +
      chalk.gray('You can find it in the charts/ directory'),
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
    if (spinner && spinner.isSpinning) {
      spinner.fail(chalk.red('Failed to generate timeline'));
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Provide helpful error messages
    let helpText = '';
    if (errorMessage.includes('No repositories found')) {
      helpText = '\n' + chalk.yellow('Tip: Make sure the username is correct and has public repositories.');
    } else if (errorMessage.includes('authentication') || errorMessage.includes('token')) {
      helpText = '\n' + chalk.yellow('Tip: You may need to set up an API token for private repositories.');
    } else if (errorMessage.includes('rate limit')) {
      helpText = '\n' + chalk.yellow('Tip: API rate limit reached. Try again later or use an API token.');
    } else if (errorMessage.includes('network') || errorMessage.includes('ENOTFOUND')) {
      helpText = '\n' + chalk.yellow('Tip: Check your internet connection and try again.');
    }
    
    console.log('\n' + boxen(
      chalk.red.bold('❌ Error: ') + chalk.white(errorMessage) + helpText, 
      {
        padding: 0.5,
        margin: 0.5,
        borderStyle: 'round',
        borderColor: 'red',
      }
    ));

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

${chalk.cyan.bold('2D Chart Types:')}
  ${chalk.white('📈 line      - Timeline of commits over time')}
  ${chalk.white('📊 bar       - Compare commits across repositories')}
  ${chalk.white('🥧 pie       - Repository contribution percentage')}
  ${chalk.white('🍩 doughnut  - Like pie chart with center hole')}
  ${chalk.white('📡 radar     - Multi-dimensional comparison')}
  ${chalk.white('🔥 heatmap   - Activity calendar (GitHub-style)')}

${chalk.cyan.bold('3D Chart Types:')}
  ${chalk.white('🎲 bar3d     - 3D bar chart (Three.js)')}
  ${chalk.white('📈 line3d    - 3D line chart (Three.js)')}
  ${chalk.white('🔮 scatter3d - 3D scatter plot (Three.js)')}
  ${chalk.white('🌊 surface3d - 3D surface chart (Three.js)')}
  ${chalk.white('💫 bubble3d  - 3D bubble chart (Three.js)')}

${chalk.cyan.bold('More Info:')}
  Documentation: ${chalk.blue('https://github.com/0xshariq/timeline#readme')}
  Issues: ${chalk.blue('https://github.com/0xshariq/timeline/issues')}
`)
  .option('-p, --platform <platform>', 'Git platform (github, gitlab, bitbucket, sourcehut)')
  .option('-u, --username <username>', 'Username on the platform')
  .option('-r, --repos <repos>', 'Comma-separated repository names')
  .option('-a, --all', 'Analyze all repositories')
  .option('-t, --type <type>', 'Chart type (2D: line, bar, pie, doughnut, radar, heatmap, polarArea, scatter, bubble, mixed | 3D: line3d, bar3d, scatter3d, surface3d, bubble3d)')
  .option('-c, --chart <type>', 'Alias for --type')
  .option('-v, --verbose', 'Show detailed progress')
  .option('-q, --quiet', 'Minimal output')
  .option('--no-merge', 'Exclude merge commits')
  .option('-o, --open', 'Open chart after generation')
  // Chart Customization Options
  .option('--colors <colors>', 'Custom colors (comma-separated hex codes, e.g., #FF5733,#33FF57)')
  .option('--gradient', 'Enable gradient colors')
  .option('--gradient-start <color>', 'Gradient start color (hex code)')
  .option('--gradient-end <color>', 'Gradient end color (hex code)')
  .option('--border-width <width>', 'Border width (number, default: 2)', parseInt)
  .option('--border-color <color>', 'Border color (hex code)')
  .option('--no-animate', 'Disable animations')
  .option('--animation-duration <ms>', 'Animation duration in milliseconds', parseInt)
  .option('--animation-easing <easing>', 'Animation easing (linear, easeInQuad, easeOutQuad, easeInOutQuad, etc.)')
  .option('--scale-type <type>', 'Scale type (linear, logarithmic, time)')
  .option('--no-zero', 'Don\'t begin Y-axis at zero')
  .option('--no-grid', 'Hide grid lines')
  .option('--no-labels', 'Hide labels')
  .option('--label-size <size>', 'Label font size', parseInt)
  .option('--label-color <color>', 'Label color (hex code)')
  .option('--no-tooltips', 'Disable tooltips')
  .option('--tooltip-bg <color>', 'Tooltip background color')
  .option('--no-legend', 'Hide legend')
  .option('--legend-position <position>', 'Legend position (top, bottom, left, right)')
  .action(async (options) => {
    try {
      await interactiveMode(options);
    } catch (error) {
      if (error instanceof Error && error.name === 'ExitPromptError') {
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
    showPlatforms();
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
    showChartTypes();
  });

// Subcommand: quick
program
  .command('quick')
  .description('Quick generation with minimal prompts')
  .requiredOption('-p, --platform <platform>', 'Git platform (github, gitlab, bitbucket, sourcehut)')
  .requiredOption('-u, --username <username>', 'Username on the selected platform')
  .option('-t, --type <type>', 'Chart type (2D: line, bar, pie, doughnut, radar, heatmap, polarArea, scatter, bubble, mixed | 3D: line3d, bar3d, scatter3d, surface3d, bubble3d)', 'line')
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

  ${chalk.gray('# 3D bar chart with Three.js')}
  $ timeline quick -p github -u bob -t bar3d

${chalk.yellow('Note:')} This mode automatically processes all repositories with default settings.
`)
  .action(async (options) => {
    displayBanner();

    // Check canvas availability and rebuild if needed
    try {
      await checkCanvasOnStartup();
    } catch (error) {
      process.exit(1);
    }

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
      console.log(chalk.green(`\n✨ Chart saved as charts/timeline-${config.chartType}.png\n`));
    } catch (error) {
      spinner.fail(chalk.red('Failed'));
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`\n❌ Error: ${errorMessage}\n`));
      process.exit(1);
    }
  });

// Subcommand: config
program
  .command('config')
  .description('Manage user configuration')
  .addHelpText('after', `
${chalk.cyan('Usage:')}
  $ timeline config               ${chalk.gray('# Show current config')}
  $ timeline config set           ${chalk.gray('# Set default values interactively')}
  $ timeline config reset         ${chalk.gray('# Reset to defaults')}
  $ timeline config show          ${chalk.gray('# Show saved config')}
`)
  .action(async () => {
    const savedConfig = loadConfig();
    console.log(chalk.cyan.bold('\n⚙️  Saved Configuration:\n'));
    console.log(chalk.white('  Config file: ' + chalk.gray(getConfigPath())));
    console.log(chalk.white('  Default platform:   ' + chalk.bold(savedConfig.defaultPlatform || chalk.gray('not set'))));
    console.log(chalk.white('  Default username:   ' + chalk.bold(savedConfig.defaultUsername || chalk.gray('not set'))));
    console.log(chalk.white('  Default chart type: ' + chalk.bold(savedConfig.defaultChartType || chalk.gray('not set'))));
    console.log(chalk.white('  Auto-open charts:   ' + chalk.bold(savedConfig.autoOpen ? 'Yes' : 'No')));
    console.log(chalk.white('  Verbose mode:       ' + chalk.bold(savedConfig.verbose ? 'Yes' : 'No')));
    console.log(chalk.gray('\n  Use "timeline config set" to change these values'));
    console.log();
  });

program
  .command('config:set')
  .description('Set default configuration values')
  .action(async () => {
    console.log(chalk.cyan.bold('\n⚙️  Set Default Configuration\n'));

    const platform = await select({
      message: chalk.cyan('Default platform (leave empty to skip):'),
      choices: [
        { name: 'None (ask every time)', value: undefined },
        { name: 'GitHub', value: 'github' },
        { name: 'GitLab', value: 'gitlab' },
        { name: 'Bitbucket', value: 'bitbucket' },
        { name: 'SourceHut', value: 'sourcehut' },
      ],
    });

    const username = await input({
      message: chalk.cyan('Default username (leave empty to skip):'),
    });

    const chartType = await select({
      message: chalk.cyan('Default chart type (leave empty to skip):'),
      choices: [
        { name: 'None (ask every time)', value: undefined },
        { name: '📈 Line Chart', value: 'line' },
        { name: '📊 Bar Chart', value: 'bar' },
        { name: '🥧 Pie Chart', value: 'pie' },
        { name: '🍩 Doughnut Chart', value: 'doughnut' },
        { name: '📡 Radar Chart', value: 'radar' },
        { name: '🔥 Heatmap', value: 'heatmap' },
        { name: '🌸 Polar Area Chart', value: 'polarArea' },
        { name: '🎯 Scatter Chart', value: 'scatter' },
        { name: '🫧 Bubble Chart', value: 'bubble' },
        { name: '📊 Mixed Chart', value: 'mixed' },
        { name: '🎲 3D Bar Chart', value: 'bar3d' },
        { name: '📈 3D Line Chart', value: 'line3d' },
        { name: '🔮 3D Scatter Chart', value: 'scatter3d' },
        { name: '🌊 3D Surface Chart', value: 'surface3d' },
        { name: '💫 3D Bubble Chart', value: 'bubble3d' },
      ],
    });

    const autoOpen = await confirm({
      message: chalk.cyan('Auto-open charts after generation?'),
      default: false,
    });

    updateConfig({
      defaultPlatform: platform as any,
      defaultUsername: username.trim() || undefined,
      defaultChartType: chartType as any,
      autoOpen,
    });

    console.log(chalk.green('\n✓ Configuration saved!'));
    console.log(chalk.gray(`  Config file: ${getConfigPath()}\n`));
  });

program
  .command('config:reset')
  .description('Reset configuration to defaults')
  .action(() => {
    resetConfig();
    console.log(chalk.green('\n✓ Configuration reset to defaults\n'));
  });

program
  .command('info')
  .description('Show package information')
  .action(() => {
    showPackageInfo();
  });

// Subcommand: examples
program
  .command('examples')
  .description('Show usage examples')
  .action(() => {
    showExamples();
  });

program.parse();
