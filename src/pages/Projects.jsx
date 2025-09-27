import { useState, useEffect } from 'react';
import { useGitHub } from '../contexts/GitHubContext';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { Star, GitFork, AlertCircle, Clock, ExternalLink, Code } from 'lucide-react';
import githubApi from '../services/githubApi';
import languageConfig from '../config/languages.json';

const Projects = () => {
  const { data, loading, error, refresh } = useGitHub();
  const [repositories, setRepositories] = useState([]);
  const [fetchingRepos, setFetchingRepos] = useState(true);

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      setFetchingRepos(true);
      const owner = import.meta.env.VITE_GITHUB_OWNER;
      const repoNames = import.meta.env.VITE_GITHUB_REPOS?.split(',') || [];

      const repoPromises = repoNames.map(async (repoName) => {
        try {
          const response = await githubApi.get(`/repos/${owner}/${repoName.trim()}`);
          return response.data;
        } catch (err) {
          console.error(`Failed to fetch ${repoName}:`, err);
          return null;
        }
      });

      const repos = await Promise.all(repoPromises);
      setRepositories(repos.filter(Boolean));
    } catch (err) {
      console.error('Error fetching repositories:', err);
    } finally {
      setFetchingRepos(false);
    }
  };

  const getLanguageColor = (language) => {
    return languageConfig[language]?.color || 'bg-gray-500';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (fetchingRepos || loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  if (error && repositories.length === 0) {
    return (
      <DashboardLayout>
        <ErrorDisplay error={error} onRetry={fetchRepositories} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Projects</h2>
              <p className="text-gray-400">
                Manage and monitor your GitHub repositories
              </p>
            </div>
            <button
              onClick={() => {
                fetchRepositories();
                refresh();
              }}
              className="px-4 py-2 bg-trinity-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {repositories.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-12 border border-gray-800 text-center">
            <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Projects Found
            </h3>
            <p className="text-gray-400">
              Configure your repositories in the environment variables
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {repositories.map((repo) => (
              <div
                key={repo.id}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-trinity-blue transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {repo.name}
                    </h3>
                    {repo.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {repo.description}
                      </p>
                    )}
                  </div>
                  {repo.private && (
                    <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                      Private
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {repo.language && (
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`} />
                      <span className="text-sm text-gray-300">{repo.language}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>{repo.stargazers_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <GitFork className="w-4 h-4" />
                      <span>{repo.forks_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{repo.open_issues_count}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Updated {formatDate(repo.updated_at)}</span>
                  </div>

                  <div className="pt-3 border-t border-gray-800">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-trinity-blue hover:text-trinity-green transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm">View on GitHub</span>
                    </a>
                  </div>
                </div>

                {repo.topics && repo.topics.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {repo.topics.slice(0, 5).map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Repositories</h3>
            <p className="text-2xl font-bold text-white">{repositories.length}</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Stars</h3>
            <p className="text-2xl font-bold text-yellow-400">
              {repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0)}
            </p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Open Issues</h3>
            <p className="text-2xl font-bold text-red-400">
              {repositories.reduce((sum, repo) => sum + repo.open_issues_count, 0)}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Projects;