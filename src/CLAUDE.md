# React/Vite-Specific Behavioral Modifications

## IDENTITY
Technology-specific behaviors for trinity-dashboard.
Parent: ../CLAUDE.md
Technology: JavaScript/TypeScript with React/Vite

## FRAMEWORK-SPECIFIC PATTERNS

### React 18.3.1 Best Practices
- Use functional components with hooks exclusively
- Implement Suspense for lazy loading
- Utilize concurrent features (useTransition, useDeferredValue)
- Follow React 18 strict mode requirements
- Implement proper error boundaries

### Vite 7.1.7 Optimization
- Leverage ES module native imports
- Use dynamic imports for code splitting
- Optimize dependency pre-bundling
- Implement proper asset handling
- Configure build optimization for production

### Component Standards
```jsx
// Standard component structure
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { propTypes } from 'prop-types';

const ComponentName = memo(function ComponentName({
  requiredProp,
  optionalProp = defaultValue,
  onAction
}) {
  // 1. Debug logging
  console.log(`[RENDER] ${ComponentName.name}`, {
    requiredProp,
    optionalProp,
    renderTime: Date.now()
  });

  // 2. State declarations
  const [localState, setLocalState] = useState(null);

  // 3. Memoized computations
  const expensiveValue = useMemo(() => {
    return computeExpensiveValue(requiredProp);
  }, [requiredProp]);

  // 4. Callback definitions
  const handleUserAction = useCallback((event) => {
    console.log(`[ACTION] ${ComponentName.name}.handleUserAction`, { event });
    onAction?.(event);
  }, [onAction]);

  // 5. Effects
  useEffect(() => {
    console.log(`[EFFECT] ${ComponentName.name} mounted`);

    return () => {
      console.log(`[CLEANUP] ${ComponentName.name} unmounted`);
    };
  }, []);

  // 6. Early returns for conditional rendering
  if (!requiredProp) {
    console.log(`[EARLY_RETURN] ${ComponentName.name} - missing required prop`);
    return null;
  }

  // 7. JSX return
  return (
    <div className="component-container" data-testid="component-name">
      {/* Component content */}
    </div>
  );
});

ComponentName.propTypes = {
  requiredProp: propTypes.string.isRequired,
  optionalProp: propTypes.number,
  onAction: propTypes.func
};

export default ComponentName;
```

### State Management Rules
```jsx
// Context-based state management
import { createContext, useContext, useReducer, useMemo } from 'react';

// State context
const AppStateContext = createContext(null);

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  UPDATE_DATA: 'UPDATE_DATA'
};

// Reducer
function appReducer(state, action) {
  console.log(`[REDUCER] ${action.type}`, { state, action });

  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.UPDATE_DATA:
      return { ...state, data: action.payload, error: null };
    default:
      console.warn(`[REDUCER] Unknown action type: ${action.type}`);
      return state;
  }
}

// Provider component
export function AppStateProvider({ children }) {
  console.log(`[PROVIDER] AppStateProvider render`);

  const [state, dispatch] = useReducer(appReducer, {
    loading: false,
    error: null,
    data: null
  });

  const contextValue = useMemo(() => ({
    state,
    actions: {
      setLoading: (loading) => dispatch({ type: ACTIONS.SET_LOADING, payload: loading }),
      setError: (error) => dispatch({ type: ACTIONS.SET_ERROR, payload: error }),
      updateData: (data) => dispatch({ type: ACTIONS.UPDATE_DATA, payload: data })
    }
  }), [state]);

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
}

// Custom hook
export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  return context;
}
```

### Performance Optimizations
```jsx
// Lazy loading pattern
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}

// Virtual scrolling for large lists
import { useMemo, useCallback } from 'react';

function VirtualList({ items, itemHeight, containerHeight }) {
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length
    );

    return items.slice(startIndex, endIndex);
  }, [items, itemHeight, containerHeight, scrollTop]);

  return (
    <div style={{ height: containerHeight, overflow: 'auto' }}>
      {visibleItems.map(item => (
        <div key={item.id} style={{ height: itemHeight }}>
          {item.content}
        </div>
      ))}
    </div>
  );
}
```

## TECHNOLOGY DEBUGGING STANDARDS

### Debug Implementation for React/Vite
```jsx
// React DevTools integration
function ComponentWithDevTools({ name, ...props }) {
  // Display name for React DevTools
  ComponentWithDevTools.displayName = name;

  // Custom hook for debugging
  const useDebug = (componentName, props) => {
    useEffect(() => {
      if (process.env.NODE_ENV === 'development') {
        console.group(`🔍 ${componentName} Debug Info`);
        console.log('Props:', props);
        console.log('Render time:', new Date().toISOString());
        console.groupEnd();
      }
    });
  };

  useDebug(name, props);

  // Component logic
}

// Performance monitoring
function usePerformanceMonitor(componentName) {
  const renderStart = useRef(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    console.log(`⚡ ${componentName} render time: ${renderTime.toFixed(2)}ms`);
  });
}
```

### Error Handling Patterns
```jsx
// Error boundary component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 Error Boundary Caught:', {
      error: error.message,
      stack: error.stack,
      errorInfo: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    // Log to external service if needed
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService(error, errorInfo) {
    // Implementation for error logging service
    console.log('📊 Logging error to monitoring service');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error Details</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Async error handling
function useAsyncError() {
  const [, setError] = useState();

  return useCallback((error) => {
    console.error('🚨 Async Error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    setError(() => {
      throw error;
    });
  }, []);
}
```

### Logging Standards
```jsx
// Centralized logging utility
const Logger = {
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 [DEBUG] ${message}`, data);
    }
  },

  info: (message, data = {}) => {
    console.info(`ℹ️ [INFO] ${message}`, data);
  },

  warn: (message, data = {}) => {
    console.warn(`⚠️ [WARN] ${message}`, data);
  },

  error: (message, error = {}) => {
    console.error(`🚨 [ERROR] ${message}`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...error
    });
  },

  performance: (operation, duration) => {
    console.log(`⚡ [PERF] ${operation}: ${duration.toFixed(2)}ms`);
  }
};

// Usage in components
function MyComponent() {
  Logger.debug('MyComponent rendering');

  const handleClick = useCallback(() => {
    const start = performance.now();

    try {
      // Operation
      Logger.info('Button clicked', { component: 'MyComponent' });
    } catch (error) {
      Logger.error('Button click failed', error);
    } finally {
      Logger.performance('Button click', performance.now() - start);
    }
  }, []);
}
```

## BUILD AND DEPLOYMENT

### Development Commands
```bash
# Start development server with hot reload
npm run dev

# Run ESLint for code quality
npm run lint

# Build for production with optimization
npm run build

# Preview production build locally
npm run preview

# Format code with Prettier
npx prettier --write src/

# Analyze bundle size
npm run build -- --analyze
```

### Vite Configuration Standards
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Babel configuration
      babel: {
        plugins: ['babel-plugin-styled-components']
      }
    })
  ],

  // Development server
  server: {
    port: 3000,
    open: true,
    cors: true,
    hmr: {
      overlay: true
    }
  },

  // Build optimization
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2']
        }
      }
    }
  },

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@contexts': path.resolve(__dirname, 'src/contexts')
    }
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'chart.js',
      'lodash'
    ]
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
});
```

### Deployment Configuration
```json
// package.json deployment scripts
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist",
    "deploy:preview": "npm run build && npm run preview"
  }
}
```

## TESTING REQUIREMENTS

### Unit Testing Patterns
```jsx
// Component testing with React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, describe, vi } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  test('renders with required props', () => {
    const mockOnAction = vi.fn();

    render(
      <MyComponent
        requiredProp="test"
        onAction={mockOnAction}
      />
    );

    expect(screen.getByTestId('component-name')).toBeInTheDocument();
  });

  test('handles user interactions', async () => {
    const user = userEvent.setup();
    const mockOnAction = vi.fn();

    render(
      <MyComponent
        requiredProp="test"
        onAction={mockOnAction}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(mockOnAction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click'
        })
      );
    });
  });
});
```

### Integration Testing
```jsx
// Context provider testing
import { render, screen } from '@testing-library/react';
import { AppStateProvider, useAppState } from './AppStateProvider';

function TestComponent() {
  const { state, actions } = useAppState();

  return (
    <div>
      <span data-testid="loading">{state.loading.toString()}</span>
      <button onClick={() => actions.setLoading(true)}>
        Set Loading
      </button>
    </div>
  );
}

test('context provider manages state correctly', async () => {
  render(
    <AppStateProvider>
      <TestComponent />
    </AppStateProvider>
  );

  const loadingSpan = screen.getByTestId('loading');
  const button = screen.getByText('Set Loading');

  expect(loadingSpan).toHaveTextContent('false');

  fireEvent.click(button);

  expect(loadingSpan).toHaveTextContent('true');
});
```

## SECURITY CONSIDERATIONS

### React/Vite Security
```jsx
// XSS prevention
function SafeComponent({ userContent }) {
  // Never use dangerouslySetInnerHTML with user content
  // Use text content or sanitize first

  const sanitizeContent = (content) => {
    // Use a proper sanitization library
    return DOMPurify.sanitize(content);
  };

  return (
    <div>
      {/* Safe text rendering */}
      <p>{userContent}</p>

      {/* Sanitized HTML if absolutely necessary */}
      <div
        dangerouslySetInnerHTML={{
          __html: sanitizeContent(userContent)
        }}
      />
    </div>
  );
}

// Environment variable security
const getEnvironmentVariable = (key, defaultValue = '') => {
  // Only use VITE_ prefixed variables in client code
  const value = import.meta.env[`VITE_${key}`];

  if (!value && !defaultValue) {
    console.error(`Missing environment variable: VITE_${key}`);
  }

  return value || defaultValue;
};
```

### Authentication Patterns
```jsx
// Secure authentication context
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication on mount
    checkAuthStatus()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const user = await authenticateUser(credentials);
      setUser(user);

      // Store token securely (httpOnly cookie preferred)
      // Avoid localStorage for sensitive tokens

      return user;
    } catch (error) {
      Logger.error('Authentication failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      Logger.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Data Validation
```jsx
// Input validation patterns
import PropTypes from 'prop-types';

// Custom validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== '';
};

// Form validation hook
function useFormValidation(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const validate = useCallback((fieldName, value) => {
    const rules = validationRules[fieldName] || [];
    let error = '';

    for (const rule of rules) {
      if (!rule.validator(value)) {
        error = rule.message;
        break;
      }
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));

    return !error;
  }, [validationRules]);

  const setValue = useCallback((fieldName, value) => {
    setValues(prev => ({
      ...prev,
      [fieldName]: value
    }));

    validate(fieldName, value);
  }, [validate]);

  const isValid = useMemo(() => {
    return Object.values(errors).every(error => !error);
  }, [errors]);

  return {
    values,
    errors,
    setValue,
    validate,
    isValid
  };
}
```

## PERFORMANCE TUNING

### React/Vite Optimizations
```jsx
// Bundle splitting and lazy loading
import { lazy, Suspense } from 'react';

// Dynamic imports for route-based code splitting
const Dashboard = lazy(() => import('@pages/Dashboard'));
const Analytics = lazy(() => import('@pages/Analytics'));
const Settings = lazy(() => import('@pages/Settings'));

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<PageLoader />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="/analytics"
          element={
            <Suspense fallback={<PageLoader />}>
              <Analytics />
            </Suspense>
          }
        />
      </Routes>
    </Router>
  );
}

// Image optimization
function OptimizedImage({ src, alt, width, height, ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="image-container">
      {!isLoaded && !hasError && (
        <div className="image-placeholder" style={{ width, height }}>
          Loading...
        </div>
      )}

      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        style={{
          display: isLoaded ? 'block' : 'none',
          objectFit: 'cover'
        }}
        {...props}
      />

      {hasError && (
        <div className="image-error" style={{ width, height }}>
          Failed to load image
        </div>
      )}
    </div>
  );
}
```

### Monitoring Points
```jsx
// Performance monitoring
function usePerformanceObserver() {
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          Logger.performance(entry.name, entry.duration);

          // Alert on slow operations
          if (entry.duration > 100) {
            Logger.warn(`Slow operation detected: ${entry.name}`, {
              duration: entry.duration,
              type: entry.entryType
            });
          }
        }
      });

      observer.observe({ entryTypes: ['measure', 'navigation'] });

      return () => observer.disconnect();
    }
  }, []);
}

// React-specific performance monitoring
function useRenderPerformance(componentName) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - lastRenderTime.current;

    Logger.performance(`${componentName} render #${renderCount.current}`, renderTime);

    lastRenderTime.current = Date.now();
  });
}
```

### Profiling Tools
```jsx
// React Profiler integration
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration, baseDuration, startTime, commitTime) {
  Logger.performance(`Profiler ${id}`, {
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  });

  if (actualDuration > 16) { // More than one frame
    Logger.warn(`Slow render detected in ${id}`, {
      actualDuration,
      phase
    });
  }
}

function ProfiledComponent({ children }) {
  return (
    <Profiler id="ProfiledComponent" onRender={onRenderCallback}>
      {children}
    </Profiler>
  );
}

// Memory usage monitoring
function useMemoryMonitoring() {
  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = performance.memory;

        Logger.info('Memory usage', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
        });
      }
    };

    const interval = setInterval(checkMemory, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);
}
```