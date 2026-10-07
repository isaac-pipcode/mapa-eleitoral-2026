# Dicionário de dados

Gerado automaticamente dos próprios arquivos por `gera_dicionario.py`.
Se a base mudar, basta rodar de novo — o dicionário não pode divergir do dado.

## Arquivos

| Arquivo | Grão (uma linha por) | Linhas | Colunas |
|---|---|---|---|
| `base_brasil_2026.csv` | Uma linha por **município** (5.757). | 5.757 | 117 |
| `base_uf_2026.csv` | Uma linha por **estado** (28, incluindo Distrito Federal e exterior). | 28 | 114 |
| `base_regiao_2026.csv` | Uma linha por **região** (6: Norte, Nordeste, Centro-Oeste, Sudeste, Sul, Exterior). | 6 | 113 |
| `base_abst_perfil_2022.csv` | Uma linha por **município × dimensão × grupo** (216.507). Formato longo: pivote pela coluna `dimensao`. | 216.507 | 11 |
| `base_mudanca.csv` | Uma linha por **município** (5.569) com disputa calculável no 1º turno. | 5.569 | 23 |
| `base_nacional.csv` | Uma linha por **município** (5.569) com perfil e coordenada. | 5.569 | 16 |
| `base_rio.csv` | Uma linha por **seção eleitoral** do município do Rio (12.809). | 12.809 | 18 |

---

## `base_brasil_2026.csv`

**Grão:** Uma linha por **município** (5.757).

**Fonte:** TSE — portal oficial de resultados 2026, 1º turno, totalização final; perfil do eleitorado 2026; centroide dos locais de votação.

| Coluna | Tipo | Descrição | Exemplo |
|---|---|---|---|
| `uf` | texto | Sigla do estado | `AC` |
| `municipio` | texto | Nome do município | `ACRELÂNDIA` |
| `cod_municipio` | inteiro | Código do município no TSE | `01120` |
| `regiao` | texto | Região do país | `Norte` |
| `latitude` | decimal | Latitude do centroide do município (média dos locais de votação) | `-10.00163` |
| `longitude` | decimal | Longitude do centroide do município | `-67.02437` |
| `eleitores_aptos` | inteiro | Eleitorado apto no município | `10207` |
| `comparecimento` | inteiro | Quantos compareceram | `8055` |
| `abstencoes` | inteiro | Quantos faltaram | `2152` |
| `taxa_abstencao` | decimal | Taxa de abstenção informada pelo TSE (%) | `21.08` |
| `taxa_comparecimento` | decimal | Taxa de comparecimento informada pelo TSE (%) | `78.92` |
| `votos_validos` | inteiro | Votos válidos no 1º turno | `7791` |
| `brancos` | inteiro | Votos em branco | `56` |
| `nulos` | inteiro | Votos nulos | `208` |
| `secoes_totalizadas` | inteiro | Seções com resultado totalizado | `45` |
| `secoes_total` | inteiro | Número de seções eleitorais | `45` |
| `pct_abstencao` | decimal | Abstenção calculada sobre os eleitores aptos (%) | `21.08` |
| `pct_brancos` | decimal | Votos brancos sobre os eleitores aptos (%) | `0.55` |
| `pct_nulos` | decimal | Votos nulos sobre os eleitores aptos (%) | `2.04` |
| `pct_validos` | decimal | Votos válidos sobre os eleitores aptos (%) | `76.33` |
| `perfil_total` | inteiro | Eleitorado no perfil do TSE 2026 (confere com eleitores_aptos) | `10220` |
| `faixa_100_anos_ou_mais` | inteiro | Eleitores de 100 anos ou mais | `2` |
| `faixa_16_anos` | inteiro | Eleitores de 16 anos | `67` |
| `faixa_17_anos` | inteiro | Eleitores de 17 anos | `143` |
| `faixa_18_anos` | inteiro | Eleitores de 18 anos | `161` |
| `faixa_19_anos` | inteiro | Eleitores de 19 anos | `216` |
| `faixa_20_anos` | inteiro | Eleitores de 20 anos | `249` |
| `faixa_21_a_24_anos` | inteiro | Eleitores de 21 a 24 anos | `896` |
| `faixa_25_a_29_anos` | inteiro | Eleitores de 25 a 29 anos | `1096` |
| `faixa_30_a_34_anos` | inteiro | Eleitores de 30 a 34 anos | `1060` |
| `faixa_35_a_39_anos` | inteiro | Eleitores de 35 a 39 anos | `987` |
| `faixa_40_a_44_anos` | inteiro | Eleitores de 40 a 44 anos | `1016` |
| `faixa_45_a_49_anos` | inteiro | Eleitores de 45 a 49 anos | `989` |
| `faixa_50_a_54_anos` | inteiro | Eleitores de 50 a 54 anos | `807` |
| `faixa_55_a_59_anos` | inteiro | Eleitores de 55 a 59 anos | `685` |
| `faixa_60_a_64_anos` | inteiro | Eleitores de 60 a 64 anos | `591` |
| `faixa_65_a_69_anos` | inteiro | Eleitores de 65 a 69 anos | `464` |
| `faixa_70_a_74_anos` | inteiro | Eleitores de 70 a 74 anos | `355` |
| `faixa_75_a_79_anos` | inteiro | Eleitores de 75 a 79 anos | `225` |
| `faixa_80_a_84_anos` | inteiro | Eleitores de 80 a 84 anos | `125` |
| `faixa_85_a_89_anos` | inteiro | Eleitores de 85 a 89 anos | `56` |
| `faixa_90_a_94_anos` | inteiro | Eleitores de 90 a 94 anos | `25` |
| `faixa_95_a_99_anos` | inteiro | Eleitores de 95 a 99 anos | `5` |
| `faixa_invalida` | inteiro | Eleitores de inválida | `0` |
| `escolaridade_analfabeto` | inteiro | Escolaridade: analfabeto | `845` |
| `escolaridade_ensino_fundamental_completo` | inteiro | Escolaridade: ensino fundamental completo | `606` |
| `escolaridade_ensino_fundamental_incompleto` | inteiro | Escolaridade: ensino fundamental incompleto | `1909` |
| `escolaridade_ensino_medio_completo` | inteiro | Escolaridade: ensino medio completo | `2111` |
| `escolaridade_ensino_medio_incompleto` | inteiro | Escolaridade: ensino medio incompleto | `1833` |
| `escolaridade_le_e_escreve` | inteiro | Escolaridade: lê e escreve | `1990` |
| `escolaridade_nao_informado` | inteiro | Escolaridade: não informado | `0` |
| `escolaridade_superior_completo` | inteiro | Escolaridade: superior completo | `576` |
| `escolaridade_superior_incompleto` | inteiro | Escolaridade: superior incompleto | `350` |
| `genero_feminino` | inteiro | Gênero: feminino | `5101` |
| `genero_masculino` | inteiro | Gênero: masculino | `5119` |
| `genero_nao_informado` | inteiro | Gênero: não informado | `0` |
| `estado_civil_casado` | inteiro | Estado civil: casado | `3361` |
| `estado_civil_divorciado` | inteiro | Estado civil: divorciado | `474` |
| `estado_civil_nao_informado` | inteiro | Estado civil: não informado | `0` |
| `estado_civil_separado_judicialmente` | inteiro | Estado civil: separado judicialmente | `37` |
| `estado_civil_solteiro` | inteiro | Estado civil: solteiro | `6109` |
| `estado_civil_viuvo` | inteiro | Estado civil: viúvo | `239` |
| `raca_amarela` | inteiro | Cor/raça: amarela | `90` |
| `raca_branca` | inteiro | Cor/raça: branca | `669` |
| `raca_indigena` | inteiro | Cor/raça: indígena | `7` |
| `raca_nao_informado` | inteiro | Cor/raça: não informado | `6836` |
| `raca_parda` | inteiro | Cor/raça: parda | `2381` |
| `raca_preta` | inteiro | Cor/raça: preta | `237` |
| `c1_nome` | texto | Nome do 1º colocado mais votado no município (Presidência) | `FLAVIO BOLSONARO` |
| `c1_partido` | texto | Partido do 1º colocado mais votado no município (Presidência) | `PL` |
| `c1_votos` | inteiro | Votos do 1º colocado mais votado no município (Presidência) | `5940` |
| `c1_pct` | decimal | Percentual do 1º colocado | `76.24` |
| `c2_nome` | texto | Nome do 2º colocado mais votado no município (Presidência) | `LULA` |
| `c2_partido` | texto | Partido do 2º colocado mais votado no município (Presidência) | `PT` |
| `c2_votos` | inteiro | Votos do 2º colocado mais votado no município (Presidência) | `1508` |
| `c2_pct` | decimal | Percentual do 2º colocado | `19.36` |
| `c3_nome` | texto | Nome do 3º colocado mais votado no município (Presidência) | `RONALDO CAIADO` |
| `c3_partido` | texto | Partido do 3º colocado mais votado no município (Presidência) | `PSD` |
| `c3_votos` | inteiro | Votos do 3º colocado mais votado no município (Presidência) | `136` |
| `c3_pct` | decimal | Percentual do 3º colocado mais votado no município (Presidência) | `1.75` |
| `c4_nome` | texto | Nome do 4º colocado mais votado no município (Presidência) | `ESCRITOR AUGUSTO CURY` |
| `c4_partido` | texto | Partido do 4º colocado mais votado no município (Presidência) | `AVANTE` |
| `c4_votos` | inteiro | Votos do 4º colocado mais votado no município (Presidência) | `114` |
| `c4_pct` | decimal | Percentual do 4º colocado mais votado no município (Presidência) | `1.46` |
| `c5_nome` | texto | Nome do 5º colocado mais votado no município (Presidência) | `RENAN SANTOS` |
| `c5_partido` | texto | Partido do 5º colocado mais votado no município (Presidência) | `MISSÃO` |
| `c5_votos` | inteiro | Votos do 5º colocado mais votado no município (Presidência) | `85` |
| `c5_pct` | decimal | Percentual do 5º colocado mais votado no município (Presidência) | `1.09` |
| `c6_nome` | texto | Nome do 6º colocado mais votado no município (Presidência) | `ZEMA` |
| `c6_partido` | texto | Partido do 6º colocado mais votado no município (Presidência) | `NOVO` |
| `c6_votos` | inteiro | Votos do 6º colocado mais votado no município (Presidência) | `3` |
| `c6_pct` | decimal | Percentual do 6º colocado mais votado no município (Presidência) | `0.04` |
| `c7_nome` | texto | Nome do 7º colocado mais votado no município (Presidência) | `CLARIANA BARAO` |
| `c7_partido` | texto | Partido do 7º colocado mais votado no município (Presidência) | `DC` |
| `c7_votos` | inteiro | Votos do 7º colocado mais votado no município (Presidência) | `2` |
| `c7_pct` | decimal | Percentual do 7º colocado mais votado no município (Presidência) | `0.03` |
| `c8_nome` | texto | Nome do 8º colocado mais votado no município (Presidência) | `SAMARA` |
| `c8_partido` | texto | Partido do 8º colocado mais votado no município (Presidência) | `UP` |
| `c8_votos` | inteiro | Votos do 8º colocado mais votado no município (Presidência) | `2` |
| `c8_pct` | decimal | Percentual do 8º colocado mais votado no município (Presidência) | `0.03` |
| `c9_nome` | texto | Nome do 9º colocado mais votado no município (Presidência) | `HERTZ DIAS` |
| `c9_partido` | texto | Partido do 9º colocado mais votado no município (Presidência) | `PSTU` |
| `c9_votos` | inteiro | Votos do 9º colocado mais votado no município (Presidência) | `1` |
| `c9_pct` | decimal | Percentual do 9º colocado mais votado no município (Presidência) | `0.01` |
| `c10_nome` | texto | Nome do 10º colocado mais votado no município (Presidência) | `EDMILSON COSTA` |
| `c10_partido` | texto | Partido do 10º colocado mais votado no município (Presidência) | `PCB` |
| `c10_votos` | inteiro | Votos do 10º colocado mais votado no município (Presidência) | `0` |
| `c10_pct` | decimal | Percentual do 10º colocado mais votado no município (Presidência) | `0.0` |
| `c11_nome` | texto | Nome do 11º colocado mais votado no município (Presidência) | `VETERINÁRIO WILSON GRASSI` |
| `c11_partido` | texto | Partido do 11º colocado mais votado no município (Presidência) | `DEMOCRATA` |
| `c11_votos` | inteiro | Votos do 11º colocado mais votado no município (Presidência) | `0` |
| `c11_pct` | decimal | Percentual do 11º colocado mais votado no município (Presidência) | `0.0` |
| `c12_nome` | texto | Nome do 12º colocado mais votado no município (Presidência) | `RUI COSTA PIMENTA` |
| `c12_partido` | texto | Partido do 12º colocado mais votado no município (Presidência) | `PCO` |
| `c12_votos` | inteiro | Votos do 12º colocado mais votado no município (Presidência) | `0` |
| `c12_pct` | decimal | Percentual do 12º colocado mais votado no município (Presidência) | `0.0` |
| `margem_1o_2o_pts` | decimal | Diferença entre 1º e 2º colocado, em pontos do comparecimento | `55.02` |

## `base_uf_2026.csv`

**Grão:** Uma linha por **estado** (27 UFs + ZZ, seções no exterior).

**Fonte:** Somatório da base por município (`ferramentas/corrige_bases.py`). Contagens somadas; taxas recalculadas como razão das somas; candidatos somados por nome e reordenados no agregado.

| Coluna | Tipo | Descrição | Exemplo |
|---|---|---|---|
| `uf` | texto | Sigla do estado (ZZ = seções no exterior) | `AC` |
| `regiao` | texto | Região do país | `Norte` |
| `n_municipios` | inteiro | Quantos municípios (ou localidades no exterior) entram no agregado | `22` |
| `eleitores_aptos` | inteiro | Eleitorado apto no município (soma dos municípios) | `613742` |
| `comparecimento` | inteiro | Quantos compareceram (soma dos municípios) | `488330` |
| `abstencoes` | inteiro | Quantos faltaram (soma dos municípios) | `125412` |
| `taxa_abstencao` | decimal | Taxa de abstenção recalculada: razão das somas (%) | `20.43` |
| `taxa_comparecimento` | decimal | Taxa de comparecimento recalculada: razão das somas (%) | `79.57` |
| `votos_validos` | inteiro | Votos válidos no 1º turno (soma dos municípios) | `469066` |
| `brancos` | inteiro | Votos em branco (soma dos municípios) | `5579` |
| `nulos` | inteiro | Votos nulos (soma dos municípios) | `13662` |
| `secoes_totalizadas` | inteiro | Seções com resultado totalizado (soma dos municípios) | `2270` |
| `secoes_total` | inteiro | Número de seções eleitorais (soma dos municípios) | `2270` |
| `pct_abstencao` | decimal | Abstenção calculada sobre os eleitores aptos (%) | `20.43` |
| `pct_brancos` | decimal | Votos brancos sobre os eleitores aptos (%) | `0.91` |
| `pct_nulos` | decimal | Votos nulos sobre os eleitores aptos (%) | `2.23` |
| `pct_validos` | decimal | Votos válidos sobre os eleitores aptos (%) | `76.43` |
| `perfil_total` | inteiro | Eleitorado no perfil do TSE 2026 (confere com eleitores_aptos) (soma dos municípios) | `614375` |
| `faixa_100_anos_ou_mais` | inteiro | Eleitores de 100 anos ou mais (soma dos municípios) | `225` |
| `faixa_16_anos` | inteiro | Eleitores de 16 anos (soma dos municípios) | `5374` |
| `faixa_17_anos` | inteiro | Eleitores de 17 anos (soma dos municípios) | `8690` |
| `faixa_18_anos` | inteiro | Eleitores de 18 anos (soma dos municípios) | `12179` |
| `faixa_19_anos` | inteiro | Eleitores de 19 anos (soma dos municípios) | `13500` |
| `faixa_20_anos` | inteiro | Eleitores de 20 anos (soma dos municípios) | `14159` |
| `faixa_21_a_24_anos` | inteiro | Eleitores de 21 a 24 anos (soma dos municípios) | `58650` |
| `faixa_25_a_29_anos` | inteiro | Eleitores de 25 a 29 anos (soma dos municípios) | `73320` |
| `faixa_30_a_34_anos` | inteiro | Eleitores de 30 a 34 anos (soma dos municípios) | `66535` |
| `faixa_35_a_39_anos` | inteiro | Eleitores de 35 a 39 anos (soma dos municípios) | `61286` |
| `faixa_40_a_44_anos` | inteiro | Eleitores de 40 a 44 anos (soma dos municípios) | `61740` |
| `faixa_45_a_49_anos` | inteiro | Eleitores de 45 a 49 anos (soma dos municípios) | `57218` |
| `faixa_50_a_54_anos` | inteiro | Eleitores de 50 a 54 anos (soma dos municípios) | `45954` |
| `faixa_55_a_59_anos` | inteiro | Eleitores de 55 a 59 anos (soma dos municípios) | `37963` |
| `faixa_60_a_64_anos` | inteiro | Eleitores de 60 a 64 anos (soma dos municípios) | `30709` |
| `faixa_65_a_69_anos` | inteiro | Eleitores de 65 a 69 anos (soma dos municípios) | `23435` |
| `faixa_70_a_74_anos` | inteiro | Eleitores de 70 a 74 anos (soma dos municípios) | `17979` |
| `faixa_75_a_79_anos` | inteiro | Eleitores de 75 a 79 anos (soma dos municípios) | `12007` |
| `faixa_80_a_84_anos` | inteiro | Eleitores de 80 a 84 anos (soma dos municípios) | `7142` |
| `faixa_85_a_89_anos` | inteiro | Eleitores de 85 a 89 anos (soma dos municípios) | `3962` |
| `faixa_90_a_94_anos` | inteiro | Eleitores de 90 a 94 anos (soma dos municípios) | `1660` |
| `faixa_95_a_99_anos` | inteiro | Eleitores de 95 a 99 anos (soma dos municípios) | `680` |
| `faixa_invalida` | inteiro | Eleitores de inválida (soma dos municípios) | `8` |
| `escolaridade_analfabeto` | inteiro | Escolaridade: analfabeto (soma dos municípios) | `45287` |
| `escolaridade_ensino_fundamental_completo` | inteiro | Escolaridade: ensino fundamental completo (soma dos municípios) | `28753` |
| `escolaridade_ensino_fundamental_incompleto` | inteiro | Escolaridade: ensino fundamental incompleto (soma dos municípios) | `117595` |
| `escolaridade_ensino_medio_completo` | inteiro | Escolaridade: ensino medio completo (soma dos municípios) | `148077` |
| `escolaridade_ensino_medio_incompleto` | inteiro | Escolaridade: ensino medio incompleto (soma dos municípios) | `124375` |
| `escolaridade_le_e_escreve` | inteiro | Escolaridade: lê e escreve (soma dos municípios) | `54507` |
| `escolaridade_nao_informado` | inteiro | Escolaridade: não informado (soma dos municípios) | `0` |
| `escolaridade_superior_completo` | inteiro | Escolaridade: superior completo (soma dos municípios) | `58615` |
| `escolaridade_superior_incompleto` | inteiro | Escolaridade: superior incompleto (soma dos municípios) | `37166` |
| `genero_feminino` | inteiro | Gênero: feminino (soma dos municípios) | `317234` |
| `genero_masculino` | inteiro | Gênero: masculino (soma dos municípios) | `297141` |
| `genero_nao_informado` | inteiro | Gênero: não informado (soma dos municípios) | `0` |
| `estado_civil_casado` | inteiro | Estado civil: casado (soma dos municípios) | `144125` |
| `estado_civil_divorciado` | inteiro | Estado civil: divorciado (soma dos municípios) | `20576` |
| `estado_civil_nao_informado` | inteiro | Estado civil: não informado (soma dos municípios) | `0` |
| `estado_civil_separado_judicialmente` | inteiro | Estado civil: separado judicialmente (soma dos municípios) | `2244` |
| `estado_civil_solteiro` | inteiro | Estado civil: solteiro (soma dos municípios) | `435057` |
| `estado_civil_viuvo` | inteiro | Estado civil: viúvo (soma dos municípios) | `12373` |
| `raca_amarela` | inteiro | Cor/raça: amarela (soma dos municípios) | `988` |
| `raca_branca` | inteiro | Cor/raça: branca (soma dos municípios) | `25718` |
| `raca_indigena` | inteiro | Cor/raça: indígena (soma dos municípios) | `7685` |
| `raca_nao_informado` | inteiro | Cor/raça: não informado (soma dos municípios) | `437423` |
| `raca_parda` | inteiro | Cor/raça: parda (soma dos municípios) | `127894` |
| `raca_preta` | inteiro | Cor/raça: preta (soma dos municípios) | `14667` |
| `c1_nome` | texto | Nome do 1º candidato mais votado no estado (Presidência) | `FLAVIO BOLSONARO` |
| `c1_partido` | texto | Partido do 1º candidato mais votado no estado | `PL` |
| `c1_votos` | inteiro | Votos do 1º candidato mais votado no estado, somados por candidato | `302807` |
| `c1_pct` | decimal | Votos do 1º candidato sobre os votos válidos no estado (%) | `64.56` |
| `c2_nome` | texto | Nome do 2º candidato mais votado no estado (Presidência) | `LULA` |
| `c2_partido` | texto | Partido do 2º candidato mais votado no estado | `PT` |
| `c2_votos` | inteiro | Votos do 2º candidato mais votado no estado, somados por candidato | `134770` |
| `c2_pct` | decimal | Votos do 2º candidato sobre os votos válidos no estado (%) | `28.73` |
| `c3_nome` | texto | Nome do 3º candidato mais votado no estado (Presidência) | `ESCRITOR AUGUSTO CURY` |
| `c3_partido` | texto | Partido do 3º candidato mais votado no estado | `AVANTE` |
| `c3_votos` | inteiro | Votos do 3º candidato mais votado no estado, somados por candidato | `13523` |
| `c3_pct` | decimal | Votos do 3º candidato sobre os votos válidos no estado (%) | `2.88` |
| `c4_nome` | texto | Nome do 4º candidato mais votado no estado (Presidência) | `RONALDO CAIADO` |
| `c4_partido` | texto | Partido do 4º candidato mais votado no estado | `PSD` |
| `c4_votos` | inteiro | Votos do 4º candidato mais votado no estado, somados por candidato | `8594` |
| `c4_pct` | decimal | Votos do 4º candidato sobre os votos válidos no estado (%) | `1.83` |
| `c5_nome` | texto | Nome do 5º candidato mais votado no estado (Presidência) | `RENAN SANTOS` |
| `c5_partido` | texto | Partido do 5º candidato mais votado no estado | `MISSÃO` |
| `c5_votos` | inteiro | Votos do 5º candidato mais votado no estado, somados por candidato | `7980` |
| `c5_pct` | decimal | Votos do 5º candidato sobre os votos válidos no estado (%) | `1.7` |
| `c6_nome` | texto | Nome do 6º candidato mais votado no estado (Presidência) | `ZEMA` |
| `c6_partido` | texto | Partido do 6º candidato mais votado no estado | `NOVO` |
| `c6_votos` | inteiro | Votos do 6º candidato mais votado no estado, somados por candidato | `573` |
| `c6_pct` | decimal | Votos do 6º candidato sobre os votos válidos no estado (%) | `0.12` |
| `c7_nome` | texto | Nome do 7º candidato mais votado no estado (Presidência) | `SAMARA` |
| `c7_partido` | texto | Partido do 7º candidato mais votado no estado | `UP` |
| `c7_votos` | inteiro | Votos do 7º candidato mais votado no estado, somados por candidato | `314` |
| `c7_pct` | decimal | Votos do 7º candidato sobre os votos válidos no estado (%) | `0.07` |
| `c8_nome` | texto | Nome do 8º candidato mais votado no estado (Presidência) | `CLARIANA BARAO` |
| `c8_partido` | texto | Partido do 8º candidato mais votado no estado | `DC` |
| `c8_votos` | inteiro | Votos do 8º candidato mais votado no estado, somados por candidato | `215` |
| `c8_pct` | decimal | Votos do 8º candidato sobre os votos válidos no estado (%) | `0.05` |
| `c9_nome` | texto | Nome do 9º candidato mais votado no estado (Presidência) | `EDMILSON COSTA` |
| `c9_partido` | texto | Partido do 9º candidato mais votado no estado | `PCB` |
| `c9_votos` | inteiro | Votos do 9º candidato mais votado no estado, somados por candidato | `140` |
| `c9_pct` | decimal | Votos do 9º candidato sobre os votos válidos no estado (%) | `0.03` |
| `c10_nome` | texto | Nome do 10º candidato mais votado no estado (Presidência) | `HERTZ DIAS` |
| `c10_partido` | texto | Partido do 10º candidato mais votado no estado | `PSTU` |
| `c10_votos` | inteiro | Votos do 10º candidato mais votado no estado, somados por candidato | `71` |
| `c10_pct` | decimal | Votos do 10º candidato sobre os votos válidos no estado (%) | `0.02` |
| `c11_nome` | texto | Nome do 11º candidato mais votado no estado (Presidência) | `RUI COSTA PIMENTA` |
| `c11_partido` | texto | Partido do 11º candidato mais votado no estado | `PCO` |
| `c11_votos` | inteiro | Votos do 11º candidato mais votado no estado, somados por candidato | `40` |
| `c11_pct` | decimal | Votos do 11º candidato sobre os votos válidos no estado (%) | `0.01` |
| `c12_nome` | texto | Nome do 12º candidato mais votado no estado (Presidência) | `VETERINÁRIO WILSON GRASSI` |
| `c12_partido` | texto | Partido do 12º candidato mais votado no estado | `DEMOCRATA` |
| `c12_votos` | inteiro | Votos do 12º candidato mais votado no estado, somados por candidato | `39` |
| `c12_pct` | decimal | Votos do 12º candidato sobre os votos válidos no estado (%) | `0.01` |
| `margem_1o_2o_pts` | decimal | (votos do 1º − votos do 2º no estado) ÷ comparecimento, em pontos | `34.41` |

## `base_regiao_2026.csv`

**Grão:** Uma linha por **região** (Norte, Nordeste, Centro-Oeste, Sudeste, Sul, Exterior).

**Fonte:** Somatório da base por município (`ferramentas/corrige_bases.py`). Contagens somadas; taxas recalculadas como razão das somas; candidatos somados por nome e reordenados no agregado.

| Coluna | Tipo | Descrição | Exemplo |
|---|---|---|---|
| `regiao` | texto | Região do país | `Norte` |
| `n_municipios` | inteiro | Quantos municípios (ou localidades no exterior) entram no agregado | `450` |
| `eleitores_aptos` | inteiro | Eleitorado apto no município (soma dos municípios) | `13101175` |
| `comparecimento` | inteiro | Quantos compareceram (soma dos municípios) | `10554993` |
| `abstencoes` | inteiro | Quantos faltaram (soma dos municípios) | `2546182` |
| `taxa_abstencao` | decimal | Taxa de abstenção recalculada: razão das somas (%) | `19.43` |
| `taxa_comparecimento` | decimal | Taxa de comparecimento recalculada: razão das somas (%) | `80.57` |
| `votos_validos` | inteiro | Votos válidos no 1º turno (soma dos municípios) | `10191910` |
| `brancos` | inteiro | Votos em branco (soma dos municípios) | `109407` |
| `nulos` | inteiro | Votos nulos (soma dos municípios) | `253263` |
| `secoes_totalizadas` | inteiro | Seções com resultado totalizado (soma dos municípios) | `43769` |
| `secoes_total` | inteiro | Número de seções eleitorais (soma dos municípios) | `43769` |
| `pct_abstencao` | decimal | Abstenção calculada sobre os eleitores aptos (%) | `19.43` |
| `pct_brancos` | decimal | Votos brancos sobre os eleitores aptos (%) | `0.84` |
| `pct_nulos` | decimal | Votos nulos sobre os eleitores aptos (%) | `1.93` |
| `pct_validos` | decimal | Votos válidos sobre os eleitores aptos (%) | `77.79` |
| `perfil_total` | inteiro | Eleitorado no perfil do TSE 2026 (confere com eleitores_aptos) (soma dos municípios) | `13109354` |
| `faixa_100_anos_ou_mais` | inteiro | Eleitores de 100 anos ou mais (soma dos municípios) | `4302` |
| `faixa_16_anos` | inteiro | Eleitores de 16 anos (soma dos municípios) | `93217` |
| `faixa_17_anos` | inteiro | Eleitores de 17 anos (soma dos municípios) | `152919` |
| `faixa_18_anos` | inteiro | Eleitores de 18 anos (soma dos municípios) | `231934` |
| `faixa_19_anos` | inteiro | Eleitores de 19 anos (soma dos municípios) | `261728` |
| `faixa_20_anos` | inteiro | Eleitores de 20 anos (soma dos municípios) | `281175` |
| `faixa_21_a_24_anos` | inteiro | Eleitores de 21 a 24 anos (soma dos municípios) | `1160344` |
| `faixa_25_a_29_anos` | inteiro | Eleitores de 25 a 29 anos (soma dos municípios) | `1476661` |
| `faixa_30_a_34_anos` | inteiro | Eleitores de 30 a 34 anos (soma dos municípios) | `1424804` |
| `faixa_35_a_39_anos` | inteiro | Eleitores de 35 a 39 anos (soma dos municípios) | `1331324` |
| `faixa_40_a_44_anos` | inteiro | Eleitores de 40 a 44 anos (soma dos municípios) | `1350842` |
| `faixa_45_a_49_anos` | inteiro | Eleitores de 45 a 49 anos (soma dos municípios) | `1229158` |
| `faixa_50_a_54_anos` | inteiro | Eleitores de 50 a 54 anos (soma dos municípios) | `1020869` |
| `faixa_55_a_59_anos` | inteiro | Eleitores de 55 a 59 anos (soma dos municípios) | `854681` |
| `faixa_60_a_64_anos` | inteiro | Eleitores de 60 a 64 anos (soma dos municípios) | `714619` |
| `faixa_65_a_69_anos` | inteiro | Eleitores de 65 a 69 anos (soma dos municípios) | `552612` |
| `faixa_70_a_74_anos` | inteiro | Eleitores de 70 a 74 anos (soma dos municípios) | `413846` |
| `faixa_75_a_79_anos` | inteiro | Eleitores de 75 a 79 anos (soma dos municípios) | `271184` |
| `faixa_80_a_84_anos` | inteiro | Eleitores de 80 a 84 anos (soma dos municípios) | `158190` |
| `faixa_85_a_89_anos` | inteiro | Eleitores de 85 a 89 anos (soma dos municípios) | `81111` |
| `faixa_90_a_94_anos` | inteiro | Eleitores de 90 a 94 anos (soma dos municípios) | `32972` |
| `faixa_95_a_99_anos` | inteiro | Eleitores de 95 a 99 anos (soma dos municípios) | `10754` |
| `faixa_invalida` | inteiro | Eleitores de inválida (soma dos municípios) | `108` |
| `escolaridade_analfabeto` | inteiro | Escolaridade: analfabeto (soma dos municípios) | `553096` |
| `escolaridade_ensino_fundamental_completo` | inteiro | Escolaridade: ensino fundamental completo (soma dos municípios) | `665474` |
| `escolaridade_ensino_fundamental_incompleto` | inteiro | Escolaridade: ensino fundamental incompleto (soma dos municípios) | `2914882` |
| `escolaridade_ensino_medio_completo` | inteiro | Escolaridade: ensino medio completo (soma dos municípios) | `3645179` |
| `escolaridade_ensino_medio_incompleto` | inteiro | Escolaridade: ensino medio incompleto (soma dos municípios) | `2576433` |
| `escolaridade_le_e_escreve` | inteiro | Escolaridade: lê e escreve (soma dos municípios) | `921904` |
| `escolaridade_nao_informado` | inteiro | Escolaridade: não informado (soma dos municípios) | `15` |
| `escolaridade_superior_completo` | inteiro | Escolaridade: superior completo (soma dos municípios) | `1129808` |
| `escolaridade_superior_incompleto` | inteiro | Escolaridade: superior incompleto (soma dos municípios) | `702563` |
| `genero_feminino` | inteiro | Gênero: feminino (soma dos municípios) | `6694588` |
| `genero_masculino` | inteiro | Gênero: masculino (soma dos municípios) | `6414759` |
| `genero_nao_informado` | inteiro | Gênero: não informado (soma dos municípios) | `7` |
| `estado_civil_casado` | inteiro | Estado civil: casado (soma dos municípios) | `3055695` |
| `estado_civil_divorciado` | inteiro | Estado civil: divorciado (soma dos municípios) | `374003` |
| `estado_civil_nao_informado` | inteiro | Estado civil: não informado (soma dos municípios) | `27` |
| `estado_civil_separado_judicialmente` | inteiro | Estado civil: separado judicialmente (soma dos municípios) | `60470` |
| `estado_civil_solteiro` | inteiro | Estado civil: solteiro (soma dos municípios) | `9366527` |
| `estado_civil_viuvo` | inteiro | Estado civil: viúvo (soma dos municípios) | `252632` |
| `raca_amarela` | inteiro | Cor/raça: amarela (soma dos municípios) | `19604` |
| `raca_branca` | inteiro | Cor/raça: branca (soma dos municípios) | `555406` |
| `raca_indigena` | inteiro | Cor/raça: indígena (soma dos municípios) | `136978` |
| `raca_nao_informado` | inteiro | Cor/raça: não informado (soma dos municípios) | `9150542` |
| `raca_parda` | inteiro | Cor/raça: parda (soma dos municípios) | `2907788` |
| `raca_preta` | inteiro | Cor/raça: preta (soma dos municípios) | `339036` |
| `c1_nome` | texto | Nome do 1º candidato mais votado na região (Presidência) | `FLAVIO BOLSONARO` |
| `c1_partido` | texto | Partido do 1º candidato mais votado na região | `PL` |
| `c1_votos` | inteiro | Votos do 1º candidato mais votado na região, somados por candidato | `5009437` |
| `c1_pct` | decimal | Votos do 1º candidato sobre os votos válidos na região (%) | `49.15` |
| `c2_nome` | texto | Nome do 2º candidato mais votado na região (Presidência) | `LULA` |
| `c2_partido` | texto | Partido do 2º candidato mais votado na região | `PT` |
| `c2_votos` | inteiro | Votos do 2º candidato mais votado na região, somados por candidato | `4550602` |
| `c2_pct` | decimal | Votos do 2º candidato sobre os votos válidos na região (%) | `44.65` |
| `c3_nome` | texto | Nome do 3º candidato mais votado na região (Presidência) | `ESCRITOR AUGUSTO CURY` |
| `c3_partido` | texto | Partido do 3º candidato mais votado na região | `AVANTE` |
| `c3_votos` | inteiro | Votos do 3º candidato mais votado na região, somados por candidato | `291576` |
| `c3_pct` | decimal | Votos do 3º candidato sobre os votos válidos na região (%) | `2.86` |
| `c4_nome` | texto | Nome do 4º candidato mais votado na região (Presidência) | `RENAN SANTOS` |
| `c4_partido` | texto | Partido do 4º candidato mais votado na região | `MISSÃO` |
| `c4_votos` | inteiro | Votos do 4º candidato mais votado na região, somados por candidato | `177691` |
| `c4_pct` | decimal | Votos do 4º candidato sobre os votos válidos na região (%) | `1.74` |
| `c5_nome` | texto | Nome do 5º candidato mais votado na região (Presidência) | `RONALDO CAIADO` |
| `c5_partido` | texto | Partido do 5º candidato mais votado na região | `PSD` |
| `c5_votos` | inteiro | Votos do 5º candidato mais votado na região, somados por candidato | `137956` |
| `c5_pct` | decimal | Votos do 5º candidato sobre os votos válidos na região (%) | `1.35` |
| `c6_nome` | texto | Nome do 6º candidato mais votado na região (Presidência) | `SAMARA` |
| `c6_partido` | texto | Partido do 6º candidato mais votado na região | `UP` |
| `c6_votos` | inteiro | Votos do 6º candidato mais votado na região, somados por candidato | `8031` |
| `c6_pct` | decimal | Votos do 6º candidato sobre os votos válidos na região (%) | `0.08` |
| `c7_nome` | texto | Nome do 7º candidato mais votado na região (Presidência) | `ZEMA` |
| `c7_partido` | texto | Partido do 7º candidato mais votado na região | `NOVO` |
| `c7_votos` | inteiro | Votos do 7º candidato mais votado na região, somados por candidato | `8009` |
| `c7_pct` | decimal | Votos do 7º candidato sobre os votos válidos na região (%) | `0.08` |
| `c8_nome` | texto | Nome do 8º candidato mais votado na região (Presidência) | `CLARIANA BARAO` |
| `c8_partido` | texto | Partido do 8º candidato mais votado na região | `DC` |
| `c8_votos` | inteiro | Votos do 8º candidato mais votado na região, somados por candidato | `3361` |
| `c8_pct` | decimal | Votos do 8º candidato sobre os votos válidos na região (%) | `0.03` |
| `c9_nome` | texto | Nome do 9º candidato mais votado na região (Presidência) | `HERTZ DIAS` |
| `c9_partido` | texto | Partido do 9º candidato mais votado na região | `PSTU` |
| `c9_votos` | inteiro | Votos do 9º candidato mais votado na região, somados por candidato | `2040` |
| `c9_pct` | decimal | Votos do 9º candidato sobre os votos válidos na região (%) | `0.02` |
| `c10_nome` | texto | Nome do 10º candidato mais votado na região (Presidência) | `EDMILSON COSTA` |
| `c10_partido` | texto | Partido do 10º candidato mais votado na região | `PCB` |
| `c10_votos` | inteiro | Votos do 10º candidato mais votado na região, somados por candidato | `1460` |
| `c10_pct` | decimal | Votos do 10º candidato sobre os votos válidos na região (%) | `0.01` |
| `c11_nome` | texto | Nome do 11º candidato mais votado na região (Presidência) | `VETERINÁRIO WILSON GRASSI` |
| `c11_partido` | texto | Partido do 11º candidato mais votado na região | `DEMOCRATA` |
| `c11_votos` | inteiro | Votos do 11º candidato mais votado na região, somados por candidato | `1026` |
| `c11_pct` | decimal | Votos do 11º candidato sobre os votos válidos na região (%) | `0.01` |
| `c12_nome` | texto | Nome do 12º candidato mais votado na região (Presidência) | `RUI COSTA PIMENTA` |
| `c12_partido` | texto | Partido do 12º candidato mais votado na região | `PCO` |
| `c12_votos` | inteiro | Votos do 12º candidato mais votado na região, somados por candidato | `721` |
| `c12_pct` | decimal | Votos do 12º candidato sobre os votos válidos na região (%) | `0.01` |
| `margem_1o_2o_pts` | decimal | (votos do 1º − votos do 2º na região) ÷ comparecimento, em pontos | `4.35` |

## `base_abst_perfil_2022.csv`

**Grão:** Uma linha por **município × dimensão × grupo** (216.507). Formato longo: pivote pela coluna `dimensao`.

**Fonte:** TSE — Perfil de Comparecimento e Abstenção 2022, **1º turno**. É a base mais recente de abstenção aberta por demografia que o TSE publica.

| Coluna | Tipo | Descrição | Exemplo |
|---|---|---|---|
| `uf` | texto | Sigla do estado | `AC` |
| `cod_municipio` | inteiro | Código do município no TSE | `01007` |
| `municipio` | texto | Nome do município | `BUJARI` |
| `dimensao` | texto | Dimensão demográfica: faixa_etaria, escolaridade, genero, estado_civil ou cor_raca | `faixa_etaria` |
| `grupo` | texto | Valor dentro da dimensão (ex.: “21 a 24 anos”) | `16 anos` |
| `aptos` | inteiro | Eleitores aptos no grupo (inclui quem tem voto facultativo) | `69` |
| `abstencoes` | inteiro | Quantos faltaram | `11` |
| `taxa_abst` | decimal | Abstenção no grupo sobre todos os aptos (%) — **mistura voto facultativo; prefira taxa_obrig** | `15.94` |
| `aptos_obrig` | inteiro | Aptos no grupo considerando **só o voto obrigatório** | `0` |
| `abst_obrig` | inteiro | Abstenções no grupo no voto obrigatório | `0` |
| `taxa_obrig` | decimal | Abstenção no grupo no **voto obrigatório (%)** — este é o número correto | `0.0` |

## `base_mudanca.csv`

**Grão:** Uma linha por **município** (5.569) com disputa calculável no 1º turno.

**Fonte:** TSE — resultados 2026, 1º turno, Presidência.

| Coluna | Tipo | Descrição | Exemplo |
|---|---|---|---|
| `uf` | texto | Sigla do estado | `ac` |
| `nome` | texto | Nome do município | `ACRELÂNDIA` |
| `ufnome` | texto | Nome do estado | `Acre` |
| `regiao` | texto | Região do país | `Norte` |
| `lat` | decimal | lat | `-10.00163` |
| `lon` | decimal | lon | `-67.02437` |
| `eleitores` | inteiro | Eleitores aptos | `10207` |
| `abst_taxa` | decimal | Taxa de abstenção (%) | `21.08` |
| `brancos_nulos` | inteiro | Brancos mais nulos | `208` |
| `secoes` | inteiro | Seções eleitorais | `45` |
| `c1` | texto | Nome do 1º colocado | `FLAVIO BOLSONARO` |
| `c1p` | texto | Partido do 1º colocado | `PL` |
| `c1v` | inteiro | Votos do 1º colocado | `5940` |
| `c1pct` | decimal | Percentual do 1º colocado | `76,24` |
| `c2` | texto | Nome do 2º colocado | `LULA` |
| `c2p` | texto | Partido do 2º colocado | `PT` |
| `c2v` | inteiro | Votos do 2º colocado | `1508` |
| `c2pct` | decimal | Percentual do 2º colocado | `19,36` |
| `margem` | decimal | Margem entre 1º e 2º colocado, em pontos | `55.02` |
| `votos_em_jogo` | inteiro | Votos do 2º colocado — estoque mínimo a virar para inverter | `1508` |
| `p21` | decimal | Percentual de 21 a 34 anos | `29.9` |
| `pesc` | decimal | Percentual com escolaridade baixa | `52.3` |
| `pmas` | decimal | Percentual de homens | `50.1` |

## `base_nacional.csv`

**Grão:** Uma linha por **município** (5.569) com perfil e coordenada.

**Fonte:** TSE — abstenção 2026 e perfil do eleitorado 2026.

| Coluna | Tipo | Descrição | Exemplo |
|---|---|---|---|
| `uf` | texto | Sigla do estado | `ac` |
| `mu` | inteiro | mu | `01120` |
| `nome` | texto | Nome do município | `ACRELÂNDIA` |
| `ufnome` | texto | Nome do estado | `Acre` |
| `regiao` | texto | Região do país | `Norte` |
| `lat` | decimal | lat | `-10.00163` |
| `lon` | decimal | lon | `-67.02437` |
| `eleitores` | inteiro | Eleitores aptos | `10207` |
| `abstencao` | inteiro | abstencao | `2152` |
| `taxa_abst` | decimal | Abstenção no grupo sobre todos os aptos (%) — **mistura voto facultativo; prefira taxa_obrig** | `21.08` |
| `secoes` | inteiro | Seções eleitorais | `45` |
| `pct_21_34` | decimal | pct 21 34 | `29.9` |
| `pct_escol_baixa` | decimal | pct escol baixa | `52.3` |
| `pct_masculino` | decimal | pct masculino | `50.1` |
| `densidade_alvo` | decimal | Densidade do público-alvo (média geométrica de p21, pesc e pmas) | `0.428` |
| `votos_recuperaveis` | decimal | Estimativa da [métrica NÃO validada nacionalmente]: eleitores × abstenção × densidade do alvo | `921.0` |

## `base_rio.csv`

**Grão:** Uma linha por **seção eleitoral** do município do Rio (12.809).

**Fonte:** TSE — perfil do eleitorado 2026 e locais de votação 2026.

| Coluna | Tipo | Descrição | Exemplo |
|---|---|---|---|
| `zona` | inteiro | zona | `10` |
| `secao` | inteiro | secao | `329` |
| `bairro` | texto | bairro | `Oswaldo Cruz` |
| `local` | texto | local | `ESCOLA MUNICIPAL WALDEMAR FALCÃO` |
| `endereco` | texto | endereco | `PRACA JAGUARÉ,  53` |
| `cep` | inteiro | cep | `21340420` |
| `lat` | decimal | lat | `-22.8758206` |
| `lon` | decimal | lon | `-43.3551757` |
| `eleitores_2026` | inteiro | eleitores 2026 | `385` |
| `aptos_2024` | inteiro | aptos 2024 | `401` |
| `abstencoes_2024` | inteiro | abstencoes 2024 | `132` |
| `taxa_abst_2024` | decimal | taxa abst 2024 | `32.9` |
| `pct_21_34` | decimal | pct 21 34 | `20.5` |
| `pct_escol_baixa` | decimal | pct escol baixa | `32.7` |
| `pct_masculino` | decimal | pct masculino | `39.2` |
| `tem_abstencao_2024` | texto | tem abstencao 2024 | `sim` |
| `votos_recuperaveis` | decimal | Estimativa da [métrica NÃO validada nacionalmente]: eleitores × abstenção × densidade do alvo | `39.3` |
| `densidade_alvo` | decimal | Densidade do público-alvo (média geométrica de p21, pesc e pmas) | `0.298` |

---

## Limitações que afetam a leitura

1. **Perfil demográfico é de 2022.** É a base mais recente de abstenção aberta por demografia que o TSE publica. Para 2026 existe a abstenção geral por município (essa é de 2026), mas não aberta por idade, escolaridade ou gênero.

2. **Composição demográfica não prediz voto nem abstenção.** Testado em escala nacional, a correlação entre densidade dos perfis e abstenção é praticamente nula (−0,10). O perfil serve para saber **com quem falar e onde esse perfil está**, não como previsão.

3. **Abstenção não é voto recuperável.** Parte de quem falta não vota nem com mobilização. Qualquer número derivado é teto teórico, nunca previsão.

4. **`votos_recuperaveis` não está validado em escala nacional** — está na base por transparência, não como recomendação.

5. **Cor/raça é inutilizável**: predomina “não informado”.

6. **Cobertura:** 5.569 dos 5.757 municípios têm perfil e coordenada; os 188 restantes são quase todos do exterior.

7. **Seções criadas após a eleição anterior não têm abstenção medida** — no Rio são 591 seções e 177.279 eleitores (3,6%).

8. **`taxa_abst` mistura voto facultativo** (16–17 anos, 70 ou mais, analfabeto). Para comparação entre grupos, use **`taxa_obrig`**.

---

## Origem técnica

Os dados de abstenção e votos vêm do portal oficial de resultados do TSE, cujos endereços por UF, município e zona foram identificados a partir do próprio aplicativo do TSE. O boletim de urna por seção existe, mas é binário (ASN.1) e exige decodificação — não foi usado aqui.
