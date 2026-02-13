import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../app/api";
import { Card, Button, Input, Select } from "../../app/ui";

type Mode = "quiniela" | "quinigol";

export default function AdminCreate(){
  const nav = useNavigate();
  const { mode } = useParams();
  const m = (mode === "quinigol" ? "quinigol" : "quiniela") as Mode;

  const [season, setSeason] = useState("2025/2026");
  const [numberTxt, setNumberTxt] = useState("41");
  const [name, setName] = useState("");

  const [matchesQ, setMatchesQ] = useState<any[]>(Array.from({length:15}, (_,i)=>({n:i+1, home:"Equipo local", away:"Equipo visitante"})));
  const [matchesG, setMatchesG] = useState<any[]>(Array.from({length:6}, (_,i)=>({n:i+1, home:"Equipo local", away:"Equipo visitante"})));

  const header = m === "quiniela" ? "Crear Quiniela" : "Crear Quinigol";

  const typeForApi = m === "quiniela" ? "Quiniela" : "Quinigol";

  const number = useMemo(()=>{
    const n = Number(numberTxt);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [numberTxt]);

  async function create(){
    const payload:any = {
      season,
      type: typeForApi,
      isOfficial: true,
      number: name.trim() ? undefined : number,
      name: name.trim() ? name.trim() : undefined,
    };
    if(m === "quiniela") payload.matchesQuiniela = matchesQ;
    if(m === "quinigol") payload.matchesQuinigol = matchesG;

    await api.post("/jornadas", payload);
    nav("/admin/results");
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-3xl font-extrabold">{header}</div>
        <div className="text-slate-400 mt-1">
          Crea una jornada oficial para que los usuarios la puedan seleccionar en “Nueva apuesta” y se autocompleten los equipos.
        </div>
      </div>

      <Card>
        <div className="font-bold">Configuración</div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Temporada</div>
            <Input value={season} onChange={e=>setSeason(e.target.value)} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Jornada (número)</div>
            <Input value={numberTxt} onChange={e=>setNumberTxt(e.target.value)} disabled={!!name.trim()} />
            <div className="text-xs text-slate-500 mt-1">Si rellenas “Nombre”, el número queda opcional.</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Nombre (opcional)</div>
            <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Copa del Rey + Premier League" />
          </div>
        </div>
      </Card>

      {m === "quiniela" && (
        <Card>
          <div className="font-bold">Partidos (1-14) + Pleno al 15</div>
          <div className="text-slate-400 text-sm">En el Pleno al 15 introduce los equipos igual; el resultado se mete en “Agregar resultados”.</div>

          <div className="mt-4 space-y-2">
            {matchesQ.map((mch)=>{
              const isP15 = mch.n === 15;
              return (
                <div key={mch.n} className="grid grid-cols-12 gap-3 items-center rounded-xl border border-slate-800/60 bg-slate-950/40 px-3 py-3">
                  <div className="col-span-1 text-slate-500 text-sm">{isP15 ? "P15" : mch.n}</div>
                  <div className="col-span-5"><Input value={mch.home} onChange={e=>setMatchesQ(prev=>prev.map(x=>x.n===mch.n? {...x, home:e.target.value}:x))}/></div>
                  <div className="col-span-1 text-center text-slate-500">vs</div>
                  <div className="col-span-5"><Input value={mch.away} onChange={e=>setMatchesQ(prev=>prev.map(x=>x.n===mch.n? {...x, away:e.target.value}:x))}/></div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {m === "quinigol" && (
        <Card>
          <div className="font-bold">Partidos (1-6)</div>
          <div className="mt-4 space-y-2">
            {matchesG.map((mch)=>(
              <div key={mch.n} className="grid grid-cols-12 gap-3 items-center rounded-xl border border-slate-800/60 bg-slate-950/40 px-3 py-3">
                <div className="col-span-1 text-slate-500 text-sm">{mch.n}</div>
                <div className="col-span-5"><Input value={mch.home} onChange={e=>setMatchesG(prev=>prev.map(x=>x.n===mch.n? {...x, home:e.target.value}:x))}/></div>
                <div className="col-span-1 text-center text-slate-500">vs</div>
                <div className="col-span-5"><Input value={mch.away} onChange={e=>setMatchesG(prev=>prev.map(x=>x.n===mch.n? {...x, away:e.target.value}:x))}/></div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex justify-end">
        <Button variant="secondary" onClick={create}>Guardar jornada oficial</Button>
      </div>
    </div>
  );
}
