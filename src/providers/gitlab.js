import fetch from 'node-fetch';

export class GitLabProvider {
  constructor(username) {
    this.username = username;
    this.baseUrl = 'https://gitlab.com/api/v4';
  }

  async fetchRepos() {
    try {
      // First, get user ID
      const userRes = await fetch(`${this.baseUrl}/users?username=${this.username}`);
      if (!userRes.ok) {
        throw new Error(`Failed to fetch user: ${userRes.statusText}`);
      }
      const users = await userRes.json();
      if (users.length === 0) {
        throw new Error(`User '${this.username}' not found on GitLab`);
      }
      const userId = users[0].id;

      // Fetch projects
      const res = await fetch(`${this.baseUrl}/users/${userId}/projects?per_page=100`);
      if (!res.ok) {
        throw new Error(`Failed to fetch projects: ${res.statusText}`);
      }
      const data = await res.json();
      // Filter out empty projects
      return data
        .filter(p => p.statistics && p.statistics.commit_count > 0)
        .map((p) => p.path);
    } catch (error) {
      if (error.message.includes('not found')) throw error;
      throw new Error(`GitLab API error: ${error.message}`);
    }
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

  async fetchAllCommits(repo, config = {}) {
    let page = 1;
    let allCommits = [];
    
    try {
      while (true) {
        const commits = await this.fetchCommits(repo, page);
        if (commits.length === 0) break;
        
        allCommits.push(...commits.map(c => ({
          date: c.committed_date,
          author: c.author_name,
          message: c.message,
          isMerge: c.parent_ids && c.parent_ids.length > 1,
        })));
        
        page++;
        
        // Limit pagination
        if (page > 10) break;
      }
      
      // Filter merge commits if needed
      if (config.includeMerges === false) {
        allCommits = allCommits.filter(c => !c.isMerge);
      }
      
      return allCommits;
    } catch (error) {
      throw error;
    }
  }
}
