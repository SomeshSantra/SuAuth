"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { use as usePromise, useEffect, useMemo, useRef, useState } from "react";

const easeOut: any = [0.22, 1, 0.36, 1];

type Me = { authenticated: boolean; uid?: string | null; email?: string | null };
type AppData = { id: string; name: string; description?: string; createdAt?: string; updatedAt?: string };

declare global {
  interface Window {
    hljs?: any;
  }
}

export default function SdkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [me, setMe] = useState<Me | null>(null);
  const [app, setApp] = useState<AppData | null>(null);
  const [lang, setLang] = useState<"javascript" | "python">("javascript");
  const codeRef = useRef<HTMLElement | null>(null);

  // Load user and app
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [meRes, appRes] = await Promise.all([
          fetch("/api/me", { cache: "no-store" }),
          fetch(`/api/applications/${id}`, { cache: "no-store" }),
        ]);
        const meData = await meRes.json();
        const appData = await appRes.json();
        if (alive) {
          setMe(meData as Me);
          setApp(appData as AppData);
        }
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  // Inject highlight.js CSS+JS from CDN and highlight on change
  useEffect(() => {
    // If already loaded, just highlight
    if (window.hljs) {
      if (codeRef.current) window.hljs.highlightElement(codeRef.current);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/atom-one-dark.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/common.min.js";
    script.async = true;
    script.onload = () => {
      if (window.hljs && codeRef.current) {
        window.hljs.highlightElement(codeRef.current);
      }
    };
    document.body.appendChild(script);

    return () => {
      // keep assets for subsequent visits; no cleanup
    };
  }, []);

  useEffect(() => {
    if (window.hljs && codeRef.current) {
      window.hljs.highlightElement(codeRef.current);
    }
  }, [lang, me, app]);

  const ownerId = me?.uid || "<ownerId>";
  const appId = app?.id || id;
  const appName = app?.name || "<appName>";
  const version = "1.0.0";

  const jsCode = useMemo(
    () => `import { SuauthClient } from "@suauth/sdk";

const client = new SuauthClient({
  ownerId: "${ownerId}",
  appId: "${appId}",
  appName: "${appName}",
  version: "${version}",
});

const result = await client.validateKey("suauth-xxxx-xxxx");
console.log(result);`,
    [ownerId, appId, appName]
  );

  const pyCode = useMemo(
    () => `from suauth import Client

client = Client(
    owner_id="${ownerId}",
    app_id="${appId}",
    app_name="${appName}",
    version="${version}"
)

result = client.validate_key("suauth-xxxx-xxxx")
print(result)`,
    [ownerId, appId, appName]
  );

  const codeText = lang === "javascript" ? jsCode : pyCode;

  return (
    <div className="p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } }}
        className="mx-auto max-w-4xl rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_0_0_2px_rgba(220,38,38,0.06)]"
      >
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-light tracking-tight">SDK</h1>
          <Link href={`/dashboard/applications/${id}`} className="text-[12px] text-foreground/70 underline-offset-4 hover:underline">
            ← App Overview
          </Link>
        </div>

        {/* Toggle buttons */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setLang("javascript")}
            className={
              "rounded-md border px-4 py-1.5 text-sm transition-colors font-medium " +
              (lang === "javascript"
                ? "border-primary/60 bg-primary/10 text-foreground"
                : "border-border/60 bg-background/40 text-foreground/80 hover:bg-background/60")
            }
          >
            JavaScript
          </button>
          <button
            onClick={() => setLang("python")}
            className={
              "rounded-md border px-4 py-1.5 text-sm transition-colors font-medium " +
              (lang === "python"
                ? "border-primary/60 bg-primary/10 text-foreground"
                : "border-border/60 bg-background/40 text-foreground/80 hover:bg-background/60")
            }
          >
            Python
          </button>
        </div>

        {/* Code block */}
        <pre className="overflow-auto rounded-lg border border-border/60 bg-black/80 p-4 text-[12px]">
          <code ref={codeRef as any} className={`language-${lang} font-mono font-semibold text-foreground/95`}>
            {codeText}
          </code>
        </pre>
      </motion.div>
    </div>
  );
}
