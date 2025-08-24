"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FormEvent, useState, use as usePromise } from "react";

const easeOut: any = [0.22, 1, 0.36, 1];

type CreateResponse = {
  ok: boolean;
  id: string;
  key: string;
  expiresAt: string | null;
};

export default function CreateLicensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateResponse | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    const fd = new FormData(e.currentTarget);
    const duration = String(fd.get("duration") || "");
    const hwidLimit = Number(fd.get("hwidLimit") || 1);
    const note = String(fd.get("note") || "").trim();
    if (!duration) {
      setError("Please enter a duration.");
      return;
    }
    if (!(hwidLimit >= 0 && hwidLimit <= 5)) {
      setError("HWID limit must be between 0 and 5.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/applications/${id}/licenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration, hwidLimit, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Creation failed");
      setResult(data as CreateResponse);
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
        className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_0_0_2px_rgba(220,38,38,0.06)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light tracking-tight">Create License</h1>
            <p className="text-sm text-foreground/70">Create a license by setting duration, HWID limit, and an optional note.</p>
          </div>
          <Link
            href={`/dashboard/applications/${id}/licenses`}
            className="text-[12px] text-foreground/70 underline-offset-4 hover:underline"
          >
            ← Licenses
          </Link>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground/80">Duration (Seconds)</label>
              <input
                type="number"
                name="duration"
                min="1"
                placeholder="e.g., 60 (1 minute)"
                className="w-full rounded-md border border-border/60 bg-background/30 px-3 py-2 text-sm text-foreground/90 shadow-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                required
              />
              <p className="text-xs text-foreground/50">
                Examples: 60 (1 minute), 3600 (1 hour), 86400 (1 day)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/80">Quick Options</label>
                <select
                  className="w-full rounded-md border border-border/60 bg-background/30 px-3 py-2 text-sm text-foreground/90 shadow-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  onChange={(e) => {
                    if (e.target.value) {
                      const form = e.target.closest('form');
                      const durationInput = form?.querySelector('input[name="duration"]') as HTMLInputElement;
                      if (durationInput) durationInput.value = e.target.value;
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">Quick Select</option>
                  <option value="60">1 Minute</option>
                  <option value="3600">1 Hour</option>
                  <option value="86400">1 Day</option>
                  <option value="604800">1 Week</option>
                  <option value="2592000">30 Days</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/80">HWID Limit (0-5)</label>
                <input
                  type="number"
                  name="hwidLimit"
                  min="0"
                  max="5"
                  defaultValue="1"
                  className="w-full rounded-md border border-border/60 bg-background/30 px-3 py-2 text-sm text-foreground/90 shadow-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground/80">Note (Optional)</label>
            <textarea
              name="note"
              rows={3}
              placeholder="License note..."
              className="w-full rounded-md border border-border/60 bg-background/30 px-3 py-2 text-sm text-foreground/90 shadow-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-[12px] text-red-200">{error}</div>
          )}

          {result && (
            <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-4">
              <div className="text-[12px] text-foreground/70">License created</div>
              <div className="mt-1 text-[13px]">
                <span className="text-foreground/60">Key:</span> <span className="font-mono">{result.key}</span>
              </div>
              <div className="text-[12px] text-foreground/60">
                {result.expiresAt ? `Expires: ${new Date(result.expiresAt).toLocaleString()}` : "Expires: Lifetime"}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Link
              href={`/dashboard/applications/${id}/licenses`}
              className="inline-flex items-center rounded-md border border-border/60 bg-background/30 px-4 py-2 text-[12px] text-foreground/80 hover:bg-background/50"
            >
              Back to List
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md bg-primary/90 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
            >
              {loading ? 'Creating license...' : 'Create License'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
