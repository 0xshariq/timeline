/**
 * 3D Charts Generation Router
 * Uses Three.js for 3D visualization
 * 
 * Modular architecture:
 * - types.ts: Type definitions
 * - utils.ts: Shared utilities
 * - bar3d.ts: 3D bar chart implementation
 * - line3d.ts: 3D line chart implementation
 * - scatter3d.ts: 3D scatter chart implementation
 * - surface3d.ts: 3D surface chart implementation
 * - bubble3d.ts: 3D bubble chart implementation
 */

import fs from 'fs';
import type { ChartCustomization } from '../../types/index.js';
import type { Dataset3D } from './types.js';
import { generate3DBarChart } from './bar3d.js';
import { generate3DLineChart } from './line3d.js';
import { generate3DScatterChart } from './scatter3d.js';
import { generate3DSurfaceChart } from './surface3d.js';
import { generate3DBubbleChart } from './bubble3d.js';

// Export types for external use
export type { Dataset3D } from './types.js';

/**
 * Main 3D chart generation router
 * Routes to specific chart generators based on chart type
 */
export async function generate3DChart(
  username: string,
  platform: string,
  datasets: Dataset3D[],
  totalCommits: number,
  chartType: string,
  customization?: ChartCustomization
): Promise<string> {
  // Create charts directory if it doesn't exist
  const chartsDir = 'charts';
  if (!fs.existsSync(chartsDir)) {
    fs.mkdirSync(chartsDir, { recursive: true });
  }

  const filename = `${chartsDir}/timeline-${chartType}.png`;

  console.log(`[DEBUG 3D] Generating ${chartType} chart with Three.js...`);

  switch (chartType) {
    case 'bar3d':
      await generate3DBarChart(username, platform, datasets, totalCommits, filename, customization);
      break;
    case 'line3d':
      await generate3DLineChart(username, platform, datasets, totalCommits, filename, customization);
      break;
    case 'scatter3d':
      await generate3DScatterChart(username, platform, datasets, totalCommits, filename, customization);
      break;
    case 'surface3d':
      await generate3DSurfaceChart(username, platform, datasets, totalCommits, filename, customization);
      break;
    case 'bubble3d':
      await generate3DBubbleChart(username, platform, datasets, totalCommits, filename, customization);
      break;
    default:
      throw new Error(`Unknown 3D chart type: ${chartType}. Available: bar3d, line3d, scatter3d, surface3d, bubble3d`);
  }

  return filename;
}
