export type SummaryType = "tl;dr" | "key-points" | "teaser" | "headline";

export interface SummarizerOptions {
  type?: SummaryType | "tldr";
  format?: "plain-text" | "markdown";
  length?: "short" | "medium" | "long";
  sharedContext?: string;
  monitor?: (monitor: SummarizerMonitor) => void;
}

export interface SummarizerMonitor {
  addEventListener(
    type: "downloadprogress",
    listener: (event: DownloadProgressEvent) => void
  ): void;
}

export interface DownloadProgressEvent extends Event {
  loaded: number;
  total: number;
}

export interface Summarizer {
  summarize(text: string, options?: { context?: string }): Promise<string>;
  summarizeStreaming(
    text: string,
    options?: { context?: string }
  ): ReadableStream<string>;
  destroy(): void;
}

export interface SummarizerAvailabilityLegacy {
  available: "readily" | "after-download" | "no";
}

export type SummarizerAvailabilityNew =
  | "readily"
  | "after-download"
  | "downloadable"
  | "unavailable"
  | "no";

declare global {
  interface Window {
    ai?: {
      summarizer?: {
        capabilities(): Promise<SummarizerAvailabilityLegacy>;
        create(options?: SummarizerOptions): Promise<Summarizer>;
      };
    };
  }
  interface SummarizerGlobal {
    availability: () => Promise<SummarizerAvailabilityNew>;
    create: (options?: SummarizerOptions) => Promise<Summarizer>;
  }
  // Ambient global on self
  var Summarizer: SummarizerGlobal | undefined;
}


