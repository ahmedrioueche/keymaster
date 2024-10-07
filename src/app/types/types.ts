  
export interface User {
  id?: number;
  username: string;
  password?: string;
  rank?: number;
  speed?: number;
  lastEntryDate?: string;
  typingStats?: TypingStat[];
  stars?: number;
  skillLevel?: string;
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

export interface Room {
  id: number;
  roomId: string;
  createdAt: Date;
  status: string;
  maxPlayers: number;
  players: User[];
  settings?: RoonSettings;
}

export interface SearchPrefs {
  prefLanguage: string;
  prefTextMaxLength: number;
}

export interface RoonSettings {
  language: string,
  textMaxLength: number;
}