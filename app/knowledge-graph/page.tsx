'use client';

import { useState } from 'react';
import KnowledgeGraphForm from '../components/KnowledgeGraphForm';
import KnowledgeGraphDisplay from '../components/KnowledgeGraphDisplay';

interface ProfileInput {
  title: string;
  location: string;
  company: string;
  age?: number;
  additionalContext?: string[];
}

interface KnowledgeGraph {
  toolsUsed: {
    highProbability: string[];
    mediumProbability: string[];
    lowProbability: string[];
  };
  biggestPainPoints: {
    highProbability: string[];
    mediumProbability: string[];
    lowProbability: string[];
  };
  attributeRanges: {
    patternRecognition: string;
    associativeMemory: string;
    emotionalInfluence: string;
    heuristicProcessing: string;
    parallelProcessing: string;
    implicitLearning: string;
    reflexiveResponses: string;
    cognitiveBiases: string;
    logicalReasoning: string;
    abstractThinking: string;
    deliberativeDecisionMaking: string;
    sequentialProcessing: string;
    cognitiveControl: string;
    goalOrientedPlanning: string;
    metaCognition: string;
  };
  educationLevelAndLearning: string;
}

export default function KnowledgeGraphPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<KnowledgeGraph | null>(null);
  const [profileInfo, setProfileInfo] = useState<{title: string; company: string; location: string} | null>(null);

  const handleSubmit = async (data: ProfileInput) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/knowledge-graph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to generate knowledge graph');
      }

      setResult(responseData.knowledgeGraph);
      setProfileInfo({
        title: data.title,
        company: data.company,
        location: data.location,
      });
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">B2B Knowledge Graph Generator</h1>
          <p className="text-lg text-gray-600">
            Generate a structured knowledge graph JSON for professional individuals in a B2B setting
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <KnowledgeGraphForm onSubmit={handleSubmit} isLoading={isLoading} />
          
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
        </div>
        
        {result && profileInfo && (
          <KnowledgeGraphDisplay data={result} profileInfo={profileInfo} />
        )}
      </div>
    </main>
  );
} 