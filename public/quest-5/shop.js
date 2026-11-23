const categories = {
  head: 'Hoofddeksel', bag: 'Bagage', accessory: 'Accessoire', aura: 'Aura',
  pet: 'Metgezel', footwear: 'Schoenen', transport: 'Vervoer', powerup: 'Power-up',
  background: 'Achtergrond'
};

export function renderShop(items, daily, purchases, coins, collections) {
  function card(id) {
    const item = items[id];
    const owned = purchases.includes(id);
    const missing = Math.max(0, item.price - coins);
    const label = owned ? '✓ In bezit' : missing ? `Nog ${missing} coins nodig` : 'Koop';
    return `<article class="supply-card" data-slot="${item.slot}">
      <div class="supply-art" ${item.color ? 'style="--hue:' + item.color + '"' : ''}>
        <span class="supply-symbol" aria-hidden="true">${item.icon}</span>
      </div>
      <div class="supply-info"><small>${categories[item.slot]}</small><h3>${item.name}</h3>
        ${item.description ? '<p>' + item.description + '</p>' : ''}
        <div class="supply-price"><b aria-hidden="true">◈</b> ${item.price} Geo Coins</div>
        <button type="button" class="supply-buy" data-action="buy" data-id="${id}" aria-label="${item.name} · ${label}" ${owned || missing ? 'disabled' : ''}>${label}</button>
      </div></article>`;
  }
  return `<section class="screen supply">
    <header class="supply-header"><div><h1>Geo Shop</h1><p>Elke dag om middernacht wisselt de etalage.</p></div>
      <div class="supply-wallet"><small>Jouw saldo</small><strong>◈ ${coins.toLocaleString('nl-NL')}</strong><span>Geo Coins</span></div></header>
    <h2>Vandaag in de etalage</h2><div class="supply-grid">${daily.map(card).join('')}</div>
    <details class="supply-catalog"><summary>Volledige catalogus <span>${Object.keys(items).length} items</span></summary>
    <div class="supply-grid">${Object.keys(items).map(card).join('')}</div></details>
    ${collections}</section>`;
}
