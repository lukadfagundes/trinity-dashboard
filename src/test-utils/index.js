import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { GitHubProvider } from '../contexts/GitHubContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { PreferencesProvider } from '../contexts/PreferencesContext';

// Render with all providers
export const renderWithProviders = (ui, options = {}) => {
  const AllProviders = ({ children }) => (
    <BrowserRouter>
      <ThemeProvider>
        <PreferencesProvider>
          <GitHubProvider>
            {children}
          </GitHubProvider>
        </PreferencesProvider>
      </ThemeProvider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: AllProviders, ...options });
};

// Mock fetch for tests
export const mockFetch = (data, options = {}) => {
  const {
    status = 200,
    statusText = 'OK',
    headers = { 'content-type': 'application/json' },
    delay = 0
  } = options;

  return jest.fn(() =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ok: status >= 200 && status < 300,
          status,
          statusText,
          headers: new Map(Object.entries(headers)),
          json: async () => data,
          text: async () => JSON.stringify(data),
          clone: () => ({
            json: async () => data,
            text: async () => JSON.stringify(data)
          })
        });
      }, delay);
    })
  );
};

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Mock localStorage
export const mockLocalStorage = () => {
  const store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: jest.fn(key => { delete store[key]; }),
    clear: jest.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
    get length() { return Object.keys(store).length; },
    key: jest.fn(index => Object.keys(store)[index] || null)
  };
};

export * from '@testing-library/react';