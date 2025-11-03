/**
 * 3D Bar Chart Generator
 * Uses 2D canvas with isometric projection to create 3D effect
 */

import fs from 'fs';
import { createCanvas } from 'canvas';
import { getColorByIndex } from '../../utils/colors.js';
import type { Dataset3D } from './types.js';
import type { Chart3DOptions } from './options.js';
import { merge3DOptions } from './options.js';
import { drawIsometricBar, draw3DChartBase } from './renderer.js';

/**
 * Generate 3D Bar Chart
 */
export async function generate3DBarChart(
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
  
  // Calculate bar dimensions and positions
  const datasetCount = datasets.length;
  const barWidth = 80;
  const barDepth = 60;
  const maxBarHeight = 400;
  const spacing = 150;
  
  // Find max commits for scaling
  const maxCommits = Math.max(...datasets.map(d => 
    d.data.reduce((a, b) => a + b, 0)
  ), 1);
  
  // Calculate starting position to center the bars
  const startX = (width - (datasetCount * spacing)) / 2 + 200;
  const baseY = height - 150;
  
  console.log(`[3D] Rendering ${datasets.length} isometric 3D bars...`);
  
  // Draw bars
  datasets.forEach((dataset, datasetIndex) => {
    const commitCount = dataset.data.reduce((a, b) => a + b, 0);
    const barHeight = Math.max((commitCount / maxCommits) * maxBarHeight, 5);
    
    // Get color from options or use default
    const colorHex = opts.barColors?.[datasetIndex] || getColorByIndex(datasetIndex);
    
    // Calculate bar position
    const barX = startX + (datasetIndex * spacing);
    const barY = baseY;
    
    // Draw the 3D bar
    drawIsometricBar(
      ctx,
      barX,
      barY,
      barWidth,
      barHeight,
      barDepth,
      colorHex,
      opts.geometry.showEdges
    );
    
    // Draw commit count above bar
    if (commitCount > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      const isoAngle = Math.PI / 6;
      const textX = barX + (barWidth / 2) * Math.cos(isoAngle) - (barDepth / 2) * Math.cos(isoAngle);
      const textY = baseY - (barWidth / 2) * Math.sin(isoAngle) - (barDepth / 2) * Math.sin(isoAngle) - barHeight - 15;
      ctx.fillText(commitCount.toString(), textX, textY);
    }
    
    // Draw repository name below bar
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    const isoAngle = Math.PI / 6;
    const labelX = barX + (barWidth / 2) * Math.cos(isoAngle) - (barDepth / 2) * Math.cos(isoAngle);
    const labelY = baseY + (barWidth / 2) * Math.sin(isoAngle) + (barDepth / 2) * Math.sin(isoAngle) + 30;
    
    // Truncate long labels
    const label = dataset.label.length > 20 ? dataset.label.substring(0, 17) + '...' : dataset.label;
    ctx.fillText(label, labelX, labelY);
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
