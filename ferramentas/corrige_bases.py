#!/usr/bin/env python3
"""Corrige as bases derivadas a partir de base_brasil_2026.csv.

    python3 ferramentas/corrige_bases.py

1. base_brasil_2026.csv — preenche coordenada dos municípios sem local de
   votação geocodificado (tabela COORD_SEDE, sede municipal). Só preenche
   célula vazia: nunca sobrescreve coordenada existente.
2. base_uf_2026.csv e base_regiao_2026.csv — reconstruídas do zero.
   A versão anterior somava as colunas c1_…c12_ por POSIÇÃO (o 1º colocado de
   cada município, fosse quem fosse) e somava percentuais (Acre: c1_pct=1403).
   Aqui os votos são somados por CANDIDATO, reordenados no agregado, e toda
   taxa é razão de somas.
3. DICIONARIO.md / DICIONARIO.html — regera as seções dessas duas bases.

Idempotente: rodar duas vezes produz os mesmos arquivos.
"""
import csv, html, io, os, re
from collections import defaultdict

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda n: os.path.join(RAIZ, n)

# Sede municipal (IBGE), usada só quando o TSE não dá coordenada de local de votação.
COORD_SEDE = {
    ('AP', 'SERRA DO NAVIO'): (-0.9017, -52.0036),
    ('PE', 'FERNANDO DE NORONHA'): (-3.8406, -32.4106),
}
REGIOES = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul', 'Exterior']
ID = ('uf', 'municipio', 'cod_municipio', 'regiao', 'latitude', 'longitude')
TAXAS = ('taxa_abstencao', 'taxa_comparecimento', 'pct_abstencao', 'pct_brancos', 'pct_nulos', 'pct_validos')


def ler(nome):
    with open(P(nome), encoding='utf-8-sig', newline='') as f:
        r = csv.DictReader(f, delimiter=';')
        return r.fieldnames, list(r)


def gravar(nome, campos, linhas):
    buf = io.StringIO()
    w = csv.writer(buf, delimiter=';', lineterminator='\r\n')
    w.writerow(campos)
    for l in linhas:
        w.writerow([l.get(c, '') for c in campos])
    with open(P(nome), 'w', encoding='utf-8-sig', newline='') as f:
        f.write(buf.getvalue())


def n(v):
    return int(float(v)) if v not in ('', None) else 0


def r2(v):
    return f'{v:.2f}'.rstrip('0').rstrip('.') if v is not None else ''


def corrige_coordenadas(campos, mun):
    feitos = []
    for x in mun:
        k = (x['uf'], x['municipio'])
        if k in COORD_SEDE and not x['latitude']:
            x['latitude'], x['longitude'] = (f'{c:.4f}' for c in COORD_SEDE[k])
            feitos.append(f'{x["municipio"]} ({x["uf"]})')
    if feitos:
        gravar('base_brasil_2026.csv', campos, mun)
    return feitos


def agrega(campos, mun, chave):
    contagens = [c for c in campos if c not in ID and c not in TAXAS and not re.match(r'c\d+_', c)
                 and c != 'margem_1o_2o_pts']
    grupos = defaultdict(lambda: {'n': 0, 'soma': defaultdict(int), 'votos': defaultdict(int), 'regiao': None})
    partido = {}
    for x in mun:
        g = grupos[x[chave]]
        g['n'] += 1
        g['regiao'] = x['regiao']
        for c in contagens:
            g['soma'][c] += n(x[c])
        for k in range(1, 13):
            nome = x[f'c{k}_nome']
            g['votos'][nome] += n(x[f'c{k}_votos'])
            partido[nome] = x[f'c{k}_partido']

    saida = []
    for nome_g, g in grupos.items():
        s = g['soma']
        apt, comp, val = s['eleitores_aptos'], s['comparecimento'], s['votos_validos']
        pc = lambda a, b: 100 * a / b if b else None
        l = {chave: nome_g, 'n_municipios': g['n']}
        if chave == 'uf':
            l['regiao'] = g['regiao']
        l.update({c: s[c] for c in contagens})
        l.update({
            'taxa_abstencao': r2(pc(s['abstencoes'], apt)), 'taxa_comparecimento': r2(pc(comp, apt)),
            'pct_abstencao': r2(pc(s['abstencoes'], apt)), 'pct_brancos': r2(pc(s['brancos'], apt)),
            'pct_nulos': r2(pc(s['nulos'], apt)), 'pct_validos': r2(pc(val, apt)),
        })
        ordem = sorted(g['votos'].items(), key=lambda kv: (-kv[1], kv[0]))
        for k, (cand, v) in enumerate(ordem, 1):
            l.update({f'c{k}_nome': cand, f'c{k}_partido': partido[cand], f'c{k}_votos': v, f'c{k}_pct': r2(pc(v, val))})
        l['margem_1o_2o_pts'] = r2(pc(ordem[0][1] - ordem[1][1], comp)) if len(ordem) > 1 else ''
        saida.append(l)

    ordem_g = (lambda l: REGIOES.index(l['regiao'])) if chave == 'regiao' else (lambda l: (l['uf'] == 'ZZ', l['uf']))
    saida.sort(key=ordem_g)
    cab = [chave] + (['regiao'] if chave == 'uf' else []) + ['n_municipios'] + \
          [c for c in campos if c not in ID and not re.match(r'c\d+_', c) and c != 'margem_1o_2o_pts'] + \
          [c for c in campos if re.match(r'c\d+_', c)] + ['margem_1o_2o_pts']
    return cab, saida


# ---------------------------------------------------------------- dicionário
def descricoes_municipais(md):
    sec = md.split('## `base_brasil_2026.csv`', 1)[1].split('\n## ', 1)[0]
    d = {}
    for m in re.finditer(r'^\| `([^`]+)` \| ([^|]+) \| ([^|]+) \|', sec, re.M):
        d[m.group(1)] = (m.group(2).strip(), m.group(3).strip())
    return d


def linhas_dic(cab, ex, desc, chave):
    onde = 'no estado' if chave == 'uf' else 'na região'
    out = []
    for c in cab:
        m = re.match(r'c(\d+)_(nome|partido|votos|pct)$', c)
        if c == 'uf':
            t, d = 'texto', 'Sigla do estado (ZZ = seções no exterior)'
        elif c == 'regiao':
            t, d = 'texto', 'Região do país'
        elif c == 'n_municipios':
            t, d = 'inteiro', 'Quantos municípios (ou localidades no exterior) entram no agregado'
        elif m:
            k, campo = m.group(1), m.group(2)
            t = {'nome': 'texto', 'partido': 'texto', 'votos': 'inteiro', 'pct': 'decimal'}[campo]
            d = {'nome': f'Nome do {k}º candidato mais votado {onde} (Presidência)',
                 'partido': f'Partido do {k}º candidato mais votado {onde}',
                 'votos': f'Votos do {k}º candidato mais votado {onde}, somados por candidato',
                 'pct': f'Votos do {k}º candidato sobre os votos válidos {onde} (%)'}[campo]
        elif c in TAXAS:
            t, d = 'decimal', desc.get(c, ('', ''))[1].replace('informada pelo TSE', 'recalculada: razão das somas')
        elif c == 'margem_1o_2o_pts':
            t, d = 'decimal', f'(votos do 1º − votos do 2º {onde}) ÷ comparecimento, em pontos'
        else:
            t, d = 'inteiro', desc.get(c, ('', c))[1] + ' (soma dos municípios)'
        out.append((c, t, d, str(ex.get(c, ''))))
    return out


def secao_md(arq, grao, linhas):
    s = [f'## `{arq}`', '', f'**Grão:** {grao}', '',
         '**Fonte:** Somatório da base por município (`ferramentas/corrige_bases.py`). Contagens somadas; '
         'taxas recalculadas como razão das somas; candidatos somados por nome e reordenados no agregado.', '',
         '| Coluna | Tipo | Descrição | Exemplo |', '|---|---|---|---|']
    s += [f'| `{c}` | {t} | {d} | `{e}` |' for c, t, d, e in linhas]
    return '\n'.join(s) + '\n\n'


def secao_html(arq, grao, linhas):
    g = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', html.escape(grao))
    s = [f'<h2><a href="{arq}">{arq}</a></h2>', f'<p><b>Grão:</b> {g}</p>',
         '<p><b>Fonte:</b> Somatório da base por município (<code>ferramentas/corrige_bases.py</code>). Contagens somadas; '
         'taxas recalculadas como razão das somas; candidatos somados por nome e reordenados no agregado.</p>',
         f'<table><caption><a href="{arq}">{arq}</a></caption>',
         '<tr><th scope="col">Coluna</th><th scope="col">Tipo</th><th scope="col">Descrição</th><th scope="col">Exemplo</th></tr>']
    s += [f'<tr><td><code>{c}</code></td><td>{t}</td><td>{html.escape(d)}</td><td><code>{html.escape(e)}</code></td></tr>'
          for c, t, d, e in linhas]
    return '\n'.join(s) + '\n</table>\n'


def atualiza_dicionario(bases):
    md = open(P('DICIONARIO.md'), encoding='utf-8').read()
    ht = open(P('DICIONARIO.html'), encoding='utf-8').read()
    desc = descricoes_municipais(md)
    for arq, chave, grao, cab, linhas in bases:
        tab = linhas_dic(cab, linhas[0], desc, chave)
        md = re.sub(rf'## `{re.escape(arq)}`\n.*?(?=\n## )', secao_md(arq, grao, tab).rstrip('\n') + '\n', md, flags=re.S)
        ht = re.sub(rf'<h2><a href="{re.escape(arq)}">.*?</table>\n', lambda _: secao_html(arq, grao, tab), ht, flags=re.S)
        md = re.sub(rf'(\| `{re.escape(arq)}` \|[^\n]*\| )[\d.]+( \| )\d+( \|)', rf'\g<1>{len(linhas)}\g<2>{len(cab)}\g<3>', md)
        ht = re.sub(rf'(<td><a href="{re.escape(arq)}">[^\n]*?<td>)[\d.]+(</td><td>)\d+(</td></tr>)', rf'\g<1>{len(linhas)}\g<2>{len(cab)}\g<3>', ht)
    open(P('DICIONARIO.md'), 'w', encoding='utf-8').write(md)
    open(P('DICIONARIO.html'), 'w', encoding='utf-8').write(ht)


def main():
    campos, mun = ler('base_brasil_2026.csv')
    feitos = corrige_coordenadas(campos, mun)
    print('coordenadas preenchidas:', ', '.join(feitos) or 'nenhuma (já estavam)')
    bases = []
    for arq, chave, grao in [
        ('base_uf_2026.csv', 'uf', 'Uma linha por **estado** (27 UFs + ZZ, seções no exterior).'),
        ('base_regiao_2026.csv', 'regiao', 'Uma linha por **região** (Norte, Nordeste, Centro-Oeste, Sudeste, Sul, Exterior).'),
    ]:
        cab, linhas = agrega(campos, mun, chave)
        gravar(arq, cab, linhas)
        bases.append((arq, chave, grao, cab, linhas))
        print(f'{arq}: {len(linhas)} linhas × {len(cab)} colunas')
    atualiza_dicionario(bases)
    print('DICIONARIO.md/.html: seções das bases agregadas regeradas')


if __name__ == '__main__':
    main()
