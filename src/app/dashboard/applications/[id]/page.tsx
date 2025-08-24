"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState, use as usePromise } from "react";

const easeOut: any = [0.22, 1, 0.36, 1];

type AppData = { id: string; name: string; description?: string; createdAt?: string; updatedAt?: string };

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [app, setApp] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/applications/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load");
        if (alive) setApp(data as AppData);
      } catch (err: any) {
        if (alive) setError(err?.message || "An error occurred");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  return (
    <div className="p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } }}
        className="mx-auto max-w-5xl rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_0_0_2px_rgba(220,38,38,0.06)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light tracking-tight">{app?.name || (loading ? "Loading..." : "Application")}</h1>
            <p className="text-sm text-foreground/70">Settings and license scope for this application.</p>
          </div>
          <Link href="/dashboard/applications" className="text-[12px] text-foreground/70 underline-offset-4 hover:underline">
            ← My Applications
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-background/30 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),inset_0_0_0_2px_rgba(220,38,38,0.05)]">
            <h2 className="text-[14px] font-light">Application Settings</h2>
            {loading && <div className="mt-3 text-[13px] text-foreground/60">Loading...</div>}
            {error && <div className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-[12px] text-red-200">{error}</div>}
            {!loading && !error && (
              <div className="mt-3 space-y-2 text-[13px] text-foreground/80">
                <div>
                  <span className="text-foreground/60">Name:</span> {app?.name || "—"}
                </div>
                <div>
                  <span className="text-foreground/60">Description:</span> {app?.description || "—"}
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button disabled className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-[12px] font-light text-foreground opacity-70">
                Save Changes
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/30 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),inset_0_0_0_2px_rgba(220,38,38,0.05)]">
            <h2 className="text-[14px] font-light">Scoped Actions</h2>
            <div className="mt-3 space-y-3 text-[13px] text-foreground/70">
              <div>Create license for this app</div>
              <div>View licenses (this app only)</div>
              <div>Rotate / Revoke keys</div>
            </div>
            <div className="mt-4 flex gap-2">
              <button disabled className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-[12px] opacity-70">Create License</button>
              <button disabled className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-[12px] opacity-70">View Licenses</button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
