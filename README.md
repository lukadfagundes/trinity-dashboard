# Trinity Dashboard

**Real-time DevOps monitoring and analytics dashboard for Trinity Method projects**

![Build Status](https://github.com/trinity-method/trinity-dashboard/actions/workflows/ci.yml/badge.svg)
![CodeQL](https://github.com/trinity-method/trinity-dashboard/actions/workflows/codeql.yml/badge.svg)
![Coverage](https://img.shields.io/badge/Coverage-0%25-red)
![Security](https://img.shields.io/badge/Security-Scanning-blue)
![License](https://img.shields.io/badge/License-MIT-green)

![Trinity Dashboard](https://img.shields.io/badge/Status-Active-green) ![React](https://img.shields.io/badge/React-18.3-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-teal) ![Chart.js](https://img.shields.io/badge/Chart.js-4.4-orange)

## Overview

Trinity Dashboard is a comprehensive DevOps analytics platform that provides real-time monitoring, test results, coverage metrics, and security vulnerability tracking for all Trinity Method projects. Built with React, Tailwind CSS, and Chart.js, it offers a modern, responsive interface for project health visualization.

## Features

### Core Functionality
- 📊 **Project Health Monitoring** - Real-time status indicators with color-coded health metrics
- 🧪 **Test Results Tracking** - Pass/fail rates with per-language breakdown
- 📈 **Coverage Analytics** - Historical trending with line/branch/function coverage
- 🔒 **Security Scanning** - Vulnerability tracking by severity level
- 📉 **Historical Data** - Time-series analysis with drill-down capabilities
- 🎯 **Multi-Project Support** - Aggregate views across Trinity ecosystem

### Technical Highlights
- ⚡ **Fast Performance** - Optimized React build < 500KB
- 📱 **Responsive Design** - Mobile-first with desktop optimization
- 🌙 **Dark Theme** - Professional dark mode interface
- 🔄 **Auto-refresh** - Real-time data updates every 30 seconds
- 📦 **Static Hosting** - GitHub Pages deployment ready

## Installation

### Prerequisites
- Node.js >= 16.x
- npm or yarn package manager
- Git

### Local Development Setup

```bash
# Clone the repository (when available)
git clone https://github.com/trinity-method/trinity-dashboard.git
cd trinity-dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
trinity-dashboard/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Cards/           # Health, Test, Coverage, Security cards
│   │   ├── Charts/          # Chart.js visualizations
│   │   └── Layout/          # Dashboard layout wrapper
│   ├── pages/               # Route page components
│   │   ├── Dashboard.jsx    # Main dashboard view
│   │   ├── ProjectDashboard.jsx
│   │   └── RunDetails.jsx
│   ├── utils/               # Data fetching utilities
│   ├── App.jsx              # Main app with routing
│   └── index.css            # Tailwind styles
├── public/
│   └── data/                # Sample JSON data
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
└── package.json
```

## Technology Stack

### Frontend
- **React 18.3** - Component-based UI framework
- **Vite 5.4** - Fast build tooling and HMR
- **React Router 6** - Client-side routing

### Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Custom Trinity Theme** - Brand colors and styling

### Data Visualization
- **Chart.js 4.4** - Canvas-based charts
- **react-chartjs-2** - React wrapper for Chart.js

### Deployment
- **GitHub Pages** - Static site hosting
- **GitHub Actions** - Automated CI/CD pipeline

## Configuration

### Environment Variables
```javascript
// vite.config.js
export default {
  base: '/trinity-dashboard/',  // GitHub Pages base path
  build: {
    outDir: 'dist'              // Build output directory
  }
}
```

### Tailwind Theme
```javascript
// tailwind.config.js
colors: {
  'trinity-blue': '#1e40af',
  'trinity-green': '#10b981',
  'trinity-red': '#ef4444',
  'trinity-yellow': '#f59e0b'
}
```

## Components

### Health Card
Displays overall project health with coverage, test, and security metrics.

### Test Results Card
Shows test execution statistics with pass/fail breakdown by language.

### Coverage Card
Visualizes code coverage percentages with historical mini-chart.

### Security Card
Tracks vulnerabilities by severity level with scan status.

### Charts
- **Coverage Trend** - Line chart showing coverage over time
- **Test Results** - Stacked bar chart of pass/fail tests
- **Security Distribution** - Doughnut chart of vulnerability types

## API Integration (Phase 2)

The dashboard currently uses static JSON data. Phase 2 will integrate:
- GitHub API for live repository data
- GitHub Actions artifacts consumption
- Real-time webhook notifications
- Cross-repository aggregation

## Deployment

### GitHub Pages

1. The dashboard automatically deploys to GitHub Pages on push to main branch
2. Accessible at: `https://[username].github.io/trinity-dashboard/`
3. Workflow defined in `.github/workflows/deploy-dashboard.yml`

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to GitHub Pages (requires gh-pages package)
npm install -D gh-pages
npx gh-pages -d dist
```

## Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: > 90
- **Bundle Size**: < 500KB

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Development Guidelines

### Code Style
- Use functional React components with hooks
- Implement proper error boundaries
- Follow Tailwind utility-first patterns
- Maintain component modularity

### Git Workflow
- Feature branches from `main`
- PR reviews required
- Automated testing on PR
- Squash merge to main

## Roadmap

### Phase 1 (Current)
- ✅ Core dashboard components
- ✅ Static data visualization
- ✅ GitHub Pages deployment
- ✅ Responsive design

### Phase 2 (Upcoming)
- [ ] Live GitHub API integration
- [ ] Real-time data updates
- [ ] Multi-project aggregation
- [ ] Advanced filtering

### Phase 3 (Future)
- [ ] PR-specific dashboards
- [ ] Merge readiness scoring
- [ ] Historical analytics
- [ ] Custom alerting

## Contributing

This project is part of the Trinity Method ecosystem. For contribution guidelines, please refer to the Trinity Method documentation.

## License

Trinity Method Internal Project - See Trinity Method documentation for details.

## Support

For issues or questions:
- Create an issue in the repository
- Contact Trinity CTO for technical decisions
- Refer to Trinity DevOps Implementation Roadmap

---

**Trinity Dashboard v1.0.0** - Powered by React + Tailwind + Chart.js

*Part of the Trinity Method DevOps Ecosystem*