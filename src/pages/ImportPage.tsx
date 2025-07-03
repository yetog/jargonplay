import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, FileText, Play, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { AIGeneratorModal } from '../components/AIGeneratorModal';
import { useGameStore } from '../store/gameStore';
import { aiService } from '../services/aiService';
import type { WordItem } from '../store/gameStore';

export function ImportPage() {
  const { type } = useParams<{ type: 'wordsearch' | 'crossword' }>();
  const navigate = useNavigate();
  const { createSession } = useGameStore();
  
  const [inputText, setInputText] = useState('');
  const [parsedWords, setParsedWords] = useState<WordItem[]>([]);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'import' | 'sample' | 'ai'>('import');
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const sampleWords = {
    wordsearch: [
      { word: 'ALGORITHM' },
      { word: 'BLOCKCHAIN' },
      { word: 'CYBERSECURITY' },
      { word: 'DATABASE' },
      { word: 'ENCRYPTION' },
      { word: 'FRAMEWORK' },
      { word: 'GRAPHQL' },
      { word: 'HASH' },
      { word: 'INTERFACE' },
      { word: 'JAVASCRIPT' },
    ],
    crossword: [
      { word: 'ALGORITHM', definition: 'Step-by-step procedure for solving a problem' },
      { word: 'BLOCKCHAIN', definition: 'Distributed ledger technology' },
      { word: 'CYBERSECURITY', definition: 'Protection of digital information' },
      { word: 'DATABASE', definition: 'Organized collection of data' },
      { word: 'ENCRYPTION', definition: 'Process of encoding information' },
      { word: 'FRAMEWORK', definition: 'Reusable software platform' },
      { word: 'GRAPHQL', definition: 'Query language for APIs' },
      { word: 'HASH', definition: 'Function that maps data to fixed-size values' },
    ],
  };

  const parseInput = (text: string) => {
    setError('');
    
    if (!text.trim()) {
      setError('Please enter some content');
      return;
    }

    try {
      if (type === 'wordsearch') {
        // Parse word list (one word per line or comma-separated)
        const words = text
          .split(/[\n,]/)
          .map(word => word.trim())
          .filter(word => word.length > 0)
          .map(word => ({ word }));

        if (words.length < 5) {
          setError('Please provide at least 5 words');
          return;
        }
        if (words.length > 50) {
          setError('Maximum 50 words allowed');
          return;
        }

        setParsedWords(words);
      } else {
        // Parse word-definition pairs
        const lines = text.split('\n').filter(line => line.trim());
        const words: WordItem[] = [];

        for (const line of lines) {
          if (line.includes(':')) {
            const [word, definition] = line.split(':').map(s => s.trim());
            if (word && definition) {
              words.push({ word, definition });
            }
          } else if (line.startsWith('{') && line.endsWith('}')) {
            try {
              const parsed = JSON.parse(line);
              if (typeof parsed === 'object' && parsed.word && parsed.definition) {
                words.push({ word: parsed.word, definition: parsed.definition });
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }

        if (words.length < 3) {
          setError('Please provide at least 3 word-definition pairs');
          return;
        }

        setParsedWords(words);
      }
    } catch (e) {
      setError('Invalid format. Please check your input.');
    }
  };

  const handleStartGame = () => {
    const words = mode === 'sample' ? sampleWords[type!] : parsedWords;
    if (words.length === 0) {
      setError('No words to use for the game');
      return;
    }

    createSession(type!, words);
    navigate(`/game/${type}`);
  };

  const useSampleData = () => {
    setMode('sample');
    setParsedWords(sampleWords[type!]);
    setError('');
  };

  const handleAIGenerate = async (topic: string) => {
    setAiLoading(true);
    setAiError(null);
    
    try {
      const response = await aiService.generatePuzzle({
        type: type!,
        topic
      });

      if (type === 'wordsearch') {
        const wordSearchResponse = response as { words: string[] };
        const words = wordSearchResponse.words.map(word => ({ word }));
        setParsedWords(words);
      } else {
        const crosswordResponse = response as { words: Array<{ word: string; definition: string }> };
        setParsedWords(crosswordResponse.words);
      }

      setMode('ai');
      setError('');
      setShowAIModal(false);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to generate puzzle');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          icon={ArrowLeft}
          className="mb-4"
        >
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold text-white mb-2">
          Setup {type === 'wordsearch' ? 'Word Search' : 'Crossword Puzzle'}
        </h1>
        <p className="text-gray-300">
          {type === 'wordsearch'
            ? 'Import a list of words to hide in the puzzle grid'
            : 'Import word-definition pairs to create crossword clues'}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Import Your Content</h2>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIModal(true)}
                icon={Sparkles}
                className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-primary-500/30 hover:border-primary-500/50"
              >
                AI Generate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={useSampleData}
                icon={FileText}
              >
                Use Sample
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {type === 'wordsearch' ? 'Word List' : 'Word-Definition Pairs'}
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-48 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder={
                  type === 'wordsearch'
                    ? 'Enter words (one per line or comma-separated):\n\nALGORITHM\nBLOCKCHAIN\nCYBERSECURITY\n...'
                    : 'Enter word-definition pairs:\n\nALGORITHM: Step-by-step procedure for solving a problem\nBLOCKCHAIN: Distributed ledger technology\n...'
                }
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={() => parseInput(inputText)}
                icon={Upload}
                className="flex-1"
              >
                Parse Input
              </Button>
              {parsedWords.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={handleStartGame}
                  icon={Play}
                  className="flex-1"
                >
                  Start Game
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Preview Section */}
        <Card>
          <h2 className="text-xl font-semibold text-white mb-4">Preview</h2>
          
          {parsedWords.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {parsedWords.length} {parsedWords.length === 1 ? 'word' : 'words'} ready
                </span>
                <div className="flex space-x-2">
                  {mode === 'sample' && (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                      Sample Data
                    </span>
                  )}
                  {mode === 'ai' && (
                    <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded">
                      AI Generated
                    </span>
                  )}
                </div>
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                {parsedWords.map((item, index) => (
                  <div key={index} className="bg-gray-900/50 rounded-lg p-3">
                    <div className="font-medium text-white">{item.word}</div>
                    {item.definition && (
                      <div className="text-sm text-gray-400 mt-1">{item.definition}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No content imported yet</p>
              <p className="text-sm">
                {type === 'wordsearch'
                  ? 'Add words to see them here'
                  : 'Add word-definition pairs to see them here'}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Format Help */}
      <Card className="mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">Format Guide</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Word Search Format</h4>
            <pre className="text-sm text-gray-400 bg-gray-900 rounded p-3 overflow-x-auto">
              {`ALGORITHM
BLOCKCHAIN
CYBERSECURITY

or

ALGORITHM, BLOCKCHAIN, CYBERSECURITY`}
            </pre>
          </div>
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Crossword Format</h4>
            <pre className="text-sm text-gray-400 bg-gray-900 rounded p-3 overflow-x-auto">
              {`ALGORITHM: Step-by-step procedure
BLOCKCHAIN: Distributed ledger
CYBERSECURITY: Digital protection

or

{"word": "ALGORITHM", "definition": "Step-by-step procedure"}`}
            </pre>
          </div>
        </div>
      </Card>

      {/* AI Generator Modal */}
      <AIGeneratorModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        puzzleType={type!}
        onGenerate={handleAIGenerate}
        isLoading={aiLoading}
        error={aiError}
      />
    </div>
  );
}