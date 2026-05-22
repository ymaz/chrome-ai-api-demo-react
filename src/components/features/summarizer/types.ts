export type SummaryType = "tl;dr" | "key-points" | "teaser" | "headline";

export type SummaryFormat = "plain-text" | "markdown";

export type SummaryLength = "short" | "medium" | "long";

export type Availability =
  | "unavailable"
  | "downloadable"
  | "downloading"
  | "available";

export interface CreateMonitor {
  addEventListener(
    type: "downloadprogress",
    listener: (event: DownloadProgressEvent) => void,
  ): void;
  removeEventListener(
    type: "downloadprogress",
    listener: (event: DownloadProgressEvent) => void,
  ): void;
}

export interface DownloadProgressEvent extends Event {
  loaded: number;
  total: number;
}

export interface SummarizerOptions {
  type?: SummaryType | "tldr";
  format?: SummaryFormat;
  length?: SummaryLength;
  sharedContext?: string;
  expectedInputLanguages?: string[];
  expectedContextLanguages?: string[];
  outputLanguage?: string;
  monitor?: (monitor: CreateMonitor) => void;
  signal?: AbortSignal;
}

export interface SummarizeCallOptions {
  context?: string;
  signal?: AbortSignal;
}

export interface Summarizer {
  summarize(text: string, options?: SummarizeCallOptions): Promise<string>;
  summarizeStreaming(
    text: string,
    options?: SummarizeCallOptions,
  ): ReadableStream<string>;
  measureInputUsage?(text: string): Promise<number>;
  inputQuota?: number;
  destroy(): void;
}

export interface SummarizerGlobal {
  availability: (options?: SummarizerOptions) => Promise<Availability>;
  create: (options?: SummarizerOptions) => Promise<Summarizer>;
}

declare global {
  var Summarizer: SummarizerGlobal | undefined;
}
