import React, { useState } from 'react';
import { X, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzleType: 'wordsearch' | 'crossword';
  onGenerate: (topic: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function AIGeneratorModal({
  isOpen,
  onClose,
  puzzleType,
  onGenerate,
  isLoading,
  error
}: AIGeneratorModalProps) {
  const [topic, setTopic] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      await onGenerate(topic.trim());
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTopic('');
      onClose();
    }
  };

  const exampleTopics = {
    wordsearch: [
      'Machine Learning',
      'Space Exploration',
      'Renewable Energy',
      'Cryptocurrency',
      'Medical Terms'
    ],
    crossword: [
      'Computer Science',
      'Biology Concepts',
      'Financial Terms',
      'Psychology',
      'Chemistry'
    ]
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              AI Puzzle Generator
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What topic would you like your {puzzleType === 'wordsearch' ? 'word search' : 'crossword'} to be about?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Machine Learning, Space Exploration..."
              disabled={isLoading}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-400 mb-2">Example topics:</p>
            <div className="flex flex-wrap gap-2">
              {exampleTopics[puzzleType].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setTopic(example)}
                  disabled={isLoading}
                  className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!topic.trim() || isLoading}
              className="flex-1"
              icon={isLoading ? Loader2 : Sparkles}
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </form>

        {isLoading && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI is creating your puzzle...</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}