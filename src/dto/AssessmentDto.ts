export interface Question {
  id?: number;
  question: string;
  options?: string[];
  answer: string;
  correctedAnswer?: string;
  type: 'MC' | 'EY';
  elo?: number;
}

export interface AssessmentDto {
  id: number;
  chapterId: number;
  instruction: string;
  questions?: Question[] | string | null;
  answers?: any | null;
  createdAt: string;
  updatedAt: string;
}