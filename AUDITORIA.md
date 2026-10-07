# Auditoria das bases — eleição 2026, 1º turno

Realizada em 07/10/2026. Reprodutível: `python3 ferramentas/audita_bases.py` e
`python3 ferramentas/valida_bases.py`.

---

## Veredito

**O perfil do eleitorado é o dado oficial do TSE.** Confere até a unidade com todas as
15 referências oficiais encontradas, nacionais e estaduais. Pode ser publicado, com a fonte
e as ressalvas da seção "O que publicar".

**O resultado do 1º turno também confere**, com uma exceção já corrigida no explorador:
a coluna `nulos` deixa de fora 5.246 votos que o TSE soma ao total oficial de nulos.

Nenhum teste forense indicou fabricação ou adulteração.

---

## 1. Confronto com números oficiais

O acesso direto aos portais do TSE está bloqueado no ambiente em que a auditoria rodou. Os
números oficiais vieram das notas do TSE e dos TREs e da cobertura da imprensa sobre a
totalização final (fontes no fim). A prova não vem de um número isolado, e sim da
coincidência exata de muitos números independentes: total, gênero, idade, escolaridade,
estados, exterior e candidatos. Uma base fabricada ou adulterada não reproduziria todos até
a unidade.

### Perfil do eleitorado

| Grandeza | Oficial | Base | Diferença |
|---|---:|---:|---:|
| Eleitorado total | 158.745.463 | 158.745.463 | 0 |
| Mulheres | 83.877.126 | 83.877.126 | 0 |
| Eleitores até 18 anos | 3.571.159 | 3.571.159 | 0 |
| Exterior | 918.876 | 918.876 | 0 |
| São Paulo | 34.104.226 | 34.104.226 | 0 |
| Minas Gerais | 16.377.659 | 16.377.659 | 0 |
| 5 maiores colégios | 83.268.916 | 83.268.916 | 0 |
| PE — 16 anos / 17 anos / 70 a 79 | 36.311 / 59.726 / 494.716 | idênticos | 0 |
| PB — analfabetos | 204.444 | 204.444 | 0 |
| Ensino médio completo¹ | 44,2 mi | 44.292.209 | 0 |
| Fundamental incompleto¹ | 33,6 mi | 33.604.061 | 0 |
| Médio incompleto¹ | 28,8 mi | 28.891.452 | 0 |
| Superior completo¹ | 18,0 mi | 18.037.161 | 0 |

¹ O TSE divulga milhões truncados, não arredondados (44.292.209 → "44,2 milhões").
O padrão de truncamento é o mesmo nos quatro níveis.

### Resultado do 1º turno

| Grandeza | Oficial | Base | Diferença |
|---|---:|---:|---:|
| Comparecimento | 125.275.835 | 125.275.835 | 0 |
| Abstenções | 33.469.244 | 33.469.244 | 0 |
| Votos válidos | 119.300.788 | 119.300.788 | 0 |
| Brancos | 2.300.798 | 2.300.798 | 0 |
| **Nulos (coluna `nulos`)** | **3.674.249** | **3.669.003** | **−5.246** |
| Nulos = comparecimento − válidos − brancos | 3.674.249 | 3.674.249 | 0 |
| Seções | 499.248 | 499.248 | 0 |
| Flávio Bolsonaro / Lula / Augusto Cury | 56.104.503 / 53.879.538 / 3.448.569 | idênticos | 0 |
| BA e SP, votos dos dois primeiros | ver script | idênticos | 0 |
| MG, RJ, RS (% dos válidos) | 48,2 / 53,0 / 35,73 | 48,24 / 53,01 / 35,73 | arredondamento |

---

## 2. Achados

**A1 — Nulos subcontados em 5.246 votos (corrigido no explorador).** A coluna `nulos`
omite votos que o TSE inclui no total oficial. A diferença está distribuída por 1.668
municípios e soma exatamente o resíduo comparecimento − válidos − brancos − nulos. O
explorador passou a calcular nulos por subtração e reproduz o número oficial; os CSVs
mantêm a coluna como veio da fonte. Efeito máximo na taxa nacional de brancos e nulos:
0,004 ponto percentual.

**A2 — Duas contagens de "eleitores aptos".** O perfil (cadastro) soma 158.745.463; a
coluna `eleitores_aptos` (resultado) soma 158.745.502, ou seja, 39 a mais. Por estado a
diferença chega a milhares (SP: +18.666 no resultado; BA: −8.253). Hipótese não verificada:
voto em trânsito, em que o eleitor vota em outro município e entra como apto onde vota. Os
totais nacionais quase coincidem, o que é coerente com essa hipótese. **Para o perfil, use
`perfil_total` e as colunas de composição, que são as que conferem com o TSE.**

**A3 — 423 aptos em 40 localidades do exterior sem votação.** O comparecimento mais as
abstenções oficiais somam 158.745.079, exatamente a base menos esses 423. O explorador já
mostra essas localidades como "sem votação".

**A4 — Divergência na imprensa sobre as UFs vencidas.** Pela base, Flávio venceu em 14
estados mais o DF e Lula em 12 estados. O Metrópoles concorda ("15 × 12"); a Gazeta do Povo
fala em "15 estados e o DF", texto escrito com quase 100% apurado. A base é a totalização
final; a divergência parece ser da reportagem. Ao citar, use "15 unidades da federação,
incluindo o DF".

**A5 — Lacunas já conhecidas, sem efeito no perfil 2026.** O DF não aparece na abstenção
por perfil de 2022, e Serra do Navio (AP) e Fernando de Noronha (PE) estão posicionados
pela sede municipal.

---

## 3. Testes forenses

| Teste | Resultado | Leitura |
|---|---|---|
| Benford, 1º dígito do eleitorado municipal | MAD = 0,0093 | conformidade aceitável (0,006–0,012)² |
| Benford, 1º dígito dos votos do 1º colocado | MAD = 0,0067 | conformidade aceitável |
| Último dígito, votos de Lula (5.571 municípios) | χ² = 3,9 (crítico 16,9) | uniforme: sem padrão de número inventado |
| Último dígito, votos de Flávio Bolsonaro | χ² = 7,1 (crítico 16,9) | uniforme |
| Eleitorado 2022 × 2026, mesmos municípios (base independente) | r = 0,9986 | continuidade esperada |
| Variação do eleitorado 2022→2026 | mediana +2,7%; p5 −6,1%; p95 +13,3% | plausível |
| Abstenção municipal 2022 × 2026 | r = 0,806 | persistência geográfica esperada |
| Eleitores por seção | 169 a 411 (mediana 295) | dentro do limite operacional |
| Somas de idade, escolaridade, gênero, estado civil e raça = `perfil_total` | 5.757 de 5.757 | coerente |

² Faixas de Nigrini (2012). O teste de Benford no primeiro dígito é fraco para dado
eleitoral (Deckert; Myagkov; Ordeshook, 2011): conformidade não prova lisura, e desvio não
prova fraude. O teste do último dígito (Beber; Scacco, 2012) é mais adequado para detectar
números inventados à mão; aqui ele não detecta nada.

Os 34 municípios com eleitorado mais de 25% maior que em 2022 são casos conhecidos de
crescimento acelerado. Os maiores são Canaã dos Carajás (PA, +49,8%, polo de mineração),
Uiramutã (RR), Extremoz e Tibau (RN, expansão litorânea).

---

## 4. Limites desta auditoria

- **Verificação indireta.** Os números oficiais vieram de notas do TSE e dos TREs e da
  imprensa; o arquivo do Portal de Dados Abertos não foi baixado. Basta uma checagem manual
  para fechar essa lacuna: baixar `perfil_eleitorado_2026` e comparar o total.
- **Granularidade.** O confronto oficial é por agregados: Brasil, estados e algumas faixas.
  Valores municipais foram testados por coerência interna, pela continuidade com 2022 e por
  testes forenses, não um a um contra o TSE.
- **Data de referência.** O perfil coincide com os números divulgados pelo TSE em julho de
  2026. Pela lei, o cadastro para a eleição fecha 150 dias antes do pleito (Lei 9.504/1997,
  art. 91), em maio de 2026. A base não registra a data da extração.
- **Procedência.** O script que gera `base_brasil_2026.csv` (`base_final.py`) está fora do
  repositório; a auditoria verifica o produto, não o processo.

---

## 5. O que publicar

Linha de fonte sugerida para o perfil:

> Fonte: TSE, perfil do eleitorado apto para as Eleições 2026 (cadastro fechado em maio de
> 2026, divulgado em julho de 2026): 158.745.463 eleitores.

Ressalvas que acompanham qualquer gráfico do perfil:
1. É o eleitorado **inscrito**, não quem votou.
2. Escolaridade é a **declarada no alistamento** e costuma estar desatualizada.
3. Para totais, use `perfil_total`, não `eleitores_aptos`, que vem do arquivo de resultado (A2).
4. Cor/raça: "não informado" predomina; não publique percentuais de raça.

---

## Fontes consultadas

- TSE. *Mais de 158 milhões de eleitores estão aptos a votar nas Eleições 2026*. Jul. 2026. https://www.tse.jus.br/comunicacao/noticias/2026/Julho/mais-de-158-milhoes-de-eleitores-estao-aptos-votar-nas-eleicoes-2026
- TSE. *Eleições 2026 em números: 158,7 milhões de eleitores estão aptos a votar*. Out. 2026. https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/eleicoes-2026-em-numeros-158-7-milhoes-de-eleitores-estao-aptos-a-votar
- TSE. *Flávio Bolsonaro (PL) e Lula (PT) vão disputar o 2º turno para a Presidência da República*. Out. 2026. https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/flavio-bolsonaro-e-lula-vao-disputar-o-2o-turno-para-a-presidencia-da-republica
- TRE-SP. *Eleições 2026: SP tem 21,4% do eleitorado nacional*. Jul. 2026. https://www.tre-sp.jus.br/comunicacao/noticias/2026/Julho/eleicoes-2026-sp-tem-21-4-do-eleitorado-nacional-e-soma-34-1-milhoes-de-aptos-a-votar-em-outubro
- TRE-PE. *Pernambuco supera a marca de 7,225 milhões de eleitores aptos*. Jul. 2026. https://www.tre-pe.jus.br/comunicacao/noticias/2026/Julho/pernambuco-supera-a-marca-de-7-225-milhoes-de-eleitores-aptos-a-votar-nas-eleicoes-2026
- TRE-PB. *Conheça o eleitorado paraibano apto a votar nas Eleições 2026*. Jul. 2026. https://www.tre-pb.jus.br/comunicacao/noticias/2026/Julho/conheca-o-eleitorado-paraibano-apto-a-votar-nas-eleicoes-2026
- CNN Brasil. *Eleições 2026: veja quais são os 10 maiores colégios eleitorais do Brasil*. https://www.cnnbrasil.com.br/eleicoes/eleicoes-2026-veja-quais-sao-os-10-maiores-colegios-eleitorais-do-brasil/
- Metrópoles. *Eleições 2026: Flávio leva 1º turno em 15 estados; Lula, em 12*. https://www.metropoles.com/brasil/eleicoes-2026-flavio-leva-1o-turno-em-15-estados-lula-em-12
- Gazeta do Povo. *Flávio Bolsonaro vence Lula em 15 estados e no DF no 1º turno*. https://www.gazetadopovo.com.br/eleicoes/2026/flavio-vence-lula-em-15-estados-df/

## Referências metodológicas

BEBER, B.; SCACCO, A. What the numbers say: a digit-based test for election fraud. *Political Analysis*, v. 20, n. 2, p. 211-234, 2012.

DECKERT, J.; MYAGKOV, M.; ORDESHOOK, P. C. Benford's Law and the detection of election fraud. *Political Analysis*, v. 19, n. 3, p. 245-268, 2011.

NIGRINI, M. J. *Benford's Law*: applications for forensic accounting, auditing, and fraud detection. Hoboken: Wiley, 2012.
