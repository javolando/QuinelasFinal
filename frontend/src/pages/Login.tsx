import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../app/auth";
import { Card, Button, Input } from "../app/ui";
import { Trophy } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("nada");
  const [password, setPassword] = useState("nada");
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 bg-grid bg-[size:32px_32px] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="text-emerald-400"><Trophy/></div>
          <div className="text-2xl font-extrabold">Quiniela <span className="text-slate-300">Pro</span></div>
        </div>

        <Card className="border-slate-800/70">
          <div className="text-xl font-bold">Iniciar sesión</div>
          <div className="text-slate-400 text-sm mt-1">Accede para gestionar tus quinielas y estadísticas.</div>

          <div className="mt-5 space-y-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Email</div>
              <Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com"/>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Contraseña</div>
              <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            </div>
            {err && <div className="text-red-400 text-sm">{err}</div>}
            <Button className="w-full" onClick={async ()=>{
              setErr(null);
              try{
                await login(email, password);
                nav("/");
              }catch(e:any){
                const d = e?.response?.data?.detail;
                setErr(typeof d === "string" ? d : (d ? JSON.stringify(d) : "Error de login"));
              }
            }}>Entrar</Button>

            <div className="text-sm text-slate-400">
              ¿No tienes cuenta? <Link className="text-sky-400 hover:underline" to="/register">Regístrate</Link>
            </div>
          </div>
        </Card>

        <div className="mt-4 text-xs text-slate-600">
          Tip: el admin por defecto es <span className="text-slate-400">secreto</span> / <span className="text-slate-400">jodete</span>.
        </div>
      </div>
    </div>
  );
}
