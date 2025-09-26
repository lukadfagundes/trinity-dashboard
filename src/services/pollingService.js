/**
 * Smart Polling Service
 * Replaces non-functional WebSocket with efficient polling
 * - Only updates when data changes
 * - Automatic cleanup on unmount
 * - Configurable intervals
 */

class PollingService {
  constructor() {
    this.intervals = new Map();
    this.cache = new Map();
    this.subscribers = new Map();
  }

  /**
   * Start polling an endpoint
   * @param {string} key - Unique identifier for this polling job
   * @param {Function} fetchFunction - Async function that fetches data
   * @param {Function} callback - Called when data changes
   * @param {number} interval - Polling interval in ms (default 5000)
   */
  startPolling(key, fetchFunction, callback, interval = 5000) {
    // Stop existing polling for this key
    this.stopPolling(key);

    // Store subscriber
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);

    // Initial fetch
    this.executePoll(key, fetchFunction);

    // Set up interval
    const intervalId = setInterval(() => {
      this.executePoll(key, fetchFunction);
    }, interval);

    this.intervals.set(key, intervalId);

    console.log(`[Polling] Started polling for ${key} every ${interval}ms`);

    // Return cleanup function
    return () => this.stopPolling(key);
  }

  async executePoll(key, fetchFunction) {
    try {
      const newData = await fetchFunction();

      // Check if data changed
      const cachedData = this.cache.get(key);
      const dataChanged = JSON.stringify(cachedData) !== JSON.stringify(newData);

      if (dataChanged) {
        this.cache.set(key, newData);

        // Notify all subscribers for this key
        const subscribers = this.subscribers.get(key);
        if (subscribers) {
          subscribers.forEach(callback => {
            try {
              callback(newData);
            } catch (error) {
              console.error(`[Polling] Subscriber error for ${key}:`, error);
            }
          });
        }
      }
    } catch (error) {
      console.error(`[Polling] Error polling ${key}:`, error);

      // Notify subscribers of error
      const subscribers = this.subscribers.get(key);
      if (subscribers) {
        subscribers.forEach(callback => {
          callback(null, error);
        });
      }
    }
  }

  stopPolling(key) {
    const intervalId = this.intervals.get(key);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(key);
      this.subscribers.delete(key);
      console.log(`[Polling] Stopped polling for ${key}`);
    }
  }

  stopAll() {
    this.intervals.forEach((intervalId, key) => {
      clearInterval(intervalId);
      console.log(`[Polling] Stopped polling for ${key}`);
    });
    this.intervals.clear();
    this.subscribers.clear();
    this.cache.clear();
  }

  isPolling(key) {
    return this.intervals.has(key);
  }

  getCached(key) {
    return this.cache.get(key);
  }
}

// Export singleton instance
export const pollingService = new PollingService();

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  pollingService.stopAll();
});

export default pollingService;