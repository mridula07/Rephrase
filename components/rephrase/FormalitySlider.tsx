"use client";

import { useRef, useState } from "react";
import { FORMALITY_LABELS } from "./translations";

const MAX_STEP = FORMALITY_LABELS.length - 1;

interface FormalitySliderProps {
  formalityStep: number;
  formalityLabel: string;
  onChange: (step: number) => void;
}

export default function FormalitySlider({
  formalityStep,
  formalityLabel,
  onChange,
}: FormalitySliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  // Continuous visual position while actively dragging; null when not dragging
  // (in which case the committed formalityStep drives the displayed position).
  const [dragPercent, setDragPercent] = useState<number | null>(null);

  const percentFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return (formalityStep / MAX_STEP) * 100;
    const rect = track.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    return Math.max(0, Math.min(100, pct));
  };

  const handleThumbPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragPercent(percentFromClientX(e.clientX));
  };

  const handleThumbPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    setDragPercent(percentFromClientX(e.clientX));
  };

  const handleThumbPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const finalPercent = percentFromClientX(e.clientX);
    const step = Math.round((finalPercent / 100) * MAX_STEP);
    onChange(step);
    setDragPercent(null);
  };

  const percent =
    dragPercent !== null ? dragPercent : (formalityStep / MAX_STEP) * 100;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#94A3B8",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Formality
        </span>
        <span style={{ fontSize: 12, color: "#34D399", fontWeight: 600 }}>
          {formalityLabel}
        </span>
      </div>
      <div ref={trackRef} style={{ position: "relative" }}>
        <div
          style={{
            height: 5,
            background: "rgba(255,255,255,.08)",
            borderRadius: 3,
          }}
        >
          <div
            style={{
              height: 5,
              background: "#059669",
              borderRadius: 3,
              width: `${percent}%`,
            }}
          />
        </div>
        {/* Larger invisible hit area so the thumb is easy to grab on touch,
            centered on the exact same point as the visible dot below. */}
        <div
          onPointerDown={handleThumbPointerDown}
          onPointerMove={handleThumbPointerMove}
          onPointerUp={handleThumbPointerUp}
          onPointerCancel={handleThumbPointerUp}
          style={{
            position: "absolute",
            left: `${percent}%`,
            top: -13.5,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "translateX(-50%)",
            cursor: "grab",
            touchAction: "none",
          }}
        >
          <div
            style={{
              width: 17,
              height: 17,
              background: "#059669",
              borderRadius: "50%",
              border: "3px solid #1A2235",
              boxShadow: "0 0 8px rgba(5,150,105,.35)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 6,
        }}
      >
        <span style={{ fontSize: 10, color: "#475569" }}>Casual</span>
        <span style={{ fontSize: 10, color: "#475569" }}>Formal</span>
      </div>
    </div>
  );
}
