import fetch from 'node-fetch';
import type { Repository, Commit, GitProvider } from '../types/index.js';
import type { Ora } from 'ora';

interface SourceHutRepo {
  name: string;
  owner: { canonical_name: string };
  description: string | null;
  commits_count?: number;
}

interface SourceHutCommit {
  id: string;
  message: string;
  author: { name: string };
  timestamp: string;
}

export class SourceHutProvider implements GitProvider {
  private baseUrl: string;
  private token: string | null;

  constructor(private username: string, token: string | null = null) {
    this.baseUrl = 'https://git.sr.ht/api';
    this.token = token || process.env.SOURCEHUT_TOKEN || null;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'repo-timeline-cli'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async fetchRepositories(username: string): Promise<Repository[]> {
    try {
      // SourceHut API for public repos
      const res = await fetch(`${this.baseUrl}/${username}/repos`, {
        headers: this.getHeaders()
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`User '${username}' not found on SourceHut`);
        }
        if (res.status === 429) {
          throw new Error(`SourceHut rate limit exceeded. Please set SOURCEHUT_TOKEN or wait before retrying`);
        }
        throw new Error(`Failed to fetch repos: ${res.statusText}`);
      }
      const data = await res.json() as any;
      return data.results
        .filter((r: SourceHutRepo) => r.commits_count && r.commits_count > 0)
        .map((r: SourceHutRepo) => ({
          name: r.name,
          fullName: `${r.owner.canonical_name}/${r.name}`,
          url: `https://git.sr.ht/${r.owner.canonical_name}/${r.name}`,
          description: r.description,
          defaultBranch: 'master'
        }));
    } catch (error) {
      if (error instanceof Error && (error.message.includes('not found') || error.message.includes('rate limit'))) {
        throw error;
      }
      throw new Error(`SourceHut API error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async fetchCommits(username: string, repoName: string, _spinner?: Ora): Promise<Commit[]> {
    try {
      // SourceHut uses a different API structure
      const res = await fetch(`${this.baseUrl}/${username}/repos/${repoName}/log`, {
        headers: this.getHeaders()
      });
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error(`rate limit exceeded`);
        }
        throw new Error(`Failed to fetch commits: ${res.statusText}`);
      }
      const data = await res.json() as any;
      
      if (!data.results) {
        return [];
      }
      
      return data.results.map((c: SourceHutCommit) => ({
        sha: c.id,
        message: c.message,
        author: c.author?.name || 'Unknown',
        date: new Date(c.timestamp),
        repository: repoName
      }));
    } catch (error) {
      throw error;
    }
  }
}
