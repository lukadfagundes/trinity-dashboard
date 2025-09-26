import pollingService from '../pollingService';

describe('PollingService', () => {
  beforeEach(() => {
    pollingService.stopAll();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  afterEach(() => {
    pollingService.stopAll();
  });

  describe('polling operations', () => {
    it('should start polling and call fetch function', async () => {
      jest.useFakeTimers();
      const fetchFn = jest.fn(() => Promise.resolve({ data: 'test' }));
      const callback = jest.fn();

      pollingService.startPolling('test-key', fetchFn, callback, 1000);

      // Initial call should happen immediately
      await Promise.resolve();
      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Advance time and check periodic calls
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      expect(fetchFn).toHaveBeenCalledTimes(2);

      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      expect(fetchFn).toHaveBeenCalledTimes(3);

      jest.useRealTimers();
    });

    it('should only call callback when data changes', async () => {
      const fetchFn = jest.fn()
        .mockResolvedValueOnce({ value: 1 })
        .mockResolvedValueOnce({ value: 1 }) // Same data
        .mockResolvedValueOnce({ value: 2 }); // Different data

      const callback = jest.fn();

      jest.useFakeTimers();
      pollingService.startPolling('change-test', fetchFn, callback, 100);

      // First fetch
      jest.advanceTimersByTime(0);
      await Promise.resolve();
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ value: 1 });

      // Second fetch (same data)
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      expect(callback).toHaveBeenCalledTimes(1); // No new call

      // Third fetch (different data)
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenLastCalledWith({ value: 2 });

      jest.useRealTimers();
    });

    it('should stop polling when requested', () => {
      jest.useFakeTimers();
      const fetchFn = jest.fn(() => Promise.resolve({}));
      const callback = jest.fn();

      pollingService.startPolling('stop-test', fetchFn, callback, 1000);

      jest.advanceTimersByTime(0);
      expect(fetchFn).toHaveBeenCalledTimes(1);

      pollingService.stopPolling('stop-test');

      jest.advanceTimersByTime(2000);
      expect(fetchFn).toHaveBeenCalledTimes(1); // No additional calls

      jest.useRealTimers();
    });

    it('should handle fetch errors gracefully', async () => {
      const fetchFn = jest.fn(() => Promise.reject(new Error('Fetch failed')));
      const callback = jest.fn();

      jest.useFakeTimers();
      pollingService.startPolling('error-test', fetchFn, callback, 100);

      jest.advanceTimersByTime(0);
      await Promise.resolve();

      expect(callback).toHaveBeenCalledWith(null, expect.any(Error));

      jest.useRealTimers();
    });

    it('should support multiple subscribers', async () => {
      const fetchFn = jest.fn(() => Promise.resolve({ data: 'shared' }));
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      pollingService.startPolling('multi-test', fetchFn, callback1, 1000);
      pollingService.startPolling('multi-test', fetchFn, callback2, 1000);

      await Promise.resolve();

      expect(callback1).toHaveBeenCalledWith({ data: 'shared' });
      expect(callback2).toHaveBeenCalledWith({ data: 'shared' });
    });

    it('should cache data between polls', () => {
      const fetchFn = jest.fn(() => Promise.resolve({ data: 'cached' }));
      const callback = jest.fn();

      pollingService.startPolling('cache-test', fetchFn, callback, 1000);

      const cached = pollingService.getCached('cache-test');
      expect(cached).toBeNull(); // Not cached until first fetch completes
    });

    it('should check if polling is active', () => {
      const fetchFn = jest.fn(() => Promise.resolve({}));
      const callback = jest.fn();

      expect(pollingService.isPolling('active-test')).toBe(false);

      pollingService.startPolling('active-test', fetchFn, callback, 1000);
      expect(pollingService.isPolling('active-test')).toBe(true);

      pollingService.stopPolling('active-test');
      expect(pollingService.isPolling('active-test')).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should return cleanup function', () => {
      const cleanup = pollingService.startPolling(
        'cleanup-test',
        () => Promise.resolve({}),
        () => {},
        1000
      );

      expect(typeof cleanup).toBe('function');
      expect(pollingService.isPolling('cleanup-test')).toBe(true);

      cleanup();
      expect(pollingService.isPolling('cleanup-test')).toBe(false);
    });

    it('should stop all polling on stopAll', () => {
      pollingService.startPolling('test1', () => {}, () => {}, 1000);
      pollingService.startPolling('test2', () => {}, () => {}, 1000);

      expect(pollingService.isPolling('test1')).toBe(true);
      expect(pollingService.isPolling('test2')).toBe(true);

      pollingService.stopAll();

      expect(pollingService.isPolling('test1')).toBe(false);
      expect(pollingService.isPolling('test2')).toBe(false);
    });

    it('should clear cache on stopAll', () => {
      pollingService.cache.set('test-key', { data: 'test' });
      pollingService.stopAll();
      expect(pollingService.cache.size).toBe(0);
    });

    it('should handle beforeunload event', () => {
      const spy = jest.spyOn(pollingService, 'stopAll');

      const event = new Event('beforeunload');
      window.dispatchEvent(event);

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});