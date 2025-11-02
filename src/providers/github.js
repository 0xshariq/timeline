import fetch from 'node-fetch';

export class GitHubProvider {
  constructor(username, token = null) {
    this.username = username;
    this.baseUrl = 'https://api.github.com';
    // Check for token from constructor, environment variable, or config
    this.token = token || process.env.GITHUB_TOKEN || null;
  }

  getHeaders() {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'repo-timeline-cli'
    };
    
    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }
    
    return headers;
  }

  async checkRateLimit() {
    try {
      const res = await fetch(`${this.baseUrl}/rate_limit`, {
        headers: this.getHeaders()
      });
      
      if (res.ok) {
        const data = await res.json();
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

  async fetchRepos() {
    try {
      const res = await fetch(`${this.baseUrl}/users/${this.username}/repos?per_page=100`, {
        headers: this.getHeaders()
      });
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`User '${this.username}' not found on GitHub`);
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
      const data = await res.json();
      // Filter out empty repos
      return data
        .filter(r => !r.fork && r.size > 0)
        .map((r) => r.name);
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('rate limit')) throw error;
      throw new Error(`GitHub API error: ${error.message}`);
    }
  }

  async fetchCommits(repo, page = 1) {
    try {
      const res = await fetch(
        `${this.baseUrl}/repos/${this.username}/${repo}/commits?per_page=100&page=${page}`,
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
      return await res.json();
    } catch (error) {
      throw new Error(`Failed to fetch commits: ${error.message}`);
    }
  }

  async fetchAllCommits(repo, config = {}) {
    let page = 1;
    let allCommits = [];
    
    try {
      while (true) {
        const commits = await this.fetchCommits(repo, page);
        if (commits.length === 0) break;
        
        allCommits.push(...commits.map(c => ({
          date: c.commit.author.date,
          author: c.commit.author.name,
          message: c.commit.message,
          isMerge: c.parents && c.parents.length > 1,
        })));
        
        page++;
        
        // GitHub pagination limit
        if (page > 10) break;
      }
      
      // Filter merge commits if needed
      if (config.includeMerges === false) {
        allCommits = allCommits.filter(c => !c.isMerge);
      }
      
      return allCommits;
    } catch (error) {
      if (error.message.includes('409')) {
        return []; // Empty repo
      }
      throw error;
    }
  }
}
