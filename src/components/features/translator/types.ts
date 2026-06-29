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
  // `loaded` is a normalized 0..1 download fraction.
  loaded: number;
  total?: number;
}

export interface TranslatorOptions {
  sourceLanguage: string;
  targetLanguage: string;
  monitor?: (monitor: CreateMonitor) => void;
  signal?: AbortSignal;
}

export interface TranslatorAvailabilityOptions {
  sourceLanguage: string;
  targetLanguage: string;
}

export interface Translator {
  translate(text: string, options?: { signal?: AbortSignal }): Promise<string>;
  translateStreaming(
    text: string,
    options?: { signal?: AbortSignal },
  ): ReadableStream<string>;
  destroy(): void;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface LanguageDetectorResult {
  detectedLanguage: string;
  confidence: number;
}

export interface LanguageDetectorCreateOptions {
  monitor?: (monitor: CreateMonitor) => void;
  signal?: AbortSignal;
  expectedInputLanguages?: string[];
}

export interface LanguageDetector {
  detect(
    text: string,
    options?: { signal?: AbortSignal },
  ): Promise<LanguageDetectorResult[]>;
  ready: Promise<void>;
  destroy(): void;
}

declare global {
  interface Window {
    Translator?: {
      availability(
        options: TranslatorAvailabilityOptions,
      ): Promise<Availability>;
      create(options: TranslatorOptions): Promise<Translator>;
    };
    LanguageDetector?: {
      availability(): Promise<Availability>;
      create(options?: LanguageDetectorCreateOptions): Promise<LanguageDetector>;
    };
  }
}
