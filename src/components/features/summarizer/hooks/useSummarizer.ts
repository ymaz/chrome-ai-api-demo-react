import { useReducer, useRef, useEffect, useCallback } from "react";
import {
  reducer,
  initialState,
  type UIState,
  type UIAction,
} from "./summarizerState";
import { normalizeTypeForNewAPI } from "../constants";
import type {
  Summarizer,
  SummarizerMonitor,
  DownloadProgressEvent,
} from "../types";
import { toast } from "sonner";

// Symbol for cleanup function on summarizer instance
const cleanupSymbol = Symbol("summarizerProgressCleanup");

type UseSummarizerResult = {
  state: UIState;
  dispatch: React.Dispatch<UIAction>;
  summarizeText: () => Promise<void>;
  copyToClipboard: (text: string) => void;
  modelDownloaded: boolean;
};

export function useSummarizer(): UseSummarizerResult {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Ref to hold the current summarizer instance
  const summarizerRef = useRef<
    (Summarizer & { [cleanupSymbol]?: () => void }) | null
  >(null);

  // Fetch availability asynchronously if the new Summarizer API exists.
  useEffect(() => {
    let mounted = true;
    const fetchAvailability = async () => {
      if ("Summarizer" in self) {
        try {
          const availability = await (
            self as unknown as {
              Summarizer: { availability: () => Promise<string> };
            }
          ).Summarizer.availability();
          if (mounted) {
            dispatch({ type: "setAvailability", payload: availability });
          }
        } catch (e) {
          console.error("Failed to check summarizer availability:", e);
          if (mounted) {
            dispatch({ type: "setAvailability", payload: "error" });
          }
        }
      }
    };
    fetchAvailability();

    // Cleanup: ensure any active summarizer is destroyed when the component unmounts
    return () => {
      mounted = false;
      if (summarizerRef.current) {
        summarizerRef.current[cleanupSymbol]?.();
        try {
          summarizerRef.current.destroy();
        } catch {
          // ignore destroy errors during unmount
        }
      }
    };
  }, []);

  // Track if model has already been downloaded in this session
  const modelDownloadedRef = useRef(false);

  // Create summarizer instance with download progress monitoring
  const createSummarizer = useCallback(async () => {
    let cleanup = () => {};
    let downloadCompleted = false;
    try {
      dispatch({ type: "setIsDownloading", payload: true });
      dispatch({ type: "setDownloadProgress", payload: 0 });

      const commonOptions = {
        type: normalizeTypeForNewAPI(state.summaryType) as unknown as string,
        format: state.summaryFormat,
        length: state.summaryLength,
        sharedContext: state.sharedContext || undefined,
        monitor(monitor: SummarizerMonitor) {
          const onProgress = (event: Event) => {
            const dp = event as unknown as DownloadProgressEvent;
            const progress = dp.total > 0 ? (dp.loaded / dp.total) * 100 : 100;
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
          };
          monitor.addEventListener(
            "downloadprogress",
            onProgress as EventListener,
          );
          cleanup = () =>
            (monitor as unknown as EventTarget).removeEventListener(
              "downloadprogress",
              onProgress as EventListener,
            );
        },
      };

      let summarizer: Summarizer | null = null;
      if ("Summarizer" in self) {
        summarizer = await (
          self as unknown as {
            Summarizer: { create: (opts: unknown) => Promise<Summarizer> };
          }
        ).Summarizer.create(commonOptions);
      } else {
        dispatch({ type: "setIsDownloading", payload: false });
        return null;
      }
      (summarizer as Summarizer & { [cleanupSymbol]?: () => void })[
        cleanupSymbol
      ] = cleanup;
      if (!downloadCompleted) {
        dispatch({ type: "setIsDownloading", payload: false });
      }
      return summarizer as Summarizer & { [cleanupSymbol]?: () => void };
    } catch (error) {
      dispatch({ type: "setIsDownloading", payload: false });
      console.error("Failed to create summarizer:", error);
      toast.error("Error creating summarizer", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
      return null;
    }
  }, [
    state.summaryType,
    state.summaryFormat,
    state.summaryLength,
    state.sharedContext,
  ]);

  // Summarize text (handles both streaming and non-streaming modes)
  const summarizeText = useCallback(async () => {
    if (!state.inputText.trim()) {
      toast.error("No text to summarize", {
        description: "Please enter some text to summarize",
      });
      return;
    }

    dispatch({ type: "setIsSummarizing", payload: true });
    dispatch({ type: "setSummary", payload: "" });
    dispatch({ type: "setStreamedSummary", payload: "" });
    try {
      if (summarizerRef.current) {
        summarizerRef.current[cleanupSymbol]?.();
        summarizerRef.current.destroy();
      }
      summarizerRef.current = await createSummarizer();
      if (!summarizerRef.current)
        throw new Error("Failed to create summarizer");

      const context = state.sharedContext
        ? { context: state.sharedContext }
        : undefined;
      let finalSummary = "";
      if (state.streamingMode) {
        const stream = summarizerRef.current.summarizeStreaming(
          state.inputText,
          context,
        );
        const reader = stream.getReader();
        let full = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += value;
          dispatch({ type: "setStreamedSummary", payload: full });
        }
        finalSummary = full;
        dispatch({ type: "setSummary", payload: full });
      } else {
        const result = await summarizerRef.current.summarize(
          state.inputText,
          context,
        );
        finalSummary = result;
        dispatch({ type: "setSummary", payload: result });
      }

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
      console.error("Summarization failed:", error);
      toast.error("Summarization failed", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      dispatch({ type: "setIsSummarizing", payload: false });
    }
  }, [
    state.inputText,
    state.streamingMode,
    state.summaryType,
    state.sharedContext,
    createSummarizer,
  ]);

  // Memoized clipboard copy
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
