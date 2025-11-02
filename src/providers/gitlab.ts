import fetch from 'node-fetch';
import type { Repository, Commit, GitProvider } from '../types/index.js';
import type { Ora } from 'ora';

interface GitLabUser {
  id: number;
  username: string;
}

interface GitLabProject {
  id: number;
  path: string;
  path_with_namespace: string;
  web_url: string;
  description: string | null;
  default_branch: string;
  statistics?: {
    commit_count: number;
  };
}

interface GitLabCommit {
  id: string;
  message: string;
  author_name: string;
  committed_date: string;
  parent_ids?: string[];
}

export class GitLabProvider implements GitProvider {
  private baseUrl: string;
  private token: string | null;

  constructor(private username: string, token: string | null = null) {
    this.baseUrl = 'https://gitlab.com/api/v4';
    this.token = token || process.env.GITLAB_TOKEN || null;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'repo-timeline-cli'
    };
    
    if (this.token) {
      headers['PRIVATE-TOKEN'] = this.token;
    }
    
    return headers;
  }

  async fetchRepositories(username: string): Promise<Repository[]> {
    try {
      // First, get user ID
      const userRes = await fetch(`${this.baseUrl}/users?username=${username}`, {
        headers: this.getHeaders()
      });
      
      if (!userRes.ok) {
        if (userRes.status === 401) {
          throw new Error(`GitLab authentication failed. Check your GITLAB_TOKEN`);
        }
        if (userRes.status === 429) {
          throw new Error(`GitLab rate limit exceeded. Please set GITLAB_TOKEN or wait before retrying`);
        }
        throw new Error(`Failed to fetch user: ${userRes.statusText}`);
      }

      const users = await userRes.json() as GitLabUser[];
      if (users.length === 0) {
        throw new Error(`User '${username}' not found on GitLab`);
      }
      const userId = users[0].id;

      // Fetch projects
      const res = await fetch(`${this.baseUrl}/users/${userId}/projects?per_page=100`, {
        headers: this.getHeaders()
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error(`rate limit exceeded`);
        }
        throw new Error(`Failed to fetch projects: ${res.statusText}`);
      }

      const data = await res.json() as GitLabProject[];
      
      return data
        .filter(p => p.statistics && p.statistics.commit_count > 0)
        .map(p => ({
          name: p.path,
          fullName: p.path_with_namespace,
          url: p.web_url,
          description: p.description,
          defaultBranch: p.default_branch
        }));
    } catch (error) {
      if (error instanceof Error && (error.message.includes('not found') || error.message.includes('rate limit'))) {
        throw error;
      }
      throw new Error(`GitLab API error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async fetchCommits(username: string, repoName: string, _spinner?: Ora): Promise<Commit[]> {
    let page = 1;
    const allCommits: Commit[] = [];
    
    try {
      // Encode the project path (username/repo)
      const projectPath = encodeURIComponent(`${username}/${repoName}`);
      
      while (true) {
        const res = await fetch(
          `${this.baseUrl}/projects/${projectPath}/repository/commits?per_page=100&page=${page}`,
          { headers: this.getHeaders() }
        );

        if (!res.ok) {
          if (res.status === 429) {
            throw new Error(`rate limit exceeded`);
          }
          throw new Error(`Failed to fetch commits: ${res.statusText}`);
        }

        const commits = await res.json() as GitLabCommit[];
        if (commits.length === 0) break;
        
        allCommits.push(...commits.map(c => ({
          sha: c.id,
          message: c.message,
          author: c.author_name,
          date: new Date(c.committed_date),
          repository: repoName
        })));
        
        page++;
        
        // Limit pagination
        if (page > 10) break;
      }
      
      return allCommits;
    } catch (error) {
      throw error;
    }
  }
}
