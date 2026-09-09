"use client";

import { Server, Brain, Cloud } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { identity } from "@/lib/data";

const ICONS = { server: Server, brain: Brain, cloud: Cloud };

/**
 * About.
 *
 * Two columns, deliberately unequal: the copy takes ~59% of the content width
 * and the summary cards ~37%. The cards used to sit in the wider track, which
 * stretched three short lines into banners while squeezing the paragraphs into
 * a narrow ribbon. Swapping the weighting fixes both at once.
 *
 * A paragraph in `identity.body` is either a string or an array of segments,
 * where `{ mark: "..." }` marks a phrase for the purple highlight. The wording
 * lives entirely in lib/data.js; this only decides how it is painted.
 */

/** Renders one paragraph, wrapping any `{ mark }` segments for highlighting. */
function Paragraph({ content }) {
  const parts = Array.isArray(content) ? content : [content];

  return (
    <p
      className="text-base md:text-[17px] mt-5 leading-relaxed max-w-[62ch]"
      style={{ color: "var(--text-secondary)" }}
    >
      {parts.map((part, index) =>
        typeof part === "string" ? (
          part
        ) : (
          /* A span, not <mark>: the emphasis is visual, so it should not
             announce itself as a highlight to a screen reader. */
          <span key={index} className="about-mark">
            {part.mark}
          </span>
        )
      )}
    </p>
  );
}

export default function About() {
  const paragraphs = Array.isArray(identity.body)
    ? identity.body
    : [identity.body, identity.personal].filter(Boolean);

  return (
    <section id="about" className="section">
      <div className="container-main">
        {/*
          Explicit fr ratio rather than a 12-column split: 1.6/1 lands the copy
          at ~59% and the cards at ~37% of the container once the gap is taken
          out, which is the balance this section was missing.
        */}
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr] md:gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-12 items-start">
          <div className="min-w-0">
            <Reveal>
              <p className="section-label">About</p>
              <h2
                className="text-2xl sm:text-3xl lg:text-[2rem] font-semibold tracking-tight leading-snug"
                style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
              >
                {identity.lead}
              </h2>
            </Reveal>

            {paragraphs.map((content, index) => (
              <Reveal key={index} delay={0.08 + index * 0.06}>
                <Paragraph content={content} />
              </Reveal>
            ))}
          </div>

          {/* Always stacked - three short cards side by side read as a strip. */}
          <div className="grid gap-3.5 min-w-0">
            {identity.pillars.map((pillar, index) => {
              const Icon = ICONS[pillar.icon] || Server;
              return (
                <Reveal key={pillar.id} delay={0.1 + index * 0.07}>
                  <div
                    className="card accent-card px-4 py-3.5 flex gap-3 items-start"
                    style={{ "--proj-accent": "var(--accent)" }}
                  >
                    <span
                      className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg"
                      style={{
                        background: "var(--accent-dim)",
                        color: "var(--accent-light)",
                      }}
                    >
                      <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
                    </span>

                    <div className="min-w-0">
                      <h3
                        className="font-semibold text-[14.5px] leading-snug"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {pillar.title}
                      </h3>
                      <p
                        className="text-[13px] mt-1 leading-snug"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {pillar.description}
                      </p>
                      {pillar.tags?.length ? (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {pillar.tags.map((tag) => (
                            <span key={tag} className="tech-chip">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
