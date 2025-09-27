const MetricDisplay = ({ value, label, format = 'default', suffix = '', className = '' }) => {
  // Loading state (value is undefined)
  if (value === undefined) {
    return (
      <span className={`text-gray-500 ${className}`}>
        Loading...
      </span>
    );
  }

  // No data state (value is null)
  if (value === null) {
    return (
      <span className={`text-gray-400 ${className}`}>
        {label ? `No ${label.toLowerCase()} data` : 'No data'}
      </span>
    );
  }

  // Error state (value is an Error object)
  if (value instanceof Error) {
    return (
      <span className={`text-red-400 ${className}`}>
        Error
      </span>
    );
  }

  // Format the value based on format type
  let formattedValue = value;

  switch (format) {
    case 'percentage':
      formattedValue = typeof value === 'number' ? `${value.toFixed(1)}%` : value;
      break;
    case 'number':
      formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
      break;
    case 'decimal':
      formattedValue = typeof value === 'number' ? value.toFixed(2) : value;
      break;
    default:
      formattedValue = value;
  }

  return (
    <span className={className}>
      {formattedValue}{suffix}
    </span>
  );
};

export default MetricDisplay;