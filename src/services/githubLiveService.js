import { Octokit } from '@octokit/rest';

class GitHubLiveService {
  constructor(token) {
    this.token = token || import.meta.env.VITE_GITHUB_TOKEN;
    this.octokit = new Octokit({
      auth: this.token,
      baseUrl: 'https://api.github.com',
      log: {
        debug: () => {},
        info: () => {},
        warn: console.warn,
        error: console.error
      }
    });
    this.cache = new Map();
    this.rateLimitRemaining = null;
    this.rateLimitReset = null;
  }

  // Check rate limit before making requests
  async checkRateLimit() {
    const { data } = await this.octokit.rateLimit.get();
    this.rateLimitRemaining = data.rate.remaining;
    this.rateLimitReset = new Date(data.rate.reset * 1000);

    if (this.rateLimitRemaining < 10) {
      throw new Error(`GitHub API rate limit low: ${this.rateLimitRemaining} remaining`);
    }

    return {
      remaining: this.rateLimitRemaining,
      reset: this.rateLimitReset
    };
  }

  // Step 47: Fetch PR with full details
  async fetchPRDetails(owner, repo, prNumber) {
    const cacheKey = `pr-${owner}-${repo}-${prNumber}`;

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 min cache
        return cached.data;
      }
    }

    await this.checkRateLimit();

    try {
      // Fetch PR details
      const [prData, files, commits, reviews, comments] = await Promise.all([
        this.octokit.pulls.get({ owner, repo, pull_number: prNumber }),
        this.octokit.pulls.listFiles({ owner, repo, pull_number: prNumber, per_page: 100 }),
        this.octokit.pulls.listCommits({ owner, repo, pull_number: prNumber, per_page: 100 }),
        this.octokit.pulls.listReviews({ owner, repo, pull_number: prNumber }),
        this.octokit.issues.listComments({ owner, repo, issue_number: prNumber })
      ]);

      // Fetch diff
      const diffResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
        headers: {
          'Accept': 'application/vnd.github.v3.diff',
          'Authorization': `Bearer ${this.token}`
        }
      });
      const diff = await diffResponse.text();

      const result = {
        pr: prData.data,
        files: files.data,
        commits: commits.data,
        reviews: reviews.data,
        comments: comments.data,
        diff,
        timestamp: Date.now()
      };

      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

      return result;
    } catch (error) {
      console.error('Failed to fetch PR details:', error);
      throw error;
    }
  }

  // Fetch file content at specific commit
  async fetchFileContent(owner, repo, path, ref) {
    const cacheKey = `file-${owner}-${repo}-${path}-${ref}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      if (data.type === 'file') {
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        this.cache.set(cacheKey, content);
        return content;
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch file content:', error);
      return null;
    }
  }

  // Get commit history for file
  async fetchFileHistory(owner, repo, path, since = null) {
    try {
      const params = {
        owner,
        repo,
        path,
        per_page: 100
      };

      if (since) {
        params.since = since.toISOString();
      }

      const { data } = await this.octokit.repos.listCommits(params);

      return data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        email: commit.commit.author.email,
        date: commit.commit.author.date,
        stats: commit.stats
      }));
    } catch (error) {
      console.error('Failed to fetch file history:', error);
      return [];
    }
  }

  // Search pull requests
  async searchPullRequests(owner, repo, query, type = 'all') {
    try {
      let searchQuery = `repo:${owner}/${repo} is:pr`;

      if (type === 'number' && !isNaN(query)) {
        // Search by PR number
        const prNumber = parseInt(query);
        const { data } = await this.octokit.pulls.get({ owner, repo, pull_number: prNumber });
        return { items: [data] };
      } else if (type === 'branch') {
        searchQuery += ` head:${query}`;
      } else if (type === 'title') {
        searchQuery += ` in:title ${query}`;
      } else {
        searchQuery += ` ${query}`;
      }

      const { data } = await this.octokit.search.issuesAndPullRequests({ q: searchQuery });

      // Enhance results with PR-specific data
      const items = await Promise.all(
        data.items.slice(0, 10).map(async (item) => {
          try {
            const { data: pr } = await this.octokit.pulls.get({
              owner,
              repo,
              pull_number: item.number
            });
            return pr;
          } catch {
            return item;
          }
        })
      );

      return { items };
    } catch (error) {
      console.error('Failed to search pull requests:', error);
      return { items: [] };
    }
  }

  // Get repository statistics
  async getRepositoryStats(owner, repo) {
    try {
      const [repoData, contributors, languages, topics] = await Promise.all([
        this.octokit.repos.get({ owner, repo }),
        this.octokit.repos.listContributors({ owner, repo, per_page: 10 }),
        this.octokit.repos.listLanguages({ owner, repo }),
        this.octokit.repos.getAllTopics({ owner, repo })
      ]);

      return {
        repository: repoData.data,
        contributors: contributors.data,
        languages: languages.data,
        topics: topics.data.names
      };
    } catch (error) {
      console.error('Failed to fetch repository stats:', error);
      return null;
    }
  }

  // Get code frequency data
  async getCodeFrequency(owner, repo) {
    try {
      const { data } = await this.octokit.repos.getCodeFrequencyStats({ owner, repo });

      // Transform to more usable format
      return data.map(week => ({
        week: new Date(week[0] * 1000),
        additions: week[1],
        deletions: Math.abs(week[2])
      }));
    } catch (error) {
      console.error('Failed to fetch code frequency:', error);
      return [];
    }
  }

  // Get commit activity
  async getCommitActivity(owner, repo) {
    try {
      const { data } = await this.octokit.repos.getCommitActivityStats({ owner, repo });

      return data.map(week => ({
        week: new Date(week.week * 1000),
        days: week.days,
        total: week.total
      }));
    } catch (error) {
      console.error('Failed to fetch commit activity:', error);
      return [];
    }
  }

  // Get punch card data (hourly commit distribution)
  async getPunchCard(owner, repo) {
    try {
      const { data } = await this.octokit.repos.getPunchCardStats({ owner, repo });

      // Transform to more readable format
      const punchCard = Array(7).fill(null).map(() => Array(24).fill(0));

      data.forEach(([day, hour, commits]) => {
        punchCard[day][hour] = commits;
      });

      return punchCard;
    } catch (error) {
      console.error('Failed to fetch punch card data:', error);
      return Array(7).fill(null).map(() => Array(24).fill(0));
    }
  }
}

export default GitHubLiveService;