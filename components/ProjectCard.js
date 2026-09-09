"use client";

import { ArrowUpRight } from "lucide-react";
import ProjectImage from "@/components/ProjectImage";
import { GitHubIcon } from "@/components/ui/Icons";

// Accents stay inside the existing indigo/violet/cyan/emerald identity.
const ACCENTS = {
  violet: "#a855f7",
  cyan: "#38bdf8",
  emerald: "#34d399",
  indigo: "#818cf8",
};

const accentOf = (project) => ACCENTS[project.accent] || ACCENTS.indigo;

/**
 * Project card.
 *
 * One card shape for every project now, in a denser grid - the old split
 * between a large "featured" card and a small "also built" card meant two
 * layouts, two paddings and a lot of vertical space for seven projects.
 *
 * Fixed reading order, so a column of cards scans straight down:
 *   image -> category + tech -> title -> one line -> flow -> metrics -> links
 *
 * The architecture is kept, but as a compact arrow chain built from the same
 * `flow` data the old expandable diagram used. It costs two lines instead of a
 * collapsible panel, and it is readable without a click.
 */
export default function ProjectCard({ project }) {
  const accent = accentOf(project);
  // The flow labels alone carry the shape of the system; the per-stage `meta`
  // is the detail that made the old panel tall, so it is dropped here.
  const chain = (project.flow || []).map((stage) => stage.label);

  return (
    <article
      className="card accent-card project-card overflow-hidden h-full flex flex-col"
      style={{ "--proj-accent": accent }}
    >
      <ProjectImage project={project} />

      <div className="p-4 md:p-[18px] flex flex-col flex-1">
        <span className="project-card__category" style={{ color: accent }}>
          <span className="project-card__badge-dot" aria-hidden="true" />
          {project.category}
        </span>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {project.tech.slice(0, 4).map((tech) => (
            <span key={tech} className="tech-chip">
              {tech}
            </span>
          ))}
          {project.tech.length > 4 ? (
            <span className="tech-chip" style={{ opacity: 0.75 }}>
              +{project.tech.length - 4}
            </span>
          ) : null}
        </div>

        <h3
          className="font-semibold text-[15px] leading-snug mt-3"
          style={{ color: "var(--text-primary)" }}
        >
          {project.title}
        </h3>

        {/* Exactly one line. The longer problem/description text lives in data. */}
        <p
          className="text-[13px] mt-1.5 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {project.summary}
        </p>

        {chain.length > 0 ? (
          <p className="project-card__flow" title={project.architecture}>
            {chain.join(" → ")}
          </p>
        ) : null}

        <div
          className="grid grid-cols-3 gap-2 mt-3 pt-3"
          style={{ borderTop: "1px solid var(--border-default)" }}
        >
          {project.metrics.slice(0, 3).map((metric) => (
            <div key={metric.label} className="min-w-0">
              <p
                className="text-[15px] font-semibold leading-none tabular-nums"
                style={{ color: accent }}
              >
                {metric.value}
              </p>
              <p
                className="text-[10.5px] mt-1 leading-tight"
                style={{ color: "var(--text-muted)" }}
              >
                {metric.label}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-auto pt-3">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium"
            style={{ color: "var(--accent-light)" }}
          >
            <GitHubIcon className="w-3.5 h-3.5" />
            Code
            <ArrowUpRight className="w-3.5 h-3.5 cta-arrow" aria-hidden="true" />
          </a>

          {project.demo ? (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              Live demo
              <ArrowUpRight className="w-3.5 h-3.5 cta-arrow" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
