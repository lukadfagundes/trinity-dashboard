/**
 * Velocity Tracking Service
 * Tracks development velocity metrics and trends
 */

export class VelocityTrackingService {
  constructor() {
    this.sprintDuration = 14; // Default sprint duration in days
  }

  /**
   * Calculate velocity metrics from historical data
   */
  calculateVelocity(history, timeframe = 30) {
    const now = new Date();
    const cutoff = new Date(now.getTime() - timeframe * 24 * 60 * 60 * 1000);

    // Filter data within timeframe
    const relevantData = history.filter(entry =>
      new Date(entry.timestamp) > cutoff
    );

    // Group by day
    const dailyMetrics = this.groupByDay(relevantData);

    // Calculate velocity metrics
    return {
      commits: this.calculateCommitVelocity(dailyMetrics),
      deployments: this.calculateDeploymentVelocity(relevantData),
      pullRequests: this.calculatePRVelocity(relevantData),
      coverage: this.calculateCoverageVelocity(dailyMetrics),
      issues: this.calculateIssueVelocity(relevantData),
      sprints: this.calculateSprintVelocity(relevantData)
    };
  }

  groupByDay(data) {
    const grouped = {};

    data.forEach(entry => {
      const date = new Date(entry.timestamp).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(entry);
    });

    return grouped;
  }

  /**
   * Calculate commit velocity
   */
  calculateCommitVelocity(dailyMetrics) {
    const days = Object.keys(dailyMetrics);
    const commitsPerDay = days.map(day => dailyMetrics[day].length);

    return {
      daily: {
        average: this.average(commitsPerDay),
        median: this.median(commitsPerDay),
        max: Math.max(...commitsPerDay),
        min: Math.min(...commitsPerDay),
        trend: this.calculateTrend(commitsPerDay)
      },
      weekly: {
        average: this.average(commitsPerDay) * 7,
        trend: this.calculateWeeklyTrend(dailyMetrics)
      },
      distribution: this.calculateDistribution(commitsPerDay)
    };
  }

  /**
   * Calculate deployment velocity
   */
  calculateDeploymentVelocity(data) {
    const deployments = data.filter(entry =>
      entry.status === 'success' && entry.environment === 'production'
    );

    const deploymentDates = deployments.map(d => new Date(d.timestamp));
    const intervals = [];

    for (let i = 1; i < deploymentDates.length; i++) {
      const interval = deploymentDates[i] - deploymentDates[i - 1];
      intervals.push(interval / (1000 * 60 * 60 * 24)); // Convert to days
    }

    return {
      frequency: {
        daily: deployments.length / 30,
        weekly: deployments.length / 4.3,
        monthly: deployments.length
      },
      leadTime: {
        average: intervals.length > 0 ? this.average(intervals) : 0,
        median: intervals.length > 0 ? this.median(intervals) : 0,
        min: intervals.length > 0 ? Math.min(...intervals) : 0,
        max: intervals.length > 0 ? Math.max(...intervals) : 0
      },
      mttr: this.calculateMTTR(data), // Mean Time To Recovery
      changeFailureRate: this.calculateChangeFailureRate(data)
    };
  }

  /**
   * Calculate Pull Request velocity
   */
  calculatePRVelocity(data) {
    const prs = data.filter(entry => entry.pullRequest);

    const prMetrics = prs.map(pr => ({
      created: new Date(pr.pullRequest.created_at),
      merged: pr.pullRequest.merged_at ? new Date(pr.pullRequest.merged_at) : null,
      timeToMerge: pr.pullRequest.merged_at
        ? (new Date(pr.pullRequest.merged_at) - new Date(pr.pullRequest.created_at)) / (1000 * 60 * 60)
        : null,
      additions: pr.pullRequest.additions || 0,
      deletions: pr.pullRequest.deletions || 0,
      reviewComments: pr.pullRequest.review_comments || 0
    }));

    const mergedPRs = prMetrics.filter(pr => pr.timeToMerge !== null);
    const timesToMerge = mergedPRs.map(pr => pr.timeToMerge);

    return {
      throughput: {
        daily: prs.length / 30,
        weekly: prs.length / 4.3,
        monthly: prs.length
      },
      cycleTime: {
        average: timesToMerge.length > 0 ? this.average(timesToMerge) : 0,
        median: timesToMerge.length > 0 ? this.median(timesToMerge) : 0,
        p95: timesToMerge.length > 0 ? this.percentile(timesToMerge, 95) : 0
      },
      mergeRate: mergedPRs.length / prs.length * 100,
      codeChurn: {
        additions: mergedPRs.reduce((sum, pr) => sum + pr.additions, 0),
        deletions: mergedPRs.reduce((sum, pr) => sum + pr.deletions, 0),
        net: mergedPRs.reduce((sum, pr) => sum + pr.additions - pr.deletions, 0)
      },
      reviewMetrics: {
        averageComments: this.average(prMetrics.map(pr => pr.reviewComments)),
        reviewCoverage: prMetrics.filter(pr => pr.reviewComments > 0).length / prMetrics.length * 100
      }
    };
  }

  /**
   * Calculate coverage velocity
   */
  calculateCoverageVelocity(dailyMetrics) {
    const coverageByDay = Object.keys(dailyMetrics).map(day => {
      const dayData = dailyMetrics[day];
      const avgCoverage = this.average(dayData.map(d => d.coverage?.overall || 0));
      return {
        date: day,
        coverage: avgCoverage
      };
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    const coverageValues = coverageByDay.map(d => d.coverage);
    const coverageDeltas = [];

    for (let i = 1; i < coverageValues.length; i++) {
      coverageDeltas.push(coverageValues[i] - coverageValues[i - 1]);
    }

    return {
      current: coverageValues[coverageValues.length - 1] || 0,
      trend: this.calculateTrend(coverageValues),
      improvement: {
        daily: coverageDeltas.length > 0 ? this.average(coverageDeltas) : 0,
        weekly: coverageDeltas.length > 0 ? this.average(coverageDeltas) * 7 : 0,
        total: coverageValues.length > 1
          ? coverageValues[coverageValues.length - 1] - coverageValues[0]
          : 0
      },
      volatility: this.standardDeviation(coverageValues),
      consistency: this.calculateConsistency(coverageValues)
    };
  }

  /**
   * Calculate issue velocity
   */
  calculateIssueVelocity(data) {
    const issues = data.filter(entry => entry.issue);

    const issueMetrics = issues.map(issue => ({
      created: new Date(issue.issue.created_at),
      closed: issue.issue.closed_at ? new Date(issue.issue.closed_at) : null,
      timeToClose: issue.issue.closed_at
        ? (new Date(issue.issue.closed_at) - new Date(issue.issue.created_at)) / (1000 * 60 * 60 * 24)
        : null,
      labels: issue.issue.labels || [],
      isBug: issue.issue.labels?.some(l => l.name.toLowerCase().includes('bug'))
    }));

    const closedIssues = issueMetrics.filter(i => i.timeToClose !== null);
    const bugs = issueMetrics.filter(i => i.isBug);
    const closedBugs = bugs.filter(i => i.timeToClose !== null);

    return {
      created: {
        daily: issues.length / 30,
        weekly: issues.length / 4.3,
        monthly: issues.length
      },
      closed: {
        daily: closedIssues.length / 30,
        weekly: closedIssues.length / 4.3,
        monthly: closedIssues.length
      },
      resolutionTime: {
        average: closedIssues.length > 0
          ? this.average(closedIssues.map(i => i.timeToClose))
          : 0,
        median: closedIssues.length > 0
          ? this.median(closedIssues.map(i => i.timeToClose))
          : 0,
        p95: closedIssues.length > 0
          ? this.percentile(closedIssues.map(i => i.timeToClose), 95)
          : 0
      },
      bugMetrics: {
        total: bugs.length,
        resolved: closedBugs.length,
        resolutionRate: bugs.length > 0 ? closedBugs.length / bugs.length * 100 : 0,
        mttr: closedBugs.length > 0
          ? this.average(closedBugs.map(b => b.timeToClose))
          : 0
      },
      backlog: issues.length - closedIssues.length,
      burndownRate: closedIssues.length / issues.length * 100
    };
  }

  /**
   * Calculate sprint velocity
   */
  calculateSprintVelocity(data) {
    // Group data into sprints
    const sprints = this.groupIntoSprints(data);

    const sprintMetrics = sprints.map(sprint => ({
      start: sprint.start,
      end: sprint.end,
      commits: sprint.data.length,
      coverage: this.average(sprint.data.map(d => d.coverage?.overall || 0)),
      testsAdded: sprint.data.reduce((sum, d) => sum + (d.tests?.total || 0), 0),
      deployments: sprint.data.filter(d => d.environment === 'production').length,
      velocity: this.calculateSprintPoints(sprint.data)
    }));

    const velocities = sprintMetrics.map(s => s.velocity);

    return {
      average: velocities.length > 0 ? this.average(velocities) : 0,
      trend: this.calculateTrend(velocities),
      consistency: this.calculateConsistency(velocities),
      predictedNext: this.predictNextSprint(velocities),
      sprints: sprintMetrics
    };
  }

  groupIntoSprints(data) {
    const sprints = [];
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (sortedData.length === 0) return sprints;

    const startDate = new Date(sortedData[0].timestamp);
    const endDate = new Date(sortedData[sortedData.length - 1].timestamp);

    let currentStart = new Date(startDate);
    while (currentStart < endDate) {
      const currentEnd = new Date(currentStart.getTime() + this.sprintDuration * 24 * 60 * 60 * 1000);

      const sprintData = sortedData.filter(d => {
        const timestamp = new Date(d.timestamp);
        return timestamp >= currentStart && timestamp < currentEnd;
      });

      sprints.push({
        start: currentStart.toISOString(),
        end: currentEnd.toISOString(),
        data: sprintData
      });

      currentStart = currentEnd;
    }

    return sprints;
  }

  calculateSprintPoints(data) {
    // Simplified story points calculation based on activity
    let points = 0;

    data.forEach(entry => {
      // Each commit is worth 1 point
      points += 1;

      // Bonus points for quality improvements
      if (entry.coverage?.overall > 80) points += 2;
      if (entry.tests?.passed === entry.tests?.total && entry.tests?.total > 0) points += 1;
      if (entry.security?.score > 90) points += 1;
    });

    return points;
  }

  /**
   * Calculate Mean Time To Recovery
   */
  calculateMTTR(data) {
    const failures = data.filter(entry => entry.status === 'failure');
    const recoveries = [];

    for (let i = 0; i < failures.length; i++) {
      const failureTime = new Date(failures[i].timestamp);

      // Find next success
      const nextSuccess = data.find(entry =>
        new Date(entry.timestamp) > failureTime && entry.status === 'success'
      );

      if (nextSuccess) {
        const recoveryTime = new Date(nextSuccess.timestamp);
        const mttr = (recoveryTime - failureTime) / (1000 * 60 * 60); // Hours
        recoveries.push(mttr);
      }
    }

    return recoveries.length > 0 ? this.average(recoveries) : 0;
  }

  /**
   * Calculate change failure rate
   */
  calculateChangeFailureRate(data) {
    const deployments = data.filter(entry => entry.environment === 'production');
    const failures = deployments.filter(d => d.status === 'failure');

    return deployments.length > 0 ? (failures.length / deployments.length * 100) : 0;
  }

  /**
   * Calculate trend (positive, negative, or neutral)
   */
  calculateTrend(values) {
    if (values.length < 2) return 'neutral';

    // Simple linear regression
    const n = values.length;
    const indices = Array.from({ length: n }, (_, i) => i);

    const sumX = indices.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    if (Math.abs(slope) < 0.01) return 'neutral';
    return slope > 0 ? 'increasing' : 'decreasing';
  }

  calculateWeeklyTrend(dailyMetrics) {
    // Group by week and calculate trend
    const weeks = {};
    Object.keys(dailyMetrics).forEach(day => {
      const week = this.getWeekNumber(new Date(day));
      if (!weeks[week]) weeks[week] = [];
      weeks[week] = weeks[week].concat(dailyMetrics[day]);
    });

    const weeklyValues = Object.values(weeks).map(w => w.length);
    return this.calculateTrend(weeklyValues);
  }

  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  calculateDistribution(values) {
    const sorted = [...values].sort((a, b) => a - b);
    return {
      p25: this.percentile(sorted, 25),
      p50: this.percentile(sorted, 50),
      p75: this.percentile(sorted, 75),
      p90: this.percentile(sorted, 90),
      p95: this.percentile(sorted, 95)
    };
  }

  calculateConsistency(values) {
    if (values.length < 2) return 100;

    const mean = this.average(values);
    const stdDev = this.standardDeviation(values);

    // Coefficient of variation (lower is more consistent)
    const cv = mean > 0 ? (stdDev / mean) * 100 : 0;

    // Convert to consistency score (0-100, higher is better)
    return Math.max(0, 100 - cv);
  }

  predictNextSprint(velocities) {
    if (velocities.length < 3) return velocities.length > 0 ? this.average(velocities) : 0;

    // Simple weighted average (recent sprints have more weight)
    const weights = velocities.map((_, i) => Math.pow(2, i));
    const weightSum = weights.reduce((a, b) => a + b, 0);

    const weightedSum = velocities.reduce((sum, v, i) => sum + v * weights[i], 0);
    return weightedSum / weightSum;
  }

  // Utility functions
  average(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  median(arr) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  percentile(arr, p) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  standardDeviation(arr) {
    if (arr.length === 0) return 0;
    const mean = this.average(arr);
    const squaredDiffs = arr.map(x => Math.pow(x - mean, 2));
    return Math.sqrt(this.average(squaredDiffs));
  }
}

// Singleton instance
export const velocityTracking = new VelocityTrackingService();
export default VelocityTrackingService;