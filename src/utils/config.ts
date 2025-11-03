import fs from 'fs';
import path from 'path';
import { homedir } from 'os';

const CONFIG_FILE = path.join(homedir(), '.timeline-config.json');

interface UserConfig {
  defaultPlatform?: 'github' | 'gitlab' | 'bitbucket' | 'sourcehut';
  defaultUsername?: string;
  defaultChartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'heatmap';
  autoOpen?: boolean;
  verbose?: boolean;
}

const DEFAULT_CONFIG: UserConfig = {
  defaultPlatform: undefined,
  defaultUsername: undefined,
  defaultChartType: undefined,
  autoOpen: false,
  verbose: true,
};

export function loadConfig(): UserConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch (error) {
    // If config is corrupted, return defaults
  }
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(config: UserConfig): void {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    throw new Error(`Failed to save config: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function updateConfig(updates: Partial<UserConfig>): UserConfig {
  const current = loadConfig();
  const updated = { ...current, ...updates };
  saveConfig(updated);
  return updated;
}

export function resetConfig(): void {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
    }
  } catch (error) {
    throw new Error(`Failed to reset config: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}
