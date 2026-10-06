# Dicionário de dados — base_brasil_2026.csv

Fonte: TSE. Abstenção/comparecimento/votos: portal oficial de resultados,
eleição 2026 1º turno, por município, totalização final.
Perfil do eleitorado: TSE, perfil do eleitorado 2026, por município.
Coordenada: centroide dos locais de votação do município (TSE 2026).

| coluna | significado |
|---|---|
| uf / municipio / cod_municipio / regiao | identificação |
| latitude / longitude | centroide do município |
| eleitores_aptos | eleitorado apto (TSE) |
| comparecimento | votantes |
| abstencoes | faltosos |
| taxa_abstencao | % de abstenção informada pelo TSE |
| pct_abstencao / pct_brancos / pct_nulos / pct_validos | % sobre eleitores aptos |
| votos_validos / brancos / nulos | contagens do 1º turno |
| secoes_totalizadas / secoes_total | seções |
| perfil_total | eleitorado no perfil 2026 (confere com eleitores_aptos) |
| faixa_* / escolaridade_* / genero_* / estado_civil_* / raca_* | composição do eleitorado (contagens) |
| c1_* .. c12_* | candidatos à Presidência por volume no município (nome, partido, votos, %) |
| margem_1o_2o_pts | diferença 1º−2º colocado ÷ comparecimento, em pontos |

Agregados: base_uf_2026.csv (por UF) e base_regiao_2026.csv (por região).