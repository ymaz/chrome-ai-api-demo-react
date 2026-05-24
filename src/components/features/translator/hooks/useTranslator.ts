import { useReducer, useRef, useEffect, useCallback } from "react";
import {
  reducer,
  initialState,
  type UIState,
  type UIAction,
} from "./translatorState";
import { normalizeToPrimaryTag, resolveLanguageName } from "../constants";
import type {
  CreateMonitor,
  DownloadProgressEvent,
  LanguageDetector,
  Translator,
} from "../types";
import { toast } from "sonner";

type UseTranslatorResult = {
  state: UIState;
  dispatch: React.Dispatch<UIAction>;
  translateText: () => Promise<void>;
  handleDetectLanguage: (
    text: string,
  ) => Promise<{ lang: string; conf: number } | null>;
  copyToClipboard: (text: string) => void;
  hasTranslator: boolean;
  hasLanguageDetector: boolean;
};

const hasTranslatorAPI = typeof self !== "undefined" && "Translator" in self;
const hasLanguageDetectorAPI =
  typeof self !== "undefined" && "LanguageDetector" in self;

export function useTranslator(): UseTranslatorResult {
  const [state, dispatch] = useReducer(reducer, initialState);

  const translatorRef = useRef<Translator | null>(null);
  const detectorRef = useRef<LanguageDetector | null>(null);
  const operationAbortRef = useRef<AbortController | null>(null);

  // Lifecycle: initialize detector, destroy everything on unmount.
  useEffect(() => {
    const lifecycleAbort = new AbortController();
    const { signal } = lifecycleAbort;

    const init = async () => {
      if (!hasLanguageDetectorAPI) return;
      try {
        const availability = await window.LanguageDetector!.availability();
        if (signal.aborted || availability === "unavailable") return;
        const detector = await window.LanguageDetector!.create({ signal });
        if (signal.aborted) {
          detector.destroy?.();
          return;
        }
        detectorRef.current = detector;
        await detector.ready;
      } catch (error) {
        if (!signal.aborted) {
          console.error("Failed to create language detector:", error);
        }
      }
    };
    init();

    return () => {
      lifecycleAbort.abort();
      operationAbortRef.current?.abort();
      detectorRef.current?.destroy?.();
      detectorRef.current = null;
      try {
        translatorRef.current?.destroy();
      } catch {
        // ignore destroy errors during unmount
      }
      translatorRef.current = null;
    };
  }, []);

  const createTranslator = useCallback(
    async (signal: AbortSignal): Promise<Translator | null> => {
      if (!window.Translator) return null;
      let downloadCompleted = false;

      try {
        const availability = await window.Translator.availability({
          sourceLanguage: state.sourceLanguage,
          targetLanguage: state.targetLanguage,
        });

        if (availability === "unavailable") {
          toast.error("Language pair not supported", {
            description: `Translation from ${state.sourceLanguage} to ${state.targetLanguage} is not available on this device.`,
          });
          return null;
        }

        if (availability !== "available") {
          dispatch({ type: "setIsDownloading", payload: true });
          dispatch({ type: "setDownloadProgress", payload: 0 });
        }

        const translator = await window.Translator.create({
          sourceLanguage: state.sourceLanguage,
          targetLanguage: state.targetLanguage,
          signal,
          monitor(monitor: CreateMonitor) {
            monitor.addEventListener(
              "downloadprogress",
              (event: DownloadProgressEvent) => {
                // The downloadprogress event reports `loaded` as a 0..1 fraction.
                const progress = event.loaded * 100;
                dispatch({ type: "setDownloadProgress", payload: progress });
                if (progress >= 100 && !downloadCompleted) {
                  downloadCompleted = true;
                  dispatch({ type: "setIsDownloading", payload: false });
                  toast.success("Language pack ready!", {
                    description: `${state.sourceLanguage} → ${state.targetLanguage} translation model downloaded successfully.`,
                  });
                }
              },
            );
          },
        });

        dispatch({ type: "setIsDownloading", payload: false });
        return translator;
      } catch (error) {
        dispatch({ type: "setIsDownloading", payload: false });
        if (signal.aborted) return null;
        console.error("Failed to create translator:", error);
        toast.error("Error creating translator", {
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
        return null;
      }
    },
    [state.sourceLanguage, state.targetLanguage],
  );

  const translateText = useCallback(async () => {
    if (!state.inputText.trim()) {
      toast.error("No text to translate", {
        description: "Please enter some text to translate",
      });
      return;
    }

    operationAbortRef.current?.abort();
    const operationAbort = new AbortController();
    operationAbortRef.current = operationAbort;
    const { signal } = operationAbort;

    dispatch({ type: "setIsTranslating", payload: true });
    dispatch({ type: "setTranslatedText", payload: "" });
    dispatch({ type: "setStreamedText", payload: "" });

    try {
      const needsNewTranslator =
        !translatorRef.current ||
        translatorRef.current.sourceLanguage !== state.sourceLanguage ||
        translatorRef.current.targetLanguage !== state.targetLanguage;

      if (needsNewTranslator) {
        try {
          translatorRef.current?.destroy();
        } catch {
          // ignore
        }
        translatorRef.current = null;

        const created = await createTranslator(signal);
        // A newer operation (or unmount) may have superseded this one while we
        // awaited create. Don't clobber its instance; discard ours instead.
        if (signal.aborted) {
          created?.destroy();
          return;
        }
        translatorRef.current = created;
      }

      if (!translatorRef.current) return;
      if (signal.aborted) return;

      let finalText = "";
      if (state.streamingMode) {
        const stream = translatorRef.current.translateStreaming(
          state.inputText,
          { signal },
        );
        const reader = stream.getReader();
        try {
          let fullText = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fullText += value;
            dispatch({ type: "setStreamedText", payload: fullText });
          }
          dispatch({ type: "setTranslatedText", payload: fullText });
          finalText = fullText;
        } finally {
          if (signal.aborted) {
            reader.cancel().catch(() => {});
          } else {
            reader.releaseLock();
          }
        }
      } else {
        const result = await translatorRef.current.translate(state.inputText, {
          signal,
        });
        dispatch({ type: "setTranslatedText", payload: result });
        finalText = result;
      }

      if (signal.aborted) return;

      dispatch({
        type: "addTranslationHistory",
        payload: {
          source: state.sourceLanguage,
          target: state.targetLanguage,
          original: state.inputText,
          translated: finalText,
          timestamp: new Date().toISOString(),
        },
      });
      toast.success("Translation complete!", {
        description: `Translated from ${state.sourceLanguage} to ${state.targetLanguage}`,
      });
    } catch (error) {
      if (signal.aborted || (error instanceof Error && error.name === "AbortError")) {
        return;
      }
      console.error("Translation failed:", error);
      toast.error("Translation failed", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      if (!signal.aborted) {
        dispatch({ type: "setIsTranslating", payload: false });
      }
    }
  }, [
    state.inputText,
    state.streamingMode,
    state.sourceLanguage,
    state.targetLanguage,
    createTranslator,
  ]);

  const handleDetectLanguage = useCallback(async (text: string) => {
    if (!detectorRef.current || !text) return null;
    try {
      const results = await detectorRef.current.detect(text);
      if (results && results.length > 0) {
        const top = results[0];
        const detectedCode = normalizeToPrimaryTag(top.detectedLanguage);
        if (detectedCode) {
          dispatch({ type: "setSourceLanguage", payload: detectedCode });
        }
        toast.success("Language detected!", {
          description: `Detected ${resolveLanguageName(
            top.detectedLanguage,
          )} with ${(top.confidence * 100).toFixed(1)}% confidence`,
        });
        return { lang: detectedCode, conf: top.confidence };
      }
      toast.error("Detection failed", {
        description: "Could not detect language",
      });
      return null;
    } catch (error) {
      toast.error("Detection failed", {
        description:
          error instanceof Error ? error.message : "Could not detect language",
      });
      return null;
    }
  }, []);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!", { description: "Text copied to clipboard" });
  }, []);

  return {
    state,
    dispatch,
    translateText,
    handleDetectLanguage,
    copyToClipboard,
    hasTranslator: hasTranslatorAPI,
    hasLanguageDetector: hasLanguageDetectorAPI,
  };
}
