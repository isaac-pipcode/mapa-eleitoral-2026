/* Abstenção por perfil (2022). Dados no HTML: PTS, ORDEM, DIMNOME.
 * PTS: [lat, lon, nome, uf, região, abstenção geral 2026 (%), eleitores 2026, {dimensão: {grupo: [taxa %, aptos]}}] */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const nf = (v, d) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const pct = v => nf(v, 1) + '%';
  const tc = s => s.charAt(0) + s.slice(1).toLowerCase();
  const explorar = x => `index.html#/explorar?m=${encodeURIComponent(x[2] + '|' + x[3])}`;

  const M = MT.mapa('map', { malha: 'malha_uf.json', limites: [[-33.8, -74], [5.3, -32.2]], maxLimites: [[-40, -85], [10, -25]] });
  let dim = Object.keys(DIMNOME)[0], grupo = null, filtro = '', idx = new Map(), sel = null;

  // quantos municípios têm taxa em cada grupo (voto facultativo não tem)
  const NGRUPO = {};
  for (const d in ORDEM) {
    NGRUPO[d] = {};
    ORDEM[d].forEach(g => { NGRUPO[d][g] = 0; });
    PTS.forEach(x => { const o = x[7][d] || {}; for (const g in o) NGRUPO[d][g] = (NGRUPO[d][g] || 0) + 1; });
  }
  const val = x => { const v = (x[7][dim] || {})[grupo]; return v ? v[0] : null; };
  const apt = x => { const v = (x[7][dim] || {})[grupo]; return v ? v[1] : 0; };
  const chave = x => x[2] + '|' + x[3];

  function popup(x) {
    return `<h3>${MT.esc(x[2])}</h3><div class="z">${x[3]} · ${x[4]}</div><table>` +
      `<tr><td>Perfil</td><td>${MT.esc(tc(grupo))}</td></tr>` +
      `<tr><td>Aptos no perfil (2022)</td><td>${apt(x).toLocaleString('pt-BR')}</td></tr>` +
      `<tr><td>Abstenção no perfil (2022)</td><td>${pct(val(x))}</td></tr>` +
      `<tr><td colspan="2" style="padding-top:6px;text-align:left"><b>Município</b></td></tr>` +
      `<tr><td>Abstenção geral (2026)</td><td>${pct(x[5])}</td></tr>` +
      `<tr><td>Eleitores (2026)</td><td>${x[6].toLocaleString('pt-BR')}</td></tr></table>` +
      `<a class="mt-ir" href="${explorar(x)}">Ficha completa no explorador →</a>`;
  }

  function desenhar() {
    M.camada.clearLayers(); idx = new Map();
    const q = filtro;
    const l = PTS.filter(x => val(x) != null && (!q || (x[2] + ' ' + x[3]).toLowerCase().includes(q)));
    const E = MT.escala(l.map(val), { fmt: pct });
    const mx = Math.max(1, ...l.map(apt));
    // grandes primeiro: os pequenos ficam por cima e continuam clicáveis
    l.slice().sort((a, b) => apt(b) - apt(a)).forEach(x => {
      const m = L.circleMarker([x[0], x[1]], { radius: MT.raio(apt(x), mx, 2.5, 16), color: '#fff', weight: 0.8, fillColor: E.cor(val(x)), fillOpacity: 0.92 });
      m.bindPopup(() => popup(x), { maxWidth: 300 });
      m.bindTooltip(`${x[2]} (${x[3]}) — ${pct(val(x))}`, { direction: 'top', offset: [0, -3] });
      m.on('click', () => { sel = chave(x); M.destaca(m); });
      m.addTo(M.camada); idx.set(chave(x), m);
    });
    // referência nacional: razão das somas, não média das taxas
    let ab = 0, ap = 0;
    l.forEach(x => { ab += val(x) * apt(x) / 100; ap += apt(x); });
    M.legenda({
      titulo: `Abstenção de "${tc(grupo)}" (2022)`, escala: E, tamanho: 'aptos no perfil',
      nota: `Itens exibidos, somados: ${ap ? pct(100 * ab / ap) : '—'} de abstenção. Só voto obrigatório; grupos com menos de 300 aptos ficam de fora.`,
    });
    const ord = l.slice().sort((a, b) => val(b) - val(a));
    $('tit').textContent = `${ord.length.toLocaleString('pt-BR')} municípios — maior abstenção primeiro`;
    MT.lista($('lista'), ord, {
      render: x => ({ nome: MT.esc(x[2]), meta: `${x[3]} · ${apt(x).toLocaleString('pt-BR')} aptos no perfil`, valor: pct(val(x)), sub: `geral 2026: ${pct(x[5])}` }),
      aoEscolher: x => { sel = chave(x); M.foca(idx.get(sel)); },
      selecionado: x => chave(x) === sel,
      vazio: 'Nenhum município com taxa para este perfil e busca.',
    });
    $('pg').textContent = tc(grupo);
    MT.anuncia(`${ord.length} municípios com abstenção de ${tc(grupo)}.`);
  }

  const sdim = $('dim'), sgru = $('grupo');
  Object.keys(DIMNOME).forEach(d => { const o = document.createElement('option'); o.value = d; o.textContent = DIMNOME[d]; sdim.appendChild(o); });
  function carregaGrupos() {
    sgru.innerHTML = '';
    ORDEM[dim].forEach(g => {
      const o = document.createElement('option');
      o.value = g;
      const n = NGRUPO[dim][g] || 0;
      o.textContent = tc(g) + (n ? '' : ' — sem taxa (voto facultativo ou poucos aptos)');
      o.disabled = !n;
      sgru.appendChild(o);
    });
    // começa no grupo com mais municípios, nunca num grupo vazio
    grupo = ORDEM[dim].reduce((a, g) => (NGRUPO[dim][g] || 0) > (NGRUPO[dim][a] || 0) ? g : a, ORDEM[dim][0]);
    sgru.value = grupo;
  }
  sdim.value = dim; carregaGrupos();
  sdim.onchange = () => { dim = sdim.value; carregaGrupos(); desenhar(); };
  sgru.onchange = () => { grupo = sgru.value; desenhar(); };
  $('q').oninput = MT.debounce(e => { filtro = e.target.value.trim().toLowerCase(); desenhar(); }, 200);
  desenhar();
})();
