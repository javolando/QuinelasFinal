import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import { TopNav } from "./layout/Nav";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import NewBet from "../pages/NewBet";
import HistoryPage from "../pages/History";
import BetView from "../pages/BetView";
import StatsPage from "../pages/Stats";
import FriendsPage from "../pages/Friends";
import AdminCreate from "../pages/admin/AdminCreate";
import AdminResults from "../pages/admin/AdminResults";
import AdminJornadas from "../pages/admin/AdminJornadas";
import LegalPage from "../pages/Legal";
import PrivacyPage from "../pages/Privacy";

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}

function UserOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role === "admin") return <Navigate to="/admin/create/quiniela" replace />;
  return <>{children}</>;
}

function Shell({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-950 bg-grid bg-[size:32px_32px]">
      <TopNav />
      <div className="mx-auto max-w-7xl px-4 py-6">
        {children}

        <div className="mt-8 pt-4 border-t border-slate-800 text-xs text-slate-500 flex flex-wrap gap-2">
          <span>© {year} Quiniela Pro</span>
          <span>·</span>
          <a href="/legal" className="hover:text-slate-300">
            Aviso legal
          </a>
          <span>·</span>
          <a href="/privacy" className="hover:text-slate-300">
            Política de privacidad
          </a>
        </div>
      </div>
    </div>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>

        <Route path="/" element={
          <Protected><Shell><Dashboard/></Shell></Protected>
        }/>
        <Route path="/new" element={
          <Protected><UserOnly><Shell><NewBet/></Shell></UserOnly></Protected>
        }/>
        <Route path="/history" element={
          <Protected><Shell><HistoryPage/></Shell></Protected>
        }/>
        <Route path="/bet/:id" element={
          <Protected><Shell><BetView/></Shell></Protected>
        }/>
        <Route path="/admin/results" element={
          <Protected><AdminOnly><Shell><AdminResults/></Shell></AdminOnly></Protected>
        }/>
        <Route path="/stats" element={
          <Protected><Shell><StatsPage/></Shell></Protected>
        }/>
        <Route path="/friends" element={
          <Protected><Shell><FriendsPage/></Shell></Protected>
        }/>
        <Route path="/admin/create/:mode" element={
          <Protected><AdminOnly><Shell><AdminCreate/></Shell></AdminOnly></Protected>
        }/>
        <Route path="/admin/jornadas" element={
          <Protected><AdminOnly><Shell><AdminJornadas/></Shell></AdminOnly></Protected>
        }/>
        <Route path="/admin/results" element={
          <Protected><AdminOnly><Shell><AdminResults/></Shell></AdminOnly></Protected>
        }/>
        <Route path="/legal" element={
          <Protected><Shell><LegalPage/></Shell></Protected>
        }/>
        <Route path="/privacy" element={
          <Protected><Shell><PrivacyPage/></Shell></Protected>
        }/>



        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </AuthProvider>
  );
}
