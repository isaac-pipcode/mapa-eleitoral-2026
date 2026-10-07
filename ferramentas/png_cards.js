// Exporta cada card de relatorios/cards-abstencao/cards.html para PNG (1080×1350).
//   node ferramentas/png_cards.js [caminho-do-playwright]
const path = require('path');
const { chromium } = require(process.argv[2] || 'playwright');
(async () => {
  const dir = path.join(__dirname, '..', 'relatorios', 'cards-abstencao');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1400 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(dir, 'cards.html'));
  await p.evaluate(() => document.fonts.ready);
  const cards = await p.$$('.card');
  for (let i = 0; i < cards.length; i++) {
    const nome = path.join(dir, `card-${String(i + 1).padStart(2, '0')}.png`);
    await cards[i].screenshot({ path: nome });
    console.log(nome);
  }
  await b.close();
})();
