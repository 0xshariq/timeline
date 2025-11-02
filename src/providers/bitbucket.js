import fetch from 'node-fetch';

export class BitbucketProvider {
  constructor(username) {
    this.username = username;
    this.baseUrl = 'https://api.bitbucket.org/2.0';
  }

  async fetchRepos() {
    try {
      const res = await fetch(`${this.baseUrl}/repositories/${this.username}?pagelen=100`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`User '${this.username}' not found on Bitbucket`);
        }
        throw new Error(`Failed to fetch repos: ${res.statusText}`);
      }
      const data = await res.json();
      return data.values
        .filter(r => r.size > 0)
        .map((r) => r.slug);
    } catch (error) {
      if (error.message.includes('not found')) throw error;
      throw new Error(`Bitbucket API error: ${error.message}`);
    }
  }

  async fetchCommits(repo, page = null) {
    const url = page || `${this.baseUrl}/repositories/${this.username}/${repo}/commits?pagelen=100`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch commits: ${res.statusText}`);
    }
    return await res.json();
  }

  async fetchAllCommits(repo, config = {}) {
    let allCommits = [];
    let nextPage = null;
    let pageCount = 0;
    
    try {
      while (true) {
        const data = await this.fetchCommits(repo, nextPage);
        
        if (data.values && data.values.length > 0) {
          allCommits.push(...data.values.map(c => ({
            date: c.date,
            author: c.author?.user?.display_name || c.author?.raw || 'Unknown',
            message: c.message,
            isMerge: c.parents && c.parents.length > 1,
          })));
        }
        
        nextPage = data.next;
        if (!nextPage) break;
        
        pageCount++;
        // Limit pagination
        if (pageCount >= 10) break;
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
