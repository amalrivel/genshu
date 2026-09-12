export type Topic = { id: number; title: string; createdAt: string; updatedAt: string };
export type Material = { id: number; title: string; content: string; topicId: number };

const base = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${base}${path}`, init);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || `Request failed (${response.status}).`);
  }
  return response.status === 204 ? undefined as T : response.json();
}

export async function saveContent(request: Request, resource: "topics" | "materials", topicId?: string) {
  const form = await request.formData();
  const id = form.get("id");
  const deleting = form.get("intent") === "delete";
  try {
    await api(`/${resource}${id ? `/${encodeURIComponent(String(id))}` : ""}`, {
      method: deleting ? "DELETE" : id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: deleting ? undefined : JSON.stringify({
        title: form.get("title"),
        ...(resource === "materials" ? { content: form.get("content"), topicId: Number(topicId) } : {}),
      }),
    });
    return { ok: true, error: "", intent: deleting ? "delete" : id ? "update" : "create" };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Request failed.", intent: "" };
  }
}
