import fetch from 'node-fetch';

export class SourceHutProvider {
  private username: string;
  private baseUrl: string;
  private token: string | null;

  constructor(username, token = null) {
    this.username = username;
    this.baseUrl = 'https://git.sr.ht/api';
    this.token = token || process.env.SOURCEHUT_TOKEN || null;
  }

  getHeaders() {
    const headers = {
      'Accept': 'application/json',
      'User-Agent': 'repo-timeline-cli'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async fetchRepos() {
    try {
      // SourceHut API for public repos
      const res = await fetch(`${this.baseUrl}/${this.username}/repos`, {
        headers: this.getHeaders()
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`User '${this.username}' not found on SourceHut`);
        }
        if (res.status === 429) {
          throw new Error(`SourceHut rate limit exceeded. Please set SOURCEHUT_TOKEN or wait before retrying`);
        }
        throw new Error(`Failed to fetch repos: ${res.statusText}`);
      }
      const data = await res.json();
      return (data as any).results
        .filter(r => r.commits_count && r.commits_count > 0)
        .map((r) => r.name);
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('rate limit')) throw error;
      throw new Error(`SourceHut API error: ${error.message}`);
    }
  }

  async fetchCommits(repo) {
    // SourceHut uses a different API structure
    const res = await fetch(`${this.baseUrl}/${this.username}/repos/${repo}/log`, {
      headers: this.getHeaders()
    });
    if (!res.ok) {
      if (res.status === 429) {
        throw new Error(`rate limit exceeded`);
      }
      throw new Error(`Failed to fetch commits: ${res.statusText}`);
    }
    return await res.json();
  }

  async fetchAllCommits(repo, config = {}) {
    try {
      const data = await this.fetchCommits(repo) as any;
      
      if (!data.results) {
        return [];
      }
      
      let commits = data.results.map(c => ({
        date: c.timestamp,
        author: c.author?.name || 'Unknown',
        message: c.message,
        isMerge: false, // SourceHut doesn't provide parent info easily
      }));
      
      // Filter merge commits if needed (though we can't detect them here)
      if ((config as any).includeMerges === false) {
        commits = commits.filter(c => !c.isMerge);
      }
      
      return commits;
    } catch (error) {
      throw error;
    }
  }
}
