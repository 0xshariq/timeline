import fetch from 'node-fetch';

export class SourceHutProvider {
  constructor(username) {
    this.username = username;
    this.baseUrl = 'https://git.sr.ht/api';
  }

  async fetchRepos() {
    try {
      // SourceHut API for public repos
      const res = await fetch(`${this.baseUrl}/${this.username}/repos`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`User '${this.username}' not found on SourceHut`);
        }
        throw new Error(`Failed to fetch repos: ${res.statusText}`);
      }
      const data = await res.json();
      return data.results
        .filter(r => r.commits_count && r.commits_count > 0)
        .map((r) => r.name);
    } catch (error) {
      if (error.message.includes('not found')) throw error;
      throw new Error(`SourceHut API error: ${error.message}`);
    }
  }

  async fetchCommits(repo) {
    // SourceHut uses a different API structure
    const res = await fetch(`${this.baseUrl}/${this.username}/repos/${repo}/log`);
    if (!res.ok) {
      throw new Error(`Failed to fetch commits: ${res.statusText}`);
    }
    return await res.json();
  }

  async fetchAllCommits(repo, config = {}) {
    try {
      const data = await this.fetchCommits(repo);
      
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
      if (config.includeMerges === false) {
        commits = commits.filter(c => !c.isMerge);
      }
      
      return commits;
    } catch (error) {
      throw error;
    }
  }
}
