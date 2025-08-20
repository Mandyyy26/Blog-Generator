import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface ErrorPanelProps {
  error: string;
  details?: {
    status?: number;
    statusText?: string;
    body?: string;
  };
  onRetry: () => void;
  retryCount: number;
  maxRetries: number;
}

export function ErrorPanel({ 
  error, 
  details, 
  onRetry, 
  retryCount, 
  maxRetries 
}: ErrorPanelProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            {error}
          </h3>
          {details && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              <span className="ml-1">View details</span>
            </button>
          )}
          {showDetails && details && (
            <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/40 rounded border border-red-200 dark:border-red-700">
              {details.status && (
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>Status:</strong> {details.status} {details.statusText}
                </p>
              )}
              {details.body && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Response:</p>
                  <pre className="text-xs text-red-600 dark:text-red-400 mt-1 whitespace-pre-wrap break-words">
                    {details.body}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
        {retryCount < maxRetries && (
          <button
            onClick={onRetry}
            className="ml-4 flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
          >
            <RefreshCw size={14} className="mr-1" />
            Retry ({maxRetries - retryCount} left)
          </button>
        )}
      </div>
    </div>
  );
}