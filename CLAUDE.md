# CLAUDE.md

Contexto para sessões futuras neste repositório.

## O que é

Site estático que apresenta o resultado de **Mato Grosso do Sul no ciclo 2026 do IOSPD/ABEPTIC**
— avaliação nacional de oferta de serviços públicos digitais, aplicada aos estados pela ABEP-TIC.

Público-alvo: gestores da SETDIG e das secretarias envolvidas. O objetivo é responder três
perguntas, nesta ordem: *quanto tiramos*, *onde perdemos ponto*, *o que dá para recuperar*.

Duas páginas, mesmo dado, profundidades diferentes:

- `index.html` — painel de leitura rápida. Nota, desempenho por dimensão, os 7 zeros, os 15 parciais.
- `analise.html` — análise executiva em 7 seções: visão geral, por dimensão, item a item com
  justificativa da avaliação, responsabilidade por órgão, comparação nacional (pendente de dado),
  achados e recomendações priorizadas por esforço.

Órgão: **SETDIG — Secretaria-Executiva de Transformação Digital**, vinculada à SEGOV.
Nunca escrever "Secretaria de Estado de Governo Digital".

## Regras deste repo

1. **Nada de build.** HTML + CSS + JS puro servido direto pelo GitHub Pages. Não introduzir
   Vite, React, bundler, Tailwind CLI ou biblioteca de gráfico. Os gráficos são SVG escrito à mão
   em `assets/app.js` — 5 barras não justificam uma dependência.
2. **Design System MS.GOV é obrigatório.** Toda cor sai das CSS custom properties no `:root` de
   `assets/styles.css`. Zero hex solto no meio do CSS ou em `style=` inline que não venha de token.
   Azul institucional `#004F9F`; títulos Open Sans; corpo Roboto.
3. **Os JSON são gerados, não editados à mão.** Ordem: `extrair.py` (xlsx de MS →
   `indicadores.json`) → `nacional.py` (`data/uf/*.xlsx` → `nacional.json`, opcional) →
   `analise.py` (junta tudo → `analise.json`). O único arquivo de dado editável à mão é
   `contexto.json`, que carrega órgão responsável, situação de envio e justificativa da avaliação
   por item, transcritos do registro interno da equipe.
4. **Os `assert` nos dois scripts são o teste do repo.** `extrair.py` trava total 74,809 / 44 itens
   / 22-15-7. `analise.py` trava que todos os recortes fecham com o total: soma por dimensão, soma
   por órgão (com perda rateada em itens compartilhados), 5 não enviados e 1 comprovado sem
   pontuação. Se a planilha mudar, os asserts falham de propósito — atualizar os valores
   conscientemente, nunca removê-los.
5. **Linguagem cidadã no texto visível, com uma exceção: "Dimensão".** Nada de "indicador",
   "IOSPD" ou "KPI" nos rótulos da página — usar "exigência", "não pontuou". Mas as cinco áreas
   são sempre chamadas de **Dimensão I a V** (algarismo romano + nome), porque é assim que a
   avaliação as identifica e é assim que os pontos focais das secretarias se referem a elas.
   O rótulo é montado por `rotuloDim()` em `assets/app.js`; não trocar por "área avaliada".
6. **O relatório é impresso.** A folha `@media print` no fim de `assets/styles.css` faz parte da
   entrega. Duas armadilhas já corrigidas, não reintroduzir: `table { min-width: 720px }` existe só
   para forçar rolagem lateral na tela e precisa ser zerado no papel, senão a tabela é cortada; e
   `.bar` tem animação `scaleX` que pode imprimir barra vazia, por isso `animation: none` na
   impressão. Fundos chapados exigem `print-color-adjust: exact`. Para testar sem imprimir: no
   console, trocar o `mediaText` da regra `print` para `screen` e medir com a viewport em ~720px
   (largura útil do A4 retrato).
7. **Ordem de dimensão é hierárquica, não por desempenho.** Gráficos, tabelas e cards seguem
   Dimensão I → V. Ranking por pontuação só no texto que interpreta o gráfico.
8. **Toda seção entrega a conclusão em texto antes do gráfico** (elemento `.anchor`). O gráfico
   ilustra a frase; a frase não é legenda do gráfico.
9. **Limitação do dado fica explícita.** Ver o tratamento do item 4.5 — classificado como
   "Evidência Comprovada" na planilha, mas com pontuação 0. Não silenciar divergências assim.

## Selo do ciclo

MS ficou com o **Selo Bronze** (era Prata em 2025, com 87,33 — queda de 14,34%). Os selos vêm
prontos de `data/selos.json`, transcritos de <https://abep-tic.org.br/indice-abep-2026/>: **não
calcular selo a partir da pontuação**. A página só publica o que a ABEP-TIC atribuiu. `nacional.py`
apenas confere que a pontuação apurada separa os grupos na mesma ordem e que ninguém sem selo passou
de 70 — se esse assert quebrar, os dois lados divergiram e alguém precisa olhar antes de publicar.

Ouro 8 · Prata 4 · Bronze 3 · sem selo 11 · 26 participantes (o Paraná não participou).

## Números do ciclo 2026 (para conferência rápida)

Total 74,81/100 · perda 25,19 · 44 indicadores (22 cheios, 15 parciais, 7 zerados).
Por dimensão: D1 75,2% · D2 85,2% · D3 91,0% · D4 56,0% · D5 63,9%.
Maior perda absoluta: D4 Usuários e Cidadãos (8,79 pts).
Zerados: 1.4, 1.6, 2.8, 4.2, 4.5, 5.1, 5.3.

## Rodar e verificar

```bash
python scripts/extrair.py      # regera o JSON e roda os asserts
python -m http.server 5173     # servir a página (fetch não funciona em file://)
```

## Publicação

Push em `main` dispara `.github/workflows/deploy.yml`: reprocessa a planilha, confere que o JSON
versionado bate com a fonte (`git diff --exit-code`) e publica no GitHub Pages.
Fonte do Pages configurada como **GitHub Actions** nas Settings do repositório.

## Regra sobre o que não se sabe

A seção 5 da análise (comparação com os demais estados) só existe se houver
`Relatorio_Final_<UF>.xlsx` em `data/uf/`. Com a pasta vazia, `comparacaoNacional()` em
`assets/analise.js` cai em `semDadoNacional()` e a seção aparece marcada como pendente — é o
comportamento correto, não um bug. Não estimar, não inferir posição no ranking, não preencher com
"provavelmente". Hoje a pasta tem 26 UFs; falta o Paraná. `nacional.py` registra as ausentes em
`nacional.ausentes`, a página declara a cobertura e calcula tudo sobre as presentes. Nunca
extrapolar para 27.

**Média não substitui mediana neste dado.** A média nacional (69,32) é puxada para baixo por 8 UFs
abaixo de 50 pontos. MS está acima da média e abaixo da mediana (78,32), em 15º de 26. Dizer só
"acima da média" é verdadeiro e enganoso — todo texto sobre posição nacional cita mediana e
colocação junto.

**A leitura "é problema de MS ou do país?" usa dois sinais, não um.** `posicionamento` vem do terço
em que MS cai naquele item; `item_dificil` marca item em que menos de 35% das UFs fizeram nota
cheia. Classificar só pela fatia de zerados engana: no item 2.11 nenhuma UF zerou, mas 25 das 26
ficaram parciais — não é fragilidade de MS.

Mesma regra para o item 4.5: classificado como "Evidência Comprovada" com pontuação 0. A divergência
é da fonte e fica explícita na página, não silenciada.

## Contexto adicional

O material de apoio do ciclo (evidências por indicador, pontos focais por secretaria, comparativo
2024/2025) vive fora deste repo, no vault Obsidian:
`SETDIG/conhecimento-obsidian/20-projeto/abeptic-2026/`.
Este repositório trata apenas do resultado final de 2026.
