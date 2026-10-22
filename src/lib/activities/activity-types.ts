import type { ActivityType } from "./types";

// NOTE: Initial master-data values for seeding only. Runtime navigation reads
// activity_categories, so database label edits are preserved and displayed.
export const activityTypes = [
  { id: "practice", title: "Practice", description: "Practice with available question sets." },
  { id: "mock_exam", title: "Mock Test", description: "Choose a mock test to work through." },
  { id: "exam", title: "Exam", description: "Browse available examinations." },
  { id: "assignment", title: "Tugas / PR", description: "Browse assignments and homework." },
] satisfies { id: ActivityType; title: string; description: string }[];
