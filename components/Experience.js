"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Calendar } from "lucide-react";
import { SectionHeading } from "@/components/ui/Reveal";
import MetricStat from "@/components/ui/MetricStat";
import OrgLogo from "@/components/ui/OrgLogo";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { experiences } from "@/lib/data";

function TimelineRail({ containerRef }) {
  const reducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 75%", "end 60%"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div
      className="absolute left-4 md:left-6 top-2 bottom-2 w-px"
      style={{ background: "var(--border-default)" }}
      aria-hidden="true"
    >
      {/* The accent line draws itself as the section scrolls through. */}
      <motion.div
        className="absolute inset-0 origin-top"
        style={{
          scaleY: reducedMotion ? 1 : scaleY,
          background:
            "linear-gradient(180deg, var(--accent) 0%, #8B5CF6 55%, rgba(236,72,153,0.5) 100%)",
        }}
      />
    </div>
  );
}

function ExperienceItem({ experience, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-90px 0px -60px 0px" });
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.article
      ref={ref}
      initial={reducedMotion ? false : { opacity: 0, y: 22 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="relative pl-12 md:pl-16"
    >
      {/* Timeline node */}
      <motion.span
        className="absolute left-2.5 md:left-[18px] top-7 w-3 h-3 rounded-full border-2 z-10"
        initial={reducedMotion ? false : { scale: 0 }}
        animate={isInView ? { scale: 1 } : undefined}
        transition={{ duration: 0.35, delay: index * 0.08 + 0.15 }}
        style={{
          background: experience.current ? "var(--accent)" : "var(--bg-base)",
          borderColor: experience.current ? "var(--accent)" : "var(--border-hover)",
          boxShadow: experience.current ? "0 0 0 4px var(--accent-dim)" : "none",
        }}
        aria-hidden="true"
      />

      <div
        className="card accent-card org-card p-5 md:p-6"
        style={{ "--proj-accent": "var(--accent)" }}
      >
        {/* Identity row: logo, role, org, dates */}
        <div className="flex gap-4 items-start">
          {/* Wrapper carries the hover lift so the logo tile itself stays put
              in the layout and only its own transform changes. */}
          <div className="org-card__logo">
            <OrgLogo
              src={experience.logo}
              alt={`${experience.org} logo`}
              monogram={experience.monogram}
              size={52}
              scale={experience.logoScale}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h3
                className="font-semibold text-lg leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {experience.role}
              </h3>
              {experience.current ? (
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
                  style={{
                    background: "var(--success-dim)",
                    color: "var(--success)",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse-soft"
                    style={{ background: "var(--success)" }}
                  />
                  Current
                </span>
              ) : null}
            </div>

            <p
              className="text-sm font-medium mt-1"
              style={{ color: "var(--accent-light)" }}
            >
              {experience.org}
            </p>

            {experience.context ? (
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {experience.context}
              </p>
            ) : null}

            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                {experience.period}
              </span>
              <span className="chip-outline">{experience.type}</span>
            </div>
          </div>
        </div>

        {/* Impact metrics - the part a recruiter reads first */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5"
          style={{ borderTop: "1px solid var(--border-default)" }}
        >
          {experience.metrics.map((metric) => (
            <MetricStat key={metric.label} metric={metric} />
          ))}
        </div>

        <p
          className="text-sm mt-5 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {experience.summary}
        </p>

        <ul className="mt-4 space-y-2.5">
          {experience.bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex items-start gap-3 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              <span
                className="mt-[7px] w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: "var(--accent)" }}
                aria-hidden="true"
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        {experience.secondary?.length ? (
          <ul
            className="mt-4 pt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs"
            style={{
              borderTop: "1px solid var(--border-default)",
              color: "var(--text-muted)",
            }}
          >
            {experience.secondary.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </motion.article>
  );
}

export default function Experience() {
  const timelineRef = useRef(null);

  return (
    <section id="experience" className="section">
      <div className="container-main">
        <SectionHeading
          label="Experience"
          title="Where I've Built"
          subtitle="Research, Teaching, and Production Engineering Expertise"
        />

        <div ref={timelineRef} className="relative max-w-4xl">
          <TimelineRail containerRef={timelineRef} />
          <div className="space-y-6">
            {experiences.map((experience, index) => (
              <ExperienceItem
                key={experience.id}
                experience={experience}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
