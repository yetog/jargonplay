import { create } from 'zustand';

export interface WordItem {
  word: string;
  definition?: string;
}

export interface GameSession {
  id: string;
  type: 'wordsearch' | 'crossword';
  words: WordItem[];
  createdAt: Date;
  completedAt?: Date;
  score?: number;
}

interface GameStore {
  currentSession: GameSession | null;
  sessions: GameSession[];
  createSession: (type: 'wordsearch' | 'crossword', words: WordItem[]) => void;
  completeSession: (score?: number) => void;
  loadSession: (sessionId: string) => void;
  clearSession: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentSession: null,
  sessions: JSON.parse(localStorage.getItem('jargonplay-sessions') || '[]'),

  createSession: (type, words) => {
    const session: GameSession = {
      id: Date.now().toString(),
      type,
      words,
      createdAt: new Date(),
    };
    
    set({ currentSession: session });
    
    const sessions = [...get().sessions, session];
    localStorage.setItem('jargonplay-sessions', JSON.stringify(sessions));
    set({ sessions });
  },

  completeSession: (score) => {
    const { currentSession, sessions } = get();
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      completedAt: new Date(),
      score,
    };

    const updatedSessions = sessions.map(s => 
      s.id === currentSession.id ? updatedSession : s
    );

    localStorage.setItem('jargonplay-sessions', JSON.stringify(updatedSessions));
    set({ sessions: updatedSessions, currentSession: updatedSession });
  },

  loadSession: (sessionId) => {
    const { sessions } = get();
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      set({ currentSession: session });
    }
  },

  clearSession: () => {
    set({ currentSession: null });
  },
}));