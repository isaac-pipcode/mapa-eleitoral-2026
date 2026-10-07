#!/usr/bin/env python3
"""Converte LEIA-ME.md em LEIA-ME.html mantendo o cabeçalho, o estilo e a navegação.

    python3 ferramentas/md_para_html.py [LEIA-ME.md]

Cobre o Markdown usado no repositório: títulos, parágrafos, listas (com
continuação indentada), tabelas, blocos de código, `código`, **negrito**,
*itálico* e regras. Nome de arquivo existente em `código` vira link.
"""
import html, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAV = ('<nav class="nav" aria-label="Painéis disponíveis"><a href="index.html">Explorador</a>'
       '<a href="indicadores.html">Indicadores</a><a href="perfis.html">Abstenção por perfil</a>'
       '<a href="mudanca.html">Margem e votos em jogo</a><a href="abstencao.html">Abstenção e público-alvo</a>'
       '<a href="rio.html">Rio por zona e seção</a><a href="LEIA-ME.html">Índice</a>'
       '<a href="DICIONARIO.html">Dicionário</a></nav>')


def inline(t):
    partes = re.split(r'(`[^`]+`)', t)
    out = []
    for p in partes:
        if p.startswith('`') and p.endswith('`'):
            c = p[1:-1]
            alvo = c.lstrip('/') or 'index.html'
            e = f'<code>{html.escape(c)}</code>'
            out.append(f'<a href="{alvo}">{e}</a>' if re.fullmatch(r'[\w./-]+\.(csv|html|json|md)', alvo)
                       and os.path.exists(os.path.join(RAIZ, alvo)) else e)
        else:
            p = html.escape(p, quote=False)
            p = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', p)
            p = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'<i>\1</i>', p)
            out.append(p)
    return ''.join(out)


def converte(md):
    L = md.split('\n')
    out, i, titulo = [], 0, ''
    while i < len(L):
        l = L[i]
        if not l.strip():
            i += 1
        elif l.startswith('```'):
            j = i + 1
            while j < len(L) and not L[j].startswith('```'):
                j += 1
            out.append('<pre><code>' + html.escape('\n'.join(L[i + 1:j])) + '</code></pre>')
            i = j + 1
        elif m := re.match(r'(#{1,4}) (.*)', l):
            k = len(m.group(1))
            if k == 1 and not titulo:
                titulo = re.sub(r'[`*]', '', m.group(2))
            out.append(f'<h{k}>{inline(m.group(2))}</h{k}>')
            i += 1
        elif re.fullmatch(r'-{3,}', l.strip()):
            out.append('<hr>')
            i += 1
        elif l.startswith('|'):
            linhas = []
            while i < len(L) and L[i].startswith('|'):
                linhas.append([c.strip() for c in L[i].strip().strip('|').split('|')])
                i += 1
            cab, corpo = linhas[0], [r for r in linhas[1:] if not all(re.fullmatch(r':?-+:?', c) for c in r)]
            ant = next((o for o in reversed(out) if o.startswith('<h')), '')
            cap = re.sub(r'</?h\d>', '', ant)
            out.append(f'<table><caption>{cap}</caption>\n<tr>' + ''.join(f'<th scope="col">{inline(c)}</th>' for c in cab) + '</tr>\n' +
                       '\n'.join('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in r) + '</tr>' for r in corpo) + '\n</table>')
        elif re.match(r'(\d+\.|-|\*) ', l):
            ordenada = bool(re.match(r'\d+\.', l))
            itens = []
            while i < len(L) and (re.match(r'(\d+\.|-|\*) ', L[i]) or (L[i].startswith('  ') and L[i].strip() and itens)):
                if re.match(r'(\d+\.|-|\*) ', L[i]):
                    itens.append(re.sub(r'^(\d+\.|-|\*) ', '', L[i]))
                else:
                    itens[-1] += ' ' + L[i].strip()
                i += 1
                while i < len(L) and not L[i].strip() and i + 1 < len(L) and re.match(r'(\d+\.|-|\*) ', L[i + 1]) and ordenada:
                    i += 1  # listas numeradas com linha em branco entre itens
            tag = 'ol' if ordenada else 'ul'
            out.append(f'<{tag}>' + ''.join(f'<li>{inline(t)}</li>' for t in itens) + f'</{tag}>')
        else:
            par = []
            while i < len(L) and L[i].strip() and not re.match(r'(#{1,4} |\||```|(\d+\.|-|\*) |-{3,}$)', L[i]):
                par.append(L[i].strip())
                i += 1
            out.append('<p>' + inline(' '.join(par)) + '</p>')
    return titulo, '\n'.join(out)


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else 'LEIA-ME.md'
    dst = os.path.join(RAIZ, os.path.splitext(src)[0] + '.html')
    titulo, corpo = converte(open(os.path.join(RAIZ, src), encoding='utf-8').read())
    antigo = open(dst, encoding='utf-8').read() if os.path.exists(dst) else ''
    m = re.search(r'<style>.*?</style>', antigo, re.S)
    estilo = m.group(0) if m else '<style>body{font:1rem/1.6 system-ui,sans-serif;max-width:1000px;margin:0 auto;padding:18px}</style>'
    estilo = estilo.replace('</style>', 'pre{background:#eef2f7;padding:10px 12px;border-radius:6px;overflow:auto}pre code{background:none;padding:0}\n.pular:focus{top:0}</style>')
    pagina = f'''<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<title>{html.escape(titulo)}</title>{estilo}</head><body>
<a class="pular" href="#conteudo" style="position:absolute;left:8px;top:-64px;background:#1d4ed8;color:#fff;padding:12px 18px;border-radius:0 0 8px 8px;text-decoration:none;font-weight:600">Pular para o conteúdo</a>
<main id="conteudo"><div class="wrap"><header>{NAV}</header>
{corpo}
</div></main></body></html>
'''
    open(dst, 'w', encoding='utf-8').write(pagina)
    print(dst)


if __name__ == '__main__':
    main()
