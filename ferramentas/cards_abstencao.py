#!/usr/bin/env python3
"""Cards de WhatsApp (1080×1350) sobre abstenção, para orientar produção de conteúdo e militância.

    python3 ferramentas/cards_abstencao.py          # gera relatorios/cards-abstencao/cards.html
    node ferramentas/png_cards.js                   # exporta um PNG por card

Os números vêm de ferramentas/relatorio_conjuntura.calcula() e das bases do repositório.
"""
import csv, html, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from relatorio_conjuntura import calcula, nf, pct, mi, ler, f  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, 'relatorios', 'cards-abstencao')
esc = html.escape
TITULO_CIDADE = {'SÃO PAULO': 'São Paulo', 'RIO DE JANEIRO': 'Rio de Janeiro', 'BELO HORIZONTE': 'Belo Horizonte',
                 'BRASÍLIA': 'Brasília', 'SALVADOR': 'Salvador', 'CURITIBA': 'Curitiba', 'PORTO ALEGRE': 'Porto Alegre'}


def mil(v):
    return f'{nf(v / 1e6, 1)} mi' if v >= 1e6 else f'{nf(v / 1e3, 0)} mil'


def barras(itens, cor='var(--verm)', fmt=mil):
    mx = max(v for _, v, _ in itens)
    return '<div class="barras">' + ''.join(
        f'<div class="bl"><span class="bn">{esc(n)}</span><span class="bt"><i style="width:{100 * v / mx:.1f}%;background:{cor}"></i></span>'
        f'<span class="bv">{fmt(v)}{f" <small>{esc(s)}</small>" if s else ""}</span></div>' for n, v, s in itens) + '</div>'


def main():
    D = calcula()
    R = ler('base_brasil_2026.csv')
    n = D['nac']
    uf_abs = {}
    for x in R:
        uf_abs[x['uf']] = uf_abs.get(x['uf'], 0) + f(x, 'abstencoes')
    top_uf = sorted(uf_abs.items(), key=lambda kv: -kv[1])[:5]
    share5 = 100 * sum(v for _, v in top_uf) / n['abstencoes']
    cid = sorted([x for x in R if x['uf'] != 'ZZ'], key=lambda x: -f(x, 'abstencoes'))[:5]
    grandes = [x for x in R if x['uf'] != 'ZZ' and f(x, 'eleitores_aptos') >= 200000]
    share_g = 100 * sum(f(x, 'abstencoes') for x in grandes) / n['abstencoes']
    um_ponto = n['aptos'] / 100
    G = D['genero']['Brasil']
    nu_top = sorted(((k, v['nu']) for k, v in D['uf'].items() if k != 'ZZ'), key=lambda kv: -kv[1])[:3]
    vezes = round(n['abstencoes'] / n['dif12'])

    rod = lambda i, fonte: f'<footer><span>{fonte}<br><b class="url">perfil-eleitoral-2026.vercel.app</b></span><span class="pg">{i}/10</span></footer>'
    marca = '<div class="marca"><b>Mapa Eleitoral</b> 2026 · Guia do 2º turno</div>'
    F26 = 'Fonte: TSE, resultado do 1º turno de 2026'
    F22 = 'Fonte: TSE, perfil de abstenção do 1º turno de 2022 (último publicado)'

    cards = []
    # 1 — capa
    cards.append(f'''<section class="card capa">{marca}
 <div class="meio"><p class="kick">ABSTENÇÃO · 1º TURNO 2026</p>
 <h1>{mil(n['abstencoes'])} de pessoas não foram votar</h1>
 <p class="big">É {vezes} vezes a diferença entre o 1º e o 2º colocado para presidente ({mil(n['dif12'])} de votos).</p></div>
 <p class="sub">Guia rápido para quem produz conteúdo e para a militância: onde está, quem é e como falar com quem faltou, dentro da lei.</p>
 {rod(1, 'Mapa Eleitoral 2026 · dados do TSE')}</section>''')

    # 2 — tamanho
    cards.append(f'''<section class="card">{marca}
 <p class="kick">O TAMANHO</p><h2>Cada ponto de comparecimento vale {mil(um_ponto)} de votos</h2>
 <div class="comp"><div><b class="n">{mil(n['abstencoes'])}</b><span>não votaram ({pct(100 * n['abstencoes'] / n['aptos'])} dos aptos)</span><i style="width:100%"></i></div>
 <div><b class="n">{mil(n['dif12'])}</b><span>separaram o 1º do 2º colocado</span><i style="width:{100 * n['dif12'] / n['abstencoes']:.1f}%"></i></div></div>
 <div class="acao"><b>O que fazer</b>Trazer de volta uma fração pequena de quem faltou pesa mais do que disputar o mesmo eleitor convicto. Comparecimento é a meta.</div>
 {rod(2, F26)}</section>''')

    # 3 — estados
    cards.append(f'''<section class="card">{marca}
 <p class="kick">ONDE · ESTADOS</p><h2>5 estados concentram {pct(share5, 0)} de quem faltou</h2>
 {barras([(u, v, pct(100 * v / D['uf'][u]['aptos'])) for u, v in top_uf])}
 <p class="nota">Número de abstenções; ao lado, a taxa do estado. Maiores taxas: {', '.join(f"{u} {pct(D['uf'][u]['abst'])}" for u, _ in sorted(((k, v['abst']) for k, v in D['uf'].items() if k != 'ZZ'), key=lambda kv: -kv[1])[:3])}.</p>
 <div class="acao"><b>O que fazer</b>Concentre esforço onde o volume é maior. Sudeste e Centro-Oeste faltam mais que o Nordeste.</div>
 {rod(3, F26)}</section>''')

    # 4 — cidades
    cards.append(f'''<section class="card">{marca}
 <p class="kick">ONDE · CIDADES</p><h2>As grandes cidades somam {pct(share_g, 0)} das abstenções</h2>
 {barras([(TITULO_CIDADE.get(x['municipio'], x['municipio'].title()), f(x, 'abstencoes'), pct(100 * f(x, 'abstencoes') / f(x, 'eleitores_aptos'))) for x in cid])}
 <p class="nota">{len(grandes)} municípios com 200 mil eleitores ou mais. O Rio tem a maior taxa entre as capitais grandes.</p>
 <div class="acao"><b>O que fazer</b>Conteúdo hiperlocal: bairro, escola de votação, horário de pico. Mensagem genérica não move quem já desistiu de ir.</div>
 {rod(4, F26)}</section>''')

    # 5 — jovens adultos
    cards.append(f'''<section class="card">{marca}
 <p class="kick">QUEM · 21 A 29 ANOS</p><h2>Adultos jovens são os que mais faltam entre quem é obrigado a votar</h2>
 <div class="dois"><div><b class="n">{pct(D['t2129'])}</b><span>de abstenção entre 21 e 29 anos</span></div>
 <div><b class="n">+{nf(G['m'] - G['f'])} p.p.</b><span>homens faltam mais que mulheres (18 a 69 anos)</span></div></div>
 <div class="acao"><b>O que fazer</b>Quem mudou de bairro ou de cidade muitas vezes não sabe onde vota. Lembre: o local está no app e-Título. Formatos curtos, linguagem direta, data e horário sempre visíveis.</div>
 {rod(5, F22)}</section>''')

    # 6 — 70+
    cards.append(f'''<section class="card">{marca}
 <p class="kick">QUEM · 70 ANOS OU MAIS</p><h2>Voto facultativo: {pct(D['t70'], 0)} dos idosos não votaram</h2>
 <div class="dois"><div><b class="n">≈ {pct(D['proj']['p70'], 0)}</b><span>de quem faltou em 2026 tem 70+ (estimativa)</span></div>
 <div><b class="n">≈ {mil(D['proj']['n70'])}</b><span>de pessoas</span></div></div>
 <div class="acao"><b>O que fazer</b>Fale com a família: é ela quem acompanha. Lembre que há fila prioritária e seções acessíveis. Sem pressão: para essa faixa, votar é escolha.</div>
 <p class="nota">Parte dessa abstenção pode ser cadastro desatualizado (óbitos não comunicados): nem todo número é gente que pode votar.</p>
 {rod(6, F22)}</section>''')

    # 7 — nulos
    cards.append(f'''<section class="card">{marca}
 <p class="kick">NULO · POSSÍVEL ERRO</p><h2>{mil(n['nulos'])} de votos nulos. Parte pode ser engano na urna</h2>
 <p class="nota grande">Nulo é mais alto onde a escolaridade é menor: {', '.join(f"{u} {pct(v, 1)}" for u, v in nu_top)} dos votantes. É hipótese, não certeza.</p>
 <ol class="passos"><li>Digite o número do candidato <b>(2 dígitos)</b></li><li>Confira <b>nome e foto</b> na tela</li><li>Aperte <b>CONFIRMA</b> (verde)</li><li>Onde há 2º turno para governador, a urna pede <b>dois votos</b></li></ol>
 <div class="acao"><b>O que fazer</b>Tutorial simples de como votar, em vídeo curto ou áudio, para grupos do Nordeste e do interior.</div>
 {rod(7, F26)}</section>''')

    # 8 — como falar
    cards.append(f'''<section class="card">{marca}
 <p class="kick">COMO FALAR</p><h2>Informação prática convence mais que bronca</h2>
 <ul class="lista"><li><b>Não culpe</b> quem faltou. Constrangimento afasta.</li>
 <li><b>Dê o caminho:</b> onde, quando, o que levar.</li>
 <li><b>Não presuma o voto</b> de quem faltou. Abstenção não é voto garantido.</li>
 <li><b>Use dado com fonte</b> (TSE). Número sem fonte vira boato.</li>
 <li><b>Um pedido por mensagem:</b> "confira seu local", "vote cedo", "chame alguém".</li></ul>
 {rod(8, 'Mapa Eleitoral 2026 · Boletim nº 01, "Quem não escolheu"')}</section>''')

    # 9 — o que é crime
    cards.append(f'''<section class="card alerta">{marca}
 <p class="kick">NÃO FAÇA · É CRIME ELEITORAL</p><h2>Mobilizar, sim. Dentro da lei.</h2>
 <ul class="lista x"><li><b>Transportar eleitores</b> no dia da votação, como campanha ou militância. Carona da própria família pode. <small>Lei 6.091/1974</small></li>
 <li><b>Oferecer dinheiro, brinde ou favor</b> em troca de voto ou de comparecimento. <small>Código Eleitoral, art. 299</small></li>
 <li><b>Boca de urna</b> e abordagem de eleitores no dia. <small>Lei 9.504/1997, art. 39, §5º</small></li>
 <li><b>Espalhar informação falsa</b> sobre a votação ou a urna. <small>Código Eleitoral, art. 323</small></li></ul>
 <div class="acao ok"><b>Pode</b>Lembrar, informar local e horário, conversar e convidar até a véspera, votar com sua camiseta.</div>
 {rod(9, 'Na dúvida, consulte o TRE do seu estado')}</section>''')

    # 10 — checklist
    cards.append(f'''<section class="card capa">{marca}
 <div class="meio"><p class="kick">2º TURNO</p><h1>Domingo, 25 de outubro</h1>
 <ul class="check"><li><b>8h às 17h</b> (horário de Brasília, em todo o país)</li>
 <li><b>Documento oficial com foto</b> ou o app e-Título</li>
 <li><b>Local de votação:</b> no e-Título ou no site do TSE</li>
 <li><b>Fora do domicílio?</b> Justifique pelo app e-Título</li></ul></div>
 <p class="sub">Encaminhe este card. Comparecimento se constrói um contato de cada vez.</p>
 {rod(10, 'Mapa Eleitoral 2026 · dados do TSE')}</section>''')

    css = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cards.css'), encoding='utf-8').read()
    os.makedirs(SAIDA, exist_ok=True)
    open(os.path.join(SAIDA, 'cards.html'), 'w', encoding='utf-8').write(
        f'<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Cards — abstenção 2026</title><style>{css}</style></head><body>{"".join(cards)}</body></html>')
    print(os.path.join(SAIDA, 'cards.html'))


if __name__ == '__main__':
    main()
