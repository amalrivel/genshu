import "server-only";

// NOTE: Seed fixtures only; runtime queries/submissions read the database.
// src/lib/activities/data.ts

import type { ActivityType } from "./types";

export type InternalQuestion = {
  id: string;
  question: string;

  // NOTE:
  // Jangan kirim field ini ke browser.
  correctAnswer: boolean;
};

export type InternalActivity = {
  id: string;
  title: string;
  description: string;
  type: ActivityType;

  questions: InternalQuestion[];
};

export const activities: InternalActivity[] = [
  {
    id: "road-sign-basic",
    title: "Road Sign Basic",
    description:
      "Practice basic Japanese road signs.",

    type: "practice",

    questions: [
      {
        id: "q1",
        question:
          "You must stop completely at a stop sign.",

        correctAnswer: true,
      },

      {
        id: "q2",
        question:
          "You may enter a road marked No Entry.",

        correctAnswer: false,
      },

      {
        id: "q3",
        question:
          "A red traffic light means you must stop.",

        correctAnswer: true,
      },
    ],
  },

  {
    id: "sim-mock-test-01",
    title: "SIM Mock Test #1",
    description:
      "Mock examination for Japanese driving rules.",

    type: "mock_exam",

    questions: [
      {
        id: "q1",
        question:
          "You may continue through a red traffic light if there are no cars.",

        correctAnswer: false,
      },

      {
        id: "q2",
        question:
          "A driver should check mirrors before changing lanes.",

        correctAnswer: true,
      },
    ],
  },
];