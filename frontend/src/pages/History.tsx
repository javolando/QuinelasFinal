import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../app/api";
import { Card, Select } from "../app/ui";
import clsx from "clsx";

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
};

export default function HistoryPage() {
  const nav = useNavigate();
  const [bets, setBets] = useState<Bet[]>([]);
  const [type, setType] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  async function load() {
    const q = new URLSearchParams();
    if (type) q.set("type", type);
    if (status) q.set("status", status);
    const r = await api.get("/bets?" + q.toString());
    setBets(r.data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, status]);

  return (
    <div>
      <div>
        <div className="text-3xl font-extrabold">HISTORIAL</div>
        <div className="text-slate-400 mt-1">
          Todas tus quinielas y quinigoles guardados
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">
            Tipo
          </div>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Todas</option>
            <option value="Quiniela">Quiniela</option>
            <option value="Quinigol">Quinigol</option>
          </Select>
        </Card>

        <Card>
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">
            Estado
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="calculated">Calculado</option>
          </Select>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">
              Apuestas
            </div>
            <div className="text-2xl font-bold">{bets.length}</div>
          </div>
        </Card>
      </div>

      <Card className="mt-5 p-0 overflow-hidden">
        <div className="grid grid-cols-12 gap-0 text-xs uppercase tracking-widest text-slate-500 border-b border-slate-800/60 px-5 py-3">
          <div className="col-span-2">Tipo</div>
          <div className="col-span-3">Fecha</div>
          <div className="col-span-2 text-right">Coste</div>
          <div className="col-span-2 text-right">Premio</div>
          <div className="col-span-2 text-right">Balance</div>
          <div className="col-span-1 text-right">Hits</div>
        </div>

        {bets.map((b) => (
          <button
            key={b.id}
            onClick={() => nav(`/bet/${b.id}`)}
            className="w-full text-left"
            title="Ver apuesta"
          >
            <div className="grid grid-cols-12 px-5 py-3 border-b border-slate-900/60 hover:bg-slate-900/40 transition">
              <div className="col-span-2 font-semibold">{b.type}</div>
              <div className="col-span-3 text-slate-300">
                {new Date(b.createdAt).toLocaleString()}
              </div>
              <div className="col-span-2 text-right tabular-nums">
                {b.costEuro.toFixed(2)} €
              </div>
              <div className="col-span-2 text-right tabular-nums">
                {b.prizeEuro.toFixed(2)} €
              </div>
              <div
                className={clsx(
                  "col-span-2 text-right tabular-nums font-semibold",
                  b.netBalanceEuro >= 0 ? "text-emerald-400" : "text-red-400"
                )}
              >
                {b.netBalanceEuro.toFixed(2)} €
              </div>
              <div className="col-span-1 text-right tabular-nums">{b.hits}</div>
            </div>
          </button>
        ))}

        {bets.length === 0 && (
          <div className="px-5 py-10 text-center text-slate-500">
            Aún no tienes apuestas guardadas.
          </div>
        )}
      </Card>
    </div>
  );
}
