// Quick integration test script
import pollingService from './src/services/pollingService.js';

console.log('Testing Polling Service...');

// Test 1: Start polling
const cleanup = pollingService.startPolling(
  'test-key',
  async () => {
    const data = { timestamp: new Date().toISOString(), random: Math.random() };
    console.log('Fetched data:', data);
    return data;
  },
  (data, error) => {
    if (error) {
      console.error('Polling error:', error);
    } else {
      console.log('Data updated:', data);
    }
  },
  2000 // 2 second intervals for testing
);

console.log('Is polling active?', pollingService.isPolling('test-key'));

// Test 2: Check after 10 seconds
setTimeout(() => {
  console.log('Stopping polling...');
  cleanup();
  console.log('Is polling active?', pollingService.isPolling('test-key'));
  console.log('Cached data:', pollingService.getCached('test-key'));
  console.log('Integration test complete!');
  process.exit(0);
}, 10000);