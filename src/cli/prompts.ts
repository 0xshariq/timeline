import { input, select, confirm, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import type { Platform, ChartType, CommandOptions } from '../types/index.js';
import { defaultChartOptions } from '../charts/2d/chartOptions.js';

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
  // Show default customization values
  console.log('\n' + chalk.cyan.bold('🎨 Default Chart Customization:'));
  console.log(chalk.gray('━'.repeat(50)));
  console.log(chalk.white(`  Border Width:     ${chalk.bold(defaultChartOptions.borderWidth + 'px')}`));
  console.log(chalk.white(`  Label Size:       ${chalk.bold(defaultChartOptions.labelFontSize + 'px')}`));
  console.log(chalk.white(`  Legend Position:  ${chalk.bold(defaultChartOptions.legendPosition)}`));
  console.log(chalk.white(`  Colors:           ${chalk.bold('Auto-generated vibrant colors')}`));
  console.log(chalk.white(`  Animations:       ${chalk.bold(defaultChartOptions.animate ? 'Enabled' : 'Disabled')} (${defaultChartOptions.animationDuration}ms, ${defaultChartOptions.animationEasing})`));
  console.log(chalk.white(`  Grid Lines:       ${chalk.bold(defaultChartOptions.showGridLines ? 'Visible' : 'Hidden')}`));
  console.log(chalk.white(`  Scale Type:       ${chalk.bold(defaultChartOptions.scaleType)}`));
  console.log(chalk.white(`  Tooltips:         ${chalk.bold(defaultChartOptions.showTooltips ? 'Enabled' : 'Disabled')}`));
  console.log(chalk.gray('━'.repeat(50)));
  
  const wantsCustomization = await confirm({
    message: chalk.cyan('\nDo you want to customize these settings?'),
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
      validate: (value) => {
        const colors = value.split(',').map(c => c.trim());
        for (const color of colors) {
          if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
            return `Invalid hex color: ${color}. Use format #RRGGBB (e.g., #FF5733)`;
          }
        }
        return true;
      },
    });
    colors = colorsInput.split(',').map(c => c.trim());
  } else if (colorChoice === 'gradient') {
    useGradient = true;
    gradientStart = await input({
      message: chalk.cyan('Gradient start color:'),
      default: defaultChartOptions.gradientColors.start,
      validate: (value) => {
        if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
          return `Invalid hex color. Use format #RRGGBB (e.g., #667eea)`;
        }
        return true;
      },
    });
    gradientEnd = await input({
      message: chalk.cyan('Gradient end color:'),
      default: defaultChartOptions.gradientColors.end,
      validate: (value) => {
        if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
          return `Invalid hex color. Use format #RRGGBB (e.g., #764ba2)`;
        }
        return true;
      },
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
      default: defaultChartOptions.borderWidth.toString(),
      validate: (value) => {
        const num = parseInt(value);
        if (isNaN(num)) return 'Please enter a valid number';
        if (num < 0) return 'Border width must be positive';
        if (num > 20) return 'Border width must be 20 or less';
        return true;
      },
    });
    borderWidth = parseInt(borderInput);
  }

  if (advancedOptions.includes('labels')) {
    const labelInput = await input({
      message: chalk.cyan('Label font size (pixels):'),
      default: defaultChartOptions.labelFontSize.toString(),
      validate: (value) => {
        const num = parseInt(value);
        if (isNaN(num)) return 'Please enter a valid number';
        if (num < 6) return 'Font size must be at least 6';
        if (num > 72) return 'Font size must be 72 or less';
        return true;
      },
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