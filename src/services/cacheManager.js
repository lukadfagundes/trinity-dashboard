class CacheManager {
  constructor(cacheDuration = null) {
    this.cache = new Map();
    this.cacheDuration = cacheDuration || parseInt(import.meta.env.VITE_CACHE_DURATION) || 300000;
    this.storagePrefix = 'trinity_cache_';
    this.loadFromStorage();
  }

  generateKey(type, ...params) {
    return `${type}_${params.join('_')}`;
  }

  set(key, data) {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      expires: Date.now() + this.cacheDuration
    };

    this.cache.set(key, cacheEntry);

    try {
      localStorage.setItem(
        this.storagePrefix + key,
        JSON.stringify(cacheEntry)
      );
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
      this.cleanupStorage();
    }

    return cacheEntry;
  }

  get(key) {
    const cached = this.cache.get(key);

    if (!cached) {
      const stored = this.getFromStorage(key);
      if (stored) {
        this.cache.set(key, stored);
        return this.validateAndReturn(stored);
      }
      return null;
    }

    return this.validateAndReturn(cached);
  }

  validateAndReturn(cached) {
    if (Date.now() > cached.expires) {
      this.delete(cached.key);
      return null;
    }
    return cached.data;
  }

  getFromStorage(key) {
    try {
      const stored = localStorage.getItem(this.storagePrefix + key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() < parsed.expires) {
          return parsed;
        }
        localStorage.removeItem(this.storagePrefix + key);
      }
    } catch (error) {
      console.warn('Failed to retrieve from localStorage:', error);
    }
    return null;
  }

  delete(key) {
    this.cache.delete(key);
    try {
      localStorage.removeItem(this.storagePrefix + key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  clear() {
    this.cache.clear();
    this.clearStorage();
  }

  clearStorage() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.storagePrefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  loadFromStorage() {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach(key => {
      if (key.startsWith(this.storagePrefix)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (now < parsed.expires) {
              const cacheKey = key.replace(this.storagePrefix, '');
              this.cache.set(cacheKey, parsed);
            } else {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          console.warn('Failed to load cache entry:', key, error);
          localStorage.removeItem(key);
        }
      }
    });
  }

  cleanupStorage() {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    let cleaned = 0;

    keys.forEach(key => {
      if (key.startsWith(this.storagePrefix)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (now > parsed.expires) {
              localStorage.removeItem(key);
              cleaned++;
            }
          }
        } catch (error) {
          localStorage.removeItem(key);
          cleaned++;
        }
      }
    });

    if (cleaned > 0) {
      
    }
  }

  isRateLimited() {
    const remaining = localStorage.getItem('github_rate_remaining');
    const limit = localStorage.getItem('github_rate_limit');

    if (!remaining || !limit) return false;

    const remainingNum = parseInt(remaining);
    const limitNum = parseInt(limit);

    return remainingNum < 10 || (remainingNum / limitNum) < 0.1;
  }

  getRateLimitInfo() {
    const remaining = localStorage.getItem('github_rate_remaining');
    const limit = localStorage.getItem('github_rate_limit');
    const reset = localStorage.getItem('github_rate_reset');

    return {
      remaining: remaining ? parseInt(remaining) : null,
      limit: limit ? parseInt(limit) : null,
      reset: reset ? new Date(parseInt(reset) * 1000) : null,
      isLimited: this.isRateLimited()
    };
  }

  getCacheStats() {
    const stats = {
      entries: this.cache.size,
      storageEntries: 0,
      totalSize: 0,
      oldestEntry: null,
      newestEntry: null
    };

    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.storagePrefix)) {
        stats.storageEntries++;
        const value = localStorage.getItem(key);
        if (value) {
          stats.totalSize += value.length;
        }
      }
    });

    this.cache.forEach((entry) => {
      if (!stats.oldestEntry || entry.timestamp < stats.oldestEntry) {
        stats.oldestEntry = entry.timestamp;
      }
      if (!stats.newestEntry || entry.timestamp > stats.newestEntry) {
        stats.newestEntry = entry.timestamp;
      }
    });

    return stats;
  }
}

const cacheManager = new CacheManager();

setInterval(() => {
  cacheManager.cleanupStorage();
}, 60000);

export default cacheManager;