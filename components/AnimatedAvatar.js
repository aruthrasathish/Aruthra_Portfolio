"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useMediaQuery, useIsSmallScreen } from "@/hooks/useMediaQuery";
import {
  CharacterState,
  useCharacterScheduler,
} from "@/hooks/useCharacterScheduler";

/**
 * Hero avatar - a small character that lives on the network background.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS CAN AND CANNOT DO, TODAY
 * ---------------------------------------------------------------------------
 * The only artwork that exists is a SINGLE STATIC POSE. Both source files were
 * measured frame by frame and neither contains any pose information: the
 * largest pixel difference across every frame of `0907.mp4` and of
 * `aruthra-avatar.webp` is <= 5/255, i.e. compression noise. There is no wave,
 * no head turn, no blink and no expression change anywhere in the assets.
 *
 * So this component does NOT pretend to articulate a body it does not have.
 * It is built in two halves:
 *
 *   1. A pose/clip system that performs REAL character animation the moment
 *      pose artwork is supplied (`avatar.poses` + `avatar.clips` in
 *      lib/data.js). Nothing about it is stubbed - it is inert only because
 *      the registry currently holds one entry.
 *
 *   2. Presentation motion, which is all that runs today. It is deliberately
 *      tiny and anchored at the FEET (`transform-origin: 50% 100%`), so it
 *      reads as a standing figure shifting its weight rather than a sticker
 *      floating in space. Nothing exceeds ~1 degree or ~3px, and it damps
 *      itself down automatically once real poses exist, because at that point
 *      the artwork is doing the acting.
 *
 * See public/avatar/README.md for exactly which files to export.
 * ---------------------------------------------------------------------------
 */

/* Scheduler bands. Mobile is calmer: fewer beats, smaller amplitude. */
const TIMING_LIVELY = {
  microEvery: [5000, 10000],
  danceEvery: [12000, 20000],
  microFor: [500, 1200],
  danceFor: [1400, 2500],
  waveFor: [900, 1200],
};

const TIMING_CALM = {
  microEvery: [9000, 15000],
  danceEvery: [22000, 34000],
  microFor: [500, 1000],
  danceFor: [1200, 1800],
  waveFor: [900, 1100],
};

/*
  Presentation keyframes.

  ROTATION AND LATERAL MOVEMENT ARE GONE. The previous version pivoted the whole
  figure about its feet - up to 0.9deg on a dance beat plus a 1.6px sideways
  slide - which at a 540px-tall avatar swings the head about 8px left and right.
  On a single static pose that does not read as a character shifting weight, it
  reads as a PNG being rocked, which is exactly what it was.

  What is left is vertical only, and never more than 1.5px: a breath. Every
  state uses it, so the scheduler still drives something, but nothing about the
  frame slides or tilts. Real limb motion is the artwork's job - see
  public/avatar/README.md for the pose files that would supply it.
*/
const scale = (keys, amp) => keys.map((v) => Number((v * amp).toFixed(3)));

const BREATH = {
  // Each entry is a vertical offset in px. No rotate, no x, by design.
  [CharacterState.IDLE]: [0, -1.2, 0],
  [CharacterState.MICRO]: [0, -1.5, -0.3, 0],
  [CharacterState.DANCE]: [0, -1.5, -0.2, -1.3, 0],
  [CharacterState.WAVE]: [0, -1.5, -0.4, 0],
};

const presentation = (state, amp) => ({
  y: scale(BREATH[state] || BREATH[CharacterState.IDLE], amp),
  scaleY: [1, 1 + 0.003 * amp, 1],
});

const durationFor = (state) => {
  if (state === CharacterState.DANCE) return 1.9;
  if (state === CharacterState.MICRO) return 0.9;
  if (state === CharacterState.WAVE) return 1;
  return null; // idle: caller randomises
};

/**
 * Normalises whatever lib/data.js provides into a pose registry.
 *
 * Accepts the modern shape (`poses`, a map of name -> src) and the older
 * single-asset shape (`src` + `kind`), which becomes the sole `idle` pose.
 */
function usePoseRegistry(avatar) {
  return useMemo(() => {
    const poses = { ...(avatar?.poses || {}) };
    if (!poses.idle && avatar?.src) {
      poses.idle = { src: avatar.src, kind: avatar.kind };
    }
    return poses;
  }, [avatar]);
}

/**
 * Resolves a character state to a pose sequence.
 *
 * `avatar.clips` maps a state to frames - `[{ pose, hold }, ...]` - which is
 * how a real two-step sway or a wave gets expressed once the artwork exists.
 * Anything unmapped falls back to `idle`, so a partial pose set degrades one
 * state at a time instead of breaking.
 */
function useClipPlayer(state, poses, clips, enabled) {
  const clip = enabled ? clips?.[state] : null;
  const [play, setPlay] = useState({ clip: null, index: 0 });

  /*
    Reset during render rather than in an effect. This is React's documented
    way to adjust state when an input changes, and it avoids the cascading
    extra render that a setState-in-effect would cost on every state change.
    It cannot loop: after the update `play.clip === clip`.
  */
  if (play.clip !== clip) setPlay({ clip, index: 0 });

  useEffect(() => {
    if (!clip || clip.length < 2) return;

    let cancelled = false;
    let timer = null;
    let index = 0;

    const step = () => {
      timer = setTimeout(() => {
        timer = null;
        if (cancelled) return;
        index = (index + 1) % clip.length;
        setPlay({ clip, index });
        step();
      }, clip[index]?.hold ?? 220);
    };
    step();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [clip]);

  const index = play.clip === clip ? play.index : 0;
  const name = clip ? clip[Math.min(index, clip.length - 1)]?.pose : state;
  return poses[name] ? name : "idle";
}

export default function AnimatedAvatar({ avatar, className = "" }) {
  const reducedMotion = usePrefersReducedMotion();
  const isSmallScreen = useIsSmallScreen();
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const stageRef = useRef(null);

  const poses = usePoseRegistry(avatar);
  const poseNames = useMemo(() => Object.keys(poses), [poses]);
  const [failed, setFailed] = useState(() => poseNames.length === 0);
  const handleFail = useCallback(() => setFailed(true), []);

  // True once real pose artwork exists. Until then the pose layer is a single
  // image and the presentation motion runs at full (still tiny) amplitude.
  const hasPoseArt = poseNames.length > 1;
  const motionOk = !reducedMotion && !failed;

  const timing = useMemo(
    () => (isSmallScreen ? TIMING_CALM : TIMING_LIVELY),
    [isSmallScreen]
  );

  const { state, idleSeed, react } = useCharacterScheduler({
    enabled: motionOk,
    timing,
    hostRef: stageRef,
  });

  const activePose = useClipPlayer(state, poses, avatar?.clips, motionOk);

  /*
    Amplitude budget. Real poses mean the artwork acts and the transform only
    supports it; mobile trims further. A static single pose gets the full
    budget, which is still under one degree.
  */
  const amp = (hasPoseArt ? 0.3 : 1) * (isSmallScreen ? 0.7 : 1);

  const idleDuration = useMemo(
    () => 4.2 + ((idleSeed * 1.37) % 2.3),
    [idleSeed]
  );

  /*
    `avatar.motion: false` suppresses the presentation animation entirely -
    used while inspecting an asset, so that anything seen on screen comes from
    the file itself and not from this component.
  */
  const stillOnly = avatar?.motion === false;
  const target = motionOk && !stillOnly ? presentation(state, amp) : undefined;
  const fixed = durationFor(state);

  return (
    <div ref={stageRef} className={`avatar-stage ${className}`}>
      <motion.div
        className="avatar-figure"
        style={avatar?.aspect ? { aspectRatio: avatar.aspect } : undefined}
        initial={motionOk ? { opacity: 0, y: 20, scale: 0.97 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        onHoverStart={canHover && hasPoseArt ? react : undefined}
        whileHover={
          canHover && motionOk && !hasPoseArt && !stillOnly
            ? { scale: 1.015 }
            : undefined
        }
      >
        {/*
          Performance layer. Separate from the entrance so a looping animation
          never restarts the one-shot lift, and anchored at the feet so the
          figure pivots where it meets the ground.
        */}
        <motion.div
          className="avatar-figure__motion"
          animate={target}
          transition={
            motionOk
              ? {
                  duration: fixed ?? idleDuration,
                  ease: "easeInOut",
                  repeat: fixed ? 0 : Infinity,
                }
              : undefined
          }
        >
          <PoseStack
            poses={poses}
            active={activePose}
            alt={avatar?.alt}
            failed={failed}
            reducedMotion={reducedMotion}
            onFail={handleFail}
          />
        </motion.div>

      </motion.div>
    </div>
  );
}

/**
 * Pose layers.
 *
 * Every pose is mounted once and stacked in the same box, so switching pose is
 * an opacity crossfade between two already-decoded images - no flash, no
 * network hop mid-gesture. `object-position: 50% 100%` pins every layer to the
 * same floor line, which is what stops the character jumping when the pose
 * changes. Poses must therefore share a canvas size and a baseline.
 *
 * Only `idle` is eager; any additional pose loads lazily, because none of them
 * are needed for first paint.
 */
function PoseStack({ poses, active, alt, failed, reducedMotion, onFail }) {
  const names = Object.keys(poses);
  if (failed || names.length === 0) return null;

  return (
    <div className="avatar-poses">
      {names.map((name) => {
        const pose = poses[name];
        const isActive = name === active;

        if (pose.kind === "video") {
          return (
            <video
              key={name}
              className="avatar-pose"
              style={{ opacity: isActive ? 1 : 0 }}
              src={pose.src}
              autoPlay={!reducedMotion}
              muted
              loop
              playsInline
              preload="auto"
              controls={false}
              disablePictureInPicture
              onError={onFail}
              aria-hidden="true"
            />
          );
        }

        return (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={name}
            className="avatar-pose"
            style={{ opacity: isActive ? 1 : 0 }}
            /*
              Browsers keep playing an animated WebP regardless of
              prefers-reduced-motion, so the still frame is swapped in here
              rather than relying on the format to behave.
            */
            src={reducedMotion && pose.staticSrc ? pose.staticSrc : pose.src}
            /* One accessible name for the character, not one per pose. */
            alt={name === "idle" ? alt || "" : ""}
            aria-hidden={name === "idle" ? undefined : "true"}
            decoding="async"
            loading={name === "idle" ? "eager" : "lazy"}
            fetchPriority={name === "idle" ? "high" : "low"}
            onError={name === "idle" ? onFail : undefined}
          />
        );
      })}
    </div>
  );
}
