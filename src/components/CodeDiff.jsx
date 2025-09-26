import { useEffect, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-diff';

export function CodeDiff({ diff, filePath }) {
  const [viewMode, setViewMode] = useState('split'); // split or unified
  const [parsedDiff, setParsedDiff] = useState([]);

  useEffect(() => {
    if (!diff) return;

    // Parse diff into structured format
    const parsed = parseDiff(diff);
    setParsedDiff(parsed);
  }, [diff]);

  function parseDiff(diffText) {
    const lines = diffText.split('\n');
    const changes = [];
    let currentHunk = null;

    lines.forEach(line => {
      if (line.startsWith('@@')) {
        // New hunk
        const match = line.match(/@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@(.*)/);
        if (match) {
          currentHunk = {
            oldStart: parseInt(match[1]),
            oldLines: parseInt(match[2] || 1),
            newStart: parseInt(match[3]),
            newLines: parseInt(match[4] || 1),
            context: match[5] || '',
            changes: []
          };
          changes.push(currentHunk);
        }
      } else if (currentHunk) {
        if (line.startsWith('+')) {
          currentHunk.changes.push({ type: 'add', content: line.substring(1) });
        } else if (line.startsWith('-')) {
          currentHunk.changes.push({ type: 'remove', content: line.substring(1) });
        } else if (line.startsWith(' ')) {
          currentHunk.changes.push({ type: 'context', content: line.substring(1) });
        }
      }
    });

    return changes;
  }

  function getLanguage() {
    const ext = filePath?.split('.').pop()?.toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'jsx',
      'ts': 'typescript',
      'tsx': 'tsx',
      'py': 'python',
      'rs': 'rust',
      'go': 'go',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown'
    };
    return languageMap[ext] || 'plain';
  }

  function highlightCode(code, language) {
    if (!Prism.languages[language]) {
      return code;
    }

    try {
      return Prism.highlight(code, Prism.languages[language], language);
    } catch (error) {
      console.error('Syntax highlighting failed:', error);
      return code;
    }
  }

  function renderSplitView() {
    const language = getLanguage();

    return (
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
          <h4 className="text-sm font-semibold mb-2 text-red-700 dark:text-red-300">Removed</h4>
          <div className="space-y-1">
            {parsedDiff.map((hunk, i) => (
              <div key={i}>
                {hunk.changes
                  .filter(c => c.type === 'remove')
                  .map((change, j) => (
                    <div
                      key={j}
                      className="font-mono text-xs bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded"
                    >
                      <span dangerouslySetInnerHTML={{
                        __html: highlightCode(change.content, language)
                      }} />
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
          <h4 className="text-sm font-semibold mb-2 text-green-700 dark:text-green-300">Added</h4>
          <div className="space-y-1">
            {parsedDiff.map((hunk, i) => (
              <div key={i}>
                {hunk.changes
                  .filter(c => c.type === 'add')
                  .map((change, j) => (
                    <div
                      key={j}
                      className="font-mono text-xs bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded"
                    >
                      <span dangerouslySetInnerHTML={{
                        __html: highlightCode(change.content, language)
                      }} />
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderUnifiedView() {
    const language = getLanguage();

    return (
      <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
        {parsedDiff.map((hunk, i) => (
          <div key={i} className="mb-4">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-mono">
              @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@ {hunk.context}
            </div>
            <div className="space-y-0">
              {hunk.changes.map((change, j) => {
                const bgColor = change.type === 'add'
                  ? 'bg-green-100 dark:bg-green-900/40'
                  : change.type === 'remove'
                  ? 'bg-red-100 dark:bg-red-900/40'
                  : '';

                const prefix = change.type === 'add' ? '+' : change.type === 'remove' ? '-' : ' ';
                const prefixColor = change.type === 'add'
                  ? 'text-green-700 dark:text-green-400'
                  : change.type === 'remove'
                  ? 'text-red-700 dark:text-red-400'
                  : 'text-gray-500';

                return (
                  <div
                    key={j}
                    className={`font-mono text-xs px-2 py-0.5 ${bgColor}`}
                  >
                    <span className={`select-none ${prefixColor} inline-block w-4`}>{prefix}</span>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: highlightCode(change.content, language)
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!diff || parsedDiff.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No changes in this file
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{filePath}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              viewMode === 'split'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setViewMode('unified')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              viewMode === 'unified'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Unified View
          </button>
        </div>
      </div>

      {viewMode === 'split' ? renderSplitView() : renderUnifiedView()}
    </div>
  );
}

export default CodeDiff;