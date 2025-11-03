import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/**
 * Command handlers for subcommands
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'));

/**
 * Show list of supported Git platforms
 */
export function showPlatforms(): void {
  console.log(chalk.cyan.bold('\n📦 Supported Platforms:\n'));
  
  console.log(chalk.white('  🐙 github     - GitHub'));
  console.log(chalk.gray('     API: https://api.github.com'));
  console.log(chalk.gray('     Docs: https://docs.github.com/en/rest\n'));
  
  console.log(chalk.white('  🦊 gitlab     - GitLab'));
  console.log(chalk.gray('     API: https://gitlab.com/api/v4'));
  console.log(chalk.gray('     Docs: https://docs.gitlab.com/ee/api/\n'));
  
  console.log(chalk.white('  🪣 bitbucket  - Bitbucket'));
  console.log(chalk.gray('     API: https://api.bitbucket.org/2.0'));
  console.log(chalk.gray('     Docs: https://developer.atlassian.com/cloud/bitbucket/rest/\n'));
  
  console.log(chalk.white('  🎯 sourcehut  - SourceHut'));
  console.log(chalk.gray('     API: https://meta.sr.ht'));
  console.log(chalk.gray('     Docs: https://man.sr.ht/~sircmpwn/sr.ht/\n'));
  
  console.log(chalk.gray('Use: timeline -p <platform> -u <username>'));
  console.log();
}

/**
 * Show list of available chart types
 */
export function showChartTypes(): void {
  console.log(chalk.cyan.bold('\n📊 Available Chart Types:\n'));

  console.log(chalk.yellow.bold('2D Charts (Chart.js):\n'));

  console.log(chalk.white('  📈 line      - Timeline of commits over time'));
  console.log(chalk.gray('     Best for: Seeing activity patterns and trends'));
  console.log(chalk.gray('     Output: charts/timeline-line.png\n'));

  console.log(chalk.white('  📊 bar       - Compare commits across repositories'));
  console.log(chalk.gray('     Best for: Repository comparison, portfolio'));
  console.log(chalk.gray('     Output: charts/timeline-bar.png\n'));

  console.log(chalk.white('  🥧 pie       - Repository contribution percentage'));
  console.log(chalk.gray('     Best for: Understanding project distribution'));
  console.log(chalk.gray('     Output: charts/timeline-pie.png\n'));

  console.log(chalk.white('  🍩 doughnut  - Like pie chart with center hole'));
  console.log(chalk.gray('     Best for: Modern looking distribution charts'));
  console.log(chalk.gray('     Output: charts/timeline-doughnut.png\n'));

  console.log(chalk.white('  📡 radar     - Multi-dimensional comparison'));
  console.log(chalk.gray('     Best for: Comparing top 6 repositories'));
  console.log(chalk.gray('     Output: charts/timeline-radar.png\n'));

  console.log(chalk.white('  🔥 heatmap   - Activity calendar (GitHub-style)'));
  console.log(chalk.gray('     Best for: Daily activity patterns (365 days)'));
  console.log(chalk.gray('     Output: charts/timeline-heatmap.png\n'));

  console.log(chalk.white('  🎯 polarArea - Radial representation of data'));
  console.log(chalk.gray('     Best for: Circular data visualization'));
  console.log(chalk.gray('     Output: charts/timeline-polarArea.png\n'));

  console.log(chalk.white('  ⚡ scatter   - Commit distribution over time'));
  console.log(chalk.gray('     Best for: Finding patterns and outliers'));
  console.log(chalk.gray('     Output: charts/timeline-scatter.png\n'));

  console.log(chalk.white('  💬 bubble    - Multi-dimensional with bubble sizes'));
  console.log(chalk.gray('     Best for: Complex data relationships'));
  console.log(chalk.gray('     Output: charts/timeline-bubble.png\n'));

  console.log(chalk.white('  🎨 mixed     - Combination of line and bar charts'));
  console.log(chalk.gray('     Best for: Comparing different data types'));
  console.log(chalk.gray('     Output: charts/timeline-mixed.png\n'));

  console.log(chalk.yellow.bold('3D Charts (Three.js):\n'));

  console.log(chalk.white('  🎲 bar3d     - 3D bar chart'));
  console.log(chalk.gray('     Best for: Impressive 3D visualization'));
  console.log(chalk.gray('     Output: charts/timeline-bar3d.png\n'));

  console.log(chalk.white('  📈 line3d    - 3D line chart'));
  console.log(chalk.gray('     Best for: 3D timeline visualization'));
  console.log(chalk.gray('     Output: charts/timeline-line3d.png\n'));

  console.log(chalk.white('  ⚡ scatter3d - 3D scatter plot'));
  console.log(chalk.gray('     Best for: 3D distribution analysis'));
  console.log(chalk.gray('     Output: charts/timeline-scatter3d.png\n'));

  console.log(chalk.white('  🌊 surface3d - 3D surface chart'));
  console.log(chalk.gray('     Best for: Activity surface patterns'));
  console.log(chalk.gray('     Output: charts/timeline-surface3d.png\n'));

  console.log(chalk.white('  💠 bubble3d  - 3D bubble chart'));
  console.log(chalk.gray('     Best for: Multi-dimensional 3D data'));
  console.log(chalk.gray('     Output: charts/timeline-bubble3d.png\n'));

  console.log(chalk.gray('Example: timeline -t bar3d -p github -u octocat'));
  console.log();
}

/**
 * Show package information
 */
export function showPackageInfo(): void {
  console.log(chalk.cyan.bold('\n📦  Package Information:\n'));
  console.log(chalk.white('  Package:    ' + chalk.bold(packageJson.name)));
  console.log(chalk.white('  Version:    ' + chalk.bold(packageJson.version)));
  console.log(chalk.white('  Node:       ' + chalk.bold(process.version)));
  console.log(chalk.white('  Platform:   ' + chalk.bold(process.platform)));
  console.log(chalk.white('  Arch:       ' + chalk.bold(process.arch)));
  console.log(chalk.white('\n  Repository: ' + chalk.blue(packageJson.repository.url)));
  console.log(chalk.white('  Homepage:   ' + chalk.blue(packageJson.homepage)));
  console.log();
}

/**
 * Show usage examples
 */
export function showExamples(): void {
  console.log(chalk.cyan.bold('\n📚 Usage Examples:\n'));

  console.log(chalk.yellow('Basic Usage:'));
  console.log(chalk.gray('  # Interactive mode'));
  console.log(chalk.white('  $ timeline\n'));

  console.log(chalk.yellow('With Flags:'));
  console.log(chalk.gray('  # Generate line chart for GitHub user'));
  console.log(chalk.white('  $ timeline -p github -u octocat'));
  console.log(chalk.gray('  # All repositories with pie chart'));
  console.log(chalk.white('  $ timeline -p gitlab -u johndoe --all -t pie'));
  console.log(chalk.gray('  # Specific repos with bar chart'));
  console.log(chalk.white('  $ timeline -p github -u alice -r "repo1,repo2" -t bar\n'));

  console.log(chalk.yellow('Chart Customization:'));
  console.log(chalk.gray('  # Custom colors'));
  console.log(chalk.white('  $ timeline -p github -u octocat -t bar --colors "#FF5733,#33FF57"'));
  console.log(chalk.gray('  # Gradient colors'));
  console.log(chalk.white('  $ timeline -p github -u octocat -t line --gradient'));
  console.log(chalk.gray('  # No grid, no legend'));
  console.log(chalk.white('  $ timeline -p github -u octocat -t line --no-grid --no-legend\n'));

  console.log(chalk.yellow('Quick Mode:'));
  console.log(chalk.gray('  # Fast generation with minimal prompts'));
  console.log(chalk.white('  $ timeline quick -p github -u octocat'));
  console.log(chalk.gray('  # Quick with specific chart type'));
  console.log(chalk.white('  $ timeline quick -p gitlab -u johndoe -t pie\n'));

  console.log(chalk.yellow('Configuration:'));
  console.log(chalk.gray('  # View current config'));
  console.log(chalk.white('  $ timeline config'));
  console.log(chalk.gray('  # Set default values'));
  console.log(chalk.white('  $ timeline config:set\n'));

  console.log(chalk.yellow('Information:'));
  console.log(chalk.gray('  # List platforms'));
  console.log(chalk.white('  $ timeline platforms'));
  console.log(chalk.gray('  # List chart types'));
  console.log(chalk.white('  $ timeline charts\n'));

  console.log(chalk.gray('For more info: ' + chalk.blue('https://github.com/0xshariq/timeline#readme')));
  console.log();
}
