export const WATER_STORAGE_KEY = 'ak-master-water-v1';
export const themes = [
  { id: 'nederland', number: '01', name: 'Water in Nederland', short: 'Nederland', description: 'Drinkwater, rivieren, kustbescherming en wateroverlast. Ook de basis van de waterkringloop.', icon: 'drop', color: 'blue' },
  { id: 'china', number: '02', name: 'Water in China', short: 'China', description: 'Grote rivieren, stuwdammen, waterverdeling en sponssteden. Van Huang He tot Chang Jiang.', icon: 'river', color: 'green' },
  { id: 'midden-oosten', number: '03', name: 'Water in het Midden-Oosten', short: 'Midden-Oosten', description: 'Waterschaarste, irrigatie en waterconflicten. Inclusief Egypte en het stroomgebied van de Nijl.', icon: 'globe', color: 'orange' },
];
export const formatLabels = { choice: 'Meerkeuze', statements: 'Juist / onjuist', shorts: 'Invullen', sequence: 'Volgorde', multi: 'Selecteren', open: 'Open vraag', excluded: 'Bron met correctie' };
export function normalize(value) {
  return String(value ?? '').normalize('NFKC').toLocaleLowerCase('nl').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
}
const aliases = { 'de zon': ['zon'], 'het zand': ['zand'], 'opgeslagen als sneeuw en ijs': ['sneeuw en ijs'], 'niet-duurzaam': ['niet duurzaam'] };
export function matches(value, expected) {
  const actual = normalize(value); const target = normalize(expected);
  return actual === target || (aliases[target] ?? []).includes(actual);
}
function bandScore(question, correctCount) {
  return (question.bands ?? [[Object.keys(question.expected ?? {}).length, question.maxPoints], [0, 0]]).find(([threshold]) => correctCount >= threshold)?.[1] ?? 0;
}
export function grade(question, response) {
  if (question.kind === 'open' || question.kind === 'excluded') return null;
  if (question.kind === 'choice') return { points: response === question.correct ? question.maxPoints : 0, method: 'automatic', details: [{ label: 'Antwoord', actual: response, expected: question.correct, correct: response === question.correct }] };
  if (question.kind === 'statements' || question.kind === 'shorts') {
    const details = Object.entries(question.expected).map(([key, expected]) => ({ label: question.kind === 'statements' ? `Uitspraak ${key}` : `Plek ${key}`, actual: response?.[key] ?? '', expected, correct: matches(response?.[key], expected), explanation: question.statementExplanations?.[Number(key) - 1] }));
    return { points: bandScore(question, details.filter(d => d.correct).length), method: 'automatic', details };
  }
  if (question.kind === 'multi') {
    const selected = Array.isArray(response) ? response : [];
    const count = selected.filter(v => question.correctValues.includes(v)).length;
    return { points: selected.length === question.pick ? bandScore(question, count) : 0, method: 'automatic', details: [{ label: 'Selectie', actual: selected.join(', '), expected: question.correctValues.join(', '), correct: selected.length === question.pick && count === question.pick }] };
  }
  if (question.kind === 'sequence') {
    const sequence = Array.isArray(response) ? response : [];
    const exact = JSON.stringify(sequence) === JSON.stringify(question.sequence);
    const partial = question.partialRemoval && sequence.length === question.sequence.length && new Set(sequence).size === sequence.length && question.sequence.every(v => sequence.includes(v)) && question.sequence.some(v => JSON.stringify(sequence.filter(x => x !== v)) === JSON.stringify(question.sequence.filter(x => x !== v)));
    return { points: exact ? question.maxPoints : partial ? 1 : 0, method: 'automatic', details: [{ label: 'Volgorde', actual: sequence.join(' → '), expected: question.sequence.join(' → '), correct: exact }] };
  }
  return null;
}
export function canSubmit(question, response) {
  if (question.kind === 'excluded') return true;
  if (question.kind === 'choice' || question.kind === 'open') return Boolean(String(response ?? '').trim());
  if (question.kind === 'statements' || question.kind === 'shorts') return Object.keys(question.expected).every(key => String(response?.[key] ?? '').trim());
  if (question.kind === 'multi') return Array.isArray(response) && response.length === question.pick;
  if (question.kind === 'sequence') return Array.isArray(response) && response.length === question.sequence.length && response.every(Boolean) && new Set(response).size === response.length;
  return false;
}
export function emptyResponse(question) {
  if (['statements', 'shorts'].includes(question.kind)) return {};
  if (question.kind === 'multi') return [];
  if (question.kind === 'sequence') return Array(question.sequence.length).fill('');
  return '';
}
export function readWaterProgress(storage, questions) {
  const empty = { records: {}, bookmarks: [], draft: null, lastQuestion: null };
  try {
    const data = JSON.parse(storage.getItem(WATER_STORAGE_KEY));
    if (!data || typeof data !== 'object') return empty;
    const known = new Map(questions.map(q => [q.id, q]));
    const records = {};
    for (const [id, record] of Object.entries(data.records ?? {})) {
      const q = known.get(id);
      if (!q || q.kind === 'excluded' || !record || !Number.isInteger(record.points) || record.points < 0 || record.points > q.maxPoints) continue;
      const method = q.kind === 'open' ? 'self' : 'automatic';
      if (record.method !== method) continue;
      records[id] = { points: record.points, method, attempts: Number.isSafeInteger(record.attempts) && record.attempts > 0 ? record.attempts : 1, response: sanitizeResponse(q, record.response), updated: typeof record.updated === 'string' ? record.updated : '' };
    }
    return { records, bookmarks: [...new Set(Array.isArray(data.bookmarks) ? data.bookmarks.filter(id => known.has(id)) : [])], draft: known.has(data.draft?.id) && data.draft?.response != null ? { id: data.draft.id, response: sanitizeResponse(known.get(data.draft.id), data.draft.response) } : null, lastQuestion: known.has(data.lastQuestion) ? data.lastQuestion : null };
  } catch { return empty; }
}
export function recordResult(progress, question, response, result) {
  if (!result || question.kind === 'excluded') return progress;
  return { ...progress, draft: null, lastQuestion: question.id, records: { ...progress.records, [question.id]: { points: result.points, method: result.method, response, attempts: (progress.records[question.id]?.attempts ?? 0) + 1, updated: new Date().toISOString() } } };
}
export function getStats(questions, records) {
  const scored = questions.filter(q => q.kind !== 'excluded');
  const reviewed = scored.filter(q => records[q.id]);
  return { total: scored.length, reviewed: reviewed.length, retry: reviewed.filter(q => records[q.id].points < q.maxPoints).length, automatic: reviewed.filter(q => records[q.id].method === 'automatic').length, self: reviewed.filter(q => records[q.id].method === 'self').length };
}
export function selectSession(questions, records, count = 5) {
  const active = questions.filter(q => q.kind !== 'excluded');
  const pending = active.filter(q => records[q.id] && records[q.id].points < q.maxPoints);
  const fresh = active.filter(q => !records[q.id]);
  const done = active.filter(q => records[q.id]?.points === q.maxPoints);
  // Deterministic order makes resuming and interpreting a session straightforward.
  return [...pending, ...fresh, ...done].slice(0, count).map(q => q.id);
}

export function sanitizeResponse(question, value) {
  if (question.kind === 'open') return typeof value === 'string' ? value.slice(0, 6000) : '';
  if (question.kind === 'choice') return question.options.some(o => o.value === value) ? value : '';
  if (['statements', 'shorts'].includes(question.kind)) return Object.fromEntries(Object.keys(question.expected).map(key => [key, typeof value?.[key] === 'string' ? value[key].slice(0, 120) : '']));
  if (question.kind === 'multi') return Array.isArray(value) ? [...new Set(value.filter(v => question.values.includes(v)))].slice(0, question.pick) : [];
  if (question.kind === 'sequence') return question.sequence.map((_, index) => question.sequence.includes(value?.[index]) ? value[index] : '');
  return '';
}
