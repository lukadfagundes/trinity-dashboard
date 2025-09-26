import { useEffect, useState, useRef } from 'react';
import pollingService from '../services/pollingService';

/**
 * Hook for polling data with automatic cleanup
 * @param {string} key - Unique identifier
 * @param {Function} fetchFunction - Async function to fetch data
 * @param {Object} options - { interval: 5000, enabled: true }
 */
export const usePolling = (key, fetchFunction, options = {}) => {
  const { interval = 5000, enabled = true } = options;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (!enabled || !key || !fetchFunction) {
      return;
    }

    setIsPolling(true);
    setError(null);

    // Start polling
    cleanupRef.current = pollingService.startPolling(
      key,
      fetchFunction,
      (newData, pollError) => {
        if (pollError) {
          setError(pollError);
          setData(null);
        } else {
          setData(newData);
          setError(null);
        }
      },
      interval
    );

    // Cleanup on unmount or dependency change
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      setIsPolling(false);
    };
  }, [key, enabled, interval]); // fetchFunction excluded to prevent re-creation issues

  return {
    data,
    error,
    isPolling,
    refresh: () => pollingService.executePoll(key, fetchFunction)
  };
};

export default usePolling;