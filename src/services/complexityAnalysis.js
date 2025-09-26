/**
 * Code Complexity Analysis Service
 * Analyzes code complexity metrics and provides insights
 */

export class ComplexityAnalysisService {
  constructor() {
    this.complexityThresholds = {
      low: 10,
      medium: 20,
      high: 50,
      veryHigh: 100
    };
  }

  /**
   * Calculate cyclomatic complexity for JavaScript/TypeScript code
   */
  calculateCyclomaticComplexity(code) {
    if (!code) return 0;

    let complexity = 1; // Base complexity

    // Count decision points
    const patterns = [
      /\bif\b/g,
      /\belse\s+if\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\bdo\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\?\s*:/g, // Ternary operator
      /&&/g,    // Logical AND
      /\|\|/g   // Logical OR
    ];

    patterns.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  /**
   * Calculate cognitive complexity (more sophisticated than cyclomatic)
   */
  calculateCognitiveComplexity(code) {
    if (!code) return 0;

    let complexity = 0;
    let nestingLevel = 0;

    // Split code into lines for analysis
    const lines = code.split('\n');

    lines.forEach(line => {
      const trimmed = line.trim();

      // Increase nesting for control structures
      if (this.startsNestingBlock(trimmed)) {
        nestingLevel++;
        complexity += nestingLevel;
      }

      // Decrease nesting at block end
      if (this.endsNestingBlock(trimmed)) {
        nestingLevel = Math.max(0, nestingLevel - 1);
      }

      // Add complexity for specific constructs
      if (this.isComplexConstruct(trimmed)) {
        complexity += 1 + nestingLevel;
      }
    });

    return complexity;
  }

  startsNestingBlock(line) {
    const patterns = [
      /^if\s*\(/,
      /^else\s+if\s*\(/,
      /^for\s*\(/,
      /^while\s*\(/,
      /^do\s*{/,
      /^switch\s*\(/,
      /^try\s*{/,
      /^catch\s*\(/
    ];

    return patterns.some(pattern => pattern.test(line));
  }

  endsNestingBlock(line) {
    return line.includes('}');
  }

  isComplexConstruct(line) {
    const patterns = [
      /&&/,
      /\|\|/,
      /\?.*:/,
      /^break/,
      /^continue/,
      /^return.*&&/,
      /^return.*\|\|/
    ];

    return patterns.some(pattern => pattern.test(line));
  }

  /**
   * Analyze file complexity
   */
  analyzeFile(filePath, content) {
    const lines = content.split('\n');
    const functions = this.extractFunctions(content);

    const metrics = {
      path: filePath,
      lines: lines.length,
      linesOfCode: lines.filter(l => l.trim() && !l.trim().startsWith('//')).length,
      functions: functions.length,
      averageComplexity: 0,
      maxComplexity: 0,
      complexFunctions: [],
      maintainabilityIndex: 0
    };

    // Analyze each function
    functions.forEach(func => {
      const complexity = this.calculateCyclomaticComplexity(func.body);
      const cognitive = this.calculateCognitiveComplexity(func.body);

      const funcMetrics = {
        name: func.name,
        line: func.line,
        complexity,
        cognitive,
        linesOfCode: func.body.split('\n').length,
        parameters: func.parameters
      };

      if (complexity > this.complexityThresholds.medium) {
        metrics.complexFunctions.push(funcMetrics);
      }

      metrics.averageComplexity += complexity;
      metrics.maxComplexity = Math.max(metrics.maxComplexity, complexity);
    });

    if (functions.length > 0) {
      metrics.averageComplexity /= functions.length;
    }

    // Calculate maintainability index (simplified version)
    metrics.maintainabilityIndex = this.calculateMaintainabilityIndex(metrics);

    return metrics;
  }

  /**
   * Extract functions from JavaScript/TypeScript code
   */
  extractFunctions(code) {
    const functions = [];
    const functionPatterns = [
      // Regular functions
      /function\s+(\w+)\s*\(([^)]*)\)\s*{/g,
      // Arrow functions
      /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*{/g,
      // Class methods
      /(\w+)\s*\(([^)]*)\)\s*{/g
    ];

    functionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        const startIndex = match.index;
        const functionBody = this.extractFunctionBody(code, startIndex);

        functions.push({
          name: match[1],
          parameters: match[2] ? match[2].split(',').length : 0,
          body: functionBody,
          line: code.substring(0, startIndex).split('\n').length
        });
      }
    });

    return functions;
  }

  extractFunctionBody(code, startIndex) {
    let braceCount = 0;
    let inBody = false;
    let bodyStart = startIndex;
    let bodyEnd = startIndex;

    for (let i = startIndex; i < code.length; i++) {
      if (code[i] === '{') {
        if (!inBody) {
          bodyStart = i;
          inBody = true;
        }
        braceCount++;
      } else if (code[i] === '}') {
        braceCount--;
        if (braceCount === 0 && inBody) {
          bodyEnd = i + 1;
          break;
        }
      }
    }

    return code.substring(bodyStart, bodyEnd);
  }

  /**
   * Calculate maintainability index (0-100)
   * Based on Halstead volume, cyclomatic complexity, and lines of code
   */
  calculateMaintainabilityIndex(metrics) {
    const { linesOfCode, averageComplexity } = metrics;

    // Simplified calculation
    const volumeComponent = Math.log(linesOfCode + 1);
    const complexityComponent = averageComplexity;

    // Formula inspired by Microsoft's maintainability index
    let mi = 171 - 5.2 * volumeComponent - 0.23 * complexityComponent - 16.2 * Math.log(linesOfCode);

    // Normalize to 0-100 scale
    mi = Math.max(0, Math.min(100, mi * 100 / 171));

    return Math.round(mi);
  }

  /**
   * Analyze repository complexity
   */
  async analyzeRepository(files) {
    const results = {
      totalFiles: files.length,
      totalLines: 0,
      totalFunctions: 0,
      averageComplexity: 0,
      maxComplexity: 0,
      complexFiles: [],
      maintainabilityIndex: 0,
      distribution: {
        low: 0,
        medium: 0,
        high: 0,
        veryHigh: 0
      }
    };

    for (const file of files) {
      const analysis = this.analyzeFile(file.path, file.content);

      results.totalLines += analysis.linesOfCode;
      results.totalFunctions += analysis.functions;
      results.averageComplexity += analysis.averageComplexity * analysis.functions;
      results.maxComplexity = Math.max(results.maxComplexity, analysis.maxComplexity);

      // Categorize by complexity
      if (analysis.averageComplexity < this.complexityThresholds.low) {
        results.distribution.low++;
      } else if (analysis.averageComplexity < this.complexityThresholds.medium) {
        results.distribution.medium++;
      } else if (analysis.averageComplexity < this.complexityThresholds.high) {
        results.distribution.high++;
      } else {
        results.distribution.veryHigh++;
      }

      // Track complex files
      if (analysis.averageComplexity > this.complexityThresholds.medium) {
        results.complexFiles.push({
          path: file.path,
          complexity: analysis.averageComplexity,
          maintainability: analysis.maintainabilityIndex,
          complexFunctions: analysis.complexFunctions
        });
      }
    }

    // Calculate overall averages
    if (results.totalFunctions > 0) {
      results.averageComplexity /= results.totalFunctions;
    }

    // Sort complex files by complexity
    results.complexFiles.sort((a, b) => b.complexity - a.complexity);

    // Calculate overall maintainability
    results.maintainabilityIndex = this.calculateOverallMaintainability(results);

    return results;
  }

  calculateOverallMaintainability(results) {
    const { averageComplexity, totalLines, distribution } = results;

    // Weight factors
    const complexityWeight = 0.4;
    const sizeWeight = 0.3;
    const distributionWeight = 0.3;

    // Complexity score (inverse, lower is better)
    const complexityScore = Math.max(0, 100 - averageComplexity * 2);

    // Size score (penalize very large codebases)
    const sizeScore = Math.max(0, 100 - Math.log10(totalLines + 1) * 10);

    // Distribution score (prefer low complexity files)
    const totalFiles = Object.values(distribution).reduce((a, b) => a + b, 0);
    const distributionScore = totalFiles > 0
      ? ((distribution.low * 100 + distribution.medium * 70 + distribution.high * 30) / totalFiles)
      : 0;

    // Combined score
    const score = (
      complexityScore * complexityWeight +
      sizeScore * sizeWeight +
      distributionScore * distributionWeight
    );

    return Math.round(score);
  }

  /**
   * Generate complexity recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    // Check overall complexity
    if (analysis.averageComplexity > this.complexityThresholds.medium) {
      recommendations.push({
        type: 'warning',
        category: 'complexity',
        message: `Average complexity is ${analysis.averageComplexity.toFixed(1)}, consider refactoring complex functions`,
        priority: 'high'
      });
    }

    // Check maintainability
    if (analysis.maintainabilityIndex < 50) {
      recommendations.push({
        type: 'warning',
        category: 'maintainability',
        message: `Low maintainability index (${analysis.maintainabilityIndex}), code may be difficult to maintain`,
        priority: 'high'
      });
    }

    // Check for highly complex files
    if (analysis.complexFiles.length > 0) {
      const topComplex = analysis.complexFiles.slice(0, 3);
      recommendations.push({
        type: 'suggestion',
        category: 'refactoring',
        message: `${analysis.complexFiles.length} files have high complexity, focus on:`,
        details: topComplex.map(f => `- ${f.path} (complexity: ${f.complexity.toFixed(1)})`),
        priority: 'medium'
      });
    }

    // Check distribution
    const highComplexityRatio = (analysis.distribution.high + analysis.distribution.veryHigh) / analysis.totalFiles;
    if (highComplexityRatio > 0.2) {
      recommendations.push({
        type: 'warning',
        category: 'architecture',
        message: `${(highComplexityRatio * 100).toFixed(0)}% of files have high complexity, consider architectural improvements`,
        priority: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Compare complexity between branches
   */
  compareBranches(branch1Analysis, branch2Analysis) {
    return {
      complexity: {
        branch1: branch1Analysis.averageComplexity,
        branch2: branch2Analysis.averageComplexity,
        delta: branch2Analysis.averageComplexity - branch1Analysis.averageComplexity,
        trend: branch2Analysis.averageComplexity > branch1Analysis.averageComplexity ? 'increasing' : 'decreasing'
      },
      maintainability: {
        branch1: branch1Analysis.maintainabilityIndex,
        branch2: branch2Analysis.maintainabilityIndex,
        delta: branch2Analysis.maintainabilityIndex - branch1Analysis.maintainabilityIndex,
        trend: branch2Analysis.maintainabilityIndex > branch1Analysis.maintainabilityIndex ? 'improving' : 'degrading'
      },
      size: {
        branch1: branch1Analysis.totalLines,
        branch2: branch2Analysis.totalLines,
        delta: branch2Analysis.totalLines - branch1Analysis.totalLines,
        growth: ((branch2Analysis.totalLines - branch1Analysis.totalLines) / branch1Analysis.totalLines * 100).toFixed(1)
      },
      complexFiles: {
        branch1: branch1Analysis.complexFiles.length,
        branch2: branch2Analysis.complexFiles.length,
        new: branch2Analysis.complexFiles.filter(f2 =>
          !branch1Analysis.complexFiles.find(f1 => f1.path === f2.path)
        ),
        resolved: branch1Analysis.complexFiles.filter(f1 =>
          !branch2Analysis.complexFiles.find(f2 => f2.path === f1.path)
        )
      }
    };
  }
}

// Singleton instance
export const complexityAnalysis = new ComplexityAnalysisService();
export default ComplexityAnalysisService;