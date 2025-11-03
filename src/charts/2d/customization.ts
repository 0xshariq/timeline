/**
 * 2D Chart Customization Prompts
 * Interactive prompts for customizing 2D charts
 */

import { select, confirm, input, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import type { ChartCustomization } from '../../types/index.js';
import { defaultChartOptions } from './chartOptions.js';

/**
 * Prompt user for 2D chart customization
 */
export async function promptFor2DCustomization(): Promise<ChartCustomization | undefined> {
  // Show default customization values
  console.log('\n' + chalk.cyan.bold('🎨 Default 2D Chart Customization:'));
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
    return undefined; // Use defaults
  }

  const customization: Partial<ChartCustomization> = {};

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

  if (colorChoice === 'custom') {
    const colorsInput = await input({
      message: chalk.cyan('Enter colors (comma-separated hex codes, e.g., #FF5733,#33FF57):'),
    });
    customization.colors = colorsInput.split(',').map(c => c.trim());
  } else if (colorChoice === 'gradient') {
    customization.useGradient = true;
    customization.gradientColors = {
      start: await input({
        message: chalk.cyan('Gradient start color (hex):'),
        default: '#667eea',
      }),
      end: await input({
        message: chalk.cyan('Gradient end color (hex):'),
        default: '#764ba2',
      }),
    };
  } else if (colorChoice !== 'auto') {
    // Predefined color schemes
    const colorSchemes: Record<string, string[]> = {
      modern: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
      nature: ['#56ab2f', '#a8e063', '#38ef7d', '#11998e'],
      sunset: ['#ff6b6b', '#ee5a6f', '#c06c84', '#f67280'],
      ocean: ['#2e3192', '#1bffff', '#2575fc', '#6a11cb'],
    };
    customization.colors = colorSchemes[colorChoice];
  }

  // Additional customizations
  const advancedOptions = await checkbox({
    message: chalk.cyan('Select additional customizations:'),
    choices: [
      { name: 'Customize border width', value: 'border' },
      { name: 'Customize label size', value: 'labels' },
      { name: 'Customize legend position', value: 'legend' },
      { name: 'Disable grid lines', value: 'noGrid' },
      { name: 'Disable animations', value: 'noAnimation' },
      { name: 'Change scale type', value: 'scale' },
      { name: 'Enable export plugin', value: 'export' },
      { name: 'Enable annotations plugin', value: 'annotations' },
      { name: 'Enable zoom/pan plugin', value: 'zoom' },
    ],
  });

  // Process advanced options
  if (advancedOptions.includes('border')) {
    const borderWidth = await input({
      message: chalk.cyan('Border width (pixels):'),
      default: '2',
      validate: (value) => !isNaN(parseInt(value)) || 'Please enter a valid number',
    });
    customization.borderWidth = parseInt(borderWidth);
  }

  if (advancedOptions.includes('labels')) {
    const labelSize = await input({
      message: chalk.cyan('Label font size (pixels):'),
      default: '12',
      validate: (value) => !isNaN(parseInt(value)) || 'Please enter a valid number',
    });
    customization.labelFontSize = parseInt(labelSize);
  }

  if (advancedOptions.includes('legend')) {
    const legendPos = await select({
      message: chalk.cyan('Legend position:'),
      choices: [
        { name: 'Top', value: 'top' },
        { name: 'Bottom', value: 'bottom' },
        { name: 'Left', value: 'left' },
        { name: 'Right', value: 'right' },
      ],
    });
    customization.legendPosition = legendPos as 'top' | 'bottom' | 'left' | 'right';
  }

  if (advancedOptions.includes('noGrid')) {
    customization.showGridLines = false;
  }

  if (advancedOptions.includes('noAnimation')) {
    customization.animate = false;
  }

  if (advancedOptions.includes('scale')) {
    const scaleType = await select({
      message: chalk.cyan('Scale type:'),
      choices: [
        { name: 'Linear', value: 'linear' },
        { name: 'Logarithmic', value: 'logarithmic' },
        { name: 'Time', value: 'time' },
      ],
    });
    customization.scaleType = scaleType as 'linear' | 'logarithmic' | 'time';
  }

  if (advancedOptions.includes('export')) {
    customization.enableExport = true;
  }

  if (advancedOptions.includes('annotations')) {
    customization.enableAnnotations = true;
  }

  if (advancedOptions.includes('zoom')) {
    customization.enableZoom = true;
  }

  return customization as ChartCustomization;
}
