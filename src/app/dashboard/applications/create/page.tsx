"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

const easeOut: any = [0.22, 1, 0.36, 1];

export default function CreateApplicationPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Please enter an application name.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Creation failed");
      }
      const id = data?.id as string;
      if (id) router.push(`/dashboard/applications/${id}`);
      else router.push("/dashboard/applications");
    } catch (err: any) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } }}
        className="mx-auto max-w-4xl rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_0_0_2px_rgba(220,38,38,0.06)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light tracking-tight">Create Application</h1>
            <p className="text-sm text-foreground/70">UI only. Functionality will be added later.</p>
          </div>
          <Link
            href="/dashboard/applications"
            className="text-[12px] text-foreground/70 underline-offset-4 hover:underline"
          >
            ← Back to Applications
          </Link>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-[12px] text-foreground/70">Application name</label>
            <input
              type="text"
              placeholder="e.g., PhotoPro Studio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-border/60 bg-background/40 px-3 py-2 text-[13px] text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),inset_0_0_0_2px_rgba(220,38,38,0.05)] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] text-foreground/70">Application description</label>
            <textarea
              placeholder="Write a short description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-border/60 bg-background/40 px-3 py-2 text-[13px] text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),inset_0_0_0_2px_rgba(220,38,38,0.05)] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-[12px] text-foreground/60">Other settings will be added later.</div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-[12px] font-light text-foreground hover:bg-primary/15 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Application"}
            </button>
          </div>

          {error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-[12px] text-red-200">
              {error}
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
