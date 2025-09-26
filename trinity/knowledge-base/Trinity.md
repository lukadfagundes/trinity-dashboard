# Trinity Method Implementation for trinity-dashboard

## Project-Specific Protocols

### Investigation Procedures for React/Vite Projects

#### Component Investigation Framework
When investigating issues or implementing features in the trinity-dashboard React/Vite application:

1. **Context Mapping**
   - Identify which React Context(s) are involved (GitHubContext, ThemeContext, PreferencesContext)
   - Trace data flow from context providers to consuming components
   - Understand component hierarchy and prop drilling patterns
   - Map service dependencies and their interactions

2. **State Investigation Methodology**
   - Use React Developer Tools to inspect component state and context values
   - Trace state changes through useEffect dependencies
   - Identify unnecessary re-renders through React Profiler
   - Examine hook dependencies and their impact on component lifecycle

3. **API Integration Investigation**
   - Monitor GitHub API calls through browser Network tab
   - Check rate limit status and caching behavior
   - Verify authentication state and token validity
   - Analyze request/response patterns and error handling

4. **Build System Investigation (Vite-Specific)**
   - Examine Vite configuration in `vite.config.js`
   - Check module resolution and import paths
   - Investigate HMR (Hot Module Replacement) issues
   - Analyze bundle size and code splitting effectiveness

#### Service Layer Investigation Patterns
For service-related issues:

1. **Data Flow Tracing**
   - Follow data from `dataCollector.js` → `dataTransformer.js` → Context → Components
   - Identify transformation errors in the data pipeline
   - Check caching behavior in `cacheManager.js`
   - Verify error handling and fallback mechanisms

2. **GitHub API Integration**
   - Test API endpoints directly using tools like curl or Postman
   - Verify token permissions and scopes
   - Check for API deprecations or breaking changes
   - Monitor rate limit consumption patterns

3. **Performance Investigation**
   - Use browser Performance tab to identify bottlenecks
   - Analyze memory usage and potential memory leaks
   - Check for unnecessary API calls or redundant processing
   - Examine caching effectiveness and hit rates

### Debugging Standards

#### Development Environment Setup
- **Node.js Version**: 18.x (specified in GitHub workflows)
- **Package Manager**: npm (use `npm ci` for reproducible installs)
- **Development Server**: Vite dev server on `http://localhost:5173`
- **Debug Mode**: Enable via `VITE_DEBUG_MODE=true` in `.env.local`

#### Debugging Checklist
1. **Environment Verification**
   - [ ] All required environment variables set in `.env.local`
   - [ ] GitHub token has necessary permissions (repo, actions:read)
   - [ ] Dependencies installed with `npm ci`
   - [ ] Development server running without errors

2. **React-Specific Debugging**
   - [ ] React Developer Tools installed and active
   - [ ] React StrictMode enabled (development only)
   - [ ] Component keys properly assigned for list rendering
   - [ ] useEffect dependencies correctly specified
   - [ ] Context providers wrapping consuming components

3. **API Debugging**
   - [ ] GitHub API rate limits not exceeded
   - [ ] CORS issues resolved (production deployment)
   - [ ] Network requests succeed in browser DevTools
   - [ ] Response data structure matches expected format

4. **Build Debugging**
   - [ ] Production build succeeds with `npm run build`
   - [ ] No TypeScript errors (when applicable)
   - [ ] ESLint passes without errors
   - [ ] Bundle size within reasonable limits

#### Error Categorization and Response
- **React Errors**: Component boundary errors, hook rule violations, render errors
- **API Errors**: Network failures, authentication errors, rate limiting, data format issues
- **Build Errors**: Module resolution, dependency conflicts, configuration issues
- **Performance Errors**: Memory leaks, infinite re-renders, expensive calculations

### Performance Standards

#### Baseline Performance Targets
- **Initial Load Time**: < 3 seconds on 3G connection
- **Time to Interactive**: < 5 seconds
- **Core Web Vitals**:
  - Largest Contentful Paint (LCP): < 2.5 seconds
  - First Input Delay (FID): < 100 milliseconds
  - Cumulative Layout Shift (CLS): < 0.1

#### React Performance Standards
- **Component Re-renders**: Minimize unnecessary re-renders through memoization
- **Bundle Size**: Main bundle < 500KB, individual chunks < 250KB
- **Memory Usage**: No memory leaks, efficient garbage collection
- **API Efficiency**: Batch requests, implement caching, respect rate limits

#### Monitoring and Measurement
- Use React Profiler for component performance analysis
- Implement performance markers for critical user journeys
- Monitor bundle size with Vite build analysis
- Track API usage and rate limit consumption

#### Performance Optimization Checklist
- [ ] Components wrapped with `React.memo` where appropriate
- [ ] Expensive calculations memoized with `useMemo`
- [ ] Event handlers stabilized with `useCallback`
- [ ] Large lists virtualized or paginated
- [ ] Images optimized and lazy loaded
- [ ] Code splitting implemented for routes
- [ ] Service worker for caching (future enhancement)

### Quality Gates

#### Pre-Implementation Quality Gates
1. **Requirement Validation**
   - [ ] Feature aligns with Trinity Method DevOps monitoring goals
   - [ ] GitHub API endpoints identified and permissions verified
   - [ ] Component integration points mapped
   - [ ] Performance impact assessed

2. **Design Review**
   - [ ] Component structure follows established patterns
   - [ ] Data flow through contexts documented
   - [ ] Error handling strategy defined
   - [ ] Accessibility requirements considered

#### Implementation Quality Gates
1. **Code Quality Standards**
   - [ ] ESLint rules pass without warnings
   - [ ] Prettier formatting applied consistently
   - [ ] Component props validated (PropTypes or TypeScript)
   - [ ] Error boundaries implemented where necessary

2. **Testing Standards**
   - [ ] Unit tests for utility functions and services
   - [ ] Component testing for critical UI elements
   - [ ] Integration tests for API interactions
   - [ ] End-to-end tests for critical user paths

3. **API Integration Standards**
   - [ ] Rate limiting respected and handled gracefully
   - [ ] Error responses properly categorized and handled
   - [ ] Response data validated before processing
   - [ ] Fallback mechanisms implemented for service failures

#### Pre-Deployment Quality Gates
1. **Build Verification**
   - [ ] Production build completes without errors
   - [ ] Bundle size analysis shows no significant increases
   - [ ] All environment variables properly configured
   - [ ] GitHub Pages deployment path correctly set

2. **Functionality Verification**
   - [ ] All critical user journeys tested in production build
   - [ ] Cross-browser compatibility verified
   - [ ] Mobile responsiveness confirmed
   - [ ] Performance metrics within acceptable ranges

### Crisis Management Procedures

#### React/Vite Specific Crisis Response

**Crisis Classification**:
- **P0 (Critical)**: Dashboard completely non-functional, build failures blocking deployment
- **P1 (High)**: Major feature broken, significant performance degradation, security vulnerability
- **P2 (Medium)**: Minor feature issues, non-critical performance problems
- **P3 (Low)**: Cosmetic issues, enhancement requests

#### P0 Crisis Response Protocol
1. **Immediate Assessment (0-5 minutes)**
   - Check GitHub Pages deployment status
   - Verify main branch build pipeline success
   - Test basic functionality with fresh browser session
   - Check GitHub API status and rate limits

2. **Emergency Mitigation (5-30 minutes)**
   - Rollback to last known good deployment if necessary
   - Disable problematic features through feature flags
   - Implement temporary workarounds
   - Communicate status to stakeholders

3. **Root Cause Investigation (30 minutes - 2 hours)**
   - Analyze browser console errors and network failures
   - Review recent commits and changes
   - Check GitHub API changes or service disruptions
   - Examine deployment pipeline logs

4. **Permanent Resolution (2-24 hours)**
   - Implement proper fix addressing root cause
   - Add monitoring/alerting to prevent recurrence
   - Update documentation and runbooks
   - Conduct post-mortem analysis

#### Technology-Specific Crisis Scenarios

**React State Corruption**:
- Clear browser localStorage and sessionStorage
- Reset all Context providers to initial state
- Check for circular dependencies in useEffect hooks
- Verify component cleanup in useEffect return functions

**GitHub API Issues**:
- Switch to sample data mode temporarily
- Check token permissions and expiration
- Verify API endpoint availability
- Implement graceful degradation for API failures

**Vite Build Failures**:
- Clear node_modules and reinstall dependencies
- Check for conflicting dependency versions
- Verify Vite configuration syntax
- Test with fresh environment setup

**Deployment Issues**:
- Verify GitHub Pages settings and permissions
- Check base path configuration in Vite config
- Confirm workflow secrets and environment variables
- Test deployment with minimal changes

### Project-Specific Trinity Adaptations

#### React Ecosystem Integration
- **Component-Driven Investigation**: Focus on component lifecycle and data flow
- **Context-Aware Debugging**: Understand provider hierarchy and context consumption
- **Hook-Based Analysis**: Trace custom hooks and their dependencies
- **Virtual DOM Considerations**: Debug rendering issues specific to React

#### DevOps Monitoring Focus
- **CI/CD Pipeline Awareness**: Understand GitHub Actions workflow integration
- **Metrics-Driven Development**: Use dashboard data to guide development decisions
- **Quality Gate Integration**: Align development practices with merge readiness scoring
- **Continuous Monitoring**: Implement feedback loops for system health

#### GitHub API Specialization
- **Rate Limit Consciousness**: Design all API interactions with rate limits in mind
- **Authentication Management**: Secure token handling and automatic renewal
- **Data Transformation Expertise**: Understand GitHub API response formats
- **Artifact Processing**: Handle CI/CD artifacts and build outputs

### Knowledge Retention Framework

#### Documentation Standards
1. **Code Documentation**
   - JSDoc comments for all public functions and components
   - Inline comments for complex logic and algorithms
   - README updates for significant architectural changes
   - API documentation for service layer functions

2. **Decision Records**
   - Architectural Decision Records (ADRs) for major technical decisions
   - Design rationale documentation
   - Performance trade-off explanations
   - Third-party integration justifications

3. **Investigation Records**
   - Problem analysis documentation
   - Solution evaluation processes
   - Failed attempt documentation
   - Lessons learned summaries

#### Pattern Library Integration
- **Component Patterns**: Document reusable component implementations
- **Service Patterns**: Standard API integration approaches
- **State Management Patterns**: Context and hook usage patterns
- **Error Handling Patterns**: Consistent error boundary implementations

### Session Workflow

#### Development Session Structure
1. **Session Initialization (5-10 minutes)**
   - Review project status and recent changes
   - Check GitHub API rate limit status
   - Update dependencies if needed
   - Review outstanding issues and priorities

2. **Development Phase (Main work period)**
   - Follow TDD approach where applicable
   - Implement features with Trinity quality gates
   - Regular commits with descriptive messages
   - Continuous testing and validation

3. **Session Conclusion (10-15 minutes)**
   - Run full test suite and linting
   - Update documentation for changes made
   - Commit final changes with proper messages
   - Update project status and next steps

#### Collaboration Workflow
- **Code Reviews**: Focus on Trinity Method compliance
- **Pair Programming**: Share context and knowledge effectively
- **Knowledge Transfer**: Document decisions and rationale
- **Mentoring**: Guide team members on Trinity principles

### Success Metrics

#### Trinity Method Success Indicators
1. **Investigation Efficiency**
   - Time to identify root cause of issues
   - Accuracy of initial problem assessment
   - Reduction in investigation rework

2. **Quality Improvement**
   - Reduction in production incidents
   - Improvement in code review feedback quality
   - Increased test coverage and effectiveness

3. **Knowledge Retention**
   - Team onboarding time reduction
   - Consistency in problem-solving approaches
   - Reduction in duplicate investigations

4. **Development Velocity**
   - Faster feature development cycles
   - Reduced debugging time
   - Improved merge readiness scores

#### Measurement Framework
- Track metrics through dashboard functionality
- Use GitHub API data for development velocity analysis
- Monitor code quality through automated tools
- Collect team feedback on Trinity Method effectiveness

### Continuous Improvement

#### Method Evolution Process
1. **Regular Retrospectives**: Weekly/monthly review of Trinity Method effectiveness
2. **Metric Analysis**: Data-driven assessment of improvement areas
3. **Team Feedback**: Regular collection of practitioner experiences
4. **External Learning**: Incorporate industry best practices and new tools

#### Adaptation Triggers
- Major technology updates (React, Vite, GitHub API changes)
- Team composition changes
- Project scope evolution
- Performance degradation patterns
- Quality metric changes

#### Version Control for Trinity Method
- Document method version changes
- Maintain backward compatibility where possible
- Communicate changes effectively to team
- Provide migration guides for significant updates

This Trinity Method implementation serves as the living guide for how development practices are applied specifically to the trinity-dashboard project, ensuring consistent, high-quality development that aligns with the project's DevOps monitoring mission.