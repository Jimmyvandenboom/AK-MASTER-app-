import test from 'node:test';
import assert from 'node:assert/strict';
import {gradeOpenAnswer} from '../supabase/functions/exam-quest/open-review.js';

const answer = {key: 'test', question: 'Waarom stijgt het debiet?', rubric: 'Meer neerslag', answer: 'Er valt meer regen.', maxPoints: 2};
const provider = review => async (_url, options) => {
  const body = JSON.parse(options.body);
  assert.equal(body.store, false);
  assert.deepEqual(Object.keys(JSON.parse(body.input)).sort(), ['answer', 'maxPoints', 'question', 'rubric']);
  return Response.json({status: 'completed', output: [{content: [{type: 'output_text', text: JSON.stringify(review)}]}]});
};

test('AI-review keeps a valid partial score and a clear next step', async () => {
  const review = {points: 1, feedback: 'Je noemt meer neerslag.', nextStep: 'Leg uit hoe het water in de rivier komt.'};
  assert.deepEqual(await gradeOpenAnswer(answer, provider(review)), {...review, maxPoints: 2});
});

test('AI-review rejects scores above the exam maximum', async () => {
  await assert.rejects(gradeOpenAnswer(answer, provider({points: 3, feedback: 'Goed', nextStep: 'Ga verder'})), /Invalid review/);
});
