/* Explorador eleitoral 2026
 * Uma única base por município (dados/municipios.json, contagens brutas). Estado,
 * região e Brasil são somados aqui; toda taxa é razão de somas.
 * Estado da interface vive na URL (#/explorar?t=UF:BA&i=abst...), então todo
 * recorte é compartilhável e o botão "voltar" funciona.
 */
'use strict';

/* ================================================================ utilidades */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const NS = 'http://www.w3.org/2000/svg';
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const nf = (v, d) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtInt = v => v == null || !isFinite(v) ? '—' : Math.round(v).toLocaleString('pt-BR');
const fmtPct = (v, d = 1) => v == null || !isFinite(v) ? '—' : nf(v, d) + '%';
const fmtPP = (v, d = 1) => v == null || !isFinite(v) ? '—' : (v > 0.05 ? '+' : v < -0.05 ? '−' : '') + nf(Math.abs(v), d) + ' p.p.';
const pct = (a, b) => b > 0 ? 100 * a / b : null;
function svg(tag, attrs, pai) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (pai) pai.appendChild(e);
  return e;
}
function quantil(ordenado, p) {
  if (!ordenado.length) return NaN;
  const i = (ordenado.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i);
  return ordenado[lo] + (ordenado[hi] - ordenado[lo]) * (i - lo);
}
function arredondaBonito(x) {
  if (!(x > 0)) return 0;
  const p = Math.pow(10, Math.floor(Math.log10(x))), f = x / p;
  return (f < 1.5 ? 1 : f < 2.25 ? 2 : f < 3.5 ? 2.5 : f < 7.5 ? 5 : 10) * p;
}
function ticks(min, max, n = 5) {
  if (!(max > min)) return [min];
  const passo = arredondaBonito((max - min) / n);
  const out = [];
  for (let v = Math.ceil(min / passo) * passo; v <= max + passo * 1e-9; v += passo) out.push(+v.toFixed(10));
  return out;
}
const MINUSC = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'del', 'la']);
function titulo(s) {
  return s.toLowerCase().split(/(\s+)/).map((w, i) => {
    if (/^\s+$/.test(w) || (i > 0 && MINUSC.has(w))) return w;
    return w.replace(/(^|['’\-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
  }).join('');
}

const UFNOME = {
  AC: 'Acre', AL: 'Alagoas', AM: 'Amazonas', AP: 'Amapá', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal',
  ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MG: 'Minas Gerais', MS: 'Mato Grosso do Sul',
  MT: 'Mato Grosso', PA: 'Pará', PB: 'Paraíba', PE: 'Pernambuco', PI: 'Piauí', PR: 'Paraná',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RO: 'Rondônia', RR: 'Roraima', RS: 'Rio Grande do Sul',
  SC: 'Santa Catarina', SE: 'Sergipe', SP: 'São Paulo', TO: 'Tocantins', ZZ: 'Exterior',
};
const REGIOES = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
const TIPO = { br: 'País', rg: 'Região', uf: 'Estado', mu: 'Município' };

/* ================================================================ dados */
let CANDS = [], DIMS = [], MUN = [], UFS = [], U = new Map(), MALHA = null;

function nova(id, tipo, nome, extra) {
  return Object.assign({
    id, tipo, nome, aptos: 0, comp: 0, abst: 0, validos: 0, brancos: 0, nulos: 0, secoes: 0, nMun: 0,
    demo: DIMS.map(d => d[1].map(() => 0)), votos: CANDS.map(() => 0),
  }, extra);
}
function soma(a, m) {
  a.aptos += m.aptos; a.comp += m.comp; a.abst += m.abst; a.validos += m.validos;
  a.brancos += m.brancos; a.nulos += m.nulos; a.secoes += m.secoes; a.nMun += 1;
  for (let d = 0; d < m.demo.length; d++) for (let g = 0; g < m.demo[d].length; g++) a.demo[d][g] += m.demo[d][g];
  for (let c = 0; c < m.votos.length; c++) a.votos[c] += m.votos[c];
}
function prepara(J) {
  CANDS = J.candidatos.map(([n, p], k) => ({ k, nome: titulo(n), partido: p }));
  DIMS = J.dimensoes;
  const br = nova('BR', 'br', 'Brasil');
  U.set('BR', br);
  REGIOES.forEach(r => U.set('R:' + r, nova('R:' + r, 'rg', r, { regiao: r })));
  Object.keys(UFNOME).forEach(uf => U.set('UF:' + uf, nova('UF:' + uf, 'uf', UFNOME[uf], { uf, regiao: null })));
  for (const x of J.municipios) {
    const [cod, nome, uf, regiao, lat, lon, aptos, comp, abst, validos, brancos, nulos, secoes, demo, votos] = x;
    const m = {
      id: 'M:' + cod, tipo: 'mu', cod, nome: titulo(nome), uf, regiao, lat, lon,
      aptos, comp, abst, validos, brancos, nulos, secoes, demo, votos, nMun: 1,
    };
    MUN.push(m); U.set(m.id, m);
    const u = U.get('UF:' + uf); u.regiao = regiao; soma(u, m);
    if (U.has('R:' + regiao)) soma(U.get('R:' + regiao), m);
    soma(br, m);
  }
  UFS = Object.keys(UFNOME).filter(uf => uf !== 'ZZ' && U.get('UF:' + uf).nMun).map(uf => U.get('UF:' + uf));
  for (const u of U.values()) u.chave = norm(u.nome);
}
const PREP_DE = new Set(['AL', 'GO', 'MG', 'MS', 'MT', 'PE', 'RO', 'RR', 'SC', 'SE', 'SP']);
function prep(u) {
  if (u.tipo === 'uf') return PREP_DE.has(u.uf) ? 'de' : /^(BA|PB)$/.test(u.uf) ? 'da' : 'do';
  if (u.tipo === 'mu') return 'de';
  return 'do';
}
function pai(u) {
  if (u.tipo === 'mu') return U.get('UF:' + u.uf);
  if (u.tipo === 'uf') return u.uf === 'ZZ' ? U.get('BR') : U.get('R:' + u.regiao);
  if (u.tipo === 'rg') return U.get('BR');
  return null;
}
function cadeia(u) { const c = []; for (let x = u; x; x = pai(x)) c.unshift(x); return c; }
function rotulo(u) { return u.tipo === 'mu' ? `${u.nome} (${u.uf})` : u.tipo === 'uf' && u.uf !== 'ZZ' ? `${u.nome} (${u.uf})` : u.nome; }
function ordemVotos(u) { return u.votos.map((v, k) => [k, v]).sort((a, b) => b[1] - a[1]); }

/* ================================================================ indicadores */
const D_IDADE = 0, D_ESC = 1, D_GEN = 2, D_CIV = 3;
const somaArr = a => a.reduce((s, v) => s + v, 0);
const pDemo = (u, d, gs) => pct(gs.reduce((s, g) => s + u.demo[d][g], 0), somaArr(u.demo[d]));
let IND = [];
function montaIndicadores() {
  const A = CANDS[0], B = CANDS[1];
  IND = [
    { k: 'abst', g: 'Participação', r: 'Abstenção', u: '% dos aptos', fmt: 'pct', f: u => pct(u.abst, u.aptos),
      d: 'Eleitores aptos que não compareceram, sobre o total de aptos.' },
    { k: 'bn', g: 'Participação', r: 'Brancos e nulos', u: '% dos votantes', fmt: 'pct', f: u => pct(u.brancos + u.nulos, u.comp),
      d: 'Votos brancos e nulos sobre quem compareceu.' },
    { k: 'aptos', g: 'Participação', r: 'Eleitores aptos', u: 'eleitores', fmt: 'int', f: u => u.aptos,
      d: 'Tamanho do eleitorado. Escala em quintis: a cor separa portes, não proporções.' },
    { k: 'saldo', g: 'Resultado presidencial', r: `Vantagem de ${A.nome} sobre ${B.nome}`, u: 'p.p. dos válidos', fmt: 'pp', esc: 'div',
      f: u => u.validos ? 100 * (u.votos[0] - u.votos[1]) / u.validos : null,
      d: `Diferença entre ${A.nome} (${A.partido}) e ${B.nome} (${B.partido}) em pontos percentuais dos votos válidos. Azul: ${A.nome} à frente; vermelho: ${B.nome} à frente.` },
    { k: 'margem', g: 'Resultado presidencial', r: 'Margem entre 1º e 2º colocados', u: 'p.p. dos válidos', fmt: 'pp1',
      f: u => { if (!u.validos) return null; const o = ordemVotos(u); return 100 * (o[0][1] - o[1][1]) / u.validos; },
      d: 'Distância entre os dois mais votados no local, quaisquer que sejam. Margem pequena indica disputa, não volatilidade.' },
    ...CANDS.slice(0, 5).map(c => ({
      k: 'c' + c.k, g: 'Resultado presidencial', r: `${c.nome} (${c.partido})`, u: '% dos válidos', fmt: 'pct', cand: c.k,
      f: u => pct(u.votos[c.k], u.validos), d: `Votos de ${c.nome} sobre os votos válidos.`,
    })),
    { k: 'p1624', g: 'Perfil do eleitorado (2026)', r: 'Jovens de 16 a 24 anos', u: '% do eleitorado', fmt: 'pct', f: u => pDemo(u, D_IDADE, [0, 1]),
      d: 'Composição do eleitorado, não de quem votou.' },
    { k: 'p1617', g: 'Perfil do eleitorado (2026)', r: 'Voto facultativo: 16 e 17 anos', u: '% do eleitorado', fmt: 'pct', f: u => pDemo(u, D_IDADE, [0]),
      d: 'Eleitores alistados com 16 ou 17 anos (voto facultativo).' },
    { k: 'p60', g: 'Perfil do eleitorado (2026)', r: '60 anos ou mais', u: '% do eleitorado', fmt: 'pct', f: u => pDemo(u, D_IDADE, [5, 6]),
      d: 'Inclui 70+, faixa em que o voto é facultativo.' },
    { k: 'pbaixa', g: 'Perfil do eleitorado (2026)', r: 'Até fundamental incompleto', u: '% do eleitorado', fmt: 'pct', f: u => pDemo(u, D_ESC, [0, 1, 2]),
      d: 'Analfabetos, quem lê e escreve e fundamental incompleto. Escolaridade declarada no alistamento, frequentemente desatualizada.' },
    { k: 'psup', g: 'Perfil do eleitorado (2026)', r: 'Ensino superior (completo ou não)', u: '% do eleitorado', fmt: 'pct', f: u => pDemo(u, D_ESC, [6, 7]),
      d: 'Escolaridade declarada no alistamento, frequentemente desatualizada.' },
    { k: 'pfem', g: 'Perfil do eleitorado (2026)', r: 'Mulheres', u: '% do eleitorado', fmt: 'pct', f: u => pDemo(u, D_GEN, [0]), d: 'Gênero informado no cadastro eleitoral.' },
    { k: 'psolt', g: 'Perfil do eleitorado (2026)', r: 'Solteiros', u: '% do eleitorado', fmt: 'pct', f: u => pDemo(u, D_CIV, [0]), d: 'Estado civil informado no cadastro eleitoral.' },
  ];
}
const indPor = k => IND.find(i => i.k === k) || IND[0];
function fmtV(ind, v) {
  if (v == null || !isFinite(v)) return '—';
  if (ind.fmt === 'int') return fmtInt(v);
  if (ind.fmt === 'pp') return fmtPP(v);
  if (ind.fmt === 'pp1') return nf(v, 1) + ' p.p.';
  return fmtPct(v);
}
function fmtCurto(ind, v) {
  if (ind.fmt === 'int') return v >= 1e6 ? nf(v / 1e6, 1) + ' mi' : v >= 1e4 ? nf(v / 1e3, 0) + ' mil' : fmtInt(v);
  if (ind.fmt === 'pp') return (v > 0 ? '+' : v < 0 ? '−' : '') + nf(Math.abs(v), Math.abs(v) < 10 ? 1 : 0);
  return nf(v, Math.abs(v) < 10 ? 1 : 0) + (ind.fmt === 'pct' ? '%' : '');
}
// rótulo de eixo: casas decimais conforme o passo, para não repetir "15% 15%"
function fmtTick(ind, v, passo) {
  if (ind.fmt === 'int') return fmtCurto(ind, v);
  const d = passo < 1 ? 1 : 0, sx = ind.fmt === 'pct' ? '%' : '';
  return (ind.fmt === 'pp' && v > 0 ? '+' : v < 0 ? '−' : '') + nf(Math.abs(v), d) + sx;
}
const semPonto = t => t.replace(/\.$/, '');
function diff(ind, a, b) {
  if (a == null || b == null) return '';
  if (ind.fmt === 'int') return '';
  return fmtPP(a - b);
}

/* ================================================================ escala de cor */
function escala(ind, vals) {
  const s = vals.filter(v => v != null && isFinite(v)).sort((a, b) => a - b);
  let cortes, cores;
  if (ind.esc === 'div') {
    // cortes fixos: a mesma cor significa a mesma vantagem em qualquer recorte
    const b = [5, 15, 30];
    cortes = [-b[2], -b[1], -b[0], b[0], b[1], b[2]];
    cores = ['--divB-3', '--divB-2', '--divB-1', '--div-0', '--divA-1', '--divA-2', '--divA-3'].map(css);
  } else {
    const dec = ind.fmt === 'int' ? -1 : 1;
    const r = v => dec < 0 ? (v > 0 ? +v.toPrecision(2) : 0) : Math.round(v * 10) / 10;
    cortes = [0.2, 0.4, 0.6, 0.8].map(p => r(quantil(s, p))).filter((v, i, a) => !i || v > a[i - 1]);
    const ramp = ['--seq-1', '--seq-2', '--seq-3', '--seq-4', '--seq-5'].map(css);
    cores = cortes.length === 4 ? ramp : ramp.slice(5 - cortes.length - 1);
  }
  const classe = v => { let i = 0; while (i < cortes.length && v >= cortes[i]) i++; return i; };
  const classes = cores.map((cor, i) => ({ cor, n: 0, de: i ? cortes[i - 1] : null, ate: i < cortes.length ? cortes[i] : null }));
  s.forEach(v => classes[classe(v)].n++);
  classes.forEach(c => {
    if (c.de == null) c.rot = `até ${fmtCurto(ind, c.ate)}`;
    else if (c.ate == null) c.rot = `${fmtCurto(ind, c.de)} ou mais`;
    else c.rot = `${fmtCurto(ind, c.de)} a ${fmtCurto(ind, c.ate)}`;
  });
  return { cor: v => v == null || !isFinite(v) ? css('--land') : cores[classe(v)], classes };
}

/* ================================================================ estado / URL */
const S = { view: 'explorar', t: 'BR', i: 'abst', v: 'mapa', n: 'uf', min: 0, y: 'pbaixa', c: [], rk: 'max', h: 'n' };
function lerHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const [rota, qs] = h.split('?');
  S.view = ['explorar', 'comparar', 'sobre'].includes(rota) ? rota : 'explorar';
  const p = new URLSearchParams(qs || '');
  if (p.has('t') && U.has(p.get('t'))) S.t = p.get('t');
  if (p.has('i') && IND.some(i => i.k === p.get('i'))) S.i = p.get('i');
  if (p.has('v') && ['mapa', 'ranking', 'distribuicao', 'dispersao', 'tabela'].includes(p.get('v'))) S.v = p.get('v');
  if (p.has('n') && ['uf', 'mu'].includes(p.get('n'))) S.n = p.get('n');
  if (p.has('y') && IND.some(i => i.k === p.get('y'))) S.y = p.get('y');
  S.min = Math.max(0, +p.get('min') || 0);
  if (p.has('c')) S.c = p.get('c').split(',').filter(id => U.has(id)).slice(0, 4);
}
function hashAtual() {
  const p = new URLSearchParams();
  if (S.view === 'explorar') {
    p.set('t', S.t); p.set('i', S.i); p.set('v', S.v);
    if (S.n !== 'uf') p.set('n', S.n);
    if (S.min) p.set('min', S.min);
    if (S.v === 'dispersao') p.set('y', S.y);
  }
  if (S.c.length) p.set('c', S.c.join(','));
  const q = p.toString().replace(/%3A/g, ':').replace(/%2C/g, ',');
  return '#/' + S.view + (q ? '?' + q : '');
}
function escreveHash(empilhar) {
  const h = hashAtual();
  if (h === location.hash) return;
  if (empilhar) history.pushState(null, '', h); else history.replaceState(null, '', h);
}
function irPara(id, opts = {}) {
  if (!U.has(id)) return;
  S.t = id; S.view = 'explorar';
  const u = U.get(id);
  if (u.tipo === 'uf' || u.tipo === 'mu') S.n = 'mu';
  escreveHash(true);
  render();
  if (opts.foco) $('#ficha h2')?.focus();
}
function anuncia(t) { const a = $('#anuncio'); a.textContent = ''; setTimeout(() => { a.textContent = t; }, 30); }
function toast(t) {
  const e = $('#toast'); e.textContent = t; e.hidden = false;
  clearTimeout(toast.h); toast.h = setTimeout(() => { e.hidden = true; }, 2200);
}

/* conjunto de unidades exibidas nos gráficos para o território atual */
function conjunto() {
  const t = U.get(S.t);
  let escopo, itens, nivel;
  if (t.tipo === 'mu' || t.tipo === 'uf') {
    escopo = U.get('UF:' + t.uf); nivel = 'mu';
    itens = MUN.filter(m => m.uf === t.uf);
  } else {
    escopo = t; nivel = S.n;
    if (nivel === 'uf') itens = UFS.filter(u => t.tipo === 'br' || u.regiao === t.nome);
    else itens = MUN.filter(m => m.uf !== 'ZZ' && (t.tipo === 'br' || m.regiao === t.nome));
  }
  const total = itens.length;
  if (nivel === 'mu' && S.min > 0) itens = itens.filter(m => m.aptos >= S.min || m.id === S.t);
  return { t, escopo, itens, nivel, total };
}
function nomeConjunto(c) {
  const qual = c.nivel === 'uf' ? 'estados' : 'municípios';
  const onde = c.escopo.uf === 'ZZ' ? 'no exterior' : prep(c.escopo) + ' ' + c.escopo.nome;
  return `${qual} ${onde}`;
}

/* ================================================================ dica (tooltip) */
const dica = () => $('#dica');
function mostraDica(html, x, y) {
  const d = dica(); d.innerHTML = html; d.hidden = false;
  const r = d.getBoundingClientRect();
  let px = x + 14, py = y + 14;
  if (px + r.width > innerWidth - 8) px = x - r.width - 14;
  if (py + r.height > innerHeight - 8) py = y - r.height - 14;
  d.style.left = Math.max(8, px) + 'px'; d.style.top = Math.max(8, py) + 'px';
}
function escondeDica() { dica().hidden = true; }
function ligaDicas(raiz) {
  raiz.addEventListener('mousemove', e => { const el = e.target.closest('[data-dica]') || e.target; if (el.__dica) mostraDica(el.__dica, e.clientX, e.clientY); else escondeDica(); });
  raiz.addEventListener('mouseleave', escondeDica);
}

/* ================================================================ casca da view explorar */
function montaExplorar() {
  const v = document.createElement('div');
  v.id = 'v-explorar';
  v.innerHTML = `
  <div class="contexto">
   <nav aria-label="Nível territorial"><ol class="migalhas" id="migalhas"></ol></nav>
   <div class="campo"><label for="s-ind">Indicador</label><select id="s-ind"></select></div>
   <div class="campo"><span class="rot" id="r-niv">Unidades</span>
    <div class="seg" role="group" aria-labelledby="r-niv">
     <button type="button" data-n="uf">Estados</button><button type="button" data-n="mu">Municípios</button></div></div>
   <div class="campo"><label for="i-min">Mín. de eleitores</label>
    <input type="number" id="i-min" min="0" step="1000" inputmode="numeric"></div>
   <p class="ind-desc" id="ind-desc"></p>
  </div>
  <main id="conteudo" tabindex="-1">
   <div class="grade">
    <section class="cartao" aria-labelledby="h-vis">
     <header><h2 id="h-vis"></h2><span class="desc" id="n-vis"></span></header>
     <div class="abas" role="tablist" aria-label="Formas de ver">
      ${[['mapa', 'Mapa'], ['ranking', 'Ranking'], ['distribuicao', 'Distribuição'], ['dispersao', 'Relação entre indicadores'], ['tabela', 'Tabela']]
        .map(([k, r]) => `<button role="tab" id="a-${k}" aria-controls="p-${k}" data-v="${k}">${r}</button>`).join('')}
     </div>
     <div class="painel-aba" id="p-mapa" role="tabpanel" aria-labelledby="a-mapa">
      <div id="mapa" role="region" aria-label="Mapa interativo. A mesma informação está nas abas Ranking e Tabela."></div>
      <div class="legenda" id="legenda"></div>
      <p class="nota" id="nota-mapa"></p>
     </div>
     <div class="painel-aba" id="p-ranking" role="tabpanel" aria-labelledby="a-ranking" hidden>
      <div class="rank-cab">
       <div class="seg" role="group" aria-label="Ordem"><button type="button" data-rk="max">Maiores</button><button type="button" data-rk="min">Menores</button></div>
       <span class="chave-ref"><i></i><span id="rk-ref"></span></span>
      </div>
      <ol class="rank" id="rank"></ol>
      <button type="button" class="btn mais" id="rk-mais">Mostrar mais</button>
     </div>
     <div class="painel-aba" id="p-distribuicao" role="tabpanel" aria-labelledby="a-distribuicao" hidden>
      <div class="barra-aba">
       <div class="campo"><span class="rot" id="r-h">Altura da barra</span>
        <div class="seg" role="group" aria-labelledby="r-h"><button type="button" data-h="n">Nº de unidades</button><button type="button" data-h="el">Nº de eleitores</button></div></div>
       <p class="info" id="h-info"></p>
      </div>
      <div class="svgbox" id="hist"></div>
     </div>
     <div class="painel-aba" id="p-dispersao" role="tabpanel" aria-labelledby="a-dispersao" hidden>
      <div class="barra-aba">
       <div class="campo"><label for="s-y">Eixo vertical</label><select id="s-y"></select></div>
       <p class="info" id="d-info"></p>
      </div>
      <div class="svgbox" id="disp"></div>
     </div>
     <div class="painel-aba" id="p-tabela" role="tabpanel" aria-labelledby="a-tabela" hidden>
      <div class="barra-aba">
       <div class="campo"><label for="t-q">Filtrar nesta tabela</label><input class="f" type="search" id="t-q" placeholder="nome…"></div>
       <button type="button" class="btn" id="t-csv"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0-4-4m4 4 4-4M4 19h16"/></svg>Baixar CSV</button>
       <p class="info">Clique numa linha para abrir a ficha. Esta tabela é a alternativa textual do mapa e dos gráficos.</p>
      </div>
      <div class="tab-wrap"><table id="tab"><caption id="t-cap"></caption><thead></thead><tbody></tbody></table></div>
      <button type="button" class="btn mais" id="t-mais">Mostrar mais 100</button>
     </div>
    </section>
    <aside class="cartao ficha" id="ficha" aria-label="Ficha do território"></aside>
   </div>
  </main>`;
  $('#app').appendChild(v);

  // indicador
  const sel = $('#s-ind'), selY = $('#s-y');
  const grupos = [...new Set(IND.map(i => i.g))];
  for (const s of [sel, selY]) {
    grupos.forEach(g => {
      const og = document.createElement('optgroup'); og.label = g;
      IND.filter(i => i.g === g).forEach(i => { const o = document.createElement('option'); o.value = i.k; o.textContent = i.r; og.appendChild(o); });
      s.appendChild(og);
    });
  }
  sel.onchange = () => { S.i = sel.value; escreveHash(); render(); };
  selY.onchange = () => { S.y = selY.value; escreveHash(); render(); };
  $$('[data-n]', v).forEach(b => b.onclick = () => { S.n = b.dataset.n; escreveHash(); render(); });
  $('#i-min').onchange = e => { S.min = Math.max(0, +e.target.value || 0); escreveHash(); render(); };
  $$('.abas [role=tab]', v).forEach(b => {
    b.onclick = () => { S.v = b.dataset.v; escreveHash(); render(); };
    b.onkeydown = e => {
      const abas = $$('.abas [role=tab]', v), i = abas.indexOf(b);
      const j = e.key === 'ArrowRight' ? (i + 1) % abas.length : e.key === 'ArrowLeft' ? (i - 1 + abas.length) % abas.length : -1;
      if (j >= 0) { e.preventDefault(); abas[j].focus(); abas[j].click(); }
    };
  });
  $$('[data-rk]', v).forEach(b => b.onclick = () => { S.rk = b.dataset.rk; rkN = 25; renderRanking(conjunto()); });
  $$('[data-h]', v).forEach(b => b.onclick = () => { S.h = b.dataset.h; renderHist(conjunto()); });
  $('#rk-mais').onclick = () => { rkN += 25; renderRanking(conjunto()); };
  $('#t-mais').onclick = () => { tabN += 100; renderTabela(conjunto()); };
  $('#t-q').oninput = () => { tabN = 100; renderTabela(conjunto()); };
  $('#t-csv').onclick = baixaCSV;
  ligaDicas($('#hist')); ligaDicas($('#disp'));
}

/* ================================================================ render principal */
function render() {
  $$('.menu [data-rota]').forEach(a => { if (a.dataset.rota === S.view) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  $('#n-cmp').textContent = S.c.length || '';
  ['explorar', 'comparar', 'sobre'].forEach(k => { const e = $('#v-' + k); if (e) e.hidden = k !== S.view; });
  escondeDica();
  if (S.view === 'comparar') return renderComparar();
  if (S.view === 'sobre') return renderSobre();

  const c = conjunto(), ind = indPor(S.i);
  document.title = `${c.t.nome} — ${ind.r} · Explorador eleitoral 2026`;
  // contexto
  $('#migalhas').innerHTML = cadeia(c.t).map((u, i, a) => i === a.length - 1
    ? `<li><span aria-current="location">${esc(u.nome)}</span></li>`
    : `<li><button type="button" data-ir="${u.id}">${esc(u.nome)}</button></li>`).join('');
  $$('#migalhas [data-ir]').forEach(b => b.onclick = () => irPara(b.dataset.ir));
  $('#s-ind').value = S.i; $('#s-y').value = S.y;
  $('#ind-desc').textContent = ind.d + (ind.u ? ` Unidade: ${ind.u}.` : '');
  const travado = c.t.tipo === 'uf' || c.t.tipo === 'mu';
  $$('[data-n]').forEach(b => { b.setAttribute('aria-pressed', b.dataset.n === c.nivel); b.disabled = travado && b.dataset.n === 'uf'; });
  $('#i-min').value = S.min || '';
  $('#i-min').disabled = c.nivel !== 'mu';
  $$('.abas [role=tab]').forEach(b => { const on = b.dataset.v === S.v; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
  $$('.painel-aba').forEach(p => { p.hidden = p.id !== 'p-' + S.v; });
  $('#h-vis').textContent = `${ind.r} — ${nomeConjunto(c)}`;
  $('#n-vis').textContent = `${fmtInt(c.itens.length)} ${c.nivel === 'uf' ? 'estados' : 'municípios'}` +
    (c.itens.length < c.total ? ` de ${fmtInt(c.total)} (filtro de eleitores)` : '');

  if (S.v === 'mapa') renderMapa(c); else if (S.v === 'ranking') renderRanking(c);
  else if (S.v === 'distribuicao') renderHist(c); else if (S.v === 'dispersao') renderDisp(c);
  else renderTabela(c);
  renderFicha(c.t);
  anuncia(`${ind.r}: ${c.itens.length} ${c.nivel === 'uf' ? 'estados' : 'municípios'}. Ficha: ${rotulo(c.t)}.`);
}

/* ================================================================ mapa */
let mapa, camUF, camPts, camSel, rend, ufLayer = {}, ultimoAjuste = '', mapaPendente = null;
function iniciaMapa() {
  rend = L.canvas({ padding: 0.4 });
  mapa = L.map('mapa', { zoomSnap: 0.25, minZoom: 3, maxZoom: 12, maxBounds: [[-42, -90], [12, -20]], renderer: rend, zoomControl: true });
  mapa.attributionControl.setPrefix(false);
  mapa.attributionControl.addAttribution('Contornos: IBGE · Dados: TSE');
  const feats = Object.keys(MALHA).map(uf => ({
    type: 'Feature', properties: { uf },
    geometry: { type: 'MultiPolygon', coordinates: MALHA[uf].map(p => p.map(a => a.map(q => [q[1], q[0]]))) },
  }));
  camUF = L.geoJSON({ type: 'FeatureCollection', features: feats }, {
    renderer: rend,
    onEachFeature: (f, l) => {
      const uf = f.properties.uf; ufLayer[uf] = l;
      l.on('click', () => irPara('UF:' + uf));
      l.bindTooltip(() => dicaUnidade(U.get('UF:' + uf)), { sticky: true, direction: 'top' });
    },
  }).addTo(mapa);
  camPts = L.layerGroup().addTo(mapa);
  camSel = L.layerGroup().addTo(mapa);
  mapa.fitBounds([[-33.8, -74], [5.3, -34.8]]);
}
function dicaUnidade(u) {
  const ind = indPor(S.i), v = ind.f(u), r = pai(u) ? ind.f(pai(u)) : null;
  const o = ordemVotos(u);
  return `<b>${esc(rotulo(u))}</b>${esc(ind.r)}: <b style="display:inline">${fmtV(ind, v)}</b>` +
    (r != null && ind.fmt !== 'int' ? `<br><span style="color:var(--ink-2)">${diff(ind, v, r)} vs ${esc(pai(u).nome)}</span>` : '') +
    `<br><span style="color:var(--ink-2)">${fmtInt(u.aptos)} eleitores · 1º: ${esc(CANDS[o[0][0]].nome)}</span>`;
}
function limitesUF(ufs) {
  let b = null;
  ufs.forEach(uf => { const l = ufLayer[uf]; if (l) b = b ? b.extend(l.getBounds()) : L.latLngBounds(l.getBounds().getSouthWest(), l.getBounds().getNorthEast()); });
  return b;
}
function renderMapa(c) {
  if (!mapa) iniciaMapa();
  mapa.invalidateSize();
  const ind = indPor(S.i);
  const vals = c.itens.map(u => ind.f(u));
  const E = escala(ind, vals);
  const corPorId = new Map(c.itens.map((u, i) => [u.id, E.cor(vals[i])]));
  const ufsEscopo = new Set(c.escopo.tipo === 'br' ? Object.keys(MALHA) : c.escopo.tipo === 'rg' ? UFS.filter(u => u.regiao === c.escopo.nome).map(u => u.uf) : [c.escopo.uf]);
  const land = css('--land'), off = css('--land-off'), linha = css('--uf-line'), ink = css('--ink'), sup = css('--surface');
  camUF.eachLayer(l => {
    const uf = l.feature.properties.uf, dentro = ufsEscopo.has(uf), sel = S.t === 'UF:' + uf;
    l.setStyle(c.nivel === 'uf'
      ? { fillColor: corPorId.get('UF:' + uf) || off, fillOpacity: 1, color: sel ? ink : sup, weight: sel ? 2.5 : 1, opacity: 1 }
      : { fillColor: dentro ? land : off, fillOpacity: 1, color: dentro ? linha : sup, weight: S.t === 'UF:' + uf ? 2 : 0.8, opacity: 1 });
  });
  camPts.clearLayers(); camSel.clearLayers();
  let semCoord = 0;
  if (c.nivel === 'mu') {
    const comCoord = c.itens.filter(m => m.lat != null);
    semCoord = c.itens.length - comCoord.length;
    const mx = Math.max(1, ...comCoord.map(m => m.aptos));
    const rMax = c.escopo.tipo === 'br' ? 13 : c.escopo.tipo === 'rg' ? 16 : 22;
    comCoord.sort((a, b) => b.aptos - a.aptos).forEach(m => {
      const r = Math.max(2.4, rMax * Math.sqrt(m.aptos / mx));
      const p = L.circleMarker([m.lat, m.lon], { renderer: rend, radius: r, fillColor: corPorId.get(m.id), fillOpacity: 0.95, color: sup, weight: 0.7 });
      p.bindTooltip(() => dicaUnidade(m), { direction: 'top' });
      p.on('click', () => irPara(m.id));
      camPts.addLayer(p);
    });
    const t = c.t;
    if (t.tipo === 'mu' && t.lat != null) {
      const r = Math.max(2.4, rMax * Math.sqrt(t.aptos / mx));
      camSel.addLayer(L.circleMarker([t.lat, t.lon], { renderer: rend, radius: r + 4, fill: false, color: css('--hl'), weight: 3, interactive: false }));
    }
  }
  // enquadramento: só quando muda o escopo
  if (ultimoAjuste !== c.escopo.id) {
    ultimoAjuste = c.escopo.id;
    const b = c.escopo.tipo === 'br' ? L.latLngBounds([[-33.8, -74], [5.3, -34.8]]) : limitesUF([...ufsEscopo]);
    if (b) mapa.fitBounds(b, { padding: [16, 16], animate: !matchMedia('(prefers-reduced-motion: reduce)').matches });
  }
  // legenda
  const ref = ind.f(c.escopo);
  $('#legenda').innerHTML = `<span class="t">${esc(ind.r)}</span>` +
    E.classes.map(k => `<span class="k"><i style="background:${k.cor}"></i>${esc(k.rot)} <span style="color:var(--muted)">(${k.n})</span></span>`).join('') +
    (c.nivel === 'mu' ? `<span class="k"><i class="circ" style="width:8px;height:8px"></i><i class="circ" style="width:16px;height:16px"></i>área ∝ eleitores</span>` : '');
  $('#nota-mapa').textContent =
    (ind.esc === 'div' ? 'Classes simétricas em torno de zero. ' : ind.fmt === 'int' ? '' : 'Classes por quintis das unidades exibidas. ') +
    `${c.escopo.nome}: ${fmtV(ind, ref).replace(/\.$/, '')}. ` +
    (c.nivel === 'uf' ? 'Clique num estado para ver seus municípios.' : 'Clique num círculo para abrir a ficha do município.') +
    (semCoord ? ` ${semCoord} unidade(s) sem coordenada ficam fora do mapa (ver Tabela).` : '');
}

/* ================================================================ ranking */
let rkN = 25;
function renderRanking(c) {
  const ind = indPor(S.i);
  $$('[data-rk]').forEach(b => b.setAttribute('aria-pressed', b.dataset.rk === S.rk));
  const lst = c.itens.map(u => [u, ind.f(u)]).filter(x => x[1] != null && isFinite(x[1]));
  lst.sort((a, b) => S.rk === 'max' ? b[1] - a[1] : a[1] - b[1]);
  const ref = ind.f(c.escopo);
  const vs = lst.map(x => x[1]);
  const lo = Math.min(0, ...vs, ref ?? 0), hi = Math.max(0, ...vs, ref ?? 0);
  const div = lo < 0;
  const ext = div ? Math.max(-lo, hi) : hi;
  const pos = v => div ? 50 + 50 * v / ext : 100 * v / (ext || 1);
  const mostra = lst.slice(0, rkN);
  const idxSel = lst.findIndex(x => x[0].id === S.t);
  const linha = ([u, v], i) => {
    const l = pos(Math.min(0, v)), w = Math.abs(pos(v) - pos(0));
    const cor = ind.esc === 'div' ? (v >= 0 ? 'var(--cand-0)' : 'var(--cand-1)') : ind.cand != null ? `var(--cand-${ind.cand})` : 'var(--bar)';
    return `<li><button type="button" data-ir="${u.id}" ${u.id === S.t ? 'aria-current="true"' : ''}>
      <span class="nm"><span class="pos">${i + 1}º</span>${esc(u.nome)}${u.tipo === 'mu' && c.escopo.tipo !== 'uf' ? `<small>${u.uf}</small>` : ''}</span>
      <span class="trilho" aria-hidden="true">${div ? `<span class="zero" style="left:50%"></span>` : ''}
       <span class="b${v < 0 ? ' neg' : ''}" style="left:${l}%;width:${Math.max(0.4, w)}%;background:${cor}"></span>
       ${ref != null ? `<span class="ref" style="left:calc(${pos(ref)}% - 1px)"></span>` : ''}</span>
      <span class="v">${fmtV(ind, v)}</span></button></li>`;
  };
  let html = mostra.map(linha).join('');
  if (idxSel >= rkN) html += `<li aria-hidden="true" style="text-align:center;color:var(--muted)">⋯</li>` + linha(lst[idxSel], idxSel);
  $('#rank').innerHTML = html;
  $$('#rank [data-ir]').forEach(b => b.onclick = () => irPara(b.dataset.ir));
  $('#rk-ref').textContent = ref != null ? `Traço: ${c.escopo.nome}, ${fmtV(ind, ref)}` : '';
  $('#rk-mais').hidden = rkN >= lst.length;
  $('#rk-mais').textContent = `Mostrar mais (${fmtInt(Math.min(25, lst.length - rkN))} de ${fmtInt(lst.length - rkN)} restantes)`;
}

/* ================================================================ histograma */
function renderHist(c) {
  const ind = indPor(S.i);
  $$('[data-h]').forEach(b => b.setAttribute('aria-pressed', b.dataset.h === S.h));
  const box = $('#hist'); box.innerHTML = '';
  const pts = c.itens.map(u => [u, ind.f(u)]).filter(x => x[1] != null && isFinite(x[1]));
  if (pts.length < 3) { box.innerHTML = '<p class="desc">Poucas unidades para uma distribuição. Veja o Ranking.</p>'; $('#h-info').textContent = ''; return; }
  const s = pts.map(x => x[1]).sort((a, b) => a - b);
  let lo = quantil(s, 0.005), hi = quantil(s, 0.995);
  if (ind.fmt === 'int') { lo = 0; hi = quantil(s, 0.98); }
  const tk = ticks(lo, hi, c.nivel === 'uf' ? 8 : 24);
  const passo = tk.length > 1 ? tk[1] - tk[0] : 1;
  const ini = tk[0] > lo ? tk[0] - passo : tk[0];
  const nb = Math.max(1, Math.ceil((hi - ini) / passo));
  const bins = Array.from({ length: nb }, (_, i) => ({ de: ini + i * passo, ate: ini + (i + 1) * passo, n: 0, el: 0 }));
  const binDe = v => Math.max(0, Math.min(nb - 1, Math.floor((v - ini) / passo)));
  pts.forEach(([u, v]) => { const b = bins[binDe(v)]; b.n++; b.el += u.aptos; });
  const W = 720, H = 310, ml = 52, mr = 14, mt = 30, mb = 44;
  const g = svg('svg', { class: 'g', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Histograma de ${ind.r}` }, box);
  const k = S.h === 'el' ? 'el' : 'n';
  const ymx = Math.max(...bins.map(b => b[k])) || 1;
  const X = v => ml + (v - ini) / (nb * passo) * (W - ml - mr);
  const Y = v => H - mb - v / ymx * (H - mt - mb);
  ticks(0, ymx, 4).forEach(t => {
    svg('line', { class: 'grade-l', x1: ml, x2: W - mr, y1: Y(t), y2: Y(t) }, g);
    svg('text', { x: ml - 6, y: Y(t) + 4, 'text-anchor': 'end' }, g).textContent = k === 'el' ? fmtCurto({ fmt: 'int' }, t) : fmtInt(t);
  });
  const selU = c.itens.find(u => u.id === S.t);
  const selB = selU ? binDe(ind.f(selU)) : -1;
  bins.forEach((b, i) => {
    const x = X(b.de) + 1, w = Math.max(1, X(b.ate) - X(b.de) - 2), y = Y(b[k]);
    const r = svg('rect', { class: 'barra' + (i === selB ? ' on' : ''), x, y, width: w, height: Math.max(0, H - mb - y), rx: Math.min(3, w / 2) }, g);
    const alvo = svg('rect', { class: 'alvo', x: X(b.de), y: mt, width: X(b.ate) - X(b.de), height: H - mt - mb }, g);
    const deTxt = i === 0 && s[0] < b.de ? 'até ' + fmtV(ind, b.ate) : i === nb - 1 && s[s.length - 1] > b.ate ? fmtV(ind, b.de) + ' ou mais' : `${fmtV(ind, b.de)} a ${fmtV(ind, b.ate)}`;
    alvo.__dica = r.__dica = `<b>${deTxt}</b>${fmtInt(b.n)} ${c.nivel === 'uf' ? 'estados' : 'municípios'}<br>${fmtInt(b.el)} eleitores`;
  });
  const salto = Math.ceil(tk.length / 10);
  tk.forEach((t, i) => {
    if (t < ini || t > ini + nb * passo || i % salto) return;
    svg('line', { class: 'eixo', x1: X(t), x2: X(t), y1: H - mb, y2: H - mb + 4 }, g);
    svg('text', { x: X(t), y: H - mb + 17, 'text-anchor': 'middle' }, g).textContent = fmtTick(ind, t, passo * salto);
  });
  svg('line', { class: 'eixo', x1: ml, x2: W - mr, y1: H - mb, y2: H - mb }, g);
  svg('text', { class: 'rot-eixo', x: W - mr, y: H - 6, 'text-anchor': 'end' }, g).textContent = `${ind.r} (${ind.u}) →`;
  const ref = ind.f(c.escopo);
  if (ref != null && ref >= ini && ref <= ini + nb * passo) {
    svg('line', { class: 'ref', x1: X(ref), x2: X(ref), y1: mt - 12, y2: H - mb }, g);
    const tx = svg('text', { x: X(ref) + 5, y: mt - 16, 'text-anchor': X(ref) > W - 160 ? 'end' : 'start', style: 'fill:var(--ink);font-weight:600' }, g);
    if (X(ref) > W - 160) tx.setAttribute('x', X(ref) - 5);
    tx.textContent = `${c.escopo.nome}: ${fmtV(ind, ref)}`;
  }
  const med = quantil(s, 0.5);
  $('#h-info').innerHTML = `Mediana das ${c.nivel === 'uf' ? 'unidades' : 'unidades'}: <b>${fmtV(ind, med)}</b>; metade fica entre ${fmtV(ind, quantil(s, .25))} e ${semPonto(fmtV(ind, quantil(s, .75)))}. ` +
    `A linha marca o valor agregado de ${esc(c.escopo.nome)}` + (selU ? `; a barra destacada contém ${esc(selU.nome)}.` : '.') +
    (k === 'el' ? ' Altura = eleitores na faixa: unidades grandes pesam mais.' : '');
}

/* ================================================================ dispersão */
function pearson(a, b) {
  const n = a.length; let ma = 0, mb = 0;
  for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; }
  ma /= n; mb /= n;
  let s1 = 0, s2 = 0, s3 = 0;
  for (let i = 0; i < n; i++) { const u = a[i] - ma, v = b[i] - mb; s1 += u * v; s2 += u * u; s3 += v * v; }
  return s2 && s3 ? s1 / Math.sqrt(s2 * s3) : 0;
}
function renderDisp(c) {
  const ix = indPor(S.i), iy = indPor(S.y);
  const box = $('#disp'); box.innerHTML = '';
  const pts = c.itens.map(u => [u, ix.f(u), iy.f(u)]).filter(p => isFinite(p[1]) && isFinite(p[2]) && p[1] != null && p[2] != null);
  if (pts.length < 3) { box.innerHTML = '<p class="desc">Poucas unidades para comparar.</p>'; $('#d-info').textContent = ''; return; }
  const dom = (arr, ind) => {
    const s = arr.slice().sort((a, b) => a - b);
    let lo = quantil(s, 0.002), hi = quantil(s, 0.998);
    if (ind.fmt === 'int') { lo = 0; hi = quantil(s, 0.99); }
    const pad = (hi - lo) * 0.04 || 1; return [lo - pad, hi + pad];
  };
  const [x0, x1] = dom(pts.map(p => p[1]), ix), [y0, y1] = dom(pts.map(p => p[2]), iy);
  const W = 720, H = 440, ml = 56, mr = 16, mt = 16, mb = 46;
  const X = v => ml + (Math.max(x0, Math.min(x1, v)) - x0) / (x1 - x0) * (W - ml - mr);
  const Y = v => H - mb - (Math.max(y0, Math.min(y1, v)) - y0) / (y1 - y0) * (H - mt - mb);
  const g = svg('svg', { class: 'g', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Dispersão: ${ix.r} por ${iy.r}` }, box);
  const tx = ticks(x0, x1, 6), ty = ticks(y0, y1, 5);
  tx.forEach(t => {
    svg('line', { class: 'grade-l', x1: X(t), x2: X(t), y1: mt, y2: H - mb }, g);
    svg('text', { x: X(t), y: H - mb + 16, 'text-anchor': 'middle' }, g).textContent = fmtTick(ix, t, tx[1] - tx[0]);
  });
  ty.forEach(t => {
    svg('line', { class: 'grade-l', x1: ml, x2: W - mr, y1: Y(t), y2: Y(t) }, g);
    svg('text', { x: ml - 6, y: Y(t) + 4, 'text-anchor': 'end' }, g).textContent = fmtTick(iy, t, ty[1] - ty[0]);
  });
  svg('text', { class: 'rot-eixo', x: W - mr, y: H - 8, 'text-anchor': 'end' }, g).textContent = `${ix.r} →`;
  svg('text', { class: 'rot-eixo', x: ml, y: mt - 4 + 0, 'text-anchor': 'start' }, g).textContent = `↑ ${iy.r}`;
  const rx = ix.f(c.escopo), ry = iy.f(c.escopo);
  if (rx != null) svg('line', { class: 'ref', x1: X(rx), x2: X(rx), y1: mt, y2: H - mb, 'stroke-opacity': .35 }, g);
  if (ry != null) svg('line', { class: 'ref', x1: ml, x2: W - mr, y1: Y(ry), y2: Y(ry), 'stroke-opacity': .35 }, g);
  const mx = Math.max(...pts.map(p => p[0].aptos));
  const rMax = c.nivel === 'uf' ? 14 : 10;
  let sel = null;
  pts.sort((a, b) => b[0].aptos - a[0].aptos).forEach(p => {
    const [u, vx, vy] = p;
    const e = svg('circle', { class: 'ponto', cx: X(vx), cy: Y(vy), r: Math.max(2.2, rMax * Math.sqrt(u.aptos / mx)) }, g);
    e.__dica = `<b>${esc(rotulo(u))}</b>${esc(ix.r)}: ${fmtV(ix, vx)}<br>${esc(iy.r)}: ${fmtV(iy, vy)}<br>${fmtInt(u.aptos)} eleitores`;
    e.onclick = () => irPara(u.id);
    if (u.id === S.t) sel = p;
  });
  if (sel) {
    const [u, vx, vy] = sel;
    const e = svg('circle', { class: 'ponto on', cx: X(vx), cy: Y(vy), r: Math.max(5, rMax * Math.sqrt(u.aptos / mx)) }, g);
    e.__dica = `<b>${esc(rotulo(u))}</b>${esc(ix.r)}: ${fmtV(ix, vx)}<br>${esc(iy.r)}: ${fmtV(iy, vy)}`;
    const t = svg('text', { x: X(vx) + 10, y: Y(vy) - 8, style: 'fill:var(--ink);font-weight:700' }, g);
    if (X(vx) > W - 170) { t.setAttribute('x', X(vx) - 10); t.setAttribute('text-anchor', 'end'); }
    t.textContent = u.nome;
  }
  if (c.nivel === 'uf') pts.forEach(([u, vx, vy]) => {
    if (u.id === S.t) return;
    svg('text', { x: X(vx) + 7, y: Y(vy) + 4, style: 'font-size:10px' }, g).textContent = u.uf;
  });
  const r = pearson(pts.map(p => p[1]), pts.map(p => p[2]));
  const forca = Math.abs(r) < 0.1 ? 'praticamente nula' : Math.abs(r) < 0.3 ? 'fraca' : Math.abs(r) < 0.6 ? 'moderada' : 'forte';
  $('#d-info').innerHTML = `${fmtInt(pts.length)} ${c.nivel === 'uf' ? 'estados' : 'municípios'}; área do círculo ∝ eleitores. ` +
    `Correlação de Pearson (não ponderada): <b>${nf(r, 2)}</b> — ${forca}${r < 0 ? ', negativa' : r > 0 ? ', positiva' : ''}. ` +
    `Linhas finas: valores de ${esc(c.escopo.nome)}. Correlação entre unidades territoriais não descreve indivíduos (falácia ecológica).`;
}

/* ================================================================ tabela */
let tabN = 100, tabOrd = { k: 'ind', dir: -1 };
function colunasTabela(c) {
  const ind = indPor(S.i);
  const cols = [
    { k: 'nome', r: c.nivel === 'uf' ? 'Estado' : 'Município', t: 1, v: u => u.nome },
    ...(c.nivel === 'mu' && c.escopo.tipo !== 'uf' ? [{ k: 'uf', r: 'UF', t: 1, v: u => u.uf }] : []),
    { k: 'aptos', r: 'Eleitores', v: u => u.aptos, f: fmtInt },
    { k: 'ind', r: ind.r, v: u => ind.f(u), f: v => fmtV(ind, v) },
  ];
  ['abst', 'bn', 'margem'].filter(k => k !== S.i).forEach(k => { const i = indPor(k); cols.push({ k, r: i.r, v: u => i.f(u), f: v => fmtV(i, v) }); });
  cols.push({ k: 'pri', r: '1º colocado', t: 1, v: u => u.validos ? CANDS[ordemVotos(u)[0][0]].nome : '—' });
  return cols;
}
function renderTabela(c) {
  const cols = colunasTabela(c);
  const q = norm($('#t-q').value.trim());
  let lin = c.itens.filter(u => !q || u.chave.includes(q));
  const col = cols.find(x => x.k === tabOrd.k) || cols[3];
  lin = lin.map(u => [u, col.v(u)]).sort((a, b) => {
    const x = a[1], y = b[1];
    if (x == null) return 1; if (y == null) return -1;
    return typeof x === 'string' ? tabOrd.dir * x.localeCompare(y, 'pt-BR') : tabOrd.dir * (x - y);
  }).map(x => x[0]);
  const tab = $('#tab');
  tab.tHead.innerHTML = '<tr><th scope="col" class="n">#</th>' + cols.map(x =>
    `<th scope="col" class="${x.t ? '' : 'n'}" ${x.k === col.k ? `aria-sort="${tabOrd.dir < 0 ? 'descending' : 'ascending'}"` : ''}><button type="button" data-k="${x.k}">${esc(x.r)}</button></th>`).join('') + '</tr>';
  $$('th button', tab).forEach(b => b.onclick = () => {
    if (tabOrd.k === b.dataset.k) tabOrd.dir = -tabOrd.dir; else tabOrd = { k: b.dataset.k, dir: cols.find(x => x.k === b.dataset.k).t ? 1 : -1 };
    renderTabela(c);
  });
  tab.tBodies[0].innerHTML = lin.slice(0, tabN).map((u, i) => `<tr data-ir="${u.id}" ${u.id === S.t ? 'aria-current="true"' : ''}><td class="n">${i + 1}</td>` +
    cols.map((x, j) => {
      const v = x.v(u), txt = x.f ? x.f(v) : esc(v);
      return j === 0 ? `<td><button type="button" class="lk" data-ir="${u.id}">${txt}</button></td>` : `<td class="${x.t ? '' : 'n'}">${txt}</td>`;
    }).join('') + '</tr>').join('');
  $$('tbody tr', tab).forEach(tr => tr.onclick = () => irPara(tr.dataset.ir));
  $('#t-cap').textContent = `${fmtInt(lin.length)} linhas${q ? ' (filtradas)' : ''}, ordenadas por ${col.r}. Exibindo ${fmtInt(Math.min(tabN, lin.length))}.`;
  $('#t-mais').hidden = tabN >= lin.length;
}
function baixaCSV() {
  const c = conjunto();
  const cab = ['tipo', 'id', 'nome', 'uf', 'regiao', 'eleitores_aptos', 'comparecimento', 'abstencoes', 'votos_validos', 'brancos', 'nulos',
    ...IND.filter(i => i.k !== 'aptos').map(i => i.k), ...CANDS.map(x => 'votos_' + norm(x.nome).replace(/\W+/g, '_'))];
  const n = v => v == null || !isFinite(v) ? '' : String(Math.round(v * 100) / 100).replace('.', ',');
  const linhas = [c.escopo, ...c.itens].map(u => [TIPO[u.tipo], u.id, u.nome, u.uf || '', u.regiao || '', u.aptos, u.comp, u.abst, u.validos, u.brancos, u.nulos,
    ...IND.filter(i => i.k !== 'aptos').map(i => n(i.f(u))), ...u.votos].map(x => /[;"\n]/.test(String(x)) ? `"${String(x).replace(/"/g, '""')}"` : x).join(';'));
  const blob = new Blob(['﻿' + cab.join(';') + '\n' + linhas.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `eleicao2026_${norm(c.escopo.nome).replace(/\W+/g, '-')}_${c.nivel === 'uf' ? 'estados' : 'municipios'}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('CSV gerado: primeira linha é o agregado do recorte.');
}

/* ================================================================ ficha */
const P22 = { ag: null, uf: {} };
async function perfil2022(u) {
  try {
    if (u.tipo === 'mu') {
      if (!P22.uf[u.uf]) P22.uf[u.uf] = fetch(`dados/perfil2022/${u.uf}.json`).then(r => r.ok ? r.json() : {}).catch(() => ({}));
      return (await P22.uf[u.uf])[u.cod] || null;
    }
    if (!P22.ag) P22.ag = fetch('dados/perfil2022/agregados.json').then(r => r.json()).catch(() => ({}));
    return (await P22.ag)[u.id] || null;
  } catch (e) { return null; }
}
function barrasMini(linhas, max, fmt) {
  return `<div class="mini">` + linhas.map(l => `<span class="nm" title="${esc(l.r)}">${esc(l.r)}</span>
    <span class="trilho" aria-hidden="true"><span class="b" style="width:${Math.max(0.5, 100 * (l.v || 0) / max)}%"></span>
    ${l.ref != null ? `<span class="ref" style="left:calc(${Math.min(100, 100 * l.ref / max)}% - 1px)"></span>` : ''}</span>
    <span class="v">${l.v == null ? '—' : fmt(l.v)}</span>`).join('') + `</div>`;
}
function posicao(u, ind) {
  const v = ind.f(u);
  if (v == null || u.tipo === 'br') return '';
  const grupos = [];
  if (u.tipo === 'mu') {
    grupos.push([`municípios ${prep(U.get('UF:' + u.uf))} ${UFNOME[u.uf]}`, MUN.filter(m => m.uf === u.uf)]);
    if (u.uf !== 'ZZ') grupos.push(['municípios do Brasil', MUN.filter(m => m.uf !== 'ZZ')]);
  } else if (u.tipo === 'uf' && u.uf !== 'ZZ') grupos.push(['estados', UFS]);
  else if (u.tipo === 'rg') grupos.push(['regiões', REGIOES.map(r => U.get('R:' + r))]);
  if (!grupos.length) return '';
  return grupos.map(([nome, arr], gi) => {
    const s = arr.map(x => ind.f(x)).filter(x => x != null && isFinite(x)).sort((a, b) => a - b);
    const maiores = s.filter(x => x > v).length + 1;
    const pctil = Math.round(100 * s.filter(x => x < v).length / Math.max(1, s.length - 1));
    const lo = s[0], hi = s[s.length - 1], P = x => (hi > lo ? 100 * (x - lo) / (hi - lo) : 50);
    const q1 = quantil(s, .1), q9 = quantil(s, .9);
    return `<div class="linha">${maiores}º maior entre ${fmtInt(s.length)} ${esc(nome)}${s.length > 9 ? ` <span style="color:var(--ink-2)">(percentil ${pctil})</span>` : ''}</div>` +
      (gi === 0 && s.length > 9 ? `<div class="faixa" aria-hidden="true"><span class="eixo"></span><span class="q" style="left:${P(q1)}%;width:${P(q9) - P(q1)}%"></span><span class="me" style="left:${P(v)}%"></span></div>
       <div class="faixa-esc"><span>${fmtV(ind, lo)}</span><span>faixa sombreada: 80% centrais</span><span>${fmtV(ind, hi)}</span></div>` : '');
  }).join('');
}
function renderFicha(u) {
  const f = $('#ficha'), p = pai(u), ind = indPor(S.i);
  const o = ordemVotos(u);
  const abst = pct(u.abst, u.aptos), bn = pct(u.brancos + u.nulos, u.comp);
  const pAbst = p ? pct(p.abst, p.aptos) : null, pBn = p ? pct(p.brancos + p.nulos, p.comp) : null;
  const margem = u.validos ? 100 * (o[0][1] - o[1][1]) / u.validos : null;
  const naCmp = S.c.includes(u.id);
  const sub = u.tipo === 'mu' ? `${UFNOME[u.uf]} · ${u.regiao}` : u.tipo === 'uf' ? (u.uf === 'ZZ' ? 'Seções no exterior' : `${u.regiao} · ${fmtInt(u.nMun)} municípios`) :
    u.tipo === 'rg' ? `${fmtInt(u.nMun)} municípios` : `${fmtInt(u.nMun)} municípios e localidades no exterior`;
  const deltaTxt = (a, b) => a == null || b == null ? '' : `<span class="delta">${fmtPP(a - b)}</span> vs ${esc(p.nome)}`;
  // candidatos: até 6 nomeados + outros
  const val = u.validos || 1;
  const vis = o.filter(([k, v], i) => i < 6 && v > 0);
  const outros = o.slice(vis.length).reduce((s, x) => s + x[1], 0);
  const maxC = Math.max(1e-9, ...vis.map(x => 100 * x[1] / val), ...(p ? vis.map(([k]) => 100 * p.votos[k] / (p.validos || 1)) : [0]));
  const candHtml = vis.map(([k, v]) => {
    const c = CANDS[k], pc = 100 * v / val, rf = p ? 100 * p.votos[k] / (p.validos || 1) : null;
    return `<li><span class="nm">${esc(c.nome)} <small>${esc(c.partido)}</small></span><span class="v">${fmtPct(pc)} <small>${fmtInt(v)}</small></span>
      <span class="trilho" aria-hidden="true"><span class="b" style="width:${100 * pc / maxC}%;background:var(--cand-${k < 5 ? k : 'x'})"></span>
      ${rf != null ? `<span class="ref" style="left:calc(${100 * rf / maxC}% - 1px)"></span>` : ''}</span></li>`;
  }).join('') + (outros > 0 ? `<li><span class="nm">Outros ${o.length - vis.length} candidatos</span><span class="v">${fmtPct(100 * outros / val, 2)} <small>${fmtInt(outros)}</small></span></li>` : '');

  const demo = DIMS.map(([dim, grupos], d) => {
    const tot = somaArr(u.demo[d]) || 1, ptot = p ? somaArr(p.demo[d]) || 1 : 1;
    const linhas = grupos.map((g, i) => ({ r: g, v: 100 * u.demo[d][i] / tot, ref: p ? 100 * p.demo[d][i] / ptot : null }));
    const mx = Math.max(...linhas.map(l => Math.max(l.v, l.ref || 0))) * 1.05 || 1;
    const titulo = { idade: 'Faixa etária', escolaridade: 'Escolaridade', genero: 'Gênero', estado_civil: 'Estado civil' }[dim];
    return `<div class="sub-bloco"><h3>${titulo}</h3>${barrasMini(linhas, mx, v => fmtPct(v))}</div>`;
  }).join('');

  const ehRio = u.tipo === 'mu' && u.uf === 'RJ' && u.chave === 'rio de janeiro';
  f.innerHTML = `
   <div class="ficha-cab">
    <div class="tipo">${TIPO[u.tipo]}</div>
    <h2 id="f-nome" tabindex="-1">${esc(u.nome)}${u.tipo === 'mu' ? ` <span style="color:var(--ink-2);font-weight:500">${u.uf}</span>` : ''}</h2>
    <p class="sub">${esc(sub)}</p>
    <div class="acoes">
     <button type="button" class="btn" id="f-cmp" aria-pressed="${naCmp}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>${naCmp ? 'Na comparação' : 'Comparar'}</button>
     <button type="button" class="btn" id="f-link"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>Copiar link</button>
     ${p ? `<button type="button" class="btn" data-ir="${p.id}">↑ ${esc(p.nome)}</button>` : ''}
     ${ehRio ? `<a class="btn" href="rio.html">Ver por seção eleitoral</a>` : ''}
    </div>
   </div>
   <section class="bloco" aria-labelledby="fb-part">
    <h3 id="fb-part">Participação</h3>
    <div class="tiles">
     <div class="tile"><div class="r">Eleitores aptos</div><div class="v">${fmtInt(u.aptos)}</div><div class="d">${fmtInt(u.secoes)} seções</div></div>
     <div class="tile"><div class="r">Abstenção</div><div class="v">${fmtPct(abst)}</div><div class="d">${fmtInt(u.abst)} eleitores${p ? '<br>' + deltaTxt(abst, pAbst) : ''}</div></div>
     <div class="tile"><div class="r">Brancos e nulos</div><div class="v">${fmtPct(bn)}</div><div class="d">dos votantes${p ? '<br>' + deltaTxt(bn, pBn) : ''}</div></div>
     <div class="tile"><div class="r">Margem 1º–2º</div><div class="v">${margem == null ? '—' : nf(margem, 1) + ' p.p.'}</div><div class="d">${fmtInt(o[0][1] - o[1][1])} votos de diferença</div></div>
    </div>
    ${u.uf === 'ZZ' || u.tipo === 'br' ? `<p class="aviso">${u.tipo === 'br' ? `Inclui ${fmtInt(U.get('UF:ZZ').aptos)} eleitores no exterior, que não aparecem no mapa.` : 'Seções no exterior: abstenção estruturalmente alta (eleitor mudou de país, voto distante).'}</p>` : ''}
   </section>
   <section class="bloco" aria-labelledby="fb-res">
    <h3 id="fb-res">Resultado para Presidente — 1º turno</h3>
    <p class="desc">% dos votos válidos (${fmtInt(u.validos)}).${p ? ` Traço vertical: mesmo candidato em ${esc(p.nome)}.` : ''}</p>
    <ul class="cands">${candHtml}</ul>
   </section>
   ${u.tipo !== 'br' ? `<section class="bloco" aria-labelledby="fb-pos">
    <h3 id="fb-pos">Posição em: ${esc(ind.r)}</h3>
    <p class="desc">${fmtV(ind, ind.f(u))}${p ? ` · ${esc(p.nome)}: ${fmtV(ind, ind.f(p))}` : ''}</p>
    <div class="posicao">${posicao(u, ind)}</div>
   </section>` : ''}
   <section class="bloco" aria-labelledby="fb-demo">
    <h3 id="fb-demo">Quem é o eleitorado (2026)</h3>
    <p class="desc">% do eleitorado apto em cada grupo.${p ? ` Traço: ${esc(p.nome)}.` : ''} Composição não prediz voto nem abstenção.</p>
    ${demo}
   </section>
   <section class="bloco" aria-labelledby="fb-p22">
    <h3 id="fb-p22">Quem faltou — abstenção por perfil (2022)</h3>
    <p class="desc">Taxa de abstenção de cada grupo no 1º turno de <b>2022</b>, só entre eleitores com voto obrigatório (exclui 16–17, 70+ e analfabetos). O TSE não publica esse recorte para 2026.</p>
    <div id="p22"><p class="desc">Carregando…</p></div>
   </section>`;
  $('#f-cmp').onclick = () => {
    if (S.c.includes(u.id)) S.c = S.c.filter(x => x !== u.id);
    else { if (S.c.length >= 4) { toast('Máximo de 4 territórios. Remova um em Comparar.'); return; } S.c.push(u.id); }
    escreveHash(); render(); toast(S.c.includes(u.id) ? `${u.nome} adicionado à comparação (${S.c.length}/4)` : `${u.nome} removido da comparação`);
  };
  $('#f-link').onclick = async () => {
    try { await navigator.clipboard.writeText(location.href); toast('Link copiado'); } catch (e) { prompt('Copie o link:', location.href); }
  };
  $$('[data-ir]', f).forEach(b => b.onclick = () => irPara(b.dataset.ir));

  const alvo = u.id;
  Promise.all([perfil2022(u), p ? perfil2022(p) : null]).then(([a, b]) => {
    const box = $('#p22');
    if (!box || S.t !== alvo) return;
    if (!a) { box.innerHTML = `<p class="aviso">Sem dado de abstenção por perfil para ${esc(u.nome)} na base 2022${u.uf === 'DF' ? ' (o Distrito Federal não consta do arquivo do TSE usado)' : ''}.</p>`; return; }
    const dims = [['idade', 'Faixa etária'], ['escolaridade', 'Escolaridade'], ['genero', 'Gênero'], ['estado_civil', 'Estado civil']];
    const di = Object.fromEntries(DIMS.map(([d, g], i) => [d, g]));
    const geral = (() => { const t = a.idade.reduce((s, x) => [s[0] + x[0], s[1] + x[1]], [0, 0]); return t[0] ? 100 * t[1] / t[0] : null; })();
    box.innerHTML = `<p class="desc">Abstenção geral (voto obrigatório, 2022): <b>${fmtPct(geral)}</b>.</p>` + dims.map(([d, tit]) => {
      const linhas = a[d].map((x, i) => ({ r: di[d][i], v: x[0] >= 30 ? 100 * x[1] / x[0] : null, n: x[0], ref: b && b[d][i][0] ? 100 * b[d][i][1] / b[d][i][0] : null }))
        .filter(l => l.n > 0);
      if (!linhas.length) return '';
      const mx = Math.max(...linhas.map(l => Math.max(l.v || 0, l.ref || 0))) * 1.08 || 1;
      return `<div class="sub-bloco"><h3>${tit}</h3>${barrasMini(linhas, mx, v => fmtPct(v))}</div>`;
    }).join('') + `<p class="nota">Grupos com menos de 30 eleitores aparecem sem taxa. ${b ? `Traço: ${esc(p.nome)}.` : ''} <a href="perfis.html">Mapa por perfil</a></p>`;
  });
}

/* ================================================================ busca */
let INDICE = [];
function montaIndice() {
  INDICE = [...U.values()].map(u => ({
    u, k: u.chave, sig: u.tipo === 'uf' ? u.uf.toLowerCase() : '',
    sub: u.tipo === 'mu' ? `${u.uf} · município` : TIPO[u.tipo].toLowerCase(),
  }));
}
function busca(q, n = 10) {
  q = norm(q.trim());
  if (!q) return [];
  const out = [];
  for (const e of INDICE) {
    let s = -1;
    if (e.sig && e.sig === q) s = 0;
    else if (e.k === q) s = 1;
    else if (e.k.startsWith(q)) s = 2;
    else if (e.k.includes(' ' + q)) s = 3;
    else if (e.k.includes(q)) s = 4;
    if (s >= 0) out.push([s, e]);
  }
  const peso = { br: 0, rg: 1, uf: 2, mu: 3 };
  out.sort((a, b) => a[0] - b[0] || peso[a[1].u.tipo] - peso[b[1].u.tipo] || b[1].u.aptos - a[1].u.aptos);
  return out.slice(0, n).map(x => x[1]);
}
function ligaBusca(input, lista, aoEscolher) {
  let res = [], ativo = -1;
  const fecha = () => { lista.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); ativo = -1; };
  const desenha = () => {
    if (!input.value.trim()) return fecha();
    lista.innerHTML = res.length ? res.map((e, i) => `<li role="option" id="${lista.id}-${i}" aria-selected="${i === ativo}" data-i="${i}"><span>${esc(e.u.nome)}</span><small>${esc(e.sub)} · ${fmtInt(e.u.aptos)} eleitores</small></li>`).join('')
      : `<li class="vazio" role="option" aria-disabled="true">Nada encontrado para “${esc(input.value)}”</li>`;
    lista.hidden = false; input.setAttribute('aria-expanded', 'true');
    if (ativo >= 0) { input.setAttribute('aria-activedescendant', `${lista.id}-${ativo}`); $('#' + lista.id + '-' + ativo)?.scrollIntoView({ block: 'nearest' }); }
  };
  const escolhe = i => { const e = res[i]; if (!e) return; input.value = ''; fecha(); aoEscolher(e.u); };
  input.addEventListener('input', () => { res = busca(input.value); ativo = res.length ? 0 : -1; desenha(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (res.length) { ativo = (ativo + 1) % res.length; desenha(); } }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (res.length) { ativo = (ativo - 1 + res.length) % res.length; desenha(); } }
    else if (e.key === 'Enter') { e.preventDefault(); escolhe(Math.max(0, ativo)); }
    else if (e.key === 'Escape') { if (!lista.hidden) { e.preventDefault(); fecha(); } else input.value = ''; }
  });
  lista.addEventListener('mousedown', e => { const li = e.target.closest('[data-i]'); if (li) { e.preventDefault(); escolhe(+li.dataset.i); } });
  input.addEventListener('blur', () => setTimeout(fecha, 120));
}

/* ================================================================ comparar */
function renderComparar() {
  let v = $('#v-comparar');
  if (!v) {
    v = document.createElement('main'); v.id = 'v-comparar'; v.className = 'pagina'; v.style.padding = '16px';
    v.innerHTML = `<h1>Comparar territórios</h1>
     <p class="desc">Até quatro municípios, estados ou regiões lado a lado, com o Brasil como referência. Em cada linha, a barra é proporcional ao maior valor da linha.</p>
     <div class="cmp-add"><div class="busca" style="flex:0 1 380px"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <label class="sr" for="cq">Adicionar território</label>
      <input id="cq" type="search" autocomplete="off" placeholder="Adicionar município, estado ou região…" role="combobox" aria-expanded="false" aria-controls="cq-lista" aria-autocomplete="list">
      <ul id="cq-lista" class="sugestoes" role="listbox" hidden></ul></div>
      <span class="desc" id="c-atalhos"></span></div>
     <div id="cmp"></div>`;
    $('#app').appendChild(v);
    ligaBusca($('#cq'), $('#cq-lista'), u => {
      if (S.c.includes(u.id)) return toast('Já está na comparação');
      if (S.c.length >= 4) return toast('Máximo de 4. Remova um antes.');
      S.c.push(u.id); escreveHash(); render();
    });
  }
  document.title = 'Comparar · Explorador eleitoral 2026';
  const atalhos = ['BR', ...REGIOES.map(r => 'R:' + r)].filter(id => !S.c.includes(id));
  $('#c-atalhos').innerHTML = S.c.length < 4 ? 'Atalhos: ' + atalhos.map(id => `<button type="button" class="btn" style="min-height:34px;padding:4px 9px" data-add="${id}">${esc(U.get(id).nome)}</button>`).join(' ') : '';
  $$('[data-add]', v).forEach(b => b.onclick = () => { S.c.push(b.dataset.add); escreveHash(); render(); });
  const box = $('#cmp');
  if (!S.c.length) {
    box.innerHTML = `<div class="vazio-box">Nada para comparar ainda.<br>Use a busca acima, os atalhos, ou o botão <b>Comparar</b> na ficha de qualquer território.</div>`;
    return;
  }
  const us = S.c.map(id => U.get(id));
  const comRef = S.c.includes('BR') ? us : [...us, U.get('BR')];
  const linhaInd = ind => {
    const vs = comRef.map(u => ind.f(u));
    const fin = vs.filter(x => x != null && isFinite(x));
    const mx = Math.max(...fin.map(Math.abs)) || 1;
    const top = ind.fmt === 'int' || ind.esc === 'div' ? null : Math.max(...vs.slice(0, us.length).filter(x => x != null));
    return `<tr><th scope="row">${esc(ind.r)} <span style="color:var(--muted);font-size:.75rem">${esc(ind.u)}</span></th>` + vs.map((x, i) => {
      const cor = ind.esc === 'div' ? (x >= 0 ? 'var(--cand-0)' : 'var(--cand-1)') : ind.cand != null ? `var(--cand-${ind.cand})` : 'var(--bar)';
      return `<td><div class="cel"><span class="${x === top && us.length > 1 && i < us.length ? 'max' : ''} num">${fmtV(ind, x)}</span>
       <span class="trilho" aria-hidden="true"><span class="b" style="width:${x == null ? 0 : 100 * Math.abs(x) / mx}%;background:${cor}"></span></span></div></td>`;
    }).join('') + '</tr>';
  };
  const grupos = [...new Set(IND.map(i => i.g))];
  box.innerHTML = `<div class="cartao cmp-tab"><table>
   <caption class="sr">Comparação de indicadores entre territórios</caption>
   <thead><tr><th scope="col">Indicador</th>${comRef.map((u, i) => `<th scope="col">
     <div style="font-size:.72rem;color:var(--ink-2);text-transform:uppercase">${TIPO[u.tipo]}${i >= us.length ? ' · referência' : ''}</div>
     <div style="font-size:1rem">${esc(rotulo(u))}</div>
     <div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap">
      <button type="button" class="btn" style="min-height:32px;padding:3px 8px" data-ir="${u.id}">Ficha</button>
      ${i < us.length ? `<button type="button" class="btn" style="min-height:32px;padding:3px 8px" data-rm="${u.id}" aria-label="Remover ${esc(u.nome)}">Remover</button>` : ''}
     </div></th>`).join('')}</tr></thead>
   <tbody>
    ${grupos.map(g => `<tr class="grupo-linha"><th colspan="${comRef.length + 1}" scope="colgroup">${esc(g)}</th></tr>` + IND.filter(i => i.g === g).map(linhaInd).join('')).join('')}
    <tr class="grupo-linha"><th colspan="${comRef.length + 1}" scope="colgroup">Mais votado</th></tr>
    <tr><th scope="row">1º colocado</th>${comRef.map(u => { const o = ordemVotos(u); return `<td>${u.validos ? `${esc(CANDS[o[0][0]].nome)} <span style="color:var(--ink-2)">${fmtPct(100 * o[0][1] / u.validos)}</span>` : '—'}</td>`; }).join('')}</tr>
    <tr><th scope="row">2º colocado</th>${comRef.map(u => { const o = ordemVotos(u); return `<td>${u.validos ? `${esc(CANDS[o[1][0]].nome)} <span style="color:var(--ink-2)">${fmtPct(100 * o[1][1] / u.validos)}</span>` : '—'}</td>`; }).join('')}</tr>
   </tbody></table></div>
   <p class="nota">Valores em negrito: maior entre os territórios escolhidos (exceto referência). Indicadores de perfil descrevem o eleitorado inscrito, não quem votou.</p>`;
  $$('[data-rm]', box).forEach(b => b.onclick = () => { S.c = S.c.filter(x => x !== b.dataset.rm); escreveHash(); render(); });
  $$('[data-ir]', box).forEach(b => b.onclick = () => irPara(b.dataset.ir));
}

/* ================================================================ sobre */
function renderSobre() {
  let v = $('#v-sobre');
  document.title = 'Sobre os dados · Explorador eleitoral 2026';
  if (v) return;
  const br = U.get('BR');
  v = document.createElement('main'); v.id = 'v-sobre'; v.className = 'pagina'; v.style.padding = '16px';
  v.innerHTML = `<div class="texto">
   <h1>Sobre os dados</h1>
   <p>Tudo aqui é dado público do Tribunal Superior Eleitoral. O explorador apresenta números e deixa o cruzamento para quem analisa — nenhuma conclusão está embutida.</p>
   <p>Na base: <b>${fmtInt(MUN.length)}</b> municípios e localidades no exterior, <b>${fmtInt(br.aptos)}</b> eleitores aptos, <b>${fmtInt(br.validos)}</b> votos válidos para Presidente no 1º turno.</p>
   <h2>Fontes</h2>
   <ul>
    <li><b>Resultado, comparecimento e abstenção</b> — TSE, portal oficial de resultados, eleição 2026, 1º turno, totalização final.</li>
    <li><b>Composição do eleitorado</b> (idade, escolaridade, gênero, estado civil) — TSE, perfil do eleitorado 2026.</li>
    <li><b>Abstenção por perfil</b> — TSE, perfil de comparecimento e abstenção, <b>2022</b>, 1º turno (último ano publicado nesse recorte).</li>
    <li><b>Contornos dos estados</b> — IBGE, malhas territoriais. Municípios são posicionados pelo centroide dos locais de votação.</li>
   </ul>
   <h2>Método</h2>
   <ul>
    <li>Estados, regiões e Brasil são <b>somados a partir dos municípios</b>. Toda taxa de qualquer recorte é razão de somas (ex.: abstenções ÷ aptos), nunca média de taxas.</li>
    <li>Abstenção é calculada sobre eleitores aptos; brancos e nulos, sobre quem compareceu; votos de candidatos, sobre válidos.</li>
    <li><b>Margem</b> é a distância, em pontos percentuais dos válidos, entre os dois mais votados <i>naquele território</i>. <b>Vantagem</b> compara sempre os dois mais votados no país.</li>
    <li>Cores de candidatos seguem a ordem nacional de votos e não mudam com filtros. Mapas usam um único matiz para magnitude e dois polos com meio neutro para vantagem.</li>
    <li>Classes do mapa são quintis das unidades exibidas: a mesma cor pode significar valores diferentes em recortes diferentes. A legenda sempre informa os limites.</li>
   </ul>
   <h2>Limitações — leia antes de usar em decisão</h2>
   <ol>
    <li><b>Perfil de abstenção é de 2022.</b> Para 2026 existe a abstenção geral por município, mas não aberta por demografia.</li>
    <li><b>Composição demográfica não prediz voto nem abstenção.</b> Correlação entre municípios não descreve indivíduos (falácia ecológica).</li>
    <li><b>Abstenção não é voto recuperável.</b> Parte de quem falta mudou de cidade, faleceu sem baixa no cadastro ou tem dificuldade de acesso.</li>
    <li><b>Margem não é volatilidade.</b> Margem apertada indica disputa, não movimento.</li>
    <li><b>Escolaridade é a declarada no alistamento</b> e costuma estar desatualizada para eleitores mais velhos.</li>
    <li><b>Cor/raça foi omitida</b>: “não informado” predomina no cadastro.</li>
    <li><b>Exterior</b>: ${fmtInt(U.get('UF:ZZ').nMun)} localidades sem coordenada; entram no total do Brasil, mas não no mapa. O Distrito Federal não consta do arquivo de abstenção por perfil 2022.</li>
    <li>Municípios muito pequenos produzem taxas extremas por puro acaso. Use o filtro de mínimo de eleitores.</li>
   </ol>
   <h2>Baixar</h2>
   <ul>
    <li><a href="base_brasil_2026.csv">base_brasil_2026.csv</a> — uma linha por município, 117 colunas</li>
    <li><a href="base_abst_perfil_2022.csv">base_abst_perfil_2022.csv</a> — abstenção por perfil, formato longo</li>
    <li><a href="DICIONARIO.html">Dicionário de dados</a> · <a href="LEIA-ME.html">Índice e notas técnicas</a></li>
    <li>Qualquer recorte do explorador: aba <b>Tabela → Baixar CSV</b>.</li>
   </ul>
   <h2>Painéis temáticos</h2>
  </div>
  <div class="cards-links">
   <a class="cartao" href="perfis.html"><b>Abstenção por perfil</b><span>Taxa de abstenção de cada faixa etária, escolaridade, gênero e estado civil, município a município (2022).</span></a>
   <a class="cartao" href="mudanca.html"><b>Margem e votos em jogo</b><span>Onde a disputa foi apertada, quantos votos separam os dois primeiros e quem é o eleitorado.</span></a>
   <a class="cartao" href="abstencao.html"><b>Abstenção e público-alvo</b><span>Abstenção 2026 cruzada com a densidade de um perfil demográfico.</span></a>
   <a class="cartao" href="rio.html"><b>Rio de Janeiro por seção</b><span>Bairro, zona eleitoral e 12.809 seções.</span></a>
  </div>
  <div class="texto"><h2>Acessibilidade</h2>
   <p>Todos os controles são nativos e operáveis por teclado; a busca segue o padrão de combobox; cada gráfico tem alternativa textual na aba Tabela; nenhuma informação depende só de cor (todo valor aparece em número); há modo escuro com paleta própria, e as animações respeitam a preferência de movimento reduzido.</p></div>`;
  $('#app').appendChild(v);
}

/* ================================================================ tema e menus */
function ligaTema() {
  const b = $('#b-tema'), ordem = ['auto', 'light', 'dark'], nome = { auto: 'automático', light: 'claro', dark: 'escuro' };
  const atual = () => document.documentElement.getAttribute('data-theme') || 'auto';
  const marca = () => b.setAttribute('aria-label', `Tema: ${nome[atual()]}. Alternar`);
  marca();
  b.onclick = () => {
    const n = ordem[(ordem.indexOf(atual()) + 1) % 3];
    if (n === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', n);
    try { n === 'auto' ? localStorage.removeItem('tema') : localStorage.setItem('tema', n); } catch (e) { }
    marca(); toast('Tema ' + nome[n]); if (S.view === 'explorar') render();
  };
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (S.view === 'explorar') render(); });
  const bp = $('#b-paineis'), pp = $('#paineis');
  bp.onclick = e => { e.stopPropagation(); const ab = pp.hidden; pp.hidden = !ab; bp.setAttribute('aria-expanded', ab); };
  document.addEventListener('click', e => { if (!e.target.closest('.drop')) { pp.hidden = true; bp.setAttribute('aria-expanded', 'false'); } });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !pp.hidden) { pp.hidden = true; bp.setAttribute('aria-expanded', 'false'); bp.focus(); }
    if (e.key === '/' && !/input|select|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); $('#q').focus(); }
  });
}

/* ================================================================ início */
async function inicia() {
  try {
    const [J, M] = await Promise.all([
      fetch('dados/municipios.json').then(r => { if (!r.ok) throw new Error('municipios.json: HTTP ' + r.status); return r.json(); }),
      fetch('malha_uf.json').then(r => r.json()),
    ]);
    MALHA = M;
    prepara(J); montaIndicadores(); montaIndice();
  } catch (e) {
    $('#carregando').innerHTML = `Não foi possível carregar os dados (${esc(e.message)}). Se abriu o arquivo direto do disco, sirva a pasta por HTTP: <code>python3 -m http.server</code>.`;
    return;
  }
  $('#carregando').remove();
  lerHash();
  montaExplorar();
  ligaBusca($('#q'), $('#q-lista'), u => irPara(u.id, { foco: true }));
  ligaTema();
  // links comuns (#/comparar, voltar/avançar) chegam aqui; pushState não dispara hashchange
  window.addEventListener('hashchange', () => { lerHash(); escreveHash(); render(); });
  $('.pular').addEventListener('click', e => { e.preventDefault(); const m = $('#v-' + S.view); (m.querySelector('main') || m).setAttribute('tabindex', '-1'); (m.querySelector('main') || m).focus(); });
  escreveHash();
  render();
}
inicia();
