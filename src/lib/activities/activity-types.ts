import type { ActivityType } from "./types";

// NOTE: Pilihan navigasi jenis activity, bukan aturan pengerjaan soal.
export const activityTypes = [
  { id: "practice", title: "Practice", description: "Practice with available question sets." },
  { id: "mock_exam", title: "Mock Test", description: "Choose a mock test to work through." },
  { id: "exam", title: "Exam", description: "Browse available examinations." },
  { id: "assignment", title: "Tugas / PR", description: "Browse assignments and homework." },
] satisfies { id: ActivityType; title: string; description: string }[];

export function getActivityType(type: string) {
  return activityTypes.find((item) => item.id === type);
}
