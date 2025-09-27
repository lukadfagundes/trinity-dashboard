// Central configuration service
// This service provides a single source of truth for all application configuration

export const config = {
  // Repository settings
  getOwner: () => import.meta.env.VITE_GITHUB_OWNER || 'trinity-method',
  getRepo: () => {
    const repos = import.meta.env.VITE_GITHUB_REPOS;
    if (repos && repos.includes(',')) {
      // Return first repo if multiple are configured
      return repos.split(',')[0].trim();
    }
    return repos || 'trinity-dashboard';
  },
  getAllRepos: () => {
    const repos = import.meta.env.VITE_GITHUB_REPOS;
    if (repos) {
      return repos.split(',').map(r => r.trim());
    }
    return ['trinity-dashboard'];
  },
  getRepoUrl: () => `https://github.com/${config.getOwner()}/${config.getRepo()}`,
  getIssuesUrl: () => `${config.getRepoUrl()}/issues`,

  // Thresholds
  getReadinessThreshold: () => Number(import.meta.env.VITE_READINESS_THRESHOLD) || 80,

  // App settings
  getAppTitle: () => import.meta.env.VITE_APP_TITLE || 'DevOps Dashboard',
  getAppDescription: () => import.meta.env.VITE_APP_DESCRIPTION || 'Real-time monitoring and analytics',
  getBasePath: () => import.meta.env.VITE_BASE_PATH || '/',

  // API settings
  getApiPageSize: () => Number(import.meta.env.VITE_API_PAGE_SIZE) || 100,
  getMaxContributors: () => Number(import.meta.env.VITE_MAX_CONTRIBUTORS) || 5,
  getChartWeeks: () => Number(import.meta.env.VITE_CHART_WEEKS) || 12,
  getRefreshInterval: () => Number(import.meta.env.VITE_API_REFRESH_INTERVAL) || 60000,
  getCacheDuration: () => Number(import.meta.env.VITE_CACHE_DURATION) || 300000,

  // Feature flags
  isDemoMode: () => import.meta.env.VITE_DEMO_MODE === 'true',
  isDebugMode: () => import.meta.env.VITE_DEBUG_MODE === 'true',

  // Webhook settings
  getWebhookUrl: () => import.meta.env.VITE_WEBHOOK_URL || '',
  getWebhookSecret: () => import.meta.env.VITE_WEBHOOK_SECRET || 'default-secret',
};

export default config;
