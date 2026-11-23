const rareBadges = [
  {chapter: 'H7', name: 'Deltakroon', icon: '👑'},
  {chapter: 'H8', name: 'Jadedraak', icon: '🐉'},
  {chapter: 'H9', name: 'Oasekristal', icon: '💎'},
];

export function rareCollection(chapters, questions, solvedIds) {
  const solved = new Set(solvedIds);
  const target = 10;

  return `<section class="rare-collection"><h3>Ultra rare badges</h3><div class="store">${rareBadges.map(badge => {
    const progress = Math.min(target, questions.filter(q =>
      q.chapter === badge.chapter && q.type === 'choice' && !q.source && solved.has(q.id)
    ).length);
    const earned = progress === target;

    return `<article class="storeitem rare-badge">
      <div class="icon" aria-hidden="true">${earned ? badge.icon : '🔒'}</div>
      <h4>${badge.name}</h4><p>${chapters[badge.chapter].sub}</p>
      <progress aria-label="Voortgang ${badge.name}" value="${progress}" max="${target}"></progress>
      <p>${earned ? 'In je collectie' : `${progress} / ${target} verschillende kennismissies goed`}</p>
    </article>`;
  }).join('')}</div></section>`;
}
