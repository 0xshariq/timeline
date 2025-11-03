/**
 * 3D Chart Customization Options
 * Separate from 2D chart options to avoid conflicts
 * Provides full Three.js customization capabilities
 */

// Camera Configuration
export interface CameraOptions {
  type: 'perspective' | 'orthographic';
  position: { x: number; y: number; z: number };
  fov: number; // Field of view for perspective camera
  zoom: number;
  near: number; // Near clipping plane
  far: number; // Far clipping plane
}

// Lighting Configuration
export interface LightingOptions {
  ambient: {
    enabled: boolean;
    color: string;
    intensity: number;
  };
  directional: {
    enabled: boolean;
    color: string;
    intensity: number;
    position: { x: number; y: number; z: number };
    castShadow: boolean;
  };
  point: {
    enabled: boolean;
    color: string;
    intensity: number;
    position: { x: number; y: number; z: number };
    distance: number;
  };
  spotlight: {
    enabled: boolean;
    color: string;
    intensity: number;
    position: { x: number; y: number; z: number };
    angle: number;
  };
}

// Material Configuration
export interface MaterialOptions {
  type: 'standard' | 'phong' | 'lambert' | 'basic' | 'physical';
  color: string;
  metalness: number; // 0-1
  roughness: number; // 0-1
  opacity: number; // 0-1
  transparent: boolean;
  emissive: string; // Glow color
  emissiveIntensity: number;
  wireframe: boolean;
  flatShading: boolean;
}

// Geometry/Shape Configuration
export interface GeometryOptions {
  type: 'box' | 'cylinder' | 'sphere' | 'cone' | 'torus' | 'capsule';
  width: number;
  height: number;
  depth: number;
  segments: number; // Detail level
  showEdges: boolean;
  edgeColor: string;
}

// Scene Configuration
export interface SceneOptions {
  backgroundColor: string;
  fog: {
    enabled: boolean;
    color: string;
    near: number;
    far: number;
  };
  showGrid: boolean;
  gridSize: number;
  gridDivisions: number;
  showAxes: boolean;
  axesSize: number;
}

// Animation Configuration
export interface AnimationOptions {
  enabled: boolean;
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  autoRotate: boolean;
  autoRotateSpeed: number;
}

// Post-Processing Effects
export interface PostProcessingOptions {
  bloom: {
    enabled: boolean;
    strength: number;
    radius: number;
    threshold: number;
  };
  outline: {
    enabled: boolean;
    color: string;
    thickness: number;
  };
}

// Main 3D Chart Options Interface
export interface Chart3DOptions {
  // Core options
  camera: CameraOptions;
  lighting: LightingOptions;
  material: MaterialOptions;
  geometry: GeometryOptions;
  scene: SceneOptions;
  animation: AnimationOptions;
  postProcessing: PostProcessingOptions;
  
  // Chart-specific
  barColors?: string[];
  renderQuality: 'low' | 'medium' | 'high' | 'ultra';
  enableShadows: boolean;
  enableAntialiasing: boolean;
}

/**
 * Default 3D chart options with sensible defaults
 */
export const default3DOptions: Chart3DOptions = {
  camera: {
    type: 'perspective',
    position: { x: 20, y: 15, z: 20 },
    fov: 75,
    zoom: 1,
    near: 0.1,
    far: 1000,
  },
  lighting: {
    ambient: {
      enabled: true,
      color: '#ffffff',
      intensity: 0.5,
    },
    directional: {
      enabled: true,
      color: '#ffffff',
      intensity: 0.8,
      position: { x: 10, y: 20, z: 10 },
      castShadow: true,
    },
    point: {
      enabled: false,
      color: '#ffffff',
      intensity: 1,
      position: { x: 0, y: 10, z: 0 },
      distance: 100,
    },
    spotlight: {
      enabled: false,
      color: '#ffffff',
      intensity: 1,
      position: { x: 0, y: 20, z: 0 },
      angle: Math.PI / 6,
    },
  },
  material: {
    type: 'standard',
    color: '#4ECDC4',
    metalness: 0.3,
    roughness: 0.4,
    opacity: 1,
    transparent: false,
    emissive: '#4ECDC4',
    emissiveIntensity: 0.1,
    wireframe: false,
    flatShading: false,
  },
  geometry: {
    type: 'box',
    width: 0.8,
    height: 10,
    depth: 0.8,
    segments: 1,
    showEdges: false,
    edgeColor: '#000000',
  },
  scene: {
    backgroundColor: '#1a1a1a',
    fog: {
      enabled: false,
      color: '#1a1a1a',
      near: 10,
      far: 100,
    },
    showGrid: true,
    gridSize: 50,
    gridDivisions: 50,
    showAxes: true,
    axesSize: 15,
  },
  animation: {
    enabled: false,
    rotation: { x: 0, y: 0.01, z: 0 },
    autoRotate: false,
    autoRotateSpeed: 1,
  },
  postProcessing: {
    bloom: {
      enabled: false,
      strength: 1.5,
      radius: 0.4,
      threshold: 0.85,
    },
    outline: {
      enabled: false,
      color: '#00ff00',
      thickness: 2,
    },
  },
  barColors: undefined,
  renderQuality: 'high',
  enableShadows: true,
  enableAntialiasing: true,
};

/**
 * Merge user options with defaults (deep merge)
 */
export function merge3DOptions(userOptions?: Partial<Chart3DOptions>): Chart3DOptions {
  if (!userOptions) return { ...default3DOptions };
  
  return {
    camera: { ...default3DOptions.camera, ...userOptions.camera },
    lighting: {
      ambient: { ...default3DOptions.lighting.ambient, ...userOptions.lighting?.ambient },
      directional: { ...default3DOptions.lighting.directional, ...userOptions.lighting?.directional },
      point: { ...default3DOptions.lighting.point, ...userOptions.lighting?.point },
      spotlight: { ...default3DOptions.lighting.spotlight, ...userOptions.lighting?.spotlight },
    },
    material: { ...default3DOptions.material, ...userOptions.material },
    geometry: { ...default3DOptions.geometry, ...userOptions.geometry },
    scene: {
      ...default3DOptions.scene,
      ...userOptions.scene,
      fog: { ...default3DOptions.scene.fog, ...userOptions.scene?.fog },
    },
    animation: { ...default3DOptions.animation, ...userOptions.animation },
    postProcessing: {
      bloom: { ...default3DOptions.postProcessing.bloom, ...userOptions.postProcessing?.bloom },
      outline: { ...default3DOptions.postProcessing.outline, ...userOptions.postProcessing?.outline },
    },
    barColors: userOptions.barColors || default3DOptions.barColors,
    renderQuality: userOptions.renderQuality || default3DOptions.renderQuality,
    enableShadows: userOptions.enableShadows ?? default3DOptions.enableShadows,
    enableAntialiasing: userOptions.enableAntialiasing ?? default3DOptions.enableAntialiasing,
  };
}
