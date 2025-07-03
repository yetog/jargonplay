import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export interface PuzzleRequest {
  type: 'wordsearch' | 'crossword';
  topic: string;
}

export interface WordSearchResponse {
  words: string[];
}

export interface CrosswordResponse {
  words: Array<{
    word: string;
    definition: string;
  }>;
}

export type PuzzleResponse = WordSearchResponse | CrosswordResponse;

class AIService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async generatePuzzle(request: PuzzleRequest): Promise<PuzzleResponse> {
    try {
      const response = await this.axiosInstance.post('/generate-puzzle', request);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('AI service is not available. Please make sure the backend is running.');
        }
        
        if (error.response) {
          const message = error.response.data?.detail || 'AI generation failed';
          throw new Error(message);
        }
        
        if (error.request) {
          throw new Error('No response from AI service. Please check your connection.');
        }
      }
      
      throw new Error('An unexpected error occurred while generating the puzzle.');
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.axiosInstance.get('/');
      return true;
    } catch {
      return false;
    }
  }
}

export const aiService = new AIService();