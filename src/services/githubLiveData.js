/**
 * GitHub Live Data Service
 * Fetches and manages real-time GitHub data using webhooks and polling
 */

import { getWebSocketService } from './websocketService';

export class GitHubLiveDataService {
  constructor(token = null) {
    this.token = token || import.meta.env.VITE_GITHUB_TOKEN;
    this.baseUrl = 'https://api.github.com';
    this.wsService = getWebSocketService();
    this.pollingIntervals = new Map();
    this.cache = new Map();
    this.subscribers = new Map();
  }

  // Initialize live data connections
  async initialize(repositories = []) {
    try {
      // Connect to WebSocket service
      await this.wsService.connect();

      // Set up WebSocket event listeners
      this.setupWebSocketListeners();

      // Subscribe to repositories
      for (const repo of repositories) {
        await this.subscribeToRepository(repo);
      }

      // Start polling for data that doesn't come through webhooks
      this.startPolling(repositories);

      return true;
    } catch (error) {
      console.error('Failed to initialize GitHub Live Data:', error);
      return false;
    }
  }

  setupWebSocketListeners() {
    // Listen for GitHub push events
    this.wsService.on('github:push', (data) => {
      this.handlePushEvent(data);
    });

    // Listen for workflow run updates
    this.wsService.on('workflow:run', (data) => {
      this.handleWorkflowUpdate(data);
    });

    // Listen for PR updates
    this.wsService.on('pr:update', (data) => {
      this.handlePRUpdate(data);
    });

    // Listen for metrics updates
    this.wsService.on('metrics:update', (data) => {
      this.handleMetricsUpdate(data);
    });
  }

  async subscribeToRepository(repo) {
    const [owner, name] = repo.split('/');

    // Subscribe via WebSocket
    this.wsService.subscribe(repo, ['push', 'workflow_run', 'pull_request', 'check_suite']);

    // Set up webhook if not already configured
    await this.ensureWebhook(owner, name);

    // Initial data fetch
    await this.fetchRepositoryData(owner, name);
  }

  async ensureWebhook(owner, repo) {
    try {
      const webhooks = await this.fetchFromGitHub(`/repos/${owner}/${repo}/hooks`);

      // Check if our webhook already exists
      const existingWebhook = webhooks.find(hook =>
        hook.config?.url?.includes('trinity-dashboard') ||
        hook.config?.url?.includes(window.location.hostname)
      );

      if (!existingWebhook) {
        // Create webhook
        await this.createWebhook(owner, repo);
      }
    } catch (error) {
      console.warn('Could not manage webhooks (requires admin permissions):', error);
    }
  }

  async createWebhook(owner, repo) {
    const webhookUrl = import.meta.env.VITE_WEBHOOK_URL || `${window.location.origin}/api/webhook`;

    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/hooks`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'web',
          config: {
            url: webhookUrl,
            content_type: 'json',
            secret: import.meta.env.VITE_WEBHOOK_SECRET || 'trinity-dashboard-secret'
          },
          events: ['push', 'pull_request', 'workflow_run', 'check_suite', 'deployment'],
          active: true
        })
      });

      if (response.ok) {
        
      }
    } catch (error) {
      console.error('Failed to create webhook:', error);
    }
  }

  async fetchRepositoryData(owner, repo) {
    const key = `${owner}/${repo}`;

    try {
      // Fetch multiple data points in parallel
      const [
        repoInfo,
        workflows,
        pulls,
        commits,
        releases
      ] = await Promise.all([
        this.fetchFromGitHub(`/repos/${owner}/${repo}`),
        this.fetchWorkflowRuns(owner, repo),
        this.fetchPullRequests(owner, repo),
        this.fetchRecentCommits(owner, repo),
        this.fetchReleases(owner, repo)
      ]);

      const data = {
        repository: repoInfo,
        workflows,
        pulls,
        commits,
        releases,
        timestamp: new Date().toISOString()
      };

      // Update cache
      this.cache.set(key, data);

      // Notify subscribers
      this.notifySubscribers(key, data);

      return data;
    } catch (error) {
      console.error(`Failed to fetch data for ${key}:`, error);
      return null;
    }
  }

  async fetchWorkflowRuns(owner, repo, perPage = 10) {
    const runs = await this.fetchFromGitHub(
      `/repos/${owner}/${repo}/actions/runs?per_page=${perPage}`
    );

    // Fetch detailed run data for recent runs
    const detailedRuns = await Promise.all(
      runs.workflow_runs.slice(0, 5).map(async (run) => {
        const [jobs, artifacts] = await Promise.all([
          this.fetchFromGitHub(`/repos/${owner}/${repo}/actions/runs/${run.id}/jobs`),
          this.fetchFromGitHub(`/repos/${owner}/${repo}/actions/runs/${run.id}/artifacts`)
        ]);

        return {
          ...run,
          jobs: jobs.jobs,
          artifacts: artifacts.artifacts
        };
      })
    );

    return detailedRuns;
  }

  async fetchPullRequests(owner, repo, state = 'all', perPage = 10) {
    const pulls = await this.fetchFromGitHub(
      `/repos/${owner}/${repo}/pulls?state=${state}&per_page=${perPage}&sort=updated`
    );

    // Fetch additional PR data
    const detailedPulls = await Promise.all(
      pulls.slice(0, 5).map(async (pr) => {
        const [reviews, checks, files] = await Promise.all([
          this.fetchFromGitHub(`/repos/${owner}/${repo}/pulls/${pr.number}/reviews`),
          this.fetchFromGitHub(`/repos/${owner}/${repo}/commits/${pr.head.sha}/check-runs`),
          this.fetchFromGitHub(`/repos/${owner}/${repo}/pulls/${pr.number}/files`)
        ]);

        return {
          ...pr,
          reviews,
          checks: checks.check_runs,
          files: files.slice(0, 20) // Limit file list
        };
      })
    );

    return detailedPulls;
  }

  async fetchRecentCommits(owner, repo, perPage = 20) {
    return this.fetchFromGitHub(
      `/repos/${owner}/${repo}/commits?per_page=${perPage}`
    );
  }

  async fetchReleases(owner, repo, perPage = 5) {
    return this.fetchFromGitHub(
      `/repos/${owner}/${repo}/releases?per_page=${perPage}`
    );
  }

  async fetchFromGitHub(endpoint) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  startPolling(repositories, interval = 60000) {
    for (const repo of repositories) {
      const [owner, name] = repo.split('/');

      // Clear existing interval if any
      if (this.pollingIntervals.has(repo)) {
        clearInterval(this.pollingIntervals.get(repo));
      }

      // Set up new polling interval
      const intervalId = setInterval(async () => {
        await this.fetchRepositoryData(owner, name);
      }, interval);

      this.pollingIntervals.set(repo, intervalId);
    }
  }

  stopPolling(repository = null) {
    if (repository) {
      if (this.pollingIntervals.has(repository)) {
        clearInterval(this.pollingIntervals.get(repository));
        this.pollingIntervals.delete(repository);
      }
    } else {
      // Stop all polling
      for (const [repo, intervalId] of this.pollingIntervals) {
        clearInterval(intervalId);
      }
      this.pollingIntervals.clear();
    }
  }

  // Event handlers for WebSocket updates
  handlePushEvent(data) {
    
    const { repository } = data;

    // Trigger data refresh for affected repository
    const [owner, name] = repository.split('/');
    this.fetchRepositoryData(owner, name);
  }

  handleWorkflowUpdate(data) {
    
    const { repository, runId, status, conclusion } = data;

    // Update cache with new workflow status
    if (this.cache.has(repository)) {
      const cached = this.cache.get(repository);
      const workflow = cached.workflows?.find(w => w.id === runId);
      if (workflow) {
        workflow.status = status;
        workflow.conclusion = conclusion;
        this.notifySubscribers(repository, cached);
      }
    }
  }

  handlePRUpdate(data) {
    
    const { repository, number } = data;

    // Refresh PR data
    const [owner, name] = repository.split('/');
    this.fetchPullRequests(owner, name);
  }

  handleMetricsUpdate(data) {
    
    const { repository, metrics } = data;

    // Update cache with new metrics
    if (this.cache.has(repository)) {
      const cached = this.cache.get(repository);
      cached.metrics = { ...cached.metrics, ...metrics };
      cached.lastMetricsUpdate = new Date().toISOString();
      this.notifySubscribers(repository, cached);
    }
  }

  // Subscribe to repository updates
  subscribe(repository, callback) {
    if (!this.subscribers.has(repository)) {
      this.subscribers.set(repository, []);
    }
    this.subscribers.get(repository).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(repository);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  notifySubscribers(repository, data) {
    if (this.subscribers.has(repository)) {
      this.subscribers.get(repository).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  // Get cached data for a repository
  getCachedData(repository) {
    return this.cache.get(repository) || null;
  }

  // Cleanup
  disconnect() {
    this.stopPolling();
    this.wsService.disconnect();
    this.cache.clear();
    this.subscribers.clear();
  }
}

// Singleton instance
let liveDataInstance = null;

export function getGitHubLiveDataService(token) {
  if (!liveDataInstance) {
    liveDataInstance = new GitHubLiveDataService(token);
  }
  return liveDataInstance;
}

export default GitHubLiveDataService;