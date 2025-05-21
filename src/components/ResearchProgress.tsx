import { FC, useState, useEffect } from 'react';
import { ResearchProgress as ProgressType } from '../api/research';
import useResearchProgress from '../hooks/useResearchProgress';

interface ResearchProgressProps {
  apiBaseUrl: string;
  sessionId: string;
}

const formatTime = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const ResearchProgress: FC<ResearchProgressProps> = ({ apiBaseUrl, sessionId }) => {
  const { progress, error, isLoading, isWebSocketConnected, reconnect } = useResearchProgress({
    apiBaseUrl,
    sessionId,
  });
  
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (progress && !progress.complete) {
      interval = setInterval(() => {
        const elapsed = Date.now() - progress.start_time;
        setElapsedTime(elapsed);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [progress]);
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-lg font-medium text-red-800">Error</h2>
        <p className="text-red-700">{error}</p>
        <button 
          onClick={reconnect}
          className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (isLoading && !progress) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
        <div className="flex items-center">
          <div className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></div>
          <span className="ml-2">Loading research progress...</span>
        </div>
      </div>
    );
  }
  
  if (!progress) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
        <p>No progress data available.</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-md shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Research Progress</h2>
        <div className="text-sm text-gray-500">
          <span className={isWebSocketConnected ? 'text-green-500' : 'text-amber-500'}>
            {isWebSocketConnected ? 'Live Updates' : 'Polling Updates'}
          </span>
          <span className="mx-2">|</span>
          <span>Elapsed: {formatTime(elapsedTime)}</span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-4 bg-gray-200 rounded-full mb-4">
        <div 
          className="h-4 bg-blue-600 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progress.percentage}%` }}
        ></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current step */}
        <div className="bg-blue-50 p-3 rounded-md">
          <h3 className="font-medium text-blue-900">Current Step</h3>
          <p className="text-blue-800">
            {progress.step} ({progress.step_number} of {progress.total_steps})
          </p>
          <p className="text-sm text-blue-700">
            {progress.status}
          </p>
        </div>
        
        {/* Search activity */}
        <div className="bg-purple-50 p-3 rounded-md">
          <h3 className="font-medium text-purple-900">Search Activity</h3>
          <p className="text-purple-800">
            {progress.search_queries.length} queries made
          </p>
          {progress.search_queries.length > 0 && (
            <p className="text-sm text-purple-700 truncate">
              Latest: {progress.search_queries[progress.search_queries.length - 1]}
            </p>
          )}
        </div>
        
        {/* Sources found */}
        <div className="bg-green-50 p-3 rounded-md">
          <h3 className="font-medium text-green-900">Sources</h3>
          <p className="text-green-800">
            {progress.sources.length} sources found
          </p>
        </div>
      </div>
      
      {/* Recent searches and sources */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent searches */}
        <div>
          <h3 className="text-lg font-medium mb-2">Recent Searches</h3>
          <div className="max-h-40 overflow-y-auto bg-gray-50 rounded p-2">
            {progress.search_queries.slice(-5).reverse().map((query, idx) => (
              <div key={idx} className="mb-1 p-1 bg-white rounded text-sm">
                {query}
              </div>
            ))}
            {progress.search_queries.length === 0 && (
              <p className="text-gray-500 text-sm">No searches yet</p>
            )}
          </div>
        </div>
        
        {/* Recent sources */}
        <div>
          <h3 className="text-lg font-medium mb-2">Recent Sources</h3>
          <div className="max-h-40 overflow-y-auto bg-gray-50 rounded p-2">
            {progress.sources.slice(-5).reverse().map((source, idx) => (
              <div key={idx} className="mb-1 p-1 bg-white rounded text-sm">
                {source.url ? (
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {source.text}
                  </a>
                ) : (
                  <span>{source.text}</span>
                )}
              </div>
            ))}
            {progress.sources.length === 0 && (
              <p className="text-gray-500 text-sm">No sources found yet</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Status updates */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Research Updates</h3>
        <div className="max-h-60 overflow-y-auto bg-gray-50 rounded p-2">
          {progress.status_updates.slice().reverse().map((update, idx) => (
            <div key={idx} className="mb-1 p-2 bg-white rounded text-sm">
              {update}
            </div>
          ))}
          {progress.status_updates.length === 0 && (
            <p className="text-gray-500 text-sm">No updates yet</p>
          )}
        </div>
      </div>
      
      {/* Completion status */}
      {progress.complete && (
        <div className="mt-4 p-3 bg-green-100 rounded-md text-center">
          <p className="text-green-800 font-medium">Research complete!</p>
        </div>
      )}
    </div>
  );
};

export default ResearchProgress; 