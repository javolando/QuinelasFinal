import React, { useEffect, useMemo, useState } from "react";
import { api } from "../app/api";
import { Card, Button, Input, Select } from "../app/ui";
import clsx from "clsx";

type Jornada = {
  id: string;
  number?: number;
  name?: string;
  season: string;
  type: "Quiniela" | "Quinigol" | "Both";
  isOfficial: boolean;
  matchesQuiniela?: { n: number; home: string; away: string }[];
  matchesQuinigol?: { n: number; home: string; away: string }[];
};

type GoalCat = "0" | "1" | "2" | "M";
type Pick = "1" | "X" | "2";

function defaultMatchesQ() {
  return Array.from({ length: 15 }, (_, i) => ({
    n: i + 1,
    home: "Equipo local",
    away: "Equipo visitante",
  }));
}

function defaultMatchesG() {
  return Array.from({ length: 6 }, (_, i) => ({
    n: i + 1,
    home: "Equipo local",
    away: "Equipo visitante",
  }));
}

function defaultSelQ() {
  // 1-14: picks VACÍO (no preseleccionado)
  // 15: pleno con 0-0 por defecto
  return Array.from({ length: 15 }, (_, i) =>
    i === 14
      ? { n: 15, homeCat: "0" as GoalCat, awayCat: "0" as GoalCat }
      : { n: i + 1, picks: [] as Pick[] }
  );
}

function defaultSelG() {
  return Array.from({ length: 6 }, (_, i) => ({
    n: i + 1,
    home_goals: 0,
    away_goals: 0,
  }));
}

export default function NewBet() {
  const [type, setType] = useState<"Quiniela" | "Quinigol">("Quiniela");
  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [jornadaId, setJornadaId] = useState<string>("");

  const [matchesQ, setMatchesQ] = useState(defaultMatchesQ);
  const [matchesG, setMatchesG] = useState(defaultMatchesG);

  const [selQ, setSelQ] = useState<any[]>(defaultSelQ);
  const [selG, setSelG] = useState(defaultSelG);

  const [err, setErr] = useState<string | null>(null);

  // Precios siguen existiendo porque el backend los usa para calcular coste,
  // pero el usuario NO ve campos editables de coste (solo informativo).
  const basePrice = 0.75;
  const fixedPriceG = 1.0;

  const combos = useMemo(() => {
    if (type !== "Quiniela") return 1;
    return selQ.reduce((acc: number, s: any) => {
      if (s.n === 15) return acc;
      const picks = Array.isArray(s.picks) ? s.picks : [];
      return acc * Math.max(1, picks.length);
    }, 1);
  }, [selQ, type]);

  const cost = useMemo(() => {
    if (type === "Quiniela") return combos * basePrice;
    return fixedPriceG;
  }, [combos, type]);

  // Carga jornadas oficiales (creadas por admin)
  useEffect(() => {
    api.get("/jornadas?official=true").then((r) => setJornadas(r.data));
  }, []);

  // Al cambiar tipo, resetea selección y estado
  useEffect(() => {
    setErr(null);
    setJornadaId("");
    setMatchesQ(defaultMatchesQ());
    setMatchesG(defaultMatchesG());
    setSelQ(defaultSelQ());
    setSelG(defaultSelG());
  }, [type]);

  // Al seleccionar jornada, carga partidos y resetea selecciones
  useEffect(() => {
    if (!jornadaId) return;

    api.get("/jornadas/" + jornadaId).then((r) => {
      const j: Jornada = r.data;

      if (type === "Quiniela") {
        setMatchesQ(normalizeMatchesQ(j.matchesQuiniela || []));
        setSelQ(defaultSelQ());
      } else {
        setMatchesG(normalizeMatchesG(j.matchesQuinigol || []));
        setSelG(defaultSelG());
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jornadaId]);

  function normalizeMatchesQ(m: any[]) {
    const arr = Array.from({ length: 15 }, (_, i) => ({ n: i + 1, home: "", away: "" }));
    for (const x of m) {
      if (x.n >= 1 && x.n <= 15) arr[x.n - 1] = x;
    }
    return arr.map((a) => ({
      n: a.n,
      home: a.home || "Equipo local",
      away: a.away || "Equipo visitante",
    }));
  }

  function normalizeMatchesG(m: any[]) {
    const arr = Array.from({ length: 6 }, (_, i) => ({ n: i + 1, home: "", away: "" }));
    for (const x of m) {
      if (x.n >= 1 && x.n <= 6) arr[x.n - 1] = x;
    }
    return arr.map((a) => ({
      n: a.n,
      home: a.home || "Equipo local",
      away: a.away || "Equipo visitante",
    }));
  }

  function validateBeforeSave(): string | null {
    if (!jornadaId) return "Selecciona una jornada creada por el administrador.";

    if (type === "Quiniela") {
      for (let i = 1; i <= 14; i++) {
        const s = selQ[i - 1];
        const picks = Array.isArray(s?.picks) ? s.picks : [];
        if (picks.length === 0) return `Falta pronóstico en el partido ${i}.`;
      }
      const p15 = selQ[14];
      if (!p15?.homeCat || !p15?.awayCat) return "Completa el Pleno al 15 (goles Local y Visitante).";
    }

    return null;
  }

  async function saveBet() {
    setErr(null);

    const v = validateBeforeSave();
    if (v) {
      setErr(v);
      return;
    }

    const safeSelQ = selQ.map((s: any) => {
      if (s.n === 15) {
        return {
          n: 15,
          homeCat: (s.homeCat || "0") as GoalCat,
          awayCat: (s.awayCat || "0") as GoalCat,
        };
      }
      return {
        n: s.n,
        picks: Array.isArray(s.picks) ? s.picks : [],
      };
    });

    const payload: any = {
      jornadaId,
      type,
      basePriceEuro: basePrice,
      fixedPriceQuinigolEuro: fixedPriceG,
      selectionsQuiniela: type === "Quiniela" ? safeSelQ : undefined,
      selectionsQuinigol: type === "Quinigol" ? selG : undefined,
    };

    try {
      await api.post("/bets", payload);
      alert("Apuesta guardada.");
      if (type === "Quiniela") setSelQ(defaultSelQ());
      else setSelG(defaultSelG());
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail
          ? typeof e.response.data.detail === "string"
            ? e.response.data.detail
            : JSON.stringify(e.response.data.detail)
          : e?.message || "Error guardando apuesta";
      setErr(msg);
    }
  }

  function togglePick(n: number, pick: Pick) {
    setSelQ((prev) =>
      prev.map((s: any) => {
        if (s.n !== n) return s;
        if (n === 15) return s;
        const current = Array.isArray(s.picks) ? s.picks : [];
        const has = current.includes(pick);
        const picks = has ? current.filter((p: Pick) => p !== pick) : [...current, pick];
        return { ...s, picks };
      })
    );
  }

  function setPleno(side: "homeCat" | "awayCat", value: GoalCat) {
    setSelQ((prev) => prev.map((s: any) => (s.n === 15 ? { ...s, [side]: value } : s)));
  }

  return (
    <div>
      <div>
        <div className="text-3xl font-extrabold">NUEVA APUESTA</div>
        <div className="text-slate-400 mt-1">
          Selecciona una jornada creada por el administrador y registra tu apuesta
        </div>
      </div>

      <Card className="mt-6">
        <div className="font-bold">Configuración</div>

        {err && <div className="mt-3 text-sm text-red-400">{err}</div>}

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Tipo</div>
            <Select value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="Quiniela">La Quiniela</option>
              <option value="Quinigol">Quinigol</option>
            </Select>
          </div>

          <div className="lg:col-span-2">
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Jornada</div>
            <Select value={jornadaId} onChange={(e) => setJornadaId(e.target.value)}>
              <option value="">Selecciona jornada</option>
              {jornadas
                .filter((j) => (j.type === type || j.type === "Both") && j.isOfficial)
                .map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name ? j.name : `Jornada ${j.number ?? ""}`} · {j.season}
                  </option>
                ))}
            </Select>
            <div className="mt-2 text-xs text-slate-500">
              Solo se puede apostar en jornadas creadas por el administrador.
            </div>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="flex-1">
              <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Coste (€)</div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 font-bold tabular-nums">
                {cost.toFixed(2)} €
                {type === "Quiniela" && (
                  <span className="text-slate-500 text-xs font-normal"> · {combos} columnas</span>
                )}
              </div>
            </div>
            <Button variant="secondary" onClick={saveBet} disabled={!jornadaId}>
              Guardar
            </Button>
          </div>
        </div>
      </Card>

      <Card className="mt-6">
        <div className="font-bold">
          {type === "Quiniela" ? "Partidos (1-14) + Pleno al 15" : "Partidos Quinigol (6)"}
        </div>

        {!jornadaId && (
          <div className="mt-4 text-sm text-slate-500">
            Selecciona una jornada para cargar los partidos.
          </div>
        )}

        {jornadaId && type === "Quiniela" ? (
          <div className="mt-4 space-y-2">
            {matchesQ.map((m) => (
              <div
                key={m.n}
                className="grid grid-cols-12 gap-3 items-center rounded-xl border border-slate-800/60 bg-slate-950/40 px-3 py-3"
              >
                <div className="col-span-1 text-slate-500 text-sm">{m.n}</div>

                {/* SOLO LECTURA */}
                <div className="col-span-4">
                  <Input value={m.home} disabled />
                </div>

                <div className="col-span-3">
                  {m.n === 15 ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                          Pleno 15 (Local)
                        </div>
                        <Select
                          value={selQ[14].homeCat}
                          onChange={(e) => setPleno("homeCat", e.target.value as GoalCat)}
                        >
                          {(["0", "1", "2", "M"] as const).map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                          Pleno 15 (Visit.)
                        </div>
                        <Select
                          value={selQ[14].awayCat}
                          onChange={(e) => setPleno("awayCat", e.target.value as GoalCat)}
                        >
                          {(["0", "1", "2", "M"] as const).map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {(["1", "X", "2"] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => togglePick(m.n, p)}
                          className={clsx(
                            "rounded-xl border px-3 py-2 text-sm font-bold transition",
                            (Array.isArray(selQ[m.n - 1]?.picks) ? selQ[m.n - 1].picks : []).includes(p)
                              ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200"
                              : "bg-slate-950/60 border-slate-800 text-slate-200 hover:bg-slate-900/60"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* SOLO LECTURA */}
                <div className="col-span-4">
                  <Input value={m.away} disabled />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {jornadaId && type === "Quinigol" ? (
          <div className="mt-4 space-y-2">
            {matchesG.map((m) => (
              <div
                key={m.n}
                className="grid grid-cols-12 gap-3 items-center rounded-xl border border-slate-800/60 bg-slate-950/40 px-3 py-3"
              >
                <div className="col-span-1 text-slate-500 text-sm">{m.n}</div>

                {/* SOLO LECTURA */}
                <div className="col-span-4">
                  <Input value={m.home} disabled />
                </div>

                <div className="col-span-3 flex items-center justify-center gap-2">
                  <Input
                    className="text-center"
                    value={String(selG[m.n - 1].home_goals)}
                    onChange={(e) =>
                      setSelG((prev) =>
                        prev.map((s) =>
                          s.n === m.n ? { ...s, home_goals: Number(e.target.value || 0) } : s
                        )
                      )
                    }
                  />
                  <div className="text-slate-500">-</div>
                  <Input
                    className="text-center"
                    value={String(selG[m.n - 1].away_goals)}
                    onChange={(e) =>
                      setSelG((prev) =>
                        prev.map((s) =>
                          s.n === m.n ? { ...s, away_goals: Number(e.target.value || 0) } : s
                        )
                      )
                    }
                  />
                </div>

                {/* SOLO LECTURA */}
                <div className="col-span-4">
                  <Input value={m.away} disabled />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
