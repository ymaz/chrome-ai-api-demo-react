import type { SummaryType } from "../types";

export type UIState = {
  isSupported: boolean;
  availability: string;
  inputText: string;
  summary: string;
  streamedSummary: string;
  isSummarizing: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  streamingMode: boolean;
  summaryType: SummaryType;
  summaryFormat: "plain-text" | "markdown";
  summaryLength: "short" | "medium" | "long";
  sharedContext: string;
  summaryHistory: Array<{
    type: string;
    original: string;
    summary: string;
    timestamp: string; // ISO string for portability
  }>;
};

export type UIAction =
  | { type: "setSupported"; payload: boolean }
  | { type: "setAvailability"; payload: string }
  | { type: "setInputText"; payload: string }
  | { type: "setSummary"; payload: string }
  | { type: "setStreamedSummary"; payload: string }
  | { type: "setIsSummarizing"; payload: boolean }
  | { type: "setIsDownloading"; payload: boolean }
  | { type: "setDownloadProgress"; payload: number }
  | { type: "setStreamingMode"; payload: boolean }
  | { type: "setSummaryType"; payload: SummaryType }
  | { type: "setSummaryFormat"; payload: "plain-text" | "markdown" }
  | { type: "setSummaryLength"; payload: "short" | "medium" | "long" }
  | { type: "setSharedContext"; payload: string }
  | {
      type: "addHistory";
      payload: UIState["summaryHistory"][number];
    }
  | { type: "clearAll" };

export const initialState: UIState = {
  isSupported: typeof window !== "undefined" && "Summarizer" in self,
  availability: "",
  inputText: "",
  summary: "",
  streamedSummary: "",
  isSummarizing: false,
  isDownloading: false,
  downloadProgress: 0,
  streamingMode: false,
  summaryType: "tl;dr",
  summaryFormat: "plain-text",
  summaryLength: "medium",
  sharedContext: "",
  summaryHistory: [],
};

export function reducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "setSupported":
      return { ...state, isSupported: action.payload };
    case "setAvailability":
      return { ...state, availability: action.payload };
    case "setInputText":
      return { ...state, inputText: action.payload };
    case "setSummary":
      return { ...state, summary: action.payload };
    case "setStreamedSummary":
      return { ...state, streamedSummary: action.payload };
    case "setIsSummarizing":
      return { ...state, isSummarizing: action.payload };
    case "setIsDownloading":
      return { ...state, isDownloading: action.payload };
    case "setDownloadProgress":
      return { ...state, downloadProgress: action.payload };
    case "setStreamingMode":
      return { ...state, streamingMode: action.payload };
    case "setSummaryType":
      return { ...state, summaryType: action.payload };
    case "setSummaryFormat":
      return { ...state, summaryFormat: action.payload };
    case "setSummaryLength":
      return { ...state, summaryLength: action.payload };
    case "setSharedContext":
      return { ...state, sharedContext: action.payload };
    case "addHistory":
      return {
        ...state,
        summaryHistory: [action.payload, ...state.summaryHistory.slice(0, 9)],
      };
    case "clearAll":
      return {
        ...state,
        inputText: "",
        summary: "",
        streamedSummary: "",
        sharedContext: "",
      };
    default:
      return state;
  }
}
