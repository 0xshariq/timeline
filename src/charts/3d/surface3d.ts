/**
 * 3D Surface Chart Generator
 * Uses 2D canvas with isometric projection to create 3D effect
 */

import fs from 'fs';
import { createCanvas } from 'canvas';
import { getColorByIndex } from '../../utils/colors.js';
import type { Chart3DOptions } from './options.js';
import type { Dataset3D } from './types.js';
import { merge3DOptions } from './options.js';
import { projectToIsometric, draw3DChartBase, lightenColor, darkenColor } from './renderer.js';

/**
 * Generate 3D Surface Chart
 */
export async function generate3DSurfaceChart(
  username: string,
  platform: string,
  datasets: Dataset3D[],
  totalCommits: number,
  filename: string,
  options?: Partial<Chart3DOptions>
): Promise<void> {
  // Merge options with defaults
  const opts = merge3DOptions(options);

  const width = 1920;
  const height = 1080;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Draw base elements (background, title, grid)
  draw3DChartBase(ctx, width, height, username, platform, totalCommits, datasets.length, opts.scene.backgroundColor, opts.scene.showGrid);

  console.log(`[3D] Rendering ${datasets.length} isometric 3D surface(s)...`);

  // Calculate 3D space dimensions
  const centerX = width / 2;
  const centerY = height / 2 + 100;
  const scale = 40;

  // Process each dataset as a surface
  datasets.forEach((dataset, datasetIndex) => {
    const color = opts.barColors?.[datasetIndex] || getColorByIndex(datasetIndex);
    const points = dataset.data;

    // Draw surface as connected quads
    for (let i = 0; i < points.length - 1; i++) {
      const x1_3d = (i - points.length / 2) * scale;
      const y1_3d = points[i] * 0.5;
      const z1_3d = datasetIndex * 50 - (datasets.length * 25);

      const x2_3d = (i + 1 - points.length / 2) * scale;
      const y2_3d = points[i + 1] * 0.5;
      const z2_3d = datasetIndex * 50 - (datasets.length * 25);

      // Project points
      const p1 = projectToIsometric({ x: x1_3d, y: y1_3d, z: z1_3d }, Math.PI / 6, Math.PI / 4);
      const p2 = projectToIsometric({ x: x2_3d, y: y2_3d, z: z2_3d }, Math.PI / 6, Math.PI / 4);

      // Create quad connecting to ground
      const p1_ground = projectToIsometric({ x: x1_3d, y: 0, z: z1_3d }, Math.PI / 6, Math.PI / 4);
      const p2_ground = projectToIsometric({ x: x2_3d, y: 0, z: z2_3d }, Math.PI / 6, Math.PI / 4);

      // Draw surface quad with gradient
      const gradient = ctx.createLinearGradient(
        centerX + p1.x, centerY - p1.y,
        centerX + p1_ground.x, centerY - p1_ground.y
      );
      gradient.addColorStop(0, lightenColor(color, 10));
      gradient.addColorStop(1, darkenColor(color, 20));

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(centerX + p1.x, centerY - p1.y);
      ctx.lineTo(centerX + p2.x, centerY - p2.y);
      ctx.lineTo(centerX + p2_ground.x, centerY - p2_ground.y);
      ctx.lineTo(centerX + p1_ground.x, centerY - p1_ground.y);
      ctx.closePath();
      ctx.fill();

      if (opts.geometry.showEdges) {
        ctx.strokeStyle = darkenColor(color, 30);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw top line
      ctx.strokeStyle = lightenColor(color, 20);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX + p1.x, centerY - p1.y);
      ctx.lineTo(centerX + p2.x, centerY - p2.y);
      ctx.stroke();
    }
  });

  // Draw legend
  ctx.textAlign = 'left';
  ctx.font = '16px Arial';
  const legendX = 50;
  let legendY = 150;

  datasets.forEach((dataset, i) => {
    const commits = dataset.data.reduce((a, b) => a + b, 0);
    const color = opts.barColors?.[i] || getColorByIndex(i);

    // Draw color box
    ctx.fillStyle = color;
    ctx.fillRect(legendX, legendY - 12, 20, 20);

    // Draw text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${dataset.label}: ${commits} commits`, legendX + 30, legendY + 3);

    legendY += 30;
  });

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);

  console.log(`[3D] Chart saved successfully to ${filename}!`);
}
