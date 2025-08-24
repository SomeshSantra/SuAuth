"use client";

import Link from "next/link";
import { motion, easeOut } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type AppItem = { id: string; name: string };

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [apps, setApps] = useState<AppItem[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/applications", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error();
        if (alive) setApps((Array.isArray(data?.items) ? data.items : []).map((d: any) => ({ id: d.id, name: d.name })));
      } catch {
        if (alive) setApps([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const appIdInPath = useMemo(() => {
    // only capture a 24-hex mongo ObjectId directly after /dashboard/applications/
    const m = pathname?.match(/\/dashboard\/applications\/([a-fA-F0-9]{24})(?:\b|\/|$)/);
    return m?.[1] || null;
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  const baseBtnCls =
    "group inline-flex w-full items-center gap-2 rounded-md border border-border/60 bg-background/40 px-3 py-2 text-left text-[13px] font-light text-foreground/85 backdrop-blur hover:border-primary/50 hover:bg-primary/5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_0_0_2px_rgba(220,38,38,0.06)]";

  return (
    <aside className="sticky left-0 top-0 flex h-dvh w-[220px] flex-col justify-between border-r border-border/60 bg-card/40 px-3 py-4 backdrop-blur shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),inset_0_0_0_2px_rgba(220,38,38,0.08)]">
      <div>
        {/* Brand */}
        <div className="mb-4 flex items-center gap-2 px-2">
          <div className="h-2.5 w-2.5 rounded-sm bg-primary shadow-[0_0_0_1px_rgba(220,38,38,0.35)]" />
          <span className="text-[12px] font-light tracking-wide text-foreground/80">Licensing Console</span>
        </div>

        {/* Nav */}
        <nav className="space-y-1">
          {/* Dashboard */}
          <Link href="/dashboard" className="block">
            <motion.button
              whileHover={{ y: -1, boxShadow: "0 0 0 1px rgba(220,38,38,0.35), 0 8px 24px rgba(220,38,38,0.08)" }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className={baseBtnCls + (isActive("/dashboard") ? " border-primary/60 bg-primary/5" : "")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-foreground/70 group-hover:text-primary">
                <path d="M4 13h6v7H4z" stroke="currentColor" strokeWidth="1.2" />
                <path d="M14 4h6v16h-6z" stroke="currentColor" strokeWidth="1.2" />
                <path d="M4 4h6v7H4z" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              <span>Dashboard</span>
            </motion.button>
          </Link>

          {/* Applications */}
          <div className="mt-3 px-2 text-[10px] uppercase tracking-[0.12em] text-foreground/45">Applications</div>
          <Link href="/dashboard/applications" className="block">
            <motion.button
              whileHover={{ y: -1, boxShadow: "0 0 0 1px rgba(220,38,38,0.35), 0 8px 24px rgba(220,38,38,0.08)" }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className={baseBtnCls + (isActive("/dashboard/applications") ? " border-primary/60 bg-primary/5" : "")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-foreground/70 group-hover:text-primary">
                <path d="M4 6h16" stroke="currentColor" strokeWidth="1.2" />
                <path d="M4 12h16" stroke="currentColor" strokeWidth="1.2" />
                <path d="M4 18h16" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              <span>My Applications</span>
            </motion.button>
          </Link>
          {!appIdInPath && (
            <Link href="/dashboard/applications/create" className="block">
              <motion.button
                whileHover={{ y: -1, boxShadow: "0 0 0 1px rgba(220,38,38,0.35), 0 8px 24px rgba(220,38,38,0.08)" }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.25, ease: easeOut }}
                className={baseBtnCls + (isActive("/dashboard/applications/create") ? " border-primary/60 bg-primary/5" : "")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-foreground/70 group-hover:text-primary">
                  <path d="M12 5v14" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <span>Create</span>
              </motion.button>
            </Link>
          )}

          {/* Created apps list */}
          {!appIdInPath && apps.length > 0 && (
            <div className="mt-1 space-y-1 pl-2">
              {apps.map((a) => {
                const href = `/dashboard/applications/${a.id}`;
                const active = pathname?.startsWith(href);
                return (
                  <Link key={a.id} href={href} className="block">
                    <button
                      className={
                        "w-full truncate rounded-md border border-border/50 bg-background/30 px-3 py-1.5 text-left text-[12px] text-foreground/80 hover:border-primary/50 hover:bg-primary/5 " +
                        (active ? " border-primary/60 bg-primary/5" : "")
                      }
                      title={a.name}
                    >
                      {a.name}
                    </button>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Contextual Settings for current application */}
          {appIdInPath && (
            <>
              <div className="mt-4 px-2 text-[10px] uppercase tracking-[0.12em] text-foreground/45">---- Settings ----</div>
              <Link href={`/dashboard/applications/${appIdInPath}`} className="block">
                <motion.button
                  whileHover={{ y: -1, boxShadow: "0 0 0 1px rgba(220,38,38,0.35), 0 8px 24px rgba(220,38,38,0.08)" }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                  className={baseBtnCls + (isActive(`/dashboard/applications/${appIdInPath}`) ? " border-primary/60 bg-primary/5" : "")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-foreground/70 group-hover:text-primary">
                    <path d="M12 6v12" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M6 12h12" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  <span>Overview</span>
                </motion.button>
              </Link>
              <Link href={`/dashboard/applications/${appIdInPath}/licenses`} className="block">
                <motion.button
                  whileHover={{ y: -1, boxShadow: "0 0 0 1px rgba(220,38,38,0.35), 0 8px 24px rgba(220,38,38,0.08)" }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                  className={baseBtnCls + (isActive(`/dashboard/applications/${appIdInPath}/licenses`) ? " border-primary/60 bg-primary/5" : "")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-foreground/70 group-hover:text-primary">
                    <path d="M4 7h16" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M4 12h16" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M4 17h10" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  <span>Licenses</span>
                </motion.button>
              </Link>
              <div className="pl-2">
                <Link href={`/dashboard/applications/${appIdInPath}/licenses/create`} className="block">
                  <motion.button
                    whileHover={{ y: -1, boxShadow: "0 0 0 1px rgba(220,38,38,0.35), 0 8px 24px rgba(220,38,38,0.08)" }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.25, ease: easeOut }}
                    className={baseBtnCls + (isActive(`/dashboard/applications/${appIdInPath}/licenses/create`) ? " border-primary/60 bg-primary/5" : "")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-foreground/70 group-hover:text-primary">
                      <path d="M12 5v14" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                    <span>Create</span>
                  </motion.button>
                </Link>
              </div>
              <Link href={`/dashboard/applications/${appIdInPath}/sdk`} className="block">
                <motion.button
                  whileHover={{ y: -1, boxShadow: "0 0 0 1px rgba(220,38,38,0.35), 0 8px 24px rgba(220,38,38,0.08)" }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                  className={baseBtnCls + (isActive(`/dashboard/applications/${appIdInPath}/sdk`) ? " border-primary/60 bg-primary/5" : "")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-foreground/70 group-hover:text-primary">
                    <path d="M5 5h14v10H5z" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M5 19h14" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  <span>SDK</span>
                </motion.button>
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Footer / reserved for logout button moved to page layout before; keep footer space */}
      <div className="px-1 pb-1 text-center text-[10px] text-foreground/40">©</div>
    </aside>
  );
}
