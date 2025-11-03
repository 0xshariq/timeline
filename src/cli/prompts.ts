import { input, select, confirm, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import type { Platform, ChartType, CommandOptions } from '../types/index.js';

/**
 * Interactive prompts for CLI
 */

/**
 * Prompt user to select a Git platform
 */
export async function promptForPlatform(defaultPlatform?: Platform): Promise<Platform> {
  if (defaultPlatform) {
    return defaultPlatform;
  }

  return await select<Platform>({
    message: chalk.cyan('Select Git platform:'),
    choices: [
      {
        name: chalk.white('🐙 GitHub'),
        value: 'github',
        description: 'GitHub.com'
      },
      {
        name: chalk.white('🦊 GitLab'),
        value: 'gitlab',
        description: 'GitLab.com'
      },
      {
        name: chalk.white('🪣 Bitbucket'),
        value: 'bitbucket',
        description: 'Bitbucket.org'
      },
      {
        name: chalk.white('🎯 SourceHut'),
        value: 'sourcehut',
        description: 'sr.ht'
      },
    ],
  });
}

/**
 * Prompt user to enter username
 */
export async function promptForUsername(defaultUsername?: string): Promise<string> {
  return await input({
    message: chalk.cyan('Enter username:'),
    default: defaultUsername || '',
    validate: (value) => {
      if (value.trim() === '') return 'Username is required';
      return true;
    },
  });
}

/**
 * Prompt user to select repositories
 */
export async function promptForRepositories(): Promise<{ selectAll: boolean; repos: string[] }> {
  const repoChoice = await select({
    message: chalk.cyan('Which repositories?'),
    choices: [
      {
        name: chalk.white('🌟 All repositories'),
        value: 'all',
        description: 'Analyze all public repositories'
      },
      {
        name: chalk.white('📝 Specific repositories'),
        value: 'specific',
        description: 'Choose specific repositories'
      },
    ],
  });

  if (repoChoice === 'all') {
    return { selectAll: true, repos: [] };
  }

  const reposInput = await input({
    message: chalk.cyan('Enter repository names (comma-separated):'),
    validate: (value) => {
      if (value.trim() === '') return 'Please enter at least one repository name';
      return true;
    },
  });

  const repos = reposInput.split(',').map(r => r.trim()).filter(r => r.length > 0);
  return { selectAll: false, repos };
}

/**
 * Prompt user to select chart type
 */
export async function promptForChartType(): Promise<ChartType> {
  return await select<ChartType>({
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
      {
        name: chalk.white('🎯 Polar Area Chart'),
        value: 'polarArea',
        description: 'Radial representation of data'
      },
      {
        name: chalk.white('⚡ Scatter Chart'),
        value: 'scatter',
        description: 'Commit distribution over time'
      },
      {
        name: chalk.white('💬 Bubble Chart'),
        value: 'bubble',
        description: 'Multi-dimensional with bubble sizes'
      },
      {
        name: chalk.white('🎨 Mixed Chart'),
        value: 'mixed',
        description: 'Combination of line and bar charts'
      },
    ],
  });
}

/**
 * Prompt for basic options (verbose, merge commits, auto-open)
 */
export async function promptForBasicOptions(): Promise<string[]> {
  return await checkbox({
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

/**
 * Prompt for chart customization
 */
export async function promptForCustomization(): Promise<{
  wantsCustomization: boolean;
  colors?: string[];
  useGradient?: boolean;
  gradientStart?: string;
  gradientEnd?: string;
  borderWidth?: number;
  labelSize?: number;
  legendPosition?: string;
  advancedOptions?: string[];
}> {
  console.log('\n' + chalk.cyan.bold('🎨 Chart Customization'));
  
  const wantsCustomization = await confirm({
    message: chalk.cyan('Do you want to customize the chart appearance?'),
    default: false,
  });

  if (!wantsCustomization) {
    return { wantsCustomization: false };
  }

  // Color customization
  const colorChoice = await select({
    message: chalk.cyan('Color scheme:'),
    choices: [
      { name: 'Auto (default vibrant colors)', value: 'auto' },
      { name: 'Custom colors (enter hex codes)', value: 'custom' },
      { name: 'Gradient', value: 'gradient' },
      { name: 'Modern Tech', value: 'modern' },
      { name: 'Nature', value: 'nature' },
      { name: 'Sunset', value: 'sunset' },
      { name: 'Ocean', value: 'ocean' },
    ],
  });

  let colors: string[] | undefined;
  let useGradient = false;
  let gradientStart: string | undefined;
  let gradientEnd: string | undefined;

  if (colorChoice === 'custom') {
    const colorsInput = await input({
      message: chalk.cyan('Enter hex colors (comma-separated, e.g., #FF5733,#33FF57):'),
      default: '#FF6B6B,#4ECDC4,#45B7D1',
    });
    colors = colorsInput.split(',').map(c => c.trim());
  } else if (colorChoice === 'gradient') {
    useGradient = true;
    gradientStart = await input({
      message: chalk.cyan('Gradient start color:'),
      default: '#667eea',
    });
    gradientEnd = await input({
      message: chalk.cyan('Gradient end color:'),
      default: '#764ba2',
    });
  } else if (colorChoice === 'modern') {
    colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'];
  } else if (colorChoice === 'nature') {
    colors = ['#56ab2f', '#a8e063', '#38ef7d', '#11998e', '#0575e6'];
  } else if (colorChoice === 'sunset') {
    colors = ['#ff6b6b', '#ee5a6f', '#c44569', '#f8b500', '#feca57'];
  } else if (colorChoice === 'ocean') {
    colors = ['#1e3799', '#0c2461', '#4a69bd', '#60a3bc', '#82ccdd'];
  }

  // Additional customizations
  const advancedOptions = await checkbox({
    message: chalk.cyan('Select additional customizations:'),
    choices: [
      { name: 'Customize border width', value: 'border' },
      { name: 'Customize label size', value: 'labels' },
      { name: 'Customize legend position', value: 'legend' },
      { name: 'Disable grid lines', value: 'noGrid' },
      { name: 'Disable animations', value: 'noAnimate' },
      { name: 'Enable export plugin', value: 'export' },
      { name: 'Enable annotations plugin', value: 'annotations' },
      { name: 'Enable zoom/pan plugin', value: 'zoom' },
    ],
  });

  let borderWidth: number | undefined;
  let labelSize: number | undefined;
  let legendPosition: string | undefined;

  if (advancedOptions.includes('border')) {
    const borderInput = await input({
      message: chalk.cyan('Border width (pixels):'),
      default: '2',
    });
    borderWidth = parseInt(borderInput);
  }

  if (advancedOptions.includes('labels')) {
    const labelInput = await input({
      message: chalk.cyan('Label font size (pixels):'),
      default: '12',
    });
    labelSize = parseInt(labelInput);
  }

  if (advancedOptions.includes('legend')) {
    legendPosition = await select({
      message: chalk.cyan('Legend position:'),
      choices: [
        { name: 'Bottom', value: 'bottom' },
        { name: 'Top', value: 'top' },
        { name: 'Left', value: 'left' },
        { name: 'Right', value: 'right' },
      ],
    });
  }

  return {
    wantsCustomization: true,
    colors,
    useGradient,
    gradientStart,
    gradientEnd,
    borderWidth,
    labelSize,
    legendPosition,
    advancedOptions,
  };
}
