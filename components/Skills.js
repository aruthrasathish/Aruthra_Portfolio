"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal, { SectionHeading } from "@/components/ui/Reveal";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { skills, skillFilters } from "@/lib/data";

/**
 * Skills.
 *
 * A filterable grid of compact rows: name, proficiency bar, percentage. The
 * previous version listed every technology with the projects it appeared in,
 * which was honest but heavy - four dense cards of prose that nobody scans.
 *
 * The bars are self-assessments; the scale is documented in lib/data.js.
 */
export default function Skills() {
  const [filter, setFilter] = useState("all");
  const reducedMotion = usePrefersReducedMotion();

  /* A skill's `category` is an id or an array of ids, so one object can sit in
     more than one tab without being duplicated in All. */
  const visible = useMemo(
    () =>
      filter === "all"
        ? skills
        : skills.filter((skill) =>
            Array.isArray(skill.category)
              ? skill.category.includes(filter)
              : skill.category === filter
          ),
    [filter]
  );

  return (
    <section id="skills" className="section section-band">
      <div className="container-main">
        <SectionHeading
          label="Skills"
          title="Technical Strengths"
        />

        {/* Tabs. Horizontally scrollable below sm so five never clip. */}
        <Reveal className="mb-8">
          <div
            className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:flex-wrap sm:overflow-visible"
            role="tablist"
            aria-label="Skill categories"
          >
            {skillFilters.map((option) => {
              const active = filter === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(option.id)}
                  className="flex-shrink-0 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-200"
                  style={{
                    background: active ? "var(--accent-dim)" : "var(--bg-surface)",
                    border: `1px solid ${
                      active ? "var(--accent)" : "var(--border-default)"
                    }`,
                    color: active
                      ? "var(--accent-lighter)"
                      : "var(--text-secondary)",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5"
          role="tabpanel"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((skill, index) => (
              <motion.div
                key={skill.name}
                layout={!reducedMotion}
                initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{
                  duration: 0.22,
                  // A small stagger so a filter change reads as a reflow
                  // rather than a flash, capped so late rows are not slow.
                  delay: reducedMotion ? 0 : Math.min(index, 12) * 0.015,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="skill-item"
              >
                <div className="flex items-baseline justify-between gap-2">
                  {/* Wraps rather than truncating: some labels are long enough
                      that an ellipsis would hide which skill it is. */}
                  <span
                    className="text-sm font-medium leading-snug min-w-0"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {skill.name}
                  </span>
                  <span
                    className="text-xs font-semibold tabular-nums flex-shrink-0"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {skill.level}%
                  </span>
                </div>

                <div
                  className="skill-track mt-2"
                  role="meter"
                  aria-valuenow={skill.level}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${skill.name} proficiency`}
                >
                  <motion.span
                    className="skill-fill"
                    initial={reducedMotion ? false : { width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{
                      duration: reducedMotion ? 0 : 0.7,
                      delay: reducedMotion ? 0 : 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
