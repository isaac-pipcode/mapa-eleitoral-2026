#!/usr/bin/env python3
"""Checagens de integridade das bases. Rode antes de publicar.

    python3 ferramentas/valida_bases.py

ERRO  = a base contradiz a si mesma ou a outra base derivada; sai com código 1.
AVISO = característica conhecida do dado do TSE; documentada, não bloqueia.
"""
import csv, json, os, sys
from collections import defaultdict

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda n: os.path.join(RAIZ, n)
erros, avisos = [], []


def ler(nome):
    with open(P(nome), encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f, delimiter=';'))


def n(v):
    return int(float(v)) if v not in ('', None) else 0


def checa(cond, msg, lista=erros):
    if not cond:
        lista.append(msg)


mun = ler('base_brasil_2026.csv')
CONT = ['eleitores_aptos', 'comparecimento', 'abstencoes', 'votos_validos', 'brancos', 'nulos', 'secoes_total', 'perfil_total']

# ---- base municipal
checa(len({x['cod_municipio'] for x in mun}) == len(mun), 'cod_municipio repetido em base_brasil_2026.csv')
sem_voto, residuo, sem_coord, perfil_dif = [], [], [], []
for x in mun:
    nome = f"{x['municipio']} ({x['uf']})"
    votos = [n(x[f'c{k}_votos']) for k in range(1, 13)]
    checa(sum(votos) == n(x['votos_validos']), f'{nome}: soma dos candidatos ≠ votos válidos')
    checa(votos == sorted(votos, reverse=True), f'{nome}: candidatos fora de ordem')
    if n(x['comparecimento']) + n(x['abstencoes']) == 0 and n(x['eleitores_aptos']) > 0:
        sem_voto.append(nome)
    else:
        checa(n(x['eleitores_aptos']) == n(x['comparecimento']) + n(x['abstencoes']), f'{nome}: aptos ≠ comparecimento + abstenções')
    r = n(x['comparecimento']) - n(x['votos_validos']) - n(x['brancos']) - n(x['nulos'])
    checa(r >= 0, f'{nome}: válidos + brancos + nulos > comparecimento')
    if r:
        residuo.append(r)
    if not x['latitude'] and x['uf'] != 'ZZ':
        sem_coord.append(nome)
    for pref in ('faixa_', 'escolaridade_', 'genero_', 'estado_civil_', 'raca_'):
        checa(sum(n(x[k]) for k in x if k.startswith(pref)) == n(x['perfil_total']), f'{nome}: {pref}* não soma perfil_total')
    if abs(n(x['perfil_total']) - n(x['eleitores_aptos'])) > max(5, 0.01 * n(x['eleitores_aptos'])):
        perfil_dif.append(nome)

if sem_voto:
    avisos.append(f'{len(sem_voto)} localidade(s) sem votação (aptos > 0, comparecimento e abstenção = 0), ex.: {", ".join(sem_voto[:3])}. '
                  'O explorador mostra suas taxas como "sem votação".')
if residuo:
    avisos.append(f'{len(residuo)} municípios com comparecimento > válidos + brancos + nulos; resíduo total de {sum(residuo):,} votos '
                  '(provavelmente votos anulados apurados em separado; o arquivo do TSE não os discrimina). Taxas de brancos/nulos usam o comparecimento como denominador.'.replace(',', '.'))
checa(not sem_coord, f'municípios sem coordenada: {", ".join(sem_coord)} (rode ferramentas/corrige_bases.py)')
if perfil_dif:
    avisos.append(f'{len(perfil_dif)} municípios com perfil_total diferente de eleitores_aptos em mais de 1% (cadastro e apuração têm datas de corte diferentes).')

# ---- agregados = soma dos municípios
for arq, chave in [('base_uf_2026.csv', 'uf'), ('base_regiao_2026.csv', 'regiao')]:
    soma = defaultdict(lambda: defaultdict(int))
    vot = defaultdict(lambda: defaultdict(int))
    for x in mun:
        for c in CONT:
            soma[x[chave]][c] += n(x[c])
        for k in range(1, 13):
            vot[x[chave]][x[f'c{k}_nome']] += n(x[f'c{k}_votos'])
    ag = ler(arq)
    checa({a[chave] for a in ag} == set(soma), f'{arq}: conjunto de {chave} difere da base municipal')
    for a in ag:
        g = a[chave]
        for c in CONT:
            checa(n(a[c]) == soma[g][c], f'{arq} {g}: {c} ≠ soma dos municípios')
        for k in range(1, 13):
            nome = a.get(f'c{k}_nome')
            checa(nome and n(a[f'c{k}_votos']) == vot[g][nome], f'{arq} {g}: c{k} não confere com a soma por candidato')
            checa(0 <= float(a[f'c{k}_pct'] or 0) <= 100, f'{arq} {g}: c{k}_pct fora de 0–100')

# ---- bases do explorador (dados/) = CSV
try:
    J = json.load(open(P('dados/municipios.json'), encoding='utf-8'))
    checa(len(J['municipios']) == len(mun), 'dados/municipios.json: número de municípios difere do CSV (rode gera_dados_app.py)')
    i_apt, i_val = J['campos'].index('aptos'), J['campos'].index('validos')
    checa(sum(m[i_apt] for m in J['municipios']) == sum(n(x['eleitores_aptos']) for x in mun), 'dados/municipios.json: aptos difere do CSV')
    checa(sum(m[i_val] for m in J['municipios']) == sum(n(x['votos_validos']) for x in mun), 'dados/municipios.json: válidos difere do CSV')
    i_lat = J['campos'].index('lat')
    checa(sum(1 for m in J['municipios'] if m[i_lat] is None) == sum(1 for x in mun if not x['latitude']),
          'dados/municipios.json: coordenadas desatualizadas (rode gera_dados_app.py)')
    ag = json.load(open(P('dados/perfil2022/agregados.json')))
    faltam = sorted({x['uf'] for x in mun if x['uf'] != 'ZZ'} - {k[3:] for k in ag if k.startswith('UF:')})
    if faltam:
        avisos.append(f'abstenção por perfil 2022 ausente para: {", ".join(faltam)} (não consta do arquivo do TSE usado).')
except FileNotFoundError as e:
    erros.append(f'arquivo ausente: {e.filename}')

for a in avisos:
    print('AVISO', a)
for e in erros[:50]:
    print('ERRO ', e)
print(f'\n{len(erros)} erro(s), {len(avisos)} aviso(s).')
sys.exit(1 if erros else 0)
