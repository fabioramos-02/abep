# CLAUDE.md

Contexto para sessões futuras neste repositório.

## O que é

Página estática que apresenta o resultado de **Mato Grosso do Sul no ciclo 2026 do IOSPD/ABEPTIC**
— avaliação nacional de oferta de serviços públicos digitais, aplicada aos estados pela ABEP-TIC.

Público-alvo: gestores da SETDIG e das secretarias envolvidas. O objetivo é responder três
perguntas, nesta ordem: *quanto tiramos*, *onde perdemos ponto*, *o que dá para recuperar*.

Órgão: **SETDIG — Secretaria-Executiva de Transformação Digital**, vinculada à SEGOV.
Nunca escrever "Secretaria de Estado de Governo Digital".

## Regras deste repo

1. **Nada de build.** HTML + CSS + JS puro servido direto pelo GitHub Pages. Não introduzir
   Vite, React, bundler, Tailwind CLI ou biblioteca de gráfico. Os gráficos são SVG escrito à mão
   em `assets/app.js` — 5 barras não justificam uma dependência.
2. **Design System MS.GOV é obrigatório.** Toda cor sai das CSS custom properties no `:root` de
   `assets/styles.css`. Zero hex solto no meio do CSS ou em `style=` inline que não venha de token.
   Azul institucional `#004F9F`; títulos Open Sans; corpo Roboto.
3. **`data/indicadores.json` é gerado, não editado à mão.** Fonte de verdade é
   `data/Relatorio_Final_MS.xlsx`. Para regerar: `python scripts/extrair.py`.
4. **Os `assert` em `scripts/extrair.py` são o teste do repo.** Travam total 74,809 / 44 itens /
   22-15-7. Se a planilha mudar, os asserts falham de propósito — atualizar os valores
   conscientemente, nunca removê-los.
5. **Linguagem cidadã no texto visível, com uma exceção: "Dimensão".** Nada de "indicador",
   "IOSPD" ou "KPI" nos rótulos da página — usar "exigência", "não pontuou". Mas as cinco áreas
   são sempre chamadas de **Dimensão I a V** (algarismo romano + nome), porque é assim que a
   avaliação as identifica e é assim que os pontos focais das secretarias se referem a elas.
   O rótulo é montado por `rotuloDim()` em `assets/app.js`; não trocar por "área avaliada".
6. **Toda seção entrega a conclusão em texto antes do gráfico** (elemento `.anchor`). O gráfico
   ilustra a frase; a frase não é legenda do gráfico.
7. **Limitação do dado fica explícita.** Ver o tratamento do item 4.5 — classificado como
   "Evidência Comprovada" na planilha, mas com pontuação 0. Não silenciar divergências assim.

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

## Contexto adicional

O material de apoio do ciclo (evidências por indicador, pontos focais por secretaria, comparativo
2024/2025) vive fora deste repo, no vault Obsidian:
`SETDIG/conhecimento-obsidian/20-projeto/abeptic-2026/`.
Este repositório trata apenas do resultado final de 2026.
