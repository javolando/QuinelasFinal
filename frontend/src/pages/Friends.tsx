import React, { useEffect, useState } from "react";
import { api } from "../app/api";
import { Card, Button, Input } from "../app/ui";
import clsx from "clsx";

export default function FriendsPage(){
  const [email, setEmail] = useState("");
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function load(){
    const [f, r, l] = await Promise.all([
      api.get("/friends"),
      api.get("/friends/requests"),
      api.get("/friends/leaderboard"),
    ]);
    setFriends(f.data);
    setRequests(r.data);
    setLeaderboard(l.data);
  }

  useEffect(()=>{ load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-extrabold">AMIGOS</div>
          <div className="text-slate-400 mt-1">Compara tus resultados con tus amigos</div>
        </div>

        <div className="flex gap-2">
          <Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email del amigo"/>
          <Button variant="secondary" onClick={async ()=>{
            setMsg(null);
            try{
              await api.post("/friends/request", { email });
              setEmail("");
              setMsg("Solicitud enviada.");
              await load();
            }catch(e:any){
              setMsg(e?.response?.data?.detail || "Error");
            }
          }}>Añadir amigo</Button>
        </div>
      </div>

      {msg && <div className="mt-3 text-sm text-slate-300">{msg}</div>}

      <Card className="mt-6">
        <div className="font-bold">Clasificación</div>
        <div className="text-slate-400 text-sm">Ordenado por balance neto</div>

        <div className="mt-4 space-y-2">
          {leaderboard.map((x:any, idx:number)=>(
            <div key={x.userId} className={clsx("flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-3",
              idx===0 && "shadow-neon"
            )}>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold">
                  {x.name.slice(0,1).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{x.name} <span className="text-slate-500 text-xs">({x.bets} apuestas)</span></div>
                  <div className="text-xs text-slate-500">{x.email}</div>
                </div>
              </div>

              <div className={clsx("font-bold tabular-nums", x.netBalance>=0 ? "text-emerald-400":"text-red-400")}>
                {x.netBalance.toFixed(2)} €
              </div>
            </div>
          ))}
          {leaderboard.length===0 && <div className="text-slate-500">No hay datos aún.</div>}
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="font-bold">Solicitudes pendientes</div>
          <div className="text-slate-400 text-sm">Acepta o rechaza</div>

          <div className="mt-4 space-y-2">
            {requests.map((r:any)=>(
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-3">
                <div>
                  <div className="font-semibold">{r.from.name}</div>
                  <div className="text-xs text-slate-500">{r.from.email}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={async ()=>{
                    await api.post("/friends/action", { requestId: r.id, action: "accept" });
                    await load();
                  }}>Aceptar</Button>
                  <Button variant="danger" onClick={async ()=>{
                    await api.post("/friends/action", { requestId: r.id, action: "reject" });
                    await load();
                  }}>Rechazar</Button>
                </div>
              </div>
            ))}
            {requests.length===0 && <div className="text-slate-500">No tienes solicitudes pendientes.</div>}
          </div>
        </Card>

        <Card>
          <div className="font-bold">Tus amigos</div>
          <div className="text-slate-400 text-sm">Lista de amigos aceptados</div>

          <div className="mt-4 space-y-2">
            {friends.map((f:any)=>(
              <div key={f.id} className="rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-3">
                <div className="font-semibold">{f.name}</div>
                <div className="text-xs text-slate-500">{f.email}</div>
              </div>
            ))}
            {friends.length===0 && <div className="text-slate-500">No tienes amigos añadidos.</div>}
          </div>
        </Card>
      </div>
    </div>
  )
}
