/**
 * 3D Isometric Renderer
 * Shared utilities for rendering 3D charts using 2D canvas with isometric projection
 */

/**
 * 3D Point
 */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * 2D Point
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * Project 3D point to 2D isometric coordinates
 */
export function projectToIsometric(point: Point3D, angleX: number, angleY: number): Point2D {
  const cosX = Math.cos(angleX);
  const sinX = Math.sin(angleX);
  const cosY = Math.cos(angleY);
  const sinY = Math.sin(angleY);
  
  const x2d = point.x * cosY - point.z * sinY;
  const y2d = point.y - (point.x * sinY + point.z * cosY) * sinX;
  
  return { x: x2d, y: y2d };
}

/**
 * Lighten a hex color
 */
export function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

/**
 * Darken a hex color
 */
export function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

/**
 * Draw an isometric 3D box/bar on canvas
 */
export function drawIsometricBar(
  ctx: any,
  x: number,
  y: number,
  width: number,
  height: number,
  depth: number,
  color: string,
  showEdges: boolean = true
) {
  const isoAngle = Math.PI / 6; // 30 degrees
  
  const isoX = (x - y) * Math.cos(isoAngle);
  const isoY = (x + y) * Math.sin(isoAngle) - height;
  
  // Top face
  ctx.fillStyle = lightenColor(color, 20);
  ctx.beginPath();
  ctx.moveTo(isoX, isoY);
  ctx.lineTo(isoX + width * Math.cos(isoAngle), isoY - width * Math.sin(isoAngle));
  ctx.lineTo(isoX + width * Math.cos(isoAngle) - depth * Math.cos(isoAngle), isoY - width * Math.sin(isoAngle) - depth * Math.sin(isoAngle));
  ctx.lineTo(isoX - depth * Math.cos(isoAngle), isoY - depth * Math.sin(isoAngle));
  ctx.closePath();
  ctx.fill();
  
  if (showEdges) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  // Right face
  ctx.fillStyle = darkenColor(color, 10);
  ctx.beginPath();
  ctx.moveTo(isoX + width * Math.cos(isoAngle), isoY - width * Math.sin(isoAngle));
  ctx.lineTo(isoX + width * Math.cos(isoAngle), isoY - width * Math.sin(isoAngle) + height);
  ctx.lineTo(isoX + width * Math.cos(isoAngle) - depth * Math.cos(isoAngle), isoY - width * Math.sin(isoAngle) - depth * Math.sin(isoAngle) + height);
  ctx.lineTo(isoX + width * Math.cos(isoAngle) - depth * Math.cos(isoAngle), isoY - width * Math.sin(isoAngle) - depth * Math.sin(isoAngle));
  ctx.closePath();
  ctx.fill();
  
  if (showEdges) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  // Left face
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(isoX, isoY);
  ctx.lineTo(isoX, isoY + height);
  ctx.lineTo(isoX + width * Math.cos(isoAngle), isoY - width * Math.sin(isoAngle) + height);
  ctx.lineTo(isoX + width * Math.cos(isoAngle), isoY - width * Math.sin(isoAngle));
  ctx.closePath();
  ctx.fill();
  
  if (showEdges) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

/**
 * Draw an isometric 3D sphere/bubble
 */
export function drawIsometricSphere(
  ctx: any,
  x: number,
  y: number,
  radius: number,
  color: string,
  showEdges: boolean = true
) {
  const isoAngle = Math.PI / 6;
  const isoX = (x - y) * Math.cos(isoAngle);
  const isoY = (x + y) * Math.sin(isoAngle);
  
  // Draw ellipse for isometric sphere
  ctx.save();
  ctx.translate(isoX, isoY);
  ctx.scale(1, 0.5); // Flatten for isometric view
  
  // Gradient for 3D effect
  const gradient = ctx.createRadialGradient(0, -radius * 0.3, 0, 0, 0, radius);
  gradient.addColorStop(0, lightenColor(color, 40));
  gradient.addColorStop(0.5, color);
  gradient.addColorStop(1, darkenColor(color, 20));
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  
  if (showEdges) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  ctx.restore();
}

/**
 * Draw an isometric 3D cylinder
 */
export function drawIsometricCylinder(
  ctx: any,
  x: number,
  y: number,
  radius: number,
  height: number,
  color: string,
  showEdges: boolean = true
) {
  const isoAngle = Math.PI / 6;
  const isoX = (x - y) * Math.cos(isoAngle);
  const isoY = (x + y) * Math.sin(isoAngle) - height;
  
  // Top ellipse
  ctx.save();
  ctx.translate(isoX, isoY);
  ctx.scale(1, 0.5);
  
  ctx.fillStyle = lightenColor(color, 20);
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  
  if (showEdges) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  ctx.restore();
  
  // Side faces
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(isoX - radius, isoY);
  ctx.lineTo(isoX - radius, isoY + height);
  ctx.arc(isoX, isoY + height, radius, Math.PI, 0, false);
  ctx.lineTo(isoX + radius, isoY);
  ctx.closePath();
  ctx.fill();
  
  if (showEdges) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

/**
 * Draw isometric grid
 */
export function drawIsometricGrid(
  ctx: any,
  centerX: number,
  centerY: number,
  size: number,
  divisions: number,
  color: string = '#333333'
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  
  const isoAngle = Math.PI / 6;
  const step = size / divisions;
  
  // Draw grid lines
  for (let i = -divisions; i <= divisions; i++) {
    const offset = i * step;
    
    // Horizontal lines (in X direction)
    ctx.beginPath();
    const x1 = centerX + (-size - offset) * Math.cos(isoAngle);
    const y1 = centerY + (-size - offset) * Math.sin(isoAngle);
    const x2 = centerX + (size - offset) * Math.cos(isoAngle);
    const y2 = centerY + (size - offset) * Math.sin(isoAngle);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Vertical lines (in Y direction)
    ctx.beginPath();
    const x3 = centerX + (offset - size) * Math.cos(isoAngle);
    const y3 = centerY + (offset + size) * Math.sin(isoAngle);
    const x4 = centerX + (offset + size) * Math.cos(isoAngle);
    const y4 = centerY + (offset - size) * Math.sin(isoAngle);
    ctx.moveTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.stroke();
  }
}

/**
 * Draw 3D line/path in isometric view
 */
export function drawIsometric3DLine(
  ctx: any,
  points: Array<{x: number, y: number, z: number}>,
  color: string,
  lineWidth: number = 3
) {
  if (points.length < 2) return;
  
  const isoAngle = Math.PI / 6;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  
  points.forEach((point, index) => {
    const isoX = (point.x - point.y) * Math.cos(isoAngle);
    const isoY = (point.x + point.y) * Math.sin(isoAngle) - point.z;
    
    if (index === 0) {
      ctx.moveTo(isoX, isoY);
    } else {
      ctx.lineTo(isoX, isoY);
    }
  });
  
  ctx.stroke();
  
  // Draw points at each vertex
  points.forEach(point => {
    const isoX = (point.x - point.y) * Math.cos(isoAngle);
    const isoY = (point.x + point.y) * Math.sin(isoAngle) - point.z;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(isoX, isoY, lineWidth * 1.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * Draw common elements for 3D charts
 */
export function draw3DChartBase(
  ctx: any,
  width: number,
  height: number,
  username: string,
  platform: string,
  totalCommits: number,
  datasetCount: number,
  backgroundColor: string,
  showGrid: boolean = true
) {
  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  // Draw grid if enabled
  if (showGrid) {
    drawIsometricGrid(ctx, width / 2, height - 150, 400, 10, '#333333');
  }
  
  // Draw title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${username}'s Commit Timeline (3D)`, width / 2, 60);
  
  // Draw subtitle
  ctx.font = '24px Arial';
  ctx.fillStyle = '#888888';
  ctx.fillText(`${platform} • ${totalCommits} total commits • ${datasetCount} repositories`, width / 2, 100);
}

/**
 * Alias for drawIsometricSphere for simpler API
 */
export const drawSphere = drawIsometricSphere;
