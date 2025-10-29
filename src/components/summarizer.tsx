import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle,
  Download,
  Sparkles,
  Brain,
  Copy,
  RefreshCw,
  Zap,
  List,
  FileType,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

// Type definitions for Chrome Summarizer API
type SummaryType = "tl;dr" | "key-points" | "teaser" | "headline";
interface SummarizerAvailability {
  available: "readily" | "after-download" | "no";
}

interface SummarizerOptions {
  type?: SummaryType;
  format?: "plain-text" | "markdown";
  length?: "short" | "medium" | "long";
  sharedContext?: string;
  monitor?: (monitor: SummarizerMonitor) => void;
}

interface SummarizerMonitor {
  addEventListener(
    type: "downloadprogress",
    listener: (event: DownloadProgressEvent) => void
  ): void;
}

interface DownloadProgressEvent extends Event {
  loaded: number;
  total: number;
}

interface Summarizer {
  summarize(text: string, options?: { context?: string }): Promise<string>;
  summarizeStreaming(
    text: string,
    options?: { context?: string }
  ): ReadableStream<string>;
  destroy(): void;
}

declare global {
  interface Window {
    ai?: {
      summarizer?: {
        capabilities(): Promise<SummarizerAvailability>;
        create(options?: SummarizerOptions): Promise<Summarizer>;
      };
    };
  }
  // New built-in API surface per Chrome docs
  // https://developer.chrome.com/docs/ai/summarizer-api
  interface SummarizerGlobal {
    availability: () => Promise<
      "readily" | "after-download" | "downloadable" | "unavailable" | "no"
    >;
    create: (
      options?: SummarizerOptions & {
        expectedInputLanguages?: string[];
        outputLanguage?: string;
        expectedContextLanguages?: string[];
      }
    ) => Promise<Summarizer>;
  }
  // Ambient declaration of global `Summarizer`
  var Summarizer: SummarizerGlobal;
}

// Sample texts for testing
const SAMPLE_TEXTS = [
  {
    title: "Tech Article",
    text: `Artificial Intelligence has transformed the technology landscape in unprecedented ways. Machine learning algorithms now power everything from recommendation systems to autonomous vehicles. Deep learning, a subset of machine learning, has enabled breakthrough achievements in image recognition, natural language processing, and game playing. Companies worldwide are investing billions in AI research and development. However, concerns about AI ethics, bias, and job displacement continue to spark important debates. Experts emphasize the need for responsible AI development that considers societal impacts. As we move forward, the challenge lies in harnessing AI's potential while addressing its risks and ensuring equitable benefits across society.`,
  },
  {
    title: "News Story",
    text: `In a groundbreaking development, researchers at a leading university have discovered a new method for carbon capture that could revolutionize climate change mitigation efforts. The innovative technology uses specially designed materials that can absorb carbon dioxide from the atmosphere at unprecedented rates. Early tests show the system is 50% more efficient than existing methods and significantly less expensive to operate. The research team, funded by international climate organizations, plans to scale up the technology for commercial deployment within the next two years. Environmental scientists are calling this discovery a potential game-changer in the fight against global warming. Government officials from several countries have already expressed interest in implementing the technology at scale.`,
  },
  {
    title: "Blog Post",
    text: `Welcome to my journey of learning web development! After years of thinking about it, I finally took the plunge and started coding. The first few weeks were challenging - understanding HTML, CSS, and JavaScript fundamentals felt overwhelming. But persistence paid off. I built my first website, a simple portfolio page, and the feeling of accomplishment was incredible. Then came React, which opened up a whole new world of possibilities. Now I'm exploring backend development with Node.js. The tech community has been incredibly supportive. Online tutorials, coding bootcamps, and developer forums have been invaluable resources. To anyone considering learning to code: start today, be patient with yourself, and don't be afraid to ask for help. The journey is difficult but absolutely worth it.`,
  },
  {
    title: "Scientific Paper Abstract",
    text: `This study investigates the effects of intermittent fasting on metabolic health markers in adult participants over a 12-week period. Sixty volunteers were randomly assigned to either an intermittent fasting group (16:8 protocol) or a control group maintaining regular eating patterns. Blood samples were collected at baseline, week 6, and week 12 to measure glucose levels, insulin sensitivity, lipid profiles, and inflammatory markers. Results showed significant improvements in insulin sensitivity (p<0.01) and reduction in inflammatory markers (p<0.05) in the intermittent fasting group compared to controls. Body weight decreased by an average of 3.2kg in the fasting group versus 0.5kg in controls. No adverse effects were reported. These findings suggest intermittent fasting may be an effective intervention for improving metabolic health, though longer-term studies are needed to confirm sustained benefits.`,
  },
];

const SummarizerAPIDemo: React.FC = () => {
  // State management
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [summarizerStatus, setSummarizerStatus] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [streamedSummary, setStreamedSummary] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [streamingMode, setStreamingMode] = useState<boolean>(false);
  const [summaryType, setSummaryType] = useState<SummaryType>("tl;dr");
  const [summaryFormat, setSummaryFormat] = useState<"plain-text" | "markdown">(
    "plain-text"
  );
  const [summaryLength, setSummaryLength] = useState<
    "short" | "medium" | "long"
  >("medium");
  const [sharedContext, setSharedContext] = useState<string>("");
  const [summaryHistory, setSummaryHistory] = useState<
    Array<{
      type: string;
      original: string;
      summary: string;
      timestamp: Date;
    }>
  >([]);

  const summarizerRef = useRef<Summarizer | null>(null);

  // Check API support on mount
  useEffect(() => {
    checkAPISupport();
    return () => {
      // Cleanup
      if (summarizerRef.current) {
        summarizerRef.current.destroy();
      }
    };
  }, []);

  // Check if API is supported
  const checkAPISupport = async () => {
    // Prefer the new built-in API surface when present
    if ("Summarizer" in self) {
      setIsSupported(true);
      try {
        // New API returns a string status
        const availability = await (
          self as unknown as { Summarizer: typeof Summarizer }
        ).Summarizer.availability();
        setSummarizerStatus(availability);
      } catch (error) {
        console.error("Failed to check summarizer availability:", error);
        setSummarizerStatus("error");
      }
      return;
    }

    // Fallback to legacy experimental surface if available
    if (window.ai?.summarizer) {
      setIsSupported(true);
      try {
        const availability = await window.ai.summarizer.capabilities();
        setSummarizerStatus(availability.available);
      } catch (error) {
        console.error("Failed to check summarizer availability:", error);
        setSummarizerStatus("error");
      }
      return;
    }

    setIsSupported(false);
  };

  // Create summarizer with progress monitoring
  const createSummarizer = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      let downloadCompleted = false;

      // Normalize type for new API where it expects 'tldr' instead of 'tl;dr'
      const normalizedType = (
        summaryType === "tl;dr" ? "tldr" : summaryType
      ) as "tldr" | "key-points" | "teaser" | "headline";

      const commonOptions = {
        type: normalizedType as unknown as SummaryType,
        format: summaryFormat,
        length: summaryLength,
        sharedContext: sharedContext || undefined,
        monitor(monitor: SummarizerMonitor) {
          monitor.addEventListener(
            "downloadprogress",
            (event: DownloadProgressEvent) => {
              const progress =
                event.total > 0 ? (event.loaded / event.total) * 100 : 100;
              setDownloadProgress(progress);
              if (progress >= 100) {
                downloadCompleted = true;
                setIsDownloading(false);
                toast.success("Summarizer ready!", {
                  description: "Model downloaded successfully.",
                });
              }
            }
          );
        },
      } as SummarizerOptions & { monitor: (m: SummarizerMonitor) => void };

      let summarizer: Summarizer | null = null;

      if ("Summarizer" in self) {
        summarizer = await (
          self as unknown as { Summarizer: SummarizerGlobal }
        ).Summarizer.create(commonOptions as SummarizerOptions);
      } else if (window.ai?.summarizer) {
        summarizer = await window.ai.summarizer.create(commonOptions);
      } else {
        setIsDownloading(false);
        return null;
      }

      // In some cases (availability 'readily') there may be no download events.
      if (!downloadCompleted) {
        setIsDownloading(false);
      }
      return summarizer;
    } catch (error) {
      setIsDownloading(false);
      console.error("Failed to create summarizer:", error);
      toast.error("Error creating summarizer", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
      return null;
    }
  };

  // Summarize text
  const summarizeText = async () => {
    if (!inputText.trim()) {
      toast.error("No text to summarize", {
        description: "Please enter some text to summarize",
      });
      return;
    }

    setIsSummarizing(true);
    setSummary("");
    setStreamedSummary("");

    try {
      // Create summarizer
      if (summarizerRef.current) {
        summarizerRef.current.destroy();
      }
      summarizerRef.current = await createSummarizer();

      if (!summarizerRef.current) {
        throw new Error("Failed to create summarizer");
      }

      const context = sharedContext ? { context: sharedContext } : undefined;

      let finalSummary = "";
      if (streamingMode) {
        // Streaming summarization
        const stream = summarizerRef.current.summarizeStreaming(
          inputText,
          context
        );
        const reader = stream.getReader();
        let fullSummary = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          fullSummary += value;
          setStreamedSummary(fullSummary);
        }

        finalSummary = fullSummary;
        setSummary(fullSummary);
      } else {
        // Regular summarization
        const result = await summarizerRef.current.summarize(
          inputText,
          context
        );
        finalSummary = result;
        setSummary(result);
      }

      // Add to history
      const historyEntry = {
        type: summaryType,
        original: inputText,
        summary: finalSummary,
        timestamp: new Date(),
      };
      setSummaryHistory((prev) => [historyEntry, ...prev.slice(0, 9)]);

      toast.success("Summary generated!", {
        description: `Created a ${summaryType} summary`,
      });
    } catch (error) {
      console.error("Summarization failed:", error);
      toast.error("Summarization failed", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!", {
      description: "Text copied to clipboard",
    });
  };

  // Load sample text
  const loadSampleText = (sample: (typeof SAMPLE_TEXTS)[0]) => {
    setInputText(sample.text);
  };

  // Clear all
  const clearAll = () => {
    setInputText("");
    setSummary("");
    setStreamedSummary("");
    setSharedContext("");
  };

  // Main render
  if (!isSupported) {
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

      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-500" />
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
              variant={summarizerStatus === "readily" ? "default" : "secondary"}
            >
              Status: {summarizerStatus || "checking..."}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="summarize" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summarize">
            <FileText className="h-4 w-4 mr-2" />
            Summarize
          </TabsTrigger>
          <TabsTrigger value="history">
            <RefreshCw className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Summarization Tab */}
        <TabsContent value="summarize" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Summarization Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary Type and Format */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="summary-type">Summary Type</Label>
                  <Select
                    value={summaryType}
                    onValueChange={(value: SummaryType) =>
                      setSummaryType(value)
                    }
                  >
                    <SelectTrigger id="summary-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tl;dr">
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>TL;DR</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="key-points">
                        <span className="flex items-center gap-2">
                          <List className="h-4 w-4" />
                          <span>Key Points</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="teaser">
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          <span>Teaser</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="headline">
                        <span className="flex items-center gap-2">
                          <FileType className="h-4 w-4" />
                          <span>Headline</span>
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary-format">Output Format</Label>
                  <Select
                    value={summaryFormat}
                    onValueChange={(value: "plain-text" | "markdown") =>
                      setSummaryFormat(value)
                    }
                  >
                    <SelectTrigger id="summary-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plain-text">Plain Text</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary-length">Summary Length</Label>
                  <Select
                    value={summaryLength}
                    onValueChange={(value: "short" | "medium" | "long") =>
                      setSummaryLength(value)
                    }
                  >
                    <SelectTrigger id="summary-length">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Streaming Mode */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="streaming-mode">Streaming Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    See summary appear in real-time as it's generated
                  </p>
                </div>
                <Switch
                  id="streaming-mode"
                  checked={streamingMode}
                  onCheckedChange={setStreamingMode}
                />
              </div>

              {/* Shared Context */}
              <div className="space-y-2">
                <Label htmlFor="shared-context">
                  Shared Context (Optional)
                </Label>
                <Textarea
                  id="shared-context"
                  value={sharedContext}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setSharedContext(e.target.value)
                  }
                  placeholder="Add context to guide the summarization (e.g., 'Focus on technical details' or 'Emphasize business impact')"
                  className="min-h-[60px]"
                />
              </div>

              {/* Download Progress */}
              {isDownloading && (
                <Alert>
                  <Download className="h-4 w-4" />
                  <AlertTitle>Downloading Model</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>Downloading summarization model...</p>
                    <Progress value={downloadProgress} className="mt-2" />
                    <p className="text-sm">
                      {downloadProgress.toFixed(0)}% complete
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Input/Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Input Text</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={inputText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setInputText(e.target.value)
                  }
                  placeholder="Enter text to summarize..."
                  className="min-h-[300px] font-mono text-sm"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {inputText.length} characters |{" "}
                    {inputText.split(/\s+/).filter(Boolean).length} words
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(inputText)}
                    disabled={!inputText}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={
                    streamingMode && isSummarizing ? streamedSummary : summary
                  }
                  readOnly
                  placeholder="Summary will appear here..."
                  className="min-h-[300px] font-mono text-sm"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {
                      (streamingMode && isSummarizing
                        ? streamedSummary
                        : summary
                      ).length
                    }{" "}
                    characters |{" "}
                    {
                      (streamingMode && isSummarizing
                        ? streamedSummary
                        : summary
                      )
                        .split(/\s+/)
                        .filter(Boolean).length
                    }{" "}
                    words
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        streamingMode && isSummarizing
                          ? streamedSummary
                          : summary
                      )
                    }
                    disabled={
                      !(streamingMode && isSummarizing
                        ? streamedSummary
                        : summary)
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={summarizeText}
                  disabled={isSummarizing || !inputText.trim()}
                  className="flex-1"
                >
                  {isSummarizing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Summarizing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Summarize
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sample Texts */}
          <Card>
            <CardHeader>
              <CardTitle>Sample Texts</CardTitle>
              <CardDescription>
                Click to load sample text for testing different summary types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SAMPLE_TEXTS.map((sample, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start text-left h-auto p-4"
                    onClick={() => loadSampleText(sample)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">{sample.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {sample.text.substring(0, 100)}...
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Summary History</CardTitle>
              <CardDescription>Recent summaries (last 10)</CardDescription>
            </CardHeader>
            <CardContent>
              {summaryHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No summaries yet. Start summarizing to see history.
                </p>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {summaryHistory.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <Badge variant="outline">{item.type}</Badge>
                          <span className="text-muted-foreground">
                            {item.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-xs font-semibold mb-1">
                              Original:
                            </p>
                            <p className="text-sm line-clamp-3">
                              {item.original}
                            </p>
                          </div>
                          <div className="p-3 bg-purple-50 rounded">
                            <p className="text-xs font-semibold mb-1">
                              Summary:
                            </p>
                            <p className="text-sm">{item.summary}</p>
                          </div>
                        </div>
                        {index < summaryHistory.length - 1 && (
                          <Separator className="my-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
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
              <Zap className="h-5 w-5 text-yellow-500" />
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

export default SummarizerAPIDemo;
