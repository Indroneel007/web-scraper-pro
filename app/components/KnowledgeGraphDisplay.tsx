'use client';

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

interface KnowledgeGraphDisplayProps {
  data: KnowledgeGraph;
  profileInfo: {
    title: string;
    company: string;
    location: string;
  };
}

export default function KnowledgeGraphDisplay({ data, profileInfo }: KnowledgeGraphDisplayProps) {
  const { toolsUsed, biggestPainPoints, attributeRanges, educationLevelAndLearning } = data;
  
  const downloadJson = () => {
    // Create a JSON blob and download it
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-graph-${profileInfo.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Knowledge Graph: {profileInfo.title}</h2>
        <p className="text-gray-600">{profileInfo.company} • {profileInfo.location}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Tools Used Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tools Used</h3>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">90% Probability</h4>
            <div className="flex flex-wrap gap-2">
              {toolsUsed.highProbability.map((tool, i) => (
                <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {tool}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">70% Probability</h4>
            <div className="flex flex-wrap gap-2">
              {toolsUsed.mediumProbability.map((tool, i) => (
                <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {tool}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">50% Probability</h4>
            <div className="flex flex-wrap gap-2">
              {toolsUsed.lowProbability.map((tool, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Pain Points Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Biggest Pain Points</h3>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">90% Probability</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {biggestPainPoints.highProbability.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">70% Probability</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {biggestPainPoints.mediumProbability.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">50% Probability</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {biggestPainPoints.lowProbability.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Attribute Ranges Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Attribute Ranges</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(attributeRanges).map(([key, value]) => {
            // Convert camelCase to display format
            const displayKey = key.replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase());
            
            // Get appropriate color based on value
            let bgColor = 'bg-gray-100';
            let textColor = 'text-gray-800';
            
            if (value === 'High') {
              bgColor = 'bg-green-100';
              textColor = 'text-green-800';
            } else if (value === 'Medium') {
              bgColor = 'bg-blue-100';
              textColor = 'text-blue-800';
            } else if (value === 'Low') {
              bgColor = 'bg-yellow-100';
              textColor = 'text-yellow-800';
            }
            
            return (
              <div key={key} className={`p-3 rounded-md ${bgColor}`}>
                <div className="text-sm font-medium text-gray-500">{displayKey}</div>
                <div className={`text-lg font-semibold ${textColor}`}>{value}</div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Education and Learning Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Education Level & Learning Approach</h3>
        <div className="bg-gray-50 p-4 rounded-md text-gray-700">
          {educationLevelAndLearning}
        </div>
      </div>
      
      {/* Download Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={downloadJson}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Download JSON
        </button>
      </div>
    </div>
  );
} 