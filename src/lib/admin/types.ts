export const managementSections = {
  materials: "Materi",
  topics: "Topik",
  subjects: "Subjek",
  practice: "Latihan",
  announcements: "Pengumuman",
  recordings: "Rekaman",
  events: "Jadwal",
  accounts: "Akun",
} as const;
export type ManagementSection = keyof typeof managementSections;
export type ActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};
export type MaterialStatus = "published" | "draft";
export type MaterialDestination = { title: string; topicId: string; subjectId: string };
type MaterialSubject = {
  id: string;
  title: string;
  published: boolean;
  topic: { id: string; title: string; published: boolean } | null;
};
type ContentRecord = { id: string; title: string; description: string; published: boolean };
export type ManagementContent = {
  hasNext: boolean;
  topics: ContentRecord[];
  subjects: (ContentRecord & { topicId: string; topic: { title: string } | null })[];
  topicOptions: { id: string; title: string }[];
  subjectOptions: (MaterialSubject & { replacesPublished: boolean })[];
  materialDrafts: {
    id: string;
    title: string;
    description: string;
    subject: (MaterialSubject & { material: { published: boolean } | null }) | null;
  }[];
  materials: {
    id: string;
    title: string;
    description: string;
    published: boolean;
    updatedAt: string;
    subject: MaterialSubject | null;
  }[];
  activities: (ContentRecord & {
    questions: { question: string; correctAnswer: boolean; position: number }[];
  })[];
  announcements: {
    id: string;
    title: string;
    summary: string;
    content: string;
    published: boolean;
  }[];
  recordings: (ContentRecord & { lessonDate: string; url: string })[];
  events: {
    id: string;
    title: string;
    details: string;
    startsAt: string;
    endsAt: string;
    published: boolean;
  }[];
  accounts: { id: string; name: string; email: string; role: string }[];
};

export function managementParams(input: {
  section?: unknown;
  q?: unknown;
  page?: unknown;
  status?: unknown;
}) {
  const section: ManagementSection =
    typeof input.section === "string" && Object.hasOwn(managementSections, input.section)
      ? (input.section as ManagementSection)
      : "practice";
  const page =
    typeof input.page === "string" && /^\d+$/.test(input.page)
      ? Math.min(10000, Math.max(1, Number(input.page)))
      : 1;
  return {
    section,
    page,
    status: (input.status === "draft" ? "draft" : "published") as MaterialStatus,
    q: (typeof input.q === "string" ? input.q : "").trim().slice(0, 120),
  };
}
