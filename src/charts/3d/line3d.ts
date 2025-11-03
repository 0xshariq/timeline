/**
 * 3D Line Chart Generator
 * Uses 2D canvas with isometric projection to create 3D effect
 */

import fs from 'fs';
import { createCanvas } from 'canvas';
import { getColorByIndex } from '../../utils/colors.js';
import type { Chart3DOptions } from './options.js';
import type { Dataset3D } from './types.js';
import { merge3DOptions } from './options.js';
import { projectToIsometric, draw3DChartBase, drawSphere } from './renderer.js';

/**
 * Generate 3D Line Chart
 */
export async function generate3DLineChart(
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
  
  console.log(`[3D] Rendering ${datasets.length} isometric 3D line(s)...`);
  
  // Calculate 3D space dimensions
  const centerX = width / 2;
  const centerY = height / 2 + 100;
  const scale = 40;
  
  // Process each dataset
  datasets.forEach((dataset, datasetIndex) => {
    const color = opts.barColors?.[datasetIndex] || getColorByIndex(datasetIndex);
    const points = dataset.data;
    
    // Draw lines connecting points
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let i = 0; i < points.length; i++) {
      const x3d = (i - points.length / 2) * scale;
      const y3d = points[i] * 0.5;
      const z3d = datasetIndex * 50 - (datasets.length * 25);
      
      const point2d = projectToIsometric({ x: x3d, y: y3d, z: z3d }, Math.PI / 6, Math.PI / 4);
      const screenX = centerX + point2d.x;
      const screenY = centerY - point2d.y;
      
      if (i === 0) {
        ctx.moveTo(screenX, screenY);
      } else {
        ctx.lineTo(screenX, screenY);
      }
    }
    
    ctx.stroke();
    
    // Draw points as small spheres
    for (let i = 0; i < points.length; i++) {
      const x3d = (i - points.length / 2) * scale;
      const y3d = points[i] * 0.5;
      const z3d = datasetIndex * 50 - (datasets.length * 25);
      
      const point2d = projectToIsometric({ x: x3d, y: y3d, z: z3d }, Math.PI / 6, Math.PI / 4);
      const screenX = centerX + point2d.x;
      const screenY = centerY - point2d.y;
      
      drawSphere(ctx, screenX, screenY, 5, color, opts.geometry.showEdges);
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
