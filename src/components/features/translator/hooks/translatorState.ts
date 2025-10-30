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
  translationHistory: [],
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
          ...state.translationHistory.slice(0, 9),
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
