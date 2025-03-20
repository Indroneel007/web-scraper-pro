'use client';

interface ScrapingResult {
  url: string;
  title?: string;
  textContent?: string;
  error?: string;
  success: boolean;
}

interface ResultsDisplayProps {
  results: ScrapingResult[];
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Scraping Results</h2>
      
      <div className="space-y-6">
        {results.map((result, index) => (
          <div 
            key={index} 
            className={`p-6 rounded-lg shadow-md ${
              result.success ? 'bg-white border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {result.url}
              </h3>
              <span 
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {result.success ? 'Success' : 'Failed'}
              </span>
            </div>
            
            {result.success ? (
              <>
                {result.title && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-500">Page Title:</h4>
                    <p className="text-gray-800">{result.title}</p>
                  </div>
                )}
                
                {result.textContent && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Content Preview:</h4>
                    <div className="mt-1 p-3 bg-gray-50 rounded text-sm text-gray-700 max-h-60 overflow-y-auto">
                      {result.textContent}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-red-600">
                <h4 className="text-sm font-medium text-red-500">Error:</h4>
                <p>{result.error || 'Unknown error occurred'}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 