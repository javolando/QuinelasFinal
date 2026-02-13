import React, { useEffect, useMemo, useState } from "react";
import { api } from "../app/api";
import { Card, Button, Input, Select } from "../app/ui";
import clsx from "clsx";

type Jornada = any;

export default function AdminPage(){
  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [selected, setSelected] = useState<Jornada | null>(null);

  // create form
  const [number, setNumber] = useState(1);
  const [season, setSeason] = useState("2025/2026");
  const [type, setType] = useState<"Quiniela"|"Quinigol"|"Both">("Quiniela");

  const [matchesQ, setMatchesQ] = useState<any[]>(Array.from({length:15}, (_,i)=>({n:i+1, home:"Equipo local", away:"Equipo visitante"})));
  const [matchesG, setMatchesG] = useState<any[]>(Array.from({length:6}, (_,i)=>({n:i+1, home:"Equipo local", away:"Equipo visitante"})));

  const [resultsQ, setResultsQ] = useState<any[]>(Array.from({length:15}, (_,i)=>({n:i+1, result:"1"})));
  const [resultsG, setResultsG] = useState<any[]>(Array.from({length:6}, (_,i)=>({n:i+1, home_goals:0, away_goals:0})));

  const [prizeQ, setPrizeQ] = useState<any>({"10":0,"11":0,"12":0,"13":0,"14":0,"15":0});
  const [prizeG, setPrizeG] = useState<any>({"4":0,"5":0,"6":0});

  async function load(){
    const r = await api.get("/admin/jornadas");
    setJornadas(r.data);
  }
  useEffect(()=>{ load(); }, []);

  async function createJornada(){
    const payload:any = { number, season, type, isOfficial: true };
    if(type==="Quiniela" || type==="Both") payload.matchesQuiniela = matchesQ;
    if(type==="Quinigol" || type==="Both") payload.matchesQuinigol = matchesG;
    const r = await api.post("/jornadas", payload);
    await load();
    alert("Jornada creada.");
  }

  async function openJ(id:string){
    const r = await api.get("/jornadas/"+id);
    setSelected(r.data);
    if(r.data.matchesQuiniela) setMatchesQ(r.data.matchesQuiniela);
    if(r.data.matchesQuinigol) setMatchesG(r.data.matchesQuinigol);
    if(r.data.resultsQuiniela) setResultsQ(r.data.resultsQuiniela);
    if(r.data.resultsQuinigol) setResultsG(r.data.resultsQuinigol);
    if(r.data.prizeTableQuiniela) setPrizeQ(r.data.prizeTableQuiniela);
    if(r.data.prizeTableQuinigol) setPrizeG(r.data.prizeTableQuinigol);
  }

  async function saveResults(){
    if(!selected) return;
    const payload:any = {};
    if(selected.type==="Quiniela" || selected.type==="Both") {
      payload.resultsQuiniela = resultsQ;
      payload.prizeTableQuiniela = prizeQ;
    }
    if(selected.type==="Quinigol" || selected.type==="Both") {
      payload.resultsQuinigol = resultsG;
      payload.prizeTableQuinigol = prizeG;
    }
    await api.put(`/admin/jornadas/${selected.id}/results`, payload);
    alert("Resultados guardados. Apuestas recalculadas.");
    await openJ(selected.id);
    await load();
  }

  return (
    <div>
      <div>
        <div className="text-3xl font-extrabold">ADMIN PANEL</div>
        <div className="text-slate-400 mt-1">Crear jornadas oficiales, partidos, resultados y premios</div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <div className="font-bold">Crear jornada</div>
          <div className="mt-4 space-y-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Número</div>
              <Input value={String(number)} onChange={e=>setNumber(Number(e.target.value||1))}/>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Temporada</div>
              <Input value={season} onChange={e=>setSeason(e.target.value)}/>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Tipo</div>
              <Select value={type} onChange={e=>setType(e.target.value as any)}>
                <option value="Quiniela">Quiniela</option>
                <option value="Quinigol">Quinigol</option>
                <option value="Both">Ambos</option>
              </Select>
            </div>

            <Button variant="secondary" className="w-full" onClick={createJornada}>Crear jornada oficial</Button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold">Jornadas</div>
              <div className="text-slate-400 text-sm">Selecciona una para editar resultados/premios</div>
            </div>
          </div>

          <div className="mt-4 space-y-2 max-h-[360px] overflow-auto pr-2">
            {jornadas.map(j=>(
              <button key={j.id} onClick={()=>openJ(j.id)}
                className={clsx("w-full text-left rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-3 hover:bg-slate-900/40 transition",
                  selected?.id===j.id && "shadow-neon"
                )}
              >
                <div className="font-semibold">Jornada {j.number} · {j.season} <span className="text-slate-500 text-xs">({j.type})</span></div>
                <div className="text-xs text-slate-500">
                  {j.resultsQuiniela || j.resultsQuinigol ? "Resultados: sí" : "Resultados: no"}
                </div>
              </button>
            ))}
            {jornadas.length===0 && <div className="text-slate-500">No hay jornadas aún.</div>}
          </div>
        </Card>
      </div>

      {selected && (
        <div className="mt-6 grid grid-cols-1 gap-4">
          {(selected.type==="Quiniela" || selected.type==="Both") && (
            <Card>
              <div className="font-bold">Quiniela · Resultados (1/X/2)</div>
              <div className="text-slate-400 text-sm">Al guardar se recalculan automáticamente todas las apuestas de esa jornada</div>

              <div className="mt-4 space-y-2">
                {matchesQ.map(m=>(
                  <div key={m.n} className="grid grid-cols-12 gap-3 items-center rounded-xl border border-slate-800/60 bg-slate-950/40 px-3 py-3">
                    <div className="col-span-1 text-slate-500 text-sm">{m.n}</div>
                    <div className="col-span-4">
                      <Input value={m.home} onChange={e=>setMatchesQ(prev=>prev.map(x=>x.n===m.n? {...x, home:e.target.value}:x))}/>
                    </div>
                    <div className="col-span-3">
                      <Select value={resultsQ[m.n-1]?.result || "1"} onChange={e=>setResultsQ(prev=>prev.map(r=>r.n===m.n? {...r, result:e.target.value}:r))}>
                        <option value="1">1</option>
                        <option value="X">X</option>
                        <option value="2">2</option>
                      </Select>
                    </div>
                    <div className="col-span-4">
                      <Input value={m.away} onChange={e=>setMatchesQ(prev=>prev.map(x=>x.n===m.n? {...x, away:e.target.value}:x))}/>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <div className="font-bold">Tabla de premios (hits → €)</div>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-6 gap-3">
                  {["10","11","12","13","14","15"].map(k=>(
                    <div key={k}>
                      <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">{k}</div>
                      <Input value={String(prizeQ[k] ?? 0)} onChange={e=>setPrizeQ((p:any)=>({...p, [k]: Number(e.target.value||0)}))}/>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {(selected.type==="Quinigol" || selected.type==="Both") && (
            <Card>
              <div className="font-bold">Quinigol · Resultados (marcador exacto)</div>

              <div className="mt-4 space-y-2">
                {matchesG.map(m=>(
                  <div key={m.n} className="grid grid-cols-12 gap-3 items-center rounded-xl border border-slate-800/60 bg-slate-950/40 px-3 py-3">
                    <div className="col-span-1 text-slate-500 text-sm">{m.n}</div>
                    <div className="col-span-4">
                      <Input value={m.home} onChange={e=>setMatchesG(prev=>prev.map(x=>x.n===m.n? {...x, home:e.target.value}:x))}/>
                    </div>
                    <div className="col-span-3 flex items-center justify-center gap-2">
                      <Input className="text-center" value={String(resultsG[m.n-1]?.home_goals ?? 0)} onChange={e=>setResultsG(prev=>prev.map(r=>r.n===m.n? {...r, home_goals:Number(e.target.value||0)}:r))}/>
                      <div className="text-slate-500">-</div>
                      <Input className="text-center" value={String(resultsG[m.n-1]?.away_goals ?? 0)} onChange={e=>setResultsG(prev=>prev.map(r=>r.n===m.n? {...r, away_goals:Number(e.target.value||0)}:r))}/>
                    </div>
                    <div className="col-span-4">
                      <Input value={m.away} onChange={e=>setMatchesG(prev=>prev.map(x=>x.n===m.n? {...x, away:e.target.value}:x))}/>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <div className="font-bold">Tabla de premios (hits → €)</div>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-6 gap-3">
                  {Object.keys(prizeG).map(k=>(
                    <div key={k}>
                      <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">{k}</div>
                      <Input value={String(prizeG[k] ?? 0)} onChange={e=>setPrizeG((p:any)=>({...p, [k]: Number(e.target.value||0)}))}/>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-slate-500 mt-2">Por defecto: 4/5/6 aciertos.</div>
              </div>
            </Card>
          )}

          <div className="flex justify-end">
            <Button variant="secondary" onClick={saveResults}>Guardar resultados + recalcular apuestas</Button>
          </div>
        </div>
      )}
    </div>
  )
}
