import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../app/api";
import { Card, Button } from "../app/ui";
import clsx from "clsx";

type GoalCat = "0" | "1" | "2" | "M";

type Bet = {
  id: string;
  type: "Quiniela" | "Quinigol";
  jornadaId: string;
  createdAt: string;
  costEuro: number;
  prizeEuro: number;
  netBalanceEuro: number;
  hits: number;
  status: "pending" | "calculated";
  columns?: number;

  selectionsQuiniela?: { n: number; picks?: ("1" | "X" | "2")[]; homeCat?: GoalCat; awayCat?: GoalCat }[];
  selectionsQuinigol?: { n: number; home_goals: number; away_goals: number }[];
};

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

export default function BetView() {
  const { id } = useParams();
  const [bet, setBet] = useState<Bet | null>(null);
  const [jornada, setJornada] = useState<Jornada | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setErr(null);
        const r = await api.get(`/bets/${id}`);
        setBet(r.data);

        const jr = await api.get(`/jornadas/${r.data.jornadaId}`);
        setJornada(jr.data);
      } catch (e: any) {
        setErr(e?.response?.data?.detail || "No se pudo cargar la apuesta");
      }
    })();
  }, [id]);

  const header = useMemo(() => {
    if (!jornada) return "Jornada";
    const title = jornada.name ? jornada.name : `Jornada ${jornada.number ?? ""}`.trim();
    return `${title} · ${jornada.season}${jornada.isOfficial ? "" : " (Custom)"}`;
  }, [jornada]);

  if (err) {
    return (
      <Card className="max-w-3xl">
        <div className="text-xl font-bold">Apuesta</div>
        <div className="mt-2 text-red-400">{err}</div>
        <div className="mt-4">
          <Link to="/history">
            <Button variant="secondary">Volver</Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (!bet) {
    return (
      <Card className="max-w-3xl">
        <div className="text-xl font-bold">Apuesta</div>
        <div className="mt-2 text-slate-400">Cargando…</div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-3xl font-extrabold">APUESTA</div>
          <div className="text-slate-400 mt-1">
            {bet.type} · {header}
          </div>
        </div>
        <Link to="/history">
          <Button variant="secondary">Volver</Button>
        </Link>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">Fecha</div>
            <div className="mt-1 font-semibold">{new Date(bet.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">Coste</div>
            <div className="mt-1 font-semibold tabular-nums">{bet.costEuro.toFixed(2)} €</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">Premio</div>
            <div className="mt-1 font-semibold tabular-nums">{bet.prizeEuro.toFixed(2)} €</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">Balance</div>
            <div
              className={clsx(
                "mt-1 font-semibold tabular-nums",
                bet.netBalanceEuro >= 0 ? "text-emerald-400" : "text-red-400"
              )}
            >
              {bet.netBalanceEuro.toFixed(2)} €
            </div>
          </div>
        </div>
      </Card>

      {bet.type === "Quiniela" ? (
        <Card>
          <div className="font-bold">Selección (solo lectura)</div>
          <div className="mt-4 space-y-2">
            {(jornada?.matchesQuiniela ?? Array.from({ length: 15 }, (_, i) => ({ n: i + 1, home: "Equipo local", away: "Equipo visitante" }))).map((m) => {
              const s = (bet.selectionsQuiniela ?? []).find((x) => x.n === m.n);
              return (
                <div
                  key={m.n}
                  className="grid grid-cols-12 gap-3 items-center rounded-xl border border-slate-800/60 bg-slate-950/40 px-3 py-3"
                >
                  <div className="col-span-1 text-slate-500 text-sm">{m.n}</div>
                  <div className="col-span-4 text-slate-200">{m.home}</div>

                  <div className="col-span-3">
                    {m.n === 15 ? (
                      <div className="text-sm font-bold text-slate-200">
                        Pleno 15:{" "}
                        <span className="text-emerald-300">
                          {(s?.homeCat ?? "-")}-{(s?.awayCat ?? "-")}
                        </span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {(["1", "X", "2"] as const).map((p) => (
                          <div
                            key={p}
                            className={clsx(
                              "rounded-xl border px-3 py-2 text-sm font-bold",
                              (s?.picks ?? []).includes(p)
                                ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200"
                                : "bg-slate-950/60 border-slate-800 text-slate-500"
                            )}
                          >
                            {p}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="col-span-4 text-slate-200 text-right">{m.away}</div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="font-bold">Selección (solo lectura)</div>
          <div className="mt-4 space-y-2">
            {(jornada?.matchesQuinigol ?? Array.from({ length: 6 }, (_, i) => ({ n: i + 1, home: "Equipo local", away: "Equipo visitante" }))).map((m) => {
              const s = (bet.selectionsQuinigol ?? []).find((x) => x.n === m.n);
              return (
                <div
                  key={m.n}
                  className="grid grid-cols-12 gap-3 items-center rounded-xl border border-slate-800/60 bg-slate-950/40 px-3 py-3"
                >
                  <div className="col-span-1 text-slate-500 text-sm">{m.n}</div>
                  <div className="col-span-4 text-slate-200">{m.home}</div>
                  <div className="col-span-3 text-center font-bold tabular-nums text-emerald-300">
                    {(s?.home_goals ?? 0)} - {(s?.away_goals ?? 0)}
                  </div>
                  <div className="col-span-4 text-slate-200 text-right">{m.away}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
