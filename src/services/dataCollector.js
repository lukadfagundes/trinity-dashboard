import api from './githubApi';

const OWNER = import.meta.env.VITE_GITHUB_OWNER || 'trinity-method';

// Request deduplication map
const pendingRequests = new Map();

// Helper function to prevent duplicate simultaneous requests
async function fetchWithDedup(url, options) {
  const cacheKey = JSON.stringify({ url, options });

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const promise = api.get(url, options);
  pendingRequests.set(cacheKey, promise);

  try {
    const result = await promise;
    return result;
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

export async function fetchWorkflowRuns(repo) {
  try {
    const response = await fetchWithDedup(
      `/repos/${OWNER}/${repo}/actions/runs`,
      {
        params: {
          per_page: 20,
          status: 'completed'
        }
      }
    );
    return response.data.workflow_runs || [];
  } catch (error) {
    console.error(`Failed to fetch workflow runs for ${repo}:`, error.message);
    return [];
  }
}

export async function fetchArtifacts(repo, runId) {
  try {
    const response = await fetchWithDedup(
      `/repos/${OWNER}/${repo}/actions/runs/${runId}/artifacts`
    );
    return response.data.artifacts || [];
  } catch (error) {
    console.error(`Failed to fetch artifacts for run ${runId}:`, error.message);
    return [];
  }
}

export async function fetchJobs(repo, runId) {
  try {
    const response = await fetchWithDedup(
      `/repos/${OWNER}/${repo}/actions/runs/${runId}/jobs`
    );
    return response.data.jobs || [];
  } catch (error) {
    console.error(`Failed to fetch jobs for run ${runId}:`, error.message);
    return [];
  }
}

export async function downloadArtifact(downloadUrl) {
  try {
    const response = await api.get(downloadUrl, {
      responseType: 'arraybuffer'
    });
    return response.data;
  } catch (error) {
    console.error('Failed to download artifact:', error.message);
    return null;
  }
}

export async function fetchPullRequests(repo, state = 'all') {
  try {
    const response = await fetchWithDedup(
      `/repos/${OWNER}/${repo}/pulls`,
      {
        params: {
          state,
          per_page: 10,
          sort: 'updated',
          direction: 'desc'
        }
      }
    );
    return response.data || [];
  } catch (error) {
    console.error(`Failed to fetch pull requests for ${repo}:`, error.message);
    return [];
  }
}

export async function fetchRepository(repo) {
  try {
    const response = await fetchWithDedup(`/repos/${OWNER}/${repo}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch repository ${repo}:`, error.message);
    return null;
  }
}

export async function fetchCommit(repo, sha) {
  try {
    const response = await fetchWithDedup(`/repos/${OWNER}/${repo}/commits/${sha}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch commit ${sha}:`, error.message);
    return null;
  }
}

export async function fetchBranches(repo) {
  try {
    const response = await fetchWithDedup(
      `/repos/${OWNER}/${repo}/branches`,
      { params: { per_page: 100 } }
    );
    return response.data || [];
  } catch (error) {
    console.error(`Failed to fetch branches for ${repo}:`, error.message);
    return [];
  }
}

export async function fetchRepoStats(repo) {
  try {
    const [repoData, branches, pulls] = await Promise.all([
      fetchRepository(repo),
      fetchBranches(repo),
      fetchPullRequests(repo, 'open')
    ]);

    return {
      stars: repoData?.stargazers_count || 0,
      forks: repoData?.forks_count || 0,
      issues: repoData?.open_issues_count || 0,
      branches: branches.length,
      openPRs: pulls.length,
      language: repoData?.language || 'Unknown',
      size: repoData?.size || 0,
      updatedAt: repoData?.updated_at
    };
  } catch (error) {
    console.error(`Failed to fetch stats for ${repo}:`, error.message);
    return null;
  }
}

// Batch API requests to avoid rate limiting
async function batchFetchRepos(repos, batchSize = 3) {
  const results = [];

  for (let i = 0; i < repos.length; i += batchSize) {
    const batch = repos.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (repo) => {
        try {
          const trimmedRepo = repo.trim();

          const [runs, stats] = await Promise.all([
            fetchWorkflowRuns(trimmedRepo),
            fetchRepoStats(trimmedRepo)
          ]);

          const runDataPromises = runs.slice(0, 5).map(async (run) => {
            const [artifacts, jobs] = await Promise.all([
              fetchArtifacts(trimmedRepo, run.id),
              fetchJobs(trimmedRepo, run.id)
            ]);

            return {
              ...run,
              artifacts,
              jobs
            };
          });

          const enrichedRuns = await Promise.all(runDataPromises);

          return {
            repo: trimmedRepo,
            runs: enrichedRuns,
            stats
          };
        } catch (error) {
          console.error(`Failed to fetch data for ${repo}:`, error.message);
          return {
            repo: repo.trim(),
            runs: [],
            stats: null,
            error: error.message
          };
        }
      })
    );

    results.push(...batchResults);

    // Add small delay between batches to respect rate limits
    if (i + batchSize < repos.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

export async function fetchAllRepoData(repos) {
  if (!repos || repos.length === 0) {
    console.warn('No repositories specified');
    return [];
  }

  // Use batched fetching with rate limit protection
  return batchFetchRepos(repos, 3);
}