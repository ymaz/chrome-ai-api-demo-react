export interface TranslatorAvailability {
  available: string;
}

export interface TranslatorOptions {
  sourceLanguage: string;
  targetLanguage: string;
  monitor?: (monitor: TranslatorMonitor) => void;
}

export interface TranslatorAvailabilityOptions {
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslatorMonitor {
  addEventListener(
    type: "downloadprogress",
    listener: (event: DownloadProgressEvent) => void
  ): void;
}

export interface DownloadProgressEvent extends Event {
  loaded: number;
  total: number;
}

export interface Translator {
  translate(text: string): Promise<string>;
  translateStreaming(text: string): ReadableStream<string>;
  destroy(): void;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface LanguageDetector {
  detect(
    text: string
  ): Promise<Array<{ language: string; confidence: number }>>;
  ready: Promise<void>;
}

declare global {
  interface Window {
    Translator?: {
      availability(
        options: TranslatorAvailabilityOptions
      ): Promise<TranslatorAvailability>;
      create(options: TranslatorOptions): Promise<Translator>;
    };
    LanguageDetector?: {
      availability(): Promise<TranslatorAvailability>;
      create(): Promise<LanguageDetector>;
    };
  }
}
