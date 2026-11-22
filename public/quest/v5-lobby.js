import {renderQuestTerrain} from './v5-terrain.js';
/**
 * GFR Exam Quest 5 — visual preview foundation.
 * Pure HTML renderer; reads existing state, never changes player data.
 */
export function quest5Home(state, chapters, avatar, done, esc) {
  const xp=Math.max(0,Number(state.student?.xp)||0);
  const coins=Math.max(0,Number(state.student?.coins)||0);
  const stage=Math.min(5,1+Math.floor(xp/350));
  const attempts=state.attempts?.length||0;
  const current=Object.entries(chapters).find(([key])=>state.chapter===key)||Object.entries(chapters)[0];
  const entries=Object.entries(chapters);
  const stageNames=['','BASECAMP','EXPLORER CAMP','RIVER STATION','GEO OUTPOST','EXPEDITION HQ'];
  const tree='🌲', water='🌊';
  return `<div class="q5-home">
    <div class="q5-banner" role="status"><span class="q5-beacon"></span> GFR 5.0 · EXPEDITIEKAART <span class="q5-beta">ONTWIKKELPREVIEW</span></div>
    <div class="q5-header">
      <div><div class="q5-overline">JOUW PERSOONLIJKE EXPEDITIE</div><h1>Welkom terug, <span>${esc(state.student?.first_name||'ontdekkingsreiziger')}.</span></h1><p>Jouw volgende ontdekking begint hier. Hoe meer je leert, hoe groter je kamp wordt.</p></div>
      <div class="q5-score"><span>✦ ${xp.toLocaleString('nl-NL')} XP</span><span>◈ ${coins.toLocaleString('nl-NL')} GEO COINS</span><span>🏕️ LEVEL ${stage}</span></div>
    </div>
    <div class="q5-layout">
      <section class="q5-camp" aria-label="Jouw groeiende expeditiekamp">
        <div class="q5-camp-sky"><span class="q5-sun" aria-hidden="true"></span><span class="q5-cloud c1"></span><span class="q5-cloud c2"></span></div>
        <div class="q5-landscape" aria-hidden="true">
          <div class="q5-mountain m1"></div><div class="q5-mountain m2"></div>
          <div class="q5-ground"></div><div class="q5-creek"></div>
          <span class="q5-prop p1">${tree}</span><span class="q5-prop p2">🌳</span><span class="q5-prop p3">🌲</span>
          <span class="q5-tent">⛺</span>
          ${stage>=2?'<span class="q5-prop p4">🔥</span>':''}
          ${stage>=3?'<span class="q5-prop p5">🛖</span>':''}
          ${stage>=4?'<span class="q5-prop p6">🔭</span>':''}
          ${stage>=5?'<span class="q5-prop p7">🏰</span>':''}
        </div>
        <div class="q5-camper" aria-label="Je avatar">${avatar()}</div>
        <div class="q5-camp-caption"><span class="q5-overline">YOUR HOME BASE</span><strong>${stageNames[stage]}</strong><span>Automatisch gegroeid met jouw XP</span></div>
        <div class="q5-camp-actions">
          <button class="q5-maincta" data-action="chapter" data-ch="${esc(current[0])}">🧭 OP AVONTUUR <span>→</span></button>
          <button class="q5-softcta" data-action="studio-v3">🧑‍🚀 Mijn avatar</button>
          <button class="q5-softcta" data-action="store">🛍️ Geo Shop</button>
        </div>
      </section>
      <aside class="q5-sidebar">
        <div class="q5-module">
          <div class="q5-overline">JOUW VOLGENDE MISSIE</div>
          <h2>${esc(current[1].title)}</h2><p>${esc(current[1].sub)}</p>
          <div class="q5-microbar"><i style="width:${Math.max(0,Math.min(100,Math.round(done(current[0])/10*100)))}%"></i></div>
          <span class="q5-muted">${done(current[0])} kennismissies goed beantwoord</span>
          <button class="q5-link" data-action="chapter" data-ch="${esc(current[0])}">Ga naar mijn missie →</button>
        </div>
        <div class="q5-module q5-side-stats">
          <div class="q5-overline">EXPEDITIE LOGBOEK</div>
          <div><strong>${attempts}</strong><span>Gemaakte antwoorden</span></div>
          <div><strong>${Math.floor((state.student?.active_seconds||0)/60)}</strong><span>Actieve minuten</span></div>
          <div><strong>${stage}/5</strong><span>Kampontwikkeling</span></div>
        </div>
        <div class="q5-module q5-arcade">
          <div class="q5-overline">JOUW GAME HUB</div>
          <button data-action="store">⚡ Power-ups en outfits <span>→</span></button>
          <button data-action="studio-v3">🎭 Avatar aanpassen <span>→</span></button>
          <button data-action="daily">🧠 Kennisboost <span>→</span></button>
        </div>
      </aside>
    </div>
    <section class="q5-regions" aria-label="Kies je geografische wereld">
      <div class="q5-sectionhead"><div><div class="q5-overline">EXPLORER'S ATLAS</div><h2>Ontdek de wereld</h2></div><span>Alle leergebieden blijven toegankelijk</span></div>
      <div class="q5-region-grid">
      ${entries.map(([id,ch],i)=>`<button class="q5-region region-${i}" data-action="chapter" data-ch="${esc(id)}">
        <div class="q5-mapart"><span class="q5-region-sun" aria-hidden="true">☀</span>${renderQuestTerrain(id, ch.sub)}</div>
        <div class="q5-region-info"><span>REGIO 0${i+1} · ${esc(id)}</span><strong>${esc(ch.title)}</strong><small>${esc(ch.sub)}</small><span class="q5-region-go">VERKENNEN ↗</span></div>
      </button>`).join('')}
      </div>
    </section>
    <div class="q5-design-note">GFR 5.0 DESIGN PREVIEW · bestaande missies, vragen, aankopen en leerlinggegevens blijven gekoppeld aan de huidige game.</div>
  </div>`;
}
