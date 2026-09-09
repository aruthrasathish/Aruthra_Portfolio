"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { useMounted } from "@/hooks/useMounted";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/Icons";
import AnimatedAvatar from "@/components/AnimatedAvatar";
import { hero } from "@/lib/data";

/**
 * Hero.
 *
 * Left: the copy. Right: the animated avatar, and nothing else - the fake code
 * editor that used to sit here (and its floating technology tags) is gone.
 *
 * On mobile the running order is badge, the whole text block, then the avatar
 * last - the identity has to land before the character does. The left column
 * dissolves into the parent grid (`contents`) so `order` can arrange all three
 * as siblings. From lg it re-forms as two columns, weighted 7/5 so the full
 * name still sits on one line.
 */
export default function Hero() {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted ? resolvedTheme === "dark" : true;

  const fade = (delay) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
  });

  return (
    <section
      id="home"
      className="min-h-[92vh] lg:min-h-screen flex items-center px-4 md:px-8 lg:px-12 pt-24 pb-14"
    >
      <div className="container-main w-full">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="contents lg:block lg:col-span-7">
            <motion.div {...fade(0)} className="order-1 lg:order-none">
              <span
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] font-medium"
                style={{
                  background: "var(--success-dim)",
                  border: isDark
                    ? "1px solid rgba(52, 211, 153, 0.2)"
                    : "1px solid rgba(22, 101, 52, 0.15)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse-soft"
                  style={{ background: "var(--success)" }}
                />
                <span style={{ color: isDark ? "var(--success)" : "#166534" }}>
                  {hero.availability}
                </span>
              </span>
            </motion.div>

            <div className="order-2 lg:order-none">
              <motion.p
                {...fade(0.08)}
                className="text-base md:text-lg mt-7 lg:mt-6"
                style={{ color: "var(--text-muted)" }}
              >
                {hero.greeting}
              </motion.p>

              <motion.h1 {...fade(0.12)} className="hero-name mt-1">
                {hero.name}
              </motion.h1>

              <motion.p
                {...fade(0.18)}
                className="text-xl md:text-2xl font-medium mt-3"
                style={{ color: "var(--text-secondary)" }}
              >
                {hero.role}
              </motion.p>

              <motion.p
                {...fade(0.22)}
                className="text-sm md:text-base mt-2"
                style={{ color: "var(--accent-light)" }}
              >
                {hero.specialization}
              </motion.p>

              <motion.p
                {...fade(0.26)}
                className="text-base md:text-lg mt-5 max-w-lg leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                {hero.tagline}
              </motion.p>

              <motion.div {...fade(0.3)} className="flex flex-wrap gap-3 mt-8">
                <a href="#contact" className="btn-primary group">
                  Get in Touch
                  <ArrowRight className="w-4 h-4 cta-arrow" aria-hidden="true" />
                </a>
                <a href="#projects" className="btn-secondary group">
                  <LayoutGrid className="w-4 h-4" aria-hidden="true" />
                  View Projects
                </a>
              </motion.div>

              <motion.div {...fade(0.36)} className="flex items-center gap-4 mt-8">
                <a
                  href={hero.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: "var(--text-muted)" }}
                >
                  <GitHubIcon />
                  GitHub
                </a>
                <span style={{ color: "var(--border-default)" }} aria-hidden="true">
                  |
                </span>
                <a
                  href={hero.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: "var(--text-muted)" }}
                >
                  <LinkedInIcon />
                  LinkedIn
                </a>
              </motion.div>
            </div>
          </div>

          <div className="order-3 lg:order-none lg:col-span-5">
            <AnimatedAvatar avatar={hero.avatar} />
          </div>
        </div>
      </div>
    </section>
  );
}
