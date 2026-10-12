import React, { useEffect, useRef, useState } from 'react';
import SourceViewer from './SourceViewer';
import { canSubmit, emptyResponse, formatLabels, grade } from './logic';

function AnswerFields({ question: q, value, onChange, disabled }) {
  if (q.kind === 'choice') return <fieldset className="water-options"><legend>Kies één antwoord</legend>{q.options.map(option => <label key={option.value} className={`water-option ${value === option.value ? 'chosen' : ''}`}><input type="radio" name={q.id} value={option.value} checked={value === option.value} disabled={disabled} onChange={() => onChange(option.value)} /><span className="option-letter">{option.value}</span><span className="option-copy">{option.parts ? option.parts.map(part => <span className="option-column" key={part.label}><small>{part.label}</small><strong>{part.value}</strong></span>) : option.label}</span></label>)}</fieldset>;
  if (q.kind === 'statements') return <fieldset className="statement-options"><legend>Beoordeel elke uitspraak</legend>{Object.keys(q.expected).map(key => <div className="statement-row" key={key}><p><strong>{key}.</strong> {q.statements[key]}</p><div className="binary-options">{['juist', 'onjuist'].map(choice => <label key={choice} className={value?.[key] === choice ? 'chosen' : ''}><input type="radio" name={`${q.id}-${key}`} checked={value?.[key] === choice} disabled={disabled} onChange={() => onChange({ ...value, [key]: choice })} />{choice === 'juist' ? 'Juist' : 'Onjuist'}</label>)}</div></div>)}</fieldset>;
  if (q.kind === 'shorts') return <fieldset className="short-fields"><legend>Vul de gevraagde keuzes in</legend><p className="field-help">Gebruik de woorden, cijfers of letters uit de opgave of bron. Hoofdletters maken niet uit.</p>{Object.keys(q.expected).map(key => <label key={key}>Plek {key}<input value={value?.[key] ?? ''} disabled={disabled} onChange={e => onChange({ ...value, [key]: e.target.value })} maxLength={120} autoComplete="off" placeholder="Jouw keuze uit de bron" /></label>)}</fieldset>;
  if (q.kind === 'sequence') return <fieldset className="sequence-fields"><legend>Zet de onderdelen in de juiste volgorde</legend><p className="field-help">Kies voor elke plek een ander onderdeel. Lees de bron om te bepalen wat eerst gebeurt.</p>{q.sequence.map((_, index) => <label key={index}>Plek {index + 1}<select aria-label={`Volgorde plek ${index + 1}`} disabled={disabled} value={value?.[index] ?? ''} onChange={e => { const next = [...value]; next[index] = e.target.value; onChange(next); }}><option value="">Kies…</option>{[...q.sequence].sort().map(item => <option key={item} value={item}>{item}</option>)}</select></label>)}</fieldset>;
  if (q.kind === 'multi') return <fieldset className="multi-fields"><legend>Selecteer precies {q.pick} cijfers uit de bron</legend><p className="field-help">Lees eerst de begrippenlijst op de bronpagina.</p><div>{q.values.map(item => <label key={item} className={value.includes(item) ? 'chosen' : ''}><input type="checkbox" checked={value.includes(item)} disabled={disabled || (value.length >= q.pick && !value.includes(item))} onChange={() => onChange(value.includes(item) ? value.filter(v => v !== item) : [...value, item].sort())} />{item}</label>)}</div></fieldset>;
  return <label className="open-answer">Jouw antwoord<textarea aria-label="Jouw antwoord" rows={5} value={value} disabled={disabled} maxLength={6000} onChange={e => onChange(e.target.value)} placeholder="Leg het uit in je eigen woorden. Als de vraag twee dingen vraagt, schrijf beide op." /><span className="field-help">Dit is een open examenvraag. Je vergelijkt je antwoord straks zelf met het officiële model.</span></label>;
}
function Feedback({ question: q, result, answer }) {
  const isSelf = q.kind === 'open';
  const complete = result?.points === q.maxPoints;
  return <section className="water-feedback" aria-label="Uitleg en nakijken">
    <div className={`feedback-banner ${result && !complete ? 'needs-work' : ''}`} role="status"><span aria-hidden="true">{!result ? '◎' : complete ? '✓' : '↻'}</span><div><strong>{!result ? 'Vergelijk rustig met het model' : complete ? isSelf ? 'Volgens jou is je antwoord compleet' : 'Alle antwoordelementen kloppen' : result.points ? 'Een deel klopt al' : 'Hier kun je van leren'}</strong><p>{result ? `${result.points} / ${q.maxPoints} ${q.maxPoints === 1 ? 'punt' : 'punten'} · ${isSelf ? 'door jou beoordeeld' : 'automatisch nagekeken'}` : 'Je open antwoord wordt niet automatisch als goed of fout beoordeeld.'}</p></div></div>
    {isSelf && <div className="your-answer"><h3>Jouw antwoord</h3><p>{answer}</p></div>}
    {result?.details && <ul className="answer-comparison">{result.details.map((d, i) => <li key={i} className={d.correct ? 'matches' : 'differs'}><strong>{d.correct ? '✓' : '↻'} {d.label}</strong><span>Jij: {d.actual || 'geen antwoord'} · Verwacht: {d.expected}</span>{d.explanation && <p>{d.explanation}</p>}</li>)}</ul>}
    {q.kind === 'choice' && <div className="model-choice"><strong>Juiste antwoord: {q.correct}</strong><p>{q.options.find(o => o.value === q.correct)?.label}</p>{result?.points === 0 && <p>Je koos {answer}. {q.distractors?.[answer] ?? q.pitfall}</p>}</div>}
    <div className="explanation-block"><span className="water-kicker">UITLEG VAN AK MASTER</span><h3>Waarom is dit het antwoord?</h3><p>{q.explanation}</p></div>
    <div className="pitfall-block"><h3>{result?.points === 0 ? 'Waar je antwoord kan ontsporen' : 'Let hier goed op'}</h3><p>{q.pitfall}</p></div>
    <details className="official-model" open={isSelf}><summary>Officieel correctievoorschrift · maximaal {q.maxPoints} {q.maxPoints === 1 ? 'punt' : 'punten'}</summary><p>{q.kind === 'choice' ? q.correct : q.officialAnswer.replace(/\s*([•–])\s*/g, '\n$1 ').replace(/\s+(Opmerkingen?|indien|per juist)/g, '\n$1')}</p><a href={q.correctionUrl} target="_blank" rel="noopener noreferrer">Controleer het officiële model op Examenblad ↗</a></details>
    {q.amendment && <p className="amendment-note">{q.amendment} <a href={q.amendmentUrl} target="_blank" rel="noopener noreferrer">Lees de officiële wijziging ↗</a></p>}
  </section>;
}
export default function QuestionCard({ question: q, savedDraft, onDraft, onResult, onNext, onBack, savedResult, bookmarked, onBookmark, sessionPosition }) {
  const [answer, setAnswer] = useState(savedDraft?.id === q.id ? savedDraft.response : emptyResponse(q));
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState('question');
  const title = useRef(null); const feedback = useRef(null); const scored = useRef(false);
  useEffect(() => { title.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }, [q.id]);
  function change(value) { setAnswer(value); onDraft({ id: q.id, response: value }); }
  function submit(e) {
    e.preventDefault();
    if (revealed || !canSubmit(q, answer)) return;
    const next = grade(q, answer); setRevealed(true); setResult(next); setTab('feedback');
    if (next && !scored.current) { scored.current = true; onResult(answer, next); }
    requestAnimationFrame(() => feedback.current?.focus());
  }
  function selfGrade(points) {
    if (scored.current) return;
    scored.current = true; const next = { points, method: 'self' }; setResult(next); onResult(answer, next);
  }
  function retry() { setAnswer(emptyResponse(q)); setRevealed(false); setResult(null); setTab('question'); scored.current = false; onDraft(null); title.current?.focus(); }
  const excluded = q.kind === 'excluded';
  return <article className="water-question">
    <div className="question-top"><button className="water-text-button" onClick={onBack}>← Alle vragen</button><button className="bookmark-button" onClick={onBookmark} aria-pressed={bookmarked}>{bookmarked ? '★ Bewaard' : '☆ Bewaar vraag'}</button></div>
    <div className="question-meta"><span>{q.year} · tijdvak {q.period} · vraag {q.number}</span><span>{formatLabels[q.kind]}{!excluded && ` · ${q.maxPoints} ${q.maxPoints === 1 ? 'punt' : 'punten'}`}</span></div>
    {sessionPosition && <p className="session-position">Jouw oefenronde · {sessionPosition}</p>}
    <h2 ref={title} tabIndex={-1}>{q.title}</h2>
    {savedResult && !revealed && <p className="last-result">Eerder: {savedResult.points}/{q.maxPoints} · {savedResult.method === 'self' ? 'zelf beoordeeld' : 'nagekeken'}. Je kunt deze vraag opnieuw doen.</p>}
    <div className="question-tabs" aria-label="Vraagonderdelen"><button onClick={() => setTab('question')} aria-pressed={tab === 'question'}>Vraag</button><button onClick={() => setTab('sources')} aria-pressed={tab === 'sources'}>Bronnen <span>{q.sourcePages.length}</span></button>{revealed && <button onClick={() => setTab('feedback')} aria-pressed={tab === 'feedback'}>Uitleg</button>}</div>
    {tab === 'sources' && <SourceViewer question={q} />}
    {tab === 'question' && <div className="question-sheet">
      {q.amendment && <p className="amendment-note">{q.amendment}</p>}
      <div className="source-nudge"><span aria-hidden="true">▦</span><div><strong>Begin met de bron</strong><p>De originele kaart, foto, tekst of tabel hoort bij deze vraag.</p></div><button className="water-button small" onClick={() => setTab('sources')}>Bekijk bronnen</button></div>
      <p className="exam-prompt">{q.prompt}</p>
      {q.transcriptionNote && <p className="field-help">{q.transcriptionNote}</p>}{q.table && <p className="table-note">Deze vraag bevat een antwoordtabel. Bekijk de oorspronkelijke tabel onder Bronnen om de kolommen goed te lezen.</p>}
      {excluded ? <div className="excluded-explanation"><h3>Van deze bron kun je wel leren</h3><p>{q.explanation}</p><p>{q.pitfall}</p><a href={q.amendmentUrl} target="_blank" rel="noopener noreferrer">Officiële aanvulling ↗</a><button className="water-button" onClick={onNext}>Volgende vraag →</button></div> : <form onSubmit={submit}><AnswerFields question={q} value={answer} onChange={change} disabled={revealed} />{!revealed && <button className="water-button primary" type="submit" disabled={!canSubmit(q, answer)}>{q.kind === 'open' ? 'Vergelijk mijn antwoord' : 'Nakijken'} →</button>}{!revealed && <p className="field-help">Geen tijdsdruk. Je invoer blijft bewaard in deze browser.</p>}{revealed && <button className="water-button" type="button" onClick={() => setTab('feedback')}>Bekijk je uitleg →</button>}</form>}
    </div>}
    {tab === 'feedback' && revealed && <div ref={feedback} tabIndex={-1} className="feedback-focus"><Feedback question={q} result={result} answer={answer} />{q.kind === 'open' && !result && <fieldset className="self-grade"><legend>Hoeveel punten verdient jouw antwoord?</legend><p>{q.rubricNote}</p><div>{Array.from({ length: q.maxPoints + 1 }, (_, points) => <button key={points} className="water-button" onClick={() => selfGrade(points)}>{points} / {q.maxPoints}{points === 0 ? ' · Nog niet' : points === q.maxPoints ? ' · Alles klopt' : ' · Deels'}</button>)}</div></fieldset>}<div className="question-actions"><button className="water-button primary" onClick={onNext} disabled={!result}>Volgende vraag →</button><button className="water-button" onClick={retry}>Opnieuw proberen ↻</button></div></div>}
    <div className="question-attribution"><span>Officiële vraag · Examenblad / CvTE · GL/TL</span><a href={q.sourceUrl} target="_blank" rel="noopener noreferrer">Opgavenboekje ↗</a><p>Uitleg en thematische indeling zijn van AK MASTER. Historische examenstof; de aansluiting op de syllabus 2027 is nog niet gecontroleerd.</p></div>
  </article>;
}
