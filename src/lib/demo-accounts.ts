export const demoPassword = "GenshuDemo!2026";
export const demoUsers = [
  {
    id: "demo-user-admin",
    email: "admin-demo@genshu.local",
    name: "Demo Administrator",
    role: "admin",
  },
  {
    id: "demo-user-teacher",
    email: "teacher-demo@genshu.local",
    name: "Demo Teacher",
    role: "teacher",
  },
  {
    id: "demo-user-student",
    email: "student-demo@genshu.local",
    name: "Demo Student",
    role: "student",
  },
  {
    id: "demo-user-new-student",
    email: "new-student-demo@genshu.local",
    name: "Demo New Student",
    role: "student",
  },
];

export function isDemoLoginEnabled(nodeEnv: string | undefined, flag: string | undefined) {
  return nodeEnv === "development" || flag === "true";
}
