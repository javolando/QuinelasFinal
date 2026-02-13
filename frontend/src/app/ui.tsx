import React from "react";
import clsx from "clsx";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={clsx(
      "rounded-2xl border border-slate-800/60 bg-slate-950/60 backdrop-blur shadow-lg",
      "p-5",
      className
    )}>
      {children}
    </div>
  )
}

export function StatCard({
  label, value, tone = "neutral", icon
}:{
  label: string;
  value: React.ReactNode;
  tone?: "good"|"bad"|"neutral"|"info";
  icon?: React.ReactNode;
}){
  const toneCls = tone === "good" ? "text-emerald-400" :
                  tone === "bad" ? "text-red-400" :
                  tone === "info" ? "text-sky-400" : "text-slate-100";
  return (
    <Card className="min-h-[110px]">
      <div className="flex items-start gap-3">
        <div className="mt-1 opacity-90">{icon}</div>
        <div className="flex-1">
          <div className="text-xs tracking-widest text-slate-400 uppercase">{label}</div>
          <div className={clsx("mt-2 text-3xl font-semibold tabular-nums", toneCls)}>{value}</div>
        </div>
      </div>
    </Card>
  )
}

export function Button({
  children, className, variant="primary", ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: "primary"|"secondary"|"danger"}){
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition border";
  const v = variant==="primary" ? "bg-sky-500/90 hover:bg-sky-500 border-sky-400/30 text-white" :
            variant==="secondary" ? "bg-emerald-500/90 hover:bg-emerald-500 border-emerald-400/30 text-white" :
            "bg-red-500/80 hover:bg-red-500 border-red-400/30 text-white";
  return <button className={clsx(base, v, className)} {...props}>{children}</button>
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm",
        "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30",
        props.className
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={clsx(
        "w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500/30",
        props.className
      )}
    />
  );
}
