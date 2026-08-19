"""Extrai o Relatorio_Final_MS.xlsx (IOSPD/ABEPTIC 2026) para data/indicadores.json.

Uso:  python scripts/extrair.py
"""

import json
import re
from pathlib import Path

import openpyxl

RAIZ = Path(__file__).resolve().parent.parent
XLSX = RAIZ / "data" / "Relatorio_Final_MS.xlsx"
SAIDA = RAIZ / "data" / "indicadores.json"

# A planilha traz só o número da dimensão. Os nomes vêm da metodologia do ciclo 2026.
NOMES_DIMENSAO = {
    "1": "Governança Digital",
    "2": "Serviços Públicos Digitais",
    "3": "Marco Legal e Normativo",
    "4": "Usuários e Cidadãos",
    "5": "Inovação e IA",
}


# Siglas que devem permanecer em caixa alta ao converter o texto da planilha.
SIGLAS = {
    "CEAF", "CERT", "CIN", "CNH", "CPIN", "EMAG", "IA", "PIX", "TIC", "W3C",
    "API", "PCD", "UF", "MS", "SUS",
}


def titulo(texto: str) -> str:
    """A planilha vem toda em CAIXA ALTA. Converte para sentença, preservando siglas."""
    def converte(m):
        p = m.group(0)
        return p if p.upper() in SIGLAS else p.lower()

    frase = re.sub(r"[A-Za-zÀ-ÿ]+", converte, texto.strip())
    frase = frase.replace(" apis ", " APIs ").replace("w3c", "W3C")
    return frase[:1].upper() + frase[1:]


def main() -> None:
    ws = openpyxl.load_workbook(XLSX, data_only=True)["Relatorio"]
    linhas = [r for r in ws.iter_rows(min_row=2, values_only=True) if r[0]]

    indicadores = []
    for uf, dim, texto, classificacao, pontos, maximo, _atendido, _pct in linhas:
        pontos = float(pontos or 0)
        maximo = float(maximo or 0)
        codigo, _, pergunta = texto.strip().partition(" ")
        if pontos == 0:
            status = "zerado"
        elif abs(pontos - maximo) < 1e-9:
            status = "cheio"
        else:
            status = "parcial"
        indicadores.append(
            {
                "uf": uf,
                "dimensao": str(dim),
                "codigo": codigo,
                "pergunta": titulo(pergunta),
                "classificacao": classificacao,
                "pontos": round(pontos, 4),
                "maximo": round(maximo, 4),
                "perda": round(maximo - pontos, 4),
                "aproveitamento": round(pontos / maximo, 4) if maximo else 0.0,
                "status": status,
            }
        )

    dimensoes = []
    for num in sorted(NOMES_DIMENSAO, key=int):
        itens = [i for i in indicadores if i["dimensao"] == num]
        pontos = sum(i["pontos"] for i in itens)
        maximo = sum(i["maximo"] for i in itens)
        dimensoes.append(
            {
                "numero": num,
                "nome": NOMES_DIMENSAO[num],
                "pontos": round(pontos, 4),
                "maximo": round(maximo, 4),
                "perda": round(maximo - pontos, 4),
                "aproveitamento": round(pontos / maximo, 4),
                "qtd": len(itens),
                "cheios": sum(1 for i in itens if i["status"] == "cheio"),
                "parciais": sum(1 for i in itens if i["status"] == "parcial"),
                "zerados": sum(1 for i in itens if i["status"] == "zerado"),
            }
        )

    total = sum(i["pontos"] for i in indicadores)
    perda = sum(i["perda"] for i in indicadores)
    perda_zerados = sum(i["perda"] for i in indicadores if i["status"] == "zerado")
    resumo = {
        "uf": indicadores[0]["uf"],
        "ciclo": 2026,
        "total": round(total, 4),
        "maximo": round(sum(i["maximo"] for i in indicadores), 4),
        "perda": round(perda, 4),
        "perda_zerados": round(perda_zerados, 4),
        "share_zerados": round(perda_zerados / perda, 4),
        "qtd": len(indicadores),
        "cheios": sum(1 for i in indicadores if i["status"] == "cheio"),
        "parciais": sum(1 for i in indicadores if i["status"] == "parcial"),
        "zerados": sum(1 for i in indicadores if i["status"] == "zerado"),
    }

    # Self-check: os números do relatório não podem mudar sem alguém perceber.
    assert resumo["qtd"] == 44, resumo["qtd"]
    assert abs(resumo["total"] - 74.8090) < 0.001, resumo["total"]
    assert abs(resumo["maximo"] - 100.0) < 0.001, resumo["maximo"]
    assert (resumo["cheios"], resumo["parciais"], resumo["zerados"]) == (22, 15, 7), resumo
    assert abs(sum(d["pontos"] for d in dimensoes) - resumo["total"]) < 1e-6

    # newline explicito: o JSON e versionado e o CI (Linux) precisa gerar bytes identicos
    with SAIDA.open("w", encoding="utf-8", newline="\n") as f:
        json.dump(
            {"resumo": resumo, "dimensoes": dimensoes, "indicadores": indicadores},
            f,
            ensure_ascii=False,
            indent=2,
        )
        f.write("\n")
    print(f"OK -> {SAIDA.relative_to(RAIZ)}  ({resumo['qtd']} indicadores, {resumo['total']:.2f}/100)")


if __name__ == "__main__":
    main()
