"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Reveal, { SectionHeading } from "@/components/ui/Reveal";
import { certifications } from "@/lib/data";

/**
 * Supporting evidence, not the main story: these cards stay lighter than the
 * experience, project and award cards above them.
 *
 * With only two credentials, a full-width grid stranded them on the left. The
 * pair is capped and centred instead, so it reads as a deliberate set rather
 * than as the first two cells of an unfinished row.
 */
export default function Certifications() {
  return (
    <section id="certifications" className="section pt-0 md:pt-0">
      <div className="container-main">
        <SectionHeading
          label="Credentials"
          title="Certifications"
        />

        <div className="grid sm:grid-cols-2 gap-5 md:gap-6 max-w-3xl lg:max-w-4xl mx-auto">
          {certifications.map((cert, index) => (
            <Reveal key={cert.id} delay={index * 0.08} className="h-full">
              <a
                href={cert.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Verify ${cert.title} credential (opens in a new tab)`}
                className="card accent-card p-6 md:p-7 h-full flex flex-col group"
                style={{ "--proj-accent": "var(--accent)" }}
              >
                <div className="flex gap-4 items-start">
                  <div
                    className="flex-shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] rounded-xl overflow-hidden flex items-center justify-center"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-default)",
                    }}
                  >
                    <Image
                      src={cert.badgeImage}
                      alt=""
                      width={72}
                      height={72}
                      className="w-full h-full object-contain p-1.5"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-base md:text-[17px] leading-snug"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {cert.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      <span
                        className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded"
                        style={{
                          background: "var(--accent-dim)",
                          color: "var(--accent-lighter)",
                        }}
                      >
                        {cert.level}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {cert.provider} · {cert.date}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-5">
                  {cert.skills.map((skill) => (
                    <span key={skill} className="tech-chip">
                      {skill}
                    </span>
                  ))}
                </div>

                <span
                  className="mt-auto pt-6 inline-flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: "var(--accent-light)" }}
                >
                  Verify credential
                  <ArrowUpRight className="w-4 h-4 cta-arrow" aria-hidden="true" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
