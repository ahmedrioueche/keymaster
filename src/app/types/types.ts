  
export interface User {
  name: string;
  rank?: number;
  speed?: number;
  lastEntryDate?: string;
  typingStats?: TypingStat[];
}

export interface TypingStat {
  speed: number;
  accuracy?: number;
  date: string;
}