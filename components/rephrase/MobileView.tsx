"use client";

import { SCENARIOS, TONE_LABELS } from "./translations";
import type { MobileViewProps } from "./types";
import styles from "./Rephrase.module.css";
import FormalitySlider from "./FormalitySlider";
import SparkleIcon from "./SparkleIcon";

export default function MobileView(props: MobileViewProps) {
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
    mobileTab,
    onShowInputTab,
    onShowOutputTab,
    onTranslateMobile,
  } = props;

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
          padding: "14px 16px",
          background: "#0C1222",
          borderBottom: "1px solid rgba(255,255,255,.06)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: "#059669",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
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
              fontSize: 15,
              color: "#E2E8F0",
              letterSpacing: "-0.02em",
            }}
          >
            Rephrase
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          background: "#0C1222",
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <div
          onClick={onShowInputTab}
          className={styles.mobileTab}
          style={{
            borderBottomColor: mobileTab === "input" ? "#059669" : "transparent",
            color: mobileTab === "input" ? "#34D399" : "#64748B",
          }}
        >
          Write
        </div>
        <div
          onClick={onShowOutputTab}
          className={styles.mobileTab}
          style={{
            borderBottomColor: mobileTab === "output" ? "#059669" : "transparent",
            color: mobileTab === "output" ? "#34D399" : "#64748B",
          }}
        >
          Translation
        </div>
      </div>

      {/* Mobile body */}
      <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
        {/* Input tab */}
        {mobileTab === "input" && (
          <div
            className={styles.fadeUpFast}
            style={{
              background: "#1A2235",
              border: "1px solid rgba(255,255,255,.06)",
              borderRadius: 14,
              padding: 20,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: "#F1F5F9",
                letterSpacing: "-0.03em",
                marginBottom: 14,
              }}
            >
              Your message
            </div>
            <textarea
              style={{
                width: "100%",
                minHeight: 120,
                background: "#111827",
                border: "1.5px solid rgba(255,255,255,.08)",
                borderRadius: 10,
                padding: 14,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 14,
                color: "#E2E8F0",
                lineHeight: 1.6,
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
              }}
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
            />

            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#94A3B8",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 6,
                }}
              >
                Scenario
              </div>
              <div
                onClick={onToggleScenarioDropdown}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  background: "#111827",
                  border: "1.5px solid rgba(255,255,255,.08)",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "#CBD5E1",
                  cursor: "pointer",
                  position: "relative",
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
                    marginTop: 4,
                    background: "#1A2235",
                    border: "1px solid rgba(255,255,255,.1)",
                    borderRadius: 10,
                    boxShadow: "0 12px 32px rgba(0,0,0,.4)",
                  }}
                >
                  {SCENARIOS.map((scenario) => (
                    <div
                      key={scenario}
                      onClick={() => onSelectScenario(scenario)}
                      className={styles.scenarioItemMobile}
                    >
                      {scenario}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: 14 }}>
              <FormalitySlider
                formalityStep={formalityStep}
                formalityLabel={formalityLabel}
                onChange={onSliderClick}
              />
            </div>

            <div
              onClick={onTranslateMobile}
              className={styles.translateButtonMobile}
            >
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
        )}

        {/* Output tab */}
        {mobileTab === "output" && (
          <div className={styles.fadeUpFast}>
            {showEmpty && (
              <div
                style={{
                  background: "#1A2235",
                  border: "1px solid rgba(255,255,255,.06)",
                  borderRadius: 14,
                  padding: "40px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
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
                <div style={{ textAlign: "center" }}>
                  {errorMessage ? (
                    <>
                      <div style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>
                        {errorMessage}
                      </div>
                      <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                        Please try again.
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>
                        No translation yet
                      </div>
                      <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                        Switch to Write tab to get started
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {isLoading && (
              <div
                style={{
                  background: "#1A2235",
                  border: "1px solid rgba(255,255,255,.06)",
                  borderRadius: 14,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div className={styles.shimmerBar} style={{ height: 14, width: "90%" }} />
                <div
                  className={styles.shimmerBar}
                  style={{ height: 14, width: "100%", animationDelay: ".15s" }}
                />
                <div
                  className={styles.shimmerBar}
                  style={{ height: 14, width: "75%", animationDelay: ".3s" }}
                />
              </div>
            )}

            {showResult && (
              <div
                style={{
                  background: "#1A2235",
                  border: "1px solid rgba(255,255,255,.06)",
                  borderRadius: 14,
                  padding: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 16, color: "#F1F5F9" }}>
                    Translation
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <div onClick={onCopy} className={styles.pillButton}>
                      {copyText}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(5,150,105,.04)",
                    border: "1.5px solid rgba(5,150,105,.12)",
                    borderRadius: 10,
                    padding: 16,
                    fontSize: 14,
                    color: "#E2E8F0",
                    lineHeight: 1.8,
                  }}
                >
                  {translatedText}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    marginTop: 14,
                  }}
                >
                  {TONE_LABELS.map((label) => (
                    <div
                      key={label}
                      onClick={() => onToneClick(label)}
                      style={{
                        padding: "6px 14px",
                        background:
                          activeTone === label
                            ? "rgba(5,150,105,.15)"
                            : "rgba(255,255,255,.05)",
                        border: `1.5px solid ${
                          activeTone === label
                            ? "rgba(5,150,105,.3)"
                            : "rgba(255,255,255,.08)"
                        }`,
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 500,
                        color: activeTone === label ? "#34D399" : "#CBD5E1",
                        cursor: "pointer",
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 12,
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
                      <div onClick={onThumbsUp} className={styles.thumbButtonMobile}>
                        👍
                      </div>
                      <div onClick={onThumbsDown} className={styles.thumbButtonMobile}>
                        👎
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
