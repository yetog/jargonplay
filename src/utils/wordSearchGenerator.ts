export interface WordSearchGrid {
  grid: string[][];
  words: Array<{
    word: string;
    start: [number, number];
    end: [number, number];
    direction: string;
    found: boolean;
  }>;
  size: number;
}

const directions = [
  [0, 1],   // horizontal
  [1, 0],   // vertical
  [1, 1],   // diagonal down-right
  [1, -1],  // diagonal down-left
  [0, -1],  // horizontal reverse
  [-1, 0],  // vertical reverse
  [-1, -1], // diagonal up-left
  [-1, 1],  // diagonal up-right
];

const directionNames = [
  'horizontal',
  'vertical',
  'diagonal-down-right',
  'diagonal-down-left',
  'horizontal-reverse',
  'vertical-reverse',
  'diagonal-up-left',
  'diagonal-up-right',
];

export function generateWordSearch(words: string[], size: number = 15): WordSearchGrid {
  const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));
  const placedWords: WordSearchGrid['words'] = [];
  
  // Clean and uppercase words
  const cleanWords = words.map(word => word.toUpperCase().replace(/[^A-Z]/g, ''));
  
  // Try to place each word
  for (const word of cleanWords) {
    if (word.length > size) continue;
    
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!placed && attempts < maxAttempts) {
      const directionIndex = Math.floor(Math.random() * directions.length);
      const [dx, dy] = directions[directionIndex];
      
      // Calculate valid starting positions
      const maxStartX = dx > 0 ? size - word.length : dx < 0 ? word.length - 1 : size - 1;
      const maxStartY = dy > 0 ? size - word.length : dy < 0 ? word.length - 1 : size - 1;
      const minStartX = dx < 0 ? word.length - 1 : 0;
      const minStartY = dy < 0 ? word.length - 1 : 0;
      
      const startX = Math.floor(Math.random() * (maxStartX - minStartX + 1)) + minStartX;
      const startY = Math.floor(Math.random() * (maxStartY - minStartY + 1)) + minStartY;
      
      // Check if word can be placed
      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const x = startX + i * dx;
        const y = startY + i * dy;
        
        if (x < 0 || x >= size || y < 0 || y >= size || 
            (grid[x][y] !== '' && grid[x][y] !== word[i])) {
          canPlace = false;
          break;
        }
      }
      
      if (canPlace) {
        // Place the word
        for (let i = 0; i < word.length; i++) {
          const x = startX + i * dx;
          const y = startY + i * dy;
          grid[x][y] = word[i];
        }
        
        placedWords.push({
          word: word,
          start: [startX, startY],
          end: [startX + (word.length - 1) * dx, startY + (word.length - 1) * dy],
          direction: directionNames[directionIndex],
          found: false,
        });
        
        placed = true;
      }
      
      attempts++;
    }
  }
  
  // Fill empty cells with random letters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j] === '') {
        grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
  
  return {
    grid,
    words: placedWords,
    size,
  };
}

export function checkWordInGrid(
  grid: string[][],
  word: string,
  start: [number, number],
  end: [number, number]
): boolean {
  const [startX, startY] = start;
  const [endX, endY] = end;
  
  const dx = endX === startX ? 0 : endX > startX ? 1 : -1;
  const dy = endY === startY ? 0 : endY > startY ? 1 : -1;
  
  let currentX = startX;
  let currentY = startY;
  
  for (let i = 0; i < word.length; i++) {
    if (grid[currentX][currentY] !== word[i]) {
      return false;
    }
    currentX += dx;
    currentY += dy;
  }
  
  return true;
}