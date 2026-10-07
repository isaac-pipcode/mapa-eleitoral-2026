// Imprime relatorios/conjuntura-01/index.html em PDF A4 com o Chromium do Playwright.
//   node ferramentas/pdf_relatorio.js [caminho-do-playwright]
const path = require('path');
const { chromium } = require(process.argv[2] || 'playwright');
(async () => {
  const dir = path.join(__dirname, '..', 'relatorios', 'conjuntura-01');
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + path.join(dir, 'index.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: path.join(dir, 'quem-nao-escolheu-conjuntura-01.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close();
  console.log(path.join(dir, 'quem-nao-escolheu-conjuntura-01.pdf'));
})();
