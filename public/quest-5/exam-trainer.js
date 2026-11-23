const archivedExams = [
  {
    year: 2017, period: 1,
    paper: 'https://static.alleexamens.nl/VMBO-GL%20en%20TL/Aardrijkskunde/2017/I/Aardrijkskunde/Aardrijkskunde%202017%20I_opgaven.pdf',
    correction: 'https://static.alleexamens.nl/VMBO-GL%20en%20TL/Aardrijkskunde/2017/I/Aardrijkskunde/Aardrijkskunde%202017%20I_correctievoorschrift.pdf'
  },
  {
    year: 2017, period: 2,
    paper: 'https://static.alleexamens.nl/VMBO-GL%20en%20TL/Aardrijkskunde/2017/II/Aardrijkskunde/Aardrijkskunde%202017%20II_opgaven.pdf',
    correction: 'https://static.alleexamens.nl/VMBO-GL%20en%20TL/Aardrijkskunde/2017/II/Aardrijkskunde/Aardrijkskunde%202017%20II_correctievoorschrift.pdf'
  }
];
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
    <details class="exam-source"><summary>Archiefexamens 2017 · volledige pdf’s</summary>
      <p>Oefen de geselecteerde vragen interactief met de originele bronpagina. Open de volledige pdf’s als je het hele examen of correctievoorschrift wilt bekijken.</p>
      ${archivedExams.map(exam => `<p><strong>2017 · tijdvak ${exam.period}</strong> · <a href="${esc(exam.paper)}" target="_blank" rel="noopener">Opgaven</a> · <a href="${esc(exam.correction)}" target="_blank" rel="noopener">Correctievoorschrift</a></p>`).join('')}
    </details>
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
