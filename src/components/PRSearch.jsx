import { useState, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import debounce from 'lodash/debounce';

export function PRSearch({ onSelectPR }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState('all'); // all, number, branch, title

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (term) => {
      if (!term || term.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);

      try {
        const response = await fetch(`/api/search/prs?q=${encodeURIComponent(term)}&type=${searchType}`);
        const data = await response.json();
        setSearchResults(data.items || []);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [searchType]
  );

  useEffect(() => {
    performSearch(searchTerm);
  }, [searchTerm, performSearch]);

  const handleSelect = (pr) => {
    onSelectPR(pr);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search PRs by number, branch, or title..."
          className="w-full px-10 py-2 border border-gray-300 rounded-lg
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     dark:bg-gray-800 dark:border-gray-600"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSearchResults([]);
            }}
            className="absolute right-3 top-2.5"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Type Selector */}
      <div className="flex gap-2 mt-2">
        {['all', 'number', 'branch', 'title'].map(type => (
          <button
            key={type}
            onClick={() => setSearchType(type)}
            className={`px-3 py-1 text-xs rounded ${
              searchType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Search Results Dropdown */}
      {(isSearching || searchResults.length > 0) && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800
                        border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg
                        max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <ul className="py-2">
              {searchResults.map(pr => (
                <li key={pr.number}>
                  <button
                    onClick={() => handleSelect(pr)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700
                               transition-colors duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          #{pr.number}
                        </span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {pr.title}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {pr.head.ref}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      by {pr.user.login} • {new Date(pr.created_at).toLocaleDateString()}
                      {pr.draft && (
                        <span className="ml-2 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                          Draft
                        </span>
                      )}
                      {pr.merged && (
                        <span className="ml-2 px-2 py-0.5 bg-purple-200 dark:bg-purple-700 rounded">
                          Merged
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PRSearch;