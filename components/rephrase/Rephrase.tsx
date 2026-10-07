"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import MarkerPill from "./MarkerPill";
import { ChevronDownIcon, CopyIcon, RepeatIcon, SparkleIcon } from "./icons";
import {
  FIRMNESS,
  MAX_MESSAGE_LENGTH,
  MORE_SCENARIOS,
  PRIMARY_SCENARIOS,
  RECIPIENTS,
  type Firmness,
  type Recipient,
  type RephraseResult,
  type Scenario,
} from "@/lib/options";
import styles from "./Rephrase.module.css";

const STAGE_W = 1440;
const STAGE_H = 900;
// The folder needs ~1100×840 of the scene to read well. Below 900px wide
// (tablets in portrait, phones) the pages stack in one column instead.
const FIT_W = 1100;
const FIT_H = 840;
const STACK_BREAKPOINT = 900;
const MIN_SCALE = 0.8; // never shrink the text below ~11px
const MAX_SCALE = 1.35;
const FALLBACK_ERROR = "Couldn't write that one. Try again in a moment.";

type Status = "idle" | "loading" | "done" | "error";

interface StageState {
  stacked: boolean;
  scale: number;
  height: number; // px the scene needs; taller than the window only on very short screens
}

// The desk is designed as a 1440×900 scene (same as the Figma frame) and
// scaled to fit the window, so the composition never breaks.
function useStage() {
  const [state, setState] = useState<StageState | null>(null);
  useLayoutEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Show the whole desk when there's room (1440×900 renders at exactly
      // 1:1 like the Figma frame). On smaller laptops, zoom in on the folder
      // and let the desk objects run off the edges rather than shrink the text.
      const wholeDesk = Math.min(w / STAGE_W, h / STAGE_H);
      const folderOnly = Math.min(w / FIT_W, h / FIT_H, 0.92);
      const scale = Math.min(Math.max(wholeDesk, folderOnly, MIN_SCALE), MAX_SCALE);
      setState({
        stacked: w < STACK_BREAKPOINT,
        scale,
        height: Math.max(h, Math.round(FIT_H * scale)),
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return state;
}

export default function Rephrase() {
  const stage = useStage();

  const [message, setMessage] = useState("");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [extraScenario, setExtraScenario] = useState<Scenario | null>(null);
  const [to, setTo] = useState<Recipient>("Manager");
  const [firmness, setFirmness] = useState<Firmness>("Balanced");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<RephraseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  // What the current result was written from — lets the button go quiet
  // when nothing has changed since the last translation.
  const [resultKey, setResultKey] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);

  const inputKey = JSON.stringify([message.trim(), scenario, to, firmness]);
  const isCurrent = status === "done" && resultKey === inputKey;
  const loading = status === "loading";

  const translate = async () => {
    const text = message.trim();
    if (!text) {
      setHint("Write something first.");
      textareaRef.current?.focus();
      return;
    }
    const id = ++requestId.current;
    const key = JSON.stringify([text, scenario, to, firmness]);
    setStatus("loading");
    setError(null);
    setCopied(false);
    try {
      const res = await fetch("/api/rephrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, scenario, to, firmness }),
      });
      const data = await res.json().catch(() => null);
      if (id !== requestId.current) return;
      if (!res.ok || typeof data?.message !== "string") {
        throw new Error(typeof data?.error === "string" ? data.error : FALLBACK_ERROR);
      }
      setResult({ message: data.message, why: typeof data.why === "string" ? data.why : "" });
      setResultKey(key);
      setStatus("done");
      if (stage?.stacked) {
        requestAnimationFrame(() =>
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        );
      }
    } catch (e) {
      if (id !== requestId.current) return;
      setError(e instanceof Error && e.message ? e.message : FALLBACK_ERROR);
      setStatus("error");
    }
  };

  const clear = () => {
    requestId.current++;
    setMessage("");
    setScenario(null);
    setExtraScenario(null);
    setResult(null);
    setResultKey(null);
    setError(null);
    setHint(null);
    setStatus("idle");
    textareaRef.current?.focus();
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const pickScenario = (s: Scenario) => setScenario((cur) => (cur === s ? null : s));

  // Close the "More" list on outside click / Escape.
  const moreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMoreOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const visibleScenarios = extraScenario ? [...PRIMARY_SCENARIOS, extraScenario] : PRIMARY_SCENARIOS;

  /* ---------------- draft page ---------------- */
  const draft = (
    <div className={styles.ui}>
      <div className={styles.header}>
        <h1 className={styles.title}>What do you want to say?</h1>
        <button type="button" className={styles.ghost} onClick={clear}>
          Clear
        </button>
      </div>

      <div className={styles.fields}>
        <div className={styles.group}>
          <span className={styles.label} id="lbl-situation">
            Pick a situation
          </span>
          <div className={styles.pills} role="radiogroup" aria-labelledby="lbl-situation">
            {visibleScenarios.map((s) => (
              <MarkerPill key={s} label={s} selected={scenario === s} onClick={() => pickScenario(s)} />
            ))}
            <div className={styles.moreWrap} ref={moreRef}>
              <button
                type="button"
                className={`${styles.pill} ${styles.morePill}`}
                aria-haspopup="listbox"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((v) => !v)}
              >
                <span className={styles.pillLabel}>More</span>
                <ChevronDownIcon size={16} className={moreOpen ? styles.chevUp : undefined} />
              </button>
              {moreOpen && (
                <ul className={styles.moreList} role="listbox" aria-label="More situations">
                  {MORE_SCENARIOS.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={scenario === s}
                        className={styles.moreItem}
                        onClick={() => {
                          setExtraScenario(s);
                          setScenario(s);
                          setMoreOpen(false);
                        }}
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className={styles.messageGroup}>
          <label htmlFor="draft" className={styles.srOnly}>
            Your message
          </label>
          <textarea
            id="draft"
            ref={textareaRef}
            className={styles.field}
            placeholder="Type it the way you’d say it to a friend…"
            value={message}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={(e) => {
              setMessage(e.target.value);
              if (hint) setHint(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                translate();
              }
            }}
          />
          <div className={styles.hintRow}>
            <span className={styles.hint} role="status">
              {hint}
            </span>
            <span className={styles.counter}>
              {message.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
        </div>

        <div className={styles.group}>
          <span className={styles.label} id="lbl-to">
            Sending to
          </span>
          <div className={styles.pills} role="radiogroup" aria-labelledby="lbl-to">
            {RECIPIENTS.map((r) => (
              <MarkerPill key={r} label={r} selected={to === r} onClick={() => setTo(r)} />
            ))}
          </div>
        </div>

        <div className={styles.group}>
          <span className={styles.label} id="lbl-firm">
            How firm?
          </span>
          <div className={styles.pills} role="radiogroup" aria-labelledby="lbl-firm">
            {FIRMNESS.map((f) => (
              <MarkerPill key={f} label={f} selected={firmness === f} onClick={() => setFirmness(f)} />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.action}>
        <button
          type="button"
          className={`${styles.primary} ${isCurrent ? styles.primaryQuiet : ""}`}
          onClick={translate}
          aria-busy={loading}
          disabled={loading}
        >
          {loading ? "Translating…" : "Translate"}
          <SparkleIcon size={20} className={loading ? styles.sparkleBusy : undefined} />
        </button>
      </div>
    </div>
  );

  /* ---------------- result page ---------------- */
  const output = (
    <div className={styles.ui} ref={resultRef}>
      <div className={styles.header}>
        <h2 className={styles.title}>Here’s how to say it</h2>
        {result && status !== "loading" && (
          <div className={styles.actions}>
            <button type="button" className={styles.outline} onClick={translate}>
              <RepeatIcon />
              Retry
            </button>
            <button type="button" className={styles.outline} onClick={copy}>
              <CopyIcon />
              <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        )}
      </div>

      {status === "done" && result ? (
        <div className={styles.resultBody}>
          <div className={styles.messageBox}>
            <p className={styles.messageText}>{result.message}</p>
            <hr className={styles.divider} />
            <p className={styles.meta}>
              To your {to.toLowerCase()} · {firmness} · {wordCount(result.message)} words
            </p>
          </div>
          {result.why && (
            <div className={styles.why}>
              <span className={styles.label}>Why this works</span>
              <p className={styles.whyText}>{result.why}</p>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`${styles.empty} ${loading ? styles.emptyLoading : ""} ${
            status === "error" ? styles.emptyError : ""
          }`}
          aria-live="polite"
        >
          {loading ? (
            <p>Writing it up…</p>
          ) : status === "error" ? (
            <>
              <p>{error}</p>
              <button type="button" className={styles.ghost} onClick={translate}>
                Try again
              </button>
            </>
          ) : (
            <p>Your polished message shows up here</p>
          )}
        </div>
      )}
    </div>
  );

  if (!stage) return <main className={styles.boot} />;

  if (stage.stacked) {
    return (
      <main className={styles.mobile}>
        <div className={styles.mFolder}>
          <div className={styles.mTab}>Rephrase</div>
          <section className={`${styles.sheet} ${styles.mSheet}`} aria-label="Your draft">
            {draft}
          </section>
          <section className={`${styles.sheet} ${styles.mSheet}`} aria-label="Rewritten message">
            {output}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.viewport} style={{ height: stage.height }}>
      <div
        className={styles.stage}
        style={{
          transform: `translate(-50%, -50%) scale(${stage.scale})`,
          top: stage.height / 2 + ((STAGE_H / 2 - 455) * stage.scale),
        }}
      >
        {/* desk objects — decorative, fixed size inside the scaled scene */}
        {/* eslint-disable @next/next/no-img-element */}
        <img className={styles.obj} src="/desk/headphones.webp" alt="" style={obj(0, 38, 200, 236, 16)} />
        <img className={styles.obj} src="/desk/paper.webp" alt="" style={obj(81, 639, 190, 188, -8)} />
        <img className={styles.obj} src="/desk/calculator.webp" alt="" style={obj(1262, 197, 170, 317, -12)} />
        <img className={`${styles.obj} ${styles.objSmall}`} src="/desk/shaving.webp" alt="" style={obj(1300, 683, 96, 114, 24)} />

        <div className={styles.folder}>
          <div className={styles.backPanel} />
          <svg className={styles.cover} width="522" height="706" viewBox="0 0 522 706" aria-hidden="true">
            <defs>
              <linearGradient id="coverFill" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#b8c7d2" />
                <stop offset="0.85" stopColor="#b3c3cf" />
                <stop offset="1" stopColor="#a6b7c4" />
              </linearGradient>
              <clipPath id="coverClip">
                <path d={COVER_PATH} />
              </clipPath>
            </defs>
            <path d={COVER_PATH} fill="url(#coverFill)" />
            <g clipPath="url(#coverClip)">
              <path d={COVER_PATH} fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="3" transform="translate(0 1.5)" />
              <path d={COVER_PATH} fill="none" stroke="#5e6f7c" strokeOpacity=".3" strokeWidth="4" transform="translate(0 -3)" />
            </g>
          </svg>
          <span className={styles.tabLabel}>Rephrase</span>
          <div className={styles.spine} />
          <div className={styles.cornerShadow} />

          <div className={`${styles.under} ${styles.under2}`} />
          <div className={`${styles.under} ${styles.under1}`} />
          <section className={`${styles.sheet} ${styles.draftSheet}`} aria-label="Your draft">
            {draft}
          </section>

          <div className={`${styles.under} ${styles.underRight}`} />
          <section className={`${styles.sheet} ${styles.outputSheet}`} aria-label="Rewritten message">
            {output}
          </section>

          <svg className={styles.pocket} width="522" height="170" viewBox="0 0 522 170" aria-hidden="true">
            <path
              d="M0 34H206C218 34 224 62 261 62C298 62 304 34 316 34H522V156C522 165.333 517.333 170 508 170H14C4.66667 170 0 165.333 0 156V34Z"
              fill="#bccad5"
            />
            <path
              d="M0 35.5H206C218 35.5 224 63.5 261 63.5C298 63.5 304 35.5 316 35.5H522"
              fill="none"
              stroke="#fff"
              strokeOpacity=".4"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>
    </main>
  );
}

// Front cover with its tab, exported from the Figma vector.
const COVER_PATH =
  "M 0 14 C 0 6.3 6.3 0 14 0 L 159 0 C 174.12 0 179.88 46 195 46 L 508 46 C 515.7 46 522 52.3 522 60 L 522 692 C 522 699.7 515.7 706 508 706 L 14 706 C 6.3 706 0 699.7 0 692 L 0 14 Z";

// Figma rotations are counter-clockwise around the node's top-left corner.
function obj(x: number, y: number, w: number, h: number, figmaRotation: number) {
  return {
    left: x,
    top: y,
    width: w,
    height: h,
    transform: `rotate(${-figmaRotation}deg)`,
  } as const;
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
