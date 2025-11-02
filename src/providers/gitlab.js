import fetch from 'node-fetch';

export class GitLabProvider {
  constructor(username) {
    this.username = username;
    this.baseUrl = 'https://gitlab.com/api/v4';
  }

  async fetchRepos() {
    // First, get user ID
    const userRes = await fetch(`${this.baseUrl}/users?username=${this.username}`);
    if (!userRes.ok) {
      throw new Error(`Failed to fetch user: ${userRes.statusText}`);
    }
    const users = await userRes.json();
    if (users.length === 0) {
      throw new Error('User not found');
    }
    const userId = users[0].id;

    // Fetch projects
    const res = await fetch(`${this.baseUrl}/users/${userId}/projects?per_page=100`);
    if (!res.ok) {
      throw new Error(`Failed to fetch projects: ${res.statusText}`);
    }
    const data = await res.json();
    return data.map((p) => p.path);
  }

  async fetchCommits(repo, page = 1) {
    // Encode the project path (username/repo)
    const projectPath = encodeURIComponent(`${this.username}/${repo}`);
    const res = await fetch(
      `${this.baseUrl}/projects/${projectPath}/repository/commits?per_page=100&page=${page}`
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
        date: c.committed_date,
        author: c.author_name,
        message: c.message,
      })));
      
      page++;
      
      // Limit pagination
      if (page > 10) break;
    }
    
    return allCommits;
  }
}
