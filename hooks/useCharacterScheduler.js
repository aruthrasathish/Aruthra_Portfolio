"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Character state machine for the hero avatar.
 *
 *   enter -> greeting -> idle -> (micro | dance) -> idle -> ...
 *
 * Exactly ONE timer is alive at any moment. Every transition clears the
 * previous handle before setting the next, so timers cannot accumulate no
 * matter how often the state churns, and the effect's cleanup kills the
 * pending one on unmount. There is no interval, no recursion without a timer
 * boundary, and no render loop.
 *
 * The loop also stops completely when the avatar is off-screen or the tab is
 * hidden, and resumes at idle when it comes back. That is what keeps a
 * backgrounded tab from queueing work it can never paint.
 */

export const CharacterState = {
  ENTER: "enter",
  GREETING: "greeting",
  IDLE: "idle",
  MICRO: "micro",
  DANCE: "dance",
  WAVE: "wave",
};

const ENTER_MS = 600;
const GREETING_MS = 1900;

/** Bounded random inside `[min, max]` - never unbounded, never a bare Math.random. */
const between = ([min, max]) => min + Math.random() * (max - min);

export function useCharacterScheduler({
  enabled,
  greet = false,
  timing,
  hostRef,
  hoverCooldown = 4000,
}) {
  const [state, setState] = useState(CharacterState.ENTER);
  // Bumped on every return to idle so the idle animation can pick a new
  // duration - that is what stops the breathing reading as a metronome.
  const [idleSeed, setIdleSeed] = useState(0);

  const timerRef = useRef(null);
  const lastDanceRef = useRef(0);
  const danceEveryRef = useRef(0);
  const introDoneRef = useRef(false);
  const hoverAtRef = useRef(0);
  const runnersRef = useRef(null);

  // Timing is read through a ref so a fresh object literal from the caller
  // cannot restart the machine mid-sequence.
  const timingRef = useRef(timing);
  useEffect(() => {
    timingRef.current = timing;
  });

  // Active = actually on screen, in a visible tab. Nothing runs otherwise.
  // Seeded from the real document state so a tab that starts hidden does not
  // schedule the intro only to clear it again one effect later.
  const [active, setActive] = useState(
    () => typeof document === "undefined" || document.visibilityState === "visible"
  );
  useEffect(() => {
    const node = hostRef?.current;
    let onScreen = true;

    const sync = () => setActive(onScreen && document.visibilityState === "visible");

    let observer;
    if (node && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          onScreen = entry.isIntersecting;
          sync();
        },
        { rootMargin: "80px" }
      );
      observer.observe(node);
    }
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [hostRef]);

  useEffect(() => {
    let cancelled = false;

    const clear = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    /* The only way this module schedules anything. Clears first, always. */
    const later = (ms, fn) => {
      clear();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        if (!cancelled) fn();
      }, ms);
    };

    const toIdle = () => {
      setState(CharacterState.IDLE);
      setIdleSeed((n) => n + 1);
      if (enabled) scheduleAction();
    };

    const runMicro = () => {
      setState(CharacterState.MICRO);
      later(between(timingRef.current.microFor), toIdle);
    };

    const runDance = () => {
      lastDanceRef.current = Date.now();
      danceEveryRef.current = between(timingRef.current.danceEvery);
      setState(CharacterState.DANCE);
      later(between(timingRef.current.danceFor), toIdle);
    };

    const runWave = () => {
      setState(CharacterState.WAVE);
      later(between(timingRef.current.waveFor), toIdle);
    };

    /*
      Picks the next beat. A dance wins whenever its window has come due
      sooner than the next micro-action would land, so the dance cadence stays
      inside its band instead of drifting behind the micro cadence.
    */
    const scheduleAction = () => {
      const t = timingRef.current;
      const untilDance = danceEveryRef.current - (Date.now() - lastDanceRef.current);
      const microWait = between(t.microEvery);
      if (untilDance <= microWait) later(Math.max(untilDance, 300), runDance);
      else later(microWait, runMicro);
    };

    runnersRef.current = { runWave, scheduleAction };

    if (!active) {
      // Freeze wherever we are; the next activation resumes from idle.
      clear();
      return () => {
        cancelled = true;
        clear();
      };
    }

    if (introDoneRef.current) {
      toIdle();
    } else {
      // No setState here: `state` already initialises to ENTER, and nothing
      // can have moved it before the intro runs.
      later(ENTER_MS, () => {
        introDoneRef.current = true;
        if (greet) {
          setState(CharacterState.GREETING);
          later(GREETING_MS, toIdle);
        } else {
          toIdle();
        }
      });
    }

    return () => {
      cancelled = true;
      clear();
      runnersRef.current = null;
    };
  }, [enabled, greet, active]);

  /**
   * One-shot hover reaction, debounced. Ignored unless the character is idle
   * and the cooldown has elapsed, so sweeping the pointer across the avatar
   * cannot restart the animation on every mousemove.
   */
  const react = useCallback(() => {
    if (!enabled || !active) return;
    const now = Date.now();
    if (now - hoverAtRef.current < hoverCooldown) return;
    if (state !== CharacterState.IDLE) return;
    hoverAtRef.current = now;
    runnersRef.current?.runWave();
  }, [enabled, active, state, hoverCooldown]);

  return { state, idleSeed, react };
}
