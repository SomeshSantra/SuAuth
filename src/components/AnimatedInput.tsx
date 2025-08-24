"use client";

import { HTMLInputTypeAttribute, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, easeOut } from "framer-motion";

type Props = {
  id: string;
  name: string;
  type?: HTMLInputTypeAttribute;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  masked?: boolean;
  className?: string;
};

export default function AnimatedInput({
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  masked,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const display = useMemo(() => (masked ? "•".repeat(value.length) : value), [masked, value]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const el = inputRef.current;
    const container = containerRef.current;
    if (!el || !container) return;
    const onScroll = () => {
      container.style.setProperty("--scrollLeft", String(el.scrollLeft));
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className={`text-transparent caret-foreground ${className ?? ""}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {/* text */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none overflow-hidden px-3 py-2"
        style={{
        }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <div className="whitespace-pre text-[14px] leading-[1.5] text-foreground/90">
            {display.length === 0 ? (
              <span className="text-foreground/40">{placeholder}</span>
            ) : (
              [...display].map((ch, i) => (
                <motion.span
                  key={`${ch}-${i}-${display.length}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: easeOut } }}
                  exit={{ opacity: 0, y: -2, transition: { duration: 0.2 } }}
                >
                  {ch}
                </motion.span>
              ))
            )}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
