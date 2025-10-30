import React from "react";
import { Toaster } from "@/components/ui/sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Brain, CheckCircle, Zap } from "lucide-react";
import SummarizationSettings from "./parts/SummarizationSettings";
import SummarizationIO from "./parts/SummarizationIO";
import SampleTexts from "./parts/SampleTexts";
import HistoryPanel from "./parts/HistoryPanel";
import { useSummarizer } from "./hooks/useSummarizer";

export const SummarizerFeatureComponent: React.FC = () => {
  const { state, dispatch, summarizeText, copyToClipboard, modelDownloaded } =
    useSummarizer();
  if (!state.isSupported) {
    return (
      <Card className="max-w-4xl mx-auto mt-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            Chrome Summarizer API Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Browser Not Supported</AlertTitle>
            <AlertDescription>
              The Chrome Summarizer API requires Chrome 127+ with the
              Summarization API enabled.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <h3 className="font-semibold">To enable the Summarizer API:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Open Chrome Dev or Chrome Canary (version 127+)</li>
              <li>
                Navigate to{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded">
                  chrome://flags
                </code>
              </li>
              <li>Search for "Summarization API for Gemini Nano"</li>
              <li>Enable the flag and restart Chrome</li>
              <li>
                Visit{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded">
                  chrome://components
                </code>
              </li>
              <li>
                Find "Optimization Guide On Device Model" and click "Check for
                update"
              </li>
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
              <Brain className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">
                  Chrome Summarizer API Demo
                </CardTitle>
                <CardDescription>
                  On-device text summarization powered by Chrome's built-in AI
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={
                state.isSupported &&
                ["readily", "after-download", "downloadable"].includes(
                  state.availability,
                )
                  ? "default"
                  : "secondary"
              }
            >
              Summarizer API: {state.availability || "checking..."}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="summarize" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summarize">Summarize</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="summarize" className="space-y-4">
          <SummarizationSettings
            summaryType={state.summaryType}
            setSummaryType={(v) =>
              dispatch({ type: "setSummaryType", payload: v })
            }
            summaryFormat={state.summaryFormat}
            setSummaryFormat={(v) =>
              dispatch({ type: "setSummaryFormat", payload: v })
            }
            summaryLength={state.summaryLength}
            setSummaryLength={(v) =>
              dispatch({ type: "setSummaryLength", payload: v })
            }
            streamingMode={state.streamingMode}
            setStreamingMode={(v) =>
              dispatch({ type: "setStreamingMode", payload: v })
            }
            sharedContext={state.sharedContext}
            setSharedContext={(v) =>
              dispatch({ type: "setSharedContext", payload: v })
            }
          />
          <SummarizationIO
            inputText={state.inputText}
            setInputText={(v) => dispatch({ type: "setInputText", payload: v })}
            isSummarizing={state.isSummarizing}
            streamingMode={state.streamingMode}
            streamedSummary={state.streamedSummary}
            summary={state.summary}
            copyToClipboard={copyToClipboard}
            summarizeText={summarizeText}
            clearAll={() => dispatch({ type: "clearAll" })}
            isDownloading={state.isDownloading}
            downloadProgress={state.downloadProgress}
            modelDownloaded={modelDownloaded}
          />
          <SampleTexts
            onLoadSample={(sample) =>
              dispatch({ type: "setInputText", payload: sample.text })
            }
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <HistoryPanel summaryHistory={state.summaryHistory} />
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              On-Device Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All summarization happens locally in your browser. No data is sent
              to external servers.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Multiple Summary Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate TL;DR, key points, teasers, or headlines based on your
              needs.
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

export default SummarizerFeatureComponent;
