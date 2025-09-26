# React Performance Investigation Template

## Performance Issue Overview
- **Issue Title**: [Performance Issue Title]
- **Investigation Date**: [Date]
- **Investigator**: [Name/ID]
- **Severity**: [Critical/High/Medium/Low]

## Performance Baseline
- **Initial Load Time**: [ms]
- **Time to Interactive**: [ms]
- **First Contentful Paint**: [ms]
- **Largest Contentful Paint**: [ms]
- **Bundle Size**: [KB]

## Symptoms
- [ ] Slow initial load
- [ ] Laggy user interactions
- [ ] High memory usage
- [ ] Excessive re-renders
- [ ] Large bundle size
- [ ] Other: [Describe]

## Investigation Tools

### React DevTools Profiler
- **Profiling Session Duration**: [Duration]
- **Components with Longest Render Times**:
  1. [Component] - [ms]
  2. [Component] - [ms]
  3. [Component] - [ms]

### Browser Performance Tools
- **Chrome DevTools Performance**: [Findings]
- **Lighthouse Score**: [Score/100]
- **Memory Usage**: [Peak MB]

### Bundle Analysis
```bash
# Vite bundle analysis commands used
npm run build -- --analyze
# Or
npx vite-bundle-analyzer dist
```

## Performance Bottlenecks Identified

### 1. [Bottleneck Category]
**Component/Module**: [Name]
**Issue**: [Description]
**Impact**: [Performance impact]
**Evidence**: [Measurements/Screenshots]

### 2. [Bottleneck Category]
**Component/Module**: [Name]
**Issue**: [Description]
**Impact**: [Performance impact]
**Evidence**: [Measurements/Screenshots]

## Optimization Strategies Applied

### Code Splitting
- [ ] Route-based splitting implemented
- [ ] Component-based splitting implemented
- [ ] Dynamic imports added

```typescript
// Dynamic import examples
const LazyComponent = lazy(() => import('./LazyComponent'));
```

### React Optimization
- [ ] useMemo implemented for expensive calculations
- [ ] useCallback implemented for event handlers
- [ ] React.memo implemented for pure components
- [ ] Unnecessary re-renders eliminated

```typescript
// Optimization examples
const memoizedValue = useMemo(() => {
  return expensiveCalculation(deps);
}, [deps]);
```

### Bundle Optimization
- [ ] Tree shaking verified
- [ ] Unused dependencies removed
- [ ] Code compression optimized
- [ ] Asset optimization applied

## Results

### Performance Improvements
- **Initial Load Time**: [Before] → [After] ([%] improvement)
- **Time to Interactive**: [Before] → [After] ([%] improvement)
- **Bundle Size**: [Before] → [After] ([%] reduction)
- **Lighthouse Score**: [Before] → [After]

### Before/After Comparison
```
Performance Metrics Comparison:
┌─────────────────────┬─────────┬─────────┬──────────────┐
│ Metric              │ Before  │ After   │ Improvement  │
├─────────────────────┼─────────┼─────────┼──────────────┤
│ Initial Load (ms)   │ [value] │ [value] │ [%]          │
│ Time to Interactive │ [value] │ [value] │ [%]          │
│ Bundle Size (KB)    │ [value] │ [value] │ [%]          │
│ Memory Usage (MB)   │ [value] │ [value] │ [%]          │
└─────────────────────┴─────────┴─────────┴──────────────┘
```

## Code Changes Summary
- **Files Modified**: [Count]
- **Components Optimized**: [Count]
- **New Lazy Imports**: [Count]
- **Removed Dependencies**: [Count]

## Testing and Validation
- [ ] Performance tests created/updated
- [ ] Load testing performed
- [ ] Mobile performance validated
- [ ] Accessibility impact verified

## Monitoring and Alerting
- [ ] Performance monitoring setup
- [ ] Bundle size alerts configured
- [ ] Performance regression tests added

## Knowledge Transfer
- [ ] Performance best practices documented
- [ ] Team training completed
- [ ] Code review guidelines updated

## Future Optimizations
1. [Future optimization opportunity 1]
2. [Future optimization opportunity 2]
3. [Future optimization opportunity 3]

## Investigation Metrics
- **Investigation Duration**: [Hours]
- **Performance Gain**: [%]
- **Effort vs Impact Ratio**: [High/Medium/Low]