"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const easeOut: any = [0.22, 1, 0.36, 1];

type AppItem = { id: string; name: string; description?: string; createdAt?: string };

export default function ApplicationsPage() {
  const [items, setItems] = useState<AppItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/applications", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Yüklenemedi");
        if (alive) setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (err: any) {
        if (alive) setError(err?.message || "Bir hata oluştu");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } }}
        className="mx-auto max-w-5xl rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_0_0_2px_rgba(220,38,38,0.06)]"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light tracking-tight">Applications</h1>
            <p className="text-sm text-foreground/70">Manage the apps that your licenses are scoped to.</p>
          </div>
          <Link
            href="/dashboard/applications/create"
            className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-[12px] font-light text-foreground hover:bg-primary/15"
          >
            + Create Application
          </Link>
        </div>

        <div className="mt-6">
          {loading && (
            <div className="rounded-xl border border-border/60 bg-background/30 p-6 text-center text-[13px] text-foreground/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),inset_0_0_0_2px_rgba(220,38,38,0.05)]">Yükleniyor...</div>
          )}
          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-center text-[13px] text-red-200">{error}</div>
          )}
          {!loading && !error && (items?.length ?? 0) === 0 && (
            <div className="rounded-xl border border-border/60 bg-background/30 p-6 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),inset_0_0_0_2px_rgba(220,38,38,0.05)]">
              <div className="mx-auto max-w-md space-y-2">
                <div className="text-[13px] text-foreground/70">
                  No applications yet. Create one to scope license keys per app and prevent cross-app key usage.
                </div>
                <Link
                  href="/dashboard/applications/create"
                  className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-[12px] font-light text-foreground hover:bg-primary/15"
                >
                  Create Application
                </Link>
              </div>
            </div>
          )}
          {!loading && !error && (items?.length ?? 0) > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {items!.map((app) => (
                <Link key={app.id} href={`/dashboard/applications/${app.id}`} className="block">
                  <div className="h-full rounded-xl border border-border/60 bg-background/30 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),inset_0_0_0_2px_rgba(220,38,38,0.05)] hover:border-primary/50 hover:bg-primary/5">
                    <div className="text-[13px] font-medium">{app.name}</div>
                    <div className="mt-1 line-clamp-2 text-[12px] text-foreground/70">{app.description || "—"}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
