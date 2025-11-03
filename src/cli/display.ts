import gradient from 'gradient-string';

/**
 * Display utilities for CLI
 */

// Custom gradient theme
const titleGradient = gradient(['#FF6B6B', '#4ECDC4', '#45B7D1']);

/**
 * Display the application banner
 */
export function displayBanner(): void {
  const banner = `
╔═══════════════════════════════════════════╗
║   Repository Timeline Generator 📊        ║
║   Multi-Platform Git Analytics            ║
╚═══════════════════════════════════════════╝
  `;
  console.log(titleGradient(banner));
}
