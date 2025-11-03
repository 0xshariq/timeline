import fetch from 'node-fetch';
import type { Repository, Commit, GitProvider } from '../types/index.js';
import type { Ora } from 'ora';

interface BitbucketRepo {
  slug: string;
  full_name: string;
  links: { html: { href: string } };
  description: string | null;
  mainbranch?: { name: string };
  size: number;
}

interface BitbucketCommit {
  hash: string;
  message: string;
  author: {
    user?: { display_name: string };
    raw: string;
  };
  date: string;
  parents?: Array<{ hash: string }>;
}

export class BitbucketProvider implements GitProvider {
  private baseUrl: string;
  private appPassword: string | null;

  constructor(private username: string, appPassword: string | null = null) {
    this.baseUrl = 'https://api.bitbucket.org/2.0';
    this.appPassword = appPassword || process.env.BITBUCKET_APP_PASSWORD || null;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'repo-timeline-cli'
    };
    
    if (this.appPassword) {
      const auth = Buffer.from(`${this.username}:${this.appPassword}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }
    
    return headers;
  }

  async fetchRepositories(username: string): Promise<Repository[]> {
    try {
      const res = await fetch(`${this.baseUrl}/repositories/${username}?pagelen=100`, {
        headers: this.getHeaders()
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`User '${username}' not found on Bitbucket`);
        }
        if (res.status === 429) {
          throw new Error(`Bitbucket rate limit exceeded. Please set BITBUCKET_APP_PASSWORD or wait before retrying`);
        }
        throw new Error(`Failed to fetch repos: ${res.statusText}`);
      }
      const data = await res.json() as any;
      return data.values
        .filter((r: BitbucketRepo) => r.size > 0)
        .map((r: BitbucketRepo) => ({
          name: r.slug,
          fullName: r.full_name,
          url: r.links?.html?.href || `https://bitbucket.org/${r.full_name}`,
          description: r.description,
          defaultBranch: r.mainbranch?.name || 'master'
        }));
    } catch (error) {
      if (error instanceof Error && (error.message.includes('not found') || error.message.includes('rate limit'))) {
        throw error;
      }
      throw new Error(`Bitbucket API error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async fetchCommits(username: string, repoName: string, _spinner?: Ora): Promise<Commit[]> {
    const allCommits: Commit[] = [];
    let nextPage: string | null = `${this.baseUrl}/repositories/${username}/${repoName}/commits?pagelen=100`;
    let pageCount = 0;
    
    try {
      while (nextPage && pageCount < 10) {
        const res = await fetch(nextPage, { headers: this.getHeaders() });
        if (!res.ok) {
          if (res.status === 429) {
            throw new Error(`rate limit exceeded`);
          }
          throw new Error(`Failed to fetch commits: ${res.statusText}`);
        }
        
        const data = await res.json() as any;
        
        if (data.values && data.values.length > 0) {
          allCommits.push(...data.values.map((c: BitbucketCommit) => ({
            sha: c.hash,
            message: c.message,
            author: c.author?.user?.display_name || c.author?.raw || 'Unknown',
            date: new Date(c.date),
            repository: repoName
          })));
        }
        
        nextPage = data.next || null;
        pageCount++;
      }
      
      return allCommits;
    } catch (error) {
      throw error;
    }
  }
}
