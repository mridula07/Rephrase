"use client";

import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import styles from "./Rephrase.module.css";

// A pill that gets "coloured in" with a blue marker when selected.
// The fill is generated per pill (seeded from its label) so every pill looks
// hand-coloured but stays identical between renders.

function seeded(label: string) {
  let seed = 7;
  for (let i = 0; i < label.length; i++) seed = (seed * 31 + label.charCodeAt(i)) % 2147483647;
  if (seed <= 0) seed += 2147483646;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

function markerPaths(w: number, h: number, label: string) {
  const rnd = seeded(label);
  const J = (a: number) => (rnd() - 0.5) * 2 * a;
  const ins = 2.2;
  const r = (h - 2 * ins) / 2;
  const cx1 = ins + r;
  const cx2 = w - ins - r;
  const cy = h / 2;
  const pts: [number, number][] = [];
  const N = Math.max(6, Math.round(w / 14));
  const edge = (t: number, top: boolean): [number, number] => {
    const dent = rnd() < 0.18 ? 1.5 + rnd() * 1.2 : 0;
    return [cx1 + (cx2 - cx1) * t + J(1.5), (top ? ins + dent : h - ins - dent) + J(0.5)];
  };
  const arc = (cx: number, from: number, to: number) => {
    for (let a = from; a <= to; a += 25) {
      const rr = r + J(0.7) - (rnd() < 0.25 ? 1.2 : 0);
      pts.push([cx + rr * Math.cos((a * Math.PI) / 180), cy + rr * Math.sin((a * Math.PI) / 180)]);
    }
  };
  for (let i = 0; i <= N; i++) pts.push(edge(i / N, true));
  arc(cx2, -75, 75);
  for (let i = N; i >= 0; i--) pts.push(edge(i / N, false));
  arc(cx1, 105, 255);

  const f = (n: number) => n.toFixed(1);
  const mid = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(pts[pts.length - 1], pts[0]);
  let base = `M ${f(start[0])} ${f(start[1])}`;
  pts.forEach((a, i) => {
    const m = mid(a, pts[(i + 1) % pts.length]);
    base += ` Q ${f(a[0])} ${f(a[1])} ${f(m[0])} ${f(m[1])}`;
  });
  base += " Z";

  // Back-and-forth marker passes; where they overlap you get darker streaks.
  let y = ins + 2.5;
  let dir = 1;
  let streaks = "";
  while (y < h - ins - 1.5) {
    const xs = dir > 0 ? ins + 3 + rnd() * 5 : w - ins - 3 - rnd() * 5;
    const xe = dir > 0 ? w - ins - 3 - rnd() * 6 : ins + 3 + rnd() * 6;
    const sl = J(1.4);
    if (!streaks) streaks = `M ${f(xs)} ${f(y)}`;
    streaks += ` Q ${f((xs + xe) / 2)} ${f(y + sl + J(1))} ${f(xe)} ${f(y + sl)}`;
    const ny = y + 3.4 + rnd() * 1.8;
    streaks += ` Q ${f(xe + dir * 1.5)} ${f((y + ny) / 2)} ${f(xe)} ${f(ny)}`;
    y = ny;
    dir = -dir;
  }

  const sy = ins + 4 + rnd() * (h * 0.2);
  const sx = ins + 8 + rnd() * w * 0.2;
  const ex = Math.min(sx + w * (0.2 + rnd() * 0.25), w - ins - 8);
  const skip = `M ${f(sx)} ${f(sy)} Q ${f((sx + ex) / 2)} ${f(sy + J(1))} ${f(ex)} ${f(sy + J(0.8))}`;

  return { base, streaks, skip };
}

interface MarkerPillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  role?: "radio";
  trailing?: ReactNode;
  className?: string;
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

export default function MarkerPill({
  label,
  selected,
  onClick,
  role = "radio",
  trailing,
  className,
  buttonProps,
}: MarkerPillProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const paths = useMemo(
    () => (size ? markerPaths(size.w, size.h, label) : null),
    [size, label]
  );

  return (
    <button
      ref={ref}
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      className={`${styles.pill} ${selected ? styles.pillOn : ""} ${className ?? ""}`}
      {...buttonProps}
    >
      {paths && size && (
        <svg
          className={styles.marker}
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w} ${size.h}`}
          aria-hidden="true"
        >
          <path className={styles.markerBase} d={paths.base} />
          <path className={styles.markerStreaks} d={paths.streaks} pathLength={1} />
          <path className={styles.markerSkip} d={paths.skip} />
        </svg>
      )}
      <span className={styles.pillLabel}>{label}</span>
      {trailing}
    </button>
  );
}
