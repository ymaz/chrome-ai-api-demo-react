import React, { useEffect, useRef, useState } from "react";
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

export const TranslatorFeatureComponent: React.FC = () => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [sourceLanguage, setSourceLanguage] = useState<string>("en");
  const [targetLanguage, setTargetLanguage] = useState<string>("es");
  const [inputText, setInputText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [detectedLanguage, setDetectedLanguage] = useState<string>("");
  const [detectionConfidence, setDetectionConfidence] = useState<number>(0);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [streamingMode, setStreamingMode] = useState<boolean>(false);
  const [streamedText, setStreamedText] = useState<string>("");
  const [translatorStatus, setTranslatorStatus] = useState<string>("");
  const [detectorStatus, setDetectorStatus] = useState<string>("");
  const [translationHistory, setTranslationHistory] = useState<
    Array<{
      source: string;
      target: string;
      original: string;
      translated: string;
      timestamp: Date;
    }>
  >([]);

  const translatorRef = useRef<Translator | null>(null);
  const detectorRef = useRef<LanguageDetector | null>(null);

  useEffect(() => {
    checkAPISupport();
    return () => {
      if (translatorRef.current) {
        translatorRef.current.destroy();
      }
    };
  }, []);

  const checkAPISupport = async () => {
    const hasTranslator = "Translator" in self;
    const hasLanguageDetector = "LanguageDetector" in self;

    // Drive overall support by the Translator API presence
    setIsSupported(hasTranslator);

    // Drive status badges by simple presence checks per docs
    // https://developer.chrome.com/docs/ai/translator-api
    // https://developer.chrome.com/docs/ai/language-detection
    setTranslatorStatus(hasTranslator ? "available" : "no");
    setDetectorStatus(hasLanguageDetector ? "available" : "no");

    // Initialize detector if present so detection can be used immediately
    if (hasLanguageDetector) {
      try {
        detectorRef.current = await window.LanguageDetector!.create();
        await detectorRef.current.ready;
      } catch (error) {
        console.error("Failed to create language detector:", error);
      }
    }
  };

  // With simplified presence checks, re-checking on language changes is unnecessary.
  // If desired, we could re-check only when overall support flips, but in practice
  // support won't change during a session, so we omit this effect.

  const createTranslator = async () => {
    if (!window.Translator) return null;
    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      const translator = await window.Translator.create({
        sourceLanguage,
        targetLanguage,
        monitor(monitor) {
          monitor.addEventListener("downloadprogress", (event) => {
            const progress = (event.loaded / event.total) * 100;
            setDownloadProgress(progress);
            if (progress === 100) {
              setIsDownloading(false);
              toast.success("Language pack ready!", {
                description: `${sourceLanguage} → ${targetLanguage} translation model downloaded successfully.`,
              });
            }
          });
        },
      } as TranslatorOptions);
      return translator;
    } catch (error) {
      setIsDownloading(false);
      console.error("Failed to create translator:", error);
      toast.error("Error creating translator", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
      return null;
    }
  };

  const detectLanguage = async () => {
    if (!detectorRef.current || !inputText) return;
    setIsDetecting(true);
    try {
      const results = await detectorRef.current.detect(inputText);
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
          setDetectedLanguage(detectedCode);
          setSourceLanguage(detectedCode);
        }
        setDetectionConfidence(topResult.confidence);
        toast.success("Language detected!", {
          description: `Detected ${resolveLanguageName(
            detectedCodeRaw
          )} with ${(topResult.confidence * 100).toFixed(1)}% confidence`,
        });
      }
    } catch (error) {
      console.error("Language detection failed:", error);
      toast.error("Detection failed", {
        description:
          error instanceof Error ? error.message : "Could not detect language",
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const translateText = async () => {
    if (!inputText) {
      toast.error("No text to translate", {
        description: "Please enter some text to translate",
      });
      return;
    }
    setIsTranslating(true);
    setTranslatedText("");
    setStreamedText("");
    try {
      if (
        !translatorRef.current ||
        translatorRef.current.sourceLanguage !== sourceLanguage ||
        translatorRef.current.targetLanguage !== targetLanguage
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
      if (streamingMode) {
        const stream = translatorRef.current.translateStreaming(inputText);
        const reader = stream.getReader();
        let fullText = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += value;
          setStreamedText(fullText);
        }
        setTranslatedText(fullText);
        finalText = fullText;
      } else {
        const result = await translatorRef.current.translate(inputText);
        setTranslatedText(result);
        finalText = result;
      }
      const historyEntry = {
        source: sourceLanguage,
        target: targetLanguage,
        original: inputText,
        translated: finalText || streamedText,
        timestamp: new Date(),
      };
      setTranslationHistory((prev) => [historyEntry, ...prev.slice(0, 9)]);
      toast.success("Translation complete!", {
        description: `Translated from ${sourceLanguage} to ${targetLanguage}`,
      });
    } catch (error) {
      console.error("Translation failed:", error);
      toast.error("Translation failed", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!", { description: "Text copied to clipboard" });
  };

  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const loadSampleText = (sample: (typeof SAMPLE_TEXTS)[0]) => {
    setInputText(sample.text);
    setSourceLanguage(sample.lang);
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
              <Badge
                variant={
                  translatorStatus === "available" ? "default" : "secondary"
                }
              >
                Translator API: {translatorStatus || "checking..."}
              </Badge>
              <Badge
                variant={
                  detectorStatus === "available" ? "default" : "secondary"
                }
              >
                Detector API: {detectorStatus || "checking..."}
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
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            setSourceLanguage={setSourceLanguage}
            setTargetLanguage={setTargetLanguage}
            streamingMode={streamingMode}
            setStreamingMode={setStreamingMode}
            isDownloading={isDownloading}
            downloadProgress={downloadProgress}
            swapLanguages={swapLanguages}
          />
          <TranslationIO
            inputText={inputText}
            setInputText={setInputText}
            detectLanguage={detectLanguage}
            isDetecting={isDetecting}
            isTranslating={isTranslating}
            streamingMode={streamingMode}
            streamedText={streamedText}
            translatedText={translatedText}
            copyToClipboard={copyToClipboard}
            translateText={translateText}
            clearAll={() => {
              setInputText("");
              setTranslatedText("");
              setStreamedText("");
            }}
          />
          <SampleTexts onLoadSample={loadSampleText} />
        </TabsContent>

        <TabsContent value="detect" className="space-y-4">
          <DetectionPanel
            inputText={inputText}
            setInputText={setInputText}
            detectLanguage={detectLanguage}
            isDetecting={isDetecting}
            detectedLanguage={detectedLanguage}
            detectionConfidence={detectionConfidence}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <HistoryPanel translationHistory={translationHistory} />
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
