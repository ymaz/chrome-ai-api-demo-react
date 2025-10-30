import React from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TranslationSettings from "./parts/TranslationSettings";
import TranslationIO from "./parts/TranslationIO";
import SampleTexts from "./parts/SampleTexts";
import DetectionPanel from "./parts/DetectionPanel";
import HistoryPanel from "./parts/HistoryPanel";
import { useTranslator } from "./hooks/useTranslator";
import { SAMPLE_TEXTS } from "./constants";

export const TranslatorFeatureComponent: React.FC = () => {
  const {
    state,
    dispatch,
    translateText,
    handleDetectLanguage,
    copyToClipboard,
    hasTranslator,
    hasLanguageDetector,
  } = useTranslator();

  const isSupported = hasTranslator;

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
              <Zap className="h-5 w-5" />
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
              <CheckCircle className="h-5 w-5" />
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
