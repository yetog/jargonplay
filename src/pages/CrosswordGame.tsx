import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Clock, Target, Lightbulb } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useGameStore } from '../store/gameStore';
import { generateCrossword, validateCrosswordSolution, type CrosswordGrid, type CrosswordClue } from '../utils/crosswordGenerator';

export function CrosswordGame() {
  const navigate = useNavigate();
  const { currentSession, completeSession } = useGameStore();
  const [grid, setGrid] = useState<CrosswordGrid | null>(null);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [selectedClue, setSelectedClue] = useState<CrosswordClue | null>(null);
  const [startTime] = useState(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [completedWords, setCompletedWords] = useState<Set<string>>(new Set());
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  // Generate grid on mount
  useEffect(() => {
    if (currentSession && currentSession.type === 'crossword') {
      const wordDefs = currentSession.words.map(w => ({
        word: w.word,
        definition: w.definition || 'No definition provided'
      }));
      const generatedGrid = generateCrossword(wordDefs, 15);
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

  // Check completion
  useEffect(() => {
    if (grid && validateCrosswordSolution(grid.grid, grid.clues)) {
      const score = Math.max(1500 - timeElapsed, 200);
      completeSession(score);
    }
  }, [grid, timeElapsed, completeSession]);

  // Initialize input refs
  useEffect(() => {
    if (grid) {
      inputRefs.current = Array(grid.size).fill(null).map(() => Array(grid.size).fill(null));
    }
  }, [grid]);

  const handleCellClick = (row: number, col: number) => {
    if (!grid || grid.grid[row][col].isBlocked) return;
    
    setSelectedCell([row, col]);
    
    // Find clue that starts at this cell
    const clue = grid.clues.find(c => c.startX === row && c.startY === col);
    if (clue) {
      setSelectedClue(clue);
    }
    
    // Focus the input
    if (inputRefs.current[row][col]) {
      inputRefs.current[row][col]?.focus();
    }
  };

  const handleClueClick = (clue: CrosswordClue) => {
    setSelectedClue(clue);
    setSelectedCell([clue.startX, clue.startY]);
    
    // Focus the first cell of the clue
    if (inputRefs.current[clue.startX][clue.startY]) {
      inputRefs.current[clue.startX][clue.startY]?.focus();
    }
  };

  const handleInputChange = (row: number, col: number, value: string) => {
    if (!grid) return;
    
    const newGrid = { ...grid };
    newGrid.grid[row][col] = {
      ...newGrid.grid[row][col],
      userInput: value.toUpperCase(),
    };
    setGrid(newGrid);
    
    // Check if any words are completed
    const newCompletedWords = new Set<string>();
    for (const clue of grid.clues) {
      let isComplete = true;
      const dx = clue.direction === 'across' ? 0 : 1;
      const dy = clue.direction === 'across' ? 1 : 0;
      
      for (let i = 0; i < clue.length; i++) {
        const x = clue.startX + i * dx;
        const y = clue.startY + i * dy;
        const cell = newGrid.grid[x][y];
        
        if (!cell.userInput || cell.userInput !== clue.answer[i]) {
          isComplete = false;
          break;
        }
      }
      
      if (isComplete) {
        newCompletedWords.add(clue.answer);
      }
    }
    setCompletedWords(newCompletedWords);
    
    // Auto-move to next cell if current is filled
    if (value && selectedClue) {
      const dx = selectedClue.direction === 'across' ? 0 : 1;
      const dy = selectedClue.direction === 'across' ? 1 : 0;
      const nextX = row + dx;
      const nextY = col + dy;
      
      if (nextX < grid.size && nextY < grid.size && !grid.grid[nextX][nextY].isBlocked) {
        setTimeout(() => {
          if (inputRefs.current[nextX][nextY]) {
            inputRefs.current[nextX][nextY]?.focus();
          }
        }, 50);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (!grid || !selectedClue) return;
    
    const dx = selectedClue.direction === 'across' ? 0 : 1;
    const dy = selectedClue.direction === 'across' ? 1 : 0;
    
    if (e.key === 'Backspace' && !grid.grid[row][col].userInput) {
      // Move to previous cell
      const prevX = row - dx;
      const prevY = col - dy;
      
      if (prevX >= 0 && prevY >= 0 && !grid.grid[prevX][prevY].isBlocked) {
        setTimeout(() => {
          if (inputRefs.current[prevX][prevY]) {
            inputRefs.current[prevX][prevY]?.focus();
          }
        }, 50);
      }
    }
  };

  const isClueCompleted = (clue: CrosswordClue) => {
    return completedWords.has(clue.answer);
  };

  const isCellInSelectedClue = (row: number, col: number) => {
    if (!selectedClue) return false;
    
    const dx = selectedClue.direction === 'across' ? 0 : 1;
    const dy = selectedClue.direction === 'across' ? 1 : 0;
    
    for (let i = 0; i < selectedClue.length; i++) {
      const x = selectedClue.startX + i * dx;
      const y = selectedClue.startY + i * dy;
      
      if (x === row && y === col) return true;
    }
    
    return false;
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

  const acrossClues = grid.clues.filter(c => c.direction === 'across');
  const downClues = grid.clues.filter(c => c.direction === 'down');
  const isCompleted = validateCrosswordSolution(grid.grid, grid.clues);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          icon={ArrowLeft}
          className="mb-4"
        >
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold text-white mb-2">Crossword Puzzle</h1>
        <p className="text-gray-300">Fill in the grid using the clues provided</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Game Grid */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Crossword Grid</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(timeElapsed)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>{completedWords.size}/{grid.clues.length}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-0.5 mx-auto" style={{ gridTemplateColumns: `repeat(${grid.size}, 1fr)`, maxWidth: '600px' }}>
              {grid.grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      aspect-square relative border
                      ${cell.isBlocked
                        ? 'bg-gray-900'
                        : selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex
                        ? 'bg-primary-500/50 border-primary-400'
                        : isCellInSelectedClue(rowIndex, colIndex)
                        ? 'bg-primary-500/20 border-primary-400/50'
                        : 'bg-gray-700 border-gray-600'
                      }
                      ${!cell.isBlocked ? 'cursor-pointer hover:bg-gray-600' : ''}
                    `}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {!cell.isBlocked && (
                      <>
                        {cell.number && (
                          <div className="absolute top-0 left-0 text-xs text-primary-400 font-bold p-0.5">
                            {cell.number}
                          </div>
                        )}
                        <input
                          ref={(el) => {
                            if (inputRefs.current[rowIndex]) {
                              inputRefs.current[rowIndex][colIndex] = el;
                            }
                          }}
                          type="text"
                          maxLength={1}
                          value={cell.userInput || ''}
                          onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                          className="w-full h-full text-center text-white bg-transparent border-none outline-none text-sm font-bold"
                          style={{ caretColor: 'transparent' }}
                        />
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Clues Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Completed</span>
                <span className="text-white font-semibold">{completedWords.size}/{grid.clues.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Time</span>
                <span className="text-white font-semibold">{formatTime(timeElapsed)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedWords.size / grid.clues.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </Card>

          {/* Selected Clue */}
          {selectedClue && (
            <Card className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-primary-500/20">
              <div className="flex items-start space-x-2">
                <Lightbulb className="h-5 w-5 text-primary-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-primary-400 mb-1">
                    {selectedClue.number} {selectedClue.direction}
                  </div>
                  <div className="text-white text-sm">{selectedClue.clue}</div>
                </div>
              </div>
            </Card>
          )}

          {/* Clues */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Clues</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Across Clues */}
              {acrossClues.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Across</h4>
                  <div className="space-y-2">
                    {acrossClues.map((clue) => (
                      <div
                        key={`across-${clue.number}`}
                        className={`
                          p-2 rounded-lg cursor-pointer transition-all duration-200 text-sm
                          ${selectedClue === clue
                            ? 'bg-primary-500/20 border border-primary-500/50'
                            : isClueCompleted(clue)
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-gray-700 hover:bg-gray-600'
                          }
                        `}
                        onClick={() => handleClueClick(clue)}
                      >
                        <div className="font-medium text-white mb-1">
                          {clue.number}. {clue.clue}
                        </div>
                        {isClueCompleted(clue) && (
                          <div className="text-xs text-green-400">✓ {clue.answer}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Down Clues */}
              {downClues.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Down</h4>
                  <div className="space-y-2">
                    {downClues.map((clue) => (
                      <div
                        key={`down-${clue.number}`}
                        className={`
                          p-2 rounded-lg cursor-pointer transition-all duration-200 text-sm
                          ${selectedClue === clue
                            ? 'bg-primary-500/20 border border-primary-500/50'
                            : isClueCompleted(clue)
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-gray-700 hover:bg-gray-600'
                          }
                        `}
                        onClick={() => handleClueClick(clue)}
                      >
                        <div className="font-medium text-white mb-1">
                          {clue.number}. {clue.clue}
                        </div>
                        {isClueCompleted(clue) && (
                          <div className="text-xs text-green-400">✓ {clue.answer}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Completion */}
          {isCompleted && (
            <Card className="bg-gradient-to-r from-green-500/20 to-primary-500/20 border-green-500/20">
              <div className="text-center">
                <Trophy className="h-12 w-12 text-primary-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Excellent Work!</h3>
                <p className="text-gray-300 text-sm mb-4">
                  You completed the crossword in {formatTime(timeElapsed)}!
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