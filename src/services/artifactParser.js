export async function parseCoverageArtifact(artifactData, format = 'auto') {
  if (!artifactData) {
    return {
      line: 0,
      branch: 0,
      function: 0,
      statement: 0,
      overall: 0,
      files: []
    };
  }

  const parsers = {
    'coverage.json': parseJestCoverage,
    'coverage.xml': parseCoberturaCoverage,
    '.coverage': parsePythonCoverage,
    'lcov.info': parseLcovCoverage
  };

  let parser = null;

  if (format === 'auto') {
    if (typeof artifactData === 'string') {
      if (artifactData.includes('<?xml')) {
        parser = parseCoberturaCoverage;
      } else if (artifactData.includes('TN:')) {
        parser = parseLcovCoverage;
      } else {
        try {
          JSON.parse(artifactData);
          parser = parseJestCoverage;
        } catch {
          parser = parsePythonCoverage;
        }
      }
    } else if (typeof artifactData === 'object') {
      parser = parseJestCoverage;
    }
  } else {
    parser = parsers[format];
  }

  if (!parser) {
    console.warn('Unknown coverage format, using default values');
    return {
      line: 0,
      branch: 0,
      function: 0,
      statement: 0,
      overall: 0,
      files: []
    };
  }

  try {
    return await parser(artifactData);
  } catch (error) {
    console.error('Error parsing coverage artifact:', error);
    return {
      line: 0,
      branch: 0,
      function: 0,
      statement: 0,
      overall: 0,
      files: []
    };
  }
}

function parseJestCoverage(data) {
  let coverageData;

  if (typeof data === 'string') {
    try {
      coverageData = JSON.parse(data);
    } catch {
      return getDefaultCoverage();
    }
  } else {
    coverageData = data;
  }

  const summary = coverageData.total || {};
  const files = [];

  if (coverageData.coverageMap) {
    Object.entries(coverageData.coverageMap).forEach(([file, fileData]) => {
      files.push({
        name: file,
        line: fileData.lines?.percentage || 0,
        branch: fileData.branches?.percentage || 0,
        function: fileData.functions?.percentage || 0,
        statement: fileData.statements?.percentage || 0
      });
    });
  }

  return {
    line: summary.lines?.pct || 0,
    branch: summary.branches?.pct || 0,
    function: summary.functions?.pct || 0,
    statement: summary.statements?.pct || 0,
    overall: calculateOverallCoverage(summary),
    files
  };
}

function parseCoberturaCoverage(xmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  const lineRate = parseFloat(doc.documentElement.getAttribute('line-rate') || 0) * 100;
  const branchRate = parseFloat(doc.documentElement.getAttribute('branch-rate') || 0) * 100;

  const files = [];
  const classes = doc.getElementsByTagName('class');

  for (let cls of classes) {
    const filename = cls.getAttribute('filename');
    const classLineRate = parseFloat(cls.getAttribute('line-rate') || 0) * 100;
    const classBranchRate = parseFloat(cls.getAttribute('branch-rate') || 0) * 100;

    files.push({
      name: filename,
      line: classLineRate,
      branch: classBranchRate,
      function: classLineRate,
      statement: classLineRate
    });
  }

  return {
    line: lineRate,
    branch: branchRate,
    function: lineRate,
    statement: lineRate,
    overall: (lineRate + branchRate) / 2,
    files
  };
}

function parsePythonCoverage(data) {
  try {
    let coverageData;
    if (typeof data === 'string') {
      coverageData = JSON.parse(data);
    } else {
      coverageData = data;
    }

    const summary = coverageData.totals || {};
    const files = [];

    if (coverageData.files) {
      Object.entries(coverageData.files).forEach(([file, fileData]) => {
        const coverage = (fileData.executed_lines / fileData.num_statements) * 100;
        files.push({
          name: file,
          line: coverage,
          branch: fileData.branch_coverage || coverage,
          function: coverage,
          statement: coverage
        });
      });
    }

    const overallCoverage = summary.percent_covered || 0;

    return {
      line: overallCoverage,
      branch: summary.branch_coverage || overallCoverage,
      function: overallCoverage,
      statement: overallCoverage,
      overall: overallCoverage,
      files
    };
  } catch {
    return getDefaultCoverage();
  }
}

function parseLcovCoverage(lcovString) {
  const lines = lcovString.split('\n');
  const files = [];
  let currentFile = null;
  let totalLines = 0;
  let coveredLines = 0;
  let totalBranches = 0;
  let coveredBranches = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;

  for (let line of lines) {
    if (line.startsWith('SF:')) {
      if (currentFile) {
        files.push(currentFile);
      }
      currentFile = {
        name: line.substring(3),
        lines: { found: 0, hit: 0 },
        branches: { found: 0, hit: 0 },
        functions: { found: 0, hit: 0 }
      };
    } else if (line.startsWith('LF:') && currentFile) {
      currentFile.lines.found = parseInt(line.substring(3));
      totalLines += currentFile.lines.found;
    } else if (line.startsWith('LH:') && currentFile) {
      currentFile.lines.hit = parseInt(line.substring(3));
      coveredLines += currentFile.lines.hit;
    } else if (line.startsWith('BRF:') && currentFile) {
      currentFile.branches.found = parseInt(line.substring(4));
      totalBranches += currentFile.branches.found;
    } else if (line.startsWith('BRH:') && currentFile) {
      currentFile.branches.hit = parseInt(line.substring(4));
      coveredBranches += currentFile.branches.hit;
    } else if (line.startsWith('FNF:') && currentFile) {
      currentFile.functions.found = parseInt(line.substring(4));
      totalFunctions += currentFile.functions.found;
    } else if (line.startsWith('FNH:') && currentFile) {
      currentFile.functions.hit = parseInt(line.substring(4));
      coveredFunctions += currentFile.functions.hit;
    }
  }

  if (currentFile) {
    files.push(currentFile);
  }

  const processedFiles = files.map(file => ({
    name: file.name,
    line: file.lines.found > 0 ? (file.lines.hit / file.lines.found) * 100 : 0,
    branch: file.branches.found > 0 ? (file.branches.hit / file.branches.found) * 100 : 0,
    function: file.functions.found > 0 ? (file.functions.hit / file.functions.found) * 100 : 0,
    statement: file.lines.found > 0 ? (file.lines.hit / file.lines.found) * 100 : 0
  }));

  const lineCoverage = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;
  const branchCoverage = totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0;
  const functionCoverage = totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0;

  return {
    line: lineCoverage,
    branch: branchCoverage,
    function: functionCoverage,
    statement: lineCoverage,
    overall: (lineCoverage + branchCoverage + functionCoverage) / 3,
    files: processedFiles
  };
}

export async function parseTestResults(artifactData, format = 'auto') {
  if (!artifactData) {
    return {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      passRate: 0,
      suites: []
    };
  }

  const parsers = {
    'junit.xml': parseJUnitResults,
    'pytest.json': parsePytestResults,
    'jest.json': parseJestResults,
    'mocha.json': parseMochaResults
  };

  let parser = null;

  if (format === 'auto') {
    if (typeof artifactData === 'string') {
      if (artifactData.includes('<?xml')) {
        parser = parseJUnitResults;
      } else {
        try {
          const parsed = JSON.parse(artifactData);
          if (parsed.numTotalTests !== undefined) {
            parser = parseJestResults;
          } else if (parsed.stats !== undefined) {
            parser = parseMochaResults;
          } else {
            parser = parsePytestResults;
          }
        } catch {
          console.warn('Unable to parse test results');
          return getDefaultTestResults();
        }
      }
    } else if (typeof artifactData === 'object') {
      if (artifactData.numTotalTests !== undefined) {
        parser = parseJestResults;
      } else if (artifactData.stats !== undefined) {
        parser = parseMochaResults;
      } else {
        parser = parsePytestResults;
      }
    }
  } else {
    parser = parsers[format];
  }

  if (!parser) {
    console.warn('Unknown test results format, using default values');
    return getDefaultTestResults();
  }

  try {
    return await parser(artifactData);
  } catch (error) {
    console.error('Error parsing test results:', error);
    return getDefaultTestResults();
  }
}

function parseJUnitResults(xmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  let total = 0;
  let failed = 0;
  let skipped = 0;
  let duration = 0;
  const suites = [];

  const testsuites = doc.getElementsByTagName('testsuite');

  for (let suite of testsuites) {
    const suiteTotal = parseInt(suite.getAttribute('tests') || 0);
    const suiteFailed = parseInt(suite.getAttribute('failures') || 0) + parseInt(suite.getAttribute('errors') || 0);
    const suiteSkipped = parseInt(suite.getAttribute('skipped') || 0);
    const suiteTime = parseFloat(suite.getAttribute('time') || 0);

    total += suiteTotal;
    failed += suiteFailed;
    skipped += suiteSkipped;
    duration += suiteTime;

    suites.push({
      name: suite.getAttribute('name') || 'Unknown',
      total: suiteTotal,
      passed: suiteTotal - suiteFailed - suiteSkipped,
      failed: suiteFailed,
      skipped: suiteSkipped,
      duration: suiteTime
    });
  }

  const passed = total - failed - skipped;

  return {
    total,
    passed,
    failed,
    skipped,
    duration,
    passRate: total > 0 ? (passed / total) * 100 : 0,
    suites
  };
}

function parseJestResults(data) {
  let results;
  if (typeof data === 'string') {
    results = JSON.parse(data);
  } else {
    results = data;
  }

  const suites = results.testResults?.map(suite => ({
    name: suite.name || suite.testFilePath,
    total: suite.numTotalTests || 0,
    passed: suite.numPassedTests || 0,
    failed: suite.numFailedTests || 0,
    skipped: suite.numPendingTests || 0,
    duration: suite.perfStats?.runtime || 0
  })) || [];

  return {
    total: results.numTotalTests || 0,
    passed: results.numPassedTests || 0,
    failed: results.numFailedTests || 0,
    skipped: results.numPendingTests || 0,
    duration: results.totalTime || 0,
    passRate: results.numTotalTests > 0 ? (results.numPassedTests / results.numTotalTests) * 100 : 0,
    suites
  };
}

function parsePytestResults(data) {
  let results;
  if (typeof data === 'string') {
    results = JSON.parse(data);
  } else {
    results = data;
  }

  const summary = results.summary || {};
  const total = summary.total || 0;
  const passed = summary.passed || 0;
  const failed = summary.failed || 0;
  const skipped = summary.skipped || 0;

  return {
    total,
    passed,
    failed,
    skipped,
    duration: results.duration || 0,
    passRate: total > 0 ? (passed / total) * 100 : 0,
    suites: []
  };
}

function parseMochaResults(data) {
  let results;
  if (typeof data === 'string') {
    results = JSON.parse(data);
  } else {
    results = data;
  }

  const stats = results.stats || {};

  return {
    total: stats.tests || 0,
    passed: stats.passes || 0,
    failed: stats.failures || 0,
    skipped: stats.pending || 0,
    duration: stats.duration || 0,
    passRate: stats.tests > 0 ? (stats.passes / stats.tests) * 100 : 0,
    suites: []
  };
}

function calculateOverallCoverage(summary) {
  const metrics = [];

  if (summary.lines?.pct !== undefined) metrics.push(summary.lines.pct);
  if (summary.branches?.pct !== undefined) metrics.push(summary.branches.pct);
  if (summary.functions?.pct !== undefined) metrics.push(summary.functions.pct);
  if (summary.statements?.pct !== undefined) metrics.push(summary.statements.pct);

  if (metrics.length === 0) return 0;

  return metrics.reduce((a, b) => a + b, 0) / metrics.length;
}

function getDefaultCoverage() {
  return {
    line: 0,
    branch: 0,
    function: 0,
    statement: 0,
    overall: 0,
    files: []
  };
}

function getDefaultTestResults() {
  return {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
    passRate: 0,
    suites: []
  };
}

export async function parseSecurityResults(artifactData) {
  if (!artifactData) {
    return {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
      total: 0,
      score: 100
    };
  }

  try {
    let data;
    if (typeof artifactData === 'string') {
      data = JSON.parse(artifactData);
    } else {
      data = artifactData;
    }

    const critical = data.critical || data.vulnerabilities?.critical || 0;
    const high = data.high || data.vulnerabilities?.high || 0;
    const medium = data.medium || data.vulnerabilities?.medium || 0;
    const low = data.low || data.vulnerabilities?.low || 0;
    const info = data.info || data.vulnerabilities?.info || 0;

    const total = critical + high + medium + low + info;

    const score = Math.max(0, 100 - (critical * 30) - (high * 20) - (medium * 10) - (low * 5) - (info * 2));

    return {
      critical,
      high,
      medium,
      low,
      info,
      total,
      score
    };
  } catch (error) {
    console.error('Error parsing security results:', error);
    return {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
      total: 0,
      score: 100
    };
  }
}