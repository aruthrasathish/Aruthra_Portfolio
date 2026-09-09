"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Award, GraduationCap } from "lucide-react";
import { SectionHeading } from "@/components/ui/Reveal";
import OrgLogo from "@/components/ui/OrgLogo";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { education } from "@/lib/data";

/** The rail draws itself as the section scrolls through. */
function TimelineRail({ containerRef }) {
  const reducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 65%"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div
      className="absolute left-4 md:left-6 top-2 bottom-2 w-px"
      style={{ background: "var(--border-default)" }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0 origin-top"
        style={{
          scaleY: reducedMotion ? 1 : scaleY,
          background:
            "linear-gradient(180deg, var(--accent) 0%, #8B5CF6 60%, rgba(236,72,153,0.5) 100%)",
        }}
      />
    </div>
  );
}

/**
 * Credential badge. The award badge links through to the Awards section,
 * where the same recognition gets a full card - it stays visible here as a
 * fast-scan signal without being the only place it appears.
 */
function CredentialBadge({ credential }) {
  const isAward = credential.href !== undefined;
  const Tag = isAward ? "a" : "span";

  return (
    <Tag
      {...(isAward ? { href: credential.href } : {})}
      className="credential-badge"
      data-interactive={isAward ? "true" : undefined}
    >
      {credential.icon === "award" ? (
        <Award className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      ) : null}
      <span className="text-sm font-semibold" style={{ color: "var(--accent-lighter)" }}>
        {credential.value}
      </span>
      <span
        className="text-[11px] uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }}
      >
        {credential.label}
      </span>
    </Tag>
  );
}

function EducationItem({ item, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const reducedMotion = usePrefersReducedMotion();

  // The award badge is a link into the Awards section.
  const credentials = item.credentials.map((credential) =>
    credential.label === "Recognition"
      ? { ...credential, href: "#awards", icon: "award" }
      : credential
  );

  return (
    <motion.article
      ref={ref}
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative pl-12 md:pl-16"
    >
      <motion.span
        className="absolute left-2.5 md:left-[18px] top-7 w-3 h-3 rounded-full border-2 z-10"
        initial={reducedMotion ? false : { scale: 0 }}
        animate={isInView ? { scale: 1 } : undefined}
        transition={{ duration: 0.35, delay: index * 0.1 + 0.15 }}
        style={{
          background: item.isCurrent ? "var(--accent)" : "var(--bg-base)",
          borderColor: item.isCurrent ? "var(--accent)" : "var(--border-hover)",
          boxShadow: item.isCurrent ? "0 0 0 4px var(--accent-dim)" : "none",
        }}
        aria-hidden="true"
      />

      <div className="card accent-card org-card p-5 md:p-6" style={{ "--proj-accent": "var(--accent)" }}>
        <div className="flex gap-4 items-start">
          <div className="org-card__logo">
            <OrgLogo
              src={item.logo}
              alt={`${item.school} logo`}
              monogram={item.monogram}
              size={52}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3
              className="font-semibold text-lg leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {item.degree}
            </h3>
            <p
              className="text-sm font-medium mt-1"
              style={{ color: "var(--accent-light)" }}
            >
              {item.school}
            </p>
            <p
              className="flex items-center gap-1.5 text-xs mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
              {item.dates}
            </p>
          </div>
        </div>

        {credentials.length > 0 && (
          <div className="flex flex-wrap gap-2.5 mt-4">
            {credentials.map((credential) => (
              <CredentialBadge key={credential.label} credential={credential} />
            ))}
          </div>
        )}

        <p
          className="text-sm mt-4 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {item.summary}
        </p>

        {item.highlights.length > 0 && (
          <ul className="mt-4 space-y-2.5">
            {item.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-3 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                <span
                  className="mt-[7px] w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "var(--accent)" }}
                  aria-hidden="true"
                />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.article>
  );
}

export default function Education() {
  const timelineRef = useRef(null);

  return (
    <section id="education" className="section section-band">
      <div className="container-main">
        <SectionHeading
          label="Education"
          title="Academic Background"
          subtitle="The foundation behind my work in software and AI/ML engineering."
        />

        <div ref={timelineRef} className="relative max-w-4xl">
          <TimelineRail containerRef={timelineRef} />
          <div className="space-y-6">
            {education.map((item, index) => (
              <EducationItem key={item.id} item={item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
