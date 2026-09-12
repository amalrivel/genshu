import { Router, type ErrorRequestHandler } from 'express';
import { db } from './prisma/db.ts';

export const content = Router();

function invalid(message: string): never {
  throw Object.assign(new Error(message), { status: 400 });
}

function id(value: unknown): number {
  const n = typeof value === 'string' && /^[1-9]\d*$/.test(value) ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isInteger(n) || n < 1 || n > 2147483647) {
    invalid('ID must be a positive PostgreSQL integer.');
  }
  return n;
}

function fields(body: unknown, material = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) invalid('A JSON object is required.');
  const data = body as Record<string, unknown>;
  if (typeof data.title !== 'string' || !data.title.trim() || data.title.includes('\0')) {
    invalid('Title is required and must be text without null characters.');
  }
  if (material && (typeof data.content !== 'string' || !data.content.trim() || data.content.includes('\0'))) {
    invalid('Content is required and must be text without null characters.');
  }
  return { title: data.title.trim(), content: data.content as string, topicId: data.topicId };
}

content.get('/topics', async (_req, res) => {
  res.json(await db.orm.public.Topic.orderBy([(t) => t.title.asc(), (t) => t.id.asc()]).all());
});
content.get('/topics/:id', async (req, res) => {
  const topic = await db.orm.public.Topic.where({ id: id(req.params.id) }).first();
  if (!topic) { res.status(404).json({ error: 'Topic not found.' }); return; }
  res.json(topic);
});
content.post('/topics', async (req, res) => {
  const { title } = fields(req.body);
  const topic = await db.orm.public.Topic.create({ title });
  res.location(`/topics/${topic.id}`).status(201).json(topic);
});
content.put('/topics/:id', async (req, res) => {
  const topicId = id(req.params.id);
  const { title } = fields(req.body);
  const row = await db.orm.public.Topic.where({ id: topicId }).update({ title });
  if (!row) { res.status(404).json({ error: 'Topic not found.' }); return; }
  res.json(row);
});
content.delete('/topics/:id', async (req, res) => {
  const row = await db.orm.public.Topic.where({ id: id(req.params.id) }).delete();
  if (!row) { res.status(404).json({ error: 'Topic not found.' }); return; }
  res.status(204).end();
});

content.get('/materials', async (req, res) => {
  const materials = req.query.topicId === undefined
    ? db.orm.public.Material
    : db.orm.public.Material.where({ topicId: id(req.query.topicId) });
  res.json(await materials.orderBy([(m) => m.title.asc(), (m) => m.id.asc()]).all());
});
content.get('/materials/:id', async (req, res) => {
  const material = await db.orm.public.Material.where({ id: id(req.params.id) }).first();
  if (!material) { res.status(404).json({ error: 'Material not found.' }); return; }
  res.json(material);
});
content.post('/materials', async (req, res) => {
  const data = fields(req.body, true);
  const material = await db.orm.public.Material.create({ title: data.title, content: data.content, topicId: id(data.topicId) });
  res.location(`/materials/${material.id}`).status(201).json(material);
});
content.put('/materials/:id', async (req, res) => {
  const materialId = id(req.params.id);
  const data = fields(req.body, true);
  const row = await db.orm.public.Material.where({ id: materialId }).update({
    title: data.title, content: data.content,
    ...(data.topicId === undefined ? {} : { topicId: id(data.topicId) }),
  });
  if (!row) { res.status(404).json({ error: 'Material not found.' }); return; }
  res.json(row);
});
content.delete('/materials/:id', async (req, res) => {
  const row = await db.orm.public.Material.where({ id: id(req.params.id) }).delete();
  if (!row) { res.status(404).json({ error: 'Material not found.' }); return; }
  res.status(204).end();
});

export const contentError: ErrorRequestHandler = (error, req, res, _next) => {
  // Prisma wraps driver errors; inspect the cause chain without exposing SQL or credentials.
  let cause = error;
  for (let depth = 0; cause && depth < 10; depth++, cause = cause.cause) {
    if (cause.sqlState === '23503' || cause.code === '23503') {
      res.status(409).json({ error: req.method === 'DELETE'
        ? 'Delete this topic’s materials before deleting the topic.'
        : 'The selected topic does not exist.' });
      return;
    }
  }
  if (error.type === 'entity.too.large') { res.status(413).json({ error: 'Content is too large (maximum request size: 1 MB).' }); return; }
  if (error.type === 'entity.parse.failed') { res.status(400).json({ error: 'Invalid JSON.' }); return; }
  if (error.status === 400) { res.status(400).json({ error: error.message }); return; }
  console.error('Content request failed:', error.code ?? error.name);
  res.status(500).json({ error: 'Unable to complete the request. Please try again.' });
};
