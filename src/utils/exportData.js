export function exportToCSV(data, filename = 'dashboard-export.csv') {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return false;
  }

  const headers = [
    'Date',
    'Repository',
    'Branch',
    'Status',
    'Coverage (%)',
    'Tests Passed',
    'Tests Total',
    'Build Duration',
    'Commit',
    'Actor',
    'Workflow'
  ];

  const rows = [];

  if (Array.isArray(data)) {
    data.forEach(item => {
      if (item.runs && Array.isArray(item.runs)) {
        item.runs.forEach(run => {
          rows.push([
            new Date(run.timestamp).toISOString(),
            item.repo || run.repository || '',
            run.branch || '',
            run.status || '',
            run.metrics?.coverage?.overall?.toFixed(2) || '0',
            run.metrics?.tests?.passed || '0',
            run.metrics?.tests?.total || '0',
            run.duration || '',
            run.commit || '',
            run.actor || '',
            run.workflowName || ''
          ]);
        });
      } else {
        rows.push([
          new Date(item.timestamp || Date.now()).toISOString(),
          item.repository || item.repo || '',
          item.branch || '',
          item.status || '',
          item.metrics?.coverage?.overall?.toFixed(2) || '0',
          item.metrics?.tests?.passed || '0',
          item.metrics?.tests?.total || '0',
          item.duration || '',
          item.commit || '',
          item.actor || '',
          item.workflowName || ''
        ]);
      }
    });
  }

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');

  return downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

export function exportToJSON(data, filename = 'dashboard-export.json') {
  if (!data) {
    console.warn('No data to export');
    return false;
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    source: 'Trinity Dashboard',
    data: Array.isArray(data) ? data : [data]
  };

  const json = JSON.stringify(exportData, null, 2);
  return downloadFile(json, filename, 'application/json');
}

export function exportMetricsReport(data, filename = 'metrics-report.html') {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return false;
  }

  const html = generateHTMLReport(data);
  return downloadFile(html, filename, 'text/html;charset=utf-8;');
}

function generateHTMLReport(data) {
  const reportDate = new Date().toLocaleString();
  const repositories = Array.isArray(data) ? data : [data];

  const calculateAverages = (runs) => {
    if (!runs || runs.length === 0) return { coverage: 0, testPass: 0, buildSuccess: 0 };

    const totals = runs.reduce((acc, run) => {
      acc.coverage += run.metrics?.coverage?.overall || 0;
      acc.testPass += run.metrics?.tests?.passRate || 0;
      acc.buildSuccess += run.status === 'success' ? 1 : 0;
      acc.count++;
      return acc;
    }, { coverage: 0, testPass: 0, buildSuccess: 0, count: 0 });

    return {
      coverage: (totals.coverage / totals.count).toFixed(1),
      testPass: (totals.testPass / totals.count).toFixed(1),
      buildSuccess: ((totals.buildSuccess / totals.count) * 100).toFixed(1)
    };
  };

  const repoSummaries = repositories.map(repo => {
    const averages = calculateAverages(repo.runs);
    return `
      <div class="repository">
        <h2>${repo.repo || 'Unknown Repository'}</h2>
        <div class="metrics-grid">
          <div class="metric">
            <span class="label">Average Coverage</span>
            <span class="value">${averages.coverage}%</span>
          </div>
          <div class="metric">
            <span class="label">Test Pass Rate</span>
            <span class="value">${averages.testPass}%</span>
          </div>
          <div class="metric">
            <span class="label">Build Success Rate</span>
            <span class="value">${averages.buildSuccess}%</span>
          </div>
          <div class="metric">
            <span class="label">Total Runs</span>
            <span class="value">${repo.runs?.length || 0}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Trinity Dashboard Metrics Report</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background: #f5f5f5;
        }
        h1 {
          color: #1e40af;
          border-bottom: 3px solid #1e40af;
          padding-bottom: 10px;
        }
        h2 {
          color: #374151;
          margin-top: 30px;
        }
        .header {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .repository {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 15px;
        }
        .metric {
          background: #f9fafb;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #1e40af;
        }
        .metric .label {
          display: block;
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .metric .value {
          display: block;
          font-size: 24px;
          font-weight: bold;
          color: #111827;
          margin-top: 5px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Trinity Dashboard Metrics Report</h1>
        <p><strong>Generated:</strong> ${reportDate}</p>
        <p><strong>Total Repositories:</strong> ${repositories.length}</p>
      </div>
      ${repoSummaries}
      <div class="footer">
        <p>Report generated by Trinity Dashboard</p>
        <p>© ${new Date().getFullYear()} Trinity Method</p>
      </div>
    </body>
    </html>
  `;
}

function escapeCSV(value) {
  if (value === null || value === undefined) {
    return '""';
  }

  const stringValue = String(value);

  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function downloadFile(content, filename, mimeType) {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 100);

    const exportCount = parseInt(localStorage.getItem('export_count') || '0');
    localStorage.setItem('export_count', (exportCount + 1).toString());
    localStorage.setItem('last_export', new Date().toISOString());

    return true;
  } catch (error) {
    console.error('Error downloading file:', error);
    return false;
  }
}

export function parseImportedData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;

      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(content);
          resolve(parsed.data || parsed);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      } else if (file.name.endsWith('.csv')) {
        try {
          const parsed = parseCSV(content);
          resolve(parsed);
        } catch (error) {
          reject(new Error('Invalid CSV file'));
        }
      } else {
        reject(new Error('Unsupported file format. Please use JSON or CSV.'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file is empty or invalid');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].match(/(".*?"|[^,]+)/g) || [];
    const row = {};

    headers.forEach((header, index) => {
      let value = values[index] || '';
      value = value.replace(/^"(.*)"$/, '$1').replace(/""/g, '"');
      row[header] = value;
    });

    data.push(row);
  }

  return data;
}

export default {
  exportToCSV,
  exportToJSON,
  exportMetricsReport,
  parseImportedData
};