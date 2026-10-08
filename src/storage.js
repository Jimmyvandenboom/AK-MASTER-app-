export const STORAGE_KEY = 'ak-master-v1';
export const emptyProgress = { name: '', xp: 0, answered: 0, sessions: 0, best: 0 };
export function loadProgress(storage) {
  try {
    const data = JSON.parse(storage.getItem(STORAGE_KEY));
    if (!data || typeof data !== 'object') return { ...emptyProgress };
    const number = (key) => Number.isSafeInteger(data[key]) && data[key] >= 0 ? data[key] : 0;
    return { name: typeof data.name === 'string' ? data.name.trim().slice(0, 30) : '', xp: number('xp'), answered: number('answered'), sessions: number('sessions'), best: Math.min(5, number('best')) };
  } catch { return { ...emptyProgress }; }
}
export function recordAnswer(progress, correct) {
  return { ...progress, xp: progress.xp + (correct ? 20 : 0), answered: progress.answered + 1 };
}
export function finishSession(progress, score) {
  return { ...progress, sessions: progress.sessions + 1, best: Math.max(progress.best, score) };
}
export const examDate = new Date('2027-05-21T09:00:00+02:00');
export function countdown(now) {
  const seconds = Math.max(0, Math.floor((examDate.getTime() - now) / 1000));
  return { days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24, minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60, finished: now >= examDate.getTime() };
}
