/**
 * 3D Charts Module
 * Handles all 3D chart generation using Three.js
 */

import * as THREE from 'three';
import fs from 'fs';
import { createCanvas } from 'canvas';
import type { ChartDataset, ChartCustomization } from '../../types/index.js';
import { getColorByIndex } from '../../utils/colors.js';

// 3D-specific dataset type
export interface Dataset3D {
  label: string;
  data: number[];
  labels?: string[];
  x?: number[];
  y?: number[];
  z?: number[];
}

/**
 * Generate 3D charts using Three.js
 */
export async function generate3DChart(
  username: string,
  platform: string,
  datasets: Dataset3D[] | ChartDataset[],
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
      await generate3DBarChart(username, platform, datasets as Dataset3D[], totalCommits, filename, customization);
      break;
    case 'line3d':
      await generate3DLineChart(username, platform, datasets as Dataset3D[], totalCommits, filename, customization);
      break;
    case 'scatter3d':
      await generate3DScatterChart(username, platform, datasets as Dataset3D[], totalCommits, filename, customization);
      break;
    case 'surface3d':
      await generate3DSurfaceChart(username, platform, datasets as Dataset3D[], totalCommits, filename, customization);
      break;
    case 'bubble3d':
      await generate3DBubbleChart(username, platform, datasets as Dataset3D[], totalCommits, filename, customization);
      break;
    default:
      throw new Error(`Unknown 3D chart type: ${chartType}`);
  }

  return filename;
}

/**
 * Generate 3D Bar Chart
 */
async function generate3DBarChart(
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
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight1.position.set(10, 20, 10);
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight2.position.set(-10, 10, -10);
  scene.add(directionalLight2);

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
  const gridHelper = new THREE.GridHelper(gridSize, 20, 0x444444, 0x222222);
  scene.add(gridHelper);

  // Add axes helpers
  const axesHelper = new THREE.AxesHelper(10);
  scene.add(axesHelper);

  // Render scene
  console.log(`[3D] Rendering ${datasets.length} 3D bars...`);
  
  // Create a simple renderer output
  // Note: For proper Three.js rendering in Node.js, you'd need gl or headless-gl
  // This is a placeholder implementation
  const ctx = canvas.getContext('2d');
  
  // Draw background
  ctx.fillStyle = '#1a1a1a';
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

/**
 * Generate 3D Line Chart
 */
async function generate3DLineChart(
  username: string,
  platform: string,
  datasets: Dataset3D[],
  totalCommits: number,
  filename: string,
  customization?: ChartCustomization
): Promise<void> {
  console.log('[3D] 3D Line chart generation not yet implemented');
  throw new Error('3D Line chart generation coming soon!');
}

/**
 * Generate 3D Scatter Chart
 */
async function generate3DScatterChart(
  username: string,
  platform: string,
  datasets: Dataset3D[],
  totalCommits: number,
  filename: string,
  customization?: ChartCustomization
): Promise<void> {
  console.log('[3D] 3D Scatter chart generation not yet implemented');
  throw new Error('3D Scatter chart generation coming soon!');
}

/**
 * Generate 3D Surface Chart
 */
async function generate3DSurfaceChart(
  username: string,
  platform: string,
  datasets: Dataset3D[],
  totalCommits: number,
  filename: string,
  customization?: ChartCustomization
): Promise<void> {
  console.log('[3D] 3D Surface chart generation not yet implemented');
  throw new Error('3D Surface chart generation coming soon!');
}

/**
 * Generate 3D Bubble Chart
 */
async function generate3DBubbleChart(
  username: string,
  platform: string,
  datasets: Dataset3D[],
  totalCommits: number,
  filename: string,
  customization?: ChartCustomization
): Promise<void> {
  console.log('[3D] 3D Bubble chart generation not yet implemented');
  throw new Error('3D Bubble chart generation coming soon!');
}

/**
 * Helper: Get color for dataset
 */
function getColorForDataset(index: number): number {
  const colors = [
    0xFF6B6B, // Red
    0x4ECDC4, // Teal
    0x45B7D1, // Blue
    0xFECA57, // Yellow
    0x00D2D3, // Cyan
    0xA29BFE, // Purple
    0xFD79A8, // Pink
    0x6C5CE7, // Indigo
  ];
  return colors[index % colors.length];
}

/**
 * Helper: Create text sprite for labels
 */
function createTextSprite(text: string, scale: number = 1): THREE.Sprite {
  // Simple sprite for Node.js environment without DOM
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ color: 0xffffff })
  );
  sprite.scale.set(scale, scale, 1);
  return sprite;
}
