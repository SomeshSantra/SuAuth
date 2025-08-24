"use client";

import { motion, easeOut } from "framer-motion";

const fade = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

export default function DashboardPage() {
  return (
    <motion.section
      className="mx-auto max-w-6xl rounded-2xl border border-border/60 bg-card/40 p-8 backdrop-blur shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_0_0_2px_rgba(220,38,38,0.06)]"
      initial="hidden"
      animate="show"
      variants={fade}
    >
      <div className="space-y-3">
        <h1 className="text-2xl font-light tracking-tight">Dashboard</h1>
        <p className="text-sm text-foreground/70">This is the main overview. We will add sections and metrics here.</p>
      </div>

      {/* Stats Summary (UI only) */}
      <section className="mt-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Licenses", hint: "All", color: "text-foreground/80" },
            { label: "Active", hint: "Currently valid", color: "text-emerald-400" },
            { label: "Expiring ≤7d", hint: "Attention", color: "text-amber-400" },
            { label: "Revoked", hint: "Disabled", color: "text-red-400" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border/60 bg-background/40 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_0_0_2px_rgba(220,38,38,0.05)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-6 rounded bg-primary/70" />
                  <span className="text-[12px] text-foreground/60">{s.hint}</span>
                </div>
                <div className={`text-[11px] ${s.color}`}>●</div>
              </div>
              <div className="mt-3">
                <div className="text-[12px] text-foreground/70">{s.label}</div>
                <div className="mt-1 text-2xl font-light tracking-tight">—</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Removed Quick Create License: moved under Applications flow */}
    </motion.section>
  );
}
