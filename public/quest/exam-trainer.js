export function examTrainer(questions, attempts, esc) {
  const papers = new Map();
  for (const q of questions.filter(q => q.source)) {
    const {year, period} = q.source;
    const id = year + '-' + period;
    if (!papers.has(id)) papers.set(id, []);
    papers.get(id).push(q);
  }
  const tried = new Set(attempts.map(a => a.question_id));
  const cards = [...papers.values()].sort((a,b) => b[0].source.year - a[0].source.year || a[0].source.period - b[0].source.period);
  return `<section class="screen card pad"><h1>Examentrainer Water</h1>
    <p>Kies een tijdvak. Oefen de watervragen met de bijbehorende bronnen, of open het volledige examen.</p>
    ${cards.map(group => {
      group.sort((a,b) => a.source.number - b.source.number);
      const source = group[0].source;
      const answered = group.filter(q => tried.has(q.id)).length;
      return `<details class="exam-source"><summary>${esc(source.year)} · tijdvak ${esc(source.period)} · ${answered}/${group.length} gemaakt</summary>
        <p><a href="${esc(source.url)}" target="_blank" rel="noopener">Volledig examen</a> · <a href="${esc(source.correction)}" target="_blank" rel="noopener">Correctievoorschrift</a></p>
        <div class="row">${group.map(q => `<button class="btn secondary" data-action="exam-question" data-id="${esc(q.id)}">Vraag ${esc(q.source.number)} · ${esc(q.source.points)} pt${tried.has(q.id)?' · gemaakt':''}</button>`).join('')}</div>
      </details>`;
    }).join('') || '<p>Voor deze sessie zijn geen examenvragen geladen.</p>'}
    <button class="btn secondary" data-action="home">Terug naar het kamp</button></section>`;
}
