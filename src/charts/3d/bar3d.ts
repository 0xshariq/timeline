/**
 * 3D Bar Chart Generator
 */

import * as THREE from 'three';
import fs from 'fs';
import { createCanvas } from 'canvas';
import { getColorByIndex } from '../../utils/colors.js';
import type { Dataset3D } from './types.js';
import type { Chart3DOptions } from './options.js';
import { merge3DOptions } from './options.js';
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
  options?: Partial<Chart3DOptions>
): Promise<void> {
  // Merge options with defaults
  const opts = merge3DOptions(options);
  
  // Create scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(opts.scene.backgroundColor);

  // Add fog if enabled
  if (opts.scene.fog.enabled) {
    scene.fog = new THREE.Fog(opts.scene.fog.color, opts.scene.fog.near, opts.scene.fog.far);
  }

  const width = 1920;
  const height = 1080;

  // Create camera based on options
  const camera = opts.camera.type === 'perspective'
    ? new THREE.PerspectiveCamera(opts.camera.fov, width / height, opts.camera.near, opts.camera.far)
    : new THREE.OrthographicCamera(-width / 100, width / 100, height / 100, -height / 100, opts.camera.near, opts.camera.far);
  
  // Position camera from options
  camera.position.set(opts.camera.position.x, opts.camera.position.y, opts.camera.position.z);
  camera.zoom = opts.camera.zoom;
  camera.lookAt(0, 5, 0);

  // Create canvas for rendering
  const canvas = createCanvas(width, height);
  
  // Add lighting for better 3D effect
  setupSceneLighting(scene);

  // Generate bars from datasets
  const datasetCount = datasets.length;
  const barWidth = opts.geometry.width;
  const barDepth = opts.geometry.depth;
  const barSpacing = 1.5;
  const maxHeight = 20;
  
  // Find max commits for scaling
  const maxCommits = Math.max(...datasets.map(d => 
    d.data.reduce((a, b) => a + b, 0)
  ), 1);
  
  datasets.forEach((dataset, datasetIndex) => {
    const commitCount = dataset.data.reduce((a, b) => a + b, 0);
    const height = Math.max((commitCount / maxCommits) * maxHeight, 0.5);

    // Create bar geometry based on geometry type
    let geometry: THREE.BufferGeometry;
    switch (opts.geometry.type) {
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(barWidth / 2, barWidth / 2, height, opts.geometry.segments);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(barWidth / 2, opts.geometry.segments, opts.geometry.segments);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(barWidth / 2, height, opts.geometry.segments);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(barWidth, barDepth / 4, opts.geometry.segments, opts.geometry.segments);
        break;
      case 'capsule':
        geometry = new THREE.CapsuleGeometry(barWidth / 2, height, opts.geometry.segments, opts.geometry.segments);
        break;
      case 'box':
      default:
        geometry = new THREE.BoxGeometry(barWidth, height, barDepth, opts.geometry.segments, opts.geometry.segments, opts.geometry.segments);
    }
    
    // Get color from options or use default
    const colorHex = opts.barColors?.[datasetIndex] || getColorByIndex(datasetIndex);
    const color = typeof colorHex === 'string' ? 
      parseInt(colorHex.replace('#', '0x')) : getColorForDataset(datasetIndex);

    // Create material based on options
    let material: THREE.Material;
    switch (opts.material.type) {
      case 'phong':
        material = new THREE.MeshPhongMaterial({
          color: color,
          emissive: opts.material.emissive,
          emissiveIntensity: opts.material.emissiveIntensity,
          opacity: opts.material.opacity,
          transparent: opts.material.transparent,
          wireframe: opts.material.wireframe,
        });
        break;
      case 'lambert':
        material = new THREE.MeshLambertMaterial({
          color: color,
          emissive: opts.material.emissive,
          emissiveIntensity: opts.material.emissiveIntensity,
          opacity: opts.material.opacity,
          transparent: opts.material.transparent,
          wireframe: opts.material.wireframe,
        });
        break;
      case 'basic':
        material = new THREE.MeshBasicMaterial({
          color: color,
          opacity: opts.material.opacity,
          transparent: opts.material.transparent,
          wireframe: opts.material.wireframe,
        });
        break;
      case 'physical':
        material = new THREE.MeshPhysicalMaterial({
          color: color,
          metalness: opts.material.metalness,
          roughness: opts.material.roughness,
          emissive: opts.material.emissive,
          emissiveIntensity: opts.material.emissiveIntensity,
          opacity: opts.material.opacity,
          transparent: opts.material.transparent,
          wireframe: opts.material.wireframe,
        });
        break;
      case 'standard':
      default:
        material = new THREE.MeshStandardMaterial({
          color: color,
          metalness: opts.material.metalness,
          roughness: opts.material.roughness,
          emissive: opts.material.emissive,
          emissiveIntensity: opts.material.emissiveIntensity,
          opacity: opts.material.opacity,
          transparent: opts.material.transparent,
          wireframe: opts.material.wireframe,
          flatShading: opts.material.flatShading,
        });
    }

    const bar = new THREE.Mesh(geometry, material);
    bar.position.x = (datasetIndex - datasetCount / 2) * barSpacing;
    bar.position.y = height / 2;
    bar.position.z = 0;

    // Enable shadows if configured
    if (opts.enableShadows) {
      bar.castShadow = true;
      bar.receiveShadow = true;
    }

    scene.add(bar);
    
    // Add edges if enabled
    if (opts.geometry.showEdges) {
      const edges = new THREE.EdgesGeometry(geometry);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: opts.geometry.edgeColor })
      );
      line.position.copy(bar.position);
      scene.add(line);
    }
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
  ctx.fillStyle = opts.scene.backgroundColor;
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
    const color = opts.barColors?.[i] || getColorByIndex(i);
    ctx.fillStyle = color;
    ctx.fillRect(50, y - 12, 15, 15);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${dataset.label}: ${commits} commits`, 75, y);
  });
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  
  console.log(`[3D] Chart saved successfully to ${filename}!`);
}
