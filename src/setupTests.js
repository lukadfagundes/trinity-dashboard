// jest-dom adds custom jest matchers for asserting on DOM nodes
import '@testing-library/jest-dom';

// Mock import.meta.env for Vite
global.import = {
  meta: {
    env: {
      VITE_GITHUB_TOKEN: 'test-token',
      VITE_GITHUB_OWNER: 'test-owner',
      VITE_GITHUB_REPOS: 'test-repo',
      VITE_API_REFRESH_INTERVAL: '60000',
      VITE_CACHE_DURATION: '300000',
      VITE_WEBHOOK_URL: 'http://test.com/webhook',
      VITE_WEBHOOK_SECRET: 'test-secret'
    }
  }
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
};

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

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
