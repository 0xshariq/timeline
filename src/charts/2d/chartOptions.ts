import type { ChartCustomization } from '../../types/index.js';

/**
 * Default chart customization options
 * These are used when user doesn't specify custom options
 */
export const defaultChartOptions: Required<ChartCustomization> = {
  // Colors and Gradients
  colors: [],  // Empty means auto-generate from color palette
  useGradient: false,
  gradientColors: {
    start: '#667eea',
    end: '#764ba2',
  },
  
  // Borders
  borderWidth: 2,
  borderColor: '#ffffff',
  
  // Animations
  animate: true,
  animationDuration: 1000,
  animationEasing: 'easeInOutQuad',
  
  // Scales
  scaleType: 'linear',
  beginAtZero: true,
  showGridLines: true,
  
  // Labels and Text
  showLabels: true,
  labelFontSize: 12,
  labelColor: '#666',
  
  // Tooltips
  showTooltips: true,
  tooltipBackgroundColor: 'rgba(0, 0, 0, 0.8)',
  
  // Legend
  showLegend: true,
  legendPosition: 'bottom',
  
  // Plugins
  enableExport: false,
  enableAnnotations: false,
  enableZoom: false,
  
  // Mixed Chart specific
  mixedChartTypes: {},
};

/**
 * Merge user options with defaults
 */
export function mergeChartOptions(userOptions?: ChartCustomization): Required<ChartCustomization> {
  if (!userOptions) {
    return { ...defaultChartOptions };
  }
  
  return {
    ...defaultChartOptions,
    ...userOptions,
    gradientColors: {
      ...defaultChartOptions.gradientColors,
      ...(userOptions.gradientColors || {}),
    },
    mixedChartTypes: {
      ...defaultChartOptions.mixedChartTypes,
      ...(userOptions.mixedChartTypes || {}),
    },
  };
}

/**
 * Create gradient for canvas context
 */
export function createGradient(
  ctx: any,
  area: { left: number; right: number; top: number; bottom: number },
  colors: { start: string; end: string }
): any {
  const gradient = ctx.createLinearGradient(0, area.top, 0, area.bottom);
  gradient.addColorStop(0, colors.start);
  gradient.addColorStop(1, colors.end);
  return gradient;
}

/**
 * Apply animation options to Chart.js config
 */
export function getAnimationConfig(options: Required<ChartCustomization>): any {
  if (!options.animate) {
    return { animation: false };
  }
  
  return {
    animation: {
      duration: options.animationDuration,
      easing: options.animationEasing,
    },
  };
}

/**
 * Get scale configuration based on options
 */
export function getScaleConfig(options: Required<ChartCustomization>, scaleType: 'x' | 'y'): any {
  return {
    type: options.scaleType === 'time' && scaleType === 'x' ? 'time' : options.scaleType,
    beginAtZero: options.beginAtZero,
    grid: {
      display: options.showGridLines,
      color: 'rgba(0, 0, 0, 0.1)',
    },
    ticks: {
      color: options.labelColor,
      font: {
        size: options.labelFontSize,
      },
    },
  };
}

/**
 * Get legend configuration
 */
export function getLegendConfig(options: Required<ChartCustomization>): any {
  return {
    display: options.showLegend,
    position: options.legendPosition,
    labels: {
      color: options.labelColor,
      font: {
        size: options.labelFontSize,
      },
      boxWidth: 15,
      padding: 10,
    },
  };
}

/**
 * Get tooltip configuration
 */
export function getTooltipConfig(options: Required<ChartCustomization>): any {
  return {
    enabled: options.showTooltips,
    backgroundColor: options.tooltipBackgroundColor,
    titleFont: {
      size: 14,
    },
    bodyFont: {
      size: 12,
    },
    padding: 12,
  };
}
