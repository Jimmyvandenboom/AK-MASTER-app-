import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyProgress, loadProgress, recordAnswer, finishSession, countdown, examDate } from './storage.js';
import { questions } from './data.js';
test('antwoorden, herhaling en opgeslagen beste score', () => {
  let p = { ...emptyProgress, name: 'Sam' };
  for (const correct of [true, false, true, true, false]) p = recordAnswer(p, correct);
  p = finishSession(p, 3);
  assert.deepEqual(p, { name: 'Sam', xp: 60, answered: 5, sessions: 1, best: 3 });
  for (let i = 0; i < 5; i++) p = recordAnswer(p, false);
  p = finishSession(p, 0);
  assert.equal(p.best, 3); assert.equal(p.xp, 60); assert.equal(p.answered, 10); assert.equal(p.sessions, 2);
  assert.deepEqual(loadProgress({ getItem: () => JSON.stringify(p) }), p);
});
test('corrupte of geblokkeerde opslag', () => {
  assert.deepEqual(loadProgress({ getItem: () => '{broken' }), emptyProgress);
  assert.deepEqual(loadProgress({ getItem: () => { throw Error('blocked'); } }), emptyProgress);
});
test('Nederlandse zomertijd en verlopen aftelling', () => {
  assert.equal(examDate.toISOString(), '2027-05-21T07:00:00.000Z');
  assert.deepEqual(countdown(examDate.getTime() - 90061000), { days: 1, hours: 1, minutes: 1, seconds: 1, finished: false });
  assert.deepEqual(countdown(examDate.getTime() + 1), { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true });
});
test('vijf volledige vragen', () => {
  assert.equal(questions.length, 5);
  for (const q of questions) { assert.equal(q.options.length, 4); assert.ok(q.answer >= 0 && q.answer < 4); assert.ok(q.explanation.length > 40); }
});
