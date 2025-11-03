import { input, select, confirm, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import type { Platform, ChartType, CommandOptions } from '../types/index.js';
import { promptFor2DCustomization } from '../charts/2d/customization.js';
import { promptFor3DCustomization } from '../charts/3d/customization.js';

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
        name: chalk.white('GitHub'),
        value: 'github',
        description: 'GitHub.com'
      },
      {
        name: chalk.white('GitLab'),
        value: 'gitlab',
        description: 'GitLab.com'
      },
      {
        name: chalk.white('Bitbucket'),
        value: 'bitbucket',
        description: 'Bitbucket.org'
      },
      {
        name: chalk.white('SourceHut'),
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
      const trimmed = value.trim();
      if (trimmed === '') return 'Username is required';
      if (trimmed.length < 1) return 'Username must be at least 1 character';
      if (trimmed.length > 39) return 'Username must be less than 40 characters';
      // Basic alphanumeric check with hyphens and underscores
      if (!/^[a-zA-Z0-9][a-zA-Z0-9-_]*$/.test(trimmed)) {
        return 'Username must start with a letter or number and contain only letters, numbers, hyphens, or underscores';
      }
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
      const trimmed = value.trim();
      if (trimmed === '') return 'Please enter at least one repository name';
      
      const repos = trimmed.split(',').map(r => r.trim()).filter(r => r.length > 0);
      if (repos.length === 0) return 'Please enter at least one valid repository name';
      
      // Validate each repo name
      for (const repo of repos) {
        if (repo.length > 100) return `Repository name "${repo}" is too long`;
        if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(repo)) {
          return `Invalid repository name "${repo}". Must contain only letters, numbers, dots, hyphens, or underscores`;
        }
      }
      
      return true;
    },
  });

  const repos = reposInput.split(',').map(r => r.trim()).filter(r => r.length > 0);
  return { selectAll: false, repos };
}

/**
 * Prompt user to select chart dimension (2D or 3D)
 */
async function promptForChartDimension(): Promise<'2d' | '3d'> {
  return await select<'2d' | '3d'>({
    message: chalk.cyan('Select chart dimension:'),
    choices: [
      {
        name: chalk.white('� 2D Charts'),
        value: '2d',
        description: 'Traditional flat charts (Chart.js)'
      },
      {
        name: chalk.white('🎲 3D Charts'),
        value: '3d',
        description: 'Interactive 3D visualizations (Three.js)'
      },
    ],
  });
}

/**
 * Prompt user to select chart type
 */
export async function promptForChartType(): Promise<ChartType> {
  // First ask for dimension
  const dimension = await promptForChartDimension();

  if (dimension === '3d') {
    return await select<ChartType>({
      message: chalk.cyan('Select 3D chart type:'),
      choices: [
        {
          name: chalk.white('🎲 3D Bar Chart'),
          value: 'bar3d',
          description: '3D bars for impressive visualization'
        },
        {
          name: chalk.white('📈 3D Line Chart'),
          value: 'line3d',
          description: '3D timeline visualization'
        },
        {
          name: chalk.white('⚡ 3D Scatter Chart'),
          value: 'scatter3d',
          description: '3D scatter plot of commits'
        },
        {
          name: chalk.white('🌊 3D Surface Chart'),
          value: 'surface3d',
          description: '3D surface for activity patterns'
        },
        {
          name: chalk.white('💠 3D Bubble Chart'),
          value: 'bubble3d',
          description: '3D bubbles with depth'
        },
      ],
    });
  }

  // 2D charts
  return await select<ChartType>({
    message: chalk.cyan('Select 2D chart type:'),
    choices: [
      {
        name: chalk.white('📈 Line Chart'),
        value: 'line',
        description: 'Timeline of commits over time'
      },
      {
        name: chalk.white('� Bar Chart'),
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
        name: chalk.white('� Heatmap'),
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
        name: chalk.white('� Bubble Chart'),
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
 * Wrapper function for chart customization
 * Routes to appropriate customization function based on chart type
 */
export async function promptForCustomization(chartType?: string): Promise<{
  wantsCustomization: boolean;
  colors?: string[];
  useGradient?: boolean;
  gradientStart?: string;
  gradientEnd?: string;
  borderWidth?: number;
  labelSize?: number;
  legendPosition?: string;
  advancedOptions?: string[];
  chart3DOptions?: any;
}> {
  // Check if it's a 3D chart
  const chart3DTypes = ['bar3d', 'line3d', 'scatter3d', 'surface3d', 'bubble3d'];
  if (chartType && chart3DTypes.includes(chartType)) {
    const result = await promptFor3DCustomization();
    if (!result) {
      return { wantsCustomization: false };
    }
    // Return in expected format with 3D options
    return { 
      wantsCustomization: true,
      chart3DOptions: result 
    };
  }

  // For 2D charts
  const result = await promptFor2DCustomization();
  if (!result) {
    return { wantsCustomization: false };
  }

  // Convert ChartCustomization to old format expected by CLI
  const advancedOptions: string[] = [];
  if (result.enableExport) advancedOptions.push('export');
  if (result.enableAnnotations) advancedOptions.push('annotations');
  if (result.enableZoom) advancedOptions.push('zoom');
  if (!result.showGridLines) advancedOptions.push('noGrid');
  if (!result.animate) advancedOptions.push('noAnimate');

  return {
    wantsCustomization: true,
    colors: result.colors,
    useGradient: result.useGradient,
    gradientStart: result.gradientColors?.start,
    gradientEnd: result.gradientColors?.end,
    borderWidth: result.borderWidth,
    labelSize: result.labelFontSize,
    legendPosition: result.legendPosition,
    advancedOptions,
  };
}