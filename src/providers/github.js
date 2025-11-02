import fetch from 'node-fetch';

export class GitHubProvider {
  constructor(username) {
    this.username = username;
    this.baseUrl = 'https://api.github.com';
  }

  async fetchRepos() {
    try {
      const res = await fetch(`${this.baseUrl}/users/${this.username}/repos?per_page=100`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`User '${this.username}' not found on GitHub`);
        }
        throw new Error(`Failed to fetch repos: ${res.statusText}`);
      }
      const data = await res.json();
      // Filter out empty repos
      return data
        .filter(r => !r.fork && r.size > 0)
        .map((r) => r.name);
    } catch (error) {
      if (error.message.includes('not found')) throw error;
      throw new Error(`GitHub API error: ${error.message}`);
    }
  }

  async fetchCommits(repo, page = 1) {
    try {
      const res = await fetch(
        `${this.baseUrl}/repos/${this.username}/${repo}/commits?per_page=100&page=${page}`
      );
      if (!res.ok) {
        if (res.status === 409) {
          // Empty repository
          return [];
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
