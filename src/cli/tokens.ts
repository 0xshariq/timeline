import { confirm, input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import boxen from 'boxen';
import fs from 'fs';
import path from 'path';
import os from 'os';
import type { Platform } from '../types/index.js';

/**
 * Token management utilities
 */

interface TokenConfig {
  envVar: string;
  name: string;
  instructions: string[];
  limit: string;
  urlPattern?: RegExp;
}

/**
 * Search for token in .env files (current directory and parent directories)
 */
function searchEnvFiles(envVar: string): string | null {
  const searchPaths = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), '..', '.env'),
    path.join(os.homedir(), '.env'),
  ];

  for (const envPath of searchPaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf-8');
        const lines = content.split('\n');
        
        for (const line of lines) {
          // Match: GITHUB_TOKEN=value or GITHUB_TOKEN='value' or GITHUB_TOKEN="value"
          const match = line.match(new RegExp(`^${envVar}\\s*=\\s*['"]?([^'"\\s]+)['"]?`));
          if (match && match[1]) {
            return match[1];
          }
        }
      } catch (error) {
        // Ignore read errors
      }
    }
  }
  
  return null;
}

/**
 * Detect user's shell (bash or zsh)
 */
function detectShell(): 'bash' | 'zsh' | 'fish' | 'unknown' {
  const shell = process.env.SHELL || '';
  if (shell.includes('zsh')) return 'zsh';
  if (shell.includes('bash')) return 'bash';
  if (shell.includes('fish')) return 'fish';
  return 'unknown';
}

/**
 * Get shell config file path
 */
function getShellConfigPath(shell: 'bash' | 'zsh' | 'fish'): string {
  const home = os.homedir();
  switch (shell) {
    case 'zsh':
      return path.join(home, '.zshrc');
    case 'fish':
      return path.join(home, '.config', 'fish', 'config.fish');
    case 'bash':
    default:
      return path.join(home, '.bashrc');
  }
}

/**
 * Save token to shell configuration file
 */
async function saveTokenToShellConfig(envVar: string, token: string): Promise<boolean> {
  try {
    const shell = detectShell();
    
    if (shell === 'unknown') {
      console.log(chalk.yellow('\n⚠️  Could not detect shell type'));
      console.log(chalk.gray('Manually add this to your ~/.bashrc or ~/.zshrc:'));
      console.log(chalk.cyan(`  export ${envVar}="${token}"`));
      return false;
    }

    const configPath = getShellConfigPath(shell);
    const configDir = path.dirname(configPath);

    // Create config directory if it doesn't exist (for fish)
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Check if token already exists in config
    let content = '';
    if (fs.existsSync(configPath)) {
      content = fs.readFileSync(configPath, 'utf-8');
      
      // Check if token line already exists
      const tokenRegex = new RegExp(`^.*${envVar}=.*$`, 'gm');
      if (tokenRegex.test(content)) {
        // Update existing token
        const exportLine = shell === 'fish' 
          ? `set -Ux ${envVar} "${token}"`
          : `export ${envVar}="${token}"`;
        content = content.replace(tokenRegex, exportLine);
      } else {
        // Append new token
        const exportLine = shell === 'fish'
          ? `\n# Timeline CLI token\nset -Ux ${envVar} "${token}"\n`
          : `\n# Timeline CLI token\nexport ${envVar}="${token}"\n`;
        content += exportLine;
      }
    } else {
      // Create new config file
      const exportLine = shell === 'fish'
        ? `# Timeline CLI token\nset -Ux ${envVar} "${token}"\n`
        : `# Timeline CLI token\nexport ${envVar}="${token}"\n`;
      content = exportLine;
    }

    // Write to file
    fs.writeFileSync(configPath, content, 'utf-8');
    
    console.log(chalk.green(`\n✓ Token saved to ${configPath}`));
    console.log(chalk.yellow('⚠️  Reload your shell or run:'));
    
    if (shell === 'fish') {
      console.log(chalk.cyan(`  source ${configPath}`));
    } else {
      console.log(chalk.cyan(`  source ${configPath}`));
      console.log(chalk.gray('  or start a new terminal session'));
    }
    
    return true;
  } catch (error) {
    console.log(chalk.red(`\n✗ Failed to save token: ${error instanceof Error ? error.message : 'Unknown error'}`));
    console.log(chalk.gray('Manually add this to your shell config:'));
    console.log(chalk.cyan(`  export ${envVar}="${token}"`));
    return false;
  }
}

/**
 * Validate token format
 */
function validateTokenFormat(platform: Platform, token: string): boolean {
  const patterns: Record<Platform, RegExp | null> = {
    github: /^(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82})$/,
    gitlab: /^(glpat-[a-zA-Z0-9_-]{20,}|[a-zA-Z0-9_-]{20,})$/,
    bitbucket: /^[a-zA-Z0-9]{16,}$/,
    sourcehut: null, // No specific pattern
  };

  const pattern = patterns[platform];
  if (!pattern) return token.trim().length > 0;
  
  return pattern.test(token.trim());
}

/**
 * Check for platform authentication tokens and prompt user to set if missing
 */
export async function checkAndPromptForToken(platform: Platform): Promise<void> {
  const tokenConfig: Record<Platform, TokenConfig> = {
    github: {
      envVar: 'GITHUB_TOKEN',
      name: 'GitHub',
      instructions: [
        '1. Go to https://github.com/settings/tokens',
        '2. Click "Generate new token (classic)"',
        '3. Select "public_repo" scope (or "repo" for private repos)',
        '4. Copy the token (starts with ghp_)',
      ],
      limit: '60 → 5,000 requests/hour',
      urlPattern: /^ghp_/,
    },
    gitlab: {
      envVar: 'GITLAB_TOKEN',
      name: 'GitLab',
      instructions: [
        '1. Go to https://gitlab.com/-/user_settings/personal_access_tokens',
        '2. Create a token with "read_api" scope',
        '3. Copy the token (starts with glpat-)',
      ],
      limit: 'Increases API rate limit',
      urlPattern: /^glpat-/,
    },
    bitbucket: {
      envVar: 'BITBUCKET_APP_PASSWORD',
      name: 'Bitbucket',
      instructions: [
        '1. Go to https://bitbucket.org/account/settings/app-passwords/',
        '2. Create an app password with "Repositories: Read" permission',
        '3. Copy the password',
      ],
      limit: 'Better rate limits',
    },
    sourcehut: {
      envVar: 'SOURCEHUT_TOKEN',
      name: 'SourceHut',
      instructions: [
        '1. Go to https://meta.sr.ht/oauth',
        '2. Create a personal access token',
        '3. Copy the token',
      ],
      limit: 'Required for API access',
    }
  };

  const config = tokenConfig[platform];
  if (!config) return;

  // Step 1: Check environment variable
  let token = process.env[config.envVar];
  
  // Step 2: If not in env, search .env files
  if (!token) {
    token = searchEnvFiles(config.envVar);
    if (token) {
      process.env[config.envVar] = token;
      console.log(chalk.green(`✓ ${config.name} token found in .env file`));
      return;
    }
  } else {
    console.log(chalk.green(`✓ ${config.name} token found in environment`));
    return;
  }

  // Step 3: Token not found, prompt user
  console.log('\n' + boxen(
    chalk.yellow.bold('⚠️  Authentication Token Not Found\n\n') +
    chalk.white(`${config.name} API requires authentication for better service\n`) +
    chalk.gray(`Benefit: ${config.limit}\n\n`) +
    chalk.cyan.bold('How to get a token:\n') +
    config.instructions.map((i: string) => chalk.gray('  ' + i)).join('\n') +
    chalk.white('\n\nWithout a token, you may experience:') +
    chalk.red('\n  • Rate limit errors (403 Forbidden)') +
    chalk.red('\n  • Reduced API access') +
    chalk.red('\n  • Failed requests'),
    {
      padding: 1,
      margin: 0,
      borderStyle: 'round',
      borderColor: 'yellow',
    }
  ));

  const shouldSetToken = await confirm({
    message: chalk.cyan(`\nWould you like to set up a ${config.name} token now?`),
    default: true,
  });

  if (!shouldSetToken) {
    console.log(chalk.yellow(`\n⚠️  Continuing without token - you may hit rate limits!\n`));
    return;
  }

  // Prompt for token
  const newToken = await input({
    message: chalk.cyan(`Enter your ${config.name} token:`),
    validate: (value) => {
      if (value.trim() === '') {
        return 'Token cannot be empty (press Ctrl+C to cancel)';
      }
      
      if (!validateTokenFormat(platform, value)) {
        return `Invalid ${config.name} token format. Please check and try again.`;
      }
      
      return true;
    },
  });

  if (!newToken || !newToken.trim()) {
    console.log(chalk.yellow('\n⚠️  No token provided. Continuing without authentication.\n'));
    return;
  }

  const trimmedToken = newToken.trim();
  
  // Set for current session
  process.env[config.envVar] = trimmedToken;
  console.log(chalk.green('\n✓ Token set for this session!'));

  // Ask where to save permanently
  const shell = detectShell();
  const shellConfigPath = shell !== 'unknown' ? getShellConfigPath(shell) : '~/.bashrc or ~/.zshrc';
  
  const saveOption = await select({
    message: chalk.cyan('Where would you like to save this token permanently?'),
    choices: [
      {
        name: `${shell.toUpperCase()} config file (${shellConfigPath})`,
        value: 'shell',
        description: 'Recommended: Available in all terminal sessions'
      },
      {
        name: '.env file (current directory)',
        value: 'dotenv',
        description: 'Project-specific: Only for this directory'
      },
      {
        name: 'Skip - use only for this session',
        value: 'skip',
        description: 'Temporary: Token will be lost when terminal closes'
      },
    ],
  });

  if (saveOption === 'shell') {
    await saveTokenToShellConfig(config.envVar, trimmedToken);
  } else if (saveOption === 'dotenv') {
    try {
      const envPath = path.join(process.cwd(), '.env');
      let content = '';
      
      if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf-8');
        
        // Check if token already exists
        const tokenRegex = new RegExp(`^${config.envVar}=.*$`, 'gm');
        if (tokenRegex.test(content)) {
          content = content.replace(tokenRegex, `${config.envVar}='${trimmedToken}'`);
        } else {
          content += `\n${config.envVar}='${trimmedToken}'\n`;
        }
      } else {
        content = `${config.envVar}='${trimmedToken}'\n`;
      }
      
      fs.writeFileSync(envPath, content, 'utf-8');
      console.log(chalk.green(`\n✓ Token saved to .env file`));
      console.log(chalk.yellow('⚠️  Remember to add .env to .gitignore!'));
    } catch (error) {
      console.log(chalk.red(`\n✗ Failed to save to .env: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  } else {
    console.log(chalk.gray('\n Token will only be available for this session'));
  }

  console.log('');
}
