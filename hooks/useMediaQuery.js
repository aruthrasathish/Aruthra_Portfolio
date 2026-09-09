"use client";

import { useEffect, useState } from "react";

/**
 * Matches a media query after mount. Returns `false` during SSR and on the
 * first client render so markup stays identical across hydration.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export const useIsSmallScreen = () => useMediaQuery("(max-width: 767px)");
