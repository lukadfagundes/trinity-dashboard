import '@testing-library/jest-dom';

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Line: () => null,
  Bar: () => null,
  Doughnut: () => null,
  Scatter: () => null,
}));

// Mock environment variables
process.env.VITE_GITHUB_TOKEN = 'test-token';
process.env.VITE_GITHUB_OWNER = 'test-owner';
process.env.VITE_GITHUB_REPOS = 'test-repo';