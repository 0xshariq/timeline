import fetch from 'node-fetch';

export class SourceHutProvider {
  constructor(username) {
    this.username = username;
    this.baseUrl = 'https://git.sr.ht/api';
  }

  async fetchRepos() {
    // SourceHut API for public repos
    const res = await fetch(`${this.baseUrl}/${this.username}/repos`);
    if (!res.ok) {
      throw new Error(`Failed to fetch repos: ${res.statusText}`);
    }
    const data = await res.json();
    return data.results.map((r) => r.name);
  }

  async fetchCommits(repo) {
    // SourceHut uses a different API structure
    const res = await fetch(`${this.baseUrl}/${this.username}/repos/${repo}/log`);
    if (!res.ok) {
      throw new Error(`Failed to fetch commits: ${res.statusText}`);
    }
    return await res.json();
  }

  async fetchAllCommits(repo) {
    const data = await this.fetchCommits(repo);
    
    if (!data.results) {
      return [];
    }
    
    return data.results.map(c => ({
      date: c.timestamp,
      author: c.author?.name || 'Unknown',
      message: c.message,
    }));
  }
}
