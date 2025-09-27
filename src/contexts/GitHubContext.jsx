import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  const [isDemoMode, setDemoMode] = useState(false);

  // Remove hardcoded sample data - just set demo mode
  const handleDemoMode = useCallback(() => {
    setDemoMode(true);
    setData([]); // Empty data in demo mode
    setError('Demo Mode - No GitHub Token configured');
    setLoading(false);
  }, []);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (USE_SAMPLE_DATA) {
      handleDemoMode();
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

      
    } catch (err) {
      console.error('[GitHub Context] Failed to fetch data:', err);
      setError(err.message || 'Failed to fetch data from GitHub');

      const cacheKey = 'dashboard_data_all';
      const fallbackData = cacheManager.get(cacheKey);
      if (fallbackData) {
        
        setData(fallbackData);
        setError(error => `${error} - Using cached data`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [handleDemoMode]);

  const refresh = useCallback(() => {
    
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

  const clearError = useCallback(() => setError(null), []);

  const getCacheStats = useCallback(() => cacheManager.getCacheStats(), []);

  const clearCache = useCallback(() => {
    cacheManager.clear();
  }, []);

  const value = useMemo(() => ({
    data,
    loading,
    error,
    lastUpdate,
    refresh,
    isAuthenticated,
    rateLimitInfo,
    refreshing,
    isDemoMode,
    clearError,
    getCacheStats,
    clearCache
  }), [
    data,
    loading,
    error,
    lastUpdate,
    refresh,
    isAuthenticated,
    rateLimitInfo,
    refreshing,
    isDemoMode,
    clearError,
    getCacheStats,
    clearCache
  ]);

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