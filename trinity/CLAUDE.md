# Trinity Method Behavioral Protocols

## IDENTITY
This is the Trinity Method enforcement layer for trinity-dashboard.
Parent: ../CLAUDE.md

## INVESTIGATION-FIRST DEVELOPMENT
ABSOLUTE REQUIREMENT: No code without investigation.

### Investigation Protocol
1. **Scope Definition** (5 min)
   - Define exact boundaries
   - Identify affected components
   - List success criteria

2. **Discovery Phase** (15 min)
   - Analyze existing patterns
   - Review related code
   - Check knowledge base

3. **Documentation** (5 min)
   - Record in trinity/investigations/[date]-[feature].md
   - Update trinity/patterns/ if pattern discovered
   - Link to relevant issues in ISSUES.md

## SESSION WORKFLOW PROTOCOLS

### Session Initialization
```yaml
Session_Start:
  1_Context_Load:
    - Read all CLAUDE.md files
    - Load To-do.md current tasks
    - Check Technical-Debt.md priorities
    - Review recent ISSUES.md entries

  2_Health_Check:
    - Run npm run dev (Vite dev server)
    - Execute npm run lint (ESLint check)
    - Verify npm run build (production build)
    - Check dependency vulnerabilities

  3_Session_Planning:
    - Select tasks from To-do.md
    - Set session goals
    - Allocate time blocks
    - Define success metrics
```

### Session Completion
```yaml
Session_End:
  1_Documentation:
    - Update ARCHITECTURE.md with changes
    - Add completed items to session archive
    - Update To-do.md with remaining tasks
    - Record new issues in ISSUES.md

  2_Knowledge_Capture:
    - Document patterns discovered
    - Update investigation records
    - Record technical decisions
    - Update Trinity.md if needed

  3_Archive:
    - Move to trinity/sessions/[date]/
    - Create session summary
    - Update metrics tracking
    - Plan next session
```

## DEBUGGING STANDARDS

### Mandatory Debug Implementation
Every function must include entry/exit logging:

```javascript
// For React/Vite projects
function functionName(params) {
  console.log(`[ENTRY] functionName`, {
    params,
    timestamp: Date.now(),
    module: 'MODULE_NAME',
    stack: 'React/Vite',
    component: 'COMPONENT_NAME'
  });

  const startTime = Date.now();

  try {
    // Function logic here
    const result = /* implementation */;

    console.log(`[EXIT] functionName`, {
      result,
      duration: Date.now() - startTime,
      success: true,
      module: 'MODULE_NAME'
    });

    return result;
  } catch (error) {
    console.error(`[ERROR] functionName`, {
      error: error.message,
      stack: error.stack,
      duration: Date.now() - startTime,
      success: false,
      module: 'MODULE_NAME'
    });
    throw error;
  }
}
```

### React Component Debugging
```jsx
// Component debug pattern
function ComponentName({ props }) {
  console.log(`[RENDER] ComponentName`, {
    props,
    timestamp: Date.now(),
    renderCount: useRef(0).current++
  });

  useEffect(() => {
    console.log(`[MOUNT] ComponentName`, {
      props,
      timestamp: Date.now()
    });

    return () => {
      console.log(`[UNMOUNT] ComponentName`, {
        timestamp: Date.now()
      });
    };
  }, []);

  // Component logic
}
```

## CRISIS MANAGEMENT PROTOCOLS

### Console Error Crisis
IMMEDIATE upon detection:
1. Screenshot all errors with browser dev tools
2. Document in ISSUES.md with error stack traces
3. Trace error source through React component tree
4. Implement fix with full debugging enabled
5. Add error boundary if component-level error
6. Update patterns database with prevention

### Performance Crisis (React/Vite specific)
When baselines exceeded:
1. Profile with React Developer Tools
2. Analyze bundle size with Vite build --analyze
3. Check for unnecessary re-renders
4. Identify memory leaks in useEffect
5. Optimize heavy computations with useMemo/useCallback
6. Document findings in Technical-Debt.md

### Data Integrity Crisis
Upon data inconsistency:
1. Halt all state updates
2. Audit React context providers
3. Check localStorage/sessionStorage
4. Verify API response schemas
5. Restore from known good state
6. Implement validation with PropTypes or TypeScript

### Build System Crisis (Vite specific)
When build fails or degrades:
1. Check Vite configuration (vite.config.js)
2. Verify import/export statements (ES modules)
3. Analyze dependency conflicts
4. Check for circular dependencies
5. Validate Tailwind CSS compilation
6. Test production build locally

## QUALITY ENFORCEMENT

### Pre-Implementation Checklist
- [ ] Investigation completed and documented
- [ ] Existing patterns reviewed in trinity/patterns/
- [ ] Knowledge base checked for similar implementations
- [ ] React component architecture planned
- [ ] State management approach defined
- [ ] Performance impact assessed with React profiler

### Pre-Commit Checklist
- [ ] ESLint passes (npm run lint)
- [ ] Prettier formatting applied
- [ ] All console.log debugging implemented
- [ ] React DevTools show no warnings
- [ ] Production build successful (npm run build)
- [ ] Performance baselines validated
- [ ] Documentation updated in trinity/

## REACT/VITE SPECIFIC PROTOCOLS

### Component Development Standards
```jsx
// Standard component template
import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

function ComponentName({ prop1, prop2, onAction }) {
  // Debug logging
  console.log(`[RENDER] ComponentName`, { prop1, prop2 });

  // State management
  const [state, setState] = useState(initialValue);

  // Memoized values
  const computedValue = useMemo(() => {
    return expensiveComputation(prop1);
  }, [prop1]);

  // Callbacks
  const handleAction = useCallback((data) => {
    console.log(`[ACTION] ComponentName.handleAction`, { data });
    onAction(data);
  }, [onAction]);

  // Effects
  useEffect(() => {
    console.log(`[EFFECT] ComponentName mount/update`);

    return () => {
      console.log(`[CLEANUP] ComponentName effect`);
    };
  }, [dependencies]);

  return (
    <div className="component-wrapper">
      {/* JSX content */}
    </div>
  );
}

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
  onAction: PropTypes.func
};

ComponentName.defaultProps = {
  prop2: 0,
  onAction: () => {}
};

export default ComponentName;
```

### State Management Patterns
```jsx
// Context pattern
const StateContext = createContext();

export function StateProvider({ children }) {
  console.log(`[PROVIDER] StateProvider render`);

  const [state, setState] = useState(initialState);

  const actions = useMemo(() => ({
    updateState: (newState) => {
      console.log(`[ACTION] updateState`, { newState });
      setState(prev => ({ ...prev, ...newState }));
    }
  }), []);

  const value = useMemo(() => ({
    state,
    actions
  }), [state, actions]);

  return (
    <StateContext.Provider value={value}>
      {children}
    </StateContext.Provider>
  );
}
```

## SUCCESS METRICS
Track and report weekly:
```javascript
const trinityMetrics = {
  investigationSuccessRate: 0,    // Investigations preventing issues
  patternReuseRate: 0,            // Patterns reused vs created
  issueRecurrenceRate: 0,         // Issues that reappear
  knowledgeGrowthRate: 0,         // Knowledge base expansion
  sessionSuccessRate: 0,          // Sessions meeting goals
  crisisPreventionRate: 0,        // Crises prevented by protocols
  qualityGatePassRate: 0,         // First-time quality passes
  performanceImprovement: 0,      // Performance vs baseline
  reactRenderOptimization: 0,     // React-specific optimizations
  bundleSizeReduction: 0,         // Vite bundle optimizations
  eslintPassRate: 0,              // Code quality metrics
  buildTimeImprovement: 0         // Build performance metrics
};
```

## VITE-SPECIFIC CONFIGURATIONS

### Development Server Requirements
```javascript
// vite.config.js standards
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});
```

### Environment Configuration
```bash
# Required environment variables
VITE_API_BASE_URL=
VITE_APP_VERSION=
VITE_ENVIRONMENT=development|production
```

## EMERGENCY PROCEDURES

### Hot Module Replacement Failure
1. Check Vite HMR configuration
2. Restart dev server (npm run dev)
3. Clear browser cache and reload
4. Check for circular imports
5. Verify React Fast Refresh compatibility

### Memory Leak Detection
1. Use React DevTools Profiler
2. Monitor component mount/unmount cycles
3. Check useEffect cleanup functions
4. Audit event listeners and subscriptions
5. Validate context provider efficiency