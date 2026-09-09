"use client";

import { useCallback, useState } from "react";

/**
 * Organisation logo with a graceful monogram fallback.
 *
 * Official marks are NOT bundled with this repo - they belong to their owners
 * and are never redrawn, approximated or recoloured here. Drop the
 * publisher's own file at the path configured in lib/data.js and it renders
 * automatically; until then this shows a neutral monogram tile rather than a
 * broken image.
 *
 * The tile keeps a fixed box and letterboxes the mark inside it
 * (object-fit: contain), so logos of different aspect ratios all sit on the
 * same grid without being stretched.
 *
 * A plain <img> is used deliberately: next/image would route a missing local
 * file through the optimizer and surface a 500 instead of firing onError.
 */
export default function OrgLogo({
  src,
  alt,
  monogram,
  size = 56,
  rounded = "rounded-xl",
  /*
    Optional per-logo size multiplier. Marks are supplied with wildly different
    amounts of built-in margin, so a single shared inset renders some of them
    noticeably smaller than others. This nudges an individual mark back into
    balance without touching the container or the other logos.
  */
  scale = 1,
}) {
  const [failed, setFailed] = useState(!src);

  /**
   * The image is server-rendered, so a missing file can 404 while the HTML is
   * still parsing - before React hydrates and attaches onError. That error is
   * never replayed, which would leave a broken-image glyph on screen. This ref
   * callback catches the already-failed case on mount; onError still covers
   * anything that fails afterwards.
   */
  const checkLoaded = useCallback((node) => {
    if (node && node.complete && node.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <div
      className={`org-logo ${rounded}`}
      style={{ width: size, height: size }}
      data-fallback={failed ? "true" : undefined}
    >
      {failed ? (
        <span
          className="org-logo__monogram"
          style={{ fontSize: Math.max(11, size * 0.3) }}
          aria-hidden="true"
        >
          {monogram}
        </span>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          ref={checkLoaded}
          src={src}
          alt={alt}
          width={size}
          height={size}
          /* Eager: these are 52px marks, and loading them immediately means a
             missing file resolves to the monogram straight away instead of
             leaving an empty tile until the lazy loader gets around to it. */
          decoding="async"
          onError={() => setFailed(true)}
          className="org-logo__img"
          style={scale !== 1 ? { "--logo-scale": scale } : undefined}
        />
      )}
    </div>
  );
}
