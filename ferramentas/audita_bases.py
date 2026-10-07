#!/usr/bin/env python3
"""Auditoria das bases contra números oficiais publicados e testes forenses.

    python3 ferramentas/audita_bases.py

A. Confronto com números oficiais (TSE e TREs, divulgados em jul–out/2026).
   Cada referência traz a fonte; diferença 0 = confere até a unidade.
B. Testes forenses de fabricação/adulteração (Benford, último dígito).
C. Coerência com uma base independente (abstenção por perfil 2022, TSE).
D. Coerência entre bases derivadas.

Complementa ferramentas/valida_bases.py (consistência interna).
Sai com código 1 se alguma referência oficial não conferir.
"""
import csv, math, os, statistics as st, sys
from collections import Counter, defaultdict

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ler = lambda n: list(csv.DictReader(open(os.path.join(RAIZ, n), encoding='utf-8-sig'), delimiter=';'))
num = lambda v: float(v or 0)

TSE_JUL = 'TSE, "Mais de 158 milhões de eleitores estão aptos a votar nas Eleições 2026" (jul/2026)'
TSE_RES = 'TSE, totalização final do 1º turno (05/out/2026), via imprensa'
TRE_PE = 'TRE-PE, eleitorado apto 2026 (jul/2026)'
TRE_PB = 'TRE-PB, eleitorado paraibano 2026 (jul/2026)'
TRE_SP = 'TRE-SP, SP tem 21,4% do eleitorado (jul/2026)'
CNN = 'CNN Brasil, 10 maiores colégios eleitorais 2026'

trunca = lambda v: math.floor(v / 1e5) / 10


# (descrição, valor oficial, valor na base, fonte, tolerância; None = divergência conhecida, não conta como falha)
def referencias(R, U):
    p = lambda k, cond=lambda x: True: sum(num(x[k]) for x in R if cond(x))
    uf = lambda u, k: num(next(x for x in U if x['uf'] == u)[k])
    cand = lambda u, nome: next(num(x[f'c{k}_votos']) for x in U if x['uf'] == u for k in range(1, 13) if x[f'c{k}_nome'] == nome)
    nac = lambda nome: sum(num(x[f'c{k}_votos']) for x in R for k in range(1, 13) if x[f'c{k}_nome'] == nome)
    return [
        ('Perfil: eleitorado total', 158745463, p('perfil_total'), TSE_JUL, 0),
        ('Perfil: mulheres', 83877126, p('genero_feminino'), TSE_JUL, 0),
        ('Perfil: eleitores até 18 anos', 3571159, p('faixa_16_anos') + p('faixa_17_anos') + p('faixa_18_anos'), TSE_JUL, 0),
        ('Perfil: exterior', 918876, p('perfil_total', lambda x: x['uf'] == 'ZZ'), TSE_JUL, 0),
        ('Perfil: SP', 34104226, p('perfil_total', lambda x: x['uf'] == 'SP'), TRE_SP, 0),
        ('Perfil: MG', 16377659, p('perfil_total', lambda x: x['uf'] == 'MG'), CNN, 0),
        ('Perfil: 5 maiores colégios', 83268916, sum(sorted((sum(num(x['perfil_total']) for x in R if x['uf'] == u) for u in {x['uf'] for x in R}), reverse=True)[:5]), CNN, 0),
        ('Perfil: PE, 16 anos', 36311, p('faixa_16_anos', lambda x: x['uf'] == 'PE'), TRE_PE, 0),
        ('Perfil: PE, 17 anos', 59726, p('faixa_17_anos', lambda x: x['uf'] == 'PE'), TRE_PE, 0),
        ('Perfil: PE, 70 a 79 anos', 494716, p('faixa_70_a_74_anos', lambda x: x['uf'] == 'PE') + p('faixa_75_a_79_anos', lambda x: x['uf'] == 'PE'), TRE_PE, 0),
        ('Perfil: PB, analfabetos', 204444, p('escolaridade_analfabeto', lambda x: x['uf'] == 'PB'), TRE_PB, 0),
        # o TSE divulga milhões TRUNCADOS a uma casa (44.292.209 → "44,2 milhões")
        ('Perfil: ensino médio completo (mi, truncado)', 44.2, trunca(p('escolaridade_ensino_medio_completo')), TSE_JUL, 0),
        ('Perfil: fundamental incompleto (mi, truncado)', 33.6, trunca(p('escolaridade_ensino_fundamental_incompleto')), TSE_JUL, 0),
        ('Perfil: médio incompleto (mi, truncado)', 28.8, trunca(p('escolaridade_ensino_medio_incompleto')), TSE_JUL, 0),
        ('Perfil: superior completo (mi, truncado)', 18.0, trunca(p('escolaridade_superior_completo')), TSE_JUL, 0),
        ('Resultado: comparecimento', 125275835, p('comparecimento'), TSE_RES, 0),
        ('Resultado: abstenções', 33469244, p('abstencoes'), TSE_RES, 0),
        ('Resultado: votos válidos', 119300788, p('votos_validos'), TSE_RES, 0),
        ('Resultado: brancos', 2300798, p('brancos'), TSE_RES, 0),
        ('Resultado: coluna `nulos` (divergência conhecida, ver nota)', 3674249, p('nulos'), TSE_RES, None),
        ('Resultado: nulos = comparecimento − válidos − brancos', 3674249, p('comparecimento') - p('votos_validos') - p('brancos'), TSE_RES, 0),
        ('Resultado: seções', 499248, p('secoes_total'), TSE_RES, 0),
        ('Resultado: Flávio Bolsonaro', 56104503, nac('FLAVIO BOLSONARO'), TSE_RES, 0),
        ('Resultado: Lula', 53879538, nac('LULA'), TSE_RES, 0),
        ('Resultado: Augusto Cury', 3448569, nac('ESCRITOR AUGUSTO CURY'), TSE_RES, 0),
        ('Resultado BA: Lula', 5664771, cand('BA', 'LULA'), TSE_RES, 0),
        ('Resultado BA: Flávio Bolsonaro', 2442585, cand('BA', 'FLAVIO BOLSONARO'), TSE_RES, 0),
        ('Resultado SP: Flávio Bolsonaro', 12922023, cand('SP', 'FLAVIO BOLSONARO'), TSE_RES, 0),
        ('Resultado SP: Lula', 9505413, cand('SP', 'LULA'), TSE_RES, 0),
        ('Resultado MG: Flávio Bolsonaro (% válidos)', 48.2, uf('MG', 'c1_pct'), TSE_RES, 0.05),
        ('Resultado RJ: Flávio Bolsonaro (% válidos)', 53.0, uf('RJ', 'c1_pct'), TSE_RES, 0.05),
        ('Resultado RS: Lula (% válidos)', 35.73, next(num(x[f'c{k}_pct']) for x in U if x['uf'] == 'RS' for k in range(1, 13) if x[f'c{k}_nome'] == 'LULA'), TSE_RES, 0.005),
    ]


def benford(vals):
    v = [int(a) for a in vals if a >= 10]
    c, n = Counter(str(a)[0] for a in v), len(v)
    esp = {d: math.log10(1 + 1 / d) for d in range(1, 10)}
    return n, sum(abs(c[str(d)] / n - esp[d]) for d in range(1, 10)) / 9


def ultimo_digito(vals):
    c, n = Counter(int(a) % 10 for a in vals), len(vals)
    return n, sum((c[d] - n / 10) ** 2 / (n / 10) for d in range(10))


def pearson(a, b):
    ma, mb = st.mean(a), st.mean(b)
    return sum((x - ma) * (y - mb) for x, y in zip(a, b)) / math.sqrt(sum((x - ma) ** 2 for x in a) * sum((y - mb) ** 2 for y in b))


def main():
    R, U = ler('base_brasil_2026.csv'), ler('base_uf_2026.csv')
    BR = [x for x in R if x['uf'] != 'ZZ']
    falhas = 0
    print('## A. Confronto com números oficiais\n')
    print('| Grandeza | Oficial | Base | Diferença | Fonte |\n|---|---:|---:|---:|---|')
    for desc, ofi, base, fonte, tol in referencias(R, U):
        d = base - ofi
        conhecida = tol is None
        ok = conhecida or abs(d) <= tol + 1e-9
        falhas += not ok
        inteiro = ofi == int(ofi) and ofi > 1000
        fm = (lambda v: f'{v:,.0f}'.replace(',', '.')) if inteiro else (lambda v: f'{v:.2f}'.replace('.', ','))
        dif = fm(d) + ' (conhecida)' if conhecida else ('0' if abs(d) < 1e-9 else 'ok' if ok else fm(d))
        print(f'| {desc} | {fm(ofi)} | {fm(base)} | {dif} | {fonte} |')

    print('\n## B. Testes forenses\n')
    n, mad = benford([num(x['eleitores_aptos']) for x in BR])
    print(f'- Benford, 1º dígito do eleitorado municipal: n={n}, MAD={mad:.4f}')
    n, mad = benford([num(x['c1_votos']) for x in BR])
    print(f'- Benford, 1º dígito dos votos do 1º colocado: n={n}, MAD={mad:.4f}')
    for nome in ('LULA', 'FLAVIO BOLSONARO'):
        v = [num(x[f'c{k}_votos']) for x in BR for k in range(1, 13) if x[f'c{k}_nome'] == nome and num(x[f'c{k}_votos']) >= 100]
        n, chi = ultimo_digito(v)
        print(f'- Último dígito, votos de {nome.title()} (≥100 votos): n={n}, χ²={chi:.1f} (crítico 9 gl, 5% = 16,9)')

    print('\n## C. Base independente: abstenção por perfil 2022 (TSE)\n')
    P = ler('base_abst_perfil_2022.csv')
    a22, b22 = defaultdict(float), defaultdict(float)
    for x in P:
        if x['dimensao'] == 'genero':
            a22[x['cod_municipio']] += num(x['aptos']); b22[x['cod_municipio']] += num(x['abstencoes'])
    pares = [(a22[x['cod_municipio']], num(x['perfil_total']), 100 * b22[x['cod_municipio']] / a22[x['cod_municipio']], num(x['pct_abstencao']))
             for x in BR if a22.get(x['cod_municipio'])]
    print(f'- Municípios casados pelo código TSE: {len(pares)}')
    print(f'- Correlação do log do eleitorado 2022 × 2026: {pearson([math.log(p[0]) for p in pares], [math.log(p[1]) for p in pares]):.4f}')
    cres = sorted(100 * (p[1] / p[0] - 1) for p in pares)
    print(f'- Variação do eleitorado 2022→2026: mediana {cres[len(cres) // 2]:.1f}%, p5 {cres[len(cres) // 20]:.1f}%, p95 {cres[-len(cres) // 20]:.1f}%')
    print(f'- Correlação da abstenção municipal 2022 × 2026: {pearson([p[2] for p in pares], [p[3] for p in pares]):.3f}')
    print(f'- Eleitorado 2022 na base de perfil: {sum(a22.values()):,.0f} (sem DF e exterior)'.replace(',', '.'))

    print('\n## D. Bases derivadas\n')
    M = {(x['nome'], x['uf'].upper()): x for x in ler('base_mudanca.csv')}
    N = {(x['nome'], x['uf'].upper()): x for x in ler('base_nacional.csv')}
    dm = sum(1 for x in BR if (x['municipio'], x['uf']) in M and int(M[(x['municipio'], x['uf'])]['eleitores']) != int(num(x['eleitores_aptos'])))
    dn = sum(1 for x in BR if (x['municipio'], x['uf']) in N and int(N[(x['municipio'], x['uf'])]['eleitores']) != int(num(x['eleitores_aptos'])))
    rio = next(x for x in R if x['municipio'] == 'RIO DE JANEIRO' and x['uf'] == 'RJ')
    srio = sum(int(x['eleitores_2026']) for x in ler('base_rio.csv'))
    print(f'- base_mudanca: {dm} municípios com eleitorado divergente; base_nacional: {dn}')
    print(f'- base_rio: soma das seções {srio:,} × perfil do município {int(num(rio["perfil_total"])):,}'.replace(',', '.'))

    print(f'\n{falhas} referência(s) oficial(is) sem conferir.')
    sys.exit(1 if falhas else 0)


if __name__ == '__main__':
    main()
