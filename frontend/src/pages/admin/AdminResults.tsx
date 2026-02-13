import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../app/api";
import { Card, Button, Input, Select } from "../../app/ui";

type GoalCat = "0"|"1"|"2"|"M";

type Jornada = {
  id: string;
  number?: number;
  name?: string;
  season: string;
  type: "Quiniela"|"Quinigol"|"Both";
  matchesQuiniela?: {n:number; home:string; away:string}[];
  matchesQuinigol?: {n:number; home:string; away:string}[];
  resultsQuiniela?: any[];
  resultsQuinigol?: any[];
  prizeTableQuiniela?: any;
  prizeTableQuinigol?: any;
};

export default function AdminResults(){
  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [selected, setSelected] = useState<Jornada | null>(null);

  const [matchesQ, setMatchesQ] = useState<any[]>(Array.from({length:15}, (_,i)=>({n:i+1, home:"Equipo local", away:"Equipo visitante"})));
  const [matchesG, setMatchesG] = useState<any[]>(Array.from({length:6}, (_,i)=>({n:i+1, home:"Equipo local", away:"Equipo visitante"})));

  const [resultsQ, setResultsQ] = useState<any[]>(Array.from({length:15}, (_,i)=> i===14 ? ({n:15, homeCat:"0", awayCat:"0"}) : ({n:i+1, result:"1"})));
  const [resultsG, setResultsG] = useState<any[]>(Array.from({length:6}, (_,i)=>({n:i+1, home_goals:0, away_goals:0})));

  const [prizeQ, setPrizeQ] = useState<any>({"10":0,"11":0,"12":0,"13":0,"14":0,"15":0});
  const [prizeG, setPrizeG] = useState<any>({"4":0,"5":0,"6":0});

  async function load(){
    const r = await api.get("/admin/jornadas");
    setJornadas(r.data || []);
  }
  useEffect(()=>{ load(); }, []);

  const quinielas = useMemo(()=> (jornadas||[]).filter(j=>j.type==="Quiniela"||j.type==="Both").slice(0,5), [jornadas]);
  const quinigoles = useMemo(()=> (jornadas||[]).filter(j=>j.type==="Quinigol"||j.type==="Both").slice(0,5), [jornadas]);

  function label(j:Jornada){
    const head = j.number ? `Jornada ${j.number}` : (j.name || "Jornada");
    return `${head} · ${j.season}`;
  }

  async function openJ(id:string){
    const r = await api.get("/jornadas/"+id);
    const j = r.data as Jornada;
    setSelected(j);
    if(j.matchesQuiniela) setMatchesQ(j.matchesQuiniela);
    if(j.matchesQuinigol) setMatchesG(j.matchesQuinigol);

    if(j.resultsQuiniela){
      const base = Array.from({length:15}, (_,i)=> i===14 ? ({n:15, homeCat:"0", awayCat:"0"}) : ({n:i+1, result:"1"}));
      for(const rr of j.resultsQuiniela){
        if(rr.n===15) base[14] = {n:15, homeCat: rr.homeCat || "0", awayCat: rr.awayCat || "0"};
        else base[rr.n-1] = {n: rr.n, result: rr.result || "1"};
      }
      setResultsQ(base);
    }
    if(j.resultsQuinigol) setResultsG(j.resultsQuinigol);

    if(j.prizeTableQuiniela) setPrizeQ(j.prizeTableQuiniela);
    if(j.prizeTableQuinigol) setPrizeG(j.prizeTableQuinigol);
  }

  async function save(){
    if(!selected) return;
    const payload:any = {};
    if(selected.type==="Quiniela"||selected.type==="Both") {
      payload.resultsQuiniela = resultsQ;
      payload.prizeTableQuiniela = prizeQ;
    }
    if(selected.type==="Quinigol"||selected.type==="Both") {
      payload.resultsQuinigol = resultsG;
      payload.prizeTableQuinigol = prizeG;
    }
    await api.put(`/admin/jornadas/${selected.id}/results`, payload);
    await openJ(selected.id);
    await load();
    alert("Resultados guardados. Apuestas recalculadas.");
  }

  const goalOptions: GoalCat[] = ["0","1","2","M"];

  return (
    <div className="space-y-4">
      <div>
        <div className="text-3xl font-extrabold">Agregar resultados</div>
        <div className="text-slate-400 mt-1">Elige una jornada (máximo 5 recientes por tipo). Al guardar, se recalculan automáticamente las apuestas.</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="font-bold">Quiniela (5 recientes)</div>
          <div className="mt-3 space-y-2">
            {quinielas.map(j=>(
              <button key={j.id} onClick={()=>openJ(j.id)} className="w-full text-left rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-3 hover:bg-slate-900/40 transition">
                <div className="font-semibold">{label(j)}</div>
              </button>
            ))}
            {quinielas.length===0 && <div className="text-slate-500">No hay quinielas oficiales aún.</div>}
          </div>
        </Card>

        <Card>
          <div className="font-bold">Quinigol (5 recientes)</div>
          <div className="mt-3 space-y-2">
            {quinigoles.map(j=>(
              <button key={j.id} onClick={()=>openJ(j.id)} className="w-full text-left rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-3 hover:bg-slate-900/40 transition">
                <div className="font-semibold">{label(j)}</div>
              </button>
            ))}
            {quinigoles.length===0 && <div className="text-slate-500">No hay quinigoles oficiales aún.</div>}
          </div>
        </Card>
      </div>

      {selected && (
        <div className="space-y-4">
          {(selected.type==="Quiniela"||selected.type==="Both") && (
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">Quiniela · {label(selected)}</div>
                  <div className="text-slate-400 text-sm">Partidos 1-14: 1/X/2 · Pleno al 15: goles (0/1/2/M)</div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {matchesQ.map(mch=>{
                  const isP15 = mch.n===15;
                  const r = resultsQ[mch.n-1];
                  return (
                    <div key={mch.n} className="grid grid-cols-12 gap-3 items-center rounded-xl border border-slate-800/60 bg-slate-950/40 px-3 py-3">
                      <div className="col-span-1 text-slate-500 text-sm">{isP15?"P15":mch.n}</div>
                      <div className="col-span-4"><Input value={mch.home} onChange={e=>setMatchesQ(prev=>prev.map(x=>x.n===mch.n? {...x, home:e.target.value}:x))}/></div>
                      <div className="col-span-3">
                        {!isP15 ? (
                          <Select value={r?.result || "1"} onChange={e=>setResultsQ(prev=>prev.map(rr=>rr.n===mch.n? {...rr, result:e.target.value}:rr))}>
                            <option value="1">1</option>
                            <option value="X">X</option>
                            <option value="2">2</option>
                          </Select>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Select value={r?.homeCat || "0"} onChange={e=>setResultsQ(prev=>prev.map(rr=>rr.n===15? {...rr, homeCat:e.target.value}:rr))}>
                              {goalOptions.map(o=><option key={o} value={o}>{o}</option>)}
                            </Select>
                            <div className="text-slate-500">-</div>
                            <Select value={r?.awayCat || "0"} onChange={e=>setResultsQ(prev=>prev.map(rr=>rr.n===15? {...rr, awayCat:e.target.value}:rr))}>
                              {goalOptions.map(o=><option key={o} value={o}>{o}</option>)}
                            </Select>
                          </div>
                        )}
                      </div>
                      <div className="col-span-4"><Input value={mch.away} onChange={e=>setMatchesQ(prev=>prev.map(x=>x.n===mch.n? {...x, away:e.target.value}:x))}/></div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5">
                <div className="font-bold">Tabla de premios (aciertos → €)</div>
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

          {(selected.type==="Quinigol"||selected.type==="Both") && (
            <Card>
              <div className="font-bold">Quinigol · {label(selected)}</div>

              <div className="mt-4 space-y-2">
                {matchesG.map(mch=>{
                  const r = resultsG[mch.n-1];
                  return (
                    <div key={mch.n} className="grid grid-cols-12 gap-3 items-center rounded-xl border border-slate-800/60 bg-slate-950/40 px-3 py-3">
                      <div className="col-span-1 text-slate-500 text-sm">{mch.n}</div>
                      <div className="col-span-4"><Input value={mch.home} onChange={e=>setMatchesG(prev=>prev.map(x=>x.n===mch.n? {...x, home:e.target.value}:x))}/></div>
                      <div className="col-span-3 flex items-center justify-center gap-2">
                        <Input className="text-center" value={String(r?.home_goals ?? 0)} onChange={e=>setResultsG(prev=>prev.map(rr=>rr.n===mch.n? {...rr, home_goals:Number(e.target.value||0)}:rr))}/>
                        <div className="text-slate-500">-</div>
                        <Input className="text-center" value={String(r?.away_goals ?? 0)} onChange={e=>setResultsG(prev=>prev.map(rr=>rr.n===mch.n? {...rr, away_goals:Number(e.target.value||0)}:rr))}/>
                      </div>
                      <div className="col-span-4"><Input value={mch.away} onChange={e=>setMatchesG(prev=>prev.map(x=>x.n===mch.n? {...x, away:e.target.value}:x))}/></div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5">
                <div className="font-bold">Tabla de premios (aciertos → €)</div>
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
            <Button variant="secondary" onClick={save}>Guardar resultados + recalcular</Button>
          </div>
        </div>
      )}
    </div>
  );
}
