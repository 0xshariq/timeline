import type { Ora } from 'ora';

export interface TimelineConfig {
  verbose: boolean;
  includeMerges: boolean;
  openChart: boolean;
  chartType: ChartType;
}

export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'heatmap';

export type Platform = 'github' | 'gitlab' | 'bitbucket' | 'sourcehut';

export interface Repository {
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  defaultBranch: string;
}

export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: Date;
  repository: string;
}

export interface RepoStats {
  name: string;
  commits: number;
  firstCommit: Date | null;
  lastCommit: Date | null;
  contributors: Set<string>;
}

export interface GitProvider {
  fetchRepositories(username: string): Promise<Repository[]>;
  fetchCommits(username: string, repoName: string, spinner?: Ora): Promise<Commit[]>;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

export interface CommandOptions {
  platform?: Platform;
  username?: string;
  repos?: string;
  all?: boolean;
  type?: ChartType;
  chart?: ChartType;
  verbose?: boolean;
  quiet?: boolean;
  merge?: boolean;
  open?: boolean;
}
