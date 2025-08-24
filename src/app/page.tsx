"use client";
import { motion, easeOut } from "framer-motion";

export default function Home() {
  const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } } };
  const rise = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } } };

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <div className="ambient-overlay" />
      <main className="container mx-auto flex-grow px-4 pt-20 sm:px-6 lg:px-8">
        <motion.section initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.15 } } }} className="mx-auto max-w-4xl py-14 text-center">
          <motion.div variants={rise} className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/30 px-3.5 py-1 backdrop-blur">
            <span className="h-2 w-1 rounded-full bg-primary" />
            <span className="text-sm text-foreground/70 ">[ SuAuth ]</span>
            <span className="h-2 w-1 rounded-full bg-primary" />
          </motion.div>
          <motion.h1 variants={rise} className="mb-3 bg-clip-text text-5xl font-light tracking-tight text-transparent md:text-6xl" style={{ backgroundImage: "linear-gradient(180deg, #ffffff, #bdbdbd)" }}>
            licensing
          </motion.h1>
          <motion.p variants={fade} className="mx-auto mb-7 max-w-2xl text-[15px] leading-relaxed text-foreground/80">
            manage licenses in min keys validate sessions and secure access for ur users
          </motion.p>
          <motion.div variants={fade} className="flex justify-center gap-5">
            <motion.a whileHover={{ boxShadow: "0 0 0 1px rgba(220,38,38,0.35), 0 10px 30px rgba(220,38,38,0.08)", y: -1 }} transition={{ duration: 0.25, ease: easeOut }} href="/register" className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-light text-background">
              get started
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </motion.a>
            <motion.a whileHover={{ boxShadow: "0 0 0 1px rgba(220,38,38,0.25)", y: -1 }} transition={{ duration: 0.25, ease: easeOut }} href="#docs" className="inline-flex items-center gap-2 rounded-md border border-border bg-card/40 px-5 py-2.5 font-light text-foreground/90 backdrop-blur hover:bg-card">
              doc
            </motion.a>
          </motion.div>
        </motion.section>

        <motion.section id="features" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={{ show: { transition: { staggerChildren: 0.12 } } }} className="py-12">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <motion.div variants={fade} whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(220,38,38,0.05)" }} transition={{ duration: 0.25, ease: easeOut }} className="group rounded-xl border border-border/60 bg-card/40 p-5 backdrop-blur hover:bg-card/60">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                <span className="h-4 w-4 rounded-sm border border-primary/60" />
              </div>
              <h3 className="mb-0.5 text-lg font-light">License Keys</h3>
              <p className="text-sm text-foreground/70">Generate time-limited, device-locked, or unlimited keys.</p>
            </motion.div>
            <motion.div variants={fade} whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(220,38,38,0.05)" }} transition={{ duration: 0.25, ease: easeOut }} className="group rounded-xl border border-border/60 bg-card/40 p-5 backdrop-blur hover:bg-card/60">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                <span className="h-4 w-4 border-l border-t border-primary/60 rotate-45" />
              </div>
              <h3 className="mb-0.5 text-lg font-light">SDK Integration</h3>
              <p className="text-sm text-foreground/70">Drop-in client libraries and start validating instantly.</p>
            </motion.div>
            <motion.div variants={fade} whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(220,38,38,0.05)" }} transition={{ duration: 0.25, ease: easeOut }} className="group rounded-xl border border-border/60 bg-card/40 p-5 backdrop-blur hover:bg-card/60">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                <span className="h-4 w-4 rounded-full border border-primary/60" />
              </div>
              <h3 className="mb-0.5 text-lg font-light">Analytics</h3>
              <p className="text-sm text-foreground/70">Track active sessions, devices, and usage limits.</p>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
