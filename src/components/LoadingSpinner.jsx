const LoadingSpinner = ({ message = "Loading dashboard data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-trinity-darker">
      <div className="relative">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-trinity-blue"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-20 w-20 rounded-full border-t-2 border-trinity-green animate-spin"
               style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </div>
      <p className="mt-8 text-trinity-blue text-lg font-medium animate-pulse">{message}</p>
      <div className="mt-4 flex space-x-2">
        <div className="w-2 h-2 bg-trinity-blue rounded-full animate-bounce"
             style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-trinity-green rounded-full animate-bounce"
             style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-trinity-yellow rounded-full animate-bounce"
             style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;