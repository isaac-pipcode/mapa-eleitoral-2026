/* Todos os indicadores da base municipal. Dados no HTML: IND [[coluna, rótulo]], PTS.
 * PTS: [lat, lon, nome, uf, região, ...valor de cada coluna de IND na mesma ordem] */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const nf = (v, d) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const col = n => { const i = IND.findIndex(x => x[0] === n); return i < 0 ? -1 : 5 + i; };
  const I_EL = col('eleitores_aptos'), I_PERF = col('perfil_total'), I_TX = col('taxa_abstencao'), I_C1 = col('c1_pct'), I_MG = col('margem_1o_2o_pts');

  const ESCOL = {
    analfabeto: 'Analfabeto', le_e_escreve: 'Lê e escreve', ensino_fundamental_incompleto: 'Fundamental incompleto',
    ensino_fundamental_completo: 'Fundamental completo', ensino_medio_incompleto: 'Médio incompleto', ensino_medio_completo: 'Médio completo',
    superior_incompleto: 'Superior incompleto', superior_completo: 'Superior completo', nao_informado: 'Não informado',
  };
  const FIXOS = {
    eleitores_aptos: 'Eleitores aptos', comparecimento: 'Comparecimento', abstencoes: 'Abstenções',
    taxa_abstencao: 'Taxa de abstenção (%)', taxa_comparecimento: 'Taxa de comparecimento (%)', votos_validos: 'Votos válidos',
    brancos: 'Votos brancos', nulos: 'Votos nulos', secoes_totalizadas: 'Seções totalizadas', secoes_total: 'Seções',
    pct_abstencao: 'Abstenção (% dos aptos)', pct_brancos: 'Brancos (% dos aptos)', pct_nulos: 'Nulos (% dos aptos)',
    pct_validos: 'Válidos (% dos aptos)', perfil_total: 'Eleitorado no cadastro', margem_1o_2o_pts: 'Margem 1º–2º (pts do comparecimento)',
    faixa_invalida: 'Idade inválida', genero_feminino: 'Mulheres', genero_masculino: 'Homens', genero_nao_informado: 'Gênero não informado',
    estado_civil_separado_judicialmente: 'Separado judicialmente', estado_civil_nao_informado: 'Estado civil não informado',
    estado_civil_viuvo: 'Viúvo', raca_indigena: 'Indígena', raca_nao_informado: 'Cor/raça não informada',
  };
  function meta(c) {
    let g, r = FIXOS[c], demo = false, m;
    if ((m = c.match(/^faixa_(.+)$/))) { g = 'Faixa etária'; demo = true; r = r || m[1].replace(/_/g, ' ').replace(/^(\d+) a (\d+) anos$/, '$1 a $2 anos'); }
    else if ((m = c.match(/^escolaridade_(.+)$/))) { g = 'Escolaridade'; demo = true; r = ESCOL[m[1]] || m[1]; }
    else if (/^genero_/.test(c)) { g = 'Gênero'; demo = true; }
    else if ((m = c.match(/^estado_civil_(.+)$/))) { g = 'Estado civil'; demo = true; r = r || m[1][0].toUpperCase() + m[1].slice(1); }
    else if ((m = c.match(/^raca_(.+)$/))) { g = 'Cor/raça (“não informado” predomina)'; demo = true; r = r || m[1][0].toUpperCase() + m[1].slice(1); }
    else if ((m = c.match(/^c(\d+)_(votos|pct)$/))) { g = 'Candidatos por posição no município'; r = m[2] === 'votos' ? `Votos do ${m[1]}º colocado` : `${m[1]}º colocado (% dos válidos)`; }
    else g = 'Participação e resultado';
    const pctNativo = /^(taxa_|pct_)|_pct$|^margem/.test(c);
    return { c, g, r: r || c, demo, pctNativo };
  }
  const META = IND.map(x => meta(x[0]));

  const M = MT.mapa('map', { malha: 'malha_uf.json', limites: [[-33.8, -74], [5.3, -32.2]], maxLimites: [[-40, -85], [10, -25]] });
  let ii = col('taxa_abstencao') - 5, modo = 'pct', filtro = '', fel = 0, idx = new Map(), sel = null;
  const emPct = () => META[ii].demo && modo === 'pct';
  const val = x => emPct() ? (x[I_PERF] ? 100 * x[5 + ii] / x[I_PERF] : null) : x[5 + ii];
  const fmt = v => v == null ? '—' : (emPct() || META[ii].pctNativo) ? nf(v, Math.abs(v) < 10 ? 2 : 1) + (META[ii].c.startsWith('margem') ? ' pts' : '%') : Math.round(v).toLocaleString('pt-BR');
  const nomeInd = () => META[ii].r + (emPct() ? ' (% do eleitorado)' : '');
  const chave = x => x[2] + '|' + x[3];

  function popup(x) {
    const lin = [[nomeInd(), fmt(val(x))], ['Eleitores aptos', Math.round(x[I_EL]).toLocaleString('pt-BR')]];
    if (I_TX > 0) lin.push(['Taxa de abstenção', nf(x[I_TX], 1) + '%']);
    if (I_C1 > 0) lin.push(['1º colocado', nf(x[I_C1], 1) + '% dos válidos']);
    if (I_MG > 0 && x[I_MG] != null) lin.push(['Margem 1º–2º', nf(x[I_MG], 1) + ' pts']);
    return `<h3>${MT.esc(x[2])}</h3><div class="z">${x[3]} · ${x[4]}</div><table>` +
      lin.map(r => `<tr><td>${MT.esc(r[0])}</td><td>${r[1]}</td></tr>`).join('') + '</table>' +
      `<a class="mt-ir" href="index.html#/explorar?m=${encodeURIComponent(x[2] + '|' + x[3])}">Ficha completa no explorador →</a>`;
  }

  function desenhar() {
    M.camada.clearLayers(); M.limpaDestaque(); idx = new Map();
    const l = PTS.filter(x => x[I_EL] >= fel && val(x) != null && (!filtro || (x[2] + ' ' + x[3]).toLowerCase().includes(filtro)));
    const E = MT.escala(l.map(val), { fmt });
    const mx = Math.max(1, ...l.map(x => x[I_EL]));
    l.slice().sort((a, b) => b[I_EL] - a[I_EL]).forEach(x => {
      const m = L.circleMarker([x[0], x[1]], { radius: MT.raio(x[I_EL], mx, 2.5, 16), color: '#fff', weight: 0.8, fillColor: E.cor(val(x)), fillOpacity: 0.92 });
      m.bindPopup(() => popup(x), { maxWidth: 300 });
      m.bindTooltip(`${x[2]} (${x[3]}) — ${fmt(val(x))}`, { direction: 'top', offset: [0, -3] });
      m.on('click', () => { sel = chave(x); M.destaca(m); });
      m.addTo(M.camada); idx.set(chave(x), m);
    });
    const contagem = !META[ii].pctNativo && !emPct();
    M.legenda({
      titulo: nomeInd(), escala: E, tamanho: 'eleitores',
      nota: contagem ? 'Contagem absoluta: acompanha o tamanho do município. Para comparar municípios, prefira uma taxa ou “% do eleitorado”.' : null,
    });
    $('modo').style.display = META[ii].demo ? '' : 'none';
    const ord = l.slice().sort((a, b) => val(b) - val(a));
    $('tit').textContent = `${ord.length.toLocaleString('pt-BR')} municípios — maior primeiro`;
    MT.lista($('lista'), ord, {
      render: x => ({ nome: MT.esc(x[2]), meta: `${x[3]} · ${Math.round(x[I_EL]).toLocaleString('pt-BR')} eleitores`, valor: fmt(val(x)) }),
      aoEscolher: x => { sel = chave(x); M.foca(idx.get(sel)); },
      selecionado: x => chave(x) === sel,
    });
    MT.anuncia(`${ord.length} municípios por ${nomeInd()}.`);
  }

  // seletor agrupado e com rótulos legíveis
  const s = $('ind');
  s.innerHTML = '';
  [...new Set(META.map(m => m.g))].forEach(g => {
    const og = document.createElement('optgroup'); og.label = g;
    META.forEach((m, i) => { if (m.g === g) { const o = document.createElement('option'); o.value = i; o.textContent = m.r; og.appendChild(o); } });
    s.appendChild(og);
  });
  s.value = ii;
  s.onchange = () => { ii = +s.value; desenhar(); };

  // "Nível": os botões de estado/região nunca funcionaram; agregados vivem no explorador
  const niv = $('n_mu').parentElement;
  niv.innerHTML = '<span>Nível</span> municípios · <a href="index.html#/explorar?t=BR&amp;i=abst">estados e regiões no explorador →</a>';

  // "% do eleitorado" | "número" para indicadores de composição
  const modoEl = document.createElement('div');
  modoEl.className = 'grp'; modoEl.id = 'modo';
  modoEl.innerHTML = '<span>Mostrar como</span><button type="button" data-m="pct" class="on" aria-pressed="true">% do eleitorado</button><button type="button" data-m="n" aria-pressed="false">número</button>';
  s.parentElement.after(modoEl);
  modoEl.querySelectorAll('button').forEach(b => b.onclick = () => {
    modo = b.dataset.m;
    modoEl.querySelectorAll('button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    desenhar();
  });

  $('fel').oninput = MT.debounce(e => { fel = +e.target.value || 0; desenhar(); }, 250);
  $('q').oninput = MT.debounce(e => { filtro = e.target.value.trim().toLowerCase(); desenhar(); }, 200);
  desenhar();
})();
