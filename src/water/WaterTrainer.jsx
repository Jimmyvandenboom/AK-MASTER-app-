import React, { useEffect, useMemo, useRef, useState } from 'react';
import questions from './questions.json';
import QuestionCard from './QuestionCard';
import { formatLabels, getStats, readWaterProgress, recordResult, selectSession, themes, WATER_STORAGE_KEY } from './logic';
import './trainer.css';

function ThemeIcon({ type }) {
  return <svg viewBox="0 0 100 80" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2.5">
    {type === 'drop' ? <><path d="M50 8C40 24 27 35 27 48a23 23 0 0 0 46 0C73 35 60 24 50 8Z" fill="currentColor" fillOpacity=".12" /><path d="M38 47c-2 9 3 16 11 18" /><path d="M12 75h76M7 68h12M82 68h12" /></> : type === 'river' ? <><path d="M8 30 28 7l17 23 14-15 32 25" /><path d="M45 32c28 15-22 19-5 29s40 4 52 14M60 32c30 20-16 23 0 30s26 5 36 11" strokeWidth="4" /><path d="m28 7 5 15 6 0M59 15l4 12 7 0" /></> : <><circle cx="50" cy="40" r="31" fill="currentColor" fillOpacity=".12" /><ellipse cx="50" cy="40" rx="14" ry="31" /><path d="M19 40h62M25 22h50M25 58h50" /><path d="M7 10h10M12 5v10M82 69h10M87 64v10" /></>}
  </svg>;
}
const starters = ['2026-2-18', '2019-1-14', '2025-2-28', '2025-2-29', '2026-1-22'];
const intro = {
  bodem: ['Volg de regendruppel', 'Regen kan verdampen, afstromen of infiltreren. Tegels beperken infiltratie; een verzadigde bodem kan ook geen nieuwe regen meer opnemen. Drinkwaterkwaliteit gaat over hoe schoon en hoe zout het water is.'],
  rivieren: ['Lees stroomopwaarts → stroomafwaarts', 'Debiet is water per seconde; regiem is de verdeling van de afvoer door het jaar. Extra ruimte kan een afvoerpiek opvangen. Stuwen regelen het peil; dammen beïnvloeden ook sediment en vervoer.'],
  wereld: ['Vergelijk vraag met aanbod', 'Droogte beperkt het aanbod, terwijl bevolking en welvaart de vraag verhogen. Irrigatie kan verzilting veroorzaken. Bij een gedeelde rivier beïnvloedt gebruik stroomopwaarts de landen stroomafwaarts.'],
};
function initialProgress() { try { return readWaterProgress(localStorage, questions); } catch { return readWaterProgress({ getItem: () => null }, questions); } }
function hashQuestion() {
  const id = window.location.hash.replace(/^#water\/?/, '');
  return questions.some(q => q.id === id) ? id : null;
}
export default function WaterTrainer() {
  const [progress, setProgress] = useState(initialProgress);
  const [activeId, setActiveId] = useState(hashQuestion);
  const [theme, setTheme] = useState('all');
  const [year, setYear] = useState('all');
  const [format, setFormat] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(12);
  const [queue, setQueue] = useState(null);
  const [roundResults, setRoundResults] = useState({});
  const [summary, setSummary] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const bank = useRef(null); const hubTitle = useRef(null);
  const stats = getStats(questions, progress.records);
  const selectedTheme = themes.find(t => t.id === theme);
  const active = questions.find(q => q.id === activeId);
  useEffect(() => {
    try { localStorage.setItem(WATER_STORAGE_KEY, JSON.stringify(progress)); setStorageError(false); } catch { setStorageError(true); }
  }, [progress]);
  useEffect(() => { const listen = () => { setActiveId(hashQuestion()); setSummary(false); }; window.addEventListener('hashchange', listen); return () => window.removeEventListener('hashchange', listen); }, []);
  useEffect(() => { setLimit(12); }, [theme, year, status, format, search]);
  const filtered = useMemo(() => questions.filter(q =>
    (theme === 'all' || q.theme === theme) && (year === 'all' || q.year === Number(year)) &&
    (format === 'all' || q.kind === format) &&
    (status === 'all' || (status === 'fresh' && !progress.records[q.id] && q.kind !== 'excluded') || (status === 'retry' && progress.records[q.id]?.points < q.maxPoints) || (status === 'saved' && progress.bookmarks.includes(q.id))) &&
    `${q.title} ${q.prompt} ${q.year}`.toLocaleLowerCase('nl').includes(search.trim().toLocaleLowerCase('nl'))
  ).sort((a, b) => b.year - a.year || a.period - b.period || a.number - b.number), [theme, year, format, status, search, progress.records, progress.bookmarks]);
  function openQuestion(id) {
    setSummary(false); setActiveId(id); setProgress(p => ({ ...p, lastQuestion: id }));
    history.replaceState(null, '', `${location.pathname}${location.search}#water/${id}`);
  }
  function back() {
    setActiveId(null); setSummary(false); history.replaceState(null, '', `${location.pathname}${location.search}#water`);
    requestAnimationFrame(() => { hubTitle.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); });
  }
  function startRound(items = filtered) {
    const reordered = [...items].sort((a, b) => {
      const ai = starters.indexOf(a.id); const bi = starters.indexOf(b.id);
      return (ai < 0 ? 100 : ai) - (bi < 0 ? 100 : bi);
    });
    const ids = selectSession(reordered, progress.records, 5);
    if (!ids.length) return;
    setQueue(ids); setRoundResults({}); openQuestion(ids[0]);
  }
  function result(response, value) {
    setProgress(p => recordResult(p, active, response, value));
    setRoundResults(p => ({ ...p, [active.id]: value }));
  }
  function next() {
    if (queue?.includes(activeId)) {
      const index = queue.indexOf(activeId);
      if (index + 1 === queue.length) { setActiveId(null); setSummary(true); history.replaceState(null, '', `${location.pathname}${location.search}#water`); window.scrollTo({ top: 0, behavior: 'instant' }); }
      else openQuestion(queue[index + 1]);
    } else {
      const index = filtered.findIndex(q => q.id === activeId);
      if (index >= 0 && index + 1 < filtered.length) openQuestion(filtered[index + 1].id);
      else back();
    }
  }
  function chooseTheme(id) { setTheme(id); setStatus('all'); setYear('all'); setFormat('all'); setSearch(''); requestAnimationFrame(() => bank.current?.scrollIntoView({ behavior: 'instant', block: 'start' })); }
  const warning = storageError && <p className="water-storage-warning" role="alert">Je browser kan je antwoorden en voortgang niet bewaren. Je kunt oefenen, maar na herladen kunnen je gegevens verdwijnen.</p>;
  if (active) return <div className="water-trainer">{warning}<QuestionCard key={active.id} question={active} savedDraft={progress.draft} savedResult={progress.records[active.id]} onDraft={draft => setProgress(p => ({ ...p, draft }))} onResult={result} onNext={next} onBack={back} bookmarked={progress.bookmarks.includes(active.id)} onBookmark={() => setProgress(p => ({ ...p, bookmarks: p.bookmarks.includes(active.id) ? p.bookmarks.filter(id => id !== active.id) : [...p.bookmarks, active.id] }))} sessionPosition={queue?.includes(active.id) ? `${queue.indexOf(active.id) + 1} / ${queue.length}` : null} /></div>;
  if (summary) {
    const items = (queue ?? []).map(id => questions.find(q => q.id === id));
    const reviewed = items.filter(q => roundResults[q.id]);
    const points = reviewed.reduce((sum, q) => sum + roundResults[q.id].points, 0);
    const max = reviewed.reduce((sum, q) => sum + q.maxPoints, 0);
    return <div className="water-trainer">{warning}<section className="round-summary water-surface"><span className="water-kicker">JOUW OEFENRONDE</span><h1>Dat was een duik in Water.</h1><p>{reviewed.length} vragen nagekeken · {points} / {max} punten</p><p className="field-help">Open vragen zijn door jou beoordeeld. Dit is een oefenresultaat, geen officieel examencijfer.</p><ul>{reviewed.map(q => <li key={q.id}><span><strong>{q.title}</strong><small>{q.year} · tijdvak {q.period} · vraag {q.number}</small></span><span>{roundResults[q.id].points}/{q.maxPoints} <small>{roundResults[q.id].method === 'self' ? 'zelf beoordeeld' : 'nagekeken'}</small></span></li>)}</ul><div className="question-actions"><button className="water-button primary" onClick={() => startRound(questions.filter(q => roundResults[q.id]?.points < q.maxPoints))} disabled={!reviewed.some(q => roundResults[q.id].points < q.maxPoints)}>Oefen wat nog lastig was ↻</button><button className="water-button" onClick={back}>Terug naar de trainer</button></div></section></div>;
  }
  return <div className="water-trainer">{warning}
    <section className="trainer-hero"><div><span className="water-kicker">EXAMENTRAINER · WATER</span><h1 ref={hubTitle} tabIndex={-1}>Niet alleen weten.<br /><em>Ook begrijpen.</em></h1><p>Echte examenvragen. Eén vraag tegelijk. Leer van je antwoord en duik daarna een stap dieper.</p><div className="trainer-hero-actions"><button className="water-button primary" onClick={() => startRound(questions)}>Begin met 5 vragen →</button>{progress.lastQuestion && <button className="water-button hero-secondary" onClick={() => { setQueue(null); openQuestion(progress.lastQuestion); }}>Ga verder waar je was</button>}</div><span className="trainer-facts">245 officiële Water-vragen · 2018–2026 · GL/TL</span></div><div className="trainer-art" aria-hidden="true"><svg viewBox="0 0 220 220" fill="none"><circle cx="110" cy="110" r="92" stroke="currentColor" opacity=".25"/><circle cx="110" cy="110" r="72" stroke="currentColor" opacity=".35"/><path d="M110 23C87 65 60 89 60 127a50 50 0 0 0 100 0c0-38-27-62-50-104Z" fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="2"/><path d="M52 125q25-15 55 0t63 0M60 147q20-14 47 0t57 0" stroke="currentColor" strokeWidth="3"/><path d="M83 96c-10 15-12 26-10 35" stroke="#ffb780" strokeWidth="5" strokeLinecap="round"/></svg><span>Lees. Denk. Begrijp.</span></div></section>
    <section className="trainer-progress water-surface"><div><strong>{stats.reviewed} / {stats.total}</strong><span>verschillende vragen nagekeken</span></div><progress value={stats.reviewed} max={stats.total} aria-label="Aantal verschillende nagekeken Water-vragen" /><p>{stats.automatic} automatisch · {stats.self} zelf beoordeeld. Herhaling telt niet dubbel. Eén vraag met een foutieve bron valt buiten de scoring.</p><div className="progress-links"><button onClick={() => { setStatus('retry'); setTheme('all'); bank.current?.scrollIntoView({ behavior: 'instant' }); }}>↻ {stats.retry} om opnieuw te oefenen</button><button onClick={() => { setStatus('saved'); setTheme('all'); bank.current?.scrollIntoView({ behavior: 'instant' }); }}>☆ {progress.bookmarks.length} bewaard</button></div></section>
    <section className="theme-section" aria-label="Drie Water-thema’s"><div className="trainer-section-heading"><span className="water-kicker">KIES JOUW LEERROUTE</span><h2>Water in drie werelden.</h2></div><div className="water-themes">{themes.map(t => { const items = questions.filter(q => q.theme === t.id); const s = getStats(items, progress.records); return <button className={`water-theme ${t.color} ${theme === t.id ? 'theme-selected' : ''}`} key={t.id} onClick={() => chooseTheme(t.id)} aria-pressed={theme === t.id}><div className="theme-visual"><span>{t.number}</span><ThemeIcon type={t.icon} /></div><h3>{t.name}</h3><p>{t.description}</p><div className="theme-card-footer"><span>{items.length} vragen · {s.reviewed} nagekeken</span><span aria-hidden="true">↗</span></div></button>; })}</div></section>
    <section ref={bank} className="question-bank" aria-label="Water-vragenbank"><div className="trainer-section-heading"><span className="water-kicker">JOUW VRAGENBANK</span><h2>{selectedTheme?.name ?? 'Alle Water-vragen'}</h2><p>Kies zelf, oefen vijf vragen of pak terug wat nog lastig was.</p></div>
      {selectedTheme && <details className="theme-primer"><summary>Kort onthouden · {intro[theme][0]}</summary><p>{intro[theme][1]}</p></details>}
      <div className="bank-filters"><label>Zoek een onderwerp<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Bijvoorbeeld: verzilting, kwel, dam" /></label><label>Thema<select aria-label="Thema" value={theme} onChange={e => setTheme(e.target.value)}><option value="all">Alle drie thema’s</option>{themes.map(t => <option key={t.id} value={t.id}>{t.short}</option>)}</select></label><label>Examenjaar<select aria-label="Examenjaar" value={year} onChange={e => setYear(e.target.value)}><option value="all">Alle jaren</option>{[2026, 2025, 2024, 2023, 2022, 2021, 2019, 2018].map(y => <option key={y}>{y}</option>)}</select></label><label>Vraagvorm<select aria-label="Vraagvorm" value={format} onChange={e => setFormat(e.target.value)}><option value="all">Alle vraagvormen</option>{Object.entries(formatLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label>Mijn route<select aria-label="Mijn route" value={status} onChange={e => setStatus(e.target.value)}><option value="all">Alle vragen</option><option value="fresh">Nog niet nagekeken</option><option value="retry">Opnieuw oefenen</option><option value="saved">Bewaarde vragen</option></select></label></div>
      <div className="bank-toolbar"><span role="status">{filtered.length} {filtered.length === 1 ? 'vraag' : 'vragen'}</span><button className="water-button small" onClick={() => startRound()} disabled={!filtered.some(q => q.kind !== 'excluded')}>Oefen 5 uit deze selectie →</button></div>
      {!filtered.length ? <div className="empty-bank"><h3>Hier staan nog geen vragen.</h3><p>Pas je filters aan. Bewaar een vraag met het sterretje, of begin een oefenronde.</p><button className="water-button" onClick={() => { setTheme('all'); setYear('all'); setFormat('all'); setStatus('all'); setSearch(''); }}>Toon alle vragen</button></div> : <div className="question-list">{filtered.slice(0, limit).map(q => { const r = progress.records[q.id]; return <button key={q.id} className="question-list-item" onClick={() => { setQueue(null); openQuestion(q.id); }}><span className={`question-type-icon ${q.kind === 'open' ? 'open-icon' : ''}`} aria-hidden="true">{q.kind === 'open' ? '✎' : q.kind === 'excluded' ? '!' : '◎'}</span><span className="question-list-content"><strong>{q.title}</strong><small>{q.year} · tijdvak {q.period} · vraag {q.number} · {formatLabels[q.kind]}</small></span><span className="question-list-score">{q.kind === 'excluded' ? 'Buiten scoring' : r ? `${r.points}/${q.maxPoints}` : `${q.maxPoints} ${q.maxPoints === 1 ? 'punt' : 'punten'}`}<small>{r ? r.method === 'self' ? 'zelf beoordeeld' : 'nagekeken' : progress.bookmarks.includes(q.id) ? '★ bewaard' : '→'}</small></span></button>; })}</div>}
      {filtered.length > limit && <button className="water-button load-more" onClick={() => setLimit(n => n + 24)}>Meer vragen tonen ({filtered.length - limit})</button>}
    </section>
    <aside className="trainer-source-note"><strong>Echte vragen, eigen uitleg</strong><p>Opgaven en correctievoorschriften komen van Examenblad / CvTE. Onze uitleg helpt je het verband te begrijpen. De officiële wijzigingen zijn verwerkt. 2020 ontbreekt omdat de centrale examens zijn afgelast. De aansluiting op de syllabus 2027 is nog niet gecontroleerd.</p><p>Je antwoorden en voortgang blijven in deze browser. De trainer heeft geen account of docentendashboard. De aparte H7-oefentoets blijft beschikbaar in de app. De korte quiz houdt zijn eigen XP; deze trainer bewaart je antwoorden en punten apart.</p></aside>
  </div>;
}
