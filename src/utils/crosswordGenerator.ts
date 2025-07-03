export interface CrosswordCell {
  letter: string;
  number?: number;
  isBlocked: boolean;
  isStart?: boolean;
  userInput?: string;
}

export interface CrosswordClue {
  number: number;
  clue: string;
  answer: string;
  direction: 'across' | 'down';
  startX: number;
  startY: number;
  length: number;
}

export interface CrosswordGrid {
  grid: CrosswordCell[][];
  clues: CrosswordClue[];
  size: number;
}

export function generateCrossword(
  wordDefinitions: Array<{ word: string; definition: string }>,
  size: number = 15
): CrosswordGrid {
  const grid: CrosswordCell[][] = Array(size).fill(null).map(() =>
    Array(size).fill(null).map(() => ({
      letter: '',
      isBlocked: true,
      userInput: '',
    }))
  );

  const clues: CrosswordClue[] = [];
  const placedWords: Array<{
    word: string;
    x: number;
    y: number;
    direction: 'across' | 'down';
  }> = [];

  // Clean words
  const cleanWordDefs = wordDefinitions.map(({ word, definition }) => ({
    word: word.toUpperCase().replace(/[^A-Z]/g, ''),
    definition,
  }));

  // Sort by length (longer words first)
  cleanWordDefs.sort((a, b) => b.word.length - a.word.length);

  let clueNumber = 1;

  for (const { word, definition } of cleanWordDefs) {
    if (word.length > size) continue;

    let placed = false;
    let attempts = 0;
    const maxAttempts = 50;

    while (!placed && attempts < maxAttempts) {
      const direction = Math.random() < 0.5 ? 'across' : 'down';
      const maxX = direction === 'across' ? size - word.length : size - 1;
      const maxY = direction === 'down' ? size - word.length : size - 1;

      const startX = Math.floor(Math.random() * (maxX + 1));
      const startY = Math.floor(Math.random() * (maxY + 1));

      // Check if word can be placed
      let canPlace = true;
      const dx = direction === 'across' ? 1 : 0;
      const dy = direction === 'down' ? 1 : 0;

      // Check each cell
      for (let i = 0; i < word.length; i++) {
        const x = startX + i * dx;
        const y = startY + i * dy;

        if (x >= size || y >= size) {
          canPlace = false;
          break;
        }

        const cell = grid[x][y];
        if (!cell.isBlocked && cell.letter !== '' && cell.letter !== word[i]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        // Place the word
        for (let i = 0; i < word.length; i++) {
          const x = startX + i * dx;
          const y = startY + i * dy;
          grid[x][y] = {
            letter: word[i],
            isBlocked: false,
            userInput: '',
            number: i === 0 ? clueNumber : undefined,
            isStart: i === 0,
          };
        }

        clues.push({
          number: clueNumber,
          clue: definition,
          answer: word,
          direction,
          startX,
          startY,
          length: word.length,
        });

        placedWords.push({
          word,
          x: startX,
          y: startY,
          direction,
        });

        clueNumber++;
        placed = true;
      }

      attempts++;
    }
  }

  return {
    grid,
    clues,
    size,
  };
}

export function validateCrosswordSolution(
  grid: CrosswordCell[][],
  clues: CrosswordClue[]
): boolean {
  for (const clue of clues) {
    const { startX, startY, direction, answer } = clue;
    const dx = direction === 'across' ? 1 : 0;
    const dy = direction === 'down' ? 1 : 0;

    for (let i = 0; i < answer.length; i++) {
      const x = startX + i * dx;
      const y = startY + i * dy;
      const cell = grid[x][y];

      if (!cell.userInput || cell.userInput.toUpperCase() !== answer[i]) {
        return false;
      }
    }
  }

  return true;
}