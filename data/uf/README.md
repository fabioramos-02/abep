# Relatórios estaduais

Coloque aqui os arquivos `Relatorio_Final_<UF>.xlsx` — um por unidade federativa, no mesmo
formato do relatório de MS (aba `Relatorio`, uma linha por indicador).

O relatório de **MS precisa estar presente**: ele é a referência do cruzamento.

Depois de copiar os arquivos:

```bash
python scripts/nacional.py     # gera data/nacional.json
python scripts/analise.py      # embute o comparativo em data/analise.json
```

A seção 5 da análise executiva passa a ser renderizada sozinha. Sem esses arquivos, a seção
aparece marcada como pendente de dado — nenhuma outra seção depende deles.

O script avisa quais unidades federativas ficaram de fora e calcula todos os percentuais
sobre as que estiverem presentes.
