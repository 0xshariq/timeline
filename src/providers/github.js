import fetch from 'node-fetch';

export class GitHubProvider {
  constructor(username) {
    this.username = username;
    this.baseUrl = 'https://api.github.com';
  }

  async fetchRepos() {
    const res = await fetch(`${this.baseUrl}/users/${this.username}/repos?per_page=100`);
    if (!res.ok) {
      throw new Error(`Failed to fetch repos: ${res.statusText}`);
    }
    const data = await res.json();
    return data.map((r) => r.name);
  }

  async fetchCommits(repo, page = 1) {
    const res = await fetch(
      `${this.baseUrl}/repos/${this.username}/${repo}/commits?per_page=100&page=${page}`
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch commits: ${res.statusText}`);
    }
    return await res.json();
  }

  async fetchAllCommits(repo) {
    let page = 1;
    let allCommits = [];
    
    while (true) {
      const commits = await this.fetchCommits(repo, page);
      if (commits.length === 0) break;
      
      allCommits.push(...commits.map(c => ({
        date: c.commit.author.date,
        author: c.commit.author.name,
        message: c.commit.message,
      })));
      
      page++;
      
      // GitHub pagination limit
      if (page > 10) break;
    }
    
    return allCommits;
  }
}
