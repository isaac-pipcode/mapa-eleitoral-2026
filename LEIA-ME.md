# Base eleitoral 2026 — índice

Tudo neste site é dado do TSE. Nenhuma conclusão está embutida: os painéis mostram
números e deixam o cruzamento para quem analisa.

---

## Painéis

| Página | O que faz |
|---|---|
| **`/`** — explorador | Entrada do site. Drill-down Brasil → região → estado → município com URL compartilhável; mapa, ranking, distribuição, relação entre indicadores e tabela (com CSV do recorte); ficha de cada território com participação, resultado presidencial, posição relativa, composição do eleitorado e abstenção por perfil 2022; comparação de até 4 territórios; modo escuro. Lê `dados/` (gerado por `ferramentas/gera_dados_app.py`). |
| **`/dashboard.html`** | Dashboard anterior, mantido para referência. |
| **`/indicadores.html`** | Todos os indicadores da base como cor, ordenação e filtro, um mapa só. Para varredura rápida. |
| **`/perfis.html`** | Abstenção **por perfil demográfico**. Escolhe-se a dimensão (faixa etária, escolaridade, gênero, estado civil) e o perfil; o mapa mostra a taxa de abstenção daquele perfil em cada município. |
| **`/mudanca.html`** | Margem do 1º turno entre 1º e 2º colocado × votos em jogo × composição do eleitorado. Filtros por margem máxima, mínimo de eleitores e mínimo de escolaridade baixa. |
| **`/abstencao.html`** | Abstenção 2026 por município × densidade de um público-alvo demográfico. |
| **`/rio.html`** | Rio de Janeiro em detalhe: bairro → zona eleitoral → seção (12.809 seções). |

Todos com fundo vetorial próprio (malha do IBGE) — sem serviço de tiles e sem chave de API.

## Acessibilidade

O dashboard e os painéis seguem práticas de acessibilidade verificáveis no próprio código:

- link "pular para o conteúdo", marcos semânticos (`header`, `nav`, `main`, `section` rotuladas)
- todos os controles são nativos (botão, seleção, campo) — funcionam por teclado e leitor de tela
- gráficos em SVG com nome acessível, **e a tabela de dados serve de alternativa textual** aos gráficos
- tabela com `<caption>`, cabeçalhos com `scope` e `aria-sort` na ordenação
- região `aria-live` anunciando o efeito dos filtros
- contraste AA, foco visível, alvos de toque de 44px ou mais, respeito a `prefers-reduced-motion`
- **nenhuma informação depende só de cor** — todo valor aparece em número ao lado

Há um verificador estático no repositório: `python3 a11y_check.py <arquivo.html>`.
Ele não substitui teste com leitor de tela, mas pega as falhas mais comuns.

---

## Bases

### `dados/` — bases do explorador
Geradas por `python3 ferramentas/gera_dados_app.py` a partir de `base_brasil_2026.csv` e
`base_abst_perfil_2022.csv`. Guardam **contagens brutas** por município; estado, região e
Brasil são somados no navegador, então toda taxa é razão de somas. Rode o script de novo
sempre que as bases da raiz mudarem.

### `base_uf_2026.csv` e `base_regiao_2026.csv` — corrigidas em 10/2026
Reconstruídas por `ferramentas/corrige_bases.py` a partir da base municipal. A versão
anterior somava `c1_*`…`c12_*` por posição (o 1º colocado de cada município, fosse quem
fosse) e somava percentuais (Acre: `c1_pct` = 1403); `margem_1o_2o_pts` herdava o erro.
Agora os votos são somados por candidato e reordenados no agregado, e toda taxa é razão
de somas. Contagens (eleitores, comparecimento, perfil) não mudaram.

### `base_brasil_2026.csv` — 5.757 linhas × 117 colunas
Uma linha por município. Fonte: portal oficial de resultados do TSE, eleição 2026
1º turno, totalização final; mais perfil do eleitorado 2026.

Colunas principais:

| Coluna | Significado |
|---|---|
| `uf`, `municipio`, `cod_municipio`, `regiao` | identificação |
| `latitude`, `longitude` | centroide do município (dos locais de votação) |
| `eleitores_aptos` | eleitorado apto |
| `comparecimento`, `abstencoes` | votantes e faltosos |
| `taxa_abstencao`, `taxa_comparecimento` | informadas pelo TSE |
| `pct_abstencao`, `pct_brancos`, `pct_nulos`, `pct_validos` | % sobre eleitores aptos |
| `votos_validos`, `brancos`, `nulos` | contagens do 1º turno |
| `secoes_totalizadas`, `secoes_total` | seções |
| `perfil_total` | eleitorado no perfil 2026 |
| `faixa_*`, `escolaridade_*`, `genero_*`, `estado_civil_*`, `raca_*` | composição do eleitorado (contagens brutas) |
| `c1_*` … `c12_*` | candidatos à Presidência por volume no município (nome, partido, votos, %) |
| `margem_1o_2o_pts` | (votos 1º − votos 2º) ÷ comparecimento, em pontos |

### `base_uf_2026.csv` e `base_regiao_2026.csv`
Os mesmos indicadores agregados por estado (28 linhas) e por região (6 linhas).

### `base_abst_perfil_2022.csv` — 216.507 linhas
Abstenção **por perfil demográfico**, por município. Formato longo:
uma linha por município × dimensão × grupo.
Fonte: TSE, Perfil de Comparecimento e Abstenção **2022, 1º turno**.

| Coluna | Significado |
|---|---|
| `uf`, `cod_municipio`, `municipio` | identificação |
| `dimensao` | faixa_etaria · escolaridade · genero · estado_civil · cor_raca |
| `grupo` | ex.: "21 a 24 anos", "ENSINO MÉDIO COMPLETO", "MASCULINO" |
| `aptos`, `abstencoes`, `taxa_abst` | todas as faixas de idade (inclui voto facultativo) |
| `aptos_obrig`, `abst_obrig`, `taxa_obrig` | **só voto obrigatório — este é o número correto** |

**Use `taxa_obrig`.** A taxa bruta mistura quem tem voto facultativo (16–17, 70 anos ou
mais, analfabeto), o que infla artificialmente a abstenção dos extremos de idade.

### `base_mudanca.csv`, `base_nacional.csv`, `base_rio.csv`
Bases que alimentam os painéis `mudanca`, `abstencao` e `rio`.

---

## Fontes e datas

| Dado | Fonte | Data de referência |
|---|---|---|
| Abstenção, comparecimento, votos, candidatos | TSE — portal oficial de resultados | eleição 2026, 1º turno, totalização final |
| Composição do eleitorado | TSE — perfil do eleitorado 2026 | 2026 |
| Abstenção por perfil demográfico | TSE — perfil de comparecimento e abstenção | 2022, 1º turno |
| Contornos de estados e município | IBGE — malhas territoriais | — |

---

## Limitações — leia antes de usar em decisão

1. **Perfil demográfico é de 2022, não de 2026.** O TSE publica abstenção por
   faixa/escolaridade/gênero até 2022. Para 2026 existe a abstenção geral por município
   (essa é de 2026), mas não aberta por demografia. O painel `/perfis.html` informa isso
   no cabeçalho.

2. **Composição demográfica não prediz voto nem abstenção.** Testado em escala nacional:
   a correlação entre densidade dos perfis e taxa de abstenção é praticamente nula
   (−0,10). Use o perfil para **saber com quem falar e onde ele está**, não como previsão.

3. **Abstenção não é voto recuperável.** Parte de quem falta não vota nem com mobilização
   (mudou de cidade, desencanto, dificuldade de acesso). Qualquer número de "votos
   recuperáveis" é teto teórico, nunca previsão.

4. **Margem não é volatilidade.** Margem apertada indica disputa, não movimento. Comparar
   com 2022 exigiria a série histórica, que este portal do TSE não serve.

5. **Cor/raça é inutilizável.** Predomina "NÃO INFORMADO" (no Rio, 4,7 milhões de 5
   milhões). Por isso foi retirado do painel de perfis.

6. **Cobertura:** 5.569 dos 5.757 municípios têm perfil e coordenada. Os 188 restantes são
   quase todos do exterior (seções no exterior não têm centroide no Brasil).

7. **Comparecimento > válidos + brancos + nulos** em 1.668 municípios (resíduo de 5.246
   votos, provavelmente anulados apurados em separado; o arquivo não os discrimina).

8. **40 localidades no exterior não tiveram votação** (aptos > 0, comparecimento e
   abstenção zerados). O explorador mostra suas taxas em branco, não como 0%.

9. **Distrito Federal não consta** do arquivo de abstenção por perfil 2022.

10. **Serra do Navio (AP) e Fernando de Noronha (PE)** não têm local de votação
   geocodificado; recebem a coordenada da sede municipal.

11. **Alguns municípios têm seções sem dado de abstenção** — são seções criadas após a
   eleição anterior. No Rio são 591 seções e 177.279 eleitores (3,6%), aparecendo marcadas
   no painel `/rio.html`.

---

## Como reproduzir

Bases do repositório, nesta ordem:

```
python3 ferramentas/corrige_bases.py    # agregados UF/região + coordenadas faltantes + dicionário
python3 ferramentas/gera_dados_app.py   # dados/ do explorador
python3 ferramentas/valida_bases.py     # integridade; sai com erro se uma base contradiz outra
```

`valida_bases.py` tem que terminar com **0 erro(s)** antes de publicar. Os avisos que ele
emite são características conhecidas do dado do TSE (listadas também em "Limitações").

Os geradores dos painéis temáticos ficam em `~/contra-desinfo/` (fora do repositório):
`base_final.py`, `abst_perfil_2022.py`, `painel_*.py`, `painel.py` (Rio), `vetorial.py`,
`harness.js`, `publicar.sh`. **Dois cuidados:** o painel antigo agora se chama
`dashboard.html` — se `publicar.sh` ainda escreve `index.html`, ele apaga o explorador; e
se `base_final.py` regerar `base_uf_2026.csv`/`base_regiao_2026.csv`, o erro dos `c*_`
volta. Rode `corrige_bases.py` depois dele, ou corrija a soma lá.
