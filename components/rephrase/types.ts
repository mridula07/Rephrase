import type { Scenario, ToneLabel } from "./translations";

export interface TranslatorViewProps {
  inputText: string;
  translatedText: string;
  isLoading: boolean;
  selectedScenario: Scenario;
  scenarioOpen: boolean;
  formalityStep: number;
  formalityLabel: string;
  copyText: string;
  feedbackGiven: boolean;
  activeTone: ToneLabel | null;
  errorMessage: string | null;
  onInputChange: (value: string) => void;
  onToggleScenarioDropdown: () => void;
  onSelectScenario: (scenario: Scenario) => void;
  onSliderClick: (step: number) => void;
  onCopy: () => void;
  onThumbsUp: () => void;
  onThumbsDown: () => void;
  onToneClick: (tone: ToneLabel) => void;
  onTranslate: () => void;
}

export interface MobileViewProps extends TranslatorViewProps {
  mobileTab: "input" | "output";
  onShowInputTab: () => void;
  onShowOutputTab: () => void;
  onTranslateMobile: () => void;
}
