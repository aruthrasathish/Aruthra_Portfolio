"use client";

import { useEffect } from "react";

/**
 * Pointer tracking that deliberately does NOT go through React state.
 *
 * The previous useSyncExternalStore version re-rendered the whole animated
 * background tree on every mousemove. Consumers now read the latest value
 * inside their own rAF/useFrame loop, or subscribe to write a transform
 * directly to a DOM node.
 */

const store = {
  x: 0,
  y: 0,
  listeners: new Set(),
  attached: false,
};

function handleMove(event) {
  store.x = (event.clientX / window.innerWidth) * 2 - 1;
  store.y = (event.clientY / window.innerHeight) * 2 - 1;
  store.listeners.forEach((listener) => listener(store));
}

function attach() {
  if (store.attached || typeof window === "undefined") return;
  window.addEventListener("mousemove", handleMove, { passive: true });
  store.attached = true;
}

function detachIfIdle() {
  if (store.listeners.size > 0 || !store.attached) return;
  window.removeEventListener("mousemove", handleMove);
  store.attached = false;
}

export function getPointerPosition() {
  return store;
}

/** Keeps the global listener alive for as long as the component is mounted. */
export function usePointerTracking(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const marker = () => {};
    store.listeners.add(marker);
    attach();
    return () => {
      store.listeners.delete(marker);
      detachIfIdle();
    };
  }, [enabled]);
}

/**
 * Writes a small translate to `ref` as the pointer moves. Event-driven with a
 * single coalesced rAF - no continuous loop, no React re-render.
 */
export function useParallaxTransform(ref, { strength = 8, enabled = true } = {}) {
  useEffect(() => {
    if (!enabled || !ref.current) return;

    let frame = 0;
    const node = ref.current;

    const listener = ({ x, y }) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        node.style.transform = `translate3d(${(-x * strength).toFixed(2)}px, ${(
          -y * strength
        ).toFixed(2)}px, 0)`;
      });
    };

    store.listeners.add(listener);
    attach();

    return () => {
      store.listeners.delete(listener);
      cancelAnimationFrame(frame);
      detachIfIdle();
      node.style.transform = "";
    };
  }, [ref, strength, enabled]);
}
