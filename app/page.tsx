'use client';

import { useState } from 'react';
import UrlForm from './components/UrlForm';
import ResultsDisplay from './components/ResultsDisplay';

interface ScrapingResult {
  url: string;
  title?: string;
  textContent?: string;
  error?: string;
  success: boolean;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScrapingResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (urls: string[]) => {
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape URLs');
      }

      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Web Scraper</h1>
          <p className="text-lg text-gray-600">
            Enter one or more URLs to scrape content from websites
          </p>
        </div>

        <div className="bg-black p-6 rounded-lg shadow-md">
          <UrlForm onSubmit={handleSubmit} isLoading={isLoading} />
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {isLoading && (
            <div className="mt-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {!isLoading && results.length > 0 && (
            <ResultsDisplay results={results} />
          )}
        </div>
      </div>
    </main>
  );
}
