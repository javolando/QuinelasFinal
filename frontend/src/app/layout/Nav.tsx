import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { Trophy, LayoutDashboard, History, BarChart3, Users, PlusSquare, Shield, LogOut } from "lucide-react";
import clsx from "clsx";

const linkBase = "flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-900/60 transition";

export function TopNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userLinks = [
    { to: "/", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { to: "/new", label: "Nueva Apuesta", icon: <PlusSquare size={16} /> },
    { to: "/history", label: "Historial", icon: <History size={16} /> },
    { to: "/stats", label: "Estadísticas", icon: <BarChart3 size={16} /> },
    { to: "/friends", label: "Amigos", icon: <Users size={16} /> },
  ];

  const adminLinks = [
    { to: "/", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { to: "/admin/create/quiniela", label: "Crear Quiniela", icon: <PlusSquare size={16} /> },
    { to: "/admin/create/quinigol", label: "Crear Quinigol", icon: <PlusSquare size={16} /> },
    { to: "/admin/jornadas", label: "Todas las jornadas", icon: <History size={16} /> },
    { to: "/admin/results", label: "Agregar resultados", icon: <Shield size={16} /> },
  ];


  const links = user?.role === "admin" ? adminLinks : userLinks;

  return (
    <div className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 pr-2">
          <div className="text-emerald-400"><Trophy size={18} /></div>
          <div className="font-extrabold tracking-tight">QUINIELA <span className="text-slate-300">PRO</span></div>
        </div>

        <div className="flex-1 hidden md:flex items-center gap-2">
          {links.map(l => (
            <NavLink key={l.to} to={l.to}
              className={({isActive}) => clsx(linkBase, isActive && "bg-slate-900/70 text-white border border-slate-700/40")}
            >
              {l.icon}{l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-900/60 border border-slate-800/60 px-3 py-2">
            <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold">
              {(user?.name || "U").slice(0,1).toUpperCase()}
            </div>
            <div className="text-sm">{user?.name || "Invitado"}</div>
          </div>

          {user && (
            <button
              onClick={async () => { await logout(); navigate("/login"); }}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border border-slate-800/60 bg-slate-900/40 hover:bg-slate-900/70 transition"
              title="Cerrar sesión"
            >
              <LogOut size={16}/> <span className="hidden sm:inline">Salir</span>
            </button>
          )}
        </div>
      </div>

      <div className="md:hidden border-t border-slate-800/60">
        <div className="mx-auto max-w-7xl px-2 py-2 grid grid-cols-3 gap-2">
          {links.slice(0,3).map(l => (
            <NavLink key={l.to} to={l.to}
              className={({isActive}) => clsx("text-xs", linkBase, isActive && "bg-slate-900/70 text-white border border-slate-700/40")}
            >
              {l.icon}{l.label}
            </NavLink>
          ))}
        </div>
        <div className="mx-auto max-w-7xl px-2 pb-2 grid grid-cols-3 gap-2">
          {links.slice(3).map(l => (
            <NavLink key={l.to} to={l.to}
              className={({isActive}) => clsx("text-xs", linkBase, isActive && "bg-slate-900/70 text-white border border-slate-700/40")}
            >
              {l.icon}{l.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
