import React, { useEffect, useMemo, useState } from "react";
import { api } from "../app/api";
import { StatCard, Card } from "../app/ui";
import { useAuth } from "../app/auth";
import { TrendingDown, TrendingUp, Euro, Target, Trophy, Percent } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type Stats = {
  totalSpent: number;
  totalWon: number;
  netBalance: number;
  totalBets: number;
  avgHitsQuiniela: number;
  bestQuiniela: number;
  pleno15: number;
  bestQuinigol: number;
  byMonth: {month: string; net: number}[];
};

export default function Dashboard(){
  const [stats, setStats] = useState<Stats | null>(null);
  const { user } = useAuth();

  useEffect(()=>{
    const url = user?.role === "admin" ? "/stats/all" : "/stats/me";
    api.get(url).then(r=>setStats(r.data));
  },[user?.role]);

  const netTone = stats && stats.netBalance > 0 ? "good" : stats && stats.netBalance < 0 ? "bad" : "neutral";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-extrabold">DASHBOARD</div>
          <div className="text-slate-400 mt-1">
            {user?.role === "admin" ? "Resumen global (todos los usuarios)" : "Resumen de tus quinielas y estadísticas"}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Balance total" value={`${stats?.netBalance?.toFixed(2) ?? "0.00"} €`} tone={netTone as any}
          icon={stats && stats.netBalance >= 0 ? <TrendingUp className="text-emerald-400"/> : <TrendingDown className="text-red-400"/>}
        />
        <StatCard label="Total gastado" value={`${stats?.totalSpent?.toFixed(2) ?? "0.00"} €`} tone="neutral" icon={<Euro className="text-slate-300"/>}/>
        <StatCard label="Total ganado" value={`${stats?.totalWon?.toFixed(2) ?? "0.00"} €`} tone="good" icon={<Euro className="text-emerald-400"/>}/>
        <StatCard label="Media aciertos (Quiniela)" value={`${stats?.avgHitsQuiniela ?? 0}`} tone="info" icon={<Target className="text-sky-400"/>}/>
        <StatCard label="Mejor quiniela" value={`${stats?.bestQuiniela ?? 0}`} tone="neutral" icon={<Trophy className="text-yellow-400"/>}/>
        <StatCard label="Pleno al 15" value={`${stats?.pleno15 ?? 0}`} tone="good" icon={<Percent className="text-emerald-400"/>}/>
      </div>

      <Card className="mt-6">
        <div className="font-bold">Evolución mensual</div>
        <div className="text-slate-400 text-sm">Balance neto por mes</div>
        <div className="h-[320px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.byMonth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="net" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
