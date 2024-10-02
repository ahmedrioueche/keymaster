  
export interface User {
  id?: number;
  name: string;
  password?: string;
  rank?: number;
  speed?: number;
  lastEntryDate?: string;
  typingStats?: TypingStat[];
}

export interface TypingStat {
  id?: number;
  speed: number;
  accuracy?: number;
  date: string;
}