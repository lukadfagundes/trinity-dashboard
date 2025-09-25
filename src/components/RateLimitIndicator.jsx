import { useState, useEffect } from 'react';
import { useGitHub } from '../contexts/GitHubContext';

const RateLimitIndicator = () => {
  const { rateLimitInfo } = useGitHub();
  const [rateLimit, setRateLimit] = useState({ remaining: null, limit: null, reset: null });
  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    const updateRateLimit = () => {
      const remaining = localStorage.getItem('github_rate_remaining');
      const limit = localStorage.getItem('github_rate_limit');
      const reset = localStorage.getItem('github_rate_reset');

      setRateLimit({
        remaining: remaining ? parseInt(remaining) : null,
        limit: limit ? parseInt(limit) : null,
        reset: reset ? new Date(parseInt(reset) * 1000) : null
      });

      if (reset) {
        const resetTime = parseInt(reset) * 1000;
        const now = Date.now();
        const diff = resetTime - now;

        if (diff > 0) {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeUntilReset(`${minutes}m ${seconds}s`);
        } else {
          setTimeUntilReset('Now');
        }
      }
    };

    updateRateLimit();
    const interval = setInterval(updateRateLimit, 5000);
    return () => clearInterval(interval);
  }, [rateLimitInfo]);

  if (rateLimit.remaining === null || rateLimit.limit === null) {
    return null;
  }

  const percentage = (rateLimit.remaining / rateLimit.limit) * 100;
  const isLow = percentage < 20;
  const isCritical = percentage < 5;

  const getStatusColor = () => {
    if (isCritical) return 'text-red-500 bg-red-900/20 border-red-900/50';
    if (isLow) return 'text-yellow-500 bg-yellow-900/20 border-yellow-900/50';
    return 'text-green-500 bg-green-900/20 border-green-900/50';
  };

  const getProgressBarColor = () => {
    if (isCritical) return 'bg-red-500';
    if (isLow) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`rounded-lg p-3 border ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 7a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm1 4a1 1 0 100 2h2a1 1 0 100-2H9z" />
          </svg>
          <span className="text-sm font-medium">API Rate Limit</span>
        </div>
        {rateLimit.reset && (
          <span className="text-xs opacity-75">
            Resets in {timeUntilReset}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span>{rateLimit.remaining} remaining</span>
          <span>{rateLimit.limit} limit</span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {isCritical && (
          <p className="text-xs mt-2 opacity-75">
            Rate limit critically low. API calls paused, using cached data.
          </p>
        )}
      </div>
    </div>
  );
};

export default RateLimitIndicator;