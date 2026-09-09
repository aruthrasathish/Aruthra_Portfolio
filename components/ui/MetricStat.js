"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// Splits "45%" -> ["", 45, "%"], "<50ms" -> ["<", 50, "ms"].
// Anything with digits left in the suffix (e.g. "3.97 / 4.00") stays static.
const NUMERIC = /^([<~+]?)(\d+(?:\.\d+)?)(.*)$/;

function parseValue(value) {
  const match = NUMERIC.exec(String(value).trim());
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  if (/\d/.test(suffix)) return null;
  const decimals = digits.includes(".") ? digits.split(".")[1].length : 0;
  return { prefix, target: parseFloat(digits), suffix, decimals };
}

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const DURATION = 900;

/**
 * A single number counts up once when it scrolls into view. Never loops.
 * Falls back to the literal string for non-numeric values or reduced motion.
 */
export function CountUpValue({ value, animate = true, className = "" }) {
  const ref = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const parsed = animate ? parseValue(value) : null;
  const [display, setDisplay] = useState(() =>
    parsed ? `${parsed.prefix}${(0).toFixed(parsed.decimals)}${parsed.suffix}` : value
  );

  useEffect(() => {
    if (!parsed || reducedMotion) {
      setDisplay(value);
      return;
    }
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    let start = 0;

    const step = (now) => {
      if (!start) start = now;
      const progress = Math.min((now - start) / DURATION, 1);
      const current = parsed.target * easeOutCubic(progress);
      setDisplay(
        `${parsed.prefix}${current.toFixed(parsed.decimals)}${parsed.suffix}`
      );
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          frame = requestAnimationFrame(step);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, animate, reducedMotion]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

/** Value + label pair used across Experience and Projects. */
export default function MetricStat({ metric, size = "md" }) {
  const valueClass =
    size === "lg"
      ? "text-2xl md:text-3xl font-semibold tracking-tight"
      : "text-xl font-semibold tracking-tight";

  return (
    <div className="min-w-0">
      <p className={valueClass} style={{ color: "var(--accent-light)" }}>
        <CountUpValue value={metric.value} animate={metric.animate !== false} />
      </p>
      <p
        className="text-xs mt-0.5 leading-snug"
        style={{ color: "var(--text-muted)" }}
      >
        {metric.label}
      </p>
    </div>
  );
}
