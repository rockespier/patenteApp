// src/app/core/models/exam.models.ts

export interface Question {
  id: string;
  text: string;
  imageUrl?: string | null;
  category: string;
}

export interface UserAnswer {
  questionId: string;
  answer: boolean;
}

export interface QuizSubmission {
  sessionId: string;
  answers: UserAnswer[];
}

export interface Correction {
  questionId: string;
  questionText: string;
  correctAnswer: boolean;
  userAnswer: boolean;
}

export interface QuizResult {
  passed: boolean;
  errorsCount: number;
  corrections: Correction[];
}