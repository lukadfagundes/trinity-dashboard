import { useState, useEffect } from 'react';
import { usePolling } from '../hooks/usePolling';

function IntegrationTest() {
  const [testError, setTestError] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);

  // Test error boundary
  if (testError) {
    throw new Error('Integration test error - Error boundary should catch this');
  }

  // Test polling service
  const { data, error, isPolling } = usePolling(
    'integration-test',
    async () => {
      const timestamp = new Date().toISOString();
      setPollingCount(prev => prev + 1);
      return { timestamp, count: pollingCount };
    },
    { interval: 5000, enabled: true }
  );

  // Test async error
  const triggerAsyncError = () => {
    setTimeout(() => {
      Promise.reject(new Error('Test async error - Should be caught by global handler'));
    }, 1000);
  };

  return (
    <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Integration Test Panel</h2>

      <div className="space-y-4">
        {/* Error Boundary Test */}
        <div className="p-3 bg-white rounded">
          <h3 className="font-semibold">Error Boundary Test</h3>
          <button
            onClick={() => setTestError(true)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Trigger Component Error
          </button>
        </div>

        {/* Async Error Test */}
        <div className="p-3 bg-white rounded">
          <h3 className="font-semibold">Async Error Handler Test</h3>
          <button
            onClick={triggerAsyncError}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Trigger Async Error
          </button>
        </div>

        {/* Polling Test */}
        <div className="p-3 bg-white rounded">
          <h3 className="font-semibold">Polling Service Test</h3>
          <p>Polling Active: {isPolling ? '✅' : '❌'}</p>
          <p>Update Count: {pollingCount}</p>
          <p>Last Update: {data?.timestamp || 'Not yet'}</p>
          {error && <p className="text-red-500">Error: {error.message}</p>}
        </div>
      </div>
    </div>
  );
}

export default IntegrationTest;