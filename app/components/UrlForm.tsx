'use client';

import { useState } from 'react';

interface UrlFormProps {
  onSubmit: (urls: string[]) => void;
  isLoading: boolean;
}

export default function UrlForm({ onSubmit, isLoading }: UrlFormProps) {
  const [urls, setUrls] = useState<string[]>(['']);

  const handleAddUrl = () => {
    setUrls([...urls, '']);
  };

  const handleRemoveUrl = (index: number) => {
    if (urls.length > 1) {
      const newUrls = [...urls];
      newUrls.splice(index, 1);
      setUrls(newUrls);
    }
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty URLs
    const filteredUrls = urls.filter(url => url.trim() !== '');
    if (filteredUrls.length > 0) {
      onSubmit(filteredUrls);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        {urls.map((url, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(index, e.target.value)}
              placeholder="Enter URL (e.g., https://example.com)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => handleRemoveUrl(index)}
              disabled={urls.length === 1}
              className="p-2 text-red-500 hover:text-red-700 disabled:text-gray-400"
              aria-label="Remove URL"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={handleAddUrl}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Another URL
        </button>
        
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
        >
          {isLoading ? 'Scraping...' : 'Start Scraping'}
        </button>
      </div>
    </form>
  );
} 