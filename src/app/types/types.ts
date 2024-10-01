  
export interface User {
  name: string;
  rank?: number;
  speed?: number;
  lastEntryDate?: String;
  typingStats?: TypingStat[];
}

export interface TypingStat {
  speed: number;
  date: String;
}