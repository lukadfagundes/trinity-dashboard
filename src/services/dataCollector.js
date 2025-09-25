import api from './githubApi';

const OWNER = import.meta.env.VITE_GITHUB_OWNER || 'trinity-method';

export async function fetchWorkflowRuns(repo) {
  try {
    const response = await api.get(
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
    const response = await api.get(
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
    const response = await api.get(
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
    const response = await api.get(
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
    const response = await api.get(`/repos/${OWNER}/${repo}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch repository ${repo}:`, error.message);
    return null;
  }
}

export async function fetchCommit(repo, sha) {
  try {
    const response = await api.get(`/repos/${OWNER}/${repo}/commits/${sha}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch commit ${sha}:`, error.message);
    return null;
  }
}

export async function fetchBranches(repo) {
  try {
    const response = await api.get(
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

export async function fetchAllRepoData(repos) {
  if (!repos || repos.length === 0) {
    console.warn('No repositories specified');
    return [];
  }

  const allData = [];

  for (const repo of repos) {
    try {
      const trimmedRepo = repo.trim();
      console.log(`Fetching data for ${trimmedRepo}...`);

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

      allData.push({
        repo: trimmedRepo,
        runs: enrichedRuns,
        stats
      });
    } catch (error) {
      console.error(`Failed to fetch data for ${repo}:`, error.message);
      allData.push({
        repo: repo.trim(),
        runs: [],
        stats: null,
        error: error.message
      });
    }
  }

  return allData;
}