"use client";

import { easeOut, motion } from "framer-motion";
import Link from "next/link";
import { use as usePromise, useEffect, useState } from "react";

const fade = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
};

export default function LicenseLogsPage({ params }: { params: Promise<{ id: string; licenseId: string }> }) {
  const { id, licenseId } = usePromise(params);
  const [logs, setLogs] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/applications/${id}/licenses/${licenseId}/logs`, { cache: "no-store" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "Failed to load logs");
        }
        const data = await res.json();
        if (alive) setLogs(Array.isArray(data.logs) ? data.logs : []);
      } catch (e: any) {
        if (alive) setError(e?.message || "An error occurred");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, licenseId]);

  const formatDate = (d: any) => {
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return "-";
      return dt.toLocaleString();
    } catch { return "-"; }
  };

  return (
    <motion.section
      className="mx-auto max-w-5xl rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_0_0_2px_rgba(220,38,38,0.06)]"
      initial="hidden"
      animate="show"
      variants={fade}
    >
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-light tracking-tight">License Logs</h1>
        <div className="flex items-center gap-3">
          <Link href=".." className="text-[12px] text-foreground/70 underline-offset-4 hover:underline">← Back</Link>
          <Link href={`../../`} className="text-[12px] text-foreground/70 underline-offset-4 hover:underline">← App Licenses</Link>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-background/30">
        {loading ? (
          <div className="px-4 py-6 text-[12px] text-foreground/70">Loading...</div>
        ) : error ? (
          <div className="px-4 py-6 text-[12px] text-red-300">{error}</div>
        ) : logs.length === 0 ? (
          <div className="px-4 py-6 text-center text-[12px] text-foreground/60">No logs found</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid [grid-template-columns:minmax(200px,auto)_minmax(140px,auto)_minmax(160px,auto)_minmax(120px,auto)_minmax(1fr,1fr)] gap-0 border-b border-border/60 bg-background/40 px-3 py-2 text-[12px] text-foreground/70">
                <div>Time</div>
                <div>IP</div>
                <div>HWID</div>
                <div>Status</div>
                <div>Message</div>
              </div>
              <div className="divide-y divide-white/10">
                {logs.map((log: any) => (
                  <div key={log.id} className="grid [grid-template-columns:minmax(200px,auto)_minmax(140px,auto)_minmax(160px,auto)_minmax(120px,auto)_minmax(1fr,1fr)] items-center px-3 py-2 text-[12px]">
                    <div className="whitespace-nowrap">{formatDate(log.createdAt || log.time || log.date)}</div>
                    <div className="whitespace-nowrap text-foreground/80">{log.ip || '-'}</div>
                    <div className="whitespace-nowrap text-foreground/80">{log.hwid || '-'}</div>
                    <div className="whitespace-nowrap text-foreground/90">{String(log.status || '-')}</div>
                    <div className="text-foreground/80 truncate" title={log.message || ''}>{log.message || '-'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
