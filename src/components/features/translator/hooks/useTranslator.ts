import { useReducer, useRef, useEffect, useCallback } from "react";
import {
  reducer,
  initialState,
  type UIState,
  type UIAction,
} from "./translatorState";
import { normalizeToPrimaryTag, resolveLanguageName } from "../constants";
import type {
  Translator,
  LanguageDetector,
  TranslatorOptions,
} from "../types";
import { toast } from "sonner";

// Symbol for cleanup function on translator instance
const cleanupSymbol = Symbol("translatorProgressCleanup");

type UseTranslatorResult = {
  state: UIState;
  dispatch: React.Dispatch<UIAction>;
  translateText: () => Promise<void>;
  handleDetectLanguage: (text: string) => Promise<{ lang: string; conf: number } | null>;
  copyToClipboard: (text: string) => void;
  hasTranslator: boolean;
  hasLanguageDetector: boolean;
};

export function useTranslator(): UseTranslatorResult {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Feature presence checks
  const hasTranslator = "Translator" in self;
  const hasLanguageDetector = "LanguageDetector" in self;

  // Ref to hold the current translator instance
  const translatorRef = useRef<
    (Translator & { [cleanupSymbol]?: () => void }) | null
  >(null);

  // Ref to hold the language detector instance
  const detectorRef = useRef<LanguageDetector | null>(null);

  // Initialize detector if present
  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;
    const init = async () => {
      if (!hasLanguageDetector || signal.aborted) return;
      try {
        const detector = await window.LanguageDetector!.create();
        if (signal.aborted) {
          // Best-effort cleanup if API provides destroy
          try {
            (detector as unknown as { destroy?: () => void }).destroy?.();
          } catch {
            // ignore
          }
          return;
        }
        detectorRef.current = detector;
        await detectorRef.current.ready;
      } catch (error) {
        if (!signal.aborted) {
          console.error("Failed to create language detector:", error);
        }
      }
    };
    init();

    // Cleanup: ensure any active translator is destroyed when the component unmounts
    return () => {
      abortController.abort();
      if (translatorRef.current) {
        translatorRef.current[cleanupSymbol]?.();
        try {
          translatorRef.current.destroy();
        } catch {
          // ignore destroy errors during unmount
        }
      }
    };
  }, [hasLanguageDetector]);

  // Create translator instance with download progress monitoring
  const createTranslator = useCallback(async () => {
    if (!window.Translator) return null;
    let cleanup = () => {};
    let downloadCompleted = false;
    try {
      dispatch({ type: "setIsDownloading", payload: true });
      dispatch({ type: "setDownloadProgress", payload: 0 });

      const translator = await window.Translator.create({
        sourceLanguage: state.sourceLanguage,
        targetLanguage: state.targetLanguage,
        monitor(monitor: EventTarget) {
          const onProgress = (event: Event) => {
            const dp = event as unknown as { loaded: number; total: number };
            const progress = dp.total > 0 ? (dp.loaded / dp.total) * 100 : 100;
            dispatch({ type: "setDownloadProgress", payload: progress });
            if (progress >= 100 && !downloadCompleted) {
              downloadCompleted = true;
              dispatch({ type: "setIsDownloading", payload: false });
              toast.success("Language pack ready!", {
                description: `${state.sourceLanguage} → ${state.targetLanguage} translation model downloaded successfully.`,
              });
            }
          };
          monitor.addEventListener(
            "downloadprogress",
            onProgress as EventListener,
          );
          cleanup = () =>
            monitor.removeEventListener(
              "downloadprogress",
              onProgress as EventListener,
            );
        },
      } as TranslatorOptions);

      (translator as Translator & { [cleanupSymbol]?: () => void })[
        cleanupSymbol
      ] = cleanup;
      if (!downloadCompleted) {
        dispatch({ type: "setIsDownloading", payload: false });
      }
      return translator as Translator & { [cleanupSymbol]?: () => void };
    } catch (error) {
      dispatch({ type: "setIsDownloading", payload: false });
      console.error("Failed to create translator:", error);
      toast.error("Error creating translator", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
      return null;
    }
  }, [state.sourceLanguage, state.targetLanguage]);

  // Translate text (handles both streaming and non-streaming modes)
  const translateText = useCallback(async () => {
    if (!state.inputText.trim()) {
      toast.error("No text to translate", {
        description: "Please enter some text to translate",
      });
      return;
    }

    dispatch({ type: "setIsTranslating", payload: true });
    dispatch({ type: "setTranslatedText", payload: "" });
    dispatch({ type: "setStreamedText", payload: "" });
    try {
      // Recreate translator if language pair changed
      if (
        !translatorRef.current ||
        translatorRef.current.sourceLanguage !== state.sourceLanguage ||
        translatorRef.current.targetLanguage !== state.targetLanguage
      ) {
        if (translatorRef.current) {
          translatorRef.current[cleanupSymbol]?.();
          translatorRef.current.destroy();
        }
        translatorRef.current = await createTranslator();
      }

      if (!translatorRef.current) {
        throw new Error("Failed to create translator");
      }

      let finalText = "";
      if (state.streamingMode) {
        const stream = translatorRef.current.translateStreaming(
          state.inputText,
        );
        const reader = stream.getReader();
        let fullText = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += value;
          dispatch({ type: "setStreamedText", payload: fullText });
        }
        dispatch({ type: "setTranslatedText", payload: fullText });
        finalText = fullText;
      } else {
        const result = await translatorRef.current.translate(state.inputText);
        dispatch({ type: "setTranslatedText", payload: result });
        finalText = result;
      }

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
      console.error("Translation failed:", error);
      toast.error("Translation failed", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      dispatch({ type: "setIsTranslating", payload: false });
    }
  }, [
    state.inputText,
    state.streamingMode,
    state.sourceLanguage,
    state.targetLanguage,
    createTranslator,
  ]);

  // Language detection handler
  const handleDetectLanguage = useCallback(async (text: string) => {
    if (!detectorRef.current || !text) return null;
    try {
      const results = await detectorRef.current.detect(text);
      if (results && results.length > 0) {
        const topResult = results[0] as {
          language?: string;
          detectedLanguage?: string;
          lang?: string;
          confidence: number;
        };
        const detectedCodeRaw: string | undefined =
          topResult.language || topResult.detectedLanguage || topResult.lang;
        const detectedCode = normalizeToPrimaryTag(detectedCodeRaw);
        if (detectedCode) {
          dispatch({ type: "setSourceLanguage", payload: detectedCode });
        }
        toast.success("Language detected!", {
          description: `Detected ${resolveLanguageName(
            detectedCodeRaw,
          )} with ${(topResult.confidence * 100).toFixed(1)}% confidence`,
        });
        return { lang: detectedCode, conf: topResult.confidence };
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

  // Memoized clipboard copy
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
    hasTranslator,
    hasLanguageDetector,
  };
}
