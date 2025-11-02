import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import ora from 'ora';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readdirSync } from 'fs';
import { homedir } from 'os';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function findCanvasPath() {
  const searchPaths = [];
  
  // Local paths (project installation)
  searchPaths.push(
    join(__dirname, '../../node_modules/canvas'),
    join(__dirname, '../../../node_modules/canvas'),
    join(__dirname, '../../../../node_modules/canvas')
  );
  
  // Global pnpm paths (check multiple versions)
  const pnpmGlobalBase = join(homedir(), '.local/share/pnpm/global');
  if (existsSync(pnpmGlobalBase)) {
    try {
      const versions = readdirSync(pnpmGlobalBase).filter(f => f.match(/^\d+$/));
      for (const version of versions) {
        const pnpmDir = join(pnpmGlobalBase, version, '.pnpm');
        if (existsSync(pnpmDir)) {
          const pnpmPackages = readdirSync(pnpmDir);
          for (const pkg of pnpmPackages) {
            if (pkg.startsWith('canvas@')) {
              searchPaths.push(join(pnpmDir, pkg, 'node_modules/canvas'));
            }
          }
        }
      }
    } catch (err) {
      // Ignore errors reading directories
    }
  }
  
  // Global npm paths
  searchPaths.push(
    '/usr/local/lib/node_modules/canvas',
    '/usr/lib/node_modules/canvas',
    join(homedir(), '.npm-global/lib/node_modules/canvas')
  );
  
  // Global yarn path
  try {
    const { stdout } = await execAsync('yarn global dir 2>/dev/null || echo ""');
    if (stdout.trim()) {
      searchPaths.push(join(stdout.trim(), 'node_modules/canvas'));
    }
  } catch {}
  
  // Check all paths
  for (const path of searchPaths) {
    if (existsSync(path)) {
      return path;
    }
  }
  
  return null;
}

async function rebuildCanvas(canvasPath) {
  const commands = [
    // Try node-gyp rebuild
    'node-gyp rebuild',
    // Try npm rebuild
    'npm rebuild',
    // Try pnpm rebuild
    'pnpm rebuild',
    // Try direct prebuild-install
    'npm run install || true'
  ];
  
  for (const cmd of commands) {
    try {
      await execAsync(cmd, {
        cwd: canvasPath,
        timeout: 120000, // 2 minutes
        shell: '/bin/bash',
        stdio: 'pipe'
      });
      return true; // Success!
    } catch (error) {
      // Try next command
      continue;
    }
  }
  
  return false;
}

export async function ensureCanvasWorks() {
  // ALWAYS rebuild canvas on every run for reliability
  const spinner = ora({
    text: chalk.cyan('Preparing canvas module...'),
    color: 'cyan',
  }).start();

  try {
    // Find canvas installation
    const canvasPath = await findCanvasPath();
    
    if (!canvasPath) {
      spinner.fail(chalk.red('Could not locate canvas module'));
      await installSystemDependencies();
      throw new Error('Canvas module not found. System dependencies may be missing.');
    }

    // Rebuild canvas silently every time
    spinner.text = chalk.cyan('Rebuilding canvas...');
    const success = await rebuildCanvas(canvasPath);
    
    if (!success) {
      spinner.fail(chalk.red('Canvas rebuild failed'));
      await installSystemDependencies();
      throw new Error('Canvas rebuild failed. System dependencies may be missing.');
    }
    
    spinner.succeed(chalk.green('✓ Canvas ready'));
    
    // Verify import works
    try {
      await import('canvas');
      return true;
    } catch (importError) {
      console.log(chalk.yellow('⚠️  Canvas rebuilt but import still failing.'));
      await installSystemDependencies();
      throw new Error('Canvas needs system dependencies. See instructions above.');
    }
  } catch (error) {
    spinner.fail(chalk.red('Canvas setup failed'));
    console.log(chalk.yellow('\n⚠️  Canvas setup failed. Please check system dependencies.\n'));
    await installSystemDependencies();
    throw error;
  }
}

async function installSystemDependencies() {
  console.log(chalk.yellow('\n📦 Canvas requires system dependencies.\n'));
  
  console.log(chalk.white('Please run ONE of these commands:\n'));
  
  console.log(chalk.cyan('Ubuntu/Debian:'));
  console.log(chalk.gray('  sudo apt update && sudo apt install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev\n'));
  
  console.log(chalk.cyan('macOS:'));
  console.log(chalk.gray('  brew install pkg-config cairo pango libpng jpeg giflib librsvg\n'));
  
  console.log(chalk.cyan('Fedora/RHEL:'));
  console.log(chalk.gray('  sudo dnf install gcc-c++ cairo-devel pango-devel libjpeg-turbo-devel giflib-devel\n'));
  
  console.log(chalk.white('After installing dependencies, reinstall the package:\n'));
  
  const packageManager = process.env.npm_config_user_agent?.includes('pnpm') ? 'pnpm' : 
                        process.env.npm_config_user_agent?.includes('yarn') ? 'yarn' : 'npm';
  
  if (packageManager === 'pnpm') {
    console.log(chalk.gray('  pnpm remove -g @0xshariq/timeline'));
    console.log(chalk.gray('  pnpm add -g @0xshariq/timeline\n'));
  } else if (packageManager === 'npm') {
    console.log(chalk.gray('  npm uninstall -g @0xshariq/timeline'));
    console.log(chalk.gray('  npm install -g @0xshariq/timeline\n'));
  } else {
    console.log(chalk.gray('  yarn global remove @0xshariq/timeline'));
    console.log(chalk.gray('  yarn global add @0xshariq/timeline\n'));
  }
  
  console.log(chalk.cyan('📖 Full guide: TROUBLESHOOTING.md\n'));
}

export async function checkCanvasOnStartup() {
  try {
    await ensureCanvasWorks();
  } catch (error) {
    // Error already logged
    process.exit(1);
  }
}
