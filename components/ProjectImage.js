"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

/**
 * Project cover image.
 *
 * Renders the real screenshot at `project.image`. There is deliberately no
 * generated artwork behind this: when no screenshot exists the card shows a
 * neutral "screenshot pending" plate instead, which is honest about the gap
 * rather than dressing it up as a product shot.
 *
 * Every cover is locked to one aspect ratio so the grid stays on a rhythm no
 * matter what the source image is, and the box is reserved before the file
 * loads so nothing shifts.
 *
 * To fill one in: drop the file in public/images/projects/ and set `image` on
 * that project in lib/data.js. Nothing else needs to change.
 */
export default function ProjectImage({ project }) {
  const [failed, setFailed] = useState(false);
  const src = project.image;

  if (!src || failed) {
    return (
      <div className="project-shot project-shot--empty">
        <ImageOff className="w-5 h-5" aria-hidden="true" />
        <span>Screenshot pending</span>
      </div>
    );
  }

  return (
    <div className="project-shot">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={project.imageAlt || `${project.title} screenshot`}
        className="project-shot__img"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
