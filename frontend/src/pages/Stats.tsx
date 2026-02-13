import React, { useEffect, useState } from "react";
import { api } from "../app/api";
import { Card, StatCard } from "../app/ui";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Trophy, Target, Euro } from "lucide-react";

export default function StatsPage(){
  const [stats, setStats] = useState<any>(null);
  const [bets, setBets] = useState<any[]>([]);

  useEffect(()=>{
    api.get("/stats/me").then(r=>setStats(r.data));
    api.get("/bets").then(r=>setBets(r.data));
  },[]);

  const dist = Object.entries(
    bets.reduce((acc:any, b:any)=>{ acc[b.hits]= (acc[b.hits]||0)+1; return acc; }, {})
  ).map(([hits, count])=>({hits, count})).sort((a:any,b:any)=>Number(a.hits)-Number(b.hits));

  return (
    <div>
      <div>
        <div className="text-3xl font-extrabold">ESTADÍSTICAS</div>
        <div className="text-slate-400 mt-1">Análisis detallado de tus apuestas</div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Mejor quiniela" value={stats?.bestQuiniela ?? 0} icon={<Trophy className="text-yellow-400"/>}/>
        <StatCard label="Media aciertos" value={stats?.avgHitsQuiniela ?? 0} tone="info" icon={<Target className="text-sky-400"/>}/>
        <StatCard label="Pleno al 15" value={stats?.pleno15 ?? 0} tone="good" icon={<Target className="text-emerald-400"/>}/>
        <StatCard label="Total apuestas" value={stats?.totalBets ?? 0} icon={<Euro className="text-slate-300"/>}/>
      </div>

      <Card className="mt-6">
        <div className="font-bold">Distribución de aciertos</div>
        <div className="text-slate-400 text-sm">Número de apuestas por hits</div>
        <div className="h-[320px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dist}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hits" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
