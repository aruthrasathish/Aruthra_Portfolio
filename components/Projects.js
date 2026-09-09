"use client";

import { ArrowUpRight } from "lucide-react";
import Reveal, { SectionHeading } from "@/components/ui/Reveal";
import ProjectCard from "./ProjectCard";
import { GitHubIcon } from "@/components/ui/Icons";
import { projects, hero } from "@/lib/data";

/**
 * Projects.
 *
 * One sequential grid rather than the old featured/supporting split: three
 * columns on desktop, two on tablet, one on mobile. Every project gets the
 * same card, so all seven are visible in roughly the space the four featured
 * cards used to take, and the eye moves down a column instead of switching
 * between two card sizes.
 *
 * Featured projects still lead - `projects` is ordered, and the featured ones
 * come first in the data.
 */
export default function Projects() {
  return (
    <section id="projects" className="section">
      <div className="container-main">
        <SectionHeading
          label="Projects"
          title="Featured Projects"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {projects.map((project, index) => (
            <Reveal
              key={project.id}
              delay={(index % 3) * 0.06}
              className="h-full"
            >
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-10 text-center">
          <a
            href={hero.github}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex"
          >
            <GitHubIcon className="w-5 h-5" />
            View all repositories
            <ArrowUpRight className="w-4 h-4 cta-arrow" aria-hidden="true" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
