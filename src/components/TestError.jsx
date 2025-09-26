import { useState } from 'react';
import { AlertCircle, Zap, Bug, Database } from 'lucide-react';

function TestError() {
  const [errorType, setErrorType] = useState('');

  const triggerError = (type) => {
    setErrorType(type);

    switch (type) {
      case 'render':
        // This will cause a render error
        throw new Error('Test render error triggered!');

      case 'async':
        // This will cause an unhandled promise rejection
        setTimeout(() => {
          Promise.reject(new Error('Test async error triggered!'));
        }, 100);
        break;

      case 'null':
        // This will cause a null reference error
        const obj = null;
        console.log(obj.property);
        break;

      case 'infinite':
        // This will cause infinite recursion
        const infiniteLoop = () => infiniteLoop();
        infiniteLoop();
        break;

      default:
        console.log('Unknown error type');
    }
  };

  return (
    <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
      <div className="flex items-center mb-4">
        <AlertCircle className="w-6 h-6 text-yellow-600 mr-2" />
        <h2 className="text-xl font-bold text-yellow-800">Error Testing Panel</h2>
      </div>

      <p className="text-yellow-700 mb-4">
        Use these buttons to test the error boundary. Only use in development!
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => triggerError('render')}
          className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded
                   hover:bg-red-600 transition-colors"
        >
          <Bug className="w-4 h-4 mr-2" />
          Render Error
        </button>

        <button
          onClick={() => triggerError('async')}
          className="flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded
                   hover:bg-orange-600 transition-colors"
        >
          <Zap className="w-4 h-4 mr-2" />
          Async Error
        </button>

        <button
          onClick={() => triggerError('null')}
          className="flex items-center justify-center px-4 py-2 bg-purple-500 text-white rounded
                   hover:bg-purple-600 transition-colors"
        >
          <Database className="w-4 h-4 mr-2" />
          Null Reference
        </button>

        <button
          onClick={() => triggerError('infinite')}
          className="flex items-center justify-center px-4 py-2 bg-pink-500 text-white rounded
                   hover:bg-pink-600 transition-colors"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          Stack Overflow
        </button>
      </div>

      {errorType && (
        <div className="mt-4 p-3 bg-yellow-100 rounded">
          <p className="text-sm text-yellow-800">
            Last triggered: {errorType} error
          </p>
        </div>
      )}
    </div>
  );
}

export default TestError;