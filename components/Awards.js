"use client";

import { useState } from "react";
import { Award as AwardIcon, ImageIcon } from "lucide-react";
import Reveal, { SectionHeading } from "@/components/ui/Reveal";
import { awards } from "@/lib/data";

/**
 * Award photograph.
 *
 * The left panel of the award card is a photo container, not an identity
 * placard: the issuer, year and program all live on the right, so the image
 * carries only the visual storytelling. No award certificate is fabricated -
 * until a real photograph is supplied the panel shows a neutral, designed
 * photo placeholder at the same aspect ratio, so the layout never shifts when
 * the file lands.
 */
function AwardPhoto({ award }) {
  const [imageFailed, setImageFailed] = useState(!award.image);

  return (
    <div className="award-photo">
      {!imageFailed ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={award.image}
          alt={award.imageAlt}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="award-photo__img"
        />
      ) : (
        <div className="award-photo__empty">
          <span className="award-photo__icon" aria-hidden="true">
            <ImageIcon className="w-6 h-6" />
          </span>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Award photo coming soon
          </p>
        </div>
      )}
    </div>
  );
}

function AwardCard({ award }) {
  return (
    <article
      className="card accent-card overflow-hidden grid lg:grid-cols-12"
      style={{ "--proj-accent": "var(--accent)" }}
    >
      <div className="lg:col-span-5 xl:col-span-4 p-5 md:p-6 lg:pr-0">
        <AwardPhoto award={award} />
      </div>

      <div className="lg:col-span-7 xl:col-span-8 p-5 md:p-6 lg:pl-8 flex flex-col justify-center">
        <span
          className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider"
          style={{
            background: "var(--accent-dim)",
            color: "var(--accent-lighter)",
            border: "1px solid rgba(99, 102, 241, 0.25)",
          }}
        >
          <AwardIcon className="w-3.5 h-3.5" aria-hidden="true" />
          Recognition
        </span>

        <h3
          className="text-2xl md:text-3xl font-bold tracking-tight mt-4"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          {award.title}
        </h3>

        <p className="text-base font-medium mt-2" style={{ color: "var(--accent-light)" }}>
          {award.issuer} · {award.year}
        </p>

        <p
          className="text-[15px] mt-4 leading-relaxed max-w-2xl"
          style={{ color: "var(--text-secondary)" }}
        >
          {award.description}
        </p>

        {/* Supporting context. The GPA evidences the award; it is not the award. */}
        <dl
          className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4 mt-6 pt-6"
          style={{ borderTop: "1px solid var(--border-default)" }}
        >
          {award.supporting.map((item) => (
            <div key={item.label} className="min-w-0">
              <dt
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                {item.label}
              </dt>
              <dd
                className="text-[15px] font-semibold mt-1 leading-snug"
                style={{ color: "var(--text-primary)" }}
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

export default function Awards() {
  return (
    <section id="awards" className="section section-band">
      <div className="container-main">
        <SectionHeading
          label="Awards"
          title="Awards & Recognition"
        />

        <div className="space-y-6">
          {awards.map((award, index) => (
            <Reveal key={award.id} delay={index * 0.08}>
              <AwardCard award={award} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
