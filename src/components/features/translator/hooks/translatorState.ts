export type UIState = {
  sourceLanguage: string;
  targetLanguage: string;
  inputText: string;
  translatedText: string;
  streamedText: string;
  streamingMode: boolean;
  isTranslating: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  translationHistory: Array<{
    source: string;
    target: string;
    original: string;
    translated: string;
    timestamp: string; // ISO string for portability
  }>;
};

const HISTORY_KEY = "translator.history";
const MAX_HISTORY = 10;

type TranslationHistory = UIState["translationHistory"];

function isValidEntry(h: unknown): h is TranslationHistory[number] {
  return (
    !!h &&
    typeof h === "object" &&
    typeof (h as Record<string, unknown>).source === "string" &&
    typeof (h as Record<string, unknown>).target === "string" &&
    typeof (h as Record<string, unknown>).original === "string" &&
    typeof (h as Record<string, unknown>).translated === "string" &&
    typeof (h as Record<string, unknown>).timestamp === "string"
  );
}

function loadHistory(): TranslationHistory {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry).slice(0, MAX_HISTORY);
  } catch {
    return [];
  }
}

export function saveHistory(history: TranslationHistory): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
}

export type UIAction =
  | { type: "setSourceLanguage"; payload: string }
  | { type: "setTargetLanguage"; payload: string }
  | { type: "setInputText"; payload: string }
  | { type: "setTranslatedText"; payload: string }
  | { type: "setStreamedText"; payload: string }
  | { type: "setStreamingMode"; payload: boolean }
  | { type: "setIsTranslating"; payload: boolean }
  | { type: "setIsDownloading"; payload: boolean }
  | { type: "setDownloadProgress"; payload: number }
  | {
      type: "addTranslationHistory";
      payload: UIState["translationHistory"][number];
    }
  | { type: "clearTexts" }
  | { type: "swapLanguages" };

export const initialState: UIState = {
  sourceLanguage: "en",
  targetLanguage: "es",
  inputText: "",
  translatedText: "",
  streamedText: "",
  streamingMode: false,
  isTranslating: false,
  isDownloading: false,
  downloadProgress: 0,
  translationHistory: loadHistory(),
};

export function reducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "setSourceLanguage":
      return { ...state, sourceLanguage: action.payload };
    case "setTargetLanguage":
      return { ...state, targetLanguage: action.payload };
    case "setInputText":
      return { ...state, inputText: action.payload };
    case "setTranslatedText":
      return { ...state, translatedText: action.payload };
    case "setStreamedText":
      return { ...state, streamedText: action.payload };
    case "setStreamingMode":
      return { ...state, streamingMode: action.payload };
    case "setIsTranslating":
      return { ...state, isTranslating: action.payload };
    case "setIsDownloading":
      return { ...state, isDownloading: action.payload };
    case "setDownloadProgress":
      return { ...state, downloadProgress: action.payload };
    case "addTranslationHistory":
      return {
        ...state,
        translationHistory: [
          action.payload,
          ...state.translationHistory.slice(0, MAX_HISTORY - 1),
        ],
      };
    case "clearTexts":
      return {
        ...state,
        inputText: "",
        translatedText: "",
        streamedText: "",
      };
    case "swapLanguages":
      return {
        ...state,
        sourceLanguage: state.targetLanguage,
        targetLanguage: state.sourceLanguage,
        inputText: state.translatedText,
        translatedText: state.inputText,
      };
    default:
      return state;
  }
}
