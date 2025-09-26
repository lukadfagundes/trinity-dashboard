# trinity-dashboard Architecture

## System Overview

### Technology Stack
- **Primary Language**: JavaScript/TypeScript (ES Modules)
- **Frontend Framework**: React 18.3.1 with modern hooks-based architecture
- **Build System**: Vite 7.1.7 (modern, fast development server and bundler)
- **Package Manager**: npm (with package-lock.json for reproducible builds)
- **Styling**: Tailwind CSS 3.4.0 with custom Trinity color system
- **State Management**: React Context API with custom providers
- **Routing**: React Router DOM 6.24.0 (client-side routing)
- **HTTP Client**: Axios 1.6.0 for GitHub API communication
- **Charts**: Chart.js 4.4.0 with react-chartjs-2 5.2.0
- **Icons**: Lucide React 0.544.0
- **Code Highlighting**: Prism.js 1.30.0
- **Utilities**: Lodash 4.17.21
- **Development Tools**: ESLint 9.0.0, Prettier 3.3.0

### Application Type
Single Page Application (SPA) designed for monitoring Trinity Method DevOps projects with real-time GitHub Actions integration.

## Component Architecture

### Core Application Structure
```
src/
├── main.jsx                    # Application entry point
├── App.jsx                     # Root component with routing
├── pages/                      # Top-level page components
├── components/                 # Reusable UI components
├── contexts/                   # React Context providers
├── services/                   # Business logic and API services
├── hooks/                      # Custom React hooks
└── utils/                      # Pure utility functions
```

### Page Components
1. **Dashboard.jsx** - Main overview page showing all project health metrics
2. **ProjectDashboard.jsx** - Detailed view for individual projects
3. **RunDetails.jsx** - Specific workflow run analysis
4. **PRDashboard.jsx** - Pull request specific metrics and readiness

### Component Hierarchy

#### Layout Components
- **DashboardLayout.jsx** - Master layout wrapper with navigation and header
- **ErrorBoundary.jsx** - Error handling boundary for React components
- **LoadingSpinner.jsx** - Consistent loading state component

#### Card Components (Modular Dashboard Widgets)
- **CoverageCard.jsx** - Code coverage metrics visualization
- **HealthCard.jsx** - Overall project health indicators
- **SecurityCard.jsx** - Security vulnerability reports
- **TestResultsCard.jsx** - Test execution summary

#### Chart Components (Data Visualization)
- **CoverageTrend.jsx** - Historical coverage trends using Chart.js
- **SecurityChart.jsx** - Security metrics visualization
- **TestResults.jsx** - Test results over time
- **TrendAnalysis.jsx** - General trend analysis component

#### Analytics Components
- **BranchAnalytics.jsx** - Branch-specific performance metrics
- **BranchComparison.jsx** - Comparative analysis between branches
- **ReadinessDistribution.jsx** - Merge readiness score distribution
- **ReadinessTrend.jsx** - Historical readiness trends
- **VolatilityCorrelation.jsx** - Code volatility correlation analysis
- **VolatilityHistory.jsx** - Historical volatility tracking

#### Utility Components
- **CodeDiff.jsx** - Code difference visualization with syntax highlighting
- **FileCoverageDiff.jsx** - File-level coverage change visualization
- **GitBlame.jsx** - Git blame information display
- **PRSearch.jsx** - Pull request search functionality
- **RateLimitIndicator.jsx** - GitHub API rate limit monitoring
- **PerformanceMonitor.jsx** - Application performance tracking
- **HelpModal.jsx** - Contextual help system
- **FilterPanel.jsx** - Data filtering interface
- **ProjectSection.jsx** - Project data organization component
- **RunDetails.jsx** - Workflow run detail display
- **ErrorDisplay.jsx** - Error state presentation

## Data Flow Architecture

### Context-Based State Management

#### GitHubContext.jsx - Primary Data Provider
- **Purpose**: Centralized GitHub API data management
- **Responsibilities**:
  - Fetching repository data from GitHub Actions API
  - Caching responses with intelligent cache management
  - Rate limit monitoring and handling
  - Authentication state management
  - Automatic data refresh with visibility-based optimization

#### PreferencesContext.jsx - User Settings
- **Purpose**: User interface preferences and settings
- **Scope**: Theme preferences, dashboard customization, filter states

#### ThemeContext.jsx - UI Theme Management
- **Purpose**: Dark/light theme switching with system preference detection
- **Features**: Persistent theme storage, smooth transitions

### Service Layer Architecture

#### Core Services

**githubApi.js** - GitHub API Client
- Axios-based HTTP client with interceptors
- Automatic rate limit tracking
- Authentication management
- Comprehensive error handling with specific GitHub error codes
- Debug mode for development

**dataCollector.js** - Data Aggregation Service
- Repository data fetching orchestration
- Workflow runs collection (20 most recent completed runs)
- Artifact and job data enrichment
- Multi-repository parallel processing
- Error isolation per repository

**dataTransformer.js** - Data Processing Pipeline
- Raw GitHub data normalization
- Health score calculation algorithms
- Metrics aggregation and computation
- Data structure standardization for UI consumption

**cacheManager.js** - Intelligent Caching System
- Browser localStorage-based cache
- TTL (Time To Live) management
- Rate limit aware caching
- Cache statistics and health monitoring
- Automatic cache invalidation

#### Specialized Services

**artifactParser.js** - CI/CD Artifact Processing
- ZIP file handling for GitHub Action artifacts
- Test result parsing (JUnit, Jest formats)
- Coverage report processing
- Build artifact analysis

**complexityAnalysis.js** - Code Quality Analysis
- Cyclomatic complexity calculation
- Code quality metrics
- Technical debt assessment
- Maintainability scoring

**readinessScoring.js** - Merge Readiness Algorithm
- Multi-factor readiness calculation
- Test coverage weighting
- Security vulnerability assessment
- Build stability scoring
- Historical performance consideration

**velocityTracking.js** - Development Velocity Metrics
- Commit frequency analysis
- Pull request cycle time
- Issue resolution tracking
- Bug resolution rate calculation
- Team productivity metrics

**historyService.js** - Historical Data Management
- Time-series data storage
- Trend calculation
- Historical comparison utilities
- Data retention management

**githubLiveService.js** - Real-time Integration
- WebSocket connections for live updates
- Event-driven data refresh
- Live status monitoring

**websocketService.js** - WebSocket Communication
- Real-time connection management
- Event handling and dispatch
- Connection state management
- Automatic reconnection logic

#### Utility Services

**dataFetcher.js** - Generic Data Fetching Utilities
- Retry logic with exponential backoff
- Concurrent request management
- Response caching
- Error normalization

**exportData.js** - Data Export Functionality
- CSV/JSON export capabilities
- Report generation
- Data serialization

### Data Flow Patterns

1. **Initialization Flow**:
   ```
   App Mount → GitHubContext → Authentication Check → Data Fetch → Cache Check → API Calls → Data Transform → UI Update
   ```

2. **Refresh Flow**:
   ```
   User Action → Refresh Trigger → Rate Limit Check → API Fetch → Cache Update → UI Refresh
   ```

3. **Error Handling Flow**:
   ```
   API Error → Error Categorization → Fallback Cache → User Notification → Retry Logic
   ```

## Integration Architecture

### GitHub API Integration
- **Primary API**: GitHub REST API v3
- **Authentication**: Bearer token (Personal Access Token or GitHub App)
- **Endpoints Used**:
  - `/repos/{owner}/{repo}` - Repository metadata
  - `/repos/{owner}/{repo}/actions/runs` - Workflow runs
  - `/repos/{owner}/{repo}/actions/runs/{run_id}/artifacts` - Build artifacts
  - `/repos/{owner}/{repo}/actions/runs/{run_id}/jobs` - Job details
  - `/repos/{owner}/{repo}/pulls` - Pull request data
  - `/repos/{owner}/{repo}/branches` - Branch information
  - `/user` - Authentication verification
  - `/rate_limit` - API rate limit status

### External Service Integration
- **GitHub Actions**: Primary CI/CD data source
- **GitHub Pages**: Dashboard deployment target
- **Browser APIs**: LocalStorage for caching, Visibility API for optimization

### Environment Configuration
- **VITE_GITHUB_TOKEN**: GitHub Personal Access Token
- **VITE_GITHUB_OWNER**: Repository owner/organization
- **VITE_GITHUB_REPOS**: Comma-separated repository list
- **VITE_API_REFRESH_INTERVAL**: Data refresh frequency (default: 60000ms)
- **VITE_DEBUG_MODE**: Enable debug logging

## State Management

### Context Architecture
- **Hierarchical Provider Structure**: App → GitHubProvider → ThemeProvider → PreferencesProvider
- **Provider Isolation**: Each context manages specific domain concerns
- **Hook-Based Access**: Custom hooks (useGitHub, useTheme, usePreferences) for type-safe context consumption

### Caching Strategy
- **Multi-Level Caching**: Memory → LocalStorage → API
- **Cache Key Strategy**: Composite keys based on repository, time, and query parameters
- **TTL Management**: Configurable expiration with rate-limit awareness
- **Cache Invalidation**: Manual and automatic invalidation triggers

### Performance Optimizations
- **Memoization**: useMemo for expensive calculations, useCallback for function stability
- **Lazy Loading**: Route-based code splitting
- **Virtual Scrolling**: For large dataset rendering
- **Request Deduplication**: Prevent duplicate API calls
- **Visibility-Based Updates**: Pause updates when tab is hidden

## Performance Architecture

### Build Performance
- **Vite Optimizations**: Lightning-fast development server with HMR
- **Tree Shaking**: Dead code elimination in production builds
- **Asset Optimization**: Automatic image optimization and compression
- **Bundle Splitting**: Intelligent code splitting for optimal loading

### Runtime Performance
- **Component Memoization**: React.memo for expensive components
- **State Optimization**: Minimal re-renders through careful state design
- **API Efficiency**: Request batching and intelligent caching
- **Memory Management**: Proper cleanup of intervals and event listeners

### Loading Performance
- **Progressive Loading**: Critical path CSS, lazy loading for non-critical resources
- **Prefetching**: Intelligent resource prefetching based on user behavior
- **CDN Strategy**: Static asset delivery optimization
- **Service Worker**: Offline capability and background sync (future enhancement)

## Security Architecture

### Authentication & Authorization
- **Token-Based Authentication**: GitHub Personal Access Token
- **Scope Management**: Minimum required permissions (repo, actions:read)
- **Token Storage**: Secure environment variable storage, no client-side token exposure
- **Session Management**: Automatic token validation and renewal

### Data Protection
- **XSS Prevention**: Content Security Policy headers, input sanitization
- **CSRF Protection**: Same-origin policy enforcement
- **API Security**: Rate limiting, request validation, error message sanitization
- **Secure Transmission**: HTTPS enforcement, secure cookie attributes

### Client-Side Security
- **Dependency Scanning**: Automated npm audit in CI/CD pipeline
- **Content Validation**: Input sanitization for user-generated content
- **Error Handling**: Secure error messages without information disclosure
- **localStorage Security**: Sanitized data storage without sensitive information

## Deployment Architecture

### Build Process
- **Development**: Vite dev server with HMR at http://localhost:5173
- **Production**: Static asset generation in `dist/` directory
- **Base Path**: Configured for GitHub Pages deployment at `/trinity-dashboard/`

### GitHub Pages Deployment
- **Trigger**: Automatic deployment on `main` branch pushes
- **Build Pipeline**: Node.js 18 → npm ci → npm run build → artifact upload → pages deployment
- **Asset Optimization**: Minification, compression, cache headers
- **Routing**: Client-side routing with fallback for direct URL access

### CI/CD Pipeline Architecture
- **Multi-Stage Pipeline**:
  1. **Node.js CI**: Linting, testing, coverage, security audit
  2. **Python CI**: Python testing (conditional)
  3. **Dashboard Data Generation**: Metrics calculation and artifact creation
  4. **Deployment**: Static site deployment to GitHub Pages

### Artifact Management
- **Coverage Reports**: HTML and JSON coverage reports
- **Dashboard Data**: JSON metrics for historical tracking
- **Security Reports**: npm audit and ESLint reports
- **Build Artifacts**: Optimized production assets

## Scalability Considerations

### Horizontal Scalability
- **Multi-Repository Support**: Designed for monitoring multiple repositories simultaneously
- **Stateless Architecture**: No server-side state, enables easy replication
- **CDN Integration**: Static asset delivery scales automatically
- **API Rate Limiting**: Intelligent rate limit management for high-volume usage

### Vertical Scalability
- **Memory Efficiency**: Efficient data structures and memory management
- **Processing Optimization**: Lazy loading and incremental processing
- **Cache Scaling**: Intelligent cache eviction and size management
- **Bundle Size**: Optimized bundle size through tree shaking and code splitting

### Data Scalability
- **Efficient Data Structures**: Normalized data for optimal access patterns
- **Pagination Support**: Ready for paginated API responses
- **Historical Data Management**: Configurable data retention policies
- **Bulk Operations**: Batch processing for large datasets

## Technical Constraints

### GitHub API Limitations
- **Rate Limits**: 5,000 requests/hour for authenticated users, 60 for unauthenticated
- **Secondary Rate Limits**: 100 concurrent requests, burst protection
- **Data Retention**: Limited historical data availability through API
- **Artifact Access**: Artifacts expire after 90 days (default GitHub retention)

### Browser Constraints
- **localStorage Limits**: ~5-10MB storage limit per origin
- **Memory Constraints**: Client-side processing limitations for large datasets
- **Network Latency**: Geographic distance to GitHub API servers
- **CORS Restrictions**: Browser security model limitations

### Technical Debt Areas
- **Test Coverage**: Currently minimal automated testing
- **TypeScript Migration**: Gradual migration from JavaScript needed
- **Error Boundaries**: Limited error boundary implementation
- **Accessibility**: WCAG compliance gaps
- **Performance Monitoring**: No runtime performance tracking
- **Offline Support**: No service worker or offline capabilities

### Dependency Constraints
- **React Version**: Locked to React 18 ecosystem
- **Vite Version**: Modern build tool requiring Node.js 14+
- **Browser Support**: Modern browsers only (ES2018+ features)
- **GitHub API**: Dependent on GitHub REST API v3 stability

### Security Constraints
- **Token Management**: Manual token rotation and management
- **Client-Side Security**: Inherent limitations of SPA security model
- **Data Sensitivity**: GitHub data may contain sensitive information
- **Audit Trail**: Limited audit logging for security events

## Future Architecture Considerations

### Planned Enhancements
- **WebSocket Integration**: Real-time updates for live monitoring
- **Service Worker**: Offline support and background synchronization
- **TypeScript Migration**: Full type safety implementation
- **Testing Infrastructure**: Comprehensive unit and integration testing
- **Performance Monitoring**: Real-time performance metrics
- **Multi-Tenant Support**: Organization-level dashboard management

### Scalability Roadmap
- **Backend API**: Potential server-side API for enhanced functionality
- **Database Integration**: Historical data persistence beyond localStorage
- **Microservice Architecture**: Service-oriented decomposition for enterprise scale
- **Advanced Analytics**: Machine learning-based insights and predictions

### Security Roadmap
- **OAuth Integration**: GitHub OAuth flow for secure authentication
- **Role-Based Access**: Granular permission management
- **Audit Logging**: Comprehensive security event tracking
- **Compliance**: SOC 2, GDPR compliance preparation

This architecture document serves as the authoritative reference for understanding the trinity-dashboard system design, implementation patterns, and technical decisions. It should be updated as the system evolves and new architectural decisions are made.