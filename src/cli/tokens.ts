import { confirm, input } from '@inquirer/prompts';
import chalk from 'chalk';
import boxen from 'boxen';
import type { Platform } from '../types/index.js';

/**
 * Token management utilities
 */

interface TokenConfig {
  envVar: string;
  name: string;
  instructions: string[];
  limit: string;
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
        '3. Select "public_repo" scope',
        '4. Copy the token (starts with ghp_)',
      ],
      limit: '60 → 5,000 requests/hour'
    },
    gitlab: {
      envVar: 'GITLAB_TOKEN',
      name: 'GitLab',
      instructions: [
        '1. Go to https://gitlab.com/-/user_settings/personal_access_tokens',
        '2. Create a token with "read_api" scope',
        '3. Copy the token',
      ],
      limit: 'Increases API rate limit'
    },
    bitbucket: {
      envVar: 'BITBUCKET_APP_PASSWORD',
      name: 'Bitbucket',
      instructions: [
        '1. Go to https://bitbucket.org/account/settings/app-passwords/',
        '2. Create an app password with "Repositories: Read" permission',
        '3. Copy the password',
      ],
      limit: 'Better rate limits'
    },
    sourcehut: {
      envVar: 'SOURCEHUT_TOKEN',
      name: 'SourceHut',
      instructions: [
        '1. Go to https://meta.sr.ht/oauth',
        '2. Create a personal access token',
        '3. Copy the token',
      ],
      limit: 'Required for API access'
    }
  };

  const config = tokenConfig[platform];
  if (!config) return;

  // Check if token is already set
  const existingToken = process.env[config.envVar];
  
  if (!existingToken) {
    console.log('\n' + boxen(
      chalk.yellow('⚠️  Authentication Token Not Found\n\n') +
      chalk.white(`${config.name} API works better with authentication\n`) +
      chalk.gray(`Benefit: ${config.limit}\n\n`) +
      chalk.cyan('How to get a token:\n') +
      config.instructions.map((i: string) => chalk.gray('  ' + i)).join('\n'),
      {
        padding: 1,
        margin: 0,
        borderStyle: 'round',
        borderColor: 'yellow',
      }
    ));

    const shouldSetToken = await confirm({
      message: chalk.cyan(`Would you like to set a ${config.name} token now?`),
      default: true,
    });

    if (shouldSetToken) {
      const token = await input({
        message: chalk.cyan(`Enter your ${config.name} token:`),
        validate: (value) => {
          if (value.trim() === '') return 'Token cannot be empty (press Ctrl+C to skip)';
          return true;
        },
      });

      if (token && token.trim()) {
        process.env[config.envVar] = token.trim();
        console.log(chalk.green(`✓ Token set for this session!`));
        console.log(chalk.gray(`To make it permanent, add to your ~/.bashrc or ~/.zshrc:`));
        console.log(chalk.gray(`  export ${config.envVar}="${token.trim()}"`));
      }
    } else {
      console.log(chalk.yellow(`⚠️  Continuing without token (may hit rate limits)`));
    }
    console.log('');
  } else {
    console.log(chalk.green(`✓ ${config.name} token found`));
  }
}
