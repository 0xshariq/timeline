import fetch from 'node-fetch';
import type { Repository, Commit, GitProvider } from '../types/index.js';
import type { Ora } from 'ora';

interface GitHubRepo {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  default_branch: string;
  fork: boolean;
  size: number;
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  parents?: Array<{ sha: string }>;
}

interface RateLimitInfo {
  remaining: number;
  limit: number;
  reset: Date;
}

export class GitHubProvider implements GitProvider {
  private baseUrl: string;
  private token: string | null;

  constructor(private username: string, token: string | null = null) {
    this.baseUrl = 'https://api.github.com';
    this.token = token || process.env.GITHUB_TOKEN || null;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'repo-timeline-cli'
    };
    
    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }
    
    return headers;
  }

  private async checkRateLimit(): Promise<RateLimitInfo | null> {
    try {
      const res = await fetch(`${this.baseUrl}/rate_limit`, {
        headers: this.getHeaders()
      });
      
      if (res.ok) {
        const data = await res.json() as any;
        return {
          remaining: data.rate.remaining,
          limit: data.rate.limit,
          reset: new Date(data.rate.reset * 1000)
        };
      }
    } catch (error) {
      // Ignore rate limit check errors
    }
    return null;
  }

  async fetchRepositories(username: string): Promise<Repository[]> {
    try {
      const res = await fetch(`${this.baseUrl}/users/${username}/repos?per_page=100`, {
        headers: this.getHeaders()
      });
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`User '${username}' not found on GitHub`);
        }
        if (res.status === 403) {
          const rateLimitInfo = await this.checkRateLimit();
          if (rateLimitInfo && rateLimitInfo.remaining === 0) {
            throw new Error(`GitHub rate limit exceeded. Resets at ${rateLimitInfo.reset.toLocaleTimeString()}. Use a GitHub token to increase limit (export GITHUB_TOKEN=your_token)`);
          }
          throw new Error(`GitHub API rate limit exceeded. Please wait or use authentication token (export GITHUB_TOKEN=your_token)`);
        }
        throw new Error(`Failed to fetch repos: ${res.statusText}`);
      }

      const data = await res.json() as GitHubRepo[];
      
      return data
        .filter(r => !r.fork && r.size > 0)
        .map(r => ({
          name: r.name,
          fullName: r.full_name,
          url: r.html_url,
          description: r.description,
          defaultBranch: r.default_branch
        }));
    } catch (error) {
      if (error instanceof Error && (error.message.includes('not found') || error.message.includes('rate limit'))) {
        throw error;
      }
      throw new Error(`GitHub API error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async fetchCommits(username: string, repoName: string, _spinner?: Ora): Promise<Commit[]> {
    let page = 1;
    const allCommits: Commit[] = [];
    
    try {
      while (true) {
        const res = await fetch(
          `${this.baseUrl}/repos/${username}/${repoName}/commits?per_page=100&page=${page}`,
          { headers: this.getHeaders() }
        );
        
        if (!res.ok) {
          if (res.status === 409) {
            // Empty repository
            return [];
          }
          if (res.status === 403) {
            throw new Error(`rate limit exceeded`);
          }
          throw new Error(`${res.status}: ${res.statusText}`);
        }

        const commits = await res.json() as GitHubCommit[];
        if (commits.length === 0) break;
        
        allCommits.push(...commits.map(c => ({
          sha: c.sha,
          message: c.commit.message,
          author: c.commit.author.name,
          date: new Date(c.commit.author.date),
          repository: repoName
        })));
        
        page++;
        
        // GitHub pagination limit
        if (page > 10) break;
      }
      
      return allCommits;
    } catch (error) {
      if (error instanceof Error && error.message.includes('409')) {
        return []; // Empty repo
      }
      throw error;
    }
  }
}
