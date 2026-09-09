"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const STEP_MS = 170;

/**
 * Data-driven pipeline diagram, rendered as an ordered list of stages.
 *
 * Two things make it explanatory rather than decorative:
 *  - a one-shot "signal sweep" lights each stage in order, so you can see
 *    which way data actually flows;
 *  - hovering or focusing a stage highlights it and its immediate neighbours,
 *    i.e. what feeds it and what it feeds.
 *
 * Highlight state is written straight to `data-state` attributes instead of
 * React state: a sweep ticks every 170ms across several cards, and none of it
 * changes the tree - only the styling of nodes that already exist.
 *
 * Semantics: <ol> because the stages are genuinely ordered. The prose
 * architecture string is exposed to screen readers, so nothing depends on hover.
 */
export default function ArchitectureFlow({
  flow,
  architecture,
  variant = "cover",
  pulseSignal = 0,
  label,
}) {
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef(null);
  const nodeRefs = useRef([]);
  const hoveredRef = useRef(null);
  const sweepRef = useRef(-1);
  const timerRef = useRef(null);

  const isDetail = variant === "detail";

  // Single place that decides what every node looks like right now.
  const paint = useCallback(() => {
    const hovered = hoveredRef.current;
    const sweep = sweepRef.current;

    nodeRefs.current.forEach((node, index) => {
      if (!node) return;
      let state = "idle";
      if (hovered !== null) {
        if (index === hovered) state = "active";
        else if (Math.abs(index - hovered) === 1) state = "adjacent";
        else state = "dim";
      } else if (sweep === index) {
        state = "active";
      } else if (sweep === index - 1 || sweep === index + 1) {
        state = "adjacent";
      }
      node.dataset.state = state;
    });
  }, []);

  const runSweep = useCallback(() => {
    if (reducedMotion || !flow?.length) return;
    clearInterval(timerRef.current);
    let index = 0;
    sweepRef.current = 0;
    paint();

    timerRef.current = setInterval(() => {
      index += 1;
      if (index >= flow.length) {
        clearInterval(timerRef.current);
        timerRef.current = setTimeout(() => {
          sweepRef.current = -1;
          paint();
        }, 320);
        return;
      }
      sweepRef.current = index;
      paint();
    }, STEP_MS);
  }, [flow, reducedMotion, paint]);

  // Sweep once when the diagram first scrolls into view.
  useEffect(() => {
    const node = containerRef.current;
    if (!node || reducedMotion) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          runSweep();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [runSweep, reducedMotion]);

  // Replay when the parent card is hovered or the panel is expanded.
  useEffect(() => {
    if (pulseSignal > 0) runSweep();
  }, [pulseSignal, runSweep]);

  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      clearTimeout(timerRef.current);
    },
    []
  );

  if (!flow?.length) return null;

  const setHovered = (index) => {
    hoveredRef.current = index;
    paint();
  };

  return (
    <div ref={containerRef} className="arch-flow" data-variant={variant}>
      <ol
        className={
          isDetail
            ? "flex flex-col md:flex-row md:flex-wrap md:items-stretch gap-1.5"
            : "flex flex-wrap items-center gap-x-1 gap-y-1.5"
        }
        aria-label={label || "System architecture pipeline"}
      >
        {flow.map((stage, index) => (
          <li
            key={stage.id}
            className={
              isDetail
                ? "flex flex-col items-start md:flex-row md:items-center min-w-0"
                : "flex items-center min-w-0"
            }
          >
            <div
              ref={(node) => {
                nodeRefs.current[index] = node;
              }}
              className={`arch-node ${isDetail ? "arch-node--detail" : ""}`}
              data-state="idle"
              tabIndex={isDetail ? 0 : undefined}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              onFocus={isDetail ? () => setHovered(index) : undefined}
              onBlur={isDetail ? () => setHovered(null) : undefined}
            >
              <span className="arch-node__label">{stage.label}</span>
              {isDetail && stage.meta ? (
                <span className="arch-node__meta">{stage.meta}</span>
              ) : null}
            </div>

            {index < flow.length - 1 ? (
              <span className="arch-connector" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14m0 0l-5-5m5 5l-5 5"
                  />
                </svg>
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      {architecture ? <p className="sr-only">{architecture}</p> : null}
    </div>
  );
}
