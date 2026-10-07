/* Abstenção e público-alvo. Dados no HTML: PTS (municípios), UFS, REGS.
 * Linha: [lat, lon, nome, rótulo, eleitores, abstenções, taxa %, %21–34, %escol. baixa, %masc.,
 *         densidade do alvo (0–1), votos recuperáveis, nº de municípios] */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const nf = (v, d) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const int = v => Math.round(v).toLocaleString('pt-BR');
  const REGIAO_UF = {
    Norte: ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO'], Nordeste: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
    'Centro-Oeste': ['DF', 'GO', 'MS', 'MT'], Sudeste: ['ES', 'MG', 'RJ', 'SP'], Sul: ['PR', 'RS', 'SC'],
  };
  const MET = {
    dens: { i: 10, n: 'densidade do público-alvo', f: v => nf(v, 3) },
    abst: { i: 6, n: 'taxa de abstenção (2026)', f: v => nf(v, 1) + '%' },
    rec: { i: 11, n: 'votos recuperáveis (teto teórico)', f: v => int(v) },
  };
  const NOTA = {
    dens: 'Média geométrica de %21–34 anos, %escolaridade baixa e %masculino. Descreve onde o perfil está; no teste nacional não previu abstenção (correlação −0,10).',
    abst: 'Dado oficial do TSE, 2026.',
    rec: 'Eleitores × abstenção × densidade do alvo. Teto teórico não validado em escala nacional: use a abstenção para decidir.',
  };

  const M = MT.mapa('map', { malha: 'malha_uf.json', limites: [[-33.8, -74], [5.3, -32.2]], maxLimites: [[-40, -85], [10, -25]] });
  let nivel = 'mu', met = 'dens', filtro = '', idx = new Map(), sel = null;
  // "Mato Grosso Do Sul" → "Mato Grosso do Sul"
  const nome = x => x[2].replace(/ (D[aeo]s?|E) /g, m => m.toLowerCase());
  const sigla = x => (x[2].match(/\(([A-Z]{2})\)$/) || [])[1];
  const chave = x => x[2] + '|' + x[3];
  const dados = () => nivel === 'mu' ? PTS : nivel === 'uf' ? UFS : REGS;
  const v = x => x[MET[met].i];
  const explorar = x => nivel === 'mu' ? `index.html#/explorar?m=${encodeURIComponent(x[2] + '|' + x[3])}`
    : nivel === 'uf' ? `index.html#/explorar?t=UF:${sigla(x)}` : `index.html#/explorar?t=R:${encodeURIComponent(x[2])}`;

  function popup(x) {
    return `<h3>${MT.esc(nome(x))}</h3><div class="z">${MT.esc(x[3])}</div><table>` +
      `<tr><td>Eleitores (2026)</td><td>${int(x[4])}</td></tr>` +
      `<tr><td>Abstenções</td><td>${int(x[5])}</td></tr>` +
      `<tr><td>Taxa de abstenção</td><td>${nf(x[6], 2)}%</td></tr>` +
      `<tr><td>21–34 anos</td><td>${x[7]}%</td></tr>` +
      `<tr><td>Escolaridade baixa</td><td>${x[8]}%</td></tr>` +
      `<tr><td>Masculino</td><td>${x[9]}%</td></tr>` +
      `<tr><td>Densidade do alvo</td><td>${nf(x[10], 3)}</td></tr>` +
      `<tr><td>Votos recuperáveis (teto)</td><td>${int(x[11])}</td></tr></table>` +
      `<a class="mt-ir" href="${explorar(x)}">Ficha completa no explorador →</a>`;
  }

  function desenhar() {
    M.camada.clearLayers(); M.limpaDestaque(); idx = new Map();
    const todos = dados();
    const l = todos.filter(x => !filtro || (x[2] + ' ' + x[3]).toLowerCase().includes(filtro));
    const E = MT.escala(l.map(v), { fmt: MET[met].f });
    if (nivel === 'mu') {
      M.limpaAreas();
      const mx = Math.max(1, ...l.map(x => x[4]));
      l.slice().sort((a, b) => b[4] - a[4]).forEach(x => {
        const m = L.circleMarker([x[0], x[1]], { radius: MT.raio(x[4], mx, 2.5, 16), color: '#fff', weight: 0.8, fillColor: E.cor(v(x)), fillOpacity: 0.92 });
        m.bindPopup(() => popup(x), { maxWidth: 300 });
        m.bindTooltip(`${x[2]} — ${MET[met].f(v(x))}`, { direction: 'top', offset: [0, -3] });
        m.on('click', () => { sel = chave(x); M.destaca(m); });
        m.addTo(M.camada); idx.set(chave(x), m);
      });
    } else {
      // coroplético: cada estado recebe a cor do seu estado (ou da sua região)
      const porUF = {};
      l.forEach(x => {
        if (nivel === 'uf') porUF[sigla(x)] = x;
        else (REGIAO_UF[x[2]] || []).forEach(u => { porUF[u] = x; });
      });
      M.pintaAreas(u => porUF[u] ? E.cor(v(porUF[u])) : null, {
        tooltip: u => `<b>${MT.esc(nome(porUF[u]))}</b><br>${MET[met].n}: ${MET[met].f(v(porUF[u]))}`,
        aoClicar: (u, lay) => { const x = porUF[u]; sel = chave(x); L.popup({ maxWidth: 300 }).setLatLng(lay.getBounds().getCenter()).setContent(popup(x)).openOn(M.map); },
      });
    }
    M.legenda({ titulo: MET[met].n[0].toUpperCase() + MET[met].n.slice(1), escala: E, tamanho: nivel === 'mu' ? 'eleitores' : null, nota: NOTA[met] });
    const ord = l.slice().sort((a, b) => v(b) - v(a));
    $('tit').textContent = `${ord.length.toLocaleString('pt-BR')} ${nivel === 'mu' ? 'municípios' : nivel === 'uf' ? 'estados' : 'regiões'} — maior ${MET[met].n.split(' (')[0]} primeiro`;
    MT.lista($('lista'), ord, {
      render: x => ({ nome: MT.esc(nome(x)), meta: `${MT.esc(x[3])} · ${int(x[4])} eleitores`, valor: MET[met].f(v(x)), sub: met === 'abst' ? `${int(x[5])} abstenções` : `abstenção ${nf(x[6], 1)}%` }),
      aoEscolher: x => {
        sel = chave(x);
        if (nivel === 'mu') M.foca(idx.get(sel));
        else if (nivel === 'uf') { M.focaArea(sigla(x)); L.popup({ maxWidth: 300 }).setLatLng([x[0], x[1]]).setContent(popup(x)).openOn(M.map); }
        else { const lb = M.limitesAreas(REGIAO_UF[x[2]] || []); if (lb) M.voa(lb); L.popup({ maxWidth: 300 }).setLatLng([x[0], x[1]]).setContent(popup(x)).openOn(M.map); }
      },
      selecionado: x => chave(x) === sel,
    });
    MT.anuncia(`${ord.length} itens por ${MET[met].n}.`);
  }

  const grupoBotoes = (mapa, aplicar) => Object.keys(mapa).forEach(id => {
    $(id).setAttribute('aria-pressed', $(id).classList.contains('on'));
    $(id).onclick = () => {
      Object.keys(mapa).forEach(k => { $(k).classList.toggle('on', k === id); $(k).setAttribute('aria-pressed', k === id); });
      aplicar(mapa[id]); desenhar();
    };
  });
  grupoBotoes({ b_mu: 'mu', b_uf: 'uf', b_rg: 'rg' }, n => { nivel = n; sel = null; M.map.closePopup(); M.map.flyToBounds(M.limites, { animate: false }); });
  grupoBotoes({ m_dens: 'dens', m_abst: 'abst', m_rec: 'rec' }, m => { met = m; });
  $('q').oninput = MT.debounce(e => { filtro = e.target.value.trim().toLowerCase(); desenhar(); }, 200);
  desenhar();
})();
