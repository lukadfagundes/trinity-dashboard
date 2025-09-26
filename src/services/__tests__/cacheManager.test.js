/**
 * @jest-environment jsdom
 */
import cacheManager from '../cacheManager';

// Mock import.meta.env
global.import = {
  meta: {
    env: {
      VITE_CACHE_DURATION: '300000'
    }
  }
};

describe('CacheManager', () => {
  beforeEach(() => {
    cacheManager.clear();
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('basic operations', () => {
    it('should store and retrieve data', () => {
      const key = 'test-key';
      const data = { foo: 'bar' };

      cacheManager.set(key, data);
      const retrieved = cacheManager.get(key);

      expect(retrieved).toEqual(data);
    });

    it('should return null for non-existent keys', () => {
      const result = cacheManager.get('non-existent');
      expect(result).toBeNull();
    });

    it('should handle TTL expiration', () => {
      jest.useFakeTimers();
      const key = 'ttl-test';
      const data = { test: 'data' };

      cacheManager.set(key, data);
      expect(cacheManager.get(key)).toEqual(data);

      // Advance past cache duration (5 minutes by default)
      jest.advanceTimersByTime(300001);
      expect(cacheManager.get(key)).toBeNull();

      jest.useRealTimers();
    });

    it('should check if key exists', () => {
      cacheManager.set('exists', { data: 'test' });

      expect(cacheManager.has('exists')).toBe(true);
      expect(cacheManager.has('not-exists')).toBe(false);
    });

    it('should delete specific keys', () => {
      cacheManager.set('key1', 'data1');
      cacheManager.set('key2', 'data2');

      cacheManager.delete('key1');

      expect(cacheManager.has('key1')).toBe(false);
      expect(cacheManager.has('key2')).toBe(true);
    });

    it('should clear all cache', () => {
      cacheManager.set('key1', 'data1');
      cacheManager.set('key2', 'data2');

      cacheManager.clear();

      expect(cacheManager.has('key1')).toBe(false);
      expect(cacheManager.has('key2')).toBe(false);
    });

    it('should generate cache keys properly', () => {
      const key = cacheManager.generateKey('repos', 'owner', 'repo');
      expect(key).toBe('repos_owner_repo');
    });

    it('should persist to localStorage', () => {
      const key = 'persist-test';
      const data = { persist: true };

      cacheManager.set(key, data);

      const stored = localStorage.getItem('trinity_cache_' + key);
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored);
      expect(parsed.data).toEqual(data);
    });

    it('should load from localStorage on init', () => {
      const key = 'load-test';
      const data = { loaded: true };
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        expires: Date.now() + 300000
      };

      localStorage.setItem('trinity_cache_' + key, JSON.stringify(cacheEntry));

      // Create new instance
      const newManager = new cacheManager.constructor();
      const retrieved = newManager.get(key);

      expect(retrieved).toEqual(data);
    });

    it('should handle localStorage errors gracefully', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage full');
      });

      expect(() => {
        cacheManager.set('error-test', { data: 'test' });
      }).not.toThrow();

      localStorage.setItem = originalSetItem;
    });
  });

  describe('cache statistics', () => {
    it('should return cache stats', () => {
      cacheManager.set('key1', 'data1');
      cacheManager.set('key2', 'data2');

      const stats = cacheManager.getCacheStats();

      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });

    it('should track cache hits and misses', () => {
      cacheManager.set('exists', 'data');

      // Hit
      cacheManager.get('exists');
      // Miss
      cacheManager.get('not-exists');

      const stats = cacheManager.getCacheStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
    });
  });
});