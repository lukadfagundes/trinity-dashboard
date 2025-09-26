import { useState, useEffect } from 'react';
import { User, Calendar, GitCommit } from 'lucide-react';
import GitHubLiveService from '../services/githubLiveService';

export function GitBlame({ repository, filePath, highlightLine = null }) {
  const [blameData, setBlameData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [hoveredLine, setHoveredLine] = useState(null);

  useEffect(() => {
    async function fetchBlame() {
      setLoading(true);
      const service = new GitHubLiveService(import.meta.env.VITE_GITHUB_TOKEN);

      try {
        const [owner, repo] = repository.split('/');

        // Get file history
        const history = await service.fetchFileHistory(owner, repo, filePath);

        // Get current file content
        const content = await service.fetchFileContent(owner, repo, filePath, 'HEAD');

        if (content) {
          const lines = content.split('\n');

          // Create blame data (simplified - real implementation would use git blame)
          const blame = lines.map((line, index) => {
            // Find most recent commit that touched this file
            const commit = history[0] || {
              sha: 'unknown',
              author: 'Unknown',
              date: null,
              message: 'No commit information'
            };

            return {
              lineNumber: index + 1,
              content: line,
              commit: commit.sha.substring(0, 7),
              author: commit.author,
              date: commit.date,
              message: commit.message.split('\n')[0],
              fullCommit: commit
            };
          });

          setBlameData(blame);
        }
      } catch (error) {
        console.error('Failed to fetch blame data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (repository && filePath) {
      fetchBlame();
    }
  }, [repository, filePath]);

  const getAuthorColor = (author) => {
    // Generate consistent color for each author
    const hash = author.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    ];
    return colors[hash % colors.length];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
          <GitCommit className="h-4 w-4" />
          Git Blame: {filePath}
        </h3>
      </div>

      {/* Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <tbody>
            {blameData.map((line) => (
              <tr
                key={line.lineNumber}
                className={`border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                  ${highlightLine === line.lineNumber ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}
                  ${hoveredLine === line.lineNumber ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                onMouseEnter={() => setHoveredLine(line.lineNumber)}
                onMouseLeave={() => setHoveredLine(null)}
              >
                {/* Line Number */}
                <td className="w-12 px-2 py-1 text-right text-gray-500 dark:text-gray-400 select-none border-r border-gray-200 dark:border-gray-700">
                  {line.lineNumber}
                </td>

                {/* Commit Info */}
                <td className="w-20 px-2 py-1 border-r border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setSelectedCommit(line.fullCommit)}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {line.commit}
                  </button>
                </td>

                {/* Author */}
                <td className="w-32 px-2 py-1 border-r border-gray-200 dark:border-gray-700">
                  <span className={`px-2 py-0.5 rounded text-xs ${getAuthorColor(line.author)}`}>
                    {line.author}
                  </span>
                </td>

                {/* Date */}
                <td className="w-24 px-2 py-1 text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                  {formatDate(line.date)}
                </td>

                {/* Code */}
                <td className="px-2 py-1">
                  <pre className="whitespace-pre overflow-x-auto text-gray-900 dark:text-gray-100">{line.content}</pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Commit Details Modal */}
      {selectedCommit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Commit Details</h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <span className="font-semibold text-gray-700 dark:text-gray-300 w-24">SHA:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{selectedCommit.sha}</span>
              </div>

              <div className="flex items-start">
                <span className="font-semibold text-gray-700 dark:text-gray-300 w-24">Author:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {selectedCommit.author} {selectedCommit.email && `<${selectedCommit.email}>`}
                </span>
              </div>

              <div className="flex items-start">
                <span className="font-semibold text-gray-700 dark:text-gray-300 w-24">Date:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {selectedCommit.date && new Date(selectedCommit.date).toLocaleString()}
                </span>
              </div>

              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">Message:</span>
                <pre className="mt-1 p-3 bg-gray-100 dark:bg-gray-900 rounded whitespace-pre-wrap font-mono text-xs text-gray-900 dark:text-gray-100">
                  {selectedCommit.message}
                </pre>
              </div>

              {selectedCommit.stats && (
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Stats:</span>
                  <span className="text-green-600 dark:text-green-400">
                    +{selectedCommit.stats.additions}
                  </span>
                  <span className="text-red-600 dark:text-red-400">
                    -{selectedCommit.stats.deletions}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedCommit(null)}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GitBlame;