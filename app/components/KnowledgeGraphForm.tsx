'use client';

import { useState } from 'react';

interface KnowledgeGraphFormProps {
  onSubmit: (data: ProfileInput) => void;
  isLoading: boolean;
}

interface ProfileInput {
  title: string;
  location: string;
  company: string;
  age?: number;
  additionalContext?: string[];
}

export default function KnowledgeGraphForm({ onSubmit, isLoading }: KnowledgeGraphFormProps) {
  const [formData, setFormData] = useState<ProfileInput>({
    title: '',
    location: '',
    company: '',
    age: undefined,
    additionalContext: ['']
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAdditionalContextChange = (index: number, value: string) => {
    const newContexts = [...(formData.additionalContext || [''])];
    newContexts[index] = value;
    setFormData({
      ...formData,
      additionalContext: newContexts
    });
  };

  const addAdditionalContext = () => {
    setFormData({
      ...formData,
      additionalContext: [...(formData.additionalContext || ['']), '']
    });
  };

  const removeAdditionalContext = (index: number) => {
    const newContexts = [...(formData.additionalContext || [''])];
    if (newContexts.length > 1) {
      newContexts.splice(index, 1);
      setFormData({
        ...formData,
        additionalContext: newContexts
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty additional context
    const filteredContext = formData.additionalContext?.filter(ctx => ctx.trim() !== '') || [];
    
    onSubmit({
      ...formData,
      additionalContext: filteredContext.length > 0 ? filteredContext : undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Professional Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Senior Product Manager"
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="location"
          name="location"
          required
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g., San Francisco, CA"
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700">
          Company <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="company"
          name="company"
          required
          value={formData.company}
          onChange={handleChange}
          placeholder="e.g., Google"
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700">
          Age (Optional)
        </label>
        <input
          type="number"
          id="age"
          name="age"
          value={formData.age || ''}
          onChange={handleChange}
          placeholder="e.g., 35"
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Context (Optional)
        </label>
        <div className="space-y-2">
          {formData.additionalContext?.map((context, index) => (
            <div key={index} className="flex items-center space-x-2">
              <textarea
                value={context}
                onChange={(e) => handleAdditionalContextChange(index, e.target.value)}
                placeholder="e.g., LinkedIn profile URL, relevant information"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                rows={2}
              />
              <button
                type="button"
                onClick={() => removeAdditionalContext(index)}
                disabled={(formData.additionalContext?.length || 0) <= 1}
                className="p-2 text-red-500 hover:text-red-700 disabled:text-gray-400"
                aria-label="Remove context"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addAdditionalContext}
          className="mt-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Additional Context
        </button>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
        >
          {isLoading ? 'Generating Knowledge Graph...' : 'Generate Knowledge Graph'}
        </button>
      </div>
    </form>
  );
} 