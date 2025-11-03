/**
 * Charts Module
 * Main entry point for all chart generation (2D and 3D)
 */

import type { ChartDataset, ChartType, ChartCustomization } from '../types/index.js';
import { generate2DChart, RenderDataset } from './2d/index.js';
import type { Dataset3D } from './3d/index.js';

/**
 * Main chart generation function
 * Routes to 2D or 3D chart generators based on chart type
 */
export async function generateChart(
  username: string,
  platform: string,
  datasets: RenderDataset[] | ChartDataset[] | Dataset3D[],
  totalCommits: number,
  chartType: ChartType | string,
  customization?: ChartCustomization
): Promise<string> {
  // Check if it's a 3D chart type
  const chart3DTypes = ['bar3d', 'line3d', 'scatter3d', 'surface3d', 'bubble3d'];
  
  if (chart3DTypes.includes(chartType)) {
    // Import 3D chart generator dynamically
    const { generate3DChart } = await import('./3d/index');
    return await generate3DChart(username, platform, datasets as Dataset3D[], totalCommits, chartType, customization);
  }
  
  // Default to 2D charts
  return await generate2DChart(username, platform, datasets as RenderDataset[], totalCommits, chartType, customization);
}

export { RenderDataset } from './2d/index.js';
