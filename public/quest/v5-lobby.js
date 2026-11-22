import {waterTheory} from './theory.js';
import {renderQuestTerrain} from './v5-terrain.js';
/**
 * GFR Exam Quest 5 — visual preview foundation.
 * Pure HTML renderer; reads existing state, never changes player data.
 */
export function quest5Home(state, chapters, avatar, done, esc) {
  const xp=Math.max(0,Number(state.student?.xp)||0);
  const coins=Math.max(0,Number(state.student?.coins)||0);
  const stage=Math.min(5,1+Math.floor(xp/350));
  const remainingXp = stage < 5 ? stage * 350 - xp : 0;
  const nextCampFeature = ['', 'het kampvuur', 'de veldhut', 'de sterrenkijker', 'het hoofdkwartier'];
  const campProgress = remainingXp ? `Nog ${remainingXp} XP tot ${nextCampFeature[stage]}` : 'Je expeditiekamp is volledig uitgebouwd';
  const attempts=state.attempts?.length||0;
  const current=Object.entries(chapters).find(([key])=>state.chapter===key)||Object.entries(chapters)[0];
  const entries=Object.entries(chapters);
  const stageNames=['','BASECAMP','EXPLORER CAMP','RIVER STATION','GEO OUTPOST','EXPEDITION HQ'];
  const fieldSites = {
    H7: 'De oeverwal',
    H8: 'De berghelling',
    H9: 'Het irrigatieveld'
  };
  const tree='🌲';
  const missionQuestions = (state.questions ?? []).filter(question => (
    question.chapter === current[0] && question.type === 'choice'
  ));
  const missionTotal = missionQuestions.length;
  const missionDone = state.solved
    ? missionQuestions.filter(question => state.solved.includes(question.id)).length
    : Math.max(0, Math.min(missionTotal, done(current[0])));
  const missionPercent = missionTotal ? Math.round(missionDone / missionTotal * 100) : 0;
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
        <div class="q5-camp-caption"><span class="q5-overline">JOUW BASISKAMP</span><strong>${stageNames[stage]}</strong><span>${campProgress}</span></div>
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
          ${missionTotal ? `<div class="q5-microbar" role="progressbar" aria-label="Gesloten kennismissies goed beantwoord" aria-valuemin="0" aria-valuemax="${missionTotal}" aria-valuenow="${missionDone}"><i style="width:${missionPercent}%"></i></div>
          <span class="q5-muted">${missionDone} van ${missionTotal} gesloten kennismissies goed beantwoord</span>` : ''}
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
      <div class="q5-sectionhead"><div><div class="q5-overline">EXPEDITIEATLAS</div><h2>Ontdek de wereld</h2></div><span>Alle leergebieden blijven toegankelijk</span></div>
      <div class="q5-globe-panel"><canvas id="quest-globe" role="img" aria-label="Draaibare aarde met Nederland, China en het Midden-Oosten"></canvas><p>Draai de aarde en tik op een bestemming, of kies hieronder je regio.</p></div>
      <div class="q5-region-grid">
      ${entries.map(([id,ch],i)=>`<div class="q5-region-stop"><button class="q5-region region-${i}" data-action="chapter" data-ch="${esc(id)}">
        <div class="q5-mapart"><span class="q5-region-sun" aria-hidden="true">☀</span>${renderQuestTerrain(id, ch.sub)}</div>
        <div class="q5-region-info"><span>REGIO 0${i+1} · ${esc(id)}</span><strong>${esc(ch.title)}</strong><small>${esc(ch.sub)}</small><span class="q5-region-go">VERKENNEN ↗</span></div>
      </button>
      ${fieldSites[id] && waterTheory[id] ? `<details class="q5-discovery"><summary>Onderzoek: ${esc(fieldSites[id])}</summary>
        <p>${esc(waterTheory[id].example[0])}</p>
        <details><summary>Bekijk de verklaring</summary><p>${esc(waterTheory[id].example[1])}</p></details>
      </details>` : ''}
      </div>`).join('')}
      </div>
    </section>
  </div>`;
}
