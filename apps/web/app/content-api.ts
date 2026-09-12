export type Topic = { id: number; title: string; createdAt: string; updatedAt: string };
export type Material = { id: number; title: string; content: string; topicId: number };
export type Question = {
  id: number; japaneseText: string; indonesianTranslation: string; furigana: string | null;
  correctAnswer: boolean; japaneseExplanation: string; indonesianExplanation: string;
  topicId: number; createdAt: string; updatedAt: string;
};
export type PracticeSetSummary = {
  id: number; title: string; description: string | null; createdAt: string; updatedAt: string;
};
export type PracticeSet = PracticeSetSummary & { questions: Array<Question & { position: number }> };
export type PracticeQuestion = {
  id: number; japaneseText: string; indonesianTranslation: string; furigana: string | null; position: number;
};
export type PracticeSetForPractice = PracticeSetSummary & { questions: PracticeQuestion[] };
export type AnswerFeedback = {
  isCorrect: boolean; correctAnswer: boolean; japaneseExplanation: string; indonesianExplanation: string;
};
export type AuthUser = { id: number; email: string; name: string | null; role: "Participant" | "Admin"; isActive: boolean };
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }

const base = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${base}${path}`, { credentials: "include", ...init });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body?.error || `Request failed (${response.status}).`);
  }
  return response.status === 204 ? undefined as T : response.json();
}
export async function currentUser() { return (await api<{ user: AuthUser }>("/auth/session")).user; }
export async function requireAuth() {
  try { return await currentUser(); }
  catch (error) { if (error instanceof ApiError && error.status === 401) throw redirect("/login"); throw error; }
}
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "Admin") throw redirect("/practice");
  return user;
}

export async function saveContent(request: Request, resource: "topics" | "materials" | "questions", topicId?: string) {
  const form = await request.formData();
  const id = form.get("id");
  const deleting = form.get("intent") === "delete";
  try {
    await api(`/${resource}${id ? `/${encodeURIComponent(String(id))}` : ""}`, {
      method: deleting ? "DELETE" : id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: deleting ? undefined : JSON.stringify(resource === "questions" ? {
        japaneseText: form.get("japaneseText"),
        indonesianTranslation: form.get("indonesianTranslation"),
        furigana: form.get("furigana"),
        correctAnswer: form.get("correctAnswer") === "true",
        japaneseExplanation: form.get("japaneseExplanation"),
        indonesianExplanation: form.get("indonesianExplanation"),
        topicId: Number(topicId),
      } : {
        title: form.get("title"),
        ...(resource === "materials" ? { content: form.get("content"), topicId: Number(topicId) } : {}),
      }),
    });
    return { ok: true, error: "", intent: deleting ? "delete" : id ? "update" : "create" };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Request failed.", intent: "" };
  }
}

export async function savePracticeSet(request: Request) {
  const form = await request.formData();
  const id = form.get("id");
  const deleting = form.get("intent") === "delete";
  try {
    await api(`/practice-sets${id ? `/${encodeURIComponent(String(id))}` : ""}`, {
      method: deleting ? "DELETE" : id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: deleting ? undefined : JSON.stringify({
        title: form.get("title"), description: form.get("description"),
        questionIds: form.getAll("questionId").map(Number),
      }),
    });
    return { ok: true, error: "", intent: deleting ? "delete" : id ? "update" : "create" };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Request failed.", intent: "" };
  }
}
import { redirect } from "react-router";
