import axios from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const OWNER = import.meta.env.VITE_GITHUB_OWNER;
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';

if (DEBUG_MODE) {
  console.log('GitHub API initialized for owner:', OWNER);
}

const api = axios.create({
  baseURL: GITHUB_API_BASE,
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    ...(TOKEN && { 'Authorization': `Bearer ${TOKEN}` })
  }
});

api.interceptors.request.use(
  config => {
    if (DEBUG_MODE) {
      console.log(`[GitHub API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  error => {
    console.error('[GitHub API] Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    const remaining = response.headers['x-ratelimit-remaining'];
    const limit = response.headers['x-ratelimit-limit'];
    const reset = response.headers['x-ratelimit-reset'];

    if (remaining && reset) {
      localStorage.setItem('github_rate_remaining', remaining);
      localStorage.setItem('github_rate_limit', limit);
      localStorage.setItem('github_rate_reset', reset);

      if (DEBUG_MODE) {
        console.log(`[GitHub API] Rate limit: ${remaining}/${limit} (resets: ${new Date(reset * 1000).toLocaleTimeString()})`);
      }

      if (parseInt(remaining) < 10) {
        console.warn('[GitHub API] Rate limit low:', remaining, 'requests remaining');
      }
    }

    return response;
  },
  error => {
    if (error.response?.status === 403) {
      const resetTime = error.response.headers['x-ratelimit-reset'];
      if (resetTime) {
        const resetDate = new Date(resetTime * 1000);
        console.error(`[GitHub API] Rate limited. Resets at ${resetDate.toLocaleTimeString()}`);
      } else {
        console.error('[GitHub API] Access forbidden. Check your token permissions.');
      }
    } else if (error.response?.status === 401) {
      console.error('[GitHub API] Authentication failed. Check your GitHub token.');
    } else if (error.response?.status === 404) {
      console.error('[GitHub API] Resource not found. Check repository name and owner.');
    } else {
      console.error('[GitHub API] Error:', error.response?.status, error.message);
    }

    return Promise.reject(error);
  }
);

export const checkAuthentication = async () => {
  try {
    const response = await api.get('/user');
    console.log('[GitHub API] Authenticated as:', response.data.login);
    return response.data;
  } catch (error) {
    console.error('[GitHub API] Authentication check failed');
    return null;
  }
};

export const getRateLimit = async () => {
  try {
    const response = await api.get('/rate_limit');
    return response.data;
  } catch (error) {
    console.error('[GitHub API] Failed to get rate limit');
    return null;
  }
};

export default api;