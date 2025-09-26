const fs = require('fs');
const path = require('path');

const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', 'build', 'coverage', 'trinity'];
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

function removeConsoleStatements(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Pattern to match console.* statements (but preserve console.error and console.warn in catch blocks)
  const patterns = [
    /console\.(log|debug|info|trace)\([^)]*\);?\n?/g,
    /console\.(table|time|timeEnd|group|groupEnd)\([^)]*\);?\n?/g
  ];

  patterns.forEach(pattern => {
    content = content.replace(pattern, '');
  });

  // Only write if changes were made
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function processDirectory(dir) {
  let totalFixed = 0;

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !EXCLUDED_DIRS.includes(file)) {
      totalFixed += processDirectory(filePath);
    } else if (stat.isFile() && FILE_EXTENSIONS.includes(path.extname(file))) {
      if (removeConsoleStatements(filePath)) {
        console.log(`Cleaned: ${filePath}`);
        totalFixed++;
      }
    }
  });

  return totalFixed;
}

// Run cleanup
console.log('Starting console statement cleanup...');
const srcPath = path.join(process.cwd(), 'src');
if (fs.existsSync(srcPath)) {
  const fixed = processDirectory(srcPath);
  console.log(`\nComplete! Cleaned ${fixed} files.`);
} else {
  console.log('Error: src directory not found');
}