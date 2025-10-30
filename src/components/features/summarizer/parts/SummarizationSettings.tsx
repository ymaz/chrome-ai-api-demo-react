import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FileText, List, Sparkles, FileType } from "lucide-react";
import type { SummaryType } from "../types";
import { SUMMARY_TYPES } from "../constants";

type Props = {
  summaryType: SummaryType;
  setSummaryType: (v: SummaryType) => void;
  summaryFormat: "plain-text" | "markdown";
  setSummaryFormat: (v: "plain-text" | "markdown") => void;
  summaryLength: "short" | "medium" | "long";
  setSummaryLength: (v: "short" | "medium" | "long") => void;
  streamingMode: boolean;
  setStreamingMode: (v: boolean) => void;
  sharedContext: string;
  setSharedContext: (v: string) => void;
};

const SummarizationSettings: React.FC<Props> = ({
  summaryType,
  setSummaryType,
  summaryFormat,
  setSummaryFormat,
  summaryLength,
  setSummaryLength,
  streamingMode,
  setStreamingMode,
  sharedContext,
  setSharedContext,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Summarization Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="summary-type">Summary Type</Label>
            <Select
              value={summaryType}
              onValueChange={(v) => setSummaryType(v as SummaryType)}
            >
              <SelectTrigger id="summary-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUMMARY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <span className="flex items-center gap-2">
                      {t.value === "tl;dr" && <FileText className="h-4 w-4" />}
                      {t.value === "key-points" && <List className="h-4 w-4" />}
                      {t.value === "teaser" && <Sparkles className="h-4 w-4" />}
                      {t.value === "headline" && (
                        <FileType className="h-4 w-4" />
                      )}
                      <span>{t.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary-format">Output Format</Label>
            <Select
              value={summaryFormat}
              onValueChange={(v) =>
                setSummaryFormat(v as "plain-text" | "markdown")
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
              onValueChange={(v) =>
                setSummaryLength(v as "short" | "medium" | "long")
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

        <div className="space-y-2">
          <Label htmlFor="shared-context">Shared Context (Optional)</Label>
          <textarea
            id="shared-context"
            value={sharedContext}
            onChange={(e) => setSharedContext(e.target.value)}
            placeholder="Add context to guide the summarization (e.g., 'Focus on technical details' or 'Emphasize business impact')"
            className="min-h-[60px] w-full border rounded-md p-2 text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SummarizationSettings;
