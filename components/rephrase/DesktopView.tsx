"use client";

import { SCENARIOS, TONE_LABELS } from "./translations";
import type { TranslatorViewProps } from "./types";
import styles from "./Rephrase.module.css";
import FormalitySlider from "./FormalitySlider";
import SparkleIcon from "./SparkleIcon";

export default function DesktopView(props: TranslatorViewProps) {
  const {
    inputText,
    translatedText,
    isLoading,
    selectedScenario,
    scenarioOpen,
    formalityStep,
    formalityLabel,
    copyText,
    feedbackGiven,
    activeTone,
    errorMessage,
    onInputChange,
    onToggleScenarioDropdown,
    onSelectScenario,
    onSliderClick,
    onCopy,
    onThumbsUp,
    onThumbsDown,
    onToneClick,
    onTranslate,
  } = props;

  const hasTranslation = !!translatedText;
  const showEmpty = !translatedText && !isLoading;
  const showResult = !!translatedText && !isLoading;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 28px",
          background: "#0C1222",
          borderBottom: "1px solid rgba(255,255,255,.06)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              background: "#059669",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 12L8 4L14 12"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            style={{
              fontWeight: 600,
              fontSize: 17,
              color: "#E2E8F0",
              letterSpacing: "-0.02em",
            }}
          >
            Rephrase
          </span>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          padding: 32,
          display: "flex",
          gap: 24,
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Input Card */}
        <div
          style={{
            flex: 1,
            background: "#1A2235",
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: 16,
            padding: 28,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 18,
              color: "#F1F5F9",
              letterSpacing: "-0.03em",
              marginBottom: 2,
            }}
          >
            Your message
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#64748B",
              marginBottom: 20,
              lineHeight: 1.4,
            }}
          >
            Say it your way, we&apos;ll make it professional
          </div>
          <textarea
            style={{
              flex: 1,
              minHeight: 150,
              background: "#111827",
              border: "1.5px solid rgba(255,255,255,.08)",
              borderRadius: 12,
              padding: 16,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 14,
              color: "#E2E8F0",
              lineHeight: 1.7,
              resize: "none",
              outline: "none",
              boxSizing: "border-box",
              width: "100%",
            }}
            placeholder='e.g. "I need to tell my boss that this deadline is unrealistic and the team is burning out..."'
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
          />

          {/* Scenario */}
          <div style={{ marginTop: 18 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 7,
              }}
            >
              Scenario
            </div>
            <div style={{ position: "relative" }}>
              <div
                onClick={onToggleScenarioDropdown}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "11px 14px",
                  background: "#111827",
                  border: "1.5px solid rgba(255,255,255,.08)",
                  borderRadius: 10,
                  fontSize: 14,
                  color: "#CBD5E1",
                  cursor: "pointer",
                }}
              >
                <span>{selectedScenario}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="#64748B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {scenarioOpen && (
                <div
                  className={styles.scenarioDropdownList}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    background: "#1A2235",
                    border: "1px solid rgba(255,255,255,.1)",
                    borderRadius: 10,
                    boxShadow: "0 12px 32px rgba(0,0,0,.4)",
                    zIndex: 10,
                  }}
                >
                  {SCENARIOS.map((scenario) => (
                    <div
                      key={scenario}
                      onClick={() => onSelectScenario(scenario)}
                      className={styles.scenarioItem}
                    >
                      {scenario}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Formality */}
          <div style={{ marginTop: 16 }}>
            <FormalitySlider
              formalityStep={formalityStep}
              formalityLabel={formalityLabel}
              onChange={onSliderClick}
            />
          </div>

          {/* Translate button */}
          <div onClick={onTranslate} className={styles.translateButton}>
            {isLoading ? (
              "Translating..."
            ) : (
              <>
                Translate
                <SparkleIcon />
              </>
            )}
          </div>
        </div>

        {/* Output Card */}
        <div
          style={{
            flex: 1,
            background: "#1A2235",
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: 16,
            padding: 28,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: "#F1F5F9",
                letterSpacing: "-0.03em",
              }}
            >
              Translation
            </div>
            {hasTranslation && (
              <div style={{ display: "flex", gap: 6 }}>
                <div onClick={onCopy} className={styles.pillButton}>
                  {copyText}
                </div>
              </div>
            )}
          </div>

          {/* Empty state */}
          {showEmpty && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                color: "#475569",
              }}
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect
                  x="8"
                  y="12"
                  width="32"
                  height="24"
                  rx="4"
                  stroke="#334155"
                  strokeWidth="2"
                />
                <path
                  d="M16 22H32M16 28H26"
                  stroke="#334155"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <div
                style={{ fontSize: 14, textAlign: "center", lineHeight: 1.5 }}
              >
                {errorMessage ? (
                  <>
                    <div style={{ color: "#64748B", fontWeight: 500 }}>
                      {errorMessage}
                    </div>
                    <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                      Please try again.
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ color: "#64748B", fontWeight: 500 }}>
                      Your translation will appear here
                    </div>
                    <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                      Type your message and hit Translate
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                padding: 20,
                background: "rgba(5,150,105,.04)",
                border: "1.5px solid rgba(5,150,105,.12)",
                borderRadius: 12,
              }}
            >
              <div
                className={styles.shimmerBar}
                style={{ height: 14, width: "90%" }}
              />
              <div
                className={styles.shimmerBar}
                style={{ height: 14, width: "100%", animationDelay: ".15s" }}
              />
              <div
                className={styles.shimmerBar}
                style={{ height: 14, width: "75%", animationDelay: ".3s" }}
              />
              <div
                className={styles.shimmerBar}
                style={{ height: 14, width: "85%", animationDelay: ".45s" }}
              />
            </div>
          )}

          {/* Translation result */}
          {showResult && (
            <>
              <div
                className={styles.fadeUp}
                style={{
                  flex: 1,
                  background: "rgba(5,150,105,.04)",
                  border: "1.5px solid rgba(5,150,105,.12)",
                  borderRadius: 12,
                  padding: 20,
                  fontSize: 15,
                  color: "#E2E8F0",
                  lineHeight: 1.85,
                  letterSpacing: "-0.01em",
                }}
              >
                {translatedText}
              </div>

              {/* Tone pills */}
              <div style={{ marginTop: 18 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#94A3B8",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 8,
                  }}
                >
                  Adjust tone
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {TONE_LABELS.map((label) => {
                    const active = activeTone === label;
                    return (
                      <div
                        key={label}
                        onClick={() => onToneClick(label)}
                        className={styles.tonePill}
                        style={{
                          background: active
                            ? "rgba(5,150,105,.15)"
                            : "rgba(255,255,255,.05)",
                          borderColor: active
                            ? "rgba(5,150,105,.3)"
                            : "rgba(255,255,255,.08)",
                          color: active ? "#34D399" : "#CBD5E1",
                        }}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Feedback */}
              <div
                style={{
                  marginTop: 22,
                  paddingTop: 16,
                  borderTop: "1px solid rgba(255,255,255,.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 12, color: "#64748B" }}>
                  {feedbackGiven ? "Thanks for your feedback!" : "Was this helpful?"}
                </span>
                {!feedbackGiven && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <div
                      onClick={onThumbsUp}
                      className={`${styles.thumbButton} ${styles.thumbUp}`}
                    >
                      👍
                    </div>
                    <div
                      onClick={onThumbsDown}
                      className={`${styles.thumbButton} ${styles.thumbDown}`}
                    >
                      👎
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
