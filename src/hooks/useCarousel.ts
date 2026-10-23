import { useEffect, useState } from "react";
import type { FocusEvent } from "react";

export function useCarousel(count: number, delay: number) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [visible, setVisible] = useState(() => !document.hidden);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReducedMotion(motion.matches);
    const onVisibility = () => setVisible(!document.hidden);
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  const paused = hovered || focused || stopped || !visible || reducedMotion;
  useEffect(() => {
    if (paused || count < 2) return;
    const timer = window.setTimeout(
      () => setIndex((i) => (i + 1) % count),
      delay,
    );
    return () => window.clearTimeout(timer);
  }, [count, delay, index, paused]);
  return {
    index,
    next: () => setIndex((i) => (i + 1) % count),
    previous: () => setIndex((i) => (i + count - 1) % count),
    goTo: setIndex,
    stopped,
    togglePlayback: () => setStopped((value) => !value),
    regionProps: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocusCapture: () => setFocused(true),
      onBlurCapture: (event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      },
    },
  };
}
