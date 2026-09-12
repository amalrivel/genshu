// Run against the local development API: node --test src/content.test.ts
import assert from 'node:assert/strict';
import { test } from 'node:test';

const base = 'http://localhost:3000';
async function request(path: string, method = 'GET', body?: unknown, status = 200) {
  const response = await fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = response.status === 204 ? null : await response.json();
  assert.equal(response.status, status, JSON.stringify(data));
  return data;
}

test('Topic → Material CRUD, validation, filtering and safe deletion', async () => {
  const topics: number[] = [];
  const materials: number[] = [];
  const questions: number[] = [];
  const title = `Genshu check ${Date.now()}`;
  try {
    for (const bad of [{}, { title: ' ' }, { title: 12 }, { title: 'bad\0title' }, []]) {
      await request('/topics', 'POST', bad, 400);
    }
    for (const bad of ['0', '-1', '1.5', 'abc', '2147483648']) {
      await request(`/topics/${bad}`, 'GET', undefined, 400);
      await request(`/materials?topicId=${bad}`, 'GET', undefined, 400);
      await request(`/questions?topicId=${bad}`, 'GET', undefined, 400);
    }
    const topic = await request('/topics', 'POST', { title: `${title} Z` }, 201);
    topics.push(topic.id);
    const other = await request('/topics', 'POST', { title: `${title} A` }, 201);
    topics.push(other.id);
    assert.equal((await request(`/topics/${topic.id}`)).title, topic.title);
    const allTopics = await request('/topics');
    assert.ok(allTopics.findIndex((t: { id: number }) => t.id === other.id) < allTopics.findIndex((t: { id: number }) => t.id === topic.id));
    assert.equal((await request(`/topics/${topic.id}`, 'PUT', { title: `${title} Updated` })).title, `${title} Updated`);
    const markdown = '# Road signs\n\n**Stop** here.  \n';
    const material = await request('/materials', 'POST', { title: 'Z signs', content: markdown, topicId: topic.id }, 201);
    materials.push(material.id);
    const second = await request('/materials', 'POST', { title: 'A signs', content: 'Plain text', topicId: topic.id }, 201);
    materials.push(second.id);
    assert.equal((await request(`/materials/${material.id}`)).content, markdown);
    assert.deepEqual((await request(`/materials?topicId=${topic.id}`)).map((m: { id: number }) => m.id), [second.id, material.id]);
    assert.deepEqual(await request(`/materials?topicId=${other.id}`), []);
    assert.ok((await request('/materials')).some((m: { id: number }) => m.id === material.id));
    await request(`/topics/${topic.id}`, 'DELETE', undefined, 409);
    await request('/materials', 'POST', { title: 'Bad', content: '', topicId: topic.id }, 400);
    await request('/materials', 'POST', { title: 'Bad', content: 'Text', topicId: 2147483647 }, 409);
    const updated = await request(`/materials/${material.id}`, 'PUT', { title: 'Edited', content: '## Updated' });
    assert.equal(updated.content, '## Updated');
    assert.equal(updated.topicId, topic.id);
    await request(`/materials/${material.id}`, 'PUT', { title: 'Edited', content: '## Updated', topicId: 2147483647 }, 409);
    await request(`/materials/${material.id}`, 'PUT', { title: 'Edited', content: '## Updated', topicId: other.id });
    assert.equal((await request(`/materials?topicId=${other.id}`))[0].id, material.id);
    const questionData = {
      japaneseText: '道路では右側を走る。',
      indonesianTranslation: 'Di jalan, berkendara di sisi kanan.',
      furigana: 'どうろではみぎがわをはしる。',
      correctAnswer: false,
      japaneseExplanation: '日本では左側通行です。',
      indonesianExplanation: 'Di Jepang, kendaraan berjalan di sisi kiri.',
      topicId: topic.id,
    };
    for (const bad of [
      {},
      { ...questionData, japaneseText: ' ' },
      { ...questionData, japaneseText: 'bad\0text' },
      { ...questionData, indonesianTranslation: '' },
      { ...questionData, furigana: 'bad\0furigana' },
      { ...questionData, correctAnswer: 'false' },
      { ...questionData, japaneseExplanation: '' },
      { ...questionData, indonesianExplanation: null },
      { ...questionData, topicId: 'abc' },
    ]) await request('/questions', 'POST', bad, 400);
    const question = await request('/questions', 'POST', questionData, 201);
    questions.push(question.id);
    const secondQuestion = await request('/questions', 'POST', {
      ...questionData, japaneseText: '安全確認をする。', correctAnswer: true, furigana: null,
    }, 201);
    questions.push(secondQuestion.id);
    assert.equal((await request(`/questions/${question.id}`)).correctAnswer, false);
    assert.deepEqual((await request(`/questions?topicId=${topic.id}`)).map((q: { id: number }) => q.id), [secondQuestion.id, question.id]);
    assert.deepEqual(await request(`/questions?topicId=${other.id}`), []);
    assert.ok((await request('/questions')).some((q: { id: number }) => q.id === question.id));
    await request('/questions', 'POST', { ...questionData, topicId: 2147483647 }, 409);
    const updatedQuestion = await request(`/questions/${question.id}`, 'PUT', {
      ...questionData, japaneseText: '編集した問題です。', correctAnswer: true,
    });
    assert.equal(updatedQuestion.correctAnswer, true);
    assert.equal(updatedQuestion.topicId, topic.id);
    await request(`/questions/${question.id}`, 'PUT', { ...questionData, topicId: 2147483647 }, 409);
    await request(`/questions/${question.id}`, 'PUT', { ...questionData, topicId: other.id });
    assert.equal((await request(`/questions?topicId=${other.id}`))[0].id, question.id);
    await request('/questions/2147483647', 'GET', undefined, 404);
    await request('/questions/2147483647', 'PUT', questionData, 404);
    await request('/questions/2147483647', 'DELETE', undefined, 404);
    await request(`/topics/${topic.id}`, 'DELETE', undefined, 409);
    for (const id of materials) {
      await request(`/materials/${id}`, 'DELETE', undefined, 204);
      await request(`/materials/${id}`, 'GET', undefined, 404);
      await request(`/materials/${id}`, 'DELETE', undefined, 404);
      await request(`/materials/${id}`, 'PUT', { title: 'Gone', content: 'Gone' }, 404);
    }
    for (const id of questions) {
      await request(`/questions/${id}`, 'DELETE', undefined, 204);
      await request(`/questions/${id}`, 'GET', undefined, 404);
      await request(`/questions/${id}`, 'DELETE', undefined, 404);
      await request(`/questions/${id}`, 'PUT', questionData, 404);
    }
    for (const id of topics) {
      await request(`/topics/${id}`, 'DELETE', undefined, 204);
      await request(`/topics/${id}`, 'GET', undefined, 404);
      await request(`/topics/${id}`, 'PUT', { title: 'Gone' }, 404);
      await request(`/topics/${id}`, 'DELETE', undefined, 404);
    }
    const malformed = await fetch(base + '/topics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(malformed.status, 400);
  } finally {
    for (const id of materials) await fetch(`${base}/materials/${id}`, { method: 'DELETE' });
    for (const id of questions) await fetch(`${base}/questions/${id}`, { method: 'DELETE' });
    for (const id of topics) await fetch(`${base}/topics/${id}`, { method: 'DELETE' });
  }
});

test('Practice set CRUD, ordered questions, validation and safe question deletion', async () => {
  const topics: number[] = [];
  const questions: number[] = [];
  const practiceSets: number[] = [];
  const title = `Practice set check ${Date.now()}`;
  try {
    const topic = await request('/topics', 'POST', { title }, 201);
    topics.push(topic.id);
    const questionData = {
      japaneseText: '道路では左側を走る。',
      indonesianTranslation: 'Di jalan, berkendara di sisi kiri.',
      correctAnswer: true,
      japaneseExplanation: '日本では左側通行です。',
      indonesianExplanation: 'Di Jepang, kendaraan berjalan di sisi kiri.',
      topicId: topic.id,
    };
    for (const suffix of ['A', 'B', 'C']) {
      const question = await request('/questions', 'POST', { ...questionData, japaneseText: `${suffix} ${questionData.japaneseText}` }, 201);
      questions.push(question.id);
    }
    const [firstQuestion, secondQuestion, thirdQuestion] = questions;
    for (const bad of [
      {}, { title: ' ' }, { title: 'bad\0title' }, { title, questionIds: 'bad' },
      { title, questionIds: [firstQuestion, firstQuestion] }, { title, questionIds: [2147483647] },
      { title, questionIds: [0] },
    ]) await request('/practice-sets', 'POST', bad, 400);
    const practiceSet = await request('/practice-sets', 'POST', {
      title: `${title} Z`, description: '  First review  ', questionIds: [secondQuestion, firstQuestion],
    }, 201);
    practiceSets.push(practiceSet.id);
    assert.equal(practiceSet.description, 'First review');
    assert.deepEqual(practiceSet.questions.map((question: { id: number }) => question.id), [secondQuestion, firstQuestion]);
    assert.deepEqual(practiceSet.questions.map((question: { position: number }) => question.position), [0, 1]);
    const otherSet = await request('/practice-sets', 'POST', { title: `${title} A` }, 201);
    practiceSets.push(otherSet.id);
    assert.deepEqual((await request('/practice-sets')).filter((set: { id: number }) => practiceSets.includes(set.id)).map((set: { id: number }) => set.id), [otherSet.id, practiceSet.id]);
    assert.deepEqual((await request(`/practice-sets/${practiceSet.id}`)).questions.map((question: { id: number }) => question.id), [secondQuestion, firstQuestion]);
    const updated = await request(`/practice-sets/${practiceSet.id}`, 'PUT', {
      title: `${title} Updated`, description: null, questionIds: [thirdQuestion, firstQuestion, secondQuestion],
    });
    assert.equal(updated.description, null);
    assert.deepEqual(updated.questions.map((question: { id: number }) => question.id), [thirdQuestion, firstQuestion, secondQuestion]);
    const reordered = await request(`/practice-sets/${practiceSet.id}/questions`, 'PUT', { questionIds: [firstQuestion, thirdQuestion] });
    assert.deepEqual(reordered.questions.map((question: { id: number }) => question.id), [firstQuestion, thirdQuestion]);
    for (const bad of [
      { questionIds: [firstQuestion, firstQuestion] }, { questionIds: [2147483647] }, { questionIds: [firstQuestion, 'bad'] },
    ]) await request(`/practice-sets/${practiceSet.id}/questions`, 'PUT', bad, 400);
    await request('/practice-sets/2147483647', 'GET', undefined, 404);
    await request('/practice-sets/2147483647', 'PUT', { title, questionIds: [] }, 404);
    await request('/practice-sets/2147483647/questions', 'PUT', { questionIds: [] }, 404);
    await request('/practice-sets/2147483647', 'DELETE', undefined, 404);
    await request(`/questions/${firstQuestion}`, 'DELETE', undefined, 409);
    await request(`/practice-sets/${practiceSet.id}`, 'DELETE', undefined, 204);
    await request(`/practice-sets/${practiceSet.id}`, 'GET', undefined, 404);
    practiceSets.splice(practiceSets.indexOf(practiceSet.id), 1);
    await request(`/questions/${firstQuestion}`, 'DELETE', undefined, 204);
    questions.splice(questions.indexOf(firstQuestion), 1);
  } finally {
    for (const id of practiceSets) await fetch(`${base}/practice-sets/${id}`, { method: 'DELETE' });
    for (const id of questions) await fetch(`${base}/questions/${id}`, { method: 'DELETE' });
    for (const id of topics) await fetch(`${base}/topics/${id}`, { method: 'DELETE' });
  }
});
