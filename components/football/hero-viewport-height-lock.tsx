"use client";

import { useLayoutEffect, useRef } from "react";

const MOBILE_MAX = 900;

/**
 * Locks the home hero to a fixed pixel height on small viewports so iOS Safari
 * does not resize the hero (and repaint the fill image) when the browser chrome
 * animates during scroll. Value updates on orientation change and when crossing
 * the mobile breakpoint — not on every visualViewport resize.
 */
export function HeroViewportHeightLock() {
  const markerRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const marker = markerRef.current;
    const hero = marker?.parentElement;
    if (!hero) return;

    const apply = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth > MOBILE_MAX) {
        hero.style.removeProperty("--hero-viewport-px");
        return;
      }
      const h = window.visualViewport?.height ?? window.innerHeight;
      hero.style.setProperty("--hero-viewport-px", `${Math.round(h)}px`);
    };

    apply();
    let rafOuter = 0;
    let rafInner = 0;
    rafOuter = requestAnimationFrame(() => {
      rafInner = requestAnimationFrame(apply);
    });

    const onOrientation = () => {
      window.setTimeout(apply, 350);
    };

    let lastWidth = window.innerWidth;

    const onResize = () => {
      const w = window.innerWidth;
      if (w > MOBILE_MAX) {
        lastWidth = w;
        apply();
        return;
      }
      /* Width-only: ignore innerHeight-only changes (iOS toolbar show/hide). */
      if (w !== lastWidth) {
        lastWidth = w;
        apply();
      }
    };

    window.addEventListener("orientationchange", onOrientation);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafOuter);
      cancelAnimationFrame(rafInner);
      window.removeEventListener("orientationchange", onOrientation);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <span
      ref={markerRef}
      className="hero-viewport-lock-marker"
      aria-hidden
      hidden
    />
  );
}
