# Relatório IOSPD/ABEPTIC 2026 — Mato Grosso do Sul

Página de leitura do resultado final de MS no ciclo **2026** da avaliação nacional de oferta de
serviços públicos digitais (IOSPD/ABEPTIC): nota por dimensão, o que ficou zerado e onde os
pontos foram perdidos.

**Publicado em:** https://fabioramos-02.github.io/abep/

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
├── assets/
│   ├── styles.css                 tokens do Design System MS.GOV + layout
│   ├── app.js                     render dos gráficos SVG, tabelas e filtros
│   ├── logo-ms-horizontal.svg     marca do Governo do Estado (versão branca, topo)
│   └── logo-segov.svg             marca da SEGOV (versão colorida, rodapé)
├── data/
│   ├── Relatorio_Final_MS.xlsx    planilha original recebida (fonte)
│   └── indicadores.json           dados extraídos, consumidos pela página
├── scripts/
│   └── extrair.py                 xlsx → json, com verificação embutida
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
3. Regerar o JSON:

```bash
python scripts/extrair.py
```

4. Commit e push. O workflow reprocessa a planilha e falha se `data/indicadores.json` estiver
   desatualizado em relação ao xlsx.

## Publicação

`.github/workflows/deploy.yml` roda a cada push em `main`: primeiro reprocessa a planilha e confere
se o JSON versionado bate com a fonte, depois publica o repositório inteiro no GitHub Pages.

Pré-requisito no repositório: **Settings → Pages → Source: GitHub Actions**.

## Padrão visual

Design System MS.GOV v2.0.0 (SGD/SETDIG) — azul institucional `#004F9F`, títulos em Open Sans,
corpo em Roboto, espaçamento base-8, cores semânticas de sucesso/alerta/erro. Os tokens estão
declarados como CSS custom properties no topo de `assets/styles.css`.

## Fonte

Relatório final do ciclo 2026 recebido pela SETDIG em planilha. Valores publicados sem alteração.
