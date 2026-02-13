from typing import Dict, List, Optional, Tuple

def quiniela_cost(selections: List[dict], base_price: float) -> Tuple[int, float]:
    # combinations = product of picks count per match
    combos = 1
    for s in selections:
        picks = s.get("picks") or []
        combos *= max(1, len(picks))
    return combos, round(combos * base_price, 2)

def calc_quiniela_hits(selections: List[dict], results: List[dict]) -> int:
    # Para n=15 (Pleno al 15) usamos homeCat/awayCat con valores 0/1/2/M.
    # Para 1..14 usamos result 1/X/2.
    res_map = {r["n"]: r for r in results}
    hits = 0
    for s in selections:
        n = s["n"]
        if n not in res_map:
            continue

        r = res_map[n]

        # Pleno al 15
        if n == 15:
            if (s.get("homeCat") and s.get("awayCat") and r.get("homeCat") and r.get("awayCat")
                and s["homeCat"] == r["homeCat"] and s["awayCat"] == r["awayCat"]):
                hits += 1
            continue

        # Partidos 1..14
        if r.get("result") and r["result"] in s.get("picks", []):
            hits += 1
    return hits

def calc_quinigol_hits(selections: List[dict], results: List[dict]) -> int:
    res_map = {r["n"]: (r["home_goals"], r["away_goals"]) for r in results}
    hits = 0
    for s in selections:
        n = s["n"]
        if n in res_map and res_map[n] == (s["home_goals"], s["away_goals"]):
            hits += 1
    return hits

def prize_from_table(hits: int, table: Optional[Dict[str, float]]) -> float:
    if not table:
        return 0.0
    return float(table.get(str(hits), 0.0))
