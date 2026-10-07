/* Rio de Janeiro: bairro → zona → seção. Dados no HTML: D {bairro, zona}, SEC.
 * D[nível]: [lat, lon, nome, eleitores 2026, abstenções 2024, taxa 2024 %, %21–34, %escol. baixa, %masc.,
 *            votos recuperáveis, nº de seções, seções sem dado 2024]
 * SEC: [lat, lon, bairro, eleitores 2026, abstenções 2024, taxa 2024 %, %21–34, %escol. baixa, %masc.,
 *       votos recuperáveis (null = sem dado 2024), zona, seção, {local, endereco}, densidade do alvo] */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const nf = (v, d) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const int = v => Math.round(v).toLocaleString('pt-BR');
  const NOME = { bairro: 'bairros', zona: 'zonas eleitorais', secao: 'seções' };

  // densidade do público-alvo: média geométrica dos três percentuais (mesma definição da seção)
  const dens = x => nivel === 'secao' && x[13] != null ? x[13] : Math.cbrt(x[6] * x[7] * x[8]) / 100;
  // seção nova: tem perfil (2026), não tem abstenção (2024) — só falta dado para abstenção e votos recuperáveis
  const semAbst = x => nivel === 'secao' && x[9] == null;
  const semDado = x => semAbst(x) && met !== 'dens';
  const MET = {
    dens: { n: 'densidade do público-alvo', v: dens, f: v => nf(v, 3) },
    abst: { n: 'abstenção em 2024', v: x => x[5], f: v => nf(v, 1) + '%' },
    rec: { n: 'votos recuperáveis (teto teórico)', v: x => x[9], f: v => int(v) },
  };

  // enquadramento: extensão das seções, não do Brasil
  let s = 90, o = 180, n = -90, l = -180;
  SEC.forEach(x => { const a = +x[0], b = +x[1]; if (a < s) s = a; if (a > n) n = a; if (b < o) o = b; if (b > l) l = b; });
  const M = MT.mapa('map', { malha: 'malha_rio.json', limites: [[s, o], [n, l]], maxLimites: L.latLngBounds([[s, o], [n, l]]).pad(0.6), minZoom: 9 });

  let nivel = 'bairro', met = 'dens', filtro = '', idx = new Map(), sel = null;
  const dados = () => nivel === 'secao' ? SEC : D[nivel];
  const chave = x => x[2] + '|' + x[0] + '|' + x[1] + (nivel === 'secao' ? '|' + x[11] : '');
  const rotulo = x => nivel === 'secao' ? `${x[2]} · zona ${x[10]}, seção ${x[11]}` : x[2];

  function popup(x) {
    const linhas = [
      ['Eleitores (2026)', int(x[3])],
      ...(semAbst(x) ? [] : [['Abstenções (2024)', `${int(x[4])} (${nf(x[5], 1)}%)`], ['Votos recuperáveis (teto)', int(x[9])]]),
      ['21–34 anos', x[6] + '%'], ['Escolaridade baixa', x[7] + '%'], ['Masculino', x[8] + '%'],
      ['Densidade do alvo', nf(dens(x), 3)],
    ];
    const L2 = nivel === 'secao' ? x[12] : null;
    const sub = nivel === 'secao' ? `zona ${x[10]} · seção ${x[11]}${L2 && L2.local ? '<br>' + MT.esc(L2.local) + '<br>' + MT.esc(L2.endereco || '') : ''}`
      : `${int(x[10])} seções${x[11] ? ` · <span class="falta">${int(x[11])} sem abstenção 2024</span>` : ''}`;
    return `<h3>${MT.esc(x[2])}</h3><div class="z">${sub}</div><table>` +
      linhas.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('') +
      (semAbst(x) ? '<tr><td colspan="2" class="falta">Sem abstenção 2024: seção criada depois</td></tr>' : '') + '</table>';
  }

  function desenhar() {
    M.camada.clearLayers(); M.limpaDestaque(); idx = new Map();
    const d = dados().filter(x => !filtro || x[2].toLowerCase().includes(filtro));
    const comDado = d.filter(x => !semDado(x));
    const E = MT.escala(comDado.map(MET[met].v), { fmt: MET[met].f });
    const mx = Math.max(1, ...d.map(x => x[3]));
    const [r0, r1] = nivel === 'secao' ? [2, 9] : nivel === 'zona' ? [6, 26] : [4, 24];
    d.slice().sort((a, b) => b[3] - a[3]).forEach(x => {
      const r = MT.raio(x[3], mx, r0, r1), novo = semDado(x);
      const m = L.circleMarker([+x[0], +x[1]], novo
        ? { radius: r, color: '#b45309', weight: 1.5, dashArray: '3,3', fillColor: '#fff', fillOpacity: 0.5 }
        : { radius: r, color: '#fff', weight: nivel === 'secao' ? 0.5 : 1.2, fillColor: E.cor(MET[met].v(x)), fillOpacity: 0.92 });
      m.bindPopup(() => popup(x), { maxWidth: 300 });
      m.bindTooltip(`${rotulo(x)} — ${novo ? 'sem dado 2024' : MET[met].f(MET[met].v(x))}`, { direction: 'top', offset: [0, -3] });
      m.on('click', () => { sel = chave(x); M.destaca(m); });
      m.addTo(M.camada); idx.set(chave(x), m);
    });
    const nSem = d.length - comDado.length;
    M.legenda({
      titulo: MET[met].n[0].toUpperCase() + MET[met].n.slice(1), escala: E, tamanho: 'eleitores (2026)',
      extras: nSem ? [{ rot: 'seção sem abstenção 2024', classe: 'tracejado', n: nSem }] : [],
      nota: met === 'abst' ? 'Abstenção de 2024 (municipal): a de 2026 por seção ainda não foi publicada.'
        : met === 'rec' ? 'Eleitores × abstenção 2024 × densidade do alvo. Teto teórico, não previsão.'
          : 'Média geométrica de %21–34 anos, %escolaridade baixa e %masculino.',
    });
    const ord = d.slice().sort((a, b) => (semDado(a) - semDado(b)) || (MET[met].v(b) - MET[met].v(a)));
    $('tit').textContent = `${ord.length.toLocaleString('pt-BR')} ${NOME[nivel]} — maior ${MET[met].n.split(' (')[0]} primeiro`;
    MT.lista($('lista'), ord, {
      render: x => ({
        nome: MT.esc(rotulo(x)),
        meta: `${int(x[3])} eleitores · 21–34: ${x[6]}%${semAbst(x) ? ' · <span class="falta">sem abstenção 2024</span>' : ''}`,
        valor: semDado(x) ? '—' : MET[met].f(MET[met].v(x)),
        sub: semDado(x) ? 'seção nova' : semAbst(x) ? 'seção nova' : met === 'rec' ? `abstenção ${nf(x[5], 1)}%` : `${int(x[9])} rec.`,
      }),
      aoEscolher: x => { sel = chave(x); M.foca(idx.get(sel), nivel === 'secao' ? 16 : 13); },
      selecionado: x => chave(x) === sel,
    });
    MT.anuncia(`${ord.length} ${NOME[nivel]} por ${MET[met].n}.`);
  }

  const grupoBotoes = (mapa, aplicar) => Object.keys(mapa).forEach(id => {
    $(id).setAttribute('aria-pressed', $(id).classList.contains('on'));
    $(id).onclick = () => {
      Object.keys(mapa).forEach(k => { $(k).classList.toggle('on', k === id); $(k).setAttribute('aria-pressed', k === id); });
      aplicar(mapa[id]); desenhar();
    };
  });
  grupoBotoes({ nb: 'bairro', nz: 'zona', ns: 'secao' }, v => { nivel = v; sel = null; M.map.closePopup(); });
  grupoBotoes({ md: 'dens', ma: 'abst', mr: 'rec' }, v => { met = v; });
  const q = $('q');
  q.setAttribute('aria-label', 'Buscar bairro');
  q.oninput = MT.debounce(e => { filtro = e.target.value.trim().toLowerCase(); desenhar(); }, 200);
  desenhar();
})();
