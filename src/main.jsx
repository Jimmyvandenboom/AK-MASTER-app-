import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { questions, topics } from './data';
import { STORAGE_KEY, loadProgress, recordAnswer, finishSession, countdown } from './storage';
import './styles.css';
import './geo-future.css';

function MapArtwork() {
  return <svg className="map-artwork" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <g fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".45">
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M ${310 + i * 22} 760 C ${110 + i * 20} ${440 - i * 14}, ${450 - i * 13} ${30 + i * 10}, ${650 + i * 23} ${150 + i * 25} S ${900 + i * 22} ${660 - i * 25}, 1300 ${250 + i * 20}`} />)}
    </g>
    <path d="M780 40 930 240 890 370 1080 690" fill="none" stroke="#d7ef8780" strokeWidth="2" strokeDasharray="10 14" />
    <g fill="#67adb3" opacity=".25"><path d="M480 700 790 380 980 520 1170 350 1300 700Z" /><path d="M610 700 790 380 890 590 1170 350 1100 700Z" opacity=".65" /></g>
    <g opacity=".32">
      <path d="M520 700 655 470 695 487 735 465 890 700Z" fill="#8abbb3" />
      <path d="M655 470 695 487 735 465 719 519 693 510 670 524Z" fill="#f2f0e4" />
      <path d="M681 472 Q668 440 692 419 Q712 398 699 377" fill="none" stroke="#ffb780" strokeWidth="3" strokeDasharray="6 9" />
      <path d="M680 484 690 542 708 587" fill="none" stroke="#ffb780" strokeWidth="3" />
    </g>
    <text x="1050" y="25" textAnchor="middle" fill="#d7ef87" fontSize="18" fontWeight="700" letterSpacing="3">N</text>
    <g transform="translate(1050 110)" fill="none" stroke="#d7ef87" opacity=".5"><circle r="62" /><circle r="48" strokeDasharray="2 9" /><path d="M0-78 12 0 0 78-12 0Z" fill="#d7ef87" stroke="none" /><path d="M-78 0 0-12 78 0 0 12Z" fill="#bce2d3" stroke="none" /><path d="M0-78 12 0 0-10Z" fill="#ffb780" stroke="none" /></g>
  </svg>;
}

function Progress({ value, max = 5, label }) {
  return <div className="progress-wrap"><div className="progress-label"><span>{label}</span><strong>{value} / {max}</strong></div><progress value={value} max={max} aria-label={label} /></div>;
}
function Countdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const time = countdown(now);
  return <aside className="countdown panel"><span className="eyebrow">JOUW EXAMENHORIZON</span><h2>{time.finished ? 'Het examenmoment is bereikt' : 'Elke dag een stap dichterbij'}</h2><div className="clock">{[['days', 'dagen'], ['hours', 'uur'], ['minutes', 'min'], ['seconds', 'sec']].map(([key, label]) => <div key={key}><strong>{String(time[key]).padStart(2, '0')}</strong><span>{label}</span></div>)}</div><p>21 mei 2027 · 09:00 · Nederlandse tijd</p></aside>;
}
function Topics({ onWater }) {
  return <div className="topics">{topics.map(topic => topic.active ? <button className="topic active" key={topic.name} onClick={onWater}><span className="topic-icon">{topic.icon}</span><span className="badge">NU BESCHIKBAAR</span><h3>{topic.name}</h3><p>{topic.description}</p><span className="topic-link">Ontdek Water <span aria-hidden="true">↗</span></span></button> : <article className="topic" key={topic.name}><span className="topic-icon" aria-hidden="true">{topic.icon}</span><span className="badge muted">BINNENKORT</span><h3>{topic.name}</h3><p>{topic.description}</p><span className="coming">Nog even geduld</span></article>)}</div>;
}
function Lesson({ onPractice }) {
  return <><div className="page-heading"><span className="eyebrow">THEMA 02 · WATER</span><h1>Waar blijft de regen?</h1><p>Begrijp de route van een regendruppel. Dan snap je ook waarom een straat soms blank staat.</p></div><div className="lesson-grid"><article className="panel lesson"><span className="step">01</span><h2>Infiltratie: de bodem in</h2><p>Als regenwater in de bodem wegzakt, noemen we dat <strong>infiltratie</strong>. Water gaat door kleine ruimtes tussen bodemdeeltjes. Een grasveld laat vaak meer water door dan een betegeld plein.</p></article><article className="panel lesson"><span className="step">02</span><h2>Verstening: minder ruimte</h2><p>Als grond wordt bedekt met gebouwen, asfalt of tegels, heet dat <strong>verstening</strong>. Daardoor kan meestal minder regenwater de bodem in. Meer water stroomt over het oppervlak weg.</p></article><article className="panel lesson"><span className="step">03</span><h2>Wateroverlast: te veel tegelijk</h2><p>Bij een zware bui kan het riool het snel toestromende water niet allemaal afvoeren. Water kan dan op straat blijven staan. Ook een bodem die al erg nat is, kan nieuwe regen niet snel genoeg opnemen.</p></article></div><section className="panel connection"><span className="eyebrow">ONTHOUD DIT VERBAND</span><h2>Meer verstening <span>→</span> minder infiltratie <span>→</span> meer afstroming</h2><p>Dat vergroot bij zware regen de kans op wateroverlast. Tegels vervangen door groen met een waterdoorlatende bodem kan helpen.</p><button className="primary" onClick={onPractice}>Test je kennis · 5 vragen <span aria-hidden="true">→</span></button></section></>;
}
function Quiz({ onAnswer, onFinish, onHome }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const locked = useRef(false);
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus(); }, [index, finished]);
  const q = questions[index];
  function answer(choice) {
    if (locked.current) return;
    locked.current = true;
    setSelected(choice);
    const correct = choice === q.answer;
    if (correct) setScore(s => s + 1);
    onAnswer(correct);
  }
  function next() {
    if (selected === null) return;
    if (index === questions.length - 1) { onFinish(score); setFinished(true); }
    else { setIndex(i => i + 1); setSelected(null); locked.current = false; }
  }
  function restart() { setIndex(0); setSelected(null); setScore(0); setFinished(false); locked.current = false; }
  if (finished) return <section className="panel result"><span className="eyebrow">OEFENSESSIE AFGEROND</span><div className="result-icon" aria-hidden="true">✦</div><h1 ref={heading} tabIndex={-1}>{score === 5 ? 'Water? Jij snapt het.' : 'Weer een stap verder!'}</h1><p className="result-score">{score}<span> / 5 goed</span></p><p className="xp-earned">+{score * 20} XP verdiend</p><div className="tip"><strong>Neem dit mee</strong><p>Leg een verband in stappen uit: meer tegels → minder infiltratie → meer afstroming. Voeg daarna het gevolg toe: bij zware regen neemt de kans op wateroverlast toe.</p></div><p>Opnieuw oefenen levert opnieuw 20 XP per goed antwoord op. XP telt je oefenwerk, niet je beheersing.</p><div className="actions"><button className="primary" onClick={restart}>Opnieuw oefenen ↻</button><button className="secondary" onClick={onHome}>Naar Home</button></div></section>;
  return <div className="quiz-container"><div className="page-heading"><span className="eyebrow">OEFENEN · WATER</span><h1>Van weten naar begrijpen.</h1><p>5 originele vragen · 20 XP per goed antwoord · neem je tijd</p></div><section className="panel quiz"><Progress value={index + (selected !== null ? 1 : 0)} label="Beantwoorde vragen in deze sessie" /><h2 ref={heading} tabIndex={-1}>{q.text}</h2><div className="answers">{q.options.map((option, i) => <button key={option} disabled={selected !== null} className={`answer ${selected !== null && i === q.answer ? 'correct' : ''} ${selected === i && i !== q.answer ? 'incorrect' : ''}`} onClick={() => answer(i)}><span className="letter">{String.fromCharCode(65 + i)}</span><span>{option}{selected !== null && i === q.answer && <strong className="answer-status"> · Juist antwoord</strong>}{selected === i && i !== q.answer && <strong className="answer-status"> · Jouw antwoord</strong>}</span></button>)}</div>{selected !== null && <div className={`feedback ${selected === q.answer ? 'good' : ''}`} role="status"><strong>{selected === q.answer ? 'Goed gedaan! +20 XP' : 'Nog niet helemaal — leer van de uitleg.'}</strong><p>{q.explanation}</p><button className="primary" onClick={next}>{index === 4 ? 'Bekijk je resultaat' : 'Volgende vraag'} →</button></div>}</section><p className="small-note">Je antwoorden tellen meteen mee. Verlaat je deze pagina, dan begint een volgende oefensessie bij vraag 1.</p></div>;
}
function App() {
  const [progress, setProgress] = useState(() => { try { return loadProgress(window.localStorage); } catch { return loadProgress({ getItem: () => null }); } });
  const [page, setPage] = useState('Home');
  const [name, setName] = useState('');
  const [storageError, setStorageError] = useState(false);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); setStorageError(false); } catch { setStorageError(true); } }, [progress]);
  function navigate(next) { setPage(next); window.scrollTo({ top: 0, behavior: 'instant' }); }
  const current = progress.answered === 0 ? 0 : ((progress.answered - 1) % 5) + 1;
  return <div className="app"><header className="header"><a href="#" className="brand" onClick={e => { e.preventDefault(); navigate('Home'); }} aria-label="AK MASTER APP Home"><span className="brand-mark" aria-hidden="true"><img src={`${import.meta.env.BASE_URL}logo-expeditie.svg`} alt="" width="72" height="64" /></span><span><strong className="brand-wordmark">AK MASTER APP</strong><small>Van TL-leerling naar examenmaster</small></span></a><nav aria-label="Hoofdnavigatie">{['Home', 'Leren', 'Oefenen', 'Profiel'].map(item => <button key={item} className={page === item ? 'nav-active' : ''} aria-current={page === item ? 'page' : undefined} onClick={() => navigate(item)}><span className="nav-icon" aria-hidden="true">{ { Home: '⌂', Leren: '▦', Oefenen: '◎', Profiel: '⋯' }[item]}</span>{item}</button>)}</nav><span className="header-xp">✦ {progress.xp} XP</span></header><main id="main">{storageError && <p className="storage-warning" role="alert">Je browser kan je voortgang niet lokaal bewaren. Je kunt wel oefenen, maar na herladen kunnen je gegevens verdwijnen.</p>}{!progress.name ? <section className="welcome panel"><MapArtwork /><span className="eyebrow">KLAAR VOOR JOUW VOLGENDE STAP?</span><h1>Jij kunt een<br /><span>examenmaster</span> worden.</h1><p>Jouw plek om aardrijkskunde te begrijpen en te oefenen.<br />Voor 4 vmbo-TL / mavo · CE 2027</p><form onSubmit={e => { e.preventDefault(); const clean = name.trim(); if (clean) setProgress(p => ({ ...p, name: clean })); }}><label htmlFor="first-name">Hoe mogen we je noemen?</label><input id="first-name" autoComplete="given-name" maxLength={30} required value={name} onChange={e => setName(e.target.value)} placeholder="Je voornaam" /><button className="primary" disabled={!name.trim()}>Start mijn avontuur →</button></form><p className="small-note">Alleen je voornaam. Je gegevens blijven in deze browser; we versturen ze niet.</p></section> : page === 'Home' ? <><section className="hero"><MapArtwork /><div><span className="eyebrow">4 VMBO-TL / MAVO · AARDRIJKSKUNDE</span><h1>Hoi {progress.name},<br />jouw wereld wordt <span>groter.</span></h1><p>Een begrip, een vraag, een stap vooruit.<br />Werk vandaag aan jouw examen van morgen.</p><button className="primary" onClick={() => navigate('Oefenen')}>Oefen met Water <span aria-hidden="true">→</span></button><span className="hero-note">5 vragen · ongeveer 5 minuten</span></div><Countdown /></section><section className="stats" aria-label="Jouw voortgang"><div><span className="stat-icon">✦</span><strong>{progress.xp}<small>Totaal XP</small></strong></div><div><span className="stat-icon">✓</span><strong>{progress.answered}<small>Beantwoorde vragen</small></strong></div><div><span className="stat-icon">⚑</span><strong>{progress.sessions}<small>Afgeronde sessies</small></strong></div><div><span className="stat-icon">◎</span><strong>{progress.best} / 5<small>Beste score · Water</small></strong></div></section><section className="section"><div className="section-heading"><div><span className="eyebrow">VERKEN JE LEERWERELD</span><h2>Kies jouw volgende bestemming</h2></div><span className="small-note">01 / 04 thema’s beschikbaar</span></div><Topics onWater={() => navigate('Leren')} /></section><section className="panel practice-progress"><div><h2>Elke vraag telt.</h2><p>Deze balk telt echte antwoorden in blokken van 5. Herhaalde vragen tellen mee; dit is geen beheersingspercentage.</p></div><Progress value={current} label="Antwoorden in je huidige blok van 5" /></section></> : page === 'Leren' ? <Lesson onPractice={() => navigate('Oefenen')} /> : page === 'Oefenen' ? <Quiz onAnswer={correct => setProgress(p => recordAnswer(p, correct))} onFinish={score => setProgress(p => finishSession(p, score))} onHome={() => navigate('Home')} /> : <><div className="page-heading"><span className="eyebrow">JOUW PROFIEL</span><h1>Jouw route, {progress.name}.</h1><p>Een overzicht van wat je in deze browser hebt gedaan.</p></div><section className="panel profile"><h2>Je oefenwerk</h2><dl><div><dt>Totaal XP</dt><dd>{progress.xp}</dd></div><div><dt>Beantwoorde vragen (inclusief herhalingen)</dt><dd>{progress.answered}</dd></div><div><dt>Afgeronde oefensessies</dt><dd>{progress.sessions}</dd></div><div><dt>Beste score Water</dt><dd>{progress.best} / 5</dd></div></dl><p>Een goed antwoord levert 20 XP op, ook als je opnieuw oefent. Een sessie is afgerond wanneer je na de vijfde vraag je resultaat bekijkt.</p><button className="primary" onClick={() => navigate('Oefenen')}>Verder oefenen →</button></section><section className="panel privacy"><h2>Alleen op jouw apparaat</h2><p>Je voornaam en voortgang staan in localStorage van deze browser. Er is geen account en geen database. Op een ander apparaat begin je opnieuw. Als je browsergegevens wist, verdwijnt ook je voortgang.</p></section></>}</main><footer><span className="footer-brand">AK MASTER <span>v0.1</span></span><p>Originele oefenvragen, geen officiële examenvragen. De inhoud wordt later aan de officiële syllabus 2027 getoetst.</p><span>Blijf nieuwsgierig. Blijf groeien.</span></footer></div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
