// Run against the local development API: node --test src/content.test.ts
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { hashPassword } from './auth.ts';
import { db } from './prisma/db.ts';

const base = 'http://localhost:3000';
let adminCookie = '';
let adminId = 0;
async function raw(path: string, init: RequestInit = {}) {
  return fetch(base + path, { ...init, headers: { 'Content-Type': 'application/json', Cookie: adminCookie, ...init.headers } });
}
async function publicRequest(path: string, method = 'GET', body?: unknown, status = 200) {
  const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = response.status === 204 ? null : await response.json();
  assert.equal(response.status, status, JSON.stringify(data));
  return { data, response };
}
before(async () => {
  const user = await db.orm.public.User.create({ email: `admin-${Date.now()}@example.com`, name: 'Test Admin', role: 'Admin', isActive: true, passwordHash: await hashPassword('Test password 123!') });
  adminId = user.id;
  const response = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, password: 'Test password 123!' }) });
  assert.equal(response.status, 200);
  adminCookie = response.headers.getSetCookie()[0]!.split(';')[0]!;
});
after(async () => { await db.orm.public.User.where({ id: adminId }).delete(); await db.close(); });
async function request(path: string, method = 'GET', body?: unknown, status = 200) {
  const response = await raw(path, {
    method, headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = response.status === 204 ? null : await response.json();
  assert.equal(response.status, status, JSON.stringify(data));
  return data;
}

test('Local Vite development ports can read API responses', async () => {
  const response = await raw('/topics', { headers: { Origin: 'http://localhost:5174' } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5174');
});

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
    const malformed = await raw('/topics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(malformed.status, 400);
  } finally {
    for (const id of materials) await raw(`/materials/${id}`, { method: 'DELETE' });
    for (const id of questions) await raw(`/questions/${id}`, { method: 'DELETE' });
    for (const id of topics) await raw(`/topics/${id}`, { method: 'DELETE' });
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
    for (const id of practiceSets) await raw(`/practice-sets/${id}`, { method: 'DELETE' });
    for (const id of questions) await raw(`/questions/${id}`, { method: 'DELETE' });
    for (const id of topics) await raw(`/topics/${id}`, { method: 'DELETE' });
  }
});

test('Participant practice payload hides answers and checks selected questions', async () => {
  const topics: number[] = [];
  const questions: number[] = [];
  const practiceSets: number[] = [];
  const title = `Participant practice ${Date.now()}`;
  try {
    const topic = await request('/topics', 'POST', { title }, 201);
    topics.push(topic.id);
    const first = await request('/questions', 'POST', {
      japaneseText: '日本では左側を走る。', indonesianTranslation: 'Di Jepang, berkendara di sisi kiri.',
      furigana: 'にほんではひだりがわをはしる。', correctAnswer: true,
      japaneseExplanation: '日本では左側通行です。', indonesianExplanation: 'Di Jepang kendaraan berjalan di sisi kiri.', topicId: topic.id,
    }, 201);
    const outside = await request('/questions', 'POST', {
      japaneseText: 'これは別の問題です。', indonesianTranslation: 'Ini pertanyaan lain.',
      correctAnswer: false, japaneseExplanation: '別の問題です。', indonesianExplanation: 'Pertanyaan lain.', topicId: topic.id,
    }, 201);
    questions.push(first.id, outside.id);
    const practiceSet = await request('/practice-sets', 'POST', { title, questionIds: [first.id] }, 201);
    practiceSets.push(practiceSet.id);

    const practice = await request(`/practice-sets/${practiceSet.id}/practice`);
    assert.equal(practice.questions.length, 1);
    assert.deepEqual(practice.questions[0], {
      id: first.id, japaneseText: first.japaneseText, indonesianTranslation: first.indonesianTranslation,
      furigana: first.furigana, position: 0,
    });
    assert.equal(JSON.stringify(practice).includes('correctAnswer'), false);
    assert.equal(JSON.stringify(practice).includes('japaneseExplanation'), false);
    assert.equal(JSON.stringify(practice).includes('indonesianExplanation'), false);

    const correct = await request(`/practice-sets/${practiceSet.id}/questions/${first.id}/check-answer`, 'POST', { answer: true });
    assert.deepEqual(correct, {
      isCorrect: true, correctAnswer: true,
      japaneseExplanation: first.japaneseExplanation, indonesianExplanation: first.indonesianExplanation,
    });
    const incorrect = await request(`/practice-sets/${practiceSet.id}/questions/${first.id}/check-answer`, 'POST', { answer: false });
    assert.equal(incorrect.isCorrect, false);
    assert.equal(incorrect.correctAnswer, true);
    await request(`/practice-sets/${practiceSet.id}/questions/${first.id}/check-answer`, 'POST', { answer: 'true' }, 400);
    await request('/practice-sets/abc/practice', 'GET', undefined, 400);
    await request(`/practice-sets/${practiceSet.id}/questions/abc/check-answer`, 'POST', { answer: true }, 400);
    await request('/practice-sets/2147483647/practice', 'GET', undefined, 404);
    await request(`/practice-sets/${practiceSet.id}/questions/2147483647/check-answer`, 'POST', { answer: true }, 404);
    await request(`/practice-sets/${practiceSet.id}/questions/${outside.id}/check-answer`, 'POST', { answer: false }, 404);
  } finally {
    for (const id of practiceSets) await raw(`/practice-sets/${id}`, { method: 'DELETE' });
    for (const id of questions) await raw(`/questions/${id}`, { method: 'DELETE' });
    for (const id of topics) await raw(`/topics/${id}`, { method: 'DELETE' });
  }
});

test('Authentication, invitation, reset, session revocation and authorization', async () => {
  const users: number[] = [];
  try {
    await publicRequest('/auth/register', 'POST', { email: 'public@example.com', password: 'Test password 123!' }, 401);
    await publicRequest('/auth/login', 'POST', { email: 'unknown@example.com', password: 'Test password 123!' }, 401);
    const inactive = await request('/admin/users', 'POST', { email: `inactive-${Date.now()}@example.com`, name: 'Inactive' }, 201);
    users.push(inactive.id);
    assert.equal(inactive.role, 'Participant');
    await publicRequest('/auth/login', 'POST', { email: inactive.email, password: 'Test password 123!' }, 401);

    const firstInvite = await request(`/admin/users/${inactive.id}/invitations`, 'POST');
    assert.match(firstInvite.url, /^http:\/\/localhost:5173\/invite\//);
    assert.ok(Math.abs(new Date(firstInvite.expiresAt).getTime() - (Date.now() + 72 * 60 * 60 * 1000)) < 10_000);
    const secondInvite = await request(`/admin/users/${inactive.id}/invitations`, 'POST');
    const firstToken = firstInvite.url.split('/').at(-1)!;
    const secondToken = secondInvite.url.split('/').at(-1)!;
    assert.equal((await publicRequest(`/auth/invitations/${firstToken}`)).data.valid, false);
    assert.equal((await publicRequest(`/auth/invitations/${secondToken}`)).data.valid, true);
    const invitation = (await db.orm.public.Invitation.where({ userId: inactive.id }).all()).at(-1)!;
    assert.notEqual(invitation.tokenHash, secondToken);
    assert.equal(invitation.tokenHash.includes(secondToken), false);
    await publicRequest(`/auth/invitations/${secondToken}`, 'POST', { password: 'Initial password 123!' }, 204);
    await publicRequest(`/auth/invitations/${secondToken}`, 'POST', { password: 'Initial password 123!' }, 400);
    await publicRequest('/auth/login', 'POST', { email: inactive.email, password: 'bad password' }, 401);
    const login = await publicRequest('/auth/login', 'POST', { email: inactive.email, password: 'Initial password 123!' });
    const participantCookie = login.response.headers.getSetCookie()[0]!.split(';')[0]!;
    const participantAdmin = await fetch(base + '/admin/users', { headers: { Cookie: participantCookie } });
    assert.equal(participantAdmin.status, 403);
    const participantPractice = await fetch(base + '/practice', { headers: { Cookie: participantCookie } });
    assert.equal(participantPractice.status, 200);
    const logout = await fetch(base + '/auth/logout', { method: 'POST', headers: { Cookie: participantCookie } });
    assert.equal(logout.status, 204);
    assert.match(logout.headers.getSetCookie()[0]!, /Max-Age=0/);
    assert.equal((await fetch(base + '/auth/session', { headers: { Cookie: participantCookie } })).status, 401);

    const expired = await request('/admin/users', 'POST', { email: `expired-${Date.now()}@example.com` }, 201);
    users.push(expired.id);
    const expiredInvite = await request(`/admin/users/${expired.id}/invitations`, 'POST');
    const expiredRecord = (await db.orm.public.Invitation.where({ userId: expired.id }).all()).at(-1)!;
    await db.orm.public.Invitation.where({ id: expiredRecord.id }).update({ expiresAt: new Date(Date.now() - 1000).toISOString() });
    assert.equal((await publicRequest(`/auth/invitations/${expiredInvite.url.split('/').at(-1)!}`)).data.valid, false);

    const activeLogin = await publicRequest('/auth/login', 'POST', { email: inactive.email, password: 'Initial password 123!' });
    const activeCookie = activeLogin.response.headers.getSetCookie()[0]!.split(';')[0]!;
    const firstReset = await request(`/admin/users/${inactive.id}/password-resets`, 'POST');
    assert.ok(Math.abs(new Date(firstReset.expiresAt).getTime() - (Date.now() + 60 * 60 * 1000)) < 10_000);
    const secondReset = await request(`/admin/users/${inactive.id}/password-resets`, 'POST');
    assert.equal((await publicRequest(`/auth/password-resets/${firstReset.url.split('/').at(-1)!}`)).data.valid, false);
    const resetToken = secondReset.url.split('/').at(-1)!;
    await publicRequest(`/auth/password-resets/${resetToken}`, 'POST', { password: 'Changed password 123!' }, 204);
    await publicRequest(`/auth/password-resets/${resetToken}`, 'POST', { password: 'Changed password 123!' }, 400);
    assert.equal((await fetch(base + '/auth/session', { headers: { Cookie: activeCookie } })).status, 401);
    await publicRequest('/auth/login', 'POST', { email: inactive.email, password: 'Initial password 123!' }, 401);
    await publicRequest('/auth/login', 'POST', { email: inactive.email, password: 'Changed password 123!' }, 200);

    const resetExpiry = await request(`/admin/users/${inactive.id}/password-resets`, 'POST');
    const resetRecord = (await db.orm.public.PasswordReset.where({ userId: inactive.id }).all()).at(-1)!;
    await db.orm.public.PasswordReset.where({ id: resetRecord.id }).update({ expiresAt: new Date(Date.now() - 1000).toISOString() });
    assert.equal((await publicRequest(`/auth/password-resets/${resetExpiry.url.split('/').at(-1)!}`)).data.valid, false);
  } finally {
    for (const id of users) await db.orm.public.User.where({ id }).delete();
  }
});
