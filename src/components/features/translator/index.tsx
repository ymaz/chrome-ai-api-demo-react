import React, { useEffect, useRef, useReducer } from "react";
import { Toaster } from "@/components/ui/sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Globe,
  Languages,
  RefreshCw,
  Sparkles,
  Zap,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TranslationSettings from "./parts/TranslationSettings";
import TranslationIO from "./parts/TranslationIO";
import SampleTexts from "./parts/SampleTexts";
import DetectionPanel from "./parts/DetectionPanel";
import HistoryPanel from "./parts/HistoryPanel";
import {
  SAMPLE_TEXTS,
  normalizeToPrimaryTag,
  resolveLanguageName,
} from "./shared/constants";
import type {
  Translator,
  LanguageDetector,
  TranslatorOptions,
} from "./shared/types";

type UIState = {
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

type UIAction =
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

// Symbol for translator cleanup for progress listeners
const cleanupSymbol = Symbol("progressCleanup");

export const TranslatorFeatureComponent: React.FC = () => {
  // Simple feature presence checks per docs
  // https://developer.chrome.com/docs/ai/translator-api
  // https://developer.chrome.com/docs/ai/language-detection
  const hasTranslator = "Translator" in self;
  const hasLanguageDetector = "LanguageDetector" in self;
  const isSupported = hasTranslator;

  const reducer = (state: UIState, action: UIAction): UIState => {
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
  };

  const [state, dispatch] = useReducer(reducer, {
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
  });

  const translatorRef = useRef<
    (Translator & { [cleanupSymbol]?: () => void }) | null
  >(null);
  const detectorRef = useRef<LanguageDetector | null>(null);

  useEffect(() => {
    // Initialize detector if present so detection can be used immediately
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
    return () => {
      abortController.abort();
      if (translatorRef.current) {
        translatorRef.current[cleanupSymbol]?.();
        translatorRef.current.destroy();
      }
    };
    // hasLanguageDetector is static for a session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createTranslator = async () => {
    if (!window.Translator) return null;
    let downloadDone = false; // prevents duplicate toasts
    let cleanup = () => {};
    try {
      dispatch({ type: "setIsDownloading", payload: true });
      dispatch({ type: "setDownloadProgress", payload: 0 });
      const translator = await window.Translator.create({
        sourceLanguage: state.sourceLanguage,
        targetLanguage: state.targetLanguage,
        monitor(monitor: EventTarget) {
          // Use string type for correct event typing
          const onProgress = (event: Event) => {
            // Cast to correct type from our types
            const dp = event as unknown as { loaded: number; total: number };
            const progress = (dp.loaded / dp.total) * 100;
            dispatch({ type: "setDownloadProgress", payload: progress });
            if (progress === 100 && !downloadDone) {
              downloadDone = true;
              dispatch({ type: "setIsDownloading", payload: false });
              toast.success("Language pack ready!", {
                description: `${state.sourceLanguage} → ${state.targetLanguage} translation model downloaded successfully.`,
              });
            }
          };
          monitor.addEventListener(
            "downloadprogress",
            onProgress as EventListener
          );
          cleanup = () =>
            monitor.removeEventListener(
              "downloadprogress",
              onProgress as EventListener
            );
        },
      } as TranslatorOptions);
      (translator as Translator & { [cleanupSymbol]?: () => void })[
        cleanupSymbol
      ] = cleanup;
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
  };

  // New detection handler to hand off to DetectionPanel
  const handleDetectLanguage = async (text: string) => {
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
            detectedCodeRaw
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
  };

  const translateText = async () => {
    if (!state.inputText) {
      toast.error("No text to translate", {
        description: "Please enter some text to translate",
      });
      return;
    }
    dispatch({ type: "setIsTranslating", payload: true });
    dispatch({ type: "setTranslatedText", payload: "" });
    dispatch({ type: "setStreamedText", payload: "" });
    try {
      if (
        !translatorRef.current ||
        translatorRef.current.sourceLanguage !== state.sourceLanguage ||
        translatorRef.current.targetLanguage !== state.targetLanguage
      ) {
        if (translatorRef.current) {
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
          state.inputText
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
          translated: finalText || state.streamedText,
          timestamp: new Date().toISOString(), // Consistently as ISO string
        },
      });
      toast.success("Translation complete!", {
        description: `Translated from ${state.sourceLanguage} to ${state.targetLanguage}`,
      });
    } catch (error) {
      toast.error("Translation failed", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      dispatch({ type: "setIsTranslating", payload: false });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!", { description: "Text copied to clipboard" });
  };

  // swapLanguages handled in reducer

  const loadSampleText = (sample: (typeof SAMPLE_TEXTS)[0]) => {
    dispatch({ type: "setInputText", payload: sample.text });
    dispatch({ type: "setSourceLanguage", payload: sample.lang });
  };

  if (!isSupported) {
    return (
      <Card className="max-w-4xl mx-auto mt-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            Chrome Translator API Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Browser Not Supported</AlertTitle>
            <AlertDescription>
              The Chrome Translator API requires Chrome 138 or later with the
              Translation API enabled.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <h3 className="font-semibold">To enable the Translator API:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Open Chrome Dev or Chrome Canary (version 138+)</li>
              <li>
                Navigate to{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded">
                  chrome://flags
                </code>
              </li>
              <li>Search for "Experimental translation API"</li>
              <li>Enable the flag and restart Chrome</li>
              <li>
                Visit{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded">
                  chrome://on-device-translation-internals/
                </code>
              </li>
              <li>Install required language packs</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Toaster />
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-foreground" />
              <div>
                <CardTitle className="text-2xl">
                  Chrome Translator API Demo
                </CardTitle>
                <CardDescription>
                  On-device translation powered by Chrome's built-in AI
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant={hasTranslator ? "default" : "secondary"}>
                Translator API: {hasTranslator ? "available" : "no"}
              </Badge>
              <Badge variant={hasLanguageDetector ? "default" : "secondary"}>
                Detector API: {hasLanguageDetector ? "available" : "no"}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="translate" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="translate">
            <Languages className="h-4 w-4 mr-2" />
            Translate
          </TabsTrigger>
          <TabsTrigger value="detect">
            <Sparkles className="h-4 w-4 mr-2" />
            Detect Language
          </TabsTrigger>
          <TabsTrigger value="history">
            <RefreshCw className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="translate" className="space-y-4">
          <TranslationSettings
            sourceLanguage={state.sourceLanguage}
            targetLanguage={state.targetLanguage}
            setSourceLanguage={(v) =>
              dispatch({ type: "setSourceLanguage", payload: v })
            }
            setTargetLanguage={(v) =>
              dispatch({ type: "setTargetLanguage", payload: v })
            }
            streamingMode={state.streamingMode}
            setStreamingMode={(v) =>
              dispatch({ type: "setStreamingMode", payload: v })
            }
            isDownloading={state.isDownloading}
            downloadProgress={state.downloadProgress}
            swapLanguages={() => dispatch({ type: "swapLanguages" })}
          />
          <TranslationIO
            inputText={state.inputText}
            setInputText={(v) => dispatch({ type: "setInputText", payload: v })}
            isTranslating={state.isTranslating}
            streamingMode={state.streamingMode}
            streamedText={state.streamedText}
            translatedText={state.translatedText}
            copyToClipboard={copyToClipboard}
            translateText={translateText}
            clearAll={() => dispatch({ type: "clearTexts" })}
          />
          <SampleTexts onLoadSample={loadSampleText} />
        </TabsContent>

        <TabsContent value="detect" className="space-y-4">
          <DetectionPanel
            inputText={state.inputText}
            setInputText={(v) => dispatch({ type: "setInputText", payload: v })}
            onDetect={handleDetectLanguage}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <HistoryPanel translationHistory={state.translationHistory} />
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-foreground" />
              On-Device Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All translations happen locally in your browser. No data is sent
              to external servers.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Real-Time Translation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Experience instant translations with streaming mode for longer
              texts.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Privacy First
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your data never leaves your device. Complete privacy and security
              guaranteed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
