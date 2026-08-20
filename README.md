# Relatório IOSPD/ABEPTIC 2026 — Mato Grosso do Sul

Página de leitura do resultado final de MS no ciclo **2026** da avaliação nacional de oferta de
serviços públicos digitais (IOSPD/ABEPTIC): nota por dimensão, o que ficou zerado e onde os
pontos foram perdidos.

Duas páginas:

| Página | Para quem | O que responde |
|--------|-----------|----------------|
| **[Painel](https://fabioramos-02.github.io/abep/)** | leitura rápida | quanto tiramos, onde perdemos, o que zeramos |
| **[Análise executiva](https://fabioramos-02.github.io/abep/analise.html)** | gestão e pontos focais | situação item a item, justificativa da avaliação, responsabilidade por órgão, posição de MS entre os estados, prioridades de recuperação |

### MS diante dos demais estados

**15º lugar entre 26 unidades federativas**, com 74,81 pontos. Acima da média nacional (69,32) e
**abaixo da mediana** (78,32) — a média é baixa porque 8 estados não chegaram a 50 pontos. A leitura
que vale é a posição: MS está na metade de baixo. A líder é PI, com 100,00.

Abaixo da média nacional em 3 das 5 dimensões: Governança Digital, Usuários e Cidadãos, Inovação e IA.

**3 itens são fragilidade própria** — dois terços dos estados pontuaram mais que MS:

| Item | Dimensão | Tema | Posição de MS |
|------|----------|------|---------------|
| 1.6 | Governança Digital | Framework de interoperabilidade | 19º de 26 |
| 4.6 | Usuários e Cidadãos | Alfabetização digital | 20º de 26 |
| 5.3 | Inovação e IA | Compras públicas para inovação | 19º de 26 |

**7 itens são difíceis para todos** — menos de 35% dos estados fizeram nota cheia neles. Ali MS
acompanha o conjunto e cobrar a secretaria rende menos.

### Selo do ciclo

**Mato Grosso do Sul recebeu o Selo Bronze.** Em 2025 tinha o Selo Prata, com 87,33 pontos — a queda
para 74,81 representa 14,34% a menos.

| Selo | UFs | Faixa apurada |
|------|----:|---------------|
| Ouro | 8 | 93,47 a 100,00 — PI, GO, RS, PE, MG, MT, RJ, TO |
| Prata | 4 | 82,48 a 88,50 — ES, AC, CE, SP |
| **Bronze** | **3** | **74,81 a 79,63 — RO, BA, MS** |
| Sem selo | 11 | abaixo de 70 |

26 unidades federativas participaram; o Paraná não participou deste ciclo. Os selos são atribuídos
pela ABEP-TIC e ficam em `data/selos.json` — não são calculados aqui. O script confere que a
pontuação apurada nos relatórios estaduais separa os grupos na mesma ordem.

---

## O resultado em uma tabela

| # | Dimensão | Pontos | Máximo | Aproveitamento | Perda |
|---|----------|-------:|-------:|---------------:|------:|
| 1 | Governança Digital | 22,55 | 30 | 75,2% | 7,45 |
| 2 | Serviços Públicos Digitais | 25,56 | 30 | 85,2% | 4,44 |
| 3 | Marco Legal e Normativo | 9,10 | 10 | 91,0% | 0,90 |
| 4 | Usuários e Cidadãos | 11,21 | 20 | **56,0%** | **8,79** |
| 5 | Inovação e IA | 6,39 | 10 | 63,9% | 3,61 |
| | **Total** | **74,81** | **100** | **74,8%** | **25,19** |

44 indicadores avaliados: **22 com nota cheia**, **15 parciais**, **7 zerados**.
Os 7 zerados concentram 15,83 pontos — **62,9% de toda a perda**.

### O que zeramos

| Item | Dimensão | Tema | Perda |
|------|----------|------|------:|
| 1.4 | Governança Digital | Estrutura colegiada de governança de dados | 2,50 |
| 1.6 | Governança Digital | Framework de interoperabilidade | 2,50 |
| 2.8 | Serviços Públicos Digitais | Certificado de conclusão do ensino médio online | 2,50 |
| 4.2 | Usuários e Cidadãos | Kit de ferramentas para participação/testes com usuários | 2,50 |
| 4.5 | Usuários e Cidadãos | Uso efetivo do portal de serviços pelos cidadãos | 2,50 |
| 5.1 | Inovação e IA | Política estadual de uso de IA no setor público | 1,67 |
| 5.3 | Inovação e IA | Compras públicas para inovação (CPIN) em 2025 | 1,67 |

> O item **4.5** aparece na planilha como "Evidência Comprovada" com pontuação 0. O efeito na nota é
> o mesmo de um não atendido, então ele entra na contagem de zerados. A divergência é da fonte e não
> foi corrigida — está sinalizada na própria página.

---

## Estrutura

```
.
├── index.html                     página única do relatório
├── analise.html                   análise executiva (7 seções)
├── assets/
│   ├── styles.css                 tokens do Design System MS.GOV + layout
│   ├── base.js                    helpers compartilhados e gerador de barras SVG
│   ├── app.js                     render do painel
│   ├── analise.js                 render da análise executiva
│   ├── logo-ms-horizontal.svg     marca do Governo do Estado (versão branca, topo)
│   └── logo-segov.svg             marca da SEGOV (versão colorida, rodapé)
├── data/
│   ├── Relatorio_Final_MS.xlsx    planilha original recebida (fonte da pontuação)
│   ├── uf/                        relatórios das demais UFs (para o comparativo nacional)
│   ├── contexto.json              órgão, envio e justificativa por item (registro interno)
│   ├── indicadores.json           gerado por extrair.py — alimenta o painel
│   ├── nacional.json              gerado por nacional.py — comparativo entre UFs
│   └── analise.json               gerado por analise.py — alimenta a análise
├── scripts/
│   ├── extrair.py                 xlsx → indicadores.json, com verificação embutida
│   ├── nacional.py                data/uf/*.xlsx → nacional.json, ranking e cruzamento por item
│   └── analise.py                 junta tudo em analise.json, com verificação embutida
└── .github/workflows/deploy.yml   verificação + publicação no GitHub Pages
```

Sem framework, sem build, sem dependência de runtime. O navegador carrega
`index.html`, `styles.css`, `app.js` e um JSON.

## Rodar local

```bash
python -m http.server 5173
```

Depois abrir <http://localhost:5173>. Não funciona abrindo o `index.html` direto pelo
sistema de arquivos — o `fetch` do JSON exige um servidor.

## Atualizar o dado

1. Substituir `data/Relatorio_Final_MS.xlsx` pela nova planilha.
2. Ajustar os valores esperados nos `assert` de `scripts/extrair.py` (eles travam os números do
   ciclo 2026 de propósito).
3. Regerar os dois JSON, nesta ordem:

```bash
python scripts/extrair.py && python scripts/analise.py
```

4. Commit e push. O workflow reprocessa a planilha e falha se os JSON versionados estiverem
   desatualizados em relação ao xlsx.

## Publicação

`.github/workflows/deploy.yml` roda a cada push em `main`: primeiro reprocessa a planilha e confere
se o JSON versionado bate com a fonte, depois publica o repositório inteiro no GitHub Pages.

Pré-requisito no repositório: **Settings → Pages → Source: GitHub Actions**.

## Impressão

As duas páginas têm folha de impressão e um botão **Imprimir ou salvar em PDF** no topo.
No papel: A4 retrato, cabeçalho de tabela repetido a cada quebra, cards e linhas sem corte no meio,
capa em fundo claro e controles de tela (sumário, filtros, botão) ocultos.

A paginação difere conforme o documento. A **análise executiva** usa uma seção por página. O
**painel** é resumo: as seções fluem uma atrás da outra e só a tabela das 44 exigências começa em
página nova, o que evita gastar folha com espaço em branco.

Se a impressão sair desalinhada, recarregue com `Ctrl+Shift+R` antes: o navegador guarda o CSS
antigo em cache e imprime com ele.

## Padrão visual

Design System MS.GOV v2.0.0 (SGD/SETDIG) — azul institucional `#004F9F`, títulos em Open Sans,
corpo em Roboto, espaçamento base-8, cores semânticas de sucesso/alerta/erro. Os tokens estão
declarados como CSS custom properties no topo de `assets/styles.css`.

## Fonte dos dados

**Pontuação, classificação e valor máximo:** `data/Relatorio_Final_MS.xlsx`, relatório final do ciclo
2026 recebido pela SETDIG. Valores publicados sem alteração.

**Situação de envio, órgão responsável e justificativa da avaliação:** `data/contexto.json`,
transcrito do registro interno de acompanhamento do ciclo mantido pela equipe da SETDIG. Esse
registro vive fora deste repositório e não acompanha a planilha, por isso foi versionado aqui.

**Selos do ciclo:** `data/selos.json`, transcrito do resultado oficial publicado pela ABEP-TIC em
<https://abep-tic.org.br/indice-abep-2026/>, incluindo a pontuação de MS em 2025.

**Comparativo entre unidades federativas:** os 26 arquivos `Relatorio_Final_<UF>.xlsx` em `data/uf/`.
Falta o Paraná — todo percentual da seção 5 é calculado sobre as 26 presentes, e a cobertura aparece
na própria página. Com a pasta vazia, a seção volta a aparecer marcada como pendente de dado; nada é
estimado nem preenchido por inferência.

### Atualizar o comparativo nacional

```bash
cp /caminho/dos/relatorios/Relatorio_Final_*.xlsx data/uf/
python scripts/nacional.py
python scripts/analise.py
```

`nacional.py` valida o cabeçalho de cada arquivo, recusa UF duplicada, confere que o total de MS bate
com o resultado já publicado e avisa quais unidades federativas ficaram de fora.

Dois detalhes do formato recebido, tratados no script: parte dos arquivos referencia um desenho
inexistente no pacote (o openpyxl quebra ao carregar imagens, então a busca por elas é neutralizada),
e vários declaram `<dimension ref="A1"/>`, o que inviabiliza o modo `read_only`.
