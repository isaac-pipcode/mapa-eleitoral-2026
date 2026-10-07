#!/usr/bin/env python3
"""Separa dados e comportamento nos painéis temáticos.

    python3 ferramentas/aplica_paineis.py

Os geradores (fora do repositório) emitem cada painel com dados e lógica
inline. Este script mantém só os DADOS inline (as linhas `const X=[...]`) e
troca a lógica por assets/mapa-tematico.js + assets/paineis/<painel>.js, que
ficam versionados aqui. Também corrige o cabeçalho e o contêiner do mapa.

Idempotente: rode depois de cada regeração dos painéis (publicar.sh).
"""
import os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAINEIS = ['perfis', 'mudanca', 'abstencao', 'rio', 'indicadores']
ROTULO_MAPA = ('Mapa interativo. Os mesmos valores estão na lista ao lado, '
               'que funciona por teclado, e na base em CSV.')


def aplica(nome):
    arq = os.path.join(RAIZ, nome + '.html')
    s = open(arq, encoding='utf-8').read()
    antes = s

    # cabeçalho: CSS do Leaflet (faltava em perfis) e CSS comum depois do estilo inline
    if 'assets/vendor/leaflet/leaflet.css' not in s:
        s = s.replace('<style>', '<link rel="stylesheet" href="assets/vendor/leaflet/leaflet.css">\n<style>', 1)
    if 'assets/mapa-tematico.css' not in s:
        s = s.replace('</head>', '<link rel="stylesheet" href="assets/mapa-tematico.css">\n</head>', 1)

    # contêiner do mapa: atributos tinham escapado para dentro do div como texto
    s = re.sub(r'<div id="map">\s*role="img"[^>]*>\s*</div>', f'<div id="map" role="region" aria-label="{ROTULO_MAPA}"></div>', s)
    s = re.sub(r'<div id="map"(?: role="[^"]*")?(?: aria-label="[^"]*")?></div>', f'<div id="map" role="region" aria-label="{ROTULO_MAPA}"></div>', s)

    # marcador de modelo que vazou para o texto
    s = s.replace('dados de __DIM__', 'dados de 2022')
    # textos de ajuda que descreviam a paleta antiga (arco-íris)
    s = s.replace('<b>Como ler a cor:</b> vermelho = mais apertado; azul = mais folgado.',
                  '<b>Como ler a cor:</b> azul mais escuro = disputa mais apertada; a legenda no mapa traz os cortes em pontos.')
    s = s.replace('aparecem em cinza tracejado', 'aparecem com contorno laranja tracejado')

    # script inline: mantém só as linhas de dados; lógica vira arquivo versionado
    externo = f'<script src="assets/mapa-tematico.js"></script>\n<script src="assets/paineis/{nome}.js"></script>'
    if f'assets/paineis/{nome}.js' not in s:
        a = s.rindex('<script>')
        b = s.index('</script>', a)
        dados = [l for l in s[a + 8:b].split('\n') if len(l) > 1000]
        if not dados:
            sys.exit(f'{nome}.html: não achei as linhas de dados no script inline')
        s = s[:a] + '<script>\n' + '\n'.join(dados) + '\n</script>\n' + externo + s[b + 9:]

    if s != antes:
        open(arq, 'w', encoding='utf-8').write(s)
    return s != antes


def main():
    for nome in PAINEIS:
        print(f'{nome}.html:', 'atualizado' if aplica(nome) else 'já estava aplicado')


if __name__ == '__main__':
    main()
