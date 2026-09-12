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

function questionText(data: Record<string, unknown>, key: string, label: string, optional = false) {
  const value = data[key];
  if (optional && (value === undefined || value === null || (typeof value === 'string' && !value.trim()))) {
    return value === undefined ? undefined : null;
  }
  if (typeof value !== 'string' || !value.trim() || value.includes('\0')) {
    invalid(`${label} is required and must be text without null characters.`);
  }
  return value.trim();
}

function questionFields(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) invalid('A JSON object is required.');
  const data = body as Record<string, unknown>;
  if (typeof data.correctAnswer !== 'boolean') invalid('Correct answer must be a boolean.');
  return {
    japaneseText: questionText(data, 'japaneseText', 'Japanese text') as string,
    indonesianTranslation: questionText(data, 'indonesianTranslation', 'Indonesian translation') as string,
    furigana: questionText(data, 'furigana', 'Furigana', true),
    correctAnswer: data.correctAnswer,
    japaneseExplanation: questionText(data, 'japaneseExplanation', 'Japanese explanation') as string,
    indonesianExplanation: questionText(data, 'indonesianExplanation', 'Indonesian explanation') as string,
    topicId: data.topicId,
  };
}

function practiceSetFields(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) invalid('A JSON object is required.');
  const data = body as Record<string, unknown>;
  if (typeof data.title !== 'string' || !data.title.trim() || data.title.includes('\0')) {
    invalid('Title is required and must be text without null characters.');
  }
  const description = data.description;
  if (description !== undefined && description !== null &&
    (typeof description !== 'string' || description.includes('\0'))) {
    invalid('Description must be text without null characters.');
  }
  return {
    title: data.title.trim(),
    description: typeof description === 'string' && description.trim() ? description.trim() : null,
    questionIds: questionIds(data.questionIds),
  };
}

function questionIds(value: unknown, required = false) {
  if (value === undefined && !required) return undefined;
  if (!Array.isArray(value)) invalid('Question IDs must be an array of unique positive PostgreSQL integers.');
  const ids = value.map(id);
  if (new Set(ids).size !== ids.length) invalid('Question IDs must not contain duplicates.');
  return ids;
}

async function validateQuestionIds(ids: number[]) {
  if (!ids.length) return;
  const questions = await db.orm.public.Question.where((q) => q.id.in(ids)).all();
  if (questions.length !== ids.length) invalid('One or more selected questions do not exist.');
}

async function practiceSetDetail(practiceSet: { id: number }) {
  const links = await db.orm.public.PracticeSetQuestion.where({ practiceSetId: practiceSet.id })
    .orderBy([(link) => link.position.asc(), (link) => link.id.asc()]).all();
  const questions = links.length
    ? await db.orm.public.Question.where((q) => q.id.in(links.map((link) => link.questionId))).all()
    : [];
  const byId = new Map(questions.map((question) => [question.id, question]));
  return { ...practiceSet, questions: links.map((link) => ({ ...byId.get(link.questionId)!, position: link.position })) };
}

async function practiceSetForPractice(practiceSet: { id: number }) {
  const links = await db.orm.public.PracticeSetQuestion.where({ practiceSetId: practiceSet.id })
    .orderBy([(link) => link.position.asc(), (link) => link.id.asc()]).all();
  const questions = links.length
    ? await db.orm.public.Question.where((q) => q.id.in(links.map((link) => link.questionId))).all()
    : [];
  const byId = new Map(questions.map((question) => [question.id, question]));
  return {
    ...practiceSet,
    questions: links.map((link) => {
      const question = byId.get(link.questionId)!;
      return {
        id: question.id,
        japaneseText: question.japaneseText,
        indonesianTranslation: question.indonesianTranslation,
        furigana: question.furigana,
        position: link.position,
      };
    }),
  };
}

function submittedAnswer(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || typeof (body as Record<string, unknown>).answer !== 'boolean') {
    invalid('Answer must be a boolean.');
  }
  return (body as { answer: boolean }).answer;
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

content.get('/questions', async (req, res) => {
  const questions = req.query.topicId === undefined
    ? db.orm.public.Question
    : db.orm.public.Question.where({ topicId: id(req.query.topicId) });
  res.json(await questions.orderBy([(q) => q.japaneseText.asc(), (q) => q.id.asc()]).all());
});
content.get('/questions/:id', async (req, res) => {
  const question = await db.orm.public.Question.where({ id: id(req.params.id) }).first();
  if (!question) { res.status(404).json({ error: 'Question not found.' }); return; }
  res.json(question);
});
content.post('/questions', async (req, res) => {
  const data = questionFields(req.body);
  const question = await db.orm.public.Question.create({
    japaneseText: data.japaneseText,
    indonesianTranslation: data.indonesianTranslation,
    furigana: data.furigana,
    correctAnswer: data.correctAnswer,
    japaneseExplanation: data.japaneseExplanation,
    indonesianExplanation: data.indonesianExplanation,
    topicId: id(data.topicId),
  });
  res.location(`/questions/${question.id}`).status(201).json(question);
});
content.put('/questions/:id', async (req, res) => {
  const questionId = id(req.params.id);
  const data = questionFields(req.body);
  const row = await db.orm.public.Question.where({ id: questionId }).update({
    japaneseText: data.japaneseText,
    indonesianTranslation: data.indonesianTranslation,
    furigana: data.furigana,
    correctAnswer: data.correctAnswer,
    japaneseExplanation: data.japaneseExplanation,
    indonesianExplanation: data.indonesianExplanation,
    ...(data.topicId === undefined ? {} : { topicId: id(data.topicId) }),
  });
  if (!row) { res.status(404).json({ error: 'Question not found.' }); return; }
  res.json(row);
});
content.delete('/questions/:id', async (req, res) => {
  const row = await db.orm.public.Question.where({ id: id(req.params.id) }).delete();
  if (!row) { res.status(404).json({ error: 'Question not found.' }); return; }
  res.status(204).end();
});

content.get('/practice-sets', async (_req, res) => {
  res.json(await db.orm.public.PracticeSet.orderBy([(set) => set.title.asc(), (set) => set.id.asc()]).all());
});
content.get('/practice-sets/:id/practice', async (req, res) => {
  const practiceSet = await db.orm.public.PracticeSet.where({ id: id(req.params.id) }).first();
  if (!practiceSet) { res.status(404).json({ error: 'Practice set not found.' }); return; }
  res.json(await practiceSetForPractice(practiceSet));
});
content.post('/practice-sets/:id/questions/:questionId/check-answer', async (req, res) => {
  const practiceSetId = id(req.params.id);
  const questionId = id(req.params.questionId);
  const answer = submittedAnswer(req.body);
  const practiceSet = await db.orm.public.PracticeSet.where({ id: practiceSetId }).first();
  if (!practiceSet) { res.status(404).json({ error: 'Practice set not found.' }); return; }
  const link = await db.orm.public.PracticeSetQuestion.where({ practiceSetId, questionId }).first();
  if (!link) { res.status(404).json({ error: 'Question not found in this practice set.' }); return; }
  const question = await db.orm.public.Question.where({ id: questionId }).first();
  if (!question) { res.status(404).json({ error: 'Question not found.' }); return; }
  res.json({
    isCorrect: answer === question.correctAnswer,
    correctAnswer: question.correctAnswer,
    japaneseExplanation: question.japaneseExplanation,
    indonesianExplanation: question.indonesianExplanation,
  });
});
content.get('/practice-sets/:id', async (req, res) => {
  const practiceSet = await db.orm.public.PracticeSet.where({ id: id(req.params.id) }).first();
  if (!practiceSet) { res.status(404).json({ error: 'Practice set not found.' }); return; }
  res.json(await practiceSetDetail(practiceSet));
});
content.post('/practice-sets', async (req, res) => {
  const data = practiceSetFields(req.body);
  const selected = data.questionIds ?? [];
  await validateQuestionIds(selected);
  const practiceSet = await db.transaction(async (tx) => {
    const set = await tx.orm.public.PracticeSet.create({ title: data.title, description: data.description });
    for (const [position, questionId] of selected.entries()) {
      await tx.orm.public.PracticeSetQuestion.create({ practiceSetId: set.id, questionId, position });
    }
    return set;
  });
  res.location(`/practice-sets/${practiceSet.id}`).status(201).json(await practiceSetDetail(practiceSet));
});
content.put('/practice-sets/:id', async (req, res) => {
  const practiceSetId = id(req.params.id);
  const data = practiceSetFields(req.body);
  if (data.questionIds) await validateQuestionIds(data.questionIds);
  const practiceSet = await db.transaction(async (tx) => {
    const set = await tx.orm.public.PracticeSet.where({ id: practiceSetId }).update({
      title: data.title, description: data.description,
    });
    if (!set || !data.questionIds) return set;
    await tx.execute(tx.sql.public.practiceSetQuestion.delete()
      .where((link, fns) => fns.eq(link.practiceSetId, practiceSetId)).build());
    for (const [position, questionId] of data.questionIds.entries()) {
      await tx.orm.public.PracticeSetQuestion.create({ practiceSetId, questionId, position });
    }
    return set;
  });
  if (!practiceSet) { res.status(404).json({ error: 'Practice set not found.' }); return; }
  res.json(await practiceSetDetail(practiceSet));
});
content.put('/practice-sets/:id/questions', async (req, res) => {
  const practiceSetId = id(req.params.id);
  const selected = questionIds((req.body as Record<string, unknown>)?.questionIds, true)!;
  await validateQuestionIds(selected);
  const practiceSet = await db.transaction(async (tx) => {
    const set = await tx.orm.public.PracticeSet.where({ id: practiceSetId }).first();
    if (!set) return null;
    await tx.execute(tx.sql.public.practiceSetQuestion.delete()
      .where((link, fns) => fns.eq(link.practiceSetId, practiceSetId)).build());
    for (const [position, questionId] of selected.entries()) {
      await tx.orm.public.PracticeSetQuestion.create({ practiceSetId, questionId, position });
    }
    return set;
  });
  if (!practiceSet) { res.status(404).json({ error: 'Practice set not found.' }); return; }
  res.json(await practiceSetDetail(practiceSet));
});
content.delete('/practice-sets/:id', async (req, res) => {
  const practiceSet = await db.orm.public.PracticeSet.where({ id: id(req.params.id) }).delete();
  if (!practiceSet) { res.status(404).json({ error: 'Practice set not found.' }); return; }
  res.status(204).end();
});

export const contentError: ErrorRequestHandler = (error, req, res, _next) => {
  // Prisma wraps driver errors; inspect the cause chain without exposing SQL or credentials.
  let cause = error;
  for (let depth = 0; cause && depth < 10; depth++, cause = cause.cause) {
    if (cause.sqlState === '23503' || cause.code === '23503') {
      res.status(409).json({ error: req.method === 'DELETE' && req.path.startsWith('/questions/')
        ? 'Remove this question from its practice sets before deleting it.'
        : req.method === 'DELETE'
          ? 'Delete this topic’s materials and questions before deleting the topic.'
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
