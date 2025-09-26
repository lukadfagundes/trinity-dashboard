/**
 * Historical Data Service
 * Manages fetching and processing historical CI/CD data
 */

export class HistoryService {
  static async fetchHistory(repository, branch = 'all') {
    try {
      const response = await fetch('/data/dashboard-history.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`);
      }

      const history = await response.json();

      // Filter by repository and branch
      return history
        .filter(entry =>
          entry.repository === repository &&
          (branch === 'all' || entry.branch === branch)
        )
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Error fetching history:', error);
      return [];
    }
  }

  static calculateTrends(history) {
    if (!history || history.length === 0) {
      return {
        coverage: 'neutral',
        tests: 'neutral',
        security: 'neutral',
        health: 'neutral'
      };
    }

    const last30Days = history.slice(0, 30);
    const prev30Days = history.slice(30, 60);

    return {
      coverage: this.getTrendDirection(last30Days, prev30Days, 'coverage.overall'),
      tests: this.getTrendDirection(last30Days, prev30Days, 'tests.passed'),
      security: this.getTrendDirection(last30Days, prev30Days, 'security.score'),
      health: this.getTrendDirection(last30Days, prev30Days, 'health.score')
    };
  }

  static getTrendDirection(recent, previous, path, inverse = false) {
    if (!recent.length || !previous.length) return 'neutral';

    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((o, p) => o && o[p], obj);
    };

    const recentAvg = recent.reduce((sum, entry) => {
      const value = getNestedValue(entry, path);
      return sum + (value || 0);
    }, 0) / recent.length;

    const previousAvg = previous.reduce((sum, entry) => {
      const value = getNestedValue(entry, path);
      return sum + (value || 0);
    }, 0) / previous.length;

    const diff = recentAvg - previousAvg;
    const threshold = Math.abs(previousAvg) * 0.05; // 5% change threshold

    if (Math.abs(diff) < threshold) return 'neutral';

    if (inverse) {
      // For metrics where lower is better (e.g., vulnerabilities)
      return diff < 0 ? 'improving' : 'declining';
    } else {
      // For metrics where higher is better (e.g., coverage, tests)
      return diff > 0 ? 'improving' : 'declining';
    }
  }

  static getMetricHistory(history, metricPath, limit = 30) {
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((o, p) => o && o[p], obj);
    };

    return history
      .slice(0, limit)
      .map(entry => ({
        timestamp: entry.timestamp,
        value: getNestedValue(entry, metricPath) || 0,
        branch: entry.branch,
        commit: entry.commit
      }))
      .reverse(); // Chronological order for charts
  }

  static getBranchComparison(history) {
    const branches = {};

    history.forEach(entry => {
      if (!branches[entry.branch]) {
        branches[entry.branch] = [];
      }
      branches[entry.branch].push(entry);
    });

    const comparison = {};
    Object.keys(branches).forEach(branch => {
      const branchHistory = branches[branch];
      const latest = branchHistory[0] || {};

      comparison[branch] = {
        coverage: latest.coverage?.overall || 0,
        testPassRate: latest.tests && latest.tests.total > 0
          ? (latest.tests.passed / latest.tests.total) * 100
          : 0,
        securityScore: latest.security?.score || 0,
        healthScore: latest.health?.score || 0,
        lastUpdate: latest.timestamp,
        totalRuns: branchHistory.length
      };
    });

    return comparison;
  }

  static getTimeSeriesData(history, metrics = ['coverage', 'tests', 'security']) {
    const series = {};

    metrics.forEach(metric => {
      let path, label;

      switch (metric) {
        case 'coverage':
          path = 'coverage.overall';
          label = 'Coverage %';
          break;
        case 'tests':
          path = 'tests.passed';
          label = 'Tests Passed';
          break;
        case 'security':
          path = 'security.score';
          label = 'Security Score';
          break;
        case 'health':
          path = 'health.score';
          label = 'Health Score';
          break;
        default:
          path = metric;
          label = metric;
      }

      series[metric] = {
        label,
        data: this.getMetricHistory(history, path)
      };
    });

    return series;
  }

  static async fetchRunDetails(runId) {
    try {
      const response = await fetch(`/data/runs/${runId}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch run details: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching run details:', error);

      // Try to fetch from history
      const history = await this.fetchHistory('all', 'all');
      return history.find(entry => entry.id === runId || entry.runId === runId) || null;
    }
  }

  static getStatistics(history, branch = 'all') {
    const filteredHistory = branch === 'all'
      ? history
      : history.filter(h => h.branch === branch);

    if (filteredHistory.length === 0) {
      return {
        avgCoverage: 0,
        avgTestPassRate: 0,
        avgSecurityScore: 0,
        avgHealthScore: 0,
        totalRuns: 0,
        successRate: 0
      };
    }

    const stats = filteredHistory.reduce((acc, entry) => {
      acc.coverage += entry.coverage?.overall || 0;
      acc.testsPassed += entry.tests?.passed || 0;
      acc.testsTotal += entry.tests?.total || 0;
      acc.security += entry.security?.score || 0;
      acc.health += entry.health?.score || 0;
      acc.successful += entry.status === 'success' ? 1 : 0;
      return acc;
    }, {
      coverage: 0,
      testsPassed: 0,
      testsTotal: 0,
      security: 0,
      health: 0,
      successful: 0
    });

    const count = filteredHistory.length;

    return {
      avgCoverage: stats.coverage / count,
      avgTestPassRate: stats.testsTotal > 0
        ? (stats.testsPassed / stats.testsTotal) * 100
        : 0,
      avgSecurityScore: stats.security / count,
      avgHealthScore: stats.health / count,
      totalRuns: count,
      successRate: (stats.successful / count) * 100
    };
  }
}