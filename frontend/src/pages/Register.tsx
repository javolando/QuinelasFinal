import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../app/auth";
import { Card, Button, Input } from "../app/ui";
import { Trophy } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 bg-grid bg-[size:32px_32px] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="text-emerald-400"><Trophy/></div>
          <div className="text-2xl font-extrabold">Quiniela <span className="text-slate-300">Pro</span></div>
        </div>

        <Card className="border-slate-800/70">
          <div className="text-xl font-bold">Crear cuenta</div>
          <div className="text-slate-400 text-sm mt-1">Solo necesitas nombre, email y contraseña.</div>

          <div className="mt-5 space-y-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Nombre</div>
              <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Javi"/>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Email</div>
              <Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com"/>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Contraseña</div>
              <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="mínimo 8 caracteres"/>
            </div>
            {err && <div className="text-red-400 text-sm">{err}</div>}
            <Button className="w-full" onClick={async ()=>{
              setErr(null);
              try{
                await register(name, email, password);
                nav("/");
              }catch(e:any){
                setErr(e?.response?.data?.detail || "Error de registro");
              }
            }}>Crear cuenta</Button>

            <div className="text-sm text-slate-400">
              ¿Ya tienes cuenta? <Link className="text-sky-400 hover:underline" to="/login">Entrar</Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
