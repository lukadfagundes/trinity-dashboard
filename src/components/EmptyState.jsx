import React from 'react';

const EmptyState = ({
  type,
  repoUrl,
  repoName
}) => {
  const emptyStates = {
    workflow: {
      icon: '🔄',
      title: 'No GitHub Actions Configured',
      message: 'Set up CI/CD workflows to see build, test, and deployment metrics',
      action: 'Configure Workflows',
      link: `${repoUrl}/actions/new`
    },
    coverage: {
      icon: '📊',
      title: 'No Coverage Data',
      message: 'Add code coverage reporting to your test workflows',
      action: 'Learn More',
      link: 'https://docs.github.com/en/actions/automating-builds-and-tests/about-continuous-integration'
    },
    tests: {
      icon: '🧪',
      title: 'No Test Results',
      message: 'Configure test reporting in your GitHub Actions',
      action: 'View Documentation',
      link: 'https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs'
    },
    security: {
      icon: '🔒',
      title: 'No Security Scans',
      message: 'Enable security scanning in your workflows',
      action: 'Enable Security',
      link: `${repoUrl}/security`
    }
  };

  const state = emptyStates[type] || emptyStates.workflow;

  return (
    <div className="empty-state-container">
      <div className="empty-icon">{state.icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{state.title}</h3>
      <p className="text-gray-400 mb-4">{state.message}</p>
      <a
        href={state.link}
        target="_blank"
        rel="noopener noreferrer"
        className="empty-state-action inline-block px-4 py-2 bg-gray-800 text-trinity-blue rounded-lg hover:bg-gray-700 transition-colors"
      >
        {state.action} →
      </a>
    </div>
  );
};

export default EmptyState;