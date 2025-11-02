import fetch from 'node-fetch';

export class BitbucketProvider {
  constructor(username) {
    this.username = username;
    this.baseUrl = 'https://api.bitbucket.org/2.0';
  }

  async fetchRepos() {
    const res = await fetch(`${this.baseUrl}/repositories/${this.username}?pagelen=100`);
    if (!res.ok) {
      throw new Error(`Failed to fetch repos: ${res.statusText}`);
    }
    const data = await res.json();
    return data.values.map((r) => r.slug);
  }

  async fetchCommits(repo, page = null) {
    const url = page || `${this.baseUrl}/repositories/${this.username}/${repo}/commits?pagelen=100`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch commits: ${res.statusText}`);
    }
    return await res.json();
  }

  async fetchAllCommits(repo) {
    let allCommits = [];
    let nextPage = null;
    let pageCount = 0;
    
    while (true) {
      const data = await this.fetchCommits(repo, nextPage);
      
      if (data.values && data.values.length > 0) {
        allCommits.push(...data.values.map(c => ({
          date: c.date,
          author: c.author?.user?.display_name || c.author?.raw || 'Unknown',
          message: c.message,
        })));
      }
      
      nextPage = data.next;
      if (!nextPage) break;
      
      pageCount++;
      // Limit pagination
      if (pageCount >= 10) break;
    }
    
    return allCommits;
  }
}
