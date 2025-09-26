# CLAUDE.md - Behavioral Requirements for trinity-dashboard

## PROJECT IDENTITY
- Repository: trinity-dashboard
- Technology: JavaScript/TypeScript with React/Vite
- Architecture: Component-based React SPA with Vite bundling
- Trinity Method: v7.0 ACTIVE

## BEHAVIORAL HIERARCHY
This file establishes global behaviors. Load in order:
1. ./CLAUDE.md (this file) - Global requirements
2. ./trinity/CLAUDE.md - Trinity Method protocols
3. ./src/CLAUDE.md - Technology-specific rules

## PERFORMANCE BASELINES
All operations must meet these baselines:
```yaml
Performance_Requirements:
  User_Interaction: <100ms response
  Page_Load: <3s initial load
  API_Response: <200ms standard queries
  Build_Time: <60s full build
  Test_Suite: <5min complete run
  Memory_Usage: <500MB runtime
```

## INVESTIGATION REQUIREMENTS
MANDATORY: Before ANY implementation:
1. Investigate existing code patterns
2. Document findings in trinity/investigations/
3. Identify reusable patterns in trinity/patterns/
4. Update relevant knowledge base documents
5. Only then proceed with implementation

## QUALITY GATES
No code deployment without:
- [ ] Investigation completed and documented
- [ ] All tests passing (0 failures)
- [ ] Zero console errors in runtime
- [ ] Performance baselines met
- [ ] Security scan passed
- [ ] Code review completed

## CRISIS PROTOCOLS
Immediate activation triggers:
- Console errors detected in production
- Performance degradation >20%
- Security vulnerability discovered
- Data integrity issues
- System downtime

## COMMAND REFERENCE
```bash
# Session Commands
trinity init session              # Start new development session
trinity complete session          # Archive session with documentation

# Investigation Commands
trinity investigate [feature]     # Start investigation protocol
trinity document findings         # Save investigation results

# Crisis Commands
trinity crisis console-errors    # Execute console error protocol
trinity crisis performance       # Execute performance crisis protocol
trinity crisis security         # Execute security crisis protocol
trinity crisis data-integrity   # Execute data integrity protocol

# Quality Commands
trinity check quality           # Run all quality gates
trinity audit performance       # Check performance baselines
trinity scan security          # Run security analysis
```

## ARCHITECTURE CONTEXT
- Framework: React 18.3.1 with React Router DOM 6.24.0
- Build Tool: Vite 7.1.7 with ES modules
- Styling: Tailwind CSS 3.4.0 with PostCSS
- State Management: React Context API with hooks
- API Integration: Axios 1.6.0
- Charts: Chart.js 4.4.0 with react-chartjs-2
- Icons: Lucide React 0.544.0
- Code Quality: ESLint 9.0.0 + Prettier 3.3.0
- Deployment: GitHub Pages via gh-pages 6.3.0

## DEVELOPMENT STACK REQUIREMENTS
- Node.js environment with ES module support
- Git workflow with pre-commit hooks
- VSCode with standardized extensions
- NPM package management
- Environment-based configuration (.env.local)

## SUCCESS METRICS
Track performance against baselines:
- Bundle size optimization
- React component render performance
- API response times
- Build and deployment efficiency
- Error rate monitoring
- User experience metrics