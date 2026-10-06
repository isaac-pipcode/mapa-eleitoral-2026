# Dicionário de dados

Gerado automaticamente dos próprios arquivos por `gera_dicionario.py`.
Se a base mudar, basta rodar de novo — o dicionário não pode divergir do dado.

## Arquivos

| Arquivo | Grão (uma linha por) | Linhas | Colunas |
|---|---|---|---|
| `base_brasil_2026.csv` | Uma linha por **município** (5.757). | 5.757 | 117 |
| `base_uf_2026.csv` | Uma linha por **estado** (28, incluindo Distrito Federal e exterior). | 28 | 86 |
| `base_regiao_2026.csv` | Uma linha por **região** (6: Norte, Nordeste, Centro-Oeste, Sudeste, Sul, Exterior). | 6 | 86 |
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

**Grão:** Uma linha por **estado** (28, incluindo Distrito Federal e exterior).

**Fonte:** Somatório da base por município. Colunas iguais às de `base_brasil_2026.csv`.

| Coluna | Tipo | Descrição | Exemplo |
|---|---|---|---|
| `abstencoes` | decimal | Quantos faltaram | `125412.0` |
| `brancos` | decimal | Votos em branco | `5579.0` |
| `c10_pct` | decimal | Percentual do 10º colocado mais votado no município (Presidência) | `0.23` |
| `c10_votos` | decimal | Votos do 10º colocado mais votado no município (Presidência) | `72.0` |
| `c11_pct` | decimal | Percentual do 11º colocado mais votado no município (Presidência) | `0.12` |
| `c11_votos` | decimal | Votos do 11º colocado mais votado no município (Presidência) | `40.0` |
| `c12_pct` | decimal | Percentual do 12º colocado mais votado no município (Presidência) | `0.05` |
| `c12_votos` | decimal | Votos do 12º colocado mais votado no município (Presidência) | `27.0` |
| `c1_pct` | decimal | Percentual do 1º colocado | `1403.67` |
| `c1_votos` | decimal | Votos do 1º colocado mais votado no município (Presidência) | `303573.0` |
| `c2_pct` | decimal | Percentual do 2º colocado | `690.33` |
| `c2_votos` | decimal | Votos do 2º colocado mais votado no município (Presidência) | `134004.0` |
| `c3_pct` | decimal | Percentual do 3º colocado mais votado no município (Presidência) | `49.06` |
| `c3_votos` | decimal | Votos do 3º colocado mais votado no município (Presidência) | `13571.0` |
| `c4_pct` | decimal | Percentual do 4º colocado mais votado no município (Presidência) | `30.32` |
| `c4_votos` | decimal | Votos do 4º colocado mais votado no município (Presidência) | `8925.0` |
| `c5_pct` | decimal | Percentual do 5º colocado mais votado no município (Presidência) | `22.06` |
| `c5_votos` | decimal | Votos do 5º colocado mais votado no município (Presidência) | `7601.0` |
| `c6_pct` | decimal | Percentual do 6º colocado mais votado no município (Presidência) | `2.03` |
| `c6_votos` | decimal | Votos do 6º colocado mais votado no município (Presidência) | `591.0` |
| `c7_pct` | decimal | Percentual do 7º colocado mais votado no município (Presidência) | `1.15` |
| `c7_votos` | decimal | Votos do 7º colocado mais votado no município (Presidência) | `346.0` |
| `c8_pct` | decimal | Percentual do 8º colocado mais votado no município (Presidência) | `0.7` |
| `c8_votos` | decimal | Votos do 8º colocado mais votado no município (Presidência) | `197.0` |
| `c9_pct` | decimal | Percentual do 9º colocado mais votado no município (Presidência) | `0.38` |
| `c9_votos` | decimal | Votos do 9º colocado mais votado no município (Presidência) | `119.0` |
| `comparecimento` | decimal | Quantos compareceram | `488330.0` |
| `eleitores_aptos` | decimal | Eleitorado apto no município | `613742.0` |
| `escolaridade_analfabeto` | decimal | Escolaridade: analfabeto | `45287.0` |
| `escolaridade_ensino_fundamental_completo` | decimal | Escolaridade: ensino fundamental completo | `28753.0` |
| `escolaridade_ensino_fundamental_incompleto` | decimal | Escolaridade: ensino fundamental incompleto | `117595.0` |
| `escolaridade_ensino_medio_completo` | decimal | Escolaridade: ensino medio completo | `148077.0` |
| `escolaridade_ensino_medio_incompleto` | decimal | Escolaridade: ensino medio incompleto | `124375.0` |
| `escolaridade_le_e_escreve` | decimal | Escolaridade: lê e escreve | `54507.0` |
| `escolaridade_nao_informado` | decimal | Escolaridade: não informado | `0.0` |
| `escolaridade_superior_completo` | decimal | Escolaridade: superior completo | `58615.0` |
| `escolaridade_superior_incompleto` | decimal | Escolaridade: superior incompleto | `37166.0` |
| `estado_civil_casado` | decimal | Estado civil: casado | `144125.0` |
| `estado_civil_divorciado` | decimal | Estado civil: divorciado | `20576.0` |
| `estado_civil_nao_informado` | decimal | Estado civil: não informado | `0.0` |
| `estado_civil_separado_judicialmente` | decimal | Estado civil: separado judicialmente | `2244.0` |
| `estado_civil_solteiro` | decimal | Estado civil: solteiro | `435057.0` |
| `estado_civil_viuvo` | decimal | Estado civil: viúvo | `12373.0` |
| `faixa_100_anos_ou_mais` | decimal | Eleitores de 100 anos ou mais | `225.0` |
| `faixa_16_anos` | decimal | Eleitores de 16 anos | `5374.0` |
| `faixa_17_anos` | decimal | Eleitores de 17 anos | `8690.0` |
| `faixa_18_anos` | decimal | Eleitores de 18 anos | `12179.0` |
| `faixa_19_anos` | decimal | Eleitores de 19 anos | `13500.0` |
| `faixa_20_anos` | decimal | Eleitores de 20 anos | `14159.0` |
| `faixa_21_a_24_anos` | decimal | Eleitores de 21 a 24 anos | `58650.0` |
| `faixa_25_a_29_anos` | decimal | Eleitores de 25 a 29 anos | `73320.0` |
| `faixa_30_a_34_anos` | decimal | Eleitores de 30 a 34 anos | `66535.0` |
| `faixa_35_a_39_anos` | decimal | Eleitores de 35 a 39 anos | `61286.0` |
| `faixa_40_a_44_anos` | decimal | Eleitores de 40 a 44 anos | `61740.0` |
| `faixa_45_a_49_anos` | decimal | Eleitores de 45 a 49 anos | `57218.0` |
| `faixa_50_a_54_anos` | decimal | Eleitores de 50 a 54 anos | `45954.0` |
| `faixa_55_a_59_anos` | decimal | Eleitores de 55 a 59 anos | `37963.0` |
| `faixa_60_a_64_anos` | decimal | Eleitores de 60 a 64 anos | `30709.0` |
| `faixa_65_a_69_anos` | decimal | Eleitores de 65 a 69 anos | `23435.0` |
| `faixa_70_a_74_anos` | decimal | Eleitores de 70 a 74 anos | `17979.0` |
| `faixa_75_a_79_anos` | decimal | Eleitores de 75 a 79 anos | `12007.0` |
| `faixa_80_a_84_anos` | decimal | Eleitores de 80 a 84 anos | `7142.0` |
| `faixa_85_a_89_anos` | decimal | Eleitores de 85 a 89 anos | `3962.0` |
| `faixa_90_a_94_anos` | decimal | Eleitores de 90 a 94 anos | `1660.0` |
| `faixa_95_a_99_anos` | decimal | Eleitores de 95 a 99 anos | `680.0` |
| `faixa_invalida` | decimal | Eleitores de inválida | `8.0` |
| `genero_feminino` | decimal | Gênero: feminino | `317234.0` |
| `genero_masculino` | decimal | Gênero: masculino | `297141.0` |
| `genero_nao_informado` | decimal | Gênero: não informado | `0.0` |
| `margem_1o_2o_pts` | decimal | Diferença entre 1º e 2º colocado, em pontos do comparecimento | `34.72` |
| `n_municipios` | inteiro | Quantos municípios entram no agregado | `22` |
| `nulos` | decimal | Votos nulos | `13662.0` |
| `pct_abstencao` | decimal | Abstenção calculada sobre os eleitores aptos (%) | `20.43` |
| `perfil_total` | decimal | Eleitorado no perfil do TSE 2026 (confere com eleitores_aptos) | `614375.0` |
| `raca_amarela` | decimal | Cor/raça: amarela | `988.0` |
| `raca_branca` | decimal | Cor/raça: branca | `25718.0` |
| `raca_indigena` | decimal | Cor/raça: indígena | `7685.0` |
| `raca_nao_informado` | decimal | Cor/raça: não informado | `437423.0` |
| `raca_parda` | decimal | Cor/raça: parda | `127894.0` |
| `raca_preta` | decimal | Cor/raça: preta | `14667.0` |
| `secoes_total` | decimal | Número de seções eleitorais | `2270.0` |
| `secoes_totalizadas` | decimal | Seções com resultado totalizado | `2270.0` |
| `taxa_abstencao` | decimal | Taxa de abstenção informada pelo TSE (%) | `20.43` |
| `taxa_comparecimento` | decimal | Taxa de comparecimento informada pelo TSE (%) | `79.57` |
| `uf` | texto | Sigla do estado | `AC` |
| `votos_validos` | decimal | Votos válidos no 1º turno | `469066.0` |

## `base_regiao_2026.csv`

**Grão:** Uma linha por **região** (6: Norte, Nordeste, Centro-Oeste, Sudeste, Sul, Exterior).

**Fonte:** Somatório da base por município.

| Coluna | Tipo | Descrição | Exemplo |
|---|---|---|---|
| `abstencoes` | decimal | Quantos faltaram | `2546182.0` |
| `brancos` | decimal | Votos em branco | `109407.0` |
| `c10_pct` | decimal | Percentual do 10º colocado mais votado no município (Presidência) | `2.58` |
| `c10_votos` | decimal | Votos do 10º colocado mais votado no município (Presidência) | `1225.0` |
| `c11_pct` | decimal | Percentual do 11º colocado mais votado no município (Presidência) | `1.49` |
| `c11_votos` | decimal | Votos do 11º colocado mais votado no município (Presidência) | `858.0` |
| `c12_pct` | decimal | Percentual do 12º colocado mais votado no município (Presidência) | `0.8` |
| `c12_votos` | decimal | Votos do 12º colocado mais votado no município (Presidência) | `534.0` |
| `c1_pct` | decimal | Percentual do 1º colocado | `27398.14` |
| `c1_votos` | decimal | Votos do 1º colocado mais votado no município (Presidência) | `6031796.0` |
| `c2_pct` | decimal | Percentual do 2º colocado | `15418.33` |
| `c2_votos` | decimal | Votos do 2º colocado mais votado no município (Presidência) | `3528243.0` |
| `c3_pct` | decimal | Percentual do 3º colocado mais votado no município (Presidência) | `1051.94` |
| `c3_votos` | decimal | Votos do 3º colocado mais votado no município (Presidência) | `294377.0` |
| `c4_pct` | decimal | Percentual do 4º colocado mais votado no município (Presidência) | `659.87` |
| `c4_votos` | decimal | Votos do 4º colocado mais votado no município (Presidência) | `186916.0` |
| `c5_pct` | decimal | Percentual do 5º colocado mais votado no município (Presidência) | `411.7` |
| `c5_votos` | decimal | Votos do 5º colocado mais votado no município (Presidência) | `125930.0` |
| `c6_pct` | decimal | Percentual do 6º colocado mais votado no município (Presidência) | `27.71` |
| `c6_votos` | decimal | Votos do 6º colocado mais votado no município (Presidência) | `9599.0` |
| `c7_pct` | decimal | Percentual do 7º colocado mais votado no município (Presidência) | `15.44` |
| `c7_votos` | decimal | Votos do 7º colocado mais votado no município (Presidência) | `6797.0` |
| `c8_pct` | decimal | Percentual do 8º colocado mais votado no município (Presidência) | `8.3` |
| `c8_votos` | decimal | Votos do 8º colocado mais votado no município (Presidência) | `3422.0` |
| `c9_pct` | decimal | Percentual do 9º colocado mais votado no município (Presidência) | `4.85` |
| `c9_votos` | decimal | Votos do 9º colocado mais votado no município (Presidência) | `2213.0` |
| `comparecimento` | decimal | Quantos compareceram | `10554993.0` |
| `eleitores_aptos` | decimal | Eleitorado apto no município | `13101175.0` |
| `escolaridade_analfabeto` | decimal | Escolaridade: analfabeto | `553096.0` |
| `escolaridade_ensino_fundamental_completo` | decimal | Escolaridade: ensino fundamental completo | `665474.0` |
| `escolaridade_ensino_fundamental_incompleto` | decimal | Escolaridade: ensino fundamental incompleto | `2914882.0` |
| `escolaridade_ensino_medio_completo` | decimal | Escolaridade: ensino medio completo | `3645179.0` |
| `escolaridade_ensino_medio_incompleto` | decimal | Escolaridade: ensino medio incompleto | `2576433.0` |
| `escolaridade_le_e_escreve` | decimal | Escolaridade: lê e escreve | `921904.0` |
| `escolaridade_nao_informado` | decimal | Escolaridade: não informado | `15.0` |
| `escolaridade_superior_completo` | decimal | Escolaridade: superior completo | `1129808.0` |
| `escolaridade_superior_incompleto` | decimal | Escolaridade: superior incompleto | `702563.0` |
| `estado_civil_casado` | decimal | Estado civil: casado | `3055695.0` |
| `estado_civil_divorciado` | decimal | Estado civil: divorciado | `374003.0` |
| `estado_civil_nao_informado` | decimal | Estado civil: não informado | `27.0` |
| `estado_civil_separado_judicialmente` | decimal | Estado civil: separado judicialmente | `60470.0` |
| `estado_civil_solteiro` | decimal | Estado civil: solteiro | `9366527.0` |
| `estado_civil_viuvo` | decimal | Estado civil: viúvo | `252632.0` |
| `faixa_100_anos_ou_mais` | decimal | Eleitores de 100 anos ou mais | `4302.0` |
| `faixa_16_anos` | decimal | Eleitores de 16 anos | `93217.0` |
| `faixa_17_anos` | decimal | Eleitores de 17 anos | `152919.0` |
| `faixa_18_anos` | decimal | Eleitores de 18 anos | `231934.0` |
| `faixa_19_anos` | decimal | Eleitores de 19 anos | `261728.0` |
| `faixa_20_anos` | decimal | Eleitores de 20 anos | `281175.0` |
| `faixa_21_a_24_anos` | decimal | Eleitores de 21 a 24 anos | `1160344.0` |
| `faixa_25_a_29_anos` | decimal | Eleitores de 25 a 29 anos | `1476661.0` |
| `faixa_30_a_34_anos` | decimal | Eleitores de 30 a 34 anos | `1424804.0` |
| `faixa_35_a_39_anos` | decimal | Eleitores de 35 a 39 anos | `1331324.0` |
| `faixa_40_a_44_anos` | decimal | Eleitores de 40 a 44 anos | `1350842.0` |
| `faixa_45_a_49_anos` | decimal | Eleitores de 45 a 49 anos | `1229158.0` |
| `faixa_50_a_54_anos` | decimal | Eleitores de 50 a 54 anos | `1020869.0` |
| `faixa_55_a_59_anos` | decimal | Eleitores de 55 a 59 anos | `854681.0` |
| `faixa_60_a_64_anos` | decimal | Eleitores de 60 a 64 anos | `714619.0` |
| `faixa_65_a_69_anos` | decimal | Eleitores de 65 a 69 anos | `552612.0` |
| `faixa_70_a_74_anos` | decimal | Eleitores de 70 a 74 anos | `413846.0` |
| `faixa_75_a_79_anos` | decimal | Eleitores de 75 a 79 anos | `271184.0` |
| `faixa_80_a_84_anos` | decimal | Eleitores de 80 a 84 anos | `158190.0` |
| `faixa_85_a_89_anos` | decimal | Eleitores de 85 a 89 anos | `81111.0` |
| `faixa_90_a_94_anos` | decimal | Eleitores de 90 a 94 anos | `32972.0` |
| `faixa_95_a_99_anos` | decimal | Eleitores de 95 a 99 anos | `10754.0` |
| `faixa_invalida` | decimal | Eleitores de inválida | `108.0` |
| `genero_feminino` | decimal | Gênero: feminino | `6694588.0` |
| `genero_masculino` | decimal | Gênero: masculino | `6414759.0` |
| `genero_nao_informado` | decimal | Gênero: não informado | `7.0` |
| `margem_1o_2o_pts` | decimal | Diferença entre 1º e 2º colocado, em pontos do comparecimento | `23.72` |
| `n_municipios` | inteiro | Quantos municípios entram no agregado | `450` |
| `nulos` | decimal | Votos nulos | `253263.0` |
| `pct_abstencao` | decimal | Abstenção calculada sobre os eleitores aptos (%) | `19.43` |
| `perfil_total` | decimal | Eleitorado no perfil do TSE 2026 (confere com eleitores_aptos) | `13109354.0` |
| `raca_amarela` | decimal | Cor/raça: amarela | `19604.0` |
| `raca_branca` | decimal | Cor/raça: branca | `555406.0` |
| `raca_indigena` | decimal | Cor/raça: indígena | `136978.0` |
| `raca_nao_informado` | decimal | Cor/raça: não informado | `9150542.0` |
| `raca_parda` | decimal | Cor/raça: parda | `2907788.0` |
| `raca_preta` | decimal | Cor/raça: preta | `339036.0` |
| `regiao` | texto | Região do país | `Norte` |
| `secoes_total` | decimal | Número de seções eleitorais | `43769.0` |
| `secoes_totalizadas` | decimal | Seções com resultado totalizado | `43769.0` |
| `taxa_abstencao` | decimal | Taxa de abstenção informada pelo TSE (%) | `19.43` |
| `taxa_comparecimento` | decimal | Taxa de comparecimento informada pelo TSE (%) | `80.57` |
| `votos_validos` | decimal | Votos válidos no 1º turno | `10191910.0` |

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
