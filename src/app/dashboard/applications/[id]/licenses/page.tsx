"use client";

import { motion, easeOut } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, use as usePromise } from "react";

const fade = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
};

export default function AppLicensesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [counts, setCounts] = useState({
    total: 0,
    expired: 0,
    banned: 0
  });
  const [licenses, setLicenses] = useState<Array<{
    id: string;
    key: string;
    createdAt: string | Date;
    ownerId: string;
    duration: string;
    status: string;
    expiresAt: string | Date | null;
    hwidLimit: number;
  }>>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openActionFor, setOpenActionFor] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/applications/${id}/licenses?page=${page}&pageSize=10`, { 
          cache: "no-store" 
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.error || "Failed to load license data");
        }
        
        const data = await res.json();
        if (alive) {
          setCounts({
            total: data.total || 0,
            expired: data.expired || 0,
            banned: data.banned || 0
          });
          setLicenses(Array.isArray(data.licenses) ? data.licenses : []);
          setTotalPages(Math.max(1, Number(data.totalPages || 1)));
        }
      } catch (err: any) {
        console.error("Error while loading license data:", err);
        if (alive) setError(err?.message || "An error occurred");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    
    return () => {
      alive = false;
    };
  }, [id, page]);

  const handleDelete = async (licenseId: string) => {
    if (!window.confirm('Are you sure you want to delete this license? This action cannot be undone.')) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/applications/${id}/licenses/${licenseId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Delete failed');
      }
      setOpenActionFor(null);
      const r = await fetch(`/api/applications/${id}/licenses?page=${page}&pageSize=10`, { cache: 'no-store' });
      const data = await r.json();
      setLicenses(Array.isArray(data.licenses) ? data.licenses : []);
      setCounts({ total: data.total || 0, expired: data.expired || 0, banned: data.banned || 0 });
      setTotalPages(Math.max(1, Number(data.totalPages || 1)));
    } catch (e: any) {
      alert(e?.message || 'An error occurred while deleting');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string | Date) => {
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return "-";
      return dt.toLocaleString();
    } catch {
      return "-";
    }
  };

  const plural = (n: number, one: string, many?: string) => `${n} ${n === 1 ? one : (many || one + 's')}`;
  const formatDuration = (secondsStr: string) => {
    const total = parseInt(secondsStr, 10);
    if (!Number.isFinite(total) || total <= 0) return secondsStr;
    if (total < 60) return plural(total, 'Second');
    const minutes = Math.floor(total / 60);
    if (minutes < 60) return plural(minutes, 'Minute');
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      const remMin = minutes % 60;
      return remMin ? `${plural(hours, 'Hour')} ${plural(remMin, 'Minute')}` : `${plural(hours, 'Hour')}`;
    }
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return remHours ? `${plural(days, 'Day')} ${plural(remHours, 'Hour')}` : `${plural(days, 'Day')}`;
  };

  const renderStatus = (lic: typeof licenses[number]) => {
    const now = new Date();
    if (lic.status === 'banned') return 'Banned';
    if (lic.expiresAt) {
      const exp = new Date(lic.expiresAt as any);
      if (!Number.isNaN(exp.getTime()) && exp < now) return 'Expired';
    }
    const s = (lic.status || 'active').toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  return (
    <>
    <motion.section
      className="mx-auto max-w-5xl rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_0_0_2px_rgba(220,38,38,0.06)]"
      initial="hidden"
      animate="show"
      variants={fade}
    >
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-light tracking-tight">Licenses</h1>
        <div className="flex items-center gap-3">
          <Link
            href="create"
            className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-[12px] text-foreground hover:bg-primary/15"
          >
            + Create License
          </Link>
          <Link href=".." className="text-[12px] text-foreground/70 underline-offset-4 hover:underline">
            ← Back to App Overview
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 text-center">
        <div className="rounded-xl border border-border/60 bg-background/30 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),inset_0_0_0_2px_rgba(220,38,38,0.05)]">
          <h3 className="text-[14px] font-light text-foreground/80">Total Licenses</h3>
          <p className="mt-2 text-2xl font-medium text-green-200">
            {loading ? '...' : counts.total}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/30 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),inset_0_0_0_2px_rgba(220,38,38,0.05)]">
          <h3 className="text-[14px] font-light text-foreground/80">Expired</h3>
          <p className="mt-2 text-2xl font-medium text-amber-400">
            {loading ? '...' : counts.expired}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/30 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),inset_0_0_0_2px_rgba(220,38,38,0.05)]">
          <h3 className="text-[14px] font-light text-foreground/80">Banned</h3>
          <p className="mt-2 text-2xl font-medium text-amber-400">
            {loading ? '...' : counts.banned}
          </p>
        </div>
      </div>

    </motion.section>

    <motion.section
      className="mx-auto mt-6 max-w-[90rem] rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_0_0_2px_rgba(220,38,38,0.06)]"
      initial="hidden"
      animate="show"
      variants={fade}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-light tracking-tight">License List</h2>
      </div>

      <div className="mt-2 overflow-x-auto rounded-xl border border-border/60 bg-background/20">
        <div className="min-w-[1080px]">
          <div className="grid [grid-template-columns:minmax(420px,1fr)_minmax(200px,auto)_minmax(220px,auto)_minmax(170px,auto)_minmax(110px,auto)_minmax(120px,auto)] gap-x-5 border-b border-border/60 bg-background/30 px-3 py-2 text-[12px] text-foreground/70">
            <div>License</div>
            <div>Created At</div>
            <div>Generated By</div>
            <div>Duration</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          {loading ? (
            <div className="px-3 py-4 text-[12px] text-foreground/70">Loading...</div>
          ) : error ? (
            <div className="px-3 py-4 text-[12px] text-red-300">{error}</div>
          ) : licenses.length === 0 ? (
            <div className="px-3 py-6 text-center text-[12px] text-foreground/60">No licenses found</div>
          ) : (
            <div className="divide-y divide-white/10">
              {licenses.map((lic) => (
                <div key={lic.id} className="grid [grid-template-columns:minmax(420px,1fr)_minmax(200px,auto)_minmax(220px,auto)_minmax(170px,auto)_minmax(110px,auto)_minmax(120px,auto)] items-center gap-x-5 px-3 py-3 text-[12px] hover:bg-background/30">
                  <div className="whitespace-nowrap font-mono text-foreground/90" title={lic.key}>{lic.key}</div>
                  <div className="whitespace-nowrap text-foreground/80">{formatDate(lic.createdAt)}</div>
                  <div className="whitespace-nowrap text-foreground/80" title={lic.ownerId}>{lic.ownerId}</div>
                  <div className="whitespace-nowrap text-foreground/80">{formatDuration(lic.duration)}</div>
                  <div className="whitespace-nowrap text-foreground/90">
                    {(() => {
                      const s = renderStatus(lic);
                      const low = s.toLowerCase();
                      const color = low === 'banned' ? 'text-red-300' : low === 'expired' ? 'text-amber-300' : 'text-emerald-300';
                      return <span className={`${color}`}>{s}</span>;
                    })()}
                  </div>
                  <div className="relative whitespace-nowrap text-right pl-3 ml-1 border-l border-white/10">
                    <button
                      className="rounded-md border border-border/60 bg-background/40 px-3 py-1.5 hover:bg-background/60"
                      onClick={() => setOpenActionFor((prev) => (prev === lic.id ? null : lic.id))}
                    >
                      Actions ▾
                    </button>
                    {openActionFor === lic.id && (
                      <div className="absolute right-0 top-full z-20 translate-y-1 w-32 overflow-hidden rounded-md border border-border/60 bg-background/95 shadow-lg text-[12px]">
                        <Link
                          href={`/dashboard/applications/${typeof window !== 'undefined' ? window.location.pathname.split('/')[3] : ''}/licenses/${lic.id}/logs`}
                          onClick={() => setOpenActionFor(null)}
                          className="block w-full px-2 py-1.5 text-left text-foreground/90 hover:bg-background/60"
                        >
                          Logs
                        </Link>
                        <button
                          className="block w-full border-t border-white/10 px-2 py-1.5 text-left text-red-200 hover:bg-red-400/10"
                          onClick={() => { setOpenActionFor(null); handleDelete(lic.id); }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-[12px]">
        <span className="text-foreground/70">Page {page} / {totalPages}</span>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-border/60 bg-background/40 px-3 py-1.5 text-foreground/80 hover:bg-background/60 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >
            ← Previous
          </button>
          <button
            className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-foreground hover:bg-primary/15 disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
          >
            Next →
          </button>
        </div>
      </div>
    </motion.section>
    </>
  );
}
