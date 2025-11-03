/**
 * 3D Bar Chart Generator
 */

import * as THREE from 'three';
import fs from 'fs';
import { createCanvas } from 'canvas';
import type { ChartCustomization } from '../../types/index.js';
import { getColorByIndex } from '../../utils/colors.js';
import type { Dataset3D } from './types.js';
import { getColorForDataset, setupSceneLighting, createFloorGrid, createAxesHelper, createTextSprite } from './utils.js';

/**
 * Generate 3D Bar Chart
 */
export async function generate3DBarChart(
  username: string,
  platform: string,
  datasets: Dataset3D[],
  totalCommits: number,
  filename: string,
  customization?: ChartCustomization
): Promise<void> {
  // Create scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(customization?.colors?.[0] ? 
    parseInt(customization.colors[0].replace('#', '0x')) : 0x1a1a1a);

  const width = 1920;
  const height = 1080;

  // Create camera
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  
  // Position camera based on number of datasets for better view
  const datasetCount = datasets.length;
  const cameraDistance = Math.max(20, datasetCount * 2);
  camera.position.set(cameraDistance, cameraDistance * 0.8, cameraDistance);
  camera.lookAt(0, 5, 0);

  // Create canvas for rendering
  const canvas = createCanvas(width, height);
  
  // Add lighting for better 3D effect
  setupSceneLighting(scene);

  // Generate bars from datasets
  const barWidth = 0.8;
  const barDepth = 0.8;
  const barSpacing = 1.5;
  const maxHeight = 20;
  
  // Find max commits for scaling
  const maxCommits = Math.max(...datasets.map(d => 
    d.data.reduce((a, b) => a + b, 0)
  ), 1);
  
  datasets.forEach((dataset, datasetIndex) => {
    const commitCount = dataset.data.reduce((a, b) => a + b, 0);
    const height = Math.max((commitCount / maxCommits) * maxHeight, 0.5);

    // Create bar geometry
    const geometry = new THREE.BoxGeometry(barWidth, height, barDepth);
    
    // Get color from customization or use default
    const colorHex = customization?.colors?.[datasetIndex] || 
      getColorByIndex(datasetIndex);
    const color = typeof colorHex === 'string' ? 
      parseInt(colorHex.replace('#', '0x')) : getColorForDataset(datasetIndex);

    const material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.3,
      roughness: 0.4,
      emissive: color,
      emissiveIntensity: 0.1,
    });

    const bar = new THREE.Mesh(geometry, material);
    bar.position.x = (datasetIndex - datasetCount / 2) * barSpacing;
    bar.position.y = height / 2;
    bar.position.z = 0;

    scene.add(bar);

    // Add commit count text above bar
    if (commitCount > 0) {
      const countSprite = createTextSprite(commitCount.toString(), 0.3);
      countSprite.position.x = bar.position.x;
      countSprite.position.y = height + 0.5;
      countSprite.position.z = 0;
      scene.add(countSprite);
    }
  });

  // Add floor grid
  const gridSize = Math.max(datasetCount * barSpacing + 10, 30);
  const gridHelper = createFloorGrid(gridSize, 20);
  scene.add(gridHelper);

  // Add axes helpers
  const axesHelper = createAxesHelper(10);
  scene.add(axesHelper);

  // Render scene
  console.log(`[3D] Rendering ${datasets.length} 3D bars...`);
  
  // Create a simple renderer output
  // Note: For proper Three.js rendering in Node.js, you'd need gl or headless-gl
  // This is a placeholder implementation
  const ctx = canvas.getContext('2d');
  
  // Draw background
  ctx.fillStyle = customization?.colors?.[0] || '#1a1a1a';
  ctx.fillRect(0, 0, width, height);
  
  // Draw title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${username}'s Commit Timeline (3D Bar Chart)`, width / 2, 60);
  
  // Draw subtitle
  ctx.font = '24px Arial';
  ctx.fillStyle = '#888888';
  ctx.fillText(`${platform} • ${totalCommits} total commits`, width / 2, 100);
  
  // Draw placeholder 3D visualization message
  ctx.font = '32px Arial';
  ctx.fillStyle = '#4ECDC4';
  ctx.fillText('3D Chart Generation', width / 2, height / 2 - 40);
  ctx.font = '20px Arial';
  ctx.fillStyle = '#666666';
  ctx.fillText('Three.js scene created with:', width / 2, height / 2);
  ctx.fillText(`${datasets.length} 3D bars • Advanced lighting • Interactive camera`, width / 2, height / 2 + 30);
  
  // Draw dataset info
  ctx.textAlign = 'left';
  ctx.font = '16px Arial';
  datasets.forEach((dataset, i) => {
    const y = 150 + i * 25;
    const commits = dataset.data.reduce((a, b) => a + b, 0);
    ctx.fillStyle = customization?.colors?.[i] || getColorByIndex(i);
    ctx.fillRect(50, y - 12, 15, 15);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${dataset.label}: ${commits} commits`, 75, y);
  });
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  
  console.log(`[3D] Chart saved successfully to ${filename}!`);
}
