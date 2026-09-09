"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Scroll entrance primitive. Animates once, transform + opacity only.
 * Collapses to a plain div when the visitor prefers reduced motion.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 16,
  x = 0,
  className = "",
  as = "div",
  ...rest
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px 0px -60px 0px" });
  const reducedMotion = usePrefersReducedMotion();

  const MotionTag = motion[as] || motion.div;

  if (reducedMotion) {
    const Tag = as;
    return (
      <Tag ref={ref} className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, x }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : undefined}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

/** Section heading block used by every section, so spacing stays consistent. */
export function SectionHeading({ label, title, subtitle, id }) {
  return (
    <Reveal className="mb-10 md:mb-12">
      <p className="section-label">{label}</p>
      <h2 className="section-title" id={id}>
        {title}
      </h2>
      {subtitle ? <p className="section-subtitle max-w-2xl">{subtitle}</p> : null}
    </Reveal>
  );
}
