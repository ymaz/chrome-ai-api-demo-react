import { useReducer, useRef, useEffect, useCallback } from "react";
import {
  reducer,
  initialState,
  type UIState,
  type UIAction,
} from "./summarizerState";
import { normalizeTypeForNewAPI } from "../constants";
import type {
  CreateMonitor,
  DownloadProgressEvent,
  Summarizer,
  SummarizerOptions,
} from "../types";
import { toast } from "sonner";

type UseSummarizerResult = {
  state: UIState;
  dispatch: React.Dispatch<UIAction>;
  summarizeText: () => Promise<void>;
  copyToClipboard: (text: string) => void;
  modelDownloaded: boolean;
};

type ActiveSettings = {
  type: string;
  format: string;
  length: string;
  sharedContext: string;
};

export function useSummarizer(): UseSummarizerResult {
  const [state, dispatch] = useReducer(reducer, initialState);

  const summarizerRef = useRef<Summarizer | null>(null);
  const activeSettingsRef = useRef<ActiveSettings | null>(null);
  const lifecycleAbortRef = useRef<AbortController | null>(null);
  const createAbortRef = useRef<AbortController | null>(null);
  const operationAbortRef = useRef<AbortController | null>(null);
  const modelDownloadedRef = useRef(false);

  // Lifecycle: check availability once, destroy on unmount.
  useEffect(() => {
    const lifecycleAbort = new AbortController();
    lifecycleAbortRef.current = lifecycleAbort;

    const fetchAvailability = async () => {
      if (typeof self === "undefined" || !("Summarizer" in self)) return;
      try {
        const availability = await Summarizer!.availability();
        if (!lifecycleAbort.signal.aborted) {
          dispatch({ type: "setAvailability", payload: availability });
        }
      } catch (e) {
        if (!lifecycleAbort.signal.aborted) {
          console.error("Failed to check summarizer availability:", e);
          dispatch({ type: "setAvailability", payload: "error" });
        }
      }
    };
    fetchAvailability();

    return () => {
      lifecycleAbort.abort();
      createAbortRef.current?.abort();
      operationAbortRef.current?.abort();
      try {
        summarizerRef.current?.destroy();
      } catch {
        // ignore destroy errors during unmount
      }
      summarizerRef.current = null;
      activeSettingsRef.current = null;
    };
  }, []);

  const createSummarizer = useCallback(
    async (signal: AbortSignal): Promise<Summarizer | null> => {
      if (typeof self === "undefined" || !("Summarizer" in self)) return null;
      let downloadCompleted = false;

      const options: SummarizerOptions = {
        type: normalizeTypeForNewAPI(state.summaryType),
        format: state.summaryFormat,
        length: state.summaryLength,
        sharedContext: state.sharedContext || undefined,
        signal,
        monitor(monitor: CreateMonitor) {
          monitor.addEventListener(
            "downloadprogress",
            (event: DownloadProgressEvent) => {
              const progress =
                event.total > 0 ? (event.loaded / event.total) * 100 : 100;
              dispatch({ type: "setDownloadProgress", payload: progress });
              if (progress >= 100 && !downloadCompleted) {
                downloadCompleted = true;
                dispatch({ type: "setIsDownloading", payload: false });
                if (!modelDownloadedRef.current) {
                  modelDownloadedRef.current = true;
                  toast.success("Summarizer ready!", {
                    description: "Model downloaded successfully.",
                  });
                }
              }
            },
          );
        },
      };

      try {
        const availability = await Summarizer!.availability(options);
        if (availability === "unavailable") {
          toast.error("Summarizer not available", {
            description: "Requested summarization is not supported on this device.",
          });
          return null;
        }

        if (availability !== "available") {
          dispatch({ type: "setIsDownloading", payload: true });
          dispatch({ type: "setDownloadProgress", payload: 0 });
        }

        const summarizer = await Summarizer!.create(options);
        dispatch({ type: "setIsDownloading", payload: false });
        return summarizer;
      } catch (error) {
        dispatch({ type: "setIsDownloading", payload: false });
        if (signal.aborted) return null;
        console.error("Failed to create summarizer:", error);
        toast.error("Error creating summarizer", {
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
        return null;
      }
    },
    [
      state.summaryType,
      state.summaryFormat,
      state.summaryLength,
      state.sharedContext,
    ],
  );

  const summarizeText = useCallback(async () => {
    if (!state.inputText.trim()) {
      toast.error("No text to summarize", {
        description: "Please enter some text to summarize",
      });
      return;
    }

    operationAbortRef.current?.abort();
    const operationAbort = new AbortController();
    operationAbortRef.current = operationAbort;
    const { signal } = operationAbort;

    dispatch({ type: "setIsSummarizing", payload: true });
    dispatch({ type: "setSummary", payload: "" });
    dispatch({ type: "setStreamedSummary", payload: "" });

    try {
      const currentSettings: ActiveSettings = {
        type: state.summaryType,
        format: state.summaryFormat,
        length: state.summaryLength,
        sharedContext: state.sharedContext,
      };
      const settingsChanged =
        !summarizerRef.current ||
        !activeSettingsRef.current ||
        activeSettingsRef.current.type !== currentSettings.type ||
        activeSettingsRef.current.format !== currentSettings.format ||
        activeSettingsRef.current.length !== currentSettings.length ||
        activeSettingsRef.current.sharedContext !== currentSettings.sharedContext;

      if (settingsChanged) {
        try {
          summarizerRef.current?.destroy();
        } catch {
          // ignore
        }
        summarizerRef.current = null;

        createAbortRef.current?.abort();
        const createAbort = new AbortController();
        createAbortRef.current = createAbort;
        summarizerRef.current = await createSummarizer(createAbort.signal);
        if (summarizerRef.current) {
          activeSettingsRef.current = currentSettings;
        }
      }

      if (!summarizerRef.current) return;
      if (signal.aborted) return;

      const callOptions = {
        ...(state.sharedContext ? { context: state.sharedContext } : {}),
        signal,
      };

      let finalSummary = "";
      if (state.streamingMode) {
        const stream = summarizerRef.current.summarizeStreaming(
          state.inputText,
          callOptions,
        );
        const reader = stream.getReader();
        try {
          let full = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            full += value;
            dispatch({ type: "setStreamedSummary", payload: full });
          }
          finalSummary = full;
          dispatch({ type: "setSummary", payload: full });
        } finally {
          reader.releaseLock();
        }
      } else {
        const result = await summarizerRef.current.summarize(
          state.inputText,
          callOptions,
        );
        finalSummary = result;
        dispatch({ type: "setSummary", payload: result });
      }

      if (signal.aborted) return;

      dispatch({
        type: "addHistory",
        payload: {
          type: state.summaryType,
          original: state.inputText,
          summary: finalSummary,
          timestamp: new Date().toISOString(),
        },
      });
      toast.success("Summary generated!", {
        description: `Created a ${state.summaryType} summary`,
      });
    } catch (error) {
      if (signal.aborted || (error instanceof Error && error.name === "AbortError")) {
        return;
      }
      console.error("Summarization failed:", error);
      toast.error("Summarization failed", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      if (!signal.aborted) {
        dispatch({ type: "setIsSummarizing", payload: false });
      }
    }
  }, [
    state.inputText,
    state.streamingMode,
    state.summaryType,
    state.summaryFormat,
    state.summaryLength,
    state.sharedContext,
    createSummarizer,
  ]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!", { description: "Text copied to clipboard" });
  }, []);

  return {
    state,
    dispatch,
    summarizeText,
    copyToClipboard,
    modelDownloaded: modelDownloadedRef.current,
  };
}
