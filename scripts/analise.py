"""Cruza o resultado oficial (data/indicadores.json) com o contexto do tracker
(data/contexto.json) e grava data/analise.json, que alimenta a pagina analise.html.

Depende de scripts/extrair.py ter rodado antes.

Uso:  python scripts/analise.py
"""

import json
from collections import defaultdict
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
BASE = RAIZ / "data" / "indicadores.json"
CONTEXTO = RAIZ / "data" / "contexto.json"
NACIONAL = RAIZ / "data" / "nacional.json"
SAIDA = RAIZ / "data" / "analise.json"


def carrega(caminho: Path) -> dict:
    with caminho.open(encoding="utf-8") as f:
        return json.load(f)


def main() -> None:
    base = carrega(BASE)
    ctx = carrega(CONTEXTO)
    meta = ctx["indicadores"]

    indicadores = []
    for i in base["indicadores"]:
        c = meta[i["codigo"]]
        # "Comprovado sem pontuacao": a avaliacao aceitou a evidencia e mesmo assim deu zero.
        comprovado_sem_ponto = (
            i["status"] == "zerado" and i["classificacao"].startswith("Evid")
            and "Não Comprovada" not in i["classificacao"]
        )
        indicadores.append(
            {
                **i,
                "enviado": c["enviado"],
                "orgaos": c["orgaos"],
                "atribuicao": c["atribuicao"],
                "observacao": c["observacao"],
                "comprovado_sem_ponto": comprovado_sem_ponto,
            }
        )

    qtd = len(indicadores)
    conta = lambda f: sum(1 for i in indicadores if f(i))  # noqa: E731
    soma = lambda f: round(sum(i["perda"] for i in indicadores if f(i)), 4)  # noqa: E731

    situacao = {
        "qtd": qtd,
        "cheios": conta(lambda i: i["status"] == "cheio"),
        "parciais": conta(lambda i: i["status"] == "parcial"),
        "zerados": conta(lambda i: i["status"] == "zerado"),
        "nao_enviados": conta(lambda i: not i["enviado"]),
        "comprovados_sem_ponto": conta(lambda i: i["comprovado_sem_ponto"]),
        "perda_cheios": 0.0,
        "perda_parciais": soma(lambda i: i["status"] == "parcial"),
        "perda_zerados": soma(lambda i: i["status"] == "zerado"),
        "perda_nao_enviados": soma(lambda i: not i["enviado"]),
    }

    # Dimensoes: repete o recorte de situacao dentro de cada uma.
    dimensoes = []
    for d in base["dimensoes"]:
        itens = [i for i in indicadores if i["dimensao"] == d["numero"]]
        dimensoes.append(
            {
                **d,
                "descricao": ctx["dimensoes"][d["numero"]],
                "peso": round(d["maximo"], 2),
                "nao_enviados": sum(1 for i in itens if not i["enviado"]),
                "comprovados_sem_ponto": sum(1 for i in itens if i["comprovado_sem_ponto"]),
                "share_perda": round(d["perda"] / base["resumo"]["perda"], 4),
            }
        )

    # Responsabilidade: um item com dois orgaos entra na conta dos dois, mas a perda
    # e rateada entre eles para o total por orgao continuar fechando com os 25,19.
    orgs = defaultdict(lambda: {"itens": [], "qtd": 0, "cheios": 0, "parciais": 0,
                                "zerados": 0, "nao_enviados": 0, "perda": 0.0,
                                "so_coordenacao": True})
    for i in indicadores:
        for o in i["orgaos"]:
            r = orgs[o]
            r["qtd"] += 1
            r[{"cheio": "cheios", "parcial": "parciais", "zerado": "zerados"}[i["status"]]] += 1
            if not i["enviado"]:
                r["nao_enviados"] += 1
            r["perda"] += i["perda"] / len(i["orgaos"])
            if i["atribuicao"] == "tracker":
                r["so_coordenacao"] = False
            if i["status"] != "cheio" or not i["enviado"]:
                r["itens"].append(i["codigo"])

    responsaveis = sorted(
        (
            {
                "orgao": o,
                "qtd": r["qtd"],
                "cheios": r["cheios"],
                "parciais": r["parciais"],
                "zerados": r["zerados"],
                "nao_enviados": r["nao_enviados"],
                "perda": round(r["perda"], 4),
                "pendentes": r["itens"],
                "so_coordenacao": r["so_coordenacao"],
            }
            for o, r in orgs.items()
        ),
        key=lambda r: (-r["perda"], r["orgao"]),
    )

    # Prioridade: o que rende mais ponto por acao. Peso = perda; esforco vem do tipo de acao.
    ESFORCO = {
        "1.4": ("Ato normativo", 1), "1.6": ("Norma técnica", 2), "5.1": ("Ato normativo", 1),
        "3.4": ("Ato normativo", 1), "5.3": ("Processo administrativo", 2),
        "1.5": ("Documento de gestão", 2), "4.5": ("Contestação junto à ABEP-TIC", 1),
        "4.2": ("Documento de gestão", 2), "2.8": ("Desenvolvimento de sistema", 3),
        "4.6": ("Programa novo", 3), "4.3": ("Integração entre canais", 3),
        "1.12": ("Investimento em infraestrutura", 3), "2.11": ("Operação continuada", 3),
        "4.4": ("Ajuste no portal", 2), "2.3": ("Evidência documental", 1),
        "2.12": ("Evidência documental", 1), "3.1": ("Ato normativo", 1),
        "3.6": ("Norma técnica", 2), "4.1": ("Revisão de conteúdo", 2),
        "4.7": ("Publicação de dados", 1), "5.2": ("Evidência documental", 1),
        "1.7": ("Evidência documental", 1),
    }
    prioridades = sorted(
        (
            {
                "codigo": i["codigo"],
                "dimensao": i["dimensao"],
                "pergunta": i["pergunta"],
                "ganho": i["perda"],
                "acao": ESFORCO.get(i["codigo"], ("A definir", 3))[0],
                "esforco": ESFORCO.get(i["codigo"], ("A definir", 3))[1],
                "orgaos": i["orgaos"],
            }
            for i in indicadores
            if i["perda"] > 0
        ),
        key=lambda p: (p["esforco"], -p["ganho"]),
    )

    saida = {
        "resumo": {**base["resumo"], **situacao},
        "dimensoes": dimensoes,
        "responsaveis": responsaveis,
        "prioridades": prioridades,
        "indicadores": indicadores,
        # Secao 5 so existe quando scripts/nacional.py ja rodou sobre data/uf/.
        "nacional": carrega(NACIONAL) if NACIONAL.exists() else None,
    }

    # Self-check: os recortes tem que fechar com o total geral.
    r = saida["resumo"]
    assert r["cheios"] + r["parciais"] + r["zerados"] == r["qtd"] == 44
    # Tolerancia de 1e-3: indicadores.json arredonda em 4 casas por item e por dimensao,
    # entao somar dois niveis diferentes nao bate no bit. O que importa e fechar na exibicao.
    assert abs(r["perda_parciais"] + r["perda_zerados"] - r["perda"]) < 1e-3
    assert abs(sum(d["perda"] for d in dimensoes) - r["perda"]) < 1e-3
    assert abs(sum(o["perda"] for o in responsaveis) - r["perda"]) < 1e-3, "rateio por orgao nao fecha"
    assert abs(sum(d["share_perda"] for d in dimensoes) - 1) < 1e-3
    assert r["nao_enviados"] == 5, r["nao_enviados"]
    assert r["comprovados_sem_ponto"] == 1, r["comprovados_sem_ponto"]
    assert len(prioridades) == 22, len(prioridades)
    if saida["nacional"]:
        nac = saida["nacional"]
        assert abs(nac["ms"]["total"] - r["total"]) < 0.01, "nacional nao bate com o resultado de MS"
        assert len(nac["indicadores"]) == r["qtd"], len(nac["indicadores"])

    with SAIDA.open("w", encoding="utf-8", newline="\n") as f:
        json.dump(saida, f, ensure_ascii=False, indent=2)
        f.write("\n")
    nac = saida["nacional"]
    print(
        f"OK -> {SAIDA.relative_to(RAIZ)}  "
        f"({r['qtd']} itens, {len(responsaveis)} orgaos, {len(prioridades)} acoes, "
        f"{'comparativo com ' + str(nac['qtd_ufs']) + ' UFs' if nac else 'sem comparativo nacional'})"
    )


if __name__ == "__main__":
    main()
