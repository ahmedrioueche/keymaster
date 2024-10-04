  
export interface User {
  id?: number;
  username: string;
  password?: string;
  rank?: number;
  speed?: number;
  lastEntryDate?: string;
  typingStats?: TypingStat[];
  settings?: Settings;
}

export interface TypingStat {
  id?: number;
  speed: number;
  accuracy?: number;
  date: string;
}

export interface Settings {
  language: string;
  mode: 'auto' | 'manual';
  textLength: number;
  soundEffects: boolean;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
}