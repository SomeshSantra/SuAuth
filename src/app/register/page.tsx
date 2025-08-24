"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { motion, easeOut } from "framer-motion";
import AnimatedInput from "@/components/AnimatedInput";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fade = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
  };

  const formRef = useRef<HTMLFormElement | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const trimmedEmail = email.trim();
      if (!trimmedEmail || !password || !confirm) {
        // focus first invalid
        if (!trimmedEmail) (document.getElementById("email") as HTMLInputElement | null)?.focus();
        else if (!password) (document.getElementById("password") as HTMLInputElement | null)?.focus();
        else (document.getElementById("confirm") as HTMLInputElement | null)?.focus();
        throw new Error("Please fill in all fields.");
      }
      if (password !== confirm) {
        (document.getElementById("confirm") as HTMLInputElement | null)?.focus();
        throw new Error("Passwords do not match.");
      }
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password, confirm }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || "Failed to register.";
        throw new Error(msg);
      }
      // redirect on success
      window.location.assign("/");
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const strength = useMemo(() => {
    const pw = password;
    let score = 0;
    if (pw.length >= 8) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[a-z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
    const percent = Math.min(100, (score / 5) * 100);
    let label = "Weak";
    if (percent >= 80) label = "Strong";
    else if (percent >= 60) label = "Good";
    else if (percent >= 40) label = "Fair";
    return { percent, label };
  }, [password]);

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <div className="ambient-overlay" />
      <main className="container mx-auto flex-grow px-4 pt-20 sm:px-6 lg:px-8">
        <motion.section
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="mx-auto max-w-md"
        >
          <motion.div variants={fade} className="mb-6 text-center">
            <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/30 px-3.5 py-1 backdrop-blur">
              <span className="h-2 w-1 rounded-full bg-primary" />
              <span className="text-sm text-foreground/70">Register</span>
              <span className="h-2 w-1 rounded-full bg-primary" />
            </div>
            <h1 className="text-2xl font-light tracking-tight">Create your account</h1>
            <p className="mt-1 text-[13px] text-foreground/70">Start managing licenses instantly.</p>
          </motion.div>

          <motion.form
            ref={formRef}
            variants={fade}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setEmail("");
                setPassword("");
                setConfirm("");
                setError(null);
              } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
            onSubmit={onSubmit}
            className="rounded-xl border border-border/60 bg-card/40 p-5 backdrop-blur"
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-[12px] text-foreground/70">
                  Email
                </label>
                <AnimatedInput
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-md border border-border bg-background/60 px-3 py-2 text-[14px] outline-none placeholder:text-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary/30"
                  placeholder="you@example.com"
                  value={email}
                  onChange={setEmail}
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1 block text-[12px] text-foreground/70">
                  Password
                </label>
                <div className="relative">
                  <AnimatedInput
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="w-full rounded-md border border-border bg-background/60 px-3 py-2 pr-16 text-[14px] outline-none placeholder:text-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary/30"
                    placeholder="••••••••"
                    value={password}
                    onChange={setPassword}
                    masked={!showPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-2 my-auto h-7 rounded px-2 text-[12px] text-foreground/70 hover:text-foreground/90"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="mt-2">
                  <div className="h-1.5 w-full rounded bg-border/60">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${strength.percent}%` }}
                      transition={{ duration: 0.4, ease: easeOut }}
                      className="h-1.5 rounded bg-primary/70"
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-foreground/60">
                    <span>Password strength</span>
                    <span>{strength.label}</span>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="confirm" className="mb-1 block text-[12px] text-foreground/70">
                  Confirm password
                </label>
                <div className="relative">
                  <AnimatedInput
                    id="confirm"
                    name="confirm"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="w-full rounded-md border border-border bg-background/60 px-3 py-2 pr-16 text-[14px] outline-none placeholder:text-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary/30"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={setConfirm}
                    masked={!showConfirm}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute inset-y-0 right-2 my-auto h-7 rounded px-2 text-[12px] text-foreground/70 hover:text-foreground/90"
                    aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error ? (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: easeOut } }}
                  className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-[12px] text-foreground"
                >
                  {error}
                </motion.div>
              ) : null}

              <motion.button
                whileHover={{ y: -1, boxShadow: "0 0 0 1px rgba(220,38,38,0.35), 0 10px 30px rgba(220,38,38,0.08)" }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.25, ease: easeOut }}
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[14px] font-light text-background disabled:opacity-70"
              >
                {loading ? "Creating..." : "Create account"}
              </motion.button>
            </div>
          </motion.form>

          <motion.div variants={fade} className="mt-4 text-center">
            <p className="text-[12px] text-foreground/60">By continuing, you agree to our Terms and Privacy Policy.</p>
            <p className="mt-2 text-[12px] text-foreground/60">
              Already have an account? <a href="/login" className="border-b border-transparent text-foreground/70 hover:border-foreground/40 hover:text-foreground/90">Sign in</a>
            </p>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
}
