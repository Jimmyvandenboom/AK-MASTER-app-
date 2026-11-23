const categories = {
  head: 'Hoofddeksel', bag: 'Bagage', accessory: 'Accessoire', aura: 'Aura',
  pet: 'Metgezel', footwear: 'Schoenen', transport: 'Vervoer', powerup: 'Power-up',
  background: 'Achtergrond'
};

export function renderShop(items, daily, purchases, coins, collections, profile = {}, avatar = '') {
  function card(id) {
    const item = items[id];
    const owned = purchases.includes(id);
    const missing = Math.max(0, item.price - coins);
    const scene = item.slot === 'background';
    const automatic = item.slot === 'powerup';
    const active = scene ? profile.bg === id : profile.gear?.includes(id);
    let label = missing ? `Nog ${missing} coins nodig` : 'Koop';
    if (owned) {
      if (automatic) label = 'Beschikbaar bij vragen';
      else if (scene) label = active ? 'Achtergrond uitzetten' : 'Gebruik achtergrond';
      else if (item.slot === 'pet') label = active ? 'Thuislaten' : 'Neem mee';
      else label = active ? 'Uitdoen' : 'Aantrekken';
    }
    const action = owned ? (scene ? 'bg-v3' : 'equip-v3') : 'buy';
    const disabled = owned ? automatic : missing > 0;
    return `<article class="supply-card" data-slot="${item.slot}">
      <div class="supply-art" ${item.color ? 'style="--hue:' + item.color + '"' : ''}>
        <span class="supply-symbol" aria-hidden="true">${item.icon}</span>
      </div>
      <div class="supply-info"><small>${categories[item.slot]}</small><h3>${item.name}</h3>
        ${item.description ? '<p>' + item.description + '</p>' : ''}
        <div class="supply-price"><b aria-hidden="true">◈</b> ${item.price} Geo Coins</div>
        <button type="button" class="supply-buy" data-action="${action}" data-id="${owned && scene && active ? '' : id}" data-item="${id}" ${owned && !automatic ? `aria-pressed="${!!active}"` : ''} aria-label="${item.name} · ${label}" ${disabled ? 'disabled' : ''}>${label}</button>
      </div></article>`;
  }
  return `<section class="screen supply">
    <header class="supply-header"><div><h1>Geo Shop</h1><p>Elke dag om middernacht wisselt de etalage.</p></div>
      <div class="supply-wallet"><small>Jouw saldo</small><strong>◈ ${coins.toLocaleString('nl-NL')}</strong><span>Geo Coins</span></div></header>
    <div class="supply-fitting"><div class="avatar studio-preview">${avatar}</div><button class="btn secondary" data-action="studio-v3">Avatar Studio</button></div>
    <h2>Vandaag in de etalage</h2><div class="supply-grid">${daily.map(card).join('')}</div>
    <details class="supply-catalog"><summary>Volledige catalogus <span>${Object.keys(items).length} items</span></summary>
    <div class="supply-grid">${Object.keys(items).map(card).join('')}</div></details>
    ${collections}</section>`;
}
