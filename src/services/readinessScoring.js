/**
 * Readiness Scoring Service
 * Calculates merge readiness scores for pull requests
 */

export class ReadinessScorer {
  static calculateScore(prData, mainData) {
    if (!prData || !mainData) {
      return 0;
    }

    const weights = {
      coverage: 0.3,      // 30% weight
      tests: 0.25,        // 25% weight
      security: 0.25,     // 25% weight
      codeQuality: 0.2    // 20% weight
    };

    let score = 0;

    // Coverage score (0-30 points)
    const coverageDelta = (prData.coverage?.overall || 0) - (mainData.coverage?.overall || 0);
    if (coverageDelta >= 0) {
      // Coverage improved or maintained
      score += weights.coverage * 100;
    } else {
      // Coverage decreased - penalty based on how much it decreased
      score += weights.coverage * Math.max(0, 100 + coverageDelta * 10);
    }

    // Test score (0-25 points)
    const prTestPassRate = prData.tests && prData.tests.total > 0
      ? (prData.tests.passed / prData.tests.total) * 100
      : 0;
    score += weights.tests * prTestPassRate;

    // Security score (0-25 points)
    const securityScore = this.calculateSecurityScore(prData.security);
    score += weights.security * securityScore;

    // Code quality score (0-20 points)
    // This could include linting, complexity, etc.
    const qualityScore = this.calculateQualityScore(prData);
    score += weights.codeQuality * qualityScore;

    return Math.round(score);
  }

  static calculateSecurityScore(security) {
    if (!security) {
      return 100; // No security data means no known vulnerabilities
    }

    // Start with perfect score and deduct based on vulnerabilities
    let score = 100;

    // Heavy penalties for critical and high vulnerabilities
    score -= (security.critical || 0) * 25;
    score -= (security.high || 0) * 15;
    score -= (security.medium || 0) * 5;
    score -= (security.low || 0) * 2;
    score -= (security.info || 0) * 0.5;

    return Math.max(0, score);
  }

  static calculateQualityScore(prData) {
    let score = 100;

    // Check build status
    if (prData.status !== 'success') {
      score -= 50; // Build failure is a major issue
    }

    // Check for build warnings
    if (prData.build?.warnings && prData.build.warnings > 0) {
      score -= Math.min(30, prData.build.warnings * 5);
    }

    // Check for linting errors (if available)
    if (prData.linting) {
      const lintingScore = 100 - Math.min(50,
        (prData.linting.errors || 0) * 10 +
        (prData.linting.warnings || 0) * 2
      );
      score = (score + lintingScore) / 2;
    }

    return Math.max(0, score);
  }

  static getReadinessLevel(score) {
    if (score >= 90) {
      return { level: 'excellent', color: 'green', emoji: '🎉' };
    }
    if (score >= 80) {
      return { level: 'good', color: 'lime', emoji: '✅' };
    }
    if (score >= 70) {
      return { level: 'acceptable', color: 'yellow', emoji: '⚠️' };
    }
    if (score >= 60) {
      return { level: 'needs-work', color: 'orange', emoji: '🔧' };
    }
    return { level: 'not-ready', color: 'red', emoji: '❌' };
  }

  static getDetailedAnalysis(prData, mainData) {
    const score = this.calculateScore(prData, mainData);
    const level = this.getReadinessLevel(score);

    const issues = [];
    const improvements = [];

    // Analyze coverage
    const coverageDelta = (prData.coverage?.overall || 0) - (mainData.coverage?.overall || 0);
    if (coverageDelta < -5) {
      issues.push({
        type: 'coverage',
        severity: 'high',
        message: `Coverage decreased by ${Math.abs(coverageDelta).toFixed(1)}%`
      });
    } else if (coverageDelta > 5) {
      improvements.push({
        type: 'coverage',
        message: `Coverage improved by ${coverageDelta.toFixed(1)}%`
      });
    }

    // Analyze tests
    const prTestPassRate = prData.tests && prData.tests.total > 0
      ? (prData.tests.passed / prData.tests.total) * 100
      : 0;

    if (prTestPassRate < 100 && prData.tests?.failed > 0) {
      issues.push({
        type: 'tests',
        severity: 'critical',
        message: `${prData.tests.failed} tests are failing`
      });
    }

    if (prData.tests?.total === 0) {
      issues.push({
        type: 'tests',
        severity: 'medium',
        message: 'No tests found for this PR'
      });
    }

    // Analyze security
    if (prData.security) {
      if (prData.security.critical > 0) {
        issues.push({
          type: 'security',
          severity: 'critical',
          message: `${prData.security.critical} critical vulnerabilities found`
        });
      }
      if (prData.security.high > 0) {
        issues.push({
          type: 'security',
          severity: 'high',
          message: `${prData.security.high} high severity vulnerabilities found`
        });
      }
    }

    // Analyze build
    if (prData.status !== 'success') {
      issues.push({
        type: 'build',
        severity: 'critical',
        message: 'Build is failing'
      });
    }

    return {
      score,
      level,
      issues,
      improvements,
      recommendation: this.getRecommendation(score, issues)
    };
  }

  static getRecommendation(score, issues) {
    if (score >= 80 && issues.filter(i => i.severity === 'critical').length === 0) {
      return {
        action: 'approve',
        message: 'This PR meets quality standards and is ready to merge'
      };
    }

    if (score >= 70 && issues.filter(i => i.severity === 'critical').length === 0) {
      return {
        action: 'conditional',
        message: 'This PR can be merged with caution, but consider addressing the identified issues'
      };
    }

    return {
      action: 'block',
      message: 'This PR needs significant improvements before it can be merged'
    };
  }

  static generateReport(prData, mainData) {
    const analysis = this.getDetailedAnalysis(prData, mainData);

    return {
      timestamp: new Date().toISOString(),
      prNumber: prData.prNumber,
      branch: prData.branch,
      score: analysis.score,
      level: analysis.level,
      metrics: {
        coverage: {
          pr: prData.coverage?.overall || 0,
          main: mainData.coverage?.overall || 0,
          delta: (prData.coverage?.overall || 0) - (mainData.coverage?.overall || 0)
        },
        tests: {
          pr: {
            total: prData.tests?.total || 0,
            passed: prData.tests?.passed || 0,
            failed: prData.tests?.failed || 0
          },
          main: {
            total: mainData.tests?.total || 0,
            passed: mainData.tests?.passed || 0,
            failed: mainData.tests?.failed || 0
          }
        },
        security: {
          pr: prData.security,
          main: mainData.security
        },
        build: {
          pr: prData.status,
          main: mainData.status
        }
      },
      issues: analysis.issues,
      improvements: analysis.improvements,
      recommendation: analysis.recommendation
    };
  }
}