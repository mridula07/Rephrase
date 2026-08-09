"use client";

import { useEffect, useRef, useState } from "react";
import DesktopView from "./DesktopView";
import MobileView from "./MobileView";
import {
  getFormalityLabel,
  TONE_LABEL_TO_ID,
  type Scenario,
  type ToneLabel,
} from "./translations";

const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

const DESKTOP_SAMPLE_TEXT =
  "I need to tell my boss that this deadline is unrealistic and the team is burning out";
const MOBILE_SAMPLE_TEXT =
  "I need to tell my boss that this deadline is unrealistic";

export default function Rephrase() {
  const [width, setWidth] = useState(1024);
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(
    "Asking for a raise"
  );
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [formalityStep, setFormalityStep] = useState(2); // default: Professional
  const [copyText, setCopyText] = useState("Copy");
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [mobileTab, setMobileTab] = useState<"input" | "output">("input");
  const [activeTone, setActiveTone] = useState<ToneLabel | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const toneRequestInFlightRef = useRef(false);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    window.addEventListener("resize", update);
    update();
    return () => window.removeEventListener("resize", update);
  }, []);

  const isMobile = width < 768;
  const formalityLabel = getFormalityLabel(formalityStep);

  const runTranslate = (sampleText: string, onDone?: () => void) => {
    const useSample = !inputText.trim() && !translatedText;
    const messageToSend = useSample ? sampleText : inputText;

    if (useSample) {
      setInputText(sampleText);
    }
    setIsLoading(true);
    setTranslatedText("");
    setErrorMessage(null);
    setFeedbackGiven(false);
    setActiveTone(null);
    onDone?.();

    fetch("/api/rephrase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: messageToSend,
        scenario: selectedScenario,
        formality: formalityLabel,
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || typeof data?.text !== "string") {
          throw new Error(
            typeof data?.error === "string" ? data.error : GENERIC_ERROR_MESSAGE
          );
        }
        setTranslatedText(data.text);
      })
      .catch((error: unknown) => {
        setErrorMessage(
          error instanceof Error && error.message
            ? error.message
            : GENERIC_ERROR_MESSAGE
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleToneClick = (tone: ToneLabel) => {
    if (!translatedText || toneRequestInFlightRef.current) return;

    if (activeTone === tone) {
      // Toggling the same tone off. There's no stored pre-tone snapshot to
      // restore (the AI refines whatever is currently shown), so this just
      // clears the active indicator rather than pretending to revert text.
      setActiveTone(null);
      return;
    }

    toneRequestInFlightRef.current = true;
    setErrorMessage(null);

    fetch("/api/rephrase/tone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: translatedText,
        tone: TONE_LABEL_TO_ID[tone],
        formality: formalityLabel,
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || typeof data?.text !== "string") {
          throw new Error(
            typeof data?.error === "string" ? data.error : GENERIC_ERROR_MESSAGE
          );
        }
        setTranslatedText(data.text);
        setActiveTone(tone);
      })
      .catch((error: unknown) => {
        // Keep the existing translation on screen; only surface the error.
        setErrorMessage(
          error instanceof Error && error.message
            ? error.message
            : GENERIC_ERROR_MESSAGE
        );
      })
      .finally(() => {
        toneRequestInFlightRef.current = false;
      });
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard?.writeText(translatedText);
    setCopyText("Copied!");
    setTimeout(() => setCopyText("Copy"), 2000);
  };

  const sharedProps = {
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
    onInputChange: setInputText,
    onToggleScenarioDropdown: () => setScenarioOpen((v) => !v),
    onSelectScenario: (scenario: Scenario) => {
      setSelectedScenario(scenario);
      setScenarioOpen(false);
    },
    onSliderClick: (step: number) => setFormalityStep(step),
    onCopy: handleCopy,
    onThumbsUp: () => setFeedbackGiven(true),
    onThumbsDown: () => setFeedbackGiven(true),
    onToneClick: handleToneClick,
    onTranslate: () => runTranslate(DESKTOP_SAMPLE_TEXT),
  };

  if (isMobile) {
    return (
      <MobileView
        {...sharedProps}
        mobileTab={mobileTab}
        onShowInputTab={() => setMobileTab("input")}
        onShowOutputTab={() => setMobileTab("output")}
        onTranslateMobile={() =>
          runTranslate(MOBILE_SAMPLE_TEXT, () => setMobileTab("output"))
        }
      />
    );
  }

  return <DesktopView {...sharedProps} />;
}
