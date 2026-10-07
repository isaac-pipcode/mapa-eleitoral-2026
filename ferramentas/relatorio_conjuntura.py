#!/usr/bin/env python3
"""Relatório de conjuntura nº 01 — abstenção, brancos e nulos (1º turno 2026).

    python3 ferramentas/relatorio_conjuntura.py      # gera relatorios/conjuntura-01/index.html
    node ferramentas/pdf_relatorio.js                # imprime o PDF (Chromium)

Tudo o que aparece no relatório é calculado aqui, a partir das bases do repositório:
  base_brasil_2026.csv        resultado 2026 e perfil do eleitorado 2026 (TSE)
  base_abst_perfil_2022.csv   abstenção por perfil, 1º turno 2022 (TSE)
  malha_uf.json               contornos dos estados (IBGE)
"""
import csv, html, json, math, os
from collections import defaultdict

import numpy as np

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, 'relatorios', 'conjuntura-01')
ler = lambda n: list(csv.DictReader(open(os.path.join(RAIZ, n), encoding='utf-8-sig'), delimiter=';'))
f = lambda x, k: float(x[k] or 0)
esc = html.escape

# ------------------------------------------------------------------ formatação pt-BR
def nf(v, d=1):
    s = f'{abs(v):,.{d}f}'.replace(',', 'X').replace('.', ',').replace('X', '.')
    return ('−' if v < 0 else '') + s
def pct(v, d=1): return nf(v, d) + '%'
def mi(v, d=1): return nf(v / 1e6, d) + ' mi'
def inteiro(v): return nf(v, 0)

# ------------------------------------------------------------------ cores (papéis)
TEAL = '#0b7fab'          # identidade do boletim e abstenção
TEAL_ESC = '#075a7a'
AMBAR = '#c98500'         # brancos
CORAL = '#d64545'         # nulos
NEUTRO = '#c9d2db'        # votos válidos / contexto
TINTA, TINTA2, MUDO, GRADE = '#1a1d21', '#4a515a', '#6b7280', '#dfe3e8'
# rampas sequenciais de um matiz (claro → escuro), uma por métrica
RAMPA = {
    'abst': ['#d6ecf5', '#9dd0e6', '#56acd0', '#1a86b4', '#075a7a'],
    'br': ['#f8ebc8', '#efd08a', '#e2b14a', '#c98500', '#8a5b00'],
    'nu': ['#f8d9d6', '#efaaa4', '#e27770', '#c94848', '#8c2626'],
}

REGIOES = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']
SETENTA = ['70 a 74 anos', '75 a 79 anos', '80 a 84 anos', '85 a 89 anos', '90 a 94 anos', '95 a 99 anos', '100 anos ou mais']


# ================================================================== dados
def calcula():
    R = ler('base_brasil_2026.csv')
    P = ler('base_abst_perfil_2022.csv')
    BR = [x for x in R if x['uf'] != 'ZZ']
    regiao_uf = {x['uf']: x['regiao'] for x in R}
    nulos = lambda x: f(x, 'comparecimento') - f(x, 'votos_validos') - f(x, 'brancos')  # total oficial do TSE
    D = {}

    # --- panorama nacional 2026
    apt = sum(f(x, 'eleitores_aptos') for x in R)
    tot = {k: sum(f(x, k) for x in R) for k in ['comparecimento', 'abstencoes', 'votos_validos', 'brancos']}
    tot['nulos'] = sum(nulos(x) for x in R)
    D['nac'] = dict(aptos=apt, perfil=sum(f(x, 'perfil_total') for x in R), **tot)
    D['nac']['nao_escolheu'] = tot['abstencoes'] + tot['brancos'] + tot['nulos']
    votos = defaultdict(float)
    for x in R:
        for k in range(1, 13):
            votos[x[f'c{k}_nome']] += f(x, f'c{k}_votos')
    o = sorted(votos.values(), reverse=True)
    D['nac']['dif12'] = o[0] - o[1]

    # --- regiões e UFs 2026
    def agrega(chave, linhas):
        g = defaultdict(lambda: defaultdict(float))
        for x in linhas:
            for k in ['eleitores_aptos', 'comparecimento', 'abstencoes', 'brancos']:
                g[x[chave]][k] += f(x, k)
            g[x[chave]]['nulos'] += nulos(x)
        return {k: dict(abst=100 * v['abstencoes'] / v['eleitores_aptos'], br=100 * v['brancos'] / v['comparecimento'],
                        nu=100 * v['nulos'] / v['comparecimento'], aptos=v['eleitores_aptos'], n_abst=v['abstencoes'],
                        n_br=v['brancos'], n_nu=v['nulos']) for k, v in g.items()}
    D['reg'] = agrega('regiao', R)
    D['uf'] = agrega('uf', R)

    # --- perfil da abstenção, 2022 (dado individual agregado por grupo)
    def por_dim(dim, filtro=lambda x: True):
        a, b, ao, bo = (defaultdict(float) for _ in range(4))
        for x in P:
            if x['dimensao'] == dim and filtro(x):
                g = x['grupo']
                a[g] += f(x, 'aptos'); b[g] += f(x, 'abstencoes'); ao[g] += f(x, 'aptos_obrig'); bo[g] += f(x, 'abst_obrig')
        return a, b, ao, bo
    a, b, ao, bo = por_dim('faixa_etaria')
    A, B = sum(a.values()), sum(b.values())
    ordem_idade = ['16 anos', '17 anos', '18 anos', '19 anos', '20 anos', '21 a 24 anos', '25 a 29 anos', '30 a 34 anos', '35 a 39 anos',
                   '40 a 44 anos', '45 a 49 anos', '50 a 54 anos', '55 a 59 anos', '60 a 64 anos', '65 a 69 anos'] + SETENTA
    D['idade'] = [dict(g=g, taxa=100 * b[g] / a[g], fac=not ao[g], pe=100 * a[g] / A, pa=100 * b[g] / B) for g in ordem_idade]
    D['taxa22'] = 100 * B / A
    D['aptos22'] = A
    D['p70_abst22'] = sum(100 * b[g] / B for g in SETENTA)
    D['p70_eleit22'] = sum(100 * a[g] / A for g in SETENTA)
    D['t2129'] = 100 * (bo['21 a 24 anos'] + bo['25 a 29 anos']) / (ao['21 a 24 anos'] + ao['25 a 29 anos'])
    D['t4559'] = 100 * sum(bo[g] for g in ['45 a 49 anos', '50 a 54 anos', '55 a 59 anos']) / sum(ao[g] for g in ['45 a 49 anos', '50 a 54 anos', '55 a 59 anos'])
    D['t70'] = 100 * sum(b[g] for g in SETENTA) / sum(a[g] for g in SETENTA)

    a, b, ao, bo = por_dim('escolaridade')
    niveis = [('ANALFABETO', 'Analfabeto'), ('LÊ E ESCREVE', 'Lê e escreve'), ('ENSINO FUNDAMENTAL INCOMPLETO', 'Fundamental incompleto'),
              ('ENSINO FUNDAMENTAL COMPLETO', 'Fundamental completo'), ('ENSINO MÉDIO INCOMPLETO', 'Médio incompleto'),
              ('ENSINO MÉDIO COMPLETO', 'Médio completo'), ('SUPERIOR INCOMPLETO', 'Superior incompleto'), ('SUPERIOR COMPLETO', 'Superior completo')]
    D['escol'] = [dict(g=r, bruto=100 * b[k] / a[k], obrig=100 * bo[k] / ao[k] if ao[k] else None, pa=100 * b[k] / B, pe=100 * a[k] / A) for k, r in niveis]

    a, b, ao, bo = por_dim('estado_civil')
    D['civil'] = {k: 100 * bo[k] / ao[k] for k in ['SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIÚVO']}

    D['genero'] = {}
    for r in REGIOES + ['Brasil']:
        a, b, ao, bo = por_dim('genero', (lambda x, r=r: r == 'Brasil' or regiao_uf.get(x['uf']) == r))
        D['genero'][r] = dict(m=100 * bo['MASCULINO'] / ao['MASCULINO'], f=100 * bo['FEMININO'] / ao['FEMININO'],
                              mb=100 * b['MASCULINO'] / a['MASCULINO'], fb=100 * b['FEMININO'] / a['FEMININO'])

    # região × faixa (voto obrigatório) e 70+ (bruto)
    FAIXA = {'18 anos': '18–20', '19 anos': '18–20', '20 anos': '18–20', '21 a 24 anos': '21–29', '25 a 29 anos': '21–29',
             '30 a 34 anos': '30–44', '35 a 39 anos': '30–44', '40 a 44 anos': '30–44', '45 a 49 anos': '45–59',
             '50 a 54 anos': '45–59', '55 a 59 anos': '45–59', '60 a 64 anos': '60–69', '65 a 69 anos': '60–69'}
    ra = defaultdict(lambda: [0.0, 0.0])
    for x in P:
        if x['dimensao'] != 'faixa_etaria':
            continue
        r = regiao_uf.get(x['uf'])
        if x['grupo'] in FAIXA:
            ra[(r, FAIXA[x['grupo']])][0] += f(x, 'aptos_obrig'); ra[(r, FAIXA[x['grupo']])][1] += f(x, 'abst_obrig')
        elif x['grupo'] in SETENTA:
            ra[(r, '70+')][0] += f(x, 'aptos'); ra[(r, '70+')][1] += f(x, 'abstencoes')
    D['faixas'] = ['18–20', '21–29', '30–44', '45–59', '60–69', '70+']
    D['reg_idade'] = {r: {fx: 100 * ra[(r, fx)][1] / ra[(r, fx)][0] for fx in D['faixas']} for r in REGIOES}

    # --- validação do uso de 2022 como aproximação: taxas 2022 × eleitorado 2026
    col = lambda g: 'faixa_' + g.replace(' ', '_') if g != 'Inválido' else 'faixa_invalida'
    taxa = defaultdict(dict)
    for x in P:
        if x['dimensao'] == 'faixa_etaria' and f(x, 'aptos') > 0:
            taxa[x['cod_municipio']][col(x['grupo'])] = f(x, 'abstencoes') / f(x, 'aptos')
    prev, real, base, p70 = (defaultdict(float) for _ in range(4))
    xs, ys = [], []
    c70 = {col(g) for g in SETENTA}
    for x in BR:
        t = taxa.get(x['cod_municipio'])
        if not t:
            continue
        e = {k: f(x, k) * v for k, v in t.items()}
        r = x['regiao']
        prev[r] += sum(e.values()); p70[r] += sum(v for k, v in e.items() if k in c70)
        real[r] += f(x, 'abstencoes'); base[r] += f(x, 'perfil_total')
        if f(x, 'perfil_total'):
            xs.append(sum(e.values()) / f(x, 'perfil_total')); ys.append(f(x, 'abstencoes') / f(x, 'eleitores_aptos'))
    S = lambda d: sum(d.values())
    D['proj'] = dict(prev=100 * S(prev) / S(base), real=100 * S(real) / S(base), n70=S(p70), p70=100 * S(p70) / S(prev),
                     r=float(np.corrcoef(xs, ys)[0, 1]),
                     reg={r: dict(prev=100 * prev[r] / base[r], real=100 * real[r] / base[r]) for r in REGIOES})

    # --- correlatos municipais 2026 (inferência ecológica)
    linhas = []
    for x in BR:
        c, apx, pt = f(x, 'comparecimento'), f(x, 'eleitores_aptos'), f(x, 'perfil_total')
        if c <= 0 or pt <= 0:
            continue
        s = lambda ks: 100 * sum(f(x, k) for k in ks) / pt
        linhas.append(dict(
            reg=x['regiao'], w=apx,
            p70=s(['faixa_' + g.replace(' ', '_') for g in SETENTA]),
            p1624=s(['faixa_16_anos', 'faixa_17_anos', 'faixa_18_anos', 'faixa_19_anos', 'faixa_20_anos', 'faixa_21_a_24_anos']),
            baixa=s(['escolaridade_analfabeto', 'escolaridade_le_e_escreve', 'escolaridade_ensino_fundamental_incompleto']),
            sup=s(['escolaridade_superior_completo', 'escolaridade_superior_incompleto']),
            masc=s(['genero_masculino']), porte=math.log10(apx),
            abst=100 * f(x, 'abstencoes') / apx, br=100 * f(x, 'brancos') / c, nu=100 * nulos(x) / c))

    def quintis(var, y, reg=None):
        L = [l for l in linhas if reg is None or l['reg'] == reg]
        v = np.array([l[var] for l in L]); yy = np.array([l[y] for l in L]); w = np.array([l['w'] for l in L])
        q = np.quantile(v, [.2, .4, .6, .8]); cl = np.searchsorted(q, v, side='right')
        return [dict(de=float(v[cl == k].min()), ate=float(v[cl == k].max()), y=float(np.average(yy[cl == k], weights=w[cl == k]))) for k in range(5)]
    D['q'] = {
        'nu_baixa_BR': quintis('baixa', 'nu'), 'nu_baixa_NE': quintis('baixa', 'nu', 'Nordeste'),
        'br_sup_BR': quintis('sup', 'br'), 'br_porte_BR': quintis('porte', 'br'),
        'abst_70_BR': quintis('p70', 'abst'), 'abst_70_SE': quintis('p70', 'abst', 'Sudeste'), 'abst_70_NE': quintis('p70', 'abst', 'Nordeste'),
        'abst_baixa_BR': quintis('baixa', 'abst'),
    }
    # regressão ponderada: variáveis padronizadas + efeitos fixos de região
    chaves = ['p70', 'p1624', 'baixa', 'sup', 'masc', 'porte']
    Z = np.array([[l[k] for k in chaves] for l in linhas]); Z = (Z - Z.mean(0)) / Z.std(0)
    Dm = np.array([[1.0 if l['reg'] == g else 0.0 for g in REGIOES[1:]] for l in linhas])
    M = np.hstack([np.ones((len(linhas), 1)), Z, Dm]); w = np.array([l['w'] for l in linhas]); sw = np.sqrt(w / w.mean())
    D['reg_mod'] = {}
    for y in ['abst', 'br', 'nu']:
        yy = np.array([l[y] for l in linhas])
        coef, *_ = np.linalg.lstsq(M * sw[:, None], yy * sw, rcond=None)
        res = np.average((yy - M @ coef) ** 2, weights=w); tot_ = np.average((yy - np.average(yy, weights=w)) ** 2, weights=w)
        D['reg_mod'][y] = dict(r2=1 - res / tot_, **{k: float(v) for k, v in zip(chaves, coef[1:7])})
    D['n_mun'] = len(linhas)
    return D


# ================================================================== gráficos SVG
def svg(w, h, corpo, rotulo):
    return f'<svg viewBox="0 0 {w} {h}" role="img" aria-label="{esc(rotulo)}" xmlns="http://www.w3.org/2000/svg">{corpo}</svg>'

def texto(x, y, t, tam=9, cor=TINTA2, anc='start', peso=400, extra=''):
    if 'halo' in extra:
        extra = extra.replace('halo', 'paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round"')
    return f'<text x="{x:.1f}" y="{y:.1f}" font-size="{tam}" fill="{cor}" text-anchor="{anc}" font-weight="{peso}" {extra}>{esc(t)}</text>'


def fig_composicao(D):
    """Barra única: o eleitorado apto dividido em válidos, abstenção, nulos e brancos."""
    n = D['nac']; W, H = 440, 112
    partes = [('Votos válidos', n['votos_validos'], NEUTRO, TINTA), ('Abstenção', n['abstencoes'], TEAL, '#fff'),
              ('Nulos', n['nulos'], CORAL, '#fff'), ('Brancos', n['brancos'], AMBAR, '#fff')]
    x0, larg, y = 0, W, 34
    c = ''
    for i, (r, v, cor, ct) in enumerate(partes):
        w = larg * v / n['aptos']
        c += f'<rect x="{x0:.1f}" y="{y}" width="{max(w - 2, 1):.1f}" height="34" fill="{cor}"/>'
        if w > 60:
            c += texto(x0 + 8, y + 22, pct(100 * v / n['aptos']), 11.5, ct, peso=700)
        # rótulos acima (válidos, abstenção) e abaixo (nulos, brancos) para não colidir
        if i < 2:
            c += texto(x0, y - 9, f'{r} · {mi(v)}', 9, TINTA, peso=600)
        else:
            yy = y + 52 + (i - 2) * 15
            c += f'<line x1="{x0 + w / 2:.1f}" y1="{y + 36}" x2="{x0 + w / 2:.1f}" y2="{yy - 4}" stroke="{cor}" stroke-width="1"/>'
            c += texto(x0 + w / 2 - 4, yy + 4, f'{r} · {mi(v)} · {pct(100 * v / n["aptos"])} dos aptos', 9, TINTA, 'end', 600)
        x0 += w
    return svg(W, H, c, 'Eleitorado apto dividido em votos válidos, abstenção, nulos e brancos')


def fig_regioes(D):
    """Abstenção, brancos e nulos por região: uma linha por região, três colunas."""
    W, H = 440, 172
    paineis = [('abst', 'Abstenção', '% dos aptos', TEAL, 26), ('br', 'Brancos', '% dos votantes', AMBAR, 2.6), ('nu', 'Nulos', '% dos votantes', CORAL, 3.8)]
    nac = D['nac']
    ref = {'abst': 100 * nac['abstencoes'] / nac['aptos'], 'br': 100 * nac['brancos'] / nac['comparecimento'], 'nu': 100 * nac['nulos'] / nac['comparecimento']}
    lx0, pw = 76, (W - 76) / 3
    c = ''
    for j, (k, tit, un, cor, mx) in enumerate(paineis):
        ox = lx0 + j * pw; lw = pw - 46
        c += texto(ox, 11, tit, 9.5, TINTA, peso=700) + texto(ox, 23, un, 8, MUDO)
        xr = ox + lw * ref[k] / mx
        c += f'<line x1="{xr:.1f}" y1="30" x2="{xr:.1f}" y2="{34 + 5 * 24 - 4}" stroke="{TINTA}" stroke-width="1.2"/>'
        for i, r in enumerate(REGIOES):
            v = D['reg'][r][k]; y = 34 + i * 24
            c += f'<rect x="{ox}" y="{y}" width="{lw * v / mx:.1f}" height="14" rx="2" fill="{cor}"/>'
            c += texto(ox + lw * v / mx + 4, y + 11, pct(v), 9, TINTA, peso=600, extra='halo')
        c += texto(xr, 34 + 5 * 24 + 9, f'Brasil {pct(ref[k])}', 8.5, TINTA, 'middle', 600)
    for i, r in enumerate(REGIOES):
        c += texto(lx0 - 8, 34 + i * 24 + 11, r, 9, TINTA2, 'end')
    return svg(W, H, c, 'Abstenção, brancos e nulos por região, 2026')


def fig_idade(D):
    """Taxa de abstenção por idade (2022) e participação de cada idade no total de abstenções."""
    W, H = 560, 250
    I = D['idade']; n = len(I)
    ml, mr, top, base = 34, 8, 18, 150
    bw = (W - ml - mr) / n
    c = texto(0, 10, 'Taxa de abstenção (%)', 9, TINTA, peso=700)
    for t in [0, 25, 50, 75, 100]:
        y = base - (base - top) * t / 100
        c += f'<line x1="{ml}" y1="{y:.1f}" x2="{W - mr}" y2="{y:.1f}" stroke="{GRADE}" stroke-width="0.8"/>'
        c += texto(ml - 5, y + 3, str(t), 8, MUDO, 'end')
    for i, d in enumerate(I):
        x = ml + i * bw; h = (base - top) * d['taxa'] / 100
        cor = TEAL if not d['fac'] else '#8fc7dd'
        c += f'<rect x="{x + 1.5:.1f}" y="{base - h:.1f}" width="{bw - 3:.1f}" height="{h:.1f}" fill="{cor}"/>'
        if d['fac'] and d['taxa'] > 30:
            c += f'<rect x="{x + 1.5:.1f}" y="{base - h:.1f}" width="{bw - 3:.1f}" height="{h:.1f}" fill="url(#hach)"/>'
        c += texto(x + bw / 2, base - h - 3, nf(d['taxa'], 0), 7.5, TINTA, 'middle', 600)
        rot = d['g'].replace(' anos', '').replace(' a ', '–').replace('100 ou mais', '100+')
        c += texto(x + bw / 2, base + 10, rot, 7, TINTA2, 'middle')
    # painel inferior: % das abstenções × % do eleitorado
    y0 = 186
    c += texto(0, y0 - 8, 'Participação no total (%): abstenções (barra) e eleitorado (traço)', 9, TINTA, peso=700)
    esc_ = 52 / 12
    for i, d in enumerate(I):
        x = ml + i * bw
        h = d['pa'] * esc_
        c += f'<rect x="{x + 1.5:.1f}" y="{y0 + 52 - h:.1f}" width="{bw - 3:.1f}" height="{h:.1f}" fill="{TEAL_ESC if not d["fac"] else "#5aa9c8"}"/>'
        ye = y0 + 52 - d['pe'] * esc_
        c += f'<line x1="{x + 1:.1f}" y1="{ye:.1f}" x2="{x + bw - 1:.1f}" y2="{ye:.1f}" stroke="{TINTA}" stroke-width="1.6"/>'
    c += f'<line x1="{ml}" y1="{y0 + 52}" x2="{W - mr}" y2="{y0 + 52}" stroke="{MUDO}" stroke-width="0.8"/>'
    for t in (5, 10):
        yt = y0 + 52 - t * esc_
        c += f'<line x1="{ml}" y1="{yt:.1f}" x2="{W - mr}" y2="{yt:.1f}" stroke="{GRADE}" stroke-width="0.6"/>' + texto(ml - 5, yt + 3, str(t), 8, MUDO, 'end')
    # chave
    c += f'<rect x="{W - 190}" y="2" width="10" height="10" fill="{TEAL}"/>' + texto(W - 176, 11, 'voto obrigatório', 8.5)
    c += f'<rect x="{W - 100}" y="2" width="10" height="10" fill="#8fc7dd"/><rect x="{W - 100}" y="2" width="10" height="10" fill="url(#hach)"/>' + texto(W - 86, 11, 'facultativo', 8.5)
    defs = f'<defs><pattern id="hach" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="{TEAL_ESC}" stroke-width="1.2" opacity=".5"/></pattern></defs>'
    return svg(W, H, defs + c, 'Taxa de abstenção por idade em 2022 e participação de cada idade no total de abstenções')


def fig_escolaridade(D):
    W, H = 270, 190
    E = D['escol']; c = ''
    lx, lw = 104, 128
    c += texto(0, 10, 'Taxa de abstenção (%)', 9, TINTA, peso=700)
    for i, d in enumerate(E):
        y = 22 + i * 20
        c += texto(lx - 5, y + 11, d['g'], 8.5, TINTA2, 'end')
        if d['obrig'] is None:
            v = d['bruto']; w = lw * min(v, 60) / 60 * 0.62
            c += f'<rect x="{lx}" y="{y + 2}" width="{w:.1f}" height="12" fill="#8fc7dd"/><rect x="{lx}" y="{y + 2}" width="{w:.1f}" height="12" fill="url(#hach2)"/>'
            c += texto(lx + w + 4, y + 12, f'{pct(v)} · facultativo', 8.5, TINTA, peso=600)
        else:
            w = lw * d['obrig'] / 60 * 1.9
            c += f'<rect x="{lx}" y="{y + 2}" width="{w:.1f}" height="12" fill="{TEAL}"/>'
            c += texto(lx + w + 4, y + 12, pct(d['obrig']), 8.5, TINTA, peso=600)
    defs = f'<defs><pattern id="hach2" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="{TEAL_ESC}" stroke-width="1.2" opacity=".5"/></pattern></defs>'
    return svg(W, H, defs + c, 'Abstenção por escolaridade, voto obrigatório, 2022')


def fig_genero(D):
    W, H = 270, 190
    G = D['genero']; c = texto(0, 10, 'Abstenção no voto obrigatório (%)', 9, TINTA, peso=700)
    lx, lw, lo, hi = 84, 150, 10, 24
    X = lambda v: lx + lw * (v - lo) / (hi - lo)
    for t in [10, 15, 20]:
        c += f'<line x1="{X(t):.1f}" y1="20" x2="{X(t):.1f}" y2="160" stroke="{GRADE}" stroke-width="0.8"/>' + texto(X(t), 172, str(t), 8, MUDO, 'middle')
    for i, r in enumerate(['Brasil'] + REGIOES):
        y = 30 + i * 22
        g = G[r]
        c += texto(lx - 6, y + 4, r, 8.5, TINTA if r == 'Brasil' else TINTA2, 'end', 700 if r == 'Brasil' else 400)
        c += f'<line x1="{X(g["f"]):.1f}" y1="{y}" x2="{X(g["m"]):.1f}" y2="{y}" stroke="{MUDO}" stroke-width="1.5"/>'
        c += f'<circle cx="{X(g["f"]):.1f}" cy="{y}" r="4.5" fill="#fff" stroke="{TEAL_ESC}" stroke-width="2"/>'
        c += f'<circle cx="{X(g["m"]):.1f}" cy="{y}" r="4.5" fill="{TEAL_ESC}"/>'
        c += texto(X(g['m']) + 8, y + 3, f'+{nf(g["m"] - g["f"])} p.p.', 8, TINTA, peso=600)
    c += f'<circle cx="{lx}" cy="184" r="4" fill="#fff" stroke="{TEAL_ESC}" stroke-width="2"/>' + texto(lx + 8, 187, 'mulheres', 8.5)
    c += f'<circle cx="{lx + 70}" cy="184" r="4" fill="{TEAL_ESC}"/>' + texto(lx + 78, 187, 'homens', 8.5)
    return svg(W, H, c, 'Abstenção de homens e mulheres no voto obrigatório, por região, 2022')


def mapa_uf(malha, valores, rampa, titulo, fmt):
    """Coroplético por UF, classes por quintis das 27 UFs."""
    W, H = 180, 200
    k = math.cos(math.radians(15))
    lon0, lat0, esc_ = -74.2, 5.6, 4.3
    P = lambda lat, lon: ((lon - lon0) * k * esc_, (lat0 - lat) * esc_)
    vs = sorted(valores.values()); cortes = [vs[round(q * (len(vs) - 1))] for q in (.2, .4, .6, .8)]
    classe = lambda v: sum(v > c for c in cortes)
    c = texto(0, 10, titulo, 9, TINTA, peso=700)
    g = ''
    for uf, polis in malha.items():
        if uf not in valores:
            continue
        d = ''
        for poli in polis:
            for anel in poli:
                pts = [P(a, b) for a, b in anel]
                d += 'M' + 'L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + 'Z'
        g += f'<path d="{d}" fill="{rampa[classe(valores[uf])]}" stroke="#fff" stroke-width="0.6"/>'
    c += f'<g transform="translate(4,18)">{g}</g>'
    # legenda
    lim = [min(vs)] + cortes + [max(vs)]
    for i in range(5):
        y = 196 - (4 - i) * 0
    ly = 186
    for i in range(5):
        x = 2 + i * 35
        c += f'<rect x="{x}" y="{ly}" width="33" height="7" fill="{rampa[i]}"/>'
    c += texto(2, ly - 3, fmt(lim[0]), 7.5, MUDO) + texto(178, ly - 3, fmt(lim[-1]), 7.5, MUDO, 'end')
    return svg(W, H + 2, c, titulo)


def fig_quintis(series, titulo, rot_x, cor, fmt=lambda v: pct(v, 2), y_max=None):
    """Barras agrupadas por quintil; várias séries (ex.: Brasil e Nordeste)."""
    W, H = 270, 178
    c = texto(0, 10, titulo, 9, TINTA, peso=700)
    ml, base, top = 8, 128, 24
    ymax = y_max or max(d['y'] for _, s, _ in series for d in s) * 1.15
    gw = (W - ml) / 5; ns = len(series); bw = (gw - 14) / ns
    for q in range(5):
        for j, (nome, s, cj) in enumerate(series):
            v = s[q]['y']; h = (base - top) * v / ymax; x = ml + q * gw + 7 + j * bw
            c += f'<rect x="{x:.1f}" y="{base - h:.1f}" width="{bw - 2:.1f}" height="{h:.1f}" fill="{cj}"/>'
            c += texto(x + (bw - 2) / 2, base - h - 3 - (j * 8 if ns > 1 and abs(v - series[0][1][q]['y']) < 0.4 * ymax / 10 and j else 0), fmt(v), 7.5, TINTA, 'middle', 600, 'halo')
        s0 = series[0][1][q]
        c += texto(ml + q * gw + gw / 2, base + 11, f'Q{q + 1}', 8, TINTA, 'middle', 700)
        c += texto(ml + q * gw + gw / 2, base + 21, f'{nf(s0["de"], 0)}–{nf(s0["ate"], 0)}%', 7.5, MUDO, 'middle')
    c += f'<line x1="{ml}" y1="{base}" x2="{W}" y2="{base}" stroke="{MUDO}" stroke-width="0.8"/>'
    for i, linha in enumerate(rot_x):
        c += texto(ml, base + 36 + i * 11, linha, 8, TINTA2)
    if ns > 1:
        x = W - 130
        for nome, _, cj in series:
            c += f'<rect x="{x}" y="2" width="9" height="9" fill="{cj}"/>' + texto(x + 13, 10, nome, 8.5)
            x += 62
    return svg(W, H, c, titulo)


def tabela_calor(D):
    F = D['faixas']; RI = D['reg_idade']
    vs = [RI[r][fx] for r in REGIOES for fx in F[:-1]]
    lo, hi = min(vs), max(vs)
    def cel(v, fac=False):
        if fac:
            return f'<td class="calor fac">{pct(v, 0)}</td>'
        t = (v - lo) / (hi - lo); i = min(4, int(t * 5))
        cor = RAMPA['abst'][i]; tc = '#fff' if i >= 3 else TINTA
        return f'<td class="calor" style="background:{cor};color:{tc}">{pct(v)}</td>'
    h = '<table class="calor"><thead><tr><th></th>' + ''.join(f'<th>{fx}</th>' for fx in F) + '</tr></thead><tbody>'
    for r in REGIOES:
        h += f'<tr><th>{r}</th>' + ''.join(cel(RI[r][fx], fx == '70+') for fx in F) + '</tr>'
    return h + '</tbody></table>'


# ================================================================== página
def monta(D):
    n = D['nac']; reg = D['reg']; uf = D['uf']; pj = D['proj']; rm = D['reg_mod']
    malha = json.load(open(os.path.join(RAIZ, 'malha_uf.json')))
    ufs = {k: v for k, v in uf.items() if k != 'ZZ'}
    top = lambda m, k=5, rev=True: sorted(ufs.items(), key=lambda kv: kv[1][m], reverse=rev)[:k]
    lista_uf = lambda m, k=3, rev=True: ', '.join(f'{u} ({pct(v[m], 2 if m != "abst" else 1)})' for u, v in top(m, k, rev))
    lista_uf_sp = lambda m, k=3: ', '.join(f'{u} {pct(v[m], 2)}' for u, v in top(m, k))
    G = D['genero']
    gmin = min(REGIOES, key=lambda r: G[r]['m'] - G[r]['f']); gmax = max(REGIOES, key=lambda r: G[r]['m'] - G[r]['f'])
    E = {d['g']: d for d in D['escol']}
    Q = D['q']
    ri = D['reg_idade']

    cab = lambda num: f'''<header class="cab"><span class="marca-q"></span>MAPA ELEITORAL 2026 · ANÁLISE DE CONJUNTURA ELEITORAL<span class="dir">Nº 01 · OUTUBRO 2026</span></header>'''
    rod = lambda num: f'''<footer class="rod"><span>mapa-eleitoral-2026-rho.vercel.app</span><b>{num:02d}</b></footer>'''

    paginas = []
    # ---------------------------------------------------------------- capa
    paginas.append(f'''
<section class="pagina capa">
 <div class="capa-topo">
  <div class="marca"><b>Mapa Eleitoral</b><span>2026</span></div>
  <div class="capa-serie"><b>ANÁLISE DE CONJUNTURA ELEITORAL</b><br>Dados do TSE · 1º turno</div>
 </div>
 <div class="capa-corpo">
  <div class="numero"><small>Nº</small>01</div>
  <div class="etiquetas"><span>ABSTENÇÃO</span><span>VOTOS BRANCOS</span><span>VOTOS NULOS</span><span>PERFIL DO ELEITORADO</span></div>
  <h1>Quem não escolheu</h1>
  <p class="sub">Perfil demográfico da abstenção e dos votos brancos e nulos no primeiro turno das Eleições 2026</p>
 </div>
 <div class="capa-pe"><b>OUTUBRO 2026</b><span>mapa-eleitoral-2026-rho.vercel.app</span></div>
</section>''')

    # ---------------------------------------------------------------- 01 panorama
    paginas.append(f'''
<section class="pagina">
 {cab(2)}
 <div class="duas">
  <aside class="lateral">
   <h4>NESTA EDIÇÃO</h4>
   <ol class="sumario"><li><b>01</b>Panorama</li><li><b>02</b>Quem faltou</li><li><b>03</b>Escolaridade, gênero e estado civil</li>
   <li><b>04</b>Regiões</li><li><b>05</b>Brancos e nulos</li><li><b>06</b>Diretrizes</li><li><b>—</b>Nota metodológica</li></ol>
   <h4>NÚMEROS DO 1º TURNO</h4>
   <div class="num"><b>{mi(n['abstencoes'])}</b><span>abstenções · {pct(100 * n['abstencoes'] / n['aptos'])} dos aptos</span></div>
   <div class="num"><b>{mi(n['nulos'])}</b><span>votos nulos · {pct(100 * n['nulos'] / n['comparecimento'], 2)} dos votantes</span></div>
   <div class="num"><b>{mi(n['brancos'])}</b><span>votos brancos · {pct(100 * n['brancos'] / n['comparecimento'], 2)} dos votantes</span></div>
   <div class="num"><b>{mi(n['dif12'])}</b><span>votos separaram o 1º do 2º colocado</span></div>
   <h4>FONTES</h4>
   <p class="pq">TSE: resultados oficiais 2026 (totalização final); perfil do eleitorado 2026; perfil de comparecimento e abstenção 2022, 1º turno.</p>
  </aside>
  <div class="principal">
   <div class="secao"><b>01</b>PANORAMA</div>
   <h2>Um em cada quatro eleitores aptos não escolheu candidato</h2>
   <p class="lead">Somadas, abstenções, votos brancos e nulos chegaram a {mi(n['nao_escolheu'])} no primeiro turno: {pct(100 * n['nao_escolheu'] / n['aptos'])} dos {mi(n['aptos'])} de eleitores aptos. É cerca de {round(n['nao_escolheu'] / n['dif12'])} vezes a diferença de votos entre os dois primeiros colocados.</p>
   <div class="col2">
    <p>A abstenção responde pela maior parte desse contingente: {mi(n['abstencoes'])} de eleitores, ou {pct(100 * n['abstencoes'] / n['aptos'])} dos aptos, praticamente a mesma taxa observada no primeiro turno de 2022 ({pct(D['taxa22'])} na base de perfil, que exclui o Distrito Federal e o exterior). Entre os que compareceram, {pct(100 * n['nulos'] / n['comparecimento'], 2)} anularam o voto e {pct(100 * n['brancos'] / n['comparecimento'], 2)} votaram em branco.</p>
    <p>Os três comportamentos não têm a mesma geografia. A abstenção é maior no Sudeste ({pct(reg['Sudeste']['abst'])}) e no Centro-Oeste ({pct(reg['Centro-Oeste']['abst'])}) e menor no Nordeste ({pct(reg['Nordeste']['abst'])}). O voto branco se concentra no Sudeste e no Sul; o nulo, no Nordeste e no Sudeste. Este boletim descreve quem está por trás de cada um desses números e o que os dados permitem, e não permitem, afirmar.</p>
   </div>
   <figure>{fig_composicao(D)}<figcaption><b>Fig. 1</b> Destino dos {mi(n['aptos'])} de eleitores aptos no 1º turno de 2026. Nulos incluem os votos anulados que o TSE soma ao total oficial (3.674.249).</figcaption></figure>
   <figure>{fig_regioes(D)}<figcaption><b>Fig. 2</b> Abstenção (sobre aptos) e votos brancos e nulos (sobre votantes) por região. O traço vertical marca a média nacional. Eleitores no exterior, com {pct(reg['Exterior']['abst'])} de abstenção, ficam fora do gráfico.</figcaption></figure>
  </div>
 </div>
 {rod(2)}
</section>''')

    # ---------------------------------------------------------------- 02 quem faltou
    I70 = D['p70_abst22']; E70 = D['p70_eleit22']
    paginas.append(f'''
<section class="pagina">
 {cab(3)}
 <div class="secao"><b>02</b>QUEM FALTOU</div>
 <div class="titulo-lado">
  <h2>Dois perfis concentram a abstenção: idosos e adultos jovens</h2>
  <p class="lead-lado">O TSE publica a abstenção por idade, escolaridade, gênero e estado civil até a eleição de 2022. É o retrato mais próximo de quem efetivamente faltou.</p>
 </div>
 <figure>{fig_idade(D)}<figcaption><b>Fig. 3</b> Acima: taxa de abstenção por idade no 1º turno de 2022; em tom claro e hachurado, as idades de voto facultativo (16–17 e 70 anos ou mais). Abaixo: participação de cada idade no total de abstenções (barra) e no eleitorado (traço). Fonte: TSE, perfil de comparecimento e abstenção 2022.</figcaption></figure>
 <div class="tres">
  <div class="destaque"><b>{pct(I70, 0)}</b><span>das abstenções de 2022 vieram de eleitores com 70 anos ou mais, que eram {pct(E70, 1)} do eleitorado. Nessa faixa, {pct(D['t70'], 0)} não votaram.</span></div>
  <div class="destaque"><b>{pct(D['t2129'])}</b><span>de abstenção entre 21 e 29 anos, a maior taxa entre quem é obrigado a votar. Entre 45 e 59 anos, a taxa cai para {pct(D['t4559'])}.</span></div>
  <div class="destaque"><b>≈ {mi(pj['n70'])}</b><span>dos que faltaram em 2026 teriam 70 anos ou mais ({pct(pj['p70'], 0)} do total), mantidas as taxas de 2022. Estimativa, não contagem.</span></div>
 </div>
 <div class="col2">
  <p>A curva da abstenção por idade tem forma de U assimétrico. Entre os jovens, ela sobe de {pct(D['idade'][2]['taxa'], 0)} aos 18 anos para mais de 22% entre 21 e 29 anos, idade em que mudanças de cidade e de rotina afastam o eleitor da seção onde está inscrito. Cai até a faixa de 55 a 59 anos e dispara a partir dos 70, quando o voto deixa de ser obrigatório: {pct(D['idade'][15]['taxa'], 0)} entre 70 e 74 anos e mais de 90% acima dos 90.</p>
  <p>Parte da abstenção dos mais velhos reflete o próprio cadastro: eleitores falecidos só deixam de figurar como aptos quando o óbito é comunicado à Justiça Eleitoral, o que superestima a taxa nas idades mais altas. A abstenção de 70 anos ou mais, portanto, mistura escolha, dificuldade de locomoção e defasagem cadastral, componentes que os dados agregados não permitem separar.</p>
  <p class="nota-val"><b>As taxas de 2022 valem para 2026?</b> Aplicadas ao eleitorado de 2026, município a município e faixa a faixa, elas preveem {pct(pj['prev'], 2)} de abstenção; o resultado real foi {pct(pj['real'], 2)}. A correlação entre o previsto e o observado nos municípios é de {nf(pj['r'], 2)}. O perfil de 2022 é, por isso, uma aproximação defensável para 2026, mas continua sendo aproximação.</p>
 </div>
 {rod(3)}
</section>''')

    # ---------------------------------------------------------------- 03 escolaridade, gênero, estado civil
    C = D['civil']
    paginas.append(f'''
<section class="pagina">
 {cab(4)}
 <div class="secao"><b>03</b>ESCOLARIDADE, GÊNERO E ESTADO CIVIL</div>
 <h2 class="largo">Escolaridade pesa menos do que parece; gênero, mais</h2>
 <div class="figs2">
  <figure>{fig_escolaridade(D)}<figcaption><b>Fig. 4</b> Abstenção por escolaridade declarada, entre quem tem voto obrigatório. Para analfabetos, cujo voto é facultativo, a taxa bruta. TSE, 2022.</figcaption></figure>
  <figure>{fig_genero(D)}<figcaption><b>Fig. 5</b> Abstenção de homens e mulheres no voto obrigatório (18 a 69 anos), por região. TSE, 2022.</figcaption></figure>
 </div>
 <div class="col2">
  <p><b>Escolaridade.</b> Quem tem ensino superior completo é quem menos falta: {pct(E['Superior completo']['obrig'])} no voto obrigatório. Os demais níveis, porém, ficam entre {pct(E['Lê e escreve']['obrig'])} e {pct(E['Médio incompleto']['obrig'])}, e a ordem não acompanha os anos de estudo: o ensino médio incompleto tem taxa maior que o fundamental incompleto. A razão provável é a idade. O médio incompleto reúne muitos eleitores de 18 a 29 anos, faixa de alta abstenção; o fundamental incompleto, eleitores mais velhos, que faltam menos até os 69 anos. Entre os analfabetos, cujo voto é facultativo, a abstenção chega a {pct(E['Analfabeto']['bruto'], 0)}, e eles respondem por {pct(E['Analfabeto']['pa'], 0)} de todas as abstenções.</p>
  <p><b>Gênero.</b> Na taxa bruta, homens e mulheres parecem próximos ({pct(G['Brasil']['mb'])} e {pct(G['Brasil']['fb'])}), porque as mulheres são maioria entre os idosos, que faltam mais. Entre quem é obrigado a votar, a diferença aparece: {pct(G['Brasil']['m'])} dos homens faltaram, contra {pct(G['Brasil']['f'])} das mulheres. A distância se repete em todas as regiões, de {nf(G[gmin]['m'] - G[gmin]['f'])} pontos no {gmin} a {nf(G[gmax]['m'] - G[gmax]['f'])} no {gmax}.</p>
  <p><b>Estado civil.</b> Solteiros faltam mais que casados ({pct(C['SOLTEIRO'])} e {pct(C['CASADO'])} no voto obrigatório). Como no caso da escolaridade, a diferença é em boa parte etária: solteiros são, em média, mais jovens. O estado civil serve para descrever o eleitorado, não para explicar a abstenção.</p>
  <p class="nota-val"><b>Composição não é comportamento.</b> As figuras desta seção mostram quem faltou em 2022. Saber que um município tem muitos jovens ou muitos eleitores de baixa escolaridade não diz, por si só, que ali a abstenção será alta: nos municípios, a composição demográfica explica menos da metade da variação da abstenção (seção 05).</p>
 </div>
 {rod(4)}
</section>''')

    # ---------------------------------------------------------------- 04 regiões
    fx = lambda v: pct(v, 1)
    fx2 = lambda v: pct(v, 2)
    paginas.append(f'''
<section class="pagina">
 {cab(5)}
 <div class="secao"><b>04</b>REGIÕES</div>
 <h2 class="largo">Abstenção no Sudeste e no Centro-Oeste, nulo no Nordeste, branco no Sudeste e no Sul</h2>
 <div class="mapas">
  <figure>{mapa_uf(malha, {k: v['abst'] for k, v in ufs.items()}, RAMPA['abst'], 'Abstenção (% dos aptos)', fx)}</figure>
  <figure>{mapa_uf(malha, {k: v['nu'] for k, v in ufs.items()}, RAMPA['nu'], 'Nulos (% dos votantes)', fx2)}</figure>
  <figure>{mapa_uf(malha, {k: v['br'] for k, v in ufs.items()}, RAMPA['br'], 'Brancos (% dos votantes)', fx2)}</figure>
 </div>
 <p class="leg-fig"><b>Fig. 6</b> Abstenção, votos nulos e brancos por unidade da federação, 1º turno de 2026. Cinco classes por quintis das 27 UFs; tons mais escuros indicam valores maiores. TSE, totalização final.</p>
 <div class="duas-iguais">
  <div>
   <p><b>Abstenção.</b> As maiores taxas estão em {lista_uf('abst')}; as menores, em {lista_uf('abst', 3, False)}. O Nordeste, com {pct(reg['Nordeste']['abst'])}, falta menos que o Sudeste ({pct(reg['Sudeste']['abst'])}), o que contraria a leitura de que abstenção acompanha a pobreza regional.</p>
   <p>Comparado ao que o perfil de 2022 previa, o Norte e o Nordeste se abstiveram menos que o esperado ({pct(pj['reg']['Nordeste']['real'])} contra {pct(pj['reg']['Nordeste']['prev'])} no Nordeste), e o Sudeste e o Sul, um pouco mais ({pct(pj['reg']['Sudeste']['real'])} contra {pct(pj['reg']['Sudeste']['prev'])} no Sudeste).</p>
   <p><b>Nulos e brancos.</b> O voto nulo é mais frequente em {lista_uf('nu')}; o branco, em {lista_uf('br')}.</p>
  </div>
  <div>
   <h4 class="tab-tit">Abstenção por região e idade, 2022 (%)</h4>
   {tabela_calor(D)}
   <p class="leg-fig"><b>Fig. 7</b> 18 a 69 anos: voto obrigatório. 70+: taxa bruta (voto facultativo), em cinza. Cores comparáveis entre as faixas obrigatórias. TSE, 2022.</p>
   <p>O pico entre 21 e 29 anos aparece em todas as regiões e é mais alto no Centro-Oeste ({pct(ri['Centro-Oeste']['21–29'])}). Entre os idosos, o Sudeste lidera ({pct(ri['Sudeste']['70+'])} de abstenção acima dos 70).</p>
  </div>
 </div>
 {rod(5)}
</section>''')

    # ---------------------------------------------------------------- 05 brancos e nulos
    qb, qn = Q['nu_baixa_BR'], Q['nu_baixa_NE']
    paginas.append(f'''
<section class="pagina">
 {cab(6)}
 <div class="secao"><b>05</b>BRANCOS E NULOS</div>
 <div class="titulo-lado">
  <h2>Nulo e branco não são o mesmo voto</h2>
  <p class="lead-lado">O TSE não publica o perfil de quem anulou ou votou em branco. O que se pode observar é em que tipo de município esses votos se concentram.</p>
 </div>
 <div class="figs2">
  <figure>{fig_quintis([('Brasil', qb, CORAL), ('Nordeste', qn, '#8c2626')], 'Nulos (% dos votantes)', ['Quintis de municípios pela % do eleitorado', 'com até o fundamental incompleto'], CORAL)}<figcaption><b>Fig. 8</b> Votos nulos segundo a escolaridade do eleitorado do município. Média ponderada pelo eleitorado em cada quintil.</figcaption></figure>
  <figure>{fig_quintis([('Brasil', Q['br_sup_BR'], AMBAR)], 'Brancos (% dos votantes)', ['Quintis de municípios pela % do eleitorado', 'com ensino superior (completo ou não)'], AMBAR)}<figcaption><b>Fig. 9</b> Votos brancos segundo a escolaridade do eleitorado do município. Média ponderada pelo eleitorado em cada quintil.</figcaption></figure>
 </div>
 <div class="col2">
  <p><b>Nulos acompanham a baixa escolaridade.</b> Nos municípios em que a maior parte do eleitorado declara no máximo o fundamental incompleto, o nulo chega a {pct(qb[4]['y'], 2)} dos votos, contra {pct(qb[0]['y'], 2)} nos municípios mais escolarizados. O padrão se mantém dentro do Nordeste ({pct(qn[0]['y'], 2)} a {pct(qn[4]['y'], 2)}), o que afasta a hipótese de mero efeito regional. Num modelo que controla região, idade, gênero e porte do município, a baixa escolaridade é a variável mais associada ao nulo.</p>
  <p><b>Brancos acompanham o contrário.</b> O voto branco cresce com a proporção de eleitores com ensino superior ({pct(Q['br_sup_BR'][0]['y'], 2)} a {pct(Q['br_sup_BR'][4]['y'], 2)}) e com o tamanho do município, e se concentra no Sudeste e no Sul.</p>
  <p><b>O que isso permite dizer.</b> As duas geografias opostas sugerem que nulo e branco cumprem funções distintas. O branco tem perfil compatível com recusa deliberada, em eleitorado urbano e escolarizado. O nulo, mais frequente onde a escolaridade é menor, pode incluir erro de digitação na urna, além de protesto. Os dados não distinguem intenção de erro: é hipótese a investigar, não conclusão.</p>
  <p class="nota-val"><b>Alcance do modelo.</b> Variáveis demográficas e região explicam {pct(100 * rm['abst']['r2'], 0)} da variação municipal da abstenção, {pct(100 * rm['nu']['r2'], 0)} da do nulo e {pct(100 * rm['br']['r2'], 0)} da do branco. Na abstenção e no nulo, mais da metade da variação depende de fatores fora da base: oferta de transporte, distância das seções, disputa local, mobilização.</p>
 </div>
 {rod(6)}
</section>''')

    # ---------------------------------------------------------------- 06 diretrizes
    paginas.append(f'''
<section class="pagina">
 {cab(7)}
 <div class="secao"><b>06</b>DIRETRIZES</div>
 <h2 class="largo">O que os dados autorizam dizer, e o que não</h2>
 <div class="diretrizes">
  <div class="dir"><b>1</b><div><h3>Separe idosos de jovens adultos</h3><p>A abstenção tem dois núcleos de natureza distinta. Cerca de {pct(pj['p70'], 0)} dos que faltaram têm 70 anos ou mais e não são obrigados a votar. Entre os obrigados, o pico está nos 21 a 29 anos. Estratégias e análises que tratam "o abstencionista" como um perfil único erram o alvo.</p></div></div>
  <div class="dir"><b>2</b><div><h3>Leia a abstenção dos idosos com cautela</h3><p>Parte dela é defasagem cadastral (óbitos não comunicados), não comportamento. Taxas acima de 90% nas idades mais altas sugerem o peso desse componente.</p></div></div>
  <div class="dir"><b>3</b><div><h3>Gênero importa no voto obrigatório</h3><p>Homens faltam {nf(G['Brasil']['m'] - G['Brasil']['f'])} pontos a mais que mulheres entre 18 e 69 anos, em todas as regiões. A taxa bruta esconde essa diferença.</p></div></div>
  <div class="dir"><b>4</b><div><h3>Escolaridade não é atalho para idade</h3><p>Fora o ensino superior, as diferenças por escolaridade são pequenas e em boa parte etárias. A escolaridade do cadastro é a declarada no alistamento e costuma estar desatualizada.</p></div></div>
  <div class="dir"><b>5</b><div><h3>A geografia contraria o senso comum</h3><p>O Nordeste falta menos que o Sudeste e o Centro-Oeste. Em 2026, Norte e Nordeste se abstiveram menos do que o perfil de 2022 previa; Sudeste e Sul, um pouco mais.</p></div></div>
  <div class="dir"><b>6</b><div><h3>Trate nulo e branco separadamente</h3><p>O nulo se concentra onde a escolaridade é menor, sobretudo no Nordeste; o branco, em municípios grandes e escolarizados do Sudeste e do Sul. Somá-los apaga essa diferença.</p></div></div>
  <div class="dir"><b>7</b><div><h3>Onde o nulo é alto, informe sobre a urna</h3><p>Se parte do nulo é erro de votação, orientação sobre o uso da urna e o número dos candidatos rende mais nos municípios de baixa escolaridade do Nordeste ({lista_uf_sp('nu', 3)}). É uma hipótese a testar, por exemplo comparando o nulo para presidente com o de cargos de mais dígitos.</p></div></div>
  <div class="dir"><b>8</b><div><h3>Abstenção não é voto disponível</h3><p>Quem faltou não está necessariamente à espera de um candidato: inclui mudança de domicílio, impedimento, desinteresse e cadastro defasado. Qualquer cálculo de "votos recuperáveis" é teto teórico.</p></div></div>
 </div>
 <div class="quadro">
  <h4>CUIDADOS DE LEITURA</h4>
  <ul>
   <li><b>Perfil é de 2022.</b> O TSE ainda não publicou a abstenção por idade, escolaridade e gênero de 2026. As taxas de 2022 preveem bem o total de 2026 (seção 02), mas não captam mudanças de comportamento de um grupo específico.</li>
   <li><b>Município não é indivíduo.</b> As associações das seções 04 e 05 são ecológicas: dizem em que municípios brancos e nulos se concentram, não quem os digitou.</li>
   <li><b>Composição não prediz voto.</b> Densidade de um perfil num município não equivale a comportamento desse perfil.</li>
  </ul>
 </div>
 {rod(7)}
</section>''')

    # ---------------------------------------------------------------- expediente
    paginas.append(f'''
<section class="pagina">
 {cab(8)}
 <h2 class="expediente">EXPEDIENTE</h2>
 <div class="duas-iguais exp">
  <div>
   <h4>PUBLICAÇÃO</h4><p>Mapa Eleitoral 2026 — Análise de Conjuntura Eleitoral, nº 01</p>
   <h4>DADOS</h4><p>Tribunal Superior Eleitoral (TSE): resultados do 1º turno de 2026, totalização final; perfil do eleitorado 2026; perfil de comparecimento e abstenção 2022, 1º turno. Contornos estaduais: IBGE.</p>
   <h4>EXPLORAR OS DADOS</h4><p>mapa-eleitoral-2026-rho.vercel.app</p>
   <h4>REPRODUZIR</h4><p><code>python3 ferramentas/relatorio_conjuntura.py</code> no repositório do projeto. Todos os números deste boletim são calculados por esse script a partir das bases públicas.</p>
  </div>
  <div>
   <h4>COMO CITAR</h4><p>MAPA ELEITORAL 2026. <i>Quem não escolheu</i>: perfil demográfico da abstenção e dos votos brancos e nulos no primeiro turno das Eleições 2026. Análise de Conjuntura Eleitoral, n. 1, out. 2026. Disponível em: mapa-eleitoral-2026-rho.vercel.app.</p>
   <h4>AUDITORIA DOS DADOS</h4><p>As bases foram conferidas com os números oficiais do TSE: perfil do eleitorado e resultado batem até a unidade. Ver <i>AUDITORIA.md</i> no repositório.</p>
  </div>
 </div>
 <div class="metodo">
  <h4>NOTA METODOLÓGICA</h4>
  <p><b>Taxas.</b> Abstenção é calculada sobre eleitores aptos; brancos e nulos, sobre quem compareceu. Nulos = comparecimento − válidos − brancos, o que reproduz o total oficial do TSE (inclui votos anulados). Agregados regionais e nacionais são razões de somas, nunca médias de taxas.</p>
  <p><b>Perfil de 2022.</b> Dado do TSE por município e grupo demográfico, sem o Distrito Federal e o exterior ({mi(D['aptos22'])} de aptos). "Voto obrigatório" exclui 16–17 anos, 70 anos ou mais e analfabetos. A projeção para 2026 aplica a taxa de 2022 de cada município e faixa etária ao eleitorado de 2026 da mesma faixa.</p>
  <p><b>Correlatos municipais.</b> {inteiro(D['n_mun'])} municípios com votação. Quintis de municípios ordenados pela variável de composição; médias ponderadas pelo eleitorado. Regressão linear ponderada com variáveis padronizadas (% 70+, % 16–24, % até fundamental incompleto, % superior, % homens, log do eleitorado) e efeitos fixos de região.</p>
  <p><b>Limites.</b> Inferência ecológica: associações entre municípios não descrevem indivíduos. Escolaridade e estado civil são autodeclarados no cadastro. A defasagem cadastral (óbitos não baixados) infla a abstenção nas idades mais altas.</p>
 </div>
 <div class="exp-pe"><p>Este boletim descreve os números do TSE e deixa claro o que é dado, o que é estimativa e o que é hipótese.</p><div class="marca escura"><b>Mapa Eleitoral</b><span>2026</span></div></div>
 {rod(8)}
</section>''')

    css = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'relatorio.css'), encoding='utf-8').read()
    return f'''<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Quem não escolheu · Análise de Conjuntura Eleitoral nº 01</title>
<link rel="icon" href="../../favicon.svg" type="image/svg+xml">
<style>{css}</style></head>
<body>{''.join(paginas)}</body></html>'''


def main():
    D = calcula()
    os.makedirs(SAIDA, exist_ok=True)
    open(os.path.join(SAIDA, 'index.html'), 'w', encoding='utf-8').write(monta(D))
    json.dump({k: v for k, v in D.items() if k not in ('q',)}, open(os.path.join(SAIDA, 'numeros.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1, default=float)
    print(os.path.join(SAIDA, 'index.html'))


if __name__ == '__main__':
    main()
