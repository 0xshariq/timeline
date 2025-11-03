/**
 * 3D Charts - Utility Functions
 */

import * as THREE from 'three';

/**
 * Get color for dataset as THREE.js compatible number
 */
export function getColorForDataset(index: number): number {
  const colors = [
    0xFF6B6B, // Red
    0x4ECDC4, // Teal
    0x45B7D1, // Blue
    0xFECA57, // Yellow
    0x00D2D3, // Cyan
    0xA29BFE, // Purple
    0xFD79A8, // Pink
    0x6C5CE7, // Indigo
    0xFDCB6E, // Orange
    0x00B894, // Green
  ];
  return colors[index % colors.length];
}

/**
 * Create a text sprite for 3D labels
 * Note: This is a placeholder for Node.js environments where DOM is not available
 */
export function createTextSprite(text: string, scale: number = 1): THREE.Sprite {
  // In Node.js environment, we don't have access to DOM canvas
  // Create a simple colored sprite as fallback
  const material = new THREE.SpriteMaterial({ color: 0xffffff });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(scale * 4, scale * 2, 1);
  
  return sprite;
}

/**
 * Setup basic scene lighting
 */
export function setupSceneLighting(scene: THREE.Scene): void {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Directional light 1
  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight1.position.set(10, 20, 10);
  scene.add(directionalLight1);

  // Directional light 2 (fill light)
  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight2.position.set(-10, 10, -10);
  scene.add(directionalLight2);
}

/**
 * Create a basic floor grid
 */
export function createFloorGrid(size: number, divisions: number = 20): THREE.GridHelper {
  return new THREE.GridHelper(size, divisions, 0x444444, 0x222222);
}

/**
 * Create axes helper
 */
export function createAxesHelper(size: number = 10): THREE.AxesHelper {
  return new THREE.AxesHelper(size);
}
