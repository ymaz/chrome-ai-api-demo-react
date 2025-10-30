import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Copy, Loader2 } from "lucide-react";

type Props = {
  inputText: string;
  setInputText: (v: string) => void;
  isSummarizing: boolean;
  streamingMode: boolean;
  streamedSummary: string;
  summary: string;
  copyToClipboard: (text: string) => void;
  summarizeText: () => void;
  clearAll: () => void;
  isDownloading: boolean;
  downloadProgress: number;
  modelDownloaded: boolean;
};

const SummarizationIO: React.FC<Props> = ({
  inputText,
  setInputText,
  isSummarizing,
  streamingMode,
  streamedSummary,
  summary,
  copyToClipboard,
  summarizeText,
  clearAll,
  isDownloading,
  downloadProgress,
  modelDownloaded,
}) => {
  const outputValue =
    streamingMode && isSummarizing ? streamedSummary : summary;
  return (
    <>
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
              value={outputValue}
              readOnly
              placeholder="Summary will appear here..."
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {outputValue.length} characters |{" "}
                {outputValue.split(/\s+/).filter(Boolean).length} words
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(outputValue)}
                disabled={!outputValue}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

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
          {/** Download indicator below the Summarize button */}
          {isDownloading && !modelDownloaded && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium">
                  Downloading summarization model...
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {downloadProgress.toFixed(0)}% complete
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default SummarizationIO;
