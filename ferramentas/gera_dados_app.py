#!/usr/bin/env python3
"""Gera as bases compactas do explorador (index.html) a partir dos CSVs da raiz.

Tudo é guardado como CONTAGEM bruta por município. Estado, região e Brasil são
somados no navegador, de modo que qualquer taxa de qualquer recorte é razão de
somas — nunca média de taxas, nunca soma de percentuais.

    python3 ferramentas/gera_dados_app.py

Saída em dados/:
  municipios.json        uma linha por município (inclui exterior, uf=ZZ)
  perfil2022/<UF>.json   abstenção 2022 por perfil, por município (sob demanda)
  perfil2022/agregados.json  o mesmo, somado por UF, região e Brasil
"""
import csv, json, os
from collections import Counter, defaultdict

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, 'dados')


def ler(nome):
    with open(os.path.join(RAIZ, nome), encoding='utf-8-sig') as f:
        return list(csv.DictReader(f, delimiter=';'))


def i(v):
    return int(float(v)) if v not in ('', None) else 0


# Faixas etárias agregadas: [rótulo, colunas da base 2026, grupos da base 2022]
IDADE = [
    ('16–17', ['16_anos', '17_anos']),
    ('18–24', ['18_anos', '19_anos', '20_anos', '21_a_24_anos']),
    ('25–34', ['25_a_29_anos', '30_a_34_anos']),
    ('35–44', ['35_a_39_anos', '40_a_44_anos']),
    ('45–59', ['45_a_49_anos', '50_a_54_anos', '55_a_59_anos']),
    ('60–69', ['60_a_64_anos', '65_a_69_anos']),
    ('70+', ['70_a_74_anos', '75_a_79_anos', '80_a_84_anos', '85_a_89_anos',
             '90_a_94_anos', '95_a_99_anos', '100_anos_ou_mais']),
]
ESCOL = [
    ('Analfabeto', ['analfabeto']),
    ('Lê e escreve', ['le_e_escreve']),
    ('Fundamental incompleto', ['ensino_fundamental_incompleto']),
    ('Fundamental completo', ['ensino_fundamental_completo']),
    ('Médio incompleto', ['ensino_medio_incompleto']),
    ('Médio completo', ['ensino_medio_completo']),
    ('Superior incompleto', ['superior_incompleto']),
    ('Superior completo', ['superior_completo']),
]
GENERO = [('Feminino', ['feminino']), ('Masculino', ['masculino'])]
CIVIL = [
    ('Solteiro', ['solteiro']), ('Casado', ['casado']),
    ('Divorciado ou separado', ['divorciado', 'separado_judicialmente']),
    ('Viúvo', ['viuvo']),
]
DIMS = [('idade', 'faixa_', IDADE), ('escolaridade', 'escolaridade_', ESCOL),
        ('genero', 'genero_', GENERO), ('estado_civil', 'estado_civil_', CIVIL)]


def chave22(txt):
    """'ENSINO MÉDIO COMPLETO' -> 'ensino_medio_completo' (mesma grafia das colunas 2026)."""
    import unicodedata
    t = unicodedata.normalize('NFKD', txt).encode('ascii', 'ignore').decode().lower()
    return t.replace(' ', '_')


def main():
    os.makedirs(os.path.join(SAIDA, 'perfil2022'), exist_ok=True)
    base = ler('base_brasil_2026.csv')

    # candidatos em ordem nacional de votos — a ordem é a identidade (cor fixa no app)
    tot, partido = Counter(), {}
    for x in base:
        for k in range(1, 13):
            n = x[f'c{k}_nome']
            tot[n] += i(x[f'c{k}_votos'])
            partido[n] = x[f'c{k}_partido']
    cands = [n for n, _ in tot.most_common()]
    idx = {n: k for k, n in enumerate(cands)}

    linhas = []
    for x in base:
        votos = [0] * len(cands)
        for k in range(1, 13):
            votos[idx[x[f'c{k}_nome']]] = i(x[f'c{k}_votos'])
        demo = []
        for _, pref, grupos in DIMS:
            demo.append([sum(i(x[pref + c]) for c in cols) for _, cols in grupos])
        lat = round(float(x['latitude']), 4) if x['latitude'] else None
        lon = round(float(x['longitude']), 4) if x['longitude'] else None
        linhas.append([
            x['cod_municipio'], x['municipio'], x['uf'], x['regiao'], lat, lon,
            i(x['eleitores_aptos']), i(x['comparecimento']), i(x['abstencoes']),
            i(x['votos_validos']), i(x['brancos']), i(x['nulos']), i(x['secoes_total']),
            demo, votos,
        ])

    out = {
        'fonte': 'TSE — resultados 2026, 1º turno, totalização final; perfil do eleitorado 2026',
        'campos': ['cod', 'nome', 'uf', 'regiao', 'lat', 'lon', 'aptos', 'comparecimento',
                   'abstencoes', 'validos', 'brancos', 'nulos', 'secoes', 'demo', 'votos'],
        'dimensoes': [[d, [g for g, _ in grupos]] for d, _, grupos in DIMS],
        'candidatos': [[n, partido[n]] for n in cands],
        'municipios': linhas,
    }
    with open(os.path.join(SAIDA, 'municipios.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))

    # ---- perfil 2022: só voto obrigatório (aptos_obrig, abst_obrig) ----
    regiao_uf = {x['uf']: x['regiao'] for x in base}
    mapa_grupo = {}
    for d, _, grupos in DIMS:
        for gi, (_, cols) in enumerate(grupos):
            for c in cols:
                mapa_grupo[(d, c)] = gi
    dim22 = {'faixa_etaria': 'idade', 'escolaridade': 'escolaridade',
             'genero': 'genero', 'estado_civil': 'estado_civil'}
    ndim = {d: len(g) for d, _, g in DIMS}

    def vazio():
        return {d: [[0, 0] for _ in range(ndim[d])] for d in ndim}

    por_mu = defaultdict(vazio)
    agreg = defaultdict(vazio)
    uf_do_mu = {}
    for x in ler('base_abst_perfil_2022.csv'):
        d = dim22.get(x['dimensao'])
        if not d:
            continue
        gi = mapa_grupo.get((d, chave22(x['grupo'])))
        if gi is None:
            continue
        a, b = i(x['aptos_obrig']), i(x['abst_obrig'])
        if not a:
            continue
        uf_do_mu[x['cod_municipio']] = x['uf']
        for alvo in (por_mu[x['cod_municipio']], agreg['UF:' + x['uf']],
                     agreg['R:' + regiao_uf.get(x['uf'], 'Exterior')], agreg['BR']):
            alvo[d][gi][0] += a
            alvo[d][gi][1] += b

    por_uf = defaultdict(dict)
    for cod, v in por_mu.items():
        por_uf[uf_do_mu[cod]][cod] = v
    for uf, dados in por_uf.items():
        with open(os.path.join(SAIDA, 'perfil2022', uf + '.json'), 'w', encoding='utf-8') as f:
            json.dump(dados, f, separators=(',', ':'))
    with open(os.path.join(SAIDA, 'perfil2022', 'agregados.json'), 'w', encoding='utf-8') as f:
        json.dump(agreg, f, separators=(',', ':'))

    print(f'{len(linhas)} municípios, {len(cands)} candidatos, '
          f'perfil 2022 para {len(por_mu)} municípios em {len(por_uf)} UFs')


if __name__ == '__main__':
    main()
