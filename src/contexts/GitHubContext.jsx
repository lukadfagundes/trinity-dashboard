import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchAllRepoData } from '../services/dataCollector';
import { transformRepoData } from '../services/dataTransformer';
import cacheManager from '../services/cacheManager';
import { checkAuthentication } from '../services/githubApi';

const GitHubContext = createContext();

const REFRESH_INTERVAL = parseInt(import.meta.env.VITE_API_REFRESH_INTERVAL) || 60000;
const USE_SAMPLE_DATA = !import.meta.env.VITE_GITHUB_TOKEN;

export function GitHubProvider({ children }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadSampleData = useCallback(async () => {
    try {
      const response = await fetch('/data/sample-runs.json');
      const sampleData = await response.json();

      const transformedData = [{
        repo: sampleData.project,
        runs: sampleData.runs,
        stats: {
          stars: 42,
          forks: 8,
          issues: 3,
          branches: 5,
          openPRs: 2,
          language: 'JavaScript',
          size: 1024,
          updatedAt: new Date().toISOString()
        },
        metrics: {
          coverage: sampleData.runs[0]?.metrics?.coverage || {},
          tests: sampleData.runs[0]?.metrics?.tests || {},
          security: sampleData.runs[0]?.metrics?.security || {},
          build: { success: 8, failed: 2, total: 10 }
        },
        health: { score: 85, level: 'healthy', color: 'green' },
        lastUpdate: new Date().toISOString()
      }];

      setData(transformedData);
      setLastUpdate(new Date());
      setError(null);
      console.log('[GitHub Context] Using sample data (no token provided)');
    } catch (err) {
      console.error('[GitHub Context] Failed to load sample data:', err);
      setError('Failed to load sample data');
    }
  }, []);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (USE_SAMPLE_DATA) {
      await loadSampleData();
      setLoading(false);
      return;
    }

    try {
      if (!forceRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const cacheKey = 'dashboard_data_all';

      if (!forceRefresh && !cacheManager.isRateLimited()) {
        const cachedData = cacheManager.get(cacheKey);
        if (cachedData) {
          console.log('[GitHub Context] Using cached data');
          setData(cachedData);
          setLastUpdate(new Date());
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      if (cacheManager.isRateLimited()) {
        console.warn('[GitHub Context] Rate limited, using cache only');
        const cachedData = cacheManager.get(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLastUpdate(new Date());
          setError('API rate limited - using cached data');
        } else {
          setError('API rate limited and no cache available');
        }
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const repos = import.meta.env.VITE_GITHUB_REPOS?.split(',').map(r => r.trim()) || [];

      if (repos.length === 0) {
        console.warn('[GitHub Context] No repositories configured');
        setError('No repositories configured in environment variables');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log('[GitHub Context] Fetching data for repositories:', repos);
      const rawData = await fetchAllRepoData(repos);

      const transformedData = rawData.map(repoData => {
        if (repoData.error) {
          console.error(`[GitHub Context] Error for ${repoData.repo}:`, repoData.error);
          return {
            repo: repoData.repo,
            runs: [],
            stats: null,
            metrics: null,
            health: { score: 0, level: 'critical', color: 'red' },
            error: repoData.error
          };
        }
        return transformRepoData(repoData);
      });

      cacheManager.set(cacheKey, transformedData);
      setData(transformedData);
      setLastUpdate(new Date());
      setError(null);

      const rateInfo = cacheManager.getRateLimitInfo();
      setRateLimitInfo(rateInfo);

      console.log('[GitHub Context] Data fetched successfully');
    } catch (err) {
      console.error('[GitHub Context] Failed to fetch data:', err);
      setError(err.message || 'Failed to fetch data from GitHub');

      const cacheKey = 'dashboard_data_all';
      const fallbackData = cacheManager.get(cacheKey);
      if (fallbackData) {
        console.log('[GitHub Context] Using fallback cached data');
        setData(fallbackData);
        setError(error => `${error} - Using cached data`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadSampleData]);

  const refresh = useCallback(() => {
    console.log('[GitHub Context] Manual refresh triggered');
    return fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    const initialize = async () => {
      if (!USE_SAMPLE_DATA) {
        const user = await checkAuthentication();
        setIsAuthenticated(!!user);
        if (!user) {
          console.warn('[GitHub Context] Not authenticated - API calls may be limited');
        }
      }

      await fetchData();
    };

    initialize();

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchData();
      }
    }, REFRESH_INTERVAL);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const lastUpdateTime = lastUpdate ? new Date(lastUpdate).getTime() : 0;
        const now = Date.now();
        if (now - lastUpdateTime > REFRESH_INTERVAL) {
          fetchData();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const value = {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
    isAuthenticated,
    rateLimitInfo,
    refreshing,
    clearError: () => setError(null),
    getCacheStats: () => cacheManager.getCacheStats(),
    clearCache: () => {
      cacheManager.clear();
      console.log('[GitHub Context] Cache cleared');
    }
  };

  return (
    <GitHubContext.Provider value={value}>
      {children}
    </GitHubContext.Provider>
  );
}

export const useGitHub = () => {
  const context = useContext(GitHubContext);
  if (!context) {
    throw new Error('useGitHub must be used within a GitHubProvider');
  }
  return context;
};