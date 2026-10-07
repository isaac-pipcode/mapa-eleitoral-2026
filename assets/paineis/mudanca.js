/* Onde o voto pode mudar. Dados no HTML: P.
 * P: [lat, lon, nome, "UF · Região", eleitores, abstenção %, brancos+nulos,
 *     1º nome, 1º partido, 1º votos, 1º % (texto), 2º nome, 2º partido, 2º votos, 2º % (texto),
 *     margem (pts do comparecimento), %21–34, %escolaridade baixa, %masculino, votos em jogo] */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const nf = (v, d) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const int = v => Math.round(v).toLocaleString('pt-BR');
  const tc = s => s.toLowerCase().replace(/(^|\s)(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
  const uf = x => x[3].split(' · ')[0];
  const chave = x => x[2] + '|' + uf(x);
  const MG = x => Math.abs(x[15]);
  const explorar = x => `index.html#/explorar?m=${encodeURIComponent(x[2] + '|' + uf(x))}`;

  const M = MT.mapa('map', { malha: 'malha_uf.json', limites: [[-33.8, -74], [5.3, -32.2]], maxLimites: [[-40, -85], [10, -25]] });
  let ord = 'mg', filtro = '', fmg = 100, fel = 0, fes = 0, idx = new Map(), sel = null;
  const CORTES = [2, 5, 10, 20];
  const ptsFmt = v => nf(v, 0) + ' pts';

  function passa(x) {
    if (MG(x) > fmg || x[4] < fel || x[17] < fes) return false; // x[17] = escolaridade baixa
    return !filtro || (x[2] + ' ' + x[3]).toLowerCase().includes(filtro);
  }
  function popup(x) {
    return `<h3>${MT.esc(x[2])}</h3><div class="z">${x[3]}</div><table>` +
      `<tr><td>Eleitores</td><td>${int(x[4])}</td></tr>` +
      `<tr><td>Abstenção</td><td>${nf(x[5], 1)}%</td></tr>` +
      `<tr><td colspan="2" style="text-align:left;padding-top:7px"><b>1º turno — Presidente</b></td></tr>` +
      `<tr><td>${MT.esc(tc(x[7]))} (${x[8]})</td><td>${int(x[9])} (${x[10]}%)</td></tr>` +
      `<tr><td>${MT.esc(tc(x[11]))} (${x[12]})</td><td>${int(x[13])} (${x[14]}%)</td></tr>` +
      `<tr><td><b>Margem</b></td><td><b>${nf(MG(x), 2)} pts</b></td></tr>` +
      `<tr><td colspan="2" style="text-align:left;padding-top:7px"><b>Perfil do eleitorado</b></td></tr>` +
      `<tr><td>21–34 anos</td><td>${x[16]}%</td></tr>` +
      `<tr><td>Escolaridade baixa</td><td>${x[17]}%</td></tr>` +
      `<tr><td>Masculino</td><td>${x[18]}%</td></tr></table>` +
      `<a class="mt-ir" href="${explorar(x)}">Ficha completa no explorador →</a>`;
  }
  const ORD = {
    mg: { cmp: (a, b) => MG(a) - MG(b), rot: 'margem mais apertada primeiro', v: x => nf(MG(x), 1) + ' pts', sub: x => int(x[19]) + ' em jogo' },
    vj: { cmp: (a, b) => b[19] - a[19], rot: 'mais votos em jogo primeiro', v: x => int(x[19]), sub: x => 'margem ' + nf(MG(x), 1) + ' pts' },
    ab: { cmp: (a, b) => b[5] - a[5], rot: 'maior abstenção primeiro', v: x => nf(x[5], 1) + '%', sub: x => 'margem ' + nf(MG(x), 1) + ' pts' },
  };

  function desenhar() {
    M.camada.clearLayers(); idx = new Map();
    const l = P.filter(passa);
    const E = MT.escala(l.map(MG), { cortes: CORTES, inverso: true, fmt: ptsFmt });
    const mx = Math.max(1, ...l.map(x => x[19]));
    l.slice().sort((a, b) => b[19] - a[19]).forEach(x => {
      const m = L.circleMarker([x[0], x[1]], { radius: MT.raio(x[19], mx, 2.5, 18), color: '#fff', weight: 0.8, fillColor: E.cor(MG(x)), fillOpacity: 0.92 });
      m.bindPopup(() => popup(x), { maxWidth: 320 });
      m.bindTooltip(`${x[2]} (${uf(x)}) — margem ${nf(MG(x), 1)} pts`, { direction: 'top', offset: [0, -3] });
      m.on('click', () => { sel = chave(x); M.destaca(m); });
      m.addTo(M.camada); idx.set(chave(x), m);
    });
    const jogo = l.reduce((s, x) => s + x[19], 0);
    M.legenda({
      titulo: 'Margem entre 1º e 2º (pontos do comparecimento)', escala: E, tamanho: 'votos do 2º colocado',
      nota: `Mais escuro = disputa mais apertada. ${l.length.toLocaleString('pt-BR')} municípios, ${int(jogo)} votos do 2º colocado.`,
    });
    const o = ORD[ord], lista = l.slice().sort(o.cmp);
    $('tit').textContent = `${lista.length.toLocaleString('pt-BR')} municípios — ${o.rot}`;
    MT.lista($('lista'), lista, {
      render: x => ({
        nome: MT.esc(x[2]) + `<span class="chip"><i style="background:${E.cor(MG(x))}"></i>${ord === 'mg' ? '' : nf(MG(x), 1) + ' pts'}</span>`,
        meta: `${x[3]} · ${MT.esc(tc(x[7]))} ${int(x[9])} × ${MT.esc(tc(x[11]))} ${int(x[13])}`,
        valor: o.v(x), sub: o.sub(x),
      }),
      aoEscolher: x => { sel = chave(x); M.foca(idx.get(sel)); },
      selecionado: x => chave(x) === sel,
    });
    MT.anuncia(`${lista.length} municípios, ${o.rot}.`);
  }

  const botoes = { o_mg: 'mg', o_vj: 'vj', o_ab: 'ab' };
  Object.keys(botoes).forEach(id => {
    const b = $(id);
    b.setAttribute('aria-pressed', botoes[id] === ord);
    b.onclick = () => {
      ord = botoes[id];
      Object.keys(botoes).forEach(k => { $(k).classList.toggle('on', k === id); $(k).setAttribute('aria-pressed', k === id); });
      desenhar();
    };
  });
  const num = (id, f) => { $(id).oninput = MT.debounce(e => { f(+e.target.value || 0); desenhar(); }, 250); };
  num('fmg', v => { fmg = v || 100; });
  num('fel', v => { fel = v; });
  num('fes', v => { fes = v; });
  $('q').oninput = MT.debounce(e => { filtro = e.target.value.trim().toLowerCase(); desenhar(); }, 200);
  desenhar();
})();
