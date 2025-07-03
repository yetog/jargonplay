import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Clock, Target } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useGameStore } from '../store/gameStore';
import { generateWordSearch, type WordSearchGrid } from '../utils/wordSearchGenerator';

export function WordSearchGame() {
  const navigate = useNavigate();
  const { currentSession, completeSession } = useGameStore();
  const [grid, setGrid] = useState<WordSearchGrid | null>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<[number, number] | null>(null);
  const [startTime] = useState(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Generate grid on mount
  useEffect(() => {
    if (currentSession && currentSession.type === 'wordsearch') {
      const words = currentSession.words.map(w => w.word);
      const generatedGrid = generateWordSearch(words, 15);
      setGrid(generatedGrid);
    }
  }, [currentSession]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Check if game is complete
  useEffect(() => {
    if (grid && foundWords.size === grid.words.length) {
      const score = Math.max(1000 - timeElapsed, 100);
      completeSession(score);
    }
  }, [foundWords, grid, timeElapsed, completeSession]);

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const isCellInLine = (row: number, col: number, start: [number, number], end: [number, number]) => {
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;
    
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    
    // Check if point is within bounds
    if (row < minRow || row > maxRow || col < minCol || col > maxCol) {
      return false;
    }
    
    // Check if point is on the line
    if (startRow === endRow) {
      return row === startRow;
    } else if (startCol === endCol) {
      return col === startCol;
    } else {
      // Diagonal line
      const rowDiff = endRow - startRow;
      const colDiff = endCol - startCol;
      return (row - startRow) * colDiff === (col - startCol) * rowDiff;
    }
  };

  const handleMouseDown = (row: number, col: number) => {
    setIsSelecting(true);
    setSelectionStart([row, col]);
    setSelectedCells(new Set([getCellKey(row, col)]));
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isSelecting && selectionStart) {
      const newSelection = new Set<string>();
      const [startRow, startCol] = selectionStart;
      
      // Add all cells in the line from start to current position
      const rowDiff = row - startRow;
      const colDiff = col - startCol;
      
      if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
        const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
        const rowStep = steps === 0 ? 0 : rowDiff / steps;
        const colStep = steps === 0 ? 0 : colDiff / steps;
        
        for (let i = 0; i <= steps; i++) {
          const currentRow = startRow + Math.round(i * rowStep);
          const currentCol = startCol + Math.round(i * colStep);
          newSelection.add(getCellKey(currentRow, currentCol));
        }
      }
      
      setSelectedCells(newSelection);
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selectionStart && grid) {
      // Check if selection matches any word
      const selectedPositions = Array.from(selectedCells).map(key => {
        const [row, col] = key.split('-').map(Number);
        return { row, col };
      });
      
      // Build selected word
      const selectedWord = selectedPositions
        .sort((a, b) => {
          if (a.row === b.row) return a.col - b.col;
          return a.row - b.row;
        })
        .map(pos => grid.grid[pos.row][pos.col])
        .join('');
      
      // Check if it matches any word (forward or backward)
      const matchedWord = grid.words.find(word => 
        word.word === selectedWord || word.word === selectedWord.split('').reverse().join('')
      );
      
      if (matchedWord && !foundWords.has(matchedWord.word)) {
        setFoundWords(prev => new Set([...prev, matchedWord.word]));
      }
    }
    
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectedCells(new Set());
  };

  const isCellFound = (row: number, col: number) => {
    if (!grid) return false;
    
    return grid.words.some(word => {
      if (!foundWords.has(word.word)) return false;
      
      return isCellInLine(row, col, word.start, word.end);
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSession || !grid) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          icon={ArrowLeft}
          className="mb-4"
        >
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold text-white mb-2">Word Search</h1>
        <p className="text-gray-300">Find all the hidden words in the grid</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Game Grid */}
        <div className="lg:col-span-3">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Game Grid</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(timeElapsed)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>{foundWords.size}/{grid.words.length}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-15 gap-0.5 select-none" style={{ gridTemplateColumns: 'repeat(15, 1fr)' }}>
              {grid.grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={getCellKey(rowIndex, colIndex)}
                    className={`
                      aspect-square flex items-center justify-center text-sm font-mono font-bold cursor-pointer
                      transition-all duration-200
                      ${selectedCells.has(getCellKey(rowIndex, colIndex))
                        ? 'bg-primary-500 text-black'
                        : isCellFound(rowIndex, colIndex)
                        ? 'bg-green-500/30 text-green-300'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }
                    `}
                    onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                    onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                    onMouseUp={handleMouseUp}
                  >
                    {cell}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Found Words</span>
                <span className="text-white font-semibold">{foundWords.size}/{grid.words.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Time</span>
                <span className="text-white font-semibold">{formatTime(timeElapsed)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(foundWords.size / grid.words.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </Card>

          {/* Word List */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Words to Find</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {grid.words.map((word, index) => (
                <div
                  key={index}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${foundWords.has(word.word)
                      ? 'bg-green-500/20 text-green-300 line-through'
                      : 'bg-gray-700 text-gray-300'
                    }
                  `}
                >
                  {word.word}
                </div>
              ))}
            </div>
          </Card>

          {/* Completion */}
          {foundWords.size === grid.words.length && (
            <Card className="bg-gradient-to-r from-green-500/20 to-primary-500/20 border-green-500/20">
              <div className="text-center">
                <Trophy className="h-12 w-12 text-primary-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Congratulations!</h3>
                <p className="text-gray-300 text-sm mb-4">
                  You found all words in {formatTime(timeElapsed)}!
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  Play Again
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}