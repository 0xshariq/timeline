/**
 * 3D Chart Customization Prompts
 * Interactive prompts for customizing 3D charts
 */

import { select, confirm, input, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import type { Chart3DOptions } from './options.js';
import { default3DOptions } from './options.js';

/**
 * Prompt user for 3D chart customization
 */
export async function promptFor3DCustomization(): Promise<Chart3DOptions | undefined> {
  // Show default 3D customization values
  console.log('\n' + chalk.cyan.bold('🎨 Default 3D Chart Customization:'));
  console.log(chalk.gray('━'.repeat(50)));
  console.log(chalk.white(`  Camera Type:      ${chalk.bold(default3DOptions.camera.type)}`));
  console.log(chalk.white(`  Camera Position:  ${chalk.bold(`(${default3DOptions.camera.position.x}, ${default3DOptions.camera.position.y}, ${default3DOptions.camera.position.z})`)}`));
  console.log(chalk.white(`  Geometry Type:    ${chalk.bold(default3DOptions.geometry.type)}`));
  console.log(chalk.white(`  Material Type:    ${chalk.bold(default3DOptions.material.type)}`));
  console.log(chalk.white(`  Metalness:        ${chalk.bold(default3DOptions.material.metalness)}`));
  console.log(chalk.white(`  Roughness:        ${chalk.bold(default3DOptions.material.roughness)}`));
  console.log(chalk.white(`  Lighting:         ${chalk.bold('Ambient + Directional')}`));
  console.log(chalk.white(`  Background:       ${chalk.bold(default3DOptions.scene.backgroundColor)}`));
  console.log(chalk.white(`  Shadows:          ${chalk.bold(default3DOptions.lighting.directional.castShadow ? 'Enabled' : 'Disabled')}`));
  console.log(chalk.white(`  Antialiasing:     ${chalk.bold(default3DOptions.enableAntialiasing ? 'Enabled' : 'Disabled')}`));
  console.log(chalk.white(`  Grid:             ${chalk.bold(default3DOptions.scene.showGrid ? 'Visible' : 'Hidden')}`));
  console.log(chalk.white(`  Axes:             ${chalk.bold(default3DOptions.scene.showAxes ? 'Visible' : 'Hidden')}`));
  console.log(chalk.gray('━'.repeat(50)));

  const wantsCustomization = await confirm({
    message: chalk.cyan('\nDo you want to customize these 3D settings?'),
    default: false,
  });

  if (!wantsCustomization) {
    return undefined; // Use defaults
  }

  const customization: Partial<Chart3DOptions> = {
    camera: { ...default3DOptions.camera },
    material: { ...default3DOptions.material },
    geometry: { ...default3DOptions.geometry },
    lighting: { ...default3DOptions.lighting },
    scene: { ...default3DOptions.scene },
    animation: { ...default3DOptions.animation },
    postProcessing: { ...default3DOptions.postProcessing },
    enableAntialiasing: default3DOptions.enableAntialiasing,
    enableShadows: default3DOptions.enableShadows,
    renderQuality: default3DOptions.renderQuality,
  };

  // Camera customization
  const cameraType = await select({
    message: chalk.cyan('Camera type:'),
    choices: [
      { name: 'Perspective (realistic depth)', value: 'perspective' },
      { name: 'Orthographic (no perspective distortion)', value: 'orthographic' },
    ],
  });
  customization.camera!.type = cameraType as 'perspective' | 'orthographic';

  const customizeCameraPos = await confirm({
    message: chalk.cyan('Customize camera position?'),
    default: false,
  });

  if (customizeCameraPos) {
    const x = await input({
      message: chalk.cyan('Camera X position:'),
      default: '20',
      validate: (value) => !isNaN(parseFloat(value)) || 'Please enter a valid number',
    });
    const y = await input({
      message: chalk.cyan('Camera Y position:'),
      default: '15',
      validate: (value) => !isNaN(parseFloat(value)) || 'Please enter a valid number',
    });
    const z = await input({
      message: chalk.cyan('Camera Z position:'),
      default: '20',
      validate: (value) => !isNaN(parseFloat(value)) || 'Please enter a valid number',
    });
    customization.camera!.position = {
      x: parseFloat(x),
      y: parseFloat(y),
      z: parseFloat(z),
    };
  }

  // Geometry customization
  const geometryType = await select({
    message: chalk.cyan('Geometry shape:'),
    choices: [
      { name: 'Box (cube/rectangular)', value: 'box' },
      { name: 'Cylinder (circular bars)', value: 'cylinder' },
      { name: 'Sphere (round)', value: 'sphere' },
      { name: 'Cone (pointed)', value: 'cone' },
      { name: 'Torus (donut-shaped)', value: 'torus' },
      { name: 'Capsule (pill-shaped)', value: 'capsule' },
    ],
  });
  customization.geometry!.type = geometryType as any;

  const showEdges = await confirm({
    message: chalk.cyan('Show geometry edges?'),
    default: false,
  });
  customization.geometry!.showEdges = showEdges;

  // Material customization
  const materialType = await select({
    message: chalk.cyan('Material type:'),
    choices: [
      { name: 'Standard (realistic PBR)', value: 'standard' },
      { name: 'Phong (shiny/glossy)', value: 'phong' },
      { name: 'Lambert (matte/diffuse)', value: 'lambert' },
      { name: 'Basic (unlit/flat)', value: 'basic' },
      { name: 'Physical (advanced PBR)', value: 'physical' },
    ],
  });
  customization.material!.type = materialType as any;

  if (materialType === 'standard' || materialType === 'physical') {
    const metalness = await input({
      message: chalk.cyan('Metalness (0-1, 0=dielectric, 1=metallic):'),
      default: '0.3',
      validate: (value) => {
        const num = parseFloat(value);
        return (!isNaN(num) && num >= 0 && num <= 1) || 'Please enter a number between 0 and 1';
      },
    });
    customization.material!.metalness = parseFloat(metalness);

    const roughness = await input({
      message: chalk.cyan('Roughness (0-1, 0=smooth, 1=rough):'),
      default: '0.4',
      validate: (value) => {
        const num = parseFloat(value);
        return (!isNaN(num) && num >= 0 && num <= 1) || 'Please enter a number between 0 and 1';
      },
    });
    customization.material!.roughness = parseFloat(roughness);
  }

  const enableTransparency = await confirm({
    message: chalk.cyan('Enable material transparency?'),
    default: false,
  });

  if (enableTransparency) {
    customization.material!.transparent = true;
    const opacity = await input({
      message: chalk.cyan('Opacity (0-1, 0=invisible, 1=opaque):'),
      default: '0.8',
      validate: (value) => {
        const num = parseFloat(value);
        return (!isNaN(num) && num >= 0 && num <= 1) || 'Please enter a number between 0 and 1';
      },
    });
    customization.material!.opacity = parseFloat(opacity);
  }

  const enableWireframe = await confirm({
    message: chalk.cyan('Enable wireframe mode?'),
    default: false,
  });
  customization.material!.wireframe = enableWireframe;

  // Lighting customization
  const lightingOptions = await checkbox({
    message: chalk.cyan('Select lighting types to enable:'),
    choices: [
      { name: 'Ambient Light (overall illumination)', value: 'ambient', checked: true },
      { name: 'Directional Light (sun-like)', value: 'directional', checked: true },
      { name: 'Point Light (bulb-like)', value: 'point' },
      { name: 'Spotlight (focused cone)', value: 'spotlight' },
    ],
  });

  customization.lighting!.ambient.enabled = lightingOptions.includes('ambient');
  customization.lighting!.directional.enabled = lightingOptions.includes('directional');
  customization.lighting!.point.enabled = lightingOptions.includes('point');
  customization.lighting!.spotlight.enabled = lightingOptions.includes('spotlight');

  if (lightingOptions.includes('directional')) {
    const enableShadows = await confirm({
      message: chalk.cyan('Enable directional light shadows?'),
      default: true,
    });
    customization.lighting!.directional.castShadow = enableShadows;
  }

  // Scene customization
  const backgroundColor = await input({
    message: chalk.cyan('Scene background color (hex):'),
    default: '#1a1a1a',
    validate: (value) => /^#[0-9A-Fa-f]{6}$/.test(value) || 'Please enter a valid hex color (e.g., #1a1a1a)',
  });
  customization.scene!.backgroundColor = backgroundColor;

  const enableFog = await confirm({
    message: chalk.cyan('Enable atmospheric fog?'),
    default: false,
  });
  customization.scene!.fog.enabled = enableFog;

  if (enableFog) {
    const fogColor = await input({
      message: chalk.cyan('Fog color (hex):'),
      default: '#1a1a1a',
      validate: (value) => /^#[0-9A-Fa-f]{6}$/.test(value) || 'Please enter a valid hex color',
    });
    customization.scene!.fog.color = fogColor;
  }

  const showGrid = await confirm({
    message: chalk.cyan('Show floor grid?'),
    default: true,
  });
  customization.scene!.showGrid = showGrid;

  const showAxes = await confirm({
    message: chalk.cyan('Show coordinate axes?'),
    default: true,
  });
  customization.scene!.showAxes = showAxes;

  // Animation customization
  const enableAnimation = await confirm({
    message: chalk.cyan('Enable scene animation?'),
    default: false,
  });
  customization.animation!.enabled = enableAnimation;

  if (enableAnimation) {
    const autoRotate = await confirm({
      message: chalk.cyan('Enable auto-rotation?'),
      default: true,
    });
    customization.animation!.autoRotate = autoRotate;

    if (autoRotate) {
      const rotateSpeed = await input({
        message: chalk.cyan('Auto-rotate speed (degrees per second):'),
        default: '1',
        validate: (value) => !isNaN(parseFloat(value)) || 'Please enter a valid number',
      });
      customization.animation!.autoRotateSpeed = parseFloat(rotateSpeed);
    }
  }

  // Post-processing effects
  const enableEffects = await checkbox({
    message: chalk.cyan('Select post-processing effects:'),
    choices: [
      { name: 'Bloom (glow effect)', value: 'bloom' },
      { name: 'Outline (edge highlighting)', value: 'outline' },
    ],
  });

  customization.postProcessing!.bloom.enabled = enableEffects.includes('bloom');
  customization.postProcessing!.outline.enabled = enableEffects.includes('outline');

  // Render quality
  const antialias = await confirm({
    message: chalk.cyan('Enable antialiasing (smoother edges)?'),
    default: true,
  });
  customization.enableAntialiasing = antialias;

  console.log(chalk.green('\n✅ 3D customization complete!'));

  return customization as Chart3DOptions;
}
