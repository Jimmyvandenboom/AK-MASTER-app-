import React, { useEffect, useRef, useState } from 'react';

export default function SourceViewer({ question }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(false);
  const dialog = useRef(null);
  useEffect(() => { setIndex(0); setFailed(false); setZoom(false); }, [question.id]);
  useEffect(() => { setFailed(false); }, [index]);
  const page = question.sourcePages[index];
  const src = `${import.meta.env.BASE_URL}${page.src}`;
  const label = `Originele examenpagina ${page.page}, aardrijkskunde GL/TL ${question.year}, tijdvak ${question.period}`;
  function open() { setZoom(false); dialog.current.showModal(); }
  function close() { dialog.current.close(); }
  return <section className="source-reader" aria-label="Bronmateriaal bij de examenvraag">
    <div className="source-toolbar"><div><strong>De originele bronnen</strong><span>Pagina {page.page} · {index + 1} van {question.sourcePages.length}</span></div><button className="water-button small" onClick={open}>Vergroot bron ↗</button></div>
    <p className="source-instruction">Bekijk de kaart, foto of tekst. Open groot om details te lezen. De bronpagina bevat ook de originele vraag en eventuele antwoordtabel.</p>
    {!failed ? <button className="source-thumbnail" onClick={open} aria-label={`Vergroot ${label}`}><img src={src} alt={label} loading="lazy" onError={() => setFailed(true)} /><span>Open groot · kaart, legenda en details</span></button> : <p role="alert">Deze afbeelding kon niet laden. <a href={question.sourceUrl} target="_blank" rel="noopener noreferrer">Open het originele opgavenboekje op Examenblad ↗</a></p>}
    {question.sourcePages.length > 1 && <div className="source-pages" aria-label="Kies een bronpagina">{question.sourcePages.map((p, i) => <button key={p.src} onClick={() => setIndex(i)} aria-pressed={i === index} className={i === index ? 'selected' : ''}>Pagina {p.page}</button>)}</div>}
    <dialog ref={dialog} className="source-dialog" aria-label="Vergrote originele bron" onClick={e => { if (e.target === dialog.current) close(); }}>
      <div className="source-dialog-header"><div><strong>Bron · pagina {page.page}</strong><span>{question.year} · tijdvak {question.period}</span></div><div><button className="water-button small" onClick={() => setZoom(v => !v)}>{zoom ? 'Hele pagina' : 'Zoom 2×'}</button><button className="water-button small" onClick={close} aria-label="Bron sluiten">Sluiten ×</button></div></div>
      <p className="zoom-help">Met Zoom 2× kun je zijwaarts en omlaag schuiven. Op je telefoon kun je ook met twee vingers zoomen.</p>
      <div className={`source-pan ${zoom ? 'zoomed' : ''}`} tabIndex={0} aria-label="Vergrote bron, scroll om alle details te lezen"><img src={src} alt={label} onError={() => setFailed(true)} /></div>
      {question.sourcePages.length > 1 && <div className="source-pages">{question.sourcePages.map((p, i) => <button key={p.src} onClick={() => { setIndex(i); setZoom(false); }} aria-pressed={i === index}>Pagina {p.page}</button>)}</div>}
    </dialog>
  </section>;
}
