// NOTE: Tipe ini adalah kontrak UI/action, bukan schema database atau validasi
// runtime. Question sengaja tidak memuat kunci jawaban. ActivityResult saat ini
// memuat kunci; TODO: tentukan kontrak hasil terpisah jika exam belum boleh
// membuka pembahasan. Data yang dikirim tetap terlihat walau UI tidak merendernya.

// src/lib/activities/types.ts

export type ActivityType =
  | "practice"
  | "mock_exam"
  | "exam"
  | "assignment";

export type Question = {
  id: string;
  question: string;
};

export type Activity = {
  id: string;
  title: string;
  description: string;
  type: ActivityType;

  questions: Question[];
};

// questionId -> jawaban user
//
// Contoh:
// {
//   q1: true,
//   q2: false,
// }
export type Answers = Record<string, boolean>;

export type ActivitySummary = {
  id: string;
  title: string;
  description: string;
  type: ActivityType;
  questionCount: number;
};

export type QuestionResult = {
  questionId: string;

  userAnswer: boolean | null;
  correctAnswer: boolean;

  isCorrect: boolean;
};

export type ActivityResult = {
  activityId: string;

  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;

  score: number;

  questions: QuestionResult[];
};